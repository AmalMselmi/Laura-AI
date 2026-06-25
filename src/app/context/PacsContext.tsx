import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  listPacsServers,
  createPacsServer,
  updatePacsServer,
  deletePacsServer,
} from '../lib/api/pacs';
import type { PacsServerApi } from '../types/api';

export interface PacsServer {
  id: string;
  name: string;
  host: string;
  port: number;
  aeTitle: string;
  callingAeTitle: string;
  protocol: 'DICOM' | 'DICOMweb';
  webUrl: string;
  tls: boolean;
  active: boolean;
  lastConnected?: string;
  connectionStatus: 'connected' | 'error' | 'unknown';
}

function mapApiToServer(a: PacsServerApi): PacsServer {
  const st = a.connectionStatus;
  const status: PacsServer['connectionStatus'] =
    st === 'connected' || st === 'error' ? st : 'unknown';
  return {
    id: a.id,
    name: a.name,
    host: a.host,
    port: a.port,
    aeTitle: a.aeTitle,
    callingAeTitle: a.callingAeTitle,
    protocol: a.protocol === 'DICOMweb' ? 'DICOMweb' : 'DICOM',
    webUrl: a.webUrl ?? '',
    tls: a.tls,
    active: a.active,
    lastConnected: a.lastConnected ?? undefined,
    connectionStatus: status,
  };
}

interface PacsContextType {
  servers: PacsServer[];
  loading: boolean;
  reloadServers: () => Promise<void>;
  /** Optimistic UI: set connection test status without refetching the list. */
  setConnectionStatus: (serverId: string, connectionStatus: PacsServer['connectionStatus']) => void;
  addServer: (s: Omit<PacsServer, 'id' | 'connectionStatus' | 'lastConnected'>) => Promise<void>;
  updateServer: (s: PacsServer) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
}

const PacsContext = createContext<PacsContextType | null>(null);

export function PacsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [servers, setServers] = useState<PacsServer[]>([]);
  const [loading, setLoading] = useState(false);

  const reloadServers = useCallback(async () => {
    if (!user || user.role !== 'radiologist') {
      setServers([]);
      return;
    }
    setLoading(true);
    try {
      const raw = await listPacsServers();
      setServers(raw.map(mapApiToServer));
    } catch {
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reloadServers();
  }, [reloadServers]);

  const addServer = useCallback(
    async (s: Omit<PacsServer, 'id' | 'connectionStatus' | 'lastConnected'>) => {
      await createPacsServer({
        name: s.name,
        host: s.host,
        port: s.port,
        aeTitle: s.aeTitle,
        callingAeTitle: s.callingAeTitle,
        protocol: s.protocol,
        webUrl: s.webUrl || undefined,
        tls: s.tls,
        active: s.active,
      });
      await reloadServers();
    },
    [reloadServers]
  );

  const updateServer = useCallback(
    async (s: PacsServer) => {
      await updatePacsServer(s.id, {
        name: s.name,
        host: s.host,
        port: s.port,
        aeTitle: s.aeTitle,
        callingAeTitle: s.callingAeTitle,
        protocol: s.protocol,
        webUrl: s.webUrl || undefined,
        tls: s.tls,
        active: s.active,
      });
      await reloadServers();
    },
    [reloadServers]
  );

  const deleteServer = useCallback(
    async (id: string) => {
      await deletePacsServer(id);
      await reloadServers();
    },
    [reloadServers]
  );

  const setConnectionStatus = useCallback((serverId: string, connectionStatus: PacsServer['connectionStatus']) => {
    setServers(prev => prev.map(s => (s.id === serverId ? { ...s, connectionStatus } : s)));
  }, []);

  return (
    <PacsContext.Provider
      value={{
        servers,
        loading,
        reloadServers,
        setConnectionStatus,
        addServer,
        updateServer,
        deleteServer,
      }}
    >
      {children}
    </PacsContext.Provider>
  );
}

export function usePacs() {
  const ctx = useContext(PacsContext);
  if (!ctx) throw new Error('usePacs must be used within PacsProvider');
  return ctx;
}
