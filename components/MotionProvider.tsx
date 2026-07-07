"use client";

import { MotionConfig } from "framer-motion";

/**
 * Envuelve toda la app: MotionConfig con reducedMotion="user" hace que
 * TODOS los componentes motion.* (FadeIn, AnimatedScore, CTAButton, etc.)
 * respeten automáticamente prefers-reduced-motion del sistema, sin tener
 * que instrumentar cada componente por separado.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
