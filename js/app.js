// ─── STATE ────────────────────────────────────────────────────────────────────
let fontFamily = 'Syne';
let fontSize   = 15;
let nodeScale  = 2;
let isDark     = false;
let zoomLevel  = 1;

// Display dimensions (on-screen canvas size)
const CANVAS_PRESETS = {
  auto:   null,
  a4p:    { w: 794,  h: 1123 },
  a4l:    { w: 1123, h: 794  },
  letter: { w: 816,  h: 1056 },
  hd:     { w: 1920, h: 1080 },
  hd720:  { w: 1280, h: 720  },
  sq:     { w: 1000, h: 1000 },
};

// Export dimensions — actual print/screen quality pixels
const EXPORT_PRESETS = {
  a4p:    { w: 2480, h: 3508 },   // A4 portrait  @ 300 DPI
  a4l:    { w: 3508, h: 2480 },   // A4 landscape @ 300 DPI
  letter: { w: 2550, h: 3300 },   // Letter       @ 300 DPI
  hd:     { w: 1920, h: 1080 },
  hd720:  { w: 1280, h: 720  },
  sq:     { w: 2000, h: 2000 },
};

// ─── FONT / SCALE CONTROLS ────────────────────────────────────────────────────
function updateFontSizeInput(v) {
  fontSize = Math.max(8, Math.min(72, parseInt(v) || 15));
  render();
}

function updateNodeScale(v) {
  nodeScale = parseFloat(v);
  document.getElementById('nodeScaleLabel').textContent = parseFloat(v).toFixed(1);
  render();
}

// ─── DARK MODE ────────────────────────────────────────────────────────────────
function toggleDark() {
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  document.getElementById('darkBtn').textContent = isDark ? '☀ Light' : '◑ Dark';
  resetColors();
}

// ─── SYMBOL INSERT ────────────────────────────────────────────────────────────
function insertSym(sym) {
  const ed = document.getElementById('editor');
  const start = ed.selectionStart, end = ed.selectionEnd;
  ed.value = ed.value.slice(0, start) + sym + ed.value.slice(end);
  ed.selectionStart = ed.selectionEnd = start + sym.length;
  ed.focus();
  render();
}

// ─── INDENT / OUTDENT ─────────────────────────────────────────────────────────
function indentLine(dir) {
  const ed = document.getElementById('editor');
  const start = ed.selectionStart;
  const val   = ed.value;
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  const lineEnd   = val.indexOf('\n', start);
  const line = val.slice(lineStart, lineEnd === -1 ? val.length : lineEnd);
  const newLine = dir === 1
    ? '  ' + line
    : line.startsWith('  ') ? line.slice(2) : line.startsWith(' ') ? line.slice(1) : line;
  const before = val.slice(0, lineStart);
  const after  = val.slice(lineEnd === -1 ? val.length : lineEnd);
  ed.value = before + newLine + after;
  ed.selectionStart = ed.selectionEnd = Math.max(lineStart, start + (newLine.length - line.length));
  ed.focus();
  render();
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  document.getElementById('spacingHLabel').textContent = document.getElementById('spacingH').value;
  document.getElementById('spacingVLabel').textContent = document.getElementById('spacingV').value;
  const tree = parseTree(document.getElementById('editor').value);
  if (!tree) return;
  drawTree(document.getElementById('treeCanvas'), tree);
  applyZoom();
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
function exportPNG() {
  const tree = parseTree(document.getElementById('editor').value);
  if (!tree) return;

  const presetKey = document.getElementById('canvasPreset').value;
  const exportPreset = EXPORT_PRESETS[presetKey] || null;

  // For preset: render at print-quality dims on offscreen canvas
  // For auto: export at 2x for sharpness
  const offscreen = document.createElement('canvas');
  if (exportPreset) {
    drawTree(offscreen, tree, exportPreset);
  } else {
    // Auto: render once to measure size, then re-render at 2x
    drawTree(offscreen, tree, null);
    const w2 = offscreen.width * 2, h2 = offscreen.height * 2;
    drawTree(offscreen, tree, { w: w2, h: h2 });
  }

  const link = document.createElement('a');
  link.download = 'tree-diagram.png';
  link.href = offscreen.toDataURL('image/png');
  link.click();
  showToast(`Exported ${offscreen.width}×${offscreen.height}px`);
}

function exportSVG() {
  showToast('Hint: Use PNG for best quality export');
}

// ─── ZOOM ─────────────────────────────────────────────────────────────────────
function zoom(delta) {
  zoomLevel = Math.max(0.1, Math.min(5, Math.round((zoomLevel + delta) * 100) / 100));
  applyZoom();
}

function fitToScreen() {
  const wrapper = document.getElementById('canvasWrapper');
  const canvas  = document.getElementById('treeCanvas');
  const pad = 60;
  const sx = (wrapper.clientWidth  - pad) / canvas.width;
  const sy = (wrapper.clientHeight - pad) / canvas.height;
  zoomLevel = Math.min(sx, sy, 1);
  applyZoom();
}

function applyZoom() {
  const canvas = document.getElementById('treeCanvas');
  canvas.style.width  = Math.round(canvas.width  * zoomLevel) + 'px';
  canvas.style.height = Math.round(canvas.height * zoomLevel) + 'px';
  document.getElementById('zoomLabel').textContent = Math.round(zoomLevel * 100) + '%';
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ─── RESIZE HANDLE ────────────────────────────────────────────────────────────
(function() {
  const handle = document.getElementById('resizeHandle');
  const pane   = document.getElementById('editorPane');
  let dragging = false, startX = 0, startW = 0;
  handle.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX;
    startW = pane.offsetWidth;
    document.body.style.cursor    = 'col-resize';
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    pane.style.width = Math.max(160, Math.min(600, startW + e.clientX - startX)) + 'px';
    render();
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.cursor    = '';
    document.body.style.userSelect = '';
  });
})();

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────
document.getElementById('editor').addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = this.selectionStart, end = this.selectionEnd;
    this.value = this.value.slice(0, start) + '  ' + this.value.slice(end);
    this.selectionStart = this.selectionEnd = start + 2;
    render();

  } else if (e.key === 'Enter') {
    e.preventDefault();
    const val = this.value;
    const pos  = this.selectionStart;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const lineText  = val.slice(lineStart, pos);
    const indent    = (lineText.match(/^(\s*)/) || ['', ''])[1];

    if (e.shiftKey) {
      const ins = '\n' + indent + '↵ ';
      this.value = val.slice(0, pos) + ins + val.slice(pos);
      this.selectionStart = this.selectionEnd = pos + ins.length;
    } else {
      const ins = '\n' + indent;
      this.value = val.slice(0, pos) + ins + val.slice(pos);
      this.selectionStart = this.selectionEnd = pos + ins.length;
    }
    render();
  }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  document.fonts.ready.then(render);
  setTimeout(render, 400);
});
