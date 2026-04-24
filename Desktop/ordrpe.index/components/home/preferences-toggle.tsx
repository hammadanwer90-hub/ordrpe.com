"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  theme: "light" | "dark";
  lang: "en" | "ur";
};

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
  try {
    localStorage.setItem(name, value);
  } catch {}
}

export function PreferencesToggle({ theme, lang }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateTheme(nextTheme: "light" | "dark") {
    setCookie("ordrpe_theme", nextTheme);
    startTransition(() => router.refresh());
  }

  function updateLang(nextLang: "en" | "ur") {
    setCookie("ordrpe_lang", nextLang);
    startTransition(() => router.refresh());
  }

  return (
    <section className="ordrpe-card flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex gap-2">
        <button
          onClick={() => updateTheme("light")}
          disabled={isPending}
          className={`rounded-full border px-3 py-1 text-xs ${theme === "light" ? "text-brand border-soft" : "border-soft text-muted"}`}
        >
          Light
        </button>
        <button
          onClick={() => updateTheme("dark")}
          disabled={isPending}
          className={`rounded-full border px-3 py-1 text-xs ${theme === "dark" ? "text-brand border-soft" : "border-soft text-muted"}`}
        >
          Dark
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => updateLang("en")}
          disabled={isPending}
          className={`rounded-full border px-3 py-1 text-xs ${lang === "en" ? "text-brand border-soft" : "border-soft text-muted"}`}
        >
          English
        </button>
        <button
          onClick={() => updateLang("ur")}
          disabled={isPending}
          className={`rounded-full border px-3 py-1 text-xs ${lang === "ur" ? "text-brand border-soft" : "border-soft text-muted"}`}
        >
          Urdu
        </button>
      </div>
    </section>
  );
}
