import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Youtube,
  PhoneCall,
} from "lucide-react";

export default function Footer() {
  const footerLinks = {
    "Quick Links": [
      { name: "Home", href: "/" },
      { name: "Events", href: "/events" },
      { name: "Members", href: "/members" },
      { name: "About Us", href: "/about" },
    ],
    Resources: [
      { name: "Research Papers", href: "/research" },
      { name: "Guidelines", href: "/guidelines" },
      { name: "FAQs", href: "/faq" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-[#03215F] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 ">
            <Link href="/" className="flex items-center space-x-3">
              <img src="https://bds-web-iota.vercel.app/long-logo.png" alt="BDS Logo" className="h-12 rounded-sm" />
            </Link>

            <p className="text-gray-400">
              Advancing dental excellence through education, collaboration, and
              professional development.
            </p>

            <div className="flex space-x-4">
              
              <a
                href="https://youtube.com/@bahraindentalsociety?si=L6wo3DSGNgSLMHHt"
                className="p-2 bg-gray-800 hover:bg-[#03215F] rounded-lg transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/bahrain.dental.society?igsh=MXV2Y245cmtpMW94cg=="
                className="p-2 bg-gray-800 hover:bg-[#03215F] rounded-lg transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.link/k6rtdf"
                className="p-2 bg-gray-800 hover:bg-[#03215F] rounded-lg transition-colors"
              >
                <PhoneCall className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Contact */}
        <div className="space-y-4 w-full mt-5">
          <h4 className="text-lg font-semibold">Contact Us</h4>
          <div className="space-y-3 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#03215F] mt-1" />
              <span className="text-gray-400">
                 Building 1487, Road 2425, Block 324, Juffair, Kingdom of Bahrain.🇧🇭
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#03215F]" />
                <span className="text-gray-400">+973 3799 0963</span>
              </div>
              <div className="flex mt-4 items-center space-x-3">
                <Mail className="w-5 h-5 text-[#03215F]" />
                <span className="text-gray-400">Bahrain.ds94@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Bahrain Dental Society. All rights
            reserved.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Developed by{" "}
            <a
              href="https://365neo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition"
            >
              365Neo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
