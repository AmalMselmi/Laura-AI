import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar, Home, Stethoscope, ArrowRight } from 'lucide-react';
import { LauraLogoMark } from '../brand/LauraLogoMark';
import { RegisterPayload } from '../../context/AuthContext';

interface SignUpProps {
  onSignUp: (payload: RegisterPayload) => Promise<void>;
  onBackToLogin: () => void;
  onBackToHome?: () => void;
}

export function SignUp({ onSignUp, onBackToLogin, onBackToHome }: SignUpProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    // Radiologist specific fields
    rppsNumber: '',
    clinicName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    userType: 'patient' as 'patient' | 'radiologist'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await onSignUp({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.userType,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </button>
        )}

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <LauraLogoMark size="signup" tone="brand" />
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">Laura</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
          <p className="text-sm sm:text-base text-gray-600">Rejoignez des milliers d'utilisateurs qui font confiance à Laura</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, userType: 'patient' })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                formData.userType === 'patient'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, userType: 'radiologist' })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
                formData.userType === 'radiologist'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>Professionnel</span>
            </button>
          </div>

          {/* Patient Registration Form */}
          {formData.userType === 'patient' && (
            <div>
              <div className="mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">Informations Patient</h2>
                <p className="text-sm sm:text-base text-gray-600 text-center">Complétez votre profil pour commencer</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      placeholder="Prénom"
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      placeholder="Nom"
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="vous@exemple.com"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+216 98 765 432"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
                    <select className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base">
                      <option>Femme</option>
                      <option>Homme</option>
                      <option>Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" className="mt-1" required />
                  <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600">
                    J'accepte les <a href="#" className="text-blue-600 hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a>
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" id="cnam" className="mt-1" />
                  <label htmlFor="cnam" className="text-xs sm:text-sm text-gray-600">
                    Je souhaite lier mon compte avec mon carnet de santé CNAM (recommandé)
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-lg hover:from-blue-700 hover:to-rose-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? 'Création...' : 'Créer mon compte'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <button onClick={onBackToLogin} className="text-blue-600 hover:underline font-medium">
                    Se connecter
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Doctor Registration Form */}
          {formData.userType === 'radiologist' && (
            <div>
              <div className="mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">Inscription Radiologue</h2>
                <p className="text-sm sm:text-base text-gray-600 text-center">Créez votre compte professionnel DICOM</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                    <select className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base">
                      <option>Dr.</option>
                      <option>Pr.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                    <input
                      type="text"
                      placeholder="Mohamed Trabelsi"
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      required
                      value={formData.firstName + ' ' + formData.lastName}
                      onChange={(e) => {
                        const parts = e.target.value.split(' ');
                        const firstName = parts[0] || '';
                        const lastName = parts.slice(1).join(' ') || '';
                        setFormData({ ...formData, firstName, lastName });
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité radiologique</label>
                  <select className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base">
                    <option>Radiologie générale</option>
                    <option>Neuroradiologie</option>
                    <option>Radiologie interventionnelle</option>
                    <option>Radiologie pédiatrique</option>
                    <option>Imagerie de la femme (sénologie)</option>
                    <option>Radiologie ostéo-articulaire</option>
                    <option>Radiologie thoracique</option>
                    <option>Radiologie cardio-vasculaire</option>
                    <option>Radiologie abdominale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">N° RPPS / N° d'inscription au Conseil de l'Ordre</label>
                  <input
                    type="text"
                    placeholder="TN123456789 ou RPPS 10001234567"
                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    required
                    value={formData.rppsNumber}
                    onChange={(e) => setFormData({ ...formData, rppsNumber: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Requis pour l'accès aux fonctionnalités DICOM professionnelles</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email professionnel</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="dr.trabelsi@radiologie.tn"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms-doc" className="mt-1" required />
                  <label htmlFor="terms-doc" className="text-xs sm:text-sm text-gray-600">
                    J'accepte les conditions d'utilisation et je m'engage à respecter le secret médical
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg hover:from-blue-700 hover:to-purple-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? 'Création...' : 'Créer mon compte professionnel'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  Vous avez déjà un compte ?{' '}
                  <button onClick={onBackToLogin} className="text-purple-600 hover:underline font-medium">
                    Se connecter
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}