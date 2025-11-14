/*!
 * toon.js · TOON format parser (minimal) · v0.2
 * Author: Riccardo Mantelli
 *
 * Purpose:
 *   Provide a compact, dependency-free parser for the TOON data description
 *   format. The parser focuses on the "tabular uniform-block" subset of TOON,
 *   which is the most token-efficient and the most suitable for LLM-friendly
 *   interaction or p5.js data injection.
 *
 * Supported grammar subset:
 *
 *   IDENT[LENGTH]{FIELD1,FIELD2,...}:
 *     v11, v12, ...
 *     v21, v22, ...
 *     ...
 *
 * Notes:
 *   - Only flat, uniform-row blocks are supported.
 *   - Nesting, variant record types, lists-within-lists and inline maps are
 *     intentionally excluded in this minimal parser.
 *   - Parsing strategy is purely lexical/line-oriented; no global lookahead
 *     beyond header detection.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);                // AMD compatibility
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();         // CommonJS
  } else {
    root.Toon = factory();              // Browser global
  }
}(this, function () {
  'use strict';

  /**
   * Detects whether a line matches the canonical TOON header signature:
   *   name[N]{field1,field2,...}:
   *
   * The regex explicitly enforces:
   *  - ASCII identifier for block name.
   *  - Integer length hint in brackets.
   *  - One or more comma-separated fields within braces.
   *  - Terminal colon.
   */
  function isHeader(line) {
    return /^[A-Za-z_][\w]*\[\d+\]\{[^}]+\}:$/.test(line);
  }

  /**
   * Extracts the header tuple:
   *   { name, count, fields[] }
   *
   * No downstream parsing is performed here; this phase focuses solely
   * on structural extraction, leaving semantic interpretation to callers.
   */
  function parseHeader(line) {
    const m = line.match(/^([A-Za-z_][\w]*)\[(\d+)\]\{([^}]+)\}:$/);
    if (!m) return null;

    const name = m[1];
    const count = parseInt(m[2], 10);
    const fields = m[3]
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    return { name, count, fields };
  }

  /**
   * Performs type coercion of scalar values:
   *   - numeric tokens → Number
   *   - "true"/"false" → Boolean
   *   - "null" → null
   *   - quoted strings → unquoted string
   *   - all other tokens → raw string
   *
   * This limited coercion is intentionally conservative to avoid accidental
   * interpretation of user data.
   */
  function parseValue(raw) {
    const t = raw.trim();

    // fast-path boolean and null
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (t === 'null') return null;

    // numeric inspection (IEEE754)
    const num = Number(t);
    if (!Number.isNaN(num)) return num;

    // strip double quotes if present
    return t.replace(/^"(.*)"$/, '$1');
  }

  /**
   * Core parser:
   *   Consumes a full TOON document provided as a string and returns a mapping:
   *
   *       { identifier: [ { field: value, ... }, ... ] }
   *
   * Parsing rules:
   *   - Line-based processing.
   *   - Header establishes a block context.
   *   - Subsequent rows are consumed until the next header or EOF.
   *   - No nested scopes; everything is top-level.
   */
  function parseFromString(text) {
    // Pre-clean: remove empty lines and comment lines
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));

    const result = {};
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!isHeader(line)) {
        i++;
        continue;
      }

      const header = parseHeader(line);
      if (!header) {
        i++;
        continue;
      }

      const { name, count, fields } = header;
      const rows = [];

      i++; // transition to data section

      // Consume rows until next header or EOF
      while (i < lines.length && !isHeader(lines[i])) {
        const row = lines[i].split(',').map(v => v.trim()).filter(Boolean);
        const obj = {};

        // Functional mapping: field[i] → value[i]
        for (let j = 0; j < fields.length; j++) {
          const fieldName = fields[j];
          const raw = row[j] !== undefined ? row[j] : '';
          obj[fieldName] = parseValue(raw);
        }

        rows.push(obj);
        i++;
      }

      // Merge-block semantics: if a block with the same name reoccurs,
      // rows are concatenated. TOON does not forbid duplicate identifiers.
      if (!result[name]) {
        result[name] = rows;
      } else {
        result[name] = result[name].concat(rows);
      }

      // Count mismatch is not fatal; emit diagnostic only.
      if (rows.length !== count && typeof console !== 'undefined') {
        console.warn(
          `[TOON] Declared row-count mismatch for block "${name}": expected=${count}, parsed=${rows.length}`
        );
      }
    }

    return result;
  }

  /**
   * Wrapper tailored for p5.js users where `loadStrings()` returns an
   * array of lines. This function simply reassembles the text buffer
   * and defers to the canonical parser.
   */
  function parseFromLines(lines) {
    if (!Array.isArray(lines)) {
      throw new Error('Toon.parseFromLines expects an array of strings');
    }
    return parseFromString(lines.join('\n'));
  }

  // Public API surface
  return {
    parseFromString,
    parseFromLines
  };
}));
