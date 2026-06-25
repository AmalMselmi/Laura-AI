import { useNavigate } from 'react-router';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🏥</span>
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-rose-500 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page introuvable</h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            ← Retour
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium shadow-md"
          >
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
