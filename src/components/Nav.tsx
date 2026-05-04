"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Lightbulb, Bookmark, PlusCircle } from "lucide-react";

const links = [
  { href: "/", label: "Recipes", icon: BookOpen },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/inspiration", label: "Saved", icon: Bookmark },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <Link href="/">
          <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            MaggieMade Cookbook
          </span>
        </Link>
        <Link
          href="/recipes/new"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: "var(--primary)" }}
        >
          <PlusCircle size={15} />
          <span>Add</span>
        </Link>
      </header>

      {/* Bottom nav for mobile */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex border-t"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors"
              style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
