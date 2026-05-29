import Link from "next/link";

/**
 * Wordmark de la marca. "BA" en ámbar sólido (NO gradient text).
 * Un solo lugar para mantener consistencia en todas las pantallas.
 */
export default function Wordmark({
  className = "",
  as = "link",
}: {
  className?: string;
  as?: "link" | "plain";
}) {
  const content = (
    <span className={`font-semibold tracking-tight ${className}`}>
      StarMap <span className="text-accent">BA</span>
    </span>
  );
  if (as === "plain") return content;
  return (
    <Link
      href="/"
      className="transition-opacity duration-200 hover:opacity-80"
    >
      {content}
    </Link>
  );
}
