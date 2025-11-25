import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, LogOut, FileText, Pill, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/config/firebase/firebase";
import { ref, remove } from "firebase/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Patient {
  id: string;
  full_name: string;
  contact_number: string;
  date_of_birth: string;
  reason_for_visit: string;
  created_at: string;
}

interface Prescription {
  id: string;
  diagnosis: string;
  doctor_notes: string | null;
  prescribed_medicines: any;
  created_at: string;
  updated_at: string;
  status: string;
  patients: Patient;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [completedPrescriptions, setCompletedPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Check localStorage to know if dashboard was cleared previously
  const dashboardCleared = localStorage.getItem("dashboardCleared") === "true";

  useEffect(() => {
    // ✅ Only fetch data if dashboard hasn't been cleared
    if (!dashboardCleared) {
      fetchPrescriptions();
      fetchCompletedPrescriptions();
    } else {
      setLoading(false);
    }
  }, [dashboardCleared]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(
          `
          *,
          patients (
            id,
            full_name,
            contact_number,
            date_of_birth,
            reason_for_visit,
            created_at
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(
          `
          *,
          patients (
            id,
            full_name,
            contact_number,
            date_of_birth,
            reason_for_visit,
            created_at
          )
        `
        )
        .eq("status", "dispensed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompletedPrescriptions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearAllPatients = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to CLEAR all patient records from the dashboard view? This will not delete any data from Firebase or Supabase."
    );
    if (!confirmClear) return;

    try {
      // Still not touching database content
      // await remove(ref(db, "patients"));

      // ✅ Clear local states
      setPrescriptions([]);
      setCompletedPrescriptions([]);

      // ✅ Remember user cleared dashboard view
      localStorage.setItem("dashboardCleared", "true");

      toast({
        title: "Dashboard data cleared",
        description: "Patient diagnosis and completed records have been cleared from the dashboard view.",
      });
    } catch (error: any) {
      toast({
        title: "Error clearing records",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ✅ Provide a Reset button if user wants data back
  const restoreDashboardData = async () => {
    localStorage.removeItem("dashboardCleared");
    toast({
      title: "Dashboard data restored",
      description: "Refreshing data from Supabase...",
    });
    setLoading(true);
    fetchPrescriptions();
    fetchCompletedPrescriptions();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="container max-w-7xl mx-auto pt-8">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-accent hover:text-accent/80 hover:bg-accent/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage patients, queue, and clinic operations
          </p>
        </div>

        {/* Functional Cards */}
        <div className="flex flex-col items-center justify-center min-h-[50vh] mb-12">
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            {/* Patient Queue */}
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group w-72">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Patient Queue</h3>
                <Button
                  onClick={() => navigate("/queue")}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  View Queue
                </Button>
              </div>
            </Card>

            {/* Prescriptions */}
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group w-72">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors">
                  <FileText className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Prescriptions</h3>
                <Button
                  onClick={() => navigate("/prescriptions")}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Create New
                </Button>
              </div>
            </Card>

            {/* Pharmacy */}
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group w-72">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors">
                  <Pill className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Pharmacy</h3>
                <Button
                  onClick={() => navigate("/pharmacy")}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Dispense Medicines
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Diagnosis Section */}
        <Card className="p-6 bg-card border-border mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Patient Diagnosis Data</h2>

            <div className="flex gap-3">
              {/* ✅ Clear Button */}
              <Button
                onClick={clearAllPatients}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Patient Records
              </Button>

              {/* ✅ Restore Button appears only if dashboard was cleared */}
              {dashboardCleared && (
                <Button
                  onClick={restoreDashboardData}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  Restore Data
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No prescriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Prescribed Medicines</TableHead>
                    <TableHead>Doctor's Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.patients.full_name}</TableCell>
                      <TableCell>{p.diagnosis}</TableCell>
                      <TableCell>
                        {Array.isArray(p.prescribed_medicines) &&
                          p.prescribed_medicines.map((m: any, i: number) => (
                            <div key={i}>
                              <span className="font-medium">{m.medicine_name}</span>
                              <div className="text-sm text-muted-foreground">
                                {m.dosage} - {m.frequency} for {m.duration}
                              </div>
                            </div>
                          ))}
                      </TableCell>
                      <TableCell>{p.doctor_notes || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            p.status === "dispensed"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Completed Records */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Completed Patient Records (Dispensed)
            </h2>
          </div>

          {completedPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No completed prescriptions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Prescribed Medicines</TableHead>
                    <TableHead>Doctor's Notes</TableHead>
                    <TableHead>Date Dispensed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedPrescriptions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.patients.full_name}</TableCell>
                      <TableCell>{p.diagnosis}</TableCell>
                      <TableCell>
                        {Array.isArray(p.prescribed_medicines) &&
                          p.prescribed_medicines.map((m: any, i: number) => (
                            <div key={i}>
                              <span className="font-medium">{m.medicine_name}</span>
                              <div className="text-sm text-muted-foreground">
                                {m.dosage} - {m.frequency} for {m.duration}
                              </div>
                            </div>
                          ))}
                      </TableCell>
                      <TableCell>{p.doctor_notes || "—"}</TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;