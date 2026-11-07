import type { BookPage } from "@/lib/paginate";
import { toRoman } from "@/lib/roman";

type Props = {
  page: Extract<BookPage, { kind: "content" }>;
  children: React.ReactNode;
};

/** The printed frame around a page: a running head (or chapter number) on top, the page number below. */
export function PageFrame({ page, children }: Props) {
  return (
    <div className="flex h-full flex-col px-[10%] pt-[8%] pb-[6%]">
      <p className="truncate text-center font-display text-[0.7rem] tracking-[0.22em] text-ink-faded uppercase">
        {page.isChapterStart ? `Chapter ${toRoman(page.chapterNumber)}` : page.chapterTitle}
      </p>
      <div className="mt-[7%] min-h-0 flex-1 overflow-hidden">{children}</div>
      <p className="mt-2 text-center text-sm text-ink-faded">{page.number}</p>
    </div>
  );
}

/** Paragraphs are separated by a blank line in the content files. */
export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .filter((paragraph) => paragraph.trim())
        .map((paragraph, i) => (
          <p key={i} className="mt-3 first:mt-0">
            {paragraph.trim()}
          </p>
        ))}
    </>
  );
}

export function PageLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-spine-oxblood underline decoration-brass/70 underline-offset-[3px] transition-colors hover:decoration-spine-oxblood"
    >
      {children}
    </a>
  );
}
