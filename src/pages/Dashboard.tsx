import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LogOut, Edit, CheckCircle, X, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: number;
  queueNumber: number;
  fullName: string;
  status: "waiting" | "examining" | "done";
  dateOfBirth: string;
  contactNumber: string;
  reason: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      queueNumber: 1,
      fullName: "Alice Brown",
      status: "examining",
      dateOfBirth: "1990-01-15",
      contactNumber: "+62 812 3456 7890",
      reason: "Regular checkup",
    },
    {
      id: 2,
      queueNumber: 2,
      fullName: "Charlie Davis",
      status: "waiting",
      dateOfBirth: "1985-05-20",
      contactNumber: "+62 813 4567 8901",
      reason: "Fever and cough",
    },
    {
      id: 3,
      queueNumber: 3,
      fullName: "Emma Foster",
      status: "waiting",
      dateOfBirth: "1995-08-10",
      contactNumber: "+62 814 5678 9012",
      reason: "Follow-up visit",
    },
  ]);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const handleMarkAsDone = (id: number) => {
    setPatients(
      patients.map((p) => (p.id === id ? { ...p, status: "done" as const } : p))
    );
    toast({
      title: "Status Updated",
      description: "Patient marked as done",
    });
  };

  const handleCancel = (id: number) => {
    setPatients(patients.filter((p) => p.id !== id));
    toast({
      title: "Patient Removed",
      description: "Patient has been removed from queue",
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newPatients = [...patients];
    [newPatients[index - 1], newPatients[index]] = [newPatients[index], newPatients[index - 1]];
    setPatients(newPatients);
  };

  const handleMoveDown = (index: number) => {
    if (index === patients.length - 1) return;
    const newPatients = [...patients];
    [newPatients[index], newPatients[index + 1]] = [newPatients[index + 1], newPatients[index]];
    setPatients(newPatients);
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
            <p className="text-3xl font-bold text-foreground">{patients.length}</p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Waiting</p>
            <p className="text-3xl font-bold text-accent">
              {patients.filter((p) => p.status === "waiting").length}
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Examining</p>
            <p className="text-3xl font-bold text-accent">
              {patients.filter((p) => p.status === "examining").length}
            </p>
          </Card>
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-3xl font-bold text-accent">
              {patients.filter((p) => p.status === "done").length}
            </p>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Patient Queue Management</h2>
          <div className="space-y-4">
            {patients.map((patient, index) => (
              <Card
                key={patient.id}
                className={`p-6 ${
                  patient.status === "examining"
                    ? "bg-accent/20 border-accent"
                    : "bg-secondary border-border"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl font-bold px-3 py-1 bg-background rounded-lg text-accent">
                      #{patient.queueNumber}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {patient.fullName}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">DOB:</span> {patient.dateOfBirth}
                        </p>
                        <p>
                          <span className="font-medium">Contact:</span> {patient.contactNumber}
                        </p>
                        <p>
                          <span className="font-medium">Reason:</span> {patient.reason}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(patient.status)} mt-2`}>
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="border-accent text-accent hover:bg-accent/10"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === patients.length - 1}
                      className="border-accent text-accent hover:bg-accent/10"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsDone(patient.id)}
                      disabled={patient.status === "done"}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Mark Done
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(patient.id)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
