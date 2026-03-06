"use client";

import { motion } from "framer-motion";

export const HeroAnimation = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    className="max-w-4xl text-center z-10"
  >
    {children}
  </motion.div>
);

export const ScrollReveal = ({ 
  children, 
  delay = 0, 
  direction = "up" 
}: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: "up" | "left" | "right";
}) => {
  const directions = {
    up: { y: 40, x: 0 },
    left: { y: 0, x: -50 },
    right: { y: 0, x: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.9, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      {children}
    </motion.div>
  );
};