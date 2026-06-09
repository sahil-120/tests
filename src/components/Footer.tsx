import { Link } from "react-router-dom";
import { Heart, ExternalLink } from "lucide-react";
import logoImg from "@/assets/logo.png";

const footerLinks = [
  { name: "PSC Nepal", url: "https://psc.gov.np" },
  { name: "MoCIT", url: "https://mocit.gov.np" },
  { name: "NITC", url: "https://nitc.gov.np" },
  { name: "DoIT", url: "https://doit.gov.np" },
];

const Footer = () => (
  <footer className="mt-12 border-t border-border">
    <div className="bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Loksewa Pro Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
            <div>
              <p className="font-heading font-bold text-foreground text-sm">लोकसेवा Pro</p>
              <p className="text-xs text-muted-foreground">Computer Operator & IT Officer Prep</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-1">
            {footerLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                {link.name} <ExternalLink size={10} />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © 2026 Loksewa Pro — Made with <Heart size={11} className="text-red-500 fill-red-500" /> for Nepal
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
    </div>
  </footer>
);

export default Footer;
