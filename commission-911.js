(function () {
  "use strict";
  const sites = ["XY体育", "拉布布", "WC体育", "CS体育", "YY体育", "NS体育", "DW体育"];
  const modes = { MULTI: "负盈利多线负责人", SINGLE: "负盈利单线", SUBLINE: "负盈利副线", STAR: "星级代理", LEVEL: "多层级代理" };
  const statuses = { PENDING_GRANT: "待发放", PARTIALLY_GRANTED: "部分发放", GRANTED: "已发放", NO_GRANT_CARRIED: "不发放已结转", REDUCED_GRANTED: "调减后已发放", NO_COMMISSION: "无佣金", NO_COMMISSION_CARRY: "无佣金结转", CARRY_FORWARD: "历史数据结转", DEBT_OUTSTANDING: "欠款待回收", DEBT_REPAID: "欠款已回收" };
  const e = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const money = (cents) => (Number(cents || 0) / 100).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  const href = (key) => `#requirement/%23911/page/${key}`;
  const badge = (id) => context.badge(id);
  const marked = (id, body, extra = "") => `<div class="annotated ${extra}" data-component-id="${id}">${badge(id)}${body}</div>`;
  let context = {};
  let activePage;
  let paneResizeObserver;
  const role = "MULTI";
  let toast = "";
  let sequence = 40;
  const views = {};
  const bills = [];
  const payouts = [];
  const col = (key, label, width = 125, type = "") => ({ key, label, width, type });
  const billColumns = [
    col("siteName", "站点", 110), col("agentName", "代理名称", 135), col("cycleNo", "佣金周期", 190),
    col("teamName", "团队名称", 150), col("leaderAgentId", "代理编号", 110), col("agentIdentity", "代理身份"), col("upperAccount", "上级代理"),
    col("totalWinLoss", "总输赢", 140, "money"), col("historicalWinLoss", "历史总输赢", 150, "money"),
    col("operatingExpense", "运营费用", 140, "money"), col("historicalTotalOperatingExpense", "历史运营费用", 150, "money"),
    col("venueFee", "三方场馆费用", 150, "money"), col("depositWithdrawFee", "充提手续费", 150, "money"),
    col("rebateLevelLabel", "返佣等级"), col("commissionRate", "返佣比例"), col("historicalCommission", "历史结余佣金", 155, "money"),
    col("commissionNetIncome", "佣金净收益", 145, "money"), col("siteDebtAmount", "欠站点总额度", 150, "money"),
    col("commissionAdjustment", "佣金调整", 140, "money"), col("commissionAmount", "佣金", 135, "money"),
    { ...col("paid", "已发放佣金", 160, "money"), added: true }, { ...col("remaining", "剩余佣金", 160, "money"), added: true },
    col("commissionStatus", "佣金状态", 155), col("becomeAgentTime", "成为代理时间", 180), col("joinTeamTime", "加入团队时间", 180),
    col("grantBy", "发放人"), col("grantTime", "发放时间", 180), col("adjustReason", "调整原因", 180)
  ];
  const reportColumns = [
    ...billColumns.slice(0, 3), col("statisticsPeriod", "统计时间", 245), ...billColumns.slice(3, 5),
    col("agentType", "代理类型"), col("referrerAccount", "代理推荐人"), col("developerName", "发展人"), billColumns[5], col("lineMode", "代理层级"),
    col("upperAccount", "上级账号"), col("teamMemberCount", "团队人数"), col("memberCount", "下级会员"), col("registeredCount", "注册人数"),
    col("firstDepositCount", "首存人数"), col("activeMemberCount", "活跃人数"), col("newActiveCount", "新增活跃人数", 140),
    col("rechargeAmount", "存款金额", 145, "money"), col("withdrawAmount", "提款金额", 145, "money"), ...billColumns.slice(7, 16),
    col("netWinLoss", "净输赢", 140, "money"), billColumns[16], col("siteDebtAmount", "欠站点总额", 145, "money"), billColumns[19], ...billColumns.slice(23, 25)
  ];
  function seed() {
    for (let i = 0; i < 14; i++) {
      const agent = i % 7;
      const cents = [10000000, 4500000, 7800000, 960000, 0, 0, 3200000][agent];
      const b = {
        id: `NP2026${i < 7 ? "0831" : "0815"}${String(i + 1).padStart(4, "0")}`,
        siteName: sites[agent], agentName: `agent_${10086 + agent}`, leaderAgentId: `AG${10086 + agent}`,
        teamName: agent % 2 ? "单线团队" : ["华东团队", "南区团队", "北区团队"][agent % 3],
        cycleNo: i < 7 ? "2026-08-16 至 2026-08-31" : "2026-08-01 至 2026-08-15",
        lineMode: agent % 2 ? "SINGLE" : "MULTI", payable: cents, paid: 0, remaining: cents,
        commissionAmount: cents, commissionNetIncome: cents, commissionStatus: "PENDING_GRANT", agentIdentity: agent % 3 ? "普通代理" : "官方代理",
        upperAccount: "-", historicalCommission: 0, historicalWinLoss: 0, siteDebtAmount: 0, commissionAdjustment: 0,
        totalWinLoss: cents * 3, operatingExpense: cents / 10, venueFee: cents * .3, depositWithdrawFee: cents / 10,
        historicalTotalOperatingExpense: 0, commissionRate: "40%", rebateLevelLabel: "返佣3级", grantBy: "-", grantTime: "-", adjustReason: "-",
        becomeAgentTime: "2026-03-02 10:15:00", joinTeamTime: "2026-03-02 10:15:00", auditStatus: i === 6 ? "已驳回" : "已审核",
        statisticsPeriod: i < 7 ? "2026-08-16 至 2026-08-31" : "2026-08-01 至 2026-08-15", agentType: "团队代理", referrerAccount: "referrer_008",
        developerName: "渠道一组", teamMemberCount: agent % 2 ? 1 : 5, memberCount: 120 + i * 9, registeredCount: 18 + i,
        firstDepositCount: 12 + i, activeMemberCount: 60 + i * 2, newActiveCount: 9 + i, rechargeAmount: cents * 12, withdrawAmount: cents * 9, netWinLoss: cents * 2.5
      };
      if (!cents) b.commissionStatus = agent === 4 ? "NO_COMMISSION" : "DEBT_OUTSTANDING";
      if (agent === 5) b.siteDebtAmount = 120000;
      bills.push(b);
      if (i === 0) { addPayout(b, 2000000, "PART", "2026-09-02 10:12:00", "finance_01"); addPayout(b, 1000000, "PART", "2026-09-04 14:20:31", "finance_02"); }
      if (i === 2 || i === 7 || i === 8) addPayout(b, cents, "ALL", `2026-${i < 7 ? "09-03" : "08-18"} 11:05:16`, "finance_01");
      if (i === 3 || i === 9) addPayout(b, Math.round(cents / 2), "PART", "2026-09-05 15:30:10", "finance_02");
      if (i === 10) { b.remaining = 0; b.commissionAmount = 0; b.commissionStatus = "NO_GRANT_CARRIED"; b.adjustReason = "原账单不发放并结转"; }
    }
  }
  function addPayout(b, amount, mode, time, operator) {
    b.paid += amount;
    b.remaining = b.payable - b.paid;
    b.commissionStatus = b.remaining ? "PARTIALLY_GRANTED" : "GRANTED";
    b.grantBy = operator; b.grantTime = time;
    const record = { id: `CG20260909${String(++sequence).padStart(6, "0")}`, billId: b.id, siteName: b.siteName, agentName: b.agentName,
      leaderAgentId: b.leaderAgentId, teamName: b.teamName, cycleNo: b.cycleNo, time, amount, mode, paidAfter: b.paid, remainingAfter: b.remaining,
      payable: b.payable, operator, batch: payouts.filter((p) => p.billId === b.id).length + 1 };
    payouts.push(Object.freeze(record));
    return record;
  }
  seed();
  bills.push({ ...bills[1], id: "NP202608319001", siteName: "XY体育", agentName: "agent_10201", leaderAgentId: "AG10201", teamName: "江南单线" });
  const portal = (page = activePage) => page.key.split("-")[0];
  const allowed = () => portal() !== "agent" || ["MULTI", "SINGLE"].includes(role);
  function state(page = activePage) {
    return views[page.key] || (views[page.key] = { filter: {}, page: 1, size: 20 });
  }
  function sourceBills() {
    if (!allowed()) return [];
    if (portal() === "site") return bills.filter((b) => b.siteName === "XY体育");
    if (portal() === "agent") return bills.filter((b) => b.agentName === (role === "SINGLE" ? "agent_10087" : "agent_10086"));
    return bills;
  }
  function publicStatus(b) {
    if (b.commissionStatus === "NO_GRANT_CARRIED") return "不发放已结转";
    if (b.payable <= 0) return "无可发佣金";
    return b.remaining === 0 ? "已发完" : b.paid > 0 ? "部分发放" : "待发放";
  }
  function publicBill(b) {
    return { id: b.id, cycleNo: b.cycleNo, agentName: b.agentName, leaderAgentId: b.leaderAgentId, lineMode: b.lineMode,
      payable: b.commissionStatus === "NO_GRANT_CARRIED" ? 0 : b.payable, paid: b.paid, remaining: b.remaining, progress: publicStatus(b), latestTime: b.grantTime };
  }
  function rowsForPage() {
    const s = state(), f = s.filter;
    const isPayout = activePage.key === "control-payouts-911";
    let rows = isPayout ? [...payouts] : sourceBills();
    rows = rows.filter((r) => {
      if (portal() === "control" && f.sites && !f.sites.includes(r.siteName)) return false;
      if (f.agent && !`${r.agentName} ${r.leaderAgentId}`.toLowerCase().includes(f.agent.toLowerCase())) return false;
      if (f.team && !r.teamName.toLowerCase().includes(f.team.toLowerCase())) return false;
      if (f.cycle && f.cycle !== r.cycleNo) return false;
      if (f.status && f.status !== (portal() === "control" ? r.commissionStatus : publicStatus(r))) return false;
      if (f.mode && f.mode !== r.mode) return false;
      if (f.order && !r.id.includes(f.order)) return false;
      if (f.operator && !r.operator?.toLowerCase().includes(f.operator.toLowerCase())) return false;
      if (f.start && r.time < f.start) return false;
      if (f.end && r.time > f.end) return false;
      return true;
    });
    rows.sort((a, b) => isPayout ? b.time.localeCompare(a.time) || b.id.localeCompare(a.id) : b.cycleNo.localeCompare(a.cycleNo) || b.id.localeCompare(a.id));
    return portal() === "control" ? rows : rows.map(publicBill);
  }
  function button(text, action, extra = "") { return `<button type="button" class="n911-button ${extra}" data-n911-action="${action}">${text}</button>`; }
  function select(label, key, options, disabled = false) {
    const f = state().filter;
    return `<label class="n911-field${disabled ? " n911-muted" : ""}"><span>${label}</span><select data-n911-filter="${key}" ${disabled ? "disabled" : ""}>${options.map((o) => { const [value, title] = Array.isArray(o) ? o : [o, o]; return `<option value="${e(value)}"${f[key] === value ? " selected" : ""}>${e(title)}</option>`; }).join("")}</select></label>`;
  }
  function settlementStatusFilter() {
    const value = state().filter.status || "";
    const label = statuses[value] || "全部状态";
    return `<div class="n911-field"><span id="n911-status-label">佣金状态</span><input type="hidden" data-n911-filter="status" value="${e(value)}" /><details class="n911-select-details n911-status-select"><summary aria-labelledby="n911-status-label n911-status-value" aria-haspopup="listbox"><span id="n911-status-value" class="${value === "PARTIALLY_GRANTED" ? "" : "n911-legacy-option"}">${e(label)}</span></summary><div class="n911-options" role="listbox" aria-label="佣金状态">${[["", "全部状态"], ...Object.entries(statuses)].map(([key, name]) => `<button type="button" role="option" aria-selected="${key === value}" data-n911-status="${key}" class="${key === "PARTIALLY_GRANTED" ? "n911-new-option" : "n911-legacy-option"}">${e(name)}</button>`).join("")}</div></details></div>`;
  }
  function input(label, key, placeholder, disabled = false) {
    return `<label class="n911-field${disabled ? " n911-muted" : ""}"><span>${label}</span><input type="text" data-n911-filter="${key}" value="${e(state().filter[key])}" placeholder="${e(placeholder)}" ${disabled ? "disabled" : ""} /></label>`;
  }
  function siteFilter(disabled = false) {
    const selected = state().filter.sites || sites;
    return `<div class="n911-field${disabled ? " n911-muted" : ""}"><span>所属站点</span><details class="n911-select-details" ${disabled ? "inert" : ""}><summary>${selected.length === sites.length ? "全部站点" : `已选 ${selected.length} 个站点`}</summary><div class="n911-options"><label><input type="checkbox" data-n911-sites-all ${selected.length === sites.length ? "checked" : ""} />全选</label>${sites.map((site) => `<label><input type="checkbox" data-n911-site value="${e(site)}" ${selected.includes(site) ? "checked" : ""} />${e(site)}</label>`).join("")}</div></details></div>`;
  }
  function agentField() {
    return `<div class="n911-agent-input">${input("代理账号/编号", "agent", "输入账号或编号搜索")}<div class="n911-agent-options" hidden></div></div>`;
  }
  function suggestionField(label, key, placeholder) {
    return `<div class="n911-agent-input" data-n911-suggest="${key}">${input(label, key, placeholder)}<div class="n911-agent-options" id="n911-${key}-options" role="listbox" aria-label="${label}" hidden></div></div>`;
  }
  function filterPanel() {
    const legacy = activePage.key === "control-settlement-911" || activePage.key === "control-report-911";
    const report = activePage.key === "control-report-911";
    const records = activePage.key === "control-payouts-911";
    const cycles = [...new Set(sourceBills().map((b) => b.cycleNo))].sort().reverse();
    let fields = portal() === "control" ? siteFilter(legacy) : "";
    fields += select("佣金周期", "cycle", [["", "全部周期"], ...cycles], legacy);
    if (legacy) {
      if (report) fields += input("统计开始日期", "startDate", "开始日期", true) + input("统计结束日期", "endDate", "结束日期", true);
      fields += select("代理身份", "identity", [["", "全部身份"], "官方代理", "普通代理"], true);
      if (!report) fields += settlementStatusFilter() + select("审核状态", "audit", [["", "全部状态"], "待审核", "已审核", "已驳回"], true);
      if (report) fields += input("代理推荐人", "referrer", "请输入代理推荐人账号", true) + input("发展人", "developer", "请输入发展人", true) + input("代理账号", "agent", "请输入主线/副线代理账号", true);
      if (report) fields += `<div class="n911-field n911-muted"><span>字段筛选</span><details class="n911-select-details n911-columns" inert><summary>已选 ${reportColumns.length} 项</summary></details></div>`;
      fields += input("代理/团队", "keyword", "团队编号、名称、代理ID或账号", true);
    } else {
      if (portal() !== "agent") fields += agentField();
      if (records) {
        fields += suggestionField("团队名称", "team", "输入团队名称搜索");
        fields += select("发放方式", "mode", [["", "全部"], ["ALL", "全部发放"], ["PART", "分批发放"]]);
        fields += `<div class="n911-field n911-time-field"><span>发放时间</span>${context.dateControl({ year: 2026, month: 9, startDay: 1, endDay: 9, endTime: "16:00:00", empty: true })}</div>`;
        fields += input("单号", "order", "请输入发放单号") + suggestionField("操作员", "operator", "请输入管理员账号");
      } else fields += select("发放状态", "status", [["", "全部"], "待发放", "部分发放", "已发完", "不发放已结转", "无可发佣金"]);
    }
    const controls = `<div class="n911-filter-actions${report ? " n911-muted" : ""}">${button('<span aria-hidden="true">⌕</span> 筛选', "search", "n911-primary")}${report ? button("刷新实时数据", "none") : ""}${button('<span aria-hidden="true">↻</span> 重置', "reset")}</div>`;
    const body = `<form class="n911-filter-form"><div class="n911-filter-grid">${fields}</div>${controls}</form>`;
    return report ? `<div class="n911-filter-panel">${body}</div>` : marked("F01", body, "n911-filter-panel");
  }
  function navTabs() {
    if (!["control-settlement-911", "control-payouts-911"].includes(activePage.key)) return "";
    const tabs = `<nav class="n911-tabs"><a href="${href("control-settlement-911")}" class="${activePage.key === "control-settlement-911" ? "active" : ""}">负盈利代理佣金结算</a><a href="${href("control-payouts-911")}" class="${activePage.key === "control-payouts-911" ? "active" : ""}">佣金发放记录 <em class="n911-new">新增</em></a></nav>`;
    return activePage.key === "control-settlement-911" ? marked("N01", tabs) : tabs;
  }
  function pagination(total, modal = false, page = state().page, size = state().size) {
    const pages = Math.max(1, Math.ceil(total / size));
    return `<div class="n911-pagination${modal ? " n911-modal-pagination" : ""}"><span>共 ${total} 条</span><select aria-label="每页条数" data-n911-size>${[10, 20, 50, 100, 200].map((n) => `<option value="${n}" ${n === size ? "selected" : ""}>${n}条/页</option>`).join("")}</select><button type="button" data-n911-page="${page - 1}" ${page <= 1 ? "disabled" : ""} aria-label="上一页">‹</button>${Array.from({ length: pages }, (_, i) => `<button type="button" data-n911-page="${i + 1}" class="${page === i + 1 ? "active" : ""}">${i + 1}</button>`).join("")}<button type="button" data-n911-page="${page + 1}" ${page >= pages ? "disabled" : ""} aria-label="下一页">›</button><label>前往 <input type="number" min="1" max="${pages}" value="${page}" aria-label="跳转页码" data-n911-jump /> 页</label></div>`;
  }
  function cell(c, r, report) {
    const value = r[c.key];
    if (c.key === "commissionStatus") return `<span class="n911-status ${r.commissionStatus === "PARTIALLY_GRANTED" ? "warning" : r.commissionStatus === "GRANTED" ? "success" : ""}">${e(statuses[value])}</span>`;
    if (c.type === "money") return `<strong class="n911-money">${money(value)}</strong>`;
    if (report && c.key === "lineMode") return r.lineMode === "MULTI" ? "【多线】" : "【单线】";
    return e(value || "-");
  }
  function billTable(rows, report = false) {
    const settlementColumns = [...billColumns.slice(0, 2), ...billColumns.filter((c) => c.added), ...billColumns.slice(2).filter((c) => !c.added)];
    const columns = report ? reportColumns : settlementColumns;
    const s = state();
    const pageRows = rows.slice((s.page - 1) * s.size, s.page * s.size);
    const head = columns.map((c) => `<th style="min-width:${c.width}px" class="${c.added ? "n911-added-head" : "n911-muted-cell"}">${e(c.label)}${c.type === "money" ? "（CNY）" : ""}</th>`).join("");
    let actionAnnotated = false;
    const body = pageRows.map((r, i) => {
      const canPay = r.remaining > 0 && r.auditStatus !== "已驳回" && ["PENDING_GRANT", "PARTIALLY_GRANTED"].includes(r.commissionStatus);
      const showBadge = canPay && !actionAnnotated;
      if (canPay) actionAnnotated = true;
      const actions = report ? "" : `<td class="n911-sticky-action">${canPay ? `<button type="button" class="n911-link${showBadge ? " annotated" : ""}" ${showBadge ? 'data-component-id="B01"' : ""} data-n911-pay="${r.id}">${showBadge ? badge("B01") : ""}发放</button>` : "-"}${canPay && !r.paid ? '<button type="button" disabled class="n911-link n911-muted">不发放</button><button type="button" disabled class="n911-link n911-muted">修改发放</button>' : ""}</td>`;
      return `<tr><td class="n911-muted-cell"><button type="button" disabled class="n911-link" aria-label="展开生产明细">›</button></td><td class="n911-muted-cell">${(s.page - 1) * s.size + i + 1}</td>${columns.map((c) => `<td class="${c.added || (c.key === "commissionStatus" && r.paid > 0 && r.remaining > 0) ? "" : "n911-muted-cell"}">${cell(c, r, report)}</td>`).join("")}${actions}</tr>`;
    }).join("");
    const summary = columns.map((c) => `<td class="${c.added ? "" : "n911-muted-cell"}">${c.type === "money" ? money(pageRows.reduce((sum, r) => sum + (r[c.key] || 0), 0)) : "-"}</td>`).join("");
    return `<div class="n911-table-scroll"><table class="n911-table" data-upper-agent-columns-normalized="true"><thead><tr><th class="n911-muted-cell"></th><th class="n911-muted-cell">序号</th>${head}${report ? "" : '<th class="n911-sticky-action">操作</th>'}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length + 3}" class="n911-empty">暂无数据</td></tr>`}</tbody><tfoot><tr><td></td><td class="n911-muted-cell">当前页总计</td>${summary}${report ? "" : '<td class="n911-sticky-action"></td>'}</tr></tfoot></table></div>${pagination(rows.length)}`;
  }
  const payoutColumns = [col("time", "发放时间", 180), col("siteName", "所属站点"), col("agentName", "代理账号", 140), col("leaderAgentId", "代理编号"),
    col("teamName", "团队名称", 145), col("cycleNo", "佣金周期", 190), col("batch", "批次", 75), col("mode", "发放方式"),
    col("amount", "本次发放金额", 170, "money"), col("paidAfter", "已发放佣金（本次后）", 200, "money"), col("remainingAfter", "剩余佣金（本次后）", 190, "money"),
    col("operator", "操作员"), col("id", "单号", 200), col("billId", "账单编号", 200)];
  function plainTable(rows, columns, { summary, operations = false } = {}) {
    return `<div class="n911-table-scroll"><table class="n911-table"><thead><tr><th>序号</th>${columns.map((c) => `<th style="min-width:${c.width}px">${e(c.label)}${c.type === "money" ? "（CNY）" : ""}</th>`).join("")}${operations ? '<th class="n911-sticky-action n911-narrow-action">操作</th>' : ""}</tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td>${columns.map((c) => `<td>${c.type === "money" ? `<strong class="n911-money">${money(r[c.key])}</strong>` : c.key === "mode" ? (r.mode === "ALL" ? "全部发放" : "分批发放") : c.key === "progress" ? `<span class="n911-status ${r.remaining ? "warning" : "success"}">${e(r.progress)}</span>` : c.key === "lineMode" ? e(modes[r.lineMode]) : e(r[c.key] ?? "-")}</td>`).join("")}${operations ? `<td class="n911-sticky-action n911-narrow-action"><button class="n911-link annotated" data-component-id="M01" type="button" data-n911-detail="${r.id}">${badge("M01")}发放明细</button></td>` : ""}</tr>`).join("") || `<tr><td colspan="${columns.length + 2}" class="n911-empty">暂无${operations ? "佣金账单" : "发放记录"}</td></tr>`}</tbody>${summary ? `<tfoot><tr><td>总计</td>${columns.map((c) => `<td>${Object.hasOwn(summary, c.key) ? money(summary[c.key]) : "-"}</td>`).join("")}${operations ? '<td class="n911-sticky-action"></td>' : ""}</tr></tfoot>` : ""}</table></div>`;
  }
  function recordsTable(rows) {
    const s = state();
    return marked("T01", plainTable(rows.slice((s.page - 1) * s.size, s.page * s.size), payoutColumns, { summary: { amount: rows.reduce((sum, r) => sum + r.amount, 0) } })) + pagination(rows.length);
  }
  function portalTable(rows) {
    const columns = [col("cycleNo", "佣金周期", 190), ...(portal() === "site" ? [col("agentName", "代理账号", 145), col("leaderAgentId", "代理编号"), col("lineMode", "代理模式", 175)] : []),
      col("payable", "应发佣金", 145, "money"), col("paid", "已发放佣金", 155, "money"), col("remaining", "剩余佣金", 155, "money"), col("progress", "发放状态", 140), col("latestTime", "最近发放时间", 185)];
    const summary = Object.fromEntries(["payable", "paid", "remaining"].map((k) => [k, rows.reduce((sum, r) => sum + r[k], 0)]));
    const s = state();
    return marked("T01", plainTable(rows.slice((s.page - 1) * s.size, s.page * s.size), columns, { summary, operations: true })) + pagination(rows.length);
  }
  function formulaGuide(report) {
    const formulas = [["运营费用", "活动奖励 + 会员推会员 + 返水 + VIP福利 + 彩金 + 余额宝利息"], ["总运营费用", "运营费用 + 三方场馆费用 + 充提手续费"], ["净输赢", "（总输赢 + 历史总输赢）-（总运营费用 + 历史运营费用）"], ["欠款前净佣金", "净输赢 × 返佣比例 + 历史结余佣金"], ["佣金净收益", "欠款前净佣金 - 历史欠款；正向收益优先自动回款，剩余金额才可发放"], ["欠站点总额", "历史欠款 - 本期回款 + 本期新增垫付"], ["佣金", "扣除历史欠款并完成自动回款后的最终可发放佣金"]];
    return `<section class="n911-formula n911-muted"><h3>负盈利代理佣金${report ? "报表" : "结算"}口径</h3><dl>${formulas.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl><p>${report ? "统计日期按周期区间重叠筛选；推荐数据只读展示，不参与团队人数、等级、佣金和总计。" : "本页用于账单核对与最终处理；未达等级且总输赢为正时，仅结转经营数据，不进入佣金公式。"}</p></section>`;
  }
  function render(page, helpers) {
    activePage = page; context = { ...context, ...helpers };
    if (!allowed()) return '<div class="n911-no-access">无访问权限</div>';
    const report = page.key === "control-report-911";
    const legacy = report || page.key === "control-settlement-911";
    const rows = rowsForPage();
    state().page = Math.min(state().page, Math.max(1, Math.ceil(rows.length / state().size)));
    return `<div class="n911-content" data-n911-view="${page.key}">${navTabs()}<header class="n911-heading${legacy ? " n911-muted" : ""}"><div><h2>${e(page.name)}</h2>${legacy ? `<p>${report ? "当前周期按 30 秒级实时快照动态预估并自动刷新；已结算周期继续展示不可变账单快照。" : "按站点结算周期核对团队账单快照；等级 0 账单只结转经营数据，不进入佣金公式。"}</p>` : ""}</div>${legacy ? '<div class="n911-export-actions"><button disabled class="n911-button">导出</button><button disabled class="n911-button">下载记录</button></div>' : ""}</header>${toast ? `<div class="n911-toast" role="status">${e(toast)}</div>` : ""}${filterPanel()}<div class="n911-results">${legacy ? billTable(rows, report) : portal() === "control" ? recordsTable(rows) : portalTable(rows)}</div>${legacy ? formulaGuide(report) : ""}</div>`;
  }
  function sidebar(page) {
    const p = portal(page), control = p === "control";
    const links = control ? [["control-settlement-911", "负盈利代理佣金结算", false]] : allowed() ? [[`${p}-report-911`, "佣金报表", true]] : [];
    return `<aside class="risk-sidebar n911-sidebar"><div class="n911-brand"><span>${control ? "C" : p === "site" ? "S" : "A"}</span><strong>${control ? "总控" : p === "site" ? "站点" : "代理"}后台管理系统</strong></div><nav><button type="button" class="n911-menu-parent" data-n911-menu-toggle aria-expanded="true"><span aria-hidden="true">▤</span>${control ? "代理管理" : "财务管理"}<i></i></button><div class="n911-menu-children">${links.map(([key, name, added]) => `<a href="${href(key)}" class="${page.key === key || (key === "control-settlement-911" && page.key === "control-payouts-911") ? "active" : ""}">${e(name)}${added ? ' <em class="n911-new">新增</em>' : ""}</a>`).join("")}</div></nav><div class="risk-user"><span>${control ? "F" : "A"}</span><div><strong>${control ? "finance_01" : p === "site" ? "site_xy" : role === "SINGLE" ? "agent_10087" : "agent_10086"}</strong><small>${control ? "总控管理员" : p === "site" ? "站点管理员" : e(modes[role])}</small></div></div></aside>`;
  }
  function endpoints(page) {
    return `<div class="prototype-endpoint-switch">${[["control", "总控后台", "control-settlement-911"], ["site", "站点后台", "site-report-911"], ["agent", "代理后台", "agent-report-911"]].map(([p, name, key]) => `<a href="${href(key)}" class="${portal(page) === p ? "active" : ""}">${name}</a>`).join("")}</div>`;
  }
  function readFilter() {
    const f = {};
    document.querySelectorAll(".n911-filter-form [data-n911-filter]").forEach((el) => { f[el.dataset.n911Filter] = el.value.trim(); });
    if (portal() === "control") f.sites = [...document.querySelectorAll("[data-n911-site]:checked")].map((el) => el.value);
    const spans = document.querySelectorAll(".n911-time-field .risk-range > span");
    if (spans.length === 2 && /^\d{4}-\d{2}-\d{2}/.test(spans[0].textContent)) [f.start, f.end] = [...spans].map((el) => el.textContent);
    state().filter = f; state().page = 1;
  }
  function rerender() { context.rerender(); }
  function showError(message) { const el = document.querySelector(".n911-form-error"); if (el) { el.textContent = message; el.hidden = false; } }
  function payModal(b) {
    const expectedRemaining = b.remaining;
    let selectedMode = "ALL", amount = expectedRemaining, submitting = false;
    const amountField = marked("M01", `<div class="n911-pay-values"><dl><div><dt>所属站点</dt><dd>${e(b.siteName)}</dd></div><div><dt>收款代理</dt><dd>${e(b.agentName)} / ${e(b.leaderAgentId)}</dd></div><div><dt>团队</dt><dd>${e(b.teamName)}</dd></div><div><dt>佣金周期</dt><dd>${e(b.cycleNo)}</dd></div><div><dt>应发佣金</dt><dd>${money(b.payable)} CNY</dd></div><div><dt>已发放佣金</dt><dd>${money(b.paid)} CNY</dd></div><div><dt>剩余佣金</dt><dd><strong>${money(expectedRemaining)} CNY</strong></dd></div></dl><fieldset class="n911-radio"><legend>发放方式</legend><label><input type="radio" name="n911-mode" value="ALL" checked />全部发放</label><label><input type="radio" name="n911-mode" value="PART" />分批发放</label></fieldset><label class="n911-amount-field" hidden><span>发放金额</span><div><input type="text" inputmode="decimal" aria-label="发放金额" placeholder="请输入发放金额" autocomplete="off" /><span>CNY</span></div></label></div>`);
    context.modal("发放佣金", `<div class="n911-pay-form">${amountField}<div class="n911-confirm-summary" hidden></div><p class="n911-form-error" role="alert" hidden></p></div>`, "", `<footer><button class="secondary-action modal-cancel">取消</button><button class="n911-button n911-primary" data-n911-pay-confirm>确认</button></footer>`);
    const root = document.getElementById("modal-root");
    const confirm = root.querySelector("[data-n911-pay-confirm]");
    let phase = "input";
    root.querySelectorAll('[name="n911-mode"]').forEach((r) => r.addEventListener("change", () => {
      selectedMode = r.value; root.querySelector(".n911-amount-field").hidden = selectedMode !== "PART";
      root.querySelector(".n911-form-error").hidden = true;
    }));
    root.querySelector(".n911-amount-field input").addEventListener("input", () => { root.querySelector(".n911-form-error").hidden = true; });
    confirm.addEventListener("click", () => {
      if (submitting) return;
      if (phase === "input") {
        if (selectedMode === "PART") {
          const raw = root.querySelector(".n911-amount-field input").value.trim();
          if (!raw) return showError("请输入发放金额");
          if (!/^\d+(\.\d{1,2})?$/.test(raw) || Number(raw) <= 0 || !Number.isSafeInteger(Math.round(Number(raw) * 100))) return showError("发放金额必须大于0，且最多保留2位小数");
          amount = Math.round(Number(raw) * 100);
          if (amount > expectedRemaining) return showError("发放金额不能大于剩余佣金");
        } else amount = expectedRemaining;
        root.querySelector(".n911-form-error").hidden = true;
        root.querySelector(".n911-pay-values").hidden = true;
        const summary = root.querySelector(".n911-confirm-summary"); summary.hidden = false;
        summary.innerHTML = `<p>确认向 <strong>${e(b.siteName)} / ${e(b.agentName)}</strong> 发放佣金？</p><dl><div><dt>本次发放金额</dt><dd><strong>${money(amount)} CNY</strong></dd></div><div><dt>发放后剩余</dt><dd>${money(expectedRemaining - amount)} CNY</dd></div></dl><button type="button" class="n911-link" data-n911-back>返回修改</button>`;
        summary.querySelector("[data-n911-back]").addEventListener("click", () => { phase = "input"; summary.hidden = true; root.querySelector(".n911-pay-values").hidden = false; confirm.textContent = "确认"; });
        phase = "confirm"; confirm.textContent = "确认发放";
        return;
      }
      if (b.remaining !== expectedRemaining || !["PENDING_GRANT", "PARTIALLY_GRANTED"].includes(b.commissionStatus)) return showError("剩余佣金已变化，请刷新后重新确认");
      submitting = true; confirm.disabled = true; confirm.textContent = "发放中...";
      root.querySelectorAll(".modal-cancel,.modal-close,[data-n911-back]").forEach((el) => { el.disabled = true; });
      window.setTimeout(() => {
        const now = new Date();
        const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${[now.getHours(), now.getMinutes(), now.getSeconds()].map((v) => String(v).padStart(2, "0")).join(":")}`;
        addPayout(b, amount, selectedMode, time, "finance_01");
        toast = `发放成功：${b.agentName} 本次到账 ${money(amount)} CNY，剩余 ${money(b.remaining)} CNY`;
        root.innerHTML = ""; rerender();
      }, 450);
    });
  }
  function details(billId) {
    const b = sourceBills().find((item) => item.id === billId);
    if (!b) return;
    const rows = payouts.filter((p) => p.billId === b.id).sort((a, z) => z.time.localeCompare(a.time) || z.id.localeCompare(a.id))
      .map((p) => ({ time: p.time, batch: p.batch, amount: p.amount, paidAfter: p.paidAfter, remainingAfter: p.remainingAfter, id: p.id }));
    let current = 1, size = 10;
    const paint = () => {
      const fields = payoutColumns.filter((c) => ["time", "batch", "amount", "paidAfter", "remainingAfter", "id"].includes(c.key));
      context.modal("佣金发放明细", `<div class="n911-detail-body"><p>${e(b.agentName)} / ${e(b.leaderAgentId)}　佣金周期：${e(b.cycleNo)}</p><div class="n911-detail-amounts"><span>应发佣金 <strong>${money(b.payable)}</strong></span><span>已发放佣金 <strong>${money(b.paid)}</strong></span><span>剩余佣金 <strong>${money(b.remaining)}</strong></span><span>CNY</span></div>${marked("M01", plainTable(rows.slice((current - 1) * size, current * size), fields))}${pagination(rows.length, true, current, size)}</div>`, "关闭");
      const root = document.getElementById("modal-root");
      root.querySelectorAll("[data-n911-page]").forEach((el) => el.addEventListener("click", () => { current = Number(el.dataset.n911Page); paint(); }));
      root.querySelector("[data-n911-size]").addEventListener("change", (ev) => { size = Number(ev.target.value); current = 1; paint(); });
      root.querySelector("[data-n911-jump]").addEventListener("change", (ev) => { current = Math.max(1, Math.min(Math.ceil(rows.length / size) || 1, Number(ev.target.value) || 1)); paint(); });
    };
    paint();
  }
  function bind(helpers) {
    context = { ...context, ...helpers };
    const app = document.getElementById("app");
    app.querySelector(".risk-app").classList.add("production-admin-ui-488", "n911-app");
    app.querySelector(".prototype-canvas").classList.add("n911-canvas");
    app.querySelector(".prototype-context nav").classList.add("prototype-endpoint-nav");
    const title = app.querySelector(".risk-topbar > div > span"); if (title) title.textContent = `${portal() === "control" ? "代理管理" : "财务管理"} /`;
    const modalRoot = document.getElementById("modal-root");
    modalRoot.classList.add("production-admin-ui-488", "n911-modal-root");
    const pane = app.querySelector(".prototype-pane");
    const updateModalWidth = () => modalRoot.style.setProperty("--n911-modal-width", `${pane.getBoundingClientRect().width}px`);
    paneResizeObserver?.disconnect();
    updateModalWidth();
    const observer = new ResizeObserver(() => { if (pane.isConnected) updateModalWidth(); else observer.disconnect(); });
    observer.observe(pane);
    paneResizeObserver = observer;
    if (activePage.key === "control-settlement-911") {
      const results = app.querySelector(".n911-results");
      results.setAttribute("data-component-id", "T01"); results.classList.add("annotated");
      results.insertAdjacentHTML("afterbegin", badge("T01"));
    }
    if (activePage.key === "control-report-911") app.querySelector(".n911-content").setAttribute("data-component-id", "P01");
    if (["control-report-911", "control-settlement-911"].includes(activePage.key)) {
      app.querySelectorAll('.n911-table tr').forEach((tr) => {
        let left = 0;
        [48, 60, 110, 135].forEach((width, index) => {
          const cell = tr.cells[index]; if (!cell || cell.colSpan > 1) return;
          cell.classList.add("n911-sticky-left"); cell.style.left = `${left}px`; cell.style.width = `${width}px`; cell.style.minWidth = `${width}px`; cell.style.maxWidth = `${width}px`; left += width;
        });
      });
    }
    const notices = app.querySelector(".spec-top-notices");
    const requirement = window.PROTOTYPE_DATA.requirements.find((r) => r.id === "#911");
    if (portal() === "agent") notices.insertAdjacentHTML("afterbegin", '<section class="n911-permission-notice">本菜单只为【负盈利多线负责人】和【负盈利单线】代理展示，其他所有模式都不展示此菜单。</section>');
    else if (activePage.key !== "control-payouts-911") notices.insertAdjacentHTML("beforeend", `<section class="scope-spec-note"><span>跨周期发放规则</span><p>${e(requirement.carryoverRule)}</p></section>`);
    if (["control-settlement-911", "control-report-911"].includes(activePage.key)) app.querySelector(".spec-top-notices").insertAdjacentHTML("beforeend", '<section class="comparison-spec-note"><span>对比说明</span><p>低对比度区域与生产一致，无需修改。仅突出新增字段、发放交互及部分发放状态。</p></section>');
    const f = state().filter;
    if (f.start) { const spans = app.querySelectorAll(".n911-time-field .risk-range > span"); if (spans.length === 2) { spans[0].textContent = f.start; spans[1].textContent = f.end; } }
    const statusSelect = app.querySelector(".n911-status-select");
    if (statusSelect) {
      const summary = statusSelect.querySelector("summary");
      const options = [...statusSelect.querySelectorAll("[data-n911-status]")];
      options.forEach((option) => option.addEventListener("click", () => {
        app.querySelector('[data-n911-filter="status"]').value = option.dataset.n911Status;
        const label = summary.querySelector("span");
        label.textContent = option.textContent;
        label.classList.toggle("n911-legacy-option", option.dataset.n911Status !== "PARTIALLY_GRANTED");
        options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
        statusSelect.open = false; summary.focus();
      }));
      statusSelect.addEventListener("keydown", (event) => {
        if (event.key === "Escape") { statusSelect.open = false; summary.focus(); }
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault(); statusSelect.open = true;
          const current = options.indexOf(document.activeElement);
          const index = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
          options[index].focus();
        }
      });
      statusSelect.addEventListener("focusout", (event) => { if (!statusSelect.contains(event.relatedTarget)) statusSelect.open = false; });
      app.querySelector(".detail-shell").addEventListener("click", (event) => { if (!statusSelect.contains(event.target)) statusSelect.open = false; });
    }
    app.querySelector("[data-n911-menu-toggle]")?.addEventListener("click", (ev) => { const button = ev.currentTarget; const children = app.querySelector(".n911-menu-children"); children.hidden = !children.hidden; button.setAttribute("aria-expanded", String(!children.hidden)); });
    app.querySelector(".n911-filter-form")?.addEventListener("submit", (ev) => { ev.preventDefault(); readFilter(); rerender(); });
    app.querySelectorAll("[data-n911-action]").forEach((el) => el.addEventListener("click", () => {
      if (activePage.key === "control-report-911") return;
      if (el.dataset.n911Action === "search") readFilter();
      if (el.dataset.n911Action === "reset") { state().filter = {}; state().page = 1; }
      toast = ""; rerender();
    }));
    app.querySelectorAll("[data-n911-pay]").forEach((el) => el.addEventListener("click", () => payModal(bills.find((b) => b.id === el.dataset.n911Pay))));
    app.querySelectorAll("[data-n911-detail]").forEach((el) => el.addEventListener("click", () => details(el.dataset.n911Detail)));
    app.querySelectorAll("[data-n911-page]").forEach((el) => el.addEventListener("click", () => { state().page = Number(el.dataset.n911Page); rerender(); }));
    app.querySelector("[data-n911-size]")?.addEventListener("change", (ev) => { state().size = Number(ev.target.value); state().page = 1; rerender(); });
    app.querySelector("[data-n911-jump]")?.addEventListener("change", (ev) => { state().page = Math.max(1, Math.min(Math.ceil(rowsForPage().length / state().size) || 1, Number(ev.target.value) || 1)); rerender(); });
    const updateSiteSummary = () => {
      const all = [...app.querySelectorAll("[data-n911-site]")];
      const count = all.filter((el) => el.checked).length;
      const checkAll = app.querySelector("[data-n911-sites-all]"); if (checkAll) { checkAll.checked = count === sites.length; checkAll.indeterminate = count > 0 && count < sites.length; }
      const summary = checkAll?.closest("details").querySelector("summary"); if (summary) summary.textContent = count === sites.length ? "全部站点" : `已选 ${count} 个站点`;
    };
    app.querySelector("[data-n911-sites-all]")?.addEventListener("change", (ev) => { app.querySelectorAll("[data-n911-site]").forEach((el) => { el.checked = ev.target.checked; }); updateSiteSummary(); });
    app.querySelectorAll("[data-n911-site]").forEach((el) => el.addEventListener("change", updateSiteSummary));
    app.querySelectorAll("[data-n911-suggest]").forEach((field) => {
      const key = field.dataset.n911Suggest;
      const inputEl = field.querySelector("input");
      const optionsEl = field.querySelector(".n911-agent-options");
      let selected = -1;
      inputEl.setAttribute("role", "combobox");
      inputEl.setAttribute("aria-autocomplete", "list");
      inputEl.setAttribute("aria-controls", optionsEl.id);
      inputEl.setAttribute("aria-expanded", "false");
      const close = () => { optionsEl.hidden = true; inputEl.setAttribute("aria-expanded", "false"); inputEl.removeAttribute("aria-activedescendant"); selected = -1; };
      const choose = (option) => { inputEl.value = option.dataset.suggestValue; close(); };
      const suggest = () => {
        const pickedSites = [...app.querySelectorAll("[data-n911-site]:checked")].map((el) => el.value);
        const candidates = [...new Set(payouts.filter((row) => pickedSites.includes(row.siteName)).map((row) => row[key === "team" ? "teamName" : "operator"]))]
          .filter((value) => value.toLowerCase().includes(inputEl.value.trim().toLowerCase())).sort((a, b) => a.localeCompare(b, "zh-CN"));
        optionsEl.innerHTML = candidates.length ? candidates.map((value, index) => `<button type="button" role="option" tabindex="-1" aria-selected="false" id="n911-${key}-option-${index}" data-suggest-value="${e(value)}">${e(value)}</button>`).join("") : '<span role="status">无匹配结果</span>';
        selected = -1; inputEl.removeAttribute("aria-activedescendant");
        optionsEl.hidden = false; inputEl.setAttribute("aria-expanded", "true");
        optionsEl.querySelectorAll("button").forEach((option) => {
          option.addEventListener("mousedown", (event) => event.preventDefault());
          option.addEventListener("click", () => choose(option));
        });
      };
      inputEl.addEventListener("focus", suggest);
      inputEl.addEventListener("input", suggest);
      inputEl.addEventListener("blur", close);
      inputEl.addEventListener("keydown", (event) => {
        if (event.key === "Escape") { event.preventDefault(); close(); return; }
        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          if (optionsEl.hidden) suggest();
          const options = [...optionsEl.querySelectorAll("button")];
          if (!options.length) return;
          selected = (selected + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
          options.forEach((option, index) => option.setAttribute("aria-selected", String(index === selected)));
          inputEl.setAttribute("aria-activedescendant", options[selected].id);
          options[selected].scrollIntoView({ block: "nearest" });
        }
        if (event.key === "Enter" && !optionsEl.hidden && selected >= 0) { event.preventDefault(); choose(optionsEl.querySelectorAll("button")[selected]); }
      });
    });
    const inputEl = app.querySelector('.n911-agent-input input');
    if (inputEl) {
      const optionsEl = app.querySelector(".n911-agent-options");
      const suggest = () => {
        const pickedSites = [...app.querySelectorAll("[data-n911-site]:checked")].map((el) => el.value);
        const candidates = [...new Map(sourceBills().filter((b) => portal() !== "control" || pickedSites.includes(b.siteName)).map((b) => [b.leaderAgentId, b])).values()]
          .filter((b) => `${b.agentName} ${b.leaderAgentId}`.toLowerCase().includes(inputEl.value.trim().toLowerCase()));
        optionsEl.innerHTML = candidates.length ? candidates.map((b) => `<button type="button" data-agent-value="${e(b.agentName)}">${e(b.agentName)} / ${e(b.leaderAgentId)}</button>`).join("") : '<span>无匹配代理</span>';
        optionsEl.hidden = false;
        optionsEl.querySelectorAll("button").forEach((el) => el.addEventListener("mousedown", (ev) => { ev.preventDefault(); inputEl.value = el.dataset.agentValue; optionsEl.hidden = true; }));
      };
      inputEl.addEventListener("focus", suggest); inputEl.addEventListener("input", suggest); inputEl.addEventListener("blur", () => { optionsEl.hidden = true; });
    }
  }
  window.Commission911 = { render, sidebar, endpoints, bind };
})();
