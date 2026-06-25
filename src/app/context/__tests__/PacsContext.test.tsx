import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { PacsProvider, usePacs } from '../PacsContext';

vi.mock('../../lib/api/auth', () => ({
  login: vi.fn(),
  adminLogin: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn().mockResolvedValue({
    access_token: 'rt',
    token_type: 'bearer',
    user: { id: '2', name: 'Rad', email: 'r@r.r', role: 'radiologist', plan: 'radpro' },
  }),
  logout: vi.fn(),
}));

vi.mock('../../lib/api/client', () => ({
  setAccessToken: vi.fn(),
  registerRefreshHandler: vi.fn(),
}));

const listPacsServers = vi.fn();

vi.mock('../../lib/api/pacs', () => ({
  listPacsServers: (...a: unknown[]) => listPacsServers(...a),
  createPacsServer: vi.fn(),
  updatePacsServer: vi.fn(),
  deletePacsServer: vi.fn(),
}));

function PacsProbe() {
  const { servers, setConnectionStatus } = usePacs();
  return (
    <div>
      <span data-testid="st">{servers[0]?.connectionStatus ?? 'none'}</span>
      <button type="button" onClick={() => setConnectionStatus('srv-1', 'connected')}>
        set-connected
      </button>
    </div>
  );
}

describe('PacsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPacsServers.mockResolvedValue([
      {
        id: 'srv-1',
        name: 'PACS A',
        host: '127.0.0.1',
        port: 104,
        aeTitle: 'ORTHANC',
        callingAeTitle: 'LAURA',
        protocol: 'DICOM',
        webUrl: '',
        tls: false,
        active: true,
        connectionStatus: 'unknown',
        createdAt: '2026-01-01T00:00:00',
      },
    ]);
  });

  it('setConnectionStatus updates server row optimistically', async () => {
    render(
      <AuthProvider>
        <PacsProvider>
          <PacsProbe />
        </PacsProvider>
      </AuthProvider>
    );

    await waitFor(() => expect(listPacsServers).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('st').textContent).toBe('unknown'));
    await userEvent.click(screen.getByText('set-connected'));
    expect(screen.getByTestId('st').textContent).toBe('connected');
  });
});
