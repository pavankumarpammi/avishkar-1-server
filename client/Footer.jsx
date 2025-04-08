import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, VITE_BACKEND_URL, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">About Us</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We are dedicated to providing high-quality education accessible to everyone. 
              Join our community of learners and start your journey today.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/sunil-gangadhar-78936018a/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-500">
                <VITE_BACKEND_URL className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/my-learning" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  My Learning
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/become-instructor" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  Become an Instructor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="space-y-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white dark:bg-gray-800"
              />
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <Mail className="h-5 w-5" />
            <span className="text-sm">info@avishkartechsolutions.com</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <Phone className="h-5 w-5" />
            <span className="text-sm">+91 8639863632</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <MapPin className="h-5 w-5" />
            <span className="text-sm">HYDERABAD,India</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Learning Platform. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link to="/sitemap" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Sitemap
              </Link>
              <Link to="/accessibility" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Accessibility
              </Link>
              <Link to="/cookies" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 