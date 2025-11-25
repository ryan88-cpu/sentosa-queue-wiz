import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Activity, Package, LogOut, FileText, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    fetchPrescriptions();
    fetchCompletedPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patients (
            id,
            full_name,
            contact_number,
            date_of_birth,
            reason_for_visit,
            created_at
          )
        `)
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
        .select(`
          *,
          patients (
            id,
            full_name,
            contact_number,
            date_of_birth,
            reason_for_visit,
            created_at
          )
        `)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="container max-w-7xl mx-auto pt-8">
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

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage patients, queue, and clinic operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
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

          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors">
                <Activity className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Patient Records</h3>
              <Button 
                onClick={() => navigate("/register")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                View Records
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors">
                <Package className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Medicine Inventory</h3>
              <Button 
                onClick={() => navigate("/medicines")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                View Inventory
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
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

          <Card className="p-6 bg-card border-border hover:shadow-lg transition-all cursor-pointer group">
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

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Patient Diagnosis Data</h2>
            <Button
              onClick={fetchPrescriptions}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              Refresh
            </Button>
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
                  {prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        {prescription.patients.full_name}
                      </TableCell>
                      <TableCell>{prescription.diagnosis}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {Array.isArray(prescription.prescribed_medicines) &&
                            prescription.prescribed_medicines.map((med: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Pill className="h-3 w-3 text-accent" />
                                  <span className="font-medium">{med.medicine_name}</span>
                                </div>
                                <div className="text-muted-foreground ml-4">
                                  {med.dosage} - {med.frequency} for {med.duration}
                                </div>
                              </div>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {prescription.doctor_notes || <span className="text-muted-foreground italic">No notes</span>}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            prescription.status === "dispensed"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {prescription.status === "dispensed" ? "Dispensed" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-card border-border mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Completed Patient Records (Dispensed)</h2>
            <Button
              onClick={fetchCompletedPrescriptions}
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
            >
              Refresh
            </Button>
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
                  {completedPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        {prescription.patients.full_name}
                      </TableCell>
                      <TableCell>{prescription.diagnosis}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {Array.isArray(prescription.prescribed_medicines) &&
                            prescription.prescribed_medicines.map((med: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Pill className="h-3 w-3 text-accent" />
                                  <span className="font-medium">{med.medicine_name}</span>
                                </div>
                                <div className="text-muted-foreground ml-4">
                                  {med.dosage} - {med.frequency} for {med.duration}
                                </div>
                              </div>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {prescription.doctor_notes || <span className="text-muted-foreground italic">No notes</span>}
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.created_at).toLocaleDateString()}
                      </TableCell>
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
