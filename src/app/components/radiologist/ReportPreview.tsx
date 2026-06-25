/**
 * ReportPreview — Rendu brandé d'un compte-rendu radiologique.
 * Utilisé pour l'aperçu PDF, l'impression et la page partagée.
 */
import { Building2, Printer, X, Download } from 'lucide-react';
import { LabInfo, RadiologistProfile } from '../../context/LabContext';

export interface ReportData {
  patientName: string;
  patientId: string;
  pathology: string;
  modality: string;
  content: string;
  finalizedAt?: string;
}

interface ReportPreviewProps {
  data: ReportData;
  lab: LabInfo;
  profile: RadiologistProfile;
  /** Si true, affiche en modal pleine page avec boutons imprimer/fermer */
  asModal?: boolean;
  onClose?: () => void;
}

function ReportDocument({ data, lab, profile }: { data: ReportData; lab: LabInfo; profile: RadiologistProfile }) {
  const today = data.finalizedAt
    ? new Date(data.finalizedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div
      id="report-print-content"
      className="bg-white"
      style={{ fontFamily: 'Georgia, serif', minHeight: '100%' }}
    >
      {/* ── En-tête ── */}
      <div style={{ borderBottom: '2px solid #1e40af', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          {/* Logo + infos cabinet */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
            {(lab.logoDataUrl || lab.logoUrl) ? (
              <img
                src={lab.logoDataUrl || lab.logoUrl}
                alt="Logo"
                style={{ height: '64px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '64px', height: '64px', flexShrink: 0, borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: '28px' }}>🏥</span>
              </div>
            )}
            <div>
              <p style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '16px', color: '#1e3a8a', margin: 0 }}>
                {lab.name}
              </p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
                {lab.address}{lab.city ? ` · ${lab.postalCode} ${lab.city}` : ''}
              </p>
              {lab.phone && (
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '1px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
                  Tél : {lab.phone}{lab.email ? ` · ${lab.email}` : ''}
                </p>
              )}
              {lab.website && (
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '1px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
                  {lab.website}
                </p>
              )}
              {lab.rpps && (
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
                  RPPS : {lab.rpps}{lab.siret ? ` · SIRET : ${lab.siret}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Titre du document */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{
              fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '15px',
              color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0,
            }}>
              Compte-rendu radiologique
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '3px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
              Date : {today}
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '1px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
              Généré via Laura AI v2.4
            </p>
          </div>
        </div>
      </div>

      {/* ── Infos patient ── */}
      <div style={{
        background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: '8px',
        padding: '12px 16px', marginBottom: '20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[
            ['Patient', data.patientName],
            ['ID Patient', data.patientId || '—'],
            ['Modalité', data.modality],
            ['Indication', data.pathology],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Arial, sans-serif', minWidth: '70px' }}>{label} :</span>
              <span style={{ fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenu du rapport ── */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: 'bold',
          color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em',
          borderBottom: '1px solid #bfdbfe', paddingBottom: '6px', marginBottom: '12px',
        }}>
          Rapport
        </p>
        <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#1f2937', fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-wrap' }}>
          {data.content}
        </div>
      </div>

      {/* ── Signature ── */}
      <div style={{
        borderTop: '1px solid #e5e7eb', paddingTop: '16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <p style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Arial, sans-serif', margin: 0 }}>
            Fait à {lab.city || '...'}, le {today}
          </p>
          <div style={{ marginTop: '24px' }}>
            <div style={{
              width: '140px', height: '48px', border: '1px dashed #d1d5db',
              borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'Arial, sans-serif' }}>Signature</span>
            </div>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', margin: '8px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
              {profile.name}
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '1px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
              {profile.title}
            </p>
            <p style={{ fontSize: '10px', color: '#9ca3af', margin: '1px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
              {profile.specialty}
            </p>
          </div>
        </div>

        {/* QR / info complémentaire */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            width: '56px', height: '56px', background: '#f3f4f6', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto',
          }}>
            <span style={{ fontSize: '28px' }}>⬛</span>
          </div>
          <p style={{ fontSize: '9px', color: '#9ca3af', margin: '4px 0 0 0', fontFamily: 'Arial, sans-serif' }}>
            QR Code
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: '1px solid #e5e7eb', marginTop: '16px', paddingTop: '10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'Arial, sans-serif', margin: 0 }}>
          Généré par Laura AI · Chiffrement AES-256 · Hébergement HDS (France) · Conforme RGPD Art. 9
        </p>
        <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'Arial, sans-serif', margin: 0 }}>
          {lab.name} · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export function ReportPreview({ data, lab, profile, asModal = false, onClose }: ReportPreviewProps) {
  const handlePrint = () => {
    const content = document.getElementById('report-print-content');
    if (!content) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Compte-rendu — ${data.patientName}</title>
          <style>
            @page { margin: 20mm; }
            body { margin: 0; padding: 0; background: white; }
          </style>
        </head>
        <body>${content.outerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  if (!asModal) {
    return <ReportDocument data={data} lab={lab} profile={profile} />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">Aperçu du rapport — {data.patientName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimer / PDF
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Page */}
      <div className="flex-1 overflow-y-auto bg-gray-200 flex justify-center py-8 px-4">
        <div
          className="bg-white shadow-2xl"
          style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
        >
          <ReportDocument data={data} lab={lab} profile={profile} />
        </div>
      </div>
    </div>
  );
}
