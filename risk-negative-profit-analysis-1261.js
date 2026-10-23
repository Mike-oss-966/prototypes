(function () {
  "use strict";

  let siteNames = [];
  const cycles = [
    { label: "2026-10-16 至 2026-10-31", start: "2026-10-16", end: "2026-10-31", asOf: "2026-10-22 23:59:59" },
    { label: "2026-10-01 至 2026-10-15", start: "2026-10-01", end: "2026-10-15", asOf: "2026-10-15 23:59:59" },
    { label: "2026-09-16 至 2026-09-30", start: "2026-09-16", end: "2026-09-30", asOf: "2026-09-30 23:59:59" }
  ];
  const teams = [
    ["XY体育", "华东团队", "TM10001", ["agent_mike", "east_sub_01", "east_sub_02"]],
    ["XY体育", "江南团队", "TM10002", ["south_line", "south_sub_01"]],
    ["拉布布", "北辰团队", "TM20001", ["north_leader", "north_sub_02"]],
    ["WC体育", "远航团队", "TM30001", ["voyage_main", "voyage_sub"]],
    ["CS体育", "先锋团队", "TM40001", ["pioneer_main", "pioneer_sub"]],
    ["YY体育", "启明星团队", "TM50001", ["morning_main", "morning_sub"]],
    ["NS体育", "海岚团队", "TM60001", ["ocean_main", "ocean_sub"]],
    ["DW体育", "卓越团队", "TM70001", ["excellent_main", "excellent_sub"]]
  ].map(([siteName, teamName, teamId, accounts], teamIndex) => ({ siteName, teamName, teamId, accounts, teamIndex }));
  siteNames = [...new Set(teams.map((team) => team.siteName))];

  const fields = [
    { key: "siteName", label: "站点", width: 96, kind: "text" },
    { key: "agentName", label: "代理名称", width: 132, kind: "agent" },
    { key: "cycle", label: "佣金周期", width: 174, kind: "text" },
    { key: "statisticsTime", label: "统计时间", width: 210, kind: "text" },
    { key: "teamName", label: "团队名称", width: 125, kind: "text" },
    { key: "agentType", label: "代理类型", width: 190, kind: "type" },
    { key: "members", label: "下级会员", width: 104, kind: "count", definition: "当前直属会员数量。代理行统计该代理的直属会员；团队行汇总团队内各代理的直属会员。" },
    { key: "registrations", label: "注册人数", width: 104, kind: "count", definition: "统计时间范围内，完成平台注册的会员人数，按会员去重统计。" },
    { key: "firstDeposits", label: "首存人数", width: 88, kind: "count" },
    { key: "activeMembers", label: "活跃人数", width: 104, kind: "count", componentId: "R01", definition: "统计时间范围内，投注总额大于0的会员人数，按会员去重统计。" },
    { key: "newActiveMembers", label: "新增活跃人数", width: 124, kind: "count", definition: "统计时间范围内新注册，且在同一时间范围内投注总额大于0的会员人数，按会员去重统计。" },
    { key: "depositAmount", label: "存款金额（CNY）", width: 130, kind: "money" },
    { key: "withdrawAmount", label: "提款金额（CNY）", width: 130, kind: "money" },
    { key: "betAmount", label: "投注金额（CNY）", width: 130, kind: "money" },
    { key: "profitLossAmount", label: "盈亏金额（CNY）", width: 130, kind: "money" },
    { key: "bonusAmount", label: "红利彩金（CNY）", width: 130, kind: "money" },
    { key: "rebateAmount", label: "返水金额（CNY）", width: 130, kind: "money" }
  ];
  const numericFields = fields.filter((field) => ["count", "money"].includes(field.kind)).map((field) => field.key);
  const tableWidth = 44 + fields.reduce((total, field) => total + field.width, 0);
  const colgroup = (withExpand = false) => `<colgroup>${withExpand ? '<col style="width:44px" />' : ""}${fields.map((field) => `<col style="width:${field.width}px" />`).join("")}</colgroup>`;
  const e = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const numberFormat = (value) => Number(value || 0).toLocaleString("zh-CN");
  const moneyFormat = (value) => Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cycleOptions = cycles.map((cycle) => cycle.label);
  const freshFilter = () => ({ sites: [...siteNames], cycle: cycleOptions[0], startDate: "", endDate: "", team: "", agent: "" });
  const state = { draft: freshFilter(), applied: freshFilter(), page: 1, size: 20, expanded: new Set(), error: "", sitesInitialized: false };
  let context = {};

  function makeAgent(team, cycleIndex, agentIndex) {
    const seed = team.teamIndex * 19 + cycleIndex * 13 + agentIndex * 7;
    const registrations = 5 + seed % 12;
    const members = 76 + (team.teamIndex * 17) % 118 + agentIndex * 21 + cycleIndex * 4;
    const firstDeposits = Math.min(registrations, 2 + (seed * 3) % 7);
    const activeMembers = 24 + (team.teamIndex * 9 + agentIndex * 12 + cycleIndex * 5) % 94;
    const newActiveMembers = Math.min(registrations, 1 + (seed * 5) % 5);
    const depositAmount = 42800 + team.teamIndex * 11750 + agentIndex * 9200 + cycleIndex * 3800;
    const withdrawAmount = 29100 + team.teamIndex * 8350 + agentIndex * 6700 + cycleIndex * 2900;
    const betAmount = 286000 + team.teamIndex * 82400 + agentIndex * 73500 + cycleIndex * 24000;
    const profitLossAmount = ((team.teamIndex + agentIndex + cycleIndex) % 3 === 0 ? -1 : 1) * (8300 + team.teamIndex * 2100 + agentIndex * 3100 + cycleIndex * 1200);
    const bonusAmount = 2200 + team.teamIndex * 680 + agentIndex * 530 + cycleIndex * 260;
    const rebateAmount = 5300 + team.teamIndex * 1450 + agentIndex * 980 + cycleIndex * 420;
    return {
      siteName: team.siteName,
      agentName: team.accounts[agentIndex],
      cycle: cycles[cycleIndex].label,
      statisticsTime: `${cycles[cycleIndex].start} 00:00:00 至 ${cycles[cycleIndex].asOf}`,
      teamName: team.teamName,
      agentType: agentIndex === 0 ? "团队代理多线（负责人）" : "团队代理多线（副线）",
      members,
      registrations,
      firstDeposits,
      activeMembers,
      newActiveMembers,
      depositAmount,
      withdrawAmount,
      betAmount,
      profitLossAmount,
      bonusAmount,
      rebateAmount,
      teamId: team.teamId,
      teamKey: `${team.siteName}|${team.teamId}|${cycles[cycleIndex].label}`
    };
  }

  const allGroups = teams.flatMap((team) => cycles.map((cycle, cycleIndex) => {
    const agents = team.accounts.map((_, agentIndex) => makeAgent(team, cycleIndex, agentIndex));
    const aggregate = {
      siteName: team.siteName,
      agentName: `${team.teamName}（汇总）`,
      cycle: cycle.label,
      statisticsTime: `${cycle.start} 00:00:00 至 ${cycle.asOf}`,
      teamName: team.teamName,
      agentType: "团队",
      teamId: team.teamId,
      teamKey: `${team.siteName}|${team.teamId}|${cycle.label}`,
      agents
    };
    numericFields.forEach((field) => { aggregate[field] = agents.reduce((sum, agent) => sum + agent[field], 0); });
    return aggregate;
  }));

  function summaryText(selected) {
    if (selected.length === siteNames.length) return "全部站点";
    if (!selected.length) return "请选择站点";
    return `已选 ${selected.length} 个站点`;
  }

  function siteSelector() {
    const selected = state.draft.sites;
    return `<div class="risk1261-field risk1261-site-field"><label id="risk1261-site-label">站点</label><details class="risk1261-site-picker"><summary aria-labelledby="risk1261-site-label risk1261-site-summary"><span id="risk1261-site-summary">${summaryText(selected)}</span></summary><div class="risk1261-site-options"><label class="risk1261-check-all"><input type="checkbox" data-risk1261-sites-all${selected.length === siteNames.length ? " checked" : ""} />全选</label>${siteNames.map((site) => `<label><input type="checkbox" data-risk1261-site value="${e(site)}"${selected.includes(site) ? " checked" : ""} />${e(site)}</label>`).join("")}</div></details></div>`;
  }

  function filterPanel() {
    const cycle = state.draft.cycle;
    return `<section class="risk1261-filter-panel annotated" data-component-id="F01">${context.badge?.("F01") || ""}<div class="risk1261-filter-grid">${siteSelector()}<label class="risk1261-field"><span>佣金周期</span><select data-risk1261-cycle>${cycleOptions.map((option) => `<option value="${e(option)}"${option === cycle ? " selected" : ""}>${e(option)}</option>`).join("")}</select></label><label class="risk1261-field risk1261-date-field"><span>统计开始日期</span><input type="date" value="${e(state.draft.startDate)}" data-risk1261-date="startDate" /></label><label class="risk1261-field risk1261-date-field"><span>统计结束日期</span><input type="date" value="${e(state.draft.endDate)}" data-risk1261-date="endDate" /></label><label class="risk1261-field"><span>团队名称</span><input type="text" value="${e(state.draft.team)}" placeholder="请输入团队名称" data-risk1261-keyword="team" /></label><label class="risk1261-field"><span>代理名称</span><input type="text" value="${e(state.draft.agent)}" placeholder="请输入代理账号" data-risk1261-keyword="agent" /></label><div class="risk1261-filter-actions"><button type="button" class="main-action" data-risk1261-search>查询</button><button type="button" class="secondary-action" data-risk1261-reset>重置</button></div>${state.error ? `<p class="risk1261-error" role="alert">${e(state.error)}</p>` : ""}</div></section>`;
  }

  function matchingGroups() {
    const filter = state.applied;
    const teamTerm = filter.team.trim().toLowerCase();
    const agentTerm = filter.agent.trim().toLowerCase();
    return allGroups.filter((group) => {
      if (!filter.sites.includes(group.siteName)) return false;
      if (filter.cycle && group.cycle !== filter.cycle) return false;
      if (teamTerm && !`${group.teamName} ${group.teamId}`.toLowerCase().includes(teamTerm)) return false;
      const periodStart = group.statisticsTime.slice(0, 10);
      const periodEnd = group.statisticsTime.slice(-19, -9);
      if (filter.endDate && periodStart > filter.endDate) return false;
      if (filter.startDate && periodEnd < filter.startDate) return false;
      if (agentTerm && !group.agents.some((agent) => agent.agentName.toLowerCase().includes(agentTerm))) return false;
      return true;
    }).map((group) => {
      const agents = agentTerm ? group.agents.filter((agent) => agent.agentName.toLowerCase().includes(agentTerm)) : group.agents;
      const aggregate = { ...group, agents };
      numericFields.forEach((field) => { aggregate[field] = agents.reduce((sum, agent) => sum + agent[field], 0); });
      return aggregate;
    }).sort((left, right) => left.siteName.localeCompare(right.siteName, "zh-CN") || left.teamName.localeCompare(right.teamName, "zh-CN") || right.cycle.localeCompare(left.cycle));
  }

  function valueCell(row, field, aggregate = false) {
    const value = row[field.key];
    if (field.key === "statisticsTime") return `<td class="risk1261-statistics-time">${e(value || "—")}</td>`;
    if (field.kind === "count") return `<td class="risk1261-number">${numberFormat(value)}</td>`;
    if (field.kind === "money") return `<td class="risk1261-number risk1261-money">${moneyFormat(value)}</td>`;
    if (field.kind === "agent") return `<td class="risk1261-agent-name">${aggregate ? `<strong>${e(value)}</strong><small>团队汇总</small>` : `<strong>${e(value)}</strong>`}</td>`;
    if (field.kind === "type") return `<td>${aggregate ? '<span class="risk1261-team-tag">团队</span>' : `<span class="risk1261-role-tag${value.includes("负责人") ? " is-leader" : ""}">${e(value)}</span>`}</td>`;
    return `<td>${e(value || "—")}</td>`;
  }

  function headerCell(field, annotated = false) {
    const componentId = annotated && field.componentId;
    const help = field.definition ? `<button type="button" class="risk1261-header-help" data-risk1261-definition="${field.key}" popovertarget="risk1261-field-definition" aria-label="查看${e(field.label)}定义" aria-haspopup="dialog" aria-controls="risk1261-field-definition" aria-expanded="false"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.3"/><path d="M7.7 7.6a2.3 2.3 0 0 1 4.6 0c0 1.7-2.3 1.9-2.3 3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="10" cy="14" r=".8" fill="currentColor"/></svg></button>` : "";
    return `<th${componentId ? ` class="annotated" data-component-id="${componentId}"` : ""}>${componentId ? context.badge?.(componentId) || "" : ""}<span class="risk1261-header-label">${e(field.label)}${help}</span></th>`;
  }

  function detailTable(group) {
    return `<div class="risk1261-detail-wrap"><table class="risk1261-detail-table">${colgroup(true)}<thead><tr><th class="risk1261-sequence">序号</th>${fields.map((field) => headerCell(field)).join("")}</tr></thead><tbody>${group.agents.map((agent, index) => `<tr><td class="risk1261-sequence risk1261-number">${index + 1}</td>${fields.map((field) => valueCell(agent, field)).join("")}</tr>`).join("") || `<tr><td colspan="${fields.length + 1}" class="risk1261-empty">暂无团队代理</td></tr>`}</tbody></table></div>`;
  }

  function groupRow(group) {
    const expanded = state.expanded.has(group.teamKey);
    const row = `<tr class="risk1261-group-row${expanded ? " is-expanded" : ""}"><td class="risk1261-expand-cell"><button type="button" class="risk1261-expand-button" data-risk1261-expand="${e(group.teamKey)}" aria-expanded="${expanded}" aria-label="${expanded ? "收起" : "展开"}${e(group.teamName)}代理"><span></span></button></td>${fields.map((field) => valueCell(group, field, true)).join("")}</tr>`;
    const detail = expanded ? `<tr class="risk1261-detail-row"><td colspan="${fields.length + 1}">${detailTable(group)}</td></tr>` : "";
    return row + detail;
  }

  function totalRow(groups) {
    const sums = Object.fromEntries(numericFields.map((field) => [field, groups.reduce((sum, row) => sum + row[field], 0)]));
    return `<tfoot><tr class="risk1261-total-row"><td class="risk1261-expand-cell"></td>${fields.map((field) => numericFields.includes(field.key) ? valueCell(sums, field) : `<td>${field.key === "agentName" ? "筛选结果总计" : "—"}</td>`).join("")}</tr></tfoot>`;
  }

  function pageButtons(totalPages) {
    const choices = [...new Set([1, totalPages, state.page - 1, state.page, state.page + 1].filter((page) => page >= 1 && page <= totalPages))].sort((a, b) => a - b);
    return choices.map((page, index) => `${index > 0 && page - choices[index - 1] > 1 ? '<span class="risk1261-page-gap">…</span>' : ""}<button type="button" data-risk1261-page="${page}"${page === state.page ? ' class="active" aria-current="page"' : ""}>${page}</button>`).join("");
  }

  function pagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.size));
    state.page = Math.min(state.page, totalPages);
    return `<div class="risk1261-pagination"><span>共 ${total} 个团队</span><select aria-label="每页团队数量" data-risk1261-size>${[10, 20, 50, 100].map((size) => `<option value="${size}"${size === state.size ? " selected" : ""}>${size}条/页</option>`).join("")}</select><button type="button" aria-label="上一页" data-risk1261-page="${state.page - 1}"${state.page <= 1 ? " disabled" : ""}>‹</button>${pageButtons(totalPages)}<button type="button" aria-label="下一页" data-risk1261-page="${state.page + 1}"${state.page >= totalPages ? " disabled" : ""}>›</button></div>`;
  }

  function tablePanel() {
    const groups = matchingGroups();
    const totalPages = Math.max(1, Math.ceil(groups.length / state.size));
    state.page = Math.min(state.page, totalPages);
    const pageRows = groups.slice((state.page - 1) * state.size, state.page * state.size);
    const allExpanded = pageRows.length > 0 && pageRows.every((group) => state.expanded.has(group.teamKey));
    return `<section class="risk1261-table-card annotated" data-component-id="T01">${context.badge?.("T01") || ""}<div class="risk1261-table-toolbar"><span>按团队汇总，展开后查看团队内代理</span><button type="button" class="secondary-action" data-risk1261-toggle-all>${allExpanded ? "全部收起" : "全部展开"}</button></div><div class="risk1261-table-wrap" style="--risk1261-table-width:${tableWidth}px" data-page-scroll><table class="risk1261-table">${colgroup(true)}<thead><tr><th class="risk1261-expand-head" aria-label="展开团队"></th>${fields.map((field) => headerCell(field, true)).join("")}</tr></thead><tbody>${pageRows.map(groupRow).join("") || `<tr><td colspan="${fields.length + 1}" class="risk1261-empty">暂无符合条件的数据</td></tr>`}</tbody>${totalRow(groups)}</table></div>${pagination(groups.length)}</section>`;
  }

  function render(page, helpers = {}) {
    context = { ...context, ...helpers };
    if (Array.isArray(helpers.sites) && helpers.sites.length) {
      siteNames = [...helpers.sites];
      if (!state.sitesInitialized) {
        state.draft = freshFilter();
        state.applied = freshFilter();
        state.sitesInitialized = true;
      }
    }
    return `<div class="risk1261-page"><div class="risk-page-heading risk784-page-heading"><div><p>风控管理</p><h1>${e(page.name)}</h1></div></div>${filterPanel()}${tablePanel()}<div id="risk1261-field-definition" class="risk1261-field-definition" popover="auto" role="dialog" aria-labelledby="risk1261-definition-title"><h2 id="risk1261-definition-title"></h2><p></p></div></div>`;
  }

  function sidebar(page) {
    const currentKey = page.key;
    const menuItems = [
      "风控提款审核", "风控配置", "风控名单库", "风险命中记录", "异常代理", "会员登录日志", "流水查询", "风控预警"
    ].map((name, index) => `<span class="risk-784-menu-item risk1261-disabled-menu" aria-disabled="true"><span class="menu-symbol risk-784-menu-symbol icon-${index + 1}" aria-hidden="true"></span><span class="menu-name">${name}</span></span>`).join("");
    const active = `<a href="#requirement/%231261/page/${currentKey}" class="risk-784-menu-item active risk1261-menu-link"><span class="menu-symbol risk-784-menu-symbol icon-9" aria-hidden="true"></span><span class="menu-name">负盈利代理数据分析<em class="risk784-menu-badge">新增</em></span></a>`;
    return `<aside class="risk-sidebar risk-784-sidebar risk1261-sidebar"><div class="risk-brand"><span>R</span><div><strong>总控后台管理系统</strong><small>风控管理</small></div></div><div class="risk-menu-label">功能导航</div><nav class="risk-784-menu-tree"><section class="risk-784-menu-group is-expanded" data-risk1261-menu-group><button type="button" class="risk-784-menu-parent" data-risk1261-menu-toggle aria-expanded="true"><span class="menu-symbol">■</span><span class="menu-name">风控管理</span><span class="risk-784-menu-arrow" aria-hidden="true"></span></button><div class="risk-784-menu-children">${menuItems}${active}</div></section></nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>总控管理员</small></div></div></aside>`;
  }

  function readDraft(root) {
    state.draft = {
      ...state.draft,
      sites: [...root.querySelectorAll("[data-risk1261-site]:checked")].map((input) => input.value),
      cycle: root.querySelector("[data-risk1261-cycle]")?.value || "",
      startDate: root.querySelector('[data-risk1261-date="startDate"]')?.value || "",
      endDate: root.querySelector('[data-risk1261-date="endDate"]')?.value || "",
      team: root.querySelector('[data-risk1261-keyword="team"]')?.value.trim() || "",
      agent: root.querySelector('[data-risk1261-keyword="agent"]')?.value.trim() || ""
    };
  }

  function bind(helpers = {}) {
    context = { ...context, ...helpers };
    const root = document.querySelector(".risk1261-app");
    if (!root) return;
    const rerender = context.rerender || (() => {});
    const definitionPopup = root.querySelector("#risk1261-field-definition");
    let definitionTrigger;
    const closeDefinition = () => {
      definitionPopup.hidePopover();
      definitionTrigger?.setAttribute("aria-expanded", "false");
      definitionTrigger = null;
    };
    definitionPopup.addEventListener("toggle", () => {
      if (!definitionPopup.matches(":popover-open")) {
        definitionTrigger?.setAttribute("aria-expanded", "false");
        definitionTrigger = null;
      }
    });
    root.querySelectorAll("[data-risk1261-definition]").forEach((button) => button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const field = fields.find((item) => item.key === button.dataset.risk1261Definition);
      if (definitionTrigger === button && definitionPopup.matches(":popover-open")) { closeDefinition(); return; }
      definitionTrigger?.setAttribute("aria-expanded", "false");
      definitionTrigger = button;
      definitionPopup.querySelector("h2").textContent = field.label;
      definitionPopup.querySelector("p").textContent = field.definition;
      definitionPopup.showPopover();
      button.setAttribute("aria-expanded", "true");
      const anchor = button.getBoundingClientRect();
      const popup = definitionPopup.getBoundingClientRect();
      definitionPopup.style.left = `${Math.max(8, Math.min(anchor.left + anchor.width / 2 - popup.width / 2, window.innerWidth - popup.width - 8))}px`;
      definitionPopup.style.top = `${anchor.bottom + popup.height + 8 <= window.innerHeight ? anchor.bottom + 8 : Math.max(8, anchor.top - popup.height - 8)}px`;
    }));
    root.addEventListener("scroll", closeDefinition, true);
    const updateSiteSummary = () => {
      const selected = [...root.querySelectorAll("[data-risk1261-site]:checked")].map((input) => input.value);
      const summary = root.querySelector("#risk1261-site-summary");
      if (summary) summary.textContent = summaryText(selected);
      const all = root.querySelector("[data-risk1261-sites-all]");
      if (all) { all.checked = selected.length === siteNames.length; all.indeterminate = selected.length > 0 && selected.length < siteNames.length; }
    };
    root.querySelector("[data-risk1261-sites-all]")?.addEventListener("change", (event) => {
      root.querySelectorAll("[data-risk1261-site]").forEach((input) => { input.checked = event.currentTarget.checked; });
      updateSiteSummary();
    });
    root.querySelectorAll("[data-risk1261-site]").forEach((input) => input.addEventListener("change", updateSiteSummary));
    root.querySelectorAll("[data-risk1261-cycle], [data-risk1261-date], [data-risk1261-keyword]").forEach((input) => input.addEventListener("change", () => readDraft(root)));
    root.querySelectorAll("[data-risk1261-keyword]").forEach((input) => input.addEventListener("input", () => readDraft(root)));
    root.querySelector("[data-risk1261-search]")?.addEventListener("click", () => {
      readDraft(root);
      if (state.draft.startDate && state.draft.endDate && state.draft.startDate > state.draft.endDate) {
        state.error = "统计开始日期不能晚于统计结束日期。";
      } else {
        state.error = "";
        state.applied = { ...state.draft, sites: [...state.draft.sites] };
        state.page = 1;
      }
      rerender();
    });
    root.querySelector("[data-risk1261-reset]")?.addEventListener("click", () => {
      state.draft = freshFilter(); state.applied = freshFilter(); state.page = 1; state.expanded.clear(); state.error = ""; rerender();
    });
    root.querySelectorAll("[data-risk1261-expand]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.risk1261Expand;
      if (state.expanded.has(key)) state.expanded.delete(key); else state.expanded.add(key);
      rerender();
    }));
    root.querySelector("[data-risk1261-toggle-all]")?.addEventListener("click", () => {
      const groups = matchingGroups();
      const pageRows = groups.slice((state.page - 1) * state.size, state.page * state.size);
      const collapse = pageRows.length > 0 && pageRows.every((group) => state.expanded.has(group.teamKey));
      pageRows.forEach((group) => collapse ? state.expanded.delete(group.teamKey) : state.expanded.add(group.teamKey));
      rerender();
    });
    root.querySelectorAll("[data-risk1261-page]").forEach((button) => button.addEventListener("click", () => {
      const totalPages = Math.max(1, Math.ceil(matchingGroups().length / state.size));
      state.page = Math.max(1, Math.min(totalPages, Number(button.dataset.risk1261Page) || 1)); rerender();
    }));
    root.querySelector("[data-risk1261-size]")?.addEventListener("change", (event) => { state.size = Number(event.currentTarget.value) || 20; state.page = 1; rerender(); });
    root.querySelector("[data-risk1261-menu-toggle]")?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const group = button.closest("[data-risk1261-menu-group]");
      const expanded = group.classList.toggle("is-expanded");
      button.setAttribute("aria-expanded", String(expanded));
    });
  }

  window.RiskNegativeProfitAnalysis1261 = { render, sidebar, bind };
})();
