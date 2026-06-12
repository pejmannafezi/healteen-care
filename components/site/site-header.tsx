"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, ShoppingCart, User, LayoutDashboard, LogOut, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/[locale]/(auth)/actions";
import { cn } from "@/lib/utils";

type HeaderUser = { email: string; isAdmin: boolean } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/health", label: t("health") },
    { href: "/live", label: t("live") },
    { href: "/consultation", label: t("consultation") },
    { href: "/about", label: t("about") },
    { href: "/webinars", label: t("webinars") },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5 leading-none" aria-label="Healteen Care home">
          <span className="flex size-9 items-center justify-center rounded-full bg-forest text-cream transition-transform duration-300 group-hover:scale-105">
            <Leaf className="size-5" strokeWidth={2} />
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight text-forest">HEALTEEN CARE</span>
            <span className="font-accent text-[11px] italic text-nature">Natural Healthcare &amp; Herbal Wellness</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-gold after:transition-all after:duration-300 hover:text-forest",
                isActive(l.href) ? "text-forest after:w-full" : "text-forest/75 after:w-0 hover:after:w-full"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/cart" aria-label={t("cart")}>
            <Button variant="ghost" size="icon"><ShoppingCart /></Button>
          </Link>

          {user ? (
            <>
              {user.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm"><LayoutDashboard /> Admin</Button>
                </Link>
              )}
              <Link href="/account">
                <Button variant="outline" size="sm"><User /> {t("account")}</Button>
              </Link>
              <form action={signOutAction}>
                <Button variant="ghost" size="icon" type="submit" aria-label="Sign out"><LogOut /></Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="outline" size="sm">{t("login")}</Button></Link>
              <Link href="/register"><Button size="sm">{t("register")}</Button></Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-forest" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <div className={cn("lg:hidden overflow-hidden border-t border-border bg-cream transition-[max-height]", open ? "max-h-[28rem]" : "max-h-0 border-t-0")}>
        <nav className="container-page flex flex-col gap-1 py-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-forest/90 hover:bg-forest/5">
              {l.label}
            </Link>
          ))}
          <Link href="/cart" onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-forest/90 hover:bg-forest/5">
            {t("cart")}
          </Link>

          {user ? (
            <div className="mt-2 space-y-2">
              {user.isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)}><Button variant="outline" className="w-full"><LayoutDashboard /> Admin</Button></Link>
              )}
              <Link href="/account" onClick={() => setOpen(false)}><Button variant="outline" className="w-full"><User /> {t("account")}</Button></Link>
              <form action={signOutAction}><Button variant="ghost" type="submit" className="w-full"><LogOut /> Sign out</Button></form>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="flex-1" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">{t("login")}</Button></Link>
              <Link href="/register" className="flex-1" onClick={() => setOpen(false)}><Button className="w-full">{t("register")}</Button></Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
