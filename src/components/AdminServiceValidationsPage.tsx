import React from 'react';
import { AdminServiceValidations } from './AdminServiceValidations';

export const AdminServiceValidationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Validation Requests</h1>
        <p className="text-gray-600">Review and approve service creation requests from users</p>
      </div>
      
      <AdminServiceValidations />
    </div>
  );
};


