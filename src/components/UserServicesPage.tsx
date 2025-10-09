import React from 'react';
import { Link } from 'react-router-dom';
import { UserServicesManager } from './UserServicesManager';
import { useUserServices } from '../hooks/useUserServices';
import { useUserInstances } from '../hooks/useUserInstances';
import { Bot, FolderOpen, Settings, Loader2, Server, ArrowRight } from 'lucide-react';

export const UserServicesPage: React.FC = () => {
  const { 
    isLoading, 
    totalAssistants, 
    totalProjects, 
    totalServices 
  } = useUserServices();
  
  const { instances, isLoading: instancesLoading } = useUserInstances();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your personalized services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Custom Services</h1>
              <p className="text-gray-600">Create and manage your personalized AI services using your own assistants and projects</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">My Assistants</p>
                <p className="text-2xl font-bold text-gray-900">{totalAssistants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">My Jira Projects</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Custom Services</p>
                <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Server className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">My Instances</p>
                <p className="text-2xl font-bold text-gray-900">
                  {instancesLoading ? '...' : instances.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-4">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Personalized AI Services</h3>
              <p className="text-blue-800 mb-3">
                Create custom AI services using your own OpenAI assistants and Jira projects. 
                Each service is completely isolated and uses your personal tokens and configurations.
              </p>
              <ul className="text-blue-800 space-y-1">
                <li>• Use your own OpenAI assistants for personalized responses</li>
                <li>• Connect to your Jira projects for project-specific assistance</li>
                <li>• Complete isolation between users - your data stays private</li>
                <li>• Test your services with real-time chat functionality</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instances Section */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="bg-orange-100 p-2 rounded-lg mr-4">
                <Server className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2">Organize with Instances</h3>
                <p className="text-orange-800 mb-3">
                  Create and manage instances to organize your configurations and services. 
                  Instances help you separate different environments or use cases.
                </p>
                <ul className="text-orange-800 space-y-1">
                  <li>• Organize configurations by environment (dev, staging, prod)</li>
                  <li>• Separate different use cases or projects</li>
                  <li>• Activate/deactivate instances as needed</li>
                  <li>• Custom settings per instance</li>
                </ul>
              </div>
            </div>
            <Link
              to="/dashboard/my-instances"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 ml-4"
            >
              <span>Manage Instances</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Services Manager */}
        <UserServicesManager />
      </div>
    </div>
  );
};

export default UserServicesPage;
