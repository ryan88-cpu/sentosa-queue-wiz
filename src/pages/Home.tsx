import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, LogIn } from "lucide-react";
import clinicHero from "@/assets/clinic-hero.jpg";
import doctorIcon from "@/assets/doctor-icon.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <img src={doctorIcon} alt="Klinik Sentosa" className="w-20 h-20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Klinik Sentosa Queue Management System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Efficient patient registration and queue management for better healthcare.
          </p>
        </div>

        <div className="relative mb-12 rounded-2xl overflow-hidden animate-slide-up">
          <img 
            src={clinicHero} 
            alt="Clinic" 
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card 
            className="p-8 bg-card border-border hover:border-accent transition-all duration-300 cursor-pointer card-hover group"
            onClick={() => navigate("/register")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Register Patient</h2>
              <p className="text-muted-foreground text-sm">
                Quick and easy patient registration for new and returning visitors
              </p>
              <Button 
                variant="default" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                Get Started
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 bg-card border-border hover:border-accent transition-all duration-300 cursor-pointer card-hover group"
            onClick={() => navigate("/queue")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                <ClipboardList className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">View Queue</h2>
              <p className="text-muted-foreground text-sm">
                Check current queue status and estimated waiting times
              </p>
              <Button 
                variant="default" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                View Now
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 bg-card border-border hover:border-accent transition-all duration-300 cursor-pointer card-hover group"
            onClick={() => navigate("/login")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                <LogIn className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Login</h2>
              <p className="text-muted-foreground text-sm">
                Access admin dashboard or doctor portal
              </p>
              <Button 
                variant="default" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                Sign In
              </Button>
            </div>
          </Card>
        </div>

        <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border">
          <p>© 2025 Klinik Sentosa | Powered by Klinik AI Assistant</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
