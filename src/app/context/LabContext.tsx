import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getRadiologistLabContext,
  updateRadiologistLab,
  updateRadiologistProfile,
  type RadiologistLabUpdatePayload,
} from '../lib/api/radiologist';
import type { SharedLabInfoApi } from '../types/api';

export interface LabInfo {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  rpps: string;
  siret: string;
  logoDataUrl: string;
  /** Remote logo URL from cabinet settings (API / S3). */
  logoUrl?: string;
}

export interface RadiologistProfile {
  name: string;
  title: string;
  specialty: string;
}

const EMPTY_LAB: LabInfo = {
  name: '',
  address: '',
  postalCode: '',
  city: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  rpps: '',
  siret: '',
  logoDataUrl: '',
  logoUrl: undefined,
};

const EMPTY_PROFILE: RadiologistProfile = {
  name: '',
  title: '',
  specialty: '',
};

function labFromApi(l: SharedLabInfoApi): LabInfo {
  return {
    name: l.name,
    address: l.address,
    postalCode: l.postalCode,
    city: l.city,
    country: l.country,
    phone: l.phone,
    email: l.email,
    website: l.website,
    rpps: l.rpps,
    siret: l.siret,
    logoDataUrl: l.logoDataUrl || '',
    logoUrl: l.logoUrl ?? undefined,
  };
}

interface LabContextType {
  lab: LabInfo;
  profile: RadiologistProfile;
  labLoaded: boolean;
  reloadLab: () => Promise<void>;
  saveLab: (
    fields: LabInfo,
    options?: { logoFile?: File | null; clearLogo?: boolean }
  ) => Promise<void>;
  saveProfile: (p: RadiologistProfile) => Promise<void>;
}

const LabContext = createContext<LabContextType | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const { user, refreshSession } = useAuth();
  const [lab, setLab] = useState<LabInfo>(EMPTY_LAB);
  const [profile, setProfile] = useState<RadiologistProfile>(EMPTY_PROFILE);
  const [labLoaded, setLabLoaded] = useState(false);

  const reloadLab = useCallback(async () => {
    if (user?.role !== 'radiologist') {
      setLab(EMPTY_LAB);
      setProfile(EMPTY_PROFILE);
      setLabLoaded(false);
      return;
    }
    try {
      const ctx = await getRadiologistLabContext();
      setLab(labFromApi(ctx.lab));
      setProfile(ctx.profile);
      setLabLoaded(true);
    } catch {
      setLabLoaded(false);
    }
  }, [user?.role, user?.id]);

  useEffect(() => {
    void reloadLab();
  }, [reloadLab]);

  const saveLab = useCallback(
    async (fields: LabInfo, options?: { logoFile?: File | null; clearLogo?: boolean }) => {
      const { logoFile, clearLogo } = options ?? {};
      const { logoDataUrl, logoUrl: _u, ...rest } = fields;
      const payload: RadiologistLabUpdatePayload = {
        ...rest,
        clearLogo: clearLogo ?? false,
        logoDataUrl:
          !logoFile && !clearLogo && logoDataUrl
            ? logoDataUrl
            : undefined,
      };
      const ctx = await updateRadiologistLab(payload, logoFile ?? undefined);
      setLab(labFromApi(ctx.lab));
      setProfile(ctx.profile);
    },
    []
  );

  const saveProfile = useCallback(
    async (p: RadiologistProfile) => {
      const out = await updateRadiologistProfile({
        name: p.name,
        title: p.title,
        specialty: p.specialty,
      });
      setProfile(out);
      await refreshSession();
    },
    [refreshSession]
  );

  return (
    <LabContext.Provider
      value={{ lab, profile, labLoaded, reloadLab, saveLab, saveProfile }}
    >
      {children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab must be used within LabProvider');
  return ctx;
}
