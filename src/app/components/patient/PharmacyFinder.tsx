import { useState } from 'react';
import { 
  MapPin, Search, Navigation, Clock, Phone, AlertCircle,
  Pill, Calendar, Map
} from 'lucide-react';

export function PharmacyFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchType, setSearchType] = useState<'pharmacy' | 'medication'>('pharmacy');
  const [useGeolocation, setUseGeolocation] = useState(false);

  // Données pharmacies de garde (source: med.tn)
  const pharmacies = [
    {
      id: '1',
      name: 'Pharmacie Centrale',
      address: '45 Avenue Habib Bourguiba',
      city: 'Tunis',
      phone: '+216 71 234 567',
      isOpen: true,
      openingHours: '08:00 - 20:00',
      onDuty: true,
      lat: 36.8065,
      lng: 10.1815
    },
    {
      id: '2',
      name: 'Pharmacie El Manar',
      address: '12 Rue de la République',
      city: 'Tunis',
      phone: '+216 71 345 678',
      isOpen: true,
      openingHours: '08:30 - 19:30',
      onDuty: false,
      lat: 36.8480,
      lng: 10.1906
    },
    {
      id: '3',
      name: 'Pharmacie Sousse Centre',
      address: '23 Avenue Mohamed Ali',
      city: 'Sousse',
      phone: '+216 73 123 456',
      isOpen: true,
      openingHours: '08:00 - 21:00',
      onDuty: true,
      lat: 35.8256,
      lng: 10.6369
    },
    {
      id: '4',
      name: 'Pharmacie Sfax Principale',
      address: '67 Rue Hedi Chaker',
      city: 'Sfax',
      phone: '+216 74 234 567',
      isOpen: false,
      openingHours: '08:00 - 19:00',
      onDuty: false,
      lat: 34.7406,
      lng: 10.7603
    }
  ];

  // Données médicaments (source: med.tn)
  const medications = [
    {
      id: '1',
      name: 'Doliprane 1000mg',
      dci: 'Paracétamol',
      laboratory: 'Sanofi',
      form: 'Comprimé',
      dosage: '1000mg',
      packaging: 'Boîte de 8 comprimés',
      price: 3.5,
      refundable: true,
      refundRate: 70,
      prescription: false
    },
    {
      id: '2',
      name: 'Ramipril 5mg',
      dci: 'Ramipril',
      laboratory: 'Pfizer',
      form: 'Comprimé',
      dosage: '5mg',
      packaging: 'Boîte de 30 comprimés',
      price: 12.8,
      refundable: true,
      refundRate: 85,
      prescription: true
    },
    {
      id: '3',
      name: 'Aspirine 100mg',
      dci: 'Acide acétylsalicylique',
      laboratory: 'Bayer',
      form: 'Comprimé',
      dosage: '100mg',
      packaging: 'Boîte de 30 comprimés',
      price: 4.2,
      refundable: true,
      refundRate: 70,
      prescription: false
    },
    {
      id: '4',
      name: 'Augmentin 1g',
      dci: 'Amoxicilline + Acide clavulanique',
      laboratory: 'GSK',
      form: 'Comprimé pelliculé',
      dosage: '1g/125mg',
      packaging: 'Boîte de 12 comprimés',
      price: 18.5,
      refundable: true,
      refundRate: 100,
      prescription: true
    }
  ];

  const cities = ['Tunis', 'Sousse', 'Sfax', 'Ariana', 'Monastir', 'Nabeul', 'Bizerte'];

  const handleGeolocation = () => {
    setUseGeolocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Position:', position.coords.latitude, position.coords.longitude);
          // Simuler une recherche basée sur la géolocalisation
          alert(`Recherche de pharmacies près de vous...\nLat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          alert('Erreur d\'accès à la géolocalisation. Veuillez autoriser l\'accès à votre position.');
          setUseGeolocation(false);
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      setUseGeolocation(false);
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => 
    (!selectedCity || pharmacy.city === selectedCity) &&
    (!searchQuery || pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMedications = medications.filter(med =>
    !searchQuery || 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.dci.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.laboratory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
          Pharmacies & Médicaments
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Trouvez les pharmacies de garde et recherchez vos médicaments
        </p>
      </div>

      {/* Search Type Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setSearchType('pharmacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            searchType === 'pharmacy' 
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Pharmacies</span>
        </button>
        <button
          onClick={() => setSearchType('medication')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            searchType === 'medication' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Médicaments</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === 'pharmacy' 
                  ? 'Rechercher une pharmacie par nom ou adresse...'
                  : 'Rechercher un médicament par nom ou DCI...'
              }
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Pharmacy Filters */}
          {searchType === 'pharmacy' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <button
                  onClick={handleGeolocation}
                  disabled={useGeolocation}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Navigation className="w-5 h-5" />
                  <span>
                    {useGeolocation ? 'Géolocalisation active...' : 'Utiliser ma position'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {searchType === 'pharmacy' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pharmacies ({filteredPharmacies.length})
            </h2>
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
              <Map className="w-4 h-4" />
              Voir sur la carte
            </button>
          </div>

          {/* Pharmacies de garde highlight */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Pharmacies de garde aujourd'hui</h3>
                <p className="text-sm text-green-800">
                  {filteredPharmacies.filter(p => p.onDuty).length} pharmacie(s) de garde disponible(s)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </div>

          {filteredPharmacies.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune pharmacie trouvée</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Médicaments ({filteredMedications.length})
          </h2>
          <div className="space-y-4">
            {filteredMedications.map((medication) => (
              <MedicationCard key={medication.id} medication={medication} />
            ))}
          </div>

          {filteredMedications.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun médicament trouvé</h3>
              <p className="text-gray-600">Essayez de modifier votre recherche</p>
            </div>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Source des données :</strong> Les informations sont issues de{' '}
          <a href="https://www.med.tn" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">
            Med.tn
          </a>
          {' '}et sont mises à jour régulièrement. Pour toute urgence médicale, contactez le 190 (SAMU).
        </p>
      </div>
    </div>
  );
}

function PharmacyCard({ pharmacy }: { pharmacy: any }) {
  return (
    <div className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all ${
      pharmacy.onDuty ? 'border-green-500 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{pharmacy.name}</h3>
            {pharmacy.onDuty && (
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                DE GARDE
              </span>
            )}
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{pharmacy.address}, {pharmacy.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${pharmacy.phone}`} className="text-blue-600 hover:text-blue-700">
                {pharmacy.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{pharmacy.openingHours}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                pharmacy.isOpen 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {pharmacy.isOpen ? 'Ouverte' : 'Fermée'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Itinéraire
        </button>
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Appeler
        </button>
      </div>
    </div>
  );
}

function MedicationCard({ medication }: { medication: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{medication.name}</h3>
            {medication.prescription && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                Sur ordonnance
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            <strong>DCI:</strong> {medication.dci} • <strong>Laboratoire:</strong> {medication.laboratory}
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Forme: {medication.form}</p>
              <p className="text-gray-600">Dosage: {medication.dosage}</p>
              <p className="text-gray-600">Conditionnement: {medication.packaging}</p>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-lg mb-1">
                {medication.price.toFixed(2)} TND
              </p>
              {medication.refundable && (
                <p className="text-green-600 text-sm">
                  ✓ Remboursable CNAM {medication.refundRate}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
          Localiser en pharmacie
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Plus d'infos
        </button>
      </div>
    </div>
  );
}
