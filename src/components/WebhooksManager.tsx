import React, { useState, useEffect } from 'react';
import { Loader2, Webhook, CheckCircle, XCircle, AlertCircle, Play, Save, Trash2, Plus, Filter } from 'lucide-react';
import { useWebhooks } from '../hooks/useWebhooks';
import { useAssistants } from '../hooks/useAssistants';

const WebhooksManager: React.FC = () => {
  const { 
    webhookStatus, 
    savedWebhooks, 
    isLoading, 
    error, 
    configureWebhook, 
    testWebhook, 
    disableWebhook, 
    setWebhookFilter,
    saveWebhook,
    deleteWebhook
  } = useWebhooks();
  
  const { assistants } = useAssistants();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para configuración de webhook
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [selectedSavedWebhook, setSelectedSavedWebhook] = useState('');
  
  // Estados para filtros
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [showFilterConfig, setShowFilterConfig] = useState(false);
  
  // Estados para webhook guardado
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookDescription, setNewWebhookDescription] = useState('');
  const [showNewWebhookFields, setShowNewWebhookFields] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  
  // Estados para test
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Actualizar estados cuando cambie webhookStatus
  useEffect(() => {
    if (webhookStatus) {
      setWebhookUrl(webhookStatus.webhookUrl || '');
      setSelectedAssistant((webhookStatus as any).assistantId || '');
      setFilterEnabled((webhookStatus as any).filter?.filterEnabled || false);
    }
  }, [webhookStatus]);

  const handleConfigureWebhook = async () => {
    if (!webhookUrl) {
      setErrorMessage('Please enter a webhook URL');
      return;
    }

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await configureWebhook(webhookUrl, selectedAssistant || '');
      if (success) {
        setSuccessMessage('Webhook configuration saved successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error saving webhook');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error saving webhook');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    setErrorMessage('');
    setTestResult(null);

    try {
      const result = await testWebhook();
      if (result) {
        setTestResult(result);
        setSuccessMessage('Webhook test successful');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Webhook test failed');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Webhook test failed');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisableWebhook = async () => {
    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await disableWebhook();
      if (success) {
        setSuccessMessage('Webhook disabled successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error disabling webhook');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error disabling webhook');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveWebhookFilter = async () => {
    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await setWebhookFilter(filterEnabled, 'response_value', 'Yes');
      if (success) {
        const statusMessage = filterEnabled 
          ? 'Webhook filter enabled - only sends webhook when Escalate agent determines human intervention is needed'
          : 'Webhook filter disabled - all webhooks will be sent';
        setSuccessMessage(statusMessage);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage('Error saving webhook filter');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error saving webhook filter');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveWebhook = async () => {
    if (!newWebhookName || !webhookUrl) {
      setErrorMessage('Name and URL are required');
      return;
    }

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await saveWebhook(newWebhookName, webhookUrl, newWebhookDescription);
      if (success) {
        setSuccessMessage('Webhook saved successfully');
        clearWebhookForm();
        handleHideNewWebhookFields();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error saving webhook');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error saving webhook');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!selectedSavedWebhook) {
      setErrorMessage('Please select a webhook to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete this saved webhook?')) {
      return;
    }

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const success = await deleteWebhook(parseInt(selectedSavedWebhook));
      if (success) {
        setSuccessMessage('Webhook deleted successfully');
        clearWebhookForm();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Error deleting webhook');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Error deleting webhook');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavedWebhookChange = (webhookId: string) => {
    setSelectedSavedWebhook(webhookId);
    
    if (webhookId) {
      const webhook = savedWebhooks.find(w => w.id.toString() === webhookId);
      if (webhook) {
        setWebhookUrl(webhook.url);
        setNewWebhookName(webhook.name);
        setNewWebhookDescription(webhook.description || '');
        setShowDeleteButton(true);
        handleHideNewWebhookFields();
      }
    } else {
      clearWebhookForm();
    }
  };

  const handleShowNewWebhookFields = () => {
    setShowNewWebhookFields(true);
  };

  const handleHideNewWebhookFields = () => {
    setShowNewWebhookFields(false);
  };

  const clearWebhookForm = () => {
    setWebhookUrl('');
    setNewWebhookName('');
    setNewWebhookDescription('');
    setSelectedSavedWebhook('');
    setShowDeleteButton(false);
  };

  const toggleWebhookFilterConfig = () => {
    setShowFilterConfig(filterEnabled);
  };

  useEffect(() => {
    toggleWebhookFilterConfig();
  }, [filterEnabled]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Loading webhook configuration...</p>
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
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Webhook className="w-5 h-5 mr-2 text-green-600" />
          Webhook Configuration
        </h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">Configure webhook integrations to send AI responses to external systems</p>

      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {errorMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Select Saved Webhook */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Saved Webhook</label>
          <select 
            value={selectedSavedWebhook}
            onChange={(e) => handleSavedWebhookChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a saved webhook...</option>
            {savedWebhooks.map((webhook) => (
              <option key={webhook.id} value={webhook.id.toString()}>
                {webhook.name} - {webhook.url.substring(0, 50)}...
              </option>
            ))}
          </select>
          <small className="text-gray-500 text-xs mt-1">Select from previously saved webhook URLs</small>
        </div>

        {/* Webhook URL */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Jira Automation Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://api-private.atlassian.com/automation/webhooks/jira/a/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <small className="text-gray-500 text-xs mt-1">URL del webhook de Jira Automation (formato: api-private.atlassian.com/automation/webhooks/...)</small>
        </div>

        {/* New Webhook Fields */}
        {showNewWebhookFields && (
          <>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Name (for saving)</label>
              <input
                type="text"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="e.g., Jira Production Webhook"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <small className="text-gray-500 text-xs mt-1">Give this webhook a name to save it for future use</small>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={newWebhookDescription}
                onChange={(e) => setNewWebhookDescription(e.target.value)}
                placeholder="Brief description of this webhook..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* Webhook Assistant */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Assistant</label>
          <select
            value={selectedAssistant}
            onChange={(e) => setSelectedAssistant(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an assistant for webhook flow...</option>
            {assistants.map((assistant) => (
              <option key={assistant.id} value={assistant.id}>
                {assistant.name || `Assistant ${assistant.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Webhook Filter Configuration */}
        <div className="form-group">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="webhookFilterEnabled"
              checked={filterEnabled}
              onChange={(e) => setFilterEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="webhookFilterEnabled" className="ml-2 block text-sm font-medium text-gray-700">
              <strong>Enable Webhook Filter</strong>
            </label>
          </div>
          <small className="text-gray-500 text-xs mt-1">Enable/disable the webhook filtering function. The actual filtering logic is handled by the parallel assistant (Escalate agent).</small>
        </div>

        {/* Filter Configuration */}
        {showFilterConfig && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <strong className="text-blue-800">Filter Information:</strong>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• The <strong>Escalate agent</strong> analyzes each conversation and responds with JSON: <code className="bg-blue-100 px-1 rounded">{'{"value": "Yes/No", "reason": "...", "confidence": 0.95}'}</code></li>
                  <li>• If <strong>value = "Yes"</strong>: Webhook is sent (human intervention needed)</li>
                  <li>• If <strong>value = "No"</strong>: Webhook is blocked (AI can handle it)</li>
                  <li>• This filter only enables/disables the filtering function</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Condition</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
                >
                  <option value="response_value">Response Value (Auto-detected)</option>
                </select>
                <small className="text-gray-500 text-xs mt-1">Automatically detects Yes/No from Escalate agent response</small>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Value</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
                >
                  <option value="Yes">Yes (Send webhook when escalation needed)</option>
                  <option value="No">No (Never send webhook)</option>
                </select>
                <small className="text-gray-500 text-xs mt-1">Currently set to "Yes" - only sends webhook when Escalate agent determines human intervention is needed</small>
              </div>

              <button
                onClick={handleSaveWebhookFilter}
                disabled={isUpdating}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Save Filter Configuration
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {!showNewWebhookFields ? (
            <button
              onClick={handleShowNewWebhookFields}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Webhook
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveWebhook}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Webhook
              </button>
              <button
                onClick={() => {
                  handleHideNewWebhookFields();
                  clearWebhookForm();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          )}

          <button
            onClick={handleConfigureWebhook}
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Webhook Configuration
          </button>

          <button
            onClick={handleTestWebhook}
            disabled={isTesting}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Test Webhook
          </button>

          <button
            onClick={handleDisableWebhook}
            disabled={isUpdating}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Disable Webhook
          </button>

          {showDeleteButton && (
            <button
              onClick={handleDeleteWebhook}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Saved Webhook
            </button>
          )}
        </div>

        {/* Webhook Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Webhook Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Webhook Status:</span>
              <span className="ml-2 text-sm text-gray-900">
                {webhookStatus ? 
                  `${webhookStatus.isEnabled ? 'Enabled' : 'Disabled'} - ${webhookStatus.webhookUrl ? 'Configured' : 'Not configured'}` 
                  : 'Not configured'
                }
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Webhook Type:</span>
              <span className="ml-2 text-sm text-gray-900">
                {webhookStatus?.webhookUrl?.includes('api-private.atlassian.com/automation/webhooks') ? 'Jira Automation' : 'REST'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Last Test:</span>
              <span className="ml-2 text-sm text-gray-900">
                {testResult ? new Date().toLocaleString() : 'Never'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Token Status:</span>
              <span className="ml-2 text-sm text-gray-900">
                {webhookStatus?.webhookUrl?.includes('api-private.atlassian.com') ? 'Required for Jira Automation' : 'Not required'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhooksManager;