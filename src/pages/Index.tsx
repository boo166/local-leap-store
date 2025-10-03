import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StoreShowcase from "@/components/StoreShowcase";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import WelcomeBanner from "@/components/WelcomeBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <WelcomeBanner />
      <HeroSection />
      <FeaturesSection />
      <StoreShowcase />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
