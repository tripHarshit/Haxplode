import React, { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  StarIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const AnnouncementsList = ({ announcements, onCreateNew, onEdit, onDelete, events = [], selectedEventId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowCreateModal(true);
  };

  const handleDelete = (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement? This will archive it.')) {
      onDelete(announcementId);
    }
  };

  const getTargetAudienceColor = (audience) => {
    switch (audience) {
      case 'All': return 'bg-purple-100 text-purple-800';
      case 'Participants': return 'bg-blue-100 text-blue-800';
      case 'Judges': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Announcements</h2>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{announcement.title}</h3>
                      {announcement.isUrgent && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Urgent" />
                      )}
                      {announcement.isImportant && (
                        <StarIcon className="h-5 w-5 text-yellow-500" title="Important" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <BellIcon className="h-4 w-4" />
                        <span>{announcement.targetAudience}</span>
                      </span>
                      <span>{format(new Date(announcement.date), 'MMM dd, yyyy')}</span>
                      <span>By: {announcement.createdBy}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No announcements yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first announcement to keep participants informed</p>
        </div>
      )}

      {/* Create/Edit Announcement Modal */}
      {showCreateModal && (
        <AnnouncementFormModal
          announcement={editingAnnouncement}
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAnnouncement(null);
          }}
          events={events}
          selectedEventId={selectedEventId}
          onSubmit={(data) => {
            if (editingAnnouncement) {
              onEdit(editingAnnouncement.id, data);
            } else {
              onCreateNew(data);
            }
            setShowCreateModal(false);
            setEditingAnnouncement(null);
          }}
        />
      )}
    </div>
  );
};

// Announcement Form Modal Component
const AnnouncementFormModal = ({ announcement, isOpen, onClose, onSubmit, events = [], selectedEventId }) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    visibility: (announcement?.targetAudience === 'Both' ? 'Both' : (announcement?.targetAudience || 'Participants')),
    tags: Array.isArray(announcement?.tags) ? announcement.tags : [],
    eventId: selectedEventId || (events[0]?.id ?? null),
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        date: announcement?.date || new Date().toISOString(),
        createdBy: announcement?.createdBy || 'Organizer Team'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hackathon
            </label>
            <select
              value={formData.eventId || ''}
              onChange={(e) => handleInputChange('eventId', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="" disabled>Select a hackathon</option>
              {events && events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title || `Event ${ev.id}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100`}
              placeholder="Enter announcement title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100`}
              placeholder="Write your announcement description..."
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibility
            </label>
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="Participants"
                  checked={formData.visibility === 'Participants'}
                  onChange={() => handleInputChange('visibility', 'Participants')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Participants</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="Judges"
                  checked={formData.visibility === 'Judges'}
                  onChange={() => handleInputChange('visibility', 'Judges')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Judges</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="Both"
                  checked={formData.visibility === 'Both'}
                  onChange={() => handleInputChange('visibility', 'Both')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Both</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-6">
              {['important','urgent','mandatory'].map(tag => (
                <label key={tag} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        tags: checked ? Array.from(new Set([...(prev.tags || []), tag])) : (prev.tags || []).filter(t => t !== tag)
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {announcement ? 'Update Announcement' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementsList;
