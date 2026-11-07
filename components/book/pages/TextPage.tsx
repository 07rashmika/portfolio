import type { Page } from "@/types/book";
import { Paragraphs } from "./PageFrame";

export function TextPage({ page }: { page: Extract<Page, { kind: "text" }> }) {
  return (
    <div className="text-[1.05rem] leading-relaxed">
      {page.heading && <h3 className="mb-4 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{page.heading}</h3>}
      <Paragraphs text={page.body} />
    </div>
  );
}
