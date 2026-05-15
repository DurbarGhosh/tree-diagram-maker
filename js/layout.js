// ─── MEASURE TEXT (with word-wrap) ────────────────────────────────────────────
function measureText(ctx, label) {
  const weight = document.getElementById('fontWeight').value;
  ctx.font = `${weight} ${fontSize}px "${fontFamily}"`;
  const MAX_LINE_W = nodeScale * 130;

  const wrapped = [];
  for (const seg of label.split('\n')) {
    if (ctx.measureText(seg).width <= MAX_LINE_W) {
      wrapped.push(seg);
    } else {
      const words = seg.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width <= MAX_LINE_W) {
          line = test;
        } else {
          if (line) wrapped.push(line);
          line = word;
        }
      }
      if (line) wrapped.push(line);
    }
  }
  if (!wrapped.length) wrapped.push('');

  const w = Math.max(...wrapped.map(l => ctx.measureText(l).width));
  return { w, h: wrapped.length * fontSize * 1.4, lines: wrapped };
}

// ─── TOP-DOWN LAYOUT ──────────────────────────────────────────────────────────
function layoutTopDown(node, ctx) {
  const PAD_X = nodeScale * 8;
  const PAD_Y = nodeScale * 5;
  const GAP_X = parseInt(document.getElementById('spacingH').value);
  const GAP_Y = parseInt(document.getElementById('spacingV').value);

  function computeSize(n) {
    const m = measureText(ctx, n.label);
    n._lines = m.lines;
    n.bw = m.w + PAD_X * 2;
    n.bh = m.h + PAD_Y * 2;
    n.children.forEach(computeSize);
  }

  function placeRel(n, absY) {
    n.y = absY;
    n.relX = 0;

    if (!n.children.length) {
      n.lExt = n.bw / 2;
      n.rExt = n.bw / 2;
      return;
    }

    const ch = n.children;
    const childY = absY + n.bh / 2 + GAP_Y + Math.max(...ch.map(c => c.bh)) / 2;
    ch.forEach(c => placeRel(c, childY));

    ch[0].relX = 0;
    for (let i = 1; i < ch.length; i++) {
      const prev = ch[i - 1], cur = ch[i];
      const byBox = prev.relX + prev.bw / 2 + GAP_X + cur.bw / 2;
      const bySubtree = (prev.children.length && cur.children.length)
        ? prev.relX + prev.rExt + GAP_X + cur.lExt
        : -Infinity;
      ch[i].relX = Math.max(byBox, bySubtree);
    }

    const mid = (ch[0].relX + ch[ch.length - 1].relX) / 2;
    ch.forEach(c => c.relX -= mid);

    n.lExt = Math.max(n.bw / 2, -ch[0].relX + ch[0].lExt);
    n.rExt = Math.max(n.bw / 2,  ch[ch.length - 1].relX + ch[ch.length - 1].rExt);
  }

  function toAbsolute(n, parentAbsX) {
    n.x = parentAbsX + n.relX;
    n.children.forEach(c => toAbsolute(c, n.x));
  }

  computeSize(node);
  placeRel(node, 0);
  toAbsolute(node, 0);
}

// ─── LEFT-RIGHT LAYOUT ────────────────────────────────────────────────────────
function layoutLeftRight(node, ctx) {
  const PAD_X = nodeScale * 8;
  const PAD_Y = nodeScale * 5;
  const GAP_X = parseInt(document.getElementById('spacingH').value);
  const GAP_Y = parseInt(document.getElementById('spacingV').value);

  function computeSize(n) {
    const m = measureText(ctx, n.label);
    n._lines = m.lines;
    n.bw = m.w + PAD_X * 2;
    n.bh = m.h + PAD_Y * 2;
    n.children.forEach(computeSize);
  }

  function placeRel(n, absX) {
    n.x = absX;
    n.relY = 0;

    if (!n.children.length) {
      n.tExt = n.bh / 2;
      n.bExt = n.bh / 2;
      return;
    }

    const ch = n.children;
    const childX = absX + n.bw / 2 + GAP_X + Math.max(...ch.map(c => c.bw)) / 2;
    ch.forEach(c => placeRel(c, childX));

    ch[0].relY = 0;
    for (let i = 1; i < ch.length; i++) {
      const prev = ch[i - 1], cur = ch[i];
      const byBox = prev.relY + prev.bh / 2 + GAP_Y + cur.bh / 2;
      const bySubtree = (prev.children.length && cur.children.length)
        ? prev.relY + prev.bExt + GAP_Y + cur.tExt
        : -Infinity;
      ch[i].relY = Math.max(byBox, bySubtree);
    }

    const mid = (ch[0].relY + ch[ch.length - 1].relY) / 2;
    ch.forEach(c => c.relY -= mid);

    n.tExt = Math.max(n.bh / 2, -ch[0].relY + ch[0].tExt);
    n.bExt = Math.max(n.bh / 2,  ch[ch.length - 1].relY + ch[ch.length - 1].bExt);
  }

  function toAbsolute(n, parentAbsY) {
    n.y = parentAbsY + n.relY;
    n.children.forEach(c => toAbsolute(c, n.y));
  }

  computeSize(node);
  placeRel(node, 0);
  toAbsolute(node, 0);
}
