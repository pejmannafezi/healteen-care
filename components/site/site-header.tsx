"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X, ShoppingCart, User, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/[locale]/(auth)/actions";
import { cn } from "@/lib/utils";

type HeaderUser = { email: string; isAdmin: boolean } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/health", label: t("health") },
    { href: "/consultation", label: t("consultation") },
    { href: "/about", label: t("about") },
    { href: "/webinars", label: t("webinars") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-heading text-xl font-bold tracking-tight text-forest">HEALTEEN CARE</span>
          <span className="font-accent text-[11px] italic text-nature">Natural Healthcare &amp; Herbal Wellness</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-forest/80 transition-colors hover:text-forest">
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
