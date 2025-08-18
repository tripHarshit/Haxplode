import React, { useState } from 'react';
import { 
  PlusIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { mockAnnouncements } from '../../utils/organizerMockData';

const Announcements = () => {
  const [announcements] = useState(mockAnnouncements);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetAudienceColor = (audience) => {
    switch (audience) {
      case 'all': return 'bg-purple-100 text-purple-800';
      case 'participants': return 'bg-blue-100 text-blue-800';
      case 'judges': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
          <p className="text-gray-600">Create and manage announcements for participants and judges</p>
        </div>
        <button
          onClick={() => setShowCreateAnnouncement(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{announcements.length}</div>
            <div className="text-sm text-gray-500">Total Announcements</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {announcements.filter(a => a.status === 'published').length}
            </div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {announcements.filter(a => a.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {announcements.reduce((sum, a) => sum + a.views, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <BellIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                        {announcement.isPinned && (
                          <PinIcon className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Event: {announcement.eventTitle}</span>
                        <span>By: {announcement.author}</span>
                        <span className="flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          {announcement.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                        {announcement.status}
                      </span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTargetAudienceColor(announcement.targetAudience)}`}>
                          {announcement.targetAudience}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-red-400 hover:text-red-600">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  {announcement.status === 'published' && announcement.publishedAt && (
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Published: {new Date(announcement.publishedAt).toLocaleString()}
                    </span>
                  )}
                  {announcement.status === 'scheduled' && announcement.scheduledFor && (
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Scheduled: {new Date(announcement.scheduledFor).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Create Announcement Modal Placeholder */}
      {showCreateAnnouncement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Announcement</h3>
              <button
                onClick={() => setShowCreateAnnouncement(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Announcement Form</h3>
              <p className="text-gray-500">Announcement creation form will be implemented here</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateAnnouncement(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
