# FormattedGrid

A [Sigma Computing](https://www.sigmacomputing.com/) custom plugin that renders a richly formatted data table driven entirely by Snowflake data. Column widths, alignment, number formats, footnotes, RAG indicators, and typography are all controlled through a companion configuration table — no code changes required to adjust the layout.

---

## How it works

FormattedGrid reads from two Sigma elements that you connect in the plugin editor panel:

**Source 1 — Table Data**
Your main data. Each row in the connected element becomes a row in the table. The columns you select in the editor panel's *Columns* field determine which columns are shown and in what order.

**Source 2 — Footnote Config**
A metadata table (typically `GRID_CONFIG` in Snowflake) that drives all formatting. Each row in this table is a *rule* that targets a column by name. Rules can set column widths, text alignment, number formats, typography, footnote markers, and display name overrides. Multiple rules can target the same column — one row for the footnote, another for width and alignment, and so on.

At render time the plugin:
1. Reads the column list from Source 1 and builds the table header
2. Looks up each column's display name, width, alignment and format from Source 2
3. Applies footnote markers to headers and cells where rules match
4. Renders a footnote block at the bottom, with click-through navigation back to the first occurrence of each marker
5. Applies group separator rows wherever the *Group key column* value changes between rows

Column widths can also be overridden interactively by dragging the header edge — these overrides are saved in the browser's `localStorage` and persist across page loads.

---

## Quick start

### 1. Create the Snowflake tables

Run [`sql/01_create_tables.sql`](sql/01_create_tables.sql) after replacing `<DATABASE>` and `<SCHEMA>`:

```sql
USE DATABASE <DATABASE>;
USE SCHEMA <SCHEMA>;
-- creates GRID_DATA and GRID_CONFIG
```

### 2. Load your data

Populate `GRID_DATA` with your table rows. See [`sql/02_sample_data.sql`](sql/02_sample_data.sql) for a worked example showing the expected shape for all column types.

### 3. Configure formatting in GRID_CONFIG

Add rows to `GRID_CONFIG` to set widths, formats, footnotes, and styles. See the [GRID_CONFIG reference](#grid_config-reference) below.

### 4. Connect the plugin in Sigma

1. Add the plugin to your workbook and open the editor panel
2. Connect a Sigma element to **Table Data**
3. Connect your `GRID_CONFIG` element to **Footnote Config**
4. Use the **Columns** multi-select to add the columns you want displayed, in order
5. Optionally set a **Group key column** to enable group separator rows

> **Column name matching**: `COLUMN_NAME` in `GRID_CONFIG` must match the display name of the column exactly as it appears in your Sigma element. Sigma title-cases Snowflake snake_case column names by default — for example `FUND_EQUITY_INVESTED` becomes `Fund Equity Invested`. If you rename a column inside Sigma, update `COLUMN_NAME` to match the new name.

---

## GRID_CONFIG reference

Each row in `GRID_CONFIG` is a formatting rule. All columns except `COLUMN_NAME` are optional — `NULL` means use the plugin default.

### Targeting

| Column | Type | Description |
|--------|------|-------------|
| `COLUMN_NAME` | `VARCHAR` | **Required.** The Sigma display name of the column this rule applies to |
| `ROW_KEY` | `VARCHAR` | `NULL` = rule applies to the column header; a non-null value = rule applies only to the cell in the row whose first displayed column matches this value |

### Footnotes

Footnotes appear as superscript markers on the header or cell, with the full text collected into a footnote block at the bottom of the table. Clicking a marker scrolls to its definition; clicking a definition scrolls back to the first occurrence.

| Column | Type | Description |
|--------|------|-------------|
| `FOOTNOTE_NUMBER` | `NUMBER` | Integer marker shown as a superscript (e.g. `1`, `2`, `3`). Markers are rendered in ascending order |
| `FOOTNOTE_TEXT` | `VARCHAR` | Full text of the footnote, shown in the footnote block at the bottom of the table |

Multiple columns can share the same `FOOTNOTE_NUMBER` — the footnote text is deduplicated automatically.

**Header footnote example** — marker on a column header:
```sql
('Fund Equity Invested', NULL, 1, 'All figures reported at cost in USD millions.', ...)
```

**Cell footnote example** — marker on a specific row's cell:
```sql
('QTD vs Budget', 'Andean Connect', 3, 'Restated following Q4 2025 audit adjustment.', ...)
```

### Display name override

| Column | Type | Description |
|--------|------|-------------|
| `DISPLAY_NAME` | `VARCHAR` | Replaces the column header label in the rendered table. The underlying `COLUMN_NAME` still matches the Sigma element's column name |

```sql
-- Show a friendlier label without renaming the column in Sigma
('Fund Equity Invested', NULL, NULL, NULL, 'Fund Equity Invested (USD)', ...)
('Qtd vs Budget',        NULL, NULL, NULL, '2025 QTD vs Budget (%)', ...)
```

### Layout

| Column | Type | Accepted values | Description |
|--------|------|-----------------|-------------|
| `WIDTH` | `NUMBER` | Any positive integer | Column width in pixels. If not set, width is estimated from the header text length |
| `ALIGN` | `VARCHAR` | `left` `center` `right` | Horizontal text alignment for header and cells |
| `VALIGN` | `VARCHAR` | `top` `middle` `bottom` | Vertical alignment for cells |

### Cell format

The `FORMAT` column activates special rendering for a column's cells.

| Column | Type | Accepted values | Description |
|--------|------|-----------------|-------------|
| `FORMAT` | `VARCHAR` | see below | Rendering mode for all cells in this column |

| Value | Behaviour |
|-------|-----------|
| `percent` | Colours the cell value: negative values (including accounting-style `(25%)`) in red, positive in green, zero in default, `n.a.` / `-` in muted grey |
| `number` | Same colouring as `percent` |
| `rag` | Replaces the cell text with a coloured dot. Colour is inferred from the cell value — see [RAG colour mapping](#rag-colour-mapping) below |
| `multiline` | Wraps cell text. Long values (> 120 characters) are truncated with a *more / less* toggle |

#### RAG colour mapping

| Cell value contains | Dot colour |
|--------------------|------------|
| `on track`, `good`, `ahead`, `green` | Green |
| `at risk`, `watch`, `partial`, `amber` | Amber |
| `behind`, `off track`, `bad`, `red` | Red |
| anything else | Grey |

### Typography

Typography rules apply to every cell in the column (not individual cells — use `ROW_KEY` for per-cell targeting).

| Column | Type | Accepted values | Description |
|--------|------|-----------------|-------------|
| `BOLD` | `VARCHAR` | `true` | Renders cell text in bold |
| `ITALIC` | `VARCHAR` | `true` | Renders cell text in italic |
| `TEXT_COLOR` | `VARCHAR` | Any CSS colour (hex, rgb, named) | Overrides the cell text colour, e.g. `#3a70c0`, `rgb(60,112,192)`, `navy` |

### Combining rules for the same column

Rules for the same column are merged — you do not need to specify every field in a single row. The following is valid and equivalent to writing it all in one row:

```sql
-- Footnote
('Fund Equity Invested', NULL, 1, 'All figures reported at cost in USD millions.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
-- Display name override
('Fund Equity Invested', NULL, NULL, NULL, 'Fund Equity Invested (USD)', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
-- Width and alignment
('Fund Equity Invested', NULL, NULL, NULL, NULL, 80, 'right', 'top', NULL, NULL, NULL, NULL),
```

---

## Editor panel settings

These controls are available in the plugin editor panel in Sigma and apply globally to the table.

### Table

| Setting | Description | Default |
|---------|-------------|---------|
| **Table Data** | Connect the Sigma element containing your data rows | — |
| **Footnote Config** | Connect the Sigma element containing your `GRID_CONFIG` rows | — |
| **Columns** | Multi-select of columns to display. Column order in the table matches selection order | — |
| **Group key column** | Column whose value drives group separator rows. When the value changes between rows, a labelled section header is inserted | — |
| **Font family** | Font applied to the whole table | `Inter` |
| **Body font size** | Font size for all data cells | `11px` |
| **Header background** | Background colour of the column header row | Dark navy |
| **Header text colour** | Text colour of the column header row | Light blue-grey |
| **Alternating rows** | Toggle zebra striping on/off | On |
| **Alt row colour** | Background colour of alternating rows | Light grey |

### Group header

These settings control the appearance of the group separator rows inserted when a *Group key column* is set.

| Setting | Description | Default |
|---------|-------------|---------|
| **Background colour** | Fill colour of the group header row | Light grey |
| **Text colour** | Label text colour | Mid grey |
| **Font size** | Label font size | `8px` |
| **Label style** | `UPPERCASE` / `Title Case` / `As-is` | `UPPERCASE` |

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run with mock data (no Sigma required)

```bash
npm run dev:mock
```

Opens `http://localhost:5173/mock.html` with the sample portfolio data wired in. Mock data lives in [`src/mock/data.js`](src/mock/data.js) — edit it to test different configurations without needing a Sigma workbook.

### Run against Sigma

```bash
npm run dev
```

Register `http://localhost:5173` as a custom plugin URL in your Sigma workbook.

### Build for deployment

```bash
npm run build
```

Output goes to `dist/`. Host the contents of `dist/` on any static file server (S3, Netlify, GitHub Pages, etc.) and register the URL in Sigma as a custom plugin.

---

## Project structure

```
FormattedGrid/
├── src/
│   ├── App.jsx              # Plugin component
│   ├── main.jsx             # Sigma entry point
│   ├── main.mock.jsx        # Mock dev entry point
│   └── mock/
│       ├── data.js          # Sample data for local dev
│       └── plugin.jsx       # Sigma SDK stub for local dev
├── sql/
│   ├── 01_create_tables.sql # Snowflake DDL
│   └── 02_sample_data.sql   # Sample data (portfolio example)
├── index.html               # Sigma entry HTML
├── mock.html                # Mock dev entry HTML
├── vite.config.js           # Production Vite config
└── vite.config.mock.js      # Mock dev Vite config
```

---

## License

MIT
