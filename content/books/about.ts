import type { Book } from "@/types/book";

// TODO: replace the placeholder text with your own.
export const about: Book = {
  id: "about",
  title: "About Me",
  subtitle: "A short autobiography",
  spineColor: "oxblood",
  height: 0.9,
  chapters: [
    {
      id: "introduction",
      title: "Introduction",
      pages: [
        {
          kind: "text",
          heading: "Your Name",
          body: "Software Engineer.\n\nOne or two sentences about what you build and what you care about.",
        },
        {
          kind: "text",
          heading: "My story",
          body: "How you got into software, in a short paragraph.\n\nWhat you're doing now, and what you'd like to do next.",
        },
      ],
    },
    {
      id: "interests",
      title: "Beyond the Code",
      pages: [
        {
          kind: "list",
          heading: "Things I enjoy",
          items: ["Interest one", "Interest two", "Interest three"],
        },
        {
          kind: "text",
          heading: "Currently",
          body: "Reading: a book title.\n\nBuilding: this bookshelf portfolio.",
        },
      ],
    },
  ],
};
