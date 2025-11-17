import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Import Firebase Realtime Database functions and your db instance
import { db } from "@/config/firebase/firebase.js";  // Adjust the path if needed
import { ref, set, push, runTransaction, serverTimestamp } from "firebase/database";

export default function Register() {
  const navigate = useNavigate();
  const [submittedQueueNumber, setSubmittedQueueNumber] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    contactNumber: "",
    reasonForVisit: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.dateOfBirth || !formData.contactNumber || !formData.reasonForVisit) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // --- Firebase Logic Start ---

      // 1. Get the next queue number using a transaction to avoid race conditions
      const queueCounterRef = ref(db, 'queueCounter');
      let newQueueNumber: number | null = null;
      
      const transactionResult = await runTransaction(queueCounterRef, (currentValue) => {
        // If the counter doesn't exist, initialize it. Otherwise, increment it.
        return (currentValue || 0) + 1;
      });

      if (!transactionResult.committed || transactionResult.snapshot.val() === null) {
        throw new Error("Failed to get a queue number.");
      }
      newQueueNumber = transactionResult.snapshot.val();

      // 2. Create a new patient entry in the 'patients' collection
      const patientsListRef = ref(db, 'patients');
      const newPatientRef = push(patientsListRef); // `push` creates a unique ID
      const newPatientId = newPatientRef.key;

      if (!newPatientId) {
        throw new Error("Failed to create a patient ID.");
      }

      await set(newPatientRef, {
        ...formData,
        createdAt: serverTimestamp(), // Store the registration time
      });

      // 3. Create a new queue entry in the 'queue' collection
      const queueListRef = ref(db, 'queue');
      const newQueueEntryRef = push(queueListRef); // `push` creates a unique ID for the queue item

      await set(newQueueEntryRef, {
        patientId: newPatientId,
        queueNumber: newQueueNumber,
        fullName: formData.fullName, // Denormalize for easy display in the queue list
        status: 'waiting',
        estimatedWaitTime: (newQueueNumber || 0) * 15, // Use the new queue number
        registeredAt: serverTimestamp(),
      });
      
      // --- Firebase Logic End ---

      setSubmittedQueueNumber(newQueueNumber);
      toast.success("Registration successful!");
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      toast.error("Registration failed: " + error.message);
    }
  };

  // The rest of your component's JSX remains the same
  if (submittedQueueNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
        <div className="container max-w-md mx-auto pt-16">
          <Card className="border-accent/20 shadow-glow animate-fade-in">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-3xl">Registration Successful!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your queue number is
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-accent/10 p-8 rounded-lg text-center">
                <span className="text-6xl font-bold text-accent">#{submittedQueueNumber}</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Please wait for your number to be called. You can check the current queue status.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/queue")} className="flex-1">
                  View Current Queue
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="container max-w-2xl mx-auto pt-8">
        <Button onClick={() => navigate("/")} variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-accent/20 shadow-glow animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl">Patient Registration</CardTitle>
            <CardDescription>
              Please fill in your details to register for the queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g., +62 812-3456-7890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
                <Textarea
                  id="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  placeholder="Brief description of your medical concern"
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Registration
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}