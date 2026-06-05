/** Convert any YouTube watch/live/short URL into a privacy-friendly embed URL. */
export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/embed/")[1];
    else if (u.pathname.startsWith("/live/")) id = u.pathname.split("/live/")[1];
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/shorts/")[1];
    else id = u.searchParams.get("v") ?? "";
    id = (id || "").split(/[/?&#]/)[0];
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  } catch {
    return null;
  }
}
