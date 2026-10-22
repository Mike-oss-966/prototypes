(function () {
  "use strict";

  const STORAGE = "prototype.exchange-control.1251.v1";
  const PAGE = "control-exchange-1251";
  const currencies = [
    { id: "currency-CNY", name: "人民币", code: "CNY", symbol: "¥", rate: 1, scale: 1 },
    { id: "currency-HKD", name: "港币", code: "HKD", symbol: "HK$", rate: 0.92, scale: 1 },
    { id: "currency-JPY", name: "日元", code: "JPY", symbol: "JP¥", rate: 0.047, scale: 100 },
    { id: "currency-THB", name: "泰铢", code: "THB", symbol: "฿", rate: 0.21, scale: 1 },
    { id: "currency-USD", name: "美元", code: "USD", symbol: "$", rate: 7.2, scale: 1 },
    { id: "currency-USDT", name: "泰达币", code: "USDT", symbol: "₮", rate: 7.2, scale: 1 },
    { id: "currency-KRW", name: "韩元", code: "KRW", symbol: "₩", rate: 0.0052, scale: 1000 },
    { id: "currency-VND", name: "越南盾", code: "VND", symbol: "₫", rate: 0.00028, scale: 1000 },
    { id: "currency-EUR", name: "欧元", code: "EUR", symbol: "€", rate: 7.8, scale: 1 },
    { id: "currency-GBP", name: "英镑", code: "GBP", symbol: "£", rate: 9.2, scale: 1 },
    { id: "currency-INR", name: "印度卢比", code: "INR", symbol: "₹", rate: 0.086, scale: 1 },
    { id: "currency-RUB", name: "俄罗斯卢布", code: "RUB", symbol: "₽", rate: 0.078, scale: 1 },
    { id: "currency-MYR", name: "马来西亚令吉", code: "MYR", symbol: "RM", rate: 1.62, scale: 1 },
    { id: "currency-KHR", name: "柬埔寨瑞尔", code: "KHR", symbol: "៛", rate: 0.0018, scale: 1000 }
  ];
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const number = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 8 });
  const rateValid = (value) => /^(?:0|[1-9]\d{0,5})(?:\.\d{1,8})?$/.test(String(value)) && Number(value) > 0;
  const scaleValid = (value) => /^\d{1,10}$/.test(String(value)) && Number(value) >= 1 && Number(value) <= 1000000000;
  const codeValid = (value) => /^[A-Z][A-Z0-9]{1,9}$/.test(String(value));
  const textValid = (value, max = 32) => String(value ?? "").trim().length > 0 && String(value ?? "").trim().length <= max;
  const now = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date());
  const href = () => `#requirement/%231251/page/${PAGE}`;
  const portals = ["site", "agent", "member"];
  let helpers, store = readStore(), query = "", statusFilter = "", notice = "";

  function readStore() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(STORAGE)); } catch (_) { saved = null; }
    const savedRows = Array.isArray(saved?.rows) ? saved.rows : [];
    const deletedIds = new Set([...(saved?.deletedIds || []), ...(saved?.deletedCodes || []).map((code) => `currency-${code}`)]);
    const usedSaved = new Set();
    const rows = currencies.reduce((result, base) => {
      const index = savedRows.findIndex((item) => item.id === base.id || (!item.id && item.code === base.code));
      const row = index >= 0 ? savedRows[index] : null;
      if (index >= 0) usedSaved.add(index);
      if (base.code !== "CNY" && deletedIds.has(base.id)) return result;
      result.push({ ...base, ...(row || {}), id: base.id, rate: base.code === "CNY" ? 1 : row && rateValid(row.rate) ? Number(row.rate) : base.rate,
        scale: row && scaleValid(row.scale) ? Number(row.scale) : base.scale,
        enabled: base.code === "CNY" || row?.enabled !== false,
        revision: Number.isInteger(row?.revision) ? row.revision : 0,
        updatedAt: row?.updatedAt || "", operator: row?.operator || "" });
      return result;
    }, []);
    savedRows.forEach((row, index) => {
      if (usedSaved.has(index) || !row?.id || !row.code || !codeValid(row.code) || deletedIds.has(row.id)) return;
      if (rows.some((item) => item.id === row.id || item.code === row.code)) return;
      rows.push({ ...row, rate: rateValid(row.rate) ? Number(row.rate) : 1, scale: scaleValid(row.scale) ? Number(row.scale) : 1,
        enabled: row.enabled !== false, revision: Number.isInteger(row.revision) ? row.revision : 0,
        updatedAt: row.updatedAt || "", operator: row.operator || "" });
    });
    return {
      rows,
      deletedIds: [...deletedIds],
      displayCurrencies: Object.fromEntries(portals.map((portal) => {
        const code = saved?.displayCurrencies?.[portal];
        return [portal, rows.some((row) => row.code === code && row.enabled) ? code : "CNY"];
      })),
      logs: Array.isArray(saved?.logs) ? saved.logs.filter((log) => Array.isArray(log.changes)) : []
    };
  }

  function annotated(id, html, tag = "div", classes = "") {
    return `<${tag} class="fx1251-annotated ${classes}" data-component-id="${id}">${helpers.badge(id)}${html}</${tag}>`;
  }

  function sidebar(requirement, page) {
    const items = ["站内信", "场馆管理"].map((name) => ({ name, disabled: true }));
    items.push({ key: page.key, name: page.name, href: href() });
    items.push(...["前端皮肤", "App版本管理", "短信通道管理", "区号配置", "短信发送记录", "二要素验证通道"].map((name) => ({ name, disabled: true })));
    return window.PrototypeUI.siteSidebar({ brandMark: "C", brandName: "总控后台管理系统", className: "fx1251-sidebar",
      activeKey: page.key, nav: [{ type: "group", name: page.menuGroup, icon: "system", items }],
      user: { account: "Mike", label: "总控管理员" } });
  }

  function render(page, api) {
    helpers = api;
    store = readStore();
    const rows = store.rows.filter((row) => row.code !== "CNY" && `${row.name} ${row.code} ${row.symbol}`.toLowerCase().includes(query.toLowerCase()) && (!statusFilter || row.enabled === (statusFilter === "enabled")));
    const cells = rows.map((row) => `<tr>
      <td>${esc(row.name)}</td><td class="fx1251-code">${row.code}</td><td class="fx1251-symbol">${esc(row.symbol)}</td>
      <td><span class="fx1251-rate">1 ${row.code} = <strong>${number(row.rate)}</strong> CNY</span>${row.code === "CNY" ? '<span class="fx1251-fixed">固定</span>' : ""}</td>
      <td><strong class="fx1251-scale">${number(row.scale)} 倍</strong><small class="fx1251-cell-help">${row.scale === 1 ? "原金额展示" : `100,000 → ${number(100000 / row.scale)}`}</small></td>
      <td><div class="fx1251-status"><button type="button" role="switch" aria-checked="${row.enabled}" aria-label="${esc(row.name)}启用状态" class="fx1251-switch${row.enabled ? " is-enabled" : ""}" data-fx1251-toggle="${row.code}"${row.code === "CNY" ? ' disabled title="人民币为默认币种，不可停用"' : ""}><span></span></button><span class="${row.enabled ? "fx1251-enabled" : "fx1251-disabled"}">${row.enabled ? "启用" : "停用"}</span></div></td>
      <td>${row.updatedAt ? `<span>${esc(row.updatedAt)}</span><small class="fx1251-cell-help">${esc(row.operator)}</small>` : '<span class="fx1251-muted">—</span>'}</td>
      <td><div class="fx1251-action-group"><button type="button" class="fx1251-link" data-fx1251-edit="${esc(row.id)}" aria-label="修改${esc(row.name)}">修改</button><button type="button" class="fx1251-link fx1251-delete-link" data-fx1251-delete="${esc(row.id)}"${row.code === "CNY" ? ' disabled title="人民币为默认币种，不可删除"' : ""}>删除</button></div></td>
    </tr>`).join("");
    return `<div class="fx1251-view">
      <section class="fx1251-card"><form class="fx1251-query" data-fx1251-query>
        <label>币种<input name="keyword" value="${esc(query)}" placeholder="币种中文 / 代码 / 符号" autocomplete="off" /></label>
        <label>状态<select name="status" aria-label="币种状态"><option value="">全部状态</option><option value="enabled"${statusFilter === "enabled" ? " selected" : ""}>启用</option><option value="disabled"${statusFilter === "disabled" ? " selected" : ""}>停用</option></select></label>
        <button type="submit" class="fx1251-button primary">查询</button><button type="button" class="fx1251-button" data-fx1251-reset>重置</button>
      </form></section>
      <section class="fx1251-card">
        <header class="fx1251-heading"><div class="fx1251-title"><h2>汇率控制</h2><span>汇率均以CNY为基准汇率</span></div><div class="fx1251-heading-actions">${annotated("B01", '<button type="button" class="fx1251-button" data-fx1251-logs>操作日志</button>', "div")}<button type="button" class="fx1251-button primary" data-fx1251-add>新增币种</button></div></header>
        ${notice ? `<div class="fx1251-notice" role="status">${esc(notice)}</div>` : ""}
        ${annotated("T01", `<div class="risk-table-wrap" data-page-scroll><table class="risk-table fx1251-table" data-preserve-currency><colgroup><col style="width:130px"><col style="width:95px"><col style="width:95px"><col style="width:205px"><col style="width:155px"><col style="width:110px"><col style="width:170px"><col style="width:116px"></colgroup><thead><tr><th>币种中文</th><th>币种代码</th><th>币种符号</th><th>对人民币汇率</th><th>精度收缩（倍）</th><th class="fx1251-annotated" data-component-id="C01">${helpers.badge("C01")}状态</th><th>最后修改</th><th>操作</th></tr></thead><tbody>${cells || '<tr><td colspan="8" class="fx1251-empty">暂无符合条件的币种</td></tr>'}</tbody></table></div>`)}
        <footer class="fx1251-list-footer">共 ${rows.length} 种币种<span>展示金额 = 原金额 ÷ 收缩倍数</span></footer>
      </section>
    </div>`;
  }

  function dialog(title, body, footer, className, width) {
    helpers.modal(title, body, "", footer);
    const root = document.getElementById("modal-root");
    root.classList.add("production-admin-ui-488", "fx1251-modal-root");
    const pane = document.querySelector(".prototype-pane").getBoundingClientRect();
    root.querySelector(".modal-backdrop").style.right = `${Math.max(0, innerWidth - pane.right)}px`;
    const box = root.querySelector(".risk-modal");
    box.classList.add("fx1251-dialog", className);
    box.style.width = `${width}px`;
    helpers.bindLinks();
    return root;
  }

  function showError(form, message, name) {
    const error = form.querySelector("[data-fx1251-error]");
    error.textContent = message; error.hidden = false;
    if (name) form.elements.namedItem(name)?.focus();
  }

  function saveChanges(snapshot, values, remark) {
    const latest = readStore(), current = latest.rows.find((item) => item.id === snapshot.id || item.code === snapshot.code);
    if (!current) return { error: "该币种已不存在，请刷新页面后重试。" };
    if (current.revision !== snapshot.revision) return { error: "该币种配置已被其他窗口修改，请关闭弹窗后刷新页面再试。" };
    if (current.code === "CNY" && values.enabled === false) return { error: "人民币为默认兜底币种，不可停用。" };
    if (current.code === "CNY" && values.code && values.code !== "CNY") return { error: "人民币币种代码固定为 CNY。" };
    if (values.code && latest.rows.some((item) => item.id !== current.id && item.code === values.code)) return { error: "币种代码已存在，请更换后再保存。" };
    const names = { name: "币种中文", code: "币种代码", symbol: "币种符号", rate: "对人民币汇率", scale: "精度收缩", enabled: "状态" };
    const changes = Object.entries(values).filter(([key, value]) => current[key] !== value).map(([key, value]) => ({ field: key, name: names[key], before: current[key], after: value }));
    if (!changes.length) return { changed: false };
    const time = now();
    const previousCode = current.code;
    Object.assign(current, values, { revision: current.revision + 1, updatedAt: time, operator: "Mike" });
    if (previousCode !== current.code) portals.forEach((portal) => {
      if (latest.displayCurrencies[portal] === previousCode) latest.displayCurrencies[portal] = current.enabled ? current.code : "CNY";
    });
    if (!current.enabled) portals.forEach((portal) => {
      if (latest.displayCurrencies[portal] === current.code) latest.displayCurrencies[portal] = "CNY";
    });
    latest.logs.unshift({ id: `fx-${Date.now()}-${current.revision}`, currencyId: current.id, code: current.code, previousCode, name: current.name, time, operator: "Mike", remark, changes });
    try { localStorage.setItem(STORAGE, JSON.stringify(latest)); } catch (_) { return { error: "保存失败，请检查浏览器本地存储后重试。本次修改未生效。" }; }
    store = latest;
    return { changed: true };
  }

  function addCurrency() {
    const formId = "fx1251-add-form";
    const body = annotated("M04", `<form id="${formId}" class="fx1251-form" novalidate>
      <div class="fx1251-state-message">新增后默认启用，代理端、站点端和会员端可选择此币种。</div>
      <label class="fx1251-field"><span>币种中文 <b>*</b></span><input name="name" maxlength="32" placeholder="请输入币种中文名称" autocomplete="off" /></label>
      <label class="fx1251-field"><span>币种代码 <b>*</b></span><input name="code" maxlength="10" placeholder="例如 USD" autocomplete="off" /><small>使用 2 至 10 位大写英文字母或数字，保存后可修改。</small></label>
      <label class="fx1251-field"><span>币种符号 <b>*</b></span><input name="symbol" maxlength="8" placeholder="例如 $、€、៛" autocomplete="off" /></label>
      <label class="fx1251-field"><span>对人民币汇率 <b>*</b></span><div class="fx1251-input-unit"><span>1 <span data-fx1251-code-preview>币种代码</span> =</span><input aria-label="对人民币汇率" name="rate" inputmode="decimal" autocomplete="off" placeholder="请输入汇率" maxlength="15" /><span>CNY</span></div><small>大于 0，最多 6 位整数和 8 位小数</small></label>
      <label class="fx1251-field"><span>精度收缩 <b>*</b></span><div class="fx1251-input-unit"><span>原金额 ÷</span><input aria-label="精度收缩倍数" name="scale" inputmode="numeric" autocomplete="off" placeholder="请输入收缩倍数" maxlength="10" /><span>倍</span></div><small>填写 1 不收缩；仅支持 1 至 1,000,000,000 的整数</small></label>
      <label class="fx1251-field"><span>备注</span><textarea name="remark" rows="2" maxlength="200" placeholder="选填，最多 200 字"></textarea></label>
      <p class="fx1251-form-error" data-fx1251-error role="alert" hidden></p>
    </form>`);
    const root = dialog("新增币种", body, `<footer><button type="button" class="fx1251-button modal-cancel">取消</button><button type="submit" form="${formId}" class="fx1251-button primary">保存</button></footer>`, "fx1251-add-dialog", 560);
    const form = root.querySelector("form");
    const codePreview = form.querySelector("[data-fx1251-code-preview]");
    form.elements.code.addEventListener("input", () => {
      form.elements.code.value = form.elements.code.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      codePreview.textContent = form.elements.code.value || "币种代码";
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim(), code = form.elements.code.value.trim().toUpperCase(), symbol = form.elements.symbol.value.trim();
      const rateText = form.elements.rate.value.trim(), scaleText = form.elements.scale.value.trim(), remark = form.elements.remark.value.trim();
      if (!textValid(name)) return showError(form, "请输入币种中文名称，最多 32 个字符。", "name");
      if (!codeValid(code)) return showError(form, "币种代码须为 2 至 10 位大写英文字母或数字，且首位必须是字母。", "code");
      if (store.rows.some((row) => row.code === code)) return showError(form, "币种代码已存在，请更换后再保存。", "code");
      if (!textValid(symbol, 8)) return showError(form, "请输入币种符号，最多 8 个字符。", "symbol");
      if (!rateValid(rateText)) return showError(form, "汇率必须大于 0，最多 6 位整数和 8 位小数。", "rate");
      if (!scaleValid(scaleText)) return showError(form, "收缩倍数须为 1 至 1,000,000,000 的整数。", "scale");
      if (remark.length > 200) return showError(form, "备注最多 200 字。", "remark");
      const latest = readStore(), time = now(), row = { id: `currency-custom-${Date.now()}`, name, code, symbol, rate: Number(rateText), scale: Number(scaleText), enabled: true, revision: 0, updatedAt: time, operator: "Mike" };
      latest.rows.push(row);
      latest.logs.unshift({ id: `fx-${Date.now()}-create`, currencyId: row.id, code: row.code, name: row.name, time, operator: "Mike", remark, changes: [{ field: "created", name: "新增币种", before: "—", after: `${row.name}（${row.code} / ${row.symbol}）` }] });
      try { localStorage.setItem(STORAGE, JSON.stringify(latest)); } catch (_) { return showError(form, "保存失败，请检查浏览器本地存储后重试。本次修改未生效。"); }
      root.innerHTML = ""; store = latest; notice = `${row.name}已新增。`; helpers.rerender();
    });
  }

  function deleteCurrency(id) {
    const row = store.rows.find((item) => item.id === id);
    if (!row || row.code === "CNY") return;
    const formId = "fx1251-delete-form";
    const body = annotated("M05", `<form id="${formId}" class="fx1251-form">
      <div class="fx1251-currency-header"><strong>${esc(row.name)}</strong><span>${esc(row.code)}</span><span>${esc(row.symbol)}</span></div>
      <div class="fx1251-state-message">删除后该币种不再出现在汇率控制列表及各端新选择列表中，已有账本、订单和历史记录仍保留原币种标识。</div>
      <label class="fx1251-field"><span>删除备注</span><textarea name="remark" rows="2" maxlength="200" placeholder="选填，最多 200 字"></textarea></label>
      <p class="fx1251-form-error" data-fx1251-error role="alert" hidden></p>
    </form>`);
    const root = dialog(`删除${esc(row.name)}`, body, `<footer><button type="button" class="fx1251-button modal-cancel">取消</button><button type="submit" form="${formId}" class="fx1251-button danger">确认删除</button></footer>`, "fx1251-delete-dialog", 500);
    const form = root.querySelector("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const latest = readStore(), current = latest.rows.find((item) => item.id === id), remark = form.elements.remark.value.trim();
      if (!current) return showError(form, "该币种已不存在，请关闭弹窗后刷新页面。");
      if (remark.length > 200) return showError(form, "备注最多 200 字。", "remark");
      latest.rows = latest.rows.filter((item) => item.id !== id);
      latest.deletedIds = [...new Set([...(latest.deletedIds || []), id])];
      portals.forEach((portal) => { if (latest.displayCurrencies[portal] === current.code) latest.displayCurrencies[portal] = "CNY"; });
      latest.logs.unshift({ id: `fx-${Date.now()}-delete`, currencyId: id, code: current.code, name: current.name, time: now(), operator: "Mike", remark, changes: [{ field: "deleted", name: "删除币种", before: `${current.name}（${current.code} / ${current.symbol}）`, after: "已删除" }] });
      try { localStorage.setItem(STORAGE, JSON.stringify(latest)); } catch (_) { return showError(form, "保存失败，请检查浏览器本地存储后重试。本次修改未生效。"); }
      root.innerHTML = ""; store = latest; notice = `${current.name}已删除。历史账务数据不受影响。`; helpers.rerender();
    });
  }

  function toggleCurrency(code) {
    const row = store.rows.find((item) => item.code === code);
    if (!row || code === "CNY") return;
    const snapshot = { ...row }, enabled = !row.enabled, action = enabled ? "启用" : "停用";
    const formId = "fx1251-state-form";
    const body = annotated("M03", `<form id="${formId}" class="fx1251-form">
      <div class="fx1251-currency-header"><strong>${esc(row.name)}</strong><span>${row.code}</span></div>
      <div class="fx1251-state-message">${enabled
        ? "启用后，代理端、站点端和会员端的币种切换可以选择此币种。当前展示币种保持不变，由用户自行选择切换。"
        : "停用后，代理端、站点端和会员端的币种切换选项隐藏此币种；当前展示或筛选使用此币种的，自动回到人民币。总控继续保留全部币种用于管理和查看。"}</div>
      ${enabled ? "" : '<p class="fx1251-state-note">站点实际支付币种、账本、钱包、订单及已有结算保持原币；历史记录继续保留原币标识。</p>'}
      <label class="fx1251-field"><span>备注</span><textarea name="remark" rows="2" maxlength="200" placeholder="选填，最多 200 字"></textarea></label>
      <p class="fx1251-form-error" data-fx1251-error role="alert" hidden></p>
    </form>`);
    const root = dialog(`${action}${esc(row.name)}`, body, `<footer><button type="button" class="fx1251-button modal-cancel">取消</button><button type="submit" form="${formId}" class="fx1251-button${enabled ? " primary" : " danger"}">确认${action}</button></footer>`, "fx1251-state-dialog", 500);
    const form = root.querySelector("form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const remark = form.elements.remark.value.trim();
      if (remark.length > 200) return showError(form, "备注最多 200 字。", "remark");
      const result = saveChanges(snapshot, { enabled }, remark);
      if (result.error) return showError(form, result.error);
      root.innerHTML = "";
      notice = `${row.name}已${action}。${enabled ? "" : "代理、站点和会员端展示与筛选回到人民币，原币账务保留。"}`;
      helpers.rerender();
    });
  }

  function editCurrency(id) {
    const row = store.rows.find((item) => item.id === id);
    if (!row) return;
    const snapshot = { ...row };
    const formId = "fx1251-edit-form";
    const body = annotated("M01", `<form id="${formId}" class="fx1251-form" novalidate>
      <div class="fx1251-currency-header"><strong data-fx1251-title>${esc(row.name)}</strong><span data-fx1251-code>${esc(row.code)}</span><span data-fx1251-symbol>${esc(row.symbol)}</span></div>
      <label class="fx1251-field"><span>币种中文 <b>*</b></span><input name="name" maxlength="32" value="${esc(row.name)}" autocomplete="off" /></label>
      <label class="fx1251-field"><span>币种代码 <b>*</b></span><input name="code" maxlength="10" value="${esc(row.code)}" autocomplete="off"${row.code === "CNY" ? ' readonly aria-readonly="true"' : ""} /><small>${row.code === "CNY" ? "人民币的币种代码固定为 CNY" : "2 至 10 位大写英文字母或数字，首位必须是字母"}</small></label>
      <label class="fx1251-field"><span>币种符号 <b>*</b></span><input name="symbol" maxlength="8" value="${esc(row.symbol)}" autocomplete="off" /></label>
      <label class="fx1251-field"><span>对人民币汇率 <b>*</b></span><div class="fx1251-input-unit"><span>1 <span data-fx1251-rate-code>${esc(row.code)}</span> =</span><input aria-label="对人民币汇率" name="rate" inputmode="decimal" autocomplete="off" value="${row.rate}" maxlength="15"${row.code === "CNY" ? ' readonly aria-readonly="true"' : ""} /><span>CNY</span></div><small>${row.code === "CNY" ? "人民币对自身汇率固定为 1" : "大于 0，最多 8 位小数"}</small></label>
      <label class="fx1251-field"><span>精度收缩 <b>*</b></span><div class="fx1251-input-unit"><span>原金额 ÷</span><input aria-label="精度收缩倍数" name="scale" inputmode="numeric" autocomplete="off" value="${row.scale}" maxlength="10" /><span>倍</span></div><small>填 1 不收缩；填写 1 至 1,000,000,000 的整数</small></label>
      <div class="fx1251-preview" aria-live="polite" data-fx1251-preview></div>
      <label class="fx1251-field"><span>备注</span><textarea name="remark" rows="2" maxlength="200" placeholder="选填，最多 200 字"></textarea></label>
      <p class="fx1251-form-error" data-fx1251-error role="alert" hidden></p>
    </form>`);
    const root = dialog(`修改${esc(row.name)}`, body, `<footer><button type="button" class="fx1251-button modal-cancel">取消</button><button type="submit" form="${formId}" class="fx1251-button primary">保存并生效</button></footer>`, "fx1251-edit-dialog", 560);
    const form = root.querySelector("form");
    const updatePreview = () => {
      const code = form.elements.code.value.trim().toUpperCase() || row.code, rate = form.elements.rate.value.trim(), scale = form.elements.scale.value.trim();
      form.querySelector("[data-fx1251-title]").textContent = form.elements.name.value.trim() || row.name;
      form.querySelector("[data-fx1251-code]").textContent = code;
      form.querySelector("[data-fx1251-symbol]").textContent = form.elements.symbol.value.trim() || row.symbol;
      form.querySelector("[data-fx1251-rate-code]").textContent = code;
      const preview = form.querySelector("[data-fx1251-preview]");
      if (!rateValid(rate) || !scaleValid(scale)) { preview.innerHTML = '<span class="fx1251-muted">填写有效汇率和收缩倍数后显示换算示例</span>'; return; }
      preview.innerHTML = `<div><span>人民币换算</span><strong>100,000 ${esc(code)} = ${number(100000 * Number(rate))} CNY</strong></div><div><span>各端金额展示</span><strong>100,000 ${esc(code)} → ${number(100000 / Number(scale))} ${esc(code)}${Number(scale) === 1 ? "" : `（÷${number(scale)}）`}</strong></div><div><span>输入还原示例</span><strong>输入 100 ${esc(code)} → 原金额 ${number(100 * Number(scale))} ${esc(code)}</strong></div>`;
    };
    form.elements.code.addEventListener("input", () => { form.elements.code.value = form.elements.code.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });
    form.addEventListener("input", updatePreview); updatePreview();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim(), code = form.elements.code.value.trim().toUpperCase(), symbol = form.elements.symbol.value.trim();
      const rateText = form.elements.rate.value.trim(), scaleText = form.elements.scale.value.trim(), remark = form.elements.remark.value.trim();
      if (!textValid(name)) return showError(form, "请输入币种中文名称，最多 32 个字符。", "name");
      if (!codeValid(code)) return showError(form, "币种代码须为 2 至 10 位大写英文字母或数字，且首位必须是字母。", "code");
      if (!rateValid(rateText)) return showError(form, "汇率必须大于 0，最多 6 位整数和 8 位小数，不支持科学计数法。", "rate");
      if (row.code === "CNY" && Number(rateText) !== 1) return showError(form, "人民币对自身汇率固定为 1。", "rate");
      if (!scaleValid(scaleText)) return showError(form, "收缩倍数须为 1 至 1,000,000,000 的整数。", "scale");
      if (!textValid(symbol, 8)) return showError(form, "请输入币种符号，最多 8 个字符。", "symbol");
      if (remark.length > 200) return showError(form, "备注最多 200 字。", "remark");
      const result = saveChanges(snapshot, { name, code, symbol, rate: Number(rateText), scale: Number(scaleText) }, remark);
      if (result.error) return showError(form, result.error);
      root.innerHTML = ""; notice = result.changed ? `${name}配置已更新。` : "配置未变化，无需保存。"; helpers.rerender();
    });
  }

  function openLogs() {
    const logCurrencies = [...new Map([...store.rows, ...store.logs.map((log) => ({ name: log.name, code: log.code }))].filter((row) => row.code).map((row) => [row.code, row])).values()];
    const body = annotated("M02", `<div class="fx1251-logs"><form class="fx1251-log-query" data-fx1251-log-query>
      <label>币种<select name="currency" aria-label="日志币种"><option value="">全部币种</option>${logCurrencies.map((row) => `<option value="${esc(row.code)}">${esc(row.name)}（${esc(row.code)}）</option>`).join("")}</select></label>
      <label>修改项<select name="field" aria-label="日志修改项"><option value="">全部修改项</option><option value="created">新增币种</option><option value="deleted">删除币种</option><option value="name">币种中文</option><option value="code">币种代码</option><option value="symbol">币种符号</option><option value="rate">对人民币汇率</option><option value="scale">精度收缩</option><option value="enabled">状态</option></select></label>
      <label>操作人<input name="operator" aria-label="日志操作人" placeholder="请输入操作人" /></label>
      <button type="submit" class="fx1251-button primary">查询</button><button type="reset" class="fx1251-button">重置</button>
    </form><div class="risk-table-wrap" data-page-scroll><table class="risk-table fx1251-log-table" data-preserve-currency><thead><tr><th>操作时间</th><th>币种</th><th>修改项</th><th>修改前</th><th>修改后</th><th>操作人</th><th>备注</th></tr></thead><tbody data-fx1251-log-rows></tbody></table></div><div class="fx1251-log-footer" data-fx1251-log-footer></div></div>`);
    const root = dialog("汇率控制操作日志", body, '<footer><button type="button" class="fx1251-button modal-cancel">关闭</button></footer>', "fx1251-log-dialog", 1060);
    const form = root.querySelector("form");
    let page = 1, size = 20, filters = { currency: "", field: "", operator: "" };
    const update = () => {
      const all = store.logs.filter((log) => (!filters.currency || log.code === filters.currency || log.previousCode === filters.currency) && (!filters.field || log.changes.some((c) => c.field === filters.field)) && log.operator.toLowerCase().includes(filters.operator.toLowerCase()));
      const count = Math.max(1, Math.ceil(all.length / size)); page = Math.min(page, count);
      root.querySelector("[data-fx1251-log-rows]").innerHTML = all.slice((page - 1) * size, page * size).map((log) => {
        const value = (change, key) => change.field === "enabled" ? (change[key] ? "启用" : "停用") : change.field === "scale" ? `${number(change[key])} 倍` : change.field === "rate" ? `1 ${log.code} = ${number(change[key])} CNY` : String(change[key] ?? "—");
        return `<tr><td>${esc(log.time)}</td><td>${esc(log.name)}<small class="fx1251-cell-help">${log.code}</small></td><td>${log.changes.map((c) => `<div class="fx1251-log-line">${esc(c.name)}</div>`).join("")}</td><td>${log.changes.map((c) => `<div class="fx1251-log-line">${value(c, "before")}</div>`).join("")}</td><td>${log.changes.map((c) => `<div class="fx1251-log-line">${value(c, "after")}</div>`).join("")}</td><td>${esc(log.operator)}</td><td class="fx1251-log-remark">${esc(log.remark || "—")}</td></tr>`;
      }).join("") || '<tr><td colspan="7" class="fx1251-empty">暂无操作日志</td></tr>';
      root.querySelector("[data-fx1251-log-footer]").innerHTML = `<span>共 ${all.length} 条</span><select aria-label="日志每页条数" data-fx1251-log-size>${[10, 20, 50, 100, 200].map((n) => `<option value="${n}"${size === n ? " selected" : ""}>${n} 条/页</option>`).join("")}</select><button type="button" class="fx1251-button" data-fx1251-prev${page === 1 ? " disabled" : ""}>上一页</button><span>${page} / ${count}</span><button type="button" class="fx1251-button" data-fx1251-next${page === count ? " disabled" : ""}>下一页</button>`;
      root.querySelector("[data-fx1251-prev]").onclick = () => { page--; update(); };
      root.querySelector("[data-fx1251-next]").onclick = () => { page++; update(); };
      root.querySelector("[data-fx1251-log-size]").onchange = (event) => { size = Number(event.target.value); page = 1; update(); };
    };
    form.addEventListener("submit", (event) => { event.preventDefault(); filters = { currency: form.elements.currency.value, field: form.elements.field.value, operator: form.elements.operator.value.trim() }; page = 1; update(); });
    form.addEventListener("reset", () => { filters = { currency: "", field: "", operator: "" }; page = 1; update(); });
    update();
  }

  function bind() {
    document.querySelector("[data-fx1251-query]")?.addEventListener("submit", (event) => { event.preventDefault(); query = event.target.elements.keyword.value.trim(); statusFilter = event.target.elements.status.value; notice = ""; helpers.rerender(); });
    document.querySelector("[data-fx1251-reset]")?.addEventListener("click", () => { query = ""; statusFilter = ""; notice = ""; helpers.rerender(); });
    document.querySelectorAll("[data-fx1251-edit]").forEach((button) => button.addEventListener("click", () => editCurrency(button.dataset.fx1251Edit)));
    document.querySelectorAll("[data-fx1251-delete]").forEach((button) => button.addEventListener("click", () => deleteCurrency(button.dataset.fx1251Delete)));
    document.querySelectorAll("[data-fx1251-toggle]").forEach((button) => button.addEventListener("click", () => toggleCurrency(button.dataset.fx1251Toggle)));
    document.querySelector("[data-fx1251-add]")?.addEventListener("click", addCurrency);
    document.querySelector("[data-fx1251-logs]")?.addEventListener("click", openLogs);
  }

  const resolveDisplayCurrency = (code) => readStore().rows.some((row) => row.code === code && row.enabled) ? code : "CNY";
  function selectDisplayCurrency(portal, code) {
    if (!portals.includes(portal)) return "CNY";
    const latest = readStore(), resolved = resolveDisplayCurrency(code);
    latest.displayCurrencies[portal] = resolved;
    localStorage.setItem(STORAGE, JSON.stringify(latest));
    return resolved;
  }
  window.Exchange1251 = { render, sidebar, bind,
    getCurrencies: () => readStore().rows.map((row) => ({ ...row })),
    getAvailableCurrencies: () => readStore().rows.filter((row) => row.enabled).map((row) => ({ ...row })),
    resolveDisplayCurrency, selectDisplayCurrency,
    getDisplayCurrency: (portal) => readStore().displayCurrencies[portal] || "CNY"
  };
})();
