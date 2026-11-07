import type { Page } from "@/types/book";

export function ListPage({ page }: { page: Extract<Page, { kind: "list" }> }) {
  return (
    <div className="text-[1.05rem] leading-relaxed">
      <h3 className="mb-4 font-heading text-2xl leading-tight font-semibold sm:text-3xl">{page.heading}</h3>
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
