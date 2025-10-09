import React from 'react';
import UserInstancesManager from './UserInstancesManager';

const UserInstancesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Instancias</h1>
          <p className="text-gray-600">
            Administra tus instancias personalizadas. Las instancias te permiten organizar y configurar 
            diferentes entornos o configuraciones según tus necesidades.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">¿Qué son las instancias?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Organización:</strong> Agrupa configuraciones relacionadas</li>
            <li>• <strong>Flexibilidad:</strong> Diferentes configuraciones para diferentes propósitos</li>
            <li>• <strong>Control:</strong> Activa o desactiva instancias según necesites</li>
            <li>• <strong>Personalización:</strong> Configuraciones específicas por instancia</li>
          </ul>
        </div>
      </div>

      <UserInstancesManager />
    </div>
  );
};

export default UserInstancesPage;


