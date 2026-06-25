import { RouterProvider } from 'react-router';
import { AppToaster } from './components/AppToaster';
import { AuthProvider } from './context/AuthContext';
import { PlansProvider } from './context/PlansContext';
import { SharedLinksProvider } from './context/SharedLinksContext';
import { LabProvider } from './context/LabContext';
import { PacsProvider } from './context/PacsContext';
import { PatientDocumentsProvider } from './context/PatientDocumentsContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <PlansProvider>
        <SharedLinksProvider>
          <PatientDocumentsProvider>
            <LabProvider>
              <PacsProvider>
                <RouterProvider router={router} />
                <AppToaster />
              </PacsProvider>
            </LabProvider>
          </PatientDocumentsProvider>
        </SharedLinksProvider>
      </PlansProvider>
    </AuthProvider>
  );
}