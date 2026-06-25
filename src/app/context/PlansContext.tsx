import { createContext, useContext, useState, ReactNode } from 'react';

export interface Plan {
  id: string;
  name: string;
  price: number;
  storageGB: number;       // GB alloués (-1 = illimité)
  maxScans: number;        // scans IA/mois (-1 = illimité)
  aiQuota: number;         // analyses IA/mois (-1 = illimité)
  features: string[];
  userCount: number;
  active: boolean;
}

interface PlansContextType {
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  getPlan: (id: string) => Plan | undefined;
}

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'free', name: 'Gratuit', price: 0,
    storageGB: 0.5, maxScans: 5, aiQuota: 5,
    features: ['5 scans IA/mois', '5 GB stockage', 'Documents basiques', 'Support email'],
    userCount: 1, active: true,
  },
  {
    id: 'starter', name: 'Starter', price: 4.99,
    storageGB: 5, maxScans: 50, aiQuota: 50,
    features: ['50 scans IA/mois', '5 GB stockage', 'Gestion avancée', 'Partage sécurisé', 'Support prioritaire'],
    userCount: 2, active: true,
  },
  {
    id: 'pro', name: 'Pro', price: 9.99,
    storageGB: 20, maxScans: -1, aiQuota: 200,
    features: ['Scans illimités', '20 GB stockage', '200 analyses IA/mois', 'Export multi-formats', 'Accès API'],
    userCount: 2, active: true,
  },
  {
    id: 'radpro', name: 'Radiologue Pro', price: 29.99,
    storageGB: 100, maxScans: -1, aiQuota: -1,
    features: ['DICOM illimité', '100 GB stockage', 'IA illimitée', 'Rapports PDF', 'Multi-sites'],
    userCount: 0, active: true,
  },
  {
    id: 'enterprise', name: 'Entreprise', price: 0,
    storageGB: -1, maxScans: -1, aiQuota: -1,
    features: ['Tout illimité', 'Multi-utilisateurs', 'SLA 99.9%', 'Déploiement dédié'],
    userCount: 1, active: true,
  },
];

const PlansContext = createContext<PlansContextType | null>(null);

export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const getPlan = (id: string) => plans.find(p => p.id === id);
  return (
    <PlansContext.Provider value={{ plans, setPlans, getPlan }}>
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error('usePlans must be used within PlansProvider');
  return ctx;
}

export function formatQuota(val: number, unit = '') {
  return val === -1 ? 'Illimité' : `${val}${unit}`;
}
