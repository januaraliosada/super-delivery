import { Facebook, Twitter, Instagram, Smartphone, Mail, MapPin } from 'lucide-react';
import '../App.css';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-green-400">SUPER DELIVERY</h3>
            <p className="text-gray-300 mb-4">
              Your favorite food delivered fast, fresh, and with a smile. Order from the best restaurants in your area.
            </p>
            <div className="flex space-x-4">
              <Facebook className="text-gray-400 hover:text-green-400 cursor-pointer" size={20} />
              <Twitter className="text-gray-400 hover:text-green-400 cursor-pointer" size={20} />
              <Instagram className="text-gray-400 hover:text-green-400 cursor-pointer" size={20} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400">About Us</a></li>
              <li><a href="#" className="hover:text-green-400">How It Works</a></li>
              <li><a href="#" className="hover:text-green-400">Restaurants</a></li>
              <li><a href="#" className="hover:text-green-400">Become a Partner</a></li>
              <li><a href="#" className="hover:text-green-400">Careers</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400">Help Center</a></li>
              <li><a href="#" className="hover:text-green-400">Contact Us</a></li>
              <li><a href="#" className="hover:text-green-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-400">Refund Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <Smartphone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} />
                <span>support@superdelivery.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} />
                <span>123 Food Street, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 SUPER DELIVERY. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-green-400 text-sm">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-green-400 text-sm">Terms</a>
            <a href="#" className="text-gray-400 hover:text-green-400 text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

