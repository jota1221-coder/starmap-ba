"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

interface DatePickerProps {
  current: string; // YYYY-MM-DD
  min: string;
  max: string;
}

export default function DatePicker({ current, min, max }: DatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (!value) return;
    startTransition(() => {
      router.push(`${pathname}?date=${value}`);
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-fg-muted">
      <span className="text-fg-faint">Noche del</span>
      <input
        type="date"
        value={current}
        min={min}
        max={max}
        onChange={onChange}
        className="tnum rounded-xl border border-white/10 bg-surface px-3 py-1.5 text-fg [color-scheme:dark] transition-colors duration-200 focus:border-accent focus:outline-none"
      />
      {isPending && <span className="text-xs text-fg-faint">actualizando…</span>}
    </label>
  );
}
