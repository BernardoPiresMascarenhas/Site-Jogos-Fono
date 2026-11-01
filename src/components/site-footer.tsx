import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-sand-200 bg-sand-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} <span className="font-bold text-ink">{siteConfig.name}</span> · {siteConfig.subtitle}
          <span className="block text-ink-faint sm:inline"> · {siteConfig.owner.name}, {siteConfig.owner.role}</span>
        </p>
        <p className="text-ink-faint">
          Ilustrações: Fluent Emoji (Microsoft, licença MIT).{" "}
          <a
            href={siteConfig.owner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-700 underline-offset-4 hover:underline"
          >
            Site profissional
          </a>
        </p>
      </div>
    </footer>
  );
}
