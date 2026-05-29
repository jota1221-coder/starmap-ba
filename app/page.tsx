import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";

const FEATURES = [
  {
    icon: "🗺️",
    title: "Mapa de cielos oscuros",
    desc: "Los mejores puntos de la Provincia para escaparte a ver estrellas, rankeados por contaminación lumínica real (datos VIIRS).",
  },
  {
    icon: "📊",
    title: "Score en vivo",
    desc: "Para cada lugar y noche calculamos qué tan bueno va a estar el cielo: clima por hora, fase de la Luna y oscuridad del sitio.",
  },
  {
    icon: "🔭",
    title: "Qué mirar y hacia dónde",
    desc: "Te decimos qué planetas y objetos son visibles esa noche, su altura y hacia qué dirección apuntar.",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div aria-hidden className="starfield" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="text-base font-semibold tracking-tight">
          StarMap{" "}
          <span className="bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 bg-clip-text text-transparent">
            BA
          </span>
        </span>
        <SocialLinks />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Provincia de Buenos Aires
        </span>

        <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-7xl">
          StarMap{" "}
          <span className="bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 bg-clip-text text-transparent">
            BA
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300 text-balance sm:text-xl">
          Encontrá el mejor lugar y la mejor noche para ver las estrellas.
          Mapa de cielos oscuros, pronóstico de observación y guía de qué mirar.
        </p>

        <Link
          href="/mapa"
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-violet-400 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition-transform hover:scale-105"
        >
          Abrir el mapa
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>

        <p className="mt-4 text-xs text-slate-500">
          13 puntos · gratis · sin registro
        </p>
      </main>

      {/* Features */}
      <section className="relative z-10 mx-auto grid w-full max-w-5xl gap-4 px-6 pb-16 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur"
          >
            <div className="text-2xl">{f.icon}</div>
            <h2 className="mt-3 text-base font-semibold text-slate-100">
              {f.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 px-6 py-6 text-center text-xs text-slate-500">
        <p>
          Hecho por{" "}
          <a
            href="https://github.com/joaquinrao"
            className="text-slate-400 hover:text-slate-200"
          >
            Joaquin Rao
          </a>{" "}
          · Datos: Open-Meteo, NASA VIIRS, astronomy-engine
        </p>
      </footer>
    </div>
  );
}
