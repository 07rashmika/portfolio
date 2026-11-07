import type { Page } from "@/types/book";
import { PageHeading, Paragraphs, type HeadingLevel } from "./PageFrame";

export function TextPage({ page, level = 3 }: { page: Extract<Page, { kind: "text" }>; level?: HeadingLevel }) {
  return (
    <div className="text-[1.05rem] leading-relaxed">
      {page.heading && <PageHeading level={level} className="mb-4 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{page.heading}</PageHeading>}
      <Paragraphs text={page.body} />
    </div>
  );
}
