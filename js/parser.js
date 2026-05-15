// ─── PARSE TREE ───────────────────────────────────────────────────────────────
function parseTree(text) {
  const rawLines = text.split('\n');
  if (!rawLines.length) return null;

  const nodes = [];
  for (const line of rawLines) {
    if (line.trim() === '') continue;
    const indent  = line.length - line.trimStart().length;
    const stripped = line.replace(/^[\s│├└─┌┐┘┤┬┴┼ ]*/, '').trim();
    if (stripped.startsWith('↵ ') || stripped === '↵') {
      if (nodes.length > 0) {
        nodes[nodes.length - 1].label += '\n' + stripped.slice(stripped === '↵' ? 1 : 2);
      }
      continue;
    }
    nodes.push({ label: stripped || line.trim(), indent, children: [] });
  }
  if (!nodes.length) return null;

  const indents = [...new Set(nodes.map(n => n.indent))].sort((a, b) => a - b);
  const idxOf = v => indents.indexOf(v);
  nodes.forEach(n => n.level = idxOf(n.indent));

  const root = { label: '__root__', level: -1, children: [] };
  const stack = [root];
  for (const node of nodes) {
    while (stack.length > 1 && stack[stack.length - 1].level >= node.level) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root.children.length === 1 ? root.children[0] : { label: '', level: -1, children: root.children };
}
