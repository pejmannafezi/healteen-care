import sanitizeHtml from "sanitize-html";

/**
 * Allowlist sanitiser for admin-authored inline rich text.
 * Stored HTML is rendered via dangerouslySetInnerHTML, so it MUST be sanitised
 * on the server before persisting. Only basic formatting + safe links are kept.
 */
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ["b", "strong", "i", "em", "u", "a", "ul", "ol", "li", "br", "p", "span"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Force safe link behaviour.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
    // No styles/classes from the editor — keep markup minimal.
    allowedClasses: {},
    disallowedTagsMode: "discard",
  }).trim();
}

/** Strip ALL tags — used for plain-text fields (titles, button labels, etc.). */
export function sanitizePlainText(dirty: string): string {
  return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} }).trim();
}
