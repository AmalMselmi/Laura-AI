import { createContext, useContext, useState, ReactNode } from 'react';
import { MedicalDocument } from './PatientDocumentsContext';
import { LabInfo, RadiologistProfile } from './LabContext';

export interface SharedFolder {
  id: string;
  name: string;
  description?: string;
  documents: MedicalDocument[];
}

export interface SharedReport {
  patientName: string;
  patientId: string;
  pathology: string;
  modality: string;
  content: string;
  finalizedAt: string;
  radiologistName: string;
  radiologistTitle: string;
  radiologistSpecialty: string;
  lab: LabInfo;
}

export interface SharedLink {
  token: string;
  type: 'folder' | 'document' | 'report';
  label: string;
  createdAt: string;
  expiresAt: string;
  folder?: SharedFolder;
  document?: MedicalDocument;
  report?: SharedReport;
}

interface SharedLinksContextType {
  links: Record<string, SharedLink>;
  addSharedLink: (link: SharedLink) => void;
  getLink: (token: string) => SharedLink | undefined;
}

const SharedLinksContext = createContext<SharedLinksContextType | null>(null);

export function SharedLinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<Record<string, SharedLink>>({});

  const addSharedLink = (link: SharedLink) =>
    setLinks(prev => ({ ...prev, [link.token]: link }));

  const getLink = (token: string): SharedLink | undefined => links[token];

  return (
    <SharedLinksContext.Provider value={{ links, addSharedLink, getLink }}>
      {children}
    </SharedLinksContext.Provider>
  );
}

export function useSharedLinks() {
  const ctx = useContext(SharedLinksContext);
  if (!ctx) throw new Error('useSharedLinks must be used within SharedLinksProvider');
  return ctx;
}
