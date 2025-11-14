import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Pill, ShoppingCart, Search, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  description: string;
}

const availableMedicines: Medicine[] = [
  { id: "1", name: "Paracetamol 500mg", category: "Pain Relief", price: 5, inStock: true, description: "For fever and mild pain" },
  { id: "2", name: "Ibuprofen 400mg", category: "Pain Relief", price: 8, inStock: true, description: "Anti-inflammatory pain relief" },
  { id: "3", name: "Amoxicillin 250mg", category: "Antibiotic", price: 15, inStock: true, description: "Broad-spectrum antibiotic" },
  { id: "4", name: "Cetirizine 10mg", category: "Allergy", price: 6, inStock: true, description: "Antihistamine for allergies" },
  { id: "5", name: "Omeprazole 20mg", category: "Digestive", price: 12, inStock: true, description: "Reduces stomach acid" },
  { id: "6", name: "Loratadine 10mg", category: "Allergy", price: 7, inStock: false, description: "24-hour allergy relief" },
  { id: "7", name: "Vitamin C 1000mg", category: "Supplement", price: 10, inStock: true, description: "Immune system support" },
  { id: "8", name: "Cough Syrup", category: "Cold & Flu", price: 9, inStock: true, description: "Relieves cough and throat irritation" },
];

export default function Medicines() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const categories = ["All", ...Array.from(new Set(availableMedicines.map(m => m.category)))];

  const filteredMedicines = availableMedicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.medicine.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
    toast.success(`${medicine.name} added to cart`);
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.medicine.id === medicineId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast.error("Please add medicines to your cart");
      return;
    }
    // Store order in localStorage for demo
    const order = {
      id: Math.floor(Math.random() * 1000),
      items: cart,
      total: totalAmount,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(`medicine-order-${order.id}`, JSON.stringify(order));
    setOrderSubmitted(true);
    toast.success("Medicine order submitted successfully!");
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
        <div className="container max-w-2xl mx-auto pt-8">
          <Card className="border-accent/20 shadow-glow animate-fade-in">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-3xl">Order Submitted!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your medicine request has been received
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                {cart.map(item => (
                  <div key={item.medicine.id} className="flex justify-between text-sm mb-1">
                    <span>{item.medicine.name} x{item.quantity}</span>
                    <span>Rp {(item.medicine.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-accent">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Please collect your medicines at the pharmacy counter after your consultation
              </p>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <Button onClick={() => navigate("/queue")} className="flex-1">
                  View Queue
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
      <div className="container max-w-7xl mx-auto pt-8">
        <div className="mb-6">
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Medicine List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-accent/20 shadow-glow animate-fade-in">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                    <Pill className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Request Medicines</CardTitle>
                    <CardDescription>Browse and order medicines for pickup</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Medicine Grid */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {filteredMedicines.map(medicine => (
                    <Card key={medicine.id} className="border-border/50 hover:border-accent/50 transition-all">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{medicine.name}</CardTitle>
                            <CardDescription className="text-xs">{medicine.category}</CardDescription>
                          </div>
                          <Badge variant={medicine.inStock ? "default" : "destructive"}>
                            {medicine.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{medicine.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-accent">Rp {medicine.price.toLocaleString('id-ID')}</span>
                          <Button 
                            size="sm" 
                            onClick={() => addToCart(medicine)}
                            disabled={!medicine.inStock}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredMedicines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No medicines found matching your search
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-accent/20 shadow-glow sticky top-4 animate-slide-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-accent" />
                  <CardTitle>Your Cart ({cart.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.medicine.id} className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{item.medicine.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.medicine.id)}
                            className="h-6 px-2"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.medicine.id, -1)}
                              className="h-7 w-7 p-0"
                            >
                              -
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.medicine.id, 1)}
                              className="h-7 w-7 p-0"
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-semibold text-accent">
                            Rp {(item.medicine.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-border pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold text-accent">Rp {totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                      <Button className="w-full" size="lg" onClick={handleSubmitOrder}>
                        Submit Order
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Pay at pharmacy counter
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
