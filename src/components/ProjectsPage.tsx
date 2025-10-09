import React from 'react';
import ProjectsManager from './ProjectsManager';
import RemoteProjectsManager from './RemoteProjectsManager';

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
          <ProjectsManager />
        </div>
        
        {/* Remote Server Integration */}
        <div>
          <RemoteProjectsManager />
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;

