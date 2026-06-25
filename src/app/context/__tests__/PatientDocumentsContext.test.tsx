import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { PatientDocumentsProvider, usePatientDocuments } from '../PatientDocumentsContext';

vi.mock('../../lib/api/auth', () => ({
  login: vi.fn(),
  adminLogin: vi.fn(),
  register: vi.fn(),
  /** Resolved session so AuthProvider restores patient without racing `login` + failed `refresh`. */
  refresh: vi.fn().mockResolvedValue({
    access_token: 'pt',
    token_type: 'bearer',
    user: { id: '1', name: 'Pat', email: 'p@p.p', role: 'patient', plan: 'starter' },
  }),
  logout: vi.fn(),
}));

vi.mock('../../lib/api/client', () => ({
  setAccessToken: vi.fn(),
  registerRefreshHandler: vi.fn(),
}));

const listPatientDocuments = vi.fn();
const listPatientFolders = vi.fn();
const sharePatientFolder = vi.fn();

vi.mock('../../lib/api/patient', () => ({
  listPatientDocuments: (...a: unknown[]) => listPatientDocuments(...a),
  listPatientFolders: (...a: unknown[]) => listPatientFolders(...a),
  createPatientDocument: vi.fn(),
  deletePatientDocument: vi.fn(),
  createPatientFolder: vi.fn(),
  deletePatientFolder: vi.fn(),
  setFolderDocuments: vi.fn(),
  sharePatientDocument: vi.fn(),
  sharePatientFolder: (...a: unknown[]) => sharePatientFolder(...a),
}));

function DocProbe() {
  const { folders, shareFolder } = usePatientDocuments();
  return (
    <div>
      <span data-testid="folder-count">{folders.length}</span>
      <span data-testid="first-token">{folders[0]?.shareToken ?? ''}</span>
      <button type="button" onClick={() => void shareFolder('f1')}>
        share
      </button>
    </div>
  );
}

describe('PatientDocumentsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPatientDocuments.mockResolvedValue([]);
    listPatientFolders.mockResolvedValue([
      {
        id: 'f1',
        name: 'Dossier A',
        description: null,
        documentIds: [],
        shareToken: null,
        sharedAt: null,
        createdAt: '2026-01-01T00:00:00',
      },
    ]);
    sharePatientFolder.mockResolvedValue({ token: 'tok-share', expiresAt: '2026-12-31', urlPath: '/shared/tok-share' });
  });

  it('loads folders when patient session exists', async () => {
    render(
      <AuthProvider>
        <PatientDocumentsProvider>
          <DocProbe />
        </PatientDocumentsProvider>
      </AuthProvider>
    );

    await waitFor(() => expect(listPatientFolders).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('folder-count').textContent).toBe('1'));
  });

  it('shareFolder updates local folder token', async () => {
    render(
      <AuthProvider>
        <PatientDocumentsProvider>
          <DocProbe />
        </PatientDocumentsProvider>
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('folder-count').textContent).toBe('1'));
    await userEvent.click(screen.getByText('share'));
    await waitFor(() => expect(screen.getByTestId('first-token').textContent).toBe('tok-share'));
    expect(sharePatientFolder).toHaveBeenCalledWith('f1');
  });
});
