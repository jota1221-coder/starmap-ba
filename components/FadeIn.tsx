"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Dirección desde la que entra el elemento (default: up) */
  from?: "up" | "left" | "none";
}

const OFFSET = { up: { y: 22 }, left: { x: -16 }, none: {} };

export default function FadeIn({
  children,
  delay = 0,
  className,
  from = "up",
}: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...OFFSET[from] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : undefined}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
