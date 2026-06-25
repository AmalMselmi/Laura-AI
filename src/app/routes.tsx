import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { ScrollToTopOnNavigate } from './components/ScrollToTopOnNavigate';

// Layouts
import { PatientLayout } from './layouts/PatientLayout';
import { RadiologistLayout } from './layouts/RadiologistLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public pages
import { LandingPage } from './components/LandingPage';
import { AboutPage } from './components/AboutPage';
import { PricingPage } from './components/PricingPage';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';

// Patient pages
import { PatientHome } from './pages/patient/PatientHome';
import { PatientCarnetPage } from './pages/patient/PatientCarnetPage';
import { PatientAccountPage } from './pages/patient/PatientAccountPage';
import { DocumentViewer } from './pages/patient/DocumentViewer';
import { FolderView } from './pages/patient/FolderView';
import { ScanDocument } from './components/patient/ScanDocument';
import { PatientDocuments } from './components/patient/PatientDocuments';

// Radiologist pages
import { RadiologistHome } from './pages/radiologist/RadiologistHome';
import { RadiologistAccountPage } from './pages/radiologist/RadiologistAccountPage';
import { DicomFolderManager } from './components/radiologist/DicomFolderManager';

// Admin pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminStorage } from './pages/admin/AdminStorage';
import { AdminGdpr } from './pages/admin/AdminGdpr';
import { AdminLogin } from './pages/admin/AdminLogin';

// 404
import { NotFound } from './pages/NotFound';

// Shared page (public — no auth)
import { SharedDocumentPage } from './pages/SharedDocumentPage';

// API Documentation
import { ApiDocumentation } from './pages/ApiDocumentation';

import { ContactPage } from './pages/ContactPage';

// Route wrappers for public pages (inject navigate-based callbacks)
import { useNavigate } from 'react-router';
import { useAuth, getDashboardPath } from './context/AuthContext';

function RootLayout() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Outlet />
    </>
  );
}

function LandingRoute() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onLogin={() => navigate('/login')}
      onGetStarted={() => navigate('/signup')}
      onAbout={() => navigate('/about')}
      onPricing={() => navigate('/pricing')}
      onContact={() => navigate('/contact')}
    />
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <Login
      onLogin={async (email, password, role) => {
        await login(email, password, role);
        navigate(getDashboardPath(role));
      }}
      onSignUp={() => navigate('/signup')}
      onBackToHome={() => navigate('/')}
    />
  );
}

function SignUpRoute() {
  const navigate = useNavigate();
  const { register } = useAuth();
  return (
    <SignUp
      onSignUp={async (payload) => {
        await register(payload);
        navigate(getDashboardPath(payload.role));
      }}
      onBackToLogin={() => navigate('/login')}
      onBackToHome={() => navigate('/')}
    />
  );
}

function AboutRoute() {
  const navigate = useNavigate();
  return <AboutPage onBack={() => navigate('/')} />;
}

function PricingRoute() {
  const navigate = useNavigate();
  return (
    <PricingPage
      onBack={() => navigate('/')}
      onGetStarted={() => navigate('/signup')}
      onContact={() => navigate('/contact')}
    />
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  // ── Public routes ──────────────────────────────────────────
  {
    path: '/',
    Component: LandingRoute,
  },
  {
    path: '/login',
    Component: LoginRoute,
  },
  {
    path: '/signup',
    Component: SignUpRoute,
  },
  {
    path: '/about',
    Component: AboutRoute,
  },
  {
    path: '/pricing',
    Component: PricingRoute,
  },
  {
    path: '/contact',
    Component: ContactPage,
  },
  {
    path: '/admin-login',
    Component: AdminLogin,
  },
  {
    path: '/admin/login',
    element: <Navigate to="/admin-login" replace />,
  },

  // ── Shared document (public — médecin sans compte) ─────────
  {
    path: '/shared/:token',
    Component: SharedDocumentPage,
  },

  // ── Patient routes (protected) ─────────────────────────────
  {
    path: '/patient',
    Component: PatientLayout,
    children: [
      { index: true, element: <Navigate to="/patient/home" replace /> },
      { path: 'home', Component: PatientHome },
      { path: 'carnet', Component: PatientCarnetPage },
      { path: 'scan', Component: ScanDocument },
      { path: 'documents', Component: PatientDocuments },
      { path: 'documents/folder/:folderId', Component: FolderView },
      { path: 'documents/:id', Component: DocumentViewer },
      { path: 'account', Component: PatientAccountPage },
    ],
  },

  // ── Radiologist routes (protected) ─────────────────────────
  {
    path: '/radiologist/dicom',
    element: <Navigate to="/radiologist/folders" replace />,
  },
  {
    path: '/radiologist',
    Component: RadiologistLayout,
    children: [
      { index: true, element: <Navigate to="/radiologist/home" replace /> },
      { path: 'home', Component: RadiologistHome },
      { path: 'folders', Component: DicomFolderManager },
      { path: 'account', Component: RadiologistAccountPage },
    ],
  },

  // ── Admin routes (protected) ────────────────────────────────
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, element: <Navigate to="/admin/overview" replace /> },
      { path: 'overview', Component: AdminOverview },
      { path: 'users', Component: AdminUsers },
      { path: 'plans', Component: AdminPlans },
      { path: 'storage', Component: AdminStorage },
      { path: 'gdpr', Component: AdminGdpr },
    ],
  },

  // ── 404 ────────────────────────────────────────────────────────────────
  {
    path: '/api-docs',
    Component: ApiDocumentation,
  },
  {
    path: '*',
    Component: NotFound,
  },
    ],
  },
]);