/**
 * Tipo y validación del campo Json `hospedajes` de ObservationPoint. Antes
 * se casteaba sin validar en dos lugares (la ficha del punto y el seed),
 * con el tipo definido dos veces.
 */
export interface Hospedaje {
  nombre: string;
  distancia_km: number;
  url: string;
}

function isHospedaje(v: unknown): v is Hospedaje {
  if (typeof v !== "object" || v === null) return false;
  const h = v as Record<string, unknown>;
  return (
    typeof h.nombre === "string" &&
    typeof h.distancia_km === "number" &&
    typeof h.url === "string"
  );
}

/** Valida y tipa el campo Json `hospedajes`; descarta lo que no matchea la forma. */
export function parseHospedajes(json: unknown): Hospedaje[] {
  if (!Array.isArray(json)) return [];
  return json.filter(isHospedaje);
}
