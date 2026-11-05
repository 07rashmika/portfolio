import type { Book } from "@/types/book";

// TODO: replace the placeholder roles with your own, one chapter per role.
export const experience: Book = {
  id: "experience",
  title: "Experience",
  subtitle: "Where I've worked",
  spineColor: "navy",
  height: 0.95,
  chapters: [
    {
      id: "company-one",
      title: "Company One",
      pages: [
        {
          kind: "text",
          heading: "Software Engineer · 2024 – present",
          body: "What the team does and what you're responsible for.",
        },
        {
          kind: "list",
          heading: "Highlights",
          items: ["An achievement, with a number if you have one", "Another achievement"],
        },
      ],
    },
    {
      id: "company-two",
      title: "Company Two",
      pages: [
        {
          kind: "text",
          heading: "Intern · 2023",
          body: "What you worked on and what you learned.",
        },
      ],
    },
  ],
};
