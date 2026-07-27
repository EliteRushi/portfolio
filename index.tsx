import { createFileRoute } from "@tanstack/react-router";
// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Portfolio" },
      { name: "description", content: "A modern dark-theme portfolio of Web, AI, Python, CAD, and Electronics projects." },
      { property: "og:title", content: "Project Portfolio" },
      { property: "og:description", content: "A modern dark-theme portfolio of Web, AI, Python, CAD, and Electronics projects." },
    ],
  }),
  component: Index,
});
// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  // The portfolio is a fully static site under /portfolio/ — served straight
  // from public/portfolio/ so the same files work on GitHub Pages as-is.
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <img
        data-lovable-blank-page-placeholder="REMOVE_THIS"
        src="https://cdn.gpteng.co/blank-app-v1.svg"
        alt="Your app will live here!"
      />
    </div>
    <iframe
      src="/portfolio/index.html"
      title="Portfolio"
      style={{ width: "100vw", height: "100vh", border: 0, display: "block" }}
    />
  );
}
