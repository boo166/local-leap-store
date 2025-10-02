import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-2xl glass border-white/20 text-center">
          <div className="p-12 space-y-6">
            <div className="w-24 h-24 bg-gradient-apple rounded-full flex items-center justify-center mx-auto">
              <Search className="w-12 h-12 text-white" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-6xl font-bold bg-gradient-apple bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-3xl font-bold text-foreground">
                Page Not Found
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  variant="apple"
                  size="lg"
                  className="min-w-[200px]"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go to Home
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] glass border-white/20 hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Go Back
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground pt-4">
                Requested path: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
