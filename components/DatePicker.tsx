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
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <span className="text-slate-400">Noche del</span>
      <input
        type="date"
        value={current}
        min={min}
        max={max}
        onChange={onChange}
        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 [color-scheme:dark] focus:border-sky-500 focus:outline-none"
      />
      {isPending && <span className="text-xs text-slate-500">actualizando…</span>}
    </label>
  );
}
