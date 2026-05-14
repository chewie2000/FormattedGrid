-- ─────────────────────────────────────────────────────────────────────────────
-- FormattedGrid Sigma Plugin — sample data
-- Run 01_create_tables.sql first.
-- Replace <DATABASE> and <SCHEMA> before executing.
-- ─────────────────────────────────────────────────────────────────────────────

USE DATABASE <DATABASE>;
USE SCHEMA <SCHEMA>;


-- ── Main data ─────────────────────────────────────────────────────────────────
TRUNCATE TABLE GRID_DATA;

INSERT INTO GRID_DATA VALUES
-- FUND,          COMPANY,                       REGION,     DATE,     EQUITY,  CTRL,  MARK,   EB_ENTRY, EB_CUR, EB_EXIT, IRR,   ASSESSMENT,   QTD,      YTD,      ANN,     COMMENTARY
  ('Apex I',  'CityPark Group',             'Europe',   'Mar-16', '274',   'Yes', '1.9x', '13.2x', '14.5x', '11.8x', '11%', 'On Track',  '3%',     '4%',     '(8%)',  'CityPark''s QTD operating performance was 3.2% above budget, supported by higher-than-anticipated volumes across urban locations, while YTD performance is tracking 4.1% ahead of plan.'),
  ('Apex I',  'Andean Connect',             'Americas', 'Sep-20', '412',   'Yes', '1.4x', '15.0x', '16.9x', '12.5x', '12%', 'Behind',    '(18%)',  '(11%)',  '(5%)',  'Andean Connect''s QTD revenue is 18.4% below budget, driven by lower-than-forecast subscriber growth, while YTD revenue remains 11.2% below plan.'),
  ('Apex I',  'Solara Energy',              'Americas', 'Sep-20', '98',    'No',  '1.2x', 'n.a.',  '11.4x', 'n.a.',  '6%',  'Behind',    'n.a.',   '(22%)',  '94%',   'Solara Energy has underperformed its budget by 22.1% on a YTD basis, reflecting lower power generation output due to grid curtailment during Q2.'),
  ('Apex I',  'Cascadia Gas',               'Americas', 'Feb-22', '487',   'No',  '1.5x', '13.1x', '14.8x', '11.2x', '13%', 'On Track',  '7%',     '2%',     '(12%)', 'Cascadia Gas delivered QTD performance 6.8% above budget, driven by favourable throughput volumes, while YTD performance is 2.4% below plan following a Q1 maintenance outage.'),
  ('Apex I',  'GreenWave Waste',            'Europe',   'Mar-19', '391',   'Yes', '2.1x', '11.0x', '16.2x', '15.8x', '17%', 'On Track',  '1%',     '0%',     '15%',   'GreenWave Waste''s QTD revenue is 1.3% below budget, while YTD performance is broadly in line with plan, supported by strong gate fee income and higher recycling commodity prices.'),
  ('Apex II', 'NordFiber',                  'Europe',   'Jun-20', '439',   'Yes', '1.2x', 'n.a.',  'n.a.',  '21.0x', '16%', 'At Risk',   '(42%)',  '(28%)',  '(44%)', 'NordFiber''s QTD financial performance is 41.7% below budget and YTD performance is 28.3% below budget, reflecting slower-than-planned network deployment and customer on-boarding.'),
  ('Apex II', 'Ridgeline Pipeline',         'Americas', 'Nov-21', '623',   'No',  '2.4x', '13.0x', '9.5x',  '12.0x', '11%', 'On Track',  '4%',     '(1%)',   '6%',    'Ridgeline Pipeline delivered QTD performance 3.8% above budget, driven by higher pipeline utilisation rates, while YTD performance is 0.8% below budget.'),
  ('Apex II', 'ClearLink Networks',         'Europe',   'Feb-19', '382',   'Yes', '1.0x', '14.5x', 'n.a.',  '13.5x', '3%',  'At Risk',   '(11%)',  '(9%)',   '(21%)', 'ClearLink Networks'' QTD performance is 11.4% below budget and YTD performance is 9.3% below plan, reflecting competitive pricing pressure in urban fibre markets.'),
  ('Apex II', 'Skybridge Aviation',         'Americas', 'Apr-18', '318',   'Yes', '1.7x', 'n.a.',  'n.a.',  'n.a.',  '15%', 'On Track',  'n.a.',   'n.a.',   'n.a.',  'Skybridge Aviation reported a Q2 revenue surplus of $1.8M against budget, driven by higher fleet utilisation and lease renewal activity completed ahead of schedule.'),
  ('Apex III','Atlas Power',                'Europe',   'Mar-22', '874',   'Yes', '1.3x', '6.5x',  '9.2x',  '7.8x',  '12%', 'On Track',  '(11%)',  '2%',     '(10%)', 'Atlas Power''s QTD performance is 10.8% below budget, while YTD performance is 1.6% above plan, reflecting strong H1 dispatch revenues that offset a weaker Q3.'),
  ('Apex III','BlueSea Shipping',           'Europe',   'Jan-21', '521',   'Yes', '1.3x', '7.5x',  '8.5x',  '8.2x',  '11%', 'On Track',  '(3%)',   '3%',     '(8%)',  'BlueSea Shipping''s QTD performance showed a 3.1% variance below budget in revenue, partially offset by improved vessel efficiency, while YTD performance is 2.7% above budget.'),
  ('Apex III','Voltara Storage',            'Europe',   'Jun-21', '305',   'No',  '1.6x', 'n.a.',  'n.a.',  'n.a.',  '19%', 'On Track',  '14%',    '9%',     '7%',    'Voltara Storage continues to outperform budget with strong QTD and YTD performance driven by higher-than-forecast grid balancing contract revenue and increased battery dispatch cycles.');


-- ── Column config / footnotes ─────────────────────────────────────────────────
-- COLUMN_NAME values must match the column display names in your Sigma element
-- exactly (case-sensitive). Sigma title-cases Snowflake snake_case names by
-- default, e.g. FUND_EQUITY_INVESTED → "Fund Equity Invested".
-- If you rename a column inside Sigma, update COLUMN_NAME here to match.

TRUNCATE TABLE GRID_CONFIG;

INSERT INTO GRID_CONFIG
    (COLUMN_NAME, ROW_KEY, FOOTNOTE_NUMBER, FOOTNOTE_TEXT, DISPLAY_NAME, WIDTH, ALIGN, VALIGN, FORMAT, BOLD, ITALIC, TEXT_COLOR)
VALUES

-- ── Footnotes ─────────────────────────────────────────────────────────────────
  ('Fund Equity Invested',  NULL,            1, 'All figures reported at cost in USD millions.',  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Current Mark',          NULL,            2, 'FX rate as at 31 December 2025.',                NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Gross Irr',             NULL,            2, 'FX rate as at 31 December 2025.',                NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Qtd vs Budget',         'Andean Connect',3, 'Restated following Q4 2025 audit adjustment.',   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

-- ── Display name overrides ────────────────────────────────────────────────────
  ('Fund Equity Invested',  NULL, NULL, NULL, 'Fund Equity Invested (USD)',  NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Fund Control',          NULL, NULL, NULL, 'Controlling Interest',        NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Ebitda Ic Entry',       NULL, NULL, NULL, 'EBITDA Multiple — IC Entry',  NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Ebitda Current',        NULL, NULL, NULL, 'EBITDA Multiple — Current',   NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Ebitda Ic Exit',        NULL, NULL, NULL, 'EBITDA Multiple — IC Exit',   NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Qtd vs Budget',         NULL, NULL, NULL, '2025 QTD vs Budget (%)',      NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Ytd vs Budget',         NULL, NULL, NULL, '2025 YTD vs Budget (%)',      NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Annual vs Budget',      NULL, NULL, NULL, '2025 Annual vs Budget (%)',   NULL, NULL, NULL, NULL, NULL, NULL, NULL),

-- ── Column widths, alignment and format ──────────────────────────────────────
  ('Company',               NULL, NULL, NULL, NULL,  160, 'left',   'top',    NULL,        NULL,   NULL,   NULL),
  ('Region',                NULL, NULL, NULL, NULL,   65, 'left',   'top',    NULL,        'true', NULL,   NULL),
  ('Date of Investment',    NULL, NULL, NULL, NULL,   55, 'center', 'top',    NULL,        NULL,   'true', NULL),
  ('Fund Equity Invested',  NULL, NULL, NULL, NULL,   80, 'right',  'top',    'currency:$', NULL,   NULL,   NULL),
  ('Fund Control',          NULL, NULL, NULL, NULL,   55, 'center', 'top',    NULL,        NULL,   NULL,   NULL),
  ('Current Mark',          NULL, NULL, NULL, NULL,   70, 'right',  'top',    NULL,        NULL,   NULL,   NULL),
  ('Ebitda Ic Entry',       NULL, NULL, NULL, NULL,   62, 'right',  'top',    NULL,        NULL,   NULL,   NULL),
  ('Ebitda Current',        NULL, NULL, NULL, NULL,   62, 'right',  'top',    NULL,        NULL,   NULL,   NULL),
  ('Ebitda Ic Exit',        NULL, NULL, NULL, NULL,   62, 'right',  'top',    NULL,        NULL,   NULL,   NULL),
  ('Gross Irr',             NULL, NULL, NULL, NULL,   62, 'right',  'top',    NULL,        NULL,   NULL,   NULL),
  ('Current Assessment',    NULL, NULL, NULL, NULL,   60, 'center', 'middle', 'rag',       NULL,   NULL,   NULL),
  ('Qtd vs Budget',         NULL, NULL, NULL, NULL,   70, 'right',  'top',    'percent',   NULL,   NULL,   NULL),
  ('Ytd vs Budget',         NULL, NULL, NULL, NULL,   70, 'right',  'top',    'percent',   NULL,   NULL,   NULL),
  ('Annual vs Budget',      NULL, NULL, NULL, NULL,   70, 'right',  'top',    'percent',   NULL,   NULL,   NULL),
  ('Commentary',            NULL, NULL, NULL, NULL,  260, 'left',   'top',    'multiline', NULL,   NULL,   '#4a4a6a');
