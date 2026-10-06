'use client';

import { useRef, useState } from 'react';
import { sanitizeHtml, RICH_TEXT_CLASSES } from '@/lib/sanitizeHtml';

/**
 * A rich-text control for the handful of fields stored as HTML.
 *
 * Deliberately a toolbar over a plain textarea rather than a contentEditable
 * editor: the stored value is the small tag allowlist in lib/sanitizeHtml.ts,
 * and a textarea can only ever produce what is visibly in it, where a
 * contentEditable region smuggles in whatever the clipboard carried. The
 * Preview tab runs the same sanitiser the API does, so what it shows is what
 * the public page will render.
 */
const BLOCKS = [
  { label: 'Paragraph', tag: 'p' },
  { label: 'Heading', tag: 'h3' },
  { label: 'Quote', tag: 'blockquote' },
] as const;

const INLINE = [
  { label: 'Bold', tag: 'strong', className: 'font-semibold' },
  { label: 'Italic', tag: 'em', className: 'italic' },
] as const;

const toolButton =
  'rounded border border-sand-300 bg-white px-2.5 py-1 text-xs text-ink transition-colors hover:border-forest-900';

export function RichTextField({
  label,
  name,
  value,
  onChange,
  rows = 10,
  maxLength,
  hint,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  hint?: string;
  error?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  /** Replaces the selection with `build(selection)` and reselects the result. */
  function transform(build: (selected: string) => string) {
    const el = ref.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end } = el;
    const replacement = build(value.slice(start, end));
    const next = value.slice(0, start) + replacement + value.slice(end);
    if (maxLength !== undefined && next.length > maxLength) return;

    onChange(next);
    // The textarea re-renders with the new value first; restore focus after.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + replacement.length);
    });
  }

  const wrap = (tag: string) => transform((s) => `<${tag}>${s || 'Text'}</${tag}>`);

  function list(tag: 'ul' | 'ol') {
    transform((s) => {
      const items = (s || 'First item\nSecond item')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `  <li>${line}</li>`);
      return `<${tag}>\n${items.join('\n')}\n</${tag}>`;
    });
  }

  function link() {
    const href = window.prompt('Link address (https://… or a page on this site such as /tours)');
    if (!href) return;
    transform((s) => `<a href="${href.trim().replace(/"/g, '')}">${s || 'link text'}</a>`);
  }

  const clean = sanitizeHtml(value);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={name} className="block text-sm font-medium text-ink">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          aria-pressed={preview}
          className="text-xs text-forest-700 underline underline-offset-2 hover:no-underline"
        >
          {preview ? 'Back to editing' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div className="min-h-32 rounded-lg border border-sand-300 bg-sand-50 p-4">
          {clean ? (
            <div className={RICH_TEXT_CLASSES} dangerouslySetInnerHTML={{ __html: clean }} />
          ) : (
            <p className="text-sm text-muted">Nothing to preview yet.</p>
          )}
        </div>
      ) : null}

      {/* Hidden rather than unmounted while previewing, so the selection and
          the browser's undo history survive a look at the preview. */}
      <div className={preview ? 'hidden' : ''}>
        <div
          role="toolbar"
          aria-label={`${label} formatting`}
          className="flex flex-wrap gap-1.5 rounded-t-lg border border-b-0 border-sand-300 bg-sand-50 p-2"
        >
          {INLINE.map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => wrap(item.tag)}
              className={`${toolButton} ${item.className}`}
            >
              {item.label}
            </button>
          ))}
          {BLOCKS.map((item) => (
            <button key={item.tag} type="button" onClick={() => wrap(item.tag)} className={toolButton}>
              {item.label}
            </button>
          ))}
          <button type="button" onClick={() => list('ul')} className={toolButton}>
            Bullet list
          </button>
          <button type="button" onClick={() => list('ol')} className={toolButton}>
            Numbered list
          </button>
          <button type="button" onClick={link} className={toolButton}>
            Link
          </button>
        </div>
        <textarea
          ref={ref}
          id={name}
          name={name}
          value={value}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          className={`w-full rounded-b-lg border px-3 py-2.5 font-mono text-sm focus:outline-none ${
            error ? 'border-maroon-600' : 'border-sand-300 focus:border-amber-500'
          }`}
        />
      </div>

      {hint && !error ? (
        <p id={`${name}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-xs text-maroon-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
