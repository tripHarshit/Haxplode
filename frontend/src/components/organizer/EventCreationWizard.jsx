import React, { useEffect, useState } from 'react';
import { hackathonService } from '../../services/hackathonService';

const EventCreationWizard = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    theme: '',
    description: '',
    location: '',
    isVirtual: false,
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxTeams: 50,
    maxTeamSize: 4,
    rules: [''],
    prizes: [{ category: '', amount: '', description: '' }],
    rounds: [{ name: '', description: '', startDate: '', endDate: '' }]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Listen for prefill request to enter edit mode
  useEffect(() => {
    const handler = (e) => {
      const d = e.detail || {};
      setEditingId(d._id || null);
      setFormData((prev) => ({
        ...prev,
        name: d.name || '',
        theme: d.theme || '',
        description: d.description || '',
        location: d.location || '',
        isVirtual: !!d.isVirtual,
        startDate: d.startDate || '',
        endDate: d.endDate || '',
        registrationDeadline: d.registrationDeadline || '',
        maxTeams: d.maxTeams || 50,
        maxTeamSize: d.maxTeamSize || 4,
        rules: Array.isArray(d.rules) && d.rules.length ? d.rules : [''],
        prizes: Array.isArray(d.prizes) && d.prizes.length ? d.prizes : [{ category: '', amount: '', description: '' }],
        rounds: Array.isArray(d.rounds) && d.rounds.length ? d.rounds : [{ name: '', description: '', startDate: '', endDate: '' }],
      }));
    };
    window.addEventListener('prefillEventWizard', handler);
    return () => window.removeEventListener('prefillEventWizard', handler);
  }, []);

  const themes = [
    'Artificial Intelligence', 'Blockchain', 'Mobile Development', 'Web Development',
    'Game Development', 'IoT', 'Cybersecurity', 'Data Science', 'Sustainability',
    'Healthcare', 'Education', 'Finance', 'Other'
  ];

  const handleInputChange = (field, value) => {
    console.log(`📝 Input change - Field: ${field}, Value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    console.log(`📝 Array change - Field: ${field}, Index: ${index}, Value:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => {
        if (i === index) {
          // For simple fields like rules (string), replace the entire value
          if (field === 'rules') {
            return value;
          }
          // For object fields like prizes, rounds, merge the value
          return { ...item, ...value };
        }
        return item;
      })
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.theme) newErrors.theme = 'Theme is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.registrationDeadline) newErrors.registrationDeadline = 'Registration deadline is required';
    if (!formData.maxTeams) newErrors.maxTeams = 'Max teams is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    // Validate rules - check if at least one rule has content
    if (!formData.rules || formData.rules.length === 0 || !formData.rules.some(rule => rule && rule.trim())) {
      newErrors.rules = 'At least one rule is required';
    }
    
    // Validate prizes - check if at least one prize has category
    if (!formData.prizes || formData.prizes.length === 0 || !formData.prizes.some(prize => prize.category && prize.category.trim())) {
      newErrors.prizes = 'At least one prize category is required';
    }
    
    // Validate rounds - check if at least one round has name
    if (!formData.rounds || formData.rounds.length === 0 || !formData.rounds.some(round => round.name && round.name.trim())) {
      newErrors.rounds = 'At least one round is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('=== EVENT CREATION STARTED ===');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        title: formData.name,
        description: formData.description,
        category: formData.theme,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationDeadline: formData.registrationDeadline,
        maxParticipants: formData.maxTeams * formData.maxTeamSize,
        isOnline: formData.isVirtual,
        location: formData.location,
        rules: formData.rules.filter(rule => rule && typeof rule === 'string' && rule.trim()),
        timeline: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          registrationDeadline: formData.registrationDeadline
        },
        prizes: formData.prizes.map(prize => `${prize.category}: ${prize.amount}`),
        sponsors: [],
        rounds: formData.rounds.map(round => ({
          id: round.name.toLowerCase().replace(/\s+/g, '-'),
          name: round.name,
          description: round.description,
          weight: 1
        })),
        customCriteria: [],
        tags: [formData.theme],
        settings: {
          teamSizeMax: formData.maxTeamSize,
          allowIndividual: true,
          allowTeams: true,
          registrationLimit: formData.maxTeams * formData.maxTeamSize
        }
      };

      let response;
      if (editingId) {
        console.log('🚀 Updating hackathon...', editingId);
        response = await hackathonService.updateHackathon(editingId, payload);
        onEventCreated(response.event);
      } else {
        console.log('🚀 Creating hackathon...');
        response = await hackathonService.createHackathon(payload);
        onEventCreated(response.event);
      }
      onClose();
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert(`Failed to create event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-60 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Event</h2>
            <p className="text-gray-600 dark:text-gray-300">Simple Event Creation Form</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter event name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme *
              </label>
              <select
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.theme ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select theme</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
              {errors.theme && <p className="mt-1 text-sm text-red-600">{errors.theme}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Describe your event..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.registrationDeadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.registrationDeadline && <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Teams *
              </label>
              <input
                type="number"
                value={formData.maxTeams}
                onChange={(e) => handleInputChange('maxTeams', parseInt(e.target.value) || 50)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.maxTeams ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="50"
                min="1"
              />
              {errors.maxTeams && <p className="mt-1 text-sm text-red-600">{errors.maxTeams}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="San Francisco, CA or Online"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVirtual"
              checked={formData.isVirtual}
              onChange={(e) => handleInputChange('isVirtual', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isVirtual" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              This is a virtual event
            </label>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Rules *
            </label>
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={rule || ''}
                  onChange={(e) => handleArrayChange('rules', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter a rule..."
                />
                {formData.rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('rules', index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('rules', '')}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Rule
            </button>
            {errors.rules && <p className="mt-1 text-sm text-red-600">{errors.rules}</p>}
          </div>

          {/* Prizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prize Pool *
            </label>
            {formData.prizes.map((prize, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={prize.category}
                    onChange={(e) => handleArrayChange('prizes', index, { category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="1st Place"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input
                    type="text"
                    value={prize.amount}
                    onChange={(e) => handleArrayChange('prizes', index, { amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="$10,000"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={prize.description}
                      onChange={(e) => handleArrayChange('prizes', index, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Best overall project"
                    />
                  </div>
                  {formData.prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('prizes', index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ✕
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
              + Add Prize Category
            </button>
            {errors.prizes && <p className="mt-1 text-sm text-red-600">{errors.prizes}</p>}
          </div>

          {/* Rounds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Judging Rounds *
            </label>
            {formData.rounds.map((round, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Round Name</label>
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => handleArrayChange('rounds', index, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Initial Review"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={round.description}
                      onChange={(e) => handleArrayChange('rounds', index, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="First round of judging"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={round.startDate}
                      onChange={(e) => handleArrayChange('rounds', index, { startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={round.endDate}
                      onChange={(e) => handleArrayChange('rounds', index, { endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                {formData.rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('rounds', index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    ✕ Remove Round
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('rounds', { name: '', description: '', startDate: '', endDate: '' })}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Round
            </button>
            {errors.rounds && <p className="mt-1 text-sm text-red-600">{errors.rounds}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md ${
              isSubmitting
                ? 'bg-gray-400 text-gray-600 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Changes' : 'Create Event')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCreationWizard;
