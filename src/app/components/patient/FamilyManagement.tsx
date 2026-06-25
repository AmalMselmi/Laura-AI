import { 
  Users, Plus, Calendar, Syringe, FileText, ChevronRight,
  Baby, User, UserCircle, Heart
} from 'lucide-react';

export function FamilyManagement() {
  const familyMembers = [
    {
      id: '1',
      name: 'Yasmine Ben Salah',
      relationship: 'Fille',
      age: 8,
      birthDate: '2018-04-15',
      bloodType: 'O+',
      nextVaccine: '2026-04-15',
      nextCheckup: '2026-03-01',
      conditions: []
    },
    {
      id: '2',
      name: 'Adam Ben Salah',
      relationship: 'Fils',
      age: 5,
      birthDate: '2021-09-22',
      bloodType: 'A+',
      nextVaccine: '2026-09-22',
      nextCheckup: '2026-02-15',
      conditions: ['Asthme léger']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ma famille</h1>
          <p className="text-gray-600">Gérez la santé de tous les membres de votre famille</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>Ajouter un membre</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Heart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Carnet familial</h3>
          <p className="text-sm text-blue-700">
            Centralisez les dossiers médicaux de toute votre famille. Vous gardez le contrôle total sur les accès et les partages.
          </p>
        </div>
      </div>

      {/* Family Members Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {familyMembers.map((member) => (
          <FamilyMemberCard key={member.id} member={member} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<Syringe className="w-6 h-6 text-green-600" />}
            title="Calendrier vaccinal"
            description="Voir tous les vaccins à venir"
            color="green"
          />
          <QuickActionCard
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            title="Rendez-vous familiaux"
            description="Gérer les RDV de la famille"
            color="blue"
          />
          <QuickActionCard
            icon={<FileText className="w-6 h-6 text-purple-600" />}
            title="Documents partagés"
            description="Carnets de santé complets"
            color="purple"
          />
        </div>
      </div>

      {/* Vaccination Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Syringe className="w-6 h-6 text-green-600" />
          Prochaines vaccinations
        </h2>
        <div className="space-y-3">
          <VaccinationItem
            memberName="Yasmine Ben Salah"
            vaccine="Rappel DTP (Diphtérie-Tétanos-Polio)"
            date="2026-04-15"
            daysUntil={87}
          />
          <VaccinationItem
            memberName="Adam Ben Salah"
            vaccine="Vaccin contre la grippe saisonnière"
            date="2026-02-15"
            daysUntil={28}
          />
        </div>
      </div>
    </div>
  );
}

function FamilyMemberCard({ member }: { member: any }) {
  const getAgeDisplay = (birthDate: string, age: number) => {
    return `${age} ans`;
  };

  const calculateDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center">
            <Baby className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
            <p className="text-sm text-gray-600">{member.relationship} • {getAgeDisplay(member.birthDate, member.age)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Date de naissance</p>
          <p className="font-medium text-gray-900">
            {new Date(member.birthDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Groupe sanguin</p>
          <p className="font-medium text-gray-900">{member.bloodType}</p>
        </div>
      </div>

      {member.conditions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Conditions médicales</p>
          <div className="flex flex-wrap gap-2">
            {member.conditions.map((condition: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Prochain vaccin</span>
          <span className="font-medium text-gray-900">
            Dans {calculateDaysUntil(member.nextVaccine)} jours
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Prochain bilan</span>
          <span className="font-medium text-gray-900">
            Dans {calculateDaysUntil(member.nextCheckup)} jours
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Voir le dossier
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Modifier
        </button>
      </div>
    </div>
  );
}

function QuickActionCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}) {
  const colors = {
    green: 'bg-green-50 hover:border-green-300',
    blue: 'bg-blue-50 hover:border-blue-300',
    purple: 'bg-purple-50 hover:border-purple-300'
  };

  return (
    <button className={`${colors[color as keyof typeof colors]} border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all text-left`}>
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

function VaccinationItem({ 
  memberName, 
  vaccine, 
  date, 
  daysUntil 
}: { 
  memberName: string; 
  vaccine: string; 
  date: string; 
  daysUntil: number;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Syringe className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{memberName}</h3>
          <p className="text-sm text-gray-600">{vaccine}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">
          {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </p>
        <p className="text-xs text-gray-500">Dans {daysUntil} jours</p>
      </div>
    </div>
  );
}
