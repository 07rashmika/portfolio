import type { BookPage } from "@/lib/paginate";
import type { Page } from "@/types/book";
import { TableOfContents } from "../TableOfContents";
import { ContactPage } from "./ContactPage";
import { EndPage } from "./EndPage";
import { ImagePage } from "./ImagePage";
import { ListPage } from "./ListPage";
import { PageFrame, type HeadingLevel } from "./PageFrame";
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

/** The body of a content page, without the book's page frame. Also used by the reading room. */
export function ContentBody({ page, level }: { page: Page; level?: HeadingLevel }) {
  switch (page.kind) {
    case "text":
      return <TextPage page={page} level={level} />;
    case "list":
      return <ListPage page={page} level={level} />;
    case "image":
      return <ImagePage page={page} />;
    case "project-summary":
      return <ProjectSummaryPage page={page} level={level} />;
    case "contact":
      return <ContactPage page={page} level={level} />;
  }
}
