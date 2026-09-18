(function () {
  const pad = (value) => String(value).padStart(2, "0");
  const dateText = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const today = dateText(new Date());
  const defaults = () => ({ start: `${today} 00:00:00`, end: `${today} 23:59:59` });
  const state = Object.fromEntries(["agent", "site", "control"].map((portal) => [portal, { ...defaults(), draft: defaults(), sites: null, agent: "", draftAgent: "", kind: "deposit", page: 1, size: 20, menuOpen: true }]));
  const money = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  // Supported pay_type labels; actual channel instances are configured in the production database.
  const channels = {
    deposit: ["代理代存", "支付宝", "微信", "银行卡", "USDT", "EBPay", "TronPay", "EZT", "钱能钱包"],
    withdraw: ["支付宝", "微信", "银行卡", "USDT", "EBPay", "TronPay", "钱能钱包"]
  };
  let helpers;
  let activePortal = "agent";
  let activeTab = "返佣方案";
  const agentOptions = [["agent_mike", "AG10086"], ["subline_a", "AG10201"], ["agent_north", "AG10318"], ["agent_south", "AG10426"]];

  function rows(kind, portal) {
    const range = state[portal];
    const names = kind === "venue" ? window.PROTOTYPE_VENUE_GAMES.map((venue) => venue.name) : channels[kind];
    const sites = portal === "control" ? range.sites : [helpers.sites[0]];
    if (!sites.length) return [];
    return names.map((name, index) => {
      const rate = kind === "venue" ? [8, 10, 6, 5][index % 4] : [0.6, 1.2, 0.8, 1][index % 4];
      let base = 0;
      let fee = 0;
      let enabled = false;
      const rates = [];
      sites.forEach((site) => {
        const siteIndex = helpers.sites.indexOf(site);
        const siteEnabled = !(siteIndex === 1 && index % 6 === 0);
        const siteRate = round(rate + siteIndex * (kind === "venue" ? 0.5 : 0.1));
        let siteBase = 0;
        let siteFee = 0;
        enabled ||= siteEnabled;
        [0, -1, -6].forEach((offset) => {
          if (!siteEnabled && offset !== -1) return;
          const date = new Date(`${today}T12:00:00`);
          date.setDate(date.getDate() + offset);
          const time = `${dateText(date)} 12:00:00`;
          if ((range.start && time < range.start) || (range.end && time > range.end)) return;
          const amount = index % 8 === 3 ? 0 : kind === "venue" && index % 9 === 4 ? -12400 : 18000 + index * 1300;
        const scale = portal === "agent" ? 1 : range.agent ? 1.6 : 3 + siteIndex;
          const value = round(amount * scale * (offset === 0 ? 1 : offset === -1 ? 0.6 : 0.4));
          const feeValue = round(Math.max(value, 0) * siteRate / 100);
          base += value;
          fee += feeValue;
          siteBase += value;
          siteFee += feeValue;
        });
        rates.push({ site, rate: siteRate, base: round(siteBase), fee: round(siteFee) });
      });
      // Keep one visible old/new-rate example on the agent and site pages.
      // The real system gets these two records from the fee history.
      const exactScope = portal !== "control" || Boolean(range.agent) || range.sites?.length === 1;
      if (exactScope && index === 0 && rates.length === 1) {
        const current = rates[0];
        const oldBase = round(current.base * 0.4);
        const currentBase = round(current.base - oldBase);
        const oldRate = round(current.rate - (kind === "venue" ? 0.5 : 0.1));
        const oldFee = round(Math.max(oldBase, 0) * oldRate / 100);
        const currentFee = round(Math.max(currentBase, 0) * current.rate / 100);
        fee = round(fee - current.fee + oldFee + currentFee);
        rates.splice(0, 1, { ...current, period: "旧费率", rate: oldRate, base: oldBase, fee: oldFee }, { ...current, period: "当前费率", base: currentBase, fee: currentFee });
      }
      return { name, base: round(base), rate: rates[0].rate, rates, fee: round(fee), enabled, agent: agentOptions[index % agentOptions.length][0] };
    }).filter((row) => (row.enabled || row.fee !== 0) && (!range.agent || row.agent === range.agent));
  }
  const total = (kind, portal) => round(rows(kind, portal).reduce((sum, row) => sum + row.fee, 0));
  const rateGroups = (row) => [...row.rates.reduce((groups, item) => {
    const group = groups.get(item.rate) || { rate: item.rate, base: 0, fee: 0 };
    group.base += item.base;
    group.fee += item.fee;
    if (item.period) (group.periods ||= []).push(item.period);
    groups.set(item.rate, group);
    return groups;
  }, new Map()).values()].map((group) => ({ ...group, base: round(group.base), fee: round(group.fee) }));
  const periodText = (portal) => state[portal].start ? `${state[portal].start} 至 ${state[portal].end}` : "全部时间";
  const period = (portal) => `<div class="finance971-modal-period"><span>统计时间：</span><strong>${escape(periodText(portal))}</strong></div>`;

  function sidebar(page) {
    const portal = page.portal === "总控" ? "control" : page.portal === "站点" ? "site" : "agent";
    const control = portal === "control";
    const open = state[portal].menuOpen;
    return `<aside class="risk-sidebar finance971-sidebar"><div class="finance971-brand">${page.portal}后台管理系统</div><nav><section class="finance971-menu-group"><button type="button" class="finance971-menu-parent" data-finance971-menu-toggle aria-expanded="${open}" aria-controls="finance971-menu-children"><span class="finance971-menu-icon" aria-hidden="true"></span><span>${escape(page.menuGroup)}</span><i class="finance971-menu-arrow${open ? " open" : ""}" aria-hidden="true"></i></button><div id="finance971-menu-children"${open ? "" : " hidden"}><a class="finance971-menu-child active${control ? "" : " annotated"}" href="#requirement/%23971/page/${page.key}" aria-current="page"${control ? "" : ' data-component-id="N01"'}>${control ? "" : '<span class="component-badge">N01</span>'}<span>${escape(page.name)}</span>${control ? "" : '<em class="menu-change-badge is-new">新增</em>'}</a></div></section></nav></aside>`;
  }
  function agentFilter(portal) {
    if (portal !== "control") return "";
    const value = state.control.draftAgent;
    return `<div class="risk-field finance971-agent-field"><label for="finance971-agent">代理账号/ID</label><div class="finance971-agent-autocomplete"><input id="finance971-agent" name="finance971-agent" value="${escape(value)}" placeholder="请输入代理账号或ID" autocomplete="off" /><div class="finance971-agent-options" hidden>${agentOptions.map(([account, id]) => `<button type="button" data-finance971-agent-value="${account}"><strong>${account}</strong><span>${id}</span></button>`).join("")}</div></div></div>`;
  }
  function controlSiteSelect() {
    const selected = state.control.sites?.length === 1 ? state.control.sites[0] : "";
    return `<div class="risk-field finance971-site-field"><label for="finance971-site">所属站点</label><select id="finance971-site" aria-label="所属站点"><option value="">全部站点</option>${helpers.sites.map((site) => `<option value="${escape(site)}"${selected === site ? " selected" : ""}>${escape(site)}</option>`).join("")}</select></div>`;
  }
  function filters(portal) {
    const range = state[portal].draft;
    const date = new Date(`${(range.start || today).slice(0, 10)}T12:00:00`);
    return `<section class="finance971-filters annotated" data-component-id="F01">${helpers.badge("F01")}${portal === "control" ? controlSiteSelect() : ""}${agentFilter(portal)}<div class="risk-field finance971-date"><label>统计时间</label>${helpers.dateControl({ year: date.getFullYear(), month: date.getMonth() + 1, startDay: date.getDate(), endDay: date.getDate(), empty: !range.start })}</div><div class="finance971-filter-actions"><button type="button" class="main-action" data-finance971-search>筛选</button><button type="button" class="secondary-action" data-finance971-reset>重置</button></div></section>`;
  }
  function feeCard(label, type, value, withTip = false) {
    const id = type === "venue" ? "M01" : "M02";
    return `<button type="button" class="finance971-open-fee annotated" data-finance971-fee="${type}" data-component-id="${id}">${helpers.badge(id)}<span class="finance971-card-title">${label}${withTip ? '<i class="finance971-info-tip" role="button" tabindex="0" aria-label="查看费用说明">?</i>' : ""}</span><strong>¥${money(value)}</strong><span class="finance971-card-link">查看明细 <b aria-hidden="true">›</b></span></button>`;
  }
  function kindTabs(attribute, selected) {
    return `<div class="finance971-modal-tabs" role="tablist" aria-label="手续费类型">${[["deposit", "充值手续费"], ["withdraw", "提现手续费"]].map(([kind, label]) => `<button type="button" role="tab" aria-selected="${kind === selected}" class="${kind === selected ? "active" : ""}" ${attribute}="${kind}">${label}</button>`).join("")}</div>`;
  }
  function render(page, api) {
    helpers = api;
    activePortal = page.portal === "站点" ? "site" : page.portal === "总控" ? "control" : "agent";
    state.control.sites ??= [...helpers.sites];
    activeTab = api.activeTab || "返佣方案";
    if (activePortal !== "control") return `<div class="finance971-page finance971-${activePortal}">${filters(activePortal)}<section class="finance971-report-section annotated" data-component-id="P01">${helpers.badge("P01")}<div class="finance971-report-cards">${feeCard("场馆费比例", "venue", total("venue", activePortal), true)}${feeCard("充提手续费比例", "fee", total("deposit", activePortal) + total("withdraw", activePortal), true)}</div></section></div>`;
    const tabs = `<nav class="finance971-control-tabs annotated" data-component-id="N01" role="tablist">${helpers.badge("N01")}${page.tabs.map((tab) => `<button type="button" role="tab" aria-selected="${activeTab === tab}" class="finance971-control-tab${activeTab === tab ? " active" : ""}" data-finance971-control-tab="${tab}">${tab}${tab === "返佣方案" ? "" : '<em class="menu-change-badge is-new">新增</em>'}</button>`).join("")}</nav>`;
    const kind = activeTab === "场馆费比例" ? "venue" : state.control.kind;
    const content = activeTab === "返佣方案" ? '<section class="finance971-control-reference">此页面与生产一致，无修改</section>' : `${filters("control")}<section class="finance971-control-detail">${activeTab === "充提手续费比例" ? `<div class="finance971-kind-field annotated" data-component-id="T01">${helpers.badge("T01")}${kindTabs("data-finance971-control-kind", kind)}</div>` : ""}<div class="finance971-control-table annotated" data-component-id="${kind === "venue" ? "T02" : "T03"}">${helpers.badge(kind === "venue" ? "T02" : "T03")}<div class="finance971-fee-table-panel">${detailTable(kind, "control", state.control)}</div></div></section>`;
    return `<div class="finance971-page finance971-control">${tabs}${content}</div>`;
  }
  function detailTable(kind, portal, pager) {
    const data = rows(kind, portal);
    const amount = money(total(kind, portal));
    const label = kind === "venue" ? "场馆费比例" : `${kind === "deposit" ? "充值" : "提现"}手续费比例`;
    const count = Math.max(1, Math.ceil(data.length / pager.size));
    pager.page = Math.min(pager.page, count);
    const offset = (pager.page - 1) * pager.size;
    const amountLabel = kind === "venue" ? "总输赢" : kind === "deposit" ? "充值金额" : "提现金额";
    const feeLabel = kind === "venue" ? "场馆费" : "手续费";
    const totalBar = `<div class="finance971-total-bar"><span>${label}总计（CNY）：</span><strong>${amount}</strong></div>`;
    const tableRows = data.slice(offset, offset + pager.size).map((row, index) => {
      const groups = rateGroups(row);
      const highestRate = Math.max(...groups.map((group) => group.rate));
      return `<tr><td>${offset + index + 1}</td><td>${escape(row.name)}</td><td>${money(row.base)}</td><td><span>${highestRate}%</span></td><td><strong>${money(row.fee)}</strong></td></tr>`;
    }).join("");
    return `<div class="finance971-table-panel">${totalBar}<div class="risk-table-wrap finance971-modal-table-wrap"><table class="risk-table finance971-modal-table"><thead><tr><th>序号</th><th>${kind === "venue" ? "场馆名称" : kind === "deposit" ? "充值渠道" : "提现渠道"}</th><th>${amountLabel}（CNY）</th><th>${kind === "venue" ? "场馆费率" : "费率"}</th><th>${feeLabel}（CNY）</th></tr></thead><tbody>${tableRows || '<tr class="finance971-empty"><td colspan="5">暂无数据</td></tr>'}</tbody></table></div>${totalBar}<div class="finance971-pagination"><span>共 ${data.length} 条</span><select aria-label="每页数量" data-finance971-size>${[10, 20, 50, 100, 200].map((size) => `<option value="${size}"${pager.size === size ? " selected" : ""}>${size}条/页</option>`).join("")}</select><button type="button" data-finance971-page="${pager.page - 1}" aria-label="上一页"${pager.page === 1 ? " disabled" : ""}>‹</button>${Array.from({ length: count }, (_, index) => `<button type="button" data-finance971-page="${index + 1}" class="${pager.page === index + 1 ? "active" : ""}"${pager.page === index + 1 ? ' aria-current="page"' : ""}>${index + 1}</button>`).join("")}<button type="button" data-finance971-page="${pager.page + 1}" aria-label="下一页"${pager.page === count ? " disabled" : ""}>›</button><label>前往 <input type="number" min="1" max="${count}" value="${pager.page}" aria-label="跳转页码" /> 页</label></div></div>`;
  }
  function bindTable(root, kind, portal, pager) {
    const refresh = () => {
      // Removing a focused page input can synchronously fire change again.
      if (root.dataset.finance971Updating) return;
      root.dataset.finance971Updating = "true";
      try { root.innerHTML = detailTable(kind, portal, pager); bindTable(root, kind, portal, pager); }
      finally { delete root.dataset.finance971Updating; }
    };
    root.querySelectorAll("[data-finance971-page]").forEach((button) => button.addEventListener("click", () => { pager.page = Number(button.dataset.finance971Page); refresh(); }));
    root.querySelector("[data-finance971-size]").addEventListener("change", (event) => { pager.size = Number(event.target.value); pager.page = 1; refresh(); });
    root.querySelector('input[aria-label="跳转页码"]').addEventListener("change", (event) => {
      const next = Math.max(1, Math.min(Number(event.target.max), Number(event.target.value) || 1));
      event.target.value = String(next);
      if (pager.page === next) return;
      pager.page = next; refresh();
    });
  }
  function openDetail(type) {
    const previousFocus = document.activeElement;
    const portal = activePortal;
    const id = type === "venue" ? "M01" : "M02";
    let kind = type === "venue" ? "venue" : "deposit";
    const pager = { page: 1, size: 20 };
    helpers.modal(type === "venue" ? "场馆费明细" : "充提手续费明细", `<div class="finance971-modal-content annotated" data-component-id="${id}">${helpers.badge(id)}${period(portal)}${type === "venue" ? "" : kindTabs("data-finance971-fee-tab", kind)}<div class="finance971-fee-table-panel">${detailTable(kind, portal, pager)}</div></div>`, "关闭");
    const dialog = document.querySelector("#modal-root .risk-modal");
    dialog.classList.add("finance971-dialog");
    helpers.select(id, "component");
    dialog.querySelectorAll(".modal-close,.modal-confirm").forEach((button) => button.addEventListener("click", () => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); }));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); dialog.querySelector(".modal-close").click(); }
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll("button:not(:disabled),select,input")];
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
    });
    const panel = dialog.querySelector(".finance971-fee-table-panel");
    bindTable(panel, kind, portal, pager);
    dialog.querySelectorAll("[data-finance971-fee-tab]").forEach((button) => button.addEventListener("click", () => {
      kind = button.dataset.finance971FeeTab;
      pager.page = 1;
      dialog.querySelectorAll("[data-finance971-fee-tab]").forEach((tab) => { tab.classList.toggle("active", tab === button); tab.setAttribute("aria-selected", String(tab === button)); });
      panel.innerHTML = detailTable(kind, portal, pager);
      bindTable(panel, kind, portal, pager);
    }));
    bindTabKeys(dialog);
    dialog.querySelector(".modal-close").focus({ preventScroll: true });
  }
  function bindTabKeys(root) {
    root.querySelectorAll('[role="tablist"]').forEach((list) => list.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const buttons = [...list.querySelectorAll('[role="tab"]')];
      const index = buttons.indexOf(event.target);
      if (index < 0) return;
      event.preventDefault();
      const next = buttons[(index + (event.key === "ArrowLeft" ? -1 : 1) + buttons.length) % buttons.length];
      next.click(); next.focus();
    }));
  }
  function bindDate() {
    const field = document.querySelector(".finance971-date");
    if (!field) return;
    helpers.bindDates();
    const range = state[activePortal].draft;
    const trigger = field.querySelector(".agent-498-date");
    const popover = field.querySelector(".agent-498-date-popover");
    const refreshLabel = () => { trigger.innerHTML = `<span>${escape(range.start || "开始时间")}</span><b>至</b><span>${escape(range.end || "结束时间")}</span>`; };
    refreshLabel();
    trigger.addEventListener("click", () => {
      if (popover.hidden) return;
      popover.querySelectorAll(".calendar-panel").forEach((panel) => {
        const value = (panel.dataset.rangeSide === "start" ? range.start : range.end) || `${today} ${panel.dataset.rangeSide === "start" ? "00:00:00" : "23:59:59"}`;
        const date = new Date(value.replace(" ", "T"));
        const year = date.getFullYear(); const month = date.getMonth() + 1;
        Object.assign(panel.dataset, { year, month });
        panel.querySelector("header strong").textContent = `${year}年${month}月`;
        panel.querySelector(".calendar-days").innerHTML = '<span></span>'.repeat((new Date(year, month - 1, 1).getDay() + 6) % 7) + Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => `<button type="button" class="calendar-day${index + 1 === date.getDate() ? " selected" : ""}" data-day="${index + 1}">${index + 1}</button>`).join("");
        panel.querySelector("input[type='time']").value = value.slice(11);
      });
    });
    field.querySelector(".date-apply").addEventListener("click", () => {
      if (!popover.hidden) return;
      const spans = trigger.querySelectorAll("span");
      range.start = spans[0].textContent; range.end = spans[1].textContent;
    });
    field.querySelector(".site-695-date-clear").addEventListener("click", () => { range.start = ""; range.end = ""; refreshLabel(); });
    popover.addEventListener("keydown", (event) => { if (event.key === "Escape") field.querySelector(".date-close").click(); });
  }
  function bind() {
    const range = state[activePortal];
    document.querySelector("[data-finance971-menu-toggle]").addEventListener("click", (event) => {
      range.menuOpen = !range.menuOpen;
      event.currentTarget.setAttribute("aria-expanded", String(range.menuOpen));
      event.currentTarget.querySelector("i").classList.toggle("open", range.menuOpen);
      document.getElementById("finance971-menu-children").hidden = !range.menuOpen;
    });
    document.querySelectorAll("[data-finance971-control-tab]").forEach((button) => button.addEventListener("click", () => { range.page = 1; helpers.setTab(button.dataset.finance971ControlTab); }));
    document.querySelectorAll("[data-finance971-control-kind]").forEach((button) => button.addEventListener("click", () => { range.kind = button.dataset.finance971ControlKind; range.page = 1; helpers.rerender(); }));
    const siteSelect = document.querySelector("#finance971-site");
    const agentInput = document.querySelector("#finance971-agent");
    const agentOptionsBox = document.querySelector(".finance971-agent-options");
    if (agentInput && agentOptionsBox) {
      const choices = [...agentOptionsBox.querySelectorAll("button")];
      const showAgents = () => {
        const query = agentInput.value.trim().toLowerCase();
        choices.forEach((choice) => { choice.hidden = !`${choice.dataset.finance971AgentValue} ${choice.textContent}`.toLowerCase().includes(query); });
        agentOptionsBox.hidden = false;
      };
      agentInput.addEventListener("focus", showAgents);
      agentInput.addEventListener("input", showAgents);
      agentInput.addEventListener("blur", () => { agentInput.value = agentInput.value.trim(); state.control.draftAgent = agentInput.value; setTimeout(() => { agentOptionsBox.hidden = true; }, 120); });
      choices.forEach((choice) => choice.addEventListener("mousedown", (event) => event.preventDefault()));
      choices.forEach((choice) => choice.addEventListener("click", () => { agentInput.value = choice.dataset.finance971AgentValue; state.control.draftAgent = agentInput.value; agentOptionsBox.hidden = true; }));
    }
    document.querySelector("[data-finance971-search]")?.addEventListener("click", () => {
      Object.assign(range, range.draft, { page: 1 });
      if (siteSelect) range.sites = siteSelect.value ? [siteSelect.value] : [...helpers.sites];
      if (agentInput) range.agent = agentInput.value.trim();
      helpers.rerender();
    });
    document.querySelector("[data-finance971-reset]")?.addEventListener("click", () => {
      Object.assign(range, defaults(), { draft: defaults(), draftAgent: "", agent: "", page: 1 });
      if (activePortal === "control") range.sites = [...helpers.sites];
      helpers.rerender();
    });
    document.querySelectorAll(".finance971-open-fee").forEach((button) => {
      button.addEventListener("click", () => openDetail(button.dataset.finance971Fee));
      button.querySelector(".finance971-info-tip")?.addEventListener("click", (event) => {
        event.stopPropagation();
        helpers.modal("费用说明", "<p>仅展示比例和金额，不代表承担的费用</p>", "关闭");
      });
      button.querySelector(".finance971-info-tip")?.addEventListener("keydown", (event) => {
        if (["Enter", " "].includes(event.key)) { event.preventDefault(); event.stopPropagation(); event.currentTarget.click(); }
      });
    });
    if (activePortal !== "control") {
      const revealMenu = () => { if (!range.menuOpen) document.querySelector("[data-finance971-menu-toggle]").click(); };
      const menuSpec = document.querySelector('[data-spec-id="N01"]');
      menuSpec?.addEventListener("click", revealMenu);
      menuSpec?.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) revealMenu(); });
    }
    if (activePortal !== "control") ["M01", "M02"].forEach((id) => {
      const activate = () => { if (!document.querySelector("#modal-root .finance971-dialog")) openDetail(id === "M01" ? "venue" : "fee"); };
      const spec = document.querySelector(`[data-spec-id="${id}"]`);
      spec?.addEventListener("click", activate);
      spec?.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); activate(); } });
    });
    const panel = document.querySelector(".finance971-control-detail .finance971-fee-table-panel");
    if (panel) bindTable(panel, activeTab === "场馆费比例" ? "venue" : range.kind, "control", range);
    bindTabKeys(document.querySelector(".finance971-page"));
    bindDate();
  }
  window.Finance971 = { render, bind, sidebar };
})();
