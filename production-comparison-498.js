(function () {
  const local = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const release = window.PROTOTYPE_COMPARISONS_498 || { scopes: {} };
  const releasedScopes = release.scopes || release.pages || {};
  const header = { "X-Production-Comparison": "1" };
  let workspace = null;

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const hasContent = (entry) => Boolean(entry?.description?.trim() || entry?.screenshot?.path);
  const formatSize = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const scopeKeyOf = (pageKey, tabName = "") => tabName ? `${pageKey}::${tabName}` : pageKey;

  function serviceOrigin() {
    const configured = window.PROTOTYPE_NOTES_SERVICE || "http://127.0.0.1:4190";
    const url = new URL(configured);
    return url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname) ? url.origin : "http://127.0.0.1:4190";
  }

  async function request(path = "", options = {}) {
    const response = await fetch(`${serviceOrigin()}/api/production-comparison/498${path}`, {
      ...options,
      headers: { ...header, ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "生产对照资料操作失败。");
    return payload;
  }

  function button(pageKey, tabName = "") {
    const scopeKey = scopeKeyOf(pageKey, tabName);
    if (!local && !hasContent(releasedScopes[scopeKey])) return "";
    return `<button type="button" class="secondary-action production-comparison-498-button" data-production-comparison-498="${escapeHtml(scopeKey)}">生产对照</button>`;
  }

  function localImageUrl(path) {
    return path?.startsWith("/") ? `${serviceOrigin()}${path}` : path;
  }

  function readonlyBody(entry) {
    const screenshot = entry?.screenshot;
    return `<div class="production-comparison-498-modal is-readonly"><section class="production-comparison-498-image"><header><strong>生产对应页面</strong></header>${screenshot?.path ? `<figure><img src="${escapeHtml(screenshot.path)}" alt="${escapeHtml(screenshot.originalName || entry.pageName || "生产页面截图")}" /></figure>` : '<div class="production-comparison-498-empty">暂未提供生产页面截图</div>'}</section><section class="production-comparison-498-description"><header><strong>生产与原型差异</strong></header>${entry?.description?.trim() ? `<p>${escapeHtml(entry.description)}</p>` : '<div class="production-comparison-498-empty">暂无差异说明</div>'}</section></div>`;
  }

  function editorBody(scopeKey) {
    const entry = workspace.scopes[scopeKey];
    const screenshot = entry.screenshot;
    const finalized = workspace.finalizedRevision === workspace.revision;
    const tabContext = entry.tabName ? `<span>当前Tab</span><strong>${escapeHtml(entry.tabName)}</strong>` : "";
    return `<div class="production-comparison-498-modal" data-production-comparison-editor="${escapeHtml(scopeKey)}"><div class="production-comparison-498-context"><div><span>当前页面</span><strong>${escapeHtml(entry.pageName)}</strong>${tabContext}</div><span class="production-comparison-498-release-state ${finalized ? "is-finalized" : ""}">${finalized ? `只读版已生成 · ${escapeHtml(workspace.finalizedAt)}` : "存在未发布的本地内容"}</span></div><div class="production-comparison-498-grid"><section class="production-comparison-498-image"><header><div><strong>生产对应页面</strong><small>每个页面的每个三级Tab限1张，支持PNG、JPG、WEBP，最大10MB</small></div></header>${screenshot?.path ? `<figure><img src="${escapeHtml(localImageUrl(screenshot.path))}" alt="${escapeHtml(screenshot.originalName || entry.pageName)}" /></figure><div class="production-comparison-498-file"><span>${escapeHtml(screenshot.originalName || "生产页面截图")}</span><small>${formatSize(screenshot.size)}</small></div>` : '<div class="production-comparison-498-empty">上传生产中与当前功能对应的页面截图</div>'}<div class="production-comparison-498-image-actions"><label class="secondary-action">${screenshot ? "更换截图" : "上传截图"}<input type="file" data-production-comparison-upload accept="image/png,image/jpeg,image/webp" hidden /></label>${screenshot ? '<button type="button" class="link-action danger-link" data-production-comparison-delete>删除截图</button>' : ""}</div></section><section class="production-comparison-498-description"><header><div><strong>生产与原型差异</strong><small>只写生产已有、但当前原型缺少或处理不同的功能</small></div><span data-production-comparison-count>${entry.description.length}/5000</span></header><textarea maxlength="5000" data-production-comparison-description placeholder="例如：生产已有批量导出，本原型暂未包含；生产仅支持单条操作，本原型新增批量操作。">${escapeHtml(entry.description)}</textarea></section></div><p class="production-comparison-498-status" data-production-comparison-status></p></div>`;
  }

  function editorFooter() {
    return '<footer class="production-comparison-498-footer"><span>草稿仅保存在本机；生成只读版后才会进入可发布文件。</span><button type="button" class="secondary-action modal-cancel">取消</button><button type="button" class="secondary-action" data-production-comparison-finalize>生成只读版</button><button type="button" class="main-action" data-production-comparison-save>保存草稿</button></footer>';
  }

  function setStatus(message, error = false) {
    const element = document.querySelector("[data-production-comparison-status]");
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-error", error);
  }

  function setBusy(busy) {
    document.querySelectorAll("[data-production-comparison-save],[data-production-comparison-finalize],[data-production-comparison-delete],[data-production-comparison-upload],#modal-root .modal-cancel,#modal-root .modal-close").forEach((element) => { element.disabled = busy; });
  }

  function renderEditor(scopeKey, modal) {
    modal("生产页面对照", editorBody(scopeKey), "", editorFooter());
    bindEditor(scopeKey, modal);
  }

  async function saveDescription(scopeKey, { quiet = false } = {}) {
    const description = document.querySelector("[data-production-comparison-description]")?.value ?? workspace.scopes[scopeKey].description;
    const payload = await request("", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revision: workspace.revision, scopeKey, description })
    });
    workspace = payload.workspace;
    if (!quiet) setStatus("草稿已保存到本机。");
  }

  function bindEditor(scopeKey, modal) {
    const textarea = document.querySelector("[data-production-comparison-description]");
    textarea?.addEventListener("input", () => {
      const counter = document.querySelector("[data-production-comparison-count]");
      if (counter) counter.textContent = `${textarea.value.length}/5000`;
      setStatus("文字有修改，尚未保存。");
    });
    document.querySelector("[data-production-comparison-save]")?.addEventListener("click", async () => {
      setBusy(true);
      try { await saveDescription(scopeKey); }
      catch (error) { setStatus(error.message, true); }
      finally { setBusy(false); }
    });
    document.querySelector("[data-production-comparison-upload]")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return setStatus("仅支持PNG、JPG、JPEG或WEBP截图。", true);
      if (file.size > 10 * 1024 * 1024) return setStatus("截图不能超过10MB。", true);
      setBusy(true);
      try {
        await saveDescription(scopeKey, { quiet: true });
        const payload = await request(`/scopes/${encodeURIComponent(scopeKey)}/screenshot`, {
          method: "POST",
          headers: { "Content-Type": file.type, "X-Workspace-Revision": String(workspace.revision), "X-File-Name": encodeURIComponent(file.name) },
          body: file
        });
        workspace = payload.workspace;
        renderEditor(scopeKey, modal);
        setStatus("截图已上传并保存到本机。");
      } catch (error) {
        setStatus(error.message, true);
        setBusy(false);
      }
    });
    document.querySelector("[data-production-comparison-delete]")?.addEventListener("click", async () => {
      setBusy(true);
      try {
        await saveDescription(scopeKey, { quiet: true });
        const payload = await request(`/scopes/${encodeURIComponent(scopeKey)}/screenshot`, { method: "DELETE", headers: { "X-Workspace-Revision": String(workspace.revision) } });
        workspace = payload.workspace;
        renderEditor(scopeKey, modal);
        setStatus("截图已删除，文字说明已保留。");
      } catch (error) {
        setStatus(error.message, true);
        setBusy(false);
      }
    });
    document.querySelector("[data-production-comparison-finalize]")?.addEventListener("click", async () => {
      setBusy(true);
      try {
        await saveDescription(scopeKey, { quiet: true });
        const payload = await request("/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision: workspace.revision })
        });
        workspace = payload.workspace;
        renderEditor(scopeKey, modal);
        setStatus("只读版已生成。后续上传GitHub时会一并发布当前内容。");
      } catch (error) {
        setStatus(error.message, true);
        setBusy(false);
      }
    });
  }

  async function open(page, tabName, modal, trigger) {
    const scopeKey = scopeKeyOf(page.key, tabName);
    if (!local) {
      const entry = releasedScopes[scopeKey];
      if (hasContent(entry)) modal(`生产页面对照 · ${escapeHtml(entry.pageName || page.name)}${entry.tabName ? ` / ${escapeHtml(entry.tabName)}` : ""}`, readonlyBody(entry), "关闭");
      return;
    }
    trigger.disabled = true;
    try {
      const payload = await request();
      workspace = payload.workspace;
      renderEditor(scopeKey, modal);
    } catch (error) {
      modal("生产页面对照", `<div class="production-comparison-498-connect-error"><strong>本地编辑服务未连接</strong><p>${escapeHtml(error.message)}</p><small>请确认原型服务已启动：${escapeHtml(serviceOrigin())}</small></div>`, "关闭");
    } finally {
      trigger.disabled = false;
    }
  }

  function mount({ requirement, page, tabName = "", modal }) {
    if (requirement.id !== "#981") return;
    const trigger = document.querySelector("[data-production-comparison-498]");
    if (!trigger || trigger.dataset.bound) return;
    trigger.dataset.bound = "true";
    trigger.addEventListener("click", () => open(page, tabName, modal, trigger));
  }

  window.ProductionComparison498 = { button, mount };
})();
