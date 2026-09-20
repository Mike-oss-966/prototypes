(function () {
  "use strict";

  const sites = ["XY体育", "拉布布", "WC体育", "CS体育", "YY体育", "NS体育", "DW体育"];
  const agentTypes = ["团队主线", "团队副线", "团队单线"];
  const teams = [
    { id: "TM10001", name: "华东团队", site: "XY体育" },
    { id: "TM10002", name: "江南单线", site: "XY体育" },
    { id: "TM20001", name: "北辰团队", site: "拉布布" },
    { id: "TM30001", name: "远航团队", site: "WC体育" },
    { id: "TM40001", name: "先锋团队", site: "CS体育" },
    { id: "TM50001", name: "启明星团队", site: "YY体育" },
    { id: "TM60001", name: "海岚团队", site: "NS体育" },
    { id: "TM70001", name: "卓越团队", site: "DW体育" }
  ];
  const agents = [
    ["XY体育", "agent_mike", "AG10086", "团队主线", "华东团队", "TM10001", true, "2025-11-06 10:18:22", "2026-01-03 09:20:10"],
    ["XY体育", "east_sub_01", "AG10112", "团队副线", "华东团队", "TM10001", false, "2026-01-19 14:08:35", "2026-02-01 12:03:18"],
    ["XY体育", "south_line", "AG10201", "团队单线", "江南单线", "TM10002", true, "2026-02-05 16:30:42", "2026-02-05 16:30:42"],
    ["拉布布", "north_leader", "AG20116", "团队主线", "北辰团队", "TM20001", true, "2025-12-16 08:46:30", "2026-01-01 10:00:00"],
    ["拉布布", "north_sub_02", "AG20208", "团队副线", "北辰团队", "TM20001", false, "2026-03-11 15:06:19", "2026-03-15 09:12:22"],
    ["WC体育", "voyage_main", "AG30107", "团队主线", "远航团队", "TM30001", true, "2025-10-28 09:50:13", "2025-12-01 10:20:00"],
    ["CS体育", "pioneer_main", "AG40108", "团队单线", "先锋团队", "TM40001", true, "2026-01-11 13:20:16", "2026-01-11 13:20:16"],
    ["YY体育", "morning_main", "AG50102", "团队主线", "启明星团队", "TM50001", true, "2025-09-21 12:10:09", "2025-11-06 09:30:00"],
    ["YY体育", "morning_sub", "AG50219", "团队副线", "启明星团队", "TM50001", false, "2026-02-14 20:18:33", "2026-02-18 11:40:08"],
    ["NS体育", "ocean_main", "AG60104", "团队主线", "海岚团队", "TM60001", true, "2025-12-06 18:25:40", "2026-01-09 14:10:00"],
    ["DW体育", "excellent_main", "AG70101", "团队单线", "卓越团队", "TM70001", true, "2026-01-07 11:58:02", "2026-01-07 11:58:02"]
  ].map(([site, account, id, type, teamName, teamId, leader, registeredAt, joinedAt]) => ({ site, account, id, type, teamName, teamId, leader, registeredAt, joinedAt }));

  const pad = (value) => String(value).padStart(2, "0");
  const dateText = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const shiftDate = (date, days) => {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  };
  const yesterday = dateText(shiftDate(new Date(), -1));
  const quickRanges = [["yesterday", "昨日"], ["week", "本周"], ["30", "30天"], ["90", "90天"], ["180", "180天"]];
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const money = (value) => Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rounded = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  const compareText = (left, right) => String(left).localeCompare(String(right), "zh-CN", { numeric: true });
  const defaultFilter = () => ({ sites: [...sites], type: "", agent: "", team: "", start: yesterday, end: yesterday });
  const state = { draft: defaultFilter(), applied: defaultFilter(), page: 1, size: 20, error: "", menuOpen: true };
  let context = {};
  let activePage = null;
  let excelPromise;
  let exportSequence = 0;
  const exportJobs = [];

  function seedRows() {
    const rows = [];
    for (let dayIndex = 0; dayIndex < 14; dayIndex += 1) {
      const date = dateText(shiftDate(new Date(), -(dayIndex + 1)));
      agents.forEach((agent, agentIndex) => {
        const seed = (dayIndex + 3) * 17 + (agentIndex + 5) * 23;
        const directMembers = 46 + (agentIndex * 13) % 132;
        const registrations = seed % 9;
        const firstDeposits = Math.min(registrations, seed % 5);
        const active = 8 + seed % Math.max(12, Math.floor(directMembers * 0.58));
        const newActive = Math.min(registrations, seed % 4);
        const deposit = rounded(28600 + seed * 193.67 + (agentIndex % 3) * 12800);
        const withdraw = rounded(15300 + seed * 121.46 + (dayIndex % 4) * 7600);
        const direction = (agentIndex + dayIndex) % 7 === 3 ? -1 : 1;
        const totalWinLoss = rounded(direction * (9600 + seed * 68.31));
        const activityReward = rounded(320 + seed * 1.71);
        const memberReferral = rounded(120 + seed * 0.86);
        const rebate = rounded(860 + seed * 2.27);
        const vipBenefit = rounded(180 + seed * 0.72);
        const bonus = rounded(260 + seed * 1.09);
        const interest = rounded(32 + seed * 0.17);
        const paymentFee = rounded((deposit + withdraw) * (0.0048 + (agentIndex % 3) * 0.0007));
        const operatingExpense = rounded(activityReward + memberReferral + rebate + vipBenefit + bonus + interest + paymentFee);
        rows.push({
          date,
          ...agent,
          directMembers,
          registrations,
          firstDeposits,
          active,
          newActive,
          deposit,
          withdraw,
          totalWinLoss,
          operatingExpense,
          paymentFee,
          netWinLoss: rounded(totalWinLoss - operatingExpense),
          siteDebt: rounded((agentIndex % 5 === 0 ? 36000 : agentIndex % 4 === 0 ? 12800 : 0) + dayIndex * (agentIndex % 5 === 0 ? 1300 : 0))
        });
      });
    }
    return rows;
  }

  const allRows = seedRows();

  function quickRange(key) {
    const today = new Date();
    const end = shiftDate(today, -1);
    if (key === "yesterday") return { start: dateText(end), end: dateText(end) };
    if (key === "week") {
      const monday = shiftDate(today, -((today.getDay() + 6) % 7));
      const start = monday > end ? end : monday;
      return { start: dateText(start), end: dateText(end) };
    }
    return { start: dateText(shiftDate(today, -Number(key))), end: dateText(end) };
  }

  function quickSelector() {
    return `<div class="agent1027-date-quick">${quickRanges.map(([key, label]) => { const range = quickRange(key); const active = state.draft.start === range.start && state.draft.end === range.end; return `<button type="button" data-agent1027-quick="${key}"${active ? ' class="active"' : ""}>${label}</button>`; }).join("")}</div>`;
  }

  function matchingRows() {
    const filter = state.applied;
    const agentTerm = filter.agent.trim().toLowerCase();
    const teamTerm = filter.team.trim().toLowerCase();
    return allRows.filter((row) => {
      if (!filter.sites.includes(row.site)) return false;
      if (filter.type && row.type !== filter.type) return false;
      if (agentTerm && !`${row.account} ${row.id}`.toLowerCase().includes(agentTerm)) return false;
      if (teamTerm && !`${row.teamName} ${row.teamId}`.toLowerCase().includes(teamTerm)) return false;
      if (row.date < filter.start || row.date > filter.end) return false;
      return true;
    }).sort((left, right) => {
      const dateOrder = right.date.localeCompare(left.date);
      if (dateOrder) return dateOrder;
      const siteOrder = compareText(left.site, right.site);
      if (siteOrder) return siteOrder;
      if (!left.teamName && right.teamName) return 1;
      if (left.teamName && !right.teamName) return -1;
      const teamOrder = compareText(left.teamName, right.teamName);
      if (teamOrder) return teamOrder;
      if (left.leader !== right.leader) return left.leader ? -1 : 1;
      return compareText(left.account, right.account) || compareText(left.id, right.id);
    });
  }

  function siteSelector() {
    const selected = state.draft.sites;
    const summary = selected.length === sites.length ? "全部站点" : selected.length ? `已选 ${selected.length} 个站点` : "请选择站点";
    return `<div class="agent1027-field agent1027-site-field"><label id="agent1027-site-label">所属站点</label><details class="agent1027-multi"><summary aria-labelledby="agent1027-site-label"><span data-agent1027-site-summary>${summary}</span><i aria-hidden="true"></i></summary><div class="agent1027-multi-menu"><label class="agent1027-check-all"><input type="checkbox" data-agent1027-sites-all${selected.length === sites.length ? " checked" : ""} />全选</label>${sites.map((site) => `<label><input type="checkbox" data-agent1027-site value="${escape(site)}"${selected.includes(site) ? " checked" : ""} />${escape(site)}</label>`).join("")}</div></details></div>`;
  }

  function suggestionField(kind, label, placeholder) {
    const value = state.draft[kind];
    return `<div class="agent1027-field agent1027-suggest-field" data-agent1027-suggest-field="${kind}"><label for="agent1027-${kind}">${label}</label><input id="agent1027-${kind}" type="text" value="${escape(value)}" placeholder="${escape(placeholder)}" autocomplete="off" data-agent1027-input="${kind}" /><div class="agent1027-suggestions" role="listbox" aria-label="${label}候选" hidden></div></div>`;
  }

  function typeSelector() {
    return `<div class="agent1027-field"><label for="agent1027-type">代理类型</label><select id="agent1027-type" data-agent1027-type><option value="">全部类型</option>${agentTypes.map((type) => `<option value="${type}"${state.draft.type === type ? " selected" : ""}>${type}</option>`).join("")}</select></div>`;
  }

  function filterPanel() {
    return `<section class="agent1027-filter annotated" data-component-id="F01">${context.badge?.("F01") || ""}<div class="agent1027-filter-grid">${siteSelector()}${typeSelector()}${suggestionField("agent", "代理账号/ID", "请输入代理账号或ID")}${suggestionField("team", "团队名称/ID", "请输入团队名称或ID")}<div class="agent1027-field agent1027-date-field"><div class="field-title-row agent1027-date-title"><label>日期范围</label>${quickSelector()}</div><div class="agent1027-date-range"><input type="date" value="${state.draft.start}" max="${yesterday}" aria-label="开始日期" data-agent1027-date="start" /><span>至</span><input type="date" value="${state.draft.end}" max="${yesterday}" aria-label="结束日期" data-agent1027-date="end" /></div>${state.error ? `<p class="agent1027-error" role="alert">${escape(state.error)}</p>` : ""}</div><div class="agent1027-actions"><button type="button" class="main-action" data-agent1027-search>筛选</button><button type="button" class="secondary-action" data-agent1027-reset>重置</button><button type="button" class="secondary-action agent1027-export annotated" data-component-id="B01" data-agent1027-export>${context.badge?.("B01") || ""}导出</button></div></div></section>`;
  }

  const columns = [100, 110, 150, 130, 140, 100, 110, 110, 110, 120, 140, 140, 190, 140, 150, 140, 140, 180, 180];
  const colgroup = `<colgroup>${columns.map((width) => `<col style="width:${width}px" />`).join("")}</colgroup>`;
  function amountCell(value, strong = false) {
    const className = value < 0 ? "agent1027-amount is-negative" : "agent1027-amount";
    return `<td class="${className}">${strong ? `<strong>${money(value)}</strong>` : money(value)}</td>`;
  }

  function dataRows(rows, offset) {
    if (!rows.length) return '<tr class="agent1027-empty"><td colspan="19">暂无符合条件的数据</td></tr>';
    return rows.map((row) => `<tr><td class="agent1027-sticky agent1027-sticky-date">${row.date}</td><td class="agent1027-sticky agent1027-sticky-site">${escape(row.site)}</td><td class="agent1027-sticky agent1027-sticky-agent"><div class="agent1027-agent"><strong>${escape(row.account)}</strong><span>${escape(row.id)}</span></div></td><td class="agent1027-type">${escape(row.type)}</td><td>${row.teamName ? `<div class="agent1027-team"><strong>${escape(row.teamName)}</strong></div>` : "-"}</td><td>${row.directMembers}</td><td>${row.registrations}</td><td>${row.firstDeposits}</td><td>${row.active}</td><td>${row.newActive}</td>${amountCell(row.deposit)}${amountCell(row.withdraw)}${amountCell(row.totalWinLoss, true)}${amountCell(row.operatingExpense)}${amountCell(row.paymentFee)}${amountCell(row.netWinLoss, true)}${amountCell(row.siteDebt)}<td>${row.registeredAt}</td><td>${row.joinedAt}</td></tr>`).join("");
  }

  function totalRow(rows) {
    const fields = ["directMembers", "registrations", "firstDeposits", "active", "newActive", "deposit", "withdraw", "totalWinLoss", "operatingExpense", "paymentFee", "netWinLoss", "siteDebt"];
    const totals = Object.fromEntries(fields.map((field) => [field, rounded(rows.reduce((sum, row) => sum + Number(row[field] || 0), 0))]));
    const count = (value) => Number(value || 0).toLocaleString("zh-CN");
    return `<tfoot><tr class="agent1027-total-row"><td class="agent1027-sticky agent1027-sticky-date"><strong>总计</strong></td><td class="agent1027-sticky agent1027-sticky-site">-</td><td class="agent1027-sticky agent1027-sticky-agent">-</td><td>-</td><td>-</td><td>${count(totals.directMembers)}</td><td>${count(totals.registrations)}</td><td>${count(totals.firstDeposits)}</td><td>${count(totals.active)}</td><td>${count(totals.newActive)}</td>${amountCell(totals.deposit, true)}${amountCell(totals.withdraw, true)}${amountCell(totals.totalWinLoss, true)}${amountCell(totals.operatingExpense, true)}${amountCell(totals.paymentFee, true)}${amountCell(totals.netWinLoss, true)}${amountCell(totals.siteDebt, true)}<td>-</td><td>-</td></tr></tfoot>`;
  }

  function pageItems(totalPages) {
    const values = [...new Set([1, totalPages, state.page - 2, state.page - 1, state.page, state.page + 1, state.page + 2].filter((page) => page >= 1 && page <= totalPages))].sort((a, b) => a - b);
    let previous = 0;
    return values.map((page) => {
      const gap = page - previous > 1 ? '<span class="agent1027-page-gap">...</span>' : "";
      previous = page;
      return `${gap}<button type="button" data-agent1027-page="${page}"${page === state.page ? ' class="active" aria-current="page"' : ""}>${page}</button>`;
    }).join("");
  }

  function pagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / state.size));
    state.page = Math.min(state.page, totalPages);
    return `<div class="full-pagination agent1027-pagination"><span>共 ${total} 条</span><select aria-label="每页数量" data-agent1027-size>${[10, 20, 50, 100, 200].map((size) => `<option value="${size}"${state.size === size ? " selected" : ""}>${size}条/页</option>`).join("")}</select><button type="button" aria-label="上一页" data-agent1027-page="${state.page - 1}"${state.page === 1 ? " disabled" : ""}>‹</button>${pageItems(totalPages)}<button type="button" aria-label="下一页" data-agent1027-page="${state.page + 1}"${state.page === totalPages ? " disabled" : ""}>›</button><label>前往 <input type="number" min="1" max="${totalPages}" value="${state.page}" aria-label="跳转页码" data-agent1027-jump /> 页</label></div>`;
  }

  function tablePanel() {
    const rows = matchingRows();
    const offset = (state.page - 1) * state.size;
    const pageRows = rows.slice(offset, offset + state.size);
    return `<section class="agent1027-table-card annotated" data-component-id="T01">${context.badge?.("T01") || ""}<div class="risk-table-wrap agent1027-table-wrap" data-page-scroll><table class="risk-table agent1027-table">${colgroup}<thead><tr><th class="agent1027-sticky agent1027-sticky-date">日期</th><th class="agent1027-sticky agent1027-sticky-site">所属站点</th><th class="agent1027-sticky agent1027-sticky-agent">代理账号</th><th>代理类型</th><th>团队名称</th><th>下级会员</th><th>日注册人数</th><th>日首存人数</th><th class="annotated" data-component-id="R01">${context.badge?.("R01") || ""}日活跃人数</th><th>日新增活跃</th><th>日存款金额 CNY</th><th>日提款金额 CNY</th><th class="agent1027-total-win-heading">日总输赢(平台视角) CNY</th><th class="annotated" data-component-id="R02">${context.badge?.("R02") || ""}日运营费用 CNY</th><th>日充提手续费 CNY</th><th>日净输赢 CNY</th><th class="annotated" data-component-id="R03">${context.badge?.("R03") || ""}欠站点总额 CNY</th><th>注册代理时间</th><th>加入团队时间</th></tr></thead><tbody>${dataRows(pageRows, offset)}</tbody>${totalRow(rows)}</table></div>${pagination(rows.length)}</section>`;
  }

  const timeText = (date = new Date()) => `${dateText(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

  function exportStatus(job) {
    const statusClass = job.status === "已完成" ? "is-completed" : job.status === "失败" ? "is-failed" : "is-processing";
    return `<span class="agent1027-export-status ${statusClass}">${job.status}</span>`;
  }

  function exportJobRows() {
    return exportJobs.map((job) => `<tr><td><span class="agent1027-export-file" title="${escape(job.fileName)}">${escape(job.fileName)}</span></td><td>${exportStatus(job)}</td><td>${job.status === "已完成" ? job.rows.length.toLocaleString("zh-CN") : "--"}</td><td>${escape(job.submittedAt)}</td><td>${escape(job.completedAt || "--")}</td><td>${escape(job.expiresAt || "--")}</td><td>${escape(job.failureReason || "--")}</td><td><button type="button" class="agent1027-download-action" data-agent1027-download="${escape(job.id)}"${job.status === "已完成" ? "" : " disabled"}>下载</button></td></tr>`).join("");
  }

  function downloadListBody() {
    return `<div class="agent1027-download-list"><div class="agent1027-download-toolbar"><button type="button" class="secondary-action" data-agent1027-export-refresh>↻ 刷新</button></div><div class="agent1027-download-table-wrap"><table class="risk-table agent1027-download-table"><colgroup><col style="width:250px"><col style="width:105px"><col style="width:105px"><col style="width:170px"><col style="width:170px"><col style="width:170px"><col style="width:170px"><col style="width:88px"></colgroup><thead><tr><th>文件名称</th><th>状态</th><th>导出条数</th><th>提交时间</th><th>完成时间</th><th>过期时间</th><th>失败原因</th><th>操作</th></tr></thead><tbody>${exportJobRows()}</tbody></table></div></div>`;
  }

  function bindDownloadActions() {
    const root = document.getElementById("modal-root");
    const refreshButton = root?.querySelector("[data-agent1027-export-refresh]");
    if (refreshButton && !refreshButton.dataset.agent1027Bound) {
      refreshButton.dataset.agent1027Bound = "true";
      refreshButton.addEventListener("click", updateDownloadList);
    }
    root?.querySelectorAll("[data-agent1027-download]").forEach((button) => button.addEventListener("click", () => downloadExport(button.dataset.agent1027Download, button)));
  }

  function updateDownloadList() {
    const tbody = document.querySelector("#modal-root .agent1027-download-table tbody");
    if (!tbody) return;
    tbody.innerHTML = exportJobRows();
    bindDownloadActions();
  }

  function openDownloadList() {
    context.modal?.("下载文件列表", downloadListBody(), "关闭", '<footer class="agent1027-download-footer" hidden></footer>');
    document.querySelector("#modal-root .risk-modal")?.classList.add("agent1027-download-modal");
    bindDownloadActions();
  }

  function excel() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    excelPromise ||= new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./assets/vendor/xlsx-0.20.3.min.js";
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => { excelPromise = null; script.remove(); reject(new Error("Excel组件加载失败，请刷新页面后重试")); };
      document.head.append(script);
    });
    return excelPromise;
  }

  function excelDate(value) {
    const [datePart, timePart = "00:00:00"] = String(value).split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
  }

  async function downloadExport(jobId, button) {
    const job = exportJobs.find((item) => item.id === jobId && item.status === "已完成");
    if (!job) return;
    button.disabled = true;
    button.textContent = "下载中";
    try {
      const xlsx = await excel();
      const headers = ["日期", "所属站点", "代理账号", "代理类型", "团队名称", "下级会员", "日注册人数", "日首存人数", "日活跃人数", "日新增活跃", "日存款金额 CNY", "日提款金额 CNY", "日总输赢(平台视角) CNY", "日运营费用 CNY", "日充提手续费 CNY", "日净输赢 CNY", "欠站点总额 CNY", "注册代理时间", "加入团队时间"];
      const data = [headers, ...job.rows.map((row) => [excelDate(row.date), row.site, `${row.account}\n${row.id}`, row.type, row.teamName || "-", row.directMembers, row.registrations, row.firstDeposits, row.active, row.newActive, row.deposit, row.withdraw, row.totalWinLoss, row.operatingExpense, row.paymentFee, row.netWinLoss, row.siteDebt, excelDate(row.registeredAt), row.joinedAt === "-" ? "-" : excelDate(row.joinedAt)])];
      const sheet = xlsx.utils.aoa_to_sheet(data, { cellDates: true });
      sheet["!cols"] = [12, 12, 22, 12, 16, 12, 12, 12, 12, 12, 18, 18, 24, 18, 18, 18, 18, 22, 22].map((wch) => ({ wch }));
      sheet["!autofilter"] = { ref: `A1:S${data.length}` };
      for (let rowIndex = 2; rowIndex <= data.length; rowIndex += 1) {
        if (sheet[`A${rowIndex}`]) sheet[`A${rowIndex}`].z = "yyyy-mm-dd";
        ["R", "S"].forEach((column) => { if (sheet[`${column}${rowIndex}`]) sheet[`${column}${rowIndex}`].z = "yyyy-mm-dd hh:mm:ss"; });
        ["F", "G", "H", "I", "J"].forEach((column) => { if (sheet[`${column}${rowIndex}`]) sheet[`${column}${rowIndex}`].z = "#,##0"; });
        ["K", "L", "M", "N", "O", "P", "Q"].forEach((column) => { if (sheet[`${column}${rowIndex}`]) sheet[`${column}${rowIndex}`].z = "#,##0.00"; });
      }
      const book = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(book, sheet, "代理当日数据");
      xlsx.writeFile(book, job.fileName, { cellDates: true, compression: true });
    } catch (error) {
      job.status = "失败";
      job.failureReason = error.message || "文件生成失败";
      updateDownloadList();
      return;
    }
    button.disabled = false;
    button.textContent = "下载";
  }

  function queueExport(job) {
    Promise.all([excel(), new Promise((resolve) => window.setTimeout(resolve, 900))]).then(() => {
      const completed = new Date();
      const expires = new Date(completed);
      expires.setDate(expires.getDate() + 7);
      job.status = "已完成";
      job.completedAt = timeText(completed);
      job.expiresAt = timeText(expires);
      updateDownloadList();
    }).catch((error) => {
      job.status = "失败";
      job.failureReason = error.message || "文件生成失败";
      updateDownloadList();
    });
  }

  function openExport() {
    const rows = matchingRows();
    context.select?.("B01", "component");
    if (!rows.length) {
      context.modal?.("下载文件列表", "<p>当前筛选条件下暂无可导出的数据。</p>", "关闭");
      return;
    }
    const submitted = new Date();
    const stamp = timeText(submitted).replace(/\D/g, "");
    const job = {
      id: `agent1027-export-${Date.now()}-${exportSequence += 1}`,
      fileName: `代理当日数据_${state.applied.start.replaceAll("-", "")}-${state.applied.end.replaceAll("-", "")}_${stamp}.xlsx`,
      status: "生成中",
      submittedAt: timeText(submitted),
      completedAt: "",
      expiresAt: "",
      failureReason: "",
      rows: rows.map((row) => ({ ...row }))
    };
    exportJobs.unshift(job);
    exportJobs.splice(8);
    openDownloadList();
    queueExport(job);
  }

  function body() {
    return `${filterPanel()}${tablePanel()}`;
  }

  function render(page, api) {
    activePage = page;
    context = api || {};
    return `<div class="agent1027-page" data-agent1027-root>${body()}</div>`;
  }

  function sidebar(page) {
    const badge = context.badge?.("N01") || '<span class="component-badge">N01</span>';
    const menuItems = [
      "代理管理",
      "返佣方案",
      "代理佣金结算",
      "佣金记录",
      "冲正统计报表",
      "冲正回款报表",
      "负盈利代理佣金结算",
      "负盈利代理佣金报表",
      page.name,
      "团队代理管理",
      "代理收益看板",
      "结算周期设置",
      "修改代理关系记录",
      "域名管理",
      "彩票盘口设置"
    ];
    const menuHtml = menuItems.map((name) => {
      if (name !== page.name) {
        return `<span class="agent1027-menu-item is-context" aria-disabled="true"><b aria-hidden="true"></b>${name}</span>`;
      }
      return `<a href="#requirement/%231027/page/${page.key}" class="agent1027-menu-item active annotated" data-component-id="N01" aria-current="page">${badge}<b aria-hidden="true"></b><span>${escape(name)}</span><em class="menu-change-badge is-new">新增</em></a>`;
    }).join("");
    return `<aside class="risk-sidebar agent1027-sidebar"><div class="agent1027-brand"><span>C</span><div><strong>总控后台管理系统</strong><small>运营管理中心</small></div></div><nav><section class="agent1027-menu-group"><button type="button" class="agent1027-menu-parent" data-agent1027-menu-toggle aria-expanded="${state.menuOpen}"><span class="agent1027-menu-icon" aria-hidden="true"></span><span>代理管理</span><i class="${state.menuOpen ? "open" : ""}" aria-hidden="true"></i></button><div class="agent1027-menu-children"${state.menuOpen ? "" : " hidden"}>${menuHtml}</div></section></nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>总控管理员</small></div></div></aside>`;
  }

  function candidates(kind) {
    const selectedSites = state.draft.sites;
    const source = kind === "agent" ? agents : teams;
    const term = state.draft[kind].trim().toLowerCase();
    const linkedTerm = state.draft[kind === "agent" ? "team" : "agent"].trim().toLowerCase();
    return source.filter((item) => selectedSites.includes(item.site)).filter((item) => {
      if (kind === "agent" && state.draft.type && item.type !== state.draft.type) return false;
      if (kind === "team" && state.draft.type && !state.draft.type.startsWith("团队")) return false;
      const text = kind === "agent" ? `${item.account} ${item.id}` : `${item.name} ${item.id}`;
      return !term || text.toLowerCase().includes(term);
    }).filter((item) => {
      if (!linkedTerm) return true;
      if (kind === "agent") return `${item.teamName} ${item.teamId}`.toLowerCase().includes(linkedTerm);
      return agents.some((agent) => agent.site === item.site && agent.teamId === item.id && `${agent.account} ${agent.id}`.toLowerCase().includes(linkedTerm));
    }).slice(0, 8);
  }

  function suggestionHtml(kind) {
    const options = candidates(kind);
    if (!options.length) return '<p class="agent1027-no-suggestion">无匹配结果</p>';
    return options.map((item) => {
      const primary = kind === "agent" ? item.account : item.name;
      return `<button type="button" role="option" data-agent1027-option="${kind}" data-value="${escape(primary)}"><strong>${escape(primary)}</strong><span>${escape(item.id)} · ${escape(item.site)}</span></button>`;
    }).join("");
  }

  function refresh() {
    const root = document.querySelector("[data-agent1027-root]");
    if (!root) return;
    root.innerHTML = body();
    bindRoot(root);
    context.bindLinks?.();
  }

  function bindSiteSelector(root) {
    const all = root.querySelector("[data-agent1027-sites-all]");
    const checkboxes = [...root.querySelectorAll("[data-agent1027-site]")];
    const update = () => {
      state.draft.sites = checkboxes.filter((input) => input.checked).map((input) => input.value);
      all.checked = state.draft.sites.length === sites.length;
      all.indeterminate = state.draft.sites.length > 0 && state.draft.sites.length < sites.length;
      const label = state.draft.sites.length === sites.length ? "全部站点" : state.draft.sites.length ? `已选 ${state.draft.sites.length} 个站点` : "请选择站点";
      root.querySelector("[data-agent1027-site-summary]").textContent = label;
      const allowedAgents = agents.filter((item) => state.draft.sites.includes(item.site));
      const allowedTeams = teams.filter((item) => state.draft.sites.includes(item.site));
      if (state.draft.agent && !allowedAgents.some((item) => `${item.account} ${item.id}`.toLowerCase().includes(state.draft.agent.toLowerCase()))) {
        state.draft.agent = "";
        root.querySelector('[data-agent1027-input="agent"]').value = "";
      }
      if (state.draft.team && !allowedTeams.some((item) => `${item.name} ${item.id}`.toLowerCase().includes(state.draft.team.toLowerCase()))) {
        state.draft.team = "";
        root.querySelector('[data-agent1027-input="team"]').value = "";
      }
    };
    all?.addEventListener("change", () => {
      checkboxes.forEach((input) => { input.checked = all.checked; });
      update();
    });
    checkboxes.forEach((input) => input.addEventListener("change", update));
  }

  function bindSuggestions(root) {
    root.querySelectorAll("[data-agent1027-suggest-field]").forEach((field) => {
      const kind = field.dataset.agent1027SuggestField;
      const input = field.querySelector("input");
      const list = field.querySelector(".agent1027-suggestions");
      const show = () => {
        list.innerHTML = suggestionHtml(kind);
        list.hidden = false;
        list.querySelectorAll("[data-agent1027-option]").forEach((button) => button.addEventListener("mousedown", (event) => {
          event.preventDefault();
          state.draft[kind] = button.dataset.value;
          input.value = button.dataset.value;
          list.hidden = true;
        }));
      };
      input.addEventListener("focus", show);
      input.addEventListener("input", () => { state.draft[kind] = input.value; show(); });
      input.addEventListener("blur", () => { state.draft[kind] = input.value.trim(); input.value = state.draft[kind]; setTimeout(() => { list.hidden = true; }, 120); });
    });
  }

  function validateDates() {
    if (!state.draft.start || !state.draft.end) return "请选择完整的日期范围";
    if (state.draft.start > state.draft.end) return "开始日期不能晚于结束日期";
    if (state.draft.end > yesterday || state.draft.start > yesterday) return "日期最晚只能选择昨天";
    if (!state.draft.sites.length) return "请至少选择一个所属站点";
    return "";
  }

  function bindFilters(root) {
    bindSiteSelector(root);
    bindSuggestions(root);
    root.querySelector("[data-agent1027-type]")?.addEventListener("change", (event) => {
      state.draft.type = event.target.value;
    });
    root.querySelectorAll("[data-agent1027-date]").forEach((input) => input.addEventListener("change", () => {
      state.draft[input.dataset.agent1027Date] = input.value;
      state.error = "";
    }));
    root.querySelectorAll("[data-agent1027-quick]").forEach((button) => button.addEventListener("click", () => {
      const range = quickRange(button.dataset.agent1027Quick);
      state.draft.start = range.start;
      state.draft.end = range.end;
      state.error = "";
      refresh();
    }));
    root.querySelector("[data-agent1027-search]")?.addEventListener("click", () => {
      state.draft.agent = state.draft.agent.trim();
      state.draft.team = state.draft.team.trim();
      state.error = validateDates();
      if (state.error) { refresh(); return; }
      state.applied = { ...state.draft, sites: [...state.draft.sites] };
      state.page = 1;
      refresh();
    });
    root.querySelector("[data-agent1027-reset]")?.addEventListener("click", () => {
      state.draft = defaultFilter();
      state.applied = defaultFilter();
      state.page = 1;
      state.error = "";
      refresh();
    });
    root.querySelector("[data-agent1027-export]")?.addEventListener("click", openExport);
  }

  function bindPagination(root) {
    root.querySelectorAll("[data-agent1027-page]").forEach((button) => button.addEventListener("click", () => {
      if (button.disabled) return;
      state.page = Number(button.dataset.agent1027Page);
      refresh();
    }));
    root.querySelector("[data-agent1027-size]")?.addEventListener("change", (event) => {
      state.size = Number(event.target.value);
      state.page = 1;
      refresh();
    });
    root.querySelector("[data-agent1027-jump]")?.addEventListener("change", (event) => {
      const next = Math.max(1, Math.min(Number(event.target.max), Number(event.target.value) || 1));
      if (next === state.page) { event.target.value = next; return; }
      state.page = next;
      refresh();
    });
  }

  function bindRoot(root) {
    bindFilters(root);
    bindPagination(root);
  }

  function bind() {
    const root = document.querySelector("[data-agent1027-root]");
    if (root) bindRoot(root);
    const toggle = document.querySelector("[data-agent1027-menu-toggle]");
    toggle?.addEventListener("click", () => {
      state.menuOpen = !state.menuOpen;
      toggle.setAttribute("aria-expanded", String(state.menuOpen));
      toggle.querySelector("i")?.classList.toggle("open", state.menuOpen);
      const children = document.querySelector(".agent1027-menu-children");
      if (children) children.hidden = !state.menuOpen;
    });
  }

  window.AgentDaily1027 = { render, sidebar, bind };
})();
