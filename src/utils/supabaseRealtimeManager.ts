import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Store active channels
const activeChannels = new Map<string, RealtimeChannel>();

// Track auth listener to prevent duplicates
let authListenerSetup = false;

// Track channel metrics for diagnostics
const channelMetrics = new Map<string, {
  createdAt: number;
  lastActivity: number;
  reconnectCount: number;
  closeReason?: string;
  subscriptionCount: number;
}>();

interface ChannelOptions {
  config?: any;
  subscriptionOptions?: any;
}

export function subscribeChannel(channelName: string, options: ChannelOptions = {}): RealtimeChannel {
  const now = Date.now();
  const existingMetrics = channelMetrics.get(channelName);
  
  console.log(`🔄 [RealtimeManager] Subscribing to channel: ${channelName}`, {
    timestamp: new Date(now).toISOString(),
    config: options.config,
    isReconnect: !!existingMetrics,
    previousMetrics: existingMetrics
  });
  
  // Initialize or update metrics
  if (!existingMetrics) {
    channelMetrics.set(channelName, {
      createdAt: now,
      lastActivity: now,
      reconnectCount: 0,
      subscriptionCount: 1
    });
  } else {
    existingMetrics.reconnectCount++;
    existingMetrics.lastActivity = now;
    existingMetrics.subscriptionCount++;
  }
  
  const channel = supabase.channel(channelName, options.config);

  // Store subscription options for re-subscription
  (channel as any)._subscriptionOptions = options.subscriptionOptions;

  const subscribePromise = channel.subscribe((status) => {
    const metrics = channelMetrics.get(channelName);
    const age = metrics ? Date.now() - metrics.createdAt : 0;
    
    if (status === "SUBSCRIBED") {
      console.log(`✅ [RealtimeManager] Subscribed to channel: ${channelName}`, {
        timestamp: new Date().toISOString(),
        channelAge: `${Math.round(age / 1000)}s`,
        metrics: channelMetrics.get(channelName)
      });
      activeChannels.set(channelName, channel);
      if (metrics) metrics.lastActivity = Date.now();
    }
    if (status === "CHANNEL_ERROR") {
      console.error(`❌ [RealtimeManager] Error on channel: ${channelName}`, {
        timestamp: new Date().toISOString(),
        channelAge: `${Math.round(age / 1000)}s`,
        metrics: channelMetrics.get(channelName)
      });
      if (metrics) {
        metrics.closeReason = 'CHANNEL_ERROR';
        metrics.lastActivity = Date.now();
      }
    }
    if (status === "CLOSED") {
      console.log(`🔒 [RealtimeManager] Channel closed: ${channelName}`, {
        timestamp: new Date().toISOString(),
        channelAge: `${Math.round(age / 1000)}s`,
        closeReason: metrics?.closeReason || 'UNKNOWN',
        metrics: channelMetrics.get(channelName)
      });
      activeChannels.delete(channelName);
    }
  });

  return channel;
}

export function unsubscribeChannel(channelName: string, reason: string = 'MANUAL'): void {
  const channel = activeChannels.get(channelName);
  const metrics = channelMetrics.get(channelName);
  
  if (channel) {
    const age = metrics ? Date.now() - metrics.createdAt : 0;
    console.log(`🔄 [RealtimeManager] Unsubscribing from channel: ${channelName}`, {
      reason,
      timestamp: new Date().toISOString(),
      channelAge: `${Math.round(age / 1000)}s`,
      lifetime: metrics
    });
    
    if (metrics) {
      metrics.closeReason = reason;
      metrics.lastActivity = Date.now();
    }
    
    channel.unsubscribe();
    activeChannels.delete(channelName);
  } else {
    console.warn(`⚠️ [RealtimeManager] Attempted to unsubscribe from non-existent channel: ${channelName}`);
  }
}

export function getActiveChannels(): Map<string, RealtimeChannel> {
  return new Map(activeChannels);
}

async function resubscribeAllChannels(): Promise<void> {
  const startTime = Date.now();
  const channelCount = activeChannels.size;
  const channelNames = Array.from(activeChannels.keys());
  
  console.log(`🔄 [RealtimeManager] Re-subscribing to ${channelCount} channels`, {
    timestamp: new Date(startTime).toISOString(),
    channels: channelNames,
    channelDetails: channelNames.map(name => ({
      name,
      metrics: channelMetrics.get(name)
    }))
  });
  
  const channelsToResubscribe = Array.from(activeChannels.entries());
  let successCount = 0;
  let failureCount = 0;
  
  for (const [channelName, oldChannel] of channelsToResubscribe) {
    const channelStartTime = Date.now();
    try {
      console.log(`🔄 [RealtimeManager] Re-subscribing channel: ${channelName}`, {
        currentMetrics: channelMetrics.get(channelName)
      });
      
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
      
      const duration = Date.now() - channelStartTime;
      console.log(`✅ [RealtimeManager] Successfully re-subscribed ${channelName} in ${duration}ms`);
      successCount++;
      
    } catch (err) {
      const duration = Date.now() - channelStartTime;
      console.warn(`⚠️ [RealtimeManager] Failed to re-subscribe to ${channelName} after ${duration}ms:`, err);
      failureCount++;
    }
  }
  
  const totalDuration = Date.now() - startTime;
  console.log(`✅ [RealtimeManager] Re-subscription complete`, {
    duration: `${totalDuration}ms`,
    total: channelCount,
    success: successCount,
    failed: failureCount,
    finalChannels: Array.from(activeChannels.keys())
  });
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
    const timestamp = new Date().toISOString();
    const expiresIn = session?.expires_at ? Math.floor((session.expires_at * 1000 - Date.now()) / 1000) : 0;
    const activeChannelNames = Array.from(activeChannels.keys());
    
    console.log(`🔄 [RealtimeManager] Auth state changed:`, { 
      event, 
      hasSession: !!session,
      hasPreviousSession: !!session, // will be enhanced with actual previous session tracking
      expiresAt: session?.expires_at,
      expiresIn: `${expiresIn}s`,
      timeUntilExpiry: expiresIn > 0 ? `${Math.floor(expiresIn / 60)}m ${expiresIn % 60}s` : 'expired',
      activeChannels: activeChannels.size,
      channelNames: activeChannelNames,
      timestamp
    });
    
    // CRITICAL: Log if session expires while channels are active
    if (event === 'SIGNED_OUT' && activeChannels.size > 0) {
      console.error('❌ [RealtimeManager] CRITICAL: User signed out with active channels!', {
        activeChannelCount: activeChannels.size,
        channels: activeChannelNames,
        timestamp
      });
    }
    
    // Only handle actual sign out, not token refresh events
    if (event === 'SIGNED_OUT') {
      // Clean up all channels on sign out
      console.log(`🔄 [RealtimeManager] Cleaning up ${activeChannels.size} channels on sign out`);
      for (const [channelName] of activeChannels) {
        unsubscribeChannel(channelName, 'SIGNED_OUT');
      }
    } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
      // Silent token refresh - update auth without disrupting channels
      console.log(`✅ [RealtimeManager] Token refreshed, updating realtime auth silently for ${activeChannels.size} channels`);
      
      try {
        supabase.realtime.setAuth(session.access_token);
        console.log(`✅ [RealtimeManager] setAuth() successful for ${activeChannels.size} channels`, {
          channels: activeChannelNames,
          timestamp: new Date().toISOString()
        });
        
        // DO NOT clear channels or job state during TOKEN_REFRESHED
        // Channels remain subscribed with updated auth token
        
      } catch (error) {
        console.error('❌ [RealtimeManager] setAuth() failed:', error, {
          timestamp: new Date().toISOString()
        });
      }
    } else if (session?.access_token && activeChannels.size > 0) {
      // Initial sign-in or session recovery with active channels
      console.log(`🔄 [RealtimeManager] Session recovery with ${activeChannels.size} active channels`);
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