(function () {
  const local = ["127.0.0.1", "localhost"].includes(location.hostname);
  const drafts = new Map();
  const frames = new Map();
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const fields = ["annotations", "questions", "tabQuestions", "purpose", "ruleNotes", "ruleNotesTitle", "flow", "extraNotice", "logic", "pageType"];
  const signature = page => JSON.stringify(fields.map(field => [field, page[field] ?? null]));
  let current = null;
  let loading = null;
  let rendering = false;
  let observer = null;
  for (const requirement of window.PROTOTYPE_DATA.requirements) {
    const finalizedAt = window.PROTOTYPE_NOTE_RELEASES?.[requirement.id]?.finalizedAt;
    if (requirement.annotationEditing === true && finalizedAt) {
      const date = new Date(finalizedAt);
      if (!Number.isNaN(date.valueOf())) {
        const updatedAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        if (!requirement.updatedAt || updatedAt > requirement.updatedAt) requirement.updatedAt = updatedAt;
      }
    }
  }

  function serviceOrigin() {
    const configured = window.PROTOTYPE_NOTES_SERVICE || "http://127.0.0.1:4190";
    const url = new URL(configured);
    return url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname) ? url.origin : "http://127.0.0.1:4190";
  }
  function patchFor(frame, pages) { return pages?.[frame.scope] || { edits: {}, added: [], order: [], source: frame.source }; }
  function activePages(frame) { return drafts.get(frame.requirement.id) || window.PROTOTYPE_NOTE_RELEASES?.[frame.requirement.id]?.pages || {}; }
  function blockModel(frame, pages = activePages(frame)) {
    const patch = patchFor(frame, pages);
    const sources = [...frame.blocks, ...patch.added.map(block => ({ ...block, kind: "custom", id: "", type: "补充说明", templateText: "" }))];
    const ordered = [...new Set([...patch.order, ...sources.map(block => block.key)])];
    return sources.map(source => {
      const edit = patch.edits[source.key];
      const block = { ...source, ...(edit?.values || {}) };
      const conflicts = Object.entries(edit?.values || {}).filter(([field, value]) => field !== "deleted" && !equal(source[field] ?? (field === "rules" ? [] : ""), edit.base[field]) && !equal(source[field], value)).map(([field]) => field);
      return { ...block, source, conflicts, visible: source.kind !== "annotation" || frame.visibleIds.has(source.id) };
    }).sort((a, b) => ordered.indexOf(a.key) - ordered.indexOf(b.key));
  }
  function plainCard(block) {
    return `<article class="annotation-card notes-text-card" data-note-key="${escape(block.key)}"><div class="annotation-heading"><div><h3>${escape(block.name)}</h3></div></div>${block.summary ? `<p class="annotation-summary">${escape(block.summary)}</p>` : ""}${block.templateText ? `<pre class="annotation-template">${escape(block.templateText)}</pre>` : `<ul>${block.rules.map(rule => `<li>${escape(rule)}</li>`).join("")}</ul>`}</article>`;
  }
  function updateBadges() {
    if (!current) return;
    const deleted = new Set(blockModel(current).filter(block => block.deleted && block.id).map(block => block.id));
    document.querySelectorAll(".prototype-pane .component-badge, #modal-root .component-badge").forEach(badge => {
      const id = badge.closest("[data-component-id]")?.dataset.componentId || badge.textContent.trim();
      if (deleted.has(id)) badge.setAttribute("data-note-hidden", "true"); else badge.removeAttribute("data-note-hidden");
    });
  }
  function render(frame = current) {
    if (!frame || frame !== current || !frame.list.isConnected || rendering) return;
    rendering = true;
    const top = frame.scroll.scrollTop;
    try {
      const blocks = blockModel(frame).filter(block => !block.deleted && block.visible);
      frame.list.innerHTML = blocks.map(block => block.kind === "annotation"
        ? frame.renderCard({ ...block, _sourceName: block.source.name, _notesManaged: true })
        : plainCard(block)).join("") || '<p class="notes-empty">暂无说明</p>';
      frame.list.classList.remove("notes-edit-list");
      const heading = frame.scroll.querySelector(".spec-section-heading");
      if (heading) { heading.querySelector("h2").textContent = "页面说明"; heading.querySelector("span").textContent = `${blocks.length} 项`; }
      frame.scroll.scrollTop = top;
      frame.bindLinks();
      updateBadges();
    } finally { rendering = false; }
  }
  function captureNotices(scroll) {
    const selectors = ["comparison-spec-note", "questions-block", "page-note", "logic-note", "critical-note", "adjustment-note", "scope-spec-note", "export-standard-note"];
    const result = [];
    for (const className of selectors) {
      scroll.querySelectorAll(`.${className}`).forEach((node, index) => {
        if (node.querySelector("input,select,button")) return;
        const title = node.querySelector(".questions-title strong, h2, h3, :scope > span, :scope > strong")?.textContent.trim() || "页面提示";
        const rules = [...node.querySelectorAll("p,li")].filter(item => !item.parentElement.closest("li")).map(item => item.textContent.trim()).filter(Boolean);
        result.push({ key: `notice:${className}:${index}`, kind: "notice", id: "", name: title, summary: "", rules, templateText: "" });
        node.remove();
      });
    }
    return result;
  }
  function loadEditor(frame) {
    if (window.PrototypeNoteEditor) { window.PrototypeNoteEditor.mount(frame); return; }
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${serviceOrigin()}/notes-editor.js?v=1`;
        script.onload = resolve;
        script.onerror = () => { script.remove(); reject(new Error("本地保存服务尚未启动。双击 start-prototype-server.bat 后点击重试。")); };
        document.head.append(script);
      }).catch(error => { loading = null; throw error; });
    }
    frame.toolbar.innerHTML = '<span class="notes-status">正在连接本地编辑服务…</span>';
    loading.then(() => { if (current === frame) window.PrototypeNoteEditor.mount(frame); }).catch(error => {
      if (current !== frame) return;
      frame.toolbar.innerHTML = `<span class="notes-status notes-error">${escape(error.message)}</span><button type="button" data-notes-retry>重试</button>`;
      frame.toolbar.querySelector("button").onclick = () => loadEditor(frame);
    });
  }
  function mount(config) {
    if (rendering) return;
    if (config.requirement.annotationEditing !== true) {
      current = null; observer?.disconnect(); window.PrototypeNoteEditor?.leave(); return;
    }
    const list = document.querySelector(".spec-pane .annotation-list");
    if (!list) return;
    list.classList.add("notes-managed-list");
    const scope = `${config.page.key}::${config.tab || ""}`;
    if (current?.list === list && current.scope === scope) return;
    observer?.disconnect();
    const scroll = list.closest(".spec-scroll");
    const blocks = captureNotices(scroll).concat(config.annotations.map(annotation => ({
      ...clone(annotation), key: `annotation:${annotation.id}`, kind: "annotation", summary: annotation.summary || "", templateText: annotation.templateText || "", rules: annotation.rules || []
    })));
    const frame = { ...config, scope, source: signature(config.page), list, scroll, blocks, visibleIds: new Set(config.visibleAnnotations.map(item => item.id)) };
    current = frame;
    frames.set(`${config.requirement.id}/${scope}`, frame);
    render(frame);
    observer = new MutationObserver(updateBadges);
    for (const target of [document.querySelector(".prototype-pane"), document.querySelector("#modal-root")]) if (target) observer.observe(target, { childList: true, subtree: true });
    if (local) {
      document.querySelector(".notes-local-toolbar")?.remove();
      frame.toolbar = document.createElement("div");
      frame.toolbar.className = "notes-local-toolbar";
      document.querySelector(".spec-sticky-header").append(frame.toolbar);
      loadEditor(frame);
    }
  }
  window.PrototypeNotes = {
    mount, render, blockModel, patchFor, signature, clone, escape, equal, serviceOrigin,
    current: () => current,
    setDraft: (id, pages) => { drafts.set(id, pages); if (current?.requirement.id === id) updateBadges(); },
    released: id => clone(window.PROTOTYPE_NOTE_RELEASES?.[id]?.pages || {}),
    frames: id => [...frames.values()].filter(frame => frame.requirement.id === id)
  };
})();
