import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useActivityContext } from '../contexts/ActivityContext';
import AssistantsList from './AssistantsList';
import RecentActivity from './RecentActivity';
import { UserServicesManager } from './UserServicesManager';

const Dashboard: React.FC = () => {
  const { profile } = useProfile();
  const { activities } = useActivityContext();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/favicons/favicon-32x32.png" 
            alt="Movonte Logo" 
            className="w-12 h-12 mr-4"
          />
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-lg text-gray-600">
          Welcome to Movonte Administration Panel
          {profile && ` - ${profile.username}`}
        </p>
      </div>

      {/* Main Content Grid - Improved Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Assistants List (2/3 width on large screens) */}
        <div className="xl:col-span-2">
          <AssistantsList />
        </div>
        
        {/* Right Column - Recent Activities (1/3 width on large screens) */}
        <div className="xl:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* User Services Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Custom Services</h2>
            <p className="text-gray-600">Create and manage your personalized AI services</p>
          </div>
        </div>
        <UserServicesManager />
      </div>

      {/* System Status - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Main Server</h3>
            <p className="text-sm text-gray-500">Operational</p>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Database</h3>
            <p className="text-sm text-gray-500">Connected</p>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-3"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Backup</h3>
            <p className="text-sm text-gray-500">In progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
