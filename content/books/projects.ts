import type { Book } from "@/types/book";

// TODO: replace the placeholder projects with your own.
// A big project can span several pages; a small one can be a single summary page.
export const projects: Book = {
  id: "projects",
  title: "Projects",
  subtitle: "Collected works",
  spineColor: "forest",
  height: 1,
  chapters: [
    {
      id: "bookshelf-portfolio",
      title: "The Bookshelf Portfolio",
      pages: [
        {
          kind: "project-summary",
          title: "The Bookshelf Portfolio",
          year: "2026",
          summary: "This site: a portfolio presented as a wooden bookshelf, where each section is a book you can open.",
          stack: ["Next.js", "TypeScript", "Tailwind CSS", "Motion"],
          links: [{ label: "Source", href: "https://github.com/your-username/portfolio" }],
        },
        {
          kind: "text",
          heading: "Problem & approach",
          body: "What problem the project solves and why it was worth building.\n\nThe approach you took, and the alternatives you ruled out.",
        },
        {
          kind: "list",
          heading: "Architecture",
          items: [
            "Content lives in typed data files, one per book",
            "A pagination step turns chapters into pages and spreads",
            "Page turns are CSS 3D transforms driven by Motion",
          ],
        },
        {
          kind: "text",
          heading: "Outcome",
          body: "What you learned, results, or what you'd do differently.",
        },
      ],
    },
    {
      id: "project-two",
      title: "Project Two",
      pages: [
        {
          kind: "project-summary",
          title: "Project Two",
          year: "2025",
          summary: "One or two sentences about what it does and who it's for.",
          stack: ["React", "Node.js", "PostgreSQL"],
          links: [{ label: "Live demo", href: "https://example.com" }],
        },
      ],
    },
    {
      id: "project-three",
      title: "Project Three",
      pages: [
        {
          kind: "project-summary",
          title: "Project Three",
          year: "2024",
          summary: "One or two sentences about what it does and who it's for.",
          stack: ["Python", "FastAPI"],
        },
      ],
    },
  ],
};
