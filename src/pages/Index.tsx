import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StoreShowcase from "@/components/StoreShowcase";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import WelcomeBanner from "@/components/WelcomeBanner";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      {user && <WelcomeBanner />}
      <main>
        <HeroSection />
        <FeaturesSection />
        <StoreShowcase />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
