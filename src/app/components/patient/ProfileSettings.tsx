import { User } from '../../App';
import { 
  User as UserIcon, Mail, Phone, MapPin, Calendar, Shield,
  Bell, Globe, Lock, Eye, Download, Trash2
} from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">Gérez votre profil et vos préférences</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-blue-600" />
          Informations personnelles
        </h2>
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 text-3xl font-semibold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-2">
              Changer la photo
            </button>
            <p className="text-sm text-gray-500">JPG, PNG ou GIF. Taille max 2MB.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label="Nom complet"
            value={user.name}
            icon={<UserIcon className="w-5 h-5 text-gray-400" />}
          />
          <FormField
            label="Email"
            value={user.email}
            icon={<Mail className="w-5 h-5 text-gray-400" />}
          />
          <FormField
            label="Téléphone"
            value="+216 98 765 432"
            icon={<Phone className="w-5 h-5 text-gray-400" />}
          />
          <FormField
            label="Date de naissance"
            value="15 Mars 1985"
            icon={<Calendar className="w-5 h-5 text-gray-400" />}
          />
          <FormField
            label="Adresse"
            value="12 Avenue Habib Bourguiba, Tunis"
            icon={<MapPin className="w-5 h-5 text-gray-400" />}
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-600" />
          Sécurité et confidentialité
        </h2>
        <div className="space-y-4">
          <SettingItem
            icon={<Lock className="w-5 h-5" />}
            title="Mot de passe"
            description="Dernière modification il y a 3 mois"
            action="Modifier"
          />
          <SettingItem
            icon={<Shield className="w-5 h-5" />}
            title="Authentification à deux facteurs"
            description="Ajoutez une couche de sécurité supplémentaire"
            action="Activer"
          />
          <SettingItem
            icon={<Eye className="w-5 h-5" />}
            title="Historique d'accès"
            description="Voir qui a accédé à votre dossier médical"
            action="Voir"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Bell className="w-6 h-6 text-purple-600" />
          Notifications
        </h2>
        <div className="space-y-4">
          <ToggleSetting
            label="Rappels de rendez-vous"
            description="Recevoir une notification 24h avant chaque rendez-vous"
            enabled={true}
          />
          <ToggleSetting
            label="Résultats d'examens"
            description="Être notifié quand de nouveaux résultats sont disponibles"
            enabled={true}
          />
          <ToggleSetting
            label="Vaccinations"
            description="Rappels pour les vaccins à venir"
            enabled={true}
          />
          <ToggleSetting
            label="Newsletter santé"
            description="Conseils et actualités médicales"
            enabled={false}
          />
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          Langue et région
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Français</option>
              <option>العربية (Arabe)</option>
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>UTC+1 (Tunis)</option>
              <option>UTC+0 (Londres)</option>
              <option>UTC+2 (Le Caire)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des données</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Exporter mes données</p>
                <p className="text-sm text-gray-600">Télécharger une copie de votre dossier médical</p>
              </div>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Supprimer mon compte</p>
                <p className="text-sm text-red-700">Cette action est irréversible</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ 
  label, 
  value, 
  icon, 
  fullWidth = false 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </div>
        <input
          type="text"
          value={value}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
      </div>
    </div>
  );
}

function SettingItem({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        {action}
      </button>
    </div>
  );
}

function ToggleSetting({ 
  label, 
  description, 
  enabled 
}: { 
  label: string; 
  description: string; 
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
