/**
 * Allowlist HTML sanitiser. A port of api/src/utils/sanitizeHtml.js, kept
 * identical so the admin preview shows exactly what the API will store, and so
 * the public page does not depend on the API having sanitised what it sent.
 *
 * Safe by construction rather than by spotting bad input: every `<` in the
 * output is one this function wrote itself, as a bare allowlisted tag or an
 * anchor whose href passed the scheme check.
 */

const PLAIN_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote',
]);

/** Site-relative paths and the ordinary link schemes. Never javascript: or data:. */
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

function anchor(attributes: string): string {
  const match = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  const href = (match?.[1] ?? match?.[2] ?? '').trim();
  if (!href || !SAFE_HREF.test(href) || /["<>\s]/.test(href)) return '<a>';

  const external = /^https?:\/\//i.test(href);
  return external
    ? `<a href="${href}" target="_blank" rel="noopener noreferrer">`
    : `<a href="${href}">`;
}

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<!--[\s\S]*?-->/g, '')
    // Script and style bodies would otherwise be left behind as visible text.
    .replace(/<(script|style)\b[^<>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(
      /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*)>|</g,
      (_whole, slash: string | undefined, name: string | undefined, attributes: string | undefined) => {
        if (!name) return '&lt;';

        const tag = name.toLowerCase();
        if (tag === 'a') return slash ? '</a>' : anchor(attributes ?? '');
        if (!PLAIN_TAGS.has(tag)) return '';
        if (tag === 'br') return '<br>';
        return `<${slash ?? ''}${tag}>`;
      }
    )
    .trim();
}

/** The classes that style sanitised rich text on both the public page and the admin preview. */
export const RICH_TEXT_CLASSES =
  'space-y-5 text-base leading-relaxed text-muted [&_a]:text-forest-700 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:text-xl [&_h3]:text-ink [&_h4]:text-lg [&_h4]:text-ink [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5';
