import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { notifications as mockNotifications, type Notification } from '@/data/mockData';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!supabase) {
        setNotifications(mockNotifications);
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
        setNotifications(data?.length ? data : mockNotifications);
      } catch {
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    }
    fetch();

    // Real-time subscription
    if (supabase) {
      const channel = supabase.channel('notifications').on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      ).subscribe();
      return () => { supabase!.removeChannel(channel); };
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (supabase) {
      supabase.from('notifications').update({ read: true }).eq('id', id).then(() => {});
    }
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return { notifications, unreadCount, markAsRead, markAllRead, loading };
}
