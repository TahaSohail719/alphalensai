import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const { useState, useCallback, useEffect } = React;

interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  request_payload: any;
  response_payload?: any;
  created_at: string;
  updated_at: string;
}

interface ActiveJob {
  id: string;
  type: string;
  instrument: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime: Date;
  resultData?: any;
}

// Map job types to features for backward compatibility
const mapTypeToFeature = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'macro_commentary':
    case 'macro-commentary':
    case 'macro_analysis':
      return 'Macro Commentary';
    case 'trade_setup':
    case 'tradesetup':
    case 'ai_trade_setup':
      return 'AI Trade Setup';
    case 'reports':
    case 'report':
      return 'Report';
    default:
      return 'Macro Commentary'; // Default fallback
  }
};

export function useRealtimeJobManager() {
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Subscribe to realtime updates for jobs table
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const job = payload.new as JobStatus;
          
          if (job.status === 'completed' && job.response_payload) {
            // Update the active job with results
            setActiveJobs(prev => prev.map(activeJob => 
              activeJob.id === job.id 
                ? { 
                    ...activeJob, 
                    status: 'completed', 
                    resultData: job.response_payload 
                  }
                : activeJob
            ));

            toast({
              title: "Analysis Complete",
              description: "Your request has been processed successfully",
              duration: Infinity, // Reste visible jusqu'au clic
              className: "fixed top-4 left-4 z-[100] max-w-sm"
            });
          } else if (job.status === 'error') {
            setActiveJobs(prev => prev.map(activeJob => 
              activeJob.id === job.id 
                ? { ...activeJob, status: 'error' }
                : activeJob
            ));

            toast({
              title: "Analysis Failed",
              description: "The request could not be processed",
              variant: "destructive",
              duration: Infinity, // Reste visible jusqu'au clic
              className: "fixed top-4 left-4 z-[100] max-w-sm"
            });
          } else if (job.status === 'running') {
            setActiveJobs(prev => prev.map(activeJob => 
              activeJob.id === job.id 
                ? { ...activeJob, status: 'running' }
                : activeJob
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  const createJob = useCallback(async (
    type: string,
    instrument: string,
    requestPayload: any,
    feature?: string
  ): Promise<string> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const jobId = uuidv4();

    // Map type to feature if not explicitly provided
    const jobFeature = feature || mapTypeToFeature(type);

    // Create job in database with feature field
    const { error } = await supabase
      .from('jobs')
      .insert({
        id: jobId,
        status: 'pending',
        request_payload: requestPayload,
        user_id: user.id,
        feature: jobFeature
      });

    if (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }

    // Add to local state
    const newJob: ActiveJob = {
      id: jobId,
      type,
      instrument,
      status: 'pending',
      startTime: new Date()
    };

    setActiveJobs(prev => [...prev, newJob]);

    return jobId;
  }, [user?.id]);

  const removeJob = useCallback((jobId: string) => {
    setActiveJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const getActiveJobs = useCallback(() => {
    return activeJobs.filter(job => 
      job.status === 'pending' || job.status === 'running'
    );
  }, [activeJobs]);

  const getCompletedJobs = useCallback(() => {
    return activeJobs.filter(job => job.status === 'completed');
  }, [activeJobs]);

  return {
    activeJobs,
    createJob,
    removeJob,
    getActiveJobs,
    getCompletedJobs
  };
}