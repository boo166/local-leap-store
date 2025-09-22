import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingCart, CreditCard, BarChart3, Users, Shield } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Store,
      title: "Easy Store Setup",
      description: "Create your online store in minutes with our intuitive setup process. No technical skills required.",
      color: "bg-primary"
    },
    {
      icon: ShoppingCart,
      title: "Product Management",
      description: "Upload products, manage inventory, and organize your catalog with our powerful tools.",
      color: "bg-secondary"
    },
    {
      icon: CreditCard,
      title: "Local Payments",
      description: "Accept M-Pesa, mobile money, and bank transfers. Get paid instantly and securely.",
      color: "bg-accent"
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      description: "Track your performance with detailed analytics and insights to grow your business.",
      color: "bg-primary"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Build relationships with your customers through reviews, orders, and communication tools.",
      color: "bg-secondary"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security. Focus on selling, we handle the rest.",
      color: "bg-accent"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features designed specifically for local businesses in emerging markets. 
            Start selling online and reach customers beyond your village.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover-lift glass-card cursor-pointer">
              <CardHeader>
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;