import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import BaseUrl from '../Baseurl/baseurl';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';

    if (!notificationsEnabled) {
      setLoading(false);
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const memberData = JSON.parse(localStorage.getItem('memberData'));

        if (!token || !memberData?.mid) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${BaseUrl}/api/notifications/${memberData.mid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch notifications');
        }

        if (data.success !== false) {
          const transformedNotifications = data.data.map(notif => ({
            ...notif,
            unread: !notif.is_read,
            sender_name: notif.sender ? `${notif.sender.first_name} ${notif.sender.last_name}` : 'Unknown',
            created_at: notif.createdAt,
            note: notif.note || null
          }));
          setNotifications(transformedNotifications);
        } else {
          throw new Error(data.message || 'Failed to fetch notifications');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const memberData = JSON.parse(localStorage.getItem('memberData'));

      if (!token || !memberData?.mid) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${BaseUrl}/api/mark-read/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark notification as read');
      }

      if (data.success !== false) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, unread: false, is_read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const memberData = JSON.parse(localStorage.getItem('memberData'));

      if (!token || !memberData?.mid) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${BaseUrl}/api/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }

      if (data.success !== false) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, unread: false, is_read: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return t('justNow') || 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('minutesAgo') || 'minutes ago'}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('hoursAgo') || 'hours ago'}`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ${t('daysAgo') || 'days ago'}`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
        <Footer />
        <MobileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold">{t('notifications') || 'Notifications'}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Notifications Disabled Info */}
        {localStorage.getItem('notificationsEnabled') !== 'true' && (
          <div className="text-center text-gray-600 text-sm sm:text-base mb-4">
            {t('notificationsAreDisabled') || 'Notifications are disabled. Turn them on from your profile settings.'}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Mark all read */}
        {notifications.length > 0 && notifications.some(n => n.unread) && (
          <div className="flex justify-end mb-3">
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white bg-green-600 hover:bg-green-700 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" /> {t('markAllRead') || 'Mark all as read'}
            </button>
          </div>
        )}

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="w-7 h-7 text-gray-400" />
            </div>
            <p className="mt-3 text-base font-medium text-gray-900">{t('No Notifications') || 'No Notifications'}</p>
            <p className="mt-1 text-sm text-gray-500">{t('noNotificationsDesc') || 'You have no notifications at this time.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const unread = Boolean(notif.unread);
              const initial = (notif.sender_name?.[0] || 'U').toUpperCase();
              return (
                <div
                  key={notif.id}
                  onClick={() => unread && handleMarkAsRead(notif.id)}
                  className={`relative bg-white rounded-xl border shadow-sm p-4 cursor-${unread ? 'pointer' : 'default'} transition ${unread ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                        {initial}
                      </div>
                      {unread && (
                        <span className="absolute -bottom-0.5 -right-0.5 inline-block w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${unread ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{notif.message}</p>
                        <span className="shrink-0 text-xs text-gray-500">{formatTimeAgo(notif.created_at)}</span>
                      </div>
                      {notif.note && (
                        <p className="mt-1 text-sm text-gray-600 break-words">{notif.note}</p>
                      )}
                      {unread && (
                        <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-600 text-white">
                          {t('new') || 'NEW'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <MobileFooter />
    </div>
  );
};

export default NotificationsPage;