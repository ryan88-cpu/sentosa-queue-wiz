import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  full_name: string;
  contact_number: string;
  date_of_birth: string;
  reason_for_visit: string;
}

interface PrescribedMedicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const Prescriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([
    { medicine_name: "", dosage: "", frequency: "", duration: "" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
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

  const addMedicineField = () => {
    setPrescribedMedicines([
      ...prescribedMedicines,
      { medicine_name: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removeMedicineField = (index: number) => {
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof PrescribedMedicine, value: string) => {
    const updated = [...prescribedMedicines];
    updated[index][field] = value;
    setPrescribedMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    if (!diagnosis.trim()) {
      toast({
        title: "Error",
        description: "Please enter a diagnosis",
        variant: "destructive",
      });
      return;
    }

    const validMedicines = prescribedMedicines.filter(
      (med) => med.medicine_name.trim() !== ""
    );

    try {
      const { error } = await supabase.from("prescriptions").insert({
        patient_id: selectedPatient,
        diagnosis,
        doctor_notes: doctorNotes,
        prescribed_medicines: validMedicines,
      } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      // Reset form
      setSelectedPatient("");
      setDiagnosis("");
      setDoctorNotes("");
      setPrescribedMedicines([{ medicine_name: "", dosage: "", frequency: "", duration: "" }]);
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
      <div className="container max-w-4xl mx-auto pt-8">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          className="mb-6 text-accent hover:text-accent/80 hover:bg-accent/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8 bg-card border-border">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Create Prescription</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patient" className="text-foreground">
                Select Patient
              </Label>
              <select
                id="patient"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
                className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-foreground focus:border-accent focus:outline-none"
              >
                <option value="">-- Select a patient --</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} - {patient.reason_for_visit}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-foreground">
                Diagnosis
              </Label>
              <Input
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
                className="bg-secondary border-border text-foreground focus:border-accent"
                placeholder="Enter diagnosis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">
                Doctor's Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="bg-secondary border-border text-foreground focus:border-accent min-h-[100px]"
                placeholder="Additional notes or observations"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Prescribed Medicines</Label>
                <Button
                  type="button"
                  onClick={addMedicineField}
                  variant="outline"
                  size="sm"
                  className="text-accent border-accent hover:bg-accent/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medicine
                </Button>
              </div>

              {prescribedMedicines.map((medicine, index) => (
                <Card key={index} className="p-4 bg-secondary/50 border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-foreground">
                      Medicine {index + 1}
                    </h4>
                    {prescribedMedicines.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMedicineField(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Medicine Name</Label>
                      <Input
                        value={medicine.medicine_name}
                        onChange={(e) =>
                          updateMedicine(index, "medicine_name", e.target.value)
                        }
                        className="bg-background border-border text-foreground"
                        placeholder="e.g., Paracetamol"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Dosage</Label>
                      <Input
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                        className="bg-background border-border text-foreground"
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Frequency</Label>
                      <Input
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                        className="bg-background border-border text-foreground"
                        placeholder="e.g., 3 times daily"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Duration</Label>
                      <Input
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                        className="bg-background border-border text-foreground"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-lg py-6"
            >
              Create Prescription
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Prescriptions;
