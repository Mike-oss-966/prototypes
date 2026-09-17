(function () {
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const pad = (value) => String(value).padStart(2, "0");
  const time = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const memberTypes = ["活动彩金", "平台红利", "线上活动", "线下红利", "晋升礼金", "生日礼金", "周礼金", "月礼金", "代理彩金", "官方代理红利", "负数置零"];
  const existingReportTypes = ["活动礼金", "晋升礼金", "周礼金", "月礼金", "活动彩金", "首充彩金", "首充奖励", "存款奖励", "投注返佣"];
  const newReportTypes = memberTypes.filter((type) => !existingReportTypes.includes(type));
  const transactionTypes = ["全部", "充值", "提现", "转账", "红利", "返水", "加币", "减币"];
  const features = { venueWallet: false, message: false };
  const walletTypes = ["中心钱包", ...(features.venueWallet ? ["场馆钱包"] : []), "代理佣金钱包"];
  const statuses = ["已派发", "已领取", "已过期"];
  const defaults = () => ({ site: "", wallet: "中心钱包", mode: "单笔发放", type: "", title: "", claim: "手动领取", days: "3", account: "", amount: "", venue: "", turnover: "无需流水限制", multiple: "", message: features.message ? "是" : "否", remark: "" });
  let form = defaults();
  let batch = { name: "", rows: [], errors: [], loading: false };
  let api;
  let currentPage;
  let records;
  let sequence = 1000;
  let excelPromise;
  let uploadVersion = 0;
  const menuOpen = { 财务管理: true, 运营报表: true };
  const history = { filters: {}, page: 1, size: 20, expanded: false };
  const report = { type: "", method: "", operator: "" };
  const extraHistoryKeys = ["wallet", "accountType", "id", "agent", ...(features.venueWallet ? ["venue"] : []), "title", "tags", "remark"];
  const mobile = { kind: "红利", status: "全部", period: "全部", expanded: "", limit: 20 };
  const isAgent = () => form.wallet === "代理佣金钱包";
  const href = (key) => `#requirement/%23510/page/${key}`;
  const badge = (id) => api.badge(id);
  const region = (id, contents, extra = "") => `<section class="bonus510-region annotated ${extra}" data-component-id="${id}">${badge(id)}${contents}</section>`;
  const select = (name, options, value = "", placeholder = "请选择", disabled = false) => `<select id="b510-${name}" name="${name}"${disabled ? " disabled" : ""}>${placeholder === null ? "" : `<option value="">${escape(placeholder)}</option>`}${options.map((item) => `<option${value === item ? " selected" : ""}>${escape(item)}</option>`).join("")}</select>`;
  const input = (name, placeholder, value = form[name], attrs = "") => `<input id="b510-${name}" name="${name}" value="${escape(value)}" placeholder="${escape(placeholder)}" autocomplete="off" ${attrs}>`;
  const field = (name, label, control, required = true) => `<div class="bonus510-field"><label for="b510-${name}">${required ? '<em>*</em>' : ""}${label}</label><div class="bonus510-control">${control}</div></div>`;
  const radios = (name, values) => `<div class="bonus510-radios" role="group" aria-label="${name === "wallet" ? "钱包类型" : name === "claim" ? "领取方式" : name === "turnover" ? "流水限制" : "站内信通知"}">${values.map((value) => `<label><input type="radio" name="${name}" value="${value}"${form[name] === value ? " checked" : ""}><span>${value}</span></label>`).join("")}</div>`;
  const roundSum = (rows) => rows.reduce((sum, row) => sum + Math.round(row.amount * 100), 0) / 100;
  const users = (site = form.site, agent = isAgent()) => site ? Array.from({ length: 8 }, (_, index) => ({
    account: agent ? ["agent_087", "agent_102", "agent_205", "north_star", "agent_510", "agent_620", "agent_730", "agent_840"][index] : ["member_10086", "summer_728", "player_2026", "member_22017", "member_510", "member_620", "member_730", "member_840"][index],
    id: String((agent ? 20000 : 10000) + api.sites.indexOf(site) * 100 + index + 1), site
  })) : [];
  const resolveUser = (value, site = form.site, agent = isAgent()) => users(site, agent).find((user) => user.account === value || user.id === value);
  function activities() { return form.site ? ["新会员首存礼", "体育周末加奖", "电子闯关活动", "会员专属回馈"].map((name, index) => ({ account: `${form.site} · ${name}`, id: `ACT${api.sites.indexOf(form.site) + 1}${pad(index + 1)}` })) : []; }
  function venues(site = form.site) { return !site ? [] : window.PROTOTYPE_VENUE_GAMES.filter((_, index) => site !== "拉布布" || index % 7 !== 0).map((venue) => venue.name); }
  function autocomplete(name, items, placeholder, disabled = false) {
    return `<div class="bonus510-autocomplete" data-b510-auto="${name}">${input(name, placeholder, form[name] || "", `role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="b510-options-${name}"${disabled ? " disabled" : ""}`)}<div id="b510-options-${name}" class="bonus510-options" role="listbox" hidden>${items.map((item) => `<button type="button" role="option" data-value="${escape(item.account)}" data-id="${escape(item.id)}"><strong>${escape(item.account)}</strong><small>${escape(item.id)}</small></button>`).join("")}<span class="bonus510-no-option" hidden>无匹配结果</span></div></div>`;
  }
  function initialize() {
    if (records) return;
    records = Array.from({ length: 42 }, (_, index) => {
      const agent = index % 7 === 6;
      const venueWallet = features.venueWallet && !agent && index % 4 === 1;
      const site = api.sites[index % api.sites.length];
      const issued = new Date(Date.now() - (index + 1) * 6 * 3600000);
      const expire = new Date(issued); expire.setDate(expire.getDate() + 3);
      const status = agent ? "已派发" : statuses[index % 3];
      return { site, account: agent ? "agent_087" : "member_10086", accountType: agent ? "代理" : "会员", id: `${agent ? "AB" : "BN"}${time(issued).replace(/\D/g, "")}${pad(index)}`, agent: "agent_087", agentId: "AG10386", tags: ["新会员", "高盈利会员", "大额存款关注"][index % 3], wallet: agent ? "代理佣金钱包" : venueWallet ? "场馆钱包" : "中心钱包", venue: venueWallet ? window.PROTOTYPE_VENUE_GAMES[index % 39].name : "-", type: agent ? "-" : memberTypes[index % memberTypes.length], title: agent ? "-" : ["会员专属回馈", "每周礼遇", "周末加奖", "生日祝福"][index % 4], multiple: !agent && index % 3 ? [1, 3, 5][index % 3] : 0, amount: 50 + index * 25.5, remark: ["运营活动发放", "会员关怀补发", "批量红利发放"][index % 3], issued: time(issued), received: !agent && status === "已领取" ? time(issued) : "-", expires: agent ? "-" : time(expire), status, method: index % 4 === 0 ? "系统派发" : "人工发放", recordSource: index % 4 === 0 ? "vip" : "backend", operator: index % 4 === 0 ? "系统" : "mike.ops", userId: "10001", vip: index % 11 };
    });
  }
  function endpoints(page) {
    return `<div class="prototype-endpoint-switch"><a class="${page.portal === "总控" ? "active" : ""}" href="${href("control-bonus-issue-510")}">总控后台</a><a class="${page.portal === "会员" ? "active" : ""}" href="${href("member-center-510")}">会员端</a></div><span class="current-page-label">${page.name}</span>`;
  }
  function sidebar(page) {
    const requirement = window.PROTOTYPE_DATA.requirements.find((item) => item.id === "#510");
    const group = (name, links) => `<section><button class="bonus510-menu-parent" type="button" data-b510-menu="${name}" aria-expanded="${menuOpen[name]}"><span class="risk-680-parent-icon" aria-hidden="true"></span><span>${name}</span><i></i></button><div class="bonus510-menu-children"${menuOpen[name] ? "" : " hidden"}>${links}</div></section>`;
    const item = (name, key, active, changed = false) => `<a href="${href(key)}" class="bonus510-menu-item${active ? " active" : ""}${changed ? "" : " bonus510-muted-menu"}"><span>${name}</span>${changed ? `<em class="menu-change-badge is-new">${name === "红利管理" ? "新增" : "修改"}</em>` : ""}</a>`;
    const finance = requirement.financeMenus.map(([key, name]) => item(name, `control-finance-${key}-510`, page.key === `control-finance-${key}-510`)).join("") + item("红利管理", "control-bonus-issue-510", ["control-bonus-issue-510", "control-bonus-history-510"].includes(page.key), true);
    return `<aside class="risk-sidebar bonus510-sidebar"><div class="bonus510-brand">总控后台管理系统</div><nav>${group("财务管理", finance)}${group("运营报表", item("礼金统计报表", "control-bonus-report-510", page.key === "control-bonus-report-510", true))}</nav></aside>`;
  }
  function tabs() {
    const navigation = `<nav class="bonus510-tabs" aria-label="红利管理三级菜单">${[["control-bonus-issue-510", "发放红利"], ["control-bonus-history-510", "历史记录"]].map(([key, name]) => `<a class="${currentPage.key === key ? "active" : ""}" href="${href(key)}">${name}</a>`).join("")}</nav>`;
    return currentPage.key === "control-bonus-issue-510" ? navigation : region("N01", navigation);
  }
  function batchContent() {
    return `<div class="bonus510-upload-actions"><button type="button" class="secondary-action" data-b510-template>下载模板</button><label class="main-action bonus510-file-button">${batch.loading ? "正在读取…" : "上传文件"}<input type="file" accept=".xlsx" data-b510-upload${!form.site || batch.loading ? " disabled" : ""}></label></div><p class="bonus510-hint">${form.site ? "支持 .xlsx 格式" : "请先选择站点"}</p>${batch.name ? `<div class="bonus510-file-name">${escape(batch.name)}<button type="button" data-b510-remove-file aria-label="移除文件">×</button></div>` : ""}${batch.rows.length && !batch.errors.length ? `<div class="bonus510-batch-summary" role="status"><span>总发放人数：<strong>${batch.rows.length}</strong> 人</span><span>总发放金额：<strong>${money(roundSum(batch.rows))}</strong> CNY</span></div>` : ""}${batch.errors.length ? `<div class="bonus510-errors" role="alert"><strong>文件校验未通过，请修正后重新上传</strong><ul>${batch.errors.map((error) => `<li>${escape(error)}</li>`).join("")}</ul></div>` : ""}`;
  }
  function issueForm() {
    const agent = isAgent();
    const scope = field("site", "所属站点", select("site", api.sites, form.site, "请选择站点")) + field("wallet", "钱包类型", radios("wallet", walletTypes)) + (form.wallet === "场馆钱包" ? field("venue", "选择场馆", select("venue", venues(), form.venue, form.site ? "请选择场馆" : "请先选择站点", !form.site)) : "");
    const mode = field("mode", "操作类型", `<div class="bonus510-segments" role="group" aria-label="操作类型">${["单笔发放", "批量发放"].map((value) => `<button type="button" data-b510-mode="${value}" class="${form.mode === value ? "active" : ""}" aria-pressed="${form.mode === value}">${value}</button>`).join("")}</div>`);
    const type = agent ? "" : region("F02", field("type", "红利类型", select("type", memberTypes, form.type, "请选择红利类型")) + field("title", "红利标题", form.type === "活动彩金" ? autocomplete("title", activities(), form.site ? "输入关键词搜索活动标题" : "请先选择站点", !form.site) : input("title", "请输入红利标题"), false));
    const claim = agent ? "" : region("F03", field("claim", "领取方式", radios("claim", ["手动领取", "自动派发"])) + (form.claim === "手动领取" ? field("days", "红利有效期", `<div class="bonus510-unit-input">${input("days", "请输入天数", form.days, 'inputmode="numeric"')}<span>天</span></div>`) : ""));
    const target = form.mode === "批量发放" ? region("B01", field("file", "导入文件", batchContent())) : region("F04", field("account", `${agent ? "代理" : "会员"}账号/ID`, autocomplete("account", users(), form.site ? `请输入${agent ? "代理" : "会员"}账号或ID` : "请先选择站点", !form.site)) + field("amount", "发放金额", `<div class="bonus510-unit-input">${input("amount", "请输入0.01-99999999", form.amount, 'inputmode="decimal"')}<span>CNY</span></div>`));
    const turnover = agent ? "" : region("F05", field("turnover", "流水限制", radios("turnover", ["无需流水限制", "需要流水限制"])) + (form.turnover === "需要流水限制" ? field("multiple", "流水倍数", `<div class="bonus510-unit-input">${input("multiple", "请输入大于0的正数", form.multiple, 'inputmode="decimal"')}<span>倍</span></div>`) : ""));
    return `${tabs()}<form class="bonus510-form" novalidate>${region("F01", scope)}${mode}${type}${claim}${target}${turnover}${agent || !features.message ? "" : field("message", "站内信通知", radios("message", ["是", "否"]))}${field("remark", "申请备注", `<div class="bonus510-remark">${input("unused", "", "", 'type="hidden"')}<textarea name="remark" id="b510-remark" maxlength="500" placeholder="请输入申请备注（选填）">${escape(form.remark)}</textarea><small><span data-b510-remark-count>${form.remark.length}</span>/500</small></div>`, false)}<div class="bonus510-submit"><p class="bonus510-form-error" role="alert" hidden></p><p class="bonus510-success" role="status" hidden></p><button type="submit" class="main-action annotated" data-component-id="B02">${badge("B02")}提交</button></div></form>`;
  }
  const historyColumns = [["site", "所属站点"], ["account", "账号"], ["accountType", "账号类型"], ["id", "单号"], ["agent", "上级代理账号"], ["agentId", "上级代理编号"], ["tags", "会员标签"], ["wallet", "钱包类型"], ["venue", "场馆名称"], ["type", "红利类型"], ["title", "红利标题"], ["turnover", "流水要求"], ["multiple", "流水倍数"], ["amount", "红利金额（CNY）"], ["remark", "申请备注"], ["issued", "派发时间"], ["received", "领取时间"], ["expires", "过期时间"], ["status", "状态"]].filter(([key]) => features.venueWallet || key !== "venue");
  function selectedHistory() {
    const f = history.filters;
    return records.filter((row) => Object.entries(f).every(([key, value]) => {
      if (key === "sites") return value.includes(row.site);
      if (!value) return true;
      if (key.endsWith("Start") || key.endsWith("End")) { const raw = row[key.replace(/Start|End/, "")]; return raw !== "-" && (key.endsWith("Start") ? raw >= value : raw <= value); }
      if (key === "agent") return `${row.agent} ${row.agentId}`.toLowerCase().includes(value.toLowerCase());
      return ["account", "id", "title", "remark"].includes(key) ? String(row[key]).toLowerCase().includes(value.toLowerCase()) : row[key] === value;
    })).sort((a, b) => b.issued.localeCompare(a.issued) || b.id.localeCompare(a.id));
  }
  function dateField(key, label, empty = true) {
    const now = new Date();
    return `<div class="risk-field bonus510-date" data-b510-date="${key}"><label>${label}</label>${api.dateControl({ year: now.getFullYear(), month: now.getMonth() + 1, startDay: now.getDate(), endDay: now.getDate(), empty })}</div>`;
  }
  function filterField(key, label, options, placeholder) { return `<div class="risk-field"><label for="b510-filter-${key}">${label}</label>${options ? select(`filter-${key}`, options, "", placeholder || "全部") : input(`filter-${key}`, placeholder || `请输入${label}`, "")}</div>`; }
  function historyView() {
    const common = `<div class="bonus510-filters bonus510-history-common">${api.siteSelect()}${filterField("account", "账号", null, "会员或代理账号")}${filterField("status", "状态", statuses)}${filterField("type", "红利类型", memberTypes)}</div><div class="bonus510-filters bonus510-history-dates">${dateField("issued", "派发时间")}${dateField("received", "领取时间")}</div>`;
    const extra = `${filterField("wallet", "钱包类型", walletTypes)}${filterField("accountType", "账号类型", ["会员", "代理"])}${filterField("id", "单号")}${filterField("agent", "上级代理账号/编号", null, "账号或编号")}${features.venueWallet ? filterField("venue", "场馆名称", window.PROTOTYPE_VENUE_GAMES.map((venue) => venue.name)) : ""}${filterField("title", "红利标题")}${filterField("tags", "会员标签", api.tags)}${filterField("remark", "申请备注")}`;
    return `<div class="bonus510-history">${tabs()}${region("F01", `<form class="bonus510-filter-form">${common}<div id="b510-history-extra" class="bonus510-extra-filters"${history.expanded ? "" : " hidden"}><div class="bonus510-filters">${extra}</div></div><div class="bonus510-actions"><button type="submit" class="main-action">筛选</button><button type="button" class="secondary-action" data-b510-reset>重置</button><button type="button" class="bonus510-more-filters" data-b510-more-filters aria-expanded="${history.expanded}" aria-controls="b510-history-extra"></button><button type="button" class="secondary-action annotated" data-component-id="B01" data-b510-export>${badge("B01")}导出</button></div></form>`, "bonus510-filter-panel bonus510-compact-filters")}<div class="bonus510-history-result">${historyTable()}</div></div>`;
  }
  function pagination(count, pager) {
    const pages = Math.max(1, Math.ceil(count / pager.size));
    pager.page = Math.min(pages, pager.page);
    return `<div class="bonus510-pagination"><span>共 ${count} 条</span><select aria-label="每页数量" data-b510-size>${[10, 20, 50, 100, 200].map((size) => `<option value="${size}"${size === pager.size ? " selected" : ""}>${size}条/页</option>`).join("")}</select><button type="button" data-b510-page="${pager.page - 1}"${pager.page <= 1 ? " disabled" : ""} aria-label="上一页">‹</button>${Array.from({ length: pages }, (_, index) => `<button type="button" data-b510-page="${index + 1}" class="${index + 1 === pager.page ? "active" : ""}">${index + 1}</button>`).join("")}<button type="button" data-b510-page="${pager.page + 1}"${pager.page >= pages ? " disabled" : ""} aria-label="下一页">›</button><label>前往 <input type="number" min="1" max="${pages}" value="${pager.page}" aria-label="跳转页码"> 页</label></div>`;
  }
  function historyTable() {
    const rows = selectedHistory();
    history.page = Math.min(history.page, Math.max(1, Math.ceil(rows.length / history.size)));
    const total = roundSum(rows);
    const pageRows = rows.slice((history.page - 1) * history.size, history.page * history.size);
    const pageTotal = roundSum(pageRows);
    return region("T01", `<header class="bonus510-table-heading"><h2>历史记录列表</h2><span>共 ${rows.length} 条</span></header><div class="bonus510-history-total"><span>总计：</span><strong>${money(total)}</strong><span>CNY</span></div>${history.size === 50 ? pagination(rows.length, history) : ""}<div class="risk-table-wrap bonus510-table-wrap" data-page-scroll><table class="risk-table bonus510-history-table"><thead><tr>${historyColumns.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead><tbody>${pageRows.map((row) => `<tr>${historyColumns.map(([key]) => `<td>${key === "status" ? `<span class="bonus510-status ${row.status === "已领取" ? "success" : row.status === "已过期" ? "expired" : "pending"}">${row.status}</span>` : key === "amount" ? `<strong>${money(row.amount)}</strong>` : escape(key === "turnover" ? row.multiple > 0 ? "是" : "否" : row[key])}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${historyColumns.length}" class="bonus510-empty">暂无符合条件的记录</td></tr>`}</tbody><tfoot><tr>${historyColumns.map(([key], index) => `<td>${index === 0 ? "本页总计" : key === "amount" ? `<strong>${money(pageTotal)}</strong>` : ""}</td>`).join("")}</tr></tfoot></table></div>${pagination(rows.length, history)}`, "bonus510-table-panel");
  }
  function reportView() {
    const allRows = records.filter((row) => row.accountType === "会员" && (!report.type || row.type === report.type) && (!report.method || row.method === report.method) && (!report.operator || row.operator.toLowerCase().includes(report.operator.toLowerCase())));
    const rows = allRows.slice(0, 20);
    const production = "bonus510-unchanged";
    const typeOptions = [...existingReportTypes, ...newReportTypes];
    const typeField = `<div class="risk-field"><label for="b510-report-type">礼金类型</label><select id="b510-report-type" name="type"><option value="">全部类型</option>${typeOptions.map((type) => `<option value="${escape(type)}" class="${newReportTypes.includes(type) ? "bonus510-option-new" : "bonus510-option-existing"}"${report.type === type ? " selected" : ""}>${escape(type)}</option>`).join("")}</select></div>`;
    const methodField = `<div class="risk-field"><label for="b510-report-method">发放方式</label>${select("report-method", ["系统派发", "人工发放"], report.method, "全部")}</div>`;
    const operatorField = `<div class="risk-field"><label for="b510-report-operator">操作人</label>${input("report-operator", "请输入操作人账号", report.operator)}</div>`;
    const original = (content) => `<div class="bonus510-report-reference ${production}">${content}</div>`;
    const filters = `<form class="bonus510-report-filter-form"><div class="bonus510-filters bonus510-report-dates ${production}">${dateField("stat", "日期范围")}${dateField("receive", "领取时间")}</div><div class="bonus510-filters">${original(api.siteSelect())}${typeField}${original(filterField("status", "发放状态", ["待领取", "已领取", "已过期"]))}${original(filterField("member", "会员名"))}${original(filterField("agent", "上级代理"))}${methodField}${operatorField}</div><div class="bonus510-actions"><button type="submit" class="main-action">查询</button><button type="button" class="secondary-action" data-b510-report-reset>重置</button></div></form>`;
    const totals = [roundSum(allRows), roundSum(allRows.filter((row) => ["活动彩金", "平台红利", "线上活动", "线下红利", "活动礼金"].includes(row.type))), roundSum(allRows.filter((row) => row.type === "晋升礼金")), roundSum(allRows.filter((row) => row.type === "周礼金")), roundSum(allRows.filter((row) => row.type === "月礼金")), roundSum(allRows.filter((row) => row.status === "已过期"))];
    const summary = region("P01", ["总发放礼金", "总活动礼金", "总晋升礼金", "周礼金", "总月礼金", "过期总礼金"].map((name, index) => `<article${index === 0 ? ' class="bonus510-summary-total"' : ""}><span>${name}<small> CNY</small></span><strong>${money(totals[index])}</strong></article>`).join(""), "bonus510-report-summary");
    const table = region("T01", `<div class="risk-table-wrap bonus510-table-wrap" data-page-scroll><table class="risk-table bonus510-report-table"><thead><tr>${["日期", "所属站点", "上级代理", "用户名称", "会员ID", "VIP等级", "礼金类型", "礼金额度（CNY）", "状态", "领取时间", "发放方式", "操作人"].map((label, index) => `<th class="${[6, 10, 11].includes(index) ? "" : production}">${label}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${[row.issued.slice(0, 10), row.site, row.agent, row.account, row.userId, `VIP${row.vip}`, row.type, money(row.amount), row.status === "已派发" ? "待领取" : row.status, row.received, row.method, row.operator].map((value, index) => `<td class="${index >= 10 || index === 6 && newReportTypes.includes(row.type) ? "" : production}">${index === 10 ? `<span class="bonus510-method-tag ${row.method === "系统派发" ? "system" : "manual"}">${escape(value)}</span>` : escape(value)}</td>`).join("")}</tr>`).join("") || '<tr><td colspan="12" class="bonus510-empty">暂无符合条件的记录</td></tr>'}</tbody><tfoot class="${production}"><tr><td>合计</td><td colspan="6"></td><td>${money(roundSum(allRows))}</td><td colspan="4"></td></tr></tfoot></table></div><div class="${production}">${pagination(allRows.length, { page: 1, size: 20 })}</div>`, "bonus510-table-panel");
    return `<div class="bonus510-report"><header class="bonus510-report-heading ${production}"><h1>礼金统计报表</h1><button type="button" class="secondary-action" disabled>导出报表</button></header>${summary}${region("F01", filters, "bonus510-filter-panel bonus510-compact-filters")}${table}<section class="bonus510-report-tip ${production}"><h3>报表统计说明</h3><p>* 本报表统计全站所有类型的礼金发放明细，包含手动发放与系统自动触发的礼金。</p><p>* 晋升礼金、周礼金、月礼金等周期性奖励将根据会员VIP等级配置自动生成。</p><p>* 待领取状态的礼金需要会员在前端手动领取后方可计入余额。</p></section></div>`;
  }
  function mobileNav(page) {
    return `<nav class="member-mobile-prototype-nav" aria-label="会员端原型页面切换"><span>会员端页面</span><div>${[["member-center-510", "个人中心"], ["member-benefits-510", "交易记录"]].map(([key, label]) => `<a href="${href(key)}" class="${page.key === key ? "active" : ""}">${label}</a>`).join("")}</div><small>原型评审导航，不属于生产功能</small></nav>`;
  }
  const mobileIcon = () => '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="22" height="23" rx="4" fill="#2989ff"/><path d="M9 12h14M10 18h12M10 23h7" stroke="white" stroke-width="2"/><path d="M12 3h8v6h-8z" fill="#76d7ff"/></svg>';
  function memberCenter() {
    const muted = "bonus510-unchanged";
    return api.mobileFrame(`<main class="bonus510-member-center"><header class="${muted}"><h1>我的</h1><span>设置　客服</span></header><div class="bonus510-member-user ${muted}"><span class="member-center-avatar">M</span><div><strong>member_10086 <em>VIP10</em></strong><p>加入旺财体育第64天</p></div><b>›</b></div><section class="bonus510-member-assets ${muted}"><div class="bonus510-asset-line"><div><span>总资产</span><strong>¥ 188,571.23</strong></div><div class="bonus510-money-shortcuts">${["余额宝", "充值", "转账", "提款"].map((label) => `<span>${mobileIcon()}${label}</span>`).join("")}</div></div><div class="bonus510-member-vip"><strong>当前等级：VIP10</strong><b>查看VIP福利 ›</b></div><p>您已满级，已享最高权益</p><div class="bonus510-progress"><span>总计流水(元)</span><span>0.00</span><i></i></div><p>90天保级流水(元)　372210/200000</p></section><section class="bonus510-member-shortcuts">${["投注记录", "交易记录", "卡包管理", "推广赚钱"].map((label) => label === "交易记录" ? `<a class="annotated" data-component-id="B01" href="${href("member-benefits-510")}">${badge("B01")}${mobileIcon()}<span>${label}</span></a>` : `<div class="${muted}">${mobileIcon()}<span>${label}</span></div>`).join("")}</section><section class="bonus510-help ${muted}"><h2>帮助中心</h2><div>${["充值教程", "提款教程", "游戏教程", "意见反馈"].map((label) => `<span>${mobileIcon()}${label}</span>`).join("")}</div></section><section class="bonus510-center-links ${muted}">${["消息中心", "用户协议", "关于我们", "找到我们"].map((label) => `<div>${label}<span>›</span></div>`).join("")}</section><nav class="bonus510-bottom ${muted}"><span>首页</span><span>优惠</span><span>客服</span><span>我的</span></nav></main>`, "bonus510-mobile-frame");
  }
  function benefitRows() {
    return records.filter((row) => row.account === "member_10086" && row.site === api.sites[0] && row.received !== "-").sort((a, b) => b.received.localeCompare(a.received));
  }
  function mobileRows() {
    const base = Array.from({ length: 7 }, (_, index) => ({ id: `DP2026091600${index}`, kind: index % 3 === 2 ? "提现" : "充值", amount: index % 3 === 2 ? 500 : 2000, status: "成功", date: `${time().slice(0, 10)} ${pad(15 - index)}:18:58` }));
    const benefits = benefitRows().map((row) => ({ ...row, kind: "红利", date: row.received }));
    const all = [...base, ...benefits].sort((a, b) => b.date.localeCompare(a.date));
    return all.filter((row) => (mobile.kind === "全部" || row.kind === mobile.kind) && (mobile.status !== "失败") && (mobile.period === "全部" || row.date.slice(0, 10) >= time(new Date(Date.now() - (mobile.period === "今日" ? 0 : 6) * 86400000)).slice(0, 10)));
  }
  function memberRecords() {
    const rows = mobileRows();
    if (!mobile.expanded && rows.length) mobile.expanded = rows[0].id;
    return api.mobileFrame(`<header class="member-mobile-header"><a class="mobile-back" href="${href("member-center-510")}" aria-label="返回个人中心">‹</a><h1>交易记录</h1><span></span></header><div class="bonus510-member-filter">${region("F01", `<button type="button" id="b510-mobile-kind" class="bonus510-kind-trigger" aria-haspopup="dialog" aria-expanded="false"><span>${escape(mobile.kind)}</span><i aria-hidden="true"></i></button>`)}${select("mobile-period", ["全部", "今日", "近7日"], mobile.period, null)}${select("mobile-status", ["全部", "成功", "失败"], mobile.status, null)}</div><main class="bonus510-member-records annotated" data-component-id="T01">${badge("T01")}<div class="bonus510-mobile-list">${mobileCards(rows)}</div></main>`, "bonus510-mobile-frame bonus510-record-frame");
  }
  function mobileCards(rows = mobileRows()) {
    return rows.slice(0, mobile.limit).map((row) => {
      const benefit = row.kind === "红利";
      const fields = benefit ? [["订单号", row.id], ["时间", row.date], ["红利类型", row.type], ["红利金额", `¥ ${money(row.amount)}`], ...(features.venueWallet ? [["限制场馆", row.venue === "-" ? "无限制" : row.venue]] : []), ["提现流水", `${row.multiple}倍`]] : [["订单号", row.id], ["日期", row.date], ["交易类型", row.kind], ["子类型", "支付宝"], ["申请金额", `CNY ${money(row.amount)}`], [row.kind === "充值" ? "实际充值金额" : "提款金额", `CNY ${money(row.amount)}`], ["手续费", "¥ 0"], ["汇率", "1"], ["实际到账", `¥ ${money(row.amount)}`]];
      const expanded = mobile.expanded === row.id;
      return `<article class="bonus510-record${benefit ? "" : " bonus510-existing-record"}"><button type="button" class="bonus510-record-toggle" data-b510-record="${escape(row.id)}" aria-expanded="${expanded}"><div><strong>${row.kind}</strong><time>${row.date.slice(11)}</time></div><b>${row.kind === "提现" ? "-" : "+"}${money(row.amount)}</b><span class="bonus510-member-success">成功</span><i>${expanded ? "›" : "⌄"}</i></button><dl${expanded ? "" : " hidden"}>${fields.map(([label, value], index) => `<div><dt>${label}：</dt><dd>${escape(value)}${index === 0 ? `<button type="button" data-b510-copy="${escape(value)}" aria-label="复制订单号">复制</button>` : ""}</dd></div>`).join("")}</dl></article>`;
    }).join("") + (rows.length ? mobile.limit < rows.length ? '<button type="button" class="bonus510-load" data-b510-more>加载更多</button>' : '<p class="bonus510-list-end">没有更多了</p>' : '<div class="bonus510-mobile-empty">暂无记录</div>');
  }
  function render(page, helpers) {
    api = helpers; currentPage = page; initialize();
    if (page.key === "member-center-510") return memberCenter();
    if (page.key === "member-benefits-510") return memberRecords();
    const content = page.key === "control-bonus-issue-510" ? issueForm() : page.key === "control-bonus-history-510" ? historyView() : page.key === "control-bonus-report-510" ? reportView() : '<div class="bonus510-reference">此页面与生产一致，无修改</div>';
    return `<div class="bonus510-page">${content}</div>`;
  }
  function annotations(page) {
    if (page.key !== "control-bonus-issue-510") return page.annotations;
    return page.annotations.filter((item) => !(isAgent() && ["F02", "F03", "F05"].includes(item.id)) && !(form.mode === "单笔发放" && item.id === "B01") && !(form.mode === "批量发放" && item.id === "F04"));
  }
  function refresh() {
    const scrollers = [".risk-content", ".prototype-canvas", ".spec-scroll"];
    const positions = scrollers.map((selector) => document.querySelector(selector)?.scrollTop || 0);
    api.rerender();
    scrollers.forEach((selector, index) => { const element = document.querySelector(selector); if (element) element.scrollTop = positions[index]; });
  }
  function clearBatch() { uploadVersion++; batch = { name: "", rows: [], errors: [], loading: false }; }
  function formError(message) {
    const element = document.querySelector(".bonus510-form-error");
    element.textContent = message; element.hidden = false;
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function validateAmount(value) { return /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) >= 0.01 && Number(value) <= 99999999; }
  function validateForm() {
    if (!form.site) return "请选择站点";
    if (!walletTypes.includes(form.wallet)) return "请选择钱包类型";
    if (form.wallet === "场馆钱包" && !venues().includes(form.venue)) return "请选择该站点已开启的场馆";
    if (!isAgent() && !memberTypes.includes(form.type)) return "请选择红利类型";
    if (!isAgent() && form.type === "活动彩金" && !activities().some((item) => item.account === form.title)) return "请选择当前站点已开启的活动标题";
    if (!isAgent() && form.claim === "手动领取" && (!/^\d+$/.test(form.days) || !Number.isSafeInteger(Number(form.days)) || Number(form.days) <= 0)) return "请输入有效的正整数天数";
    if (form.mode === "批量发放") {
      if (batch.loading) return "文件正在读取，请稍后";
      if (!batch.rows.length || batch.errors.length) return "请上传并通过整份Excel文件校验";
    } else {
      const user = resolveUser(form.account);
      if (!user) return `请选择当前站点的${isAgent() ? "代理" : "会员"}账号`;
      if (!validateAmount(form.amount)) return "发放金额须为0.01至99999999，最多2位小数";
    }
    if (!isAgent() && form.turnover === "需要流水限制" && (!/^\d+(\.\d+)?$/.test(form.multiple) || !Number.isFinite(Number(form.multiple)) || Number(form.multiple) <= 0)) return "流水倍数只能填写大于0的正数";
    return "";
  }
  function confirmIssue() {
    Object.keys(form).forEach((key) => { form[key] = String(form[key]).trim(); });
    const error = validateForm();
    if (error) { formError(error); return; }
    const recipients = form.mode === "批量发放" ? batch.rows : [{ account: resolveUser(form.account).account, amount: Number(form.amount) }];
    const snapshot = { ...form };
    const multiple = !isAgent() && form.turnover === "需要流水限制" ? Number(form.multiple) : 0;
    const pairs = [["所属站点", form.site], ["钱包类型", form.wallet], ...(form.wallet === "场馆钱包" ? [["限制场馆", form.venue]] : []), ...(isAgent() ? [] : [["红利类型", form.type]]), ["发放人数", `${recipients.length} 人`], ["发放总金额", `${money(roundSum(recipients))} CNY`], ...(recipients.length === 1 ? [["收款账号", recipients[0].account]] : []), ...(isAgent() ? [] : [["领取方式", form.claim], ["流水倍数", `${multiple}倍`], ...(form.claim === "手动领取" ? [["红利有效期", `${form.days}天`]] : [])]), ["申请备注", form.remark || "-"]];
    api.modal("确认发放红利", region("M01", `<dl class="bonus510-confirm">${pairs.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>`), "确认发放");
    const dialog = document.querySelector(".risk-modal"); dialog.classList.add("bonus510-dialog");
    api.select("M01", "component");
    dialog.querySelector(".modal-confirm").addEventListener("click", () => {
      const issued = time();
      const expires = time(new Date(Date.now() + Number(snapshot.days) * 86400000));
      recipients.forEach((recipient) => {
        const agent = snapshot.wallet === "代理佣金钱包";
        const received = !agent && snapshot.claim === "自动派发";
        records.unshift({ site: snapshot.site, account: recipient.account, accountType: agent ? "代理" : "会员", id: `BN${issued.replace(/\D/g, "")}${sequence++}`, agent: "agent_087", agentId: "AG10386", tags: "新会员", wallet: snapshot.wallet, venue: snapshot.wallet === "场馆钱包" ? snapshot.venue : "-", type: agent ? "-" : snapshot.type, title: agent ? "-" : snapshot.title || "-", amount: recipient.amount, multiple, remark: snapshot.remark, issued, received: received ? issued : "-", expires: agent ? "-" : expires, status: received ? "已领取" : "已派发", method: "人工发放", recordSource: snapshot.claim === "手动领取" ? "vip" : "backend", operator: "mike.ops", userId: resolveUser(recipient.account, snapshot.site, agent)?.id || "-", vip: 10 });
      });
      form.account = ""; form.amount = ""; clearBatch(); refresh();
      const success = document.querySelector(".bonus510-success"); success.textContent = `发放成功：${recipients.length}人，共${money(roundSum(recipients))} CNY，可在历史记录查看`; success.hidden = false;
      success.scrollIntoView({ block: "nearest" });
    });
    dialog.addEventListener("keydown", (event) => { if (event.key === "Escape") dialog.querySelector(".modal-close").click(); });
    dialog.querySelector(".modal-close").focus({ preventScroll: true });
  }
  async function excel() {
    if (window.XLSX) return window.XLSX;
    excelPromise ||= new Promise((resolve, reject) => {
      const script = document.createElement("script"); script.src = "./assets/vendor/xlsx-0.20.3.min.js";
      script.onload = () => resolve(window.XLSX); script.onerror = () => { excelPromise = null; script.remove(); reject(new Error("Excel组件加载失败，请刷新页面后重试")); };
      document.head.append(script);
    });
    return excelPromise;
  }
  async function writeWorkbook(data, name) {
    const xlsx = await excel();
    const book = xlsx.utils.book_new(); const sheet = xlsx.utils.aoa_to_sheet(data, { cellDates: true });
    sheet["!cols"] = data[0].map((_, index) => ({ wch: index === 0 ? 24 : 22 }));
    xlsx.utils.book_append_sheet(book, sheet, "数据"); xlsx.writeFile(book, `${name}.xlsx`);
  }
  async function upload(file) {
    clearBatch();
    if (!file) { refresh(); return; }
    const version = uploadVersion;
    batch.name = file.name; batch.loading = true; refresh();
    try {
      if (!/\.xlsx$/i.test(file.name)) throw new Error("请选择.xlsx格式的Excel文件");
      if (file.size > 10 * 1024 * 1024) throw new Error("文件较大，请使用10MB以内的Excel文件");
      const xlsx = await excel(); const book = xlsx.read(await file.arrayBuffer(), { type: "array" });
      if (version !== uploadVersion) return;
      const sheet = book.Sheets[book.SheetNames[0]];
      if (!sheet) throw new Error("文件没有可读取的工作表");
      const values = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: true });
      const header = (values[0] || []).map((cell) => String(cell).trim());
      if (header.length !== 2 || header[0] !== (isAgent() ? "代理账号" : "会员账号") || header[1] !== "发放金额") throw new Error(`模板不匹配：只能包含${isAgent() ? "代理账号" : "会员账号"}、发放金额两列`);
      const seen = new Set();
      values.slice(1).forEach((cells, index) => {
        if (cells.every((cell) => String(cell).trim() === "")) return;
        const number = index + 2; const account = String(cells[0] ?? "").trim(); const amount = String(cells[1] ?? "").trim();
        const user = users().find((item) => item.account === account);
        if (seen.has(account)) batch.errors.push(`第${number}行：账号${account}重复`);
        seen.add(account);
        if (!user) batch.errors.push(`第${number}行：${account || "空账号"}不是所选站点的有效${isAgent() ? "代理" : "会员"}账号`);
        if (cells.slice(2).some((cell) => String(cell).trim())) batch.errors.push(`第${number}行：存在模板外的字段`);
        if (!validateAmount(amount)) batch.errors.push(`第${number}行：金额须为0.01至99999999，最多2位小数`);
        else if (user) batch.rows.push({ account, amount: Number(amount) });
      });
      if (!batch.rows.length && !batch.errors.length) batch.errors.push("文件没有可发放的数据，请填写账号和金额");
    } catch (error) { if (version === uploadVersion) batch.errors = [error.message || "Excel读取失败，请检查文件内容"]; }
    if (version === uploadVersion) { batch.loading = false; refresh(); }
  }
  function bindAutocomplete() {
    document.querySelectorAll("[data-b510-auto]").forEach((root) => {
      const inputElement = root.querySelector("input"); const list = root.querySelector('[role="listbox"]'); const buttons = [...list.querySelectorAll("button")];
      let active = -1;
      const show = () => {
        const value = inputElement.value.trim().toLowerCase(); let found = false;
        buttons.forEach((button) => { button.hidden = !`${button.dataset.value} ${button.dataset.id}`.toLowerCase().includes(value); found ||= !button.hidden; });
        root.querySelector(".bonus510-no-option").hidden = found; list.hidden = false; inputElement.setAttribute("aria-expanded", "true");
      };
      const close = () => { list.hidden = true; inputElement.setAttribute("aria-expanded", "false"); active = -1; };
      inputElement.addEventListener("focus", show); inputElement.addEventListener("input", show);
      inputElement.addEventListener("blur", () => { inputElement.value = inputElement.value.trim(); form[inputElement.name] = inputElement.value; close(); });
      buttons.forEach((button) => { button.addEventListener("mousedown", (event) => event.preventDefault()); button.addEventListener("click", () => { form[inputElement.name] = button.dataset.value; inputElement.value = button.dataset.value; close(); }); });
      inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Escape") { close(); return; }
        const visible = buttons.filter((button) => !button.hidden);
        if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); if (list.hidden) show(); active = Math.max(0, Math.min(visible.length - 1, active + (event.key === "ArrowDown" ? 1 : -1))); buttons.forEach((button) => button.classList.remove("active")); visible[active]?.classList.add("active"); visible[active]?.scrollIntoView({ block: "nearest" }); }
        if (event.key === "Enter" && !list.hidden && visible.length) { event.preventDefault(); visible[Math.max(0, active)].click(); }
      });
    });
  }
  function hasWalletContent() {
    return Boolean(form.type || form.title || form.account || form.amount || form.venue || form.remark || form.multiple || batch.name || batch.rows.length);
  }
  function clearWalletContent(nextWallet) {
    form.wallet = nextWallet; form.type = ""; form.title = ""; form.account = ""; form.amount = ""; form.venue = ""; form.multiple = ""; form.turnover = "无需流水限制"; clearBatch();
  }
  function bindForm() {
    const root = document.querySelector(".bonus510-form"); if (!root) return;
    root.querySelectorAll("input[name],select[name],textarea[name]").forEach((element) => {
      element.addEventListener("input", () => { if (element.type !== "radio") form[element.name] = element.value; if (element.name === "remark") root.querySelector("[data-b510-remark-count]").textContent = element.value.length; });
      element.addEventListener("blur", () => { if (element.type !== "radio") { element.value = element.value.trim(); form[element.name] = element.value; } });
      element.addEventListener("change", () => {
        const nextValue = element.value.trim();
        if (element.name === "wallet" && nextValue !== form.wallet && hasWalletContent()) {
          element.checked = false;
          root.querySelector(`input[name="wallet"][value="${CSS.escape(form.wallet)}"]`).checked = true;
          api.modal("切换钱包类型", `<p>切换钱包类型后，已填写的红利类型、账号、金额${features.venueWallet ? "、场馆" : ""}及导入文件等内容将被清空，是否继续切换？</p>`, "确认切换");
          document.querySelector("#modal-root .modal-confirm")?.addEventListener("click", () => { clearWalletContent(nextValue); refresh(); }, true);
          return;
        }
        form[element.name] = nextValue;
        if (["site", "wallet", "type", "claim", "turnover"].includes(element.name)) {
          if (element.name === "site") { form.account = ""; form.amount = ""; form.venue = ""; form.title = ""; clearBatch(); }
          if (element.name === "wallet") clearWalletContent(nextValue);
          if (element.name === "type") form.title = "";
          if (element.name === "turnover" && form.turnover === "无需流水限制") form.multiple = "";
          refresh();
        }
      });
    });
    root.querySelectorAll("[data-b510-mode]").forEach((button) => button.addEventListener("click", () => { form.mode = button.dataset.b510Mode; form.account = ""; form.amount = ""; clearBatch(); refresh(); }));
    root.querySelector("[data-b510-template]")?.addEventListener("click", async () => { try { await writeWorkbook([[isAgent() ? "代理账号" : "会员账号", "发放金额"]], isAgent() ? "代理红利发放模板" : "会员红利发放模板"); } catch (error) { formError(error.message); } });
    root.querySelector("[data-b510-upload]")?.addEventListener("change", (event) => upload(event.target.files[0]));
    root.querySelector("[data-b510-remove-file]")?.addEventListener("click", () => { clearBatch(); refresh(); });
    root.addEventListener("submit", (event) => { event.preventDefault(); confirmIssue(); });
    bindAutocomplete();
  }
  function bindDates() {
    api.bindDates();
    document.querySelectorAll(".bonus510-date").forEach((fieldElement) => {
      const trigger = fieldElement.querySelector(".agent-498-date"); const picker = fieldElement.querySelector(".agent-498-date-popover");
      const key = fieldElement.dataset.b510Date;
      const f = history.filters;
      if (f[`${key}Start`]) trigger.innerHTML = `<span>${escape(f[`${key}Start`])}</span><b>至</b><span>${escape(f[`${key}End`])}</span>`;
      trigger.addEventListener("click", () => {
        if (picker.hidden) return;
        const values = [...trigger.querySelectorAll("span")].map((element) => element.textContent);
        picker.querySelectorAll(".calendar-panel").forEach((panel, index) => {
          const value = /^\d{4}-/.test(values[index]) ? values[index] : `${time().slice(0, 10)} ${index ? time().slice(11) : "00:00:00"}`;
          const date = new Date(value.replace(" ", "T")); const year = date.getFullYear(); const month = date.getMonth() + 1;
          Object.assign(panel.dataset, { year, month }); panel.querySelector("header strong").textContent = `${year}年${month}月`;
          panel.querySelector(".calendar-days").innerHTML = '<span></span>'.repeat((new Date(year, month - 1, 1).getDay() + 6) % 7) + Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => `<button type="button" class="calendar-day${i + 1 === date.getDate() ? " selected" : ""}" data-day="${i + 1}">${i + 1}</button>`).join("");
          panel.querySelector("input[type=time]").value = value.slice(11);
        });
      });
    });
  }
  function updateHistory() {
    const panel = document.querySelector(".bonus510-history-result"); panel.innerHTML = historyTable(); bindPager(); api.bindLinks(); api.limitRows(panel);
  }
  function bindPager() {
    const root = document.querySelector(".bonus510-history-result"); if (!root) return;
    root.querySelectorAll("[data-b510-page]").forEach((button) => button.addEventListener("click", () => { history.page = Number(button.dataset.b510Page); updateHistory(); }));
    root.querySelectorAll("[data-b510-size]").forEach((selectElement) => selectElement.addEventListener("change", () => { history.size = Number(selectElement.value); history.page = 1; updateHistory(); }));
    root.querySelectorAll('[aria-label="跳转页码"]').forEach((inputElement) => inputElement.addEventListener("change", () => { const next = Math.max(1, Math.min(Number(inputElement.max), Number(inputElement.value) || 1)); if (next !== history.page) { history.page = next; updateHistory(); } else inputElement.value = next; }));
  }
  function bindHistory() {
    const root = document.querySelector(".bonus510-filter-form"); if (!root) return;
    Object.entries(history.filters).forEach(([key, value]) => { const element = root.querySelector(`[name="filter-${key}"]`); if (element) element.value = value; });
    const siteField = root.querySelector(".site-multi-field");
    siteField.querySelectorAll("input:not([data-site-all])").forEach((checkbox) => { checkbox.checked = !history.filters.sites || history.filters.sites.includes(checkbox.value); });
    const moreButton = root.querySelector("[data-b510-more-filters]");
    const updateMoreLabel = () => {
      const count = extraHistoryKeys.filter((key) => history.filters[key]).length;
      moreButton.innerHTML = `${history.expanded ? "收起筛选" : "更多筛选"}${count ? `<span>已选 ${count} 项</span>` : ""}<i aria-hidden="true"></i>`;
      moreButton.setAttribute("aria-expanded", String(history.expanded));
    };
    updateMoreLabel();
    moreButton.addEventListener("click", () => {
      history.expanded = !history.expanded;
      root.querySelector("#b510-history-extra").hidden = !history.expanded;
      updateMoreLabel();
    });
    root.addEventListener("submit", (event) => {
      event.preventDefault(); const values = new FormData(root); const filters = {};
      for (const [key, value] of values.entries()) if (key.startsWith("filter-")) filters[key.slice(7)] = value.trim();
      root.querySelectorAll(".bonus510-date").forEach((date) => {
        const values = [...date.querySelectorAll(".agent-498-date span")].map((element) => element.textContent);
        filters[`${date.dataset.b510Date}Start`] = /^\d{4}-/.test(values[0]) ? values[0] : "";
        filters[`${date.dataset.b510Date}End`] = /^\d{4}-/.test(values[1]) ? values[1] : "";
      });
      filters.sites = [...siteField.querySelectorAll("input:not([data-site-all]):checked")].map((element) => element.value);
      history.filters = filters; history.page = 1; updateHistory(); updateMoreLabel();
    });
    root.querySelector("[data-b510-reset]").addEventListener("click", () => { history.filters = {}; history.page = 1; refresh(); });
    root.querySelector("[data-b510-export]").addEventListener("click", async () => {
      const rows = selectedHistory().map((row) => historyColumns.map(([key]) => key === "turnover" ? row.multiple ? "是" : "否" : ["issued", "received", "expires"].includes(key) && row[key] !== "-" ? new Date(row[key].replace(" ", "T")) : row[key]));
      try { await writeWorkbook([historyColumns.map(([, label]) => label), ...rows], "红利历史记录"); } catch (error) { api.modal("导出失败", escape(error.message), "关闭"); }
    });
    bindPager(); bindDates();
  }
  function openTransactionTypes() {
    const frame = document.querySelector(".bonus510-record-frame");
    if (!frame || frame.querySelector(".bonus510-type-overlay")) return;
    const trigger = frame.querySelector("#b510-mobile-kind");
    const background = [...frame.children];
    let draft = mobile.kind;
    const overlay = document.createElement("div");
    overlay.className = "bonus510-type-overlay";
    overlay.innerHTML = `<section class="bonus510-type-sheet" role="dialog" aria-modal="true" aria-labelledby="b510-type-title"><h2 id="b510-type-title">交易类型筛选</h2><div class="bonus510-type-options" role="group" aria-label="交易类型">${transactionTypes.map((type) => `<button type="button" data-b510-kind="${type}" aria-pressed="${type === draft}">${type}</button>`).join("")}</div><footer><button type="button" data-b510-kind-cancel>取消</button><button type="button" data-b510-kind-confirm>确定</button></footer></section>`;
    const close = () => {
      overlay.remove();
      background.forEach((element) => { element.inert = false; });
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus({ preventScroll: true });
    };
    trigger.setAttribute("aria-expanded", "true");
    frame.append(overlay);
    overlay.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
    background.forEach((element) => { element.inert = true; });
    overlay.querySelectorAll("[data-b510-kind]").forEach((button) => button.addEventListener("click", () => {
      draft = button.dataset.b510Kind;
      overlay.querySelectorAll("[data-b510-kind]").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.b510Kind === draft)));
    }));
    overlay.querySelector("[data-b510-kind-cancel]").addEventListener("click", close);
    overlay.querySelector("[data-b510-kind-confirm]").addEventListener("click", () => {
      mobile.kind = draft; mobile.expanded = ""; mobile.limit = 20;
      close(); refresh();
      document.querySelector("#b510-mobile-kind")?.focus({ preventScroll: true });
    });
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") {
        const buttons = [...overlay.querySelectorAll("button")];
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }
  function bindMobile() {
    const bindCards = () => {
      document.querySelectorAll("[data-b510-record]").forEach((button) => button.addEventListener("click", () => {
        mobile.expanded = mobile.expanded === button.dataset.b510Record ? "" : button.dataset.b510Record;
        document.querySelectorAll("[data-b510-record]").forEach((item) => { const open = item.dataset.b510Record === mobile.expanded; item.setAttribute("aria-expanded", String(open)); item.querySelector("i").textContent = open ? "›" : "⌄"; item.nextElementSibling.hidden = !open; });
      }));
      document.querySelectorAll("[data-b510-copy]").forEach((button) => button.addEventListener("click", async () => { try { await navigator.clipboard.writeText(button.dataset.b510Copy); button.textContent = "已复制"; } catch { button.textContent = "复制失败"; } }));
      document.querySelector("[data-b510-more]")?.addEventListener("click", () => { mobile.limit += 20; document.querySelector(".bonus510-mobile-list").innerHTML = mobileCards(); bindCards(); });
    };
    document.querySelector("#b510-mobile-kind")?.addEventListener("click", openTransactionTypes);
    document.querySelectorAll('.bonus510-member-filter select').forEach((selectElement) => selectElement.addEventListener("change", () => { mobile[selectElement.name.replace("mobile-", "")] = selectElement.value; mobile.expanded = ""; mobile.limit = 20; refresh(); }));
    bindCards();
  }
  function bindReport() {
    const root = document.querySelector(".bonus510-report-filter-form");
    if (!root) return;
    root.querySelector("#b510-report-operator").addEventListener("blur", (event) => { event.target.value = event.target.value.trim(); });
    root.addEventListener("submit", (event) => {
      event.preventDefault();
      report.type = root.querySelector("#b510-report-type").value;
      report.method = root.querySelector("#b510-report-method").value;
      report.operator = root.querySelector("#b510-report-operator").value.trim();
      refresh();
    });
    root.querySelector("[data-b510-report-reset]").addEventListener("click", () => { Object.assign(report, { type: "", method: "", operator: "" }); refresh(); });
  }
  function bind() {
    document.querySelectorAll("[data-b510-menu]").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.b510Menu; menuOpen[key] = !menuOpen[key]; button.setAttribute("aria-expanded", String(menuOpen[key])); button.nextElementSibling.hidden = !menuOpen[key]; }));
    document.querySelectorAll(".bonus510-unchanged input,.bonus510-unchanged select,.bonus510-unchanged button").forEach((element) => { element.disabled = true; });
    bindForm(); bindHistory(); bindMobile(); bindReport();
    const reportTable = document.querySelector(".bonus510-report-table");
    if (reportTable) reportTable.dataset.upperAgentColumnsNormalized = "true";
    const siteField = document.querySelector(".bonus510-filter-form .site-multi-field");
    siteField?.querySelector('input:not([data-site-all])')?.dispatchEvent(new Event("change"));
    document.querySelector('[data-spec-id="M01"]')?.addEventListener("click", () => { if (document.querySelector(".bonus510-form")) { const error = validateForm(); if (error) formError(error); else confirmIssue(); } });
  }
  window.Bonus510 = { render, sidebar, endpoints, mobileNav, annotations, bind };
})();
