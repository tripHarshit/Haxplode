import React, { useState, useRef } from 'react';
import { 
  XMarkIcon, 
  RocketLaunchIcon,
  DocumentTextIcon,
  LinkIcon,
  PaperClipIcon,
  XMarkIcon as XMarkIconSolid,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { submissionService } from '../../services/submissionService';
import { participantService } from '../../services/participantService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const SubmissionFormModal = ({ isOpen, onClose, submission, onSubmissionCreated }) => {
  // Early return before any hooks
  if (!isOpen) return null;

  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: submission?.projectName || '',
    description: submission?.projectDescription || submission?.description || '',
    hackathonId: submission?.eventId || submission?.hackathonId || '',
    teamId: submission?.teamId || '',
    githubUrl: submission?.githubLink || submission?.githubUrl || '',
    demoUrl: submission?.siteLink || submission?.demoUrl || '',
    videoUrl: submission?.videoLink || submission?.videoUrl || '',
    technologies: submission?.technologies || [],
    files: submission?.attachments || submission?.files || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [errors, setErrors] = useState({});
  const [newTechnology, setNewTechnology] = useState('');
  const fileInputRef = useRef(null);

  const totalSteps = 3;

  // Load registered events and teams for the dropdowns
  React.useEffect(() => {
    (async () => {
      try {
        const [{ events }, { teams }] = await Promise.all([
          participantService.getRegisteredEvents(),
          participantService.getParticipantTeams(),
        ]);
        setUserEvents((events || []).map(ev => ({ id: ev.id, title: ev.name })));
        setUserTeams(teams || []);
      } catch (e) {
        console.error('Failed to load events/teams for submission form', e);
      }
    })();
  }, [isOpen]);

  // Sync form when submission prop changes (e.g., edit or defaults)
  React.useEffect(() => {
    if (!isOpen) return;
    setFormData(prev => ({
      projectName: submission?.projectName || '',
      description: submission?.projectDescription || submission?.description || '',
      hackathonId: submission?.eventId || submission?.hackathonId || '',
      teamId: submission?.teamId || '',
      githubUrl: submission?.githubLink || submission?.githubUrl || '',
      demoUrl: submission?.siteLink || submission?.demoUrl || '',
      videoUrl: submission?.videoLink || submission?.videoUrl || '',
      technologies: submission?.technologies || [],
      files: submission?.attachments || submission?.files || []
    }));
  }, [submission, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Prevent form submission on Enter key in input fields
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only allow Enter to submit if we're on the final step and user explicitly wants to submit
      if (currentStep === totalSteps) {
        // Don't auto-submit, let user click the submit button
        return;
      }
    }
  };

  const handleTechnologyAdd = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const handleTechnologyRemove = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
    }));
  };

  const handleFileUpload = (e) => {
    e.preventDefault(); // Prevent any form submission
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
    
    // Clear the input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (fileToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file !== fileToRemove)
    }));
  };

  // Handle drag and drop for file uploads
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const newFiles = files.map(file => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.projectName.trim()) {
          newErrors.projectName = 'Project name is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Project description is required';
        } else if (formData.description.trim().length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
        }
        if (!formData.hackathonId) {
          newErrors.hackathonId = 'Please select a hackathon';
        }
        if (!formData.teamId) {
          newErrors.teamId = 'Please select a team';
        }
        break;
      case 2:
        if (!formData.githubUrl.trim()) {
          newErrors.githubUrl = 'GitHub repository URL is required';
        } else if (!formData.githubUrl.includes('github.com')) {
          newErrors.githubUrl = 'Please enter a valid GitHub URL';
        }
        if (formData.technologies.length === 0) {
          newErrors.technologies = 'Please add at least one technology';
        }
        break;
      case 3:
        // Optional fields, no validation required
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent submission if not on the final step
    if (currentStep !== totalSteps) {
      return;
    }
    
    // Re-validate all critical steps to prevent server-side validation errors
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }
    
    if (!user) {
      showError('Please log in to submit a project');
      return;
    }
    
    // Check if user has a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      showError('Authentication token not found. Please log in again.');
      return;
    }
    
    // Add confirmation dialog only on final step
    const confirmed = window.confirm(
      `Are you sure you want to submit your project "${formData.projectName}"?\n\n` +
      `This action cannot be undone. You can still edit your submission later.`
    );
    
    if (!confirmed) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (submission && submission._id) {
        // Update existing submission
        const updatePayload = {
          projectName: formData.projectName,
          projectDescription: formData.description,
          githubLink: formData.githubUrl,
          siteLink: formData.demoUrl || undefined,
          videoLink: formData.videoUrl || undefined,
          technologies: formData.technologies,
        };
        await submissionService.updateSubmission(submission._id, updatePayload);

        // Upload any newly added files (those with a File object)
        const newFiles = (formData.files || []).filter(f => f.file instanceof File);
        for (const f of newFiles) {
          await submissionService.uploadSubmissionFile(submission._id, f.file);
        }
        showSuccess('Submission updated successfully!');
      } else {
        // Create new submission
        const createPayload = {
          teamId: Number(formData.teamId),
          eventId: Number(formData.hackathonId),
          projectName: formData.projectName,
          projectDescription: formData.description,
          githubLink: formData.githubUrl,
          siteLink: formData.demoUrl || undefined,
          videoLink: formData.videoUrl || undefined,
          technologies: formData.technologies,
        };
        
        const resp = await submissionService.createSubmission(createPayload);
        const created = resp?.data?.submission;
        
        if (!created?._id) {
          throw new Error('Failed to create submission - no submission ID returned');
        }
        
        let filesUploaded = 0;
        let filesFailed = 0;
        
        if (formData.files?.length) {
          const filesToUpload = (formData.files || []).filter(f => f.file instanceof File);
          
          // Try to upload files, but don't fail the submission if upload fails
          for (const f of filesToUpload) {
            try {
              await submissionService.uploadSubmissionFile(created._id, f.file);
              filesUploaded++;
            } catch (uploadError) {
              console.warn('File upload failed:', uploadError);
              filesFailed++;
              // Continue with other files, don't fail the submission
            }
          }
        }
        
        let successMessage = 'Project submitted successfully!';
        if (filesUploaded > 0) {
          successMessage += ` ${filesUploaded} file(s) uploaded.`;
        }
        if (filesFailed > 0) {
          successMessage += ` ${filesFailed} file(s) failed to upload.`;
        }
        showSuccess(successMessage);
      }
      
      // Reset form and close modal
      setFormData({
        projectName: '',
        description: '',
        hackathonId: '',
        teamId: '',
        githubUrl: '',
        demoUrl: '',
        videoUrl: '',
        technologies: [],
        files: []
      });
      setErrors({});
      setCurrentStep(1);
      onClose();
      
      if (onSubmissionCreated) {
        onSubmissionCreated();
      }
      
    } catch (error) {
      console.error('Failed to submit project:', error);
      
      // Handle specific authentication errors
      if (error.message?.includes('authentication') || error.message?.includes('token') || error.message?.includes('unauthorized')) {
        setErrors({ submit: 'Authentication failed. Please log in again and try submitting.' });
      } else {
        setErrors({ submit: error.message || 'Failed to submit project. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        projectName: '',
        description: '',
        hackathonId: '',
        teamId: '',
        githubUrl: '',
        demoUrl: '',
        videoUrl: '',
        technologies: [],
        files: []
      });
      setErrors({});
      setCurrentStep(1);
      onClose();
    }
  };

  const availableHackathons = userEvents;
  const availableTeams = userTeams
    .filter(t => Number(t.event?.id || t.eventId) === Number(formData.hackathonId))
    .map(t => ({ id: t.id, name: t.teamName || t.name }));
  const selectedHackathonTitle = availableHackathons.find(h => Number(h.id) === Number(formData.hackathonId))?.title;

  // Auto-select team if only one available for selected event
  React.useEffect(() => {
    if (formData.hackathonId && availableTeams.length === 1 && !formData.teamId) {
      setFormData(prev => ({ ...prev, teamId: availableTeams[0].id }));
    }
  }, [formData.hackathonId, availableTeams.length]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RocketLaunchIcon className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">
                  {selectedHackathonTitle ? `${selectedHackathonTitle} Submission` : (submission ? 'Edit Submission' : 'Submit Project')}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-white hover:text-primary-100 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 rounded"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-neutral-50 dark:bg-neutral-800 px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {currentStep === 1 && 'Project Details'}
                {currentStep === 2 && 'Links & Technologies'}
                {currentStep === 3 && 'Files & Review'}
              </span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form */}
          <div 
            className="px-6 py-6"
            onKeyDown={(e) => {
              // Prevent form submission on Enter key
              if (e.key === 'Enter' && e.target.type !== 'textarea') {
                e.preventDefault();
              }
            }}
          >
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Project Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400 ${
                        errors.projectName ? 'border-error-300 dark:border-error-600' : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                      placeholder="Enter project name"
                      disabled={isSubmitting}
                    />
                    {errors.projectName && (
                      <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.projectName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="hackathonId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Hackathon *
                    </label>
                    <select
                      id="hackathonId"
                      name="hackathonId"
                      value={formData.hackathonId}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 ${
                        errors.hackathonId ? 'border-error-300 dark:border-error-600' : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select hackathon</option>
                      {availableHackathons.map((hackathon) => (
                        <option key={hackathon.id} value={hackathon.id}>
                          {hackathon.title}
                        </option>
                      ))}
                    </select>
                    {errors.hackathonId && (
                      <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.hackathonId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder-neutral-400 ${
                      errors.description ? 'border-error-300 dark:border-error-600' : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    placeholder="Describe your project, its features, and how it works"
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="teamId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Team *
                  </label>
                  <select
                    id="teamId"
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 ${
                      errors.teamId ? 'border-error-300 dark:border-error-600' : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    disabled={isSubmitting || !formData.hackathonId}
                  >
                    <option value="">Select team</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {errors.teamId && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.teamId}</p>
                  )}
                  {!formData.hackathonId && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Please select a hackathon first
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Links & Technologies */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Links & Technologies</h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Repository URL *
                    </label>
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.githubUrl ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://github.com/username/repository"
                      disabled={isSubmitting}
                    />
                    {errors.githubUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Official Site URL
                      </label>
                      <input
                        type="url"
                        id="demoUrl"
                        name="demoUrl"
                        value={formData.demoUrl}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="https://your-demo-site.com"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Video Demo URL
                      </label>
                      <input
                        type="url"
                        id="videoUrl"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="https://youtube.com/watch?v=..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies Used *
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTechnologyAdd())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Add technology (e.g., React, Python)"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={handleTechnologyAdd}
                        disabled={isSubmitting || !newTechnology.trim()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                    
                    {formData.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleTechnologyRemove(tech)}
                              className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              <XMarkIconSolid className="h-4 w-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {errors.technologies && (
                      <p className="mt-1 text-sm text-red-600">{errors.technologies}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Files & Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Files & Review</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images (optional)
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <PaperClipIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Drag and drop files here, or click to browse
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        Choose Files
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                    />
                  </div>
                  
                  {formData.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({file.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(file)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <XMarkIconSolid className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Submission Review</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Project:</span> {formData.projectName}</p>
                    <p><span className="font-medium">Hackathon:</span> {availableHackathons.find(h => Number(h.id) === Number(formData.hackathonId))?.title}</p>
                    <p><span className="font-medium">Team:</span> {availableTeams.find(t => t.id === formData.teamId)?.name}</p>
                    <p><span className="font-medium">Technologies:</span> {formData.technologies.join(', ')}</p>
                    <p><span className="font-medium">Files:</span> {formData.files.length} file(s)</p>
                  </div>
                  
                  {formData.files.length === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Tip:</strong> Consider uploading screenshots or demo images to showcase your project!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-6">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  >
                    Next
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 shadow-sm"
                  >
                    {isSubmitting ? 'Submitting...' : (submission ? 'Update Submission' : 'Submit Project')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionFormModal;
