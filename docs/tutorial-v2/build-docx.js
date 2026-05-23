// build-docx.js
//
// Converts the multi-file Korean markdown tutorial under
// docs/tutorial-v2/ into a single, polished .docx file styled
// like 박대근 교수님's ABSwitch_Phase_W_자습서.docx.
//
// Usage:
//   node build-docx.js                 # build the real tutorial
//   node build-docx.js --test          # render the included sample file
//
// All output goes next to this script.
//
// Implementation notes:
//   - Uses `marked` to lex markdown into a flat token stream (we use the
//     lexer, NOT the renderer, so we get structured tokens with type/depth/text).
//   - Walks the token stream and emits docx-js Paragraph / Table / etc.
//   - Heading levels override the built-in Heading1..Heading4 style ids,
//     so the user can re-skin from inside Word later if they want.
//   - Code blocks become a single-cell Table (gray shading + thin border) —
//     we use a Table rather than `pBdr` because docx-js serializes paragraph
//     borders in the order `top, bottom, left, right`, which violates the
//     OOXML CT_PBdr schema sequence (should be `top, left, bottom, right`).
//     Table borders are emitted correctly.
//   - `> blockquote` becomes an indented paragraph with a left accent border.
//   - Tables become docx Table with explicit DXA widths on both table and cells.
//   - Lists use a proper LevelFormat.BULLET / DECIMAL numbering config — never
//     unicode bullets.
//   - Files whose first non-empty line starts with `# 제N부.` get an explicit
//     page-break-before so each Part starts on a fresh page.

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    PageBreak,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    ShadingType,
    LevelFormat,
    convertInchesToTwip,
    PageNumber,
    Footer,
    Header,
    ExternalHyperlink,
    LineRuleType,
} = require('docx');

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const FONTS = {
    body: '맑은 고딕',
    heading: '맑은 고딕',
    mono: 'D2Coding',
};

const COLORS = {
    titleNavy: '1F3864',     // deep navy for cover title
    partGold: 'B7791F',      // 부 (Part) – warm gold/orange accent per spec
    chapterGold: 'C7841A',   // 장 (Chapter)
    section: '1F4E79',       // 1.1 – navy (matches ABSwitch ref)
    subSection: '2E75B6',    // 1.1.1
    bodyText: '222222',
    quoteText: '595959',
    quoteBorder: 'C0A062',
    codeBg: 'F5F5F5',
    codeBorder: 'D9D9D9',
    tableHeaderBg: 'EAF1F8',
    tableBorder: 'B5B5B5',
    link: '0563C1',
};

const PAGE = {
    // A4 in DXA (1/20 pt). 8.27 x 11.69 inch.
    width: 11906,
    height: 16838,
    margin: 1440, // 1 inch
};

// docx sizes are in half-points (so 22 = 11pt, 28 = 14pt, etc.)
const SIZE = {
    body: 22,           // 11pt
    code: 18,           // 9pt
    quote: 22,          // 11pt
    title: 80,          // 40pt
    subtitle: 40,       // 20pt
    tagline: 28,        // 14pt
    titleMeta: 24,      // 12pt
    part: 56,           // 28pt
    chapter: 44,        // 22pt
    section: 32,        // 16pt
    subSection: 26,     // 13pt
    header: 16,         // 8pt
    footer: 18,         // 9pt
};

// ---------------------------------------------------------------------------
// Inline token -> TextRun[] / ExternalHyperlink
// ---------------------------------------------------------------------------

/**
 * Convert marked inline tokens into an array of docx runs (TextRun or
 * ExternalHyperlink).  Recursively handles **bold**, *italic*, `code`,
 * [text](url) and plain text.  Newlines inside a paragraph are flattened
 * to a single space because docx forbids literal `\n` inside a TextRun.
 */
function inlineRuns(tokens, baseStyle = {}) {
    const out = [];
    if (!tokens) return out;
    for (const tok of tokens) {
        switch (tok.type) {
            case 'text': {
                // `text` tokens may carry their own nested tokens (e.g. inside
                // a list item or table cell).  Recurse when present.
                if (tok.tokens && tok.tokens.length > 0) {
                    out.push(...inlineRuns(tok.tokens, baseStyle));
                } else {
                    out.push(new TextRun({
                        text: cleanInlineText(tok.text),
                        font: baseStyle.font || FONTS.body,
                        size: baseStyle.size || SIZE.body,
                        bold: baseStyle.bold || false,
                        italics: baseStyle.italics || false,
                        color: baseStyle.color || COLORS.bodyText,
                    }));
                }
                break;
            }
            case 'strong':
                out.push(...inlineRuns(tok.tokens, { ...baseStyle, bold: true }));
                break;
            case 'em':
                out.push(...inlineRuns(tok.tokens, { ...baseStyle, italics: true }));
                break;
            case 'codespan':
                out.push(new TextRun({
                    text: tok.text,
                    font: FONTS.mono,
                    size: baseStyle.size || SIZE.body,
                    color: 'C7254E',
                    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F5F5F5' },
                }));
                break;
            case 'del':
                out.push(...inlineRuns(tok.tokens, { ...baseStyle, strike: true }));
                break;
            case 'link': {
                // Only treat http(s)://, mailto:, ftp:// as real external links.
                // Anything else (relative .md files, in-document anchors, etc.)
                // would produce a "Broken reference" in the OOXML rels graph,
                // so we render those as plain text in the link color instead.
                const href = String(tok.href || '');
                const isExternal = /^(https?:|mailto:|ftp:|tel:)/i.test(href);
                const childRuns = inlineRuns(tok.tokens, {
                    ...baseStyle,
                    color: COLORS.link,
                });
                const styledRuns = childRuns.map(r => r instanceof TextRun
                    ? new TextRun({
                        text: r.options?.text ?? '',
                        font: FONTS.body,
                        size: baseStyle.size || SIZE.body,
                        color: COLORS.link,
                        underline: isExternal ? {} : undefined,
                    })
                    : r);
                if (isExternal) {
                    out.push(new ExternalHyperlink({ link: href, children: styledRuns }));
                } else {
                    // Render as plain (link-colored) text.
                    out.push(...styledRuns);
                }
                break;
            }
            case 'br':
                // Soft line break – represent as space (we never use \n in a run).
                out.push(new TextRun({ text: ' ', font: FONTS.body, size: SIZE.body }));
                break;
            case 'image':
                // Images are referenced by path; we render the alt as italic text.
                out.push(new TextRun({
                    text: `[이미지: ${tok.text || tok.href}]`,
                    font: FONTS.body,
                    size: SIZE.body,
                    italics: true,
                    color: COLORS.quoteText,
                }));
                break;
            case 'html':
                // Strip raw HTML to its text (rare in this tutorial).
                out.push(new TextRun({
                    text: cleanInlineText(tok.text.replace(/<[^>]+>/g, '')),
                    font: FONTS.body,
                    size: baseStyle.size || SIZE.body,
                }));
                break;
            default:
                if (tok.text) {
                    out.push(new TextRun({
                        text: cleanInlineText(tok.text),
                        font: FONTS.body,
                        size: baseStyle.size || SIZE.body,
                    }));
                }
        }
    }
    return out;
}

function cleanInlineText(s) {
    if (!s) return '';
    // Marked sometimes leaves literal newlines and tabs; collapse to single space.
    return s.replace(/[\t\r\n]+/g, ' ');
}

// ---------------------------------------------------------------------------
// Block token -> docx element(s)
// ---------------------------------------------------------------------------

function headingParagraph(token, opts = {}) {
    const { depth } = token;
    const headingMap = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
    };
    const isPart = opts.isPart === true || /^제\s*\d+\s*부[\.\s]/.test(token.text.trim());
    const sizeMap = {
        1: isPart ? SIZE.part : SIZE.chapter,
        2: SIZE.section,
        3: SIZE.subSection,
        4: SIZE.subSection,
    };
    const colorMap = {
        1: isPart ? COLORS.partGold : COLORS.chapterGold,
        2: COLORS.section,
        3: COLORS.subSection,
        4: COLORS.subSection,
    };
    const alignment = isPart ? AlignmentType.CENTER : AlignmentType.LEFT;
    const runs = inlineRuns(token.tokens, {
        font: FONTS.heading,
        size: sizeMap[depth] || SIZE.subSection,
        bold: true,
        color: colorMap[depth] || COLORS.section,
    });
    // Re-emit runs with bold + correct color so any nested inline styling
    // (e.g. `code` in a heading) still inherits heading visuals.
    const renderedRuns = runs.map(r => {
        if (r instanceof TextRun) {
            return new TextRun({
                text: r.options?.text ?? '',
                font: FONTS.heading,
                size: sizeMap[depth] || SIZE.subSection,
                bold: true,
                color: colorMap[depth] || COLORS.section,
            });
        }
        return r;
    });
    return new Paragraph({
        heading: headingMap[depth],
        alignment,
        spacing: {
            before: depth === 1 ? 480 : depth === 2 ? 360 : 240,
            after: depth === 1 ? 320 : depth === 2 ? 200 : 120,
            line: 360,
            lineRule: LineRuleType.AUTO,
        },
        pageBreakBefore: opts.pageBreakBefore === true,
        children: renderedRuns,
    });
}

function paragraphFromToken(token) {
    const runs = inlineRuns(token.tokens, { font: FONTS.body, size: SIZE.body });
    return new Paragraph({
        spacing: { before: 80, after: 120, line: 360, lineRule: LineRuleType.AUTO },
        children: runs.length ? runs : [new TextRun({ text: '', font: FONTS.body, size: SIZE.body })],
    });
}

function blockquoteParagraphs(token) {
    // A blockquote contains its own block tokens (paragraphs, lists, etc.).
    // We render each as an indented, accented paragraph.
    const out = [];
    for (const child of token.tokens || []) {
        if (child.type === 'paragraph') {
            const runs = inlineRuns(child.tokens, {
                font: FONTS.body,
                size: SIZE.quote,
                italics: false,
                color: COLORS.quoteText,
            });
            out.push(new Paragraph({
                spacing: { before: 80, after: 120, line: 360, lineRule: LineRuleType.AUTO },
                indent: { left: 360 },
                border: {
                    left: {
                        color: COLORS.quoteBorder,
                        space: 12,
                        style: BorderStyle.SINGLE,
                        size: 18,
                    },
                },
                children: runs.length ? runs : [new TextRun({ text: ' ', font: FONTS.body, size: SIZE.quote })],
            }));
        } else if (child.type === 'space') {
            // skip
        } else {
            // Nested list / table inside a blockquote – render with same indent.
            const nested = renderToken(child, { listLevel: 0 });
            for (const p of nested) {
                if (p instanceof Paragraph) {
                    // We can't easily mutate, so emit as-is; rare in practice.
                }
                out.push(p);
            }
        }
    }
    return out;
}

function codeBlockParagraph(token) {
    // Render a fenced code block as a single-cell, full-width Table.
    // (Wrapping in a Table instead of using `pBdr` avoids a docx-js bug where
    // paragraph borders are serialized in the order `top, bottom, left, right`,
    // which violates the OOXML CT_PBdr sequence and trips strict XSD
    // validators.  Table borders are emitted in the correct order.)
    const text = token.text || '';
    const lines = text.split(/\r?\n/);
    const usableWidth = PAGE.width - PAGE.margin * 2;
    const innerParagraphs = lines.map((line, idx) => new Paragraph({
        spacing: {
            before: idx === 0 ? 0 : 0,
            after: 0,
            line: 280,
            lineRule: LineRuleType.AUTO,
        },
        children: [new TextRun({
            text: line.length ? line : ' ',
            font: FONTS.mono,
            size: SIZE.code,
            color: '24292E',
        })],
    }));

    const cell = new TableCell({
        width: { size: usableWidth, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLORS.codeBg },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: innerParagraphs.length ? innerParagraphs : [new Paragraph({ children: [new TextRun({ text: ' ', font: FONTS.mono, size: SIZE.code })] })],
    });

    const table = new Table({
        width: { size: usableWidth, type: WidthType.DXA },
        columnWidths: [usableWidth],
        borders: {
            top:    { style: BorderStyle.SINGLE, size: 6, color: COLORS.codeBorder },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.codeBorder },
            left:   { style: BorderStyle.SINGLE, size: 6, color: COLORS.codeBorder },
            right:  { style: BorderStyle.SINGLE, size: 6, color: COLORS.codeBorder },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
        rows: [new TableRow({ children: [cell] })],
    });

    // A Table cannot end a section, so trail with a small empty paragraph.
    return [
        new Paragraph({ spacing: { before: 80, after: 0 }, children: [new TextRun({ text: '', font: FONTS.body, size: 4 })] }),
        table,
        new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: '', font: FONTS.body, size: 4 })] }),
    ];
}

function listParagraphs(token, level = 0) {
    const out = [];
    const numberingRef = token.ordered ? 'tutorial-numbered' : 'tutorial-bullet';
    for (const item of token.items) {
        // An item's `tokens` can mix inline content with nested lists/paragraphs.
        // We treat the first paragraph-like block as the visible bullet line,
        // and recurse into nested lists.
        const firstBlock = [];
        const nested = [];
        for (const child of item.tokens || []) {
            if (child.type === 'list') {
                nested.push(child);
            } else if (child.type === 'paragraph' || child.type === 'text') {
                firstBlock.push(...(child.tokens || []));
            } else {
                // code blocks etc. inside list items – render as separate paragraphs
                // (will lose bullet alignment but stays readable).
                nested.push(child);
            }
        }
        out.push(new Paragraph({
            numbering: { reference: numberingRef, level: Math.min(level, 4) },
            spacing: { before: 40, after: 40, line: 320, lineRule: LineRuleType.AUTO },
            children: inlineRuns(firstBlock, { font: FONTS.body, size: SIZE.body }),
        }));
        for (const nestedTok of nested) {
            if (nestedTok.type === 'list') {
                out.push(...listParagraphs(nestedTok, level + 1));
            } else {
                out.push(...renderToken(nestedTok, { listLevel: level + 1 }));
            }
        }
    }
    return out;
}

function tableFromToken(token) {
    // Marked v14 table token has `header: [{ text, tokens, align }]` and
    // `rows: [[{ text, tokens, align }, ...], ...]`.
    const header = token.header || [];
    const rows = token.rows || [];
    const colCount = header.length || (rows[0] ? rows[0].length : 1);
    if (colCount === 0) return null;

    const usableWidth = PAGE.width - PAGE.margin * 2;
    const colWidth = Math.floor(usableWidth / colCount);
    const columnWidths = new Array(colCount).fill(colWidth);

    const buildCell = (cell, isHeader) => {
        const align = cell.align === 'right' ? AlignmentType.RIGHT
            : cell.align === 'center' ? AlignmentType.CENTER
            : AlignmentType.LEFT;
        const runs = inlineRuns(cell.tokens || [{ type: 'text', text: cell.text || '' }], {
            font: FONTS.body,
            size: SIZE.body,
            bold: isHeader,
            color: isHeader ? COLORS.section : COLORS.bodyText,
        });
        return new TableCell({
            width: { size: colWidth, type: WidthType.DXA },
            shading: isHeader
                ? { type: ShadingType.CLEAR, color: 'auto', fill: COLORS.tableHeaderBg }
                : undefined,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
                alignment: align,
                spacing: { before: 0, after: 0, line: 300, lineRule: LineRuleType.AUTO },
                children: runs.length ? runs : [new TextRun({ text: ' ', font: FONTS.body, size: SIZE.body })],
            })],
        });
    };

    const tableRows = [];
    if (header.length > 0) {
        tableRows.push(new TableRow({
            tableHeader: true,
            children: header.map(c => buildCell(c, true)),
        }));
    }
    for (const r of rows) {
        tableRows.push(new TableRow({
            children: r.map(c => buildCell(c, false)),
        }));
    }

    return new Table({
        width: { size: usableWidth, type: WidthType.DXA },
        columnWidths,
        borders: {
            top:    { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
            left:   { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
            right:  { style: BorderStyle.SINGLE, size: 4, color: COLORS.tableBorder },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: COLORS.tableBorder },
            insideVertical:   { style: BorderStyle.SINGLE, size: 2, color: COLORS.tableBorder },
        },
        rows: tableRows,
    });
}

function hrParagraph() {
    return new Paragraph({
        spacing: { before: 160, after: 160 },
        border: {
            bottom: { color: 'BFBFBF', style: BorderStyle.SINGLE, size: 6, space: 1 },
        },
        children: [new TextRun({ text: '', font: FONTS.body, size: SIZE.body })],
    });
}

function renderToken(token, ctx = {}) {
    switch (token.type) {
        case 'heading':
            return [headingParagraph(token)];
        case 'paragraph':
            return [paragraphFromToken(token)];
        case 'blockquote':
            return blockquoteParagraphs(token);
        case 'code':
            return codeBlockParagraph(token);
        case 'list':
            return listParagraphs(token, ctx.listLevel || 0);
        case 'table': {
            const t = tableFromToken(token);
            // A table cannot legally be the last block; follow with empty para.
            return t ? [t, new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: '', font: FONTS.body, size: SIZE.body })] })] : [];
        }
        case 'hr':
            return [hrParagraph()];
        case 'space':
            return [];
        case 'html':
            // Render raw HTML as plain text (rare).
            return [new Paragraph({
                spacing: { before: 80, after: 120 },
                children: [new TextRun({
                    text: cleanInlineText((token.text || '').replace(/<[^>]+>/g, '')),
                    font: FONTS.body,
                    size: SIZE.body,
                })],
            })];
        default:
            return [];
    }
}

// ---------------------------------------------------------------------------
// File reading + part-divider detection
// ---------------------------------------------------------------------------

/**
 * Looks at the first non-empty heading of a markdown source and decides
 * whether the file represents a Part (제N부.) — those get a page-break
 * before their first heading.
 */
function detectIsPartFile(source) {
    const lines = source.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('#')) {
            const text = trimmed.replace(/^#+\s*/, '');
            return /^제\s*\d+\s*부[\.\s]/.test(text);
        }
        // First non-empty line is not a heading – not a part file.
        return false;
    }
    return false;
}

/**
 * Renders a single markdown file into a list of docx children.
 * `forcePageBreakOnFirstHeading` is set true for Part-divider files so the
 * very first heading begins on a new page.
 */
function renderMarkdownFile(source, opts = {}) {
    const tokens = marked.lexer(source);
    const out = [];
    let firstHeadingSeen = false;
    for (const tok of tokens) {
        if (tok.type === 'heading') {
            const isPart = opts.forcePageBreakOnFirstHeading && !firstHeadingSeen;
            out.push(headingParagraph(tok, {
                isPart,
                pageBreakBefore: isPart,
            }));
            firstHeadingSeen = true;
        } else {
            out.push(...renderToken(tok));
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// Title page (read from README.md's first section)
// ---------------------------------------------------------------------------

function buildTitlePage(readmeSource) {
    // Read header lines until the first `---` (or the 목차 heading), and pull:
    //   - line that starts with `# `  -> title
    //   - line that starts with `## ` -> subtitle
    //   - line that starts with `> `  -> tagline (first one)
    //   - line wrapped in `**...**`   -> date
    const lines = readmeSource.split(/\r?\n/);
    let title = 'cha-bot-starter-kit';
    let subtitle = '';
    let tagline = '';
    let date = '';
    for (const raw of lines) {
        const line = raw.trim();
        if (line === '---') break;
        if (line.startsWith('## 목차') || line === '## 목차 (Table of Contents)') break;
        if (line.startsWith('# ') && title === 'cha-bot-starter-kit') {
            title = line.replace(/^#\s+/, '').trim();
        } else if (line.startsWith('## ') && !subtitle) {
            subtitle = line.replace(/^##\s+/, '').trim();
        } else if (line.startsWith('> ') && !tagline) {
            tagline = line.replace(/^>\s+/, '').replace(/\*\*/g, '').trim();
        } else if (/^\*\*.+\*\*$/.test(line) && !date) {
            date = line.replace(/\*\*/g, '').trim();
        }
    }

    const children = [];
    // Big top spacer
    children.push(new Paragraph({ spacing: { before: 2400 }, children: [new TextRun({ text: '', font: FONTS.body, size: 22 })] }));
    children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
        children: [new TextRun({
            text: title,
            font: FONTS.heading,
            size: SIZE.title,
            bold: true,
            color: COLORS.titleNavy,
        })],
    }));
    if (subtitle) {
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
            children: [new TextRun({
                text: subtitle,
                font: FONTS.heading,
                size: SIZE.subtitle,
                bold: true,
                color: COLORS.section,
            })],
        }));
    }
    if (tagline) {
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 1200 },
            children: [new TextRun({
                text: tagline,
                font: FONTS.body,
                size: SIZE.tagline,
                italics: true,
                color: COLORS.quoteText,
            })],
        }));
    }
    // Push date to lower third of page
    children.push(new Paragraph({ spacing: { before: 3200 }, children: [new TextRun({ text: '', font: FONTS.body, size: 22 })] }));
    if (date) {
        children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [new TextRun({
                text: date,
                font: FONTS.body,
                size: SIZE.titleMeta,
                bold: true,
                color: COLORS.section,
            })],
        }));
    }
    // Force a page break after the title page.
    children.push(new Paragraph({
        children: [new PageBreak()],
    }));
    return { children, title };
}

// ---------------------------------------------------------------------------
// Document assembly
// ---------------------------------------------------------------------------

function assembleDocument(allChildren, runningTitle) {
    return new Document({
        creator: 'cha-bot-starter-kit 자습서 빌더',
        title: runningTitle,
        description: 'Auto-generated tutorial DOCX',
        styles: {
            default: {
                document: {
                    run: { font: FONTS.body, size: SIZE.body, color: COLORS.bodyText },
                    paragraph: { spacing: { line: 360, lineRule: LineRuleType.AUTO } },
                },
            },
            paragraphStyles: [
                {
                    id: 'Heading1',
                    name: 'Heading 1',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { font: FONTS.heading, size: SIZE.chapter, bold: true, color: COLORS.chapterGold },
                    paragraph: { spacing: { before: 480, after: 280, line: 360, lineRule: LineRuleType.AUTO } },
                },
                {
                    id: 'Heading2',
                    name: 'Heading 2',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { font: FONTS.heading, size: SIZE.section, bold: true, color: COLORS.section },
                    paragraph: { spacing: { before: 320, after: 180, line: 360, lineRule: LineRuleType.AUTO } },
                },
                {
                    id: 'Heading3',
                    name: 'Heading 3',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { font: FONTS.heading, size: SIZE.subSection, bold: true, color: COLORS.subSection },
                    paragraph: { spacing: { before: 240, after: 120, line: 360, lineRule: LineRuleType.AUTO } },
                },
                {
                    id: 'Heading4',
                    name: 'Heading 4',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { font: FONTS.heading, size: SIZE.subSection, bold: true, color: COLORS.subSection },
                    paragraph: { spacing: { before: 200, after: 100, line: 360, lineRule: LineRuleType.AUTO } },
                },
            ],
        },
        numbering: {
            config: [
                {
                    reference: 'tutorial-bullet',
                    levels: [
                        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 360, hanging: 260 } } } },
                        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 720, hanging: 260 } } } },
                        { level: 2, format: LevelFormat.BULLET, text: '▪', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 1080, hanging: 260 } } } },
                        { level: 3, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 1440, hanging: 260 } } } },
                        { level: 4, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 1800, hanging: 260 } } } },
                    ],
                },
                {
                    reference: 'tutorial-numbered',
                    levels: [
                        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 360, hanging: 260 } } } },
                        { level: 1, format: LevelFormat.LOWER_LETTER, text: '%2.', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 720, hanging: 260 } } } },
                        { level: 2, format: LevelFormat.LOWER_ROMAN, text: '%3.', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 1080, hanging: 260 } } } },
                        { level: 3, format: LevelFormat.DECIMAL, text: '%4.', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 1440, hanging: 260 } } } },
                        { level: 4, format: LevelFormat.LOWER_LETTER, text: '%5.', alignment: AlignmentType.LEFT,
                          style: { paragraph: { indent: { left: 1800, hanging: 260 } } } },
                    ],
                },
            ],
        },
        sections: [
            {
                properties: {
                    page: {
                        size: { width: PAGE.width, height: PAGE.height },
                        margin: {
                            top: PAGE.margin, right: PAGE.margin,
                            bottom: PAGE.margin, left: PAGE.margin,
                            header: 720, footer: 720,
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [new TextRun({
                                text: runningTitle,
                                font: FONTS.body,
                                size: SIZE.header,
                                color: '7F7F7F',
                            })],
                        })],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: '- ', font: FONTS.body, size: SIZE.footer, color: '7F7F7F' }),
                                new TextRun({ children: [PageNumber.CURRENT], font: FONTS.body, size: SIZE.footer, color: '7F7F7F' }),
                                new TextRun({ text: ' -', font: FONTS.body, size: SIZE.footer, color: '7F7F7F' }),
                            ],
                        })],
                    }),
                },
                children: allChildren,
            },
        ],
    });
}

// ---------------------------------------------------------------------------
// Main entrypoints
// ---------------------------------------------------------------------------

async function buildFromTutorialDir(dir, outPath) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.md'))
        .map(e => e.name);

    // README.md first, then alphabetical for the rest.
    const readmeName = entries.find(n => n.toLowerCase() === 'readme.md');
    const rest = entries.filter(n => n.toLowerCase() !== 'readme.md').sort();
    const ordered = readmeName ? [readmeName, ...rest] : rest;

    let title = 'cha-bot-starter-kit 자습서';
    const allChildren = [];

    if (readmeName) {
        const src = fs.readFileSync(path.join(dir, readmeName), 'utf8');
        const tp = buildTitlePage(src);
        allChildren.push(...tp.children);
        if (tp.title) title = tp.title;
    }

    for (const name of ordered) {
        if (readmeName && name === readmeName) continue;
        const fullPath = path.join(dir, name);
        const src = fs.readFileSync(fullPath, 'utf8');
        const isPart = detectIsPartFile(src);
        const blocks = renderMarkdownFile(src, { forcePageBreakOnFirstHeading: isPart });
        allChildren.push(...blocks);
    }

    const doc = assembleDocument(allChildren, title);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outPath, buffer);
    return { outPath, fileCount: ordered.length, title };
}

async function buildTestSample(dir) {
    const samplePath = path.join(dir, 'test-input.md');
    const sample = `# 제0부. 테스트용 부 표지

이 페이지는 부(Part) 표지가 페이지 분리를 트리거하는지 확인하는 샘플입니다.

# 1장. 샘플 장 제목

본문 단락입니다. **굵은 글씨**와 *기울임*, 그리고 \`인라인 코드\`를 섞어봅니다.

## 1.1 절 제목

리스트 예시:

- 첫 번째 항목
- 두 번째 항목
  - 들여쓰기된 하위 항목
  - 또 하나
- 세 번째 항목

순서 있는 리스트:

1. 단계 하나
2. 단계 둘
3. 단계 셋

### 1.1.1 소절 제목

> 박교수님 말씀처럼, "쉽게, 끝까지" 가는 것이 핵심입니다.
> 인용문은 왼쪽 액센트 보더와 들여쓰기로 표현됩니다.

코드 블록 샘플:

\`\`\`bash
cd C:\\dev
git clone https://github.com/example/cha-bot-starter-kit.git
cd cha-bot-starter-kit
npm install
npm run dev
\`\`\`

## 1.2 표 샘플

| 항목 | 설명 | 비고 |
| --- | --- | --- |
| GitHub | 코드 저장소 | 무료 |
| Vercel | 배포 플랫폼 | 무료 |
| Node.js | 자바스크립트 런타임 | LTS 권장 |

---

[자세히 보기](https://example.com)는 외부 링크 예시입니다.
`;
    fs.writeFileSync(samplePath, sample, 'utf8');

    const outPath = path.join(dir, 'test-output.docx');
    const src = fs.readFileSync(samplePath, 'utf8');
    const isPart = detectIsPartFile(src);
    const blocks = renderMarkdownFile(src, { forcePageBreakOnFirstHeading: isPart });

    // Synthesize a tiny title page so we exercise that path too.
    const titlePage = buildTitlePage(`# 테스트 자습서\n\n## 빌더 검증용 샘플\n\n> 이 파일은 build-docx.js 가 정상 동작하는지 확인하기 위한 것입니다.\n\n**2026년 5월**\n\n---\n`);
    const doc = assembleDocument([...titlePage.children, ...blocks], '테스트 자습서');
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outPath, buffer);
    return { outPath, samplePath };
}

async function main() {
    const args = process.argv.slice(2);
    const here = __dirname;
    if (args.includes('--test')) {
        const r = await buildTestSample(here);
        console.log(`[test] wrote sample: ${r.samplePath}`);
        console.log(`[test] wrote docx:   ${r.outPath}`);
        return;
    }
    const outPath = path.join(here, 'cha-bot-starter-kit-자습서.docx');
    const r = await buildFromTutorialDir(here, outPath);
    console.log(`[build] title    : ${r.title}`);
    console.log(`[build] files    : ${r.fileCount}`);
    console.log(`[build] output   : ${r.outPath}`);
}

main().catch(err => {
    console.error('[fatal]', err);
    process.exit(1);
});
