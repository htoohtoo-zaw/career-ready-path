/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase/client';

export interface NotificationItem {
  id: string;
  user_id: string | null; // null means global/system
  title: string;
  message: string;
  type: 'system' | 'kyc' | 'roadmap_update' | 'mentor_announcement';
  is_read: boolean;
  created_at: string;
}

const LOCAL_NOTIFS_KEY = 'crp_in_app_notifications';

// Helper to get local notifications
export function getLocalNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(LOCAL_NOTIFS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Helper to save local notifications
export function saveLocalNotifications(notifs: NotificationItem[]): void {
  try {
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(notifs));
  } catch (e) {}
}

// Fetch all relevant notifications
export async function fetchNotifications(userId: string | null | undefined): Promise<NotificationItem[]> {
  let localNotifs = getLocalNotifications();
  
  if (isSupabaseConfigured()) {
    try {
      const query = (supabase.from('notifications' as any) as any).select('*');
      
      if (userId && !userId.startsWith('user_')) {
        const { data, error } = await query
          .or(`user_id.is.null,user_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Merge with any unique local notifications that might have been created
          const dbIds = new Set(data.map((d: any) => d.id));
          const localOnly = localNotifs.filter(n => n.id.startsWith('notif_') && !dbIds.has(n.id));
          const merged = [...data, ...localOnly];
          saveLocalNotifications(merged);
          return merged;
        }
      } else {
        const { data, error } = await query
          .is('user_id', null)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const dbIds = new Set(data.map((d: any) => d.id));
          const localOnly = localNotifs.filter(n => n.id.startsWith('notif_') && !dbIds.has(n.id));
          const merged = [...data, ...localOnly];
          saveLocalNotifications(merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('Error fetching notifications from Supabase, using local:', e);
    }
  }
  
  // Filter local notifications for the active user
  const activeUserId = userId || null;
  return localNotifs
    .filter(n => n.user_id === null || n.user_id === activeUserId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Add a notification
export async function addNotification(
  title: string,
  message: string,
  type: NotificationItem['type'] = 'system',
  userId: string | null = null
): Promise<NotificationItem> {
  const newNotif: NotificationItem = {
    id: 'notif_' + Math.random().toString(36).substr(2, 9),
    user_id: userId,
    title,
    message,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  // Save locally
  const localNotifs = getLocalNotifications();
  localNotifs.unshift(newNotif);
  saveLocalNotifications(localNotifs);

  // Trigger custom storage event so other open tabs/windows can refresh
  window.dispatchEvent(new Event('storage'));

  if (isSupabaseConfigured() && userId && !userId.startsWith('user_')) {
    try {
      const { data, error } = await (supabase.from('notifications' as any) as any)
        .insert({
          user_id: userId,
          title,
          message,
          type,
          is_read: false
        })
        .select()
        .single();

      if (!error && data) {
        const updated = localNotifs.map(n => n.id === newNotif.id ? data : n);
        saveLocalNotifications(updated);
        return data;
      }
    } catch (e) {
      console.warn('Could not insert notification into Supabase:', e);
    }
  }

  // Handle system announcements (global)
  if (isSupabaseConfigured() && !userId) {
    try {
      const { data, error } = await (supabase.from('notifications' as any) as any)
        .insert({
          user_id: null,
          title,
          message,
          type,
          is_read: false
        })
        .select()
        .single();

      if (!error && data) {
        const updated = localNotifs.map(n => n.id === newNotif.id ? data : n);
        saveLocalNotifications(updated);
        return data;
      }
    } catch (e) {
      console.warn('Could not insert global notification into Supabase:', e);
    }
  }

  return newNotif;
}

// Mark specific notification as read
export async function markAsRead(notifId: string): Promise<void> {
  const localNotifs = getLocalNotifications();
  const updated = localNotifs.map(n => n.id === notifId ? { ...n, is_read: true } : n);
  saveLocalNotifications(updated);
  window.dispatchEvent(new Event('storage'));

  if (isSupabaseConfigured() && !notifId.startsWith('notif_')) {
    try {
      await (supabase.from('notifications' as any) as any)
        .update({ is_read: true })
        .eq('id', notifId);
    } catch (e) {
      console.warn('Could not update notification in Supabase:', e);
    }
  }
}

// Mark all as read for user
export async function markAllAsRead(userId: string | null | undefined): Promise<void> {
  const localNotifs = getLocalNotifications();
  const activeUserId = userId || null;
  const updated = localNotifs.map(n => {
    if (n.user_id === null || n.user_id === activeUserId) {
      return { ...n, is_read: true };
    }
    return n;
  });
  saveLocalNotifications(updated);
  window.dispatchEvent(new Event('storage'));

  if (isSupabaseConfigured()) {
    try {
      if (userId && !userId.startsWith('user_')) {
        await (supabase.from('notifications' as any) as any)
          .update({ is_read: true })
          .or(`user_id.is.null,user_id.eq.${userId}`);
      } else {
        await (supabase.from('notifications' as any) as any)
          .update({ is_read: true })
          .is('user_id', null);
      }
    } catch (e) {
      console.warn('Could not mark all notifications read in Supabase:', e);
    }
  }
}
