import clsx from "clsx";

import { ChatKitPanel } from "./ChatKitPanel";
import { FactCard } from "./FactCard";
import { ThemeToggle } from "./ThemeToggle";
import { ColorScheme } from "../hooks/useColorScheme";
import { useFacts } from "../hooks/useFacts";

export default function Home({
  scheme,
  handleThemeChange,
}: {
  scheme: ColorScheme;
  handleThemeChange: (scheme: ColorScheme) => void;
}) {
  const { facts, refresh, performAction } = useFacts();

  const containerClass = clsx(
    "min-h-screen bg-gradient-to-br transition-colors duration-300",
    scheme === "dark"
      ? "from-slate-900 via-slate-950 to-slate-850 text-slate-100"
      : "from-slate-100 via-white to-slate-200 text-slate-900"
  );

  return (
    <div className={containerClass}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10">
        <header className="mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">TicketBot</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Let me know what's wrong and I'll get that info to the right person
            </p>
          </div>
          <ThemeToggle value={scheme} onChange={handleThemeChange} />
        </header>

        <div className="relative flex-1 overflow-hidden rounded-3xl bg-white/80 shadow-[0_45px_90px_-45px_rgba(15,23,42,0.6)] ring-1 ring-slate-200/60 backdrop-blur dark:bg-slate-900/70 dark:shadow-[0_45px_90px_-45px_rgba(15,23,42,0.85)] dark:ring-slate-800/60">
          <ChatKitPanel
            theme={scheme}
            onWidgetAction={performAction}
            onResponseEnd={refresh}
            onThemeRequest={handleThemeChange}
          />
        </div>
      </div>
    </div>
  );
}
