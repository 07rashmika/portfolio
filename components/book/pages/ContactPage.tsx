import type { Page } from "@/types/book";
import { PageHeading, PageLink, type HeadingLevel } from "./PageFrame";

export function ContactPage({ page, level = 3 }: { page: Extract<Page, { kind: "contact" }>; level?: HeadingLevel }) {
  return (
    <div className="text-[1.05rem] leading-relaxed">
      <PageHeading level={level} className="mb-4 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{page.heading ?? "Get in touch"}</PageHeading>
      <p>Write to me at</p>
      <p className="mt-1 font-heading text-xl">
        <PageLink href={`mailto:${page.email}`}>{page.email}</PageLink>
      </p>

      {page.links.length > 0 && (
        <ul className="mt-6 space-y-2">
          {page.links.map((link) => (
            <li key={link.href} className="flex gap-3">
              <span aria-hidden className="text-brass">
                ❧
              </span>
              <PageLink href={link.href}>{link.label}</PageLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
