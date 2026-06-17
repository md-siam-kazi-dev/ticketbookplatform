import React from "react";
import { Ticket, Mail, Phone, Facebook, CreditCard, TrainFront } from "lucide-react";
import {LogoFacebook} from '@gravity-ui/icons';

/**
 * TicketLagbe — site footer. Pairs with TicketLagbeNavbar (same orange/stone
 * palette, same perforated-edge motif, same dark-mode strategy via a `dark`
 * class on an ancestor). Drop inside the same `dark`-class wrapper as the
 * navbar so theme stays in sync app-wide.
 *
 * Usage: <TicketLagbeFooter />
 */

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "All Tickets", href: "#tickets" },
  { label: "Contact Us", href: "#contact" },
  { label: "About", href: "#about" },
];

const PAYMENT_METHODS = ["Stripe", "Visa", "Mastercard", "bKash"];

export default function TicketLagbeFooter() {
  return (
    <footer className="relative bg-stone-100 dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800">
      {/* Perforated ticket-stub edge — echoes the navbar's signature detail, torn the other way */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 -top-[5px] h-[10px] bg-stone-50 dark:bg-neutral-950"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--tl-edge) 3.2px, transparent 3.4px)",
          backgroundSize: "16px 10px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "4px 0",
        }}
      />
      <style>{`
        :root { --tl-edge: #f5f5f4; }
        .dark { --tl-edge: #171717; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 — Logo + description */}
          <div>
            <a href="#home" className="flex items-center gap-2.5 no-underline w-fit">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 dark:bg-orange-500 text-orange-50">
                <TrainFront />
              </span>
              <span className="font-bold text-xl tracking-tight text-stone-900 dark:text-stone-50">
                Ticket<span className="text-orange-600 dark:text-orange-500">Lagbe</span>
              </span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-stone-500 dark:text-stone-400 max-w-[220px]">
              Book bus, train, launch &amp; flight tickets easily.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">
              Contact Info
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="mailto:support@ticketlagbe.com"
                  className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors no-underline"
                >
                  <Mail size={15} className="shrink-0" />
                  support@ticketlagbe.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801234567890"
                  className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors no-underline"
                >
                  <Phone size={15} className="shrink-0" />
                  +880 1234-567890
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/ticketlagbe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors no-underline"
                >
                  <LogoFacebook />
                  facebook.com/ticketlagbe
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Payment Methods */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">
              Payment Methods
            </h3>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-medium text-stone-600 dark:text-stone-300"
                >
                  <CreditCard size={13} className="text-orange-600 dark:text-orange-500" />
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-stone-200 dark:border-neutral-800 text-center">
          <p className="text-xs text-stone-400 dark:text-stone-500 m-0">
            © 2025 TicketLagbe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}