import { Mail, Phone, MapPin, Globe, CreditCard } from "lucide-react";

interface FooterProps {
  onSetView: (view: string) => void;
}

export default function Footer({ onSetView }: FooterProps) {
  return (
    <footer className="bg-black border-t border-zinc-900/80 pt-16 pb-8 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand Pitch */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 shadow shadow-purple-500/20">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">CONTENZO</span>
            </div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Premium Guest Posting Marketplace
            </p>
            <p className="text-sm text-zinc-400">
              No Middlemen. 0% Markup. Affordable and transparent Guest Posting SaaS for modern agencies and brands.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-zinc-500">We accept:</span>
              <div className="flex gap-1.5 text-zinc-400 text-xs font-semibold">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Stripe</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">PayPal</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">Wallet</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">SaaS Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onSetView("marketplace")} className="hover:text-purple-400 transition-colors">
                  Explore Publisher Inventory
                </button>
              </li>
              <li>
                <button onClick={() => onSetView("home")} className="hover:text-purple-400 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onSetView("blogs")} className="hover:text-purple-400 transition-colors">
                  Latest SEO Insights
                </button>
              </li>
              <li>
                <button onClick={() => onSetView("faqs")} className="hover:text-purple-400 transition-colors">
                  Frequently Asked Support
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company Office</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  9 Kings Hall<br />
                  Oldham, OL8 1DP<br />
                  United Kingdom
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+447716719861" className="hover:text-white transition-colors">+44 7716 719861</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <a href="mailto:hello@contenzo.co.uk" className="hover:text-white transition-colors">hello@contenzo.co.uk</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quality & Escrow Pledge */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Our Guarantee</h4>
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">
              Every guest post purchased through Contenzo is backed by our lifetime verification escrow. Publishers only get paid upon successful link review.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>0% Commission Marketplace Model</span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} CONTENZO. All rights reserved. Registered in the United Kingdom.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
