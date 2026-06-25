import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import { useLab } from '../../context/LabContext';
import { usePacs, PacsServer } from '../../context/PacsContext';
import { testPacsServer } from '../../lib/api/pacs';
import { notify, notifyApiError } from '../../lib/notifications';
import { AccountManagement } from '../../components/account/AccountManagement';
import {
  Building2, Upload, Save, Check, Phone, Mail, Globe,
  MapPin, Hash, Camera, X, User, Stethoscope,
  Server, Plus, Wifi, WifiOff, Trash2, Edit3, Shield,
  AlertCircle, RefreshCw, ChevronDown, ChevronUp, Activity,
  Lock,
} from 'lucide-react';

type TopTab = 'profile' | 'cabinet' | 'pacs';

export function RadiologistAccountPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const { lab, profile, saveLab, saveProfile } = useLab();
  const { servers, addServer, updateServer, deleteServer, reloadServers } = usePacs();

  const [topTab, setTopTab]   = useState<TopTab>('profile');
  const [labForm, setLabForm] = useState({ ...lab });
  const [profForm, setProfForm] = useState({ ...profile });
  const [cabinetSaved, setCabinetSaved] = useState(false);
  const [profileRadSaved, setProfileRadSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  // PACS state
  const [showAddPacs, setShowAddPacs]   = useState(false);
  const [editingPacs, setEditingPacs]   = useState<PacsServer | null>(null);
  const [testingId, setTestingId]       = useState<string | null>(null);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [pacsForm, setPacsForm]         = useState<Omit<PacsServer, 'id' | 'connectionStatus'>>({
    name: '', host: '', port: 104, aeTitle: '', callingAeTitle: 'LAURA_AI',
    protocol: 'DICOM', webUrl: '', tls: false, active: true,
  });

  if (!user) return null;

  useEffect(() => {
    if (topTab === 'pacs') void reloadServers();
  }, [topTab, reloadServers]);

  useEffect(() => {
    if (topTab === 'cabinet') {
      setLabForm({ ...lab });
      setPendingLogoFile(null);
      setLogoRemoved(false);
      setSaveErr(null);
    }
  }, [topTab, lab]);

  useEffect(() => {
    if (topTab === 'profile') {
      setProfForm({ ...profile });
      setSaveErr(null);
    }
  }, [topTab, profile]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const logoPreview = labForm.logoDataUrl || labForm.logoUrl || '';

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|jpg)$/i.test(file.type)) {
      setSaveErr('Utilisez une image PNG ou JPEG.');
      return;
    }
    setSaveErr(null);
    setLogoRemoved(false);
    setPendingLogoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setLabForm(p => ({ ...p, logoDataUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCabinet = async () => {
    setSaveErr(null);
    try {
      await saveLab(labForm, { logoFile: pendingLogoFile, clearLogo: logoRemoved });
      setPendingLogoFile(null);
      setLogoRemoved(false);
      setCabinetSaved(true);
      setTimeout(() => setCabinetSaved(false), 2500);
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleSaveProfileRad = async () => {
    setSaveErr(null);
    try {
      await saveProfile(profForm);
      setProfileRadSaved(true);
      setTimeout(() => setProfileRadSaved(false), 2500);
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleTestConnection = async (server: PacsServer) => {
    setTestingId(server.id);
    try {
      await testPacsServer(server.id);
      notify.pacsTestOk();
    } catch (e) {
      notifyApiError(e);
    } finally {
      await reloadServers();
      setTestingId(null);
    }
  };

  const handleSavePacs = async () => {
    if (!pacsForm.name || !pacsForm.host || !pacsForm.aeTitle) return;
    try {
      if (editingPacs) {
        await updateServer({ ...editingPacs, ...pacsForm });
        setEditingPacs(null);
      } else {
        await addServer(pacsForm);
      }
      setShowAddPacs(false);
      setPacsForm({ name: '', host: '', port: 104, aeTitle: '', callingAeTitle: 'LAURA_AI', protocol: 'DICOM', webUrl: '', tls: false, active: true });
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (s: PacsServer) => {
    setEditingPacs(s);
    setPacsForm({ name: s.name, host: s.host, port: s.port, aeTitle: s.aeTitle, callingAeTitle: s.callingAeTitle, protocol: s.protocol, webUrl: s.webUrl, tls: s.tls, active: s.active });
    setShowAddPacs(true);
  };

  const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {([
          { key: 'profile', icon: <User className="w-4 h-4" />, label: 'Profil' },
          { key: 'cabinet', icon: <Building2 className="w-4 h-4" />, label: 'Mon Cabinet' },
          { key: 'pacs',    icon: <Server className="w-4 h-4" />, label: 'PACS' },
        ] as { key: TopTab; icon: React.ReactNode; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTopTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${topTab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {topTab === 'profile' && (
        <div className="space-y-5">
          <AccountManagement user={user} onLogout={handleLogout} />
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" /> Identité professionnelle (rapports)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Ces informations apparaissent sur les comptes-rendus et exports PDF.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom complet" value={profForm.name} onChange={v => setProfForm(p => ({ ...p, name: v }))} placeholder="Dr. Prénom Nom" />
              <Field label="Titre" value={profForm.title} onChange={v => setProfForm(p => ({ ...p, title: v }))} placeholder="Médecin Radiologue" />
              <div className="sm:col-span-2">
                <Field label="Spécialité" value={profForm.specialty} onChange={v => setProfForm(p => ({ ...p, specialty: v }))} placeholder="Imagerie médicale & IRM" />
              </div>
            </div>
            {saveErr && topTab === 'profile' && (
              <p className="text-xs text-red-600 mt-3">{saveErr}</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => void handleSaveProfileRad()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-sm ${profileRadSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-blue-600 to-purple-500 text-white hover:opacity-90'}`}
              >
                {profileRadSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {profileRadSaved ? 'Identité enregistrée' : "Enregistrer l'identité"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cabinet tab ── */}
      {topTab === 'cabinet' && (
        <div className="space-y-5">
          {/* Logo */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" /> Logo du cabinet / laboratoire
            </h2>
            <div className="flex items-start gap-5">
              <div onClick={() => logoRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50 hover:bg-blue-50">
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  : <div className="text-center"><Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" /><p className="text-xs text-gray-400">Logo</p></div>}
              </div>
              <input ref={logoRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleLogoChange} />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-700">Téléchargez le logo de votre cabinet. Il apparaîtra sur tous les rapports exportés.</p>
                <p className="text-xs text-gray-400">PNG ou JPEG · Recommandé : 400×200 px · Max 5 Mo</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                    <Upload className="w-3.5 h-3.5" />{logoPreview ? 'Changer' : 'Importer'}
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLabForm(p => ({ ...p, logoDataUrl: '', logoUrl: undefined }));
                        setPendingLogoFile(null);
                        setLogoRemoved(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50">
                      <X className="w-3.5 h-3.5" />Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cabinet info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Informations du cabinet
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Nom du cabinet / laboratoire" value={labForm.name} onChange={v => setLabForm(p => ({ ...p, name: v }))} placeholder="Centre d'Imagerie Médicale..." />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Adresse</label>
                <input type="text" value={labForm.address} onChange={e => setLabForm(p => ({ ...p, address: e.target.value }))} placeholder="Numéro et nom de rue"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <Field label="Code postal" value={labForm.postalCode} onChange={v => setLabForm(p => ({ ...p, postalCode: v }))} placeholder="75011" />
              <Field label="Ville" value={labForm.city} onChange={v => setLabForm(p => ({ ...p, city: v }))} placeholder="Paris" />
              <div className="col-span-2"><Field label="Pays" value={labForm.country} onChange={v => setLabForm(p => ({ ...p, country: v }))} placeholder="France" /></div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Téléphone</label>
                <input type="tel" value={labForm.phone} onChange={e => setLabForm(p => ({ ...p, phone: e.target.value }))} placeholder="+33 1 23 45 67 89"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</label>
                <input type="email" value={labForm.email} onChange={e => setLabForm(p => ({ ...p, email: e.target.value }))} placeholder="contact@cabinet.fr"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Site web</label>
                <input type="text" value={labForm.website} onChange={e => setLabForm(p => ({ ...p, website: e.target.value }))} placeholder="www.cabinet.fr"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Hash className="w-3.5 h-3.5" />N° RPPS</label>
                <input type="text" value={labForm.rpps} onChange={e => setLabForm(p => ({ ...p, rpps: e.target.value }))} placeholder="10001234567"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Hash className="w-3.5 h-3.5" />SIRET</label>
                <input type="text" value={labForm.siret} onChange={e => setLabForm(p => ({ ...p, siret: e.target.value }))} placeholder="123 456 789 00012"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Aperçu en-tête des rapports</p>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-12 w-auto object-contain flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm">{labForm.name || 'Nom du cabinet'}</p>
                <p className="text-xs text-gray-500">{labForm.address}{labForm.city ? `, ${labForm.postalCode} ${labForm.city}` : ''}</p>
                <p className="text-xs text-gray-500">{labForm.phone} · {labForm.email}</p>
                {labForm.rpps && <p className="text-xs text-gray-400">RPPS : {labForm.rpps}</p>}
              </div>
            </div>
          </div>

          {saveErr && topTab === 'cabinet' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {saveErr}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleSaveCabinet()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-sm ${cabinetSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-blue-600 to-purple-500 text-white hover:opacity-90'}`}
            >
              {cabinetSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {cabinetSaved ? 'Sauvegardé !' : 'Sauvegarder le cabinet'}
            </button>
          </div>
        </div>
      )}

      {/* ── PACS tab ── */}
      {topTab === 'pacs' && (
        <div className="space-y-4">

          {/* Info banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-2xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold">Serveurs PACS</h2>
                <p className="text-blue-100 text-sm mt-0.5">
                  Connectez vos systèmes d'archivage DICOM pour importer directement les examens et données patients.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['DICOM C-FIND/C-MOVE', 'DICOMweb (WADO-RS)', 'TLS/SSL', 'Multi-serveurs'].map(f => (
                    <span key={f} className="bg-white/20 rounded-lg px-2 py-1 text-xs">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Servers list */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                Serveurs configurés
                <span className="text-xs font-normal text-gray-400">({servers.length})</span>
              </h3>
              <button onClick={() => { setEditingPacs(null); setShowAddPacs(true); setPacsForm({ name: '', host: '', port: 104, aeTitle: '', callingAeTitle: 'LAURA_AI', protocol: 'DICOM', webUrl: '', tls: false, active: true }); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl text-xs font-medium hover:opacity-90">
                <Plus className="w-3.5 h-3.5" /> Ajouter un serveur
              </button>
            </div>

            {servers.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun serveur PACS configuré</p>
                <p className="text-xs text-gray-400 mt-1">Ajoutez votre premier serveur pour commencer les imports</p>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.map(s => {
                  const isExpanded  = expandedId === s.id;
                  const isTesting   = testingId === s.id;
                  const statusColor = s.connectionStatus === 'connected' ? 'text-green-600' : s.connectionStatus === 'error' ? 'text-red-500' : 'text-gray-400';
                  const StatusIcon  = s.connectionStatus === 'connected' ? Wifi : s.connectionStatus === 'error' ? WifiOff : Wifi;

                  return (
                    <div key={s.id} className={`border rounded-2xl overflow-hidden transition-all ${s.connectionStatus === 'connected' ? 'border-green-200' : s.connectionStatus === 'error' ? 'border-red-200' : 'border-gray-200'}`}>
                      {/* Header */}
                      <div className="flex items-center gap-3 p-4">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.connectionStatus === 'connected' ? 'bg-green-400 shadow-sm shadow-green-300' : s.connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                            {s.tls && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs"><Lock className="w-2.5 h-2.5" />TLS</span>}
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s.protocol}</span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{s.host}:{s.port} · AE: <strong>{s.aeTitle}</strong> ← {s.callingAeTitle}</p>
                          {s.lastConnected && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                              <span className={statusColor}>
                                {s.connectionStatus === 'connected' ? 'Connecté' : s.connectionStatus === 'error' ? 'Erreur de connexion' : 'Non testé'}
                              </span>
                              {s.lastConnected && <span className="text-gray-300 ml-1">· {new Date(s.lastConnected).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button type="button" onClick={() => void handleTestConnection(s)} disabled={isTesting}
                            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50">
                            {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                            {isTesting ? 'Test…' : 'Tester'}
                          </button>
                          <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <button type="button" onClick={() => void deleteServer(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                          <button onClick={() => setExpandedId(isExpanded ? null : s.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              ['Adresse IP / Hôte', s.host],
                              ['Port DICOM', s.port.toString()],
                              ['AE Title (PACS)', s.aeTitle],
                              ['Calling AE (Laura AI)', s.callingAeTitle],
                              ['Protocole', s.protocol],
                              ['Chiffrement', s.tls ? 'TLS activé' : 'Non chiffré'],
                              ...(s.protocol === 'DICOMweb' && s.webUrl ? [['URL DICOMweb', s.webUrl]] : []),
                            ].map(([k, v]) => (
                              <div key={k}>
                                <p className="text-xs text-gray-400">{k}</p>
                                <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5 break-all">{v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DICOM info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Sécurité DICOM
              </h4>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• TLS 1.3 pour les connexions sécurisées</li>
                <li>• Authentification par AE Title</li>
                <li>• Journalisation DICOM complète</li>
                <li>• Données chiffrées en transit (AES-256)</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <h4 className="font-semibold text-purple-900 text-sm mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Compatibilité
              </h4>
              <ul className="space-y-1 text-xs text-purple-800">
                <li>• Orthanc, Horos, OsiriX</li>
                <li>• Synapse, Centricity, Impax</li>
                <li>• Carestream Vue, Sectra PACS</li>
                <li>• Tout serveur DICOM standard</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit PACS modal ── */}
      {showAddPacs && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                {editingPacs ? 'Modifier le serveur PACS' : 'Ajouter un serveur PACS'}
              </h3>
              <button onClick={() => setShowAddPacs(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Nom du serveur *</label>
                <input type="text" value={pacsForm.name} onChange={e => setPacsForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex : PACS Principal Hôpital Lariboisière"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white" />
              </div>

              {/* Connection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Adresse IP / Hôte *
                  </label>
                  <input type="text" value={pacsForm.host} onChange={e => setPacsForm(p => ({ ...p, host: e.target.value }))}
                    placeholder="192.168.1.100 ou pacs.hopital.fr"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Port DICOM *</label>
                  <input type="number" value={pacsForm.port} onChange={e => setPacsForm(p => ({ ...p, port: parseInt(e.target.value) || 104 }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-white" />
                  <p className="text-xs text-gray-400 mt-1">Défaut : 104 (DICOM) ou 11112 (Orthanc)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Protocole</label>
                  <select value={pacsForm.protocol} onChange={e => setPacsForm(p => ({ ...p, protocol: e.target.value as 'DICOM' | 'DICOMweb' }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="DICOM">DICOM (C-FIND/C-MOVE)</option>
                    <option value="DICOMweb">DICOMweb (WADO-RS)</option>
                  </select>
                </div>
              </div>

              {/* AE Titles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    AE Title du PACS *
                  </label>
                  <input type="text" value={pacsForm.aeTitle} onChange={e => setPacsForm(p => ({ ...p, aeTitle: e.target.value.toUpperCase() }))}
                    placeholder="PACS_MAIN"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-white uppercase" />
                  <p className="text-xs text-gray-400 mt-1">Application Entity du serveur</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Calling AE Title (Laura AI)
                  </label>
                  <input type="text" value={pacsForm.callingAeTitle} onChange={e => setPacsForm(p => ({ ...p, callingAeTitle: e.target.value.toUpperCase() }))}
                    placeholder="LAURA_AI"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-white uppercase" />
                </div>
              </div>

              {/* DICOMweb URL */}
              {pacsForm.protocol === 'DICOMweb' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">URL DICOMweb (WADO-RS)</label>
                  <input type="text" value={pacsForm.webUrl} onChange={e => setPacsForm(p => ({ ...p, webUrl: e.target.value }))}
                    placeholder="https://pacs.hopital.fr/wado/rs"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-white" />
                </div>
              )}

              {/* Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${pacsForm.tls ? 'bg-green-500' : 'bg-gray-200'}`}
                    onClick={() => setPacsForm(p => ({ ...p, tls: !p.tls }))}>
                    <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all shadow-sm ${pacsForm.tls ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-green-600" /> TLS / SSL
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${pacsForm.active ? 'bg-blue-500' : 'bg-gray-200'}`}
                    onClick={() => setPacsForm(p => ({ ...p, active: !p.active }))}>
                    <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all shadow-sm ${pacsForm.active ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Assurez-vous que le pare-feu autorise la connexion depuis l'IP de Laura AI vers {pacsForm.host || '[hôte]'}:{pacsForm.port}. Le PACS doit accepter les connexions depuis l'AE "<strong>{pacsForm.callingAeTitle || 'LAURA_AI'}</strong>".
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={() => setShowAddPacs(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleSavePacs()}
                disabled={!pacsForm.name || !pacsForm.host || !pacsForm.aeTitle}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {editingPacs ? 'Mettre à jour' : 'Ajouter le serveur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}