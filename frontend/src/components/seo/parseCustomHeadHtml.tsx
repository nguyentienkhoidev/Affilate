import React from 'react';

const ATTR_NAME_MAP: Record<string, string> = {
  crossorigin: 'crossOrigin',
  referrerpolicy: 'referrerPolicy',
  charset: 'charSet',
  'http-equiv': 'httpEquiv',
  nomodule: 'noModule',
  fetchpriority: 'fetchPriority',
  imagesizes: 'imageSizes',
  imagesrcset: 'imageSrcSet',
  hreflang: 'hrefLang',
  tabindex: 'tabIndex',
};

const BOOLEAN_ATTRS = new Set(['async', 'defer', 'noModule', 'disabled']);

function parseAttributes(attrString: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};
  const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrString)) !== null) {
    const rawName = match[1].toLowerCase();
    if (rawName === 'class') continue;
    const propName = ATTR_NAME_MAP[rawName] || rawName;
    const value = match[2] ?? match[3] ?? match[4];

    if (value === undefined) {
      if (BOOLEAN_ATTRS.has(propName)) {
        attrs[propName] = true;
      } else {
        attrs[propName] = '';
      }
    } else if (BOOLEAN_ATTRS.has(propName)) {
      attrs[propName] = value !== 'false';
    } else {
      attrs[propName] = value;
    }
  }

  return attrs;
}

export interface CustomHeadValidationResult {
  valid: boolean;
  errorCode?:
    | 'UNCLOSED_COMMENT'
    | 'UNCLOSED_TAG'
    | 'UNEXPECTED_CLOSING_TAG'
    | 'UNSUPPORTED_TAG'
    | 'MALFORMED_ATTRIBUTES'
    | 'META_MISSING_ATTRS'
    | 'LINK_MISSING_HREF'
    | 'SCRIPT_EMPTY'
    | 'STYLE_EMPTY'
    | 'INVALID_SYNTAX';
  tagName?: string;
  tagCount: number;
}

function hasMalformedAttributes(attrString: string): boolean {
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < attrString.length; i++) {
    const ch = attrString[i];
    if (quote) {
      if (ch === quote && attrString[i - 1] !== '\\') {
        quote = null;
      }
    } else {
      if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === '<') {
        return true;
      }
    }
  }
  return quote !== null;
}

const HEAD_TAG_REGEX =
  /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>|<(meta|link)\b([^>]*?)\s*\/?>/gi;

/**
 * Validates raw HTML snippets intended for <head> (<meta>, <link>, <script>, <style>).
 */
export function validateCustomHeadHtml(rawHtml?: string): CustomHeadValidationResult {
  if (!rawHtml || !rawHtml.trim()) {
    return { valid: true, tagCount: 0 };
  }

  // Check for unclosed HTML comments
  let searchIdx = 0;
  while (true) {
    const openComment = rawHtml.indexOf('<!--', searchIdx);
    if (openComment === -1) break;
    const closeComment = rawHtml.indexOf('-->', openComment + 4);
    if (closeComment === -1) {
      return { valid: false, errorCode: 'UNCLOSED_COMMENT', tagCount: 0 };
    }
    searchIdx = closeComment + 3;
  }

  const cleaned = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
  if (!cleaned.trim()) {
    return { valid: true, tagCount: 0 };
  }

  const regex = new RegExp(HEAD_TAG_REGEX.source, 'gi');
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let tagCount = 0;

  const inspectLeftover = (chunk: string): CustomHeadValidationResult | null => {
    const trimmed = chunk.trim();
    if (!trimmed) return null;

    const unclosedContainer = trimmed.match(/<(script|style)\b/i);
    if (unclosedContainer) {
      return {
        valid: false,
        errorCode: 'UNCLOSED_TAG',
        tagName: unclosedContainer[1].toLowerCase(),
        tagCount,
      };
    }

    const closingTag = trimmed.match(/<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/);
    if (closingTag) {
      return {
        valid: false,
        errorCode: 'UNEXPECTED_CLOSING_TAG',
        tagName: closingTag[1].toLowerCase(),
        tagCount,
      };
    }

    const otherTag = trimmed.match(/<([a-zA-Z][a-zA-Z0-9-]*)\b/);
    if (otherTag) {
      const name = otherTag[1].toLowerCase();
      if (name === 'meta' || name === 'link') {
        return {
          valid: false,
          errorCode: 'MALFORMED_ATTRIBUTES',
          tagName: name,
          tagCount,
        };
      }
      return {
        valid: false,
        errorCode: 'UNSUPPORTED_TAG',
        tagName: name,
        tagCount,
      };
    }

    return { valid: false, errorCode: 'INVALID_SYNTAX', tagCount };
  };

  while ((match = regex.exec(cleaned)) !== null) {
    const leftover = cleaned.slice(lastIndex, match.index);
    const leftoverError = inspectLeftover(leftover);
    if (leftoverError) return leftoverError;
    lastIndex = regex.lastIndex;

    const tagName = (match[1] || match[4]).toLowerCase();
    const attrString = match[1] ? match[2] || '' : match[5] || '';
    const innerContent = match[1] ? match[3] || '' : '';

    if (hasMalformedAttributes(attrString)) {
      return {
        valid: false,
        errorCode: 'MALFORMED_ATTRIBUTES',
        tagName,
        tagCount,
      };
    }

    const attrs = parseAttributes(attrString);

    if (tagName === 'meta') {
      if (Object.keys(attrs).length === 0) {
        return { valid: false, errorCode: 'META_MISSING_ATTRS', tagName, tagCount };
      }
    } else if (tagName === 'link') {
      if (!attrs.href && !attrs.imageSrcSet) {
        return { valid: false, errorCode: 'LINK_MISSING_HREF', tagName, tagCount };
      }
    } else if (tagName === 'script') {
      const scriptAttrs = attrs as React.ScriptHTMLAttributes<HTMLScriptElement>;
      if (!scriptAttrs.src && !innerContent.trim()) {
        return { valid: false, errorCode: 'SCRIPT_EMPTY', tagName, tagCount };
      }
    } else if (tagName === 'style') {
      if (!innerContent.trim()) {
        return { valid: false, errorCode: 'STYLE_EMPTY', tagName, tagCount };
      }
    }

    tagCount++;
  }

  const trailingError = inspectLeftover(cleaned.slice(lastIndex));
  if (trailingError) return trailingError;

  return { valid: true, tagCount };
}

/**
 * Safely parses raw HTML snippets (<meta>, <link>, <script>, <style>) configured
 * in Admin System Settings into valid React elements for injection into <head>.
 */
export function parseCustomHeadHtml(rawHtml?: string): React.ReactNode[] {
  if (!rawHtml || !rawHtml.trim()) {
    return [];
  }

  const nodes: React.ReactNode[] = [];
  const cleaned = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
  const tagRegex = new RegExp(HEAD_TAG_REGEX.source, 'gi');
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tagRegex.exec(cleaned)) !== null) {
    const tagName = (match[1] || match[4]).toLowerCase();
    const attrString = match[1] ? match[2] || '' : match[5] || '';
    const innerContent = match[1] ? match[3] || '' : '';
    const attrs = parseAttributes(attrString);
    const key = `custom-head-${tagName}-${idx++}`;

    if (tagName === 'meta') {
      nodes.push(<meta key={key} {...(attrs as React.MetaHTMLAttributes<HTMLMetaElement>)} />);
    } else if (tagName === 'link') {
      nodes.push(<link key={key} {...(attrs as React.LinkHTMLAttributes<HTMLLinkElement>)} />);
    } else if (tagName === 'script') {
      const scriptAttrs = attrs as React.ScriptHTMLAttributes<HTMLScriptElement>;
      if (scriptAttrs.src) {
        nodes.push(<script key={key} {...scriptAttrs} />);
      } else if (innerContent.trim()) {
        nodes.push(
          <script
            key={key}
            {...scriptAttrs}
            dangerouslySetInnerHTML={{ __html: innerContent }}
          />
        );
      }
    } else if (tagName === 'style' && innerContent.trim()) {
      nodes.push(
        <style
          key={key}
          {...(attrs as React.StyleHTMLAttributes<HTMLStyleElement>)}
          dangerouslySetInnerHTML={{ __html: innerContent }}
        />
      );
    }
  }

  return nodes;
}
