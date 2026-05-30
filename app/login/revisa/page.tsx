import Wordmark from "@/components/Wordmark";

export const metadata = { title: "Revisá tu email — StarMap BA" };

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-sm">
        <Wordmark className="text-lg" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Revisá tu email
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          Te enviamos un enlace para entrar. Tocalo desde el mismo dispositivo.
          El enlace vence en 30 minutos.
        </p>
        <p className="mt-6 text-xs text-fg-faint">
          ¿No llegó? Revisá spam o volvé a intentar.
        </p>
      </div>
    </div>
  );
}
