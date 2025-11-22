import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Bell, Settings, HelpCircle, X, CheckCheck, Menu } from 'lucide-react';
import { useSidebar } from '../ui/Sidebar';

/**
 * DashboardHeader - Reusable header component for dashboard pages
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle/description
 * @param {ReactNode} action - Custom action buttons (optional)
 * @param {boolean} showNotifications - Show notification bell (default: true)
 * @param {boolean} showSettings - Show settings button (default: false)
 * @param {boolean} showHelp - Show help button (default: false)
 * @param {object} user - User data { name, initials, avatar }
 */
// Sample notification data
const sampleNotifications = [
  {
    id: '1',
    title: 'New order received',
    message: 'Table 5 placed an order for Margherita Pizza',
    time: '2 minutes ago',
    read: false,
    type: 'order',
  },
  {
    id: '2',
    title: 'Menu updated successfully',
    message: 'Your "Summer Menu 2024" has been published',
    time: '1 hour ago',
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'QR Code scanned',
    message: '15 new scans on your "Main Menu" QR code',
    time: '3 hours ago',
    read: true,
    type: 'info',
  },
  {
    id: '4',
    title: 'Low stock alert',
    message: 'Some menu items are running low on ingredients',
    time: '5 hours ago',
    read: true,
    type: 'warning',
  },
  {
    id: '5',
    title: 'Customer feedback',
    message: 'You received 5 new reviews for your menu',
    time: '1 day ago',
    read: true,
    type: 'info',
  },
];

export function DashboardHeader({
  title,
  subtitle,
  action,
  showNotifications = true,
  showSettings = false,
  showHelp = false,
  user = { name: 'Restaurant Bella Vista', initials: 'BV', avatar: null },
}) {
  const navigate = useNavigate();
  const { toggleMobile } = useSidebar();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    const colors = {
      order: 'bg-blue-100 text-blue-600',
      success: 'bg-green-100 text-green-600',
      info: 'bg-purple-100 text-purple-600',
      warning: 'bg-yellow-100 text-yellow-600',
    };
    return colors[type] || colors.info;
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-4 md:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 md:hidden"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Left Section - Page Title */}
      <div className="flex-1">
        {title && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right Section - Actions and User */}
      <div className="flex items-center gap-3">
        {/* Custom Action Buttons */}
        {action}

        {/* Standard Action Buttons */}
        {showHelp && (
          <Button variant="ghost" size="sm" className="text-gray-600">
            <HelpCircle className="h-5 w-5" />
          </Button>
        )}

        {showNotifications && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 relative"
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Panel */}
            {showNotificationPanel && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotificationPanel(false)}
                ></div>

                {/* Panel */}
                <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[600px] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div>
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotificationPanel(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIcon(notification.type)}`}>
                              <Bell className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t bg-gray-50">
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium w-full text-center">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {showSettings && (
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Settings className="h-5 w-5" />
          </Button>
        )}

        {/* User Avatar */}
        <Avatar 
          className="h-8 w-8 cursor-pointer focus:outline-none focus:ring-0 transition-all" 
          onClick={() => navigate('/dashboard/settings')}
        >
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
