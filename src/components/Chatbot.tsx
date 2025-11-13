import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm Klinik AI Assistant. How can I help you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const quickReplies = [
    "How do I register as a new patient?",
    "What's my estimated waiting time?",
    "How do I log in as a doctor?",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes("register") || lowerInput.includes("new patient")) {
        botResponse =
          "To register as a new patient, click on 'Register Patient' on the home page. Fill in your details including full name, date of birth, contact number, and reason for visit. You'll receive a queue number after submission.";
      } else if (lowerInput.includes("waiting time") || lowerInput.includes("wait")) {
        botResponse =
          "You can check your estimated waiting time by viewing the current queue. Click 'View Queue' on the home page to see real-time updates and estimated wait times for each patient.";
      } else if (lowerInput.includes("login") || lowerInput.includes("doctor") || lowerInput.includes("admin")) {
        botResponse =
          "To log in as a doctor or admin, click on 'Login' on the home page. Enter your credentials to access the dashboard where you can manage patient queues. Demo credentials: username 'admin', password 'admin'.";
      } else if (lowerInput.includes("queue")) {
        botResponse =
          "The queue system shows all patients waiting for examination. You can see queue numbers, patient initials, current status, and estimated waiting times. The system updates in real-time.";
      } else {
        botResponse =
          "I'm here to help with patient registration, queue information, and login assistance. Please select one of the quick replies or ask me about these topics!";
      }

      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    }, 1000);

    setInput("");
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    handleSend();
  };

  return (
    <>
      {/* Chat bubble button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-card border-accent shadow-2xl flex flex-col animate-slide-up z-50">
          {/* Header */}
          <div className="bg-accent text-accent-foreground p-4 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Klinik AI Assistant 💬</h3>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}

            {/* Quick replies */}
            {messages.length === 1 && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-xs text-muted-foreground text-center">Quick replies:</p>
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    variant="outline"
                    className="w-full text-left text-xs h-auto py-2 border-accent text-accent hover:bg-accent/10 justify-start"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="bg-secondary border-border text-foreground focus:border-accent"
              />
              <Button
                onClick={handleSend}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
