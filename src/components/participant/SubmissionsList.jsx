import React, { useState } from 'react';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  PencilIcon, 
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import SubmissionFormModal from './SubmissionFormModal';

const SubmissionsList = ({ submissions }) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(null);

  const handleCreateSubmission = () => {
    setEditingSubmission(null);
    setShowSubmissionForm(true);
  };

  const handleEditSubmission = (submission) => {
    setEditingSubmission(submission);
    setShowSubmissionForm(true);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    // In a real app, this would open a detailed view modal
    console.log('Viewing submission:', submission);
  };

  const getStatusBadge = (submission) => {
    switch (submission.status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Submitted
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <DocumentTextIcon className="h-3 w-3 mr-1" />
            Draft
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <EyeIcon className="h-3 w-3 mr-1" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const days = diff / (1000 * 60 * 60 * 24);
    
    if (diff < 0) {
      return { status: 'overdue', text: 'Overdue', color: 'text-red-600' };
    } else if (days <= 1) {
      return { status: 'urgent', text: 'Due soon', color: 'text-red-600' };
    } else if (days <= 3) {
      return { status: 'warning', text: 'Due soon', color: 'text-yellow-600' };
    } else {
      return { status: 'ok', text: 'On time', color: 'text-green-600' };
    }
  };

  const canEdit = (submission) => {
    if (!submission.canEdit) return false;
    const now = new Date();
    const deadlineDate = new Date(submission.deadline);
    return now < deadlineDate;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Submissions</h2>
          <p className="text-gray-600">Manage your hackathon project submissions</p>
        </div>
        
        <button
          onClick={handleCreateSubmission}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Submission
        </button>
      </div>

      {/* Submissions List */}
      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const deadlineStatus = getDeadlineStatus(submission.deadline);
            return (
              <div
                key={submission.id}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {submission.projectName}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {submission.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-6">
                        {getStatusBadge(submission)}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {submission.teamName}
                        </span>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span className="font-medium">Hackathon:</span>
                          <span>{submission.hackathonTitle}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4" />
                          <span className="font-medium">Deadline:</span>
                          <span className={deadlineStatus.color}>
                            {format(new Date(submission.deadline), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        
                        {submission.submittedAt && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <ArrowUpTrayIcon className="h-4 w-4" />
                            <span className="font-medium">Submitted:</span>
                            <span>{format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="font-medium">Technologies:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {submission.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Links and Files */}
                    <div className="space-y-3 mb-4">
                      {submission.githubUrl && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-700">GitHub:</span>
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            View Repository
                          </a>
                        </div>
                      )}
                      
                      {submission.demoUrl && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-700">Demo:</span>
                          <a
                            href={submission.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            Live Demo
                          </a>
                        </div>
                      )}
                      
                      {submission.files && submission.files.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-700">Files:</span>
                          <div className="flex space-x-2">
                            {submission.files.map((file, index) => (
                              <a
                                key={index}
                                href={file.url}
                                className="text-blue-600 hover:text-blue-700 underline"
                              >
                                {file.name} ({file.size})
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={deadlineStatus.color}>
                          {deadlineStatus.text}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(submission.deadline), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View
                        </button>
                        
                        {canEdit(submission) && (
                          <button
                            onClick={() => handleEditSubmission(submission)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first project submission</p>
          <button
            onClick={handleCreateSubmission}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Submission
          </button>
        </div>
      )}

      {/* Submission Form Modal */}
      <SubmissionFormModal
        isOpen={showSubmissionForm}
        onClose={() => setShowSubmissionForm(false)}
        submission={editingSubmission}
      />
    </div>
  );
};

export default SubmissionsList;
