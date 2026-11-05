import type { Book } from "@/types/book";

// TODO: replace the placeholder certifications and awards with your own.
export const awards: Book = {
  id: "awards",
  title: "Awards",
  subtitle: "Certifications & honours",
  spineColor: "teal",
  height: 0.9,
  chapters: [
    {
      id: "certifications",
      title: "Certifications",
      pages: [
        {
          kind: "list",
          heading: "Certifications",
          items: ["Certification name · Issuer · Year"],
        },
      ],
    },
  ],
};
