import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Store active channels
const activeChannels = new Map<string, RealtimeChannel>();

// Track auth listener to prevent duplicates
let authListenerSetup = false;

interface ChannelOptions {
  config?: any;
  subscriptionOptions?: any;
}

export function subscribeChannel(channelName: string, options: ChannelOptions = {}): RealtimeChannel {
  console.log(`🔄 [RealtimeManager] Subscribing to channel: ${channelName}`);
  
  const channel = supabase.channel(channelName, options.config);

  // Store subscription options for re-subscription
  (channel as any)._subscriptionOptions = options.subscriptionOptions;

  const subscribePromise = channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log(`✅ [RealtimeManager] Subscribed to channel: ${channelName}`);
      activeChannels.set(channelName, channel);
    }
    if (status === "CHANNEL_ERROR") {
      console.error(`❌ [RealtimeManager] Error on channel: ${channelName}`);
    }
    if (status === "CLOSED") {
      console.log(`🔒 [RealtimeManager] Channel closed: ${channelName}`);
      activeChannels.delete(channelName);
    }
  });

  return channel;
}

export function unsubscribeChannel(channelName: string): void {
  const channel = activeChannels.get(channelName);
  if (channel) {
    console.log(`🔄 [RealtimeManager] Unsubscribing from channel: ${channelName}`);
    channel.unsubscribe();
    activeChannels.delete(channelName);
  }
}

export function getActiveChannels(): Map<string, RealtimeChannel> {
  return new Map(activeChannels);
}

async function resubscribeAllChannels(): Promise<void> {
  console.log(`🔄 [RealtimeManager] Re-subscribing to ${activeChannels.size} channels`);
  
  const channelsToResubscribe = Array.from(activeChannels.entries());
  
  for (const [channelName, oldChannel] of channelsToResubscribe) {
    try {
      console.log(`🔄 [RealtimeManager] Re-subscribing channel: ${channelName}`);
      
      // Get stored subscription options
      const subscriptionOptions = (oldChannel as any)._subscriptionOptions;
      
      // Unsubscribe old channel
      await oldChannel.unsubscribe();
      console.log(`🔄 [RealtimeManager] Unsubscribed old channel: ${channelName}`);
      
      // Re-subscribe with original options
      const newChannel = subscribeChannel(channelName, { subscriptionOptions });
      
      // Re-apply any postgres_changes listeners
      if (subscriptionOptions) {
        for (const option of subscriptionOptions) {
          if (option.event && option.schema && option.table) {
            (newChannel as any).on('postgres_changes', option, option.callback);
          }
        }
      }
      
    } catch (err) {
      console.warn(`⚠️ [RealtimeManager] Failed to re-subscribe to ${channelName}:`, err);
    }
  }
}

async function refreshRealtimeAuth(accessToken: string, retryCount = 0): Promise<void> {
  try {
    console.log(`🔄 [RealtimeManager] Refreshing realtime token (attempt ${retryCount + 1})`);
    
    // Set the new auth token
    supabase.realtime.setAuth(accessToken);
    
    // Wait a brief moment for the auth to propagate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Re-subscribe to all channels
    await resubscribeAllChannels();
    
    console.log(`✅ [RealtimeManager] Successfully refreshed realtime authentication`);
    
  } catch (err) {
    console.error(`❌ [RealtimeManager] Error refreshing realtime token:`, err);
    
    // Retry up to 3 times with exponential backoff
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 3000; // 3s, 6s, 12s
      console.log(`🔄 [RealtimeManager] Retrying in ${delay}ms...`);
      
      setTimeout(() => {
        refreshRealtimeAuth(accessToken, retryCount + 1);
      }, delay);
    } else {
      console.error(`❌ [RealtimeManager] Failed to refresh realtime auth after 3 attempts`);
    }
  }
}

// Initialize auth state listener (only once)
export function initializeRealtimeAuthManager(): void {
  if (authListenerSetup) {
    console.log(`ℹ️ [RealtimeManager] Auth listener already setup`);
    return;
  }
  
  console.log(`🔄 [RealtimeManager] Initializing auth state listener`);
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log(`🔄 [RealtimeManager] Auth state changed:`, { 
      event, 
      hasSession: !!session,
      expiresAt: session?.expires_at,
      expiresIn: session?.expires_at ? Math.floor((session.expires_at * 1000 - Date.now()) / 1000) : 0,
      activeChannels: activeChannels.size,
      timestamp: new Date().toISOString()
    });
    
    // CRITICAL: Log if session expires while channels are active
    if (event === 'SIGNED_OUT' && activeChannels.size > 0) {
      console.error('❌ [RealtimeManager] CRITICAL: User signed out with active channels!', {
        activeChannelCount: activeChannels.size,
        channels: Array.from(activeChannels.keys()),
        timestamp: new Date().toISOString()
      });
    }
    
    // Only handle actual sign out, not token refresh events
    if (event === 'SIGNED_OUT') {
      // Clean up all channels on sign out
      console.log(`🔄 [RealtimeManager] Cleaning up channels on sign out`);
      for (const [channelName] of activeChannels) {
        unsubscribeChannel(channelName);
      }
    } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
      // Silent token refresh - update auth without disrupting channels
      console.log(`✅ [RealtimeManager] Token refreshed, updating realtime auth silently`);
      supabase.realtime.setAuth(session.access_token);
    } else if (session?.access_token && activeChannels.size > 0) {
      // Initial sign-in or session recovery with active channels
      await refreshRealtimeAuth(session.access_token);
    }
  });
  
  authListenerSetup = true;
}

// Enhanced channel subscription with postgres_changes support
export function subscribeToPostgresChanges(
  channelName: string,
  config: {
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema: string;
    table: string;
    filter?: string;
  },
  callback: (payload: any) => void
): RealtimeChannel {
  
  const subscriptionOptions = [{
    ...config,
    callback
  }];
  
  const channel = subscribeChannel(channelName, { subscriptionOptions });
  
  // Apply the postgres_changes listener
  (channel as any).on('postgres_changes', config, callback);
  
  return channel;
}