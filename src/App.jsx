import { Fragment, useState, useEffect, useRef } from 'react';
import {
  useConfig,
  useEditorPanelConfig,
  useElementData,
  useElementColumns,
  useLoadingState,
  usePlugin,
} from '@sigmacomputing/plugin';

// ── Editor panel ──────────────────────────────────────────────────────────────
const EDITOR_FIELDS = [
  { name: 'tableData',      type: 'element' },
  { name: 'footnoteConfig', type: 'element' },
  { name: 'fnColumns', type: 'column', source: 'footnoteConfig', allowMultiple: true, label: 'Config columns (auto-managed)' },
  {
    name: 'dataColumns',
    type: 'column',
    source: 'tableData',
    allowMultiple: true,
    label: 'Columns (add all data columns here)',
  },
  {
    name: 'groupKeyCol',
    type: 'column',
    source: 'tableData',
    allowMultiple: false,
    label: 'Group key column',
    allowedTypes: ['text', 'number', 'integer', 'datetime'],
  },

  { name: 'grpTable', type: 'group', label: 'Table' },
  { name: 'fontFamily',   type: 'text',     label: 'Font family',    defaultValue: 'Inter', placeholder: 'e.g. Inter, Georgia, Arial' },
  { name: 'bodyFontSize', type: 'dropdown', label: 'Body font size', values: ['7', '8', '9', '10', '11', '12', '13', '14', '16', '18', '20', '24'], defaultValue: '11' },
  { name: 'headerBg',     type: 'color',    label: 'Header background' },
  { name: 'headerColor',  type: 'color',    label: 'Header text colour' },
  { name: 'altRows',      type: 'toggle',   label: 'Alternating rows',  defaultValue: true },
  { name: 'altRowColor',  type: 'color',    label: 'Alt row colour' },

  { name: 'grpGroup', type: 'group', label: 'Group header' },
  { name: 'groupBg',         type: 'color',    label: 'Background colour' },
  { name: 'groupColor',      type: 'color',    label: 'Text colour' },
  { name: 'groupFontSize',   type: 'dropdown', label: 'Font size',    values: ['7', '8', '9', '10', '11', '12', '13', '14', '16', '18', '20', '24'], defaultValue: '8' },
  { name: 'groupLabelStyle', type: 'dropdown', label: 'Label style',  values: ['UPPERCASE', 'Title Case', 'As-is'], defaultValue: 'UPPERCASE' },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const FONT = '"Inter","Helvetica Neue",Arial,sans-serif';
const S = {
  wrap:     { fontFamily: FONT, fontSize: '11px', background: '#f2f3f7', color: '#1a1a2e', overflowX: 'auto' },
  table:    { borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%' },
  th:       {
    background: '#38385e', color: '#b8bcd8',
    fontSize: '8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
    padding: '6px 22px 6px 8px',  // right padding leaves room for resize handle
    borderRight: '1px solid #4a4a72', borderBottom: '2px solid #20203a',
    verticalAlign: 'bottom', textAlign: 'right',
    whiteSpace: 'normal', wordBreak: 'normal', overflowWrap: 'normal', lineHeight: '1.3',
    position: 'relative', overflow: 'hidden',
    userSelect: 'none',
  },
  thLeft:   { textAlign: 'left' },
  td:       {
    padding: '5px 8px', fontSize: '11px', color: '#1a1a2e',
    borderRight: '1px solid #e4e5ee', borderBottom: '1px solid #eaeaf2',
    background: '#ffffff', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
    verticalAlign: 'top',
  },
  tdAlt:    { background: '#f8f8fc' },
  groupHdr: {
    background: '#e6e7ef', color: '#5a5a80',
    fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '4px 10px', borderTop: '1px solid #d2d3e0', borderBottom: '1px solid #d2d3e0',
  },
  handle:   {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: '6px',
    cursor: 'col-resize', zIndex: 1,
  },
  sup:      { color: '#8888aa', fontSize: '7px', fontWeight: 500, cursor: 'pointer', lineHeight: 0, verticalAlign: 'super', marginLeft: '1px' },
  fnWrap:   { padding: '6px 10px 10px', fontSize: '9px', color: '#8888aa', lineHeight: '1.8', background: '#f2f3f7', borderTop: '1px solid #ddddf0' },
  tdMulti:  { whiteSpace: 'normal', overflow: 'visible', textOverflow: 'unset', fontSize: '10px', lineHeight: '1.45', color: '#4a4a6a' },
  moreBtn:  { background: 'none', border: 'none', color: '#3a70c0', cursor: 'pointer', fontSize: '10px', padding: '0 2px', textDecoration: 'underline' },
  fnRow:    { cursor: 'pointer' },
  empty:    { padding: '32px 16px', color: '#999', fontSize: '13px', textAlign: 'center', background: '#f2f3f7' },
  version:  { padding: '2px 10px 4px', fontSize: '8px', color: '#c0c0d0', textAlign: 'right', background: '#f2f3f7', userSelect: 'none' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function colIdByName(cols, name) {
  if (!cols || !name) return null;
  const norm = s => String(s).toLowerCase().replace(/[\s_]+/g, '_');
  const target = norm(name);
  for (const [id, col] of Object.entries(cols)) {
    if (norm(col.name) === target) return id;
  }
  return null;
}

// Fallback column width based on header text length when no explicit width is set.
function defaultWidth(name) {
  return Math.max(60, Math.min(180, (name?.length ?? 8) * 9));
}

// Prepends a currency symbol to a value string, adding comma-formatting for
// plain integers/decimals. Leaves n.a. / em-dash / empty values untouched.
function applyCurrency(val, symbol) {
  const s = String(val ?? '').trim();
  if (!s || ['n.a.', '-', '—', ''].includes(s)) return s;
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    return `${symbol}${Math.abs(n).toLocaleString()}`;
  }
  return `${symbol}${s}`;
}

// Applies decimal places to a numeric string, preserving accounting-style
// parentheses for negatives and an optional suffix (e.g. '%').
// Leaves n.a. / em-dash / non-numeric values untouched.
function applyDecimals(val, decimals, suffix = '') {
  const s = String(val ?? '').trim();
  if (!s || ['n.a.', '-', '—', ''].includes(s)) return s;
  const isAccounting = s.startsWith('(') && s.endsWith(')');
  const inner   = isAccounting ? s.slice(1, -1) : s;
  const stripped = inner.replace(/%$/, '').replace(/,/g, '').trim();
  const n = parseFloat(stripped);
  if (isNaN(n)) return s;
  const abs = Math.abs(n).toFixed(decimals);
  return isAccounting ? `(${abs}${suffix})` : `${abs}${suffix}`;
}

// Returns 'neg' | 'pos' | 'zero' | 'na' for numeric/percent cell values.
// Handles plain numbers, %, $, and accounting-style (25%) negatives.
function parseSign(val) {
  const s = String(val ?? '').trim();
  if (!s || ['n.a.', '-', '—', ''].includes(s)) return 'na';
  if (s.startsWith('(') && s.endsWith(')')) return 'neg';
  const n = parseFloat(s.replace(/[%$,]/g, ''));
  if (isNaN(n)) return 'na';
  if (n < 0) return 'neg';
  if (n > 0) return 'pos';
  return 'zero';
}

const SIGN_STYLE = {
  neg:  { color: '#c0302a', fontWeight: 600 },
  pos:  { color: '#1a7a50', fontWeight: 600 },
  zero: {},
  na:   { color: '#b8bace' },
};

const RAG_COLOURS = {
  green: '#2aaa70',
  amber: '#d08810',
  red:   '#c03030',
  grey:  '#aaaacc',
};

function ragColour(value) {
  const v = String(value ?? '').toLowerCase();
  if (['green', 'on track', 'good', 'ahead'].some(k => v.includes(k)))   return RAG_COLOURS.green;
  if (['amber', 'at risk', 'watch', 'partial'].some(k => v.includes(k))) return RAG_COLOURS.amber;
  if (['red', 'behind', 'off track', 'bad'].some(k => v.includes(k)))    return RAG_COLOURS.red;
  return RAG_COLOURS.grey;
}

function RagDot({ value }) {
  return (
    <span
      title={value}
      style={{
        display: 'inline-block', width: '9px', height: '9px',
        borderRadius: '50%', background: ragColour(value),
        verticalAlign: 'middle',
      }}
    />
  );
}

function SupList({ nums, getFirstId, onClickNum }) {
  if (!nums || !nums.length) return null;
  return nums.map((n, i) => (
    <Fragment key={n}>
      {i > 0 && <sup style={S.sup}>,</sup>}
      <sup id={getFirstId(n)} style={S.sup} onClick={() => onClickNum(n)}>
        {n}
      </sup>
    </Fragment>
  ));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function App() {
  useEditorPanelConfig(EDITOR_FIELDS);
  const config = useConfig();

  const tableSourceId    = config?.tableData;
  const footnoteSourceId = config?.footnoteConfig;
  const groupKeyColId    = config?.groupKeyCol;
  const fontFamily       = config?.fontFamily || 'Inter';

  // ── Dynamic formatting from editor config ─────────────────────────────────────
  const dynBodySize    = `${config?.bodyFontSize   || '11'}px`;
  const dynHeaderBg    =  config?.headerBg         || S.th.background;
  const dynHeaderColor =  config?.headerColor      || S.th.color;
  const dynAltRows     =  config?.altRows          !== false;
  const dynAltColor    =  config?.altRowColor      || S.tdAlt.background;
  const dynGroupBg     =  config?.groupBg          || S.groupHdr.background;
  const dynGroupColor  =  config?.groupColor       || S.groupHdr.color;
  const dynGroupSize   = `${config?.groupFontSize  || '8'}px`;
  const dynGroupTransform = { UPPERCASE: 'uppercase', 'Title Case': 'capitalize', 'As-is': 'none' }[config?.groupLabelStyle] ?? 'uppercase';

  const [, setLoadingState] = useLoadingState(true);
  const plugin       = usePlugin();
  const tableCols    = useElementColumns(tableSourceId);
  const tableData    = useElementData(tableSourceId);
  const footnoteCols = useElementColumns(footnoteSourceId);
  const footnoteData = useElementData(footnoteSourceId);

  // Auto-register all footnoteConfig columns so Sigma pushes their data through
  // useElementData. Two guards combined:
  //   1. Config comparison — skips setKey when Sigma already has the columns
  //      registered (normal interactive use, avoids flicker on reload).
  //   2. useRef session flag — prevents repeated setKey calls when config.fnColumns
  //      never updates between renders (Sigma PDF export / headless contexts),
  //      which would otherwise loop until the export times out.
  const fnColsTarget  = Object.keys(footnoteCols ?? {}).sort().join(',');
  const fnColsCurrent = [...(Array.isArray(config?.fnColumns) ? config.fnColumns : [])].sort().join(',');
  const fnSetCalledRef = useRef(false);
  useEffect(() => {
    if (!fnColsTarget || fnColsTarget === fnColsCurrent || fnSetCalledRef.current) return;
    fnSetCalledRef.current = true;
    plugin.config.setKey('fnColumns', fnColsTarget.split(','));
  }, [fnColsTarget, fnColsCurrent]);

  // ── Expanded commentary cells ─────────────────────────────────────────────────
  const [expanded, setExpanded] = useState(new Set());
  const toggleCell = key =>
    setExpanded(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  // ── Column widths: session-only drag overrides ────────────────────────────────
  // Not persisted — localStorage is unavailable in Sigma's export screenshotter.
  const [colWidths, setColWidths] = useState({});

  // ── Column list: columns added to the multi-select, excluding the group key ──
  // useElementData only contains data for registered column fields (dataColumns +
  // rowKeyCol + groupKeyCol), so its keys exactly match what the user has added.
  const allColIds     = Object.keys(tableData ?? {});
  const displayColIds = allColIds.filter(id => id !== groupKeyColId);
  // Row count from the group-key or row-key column, which are always in tableData.
  const anchorColId   = groupKeyColId ?? allColIds[0];
  const rowCount      = tableData?.[anchorColId]?.length ?? 0;

  // ── Loading state — signals the Sigma screenshotter that rendering is complete ──
  // Must sit after rowCount / displayColIds are derived so the dependency array
  // captures the correct values.
  useEffect(() => {
    if (!tableSourceId) { setLoadingState(false); return; }
    if (rowCount > 0 && displayColIds.length > 0) setLoadingState(false);
  }, [tableSourceId, rowCount, displayColIds.length]);

  // ── Parse footnote source ─────────────────────────────────────────────────────
  const fnColNameId = colIdByName(footnoteCols, 'column_name');
  const fnRowKeyId  = colIdByName(footnoteCols, 'row_key');
  const fnNumberId  = colIdByName(footnoteCols, 'footnote_number');
  const fnTextId    = colIdByName(footnoteCols, 'footnote_text');
  const fnDisplayId = colIdByName(footnoteCols, 'display_name');
  const fnWidthId   = colIdByName(footnoteCols, 'width');
  const fnAlignId     = colIdByName(footnoteCols, 'align');
  const fnValignId    = colIdByName(footnoteCols, 'valign');
  const fnFormatId    = colIdByName(footnoteCols, 'format');
  const fnBoldId      = colIdByName(footnoteCols, 'bold');
  const fnItalicId    = colIdByName(footnoteCols, 'italic');
  const fnTextColorId = colIdByName(footnoteCols, 'text_color');

  const fnColNamesArr = footnoteData?.[fnColNameId] ?? [];
  const fnRowKeysArr  = footnoteData?.[fnRowKeyId]  ?? [];
  const fnNumbersArr  = footnoteData?.[fnNumberId]  ?? [];
  const fnTextsArr    = footnoteData?.[fnTextId]    ?? [];
  const fnDisplaysArr = fnDisplayId ? (footnoteData?.[fnDisplayId] ?? []) : [];
  const fnWidthsArr   = fnWidthId   ? (footnoteData?.[fnWidthId]   ?? []) : [];
  const fnAlignArr     = fnAlignId     ? (footnoteData?.[fnAlignId]     ?? []) : [];
  const fnValignArr    = fnValignId    ? (footnoteData?.[fnValignId]    ?? []) : [];
  const fnFormatArr    = fnFormatId    ? (footnoteData?.[fnFormatId]    ?? []) : [];
  const fnBoldArr      = fnBoldId      ? (footnoteData?.[fnBoldId]      ?? []) : [];
  const fnItalicArr    = fnItalicId    ? (footnoteData?.[fnItalicId]    ?? []) : [];
  const fnTextColorArr = fnTextColorId ? (footnoteData?.[fnTextColorId] ?? []) : [];

  const headerFn   = {};
  const cellFn     = {};
  const fnTexts    = {};
  const displayMap = {};
  const widthMap   = {};  // colName -> number (px), from Source 2
  const alignMap   = {};  // colName -> 'left'|'center'|'right', from Source 2
  const valignMap    = {};  // colName -> 'top'|'middle'|'bottom'
  const formatMap    = {};  // colName -> 'rag'|'percent'|'number'
  const boldMap      = {};  // colName -> true
  const italicMap    = {};  // colName -> true
  const textColorMap = {};  // colName -> css color string

  fnColNamesArr.forEach((colName, i) => {
    if (!colName) return;

    const dname = fnDisplaysArr[i];
    if (dname) displayMap[colName] = dname;

    const wRaw = fnWidthsArr[i];
    if (wRaw != null && wRaw !== '') {
      const w = Number(wRaw);
      if (!isNaN(w) && w > 0) widthMap[colName] = w;
    }

    const aRaw = fnAlignArr[i];
    if (aRaw && ['left', 'center', 'right'].includes(String(aRaw).trim().toLowerCase())) {
      alignMap[colName] = String(aRaw).trim().toLowerCase();
    }

    const vaRaw = fnValignArr[i];
    if (vaRaw && ['top', 'middle', 'bottom'].includes(String(vaRaw).trim().toLowerCase())) {
      valignMap[colName] = String(vaRaw).trim().toLowerCase();
    }

    const fRaw = fnFormatArr[i];
    if (fRaw) formatMap[colName] = String(fRaw).trim().toLowerCase();

    const bRaw = fnBoldArr[i];
    if (bRaw && ['true', 'yes', '1'].includes(String(bRaw).trim().toLowerCase())) boldMap[colName] = true;

    const iRaw = fnItalicArr[i];
    if (iRaw && ['true', 'yes', '1'].includes(String(iRaw).trim().toLowerCase())) italicMap[colName] = true;

    const cRaw = fnTextColorArr[i];
    if (cRaw) textColorMap[colName] = String(cRaw).trim();

    const numRaw = fnNumbersArr[i];
    if (numRaw == null || numRaw === '') return;
    const num = Number(numRaw);
    if (isNaN(num)) return;

    fnTexts[num] = fnTextsArr[i] ?? '';

    const rowKeyStr = fnRowKeysArr[i] != null ? String(fnRowKeysArr[i]).trim() : '';
    if (rowKeyStr === '' || rowKeyStr === 'null') {
      if (!headerFn[colName]) headerFn[colName] = [];
      if (!headerFn[colName].includes(num)) headerFn[colName].push(num);
    } else {
      const key = `${colName}||${rowKeyStr}`;
      if (!cellFn[key]) cellFn[key] = [];
      if (!cellFn[key].includes(num)) cellFn[key].push(num);
    }
  });

  Object.values(headerFn).forEach(a => a.sort((x, y) => x - y));
  Object.values(cellFn).forEach(a => a.sort((x, y) => x - y));

  // Effective width for a column: drag override > Source 2 width > text-length heuristic
  const effectiveWidth = (colId) => {
    if (colWidths[colId]) return colWidths[colId];
    const name = tableCols?.[colId]?.name ?? colId;
    if (widthMap[name]) return widthMap[name];
    return defaultWidth(name);
  };

  // ── Resize handler ────────────────────────────────────────────────────────────
  const startResize = (e, colId) => {
    e.preventDefault();
    const th = e.currentTarget.closest('th');
    const startX     = e.clientX;
    const startWidth = th.offsetWidth;

    const onMove = (moveE) => {
      const w = Math.max(40, startWidth + (moveE.clientX - startX));
      setColWidths(prev => ({ ...prev, [colId]: w }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // ── Build rows ────────────────────────────────────────────────────────────────
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const row = {};
    displayColIds.forEach(id => { row[id] = tableData?.[id]?.[i] ?? ''; });
    row.__groupKey = groupKeyColId      ? String(tableData?.[groupKeyColId]?.[i]      ?? '') : '';
    row.__rowKey   = displayColIds[0]   ? String(tableData?.[displayColIds[0]]?.[i]   ?? '') : String(i);
    return row;
  });

  const groupStarts = new Set();
  rows.forEach((row, i) => {
    if (i === 0 || row.__groupKey !== rows[i - 1].__groupKey) groupStarts.add(i);
  });

  // ── First-occurrence IDs for footnote back-navigation ─────────────────────────
  const firstId = {};
  const markFirst = (num, id) => { if (!(num in firstId)) firstId[num] = id; };

  displayColIds.forEach(colId => {
    const name = tableCols?.[colId]?.name ?? colId;
    (headerFn[name] ?? []).forEach(n => markFirst(n, `fn-h-${colId}-${n}`));
  });
  rows.forEach((row, ri) => {
    displayColIds.forEach(colId => {
      const name = tableCols?.[colId]?.name ?? colId;
      (cellFn[`${name}||${row.__rowKey}`] ?? []).forEach(n => markFirst(n, `fn-c-${ri}-${colId}-${n}`));
    });
  });

  const usedNums = [...new Set(Object.keys(firstId).map(Number))].sort((a, b) => a - b);
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (!tableSourceId) {
    return <div style={S.empty}>Connect a Table Data source in the editor panel.</div>;
  }
  if (rowCount === 0 || displayColIds.length === 0) {
    return <div style={S.empty}>No data to display.</div>;
  }

  let altIndex = 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  const totalWidth = displayColIds.reduce((sum, id) => sum + effectiveWidth(id), 0);

  return (
    <div style={{ ...S.wrap, fontFamily: `${fontFamily},${FONT}` }}>
      {/* Force background colours and images to render in PDF/print contexts */}
      <style>{`* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`}</style>
      <table style={{ ...S.table, width: `${totalWidth}px` }}>
        <colgroup>
          {displayColIds.map(colId => (
            <col key={colId} style={{ width: `${effectiveWidth(colId)}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {displayColIds.map((colId, ci) => {
              const name  = tableCols?.[colId]?.name ?? colId;
              const label = displayMap[name] ?? name;
              const fns   = headerFn[name] ?? [];
              const align = alignMap[name] ?? (ci === 0 ? 'left' : 'right');
              const th    = { ...S.th, textAlign: align, background: dynHeaderBg, color: dynHeaderColor };
              return (
                <th key={colId} style={th} title={label}>
                  {label}
                  <SupList
                    nums={fns}
                    getFirstId={n => firstId[n] === `fn-h-${colId}-${n}` ? `fn-h-${colId}-${n}` : undefined}
                    onClickNum={n => scrollTo(`fn-def-${n}`)}
                  />
                  <div style={S.handle} onMouseDown={e => startResize(e, colId)} />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isGroupStart = groupStarts.has(ri);
            if (isGroupStart) altIndex = 0;
            const isAlt = altIndex % 2 === 1;
            altIndex++;

            return (
              <Fragment key={ri}>
                {isGroupStart && groupKeyColId && (
                  <tr>
                    <td colSpan={displayColIds.length} style={{ ...S.groupHdr, background: dynGroupBg, color: dynGroupColor, fontSize: dynGroupSize, textTransform: dynGroupTransform }}>
                      {row.__groupKey}
                    </td>
                  </tr>
                )}
                <tr>
                  {displayColIds.map((colId, ci) => {
                    const name   = tableCols?.[colId]?.name ?? colId;
                    const fns    = cellFn[`${name}||${row.__rowKey}`] ?? [];
                    const val    = row[colId] != null ? String(row[colId]) : '';
                    const fmt    = formatMap[name];
                    // Parse format string: base[:param1[:param2]]
                    // percent/number: param1 = decimal places (optional), param2 = 'nocolor' (optional)
                    // currency:      param1 = symbol, param2 = 'nocolor' (optional)
                    const fmtParts   = fmt?.split(':') ?? [];
                    const fmtBase    = fmtParts[0] ?? null;
                    const fmtParam1  = fmtParts[1] ?? null;
                    const fmtParam2  = fmtParts[2] ?? null;
                    const isCurrency = fmtBase === 'currency';
                    const noColor    = fmtParam1 === 'nocolor' || fmtParam2 === 'nocolor';
                    const decimals   = (fmtBase === 'percent' || fmtBase === 'number') &&
                                       fmtParam1 != null && fmtParam1 !== 'nocolor' &&
                                       !isNaN(Number(fmtParam1))
                                       ? Number(fmtParam1) : null;
                    const align  = alignMap[name] ?? (ci === 0 ? 'left' : 'right');
                    const valign = valignMap[name] ?? 'top';
                    const isNumeric   = fmtBase === 'percent' || fmtBase === 'number' || isCurrency;
                    const isMultiline = fmtBase === 'multiline';
                    const sign        = isNumeric && !noColor ? parseSign(val) : null;
                    const cellKey     = `${row.__rowKey}|${colId}`;
                    const isOpen      = expanded.has(cellKey);
                    const truncatable = isMultiline && val.length > 120;
                    const formattedVal = isCurrency && fmtParam1 && fmtParam1 !== 'nocolor'
                      ? applyCurrency(val, fmtParam1)
                      : decimals != null
                      ? applyDecimals(val, decimals, fmtBase === 'percent' ? '%' : '')
                      : val;
                    const displayVal   = truncatable && !isOpen ? formattedVal.slice(0, 120) + '…' : formattedVal;

                    const td = {
                      ...S.td,
                      ...(isAlt && dynAltRows ? { background: dynAltColor } : {}),
                      textAlign:     fmtBase === 'rag' ? 'center' : align,
                      verticalAlign: valign,
                      ...(isMultiline ? S.tdMulti : {}),
                      fontSize: dynBodySize,
                      ...(boldMap[name]      ? { fontWeight: 600 }           : {}),
                      ...(italicMap[name]    ? { fontStyle: 'italic' }       : {}),
                      ...(textColorMap[name] ? { color: textColorMap[name] } : {}),
                      ...(sign ? SIGN_STYLE[sign] : {}),
                    };
                    return (
                      <td key={colId} style={td} title={fmtBase !== 'rag' && !isMultiline ? val : undefined}>
                        {fmtBase === 'rag' ? (
                          <RagDot value={val} />
                        ) : (
                          <>
                            {displayVal}
                            {truncatable && (
                              <button style={S.moreBtn} onClick={() => toggleCell(cellKey)}>
                                {isOpen ? 'less' : 'more'}
                              </button>
                            )}
                          </>
                        )}
                        <SupList
                          nums={fns}
                          getFirstId={n => firstId[n] === `fn-c-${ri}-${colId}-${n}` ? `fn-c-${ri}-${colId}-${n}` : undefined}
                          onClickNum={n => scrollTo(`fn-def-${n}`)}
                        />
                      </td>
                    );
                  })}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {usedNums.length > 0 && (
        <div style={S.fnWrap}>
          {usedNums.map(n => (
            <div key={n} id={`fn-def-${n}`} style={S.fnRow} onClick={() => scrollTo(firstId[n])}>
              <sup style={S.sup}>{n}</sup>{' '}{fnTexts[n] ?? ''}
            </div>
          ))}
        </div>
      )}

      <div style={S.version}>v{__APP_VERSION__} ({__GIT_HASH__})</div>

    </div>
  );
}
