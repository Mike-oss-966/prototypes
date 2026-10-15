(function () {
  "use strict";
  const STORAGE = "prototype.site-opening.1191.v1";
  const LIST = "control-site-list-1191", CONFIG = "control-site-config-1191";
  const siteTypes = ["自营", "旗舰", "客户"];
  const appLanguages = ["中文", "英文", "泰语", "马来西亚语", "越南语"];
  const paymentCurrencies = ["CNY", "USD", "THB", "MYR", "VND", "USDT"];
  const requiredDomains = [
    { key: "siteAdmin", label: "站点后台域名", platform: "PC", agent: false, prefix: "admin", aliases: [] },
    { key: "agentAdmin", label: "代理后台域名", platform: "PC", agent: true, prefix: "agent", aliases: ["代理域名"] },
    { key: "telegramH5", label: "Telegram h5域名", platform: "Telegram", agent: false, prefix: "tg", aliases: [] },
    { key: "memberHome", label: "会员主页域名", platform: "PC", agent: false, prefix: "www", aliases: ["PC主页域名"] }
  ];
  const domainTypes = [...requiredDomains.map((item) => item.label), "TG域名", "PC主页域名", "H5域名", "代理域名", "CDN域名"];
  const platforms = ["Telegram", "H5", "PC", "Android", "iOS"];
  const requiredResources = [
    { key: "squareLogo", label: "登录注册logo（方形）", platform: "通用", protected: true, aliases: ["方形logo", "登录注册页logo"] },
    { key: "nameLogo", label: "首页logo（带站点名）", platform: "通用", protected: true, aliases: ["名称logo", "首页logo"] },
    { key: "webAppDownload", label: "WEB端APP下载配图", platform: "PC", protected: true },
    ...Array.from({ length: 4 }, (_, i) => ({ key: `mobileBanner${i + 1}`, label: "移动端形象banner", platform: "移动端", slot: i + 1 })),
    ...Array.from({ length: 4 }, (_, i) => ({ key: `webBanner${i + 1}`, label: "WEB端形象banner", platform: "PC", slot: i + 1 }))
  ];
  const resourcePlatforms = ["通用", "移动端", ...platforms];
  const modules = [...new Set([...requiredResources.map((item) => item.label), "后台登录页logo", "站点名称", "用户条款", "隐私政策", "首页banner"])];
  const reviewStatuses = [{ value: 3, label: "申请中" }, { value: 5, label: "审批拒绝" }, { value: 4, label: "审批通过" }];
  const siteStates = [{ value: "enabled", label: "开启" }, { value: "maintenance", label: "维护中" }, { value: "closed", label: "已关站" }];
  const expenses = ["活动奖励", "会员推会员", "返水", "VIP福利", "彩金", "余额宝利息", "充值手续费", "提款手续费", "三方场馆费"];
  const securitySettings = [
    { key: "memberPhoneBindUniqueEnabled", label: "手机号唯一绑定", rule: "同一站点内，一个手机号只能归属一个用户", example: "手机号 138****8888 已绑定用户A，不能再绑定用户B。" },
    { key: "memberBankBindUniqueEnabled", label: "银行卡唯一绑定", rule: "同一站点内，一张银行卡只能归属一个用户", example: "银行卡 6222 **** **** 8888 已绑定用户A，不能再绑定用户B。" },
    { key: "memberAlipayBindUniqueEnabled", label: "支付宝唯一绑定", rule: "同一站点内，一个支付宝账号只能归属一个用户", example: "支付宝账号 zhang***@example.com 已绑定用户A，不能再绑定用户B。" }
  ];
  const openingItems = [
    ["venueFees", "三方场馆费"], ["transactionFees", "充提手续费"], ["venues", "游戏场馆"], ["activities", "优惠活动"],
    ["vipRebate", "VIP配置与返水配置"], ["phoneAreas", "区号配置"], ["identityProvider", "二要素验证通道"],
    ["smsProvider", "短信通道配置"], ["agentCycle", "代理结算周期配置"], ["commissionPlans", "返佣方案"]
  ];
  const HQ_SOURCE = "HQ", HQ_SOURCE_LABEL = "与总站配置一致";
  const hqOnlySources = new Set(["phoneAreas", "identityProvider", "smsProvider"]);
  const openingChecks = [
    { title: "审核与基础信息", items: [
      ["approval", "开站审批"],
      ["adminAccount", "后台管理账号登录测试"],
      ["openingCopy", "开站首次配置 复制配置来源"]
    ] },
    { title: "域名与访问", items: [
      ["requiredDomains", "四类必备域名配置"],
      ["siteRouting", "每个域名访问是否内容正确"]
    ] },
    { title: "品牌资源与内容", items: [
      ["logos", "两类logo配置"],
      ["downloadArt", "APP下载配图配置"],
      ["brandBanners", "形象banner配置"],
      ["cooperationContacts", "合营联系方式配置"]
    ] },
    { title: "财务与资金", items: [
      ["venueFees", "三方场馆费配置是否正确"],
      ["transactionFees", "充提手续费配置是否正确"],
      ["paymentChannels", "充值与提现通道配置是否正确"],
      ["siteFinance", "站点综合配置是否正确"],
      ["fundFlow", "会员端充值、提现是否流程正常"]
    ] },
    { title: "场馆、活动与VIP", items: [
      ["venues", "游戏场馆配置是否正确"],
      ["activities", "优惠活动配置是否正确"],
      ["vip", "VIP会员设置配置是否正确"],
      ["rebate", "VIP返水配置是否正确"]
    ] },
    { title: "注册、验证与安全", items: [
      ["phoneAreas", "允许注册国家区号是否正确"],
      ["realNameSmsTemplate", "实名认证短信是否正确（模板内容）"],
      ["security", "站点配置 - 安全配置 是否正确"],
      ["memberLogin", "会员端注册登录是否正常"]
    ] },
    { title: "代理与Telegram", items: [
      ["agentCycle", "代理结算周期配置是否正确"],
      ["commissionPlans", "返佣方案配置是否正确"],
      ["telegramBot", "Telegram机器人配置是否正确"],
      ["telegramFlow", "Telegram入口与欢迎内容配置是否正确"]
    ] },
    { title: "首次开放确认", items: [
      ["vipJobs", "VIP相关脚本服务是否已加入本站", "技术确认"],
      ["domainPool", "域名池是否都可以正常访问", "技术确认"],
      ["shortDomain", "短域名技术配置", "技术确认"],
      ["androidClient", "Android端是否正常下载和使用"],
      ["iosClient", "iOS端是否正常下载和使用"],
      ["customerService", "客服账号是否正常收发消息"]
    ] }
  ];
  const plans = [
    { id: 1, name: "星级代理基础方案", type: "星级代理", details: [{ level: 0, rate: 0.01 }, { level: 1, rate: 0.02 }, { level: 2, rate: 0.03 }] },
    { id: 2, name: "多层级代理基础方案", type: "多层级代理", details: [{ level: 0, rate: 0.01 }, { level: 1, rate: 0.005 }, { level: 2, rate: 0.0025 }] }
  ];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const logo = (title) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100" viewBox="0 0 320 100"><rect width="320" height="100" rx="10" fill="#1890ff"/><path d="M29 28h36v44H29z" fill="#fff" opacity=".2"/><text x="48" y="62" font-family="Arial" font-size="32" text-anchor="middle" fill="#fff">S</text><text x="86" y="62" font-family="Arial, sans-serif" font-size="24" fill="#fff">${title}</text></svg>`);
  function defaultDomainRows(index = -1) {
    return requiredDomains.map((item, i) => ({ id: 101 + i, defaultKey: item.key, domainType: item.label,
      domain: index < 0 ? "" : `${item.prefix}.site-demo-${index + 1}.example.com`,
      platform: item.platform, agent: item.agent, area: "", config: "", enabled: true }));
  }
  function defaultResourceRows() {
    return requiredResources.map((item, i) => ({ id: 205 + i, defaultKey: item.key,
      platform: item.platform, module: item.label, slot: item.slot || null,
      type: "image", image: "", fileName: "", content: "", params: "", enabled: true }));
  }
  function isProtected(kind, row) {
    return kind === "domains" ? requiredDomains.some((item) => item.key === row.defaultKey)
      : kind === "resources" && requiredResources.some((item) => item.key === row.defaultKey && item.protected);
  }
  function canDeleteSelection(kind) {
    const ids = state.selected[kind];
    return ids.size > 0 && !currentSite()[kind].some((row) => ids.has(row.id) && isProtected(kind, row));
  }
  function ensureOpeningDefaults(site) {
    if (site.openingDefaultsInitialized) return;
    const domains = site.domains || [], resources = site.resources || [];
    const usedDomains = new Set(), usedResources = new Set();
    const domainDefaults = requiredDomains.map((item) => {
      let row = domains.find((entry) => !usedDomains.has(entry.id) && (entry.defaultKey === item.key || entry.domainType === item.label || item.aliases.includes(entry.domainType)));
      if (!row) { row = { ...defaultDomainRows().find((entry) => entry.defaultKey === item.key), id: Math.max(100, nextId(domains)) }; domains.push(row); }
      Object.assign(row, { defaultKey: item.key, domainType: item.label, platform: item.platform, agent: item.agent });
      usedDomains.add(row.id); return row;
    });
    const resourceDefaults = requiredResources.map((item) => {
      let row = resources.find((entry) => !usedResources.has(entry.id) && (entry.defaultKey === item.key || entry.module === item.label));
      if (!row) { row = { ...defaultResourceRows().find((entry) => entry.defaultKey === item.key), id: Math.max(200, nextId(resources)) }; resources.push(row); }
      Object.assign(row, { defaultKey: item.key, module: item.label, platform: item.platform, slot: item.slot || null, type: "image" });
      usedResources.add(row.id); return row;
    });
    site.domains = [...domainDefaults, ...domains.filter((row) => !usedDomains.has(row.id))];
    site.resources = [...resourceDefaults, ...resources.filter((row) => !usedResources.has(row.id))];
    site.openingDefaultsInitialized = true;
  }
  function newConfig(index = 0) {
    return {
      siteType: siteTypes[index % siteTypes.length], businessTypes: [], appLanguage: "中文", paymentCurrency: "CNY", cnyExchangeRate: 1,
      security: Object.fromEntries(securitySettings.map((item) => [item.key, 1])),
      telegram: { chineseName: index < 0 ? "" : "演示站点机器人", englishName: index < 0 ? "" : `demo_site_${index + 1}_bot`, botId: index < 0 ? "" : `DEMO-BOT-${index + 1}`, token: "", welcomeText: index < 0 ? "" : "欢迎来到演示站点" },
      firstOpening: { sources: {}, saved: false }, openingChecklist: {}, maintenance: null, controlLogs: [],
      openingDefaultsInitialized: true,
      domains: defaultDomainRows(index), resources: defaultResourceRows(),
      comprehensive: { monthlyRent: 10000, threshold: 100000, profitHq: 20, expenseHq: 30,
        items: expenses.map((name, i) => ({ name, mode: i === 8 ? "CUSTOM" : "INHERIT", hq: i === 8 ? 40 : 30, agentBear: i !== 7 })), quota: index === 1 ? -3000 : 250000 },
      overrides: index === 0 ? [{ id: 301, planId: 1, enabled: true, details: clone(plans[0].details), remark: "" }] : []
    };
  }
  function initialSites() {
    return Array.from({ length: 12 }, (_, i) => ({ id: 1001 + i, code: `DEMO${String(i + 1).padStart(3, "0")}`,
      name: `演示站点${["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][i]}`,
      englishName: `Demo Site ${i + 1}`, account: `site_demo_${String(i + 1).padStart(2, "0")}`, status: [1, 1, 2, 0, 3, 4, 5, 1, 1, 1, 1, 1][i],
      closed: i === 1, closeReason: i === 1 ? "演示关闭状态" : "", applyDate: `2026-10-${String(1 + i % 9).padStart(2, "0")}`, remark: "", ...newConfig(i) }));
  }
  let sites = initialSites();
  try { const saved = JSON.parse(localStorage.getItem(STORAGE)); if (saved?.version === 1 && Array.isArray(saved.sites)) sites = saved.sites; } catch (_) { /* Keep a usable local prototype if storage is unavailable. */ }
  sites.forEach((site, index) => {
    const defaults = newConfig(index);
    const legacyStatus = Number(site.status);
    site.reviewStatus = [3, 4, 5].includes(Number(site.reviewStatus)) ? Number(site.reviewStatus) : [3, 5].includes(legacyStatus) ? legacyStatus : 4;
    site.siteState = siteStates.some((item) => item.value === site.siteState) ? site.siteState
      : site.closed || legacyStatus === 0 || site.reviewStatus !== 4 ? "closed" : legacyStatus === 2 ? "maintenance" : "enabled";
    delete site.status; delete site.closed;
    site.appLanguage = appLanguages.includes(site.appLanguage) ? site.appLanguage : defaults.appLanguage;
    site.paymentCurrency = paymentCurrencies.includes(site.paymentCurrency) ? site.paymentCurrency : defaults.paymentCurrency;
    site.cnyExchangeRate = site.paymentCurrency === "CNY" ? 1 : site.cnyExchangeRate ?? "";
    site.security = { ...defaults.security, ...site.security };
    site.telegram = { ...defaults.telegram, ...site.telegram };
    const existingOpening = site.firstOpening;
    site.firstOpening = { ...defaults.firstOpening, ...existingOpening, sources: { ...existingOpening?.sources } };
    if (existingOpening && existingOpening.saved === undefined) {
      site.firstOpening.saved = Boolean(existingOpening.welcomeText?.trim() || Object.values(existingOpening.sources || {}).some(Boolean));
    }
    delete site.firstOpening.welcomeText;
    hqOnlySources.forEach((key) => {
      site.firstOpening.sources[key] = HQ_SOURCE;
      if (site.firstOpening.sourceLabels) site.firstOpening.sourceLabels[key] = HQ_SOURCE_LABEL;
    });
    // Remove the four legacy demo materials without removing required resources with stable keys.
    site.resources = (site.resources || []).filter((row) => row.defaultKey || ![201, 202, 203, 204].includes(Number(row.id)));
    site.openingChecklist = site.openingChecklist || {};
    site.maintenance = site.maintenance || (site.siteState === "maintenance" ? { reason: "站点例行维护", start: "2026-10-15 02:00:00", end: "2026-10-15 06:00:00", message: "站点维护中，请稍后再试。" } : null);
    (site.resources || []).forEach((row) => {
      const item = requiredResources.find((entry) => entry.key === row.defaultKey || entry.aliases?.includes(row.module));
      if (item) row.module = item.label;
    });
    site.controlLogs = Array.isArray(site.controlLogs) ? site.controlLogs : [];
    ensureOpeningDefaults(site);
  });
  let selectedSiteId = Number(sessionStorage.getItem("prototype.site-opening.1191.current")) || 1001;
  let page, helpers, activeTab, comprehensiveDraft, basicDraft, openingDraft;
  const emptyFilters = () => ({ code: "", name: "", account: "", reviewStatus: "", siteState: "" });
  const state = { menuOpen: true, showSearch: true, filters: emptyFilters(),
    applied: emptyFilters(), paging: { sites: { page: 1, size: 10 }, domains: { page: 1, size: 10 }, resources: { page: 1, size: 10 } },
    selected: { sites: new Set(), domains: new Set(), resources: new Set() } };
  const currentSite = () => sites.find((s) => s.id === selectedSiteId) || sites[0];
  const canEdit = (site) => Number(site.reviewStatus) === 4;
  const reviewLabel = (status) => reviewStatuses.find((item) => item.value === status)?.label || "申请中";
  const openingSourceOptions = (site) => (helpers.sites || []).filter((name) => name !== site.name).map((name) => ({ value: name, label: name }));
  const options = (values, selected, placeholder) => `${placeholder !== undefined ? `<option value="">${esc(placeholder)}</option>` : ""}${values.map((v) => {
    const item = typeof v === "object" ? v : { value: v, label: v };
    return `<option value="${esc(item.value)}"${String(item.value) === String(selected) ? " selected" : ""}${item.disabled ? " disabled" : ""}>${esc(item.label)}</option>`;
  }).join("")}`;
  function button(label, action, id = "", kind = "", disabled = false) {
    return `<button type="button" class="s1191-btn ${kind}" data-s1191-action="${action}" data-id="${esc(id)}"${disabled ? " disabled" : ""}>${label}</button>`;
  }
  function annotated(id, content, cls = "") { return `<section class="s1191-annotated ${cls}" data-component-id="${id}">${helpers.badge(id)}${content}</section>`; }
  const tag = (label, kind = "info") => `<span class="s1191-tag ${kind}">${esc(label)}</span>`;
  function field(label, control, required = false, cls = "") {
    return `<div class="s1191-field ${cls}"><label>${required ? '<em class="s1191-required">*</em>' : ""}${esc(label)}</label><div>${control}</div></div>`;
  }
  const input = (name, value, extra = "") => `<input name="${name}" value="${esc(value)}" ${extra} />`;
  const select = (name, values, value, placeholder, extra = "") => `<select name="${name}" ${extra}>${options(values, value, placeholder)}</select>`;
  const radios = (name, value, choices) => `<div class="s1191-radios">${choices.map(([v, label]) => `<label><input type="radio" name="${name}" value="${v}"${String(value) === String(v) ? " checked" : ""} />${label}</label>`).join("")}</div>`;
  const numeric = (name, value, max, step = "0.01", extra = "") => input(name, value, `type="number" min="0"${max === undefined ? "" : ` max="${max}"`} step="${step}" required ${extra}`);
  const href = (key) => `#requirement/%231191/page/${key}`;
  function persist() {
    try { localStorage.setItem(STORAGE, JSON.stringify({ version: 1, sites })); } catch (_) { toast("本地存储空间不足，本次修改已保留在当前页面会话", "warning"); }
  }
  function toast(message, kind = "success") {
    document.querySelector(".s1191-toast")?.remove();
    const el = document.createElement("div"); el.className = `s1191-toast ${kind}`; el.textContent = message;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3000);
  }
  function refresh() { helpers.rerender(); }
  function commit(message) { persist(); refresh(); if (message) toast(message); }
  function controlState(site) {
    return siteStates.find((item) => item.value === site.siteState)?.label || "已关站";
  }
  function recordControlLog(site, action, before, details = {}) {
    site.controlLogs.unshift({ id: nextId(site.controlLogs),
      time: new Date().toLocaleString("sv-SE", { timeZone: "Asia/Shanghai", hour12: false }),
      operator: "Mike", role: "总控管理员", action, before, after: controlState(site), details: clone(details) });
  }
  function controlLogsDialog() {
    const site = currentSite();
    const rows = site.controlLogs.map((entry) => {
      const d = entry.details || {}, details = [d.reason ? `<div><b>原因：</b>${esc(d.reason)}</div>` : "",
        d.start && d.end ? `<div><b>维护时间段：</b>${esc(d.start)} 至 ${esc(d.end)}</div>` : "",
        d.message !== undefined ? `<div><b>提示文字：</b>${esc(d.message || "未填写")}</div>` : "",
        d.statusChange ? `<div><b>运营状态：</b>${esc(d.statusChange)}</div>` : ""].join("") || "—";
      return `<tr><td>${esc(entry.time)}</td><td>${esc(entry.operator)}<div class="s1191-default-label">${esc(entry.role)}</div></td><td>${esc(entry.action)}</td><td>${esc(entry.before)}</td><td>${esc(entry.after)}</td><td>${details}</td></tr>`;
    });
    dialog("站点控制台操作日志", `<div class="s1191-log-site">${esc(site.name)}（${esc(site.code)}）</div>${table([["操作时间", 168], ["操作人", 110], ["操作", 114], ["变更前", 84], ["变更后", 84], ["操作内容", 280]], rows, null, "s1191-control-log-table").replace("暂无数据", "暂无操作日志")}`, { width: 1000, annotation: "M06", closeOnly: true });
  }
  function sidebar(requirement, current) {
    const p = requirement.pages.find((p) => p.key === LIST);
    const active = current.key === p.key || current.parentKey === p.key;
    return `<aside class="risk-sidebar s1191-sidebar"><div class="risk-brand"><span>C</span><div><strong>总控后台管理系统</strong></div></div><nav aria-label="站点管理导航"><section class="s1191-menu-group${state.menuOpen ? " is-expanded" : ""}" data-prototype-menu-group><button type="button" class="s1191-menu-parent" data-prototype-menu-toggle aria-expanded="${state.menuOpen}" aria-controls="s1191-site-menu"><span class="s1191-menu-icon" aria-hidden="true"></span><span>${esc(p.menuGroup)}</span><i aria-hidden="true"></i></button><div id="s1191-site-menu" class="s1191-menu-children"><a href="${href(p.key)}"${active ? ' class="active" aria-current="page"' : ""}><span class="s1191-page-icon" aria-hidden="true"></span><span>${esc(p.name)}</span><em>修改</em></a></div></section></nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>总控管理员</small></div></div></aside>`;
  }
  function filteredSites() {
    const f = state.applied;
    return sites.filter((s) => ["code", "name", "account"].every((k) => s[k].toLowerCase().includes(f[k].toLowerCase())) && (f.reviewStatus === "" || s.reviewStatus === Number(f.reviewStatus)) && (f.siteState === "" || s.siteState === f.siteState));
  }
  function rowsFor(kind, rows) {
    const p = state.paging[kind]; p.page = Math.min(p.page, Math.max(1, Math.ceil(rows.length / p.size)));
    return rows.slice((p.page - 1) * p.size, p.page * p.size);
  }
  function pager(kind, total) {
    const p = state.paging[kind], count = Math.max(1, Math.ceil(total / p.size));
    return `<div class="s1191-pagination"><span>共 ${total} 条</span><select aria-label="每页数量" data-s1191-size="${kind}">${options([10, 20, 50, 100, 200].map((n) => ({ value: n, label: `${n}条/页` })), p.size)}</select>${button("‹", "page", `${kind}:${p.page - 1}`, "page", p.page === 1)}<span class="s1191-page-number">${p.page}</span>${button("›", "page", `${kind}:${p.page + 1}`, "page", p.page === count)}<span>前往</span><input type="number" min="1" max="${count}" value="${p.page}" aria-label="前往页" data-s1191-jump="${kind}" /><span>页</span></div>`;
  }
  function checkbox(kind, id) { return `<input type="checkbox" aria-label="选择 ${id}" data-s1191-select="${kind}" value="${id}"${state.selected[kind].has(id) ? " checked" : ""} />`; }
  function table(headers, rows, kind, cls = "") {
    return `<div class="s1191-table-wrap" data-page-scroll><table class="s1191-table ${cls}"><thead><tr>${kind ? `<th class="s1191-check"><input type="checkbox" aria-label="选择本页全部" data-s1191-all="${kind}" /></th>` : ""}${headers.map(([label, width]) => `<th${width ? ` style="width:${width}px;min-width:${width}px"` : ""}>${label}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.join("") : `<tr><td class="s1191-empty" colspan="${headers.length + (kind ? 1 : 0)}">暂无数据</td></tr>`}</tbody></table></div>`;
  }
  function toolbar(kind, noun) {
    return `<div class="s1191-toolbar">${kind !== "sites" ? button(`＋ 新增${noun}`, `${kind}-add`, "", "plain-primary") + button(`✎ 修改${noun}`, `${kind}-edit`, "", "plain-success", state.selected[kind].size !== 1) + button(`删除${noun}`, `${kind}-delete`, "", "plain-danger", !canDeleteSelection(kind)) : ""}<div class="s1191-toolbar-right">${kind === "sites" ? button("⌕", "toggle-search", "", "icon", false) : ""}${button("↻", "refresh", kind, "icon")}</div></div>`;
  }
  function list() {
    const result = filteredSites(), rows = rowsFor("sites", result);
    const filters = state.showSearch ? annotated("F01", `<form id="s1191-search" class="s1191-search">
      ${field("站点编码", input("code", state.filters.code, 'placeholder="请输入站点编码"'))}
      ${field("站点名称", input("name", state.filters.name, 'placeholder="请输入站点中文名称"'))}
      ${field("站点管理员账号", input("account", state.filters.account, 'placeholder="请输入管理员账号"'))}
      ${field("审核状态", select("reviewStatus", reviewStatuses, state.filters.reviewStatus, "全部"))}
      ${field("站点状态", select("siteState", siteStates, state.filters.siteState, "全部"))}
      <div class="s1191-search-actions"><button type="submit" class="s1191-btn primary">⌕ 搜索</button>${button("↻ 重置", "reset-search")}</div></form>`) : "";
    const body = rows.map((site) => `<tr><td>${site.id}</td><td>${esc(site.code)}</td><td>${esc(site.name)}</td><td>${esc(site.englishName || "-")}</td><td>${esc(site.account)}</td>
      <td>${tag(reviewLabel(site.reviewStatus), site.reviewStatus === 4 ? "success" : site.reviewStatus === 5 ? "danger" : "info")}</td>
      <td>${tag(controlState(site), site.siteState === "enabled" ? "success" : site.siteState === "maintenance" ? "warning" : "danger")}${site.siteState === "maintenance" && site.maintenance ? `<small class="s1191-site-maintenance-range">${esc(site.maintenance.start)}<br>至 ${esc(site.maintenance.end)}</small>` : ""}</td>
      <td>${site.applyDate}</td><td class="s1191-operations">${button("⚙ 配置", "config", site.id, "text")}${button("删除", "sites-delete", site.id, "text danger-text")}</td></tr>`);
    return `<div class="s1191-view">${filters}${toolbar("sites", "站点")}${annotated("T01", table([["站点ID", 75], ["站点编码", 108], ["站点名称", 130], ["站点英文名称", 130], ["站点管理员账号", 156], ["审核状态", 100], ["站点状态", 190], ["申请时间", 128], ["操作", 125]], body, null, "s1191-site-table") + pager("sites", result.length))}</div>`;
  }
  function basic(site) {
    const types = [...new Set((window.PROTOTYPE_VENUE_GAMES || []).map((v) => v.type).filter(Boolean))];
    if (!basicDraft || basicDraft.siteId !== site.id) basicDraft = { siteId: site.id, ...clone(site) };
    const draft = basicDraft, control = site.siteState;
    const payment = annotated("F03", `<div class="s1191-form-grid">${field("APP默认语言", select("appLanguage", appLanguages, draft.appLanguage, undefined, 'aria-label="APP默认语言" required'), true)}${field("站点支付币种", select("paymentCurrency", paymentCurrencies, draft.paymentCurrency, undefined, 'aria-label="站点支付币种" required'), true)}<div data-s1191-exchange${draft.paymentCurrency === "CNY" ? " hidden" : ""}>${field("对CNY汇率", `<div class="s1191-exchange-equation"><span data-s1191-exchange-unit>1 ${esc(draft.paymentCurrency)} =</span>${input("cnyExchangeRate", draft.cnyExchangeRate, `type="number" min="0" step="any" aria-label="对CNY汇率" placeholder="请输入汇率"${draft.paymentCurrency === "CNY" ? " disabled" : " required"}`)}<span>CNY</span></div>`, true)}</div></div>`, "s1191-span-full");
    const controller = annotated("C01", `<section class="s1191-console ${control}"><div class="s1191-console-heading"><strong>站点控制台</strong>${tag(controlState(site), control === "closed" ? "danger" : control === "maintenance" ? "warning" : control === "enabled" ? "success" : "info")}${button("操作日志", "control-logs", "", "text s1191-console-log-link")}</div><div class="s1191-console-controls" role="group" aria-label="站点状态">${[["enabled", "开启"], ["maintenance", "维护中"], ["closed", "关站"]].map(([value, label]) => `<button type="button" class="s1191-control ${value}${value === control ? " active" : ""}" data-s1191-action="site-control" data-id="${value}" aria-pressed="${value === control}"${!canEdit(site) ? " disabled" : ""}>${label}</button>`).join("")}</div>${site.siteState === "maintenance" && site.maintenance ? `<div class="s1191-maintenance-summary"><span><b>维护原因：</b>${esc(site.maintenance.reason)}</span><span><b>维护时间段：</b>${esc(site.maintenance.start)} 至 ${esc(site.maintenance.end)}</span>${site.maintenance.message ? `<span><b>提示文字：</b>${esc(site.maintenance.message)}</span>` : ""}</div>` : ""}</section>`);
    const base = annotated("P01", `<section class="s1191-card"><header>基本信息</header><div class="s1191-card-body"><div class="s1191-form-grid">${field("站点编码", input("code", site.code, "disabled"))}${field("中文名称", input("name", draft.name, 'required placeholder="请输入站点中文名称"'), true)}${field("英文名称", input("englishName", draft.englishName, 'placeholder="请输入站点英文名称"'))}${field("后台账号", input("account", draft.account, 'required placeholder="请输入后台登录账号"'), true)}${field("站点类型", annotated("F02", select("siteType", siteTypes, draft.siteType, "请选择站点类型")))}${field("经营类型", `<details class="s1191-multiselect"><summary><span>${esc(draft.businessTypes.join("、") || "请选择经营类型")}</span><i aria-hidden="true"></i></summary><div class="s1191-multiselect-options">${types.length ? types.map((t) => `<label><input type="checkbox" name="businessTypes" value="${esc(t)}"${draft.businessTypes.includes(t) ? " checked" : ""} />${esc(t)}</label>`).join("") : '<span class="s1191-tip">暂无经营类型数据</span>'}</div></details>`)}${payment}</div></div></section>`);
    const telegram = annotated("P03", `<section class="s1191-card"><header>Telegram信息</header><div class="s1191-card-body"><div class="s1191-form-grid">${field("中文名", input("telegramChineseName", site.telegram.chineseName, 'readonly placeholder="未配置"'))}${field("机器人英文名", input("telegramEnglishName", site.telegram.englishName, 'readonly placeholder="未配置"'))}${field("机器人ID", input("telegramBotId", site.telegram.botId, 'readonly placeholder="未配置"'))}${field("token", input("telegramToken", site.telegram.token, 'type="password" readonly autocomplete="off" placeholder="未配置"'))}${field("欢迎文案", `<textarea name="telegramWelcome" readonly rows="3" placeholder="未配置">${esc(site.telegram.welcomeText)}</textarea>`, false, "s1191-span-full")}</div></div></section>`);
    return `<div class="s1191-module-stack">${controller}<form id="s1191-basic" novalidate><div class="s1191-module-stack">${base}${telegram}</div><div class="s1191-error" role="alert" hidden></div><div class="s1191-form-actions"><button type="submit" class="s1191-btn primary">保存</button>${button("重置", "reset-basic")}</div></form></div>`;
  }
  function checklistProgress(site) {
    const values = openingChecks.flatMap((group) => group.items.map(([key]) => site.openingChecklist[key] || "pending"));
    const passed = values.filter((value) => value === "passed").length, skipped = values.filter((value) => value === "na").length;
    return `已通过 ${passed} / ${values.length} · 不适用 ${skipped} · 待检查 ${values.length - passed - skipped}`;
  }
  function openingChecklist(site) {
    const groups = openingChecks.map((group, index) => `<section class="s1191-check-group"><h3>${index + 1}. ${esc(group.title)}</h3><div>${group.items.map(([key, title, badge]) => {
      const value = site.openingChecklist[key] || "pending";
      return `<div class="s1191-check-row ${value}"><div><strong>${esc(title)}</strong>${badge ? `<span class="s1191-technical-tag">${esc(badge)}</span>` : ""}</div>${select(`check-${key}`, [{ value: "pending", label: "待检查" }, { value: "passed", label: "已通过" }, { value: "na", label: "不适用" }], value, undefined, `data-s1191-check="${key}" aria-label="${esc(title)}检查结果"`)}</div>`;
    }).join("")}</div></section>`).join("");
    return annotated("C02", `<section class="s1191-card s1191-checklist"><header><span>Check List</span><span class="s1191-check-progress">${checklistProgress(site)}</span></header><div class="s1191-card-body">${groups}</div></section>`);
  }
  function firstOpening(site) {
    const locked = Boolean(site.firstOpening.saved);
    if (!openingDraft || openingDraft.siteId !== site.id) openingDraft = { siteId: site.id, ...clone(site.firstOpening) };
    const draft = locked ? site.firstOpening : openingDraft;
    hqOnlySources.forEach((key) => { draft.sources[key] = HQ_SOURCE; });
    if (!locked && !draft.sources.vipRebate) draft.sources.vipRebate = HQ_SOURCE;
    const sourceOptions = openingSourceOptions(site);
    const sources = openingItems.map(([key, label]) => {
      const id = draft.sources[key], source = sourceOptions.find((item) => item.value === String(id));
      const allowsHq = hqOnlySources.has(key) || key === "vipRebate";
      const choices = hqOnlySources.has(key) ? [] : sourceOptions;
      const availableSources = allowsHq ? [{ value: HQ_SOURCE, label: HQ_SOURCE_LABEL }, ...choices] : choices;
      const sourceLabel = id === HQ_SOURCE ? HQ_SOURCE_LABEL : draft.sourceLabels?.[key] || source?.label || (id ? "来源站点已不可用" : "未选择");
      const control = locked ? input(`source-${key}`, sourceLabel, `readonly aria-label="${esc(label)}复制来源"`) : select(`source-${key}`, availableSources, id, allowsHq ? undefined : "请选择已开启站点", `aria-label="${esc(label)}复制来源"`);
      return field(label, `<div class="s1191-source-control"><span>复制来源</span>${control}</div>`);
    }).join("");
    const content = annotated("P04", `<section class="s1191-card"><header><span>首次开站配置</span>${locked ? tag("已保存 · 仅查看") : ""}</header><div class="s1191-card-body"><p class="s1191-opening-notice">${locked ? "首次开站配置已保存，无法修改。" : "首次保存后无法修改，只能查看，请核对复制来源后保存。"}</p><div class="s1191-opening-grid">${sources}</div></div></section>`);
    const configuration = locked ? content : `<form id="s1191-opening">${content}<div class="s1191-error" role="alert" hidden></div><div class="s1191-form-actions"><button type="submit" class="s1191-btn primary">保存</button>${button("重置", "reset-opening")}</div></form>`;
    return `<div class="s1191-module-stack">${configuration}${openingChecklist(site)}</div>`;
  }
  function domains(site) {
    const rows = rowsFor("domains", site.domains);
    return toolbar("domains", "域名") + annotated("T01", table([["ID", 60], ["域名类型", 200], ["域名", 245], ["平台类型", 100], ["是否代理域名", 120], ["开放地区", 100], ["状态", 80], ["操作", 145]], rows.map((r) => `<tr><td>${checkbox("domains", r.id)}</td><td>${r.id}</td><td><span class="s1191-type-name">${esc(r.domainType)}${isProtected("domains", r) ? '<small class="s1191-default-label">必备</small>' : ""}</span></td><td>${r.domain ? esc(r.domain) : '<span class="s1191-pending">待配置</span>'}</td><td>${esc(r.platform)}</td><td>${tag(r.agent ? "是" : "否", r.agent ? "success" : "info")}</td><td>${esc(r.area || "-")}</td><td>${!r.domain ? tag("待配置", "warning") : `<button type="button" role="switch" aria-label="${esc(r.domain)}状态" aria-checked="${r.enabled}" class="s1191-switch ${r.enabled ? "on" : ""}" data-s1191-action="domain-status" data-id="${r.id}"><i></i></button>`}</td><td class="s1191-operations">${button("✎ 修改", "domains-edit", r.id, "text")}${button("删除", "domains-delete", r.id, "text danger-text", isProtected("domains", r))}</td></tr>`), "domains") + pager("domains", site.domains.length));
  }
  function resources(site) {
    const rows = rowsFor("resources", site.resources);
    return toolbar("resources", "素材") + annotated("T02", table([["ID", 60], ["平台类型", 100], ["功能模块", 240], ["素材类型", 100], ["素材内容", 170], ["配置参数", 120], ["状态", 80], ["操作", 195]], rows.map((r) => `<tr><td>${checkbox("resources", r.id)}</td><td>${r.id}</td><td>${esc(r.platform)}</td><td><span class="s1191-type-name">${esc(r.module)}${isProtected("resources", r) ? '<small class="s1191-default-label">必备</small>' : ""}</span></td><td>${r.type === "image" ? "图片" : "文字"}</td><td>${r.type === "image" ? !r.image ? '<span class="s1191-pending">待上传</span>' : `<button type="button" class="s1191-image-cell" data-s1191-action="preview" data-id="${r.id}"><img src="${esc(r.image)}" alt="${esc(r.fileName)}" /><span>${esc(r.fileName)}</span></button>` : `<span class="s1191-text-content" title="${esc(r.content)}">${esc(r.content.slice(0, 30))}${r.content.length > 30 ? "…" : ""}</span>`}</td><td>${r.params ? `<span class="s1191-params" tabindex="0" title="${esc(r.params)}">查看参数</span>` : "-"}</td><td>${r.type === "image" && !r.image ? tag("待配置", "warning") : tag(r.enabled ? "正常" : "停用", r.enabled ? "success" : "info")}</td><td class="s1191-operations">${button("✎ 修改", "resources-edit", r.id, "text")}${button("预览", "preview", r.id, "text", r.type === "image" && !r.image)}${button("删除", "resources-delete", r.id, "text danger-text", isProtected("resources", r))}</td></tr>`), "resources") + pager("resources", site.resources.length));
  }
  function comprehensive(site) {
    if (!comprehensiveDraft || comprehensiveDraft.siteId !== site.id) comprehensiveDraft = { siteId: site.id, ...clone(site.comprehensive) };
    const c = comprehensiveDraft;
    return `<div class="s1191-module-stack"><form id="s1191-comprehensive" class="s1191-module-stack">${annotated("P02", `<section class="s1191-card"><header><span>站点综合配置</span><button type="submit" class="s1191-btn primary">保存综合配置</button></header><div class="s1191-card-body"><div class="s1191-form-grid">${field("站点编号", input("siteCode", site.code, "disabled"))}${field("站点月费额度(CNY)", numeric("monthlyRent", c.monthlyRent))}${field("站点名称", input("siteName", site.name, "disabled"))}${field("免月费利润阈值(CNY)", numeric("threshold", c.threshold))}</div><h3 class="s1191-divider">站点分润百分比</h3><div class="s1191-form-grid">${field("站点分润(%)", numeric("profitSite", +(100 - c.profitHq).toFixed(2), 100, "0.01", "disabled"))}${field("总站分润(%)", numeric("profitHq", c.profitHq, 100))}</div><h3 class="s1191-divider">运营费用总设置</h3><div class="s1191-form-grid">${field("站点自动承担(%)", numeric("expenseSite", +(100 - c.expenseHq).toFixed(2), 100, "0.01", "disabled"))}${field("总站承担(%)", numeric("expenseHq", c.expenseHq, 100))}</div><div class="s1191-alert info">ⓘ 站点承担比例自动按“100% - 总站承担比例”计算。继承总设置直接使用上方比例；选择不承担后，该费用不进入代理承担范围。</div>${table([["费用类别", 135], ["分摊方式", 225], ["站点自动承担(%)", 155], ["总站承担(%)", 150], ["代理是否按自身比例承担", 230]], c.items.map((r, i) => `<tr data-expense-index="${i}"><td>${r.name}</td><td>${radios(`mode-${i}`, r.mode, [["INHERIT", "继承总设置"], ["CUSTOM", "单独设置"]])}</td><td>${numeric(`site-${i}`, +(100 - (r.mode === "INHERIT" ? c.expenseHq : r.hq)).toFixed(2), 100, "0.01", "disabled")}</td><td>${numeric(`hq-${i}`, r.mode === "INHERIT" ? c.expenseHq : r.hq, 100, "0.01", r.mode === "INHERIT" ? "disabled" : "")}</td><td>${radios(`agent-${i}`, String(r.agentBear), [["true", "承担"], ["false", "不承担"]])}</td></tr>`), null, "s1191-expense-table")}<div class="s1191-error" hidden></div></div></section>`)}<section class="s1191-card"><header>站点额度</header><div class="s1191-card-body"><div class="s1191-form-grid">${field("当前可用额度(CNY)", input("quota", money(c.quota), "disabled"))}</div>${c.quota < 0 ? '<p class="s1191-quota-warning">当前可用额度为负数，请在额度管理中充值。</p>' : ""}</div></section></form>${annotated("T03", `<section class="s1191-card"><header><span>返佣方案配置</span>${button("＋ 新增返佣方案", "commission-add", "", "primary")}</header><div class="s1191-card-body">${table([["基础返佣方案", 180], ["类型", 120], ["专用参数", 260], ["状态", 90], ["操作", 145]], site.overrides.map((r) => {
      const plan = plans.find((p) => p.id === r.planId);
      return `<tr><td>${esc(plan.name)}</td><td>${plan.type}</td><td><div class="s1191-rate-tags">${r.details.map((d) => tag(`${d.level}级/${+(d.rate * 100).toFixed(4)}%`)).join("") || "-"}</div></td><td>${tag(r.enabled ? "启用" : "停用", r.enabled ? "success" : "info")}</td><td class="s1191-operations">${button("修改", "commission-edit", r.id, "text")}${button("删除", "commission-delete", r.id, "text danger-text")}</td></tr>`;
    }))}</div></section>`)}</div>`;
  }
  function configuration() {
    const site = currentSite();
    if (!site) return `<div class="s1191-empty">暂无站点，请返回列表新增站点。<p><a href="${href(LIST)}">返回列表</a></p></div>`;
    const body = activeTab === "基本配置" ? basic(site) : activeTab === "域名配置" ? domains(site) : activeTab === "资源配置" ? resources(site) : activeTab === "站点综合配置" ? comprehensive(site) : activeTab === "首次开站配置" ? firstOpening(site) : '<div class="s1191-unchanged-page">与生产一致无修改</div>';
    return `<div class="s1191-view s1191-config"><section class="s1191-config-card"><header class="s1191-config-heading"><strong>站点配置 - ${esc(site.code)}</strong><a class="s1191-btn" href="${href(LIST)}">返回列表</a></header>${annotated("N01", `<nav class="s1191-tabs">${page.tabs.map((tab) => button(esc(tab), "tab", tab, activeTab === tab ? "active" : "")).join("")}</nav>`)}<div class="s1191-tab-content">${body}</div></section></div>`;
  }
  function render(current, api) {
    page = current; helpers = api; activeTab = api.activeTab || current.tabs?.[0];
    if (activeTab === "基本信息") activeTab = "基本配置";
    return current.key === LIST ? list() : configuration();
  }
  function dialog(title, content, { width = 500, annotation, formId, label = "确定", onSave, closeOnly = false } = {}) {
    const footer = closeOnly ? '<footer><button type="button" class="s1191-btn modal-cancel">关闭</button></footer>' : `<footer><button type="${formId ? "submit" : "button"}"${formId ? ` form="${formId}"` : ""} class="s1191-btn primary" data-s1191-save>${label}</button><button type="button" class="s1191-btn modal-cancel">取消</button></footer>`;
    helpers.modal(title, content, "", footer);
    const root = document.getElementById("modal-root"), pane = document.querySelector(".prototype-pane").getBoundingClientRect();
    root.classList.add("production-admin-ui-488", "s1191-modal-root");
    root.querySelector(".modal-backdrop").style.right = `${Math.max(0, window.innerWidth - pane.right)}px`;
    const box = root.querySelector(".risk-modal"); box.classList.add("s1191-dialog"); box.style.width = `${width}px`;
    if (annotation) { box.dataset.componentId = annotation; box.classList.add("s1191-annotated"); box.insertAdjacentHTML("afterbegin", helpers.badge(annotation)); }
    if (formId) root.querySelector(`#${formId}`).addEventListener("submit", (e) => { e.preventDefault(); onSave?.(e.target, root); });
    else root.querySelector("[data-s1191-save]")?.addEventListener("click", () => onSave?.(null, root));
    helpers.bindLinks(); return root;
  }
  function dismiss() { document.getElementById("modal-root").innerHTML = ""; }
  function error(form, message, name) {
    const el = form.querySelector(".s1191-error"); el.textContent = message; el.hidden = false;
    if (name) form.elements[name]?.focus(); return false;
  }
  function siteUnique(form, value, ignoreId) {
    if (sites.some((s) => s.id !== ignoreId && s.code.toLowerCase() === value.code.toLowerCase())) return error(form, "站点编码已存在", "code");
    if (sites.some((s) => s.id !== ignoreId && s.account.toLowerCase() === value.account.toLowerCase())) return error(form, "站点管理员账号已存在", "account");
    return true;
  }
  function nextId(rows) { return Math.max(0, ...rows.map((r) => r.id)) + 1; }
  function confirm(title, text, onConfirm, label = "确定") {
    dialog(title, `<div class="s1191-confirm-message">${text}</div>`, { label, onSave() { dismiss(); onConfirm(); } });
  }
  function closeSite(site) {
    dialog("关闭站点", `<div class="s1191-alert warning">关闭后将禁止网页访问、登录和注册，并强制清退该站点会员及后台登录态。</div><form id="s1191-close-form" class="s1191-dialog-form">${field("关闭原因", '<textarea name="reason" required rows="4" maxlength="200" placeholder="请输入关闭原因"></textarea>', true)}${field(`输入 ${site.code}`, input("code", "", 'required placeholder="请输入站点编码确认"'), true)}<div class="s1191-error" hidden></div></form>`, { formId: "s1191-close-form", label: "继续关闭", onSave(form) {
      const reason = form.elements.reason.value.trim();
      if (!reason) return error(form, "请输入关闭原因", "reason");
      if (form.elements.code.value.trim() !== site.code) return error(form, "站点编码不一致，请重新输入", "code");
      confirm("确认关闭站点", `确认关闭站点 <strong>${esc(site.code)}</strong> 吗？关闭后将禁止访问、登录和注册，并清退登录态。`, () => { const before = controlState(site); site.siteState = "closed"; site.maintenance = null; site.closeReason = reason; recordControlLog(site, "关站", before, { reason }); commit("站点已关闭"); }, "确认关闭");
    } });
  }
  function maintainSite(site) {
    const value = site.maintenance || {}, today = new Date();
    const startDate = value.start ? new Date(value.start.replace(" ", "T")) : today;
    const endDate = value.end ? new Date(value.end.replace(" ", "T")) : today;
    const dateControl = helpers.dateControl({ year: startDate.getFullYear(), month: startDate.getMonth() + 1, startDay: startDate.getDate(), endDay: endDate.getDate(), startTime: value.start?.slice(11) || "00:00:00", endTime: value.end?.slice(11) || "23:59:59", empty: !value.start });
    const root = dialog("站点维护", `<form id="s1191-maintenance-form" class="s1191-dialog-form" novalidate>${field("维护原因", `<textarea name="reason" required rows="4" maxlength="255" placeholder="请输入维护原因">${esc(value.reason || "")}</textarea>`, true)}${field("维护时间段", dateControl, true, "s1191-maintenance-time")}${field("提示文字", `<textarea name="message" rows="3" maxlength="255" placeholder="请输入前端展示的维护提示文字">${esc(value.message || "")}</textarea>`)}<div class="s1191-error" role="alert" hidden></div></form>`, { width: 560, annotation: "M05", formId: "s1191-maintenance-form", label: "确认维护", onSave(form) {
      const reason = form.elements.reason.value.trim(), range = form.querySelector(".agent-498-date");
      if (!reason) return error(form, "请填写维护原因", "reason");
      const values = [...range.querySelectorAll("span")].map((el) => el.textContent.trim());
      if (values.length !== 2 || !values.every((v) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v))) return error(form, "请选择完整的维护时间段");
      if (values[0] >= values[1]) return error(form, "维护结束时间必须晚于开始时间");
      const before = controlState(site);
      site.maintenance = { reason, start: values[0], end: values[1], message: form.elements.message.value.trim() };
      site.siteState = "maintenance"; site.closeReason = "";
      recordControlLog(site, before === "维护中" ? "修改维护配置" : "开启维护", before, site.maintenance);
      dismiss(); commit("站点已开启维护");
    } });
    if (value.start && value.end) {
      const trigger = root.querySelector(".agent-498-date");
      trigger.innerHTML = `<span>${esc(value.start)}</span><b>至</b><span>${esc(value.end)}</span>`;
      [["start", startDate], ["end", endDate]].forEach(([side, date]) => {
        const panel = root.querySelector(`.calendar-panel[data-range-side="${side}"]`), year = date.getFullYear(), month = date.getMonth() + 1;
        panel.dataset.year = String(year); panel.dataset.month = String(month);
        panel.querySelector("header strong").textContent = `${year}年${month}月`;
        panel.querySelector(".calendar-days").innerHTML = '<span></span>'.repeat((new Date(year, month - 1, 1).getDay() + 6) % 7) + Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => `<button type="button" class="calendar-day${i + 1 === date.getDate() ? " selected" : ""}" data-day="${i + 1}">${i + 1}</button>`).join("");
      });
    }
    helpers.bindDates();
  }
  function setSiteControl(mode) {
    const site = currentSite();
    if (!canEdit(site)) return;
    if (mode === "maintenance") return maintainSite(site);
    if (mode === "closed") { if (site.siteState !== "closed") closeSite(site); return; }
    if (mode === "enabled" && site.siteState !== "enabled") confirm("开启站点", `确认开启站点 <strong>${esc(site.code)}</strong> 吗？${site.siteState === "maintenance" ? "将结束当前维护。" : "将恢复站点访问。"}`, () => {
      const before = controlState(site);
      site.siteState = "enabled"; site.closeReason = ""; site.maintenance = null; recordControlLog(site, "开启", before); commit("站点已开启");
    }, "确认开启");
  }
  function deleteRows(kind, id) {
    const source = kind === "sites" ? sites : currentSite()[kind];
    const ids = id ? [id] : [...state.selected[kind]];
    if (!ids.length) return;
    if (kind === "sites" && source.some((row) => ids.includes(row.id) && row.siteState !== "closed")) return toast("仅已关站的站点允许删除，请先到配置页关站", "warning");
    if (kind !== "sites" && source.some((row) => ids.includes(row.id) && isProtected(kind, row))) {
      return toast(kind === "domains" ? "默认四类域名只能修改，不能删除" : "登录注册logo（方形）、首页logo（带站点名）和WEB端APP下载配图只能修改，不能删除", "warning");
    }
    const title = kind === "sites" ? "站点" : kind === "domains" ? "域名" : "素材";
    confirm(`删除${title}`, `是否确认删除${ids.length === 1 ? `该${title}` : `选中的 ${ids.length} 条${title}`}？`, () => {
      if (kind === "sites" && sites.some((row) => ids.includes(row.id) && row.siteState !== "closed")) return toast("站点状态已变化，仅已关站的站点允许删除", "warning");
      if (kind === "sites") sites = sites.filter((r) => !ids.includes(r.id));
      else currentSite()[kind] = source.filter((r) => !ids.includes(r.id));
      state.selected[kind].clear(); comprehensiveDraft = null; commit(`${title}已删除`);
    }, "确认删除");
  }
  function domainDialog(id) {
    const site = currentSite(), r = site.domains.find((r) => r.id === id);
    const v = r || { domainType: "", domain: "", platform: "", agent: false, area: "", config: "", enabled: true };
    const fixed = Boolean(r && isProtected("domains", r));
    dialog(r ? "修改域名" : "新增域名", `<form id="s1191-domain-form" class="s1191-dialog-form">${field("域名类型", select("domainType", domainTypes, v.domainType, "请选择域名类型", fixed ? "disabled" : "required"), true)}${field("域名", input("domain", v.domain, 'required placeholder="请输入域名，如：www.example.com"') + '<p class="s1191-tip">请输入完整的域名，不需要包含http://或https://</p>', true)}${field("平台类型", select("platform", platforms, v.platform, "请选择平台类型", fixed ? "disabled" : "required"), true)}${field("代理域名", fixed ? radios("agent", v.agent, [["true", "是"], ["false", "否"]]).replaceAll("<input ", "<input disabled ") : radios("agent", v.agent, [["true", "是"], ["false", "否"]]))}${field("开放地区", select("area", ["国内", "国外"], v.area, ""))}${field("配置信息", `<textarea name="config" rows="3" placeholder="请输入配置信息，JSON格式">${esc(v.config)}</textarea><p class="s1191-tip">可选，用于存储额外的配置信息，如：{"ssl": true, "cdn": "cloudflare"}</p>`)}${field("状态", radios("enabled", v.enabled, [["true", "启用"], ["false", "禁用"]]))}<div class="s1191-error" hidden></div></form>`, { width: 600, annotation: "M02", formId: "s1191-domain-form", onSave(form) {
      const f = new FormData(form), domain = String(f.get("domain")).trim();
      if (!/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(domain)) return error(form, "请输入合法域名，不含协议、路径或端口", "domain");
      const saved = { domainType: fixed ? r.domainType : f.get("domainType"), domain, platform: fixed ? r.platform : f.get("platform"), agent: fixed ? r.agent : f.get("agent") === "true", area: f.get("area"), config: String(f.get("config")).trim(), enabled: f.get("enabled") === "true" };
      if (r) Object.assign(r, saved); else site.domains.push({ id: Math.max(100, nextId(site.domains)), ...saved });
      state.selected.domains.clear(); dismiss(); commit("域名配置已保存");
    } });
  }
  function resourceDialog(id) {
    const site = currentSite(), r = site.resources.find((r) => r.id === id);
    const v = clone(r || { platform: "", module: "", type: "image", params: "", content: "", image: "", fileName: "", enabled: true });
    const fixed = Boolean(r?.defaultKey);
    const material = () => v.type === "text" ? field("文字内容", `<textarea name="content" rows="4" required placeholder="请输入文字内容">${esc(v.content)}</textarea><p class="s1191-tip">请输入需要在平台上显示的文字内容</p>`, true) : field("图片素材", `<div class="s1191-upload"><label class="s1191-upload-box">${v.image ? `<img src="${esc(v.image)}" alt="上传图片" />` : "＋"}<input type="file" name="imageFile" accept="image/jpeg,image/png,image/gif" aria-label="上传图片" /></label>${v.image ? `<button type="button" class="s1191-btn text danger-text" data-remove-image>删除图片</button><span>${esc(v.fileName)}</span>` : ""}</div><p class="s1191-tip">支持jpg、png、gif格式，大小不超过2MB，建议尺寸适合对应平台显示</p>`, true);
    const root = dialog(r ? "修改素材" : "新增素材", `<form id="s1191-resource-form" class="s1191-dialog-form">${field("平台类型", select("platform", resourcePlatforms, v.platform, "请选择平台类型", fixed ? "disabled" : "required"), true)}${field("功能模块", select("module", modules, v.module, "请选择功能模块", fixed ? "disabled" : "required"), true)}${field("素材类型", select("type", [{ value: "image", label: "图片" }, { value: "text", label: "文字" }], v.type, undefined, fixed ? "disabled" : "required"), true)}${field("配置参数", `<textarea name="params" rows="3" placeholder="请输入配置参数，JSON格式">${esc(v.params)}</textarea><p class="s1191-tip">可选参数，用于存储额外的配置信息，如：{"width": 100, "height": 100, "color": "#ffffff"}</p>`)}<div data-material-fields>${material()}</div>${field("状态", radios("enabled", v.enabled, [["true", "正常"], ["false", "停用"]]))}<div class="s1191-error" hidden></div></form>`, { width: 700, annotation: "M03", formId: "s1191-resource-form", onSave(form) {
      const f = new FormData(form);
      if (v.loading) return error(form, "图片正在读取，请稍候再保存");
      if (v.type === "image" && !v.image) return error(form, "请上传图片素材");
      const content = String(f.get("content") || "").trim();
      if (v.type === "text" && !content) return error(form, "请输入文字内容", "content");
      const saved = { platform: fixed ? r.platform : f.get("platform"), module: fixed ? r.module : f.get("module"), type: v.type, params: String(f.get("params")).trim(), content: v.type === "text" ? content : "", image: v.type === "image" ? v.image : "", fileName: v.type === "image" ? v.fileName : "", enabled: f.get("enabled") === "true" };
      if (r) Object.assign(r, saved); else site.resources.push({ id: Math.max(200, nextId(site.resources)), ...saved });
      state.selected.resources.clear(); dismiss(); commit("素材已保存");
    } });
    let imageRevision = 0;
    const bindMaterial = () => {
      const form = root.querySelector("form");
      form.querySelector("[data-remove-image]")?.addEventListener("click", () => { imageRevision++; v.image = ""; v.fileName = ""; v.loading = false; redrawMaterial(); });
      form.querySelector("input[type=file]")?.addEventListener("change", async (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type) || file.size > 2 * 1024 * 1024) { e.target.value = ""; return error(form, "图片只支持jpg/png/gif，且不超过2MB"); }
        const revision = ++imageRevision; v.loading = true;
        const reader = new FileReader();
        reader.onload = () => { if (revision !== imageRevision || !root.querySelector("#s1191-resource-form")) return; v.image = String(reader.result); v.fileName = file.name; v.loading = false; form.querySelector(".s1191-error").hidden = true; redrawMaterial(); };
        reader.onerror = () => { if (revision === imageRevision) { v.loading = false; error(form, "图片读取失败，请重新选择"); } }; reader.readAsDataURL(file);
      });
    };
    const redrawMaterial = () => { root.querySelector("[data-material-fields]").innerHTML = material(); bindMaterial(); };
    root.querySelector("[name=type]").addEventListener("change", (e) => { imageRevision++; v.type = e.target.value; v.content = ""; v.image = ""; v.fileName = ""; v.loading = false; root.querySelector(".s1191-error").hidden = true; redrawMaterial(); });
    bindMaterial();
  }
  function preview(id) {
    const r = currentSite().resources.find((r) => r.id === id);
    const root = dialog(r.type === "image" ? "图片预览" : "文字预览", `<div class="s1191-preview">${r.type === "image" ? `<img src="${esc(r.image)}" alt="${esc(r.fileName)}" /><p>${esc(r.fileName)}</p>` : `<div class="s1191-preview-text">${esc(r.content)}</div>`}<button type="button" class="s1191-btn primary" data-copy>${r.type === "image" ? "复制图片地址" : "复制文字内容"}</button></div>`, { width: 700, closeOnly: true });
    root.querySelector("[data-copy]").addEventListener("click", async () => { try { await navigator.clipboard.writeText(r.type === "image" ? r.image : r.content); toast("已复制"); } catch (_) { toast("复制失败，请手动复制内容", "warning"); } });
  }
  function commissionDialog(id) {
    const site = currentSite(), r = site.overrides.find((r) => r.id === id);
    const v = clone(r || { planId: "", enabled: true, details: [], remark: "" });
    const details = () => table([["级别/星级", 160], ["返佣比例(0~1)", 180], ["操作", 100]], v.details.map((d, i) => `<tr><td>${numeric(`level-${i}`, d.level, undefined, "1")}</td><td>${numeric(`rate-${i}`, d.rate, 1, "0.0001")}</td><td><button type="button" class="s1191-btn text danger-text" data-remove-level="${i}">删除</button></td></tr>`));
    const root = dialog(r ? "修改站点专用返佣方案" : "新增站点专用返佣方案", `<form id="s1191-commission-form" class="s1191-dialog-form">${field("基础返佣方案", select("planId", plans.map((p) => ({ value: p.id, label: `${p.name}（${p.type}）` })), v.planId, "请选择基础返佣方案", r ? "disabled" : "required"), true)}${field("状态", radios("enabled", v.enabled, [["true", "启用"], ["false", "停用"]]))}${field("专用参数", '<button type="button" class="s1191-btn primary" data-add-level>＋ 添加级别</button><div data-commission-details></div>')}${field("备注", `<textarea name="remark" rows="3" maxlength="500" placeholder="请输入备注">${esc(v.remark)}</textarea>`)}<div class="s1191-error" hidden></div></form>`, { width: 780, annotation: "M04", formId: "s1191-commission-form", label: "保存", onSave(form) {
      capture();
      if (!v.planId) return error(form, "请选择基础返佣方案", "planId");
      if (site.overrides.some((o) => o.id !== id && o.planId === v.planId)) return error(form, "此基础方案已设置站点专用参数，请修改已有配置", "planId");
      if (!v.details.length) return error(form, "请至少添加一个级别");
      if (v.details.some((d) => !Number.isInteger(d.level) || d.level < 0 || !Number.isFinite(d.rate) || d.rate < 0 || d.rate > 1)) return error(form, "级别须为非负整数，返佣比例须为0~1");
      if (new Set(v.details.map((d) => d.level)).size !== v.details.length) return error(form, "级别/星级不能重复");
      v.enabled = form.elements.enabled.value === "true"; v.remark = form.elements.remark.value.trim();
      if (r) Object.assign(r, v); else site.overrides.push({ id: Math.max(300, nextId(site.overrides)), ...v });
      dismiss(); commit("站点专用返佣方案已保存");
    } });
    const capture = () => { const form = root.querySelector("form"); v.details.forEach((d, i) => { d.level = form.elements[`level-${i}`].value === "" ? NaN : Number(form.elements[`level-${i}`].value); d.rate = form.elements[`rate-${i}`].value === "" ? NaN : Number(form.elements[`rate-${i}`].value); }); };
    const redraw = () => {
      root.querySelector("[data-commission-details]").innerHTML = details();
      root.querySelectorAll("[data-remove-level]").forEach((b) => b.addEventListener("click", () => { capture(); v.details.splice(Number(b.dataset.removeLevel), 1); redraw(); }));
    };
    root.querySelector("[name=planId]").addEventListener("change", (e) => { v.planId = Number(e.target.value) || ""; v.details = clone(plans.find((p) => p.id === v.planId)?.details || []); redraw(); });
    root.querySelector("[data-add-level]").addEventListener("click", () => { capture(); v.details.push({ level: v.details.some((d) => d.level === 0) ? Math.max(...v.details.map((d) => Number.isFinite(d.level) ? d.level : 0)) + 1 : 0, rate: 0 }); redraw(); });
    redraw();
  }
  function bindComprehensive() {
    const form = document.getElementById("s1191-comprehensive"); if (!form) return;
    const c = comprehensiveDraft;
    form.addEventListener("input", (e) => {
      const { name, value } = e.target; if (!name || e.target.type === "radio") return;
      if (["monthlyRent", "threshold", "profitHq", "expenseHq"].includes(name)) c[name] = Number(value);
      if (name === "profitHq") form.elements.profitSite.value = +(100 - Number(value)).toFixed(2);
      if (name === "expenseHq") {
        form.elements.expenseSite.value = +(100 - Number(value)).toFixed(2);
        c.items.forEach((r, i) => { if (r.mode === "INHERIT") { r.hq = Number(value); form.elements[`hq-${i}`].value = value; form.elements[`site-${i}`].value = +(100 - Number(value)).toFixed(2); } });
      }
      if (/^hq-\d+$/.test(name)) { const i = Number(name.slice(3)); c.items[i].hq = Number(value); form.elements[`site-${i}`].value = +(100 - Number(value)).toFixed(2); }
    });
    form.addEventListener("change", (e) => {
      const { name, value } = e.target;
      if (/^mode-\d+$/.test(name)) { const i = Number(name.slice(5)), r = c.items[i]; r.mode = value; if (value === "INHERIT") r.hq = c.expenseHq; form.elements[`hq-${i}`].disabled = value === "INHERIT"; form.elements[`hq-${i}`].value = r.hq; form.elements[`site-${i}`].value = +(100 - r.hq).toFixed(2); }
      if (/^agent-\d+$/.test(name)) c.items[Number(name.slice(6))].agentBear = value === "true";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault(); const values = [c.monthlyRent, c.threshold, c.profitHq, c.expenseHq, ...c.items.map((r) => r.hq)];
      if (values.some((v) => !Number.isFinite(v) || v < 0) || [c.profitHq, c.expenseHq, ...c.items.map((r) => r.hq)].some((v) => v > 100)) return error(form, "金额须大于等于0，百分比须在0~100范围内");
      const saved = clone(c); delete saved.siteId; currentSite().comprehensive = saved; comprehensiveDraft = null; commit("综合配置已保存");
    });
  }
  function syncSelection(kind) {
    const root = document.querySelector(".s1191-view");
    const boxes = [...root.querySelectorAll(`[data-s1191-select="${kind}"]`)];
    const all = root.querySelector(`[data-s1191-all="${kind}"]`), selected = boxes.filter((b) => b.checked).length;
    if (all) { all.checked = boxes.length > 0 && selected === boxes.length; all.indeterminate = selected > 0 && selected < boxes.length; }
    root.querySelector(`[data-s1191-action="${kind}-edit"][data-id=""]`).disabled = state.selected[kind].size !== 1;
    const remove = root.querySelector(`[data-s1191-action="${kind}-delete"][data-id=""]`); if (remove) remove.disabled = !canDeleteSelection(kind);
  }
  function bind() {
    document.querySelector(".s1191-menu-parent")?.addEventListener("click", (e) => {
      state.menuOpen = e.currentTarget.getAttribute("aria-expanded") === "true";
    });
    document.querySelectorAll("[data-s1191-action]").forEach((b) => b.addEventListener("click", () => {
      const action = b.dataset.s1191Action, id = Number(b.dataset.id), rawId = b.dataset.id;
      if (action === "tab") { helpers.setTab(rawId); }
      else if (action === "toggle-search") { state.showSearch = !state.showSearch; refresh(); }
      else if (action === "refresh") { refresh(); toast("已刷新"); }
      else if (action === "reset-search") { state.filters = emptyFilters(); state.applied = { ...state.filters }; state.paging.sites.page = 1; state.selected.sites.clear(); refresh(); }
      else if (action === "config") { selectedSiteId = id; sessionStorage.setItem("prototype.site-opening.1191.current", id); comprehensiveDraft = null; basicDraft = null; openingDraft = null; state.selected.domains.clear(); state.selected.resources.clear(); state.paging.domains.page = 1; state.paging.resources.page = 1; window.location.hash = href(CONFIG) + `/menu/${encodeURIComponent("基本配置")}`; }
      else if (action === "sites-delete") deleteRows("sites", id);
      else if (action === "reset-basic") { basicDraft = null; refresh(); }
      else if (action === "reset-opening" && !currentSite().firstOpening.saved) { openingDraft = null; refresh(); }
      else if (action === "site-control") setSiteControl(rawId);
      else if (action === "control-logs") controlLogsDialog();
      else if (action === "domains-add") domainDialog();
      else if (action === "domains-edit") domainDialog(id || [...state.selected.domains][0]);
      else if (action === "domains-delete") deleteRows("domains", id);
      else if (action === "domain-status") { const r = currentSite().domains.find((r) => r.id === id); confirm("域名状态", `确认${r.enabled ? "禁用" : "启用"}域名 <strong>${esc(r.domain)}</strong> 吗？`, () => { r.enabled = !r.enabled; commit("域名状态已更新"); }); }
      else if (action === "resources-add") resourceDialog();
      else if (action === "resources-edit") resourceDialog(id || [...state.selected.resources][0]);
      else if (action === "resources-delete") deleteRows("resources", id);
      else if (action === "preview") preview(id);
      else if (action === "commission-add") commissionDialog();
      else if (action === "commission-edit") commissionDialog(id);
      else if (action === "commission-delete") confirm("删除站点专用参数", "是否删除此站点专用参数？删除后将回退通用方案。", () => { currentSite().overrides = currentSite().overrides.filter((r) => r.id !== id); commit("站点专用参数已删除"); });
      else if (action === "page") { const [kind, n] = rawId.split(":"); state.paging[kind].page = Number(n); state.selected[kind].clear(); refresh(); }
    }));
    document.getElementById("s1191-search")?.addEventListener("input", (e) => { if (e.target.name) state.filters[e.target.name] = e.target.value; });
    document.getElementById("s1191-search")?.addEventListener("change", (e) => { if (e.target.name) state.filters[e.target.name] = e.target.value; });
    document.getElementById("s1191-search")?.addEventListener("submit", (e) => { e.preventDefault(); state.applied = Object.fromEntries(Object.entries(state.filters).map(([k, v]) => [k, v.trim()])); state.paging.sites.page = 1; state.selected.sites.clear(); refresh(); });
    const basicForm = document.getElementById("s1191-basic");
    const updateBasicDraft = () => {
      if (!basicForm || !basicDraft) return;
      const f = new FormData(basicForm);
      ["name", "account", "englishName", "siteType", "appLanguage", "paymentCurrency"].forEach((key) => { basicDraft[key] = String(f.get(key) || ""); });
      basicDraft.cnyExchangeRate = basicDraft.paymentCurrency === "CNY" ? 1 : String(f.get("cnyExchangeRate") || "");
      basicDraft.businessTypes = f.getAll("businessTypes");
    };
    basicForm?.addEventListener("input", updateBasicDraft);
    basicForm?.addEventListener("change", (e) => {
      updateBasicDraft();
      if (e.target.name !== "paymentCurrency") return;
      const foreign = basicDraft.paymentCurrency !== "CNY", rate = basicForm.elements.cnyExchangeRate;
      basicDraft.cnyExchangeRate = foreign ? "" : 1;
      rate.value = basicDraft.cnyExchangeRate;
      rate.disabled = !foreign; rate.required = foreign;
      basicForm.querySelector("[data-s1191-exchange]").hidden = !foreign;
      basicForm.querySelector("[data-s1191-exchange-unit]").textContent = `1 ${basicDraft.paymentCurrency} =`;
      basicForm.querySelector(".s1191-error").hidden = true;
    });
    basicForm?.addEventListener("submit", (e) => {
      e.preventDefault(); const form = e.target, f = new FormData(form), s = currentSite();
      const saved = { code: s.code, name: String(f.get("name")).trim(), account: String(f.get("account")).trim(), englishName: String(f.get("englishName")).trim() };
      if (!saved.name || !saved.account) return error(form, "中文名称和后台账号必填");
      if (!siteUnique(form, saved, s.id)) return;
      const appLanguage = String(f.get("appLanguage") || ""), paymentCurrency = String(f.get("paymentCurrency") || "");
      if (!appLanguages.includes(appLanguage)) return error(form, "请选择APP默认语言", "appLanguage");
      if (!paymentCurrencies.includes(paymentCurrency)) return error(form, "请选择站点支付币种", "paymentCurrency");
      const cnyExchangeRate = paymentCurrency === "CNY" ? 1 : Number(f.get("cnyExchangeRate"));
      if (!Number.isFinite(cnyExchangeRate) || cnyExchangeRate <= 0) return error(form, "请填写大于0的对CNY汇率", "cnyExchangeRate");
      updateBasicDraft();
      Object.assign(s, saved, { siteType: f.get("siteType"), businessTypes: f.getAll("businessTypes"), appLanguage, paymentCurrency, cnyExchangeRate });
      basicDraft = null; commit("基本配置已保存");
    });
    document.querySelectorAll("[data-s1191-check]").forEach((control) => control.addEventListener("change", () => {
      currentSite().openingChecklist[control.dataset.s1191Check] = control.value;
      persist();
      control.closest(".s1191-check-row").className = `s1191-check-row ${control.value}`;
      document.querySelector(".s1191-check-progress").textContent = checklistProgress(currentSite());
    }));
    const openingForm = document.getElementById("s1191-opening");
    const updateOpeningDraft = () => {
      if (!openingForm || !openingDraft || currentSite().firstOpening.saved) return;
      const f = new FormData(openingForm);
      openingDraft.sources = Object.fromEntries(openingItems.map(([key]) => [key, String(f.get(`source-${key}`) || "")]));
    };
    openingForm?.addEventListener("input", updateOpeningDraft);
    openingForm?.addEventListener("change", updateOpeningDraft);
    openingForm?.addEventListener("submit", (e) => {
      e.preventDefault(); const s = currentSite();
      if (s.firstOpening.saved) { refresh(); return toast("首次开站配置已保存，仅可查看", "warning"); }
      updateOpeningDraft();
      const sourceLabels = {};
      for (const [key, label] of openingItems) {
        const id = openingDraft.sources[key], source = openingSourceOptions(s).find((item) => item.value === id);
        if (id === HQ_SOURCE && (hqOnlySources.has(key) || key === "vipRebate")) { sourceLabels[key] = HQ_SOURCE_LABEL; continue; }
        if (hqOnlySources.has(key)) return error(openingForm, `${label}须与总站配置一致`, `source-${key}`);
        if (id && !source) return error(openingForm, `${label}的复制来源未开启，请重新选择`, `source-${key}`);
        if (source) sourceLabels[key] = source.label;
      }
      s.firstOpening = { sources: clone(openingDraft.sources), sourceLabels, saved: true };
      openingDraft = null; commit("首次开站配置已保存，后续仅可查看");
    });
    document.querySelectorAll(".s1191-multiselect input").forEach((box) => box.addEventListener("change", () => { const root = box.closest("details"); root.querySelector("summary span").textContent = [...root.querySelectorAll("input:checked")].map((e) => e.value).join("、") || "请选择经营类型"; }));
    document.querySelectorAll("[data-s1191-select]").forEach((b) => b.addEventListener("change", () => { const kind = b.dataset.s1191Select; if (b.checked) state.selected[kind].add(Number(b.value)); else state.selected[kind].delete(Number(b.value)); syncSelection(kind); }));
    document.querySelectorAll("[data-s1191-all]").forEach((b) => b.addEventListener("change", () => { const kind = b.dataset.s1191All; document.querySelectorAll(`[data-s1191-select="${kind}"]`).forEach((box) => { box.checked = b.checked; if (b.checked) state.selected[kind].add(Number(box.value)); else state.selected[kind].delete(Number(box.value)); }); syncSelection(kind); }));
    document.querySelectorAll("[data-s1191-all]").forEach((b) => syncSelection(b.dataset.s1191All));
    document.querySelectorAll("[data-s1191-size]").forEach((b) => b.addEventListener("change", () => { const kind = b.dataset.s1191Size; state.paging[kind] = { page: 1, size: Number(b.value) }; state.selected[kind].clear(); refresh(); }));
    document.querySelectorAll("[data-s1191-jump]").forEach((b) => b.addEventListener("change", () => { const kind = b.dataset.s1191Jump; state.paging[kind].page = Math.max(1, Math.min(Number(b.max), Number(b.value) || 1)); state.selected[kind].clear(); refresh(); }));
    bindComprehensive();
  }
  window.SiteOpening1191 = { sidebar, render, bind };
})();
