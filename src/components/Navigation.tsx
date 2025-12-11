import { Button } from "@/components/ui/button";
import { Store, ShoppingBag, User, Menu, LogOut, Package, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CartIcon from "@/components/CartIcon";
import UserQuickMenu from "@/components/UserQuickMenu";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user, signOut } = useAuth();
  const { isAdmin, hasRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, email')
      .eq('user_id', user?.id)
      .single();
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
  };

  return (
    <nav className="glass border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-apple p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">GlassStore</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-foreground hover:text-primary transition-smooth">
              Stores
            </Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-smooth">
              Products
            </Link>
            {user && (
              <>
                <Link to="/orders" className="text-foreground hover:text-primary transition-smooth">
                  Orders
                </Link>
                <Link to="/wishlist" className="text-foreground hover:text-primary transition-smooth">
                  Wishlist
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-smooth">
                Admin
              </Link>
            )}
            {(hasRole('seller') || isAdmin) && (
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-smooth">
                Seller Dashboard
              </Link>
            )}
            {user && !hasRole('seller') && !isAdmin && (
              <Link to="/become-seller" className="text-primary font-medium hover:text-primary/80 transition-smooth">
                Become a Seller
              </Link>
            )}
          </div>

          {/* Cart Icon */}
          <CartIcon />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserQuickMenu profile={profile || undefined} />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button variant="apple" size="sm" onClick={() => navigate('/auth')}>
                  Start Selling
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/marketplace" className="text-foreground hover:text-primary transition-smooth">
                Stores
              </Link>
              <Link to="/products" className="text-foreground hover:text-primary transition-smooth">
                Products
              </Link>
              {user && (
                <>
                  <Link to="/orders" className="text-foreground hover:text-primary transition-smooth">
                    Orders
                  </Link>
                  <Link to="/wishlist" className="text-foreground hover:text-primary transition-smooth">
                    Wishlist
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-foreground hover:text-primary transition-smooth">
                      Admin
                    </Link>
                  )}
                  {(hasRole('seller') || isAdmin) && (
                    <Link to="/dashboard" className="text-foreground hover:text-primary transition-smooth">
                      Seller Dashboard
                    </Link>
                  )}
                  {!hasRole('seller') && !isAdmin && (
                    <Link to="/become-seller" className="text-primary font-medium hover:text-primary/80 transition-smooth">
                      Become a Seller
                    </Link>
                  )}
                </>
              )}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                    <Button variant="apple" size="sm" onClick={() => navigate('/auth')}>
                      Start Selling
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;