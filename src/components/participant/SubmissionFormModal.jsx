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
import { mockEvents, mockTeams } from '../../utils/mockData';

const SubmissionFormModal = ({ isOpen, onClose, submission }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: submission?.projectName || '',
    description: submission?.description || '',
    hackathonId: submission?.hackathonId || '',
    teamId: submission?.teamId || '',
    githubUrl: submission?.githubUrl || '',
    demoUrl: submission?.demoUrl || '',
    videoUrl: submission?.videoUrl || '',
    technologies: submission?.technologies || [],
    files: submission?.files || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [newTechnology, setNewTechnology] = useState('');
  const fileInputRef = useRef(null);

  const totalSteps = 3;

  if (!isOpen) return null;

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
  };

  const handleFileRemove = (fileToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file !== fileToRemove)
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
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (submission) {
        // In real app: await participantService.updateSubmission(submission.hackathonId, submission.id, formData);
        console.log('Updating submission:', formData);
      } else {
        // In real app: await participantService.submitProject(formData.hackathonId, formData);
        console.log('Creating submission:', formData);
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
      
      // Show success message
      alert(submission ? 'Submission updated successfully!' : 'Project submitted successfully!');
      
    } catch (error) {
      console.error('Failed to submit project:', error);
      setErrors({ submit: 'Failed to submit project. Please try again.' });
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

  const availableHackathons = mockEvents.filter(event => event.isRegistered);
  const availableTeams = mockTeams.filter(team => team.hackathonId === formData.hackathonId);

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
          <div className="bg-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RocketLaunchIcon className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">
                  {submission ? 'Edit Submission' : 'Submit Project'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-white hover:text-orange-100 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {currentStep === 1 && 'Project Details'}
                {currentStep === 2 && 'Links & Technologies'}
                {currentStep === 3 && 'Files & Review'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Project Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.projectName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter project name"
                      disabled={isSubmitting}
                    />
                    {errors.projectName && (
                      <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="hackathonId" className="block text-sm font-medium text-gray-700 mb-2">
                      Hackathon *
                    </label>
                    <select
                      id="hackathonId"
                      name="hackathonId"
                      value={formData.hackathonId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                        errors.hackathonId ? 'border-red-300' : 'border-gray-300'
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
                      <p className="mt-1 text-sm text-red-600">{errors.hackathonId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe your project, its features, and how it works"
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-2">
                    Team *
                  </label>
                  <select
                    id="teamId"
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.teamId ? 'border-red-300' : 'border-gray-300'
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
                    <p className="mt-1 text-sm text-red-600">{errors.teamId}</p>
                  )}
                  {!formData.hackathonId && (
                    <p className="mt-1 text-sm text-gray-500">
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
                        Demo/Live Site URL
                      </label>
                      <input
                        type="url"
                        id="demoUrl"
                        name="demoUrl"
                        value={formData.demoUrl}
                        onChange={handleInputChange}
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Add technology (e.g., React, Python)"
                        disabled={isSubmitting}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTechnologyAdd())}
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
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleTechnologyRemove(tech)}
                              className="ml-2 text-orange-600 hover:text-orange-800"
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
                    Additional Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
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
                    <p><span className="font-medium">Hackathon:</span> {availableHackathons.find(h => h.id === formData.hackathonId)?.title}</p>
                    <p><span className="font-medium">Team:</span> {availableTeams.find(t => t.id === formData.teamId)?.name}</p>
                    <p><span className="font-medium">Technologies:</span> {formData.technologies.join(', ')}</p>
                    <p><span className="font-medium">Files:</span> {formData.files.length} file(s)</p>
                  </div>
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
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    Next
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : (submission ? 'Update Submission' : 'Submit Project')}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionFormModal;
