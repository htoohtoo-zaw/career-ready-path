/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './client';

export type RealtimeCallback = (payload: any) => void;

class SupabaseRealtimeHub {
  private activeChannel: any = null;
  private isListening = false;
  private listeners: Set<RealtimeCallback> = new Set();

  public init() {
    if (!isSupabaseConfigured() || this.isListening) return;
    try {
      this.activeChannel = supabase
        .channel('crp_global_realtime_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mentor_profiles' },
          (payload) => {
            console.log('⚡ [Realtime] mentor_profiles changed:', payload.eventType);
            this.broadcast(payload);
            window.dispatchEvent(new CustomEvent('crp_supabase_mentor_profiles_change', { detail: payload }));
            window.dispatchEvent(new Event('crp_admin_profiles_updated'));
            window.dispatchEvent(new Event('crp_local_mentor_applications_updated'));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            console.log('⚡ [Realtime] profiles changed:', payload.eventType);
            this.broadcast(payload);
            window.dispatchEvent(new CustomEvent('crp_supabase_profiles_change', { detail: payload }));
            window.dispatchEvent(new Event('crp_admin_profiles_updated'));
            window.dispatchEvent(new Event('crp_auth_session_changed'));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'mentorship_requests' },
          (payload) => {
            console.log('⚡ [Realtime] mentorship_requests changed:', payload.eventType);
            this.broadcast(payload);
            window.dispatchEvent(new CustomEvent('crp_supabase_mentorship_change', { detail: payload }));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          (payload) => {
            console.log('⚡ [Realtime] reviews changed:', payload.eventType);
            this.broadcast(payload);
            window.dispatchEvent(new CustomEvent('crp_supabase_reviews_change', { detail: payload }));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          (payload) => {
            console.log('⚡ [Realtime] notifications changed:', payload.eventType);
            this.broadcast(payload);
            window.dispatchEvent(new CustomEvent('crp_supabase_notifications_change', { detail: payload }));
          }
        )
        .on(
          'broadcast',
          { event: 'kyc_decision_update' },
          (payload) => {
            console.log('⚡ [Realtime] Broadcast received: kyc_decision_update', payload.payload);
            const { userId, email, status, rejectionReason } = payload.payload;
            
            // Sync to local storage for cross-device visibility in case DB fails
            const kycDecisionsStr = localStorage.getItem('crp_kyc_admin_decisions') || '{}';
            let kycDecisions = {};
            try { kycDecisions = JSON.parse(kycDecisionsStr); } catch (e) {}
            
            const timestamp = new Date().toISOString();
            if (email) {
              (kycDecisions as any)[email.toLowerCase()] = { status, rejectionReason, timestamp };
            }
            if (userId) {
              (kycDecisions as any)[userId] = { status, rejectionReason, timestamp };
            }
            localStorage.setItem('crp_kyc_admin_decisions', JSON.stringify(kycDecisions));

            // Dispatch events to trigger UI re-renders
            this.broadcast(payload);
            window.dispatchEvent(new CustomEvent('crp_supabase_mentor_profiles_change', { detail: payload }));
            window.dispatchEvent(new Event('crp_admin_profiles_updated'));
            window.dispatchEvent(new Event('crp_local_mentor_applications_updated'));
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ Connected to Supabase Realtime replication channels');
            this.isListening = true;
          }
        });
    } catch (err: any) {
      console.warn('Realtime subscription could not be established:', err.message);
    }
  }

  // Allow manual broadcasting for bypass of RLS or offline mode
  public sendBroadcast(event: string, payload: any) {
    if (this.activeChannel && this.isListening) {
      this.activeChannel.send({
        type: 'broadcast',
        event: event,
        payload: payload
      });
    }
  }

  public subscribe(callback: RealtimeCallback): () => void {
    this.listeners.add(callback);
    this.init();
    return () => {
      this.listeners.delete(callback);
    };
  }

  private broadcast(payload: any) {
    this.listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error('Error in realtime listener callback:', e);
      }
    });
  }

  public cleanup() {
    if (this.activeChannel) {
      supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
      this.isListening = false;
    }
  }
}

export const realtimeHub = new SupabaseRealtimeHub();
