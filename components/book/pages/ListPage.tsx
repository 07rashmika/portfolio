import type { Page } from "@/types/book";
import { PageHeading, type HeadingLevel } from "./PageFrame";

export function ListPage({ page, level = 3 }: { page: Extract<Page, { kind: "list" }>; level?: HeadingLevel }) {
  return (
    <div className="text-[1.05rem] leading-relaxed">
      <PageHeading level={level} className="mb-4 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{page.heading}</PageHeading>
      <ul className="space-y-2">
        {page.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden className="text-brass">
              ❧
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
