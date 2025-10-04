/**
 * Auth-safe request utilities with automatic token refresh and retry logic.
 * Prevents forced logouts during active jobs by refreshing tokens on 401s.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Get active jobs count from sessionStorage
 */
function getActiveJobsCount(): number {
  try {
    const count = sessionStorage.getItem('activeJobsCount');
    return count ? parseInt(count, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Auth-safe fetch wrapper with automatic token refresh on 401s
 * Only signs out if no active jobs are in progress
 */
export async function authSafeFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const maxRetries = 3;
  const backoffDelays = [300, 600, 1200]; // ms
  
  // Make the initial request
  let response = await fetch(input, init);
  
  // If not 401, return immediately
  if (response.status !== 401) {
    return response;
  }
  
  console.warn('[AuthGuard] 401 detected, attempting silent token refresh...', {
    url: typeof input === 'string' ? input : input.toString(),
    timestamp: new Date().toISOString()
  });
  
  // Try to refresh and retry
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[AuthGuard] Refresh attempt ${attempt + 1}/${maxRetries}`);
      
      // Attempt silent token refresh
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error(`[AuthGuard] Refresh failed (attempt ${attempt + 1}):`, error);
      } else if (data.session) {
        console.log(`[AuthGuard] Token refreshed successfully on attempt ${attempt + 1}`);
        
        // Update Authorization header with new token
        const newHeaders = new Headers(init?.headers || {});
        newHeaders.set('Authorization', `Bearer ${data.session.access_token}`);
        
        // Retry the original request with new token
        response = await fetch(input, {
          ...init,
          headers: newHeaders
        });
        
        // If we get a non-401, return it
        if (response.status !== 401) {
          console.log('[AuthGuard] Request succeeded after token refresh');
          return response;
        }
        
        console.warn('[AuthGuard] Still got 401 after refresh, will retry...');
      }
      
    } catch (refreshError) {
      console.error(`[AuthGuard] Refresh attempt ${attempt + 1} threw error:`, refreshError);
    }
    
    // Wait before next retry (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, backoffDelays[attempt]));
    }
  }
  
  // All retries exhausted, still 401
  const activeJobsCount = getActiveJobsCount();
  
  if (activeJobsCount > 0) {
    console.error('[AuthGuard] 401 persists but active jobs exist. DO NOT sign out.', {
      activeJobsCount,
      timestamp: new Date().toISOString()
    });
    throw new Error('Auth temporarily unavailable; job continues via websocket.');
  } else {
    console.error('[AuthGuard] 401 persists and no active jobs. Proceeding to explicit signOut.', {
      timestamp: new Date().toISOString()
    });
    await supabase.auth.signOut();
    throw new Error('Session expired. Please sign in again.');
  }
}

/**
 * Safe POST request with auth protection
 */
export async function authSafePost(
  url: string,
  payload: any,
  headers: Record<string, string> = {}
): Promise<Response> {
  return authSafeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(payload)
  });
}

/**
 * Safe GET request with auth protection
 */
export async function authSafeGet(
  url: string,
  headers: Record<string, string> = {}
): Promise<Response> {
  return authSafeFetch(url, {
    method: 'GET',
    headers
  });
}
