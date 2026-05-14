# FormattedGrid

A [Sigma Computing](https://www.sigmacomputing.com/) custom plugin that renders a richly formatted data table driven entirely by Snowflake data. Column widths, alignment, number formats, footnotes, RAG indicators, and typography are all controlled through a companion config table — no code changes required to adjust the layout.

![FormattedGrid example](docs/screenshot.png)

---

## Features

- **Dynamic columns** — connect any Sigma element; columns are driven by what you select in the editor panel
- **Group separator rows** — designate a group-key column to automatically insert labelled section headers
- **Per-column formatting** — width, alignment, vertical alignment, bold, italic, text colour
- **Cell formats** — `percent` (neg/pos colouring), `rag` (coloured dot), `multiline` (wrap + expand/collapse)
- **Footnotes** — superscript markers on column headers or individual cells, with a linked footnote block at the bottom
- **Display name overrides** — rename columns for display without touching the Sigma element
- **Drag-to-resize** — column widths can be overridden by dragging the header edge; persisted in `localStorage`
- **Editor panel controls** — font family, body font size, header colours, alternating row colour, group header style

---

## Data sources

The plugin requires two Sigma elements connected as sources:

| Source | Purpose |
|--------|---------|
| **Table Data** (Source 1) | Main grid rows — one row per data record |
| **Footnote Config** (Source 2) | Column metadata — widths, formats, footnotes, styles |

---

## Snowflake setup

### 1. Create tables

```sql
-- Replace <DATABASE> and <SCHEMA>
-- See sql/01_create_tables.sql for the full DDL
```

Run [`sql/01_create_tables.sql`](sql/01_create_tables.sql) to create `GRID_DATA` and `GRID_CONFIG`.

### 2. Load sample data

[`sql/02_sample_data.sql`](sql/02_sample_data.sql) contains a worked example based on a private equity portfolio. Use it as a reference for the expected data shape.

### 3. GRID_CONFIG — column name matching

`COLUMN_NAME` in `GRID_CONFIG` must match the **display name** of the column as it appears inside your Sigma element. Sigma title-cases Snowflake snake_case names by default (e.g. `KKR_FUND_EQUITY_INVESTED` → `Kkr Fund Equity Invested`). If you rename a column in Sigma, update `COLUMN_NAME` to match.

---

## GRID_CONFIG reference

Each row in `GRID_CONFIG` is a rule. Multiple rules can target the same column (e.g. one row for the footnote, another for width and alignment).

| Column | Type | Description |
|--------|------|-------------|
| `COLUMN_NAME` | `VARCHAR` | **Required.** Sigma display name of the column this rule applies to |
| `ROW_KEY` | `VARCHAR` | `NULL` = header rule; a value = cell rule for the row whose first column matches |
| `FOOTNOTE_NUMBER` | `NUMBER` | Integer superscript marker (1, 2, 3 …) |
| `FOOTNOTE_TEXT` | `VARCHAR` | Full footnote text shown in the footnote block |
| `DISPLAY_NAME` | `VARCHAR` | Override the column header label |
| `WIDTH` | `NUMBER` | Column width in pixels |
| `ALIGN` | `VARCHAR` | `left` \| `center` \| `right` |
| `VALIGN` | `VARCHAR` | `top` \| `middle` \| `bottom` |
| `FORMAT` | `VARCHAR` | `percent` — neg/pos colouring; `number` — same; `rag` — coloured dot; `multiline` — wrap text |
| `BOLD` | `VARCHAR` | `true` to bold the column |
| `ITALIC` | `VARCHAR` | `true` to italicise the column |
| `TEXT_COLOR` | `VARCHAR` | Any CSS colour value, e.g. `#3a70c0` |

### RAG colour mapping

The `rag` format renders a coloured dot. The dot colour is inferred from the cell value:

| Value contains | Colour |
|---------------|--------|
| `on track`, `good`, `ahead`, `green` | Green |
| `at risk`, `watch`, `partial`, `amber` | Amber |
| `behind`, `off track`, `bad`, `red` | Red |
| anything else | Grey |

---

## Editor panel

| Field | Description |
|-------|-------------|
| **Table Data** | Connect your main data element |
| **Footnote Config** | Connect your config element |
| **Columns** | Select all columns you want displayed (order determines column order) |
| **Group key column** | Column whose value drives group separator rows |
| **Font family** | Table font (default: Inter) |
| **Body font size** | Cell text size |
| **Header background / text colour** | Override the default dark header |
| **Alternating rows** | Toggle zebra striping; pick the alt row colour |
| **Group header** | Background colour, text colour, font size, label style (UPPERCASE / Title Case / As-is) |

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

Opens `http://localhost:5173/mock.html` with sample portfolio data wired in. Mock data lives in [`src/mock/data.js`](src/mock/data.js).

### Run against Sigma (production dev)

```bash
npm run dev
```

Then register `http://localhost:5173` as a custom plugin in your Sigma workbook.

### Build

```bash
npm run build
```

Output goes to `dist/`. Host the contents of `dist/` on any static file server and register the URL in Sigma.

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
