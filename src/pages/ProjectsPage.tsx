import React from 'react';
import ProjectsManagement from '../components/Projects/ProjectsManagement';
import RemoteProjectsManagement from '../components/Projects/RemoteProjectsManagement';

const ProjectsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-base text-gray-600 mt-1">
          Manage AI enabled projects and remote server integration
        </p>
      </div>

      {/* Projects Management */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* AI Enabled Projects */}
        <div>
          <ProjectsManagement />
        </div>
        
        {/* Remote Server Integration */}
        <div>
          <RemoteProjectsManagement />
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;

