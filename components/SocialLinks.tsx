// Íconos de redes sociales (SVG inline, sin dependencias).
// Reemplazá los href por las cuentas reales cuando existan.

const ICONS = {
  instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.05 1.8.25 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.15.4.35 1 .4 2.2.06 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.05 1.2-.25 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.15-1 .35-2.2.4-1.2.06-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.05-1.8-.25-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.15-.4-.35-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.05-1.2.25-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.15 1-.35 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.65A6.15 6.15 0 1 0 12 18.15 6.15 6.15 0 0 0 12 5.85zm0 10.15a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
  ),
  x: (
    <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-7-6.1 7H2l8-9.2L1.5 2h7l4.8 6.3L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
  ),
  github: (
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.555-1.14-4.555-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.36 9.36 0 0 1 12 7.07c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  ),
};

const LINKS: { name: keyof typeof ICONS; href: string; label: string }[] = [
  { name: "instagram", href: "#", label: "Instagram" },
  { name: "x", href: "#", label: "X (Twitter)" },
  { name: "github", href: "https://github.com/jota1221-coder", label: "GitHub" },
];

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-1">
      {LINKS.map((l) => (
        <a
          key={l.name}
          href={l.href}
          aria-label={l.label}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            {ICONS[l.name]}
          </svg>
        </a>
      ))}
    </div>
  );
}
