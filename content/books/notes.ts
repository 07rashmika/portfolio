import type { Book } from "@/types/book";

// TODO: replace the placeholder notes with excerpts from your own posts.
export const notes: Book = {
  id: "notes",
  title: "Notes",
  subtitle: "Writing & ideas",
  spineColor: "tan",
  height: 0.86,
  chapters: [
    {
      id: "first-note",
      title: "A First Note",
      pages: [
        {
          kind: "text",
          heading: "A first note",
          body: "A short excerpt from something you've written.",
        },
      ],
    },
  ],
};
