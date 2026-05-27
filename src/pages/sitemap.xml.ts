import { getCollection } from "astro:content";
import { bibleChapters } from "../data/bible.js";
import { hebrewBibleChapters } from "../data/hebrew.js";

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/propovidi/", priority: "0.9", changefreq: "weekly" },
  { path: "/propovidi-po-datah/", priority: "0.8", changefreq: "monthly" },
  { path: "/bible/", priority: "0.9", changefreq: "monthly" },
  { path: "/hebrew-bible/", priority: "0.6", changefreq: "monthly" },
  { path: "/church/", priority: "0.8", changefreq: "weekly" },
  { path: "/slides/", priority: "0.5", changefreq: "monthly" },
  { path: "/slides/builder/", priority: "0.4", changefreq: "monthly" },
  { path: "/group-youtube-meetings/", priority: "0.6", changefreq: "monthly" },
  { path: "/john-wesley-his-life-and-work/", priority: "0.7", changefreq: "monthly" },
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatDate = (value: string | Date | undefined) => {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString().slice(0, 10);
};

const normalizePath = (path: string) =>
  path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;

const renderUrl = ({
  loc,
  lastmod,
  changefreq,
  priority,
}: {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}) => `  <url>
    <loc>${escapeXml(loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}${
  changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ""
}${priority ? `    <priority>${priority}</priority>\n` : ""}  </url>`;

export async function GET({ site }: { site: URL }) {
  const today = new Date().toISOString().slice(0, 10);
  const posts = await getCollection("blog");
  const siteUrl = site ?? new URL("https://wesley.org.ua");

  const urls = [
    ...staticPages.map((page) => ({
      ...page,
      lastmod: today,
    })),
    ...posts.map((post) => ({
      path: normalizePath(post.id),
      lastmod: formatDate(post.data.pubDate) ?? today,
      changefreq: post.id.startsWith("church-in-lviv/") ? "weekly" : "monthly",
      priority: post.id.startsWith("sermons/") ? "0.7" : "0.6",
    })),
    ...bibleChapters.map((chapter) => ({
      path: chapter.path,
      lastmod: today,
      changefreq: "yearly",
      priority: "0.6",
    })),
    ...hebrewBibleChapters.map((chapter) => ({
      path: chapter.path,
      lastmod: today,
      changefreq: "yearly",
      priority: "0.5",
    })),
  ];

  const uniqueUrls = Array.from(
    new Map(
      urls.map((url) => [
        normalizePath(url.path),
        {
          ...url,
          path: normalizePath(url.path),
        },
      ]),
    ).values(),
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map((url) =>
    renderUrl({
      loc: new URL(url.path, siteUrl).toString(),
      lastmod: url.lastmod,
      changefreq: url.changefreq,
      priority: url.priority,
    }),
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
