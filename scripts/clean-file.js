#!/usr/bin/env node
/**
 * Strips comments and converts leading-whitespace indentation to tabs for a single file.
 * Uses the real TypeScript parser to find comment ranges, so it never touches text
 * inside strings/template literals/JSX (unlike a naive regex).
 *
 * Usage: node clean-file.js <path-to-file>
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const INDENT_UNIT = 4;

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node clean-file.js <file>');
    process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();
const scriptKind = ext === '.tsx' ? ts.ScriptKind.TSX
    : ext === '.ts' ? ts.ScriptKind.TS
        : ts.ScriptKind.JSX; // .js / .jsx: CRA allows JSX in .js

const originalText = fs.readFileSync(filePath, 'utf8');
const sourceFile = ts.createSourceFile(filePath, originalText, ts.ScriptTarget.Latest, true, scriptKind);

function collectCommentRanges(node, fullText, out) {
    const children = node.getChildren(sourceFile);
    if (children.length === 0) {
        const leading = ts.getLeadingCommentRanges(fullText, node.pos) || [];
        for (const r of leading) out.push({ pos: r.pos, end: r.end });
        const trailing = ts.getTrailingCommentRanges(fullText, node.end) || [];
        for (const r of trailing) out.push({ pos: r.pos, end: r.end });
        return;
    }
    for (const child of children) collectCommentRanges(child, fullText, out);
}

const commentRanges = [];
collectCommentRanges(sourceFile, originalText, commentRanges);
commentRanges.sort((a, b) => a.pos - b.pos);

// Dedupe (a comment can be reported as both trailing-of-prev and leading-of-next in edge cases).
for (let i = commentRanges.length - 1; i > 0; i--) {
    if (commentRanges[i].pos === commentRanges[i - 1].pos) commentRanges.splice(i, 1);
}

// Extend ranges to swallow the whole line when a comment is the only thing on it.
const removals = commentRanges.map(({ pos, end }) => {
    const lineStart = originalText.lastIndexOf('\n', pos - 1) + 1;
    let lineEnd = originalText.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = originalText.length;

    const prefix = originalText.slice(lineStart, pos);
    const suffix = originalText.slice(end, lineEnd);

    if (prefix.trim() === '' && suffix.trim() === '') {
        const removalEnd = lineEnd < originalText.length ? lineEnd + 1 : lineEnd;
        return { start: lineStart, end: removalEnd };
    }
    return { start: pos, end };
});

let result = '';
let cursor = 0;
for (const { start, end } of removals) {
    if (start < cursor) continue; // guard against any overlap
    result += originalText.slice(cursor, start);
    cursor = end;
}
result += originalText.slice(cursor);

// Cosmetic safety net: trim trailing whitespace per line, collapse 3+ blank lines to 1.
result = result.replace(/[ \t]+$/gm, '');
result = result.replace(/\n{3,}/g, '\n\n');

// Convert leading indentation (spaces) to tabs, INDENT_UNIT spaces per tab.
result = result.replace(/^[ \t]+/gm, (whitespace) => {
    const existingTabs = whitespace.match(/^\t*/)[0];
    const rest = whitespace.slice(existingTabs.length);
    const spaceGroups = Math.floor(rest.length / INDENT_UNIT);
    const leftoverSpaces = rest.length % INDENT_UNIT;
    return existingTabs + '\t'.repeat(spaceGroups) + ' '.repeat(leftoverSpaces);
});

fs.writeFileSync(filePath, result, 'utf8');
