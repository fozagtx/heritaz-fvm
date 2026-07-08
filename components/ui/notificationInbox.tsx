'use client';

import React, { useState } from 'react';
import { Bell, X, CheckCircle2, AlertTriangle, Clock, FileText } from 'lucide-react';

interface Notification {
  id: string;
  type: 'check_in_reminder' | 'grace_period_alert' | 'inheritance_triggered' | 'document_update';
  message: string;
  timestamp: number;
  read: boolean;
}

export function NotificationInbox() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'check_in_reminder': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'grace_period_alert': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'inheritance_triggered': return <CheckCircle2 className="w-4 h-4 text-red-400" />;
      case 'document_update': return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <p className="text-sm font-medium text-white">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-white/40">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 border-b border-white/5 ${
                    n.read ? '' : 'bg-white/[0.02]'
                  }`}
                >
                  {getIcon(n.type)}
                  <div className="flex-1">
                    <p className="text-xs text-white/80">{n.message}</p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {new Date(n.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
