import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-forest text-cream/90">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-heading text-lg font-bold text-cream">HEALTEEN CARE</p>
          <p className="mt-1 font-accent text-sm italic text-mint">{t("tagline")}</p>
        </div>

        <FooterCol title={t("shop")}>
          <FooterLink href="/shop">{nav("shopByType")}</FooterLink>
          <FooterLink href="/health">{nav("shopByNeed")}</FooterLink>
          <FooterLink href="/consultation">{nav("consultation")}</FooterLink>
        </FooterCol>

        <FooterCol title={t("company")}>
          <FooterLink href="/about">{nav("about")}</FooterLink>
          <FooterLink href="/webinars">{nav("webinars")}</FooterLink>
        </FooterCol>

        <FooterCol title={t("support")}>
          <FooterLink href="/account">{nav("account")}</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterCol>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page py-6">
          <p className="text-xs leading-relaxed text-cream/60">{t("disclaimer")}</p>
          <p className="mt-3 text-xs text-cream/50">
            © {year} Healteen Care LLC. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">{title}</p>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-cream/80 transition-colors hover:text-cream">
        {children}
      </Link>
    </li>
  );
}
