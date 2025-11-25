import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

interface Prescription {
  id: string;
  patient_id: string;
  diagnosis: string;
  doctor_notes: string | null;
  prescribed_medicines: any;
  created_at: string;
  status: string;
  patients: {
    full_name: string;
    contact_number: string;
  };
}

const Pharmacy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPrescriptions();
  }, []);

  const fetchPendingPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patients (
            full_name,
            contact_number
          )
        `)
        .eq("status", "pending")
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

  const handleDispense = async (prescriptionId: string) => {
    try {
      const { error } = await supabase
        .from("prescriptions")
        .update({ status: "dispensed" })
        .eq("id", prescriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medicines dispensed successfully",
      });

      // Refresh the list
      fetchPendingPrescriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto pt-8">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          className="mb-6 text-accent hover:text-accent/80 hover:bg-accent/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8 bg-card border-border">
          <h1 className="text-3xl font-bold mb-6 text-foreground">
            Pharmacy - Dispense Medicines
          </h1>

          {prescriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending prescriptions to dispense.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Prescribed Medicines</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        {prescription.patients.full_name}
                      </TableCell>
                      <TableCell>{prescription.patients.contact_number}</TableCell>
                      <TableCell>{prescription.diagnosis}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {Array.isArray(prescription.prescribed_medicines) &&
                            prescription.prescribed_medicines.map(
                              (med: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <strong>{med.medicine_name}</strong>
                                  {med.dosage && ` - ${med.dosage}`}
                                  {med.frequency && `, ${med.frequency}`}
                                  {med.duration && ` for ${med.duration}`}
                                </div>
                              )
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleDispense(prescription.id)}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          Mark as Dispensed
                        </Button>
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

export default Pharmacy;
