import React from 'react';
import ServicesManager from './ServicesManager';
import TicketsManager from './TicketsManager';
import WebhooksManager from './WebhooksManager';

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

      {/* Services Management */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <div>
          <ServicesManager />
        </div>
      </div>

      {/* Tickets and Webhooks Management */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tickets Manager */}
        <div>
          <TicketsManager />
        </div>
        
        {/* Webhooks Manager */}
        <div>
          <WebhooksManager />
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;

