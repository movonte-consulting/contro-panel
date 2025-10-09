import React, { useState } from 'react';
import { Settings, Key, User, Shield, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';

const SettingsPage: React.FC = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { profile } = useProfile();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-base text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              User Information
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Username</p>
                <p className="text-sm text-gray-600">{profile?.username || user?.username || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{profile?.email || user?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Role</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  (profile?.role || user?.role) === 'admin' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {(profile?.role || user?.role) || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Login</p>
                <p className="text-sm text-gray-600">
                  {profile?.lastLogin 
                    ? new Date(profile.lastLogin).toLocaleString() 
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Permissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              User Permissions
            </h2>
          </div>
          
          <div className="space-y-3">
            {profile?.permissions ? (
              Object.entries(profile.permissions).map(([permission, hasAccess]) => (
                <div key={permission} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {hasAccess ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-xs text-gray-500">
                        {hasAccess ? 'Access granted' : 'Access denied'}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    hasAccess 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {hasAccess ? 'Allowed' : 'Denied'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {profile?.role === 'admin' 
                    ? 'Admin users have full access to all features'
                    : 'No specific permissions configured'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Account Settings
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-500">Change your account password</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => {
          console.log('Password changed successfully');
        }}
      />
    </div>
  );
};

export default SettingsPage;
