import React, { useState, useMemo } from 'react';
import { Loader2, Ticket, CheckCircle, AlertCircle, Search, FolderKanban, X } from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import { useProjects } from '../hooks/useProjects';

const TicketsManager: React.FC = () => {
  const { disabledTickets, isLoading, error, disableTicket, enableTicket, checkTicketStatus } = useTickets();
  const { projects } = useProjects();
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchIssueKey, setSearchIssueKey] = useState('');
  const [ticketStatus, setTicketStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'projects'>('projects');

  const handleDisableTicket = async (issueKey: string) => {
    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await disableTicket(issueKey, 'Manual disable');
      if (success) {
        setSuccessMessage(`AI Assistant disabled for ticket ${issueKey}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error disabling assistant');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error disabling assistant');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEnableTicket = async (issueKey: string) => {
    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await enableTicket(issueKey);
      if (success) {
        setSuccessMessage(`AI Assistant enabled for ticket ${issueKey}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error enabling assistant');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error enabling assistant');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!searchIssueKey.trim()) {
      setErrorMessage('Please enter a ticket key');
      return;
    }

    setIsCheckingStatus(true);
    setErrorMessage('');
    setSuccessMessage('');
    setTicketStatus(null);

    try {
      const status = await checkTicketStatus(searchIssueKey.trim());
      if (status) {
        setTicketStatus(status);
        const statusText = status.isDisabled ? 'DISABLED' : 'ENABLED';
        const reason = status.ticketInfo?.reason || 'No reason provided';
        const disabledAt = status.ticketInfo?.disabledAt ? 
          new Date(status.ticketInfo.disabledAt).toLocaleString() : 'Unknown';
        
        let message = `Ticket ${searchIssueKey} status: ${statusText}`;
        if (status.isDisabled) {
          message += `\nReason: ${reason}\nDisabled at: ${disabledAt}`;
        }
        
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage('Error checking ticket status');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error checking status');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Agrupar tickets por proyecto
  const ticketsByProject = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    disabledTickets.forEach(ticket => {
      // Extraer el prefijo del proyecto del ticket key (ej: "TI-123" -> "TI")
      const projectKey = ticket.issueKey.split('-')[0];
      if (!grouped[projectKey]) {
        grouped[projectKey] = [];
      }
      grouped[projectKey].push(ticket);
    });
    
    return grouped;
  }, [disabledTickets]);

  // Filtrar tickets según proyecto seleccionado
  const filteredTickets = useMemo(() => {
    if (selectedProject === 'all') {
      return disabledTickets;
    }
    return disabledTickets.filter(ticket => ticket.issueKey.startsWith(selectedProject + '-'));
  }, [disabledTickets, selectedProject]);

  // Obtener estadísticas por proyecto
  const projectStats = useMemo(() => {
    const stats: Record<string, {projectName: string, count: number, projectKey: string}> = {};
    
    Object.keys(ticketsByProject).forEach(projectKey => {
      const project = projects.find(p => p.key === projectKey);
      stats[projectKey] = {
        projectName: project?.name || projectKey,
        count: ticketsByProject[projectKey].length,
        projectKey
      };
    });
    
    return stats;
  }, [ticketsByProject, projects]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Loading disabled tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative p-6">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-orange-600" />
            Tickets Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage AI assistant for specific tickets across projects
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('projects')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              viewMode === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            By Project
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            All Tickets
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          <span className="whitespace-pre-line">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {errorMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Verificar estado de ticket */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Check Ticket Status</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchIssueKey}
              onChange={(e) => setSearchIssueKey(e.target.value)}
              placeholder="e.g., TI-123"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleCheckStatus}
              disabled={isCheckingStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isCheckingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Status Result */}
          {ticketStatus && (
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Ticket: {ticketStatus.issueKey}</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    ticketStatus.isDisabled 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {ticketStatus.isDisabled ? 'DISABLED' : 'ENABLED'}
                  </span>
                </div>
                <button
                  onClick={() => ticketStatus.isDisabled ? handleEnableTicket(ticketStatus.issueKey) : handleDisableTicket(ticketStatus.issueKey)}
                  disabled={isUpdating}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    ticketStatus.isDisabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {ticketStatus.isDisabled ? 'Enable' : 'Disable'}
                </button>
              </div>
              {ticketStatus.ticketInfo && (
                <div className="mt-2 text-xs text-gray-600">
                  <p>Reason: {ticketStatus.ticketInfo.reason}</p>
                  <p>Disabled by: {ticketStatus.ticketInfo.disabledBy}</p>
                  <p>Date: {new Date(ticketStatus.ticketInfo.disabledAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vista por Proyectos */}
        {viewMode === 'projects' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Disabled Tickets by Project
              </h3>
              {selectedProject !== 'all' && (
                <button
                  onClick={() => setSelectedProject('all')}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear Filter
                </button>
              )}
            </div>

            {/* Project Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedProject('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedProject === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Projects ({disabledTickets.length})
              </button>
              {Object.values(projectStats).map((stat) => (
                <button
                  key={stat.projectKey}
                  onClick={() => setSelectedProject(stat.projectKey)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedProject === stat.projectKey
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-semibold">{stat.projectKey}</span>
                  {' '}- {stat.projectName} ({stat.count})
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            {selectedProject === 'all' && Object.keys(ticketsByProject).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(projectStats).map(([projectKey, stat]) => (
                  <div
                    key={projectKey}
                    className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedProject(projectKey)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">{projectKey}</h4>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                        {stat.count}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{stat.projectName}</p>
                    <div className="text-xs text-gray-500">
                      {stat.count} ticket{stat.count !== 1 ? 's' : ''} with AI disabled
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedProject === 'all' ? (
              <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No disabled tickets</p>
                <p className="text-sm mt-1">All tickets have AI assistant enabled</p>
              </div>
            ) : (
              // Tickets del proyecto seleccionado
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <FolderKanban className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-gray-900">
                    {projectStats[selectedProject]?.projectName || selectedProject}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({filteredTickets.length} disabled tickets)
                  </span>
                </div>
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.issueKey}
                    className="p-3 rounded-lg border border-red-200 bg-red-50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {ticket.issueKey}
                          </h4>
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            DISABLED
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <p>Reason: {ticket.reason}</p>
                          <p>Disabled by: {ticket.disabledBy}</p>
                          <p>Date: {new Date(ticket.disabledAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleEnableTicket(ticket.issueKey)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Vista de Lista Completa */
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              All Disabled Tickets ({disabledTickets.length})
            </h3>
            <div className="space-y-2">
              {disabledTickets.length === 0 ? (
                <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                  <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No disabled tickets</p>
                  <p className="text-sm mt-1">All tickets have AI assistant enabled</p>
                </div>
              ) : (
                disabledTickets.map((ticket) => (
                  <div
                    key={ticket.issueKey}
                    className="p-3 rounded-lg border border-red-200 bg-red-50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded mr-2">
                            {ticket.issueKey.split('-')[0]}
                          </span>
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {ticket.issueKey}
                          </h4>
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            DISABLED
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <p>Reason: {ticket.reason}</p>
                          <p>Disabled by: {ticket.disabledBy}</p>
                          <p>Date: {new Date(ticket.disabledAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleEnableTicket(ticket.issueKey)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsManager;
