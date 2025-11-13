import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Clock } from "lucide-react";

interface QueueItem {
  queueNumber: number;
  patientInitials: string;
  status: "waiting" | "examining" | "done";
  estimatedWait: number;
}

const Queue = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([
    { queueNumber: 1, patientInitials: "A.B.", status: "examining", estimatedWait: 0 },
    { queueNumber: 2, patientInitials: "C.D.", status: "waiting", estimatedWait: 15 },
    { queueNumber: 3, patientInitials: "E.F.", status: "waiting", estimatedWait: 30 },
    { queueNumber: 4, patientInitials: "G.H.", status: "waiting", estimatedWait: 45 },
    { queueNumber: 5, patientInitials: "I.J.", status: "waiting", estimatedWait: 60 },
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "examining":
        return "bg-accent text-accent-foreground";
      case "waiting":
        return "bg-secondary text-secondary-foreground";
      case "done":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "examining":
        return "Being Examined";
      case "waiting":
        return "Waiting";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-accent hover:text-accent/80 hover:bg-accent/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="border-accent text-accent hover:bg-accent/10"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="p-6 bg-accent/10 border-accent mb-6 animate-fade-in">
          <p className="text-center text-lg font-medium text-foreground">
            Please wait for your number to be called.
          </p>
        </Card>

        <div className="mb-6 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Current Queue</h1>
          <p className="text-muted-foreground">Real-time queue status and estimated waiting times</p>
        </div>

        <div className="space-y-4">
          {queue.map((item) => (
            <Card
              key={item.queueNumber}
              className={`p-6 border-2 transition-all duration-300 ${
                item.status === "examining"
                  ? "bg-accent/20 border-accent shadow-lg shadow-accent/20"
                  : "bg-card border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`text-3xl font-bold px-4 py-2 rounded-lg ${
                      item.status === "examining"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    #{item.queueNumber}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-foreground">{item.patientInitials}</p>
                    <Badge className={`${getStatusColor(item.status)} mt-2`}>
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                </div>
                {item.status === "waiting" && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-medium">~{item.estimatedWait} min</span>
                  </div>
                )}
                {item.status === "examining" && (
                  <div className="flex items-center space-x-2 text-accent font-semibold text-lg">
                    <span className="animate-pulse">● Now Being Examined</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4">Queue Information</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-accent">{queue.filter(q => q.status === "waiting").length}</p>
              <p className="text-sm text-muted-foreground mt-1">Waiting</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-accent">{queue.filter(q => q.status === "examining").length}</p>
              <p className="text-sm text-muted-foreground mt-1">Being Examined</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-accent">~{queue.find(q => q.status === "waiting")?.estimatedWait || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Next Wait (min)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Queue;
