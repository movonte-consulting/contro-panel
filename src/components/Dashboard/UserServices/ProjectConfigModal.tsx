import React, { useState, useEffect } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { API_ENDPOINTS } from '../../../config/api';

interface ProjectConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  currentProjectKey?: string;
  projects: Array<{ key: string; name: string }>;
  initialStatuses?: string[];
  initialDisabledTickets?: string[];
  onSave: (serviceId: string, projectKey: string, statuses: string[], disabledTickets: string[]) => Promise<void>;
}

const ProjectConfigModal: React.FC<ProjectConfigModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  currentProjectKey = '',
  projects,
  initialStatuses = [],
  initialDisabledTickets = [],
  onSave
}) => {
  const { get } = useApi();
  const [selectedProjectKey, setSelectedProjectKey] = useState(currentProjectKey);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatuses);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [disabledTicketsList, setDisabledTicketsList] = useState<string[]>(initialDisabledTickets);
  const [newTicketKey, setNewTicketKey] = useState('');

  useEffect(() => {
    setSelectedProjectKey(currentProjectKey);
    setSelectedStatuses(initialStatuses);
    setDisabledTicketsList(initialDisabledTickets);
  }, [currentProjectKey, initialStatuses, initialDisabledTickets]);

  useEffect(() => {
    const loadStatuses = async () => {
      if (!isOpen) return;
      setIsLoadingStatuses(true);
      try {
        let response = await get(API_ENDPOINTS.USER_STATUSES_AVAILABLE);
        if (!response?.success || !response?.data) {
          response = await get((API_ENDPOINTS as any).STATUSES_AVAILABLE || API_ENDPOINTS.USER_STATUSES_AVAILABLE);
        }
        if (response?.success && response?.data) {
          const statuses: string[] = Array.isArray(response.data)
            ? response.data.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
            : [];
          setAvailableStatuses(statuses);
        } else {
          setAvailableStatuses([]);
        }
      } catch (e) {
        setAvailableStatuses([]);
      } finally {
        setIsLoadingStatuses(false);
      }
    };
    loadStatuses();
  }, [isOpen, get]);

  const handleAddDisabledTicket = () => {
    if (!newTicketKey.trim()) return;
    const ticketKey = newTicketKey.trim().toUpperCase();
    if (!disabledTicketsList.includes(ticketKey)) {
      setDisabledTicketsList(prev => [...prev, ticketKey]);
      setNewTicketKey('');
    }
  };

  const handleRemoveDisabledTicket = (ticketKey: string) => {
    setDisabledTicketsList(prev => prev.filter(k => k !== ticketKey));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configure Jira Project & Ticket States
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the Jira project for service: <strong>{serviceName}</strong>
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Project: {currentProjectKey || 'Not configured'}
          </label>
          <select
            value={selectedProjectKey}
            onChange={(e) => setSelectedProjectKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a project...</option>
            {projects.map(project => (
              <option key={project.key} value={project.key}>
                {project.name} ({project.key})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ticket statuses to ignore (IA will omit responses)
          </label>
          {isLoadingStatuses ? (
            <div className="text-sm text-gray-500 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Loading statuses...</div>
          ) : availableStatuses.length === 0 ? (
            <div className="text-sm text-gray-500">No statuses available</div>
          ) : (
            <div className="max-h-48 overflow-auto border rounded p-2 space-y-2">
              {availableStatuses.map((status) => {
                const id = `status_${status.replace(/\s+/g, '_')}`;
                const checked = selectedStatuses.includes(status);
                return (
                  <label key={id} htmlFor={id} className="flex items-center space-x-2 text-sm">
                    <input
                      id={id}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatuses(prev => Array.from(new Set([...prev, status])));
                        } else {
                          setSelectedStatuses(prev => prev.filter(s => s !== status));
                        }
                      }}
                    />
                    <span>{status}</span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">When a ticket is in any of these states, the AI will not respond for this service.</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Disabled Tickets (AI will omit responses)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTicketKey}
              onChange={(e) => setNewTicketKey(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDisabledTicket()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., TI-123"
            />
            <button
              onClick={handleAddDisabledTicket}
              disabled={!newTicketKey.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          {disabledTicketsList.length > 0 ? (
            <div className="max-h-32 overflow-auto border rounded p-2 space-y-1">
              {disabledTicketsList.map((ticketKey) => (
                <div key={ticketKey} className="flex items-center justify-between bg-red-50 border border-red-200 rounded px-2 py-1">
                  <span className="text-sm font-medium text-gray-900">{ticketKey}</span>
                  <button
                    onClick={() => handleRemoveDisabledTicket(ticketKey)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Remove ticket"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2 border rounded bg-gray-50">
              No disabled tickets
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Specific tickets that will be ignored by the AI for this service.</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(serviceId, selectedProjectKey, selectedStatuses, disabledTicketsList)}
            disabled={!selectedProjectKey}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectConfigModal;