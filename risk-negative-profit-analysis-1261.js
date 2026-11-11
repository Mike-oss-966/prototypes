(function () {
  "use strict";

  let siteNames = [];
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const dayAt = (offset) => new Date(Date.parse(`${today}T12:00:00Z`) + offset * 86400000).toISOString().slice(0, 10);
  const defaultRange = () => ({ start: `${dayAt(-6)} 00:00:00`, end: `${today} 23:59:59` });
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
    { key: "bonusAmount", label: "红利彩金（CNY）", width: 150, kind: "money", definition: "统计时间范围内，直属会员实际领取的活动彩金金额合计，按领取时间统计；未领取的彩金和投注产生的返水不计入。团队行汇总团队内全部代理的数据。" },
    { key: "rebateAmount", label: "返水金额（CNY）", width: 130, kind: "money" },
    { key: "statisticsTime", label: "统计时间", width: 210, kind: "text" }
  ];
  const numericFields = fields.filter((field) => ["count", "money"].includes(field.kind)).map((field) => field.key);
  const tableWidth = 44 + fields.reduce((total, field) => total + field.width, 0);
  const colgroup = (withExpand = false) => `<colgroup>${withExpand ? '<col style="width:44px" />' : ""}${fields.map((field) => `<col style="width:${field.width}px" />`).join("")}</colgroup>`;
  const e = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const numberFormat = (value) => Number(value || 0).toLocaleString("zh-CN");
  const moneyFormat = (value) => Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const freshFilter = () => ({ sites: [...siteNames], ...defaultRange(), team: "", agent: "" });
  const state = { draft: freshFilter(), applied: freshFilter(), page: 1, size: 20, expanded: new Set(), error: "", sitesInitialized: false };
  let context = {};

  // 独立的会员与事件样例，按所选时间聚合，不再以佣金账期生成报表。
  function makeAgent(team, agentIndex) {
    const seed = team.teamIndex * 19 + agentIndex * 7;
    const members = 76 + (team.teamIndex * 17) % 118 + agentIndex * 21;
    const memberSamples = Array.from({ length: members }, (_, index) => {
      const recent = index < 18;
      const registrationDay = recent ? -17 + index : -120 - index;
      const registrationTime = `${dayAt(registrationDay)} 08:00:00`;
      const firstDepositTime = registrationDay + 2 <= 0 ? `${dayAt(registrationDay + 2)} 09:15:00` : null;
      const activity = [];
      for (let offset = -29; offset <= 0; offset += 1) {
        if (offset < registrationDay + 2 || (index + offset + seed) % 4 !== 0) continue;
        const amount = 100 + (index + seed) % 20 * 50;
        activity.push({
          depositAt: `${dayAt(offset)} 09:15:00`, withdrawAt: `${dayAt(offset)} 12:20:00`,
          betAt: `${dayAt(offset)} 14:30:00`, bonusAt: `${dayAt(offset)} 16:40:00`, rebateAt: `${dayAt(offset)} 21:45:00`,
          depositAmount: amount, withdrawAmount: Math.round(amount * .6), betAmount: amount * 8,
          profitLossAmount: (index % 3 === 0 ? -1 : 1) * amount * .2,
          bonusAmount: index % 3 === 0 ? 20 : 0, rebateAmount: amount * .08
        });
      }
      // 首存也进入存款金额，后续充值单独累计。
      if (firstDepositTime) activity.push({ depositAt: firstDepositTime, depositAmount: 200 });
      return { registrationTime, firstDepositTime, activity };
    });
    return {
      siteName: team.siteName,
      agentName: team.accounts[agentIndex],
      teamName: team.teamName,
      agentType: agentIndex === 0 ? "团队代理多线（负责人）" : "团队代理多线（副线）",
      members, memberSamples,
      teamId: team.teamId,
      teamKey: `${team.siteName}|${team.teamId}`
    };
  }

  function agentStatistics(agent, range) {
    const inRange = (time) => Boolean(time) && (!range.start || time >= range.start) && (!range.end || time <= range.end);
    const result = { ...agent, ...Object.fromEntries(numericFields.map((key) => [key, 0])), members: agent.members };
    const eventFields = { depositAmount: "depositAt", withdrawAmount: "withdrawAt", betAmount: "betAt", profitLossAmount: "betAt", bonusAmount: "bonusAt", rebateAmount: "rebateAt" };
    for (const member of agent.memberSamples) {
      const registered = inRange(member.registrationTime);
      const active = member.activity.some((event) => event.betAmount > 0 && inRange(event.betAt));
      result.registrations += Number(registered);
      result.firstDeposits += Number(inRange(member.firstDepositTime));
      result.activeMembers += Number(active);
      result.newActiveMembers += Number(registered && active);
      for (const event of member.activity) {
        for (const [field, timeField] of Object.entries(eventFields)) {
          if (inRange(event[timeField])) result[field] += event[field] || 0;
        }
      }
    }
    return result;
  }

  const allGroups = teams.map((team) => ({
      siteName: team.siteName,
      agentName: `${team.teamName}（汇总）`,
      teamName: team.teamName,
      agentType: "团队",
      teamId: team.teamId,
      teamKey: `${team.siteName}|${team.teamId}`,
      agents: team.accounts.map((_, agentIndex) => makeAgent(team, agentIndex))
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
    const date = (state.draft.start || `${today} 00:00:00`).slice(0, 10).split("-").map(Number);
    const timeControl = context.dateControl({ year: date[0], month: date[1], startDay: date[2], endDay: date[2], empty: !state.draft.start });
    return `<section class="risk1261-filter-panel annotated" data-component-id="F01">${context.badge?.("F01") || ""}<div class="risk1261-filter-grid">${siteSelector()}<label class="risk1261-field"><span>团队名称</span><input type="text" value="${e(state.draft.team)}" placeholder="请输入团队名称" data-risk1261-keyword="team" /></label><label class="risk1261-field"><span>代理名称</span><input type="text" value="${e(state.draft.agent)}" placeholder="负责人或副线代理账号" data-risk1261-keyword="agent" /></label><div class="risk1261-field risk1261-date-field"><span>统计时间</span>${timeControl}</div><div class="risk1261-filter-actions"><button type="button" class="main-action" data-risk1261-search>查询</button><button type="button" class="secondary-action" data-risk1261-reset>重置</button></div>${state.error ? `<p class="risk1261-error" role="alert">${e(state.error)}</p>` : ""}</div></section>`;
  }

  function matchingGroups() {
    const filter = state.applied;
    const teamTerm = filter.team.trim().toLowerCase();
    const agentTerm = filter.agent.trim().toLowerCase();
    return allGroups.filter((group) => {
      if (!filter.sites.includes(group.siteName)) return false;
      if (teamTerm && !`${group.teamName} ${group.teamId}`.toLowerCase().includes(teamTerm)) return false;
      if (agentTerm && !group.agents.some((agent) => agent.agentName.toLowerCase().includes(agentTerm))) return false;
      return true;
    }).map((group) => {
      const statisticsTime = `${filter.start} 至 ${filter.end}`;
      const agents = group.agents.map((agent) => ({ ...agentStatistics(agent, filter), statisticsTime, matched: Boolean(agentTerm) && agent.agentName.toLowerCase().includes(agentTerm) }));
      const aggregate = { ...group, agents, statisticsTime };
      numericFields.forEach((field) => { aggregate[field] = agents.reduce((sum, agent) => sum + agent[field], 0); });
      return aggregate;
    }).sort((left, right) => left.siteName.localeCompare(right.siteName, "zh-CN") || left.teamName.localeCompare(right.teamName, "zh-CN"));
  }

  function valueCell(row, field, aggregate = false) {
    const value = row[field.key];
    if (field.key === "statisticsTime") return `<td class="risk1261-statistics-time">${e(value || "—")}</td>`;
    if (field.kind === "count") return `<td class="risk1261-number">${numberFormat(value)}</td>`;
    if (field.kind === "money") return `<td class="risk1261-number risk1261-money">${moneyFormat(value)}</td>`;
    if (field.kind === "agent") return `<td class="risk1261-agent-name${row.matched ? " is-match" : ""}">${aggregate ? `<strong>${e(value)}</strong><small>团队汇总</small>` : `<strong>${e(value)}</strong>`}</td>`;
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
      team: root.querySelector('[data-risk1261-keyword="team"]')?.value.trim() || "",
      agent: root.querySelector('[data-risk1261-keyword="agent"]')?.value.trim() || ""
    };
  }

  function bindStatisticsTime(root) {
    const field = root.querySelector(".risk1261-date-field");
    context.bindDates();
    const trigger = field.querySelector("[data-date-trigger]");
    const popover = field.querySelector(".agent-498-date-popover");
    const refreshLabel = () => {
      trigger.innerHTML = `<span>${e(state.draft.start || "开始时间")}</span><b>至</b><span>${e(state.draft.end || "结束时间")}</span>`;
    };
    refreshLabel();
    trigger.addEventListener("click", () => {
      if (popover.hidden) return;
      popover.querySelectorAll(".calendar-panel").forEach((panel) => {
        const side = panel.dataset.rangeSide;
        const value = state.draft[side] || `${today} ${side === "start" ? "00:00:00" : "23:59:59"}`;
        const [year, month, day] = value.slice(0, 10).split("-").map(Number);
        Object.assign(panel.dataset, { year, month });
        panel.querySelector("header strong").textContent = `${year}年${month}月`;
        panel.querySelector(".calendar-days").innerHTML = '<span></span>'.repeat((new Date(year, month - 1, 1).getDay() + 6) % 7) + Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => `<button type="button" class="calendar-day${index + 1 === day ? " selected" : ""}" data-day="${index + 1}">${index + 1}</button>`).join("");
        panel.querySelector("input[type='time']").value = value.slice(11);
      });
    });
    field.querySelector(".date-apply").addEventListener("click", () => {
      if (!popover.hidden) return;
      const values = [...trigger.querySelectorAll("span")].map((span) => span.textContent);
      state.draft.start = values[0].length === 16 ? `${values[0]}:00` : values[0];
      state.draft.end = values[1].length === 16 ? `${values[1]}:00` : values[1];
      refreshLabel();
    });
    field.querySelector(".site-695-date-clear").addEventListener("click", () => {
      state.draft.start = ""; state.draft.end = ""; refreshLabel();
    });
    popover.addEventListener("keydown", (event) => {
      if (event.key === "Escape") field.querySelector(".date-close").click();
    });
  }

  function bind(helpers = {}) {
    context = { ...context, ...helpers };
    const root = document.querySelector(".risk1261-app");
    if (!root) return;
    const rerender = context.rerender || (() => {});
    bindStatisticsTime(root);
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
    root.querySelectorAll("[data-risk1261-keyword]").forEach((input) => input.addEventListener("change", () => readDraft(root)));
    root.querySelectorAll("[data-risk1261-keyword]").forEach((input) => input.addEventListener("input", () => readDraft(root)));
    root.querySelector("[data-risk1261-search]")?.addEventListener("click", () => {
      readDraft(root);
      if (!state.draft.start || !state.draft.end) {
        state.error = "请选择完整的统计时间范围。";
      } else if (state.draft.start > state.draft.end) {
        state.error = "统计开始时间不能晚于统计结束时间。";
      } else {
        state.error = "";
        state.applied = { ...state.draft, sites: [...state.draft.sites] };
        state.page = 1;
        state.expanded.clear();
        if (state.applied.agent) matchingGroups().forEach((group) => state.expanded.add(group.teamKey));
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
