import type { Page } from "@/types/book";
import { PageLink, Paragraphs } from "./PageFrame";

export function ProjectSummaryPage({ page }: { page: Extract<Page, { kind: "project-summary" }> }) {
  return (
    <div className="text-[1.05rem] leading-relaxed">
      <h3 className="font-heading text-2xl leading-tight font-semibold sm:text-3xl">{page.title}</h3>
      {page.year && <p className="mt-1 font-heading text-lg text-ink-faded italic">{page.year}</p>}

      <div className="mt-4">
        <Paragraphs text={page.summary} />
      </div>

      {page.stack.length > 0 && (
        <ul aria-label="Built with" className="mt-5 flex flex-wrap gap-1.5">
          {page.stack.map((tech) => (
            <li key={tech} className="rounded-sm border border-ink-faded/40 px-1.5 py-0.5 font-mono text-xs text-ink-faded">
              {tech}
            </li>
          ))}
        </ul>
      )}

      {page.links && page.links.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
          {page.links.map((link) => (
            <li key={link.href}>
              <PageLink href={link.href}>{link.label}</PageLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
