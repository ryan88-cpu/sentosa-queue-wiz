import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LogOut, CheckCircle, X, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { db } from "@/config/firebase/firebase.js";
import { ref, onValue, update, remove, push } from "firebase/database";

interface PatientItem {
  id: string;
  queueNumber: number;
  fullName: string;
  status: "waiting" | "being_examined" | "done";
  dateOfBirth: string;
  contactNumber: string;
  reasonForVisit: string;
  estimatedWaitTime: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<PatientItem[]>([]);

  // 🔹 Fetch patients + queue live from Firebase
  useEffect(() => {
    const patientsRef = ref(db, "patients");
    const queueRef = ref(db, "queue");

    const unsubPatients = onValue(patientsRef, (patientsSnap) => {
      const patientsData = patientsSnap.val() || {};

      onValue(queueRef, (queueSnap) => {
        const queueData = queueSnap.val() || {};
        const merged: PatientItem[] = Object.entries(queueData).map(([id, q]: any) => {
          const p = patientsData[q.patientId];
          return {
            id,
            queueNumber: q.queueNumber,
            status: q.status,
            estimatedWaitTime: q.estimatedWaitTime || 0,
            fullName: p?.fullName || "Unknown Patient",
            dateOfBirth: p?.dateOfBirth || "",
            contactNumber: p?.contactNumber || "",
            reasonForVisit: p?.reasonForVisit || "",
          };
        });

        merged.sort((a, b) => a.queueNumber - b.queueNumber);
        setPatients(merged);
      });
    });

    return () => unsubPatients();
  }, []);

  // 🔹 Mark patient as done
  const handleMarkAsDone = async (id: string) => {
    const entryRef = ref(db, `queue/${id}`);
    await update(entryRef, { status: "done" });
    toast({ title: "Patient marked as done." });
  };

  // 🔹 Cancel / remove patient
  const handleCancel = async (id: string) => {
    await remove(ref(db, `queue/${id}`));
    toast({ title: "Patient removed from queue." });
  };

  // 🔹 Move patient up or down (reorder queue numbers)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= patients.length) return;

    const newOrder = [...patients];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    // update queue numbers in Firebase
    for (let i = 0; i < newOrder.length; i++) {
      const entryRef = ref(db, `queue/${newOrder[i].id}`);
      await update(entryRef, { queueNumber: i + 1 });
    }
    toast({ title: "Queue reordered" });
  };

  // 🔹 Approve (mark from waiting -> being_examined)
  const handleApprove = async (id: string) => {
    const entryRef = ref(db, `queue/${id}`);
    await update(entryRef, { status: "being_examined" });
    toast({ title: "Patient approved for examination." });
  };

  // 🔹 Logout
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "being_examined":
        return "bg-accent text-accent-foreground";
      case "waiting":
        return "bg-secondary text-secondary-foreground";
      case "done":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Stats Summary */}
      <div className="container mx-auto px-4 py-8 grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
          <p className="text-3xl font-bold text-foreground">{patients.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Waiting</p>
          <p className="text-3xl font-bold text-accent">
            {patients.filter((p) => p.status === "waiting").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Examining</p>
          <p className="text-3xl font-bold text-accent">
            {patients.filter((p) => p.status === "being_examined").length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-bold text-accent">
            {patients.filter((p) => p.status === "done").length}
          </p>
        </Card>
      </div>

      {/* Queue Management */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Patient Queue Management
          </h2>
          {patients.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No registered patients.
            </p>
          ) : (
            <div className="space-y-4">
              {patients.map((p, index) => (
                <Card
                  key={p.id}
                  className={`p-6 ${
                    p.status === "being_examined"
                      ? "bg-accent/20 border-accent"
                      : "bg-secondary border-border"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl font-bold px-3 py-1 bg-background rounded-lg text-accent">
                        #{p.queueNumber}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {p.fullName}
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">DOB:</span>{" "}
                            {p.dateOfBirth}
                          </p>
                          <p>
                            <span className="font-medium">Contact:</span>{" "}
                            {p.contactNumber}
                          </p>
                          <p>
                            <span className="font-medium">Reason:</span>{" "}
                            {p.reasonForVisit}
                          </p>
                        </div>
                        <Badge
                          className={`${getStatusColor(p.status)} mt-2`}
                        >
                          {p.status
                            .replace("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="border-accent text-accent hover:bg-accent/10"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === patients.length - 1}
                        className="border-accent text-accent hover:bg-accent/10"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>

                      {p.status === "waiting" && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(p.id)}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      )}

                      {p.status !== "done" && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsDone(p.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          ✅ Mark Done
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(p.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;