import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useRealtimeJobManager } from "@/hooks/useRealtimeJobManager";

export function JobStatusCards() {
  const { activeJobs, removeJob } = useRealtimeJobManager();

  if (activeJobs.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
      {activeJobs.map((job) => (
        <Card key={job.id} className="bg-background/95 backdrop-blur border shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {job.status === 'pending' && (
                    <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                  )}
                  {job.status === 'running' && (
                    <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                  )}
                  {job.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {job.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {job.instrument}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {job.status === 'pending' && "Query is being processed..."}
                  {job.status === 'running' && "Analysis in progress..."}
                  {job.status === 'completed' && "Analysis completed"}
                  {job.status === 'error' && "Analysis failed"}
                </p>

                {(job.status === 'pending' || job.status === 'running') && (
                  <Progress 
                    value={job.status === 'pending' ? 15 : 75} 
                    className="h-1 mb-2"
                  />
                )}

                <div className="text-xs text-muted-foreground">
                  Started {job.startTime.toLocaleTimeString()}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={() => removeJob(job.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}