import { useState } from 'react';
import { 
  User, Briefcase, MapPin, Clock, Bell, 
  Shield, Globe, Camera, Mail, Phone, Save, Edit2,
  Building, Lock, Eye, EyeOff
} from 'lucide-react';

export function DoctorSettings() {
  const [activeSection, setActiveSection] = useState<'profile' | 'professional' | 'office' | 'notifications' | 'security'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Données de démonstration
  const [profileData, setProfileData] = useState({
    firstName: 'Ahmed',
    lastName: 'Ben Salah',
    email: 'ahmed.bensalah@medecin.tn',
    phone: '+216 98 765 432',
    dateOfBirth: '1980-05-15',
    gender: 'male',
    photo: null as string | null
  });

  const [professionalData, setProfessionalData] = useState({
    specialty: 'Néphrologie',
    subSpecialty: 'Dialyse et Transplantation',
    license: 'TN-MED-2005-12345',
    experience: '20',
    languages: ['Français', 'Arabe', 'Anglais'],
    about: 'Spécialiste en néphrologie avec plus de 20 ans d\'expérience. Expert en maladies rénales chroniques et transplantation.'
  });

  const [officeData, setOfficeData] = useState({
    name: 'Cabinet Dr. Ben Salah',
    address: '45 Avenue Habib Bourguiba',
    city: 'Tunis',
    postalCode: '1001',
    phone: '+216 71 123 456',
    email: 'cabinet.bensalah@email.tn'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    cancelationAlerts: true,
    newPatientAlerts: true,
    reviewAlerts: false,
    marketingEmails: false
  });

  const sections = [
    { id: 'profile' as const, label: 'Profil Personnel', icon: <User className="w-5 h-5" /> },
    { id: 'professional' as const, label: 'Informations Professionnelles', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'office' as const, label: 'Cabinet/Clinique', icon: <Building className="w-5 h-5" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security' as const, label: 'Sécurité', icon: <Shield className="w-5 h-5" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Paramètres du Compte
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Gérez vos informations personnelles et professionnelles
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-sm ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {section.icon}
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Profil Personnel</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                </div>

                {/* Photo */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center text-rose-700 font-bold text-2xl">
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-white hover:bg-rose-700 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Photo de profil</h3>
                    <p className="text-sm text-gray-600 mt-1">JPG, PNG ou GIF (max. 5MB)</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    label="Prénom"
                    value={profileData.firstName}
                    onChange={(value) => setProfileData({ ...profileData, firstName: value })}
                    disabled={!isEditing}
                    icon={<User className="w-5 h-5" />}
                  />
                  <FormField
                    label="Nom"
                    value={profileData.lastName}
                    onChange={(value) => setProfileData({ ...profileData, lastName: value })}
                    disabled={!isEditing}
                    icon={<User className="w-5 h-5" />}
                  />
                  <FormField
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(value) => setProfileData({ ...profileData, email: value })}
                    disabled={!isEditing}
                    icon={<Mail className="w-5 h-5" />}
                  />
                  <FormField
                    label="Téléphone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(value) => setProfileData({ ...profileData, phone: value })}
                    disabled={!isEditing}
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <FormField
                    label="Date de naissance"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(value) => setProfileData({ ...profileData, dateOfBirth: value })}
                    disabled={!isEditing}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-600"
                    >
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 transition-colors flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Professional Section */}
            {activeSection === 'professional' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informations Professionnelles</h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    label="Spécialité"
                    value={professionalData.specialty}
                    onChange={(value) => setProfessionalData({ ...professionalData, specialty: value })}
                    icon={<Briefcase className="w-5 h-5" />}
                  />
                  <FormField
                    label="Sous-spécialité"
                    value={professionalData.subSpecialty}
                    onChange={(value) => setProfessionalData({ ...professionalData, subSpecialty: value })}
                  />
                  <FormField
                    label="Numéro de licence"
                    value={professionalData.license}
                    onChange={(value) => setProfessionalData({ ...professionalData, license: value })}
                    icon={<Shield className="w-5 h-5" />}
                  />
                  <FormField
                    label="Années d'expérience"
                    type="number"
                    value={professionalData.experience}
                    onChange={(value) => setProfessionalData({ ...professionalData, experience: value })}
                    icon={<Clock className="w-5 h-5" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Langues parlées</label>
                  <div className="flex flex-wrap gap-2">
                    {professionalData.languages.map((lang, index) => (
                      <span key={index} className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {lang}
                      </span>
                    ))}
                    <button className="px-3 py-1.5 border border-dashed border-gray-300 text-gray-600 rounded-full text-sm hover:border-rose-500 hover:text-rose-600 transition-colors">
                      + Ajouter
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">À propos</label>
                  <textarea
                    value={professionalData.about}
                    onChange={(e) => setProfessionalData({ ...professionalData, about: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Décrivez votre parcours et votre expertise..."
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* Office Section */}
            {activeSection === 'office' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Cabinet/Clinique</h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <FormField
                      label="Nom du cabinet"
                      value={officeData.name}
                      onChange={(value) => setOfficeData({ ...officeData, name: value })}
                      icon={<Building className="w-5 h-5" />}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FormField
                      label="Adresse"
                      value={officeData.address}
                      onChange={(value) => setOfficeData({ ...officeData, address: value })}
                      icon={<MapPin className="w-5 h-5" />}
                    />
                  </div>
                  <FormField
                    label="Ville"
                    value={officeData.city}
                    onChange={(value) => setOfficeData({ ...officeData, city: value })}
                  />
                  <FormField
                    label="Code postal"
                    value={officeData.postalCode}
                    onChange={(value) => setOfficeData({ ...officeData, postalCode: value })}
                  />
                  <FormField
                    label="Téléphone cabinet"
                    type="tel"
                    value={officeData.phone}
                    onChange={(value) => setOfficeData({ ...officeData, phone: value })}
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <FormField
                    label="Email cabinet"
                    type="email"
                    value={officeData.email}
                    onChange={(value) => setOfficeData({ ...officeData, email: value })}
                    icon={<Mail className="w-5 h-5" />}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Préférences de Notifications</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Canaux de notification</h3>
                    <ToggleField
                      label="Notifications par email"
                      description="Recevoir des notifications par email"
                      checked={notificationSettings.emailNotifications}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, emailNotifications: value })}
                    />
                    <ToggleField
                      label="Notifications par SMS"
                      description="Recevoir des notifications par SMS"
                      checked={notificationSettings.smsNotifications}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, smsNotifications: value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3">Types de notifications</h3>
                    <ToggleField
                      label="Rappels de rendez-vous"
                      description="Recevoir des rappels avant les rendez-vous"
                      checked={notificationSettings.appointmentReminders}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, appointmentReminders: value })}
                    />
                    <ToggleField
                      label="Alertes d'annulation"
                      description="Être notifié en cas d'annulation de rendez-vous"
                      checked={notificationSettings.cancelationAlerts}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, cancelationAlerts: value })}
                    />
                    <ToggleField
                      label="Nouveaux patients"
                      description="Être notifié des nouvelles inscriptions"
                      checked={notificationSettings.newPatientAlerts}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, newPatientAlerts: value })}
                    />
                    <ToggleField
                      label="Avis et évaluations"
                      description="Recevoir les nouveaux avis patients"
                      checked={notificationSettings.reviewAlerts}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, reviewAlerts: value })}
                    />
                    <ToggleField
                      label="Communications marketing"
                      description="Recevoir des nouvelles et mises à jour de Laura"
                      checked={notificationSettings.marketingEmails}
                      onChange={(value) => setNotificationSettings({ ...notificationSettings, marketingEmails: value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Sécurité et Confidentialité</h2>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                            placeholder="••••••••"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Authentification à deux facteurs</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Ajoutez une couche de sécurité supplémentaire à votre compte
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Activer
                      </button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Sessions actives</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Chrome - Windows</p>
                          <p className="text-sm text-gray-600">Tunis, Tunisia • Maintenant</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Actuelle
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  disabled = false,
  icon,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-600`}
        />
      </div>
    </div>
  );
}

function ToggleField({ 
  label, 
  description, 
  checked, 
  onChange 
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-rose-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}