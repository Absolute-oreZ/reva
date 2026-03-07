"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Echoes", href: "/echoes" },
  { name: "Global Pulse", href: "/globe" },
];

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogin = () => {
    console.log("Login sequence initiated...");
    alert("Login coming soon in the next phase!");
  };

  return (
    <header>
      <nav className="fixed top-6 left-0 right-0 z-50 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-md rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            <Image
              src="/icons/logo.png"
              alt="logo"
              width={0}
              height={0}
              sizes="28px"
              className="w-7 h-7"
            />
            <span className="font-bold text-foreground text-lg tracking-tighter">REVA</span>
          </Link>

          <div className="hidden md:flex items-center bg-background/80 backdrop-blur-md px-2 py-2 rounded-full shadow-lg relative">
            <ul className="flex items-center space-x-1 relative">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <li key={link.name} className="relative">
                    <Link
                      href={link.href}
                      className={cn(
                        "relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10 block",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {link.name}
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogin}
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95 group"
            >
              <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
              <span>Login</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-12 h-12 flex items-center justify-center bg-background rounded-full shadow-lg border-2 border-primary/20 text-foreground transition-transform active:scale-90"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-20 left-4 right-4 bg-background rounded-3xl shadow-2xl border border-border p-4 flex flex-col gap-2 md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "w-full py-4 text-center rounded-2xl font-semibold transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <Button
                onClick={() => {
                  setIsOpen(false);
                  handleLogin();
                }}
                size="lg"
                className="mt-2 w-full rounded-2xl font-bold shadow-lg shadow-primary/10 transition-transform active:scale-95"
              >
                <LogIn size={20} className="mr-2" />
                Login to Echo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default NavigationMenu;