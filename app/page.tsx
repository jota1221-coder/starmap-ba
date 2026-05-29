import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import Wordmark from "@/components/Wordmark";

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
      <div aria-hidden className="starfield" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Wordmark className="text-base" />
        <SocialLinks />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-fg-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Provincia de Buenos Aires
        </span>

        <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-balance sm:text-7xl">
          Encontrá el cielo
          <br />
          <span className="text-fg-muted">más oscuro cerca tuyo</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted text-balance">
          StarMap BA combina contaminación lumínica, clima y posición de los
          astros para decirte el mejor lugar y la mejor noche para mirar las
          estrellas.
        </p>

        <Link
          href="/mapa"
          className="group mt-10 inline-flex items-center gap-2 rounded-2xl bg-accent px-7 py-3.5 text-base font-semibold text-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent-soft"
        >
          Abrir el mapa
          <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
            →
          </span>
        </Link>

        <p className="mt-4 text-xs text-fg-faint">
          13 puntos relevados · gratis · sin registro
        </p>
      </main>

      {/* Features — separados por aire y hairlines, no por cajas */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-ink p-6">
              <h2 className="text-base font-semibold tracking-tight text-fg">
                {f.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
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
      </footer>
    </div>
  );
}
