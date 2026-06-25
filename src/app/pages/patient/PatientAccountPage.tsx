import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import { AccountManagement } from '../../components/account/AccountManagement';

export function PatientAccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return <AccountManagement user={user} onLogout={handleLogout} />;
}
