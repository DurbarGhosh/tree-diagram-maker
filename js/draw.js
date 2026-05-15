// ─── COLORS ───────────────────────────────────────────────────────────────────
function getColors() {
  const bg   = document.getElementById('colorBg').value;
  const node = document.getElementById('colorNode').value;
  const line = document.getElementById('colorLine').value;
  const text = document.getElementById('colorText').value;
  return { nodeBg: node, nodeBorder: line, nodeText: text, line: line, bg: bg };
}

function resetColors() {
  const defaults = isDark
    ? { colorBg: '#111410', colorNode: '#1e2418', colorLine: '#6ab855', colorText: '#e8ead4' }
    : { colorBg: '#f5f0e8', colorNode: '#ffffff', colorLine: '#2d5a27', colorText: '#1a1510' };
  for (const [id, val] of Object.entries(defaults)) {
    document.getElementById(id).value = val;
  }
  render();
}

// ─── DRAW TREE ────────────────────────────────────────────────────────────────
// customPreset: optional {w,h} override — used by exportPNG for print-quality dims
function drawTree(canvas, node, customPreset) {
  const style = document.getElementById('nodeStyle').value;
  const layout = document.getElementById('layoutSelect').value;
  const colors = getColors();
  const PAD = 32;

  fontFamily = document.getElementById('fontSelect').value;
  const fontWeight = document.getElementById('fontWeight').value;
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;

  // Header / subheader
  const title    = (document.getElementById('diagramTitle')?.value    || '').trim();
  const subtitle = (document.getElementById('diagramSubtitle')?.value || '').trim();
  const titleFs    = Math.round(fontSize * 1.8);
  const subtitleFs = Math.round(fontSize * 1.15);
  const titleH    = title    ? titleFs    * 1.5 : 0;
  const subtitleH = subtitle ? subtitleFs * 1.5 : 0;
  const headerH   = (title || subtitle) ? titleH + subtitleH + PAD * 0.5 : 0;

  if (layout === 'topdown') layoutTopDown(node, ctx);
  else layoutLeftRight(node, ctx);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function bounds(n) {
    minX = Math.min(minX, n.x - n.bw / 2);
    minY = Math.min(minY, n.y - n.bh / 2);
    maxX = Math.max(maxX, n.x + n.bw / 2);
    maxY = Math.max(maxY, n.y + n.bh / 2);
    n.children.forEach(bounds);
  }
  bounds(node);

  const treeW = maxX - minX + PAD * 2;
  const treeH = maxY - minY + PAD * 2 + headerH;

  const preset = customPreset !== undefined
    ? customPreset
    : (CANVAS_PRESETS[document.getElementById('canvasPreset').value] || null);

  if (preset) {
    canvas.width  = preset.w;
    canvas.height = preset.h;
  } else {
    canvas.width  = Math.max(treeW, 200);
    canvas.height = Math.max(treeH, 100);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (preset) {
    const fitScale = Math.min(preset.w / treeW, preset.h / treeH);
    const scaledW  = treeW * fitScale;
    const scaledH  = treeH * fitScale;
    ctx.save();
    ctx.translate((preset.w - scaledW) / 2, (preset.h - scaledH) / 2);
    ctx.scale(fitScale, fitScale);
  }

  // Draw header/subheader at top (in layout coordinate space)
  const centerX = treeW / 2;
  if (title) {
    ctx.font = `bold ${titleFs}px "${fontFamily}"`;
    ctx.fillStyle = colors.nodeText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, centerX, titleH / 2);
  }
  if (subtitle) {
    ctx.font = `${fontWeight} ${subtitleFs}px "${fontFamily}"`;
    ctx.fillStyle = colors.nodeText;
    ctx.globalAlpha = 0.55;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(subtitle, centerX, titleH + subtitleH / 2);
    ctx.globalAlpha = 1;
  }

  const ox = -minX + PAD;
  const oy = -minY + PAD + headerH;

  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;

  function drawEdges(n) {
    if (!n.children.length) return;
    const nx = n.x + ox, ny = n.y + oy;

    if (layout === 'topdown') {
      const startY = ny + n.bh / 2;
      const endY   = n.children[0].y + oy - n.children[0].bh / 2;
      const midY   = (startY + endY) / 2;

      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);

      if (n.children.length === 1) {
        ctx.beginPath();
        ctx.moveTo(nx, startY);
        ctx.lineTo(nx, endY);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(nx, startY);
        ctx.lineTo(nx, midY);
        ctx.stroke();
        const leftX  = n.children[0].x + ox;
        const rightX = n.children[n.children.length - 1].x + ox;
        ctx.beginPath();
        ctx.moveTo(leftX, midY);
        ctx.lineTo(rightX, midY);
        ctx.stroke();
        for (const c of n.children) {
          ctx.beginPath();
          ctx.moveTo(c.x + ox, midY);
          ctx.lineTo(c.x + ox, c.y + oy - c.bh / 2);
          ctx.stroke();
        }
      }
    } else {
      const startX = nx + n.bw / 2;
      const midX   = startX + (n.children[0].x + ox - n.children[0].bw / 2 - startX) / 2;

      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1.5;

      if (n.children.length === 1) {
        ctx.beginPath();
        ctx.moveTo(startX, ny);
        ctx.lineTo(n.children[0].x + ox - n.children[0].bw / 2, n.children[0].y + oy);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(startX, ny);
        ctx.lineTo(midX, ny);
        ctx.stroke();
        const topY    = n.children[0].y + oy;
        const bottomY = n.children[n.children.length - 1].y + oy;
        ctx.beginPath();
        ctx.moveTo(midX, topY);
        ctx.lineTo(midX, bottomY);
        ctx.stroke();
        for (const c of n.children) {
          ctx.beginPath();
          ctx.moveTo(midX, c.y + oy);
          ctx.lineTo(c.x + ox - c.bw / 2, c.y + oy);
          ctx.stroke();
        }
      }
    }

    n.children.forEach(drawEdges);
  }

  drawEdges(node);

  function drawNode(n) {
    const nx = n.x + ox, ny = n.y + oy;
    const bx = nx - n.bw / 2, by = ny - n.bh / 2;

    if (style !== 'none') {
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = colors.nodeBg;
      ctx.strokeStyle = colors.nodeBorder;
      ctx.lineWidth = 1.5;

      if (style === 'rounded') {
        roundRect(ctx, bx, by, n.bw, n.bh, 8);
      } else if (style === 'pill') {
        roundRect(ctx, bx, by, n.bw, n.bh, n.bh / 2);
      } else {
        ctx.beginPath();
        ctx.rect(bx, by, n.bw, n.bh);
      }
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    ctx.fillStyle = colors.nodeText;
    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = n._lines || n.label.split('\n');
    const lineH  = fontSize * 1.3;
    const totalH = lines.length * lineH;
    lines.forEach((line, i) => {
      ctx.fillText(line, nx, ny - totalH / 2 + lineH * i + lineH / 2);
    });

    n.children.forEach(drawNode);
  }

  drawNode(node);

  if (preset) ctx.restore();

  let count = 0;
  function countNodes(n) { count++; n.children.forEach(countNodes); }
  countNodes(node);
  document.getElementById('nodeCount').textContent = `${count} nodes`;
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
