import { useNavigate } from 'react-router';
import {
  Heart,
  Activity,
  Pill,
  Syringe,
  AlertCircle,
  TrendingUp,
  FileDown,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

/** Figma `1:7901` — Carnet de santé numérique */
export function HealthCarnet() {
  const navigate = useNavigate();

  const healthMetrics = [
    { label: 'Groupe sanguin', value: 'O+', Icon: Activity },
    { label: 'Poids', value: '72 kg', Icon: TrendingUp },
    { label: 'Taille', value: '175 cm', Icon: TrendingUp },
    { label: 'Allergies', value: 'Pénicilline', Icon: AlertCircle },
  ];

  const vaccines = [
    { name: 'COVID-19', lastDose: '15/09/2025', nextReminder: null },
    { name: 'Grippe saisonnière', lastDose: '20/10/2025', nextReminder: '20/10/2026' },
    { name: 'Tétanos', lastDose: '10/03/2023', nextReminder: '10/03/2033' },
  ];

  const medications = [
    {
      name: 'Ramipril 5mg',
      dosage: '1 comprimé/jour',
      prescribedLine: 'Prescrit par Dr. Trabelsi le 01/06/2024',
    },
    {
      name: 'Aspirine 100mg',
      dosage: '1 comprimé/jour',
      prescribedLine: 'Prescrit par Dr. Trabelsi le 01/06/2024',
    },
  ];

  const conditions = [
    {
      name: 'Bosniak IIF - Kyste rénal complexe',
      diagnosedLabel: 'Diagnostiqué le 15 mars 2024',
      status: 'En suivi actif',
      doctorLine: 'Dr. Mohamed Trabelsi',
      notes: 'Contrôle IRM tous les 6 mois',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-sans text-[30px] font-bold leading-9 tracking-tight text-[#101828]">
            Carnet de santé numérique
          </h1>
          <p className="font-sans text-base font-normal leading-6 text-[#4a5565]">
            Votre historique médical complet et à jour
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toast.message('Export PDF — fonctionnalité à venir')}
            className="inline-flex h-[42px] items-center gap-2 rounded-[10px] border-[0.8px] border-solid border-[#d1d5dc] px-4 font-sans text-base font-normal text-[#364153] transition-colors hover:bg-[#f9fafb]"
          >
            <FileDown className="h-4 w-4 shrink-0 text-[#364153]" strokeWidth={2} aria-hidden />
            Exporter PDF
          </button>
          <button
            type="button"
            onClick={() => navigate('/patient/account')}
            className="inline-flex h-[42px] items-center gap-2 rounded-[10px] bg-[#155dfc] px-4 font-sans text-base font-normal text-white transition-colors hover:bg-[#1447e6]"
          >
            <Plus className="h-4 w-4 shrink-0 text-white" strokeWidth={2} aria-hidden />
            Ajouter info
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {healthMetrics.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-4 pb-4 pt-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
          >
            <div className="mb-2 flex h-10 items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eff6ff]">
                <Icon className="h-5 w-5 text-[#155dfc]" strokeWidth={2} aria-hidden />
              </div>
            </div>
            <p className="mb-1 font-sans text-sm font-normal leading-5 text-[#4a5565]">{label}</p>
            <p className="font-sans text-xl font-bold leading-7 text-[#101828]">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-6 pt-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <h2 className="mb-4 flex items-center gap-2 font-sans text-xl font-semibold leading-7 text-[#101828]">
          <Heart className="h-6 w-6 shrink-0 text-[#e7000b]" strokeWidth={2} aria-hidden />
          Conditions médicales
        </h2>
        <div className="flex flex-col gap-4">
          {conditions.map((c) => (
            <div
              key={c.name}
              className="rounded-[10px] border-[0.8px] border-solid border-[#e5e7eb] p-4"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-sans text-base font-semibold leading-6 text-[#101828]">{c.name}</h3>
                  <p className="mt-1 font-sans text-sm font-normal leading-5 text-[#4a5565]">{c.diagnosedLabel}</p>
                </div>
                <span className="inline-flex h-[30px] shrink-0 items-center justify-center self-start rounded-full border-[0.8px] border-solid border-[#fee685] bg-[#fef3c6] px-3 font-sans text-sm font-normal text-[#bb4d00]">
                  {c.status}
                </span>
              </div>
              <div className="mb-4 rounded-[10px] bg-[#f9fafb] px-3 py-3">
                <p className="font-sans text-sm leading-5 text-[#364153]">
                  <span className="font-bold">Médecin traitant :</span>{' '}
                  <span className="font-normal">{c.doctorLine}</span>
                </p>
                <p className="mt-1 font-sans text-sm leading-5 text-[#364153]">
                  <span className="font-bold">Notes :</span> <span className="font-normal">{c.notes}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/patient/documents')}
                className="inline-flex items-center gap-0.5 font-sans text-sm font-medium text-[#155dfc] hover:underline"
              >
                Voir l&apos;historique complet
                <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-6 pt-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <h2 className="mb-4 flex items-center gap-2 font-sans text-xl font-semibold leading-7 text-[#101828]">
          <Pill className="h-6 w-6 shrink-0 text-[#155dfc]" strokeWidth={2} aria-hidden />
          Traitements en cours
        </h2>
        <div className="flex flex-col gap-3">
          {medications.map((med) => (
            <div
              key={med.name}
              className="flex flex-col gap-3 rounded-[10px] bg-[#f9fafb] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#dbeafe]">
                  <Pill className="h-6 w-6 text-[#155dfc]" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="font-sans text-base font-semibold leading-6 text-[#101828]">{med.name}</h3>
                  <p className="font-sans text-sm font-normal leading-5 text-[#4a5565]">{med.dosage}</p>
                  <p className="mt-1 font-sans text-xs font-normal leading-4 text-[#6a7282]">{med.prescribedLine}</p>
                </div>
              </div>
              <span className="inline-flex h-7 shrink-0 items-center justify-center self-start rounded-full bg-[#dcfce7] px-3 font-sans text-sm font-normal text-[#008236] sm:self-center">
                Actif
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[14px] border-[0.8px] border-solid border-[#e5e7eb] bg-white px-5 pb-6 pt-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <h2 className="mb-4 flex items-center gap-2 font-sans text-xl font-semibold leading-7 text-[#101828]">
          <Syringe className="h-6 w-6 shrink-0 text-[#008236]" strokeWidth={2} aria-hidden />
          Vaccinations
        </h2>
        <div className="flex flex-col gap-3">
          {vaccines.map((v) => (
            <div
              key={v.name}
              className="flex flex-col gap-3 rounded-[10px] border-[0.8px] border-solid border-[#e5e7eb] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#dcfce7]">
                  <Syringe className="h-6 w-6 text-[#008236]" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h3 className="font-sans text-base font-semibold leading-6 text-[#101828]">{v.name}</h3>
                  <p className="font-sans text-sm font-normal leading-5 text-[#4a5565]">
                    Dernière dose : {v.lastDose}
                  </p>
                  {v.nextReminder ? (
                    <p className="mt-1 font-sans text-xs font-normal leading-4 text-[#6a7282]">
                      Prochain rappel : {v.nextReminder}
                    </p>
                  ) : null}
                </div>
              </div>
              <span className="inline-flex h-[30px] shrink-0 items-center justify-center self-start rounded-full border-[0.8px] border-solid border-[#b9f8cf] bg-[#dcfce7] px-3 font-sans text-sm font-normal text-[#008236] sm:self-center">
                À jour
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
