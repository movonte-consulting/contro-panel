import React from 'react';
import ServicesManagement from '../components/Management/ServicesManagement';
import TicketsManagement from '../components/Management/TicketsManagement';
import WebhooksManagement from '../components/Management/WebhooksManagement';

const ManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Management</h1>
        <p className="text-base text-gray-600 mt-1">
          Manage services, tickets, and webhooks configuration
        </p>
      </div>

   
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <div>
          <ServicesManagement />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <TicketsManagement />
        </div>
      
        <div>
          <WebhooksManagement />
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;

