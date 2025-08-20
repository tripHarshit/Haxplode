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

const AnnouncementsList = ({ announcements, onCreateNew, onEdit, onDelete }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowCreateModal(true);
  };

  const handleDelete = (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      onDelete(announcementId);
    }
  };

  const getTargetAudienceColor = (audience) => {
    switch (audience) {
      case 'All': return 'bg-slate-100 text-slate-700';
      case 'Participants': return 'bg-emerald-100 text-emerald-700';
      case 'Judges': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h2>
        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setShowCreateModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">{announcement.title}</h3>
                      {announcement.isUrgent && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Urgent" />
                      )}
                      {announcement.isImportant && (
                        <StarIcon className="h-5 w-5 text-amber-500" title="Important" />
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center space-x-1">
                        <BellIcon className="h-4 w-4" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTargetAudienceColor(announcement.targetAudience)}`}>{announcement.targetAudience}</span>
                      </span>
                      <span>{format(new Date(announcement.date), 'MMM dd, yyyy')}</span>
                      <span>By: {announcement.createdBy}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
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
const AnnouncementFormModal = ({ announcement, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    targetAudience: announcement?.targetAudience || 'All',
    isUrgent: announcement?.isUrgent || false,
    isImportant: announcement?.isImportant || false
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
    <div className="fixed inset-0 bg-black/40 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`input ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter announcement title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
              className={`input ${errors.content ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Write your announcement content..."
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target Audience
            </label>
            <select
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className="input"
            >
              <option value="All">All</option>
              <option value="Participants">Participants</option>
              <option value="Judges">Judges</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700 rounded"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Mark as Urgent</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isImportant}
                onChange={(e) => handleInputChange('isImportant', e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 rounded"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Mark as Important</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
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
