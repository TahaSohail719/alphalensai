/**
 * Global SessionGuard to track active jobs and prevent forced logouts during job execution.
 * Persists job context across refreshes for seamless recovery.
 */

import { useEffect, useState, useCallback } from 'react';

interface JobContext {
  jobId: string;
  feature: string;
  startedAt: number;
}

export function useActiveJobsGuard() {
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);
  const [jobContext, setJobContext] = useState<JobContext | null>(null);

  // Initialize from sessionStorage
  useEffect(() => {
    try {
      const storedCount = sessionStorage.getItem('activeJobsCount');
      const storedContext = sessionStorage.getItem('activeJobContext');
      
      if (storedCount) {
        const count = parseInt(storedCount, 10);
        setActiveJobsCount(count);
        console.log('[SessionGuard] Restored active jobs count:', count);
      }
      
      if (storedContext) {
        const context = JSON.parse(storedContext);
        setJobContext(context);
        console.log('[SessionGuard] Restored job context:', context);
      }
    } catch (error) {
      console.error('[SessionGuard] Failed to restore from sessionStorage:', error);
    }
  }, []);

  // Persist to sessionStorage whenever count or context changes
  useEffect(() => {
    try {
      sessionStorage.setItem('activeJobsCount', activeJobsCount.toString());
      console.log('[SessionGuard] Updated activeJobsCount:', activeJobsCount);
    } catch (error) {
      console.error('[SessionGuard] Failed to persist activeJobsCount:', error);
    }
  }, [activeJobsCount]);

  useEffect(() => {
    try {
      if (jobContext) {
        sessionStorage.setItem('activeJobContext', JSON.stringify(jobContext));
        console.log('[SessionGuard] Updated job context:', jobContext);
      } else {
        sessionStorage.removeItem('activeJobContext');
      }
    } catch (error) {
      console.error('[SessionGuard] Failed to persist jobContext:', error);
    }
  }, [jobContext]);

  const startJob = useCallback((jobId: string, feature: string) => {
    const context: JobContext = {
      jobId,
      feature,
      startedAt: Date.now()
    };
    
    setJobContext(context);
    setActiveJobsCount(prev => prev + 1);
    
    console.log('[SessionGuard] Job started:', {
      jobId,
      feature,
      newCount: activeJobsCount + 1
    });
  }, [activeJobsCount]);

  const endJob = useCallback(() => {
    setActiveJobsCount(prev => Math.max(0, prev - 1));
    
    // Clear context when no more jobs
    if (activeJobsCount <= 1) {
      setJobContext(null);
    }
    
    console.log('[SessionGuard] Job ended:', {
      newCount: Math.max(0, activeJobsCount - 1)
    });
  }, [activeJobsCount]);

  const isJobInProgress = useCallback(() => {
    return activeJobsCount > 0;
  }, [activeJobsCount]);

  return {
    activeJobsCount,
    jobContext,
    startJob,
    endJob,
    isJobInProgress
  };
}
