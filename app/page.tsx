import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import Wordmark from "@/components/Wordmark";
import AuthStatus from "@/components/AuthStatus";

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
    <div className="relative flex min-h-dvh flex-col">
      {/* Fondo: foto real del cielo (ESO) + overlay para legibilidad */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="kenburns absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/sky-hero.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/70 to-ink" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Wordmark className="text-base" />
        <div className="flex items-center gap-4">
          <AuthStatus />
          <SocialLinks />
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="animate-rise mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-fg-muted [animation-delay:80ms]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Provincia de Buenos Aires
        </span>

        <h1 className="animate-rise text-5xl font-semibold leading-[0.95] tracking-tight text-balance [animation-delay:160ms] sm:text-7xl">
          Encontrá el cielo
          <br />
          <span className="text-fg-muted">más oscuro cerca tuyo</span>
        </h1>

        <p className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-fg-muted text-balance [animation-delay:280ms]">
          StarMap BA combina contaminación lumínica, clima y posición de los
          astros para decirte el mejor lugar y la mejor noche para mirar las
          estrellas.
        </p>

        <Link
          href="/mapa"
          className="group animate-rise mt-10 inline-flex items-center gap-3 border border-white/70 bg-transparent px-9 py-4 text-base font-medium tracking-tight text-fg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [animation-delay:400ms] hover:border-accent hover:bg-accent hover:text-ink"
        >
          Abrir el mapa
          <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
            →
          </span>
        </Link>

        <p className="animate-rise mt-4 text-xs text-fg-faint [animation-delay:520ms]">
          13 puntos relevados · gratis · sin registro
        </p>
      </main>

      {/* Features — columnas abiertas, sin cajas, solo aire */}
      <section className="relative z-10 mx-auto grid w-full max-w-5xl gap-10 px-6 pb-24 sm:grid-cols-3 sm:gap-12">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="animate-rise"
            style={{ animationDelay: `${600 + i * 120}ms` }}
          >
            <span className="tnum text-sm font-medium text-accent">
              0{i + 1}
            </span>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-fg">
              {f.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-xs text-fg-faint">
        <p>
          Hecho por{" "}
          <a
            href="https://github.com/jota1221-coder"
            className="text-fg-muted transition-colors duration-200 hover:text-fg"
          >
            Joaquin Rao
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
