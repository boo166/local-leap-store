import { Store, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-hero p-2 rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">VillageMarket</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Empowering local businesses across Africa with digital commerce solutions. 
              Building stronger communities through technology.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white transition-smooth cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white transition-smooth cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white transition-smooth cursor-pointer" />
            </div>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-lg font-semibold mb-6">For Sellers</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Start Selling</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Seller Dashboard</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Payment Methods</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Marketing Tools</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Success Stories</a></li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h3 className="text-lg font-semibold mb-6">For Buyers</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Browse Stores</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Categories</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">My Orders</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Customer Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-smooth">Return Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">hello@villagemarket.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 VillageMarket. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-smooth">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-smooth">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-smooth">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;