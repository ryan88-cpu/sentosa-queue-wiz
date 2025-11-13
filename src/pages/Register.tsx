import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [queueNumber, setQueueNumber] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    contactNumber: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate random queue number
    const newQueueNumber = Math.floor(Math.random() * 100) + 1;
    setQueueNumber(newQueueNumber);
    setIsSubmitted(true);

    toast({
      title: "Registration Successful!",
      description: `Your queue number is #${newQueueNumber}`,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 bg-card border-accent animate-fade-in">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-accent/20 rounded-full">
                <CheckCircle className="w-16 h-16 text-accent" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Registration Successful!</h2>
            <div className="p-6 bg-accent/10 rounded-lg">
              <p className="text-muted-foreground mb-2">Your queue number is</p>
              <p className="text-6xl font-bold text-accent">#{queueNumber}</p>
            </div>
            <p className="text-muted-foreground">
              Please wait for your number to be called. You can check the current queue status.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/queue")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                View Current Queue
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent/10"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-6 text-accent hover:text-accent/80 hover:bg-accent/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8 bg-card border-border animate-slide-up">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Patient Registration</h1>
          <p className="text-muted-foreground mb-8">
            Please fill in your details to register for queue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">
                Full Name *
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="bg-secondary border-border text-foreground focus:border-accent"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-foreground">
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="bg-secondary border-border text-foreground focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-foreground">
                Contact Number *
              </Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                className="bg-secondary border-border text-foreground focus:border-accent"
                placeholder="+62 xxx xxxx xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-foreground">
                Reason for Visit *
              </Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="bg-secondary border-border text-foreground focus:border-accent min-h-24"
                placeholder="Please describe your symptoms or reason for visit"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-lg py-6"
            >
              Submit Registration
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
