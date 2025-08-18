import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const EventCreationWizard = ({ isOpen, onClose, onEventCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    location: '',
    isOnline: false,
    
    // Details
    rules: [''],
    requirements: [''],
    prizes: [{ category: '', amount: '', description: '' }],
    sponsors: [{ name: '', logo: '', tier: 'Gold' }],
    
    // Rounds
    rounds: [{ name: '', description: '', startDate: '', endDate: '', criteria: [] }],
    
    // Judges
    judges: [],
    
    // Settings
    teamSizeMin: 1,
    teamSizeMax: 4,
    submissionFormats: ['GitHub Repository', 'Demo Video', 'Presentation'],
    registrationLimit: '',
    allowIndividual: true,
    allowTeams: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Event details and schedule' },
    { id: 2, title: 'Details', description: 'Rules, prizes, and sponsors' },
    { id: 3, title: 'Rounds', description: 'Judging rounds and criteria' },
    { id: 4, title: 'Judges', description: 'Select and assign judges' },
    { id: 5, title: 'Settings', description: 'Final configuration' }
  ];

  const categories = [
    'Artificial Intelligence',
    'Blockchain',
    'Mobile Development',
    'Web Development',
    'Game Development',
    'IoT',
    'Cybersecurity',
    'Data Science',
    'Sustainability',
    'Healthcare',
    'Education',
    'Finance',
    'Other'
  ];

  const sponsorTiers = ['Platinum', 'Gold', 'Silver', 'Bronze'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, ...value } : item
      )
    }));
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.registrationDeadline) newErrors.registrationDeadline = 'Registration deadline is required';
        if (!formData.maxParticipants) newErrors.maxParticipants = 'Max participants is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
      case 2:
        if (formData.rules.length === 0 || formData.rules[0].trim() === '') {
          newErrors.rules = 'At least one rule is required';
        }
        if (formData.prizes.length === 0 || formData.prizes[0].category.trim() === '') {
          newErrors.prizes = 'At least one prize category is required';
        }
        break;
      case 3:
        if (formData.rounds.length === 0) {
          newErrors.rounds = 'At least one round is required';
        }
        break;
      case 4:
        if (formData.judges.length === 0) {
          newErrors.judges = 'At least one judge is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const eventData = {
        ...formData,
        id: Date.now(),
        status: 'draft',
        createdAt: new Date().toISOString(),
        currentParticipants: 0,
        teams: 0,
        submissions: 0,
        views: 0
      };

      onEventCreated(eventData);
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter event title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Describe your event..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Deadline *
          </label>
          <input
            type="datetime-local"
            value={formData.registrationDeadline}
            onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.registrationDeadline ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.registrationDeadline && <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Participants *
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="200"
            min="1"
          />
          {errors.maxParticipants && <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="San Francisco, CA or Online"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isOnline"
          checked={formData.isOnline}
          onChange={(e) => handleInputChange('isOnline', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-900">
          This is an online event
        </label>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      {/* Rules */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Rules *
        </label>
        {formData.rules.map((rule, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={rule}
              onChange={(e) => handleArrayChange('rules', index, e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-md ${
                errors.rules ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter a rule..."
            />
            {formData.rules.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('rules', index)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('rules', '')}
          className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Rule
        </button>
        {errors.rules && <p className="mt-1 text-sm text-red-600">{errors.rules}</p>}
      </div>

      {/* Prizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prize Pool *
        </label>
        {formData.prizes.map((prize, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={prize.category}
                onChange={(e) => handleArrayChange('prizes', index, { category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1st Place"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="text"
                value={prize.amount}
                onChange={(e) => handleArrayChange('prizes', index, { amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="$10,000"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={prize.description}
                  onChange={(e) => handleArrayChange('prizes', index, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Best overall project"
                />
              </div>
              {formData.prizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('prizes', index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('prizes', { category: '', amount: '', description: '' })}
          className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Prize Category
        </button>
        {errors.prizes && <p className="mt-1 text-sm text-red-600">{errors.prizes}</p>}
      </div>

      {/* Sponsors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sponsors
        </label>
        {formData.sponsors.map((sponsor, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={sponsor.name}
                onChange={(e) => handleArrayChange('sponsors', index, { name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tier</label>
              <select
                value={sponsor.tier}
                onChange={(e) => handleArrayChange('sponsors', index, { tier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sponsorTiers.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Logo</label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-left text-gray-500 hover:border-blue-500"
                  >
                    <PhotoIcon className="h-5 w-5 inline mr-2" />
                    Upload Logo
                  </button>
                </div>
              </div>
              {formData.sponsors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('sponsors', index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('sponsors', { name: '', logo: '', tier: 'Gold' })}
          className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Sponsor
        </button>
      </div>
    </div>
  );

  const renderRounds = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judging Rounds *
        </label>
        {formData.rounds.map((round, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Round Name</label>
                <input
                  type="text"
                  value={round.name}
                  onChange={(e) => handleArrayChange('rounds', index, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Initial Review"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={round.description}
                  onChange={(e) => handleArrayChange('rounds', index, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First round of judging"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={round.startDate}
                  onChange={(e) => handleArrayChange('rounds', index, { startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={round.endDate}
                  onChange={(e) => handleArrayChange('rounds', index, { endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Judging Criteria will be set in the next step</span>
              {formData.rounds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('rounds', index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('rounds', { name: '', description: '', startDate: '', endDate: '', criteria: [] })}
          className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Round
        </button>
        {errors.rounds && <p className="mt-1 text-sm text-red-600">{errors.rounds}</p>}
      </div>
    </div>
  );

  const renderJudges = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Judge Management</h3>
        <p className="text-gray-500">Judge assignment will be available after event creation</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Team Size
          </label>
          <input
            type="number"
            value={formData.teamSizeMin}
            onChange={(e) => handleInputChange('teamSizeMin', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max={formData.teamSizeMax}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Team Size
          </label>
          <input
            type="number"
            value={formData.teamSizeMax}
            onChange={(e) => handleInputChange('teamSizeMax', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={formData.teamSizeMin}
            max="10"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowIndividual"
            checked={formData.allowIndividual}
            onChange={(e) => handleInputChange('allowIndividual', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="allowIndividual" className="ml-2 block text-sm text-gray-900">
            Allow individual participants
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowTeams"
            checked={formData.allowTeams}
            onChange={(e) => handleInputChange('allowTeams', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="allowTeams" className="ml-2 block text-sm text-gray-900">
            Allow team formation
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Submission Formats
        </label>
        <div className="space-y-2">
          {formData.submissionFormats.map((format, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                id={`format-${index}`}
                checked={true}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled
              />
              <label htmlFor={`format-${index}`} className="ml-2 block text-sm text-gray-900">
                {format}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderDetails();
      case 3: return renderRounds();
      case 4: return renderJudges();
      case 5: return renderSettings();
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
            <p className="text-gray-600">Step {currentStep} of {steps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step.id <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                <div className="ml-2">
                  <div className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5 inline mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
                <ChevronRightIcon className="h-5 w-5 inline ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreationWizard;
