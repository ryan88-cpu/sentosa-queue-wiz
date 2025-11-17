import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Firebase imports
import { db } from "@/config/firebase/firebase.js";
import { ref, push, set, serverTimestamp } from "firebase/database";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.username === "admin" && formData.password === "admin") {
      try {
        // --- record login into Firebase ---
        const loginsRef = ref(db, "admin_logins"); // parent node 'admin_logins'
        const newLoginRef = push(loginsRef);
        await set(newLoginRef, {
          username: formData.username,
          loginTime: serverTimestamp(),
          status: "success",
        });

        toast({
          title: "Login Successful!",
          description: "Redirecting to dashboard...",
        });

        setTimeout(() => navigate("/dashboard"), 1000);
      } catch (error: any) {
        console.error("Login log error:", error);
        toast({
          title: "Firebase Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      // also log failed attempts if you like
      const loginsRef = ref(db, "admin_logins");
      const newLoginRef = push(loginsRef);
      await set(newLoginRef, {
        username: formData.username || "unknown",
        loginTime: serverTimestamp(),
        status: "failed",
      });

      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-6 text-accent hover:text-accent/80 hover:bg-accent/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8 bg-card border-border animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-accent/20 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Admin & Doctor Login</h1>
            <p className="text-muted-foreground">
              Access the dashboard to manage patient queue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-secondary border-border text-foreground focus:border-accent"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-secondary border-border text-foreground focus:border-accent"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-lg py-6"
            >
              Sign In
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p className="mt-4">Demo credentials:</p>
              <p className="font-mono">Username: admin | Password: admin</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;