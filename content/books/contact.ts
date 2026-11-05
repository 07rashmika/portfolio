import type { Book } from "@/types/book";

// TODO: replace the placeholder address and links with your own.
export const contact: Book = {
  id: "contact",
  title: "Contact",
  subtitle: "Send a letter",
  spineColor: "red",
  height: 0.92,
  chapters: [
    {
      id: "get-in-touch",
      title: "Get in Touch",
      pages: [
        {
          kind: "contact",
          heading: "Get in touch",
          email: "you@example.com",
          links: [
            { label: "GitHub", href: "https://github.com/your-username" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/your-username" },
          ],
        },
      ],
    },
  ],
};
