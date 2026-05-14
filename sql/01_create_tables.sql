-- ─────────────────────────────────────────────────────────────────────────────
-- FormattedGrid Sigma Plugin — table DDL
--
-- Two tables are required per workbook that uses the plugin:
--   1. GRID_DATA        — the main table body (Source 1 in the plugin)
--   2. GRID_CONFIG      — column metadata, widths, formats, footnotes (Source 2)
--
-- Replace <DATABASE> and <SCHEMA> with your target Snowflake location.
-- Column names in GRID_CONFIG.COLUMN_NAME must match the display names of the
-- columns as they appear in your Sigma element — either the raw Snowflake column
-- names below, or whatever you have renamed them to inside Sigma.
-- ─────────────────────────────────────────────────────────────────────────────

USE DATABASE <DATABASE>;
USE SCHEMA <SCHEMA>;


-- ── 1. Main data table ────────────────────────────────────────────────────────
-- FUND and COMPANY are the group key and row key respectively.
-- All measure columns are VARCHAR to support formatted values (e.g. "1.7x",
-- "(25%)", "n.a.") coming out of Sigma pivot/calculated columns.

CREATE OR REPLACE TABLE GRID_DATA (
    FUND                        VARCHAR(100),   -- group key column
    COMPANY                     VARCHAR(200),   -- row key column
    REGION                      VARCHAR(100),
    DATE_OF_INVESTMENT          VARCHAR(20),
    FUND_EQUITY_INVESTED        VARCHAR(50),
    FUND_CONTROL                VARCHAR(10),
    CURRENT_MARK                VARCHAR(20),
    EBITDA_IC_ENTRY             VARCHAR(20),
    EBITDA_CURRENT              VARCHAR(20),
    EBITDA_IC_EXIT              VARCHAR(20),
    GROSS_IRR                   VARCHAR(20),
    CURRENT_ASSESSMENT          VARCHAR(50),
    QTD_VS_BUDGET               VARCHAR(20),
    YTD_VS_BUDGET               VARCHAR(20),
    ANNUAL_VS_BUDGET            VARCHAR(20),
    COMMENTARY                  VARCHAR(4000)
);


-- ── 2. Column config / footnote table ────────────────────────────────────────
-- One row per rule. Multiple rules can apply to the same column_name
-- (e.g. one row for the footnote, one row for width/format/style).
-- All styling columns are optional — NULL means use the plugin default.

CREATE OR REPLACE TABLE GRID_CONFIG (
    -- Targeting
    COLUMN_NAME     VARCHAR(200)    NOT NULL,   -- must match Sigma element column display name
    ROW_KEY         VARCHAR(200),               -- NULL = header rule; value = cell rule for that row

    -- Footnotes
    FOOTNOTE_NUMBER NUMBER(5,0),                -- superscript marker integer e.g. 1, 2, 3
    FOOTNOTE_TEXT   VARCHAR(2000),              -- full footnote text shown at bottom of table

    -- Header
    DISPLAY_NAME    VARCHAR(200),               -- override the column header label

    -- Layout
    WIDTH           NUMBER(6,0),                -- column width in pixels
    ALIGN           VARCHAR(10),                -- left | center | right
    VALIGN          VARCHAR(10),                -- top  | middle | bottom

    -- Cell format
    FORMAT          VARCHAR(20),                -- percent | number | rag | multiline

    -- Cell typography
    BOLD            VARCHAR(5),                 -- true | false
    ITALIC          VARCHAR(5),                 -- true | false
    TEXT_COLOR      VARCHAR(30)                 -- any CSS colour e.g. #3a70c0
);
