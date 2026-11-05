import type { Book } from "@/types/book";

// TODO: replace the placeholder skills with your own.
export const skills: Book = {
  id: "skills",
  title: "Skills",
  subtitle: "An index of tools & trades",
  spineColor: "ochre",
  height: 0.87,
  chapters: [
    {
      id: "languages",
      title: "Languages",
      pages: [{ kind: "list", heading: "Languages", items: ["TypeScript", "Python", "SQL"] }],
    },
    {
      id: "frameworks",
      title: "Frameworks & Tools",
      pages: [{ kind: "list", heading: "Frameworks & Tools", items: ["React", "Next.js", "Node.js", "Git"] }],
    },
  ],
};
