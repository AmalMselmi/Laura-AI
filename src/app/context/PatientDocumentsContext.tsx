import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import * as patientApi from '../lib/api/patient';
import { useAuth } from './AuthContext';
import type { DocumentFolderApi, MedicalDocumentApi } from '../types/api';

export type DocumentType = 'ordonnance' | 'analyse' | 'imagerie' | 'rapport' | 'certificat' | 'autre';

export interface MedicalDocument {
  id: string;
  name: string;
  type: DocumentType;
  date: string;
  size: string;
  doctor?: string;
  pathology?: string;
  notes?: string;
  aiAnalyzed?: boolean;
  fromScan?: boolean;
  folderId?: string;
  shareToken?: string;
  fileUrl?: string;
  imageDataUrl?: string;
  reportContent?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  documentIds: string[];
  shareToken?: string;
  sharedAt?: string;
}

function mapDocApi(d: MedicalDocumentApi): MedicalDocument {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    date: typeof d.date === 'string' ? d.date.slice(0, 10) : String(d.date).slice(0, 10),
    size: d.size ?? '—',
    doctor: d.doctor ?? undefined,
    pathology: d.pathology ?? undefined,
    notes: d.notes ?? undefined,
    aiAnalyzed: d.aiAnalyzed,
    fromScan: d.fromScan,
    folderId: d.folderId ?? undefined,
    shareToken: d.shareToken ?? undefined,
    fileUrl: d.fileUrl ?? undefined,
    imageDataUrl: d.imageDataUrl ?? undefined,
    reportContent: d.reportContent ?? undefined,
  };
}

function mapFolderApi(f: DocumentFolderApi): DocumentFolder {
  return {
    id: f.id,
    name: f.name,
    description: f.description ?? undefined,
    createdAt: typeof f.createdAt === 'string' ? f.createdAt.slice(0, 10) : String(f.createdAt).slice(0, 10),
    documentIds: f.documentIds ?? [],
    shareToken: f.shareToken ?? undefined,
    sharedAt: f.sharedAt ?? undefined,
  };
}

interface ListDocumentsParams {
  search?: string;
  type?: DocumentType | 'all';
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PatientDocumentsContextType {
  documents: MedicalDocument[];
  folders: DocumentFolder[];
  loading: boolean;
  error: string | null;
  refresh: (params?: ListDocumentsParams) => Promise<void>;
  addDocument: (doc: Omit<MedicalDocument, 'id'>) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
  createFolder: (folder: Pick<DocumentFolder, 'name' | 'description'>) => Promise<string>;
  deleteFolder: (id: string) => Promise<void>;
  addDocumentsToFolder: (folderId: string, docIds: string[]) => Promise<void>;
  removeDocumentFromFolder: (folderId: string, docId: string) => Promise<void>;
  shareDocument: (docId: string) => Promise<{ token: string; expiresAt: string; urlPath: string }>;
  shareFolder: (folderId: string) => Promise<{ token: string; expiresAt: string; urlPath: string }>;
}

const PatientDocumentsContext = createContext<PatientDocumentsContextType | null>(null);

export function PatientDocumentsProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPatient = user?.role === 'patient' && Boolean(token);

  const refresh = useCallback(
    async (params?: ListDocumentsParams) => {
      if (!isPatient) {
        setDocuments([]);
        setFolders([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [docs, fds] = await Promise.all([
          patientApi.listPatientDocuments({
            search: params?.search,
            type: params?.type && params.type !== 'all' ? params.type : undefined,
            sort: params?.sort,
            order: params?.order,
          }),
          patientApi.listPatientFolders(),
        ]);
        setDocuments(docs.map(mapDocApi));
        setFolders(fds.map(mapFolderApi));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Impossible de charger les documents');
      } finally {
        setLoading(false);
      }
    },
    [isPatient]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addDocument = async (doc: Omit<MedicalDocument, 'id'>): Promise<string> => {
    if (!isPatient) throw new Error('Not authenticated as patient');
    const created = await patientApi.createPatientDocument({
      name: doc.name,
      type: doc.type,
      date: doc.date,
      size: doc.size,
      doctor: doc.doctor,
      pathology: doc.pathology,
      notes: doc.notes,
      aiAnalyzed: doc.aiAnalyzed,
      fromScan: doc.fromScan,
      folderId: doc.folderId,
      fileUrl: doc.fileUrl,
      imageDataUrl: doc.imageDataUrl,
      reportContent: doc.reportContent,
    });
    const mapped = mapDocApi(created);
    setDocuments(prev => [mapped, ...prev.filter(d => d.id !== mapped.id)]);
    if (mapped.folderId) {
      setFolders(prev =>
        prev.map(f =>
          f.id === mapped.folderId
            ? { ...f, documentIds: [...new Set([...f.documentIds, mapped.id])] }
            : f
        )
      );
    }
    return mapped.id;
  };

  const deleteDocument = async (id: string) => {
    if (!isPatient) return;
    await patientApi.deletePatientDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    setFolders(prev =>
      prev.map(f => ({ ...f, documentIds: f.documentIds.filter(did => did !== id) }))
    );
  };

  const createFolder = async (folder: Pick<DocumentFolder, 'name' | 'description'>): Promise<string> => {
    if (!isPatient) throw new Error('Not authenticated as patient');
    const created = await patientApi.createPatientFolder({
      name: folder.name,
      description: folder.description,
    });
    const mapped = mapFolderApi(created);
    setFolders(prev => [mapped, ...prev]);
    return mapped.id;
  };

  const deleteFolder = async (id: string) => {
    if (!isPatient) return;
    await patientApi.deletePatientFolder(id);
    setFolders(prev => prev.filter(f => f.id !== id));
    setDocuments(prev => prev.map(d => (d.folderId === id ? { ...d, folderId: undefined } : d)));
  };

  const addDocumentsToFolder = async (folderId: string, docIds: string[]) => {
    if (!isPatient) return;
    const folder = folders.find(f => f.id === folderId);
    const merged = [...new Set([...(folder?.documentIds ?? []), ...docIds])];
    const updated = await patientApi.setFolderDocuments(folderId, merged);
    const mapped = mapFolderApi(updated);
    setFolders(prev => prev.map(f => (f.id === folderId ? mapped : f)));
    setDocuments(prev =>
      prev.map(d => (merged.includes(d.id) ? { ...d, folderId } : d.folderId === folderId && !merged.includes(d.id) ? { ...d, folderId: undefined } : d))
    );
  };

  const removeDocumentFromFolder = async (folderId: string, docId: string) => {
    if (!isPatient) return;
    const folder = folders.find(f => f.id === folderId);
    const merged = (folder?.documentIds ?? []).filter(id => id !== docId);
    const updated = await patientApi.setFolderDocuments(folderId, merged);
    const mapped = mapFolderApi(updated);
    setFolders(prev => prev.map(f => (f.id === folderId ? mapped : f)));
    setDocuments(prev => prev.map(d => (d.id === docId ? { ...d, folderId: undefined } : d)));
  };

  const shareDocument = async (docId: string) => {
    if (!isPatient) throw new Error('Not authenticated as patient');
    const res = await patientApi.sharePatientDocument(docId);
    setDocuments(prev => prev.map(d => (d.id === docId ? { ...d, shareToken: res.token } : d)));
    return res;
  };

  const shareFolder = async (folderId: string) => {
    if (!isPatient) throw new Error('Not authenticated as patient');
    const res = await patientApi.sharePatientFolder(folderId);
    setFolders(prev =>
      prev.map(f => (f.id === folderId ? { ...f, shareToken: res.token, sharedAt: new Date().toISOString() } : f))
    );
    return res;
  };

  return (
    <PatientDocumentsContext.Provider
      value={{
        documents,
        folders,
        loading,
        error,
        refresh,
        addDocument,
        deleteDocument,
        createFolder,
        deleteFolder,
        addDocumentsToFolder,
        removeDocumentFromFolder,
        shareDocument,
        shareFolder,
      }}
    >
      {children}
    </PatientDocumentsContext.Provider>
  );
}

export function usePatientDocuments() {
  const ctx = useContext(PatientDocumentsContext);
  if (!ctx) throw new Error('usePatientDocuments must be used within PatientDocumentsProvider');
  return ctx;
}
