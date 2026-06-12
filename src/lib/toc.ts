import * as cheerio from "cheerio";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function generateTableOfContents(htmlContent: string): TocItem[] {
  const $ = cheerio.load(htmlContent);
  const toc: TocItem[] = [];

  $("h2, h3").each((_, element) => {
    const $el = $(element);
    const text = $el.text().trim();
    const level = element.tagName === "h2" ? 2 : 3;

    // Generate an id from the heading text
    const id =
      $el.attr("id") ||
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

    // Add id to the heading element for anchor links
    $el.attr("id", id);

    toc.push({ id, text, level });
  });

  return toc;
}

export function addHeadingIds(htmlContent: string): string {
  const $ = cheerio.load(htmlContent, { xml: false });

  $("h2, h3").each((_, element) => {
    const $el = $(element);
    if (!$el.attr("id")) {
      const text = $el.text().trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      $el.attr("id", id);
    }
  });

  return $("body").html() || htmlContent;
}
