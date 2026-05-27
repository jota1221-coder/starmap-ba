export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 sm:py-32 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.10),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(168,85,247,0.08),_transparent_55%)]"
      />
      <div className="relative z-10 max-w-2xl flex flex-col items-center text-center gap-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          En construcción · MVP en camino
        </span>

        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-balance">
          StarMap{" "}
          <span className="bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 bg-clip-text text-transparent">
            BA
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed text-balance">
          Encontrá los mejores lugares de la Provincia de Buenos Aires para
          mirar el cielo estrellado. Clima en tiempo real, contaminación
          lumínica y una guía para saber qué planetas, estrellas y
          constelaciones vas a ver esta noche.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <a
            href="/mapa"
            className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-white"
          >
            Abrir el mapa
          </a>
          <a
            href="#sobre-el-proyecto"
            className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/40 px-6 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-700"
          >
            Sobre el proyecto
          </a>
        </div>

        <p
          id="sobre-el-proyecto"
          className="text-xs text-slate-500 mt-12 max-w-md leading-relaxed"
        >
          Proyecto open source en construcción por{" "}
          <a
            href="https://github.com/joaquinrao"
            className="text-slate-300 underline-offset-4 hover:underline"
          >
            Joaquin Rao
          </a>
          . Combina datos de Open-Meteo, NASA VIIRS y astronomy-engine para
          ayudarte a planear tu próxima salida a ver las estrellas.
        </p>
      </div>
    </main>
  );
}
