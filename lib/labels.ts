/**
 * Etiquetas visibles de los enums de ObservationPoint. Única fuente de
 * verdad: antes vivían duplicadas en components/LeafletMap.tsx y en
 * app/punto/[slug]/page.tsx, con textos que ya habían divergido entre sí
 * (ej. "Auto" vs "Se llega en auto" para el mismo valor).
 */
import type { PointType, AccessType, RoadType } from "@prisma/client";

export const TIPO_LABEL: Record<PointType, string> = {
  sierra: "Sierra",
  costa: "Costa",
  reserva: "Reserva",
  pampa: "Pampa",
  laguna: "Laguna",
  urbano: "Urbano",
};

export const ACCESO_LABEL: Record<AccessType, string> = {
  auto: "Se llega en auto",
  auto_caminata_corta: "Auto + caminata corta",
  cuatro_x_cuatro: "Requiere 4x4",
};

export const CAMINO_LABEL: Record<RoadType, string> = {
  asfalto: "asfalto",
  ripio: "ripio",
  tierra: "tierra",
};
