import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import Wordmark from "@/components/Wordmark";
import CTAButton from "@/components/CTAButton";
import FadeIn from "@/components/FadeIn";
import HeroBackdrop from "@/components/HeroBackdrop";
import ProductPreview from "@/components/ProductPreview";
import { bortleColor, BORTLE_LEGEND } from "@/lib/bortle";

const FEATURES = [
  {
    title: "Cielos oscuros, medidos",
    desc: "Los mejores puntos de la Provincia para escaparte a ver estrellas, rankeados por contaminación lumínica real (datos satelitales VIIRS).",
  },
  {
    title: "Pronóstico de observación",
    desc: "Para cada lugar y cada noche calculamos qué tan bueno va a estar el cielo: nubosidad por hora, fase de la Luna y oscuridad del sitio.",
  },
  {
    title: "Qué mirar, y hacia dónde",
    desc: "Te decimos qué planetas son visibles esa noche, a qué altura y hacia qué dirección apuntar.",
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Fondo del hero: foto ESO con parallax + glow + viñeta */}
      <HeroBackdrop />

      {/* Primera pantalla: el hero ocupa el viewport completo y queda centrado.
          Todo lo demás (mapa, features, footer) cae debajo del fold. */}
      <section className="relative z-10 flex min-h-dvh flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Wordmark className="text-base" />
          <div className="flex items-center gap-5">
            <Link
              href="/data-science"
              className="text-sm text-fg-muted transition-colors duration-200 hover:text-accent"
            >
              Data Science
            </Link>
            <SocialLinks />
          </div>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <h1
            className="animate-rise text-5xl font-semibold leading-[0.95] tracking-tight text-balance [animation-delay:160ms] sm:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Encontrá el cielo
            <br />
            <span className="text-fg-muted">más oscuro cerca tuyo</span>
          </h1>

          <p className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-fg-muted text-balance [animation-delay:280ms]">
            StarMap BA combina contaminación lumínica, clima y posición de los
            astros para decirte el mejor lugar y la mejor noche para mirar las
            estrellas.
          </p>

          <CTAButton />

          <p className="animate-rise mt-4 text-xs text-fg-faint [animation-delay:520ms]">
            22 puntos relevados · gratis · sin registro
          </p>
        </main>

        {/* Indicador de scroll: invita a bajar al mapa. CSS puro, respeta
            prefers-reduced-motion. */}
        <a
          href="#el-mapa"
          aria-label="Ver el mapa"
          className="animate-rise absolute inset-x-0 bottom-6 z-10 mx-auto flex w-fit justify-center text-fg-faint transition-colors duration-200 [animation-delay:760ms] hover:text-fg-muted"
        >
          <svg
            className="scroll-cue"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* Showcase del producto: mapa real de BA con los puntos */}
      <section
        id="el-mapa"
        className="relative z-10 mx-auto w-full max-w-5xl scroll-mt-10 px-6 pb-24 pt-4"
      >
        <div className="grid items-center gap-10 sm:grid-cols-2 sm:gap-14">
          <FadeIn from="left">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              El mapa
            </p>
            <h2
              className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Veintidós cielos,
              <br />
              rankeados
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
              Escapadas de cielo oscuro y observatorios con visitas guiadas:
              cada punto es un lugar real y accesible en auto, medido por
              contaminación lumínica satelital. Cuanto más verde, más oscuro
              el cielo.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {BORTLE_LEGEND.map((item) => (
                <li
                  key={item.bortle}
                  className="flex items-center gap-2 text-xs text-fg-muted"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: bortleColor(item.bortle) }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ProductPreview />
          </FadeIn>
        </div>
      </section>

      {/* Features — columnas abiertas, sin cajas, solo aire */}
      <section className="relative z-10 mx-auto grid w-full max-w-5xl gap-10 px-6 pb-24 sm:grid-cols-3 sm:gap-12">
        {FEATURES.map((f, i) => (
          <FadeIn key={f.title} delay={i * 0.12}>
            <span className="tnum text-sm font-medium text-accent">
              0{i + 1}
            </span>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-fg">
              {f.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {f.desc}
            </p>
          </FadeIn>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-xs text-fg-faint">
        <p className="mb-3">
          <Link
            href="/data-science"
            className="text-fg-muted transition-colors duration-200 hover:text-accent"
          >
            Cómo validamos los cielos con datos satelitales →
          </Link>
        </p>
        <p>
          Hecho por{" "}
          <a
            href="https://github.com/jota1221-coder"
            className="text-fg-muted transition-colors duration-200 hover:text-fg"
          >
            Joaquin Rao
          </a>{" "}
          ·{" "}
          <a
            href="mailto:joaquinrao@gmail.com?subject=Feedback%20StarMap%20BA"
            className="text-fg-muted transition-colors duration-200 hover:text-accent"
          >
            Sugerencias o reportar algo
          </a>{" "}
          · Datos: Open-Meteo, NASA VIIRS, astronomy-engine
        </p>
        <p className="mt-1.5 text-fg-faint/70">
          Foto:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Beneath_the_Milky_Way.jpg"
            className="hover:text-fg-muted"
            target="_blank"
            rel="noopener noreferrer"
          >
            ESO/L. Calçada
          </a>{" "}
          · CC BY 4.0
        </p>
      </footer>
    </div>
  );
}
