// Sample portfolio data for local dev testing.
const T = {
  fund:        'col_fund',
  company:     'col_company',
  region:      'col_region',
  dateInvest:  'col_date',
  equityUSD:   'col_equity',
  fundControl: 'col_control',
  currentMark: 'col_mark',
  ebitdaEntry: 'col_ebitda_entry',
  ebitdaCur:   'col_ebitda_cur',
  grossIRR:    'col_irr',
  assessment:  'col_assess',
  qtdBudget:   'col_qtd',
  ytdBudget:   'col_ytd',
  commentary:  'col_comment',
};

// Footnote config column IDs
const F = {
  colName:     'fn_col',
  rowKey:      'fn_row',
  fnNum:       'fn_num',
  fnText:      'fn_txt',
  displayName: 'fn_dn',
  width:       'fn_w',
  align:       'fn_al',
  format:      'fn_fmt',
  bold:        'fn_bold',
  italic:      'fn_italic',
  textColor:   'fn_color',
};

const MOCK = {
  config: {
    tableData:      'tableData',
    footnoteConfig: 'footnoteConfig',
    dataColumns:    Object.values(T),
    groupKeyCol:    T.fund,
    fontFamily:     'Inter',
  },

  elementColumns: {
    tableData: {
      [T.fund]:        { name: 'Fund' },
      [T.company]:     { name: 'Company' },
      [T.region]:      { name: 'Region' },
      [T.dateInvest]:  { name: 'Date of Investment' },
      [T.equityUSD]:   { name: 'Fund Equity Invested (USD)' },
      [T.fundControl]: { name: 'Fund Control' },
      [T.currentMark]: { name: 'Current Mark' },
      [T.ebitdaEntry]: { name: 'EBITDA Multiple - IC Entry' },
      [T.ebitdaCur]:   { name: 'EBITDA Multiple - Current' },
      [T.grossIRR]:    { name: 'Gross IRR' },
      [T.assessment]:  { name: 'Current Assessment' },
      [T.qtdBudget]:   { name: 'QTD vs Budget' },
      [T.ytdBudget]:   { name: 'YTD vs Budget' },
      [T.commentary]:  { name: 'Commentary' },
    },
    footnoteConfig: {
      [F.colName]:     { name: 'column_name' },
      [F.rowKey]:      { name: 'row_key' },
      [F.fnNum]:       { name: 'footnote_number' },
      [F.fnText]:      { name: 'footnote_text' },
      [F.displayName]: { name: 'display_name' },
      [F.width]:       { name: 'width' },
      [F.align]:       { name: 'align' },
      [F.format]:      { name: 'format' },
      [F.bold]:        { name: 'bold' },
      [F.italic]:      { name: 'italic' },
      [F.textColor]:   { name: 'text_color' },
    },
  },

  elementData: {
    tableData: {
      [T.fund]: [
        'Apex I', 'Apex I', 'Apex I', 'Apex I', 'Apex I',
        'Apex II', 'Apex II', 'Apex II', 'Apex II',
      ],
      [T.company]: [
        'CityPark Group', 'Andean Connect', 'Solara Energy', 'Cascadia Gas', 'GreenWave Waste',
        'NordFiber', 'Ridgeline Pipeline', 'ClearLink Networks', 'Skybridge Aviation',
      ],
      [T.region]: [
        'Europe', 'Americas', 'Americas', 'Americas', 'Europe',
        'Europe', 'Americas', 'Europe', 'Americas',
      ],
      [T.dateInvest]: [
        'Mar-16', 'Sep-20', 'Sep-20', 'Feb-22', 'Mar-19',
        'Jun-20', 'Nov-21', 'Feb-19', 'Apr-18',
      ],
      [T.equityUSD]: [274, 412, 98, 487, 391, 439, 623, 382, 318],
      [T.fundControl]: [
        'Yes', 'Yes', 'No', 'No', 'Yes',
        'Yes', 'No', 'Yes', 'Yes',
      ],
      [T.currentMark]: [
        '1.9x', '1.4x', '1.2x', '1.5x', '2.1x',
        '1.2x', '2.4x', '1.0x', '1.7x',
      ],
      [T.ebitdaEntry]: [
        '13.2x', '15.0x', 'n.a.', '13.1x', '11.0x',
        'n.a.', '13.0x', '14.5x', 'n.a.',
      ],
      [T.ebitdaCur]: [
        '14.5x', '16.9x', '11.4x', '14.8x', '16.2x',
        'n.a.', '9.5x', 'n.a.', 'n.a.',
      ],
      [T.grossIRR]: [
        '11%', '12%', '6%', '13%', '17%',
        '16%', '11%', '3%', '15%',
      ],
      [T.assessment]: [
        'On Track', 'Behind', 'Behind', 'On Track', 'On Track',
        'At Risk', 'On Track', 'At Risk', 'On Track',
      ],
      [T.qtdBudget]: [
        '3%', '(18%)', 'n.a.', '7%', '1%',
        '(42%)', '4%', '(11%)', 'n.a.',
      ],
      [T.ytdBudget]: [
        '4%', '(11%)', '(22%)', '2%', '0%',
        '(28%)', '(1%)', '(9%)', 'n.a.',
      ],
      [T.commentary]: [
        "CityPark's QTD operating performance was 3.2% above budget, supported by higher-than-anticipated volumes across urban locations, while YTD performance is tracking 4.1% ahead of plan.",
        "Andean Connect's QTD revenue is 18.4% below budget, driven by lower-than-forecast subscriber growth, while YTD revenue remains 11.2% below plan.",
        "Solara Energy has underperformed its budget by 22.1% on a YTD basis, reflecting lower power generation output due to grid curtailment during Q2.",
        "Cascadia Gas delivered QTD performance 6.8% above budget, driven by favourable throughput volumes, while YTD performance is 2.4% below plan following a Q1 maintenance outage.",
        "GreenWave Waste's QTD revenue is 1.3% below budget, while YTD performance is broadly in line with plan, supported by strong gate fee income and higher recycling commodity prices.",
        "NordFiber's QTD financial performance is 41.7% below budget and YTD performance is 28.3% below budget, reflecting slower-than-planned network deployment and customer on-boarding.",
        "Ridgeline Pipeline delivered QTD performance 3.8% above budget, driven by higher pipeline utilisation rates, while YTD performance is 0.8% below budget.",
        "ClearLink Networks' QTD performance is 11.4% below budget and YTD performance is 9.3% below plan, reflecting competitive pricing pressure in urban fibre markets.",
        "Skybridge Aviation reported a Q2 revenue surplus of $1.8M against budget, driven by higher fleet utilisation and lease renewal activity completed ahead of schedule.",
      ],
    },

    footnoteConfig: {
      [F.colName]: [
        'Fund Equity Invested (USD)',
        'Current Mark',
        'Gross IRR',
        'QTD vs Budget',
        'QTD vs Budget',
        'YTD vs Budget',
        // width/align/format rows
        'Company',
        'Region',
        'Date of Investment',
        'Fund Control',
        'EBITDA Multiple - IC Entry',
        'EBITDA Multiple - Current',
        'Gross IRR',
        'Current Assessment',
        'Commentary',
      ],
      [F.rowKey]: [
        null, null, null, 'Andean Connect', null, null,
        null, null, null, null, null, null, null, null, null,
      ],
      [F.fnNum]: [1, 2, 2, 3, null, null, null, null, null, null, null, null, null, null, null],
      [F.fnText]: [
        'All figures reported at cost in USD millions.',
        'FX rate as at 31 December 2025.',
        'FX rate as at 31 December 2025.',
        'Restated following Q4 2025 audit adjustment.',
        null, null, null, null, null, null, null, null, null, null, null,
      ],
      [F.displayName]: [
        null, null, null, null,
        '2025 QTD vs Budget (%)',
        '2025 YTD vs Budget (%)',
        null, null, null,
        'Controlling Interest',
        null, null, null, null, null,
      ],
      [F.width]: [
        80,   // Fund Equity Invested (USD)
        70,   // Current Mark
        null, null,
        70,   // QTD
        70,   // YTD
        160,  // Company
        65,   // Region
        55,   // Date of Investment
        55,   // Fund Control
        62,   // EBITDA Entry
        62,   // EBITDA Current
        62,   // Gross IRR
        60,   // Current Assessment
        260,  // Commentary
      ],
      [F.align]: [
        'right', 'right', null, null,
        'right', 'right',
        'left',    // Company
        'left',    // Region
        'center',  // Date of Investment
        'center',  // Fund Control
        'right',   // EBITDA Entry
        'right',   // EBITDA Current
        'right',   // Gross IRR
        'center',  // Current Assessment
        'left',    // Commentary
      ],
      [F.format]: [
        'currency:$', // Fund Equity Invested (USD)
        null, null, null,
        'percent:1',         // 2025 QTD vs Budget (%) — 1 decimal place, colour on
        'percent:1:nocolor', // 2025 YTD vs Budget (%) — 1 decimal place, no colour
        null, null, null, null, null, null, null,
        'rag',        // Current Assessment
        'multiline',  // Commentary
      ],
      [F.bold]: [
        null, null, null, null, null, null,
        null,     // Company
        'true',   // Region — bold demo
        null, null, null, null, null, null, null,
      ],
      [F.italic]: [
        null, null, null, null, null, null,
        null, null,
        'true',   // Date of Investment — italic demo
        null, null, null, null, null, null,
      ],
      [F.textColor]: [
        null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null,
      ],
    },
  },
};

export default MOCK;
