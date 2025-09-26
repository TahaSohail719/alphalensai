import { safePostRequest } from '@/lib/safe-request';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFeatureName } from '@/lib/feature-mapper';

/**
 * Enhanced POST request that supports both traditional HTTP response 
 * and parallel Realtime job tracking via Supabase
 */
export async function enhancedPostRequest(
  url: string, 
  payload: any, 
  options: {
    enableJobTracking?: boolean;
    jobType?: string;
    instrument?: string;
    feature?: string;
    headers?: Record<string, string>;
    jobId?: string; // Optional: reuse an existing job id instead of creating a new one
    onRealtimeSetup?: (jobId: string) => void; // Callback when Realtime is ready
  } = {}
): Promise<{ response: Response; jobId?: string }> {
  
  let jobId: string | undefined;
  
  // If job tracking is enabled, create a job record and inject job_id
  if (options.enableJobTracking) {
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      jobId = options.jobId || uuidv4();
      
      // Add job_id to the payload
      const enhancedPayload = {
        ...payload,
        job_id: jobId
      };
      
      // Create job record in Supabase only if we don't already have one
      if (!options.jobId) {
        await supabase
          .from('jobs')
          .insert({
            id: jobId,
            status: 'pending',
            request_payload: enhancedPayload,
            user_id: user.user.id,
            feature: options.feature
          });
      }
      
      // CRITICAL: Set up Realtime subscription BEFORE sending POST request
      if (options.onRealtimeSetup) {
        console.log(`🔄 [Realtime] Setting up subscription for job: ${jobId}`);
        options.onRealtimeSetup(jobId);
      }
      
      // Send the enhanced payload with job_id
      const response = await safePostRequest(url, enhancedPayload, options.headers);
      
      return { response, jobId };
    }
  }
  
  // Fallback to traditional request without job tracking
  const response = await safePostRequest(url, payload, options.headers);
  return { response, jobId };
}

/**
 * Utility to handle response with potential realtime fallback
 */
export async function handleResponseWithFallback(
  response: Response,
  jobId?: string,
  onRealtimeResult?: (result: any) => void,
  keepLoading?: () => void
): Promise<any> {
  
  let httpResult: any = null;
  let httpError: any = null;
  
  // Try to get HTTP response
  try {
    if (response.ok) {
      const responseText = await response.text();
      
      // Check if response is valid JSON
      try {
        httpResult = JSON.parse(responseText);
        
        // Check for explicit error fields in the response
        if (httpResult && typeof httpResult === 'object' && httpResult.error) {
          throw new Error(`n8n error: ${httpResult.error}`);
        }
        
        console.log(`✅ [HTTP] Response received for job: ${jobId}`, httpResult);
      } catch (jsonError) {
        // If JSON parsing fails, treat as error
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    httpError = error;
    console.log(`⚠️ [HTTP] Request failed, waiting for Realtime response...`, error);
    
    // CRITICAL: Keep loading state active when HTTP fails
    if (keepLoading) {
      keepLoading();
    }
  }
  
  // If we have a job ID and HTTP failed, rely on realtime
  if (jobId && httpError && onRealtimeResult) {
    console.log(`🔄 [Realtime] Waiting for job completion: ${jobId}`);
    
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`
        },
        async (payload) => {
          const job = payload.new as any;
          console.log(`📡 [Realtime] Job update received:`, job);
          
          if (job.status === 'completed' && job.response_payload) {
            console.log(`✅ [Realtime] Job completed successfully: ${jobId}`, job.response_payload);
            
            // Synchronize with ai_interactions table
            await syncAiInteraction(job);
            
            onRealtimeResult(job.response_payload);
            supabase.removeChannel(channel);
          } else if (job.status === 'error') {
            console.log(`❌ [Realtime] Job failed: ${jobId}`, job.error_message || 'Unknown error');
            onRealtimeResult({ error: job.error_message || 'Job failed' });
            supabase.removeChannel(channel);
          } else if (job.status === 'failed') {
            console.log(`❌ [Realtime] Job failed: ${jobId}`, job.error_message || 'Unknown error');
            onRealtimeResult({ error: job.error_message || 'Job failed' });
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();
    
    // Set timeout to clean up the listener and notify of timeout
    setTimeout(() => {
      console.log(`⏰ [Realtime] Timeout reached for job: ${jobId}`);
      onRealtimeResult({ error: 'Request timeout - the operation took too long to complete' });
      supabase.removeChannel(channel);
    }, 300000); // 5 minutes timeout
    
    // Return a promise that resolves when realtime result arrives
    return new Promise((resolve, reject) => {
      const originalOnRealtimeResult = onRealtimeResult;
      onRealtimeResult = (result) => {
        originalOnRealtimeResult(result);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      };
    });
  }
  
  // If HTTP succeeded, return the result immediately
  if (httpResult) {
    console.log(`🚀 [HTTP] Using immediate HTTP response for job: ${jobId}`);
    return httpResult;
  }
  
  // If both failed and no realtime fallback, throw the HTTP error
  throw httpError;
}

/**
 * Synchronize completed job with ai_interactions table
 */
async function syncAiInteraction(job: any) {
  try {
    if (!job.feature || !job.user_id) {
      console.log('⚠️ [Sync] Skipping ai_interactions sync - missing feature or user_id');
      return;
    }

    const normalizedFeatureName = normalizeFeatureName(job.feature);
    
    // Extract meaningful content from request and response
    const userQuery = extractUserQuery(job.request_payload);
    const aiResponse = job.response_payload;

    await supabase
      .from('ai_interactions')
      .insert({
        user_id: job.user_id,
        job_id: job.id,
        feature_name: normalizedFeatureName,
        user_query: userQuery,
        ai_response: aiResponse,
        created_at: job.updated_at || new Date().toISOString()
      });

    console.log(`✅ [Sync] ai_interactions updated for job: ${job.id}`);
  } catch (error) {
    console.error('❌ [Sync] Failed to sync ai_interactions:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Extract user query from request payload
 */
function extractUserQuery(requestPayload: any): string {
  if (!requestPayload) return 'No query available';
  
  // Try common query fields
  if (requestPayload.query) return requestPayload.query;
  if (requestPayload.user_query) return requestPayload.user_query;
  if (requestPayload.message) return requestPayload.message;
  if (requestPayload.content) return requestPayload.content;
  if (requestPayload.text) return requestPayload.text;
  
  // Fallback to stringified payload (truncated)
  const fallback = JSON.stringify(requestPayload);
  return fallback.length > 500 ? fallback.substring(0, 500) + '...' : fallback;
}