import React, { useState } from 'react';
import { Loader2, Plus, XCircle } from 'lucide-react';
import type { CreateServiceData } from '../../../hooks/useUserServices';

interface ServiceValidationData {
    websiteUrl: string;
    requestedDomain: string;
}

interface CreateServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateServiceData, validationInfo?: ServiceValidationData) => Promise<void>;
    assistants: Array<{ id: string; name: string }>;
    projects: Array<{ id: string; key: string; name: string; description?: string }>;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    assistants,
    projects
}) => {
    const [formData, setFormData] = useState<CreateServiceData>({
        serviceId: '',
        serviceName: '',
        assistantId: '',
        assistantName: '',
        projectKey: ''
    });
    const [validationData, setValidationData] = useState<ServiceValidationData>({
        websiteUrl: '',
        requestedDomain: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.serviceId || !formData.serviceName || !formData.assistantId || !formData.projectKey) return;
        if (!validationData.websiteUrl || !validationData.requestedDomain) return;

        setIsSubmitting(true);
        try {
            await onCreate(formData, validationData);
        } catch (error) {
            console.error('Error creating service:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssistantChange = (assistantId: string) => {
        const assistant = assistants.find(a => a.id === assistantId);
        setFormData(prev => ({
            ...prev,
            assistantId,
            assistantName: assistant?.name || ''
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Create New Service</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serviceId">
                            Service ID
                        </label>
                        <input
                            id="serviceId"
                            type="text"
                            value={formData.serviceId}
                            onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., my-custom-service"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serviceName">
                            Service Name
                        </label>
                        <input
                            id="serviceName"
                            type="text"
                            value={formData.serviceName}
                            onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., My Custom Service"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="assistant">
                            Assistant
                        </label>
                        <select
                            id="assistant"
                            value={formData.assistantId}
                            onChange={(e) => handleAssistantChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select an assistant...</option>
                            {assistants.map(assistant => (
                                <option key={assistant.id} value={assistant.id}>
                                    {assistant.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="jiraProject">
                            Jira Project
                        </label>
                        <select
                            id="jiraProject"
                            value={formData.projectKey}
                            onChange={(e) => setFormData(prev => ({ ...prev, projectKey: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select a Jira project...</option>
                            {projects.map(project => (
                                <option key={project.key} value={project.key}>
                                    {project.name} ({project.key})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Select the Jira project where this service will be implemented
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Website Configuration</h3>
                        <p className="text-xs text-gray-600 mb-4">
                            Specify where this service will be used. This information will be sent for admin approval to configure CORS.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="websiteUrl">
                                    Website URL *
                                </label>
                                <input
                                    id="websiteUrl"
                                    type="url"
                                    value={validationData.websiteUrl}
                                    onChange={(e) => setValidationData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://mi-sitio.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="requestedDomain">
                                    Domain for CORS *
                                </label>
                                <input
                                    id="requestedDomain"
                                    type="text"
                                    value={validationData.requestedDomain}
                                    onChange={(e) => {
                                        let domain = e.target.value;
                                        try {
                                            if (domain.includes('://')) {
                                                const url = new URL(domain);
                                                domain = url.hostname;
                                                if (domain.startsWith('www.')) {
                                                    domain = domain.substring(4);
                                                }
                                            }
                                        } catch {
                                            // Do nothing
                                        }
                                        setValidationData(prev => ({ ...prev, requestedDomain: domain }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="mi-sitio.com"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Only the domain (without https:// or www). URLs will be automatically converted to domains.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Service
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateServiceModal;