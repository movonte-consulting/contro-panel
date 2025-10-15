import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Globe, Calendar, User, RefreshCw, AlertTriangle } from 'lucide-react';
import { useServiceValidation, type ServiceValidation } from '../hooks/useServiceValidation';

export const AdminServiceValidations: React.FC = () => {
  const { getPendingValidations, approveValidation, rejectValidation, loading, error } = useServiceValidation();
  const [validations, setValidations] = useState<ServiceValidation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<ServiceValidation | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const loadValidations = async () => {
    try {
      setRefreshing(true);
      const data = await getPendingValidations();
      setValidations(data);
    } catch (err) {
      console.error('Error loading validations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadValidations();
  }, []);

  const handleApprove = async (validation: ServiceValidation) => {
    try {
      setProcessingId(validation.id);
      await approveValidation(validation.id, 'Approved by administrator');
      await loadValidations(); // Recargar la lista
    } catch (err) {
      console.error('Error approving validation:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectNotes.trim()) {
      return;
    }

    try {
      setProcessingId(showRejectModal.id);
      await rejectValidation(showRejectModal.id, rejectNotes);
      await loadValidations(); // Recargar la lista
      setShowRejectModal(null);
      setRejectNotes('');
    } catch (err) {
      console.error('Error rejecting validation:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading requests...</span>
        </div>
      </div>
    );
  }

  if (error && validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading requests</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadValidations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">All validation requests have been processed.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pending Validation Requests</h2>
              <p className="text-sm text-gray-600">{validations.length} pending request(s)</p>
            </div>
            <button
              onClick={loadValidations}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {validations.map((validation) => (
            <div key={validation.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{validation.serviceName}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Clock className="h-4 w-4" />
                      Pending
                    </span>
                  </div>

                  {validation.serviceDescription && (
                    <p className="text-gray-600 mb-3">{validation.serviceDescription}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">User:</span>
                      <span>{validation.user?.username || 'N/A'}</span>
                      <span className="text-gray-400">({validation.user?.email})</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Requested:</span>
                      <span>{formatDate(validation.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4" />
                      <span className="font-medium">Website:</span>
                      <a 
                        href={validation.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        {validation.websiteUrl}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4" />
                      <span className="font-medium">CORS Domain:</span>
                      <span className="font-mono text-gray-900">{validation.requestedDomain}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(validation)}
                    disabled={processingId === validation.id}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === validation.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </button>

                  <button
                    onClick={() => setShowRejectModal(validation)}
                    disabled={processingId === validation.id}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reject Request</h3>
                <p className="text-sm text-gray-600">{showRejectModal.serviceName}</p>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="rejectNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection reason *
              </label>
              <textarea
                id="rejectNotes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="Explain why this request is being rejected..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectNotes.trim() || processingId === showRejectModal.id}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingId === showRejectModal.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Reject
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectNotes('');
                }}
                disabled={processingId === showRejectModal.id}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
