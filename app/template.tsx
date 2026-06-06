"use client";

/**
 * template.tsx se re-instancia en cada navegación (a diferencia de layout.tsx).
 * Esto hace posible la transición de entrada en cada ruta.
 */
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ minHeight: "100%" }}
    >
      {children}
    </motion.div>
  );
}
