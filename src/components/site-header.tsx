"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SymbolSearch } from "@/components/symbol-search";
import { cn } from "cn";

const links = [
  { href: "/", label: "Notowania", match: (path: string) => path === "/" || path.startsWith("/instrument") },
  { href: "/wiadomosci", label: "Wiadomości", match: (path: string) => path.startsWith("/wiadomosci") },
];

export function SiteHeader() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-ink text-[#f6f1e6]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-heading text-[1.7rem] leading-none tracking-tight">gpw</span>
          <span className="hidden text-sm text-[#d9c7a2] sm:inline">Notowania z Warszawy</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {links.map((link) => {
            const active = link.match(path);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b pb-0.5",
                  active
                    ? "border-[#c4a46a] text-[#f6f1e6]"
                    : "border-transparent text-[#c9c0ae] hover:text-white",
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="w-full md:ml-auto md:w-80">
          <SymbolSearch />
        </div>
      </div>
    </header>
  );
}
