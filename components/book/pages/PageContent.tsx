import type { BookPage } from "@/lib/paginate";
import type { Page } from "@/types/book";
import { TableOfContents } from "../TableOfContents";
import { ContactPage } from "./ContactPage";
import { EndPage } from "./EndPage";
import { ImagePage } from "./ImagePage";
import { ListPage } from "./ListPage";
import { PageFrame } from "./PageFrame";
import { ProjectSummaryPage } from "./ProjectSummaryPage";
import { TextPage } from "./TextPage";

type Props = {
  page: BookPage;
  bookTitle: string;
  onJump: (pageIndex: number) => void;
  onClose: () => void;
};

/** Renders any page of a book. The cover never appears inside the book, so it renders nothing. */
export function PageContent({ page, bookTitle, onJump, onClose }: Props) {
  switch (page.kind) {
    case "cover":
      return null;
    case "toc":
      return <TableOfContents page={page} onJump={onJump} />;
    case "end":
      return <EndPage bookTitle={bookTitle} onContents={() => onJump(1)} onClose={onClose} />;
    case "content":
      return (
        <PageFrame page={page}>
          <ContentBody page={page.page} />
        </PageFrame>
      );
  }
}

function ContentBody({ page }: { page: Page }) {
  switch (page.kind) {
    case "text":
      return <TextPage page={page} />;
    case "list":
      return <ListPage page={page} />;
    case "image":
      return <ImagePage page={page} />;
    case "project-summary":
      return <ProjectSummaryPage page={page} />;
    case "contact":
      return <ContactPage page={page} />;
  }
}
