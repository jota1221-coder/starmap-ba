import Link from "next/link";
import Image from "next/image";
import Wordmark from "@/components/Wordmark";
import FadeIn from "@/components/FadeIn";

export const metadata = {
  title: "Data Science — Validando los cielos con datos satelitales · StarMap BA",
  description:
    "Análisis exploratorio de contaminación lumínica en la Provincia de Buenos Aires con datos VIIRS (NASA/NOAA), validando los ratings de cielo oscuro de StarMap BA. Correlación de Spearman +0.76.",
};

const NOTEBOOK_URL =
  "https://github.com/jota1221-coder/starmap-ba/blob/main/notebooks/01_contaminacion_luminica_ba.ipynb";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
      {children}
    </p>
  );
}

function Figure({
  src,
  alt,
  width,
  height,
  caption,
  narrow = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  narrow?: boolean;
}) {
  return (
    <figure className={narrow ? "mx-auto max-w-lg" : undefined}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
        <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
      </div>
      <figcaption className="mt-2.5 text-xs leading-relaxed text-fg-faint">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function DataSciencePage() {
  return (
    <div className="min-h-dvh bg-ink text-fg">
      {/* Nav */}
      <header className="border-b border-white/5 px-4 py-3.5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="text-sm text-fg-muted transition-colors duration-200 hover:text-fg"
          >
            ← StarMap BA
          </Link>
          <Wordmark className="text-sm" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-16 px-5 py-12">
        {/* Hero */}
        <FadeIn>
          <section>
            <Eyebrow>Data Science</Eyebrow>
            <h1
              className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Validando los cielos con datos satelitales
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted">
              StarMap BA rankea lugares para ver estrellas según la oscuridad del
              cielo (escala <strong className="text-fg">Bortle</strong>). Esos
              valores los asigné a mano con una grilla gruesa. La pregunta de este
              análisis: <strong className="text-fg">¿el satélite me da la razón?</strong>{" "}
              Tomé el producto VIIRS de luz nocturna de la NASA/NOAA (463 m) y lo
              contrasté con mis 13 puntos.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-y border-white/5 py-6">
              {[
                ["+0.76", "correlación Bortle ↔ satélite (Spearman)"],
                ["94.5%", "de la Provincia bajo el umbral de detección"],
                ["13", "puntos validados con dato independiente"],
              ].map(([n, label]) => (
                <div key={n}>
                  <p
                    className="text-2xl font-semibold text-accent sm:text-3xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {n}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-fg-muted">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Mapa */}
        <FadeIn>
          <section className="space-y-5">
            <div>
              <Eyebrow>El mapa</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Dónde está la luz (y dónde no)
              </h2>
            </div>
            <Figure
              src="/data-science/heatmap.png"
              alt="Mapa de contaminación lumínica VIIRS de la Provincia de Buenos Aires, con los 13 puntos de observación"
              width={975}
              height={1105}
              narrow
              caption="Radiancia VIIRS 2024 recortada a la Provincia (escala log). En cyan, los 13 puntos de StarMap BA. El AMBA concentra casi toda la luz; el resto del territorio es mayormente oscuro."
            />
            <p className="text-sm leading-relaxed text-fg-muted">
              El <strong className="text-fg">94.5%</strong> de la Provincia está por
              debajo del umbral de detección del satélite: hay muchísimo cielo oscuro
              accesible. Los puntos caen, justamente, en esos mínimos de luz.
            </p>
          </section>
        </FadeIn>

        {/* Validación */}
        <FadeIn>
          <section className="space-y-5">
            <div>
              <Eyebrow>La validación</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                El satélite vs. mis ratings
              </h2>
            </div>
            <Figure
              src="/data-science/validacion.png"
              alt="Gráfico de radiancia satelital contra el Bortle asignado a mano, mostrando correlación positiva"
              width={975}
              height={650}
              caption="Radiancia satelital (promedio en 3 km) según el Bortle asignado a mano. La mediana por clase sube de forma monótona: más Bortle, más luz."
            />
            <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
              <p>
                La relación es fuerte y monótona:{" "}
                <strong className="text-fg">Spearman +0.76</strong>. Los puntos Bortle
                2 y 3 dan radiancia ≈ 0 — el satélite confirma que son cielos oscuros.
              </p>
              <p>
                Un detalle clave: el píxel <em>exacto</em> casi no correlaciona (+0.32),
                pero el entorno de 3 km sí (+0.76). Esto{" "}
                <strong className="text-fg">valida la metodología</strong>: las
                coordenadas apuntan adrede a la celda oscura, y el entorno captura el
                resplandor del pueblo cercano (que es lo que define el Bortle del lugar).
              </p>
              <p>
                Y un hallazgo honesto: <strong className="text-fg">Vedia</strong> (Bortle
                4) sale más brillante de lo esperado — está a 2 km del pueblo. El dato
                sugiere revisarlo.
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Metodología */}
        <FadeIn>
          <section className="space-y-4">
            <div>
              <Eyebrow>Cómo lo medí</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Metodología
              </h2>
            </div>
            <ol className="space-y-3 text-sm leading-relaxed text-fg-muted">
              {[
                ["Dato", "VIIRS VNL v2.2 anual 2024 (median_masked) de EOG/NOAA — dominio público, ~500 m de resolución."],
                ["Recorte", "Del archivo global (312 MB) a la Provincia, con el polígono oficial del IGN — el mismo límite que usa el mapa de la app."],
                ["Muestreo", "Radiancia en cada punto: el píxel exacto y el promedio en un radio de 3 km."],
                ["Validación", "Correlación de Spearman (sobre rangos) — porque el Bortle es ordinal y la radiancia está muy sesgada."],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    <strong className="text-fg">{k}.</strong> {v}
                  </span>
                </li>
              ))}
            </ol>
            <Figure
              src="/data-science/distribucion.png"
              alt="Histograma de la distribución de radiancia en Buenos Aires"
              width={975}
              height={585}
              caption="Distribución de radiancia (log) de los píxeles con luz. Es bimodal: un pico grande de luz baja (pueblos y rutas) y una joroba de luz alta (el AMBA)."
            />
          </section>
        </FadeIn>

        {/* Conclusiones */}
        <FadeIn>
          <section className="space-y-4 border-t border-white/5 pt-8">
            <Eyebrow>Conclusiones</Eyebrow>
            <ul className="space-y-2.5 text-sm leading-relaxed text-fg-muted">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Los ratings de Bortle de StarMap BA quedan validados por un producto
                satelital independiente y de mayor resolución.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                La metodología de "apuntar a la celda oscura accesible" se sostiene con
                el dato.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                Es una <strong className="text-fg">primera validación sobre 13 puntos</strong>:
                el próximo paso es calibrar un modelo radiancia→Bortle para toda la
                Provincia y sugerir puntos nuevos en los mínimos de luz.
              </li>
            </ul>
          </section>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <section className="flex flex-col gap-3 border-t border-white/5 pt-8 sm:flex-row">
            <a
              href={NOTEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-accent px-5 py-3 text-center text-sm font-semibold text-ink transition-colors duration-300 hover:bg-accent-soft"
            >
              Ver el notebook completo en GitHub →
            </a>
            <Link
              href="/mapa"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-medium text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              Explorar el mapa
            </Link>
          </section>
        </FadeIn>

        <p className="pt-4 text-center text-xs text-fg-faint">
          Dato: VIIRS VNL v2.2 (EOG/NOAA, dominio público) · Análisis: Joaquin Rao
        </p>
      </main>
    </div>
  );
}
