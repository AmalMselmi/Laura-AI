import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth, getDashboardPath } from '../AuthContext';

const login = vi.fn();
const adminLogin = vi.fn();
const register = vi.fn();
const refresh = vi.fn();
const logout = vi.fn();

vi.mock('../../lib/api/auth', () => ({
  login: (...a: unknown[]) => login(...a),
  adminLogin: (...a: unknown[]) => adminLogin(...a),
  register: (...a: unknown[]) => register(...a),
  refresh: (...a: unknown[]) => refresh(...a),
  logout: (...a: unknown[]) => logout(...a),
}));

const setAccessToken = vi.fn();
const registerRefreshHandler = vi.fn();

vi.mock('../../lib/api/client', () => ({
  setAccessToken: (...a: unknown[]) => setAccessToken(...a),
  registerRefreshHandler: (...a: unknown[]) => registerRefreshHandler(...a),
}));

function Probe() {
  const { user, token, login: doLogin, adminLogin: doAdmin, logout: doOut } = useAuth();
  return (
    <div>
      <span data-testid="role">{user?.role ?? 'none'}</span>
      <span data-testid="token">{token ?? ''}</span>
      <button type="button" onClick={() => void doLogin('a@b.c', 'pw', 'patient')}>
        login-patient
      </button>
      <button type="button" onClick={() => void doAdmin('admin@x.fr', 'secret')}>
        login-admin
      </button>
      <button type="button" onClick={() => void doOut()}>
        logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refresh.mockRejectedValue(new Error('no session'));
  });

  it('registers refresh handler and applies login response', async () => {
    login.mockResolvedValue({
      access_token: 'tok-1',
      user: { id: '1', name: 'A', email: 'a@b.c', role: 'patient', plan: 'starter' },
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(registerRefreshHandler).toHaveBeenCalled());
    await userEvent.click(screen.getByText('login-patient'));
    await waitFor(() => expect(screen.getByTestId('role').textContent).toBe('patient'));
    expect(screen.getByTestId('token').textContent).toBe('tok-1');
    expect(setAccessToken).toHaveBeenCalledWith('tok-1');
  });

  it('adminLogin uses admin endpoint path via mock', async () => {
    adminLogin.mockResolvedValue({
      access_token: 'adm',
      user: { id: '0', name: 'Root', email: 'admin@x.fr', role: 'admin', plan: 'enterprise' },
    });
    refresh.mockRejectedValue(new Error('no session'));
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await userEvent.click(screen.getByText('login-admin'));
    await waitFor(() => expect(screen.getByTestId('role').textContent).toBe('admin'));
    expect(adminLogin).toHaveBeenCalledWith({ email: 'admin@x.fr', password: 'secret' });
  });

  it('getDashboardPath maps roles', () => {
    expect(getDashboardPath('patient')).toBe('/patient/home');
    expect(getDashboardPath('radiologist')).toBe('/radiologist/home');
    expect(getDashboardPath('admin')).toBe('/admin/overview');
  });
});
