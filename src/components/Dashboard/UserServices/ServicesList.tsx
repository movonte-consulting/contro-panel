import React from 'react';
import { Bot, Calendar, MessageSquare, Settings, CheckCircle, Power, Trash2, AlertCircle } from 'lucide-react';
import type { UserService } from '../../../hooks/useUserServices';
interface ServicesListProps {
  services: UserService[];
  onTestService: (serviceId: string, serviceName: string) => void;
  onConfigureProject: (service: UserService) => void;
  onViewEndpoints: (service: UserService) => void;
  onToggleService: (serviceId: string, isActive: boolean) => void;
  onDeleteService: (serviceId: string, serviceName: string) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  onTestService,
  onConfigureProject,
  onViewEndpoints,
  onToggleService,
  onDeleteService
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <div key={service.serviceId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
              <p className="text-sm text-gray-600">ID: {service.serviceId}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              service.approvalStatus === 'approved' && service.isActive
                ? 'bg-green-100 text-green-800' 
                : service.approvalStatus === 'approved'
                  ? 'bg-blue-100 text-blue-800'
                  : service.approvalStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
            }`}>
              {service.approvalStatus === 'approved' && service.isActive
                ? 'Active' 
                : service.approvalStatus === 'approved'
                  ? 'Approved (Inactive)'
                  : service.approvalStatus === 'rejected'
                    ? 'Rejected'
                    : 'Pending Approval'
              }
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Bot className="w-4 h-4 mr-2" />
              <span className="truncate">{service.assistantName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Updated: {new Date(service.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>

          {service.approvalStatus === 'approved' ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onTestService(service.serviceId, service.serviceName)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                title="Test service"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Test
              </button>
              
              <button
                onClick={() => onConfigureProject(service)}
                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center"
                title="Configure Jira project"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onViewEndpoints(service)}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center"
                title="View endpoints and protected token"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onToggleService(service.serviceId, service.isActive)}
                className={`px-3 py-2 rounded text-sm flex items-center ${
                  service.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title={service.isActive ? 'Desactivar servicio' : 'Activar servicio'}
              >
                <Power className={`w-4 h-4 ${service.isActive ? '' : 'opacity-75'}`} />
              </button>
              
              <button
                onClick={() => onDeleteService(service.serviceId, service.serviceName)}
                className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center"
                title="Delete service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="px-3 py-2 rounded text-sm bg-yellow-100 text-yellow-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-xs">
                {service.approvalStatus === 'rejected' 
                  ? 'Service has been rejected' 
                  : 'Waiting for admin approval'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServicesList;