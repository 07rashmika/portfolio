import type { Book } from "@/types/book";

// TODO: replace the placeholder education details with your own.
export const education: Book = {
  id: "education",
  title: "Education",
  subtitle: "Studies & coursework",
  spineColor: "plum",
  height: 0.97,
  chapters: [
    {
      id: "degree",
      title: "Degree",
      pages: [
        {
          kind: "text",
          heading: "BSc in Computer Science",
          body: "University name · 2020 – 2024\n\nA line about your focus or final-year project.",
        },
        {
          kind: "list",
          heading: "Notable coursework",
          items: ["Data Structures & Algorithms", "Databases", "Software Engineering"],
        },
      ],
    },
  ],
};
