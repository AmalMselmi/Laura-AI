import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Building2,
  Users,
  Stethoscope,
  ChevronLeft,
  MessageSquare,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';
import { LauraLogoMark } from '../components/brand/LauraLogoMark';

type Subject = 'demo' | 'patient' | 'radiologue' | 'institution' | 'support' | 'autre';

const SUBJECTS: { value: Subject; label: string; icon: React.ReactNode }[] = [
  { value: 'demo', label: 'Demander une démo', icon: <Zap className="h-4 w-4" /> },
  { value: 'patient', label: 'Espace patient', icon: <Users className="h-4 w-4" /> },
  { value: 'radiologue', label: 'Espace radiologue', icon: <Stethoscope className="h-4 w-4" /> },
  { value: 'institution', label: 'Partenariat institution', icon: <Building2 className="h-4 w-4" /> },
  { value: 'support', label: 'Support technique', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'autre', label: 'Autre demande', icon: <Mail className="h-4 w-4" /> },
];

export function ContactPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    subject: '' as Subject | '',
    country: 'FR',
    message: '',
    rgpd: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Prénom requis';
    if (!form.lastName.trim()) e.lastName = 'Nom requis';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email invalide';
    if (!form.subject) e.subject = 'Veuillez choisir un sujet';
    if (!form.message.trim() || form.message.length < 20) e.message = 'Message trop court (min. 20 caractères)';
    if (!form.rgpd) e.rgpd = 'Vous devez accepter la politique de confidentialité';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1600));
    setSubmitting(false);
    setSubmitted(true);
  };

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-rose-50/20">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <LauraLogoMark size="contact" tone="brand" aria-hidden />
              <span className="bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text font-bold text-transparent">
                Laura AI
              </span>
            </div>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <MessageSquare className="h-3.5 w-3.5" /> Nous sommes là pour vous
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Parlons de votre{' '}
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-rose-500 bg-clip-text text-transparent">
              projet santé
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            Démo personnalisée, question sur les forfaits, partenariat institutionnel — notre équipe vous répond en
            moins de 24h.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <aside className="space-y-5 lg:pt-2">
            <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Coordonnées</h2>

              {[
                {
                  icon: <Mail className="h-4 w-4 text-blue-600" />,
                  label: 'Email',
                  value: 'contact@laura-ai.fr',
                  sub: 'Réponse sous 24h',
                },
                {
                  icon: <Phone className="h-4 w-4 text-violet-600" />,
                  label: 'Téléphone',
                  value: '+33 1 80 00 00 00',
                  sub: 'Lun–Ven 9h–18h',
                },
                {
                  icon: <MapPin className="h-4 w-4 text-rose-500" />,
                  label: 'Adresse',
                  value: 'Paris, France',
                  sub: 'Siège social',
                },
                {
                  icon: <Clock className="h-4 w-4 text-green-600" />,
                  label: 'Délai',
                  value: '< 24h',
                  sub: 'Jours ouvrés',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-900">Présence internationale</h2>
              <div className="space-y-3">
                {[
                  { flag: '🇫🇷', country: 'France', detail: 'Siège — Paris · Hébergement HDS' },
                  { flag: '🇹🇳', country: 'Tunisie', detail: 'Bureau Tunis · Support local' },
                  { flag: '🌍', country: 'International', detail: 'Disponible dans le monde entier' },
                ].map((p) => (
                  <div key={p.country} className="flex items-center gap-3">
                    <span className="text-xl">{p.flag}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.country}</p>
                      <p className="text-xs text-gray-400">{p.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-100">Nos engagements</h2>
              <div className="space-y-3">
                {[
                  { icon: <Shield className="h-4 w-4" />, text: 'Données RGPD protégées' },
                  { icon: <Globe className="h-4 w-4" />, text: 'HDS certifié France' },
                  { icon: <CheckCircle className="h-4 w-4" />, text: 'Sans engagement initial' },
                  { icon: <Zap className="h-4 w-4" />, text: 'Démo en 48h garantie' },
                ].map((g) => (
                  <div key={g.text} className="flex items-center gap-2 text-sm text-blue-100">
                    {g.icon} {g.text}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2">
            {submitted ? (
              <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900">Message envoyé !</h2>
                <p className="mb-2 text-gray-500">
                  Merci <strong>{form.firstName}</strong>, votre demande a bien été reçue.
                </p>
                <p className="mb-8 text-sm text-gray-400">
                  Notre équipe vous répondra à <strong>{form.email}</strong> sous 24h ouvrées.
                </p>

                {form.subject === 'demo' && (
                  <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
                    <p className="mb-1 text-sm font-semibold text-blue-800">🎯 Votre demande de démo</p>
                    <p className="text-sm text-blue-600">
                      Un conseiller Laura AI vous contactera pour planifier une démonstration personnalisée selon votre
                      profil et vos besoins.
                    </p>
                  </div>
                )}

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-rose-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <ChevronLeft className="h-4 w-4" /> Retour à l&apos;accueil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm((p) => ({ ...p, message: '', subject: '' as Subject | '' }));
                    }}
                    className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="mb-1 text-xl font-bold text-gray-900">Envoyez-nous un message</h2>
                <p className="-mt-1 text-sm text-gray-400">Tous les champs marqués * sont requis.</p>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Sujet de votre demande *</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => set('subject', s.value)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          form.subject === s.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                  {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      { field: 'firstName' as const, label: 'Prénom *', placeholder: 'Amira' },
                      { field: 'lastName' as const, label: 'Nom *', placeholder: 'Ben Salah' },
                    ] as const
                  ).map((f) => (
                    <div key={f.field}>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{f.label}</label>
                      <input
                        type="text"
                        value={form[f.field]}
                        onChange={(ev) => set(f.field, ev.target.value)}
                        placeholder={f.placeholder}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                          errors[f.field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      {errors[f.field] && <p className="mt-1 text-xs text-red-500">{errors[f.field]}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="amira@example.com"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                        errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Téléphone <span className="font-normal text-gray-400">(optionnel)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+33 6 00 00 00 00"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Organisation <span className="font-normal text-gray-400">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(e) => set('organization', e.target.value)}
                      placeholder="Hôpital, cabinet, entreprise…"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Pays</label>
                    <select
                      value={form.country}
                      onChange={(e) => set('country', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="FR">🇫🇷 France</option>
                      <option value="TN">🇹🇳 Tunisie</option>
                      <option value="BE">🇧🇪 Belgique</option>
                      <option value="CH">🇨🇭 Suisse</option>
                      <option value="MA">🇲🇦 Maroc</option>
                      <option value="DZ">🇩🇿 Algérie</option>
                      <option value="OTHER">🌍 Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    rows={5}
                    placeholder={
                      form.subject === 'demo'
                        ? "Décrivez votre contexte (type d'établissement, nombre d'utilisateurs, fonctionnalités souhaitées…)"
                        : 'Décrivez votre demande en détail…'
                    }
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                      errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    {errors.message ? <p className="text-xs text-red-500">{errors.message}</p> : <span />}
                    <span className={`text-xs ${form.message.length < 20 ? 'text-gray-400' : 'text-green-600'}`}>
                      {form.message.length}/20 min
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    className={`flex cursor-pointer items-start gap-3 ${errors.rgpd ? 'text-red-600' : 'text-gray-600'}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.rgpd}
                      onChange={(e) => set('rgpd', e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded accent-blue-600"
                    />
                    <span className="text-sm leading-relaxed">
                      J&apos;accepte que Laura AI traite mes données pour répondre à ma demande, conformément à sa{' '}
                      <a href="/about" className="text-blue-600 hover:underline">
                        politique de confidentialité
                      </a>{' '}
                      et au RGPD. *
                    </span>
                  </label>
                  {errors.rgpd && <p className="ml-7 mt-1 text-xs text-red-500">{errors.rgpd}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-rose-500 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-rose-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {form.subject === 'demo' ? 'Demander ma démo' : 'Envoyer le message'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-16" id="faq">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-900">Questions fréquentes</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                q: 'La démo est-elle gratuite ?',
                a: 'Oui, la démo personnalisée est entièrement gratuite et sans engagement. Elle dure environ 30 minutes.',
              },
              {
                q: 'Combien de temps pour une réponse ?',
                a: 'Notre équipe vous répond sous 24h ouvrées. Pour une démo, nous vous proposons un créneau sous 48h.',
              },
              {
                q: 'Proposez-vous un déploiement sur site ?',
                a: 'Oui, pour les institutions et les grandes structures, nous proposons un déploiement dédié. Contactez-nous pour en discuter.',
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-gray-800">{faq.q}</p>
                <p className="text-sm leading-relaxed text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
