import React, { useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS } from '../config/api';
import { ChevronRight, X } from 'lucide-react';

interface Organization {
  name: string;
  logo: string | null;
  users: { id: number; username: string; email: string; role: string; isActive: boolean }[];
}

const fallbackLogo = '/favicons/favicon-32x32.png';

const OrganizationsAdmin: React.FC = () => {
  const { get } = useApi();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Organization | null>(null);

  useEffect(() => {
    // Esperar a que la autenticación termine de cargar antes de hacer la llamada
    if (authLoading) {
      return;
    }

    // Solo hacer la llamada si el usuario está autenticado
    if (!isAuthenticated) {
      setError('No autenticado. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await get<{ organizations: Organization[] }>(API_ENDPOINTS.ADMIN_ORGANIZATIONS);
        if (resp.success && resp.data) {
          setOrganizations(resp.data.organizations);
        } else {
          setError(resp.error || 'Error loading organizations');
        }
      } catch (e) {
        setError('Connection error loading organizations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [get, isAuthenticated, authLoading]);

  const sorted = useMemo(() => {
    return [...organizations].sort((a, b) => a.name.localeCompare(b.name));
  }, [organizations]);

  return (
    <div className="relative">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
        <p className="text-gray-600">Select an organization to view its users</p>
      </div>

      {loading && <div className="text-gray-600">Loading organizations...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map(org => (
            <button
              key={org.name}
              onClick={() => setSelected(org)}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3">
                <img src={org.logo || fallbackLogo} alt={org.name} className="w-10 h-10 rounded bg-white object-contain" />
                <div className="text-left">
                  <div className="text-gray-900 font-medium truncate max-w-[12rem]">{org.name}</div>
                  <div className="text-xs text-gray-500">{org.users.length} users</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {/* Slide panel */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[28rem] bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img src={selected.logo || fallbackLogo} alt={selected.name} className="w-10 h-10 rounded bg-white object-contain" />
                <h2 className="text-xl font-semibold text-gray-900">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2">
              {selected.users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{u.username}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {u.role}{u.isActive ? '' : ' • inactive'}
                  </div>
                </div>
              ))}
              {selected.users.length === 0 && (
                <div className="text-gray-500 text-sm">No users found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsAdmin;


