# FormattedGrid

A [Sigma Computing](https://www.sigmacomputing.com/) custom plugin that renders a richly formatted data table. Column widths, alignment, number formats, footnotes, RAG indicators, currency symbols, and typography are all controlled through a companion configuration table — no code changes required to adjust the layout.

The plugin works with any data source connected to Sigma (Snowflake, BigQuery, Redshift, Databricks, PostgreSQL, and others). It reads from Sigma elements and is entirely agnostic about what is behind them.

---

## Features

- **Dynamic columns** — columns shown and their order are set in the editor panel; no hardcoding required
- **Group separator rows** — designate a group-key column to insert labelled section headers whenever the value changes
- **Display name overrides** — rename column headers for display without touching the Sigma element
- **Column formatting** — widths, horizontal and vertical alignment, all driven from the config element
- **Cell formats**
  - `percent` / `number` — neg/pos colouring (red, green) with muted `n.a.` handling
  - `currency:$` — currency symbol prefix with comma-formatting and neg/pos colouring
  - `rag` — coloured dot (green / amber / red / grey) inferred from the cell value
  - `multiline` — wraps long text with an inline expand / collapse toggle
- **Typography** — bold, italic, and text colour per column, set from the config element
- **Footnotes** — superscript markers on column headers or individual cells; linked footnote block at the bottom with two-way click navigation
- **Drag-to-resize** — column widths can be overridden by dragging the header edge; persisted in `localStorage`
- **Editor panel controls** — font family, body font size, header colours, alternating row colour, group header style — all configurable without a code deploy

---

## How it works

FormattedGrid reads from two Sigma elements connected in the plugin editor panel:

**Source 1 — Table Data**
Your main data. Each row becomes a table row. The columns you select in the *Columns* field determine which columns appear and in what order.

**Source 2 — Footnote Config**
A metadata element whose rows drive all formatting. Each row is a *rule* targeting a column by name. Rules can set widths, alignment, formats, typography, footnote markers, and display name overrides. Multiple rules can target the same column — for example, one row for the footnote and another for width and format.

At render time the plugin:
1. Reads the column list from Source 1 and builds the table header
2. Looks up each column's display name, width, alignment, and format from Source 2
3. Applies footnote markers to headers and cells where rules match
4. Renders a footnote block at the bottom with click-through navigation back to the first marker occurrence
5. Inserts group separator rows wherever the *Group key column* value changes between rows

Column widths can also be overridden interactively by dragging the header edge — these are saved in `localStorage` and persist across page loads.

---

## Quick start

### 1. Create your tables

You need two tables (or views) in your data source:

- **A data table** — one row per record, any columns you want displayed
- **A config table** — one row per formatting rule; see the [config table schema](#config-table-schema) below

SQL scripts for Snowflake are provided as a reference:
- [`sql/01_create_tables.sql`](sql/01_create_tables.sql) — DDL for both tables
- [`sql/02_sample_data.sql`](sql/02_sample_data.sql) — worked example covering all column types and formatting options

The same structure works on any data source Sigma supports — adapt the DDL syntax as needed.

### 2. Connect the plugin in Sigma

1. Add the plugin to your workbook and open the editor panel
2. Connect a Sigma element (table, pivot, or query result) to **Table Data**
3. Connect your config element to **Footnote Config**
4. Use the **Columns** multi-select to add the columns you want displayed, in order
5. Optionally set a **Group key column** to enable group separator rows

### 3. Configure formatting

Add rows to your config table to set widths, formats, footnotes, and styles. See the [GRID_CONFIG reference](#grid_config-reference) below.

> **Column name matching**: `COLUMN_NAME` in the config table must match the display name of the column exactly as it appears in your Sigma element. Sigma title-cases snake_case column names by default — for example `FUND_EQUITY_INVESTED` becomes `Fund Equity Invested`. If you rename a column inside Sigma, update `COLUMN_NAME` to match.

---

## Config table schema

Each row is a formatting rule. All columns except `COLUMN_NAME` are optional — `NULL` means use the plugin default. Multiple rules can target the same column and are merged at render time.

### Targeting

| Column | Type | Description |
|--------|------|-------------|
| `COLUMN_NAME` | `VARCHAR` | **Required.** The Sigma display name of the column this rule applies to |
| `ROW_KEY` | `VARCHAR` | `NULL` = rule applies to the column header; a non-null value = rule applies only to the cell in the row whose first displayed column matches this value |

### Footnotes

Footnotes appear as superscript markers on headers or cells. All markers are collected into a footnote block at the bottom of the table. Clicking a marker scrolls to its definition; clicking a definition scrolls back to the first occurrence.

| Column | Type | Description |
|--------|------|-------------|
| `FOOTNOTE_NUMBER` | `NUMBER` | Integer marker shown as a superscript (1, 2, 3 …). Markers are deduplicated and rendered in ascending order |
| `FOOTNOTE_TEXT` | `VARCHAR` | Full text of the footnote shown in the footnote block |

Multiple columns can share the same `FOOTNOTE_NUMBER` — the footnote text is deduplicated automatically.

**Header footnote** — marker on a column header:
```sql
('Fund Equity Invested', NULL, 1, 'All figures reported at cost in USD millions.', NULL, ...)
```

**Cell footnote** — marker on a specific row's cell:
```sql
('QTD vs Budget', 'Andean Connect', 3, 'Restated following Q4 2025 audit adjustment.', NULL, ...)
```

### Display name override

| Column | Type | Description |
|--------|------|-------------|
| `DISPLAY_NAME` | `VARCHAR` | Replaces the column header label in the rendered table. The underlying `COLUMN_NAME` still matches the Sigma element's column name |

```sql
('Fund Equity Invested', NULL, NULL, NULL, 'Fund Equity Invested (USD)', NULL, ...)
('Qtd vs Budget',        NULL, NULL, NULL, '2025 QTD vs Budget (%)',     NULL, ...)
```

### Layout

| Column | Type | Accepted values | Description |
|--------|------|-----------------|-------------|
| `WIDTH` | `NUMBER` | Any positive integer | Column width in pixels. If not set, width is estimated from the header text length |
| `ALIGN` | `VARCHAR` | `left` `center` `right` | Horizontal text alignment for the header and all cells in the column |
| `VALIGN` | `VARCHAR` | `top` `middle` `bottom` | Vertical alignment for cells |

### Cell format

The `FORMAT` column activates special rendering for all cells in a column.

| Value | Behaviour |
|-------|-----------|
| `percent` | Colours the cell value: negatives (including accounting-style `(25%)`) in red, positives in green, zero in default, `n.a.` / `-` in muted grey |
| `percent:<dp>` | Same as `percent`, reformatting the value to `dp` decimal places. Example: `percent:2` renders `18.2` as `18.20%` |
| `percent:<dp>:nocolor` | Same decimal formatting with neg/pos colouring turned off |
| `percent::nocolor` | Default formatting, colouring turned off (no decimal override) |
| `number` | Same neg/pos colouring as `percent`, no suffix |
| `number:<dp>` | Number with `dp` decimal places and neg/pos colouring |
| `number:<dp>:nocolor` | Number with `dp` decimal places, no colouring |
| `currency:<symbol>` | Prepends a currency symbol and applies neg/pos colouring. Plain integers and decimals are comma-formatted automatically. Examples: `currency:$`, `currency:€`, `currency:£`, `currency:¥` |
| `currency:<symbol>:nocolor` | Currency symbol prefix, colouring turned off |
| `rag` | Replaces the cell text with a coloured dot inferred from the value — see [RAG colour mapping](#rag-colour-mapping) |
| `multiline` | Wraps cell text instead of truncating. Values longer than 120 characters get an inline *more / less* toggle |

Format values use a colon-separated `type:param1:param2` structure. Parameters are positional and all optional — omit trailing params to use defaults.

**Examples:**
```sql
'percent'           -- colour on, no decimal override
'percent:2'         -- 2 decimal places, colour on
'percent:2:nocolor' -- 2 decimal places, colour off
'percent::nocolor'  -- default decimals, colour off
'number:1'          -- 1 decimal place, colour on
'number:0:nocolor'  -- 0 decimal places, colour off
'currency:$'        -- $ prefix, colour on
'currency:€:nocolor'-- € prefix, colour off
```

#### RAG colour mapping

| Cell value contains | Dot colour |
|--------------------|------------|
| `on track`, `good`, `ahead`, `green` | Green |
| `at risk`, `watch`, `partial`, `amber` | Amber |
| `behind`, `off track`, `bad`, `red` | Red |
| anything else | Grey |

### Typography

Typography rules apply to every cell in the column.

| Column | Type | Accepted values | Description |
|--------|------|-----------------|-------------|
| `BOLD` | `VARCHAR` | `true` | Renders cell text in bold |
| `ITALIC` | `VARCHAR` | `true` | Renders cell text in italic |
| `TEXT_COLOR` | `VARCHAR` | Any CSS colour | Overrides the cell text colour — hex (`#3a70c0`), rgb (`rgb(60,112,192)`), or named (`navy`) |

### Combining rules for the same column

Rules are merged per column, so you can split concerns across rows rather than cramming everything into one:

```sql
-- Footnote
('Fund Equity Invested', NULL, 1, 'All figures reported at cost in USD millions.', NULL, NULL, NULL, NULL, NULL,         NULL, NULL, NULL),
-- Display name override
('Fund Equity Invested', NULL, NULL, NULL, 'Fund Equity Invested (USD)',            NULL, NULL, NULL, NULL,         NULL, NULL, NULL),
-- Width, alignment, and format
('Fund Equity Invested', NULL, NULL, NULL, NULL, 80, 'right', 'top', 'currency:$', NULL, NULL, NULL),
```

---

## Editor panel settings

These controls are in the plugin editor panel in Sigma and apply globally to the table.

### Table

| Setting | Description | Default |
|---------|-------------|---------|
| **Table Data** | Connect the Sigma element containing your data rows | — |
| **Footnote Config** | Connect the Sigma element containing your config rows | — |
| **Columns** | Multi-select of columns to display. Column order in the table matches selection order | — |
| **Group key column** | Column whose value drives group separator rows. A labelled header row is inserted each time the value changes | — |
| **Font family** | Font applied to the whole table | `Inter` |
| **Body font size** | Font size for all data cells | `11` |
| **Header background** | Background colour of the column header row | Dark navy |
| **Header text colour** | Text colour of the column header row | Light blue-grey |
| **Alternating rows** | Toggle zebra striping on/off | On |
| **Alt row colour** | Background colour of alternating (even) rows | Light grey |

### Group header

Controls the appearance of the group separator rows inserted when a *Group key column* is set.

| Setting | Description | Default |
|---------|-------------|---------|
| **Background colour** | Fill colour of the group header row | Light grey |
| **Text colour** | Label text colour | Mid grey |
| **Font size** | Label font size | `8` |
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

Opens `http://localhost:5173/mock.html` with sample portfolio data wired in. Mock data lives in [`src/mock/data.js`](src/mock/data.js) — edit it to test different column configurations and formats without needing a Sigma workbook.

### Run against Sigma

```bash
npm run dev
```

Register `http://localhost:5173` as a custom plugin URL in your Sigma workbook.

### Build for deployment

```bash
npm run build
```

Output goes to `dist/`. Host the contents on any static file server (S3, Netlify, GitHub Pages, etc.) and register the URL as a custom plugin in Sigma.

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
│   ├── 01_create_tables.sql # DDL (Snowflake syntax, adapt as needed)
│   └── 02_sample_data.sql   # Sample data (portfolio example)
├── index.html               # Sigma entry HTML
├── mock.html                # Mock dev entry HTML
├── vite.config.js           # Production Vite config
└── vite.config.mock.js      # Mock dev Vite config
```

---

## License

MIT
