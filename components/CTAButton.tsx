"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const MotionLink = motion.create(Link);

export default function CTAButton() {
  return (
    <MotionLink
      href="/mapa"
      className="mt-10 inline-flex items-center gap-3 border border-white/70 bg-transparent px-9 py-4 text-base font-medium tracking-tight text-fg hover:border-accent hover:bg-accent hover:text-ink"
      /* Entrada: reemplaza el animate-rise CSS */
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      /* Hover + press con spring */
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      Abrir el mapa
      <motion.span
        variants={{ hover: { x: 5 } }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
      >
        →
      </motion.span>
    </MotionLink>
  );
}
