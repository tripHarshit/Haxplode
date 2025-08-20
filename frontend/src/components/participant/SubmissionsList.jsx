import React, { useState, useEffect } from 'react';
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
import { submissionService } from '../../services/submissionService';

const SubmissionsList = ({ submissions, defaultEventId, defaultTeamId }) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [currentSubmissions, setCurrentSubmissions] = useState(submissions || []);

  useEffect(() => {
    setCurrentSubmissions(submissions || []);
  }, [submissions]);

  useEffect(() => {
    // Initial fetch of user's submissions
    (async () => {
      try {
        const list = await submissionService.getUserSubmissions();
        setCurrentSubmissions(list);
      } catch (e) {
        console.error('Failed to load submissions', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (defaultEventId || defaultTeamId) {
      setEditingSubmission({ eventId: defaultEventId || '', teamId: defaultTeamId || '' });
      setShowSubmissionForm(true);
    }
  }, [defaultEventId, defaultTeamId]);

  const handleSubmissionUpdate = async () => {
    try {
      const list = await submissionService.getUserSubmissions();
      setCurrentSubmissions(list);
    } catch (e) {
      console.error('Failed to refresh submissions', e);
    }
  };

  const handleCreateSubmission = () => {
    setEditingSubmission({ eventId: defaultEventId || '', teamId: defaultTeamId || '' });
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Submitted
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300">
            <ClockIcon className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-300">
            <DocumentTextIcon className="h-3 w-3 mr-1" />
            Draft
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
            <EyeIcon className="h-3 w-3 mr-1" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-300">
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
      return { status: 'overdue', text: 'Overdue', color: 'text-error-600 dark:text-error-400' };
    } else if (days <= 1) {
      return { status: 'urgent', text: 'Due soon', color: 'text-error-600 dark:text-error-400' };
    } else if (days <= 3) {
      return { status: 'warning', text: 'Due soon', color: 'text-warning-600 dark:text-warning-400' };
    } else {
      return { status: 'ok', text: 'On time', color: 'text-success-600 dark:text-success-400' };
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
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Project Submissions</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Manage your hackathon project submissions</p>
        </div>
        
        <button
          onClick={handleCreateSubmission}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Submission
        </button>
      </div>

      {/* Submissions List */}
      {currentSubmissions.length > 0 ? (
        <div className="space-y-4">
          {currentSubmissions.map((submission) => {
            const deadlineStatus = getDeadlineStatus(submission.deadline);
            return (
              <div
                key={submission.id || submission._id}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          {submission.projectName}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                          {submission.projectDescription || submission.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-6">
                        {getStatusBadge(submission)}
                        {submission.teamName && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                            {submission.teamName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span className="font-medium">Hackathon:</span>
                          <span>{submission.hackathonTitle || submission.eventName}</span>
                        </div>
                        
                        {submission.deadline && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-medium">Deadline:</span>
                            <span className={deadlineStatus.color}>
                              {format(new Date(submission.deadline), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                        )}
                        
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
                          {(submission.technologies || []).map((tech, index) => (
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
                      {(submission.githubUrl || submission.githubLink) && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-700">GitHub:</span>
                          <a
                            href={submission.githubUrl || submission.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            View Repository
                          </a>
                        </div>
                      )}
                      
                      {(submission.demoUrl || submission.siteLink) && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">Site:</span>
                          <a
                            href={submission.demoUrl || submission.siteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                          >
                            Open Link
                          </a>
                        </div>
                      )}
                      
                      {(submission.files || submission.attachments)?.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">Files:</span>
                          <div className="flex space-x-2">
                            {(submission.files || submission.attachments).map((file, index) => (
                              <a
                                key={index}
                                href={file.url}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                              >
                                {file.name} {file.size ? `(${file.size})` : ''}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {submission.deadline && (
                          <>
                            <span className={deadlineStatus.color}>
                              {deadlineStatus.text}
                            </span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(submission.deadline), { addSuffix: true })}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View
                        </button>
                        
                        {canEdit(submission) && (
                          <button
                            onClick={() => handleEditSubmission(submission)}
                            className="inline-flex items-center px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
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
          <DocumentTextIcon className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No submissions yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">Start by creating your first project submission</p>
          <button
            onClick={handleCreateSubmission}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
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
        onSubmissionCreated={handleSubmissionUpdate}
      />
    </div>
  );
};

export default SubmissionsList;
