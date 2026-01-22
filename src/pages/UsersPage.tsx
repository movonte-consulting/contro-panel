import React from 'react';
import UsersManagement from '../components/Users/UsersManagement';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-base text-gray-600 mt-1">
          Manage system users, roles, and permissions
        </p>
      </div>

      {/* User Management */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <div>
          <UsersManagement />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

