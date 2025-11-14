import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QueueEntry {
  id: string;
  queue_number: number;
  status: string;
  estimated_wait_time: number;
  patient_id: string;
  patients: {
    full_name: string;
  };
}

export default function Queue() {
  const navigate = useNavigate();
  const [queueData, setQueueData] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          id,
          queue_number,
          status,
          estimated_wait_time,
          patient_id,
          patients (
            full_name
          )
        `)
        .in('status', ['waiting', 'being_examined'])
        .order('queue_number', { ascending: true });

      if (error) throw error;
      setQueueData(data || []);
    } catch (error: any) {
      toast.error("Failed to load queue: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Set up realtime subscription
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(fetchQueue, 30000) : null;

    return () => {
      supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="outline">Waiting</Badge>;
      case 'being_examined':
        return <Badge className="bg-accent text-accent-foreground">Being Examined</Badge>;
      default:
        return <Badge variant="secondary">Done</Badge>;
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
          <p className="text-muted-foreground">Loading queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="container max-w-4xl mx-auto pt-8">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button onClick={fetchQueue} variant="outline" size="sm">
              Refresh Now
            </Button>
          </div>
        </div>

        <Card className="border-accent/20 shadow-glow animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Current Queue</CardTitle>
            <p className="text-center text-accent text-sm mt-2">
              Please wait for your number to be called
            </p>
          </CardHeader>
          <CardContent>
            {queueData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No patients in queue</p>
                <Button onClick={() => navigate("/register")}>
                  Register New Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {queueData.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`border-border/50 ${
                      entry.status === 'being_examined'
                        ? 'bg-accent/10 border-accent/50'
                        : 'bg-card'
                    } transition-all animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-accent">
                              #{entry.queue_number}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">
                              Patient {getInitials(entry.patients.full_name)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(entry.status)}
                              {entry.status === 'waiting' && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Est. wait: ~{entry.estimated_wait_time} min
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {entry.status === 'being_examined' && (
                          <div className="text-accent font-semibold animate-pulse">
                            NOW SERVING
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Queue updates automatically • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
