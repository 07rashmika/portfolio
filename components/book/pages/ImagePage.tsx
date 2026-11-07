import Image from "next/image";
import type { Page } from "@/types/book";

export function ImagePage({ page }: { page: Extract<Page, { kind: "image" }> }) {
  return (
    <figure className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <Image src={page.src} alt={page.alt} fill sizes="(min-width: 1024px) 480px, 90vw" className="object-contain" />
      </div>
      {page.caption && <figcaption className="mt-3 text-center font-heading text-base text-ink-faded italic">{page.caption}</figcaption>}
    </figure>
  );
}
