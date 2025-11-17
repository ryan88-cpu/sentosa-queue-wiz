import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/config/firebase/firebase.js";
import { ref, onValue } from "firebase/database";

interface QueueEntry {
  id: string;
  queueNumber: number;
  status: string;
  estimatedWaitTime: number;
  patientId: string;
  fullName: string;
}

export default function Queue() {
  const navigate = useNavigate();
  const [queueData, setQueueData] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch queue from Firebase
  useEffect(() => {
    const queueRef = ref(db, "queue");
    const patientsRef = ref(db, "patients");

    // live listener for queue + patients
    const unsubscribeQueue = onValue(queueRef, (snapshot) => {
      const queueObj = snapshot.val() || {};
      const tempQueue: QueueEntry[] = Object.entries(queueObj).map(
        ([id, value]: any) => ({
          id,
          queueNumber: value.queueNumber,
          status: value.status,
          estimatedWaitTime: value.estimatedWaitTime || 0,
          patientId: value.patientId,
          fullName: "", // will fill later
        })
      );

      // load patient details to match
      onValue(patientsRef, (patientsSnap) => {
        const patientsObj = patientsSnap.val() || {};
        const merged = tempQueue.map((entry) => ({
          ...entry,
          fullName:
            patientsObj[entry.patientId]?.fullName || "Unknown Patient",
        }));

        const visible = merged
          .filter(
            (q) =>
              q.status === "waiting" || q.status === "being_examined"
          )
          .sort((a, b) => a.queueNumber - b.queueNumber);

        setQueueData(visible);
        setLoading(false);
      });
    });

    return () => unsubscribeQueue();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline">Waiting</Badge>;
      case "being_examined":
        return (
          <Badge className="bg-accent text-accent-foreground">
            Being Examined
          </Badge>
        );
      default:
        return <Badge variant="secondary">Done</Badge>;
    }
  };

  const getInitials = (fullName: string) =>
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
          <p>Loading queue...</p>
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
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  autoRefresh ? "animate-spin" : ""
                }`}
              />
              {autoRefresh ? "Live Updates ON" : "Live Updates OFF"}
            </Button>
          </div>
        </div>

        <Card className="border-accent/20 shadow-glow animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Current Queue
            </CardTitle>
            <p className="text-center text-accent text-sm mt-2">
              Only patients who registered are shown here
            </p>
          </CardHeader>

          <CardContent>
            {queueData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No patients in queue
                </p>
                <Button onClick={() => navigate("/register")}>
                  Register New Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {queueData.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`border-border/50 ${
                      entry.status === "being_examined"
                        ? "bg-accent/10 border-accent/50"
                        : "bg-card"
                    } transition-all animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-accent">
                              #{entry.queueNumber}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">
                              {entry.fullName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(entry.status)}
                              {entry.status === "waiting" && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Est. wait: ~{entry.estimatedWaitTime} min
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {entry.status === "being_examined" && (
                          <div className="text-accent font-semibold animate-pulse">
                            NOW SERVING
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

        <p className="text-sm text-muted-foreground text-center mt-6">
          Real‑time queue updates • {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}