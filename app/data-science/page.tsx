import Link from "next/link";
import Image from "next/image";
import Wordmark from "@/components/Wordmark";
import FadeIn from "@/components/FadeIn";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { ogFor } from "@/lib/site";

const TITLE = "Data Science — Validando los cielos con datos satelitales";
const DESCRIPTION =
  "Análisis exploratorio de contaminación lumínica en la Provincia de Buenos Aires con datos VIIRS (NASA/NOAA), validando los ratings de cielo oscuro de StarMap BA. Correlación de Spearman +0.76.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...ogFor(TITLE, DESCRIPTION, "/data-science"),
};

const NOTEBOOK_URL =
  "https://github.com/jota1221-coder/starmap-ba/blob/main/notebooks/01_contaminacion_luminica_ba.ipynb";

const NOTEBOOK_2_URL =
  "https://github.com/jota1221-coder/starmap-ba/blob/main/notebooks/02_pronostico_2035_ba.ipynb";

const NOTEBOOK_3_URL =
  "https://github.com/jota1221-coder/starmap-ba/blob/main/notebooks/03_modelo_radiancia_bortle.ipynb";

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
              contrasté con mis puntos de observación.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-y border-white/5 py-6">
              {[
                ["+0.76", "correlación Bortle ↔ satélite (Spearman)"],
                ["94.5%", "de la Provincia bajo el umbral de detección"],
                ["22", "puntos en el mapa (escapadas + observatorios)"],
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
              alt="Mapa de contaminación lumínica VIIRS de la Provincia de Buenos Aires, con los 22 puntos de observación"
              width={975}
              height={1105}
              narrow
              caption="Radiancia VIIRS 2024 recortada a la Provincia (escala log). En cyan, los 22 puntos de StarMap BA. El AMBA concentra casi toda la luz; el resto del territorio es mayormente oscuro."
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
              caption="Radiancia satelital (promedio en 3 km) según el Bortle asignado a mano, en los 13 puntos originales. La mediana por clase sube de forma monótona: más Bortle, más luz."
            />
            <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
              <p>
                Validé sobre los <strong className="text-fg">13 puntos originales</strong>,
                que rankeé a mano de forma independiente. (Los otros 8 del mapa nacieron
                después, usando el satélite, así que no entran acá: validarlos contra el
                mismo dato sería trampa.)
              </p>
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
                Y un hallazgo honesto: <strong className="text-fg">Vedia</strong> (partido
                de Leandro N. Alem, Bortle 4) sale más brillante de lo esperado — está a
                2 km del pueblo. El dato sugiere revisarlo.
              </p>
              <p>
                <a
                  href={NOTEBOOK_3_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent transition-colors duration-200 hover:text-accent-soft"
                >
                  Ver el modelo radiancia → Bortle en GitHub →
                </a>
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

        {/* Forecast */}
        <FadeIn>
          <section className="space-y-5 border-t border-white/5 pt-8">
            <div>
              <Eyebrow>El futuro</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                ¿Qué pasa con el cielo oscuro en 10 años?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                Conseguí cuatro fotos satelitales de la misma Provincia, separadas
                en el tiempo (2012, 2016, 2020 y 2024), y miré cómo se movió la luz.
              </p>
            </div>

            <BeforeAfterSlider
              beforeSrc="/data-science/radiancia_2012.png"
              afterSrc="/data-science/radiancia_2024.png"
              beforeLabel="2012"
              afterLabel="2024"
              width={910}
              height={1049}
              alt="Comparación de la contaminación lumínica de Buenos Aires entre 2012 y 2024"
              caption="Arrastrá la barra: la misma Provincia en 2012 y en 2024 (radiancia VIIRS, escala log). El Gran Buenos Aires y las ciudades del interior se encienden con más fuerza; el campo sigue oscuro."
            />

            {/* Cómo proyectamos — en simple */}
            <div className="rounded-2xl border border-white/10 bg-surface p-5">
              <p className="text-sm font-medium text-fg">
                ¿Cómo proyectamos el 2035?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                Para cada pedacito del mapa tengo cuatro números: cuánta luz tenía
                en 2012, 2016, 2020 y 2024. Es como marcar cuatro puntos en un
                gráfico y trazar la recta que mejor los une — después la estiro once
                años más, hasta 2035. Si una zona viene sumando luz a cierto ritmo,
                asumo que sigue al mismo ritmo.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                El único ingrediente es la{" "}
                <strong className="text-fg">tendencia que ya muestra cada lugar</strong>.
                No metí supuestos sobre nuevas ciudades, crecimiento de población ni
                recambio a LED: es seguir la inercia del dato, no adivinar el futuro.
              </p>
            </div>

            <Figure
              src="/data-science/tendencia.png"
              alt="Porcentaje de la Provincia con cielo oscuro por año, con proyección a 2035"
              width={975}
              height={598}
              caption="El porcentaje de la Provincia con cielo oscuro, año a año (VIIRS) y proyectado a 2035 estirando esa tendencia."
            />

            <p className="text-sm leading-relaxed text-fg-muted">
              El cielo oscuro se achicó de <strong className="text-fg">97.2%</strong>{" "}
              (2012) a <strong className="text-fg">95.2%</strong> (2024), y la
              huella iluminada creció <strong className="text-fg">+22%</strong> en
              12 años. Si la inercia se mantiene, la proyección da{" "}
              <strong className="text-fg">94.6%</strong> para 2035.
            </p>

            <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
              <p>
                <strong className="text-fg">La buena noticia para el observador:</strong>{" "}
                las escapadas de cielo oscuro están lejos de ese avance. Las más
                oscuras se proyectan <strong className="text-fg">estables</strong> —
                seguirán siendo Bortle 2-3 en 2035.
              </p>
              <p className="text-xs text-fg-faint">
                Es una proyección de tendencia, no un pronóstico exacto: extrapolar
                10 años es incierto, y la serie mezcla VNL v2.1 (2012-2020) con v2.2
                (2024).
              </p>
              <p>
                <a
                  href={NOTEBOOK_2_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent transition-colors duration-200 hover:text-accent-soft"
                >
                  Ver el notebook del pronóstico en GitHub →
                </a>
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Predicción operativa */}
        <FadeIn>
          <section className="space-y-5 border-t border-white/5 pt-8">
            <div>
              <Eyebrow>Predicción · corto plazo</Eyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Predecir si vale la pena salir esta noche
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                La otra cara de &ldquo;predecir&rdquo; no es a 10 años, es a 10
                días. Para cada lugar y cada noche, StarMap BA convierte el
                pronóstico meteorológico (Open-Meteo) en una predicción de{" "}
                <strong className="text-fg">calidad de cielo</strong>: un score
                de 0 a 100.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-5">
              <p className="text-sm font-medium text-fg">
                No es un modelo del clima — es feature engineering
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                El pronóstico del tiempo ya lo hace el servicio meteorológico. Mi
                aporte es transformar esas variables crudas en una decisión, con
                pesos pensados para astronomía:
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-fg-muted">
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Las <strong className="text-fg">nubes bajas</strong> penalizan
                  ~3× más que las altas: tapan más para observar.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  La <strong className="text-fg">Luna</strong> resta según fase y
                  altura: llena y alta arruina la noche; nueva no molesta.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  El <strong className="text-fg">Bortle</strong> del lugar pone el
                  piso: el mejor pronóstico no salva a un cielo urbano.
                </li>
              </ul>
            </div>

            <p className="text-sm leading-relaxed text-fg-muted">
              Así se cierra el arco del análisis:{" "}
              <strong className="text-fg">describir</strong> (el mapa) →{" "}
              <strong className="text-fg">validar</strong> (Bortle vs. satélite) →{" "}
              <strong className="text-fg">predecir</strong>, tanto a largo plazo
              (2035) como noche a noche.
            </p>
            <p className="text-xs text-fg-faint">
              Su techo de acierto es el del pronóstico de Open-Meteo. El próximo
              paso sería validar el score contra observaciones reales de la
              comunidad.
            </p>
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
                La metodología de &ldquo;apuntar a la celda oscura accesible&rdquo; se
                sostiene con el dato.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                De esa validación nacieron <strong className="text-fg">8 puntos nuevos</strong>{" "}
                (rateados con el satélite) y una <strong className="text-fg">proyección a 2035</strong>:
                el cielo oscuro se achica, pero las escapadas lejanas seguirán oscuras.
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
          Dato: VIIRS VNL 2012–2024 (EOG/NOAA, dominio público) · Análisis: Joaquin Rao
        </p>
      </main>
    </div>
  );
}
