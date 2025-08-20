import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { hackathonService } from '../services/hackathonService';
import { announcementService } from '../services/announcementService';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  FunnelIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { refreshUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Get events user participates in
        const { participatingEvents } = await hackathonService.getUserEvents({ page: 1, limit: 100 });
        const eventIds = (participatingEvents || []).map(e => e.id);
        // Fetch announcements for each event
        const results = await Promise.all(
          eventIds.map(eventId => announcementService.getEventAnnouncements(eventId))
        );
        const anns = results.flatMap(r => (r?.data?.announcements || r?.announcements || []));
        // Map to notification shape
        const mapped = anns.map(a => {
          let mappedType = 'info';
          const priority = a.priority || '';
          const aType = a.type || '';
          if (priority === 'Critical' || aType === 'Urgent') mappedType = 'error';
          else if (priority === 'High' || aType === 'Important' || aType === 'Reminder') mappedType = 'warning';
          else mappedType = 'info';
          return {
            id: a._id || a.id,
            type: mappedType,
            title: a.title || 'Announcement',
            message: a.message || '',
            timestamp: new Date(a.createdAt || a.scheduledFor || Date.now()),
            read: Array.isArray(a.readBy) ? a.readBy.some(rb => rb.userId === user.id) : false,
            eventName: a.eventName || 'General',
            priority: priority || 'Normal'
          };
        }).sort((x, y) => (y.timestamp?.getTime?.() || 0) - (x.timestamp?.getTime?.() || 0));
        setNotifications(mapped);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnnouncements();
  }, [user]);

  const markAsRead = async (notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    try { await announcementService.markAsRead(notificationId); } catch {}
    try { refreshUnreadCount(); } catch {}
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    try { refreshUnreadCount(); } catch {}
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(notification => !selectedNotifications.has(notification.id)));
    setSelectedNotifications(new Set());
    setShowBulkActions(false);
  };

  const markSelectedAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => 
        selectedNotifications.has(notification.id) 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setSelectedNotifications(new Set());
    setShowBulkActions(false);
    try { refreshUnreadCount(); } catch {}
  };

  const toggleSelection = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAll = () => {
    const filteredNotifications = filteredNotificationsList;
    const allIds = new Set(filteredNotifications.map(n => n.id));
    setSelectedNotifications(allIds);
    setShowBulkActions(allIds.size > 0);
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
    setShowBulkActions(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type, read) => {
    const baseStyles = 'border-l-4 transition-all duration-200 hover:shadow-md';
    const readStyles = read ? 'opacity-75' : '';
    
    switch (type) {
      case 'success':
        return `${baseStyles} ${readStyles} border-green-500 bg-green-50 hover:bg-green-100`;
      case 'warning':
        return `${baseStyles} ${readStyles} border-yellow-500 bg-yellow-50 hover:bg-yellow-100`;
      case 'error':
        return `${baseStyles} ${readStyles} border-red-500 bg-red-50 hover:bg-red-100`;
      default:
        return `${baseStyles} ${readStyles} border-blue-500 bg-blue-50 hover:bg-blue-100`;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotificationsList = useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Please log in to view notifications</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <BellIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Stay updated with the latest announcements and updates
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {unreadCount} unread
                </span>
              )}
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Mark all as read
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All', count: notifications.length },
                  { key: 'unread', label: 'Unread', count: unreadCount },
                  { key: 'read', label: 'Read', count: notifications.length - unreadCount }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filter === tab.key
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              {showBulkActions && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedNotifications.size} selected
                  </span>
                  <button
                    onClick={markSelectedAsRead}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Mark as read
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading notifications...</span>
              </div>
            </div>
          ) : filteredNotificationsList.length > 0 ? (
            <>
              {/* Select All Option */}
              {filteredNotificationsList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.size === filteredNotificationsList.length}
                      onChange={selectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select all ({filteredNotificationsList.length})
                    </span>
                  </label>
                </div>
              )}

              {/* Notifications */}
              {filteredNotificationsList.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md ${
                    selectedNotifications.has(notification.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`p-6 ${getNotificationStyles(notification.type, notification.read)}`}>
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className={`text-lg font-semibold ${
                                notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatTimestamp(notification.timestamp)}
                              </div>
                              {notification.eventName && (
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                  {notification.eventName}
                                </span>
                              )}
                              {notification.priority && notification.priority !== 'Normal' && (
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  notification.priority === 'Critical' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : notification.priority === 'High'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  {notification.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Mark as read"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete notification"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <BellIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You're all caught up! Check back later for new updates and announcements."
                  : `No ${filter} notifications to display.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
