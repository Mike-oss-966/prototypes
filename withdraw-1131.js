(function () {
  "use strict";
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const money = (value) => Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const providers = ["HiPay", "TronPay", "XMFPay", "佳运支付", "钱能钱包", "青蛙代付"];
  const methods = ["银行卡", "支付宝", "微信", "USDT", "EBPay", "TronPay", "钱能钱包"];
  // These fixtures are fictional. Production sources supply structure and field semantics only.
  const channels = [
    { id: 101, name: "HiPay银行卡", method: "银行卡", provider: "HiPay", code: "BANK_A", balance: 85000, min: 100, max: 50000, daily: 300000, used: 70000, fee: 5 },
    { id: 102, name: "佳运银行卡", method: "银行卡", provider: "佳运支付", code: "2001", balance: 60000, min: 100, max: 30000, daily: 200000, used: 35000, fee: 8 },
    { id: 103, name: "XMF银行卡", method: "银行卡", provider: "XMFPay", code: "BANK_B", balance: 300, min: 100, max: 20000, daily: 100000, used: 8000, fee: 6 },
    { id: 104, name: "青蛙银行卡", method: "银行卡", provider: "青蛙代付", code: "BANK_C", balance: null, balanceStatus: "不支持查询", min: 100, max: 20000, daily: 150000, used: 15000, fee: 5 },
    { id: 105, name: "HiPay备用银行卡", method: "银行卡", provider: "HiPay", code: "BANK_D", balance: 85000, min: 100, max: 500, daily: 100000, used: 99700, fee: 5 },
    { id: 106, name: "佳运备用银行卡", method: "银行卡", provider: "佳运支付", code: "2002", balance: 25000, min: 100, max: 20000, daily: 100000, used: 10000, fee: 8, enabled: false },
    { id: 107, name: "HiPay支付宝", method: "支付宝", provider: "HiPay", code: "ALI_A", balance: 48000, min: 100, max: 30000, daily: 200000, used: 32000, fee: 3 },
    { id: 108, name: "青蛙支付宝", method: "支付宝", provider: "青蛙代付", code: "ALI_B", balance: null, balanceStatus: "查询失败", min: 100, max: 20000, daily: 100000, used: 18000, fee: 5 },
    { id: 109, name: "TronPay USDT", method: "USDT", currency: "USDT", provider: "TronPay", code: "TRC20", protocols: ["TRC20", "ERC20", "BEP20"], exchange: 7.1, balance: null, min: 71, max: 10000, daily: 50000, used: 6500, fee: 0.7 },
    { id: 110, name: "钱能钱包", method: "钱能钱包", provider: "钱能钱包", code: "QN_A", balance: null, min: 100, max: 20000, daily: 100000, used: 6000, fee: 5 }
  ].map((c) => ({ currency: "CNY", exchange: 1, protocols: [], enabled: true, sites: [], platforms: ["WEB", "H5", "APP"], feeMode: "fixed", tiers: [{ min: 0, max: 100000, rate: 2 }], minFee: 0, realName: true, condition: false, vip: 0, depositAmount: 0, depositCount: 0, turnover: 0, banks: [], integerOnly: false, remark: "", created: "2026-09-28 12:00", ...c }));
  const groups = [
    { id: "AG001", name: "银行卡提现", method: "银行卡", currency: "CNY", sites: [], enabled: true, min: 100, max: 50000, mode: "fixed", fixedMode: "amount", fixed: 10, minFee: 0, tiers: [{ min: 100, max: 50000, rate: 1 }], channelIds: [101, 102, 103, 104, 105, 106], sort: 1, version: 1, updated: "2026-10-02 10:00", remark: "" },
    { id: "AG002", name: "支付宝提现", method: "支付宝", currency: "CNY", sites: [], enabled: true, min: 100, max: 30000, mode: "tiered", fixedMode: "amount", fixed: 5, minFee: 2, tiers: [{ min: 100, max: 10000, rate: 0.5 }, { min: 10000, max: 30000, rate: 0.3 }], channelIds: [107, 108], sort: 2, version: 1, updated: "2026-10-02 10:00", remark: "" }
  ].map((g)=>({exchange:1,protocols:[],protocolFees:{},requireRealName:true,...g}));
  // Existing non-aggregated member channels migrate to independent one-channel entries.
  channels.filter((c)=>!groups.some((g)=>g.channelIds.includes(c.id))).forEach((c)=>{
    const fees={mode:c.feeMode,fixedMode:"amount",fixed:c.fee,minFee:c.minFee,tiers:structuredClone(c.tiers)};
    groups.push({id:`AG${String(groups.length+1).padStart(3,"0")}`,name:`${c.method}提现`,method:c.method,currency:c.currency,exchange:c.exchange,protocols:[...c.protocols],protocolFees:Object.fromEntries(c.protocols.map((p)=>[p,structuredClone(fees)])),requireRealName:c.realName,sites:[...c.sites],enabled:c.enabled,min:Math.ceil(c.min/c.exchange*100)/100,max:c.max,...fees,channelIds:[c.id],sort:groups.length+1,version:1,updated:"2026-10-02 10:00",remark:""});
  });
  const baseOrder = { siteIndex: 0, accountType: "会员", level: "VIP5", registered: "2026-08-18 14:20:00", method: "银行卡", currency: "CNY", exchange: 1, protocol: "", bank: "工商银行", accountName: "测试收款人", requireRealName: true, accountNumber: "6222 **** **** 1234", platform: "WEB", amount: 1000, fee: 10, payout: 990, groupId: "AG001", groupName: "银行卡提现", version: 1, channelIds: [101, 102, 103, 104, 105, 106], actualChannelId: null, frozen: true, stage: "待选渠道", tags: [], attempts: [], operations: [], created: "2026-10-02 09:30:00", referrer: "agent_demo", developer: "发展人A", recruiter: "招商A", topAgent: "team_demo", realName: true, vip: 5, deposits: 10000, depositCount: 12, turnover: 80000 };
  const orders = [
    { id: 1, account: "member_demo01" },
    { id: 2, account: "member_demo02", siteIndex: 1, stage: "待重新选择渠道", actualChannelId: 101, attempts: [{ number: 1, channelId: 101, request: "W1131002-A01", providerNo: "-", state: "明确失败 / 未出款", reason: "上游拒绝：通道暂不可用，已确认未出款", time: "2026-10-02 09:10:00", resultTime: "2026-10-02 09:12:00", operator: "finance.demo" }] },
    { id: 3, account: "member_demo03", siteIndex: 2, stage: "结果不明", actualChannelId: 102, attempts: [{ number: 1, channelId: 102, request: "W1131003-A01", providerNo: "待返回", state: "结果不明", reason: "提交超时，尚未确认是否出款", time: "2026-10-02 08:50:00", resultTime: "-", operator: "finance.demo" }] },
    { id: 4, account: "member_demo04", siteIndex: 3, method: "支付宝", bank: "支付宝", accountNumber: "demo****@example.com", groupId: "AG002", groupName: "支付宝提现", channelIds: [107, 108], amount: 2000, fee: 10, payout: 1990, stage: "出款中", actualChannelId: 107, attempts: [{ number: 1, channelId: 107, request: "W1131004-A01", providerNo: "PAYOUT-DEMO004", state: "出款中", reason: "三方处理中", time: "2026-10-02 09:15:00", resultTime: "-", operator: "finance.demo" }] },
    { id: 5, account: "member_demo05", siteIndex: 4, stage: "成功", actualChannelId: 104, frozen: false, attempts: [{ number: 1, channelId: 104, request: "W1131005-A01", providerNo: "PAYOUT-DEMO005", state: "成功", reason: "-", time: "2026-10-02 08:00:00", resultTime: "2026-10-02 08:02:00", operator: "finance.demo" }] },
    { id: 6, account: "member_demo06", groupId: null, groupName: "", channelIds: [], method: "USDT", currency: "USDT", exchange: 7.1, bank: "TRC20", accountNumber: "T***演示地址***", amount: 100, fee: 5, payout: 99.3, stage: "待选渠道", actualChannelId: 109 },
    { id: 7, account: "agent_demo01", accountType: "代理", level: "星级代理", groupId: null, groupName: "", channelIds: [], method: "USDT", currency: "USDT", exchange: 7.1, bank: "TRC20", accountNumber: "T***演示地址***", amount: 200, fee: 5, payout: 199.3, stage: "冻结", actualChannelId: 109 },
    { id: 8, account: "member_demo08", groupId: "AG003", groupName: "USDT提现", channelIds: [109], method: "USDT", currency: "USDT", exchange: 7.1, protocol: "TRC20", bank: "TRC20", accountNumber: "T***演示地址***", amount: 100, fee: 4.97, payout: 99.3 },
    { id: 9, account: "member_demo09", groupId: "AG004", groupName: "钱能钱包提现", channelIds: [110], method: "钱能钱包", bank: "钱能钱包", accountNumber: "QN***演示账户***", amount: 1000, fee: 5, payout: 995 }
  ].map((o) => ({ ...baseOrder, ...o, code: `W113100${o.id}`, attempts: o.attempts || [], operations: [] }));
  let helpers, page, activeTab;
  const state = { settingFilters: {}, reviewFilters: {}, settingPage: 1, reviewPage: 1, settingSize: 20, reviewSize: 20, freezeOnly: false, selected: new Set(), menuOpen: true };
  const button = (text, action, value = "", tone = "", disabled = false, id = "") => {
    const html=`<button type="button" class="w1131-btn ${tone}" data-w1131-action="${action}" data-value="${escape(value)}"${disabled ? " disabled" : ""}>${text}</button>`;
    return id ? `<span class="annotated w1131-action-annotation" data-component-id="${id}">${helpers.badge(id)}${html}</span>` : html;
  };
  const tag = (text, tone = "") => `<span class="w1131-tag ${tone}">${escape(text)}</span>`;
  const annotated = (id, body, cls = "", extra = "") => `<section class="annotated ${cls}" data-component-id="${id}" ${extra}>${helpers.badge(id)}${body}</section>`;
  const field = (label, name, options, value = "", cls = "") => `<label class="w1131-field ${cls}"><span>${label}</span>${Array.isArray(options) ? `<select name="${name}">${options.map((v) => `<option value="${escape(v)}"${v === value ? " selected" : ""}>${escape(v || "全部")}</option>`).join("")}</select>` : `<input name="${name}" value="${escape(value)}" placeholder="请输入${label}" ${options || ""} />`}</label>`;
  const siteName = (order) => helpers.sites[order.siteIndex] || helpers.sites[0];
  const channel = (id) => channels.find((c) => c.id === Number(id));
  const group = (id) => groups.find((g) => g.id === id);
  const eligibleSite = (source, site) => !source.sites.length || source.sites.includes(site);
  const now = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai", dateStyle: "short", timeStyle: "medium" }).format(new Date());
  const memberStatus = (o) => o.stage === "成功" ? "已完成" : o.stage === "已终止" ? "已拒绝" : "处理中";
  const platformStatus = (o) => ({ "待选渠道": "待审核", "待重新选择渠道": "待重选渠道", "结果不明": "审核通过", "出款中": "审核通过", "冻结": "冻结", "成功": "审核通过", "已终止": "拒绝" })[o.stage];
  const providerStatus = (o) => ({ "待选渠道": "未提交", "待重新选择渠道": "失败（单次）", "结果不明": "结果不明", "出款中": "处理中", "冻结": "未提交", "成功": "成功", "已终止": "未出款" })[o.stage];
  const editableOrder = (o) => ["待选渠道", "待重新选择渠道"].includes(o.stage);
  const multiChannel = (g) => g.currency === "CNY" && ["银行卡","支付宝"].includes(g.method);
  const exchangeOf = (g) => g.currency === "USDT" ? Number(g.exchange) : 1;
  function feeOf(g, amount, protocol = "") {
    const f = g.protocolFees?.[protocol] || g, rate = exchangeOf(g), cnyAmount = round(amount * rate);
    if (f.mode === "fixed") return f.fixedMode === "percentage" ? (g.currency === "CNY" ? Math.round : round)(cnyAmount * f.fixed / 100) : round(f.fixed * rate);
    const t = f.tiers.find((item, index) => cnyAmount >= item.min && (cnyAmount < item.max || (index === f.tiers.length - 1 && cnyAmount === item.max)));
    return t ? (g.currency === "CNY" ? Math.round : round)(Math.max(cnyAmount * t.rate / 100, f.minFee)) : null;
  }
  function reasonFor(c, o) {
    const reasons = [];
    if (!c) return ["渠道已不存在"];
    if (!o.channelIds.includes(c.id)) reasons.push("不在申请通道关联范围内");
    if (!c.enabled) reasons.push("渠道已停用");
    if (c.method !== o.method || c.currency !== o.currency) reasons.push("提现方式或币种不匹配");
    if (c.platforms?.length && !c.platforms.includes(o.platform || "WEB")) reasons.push("不支持当前平台");
    if (o.protocol && !c.protocols.includes(o.protocol)) reasons.push("不支持申请时选择的协议网络");
    if (!eligibleSite(c, siteName(o))) reasons.push("不支持所属站点");
    if (c.banks.length && !c.banks.includes(o.bank)) reasons.push("不支持收款银行");
    if ((c.realName || o.requireRealName) && !o.realName) reasons.push("未满足实名认证要求");
    if (c.condition && (o.vip < c.vip || o.deposits < c.depositAmount || o.depositCount < c.depositCount || o.turnover < c.turnover)) reasons.push("未满足渠道会员使用条件");
    if (o.amount > c.max) reasons.push("超过单笔上限");
    if (c.integerOnly && !Number.isInteger(o.payout)) reasons.push("上游仅支持整数出款金额");
    if (o.amount > c.daily - c.used) reasons.push("今日剩余额度不足");
    if (c.balance != null && c.balance < o.payout) reasons.push("三方余额不足");
    return reasons;
  }
  function sidebar(requirement, current) {
    const nav = requirement.pages.map((p) => `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${p.key}" class="${p.key === current.key ? "active" : ""}"><span class="menu-symbol">▣</span><span>${escape(p.name)}</span><em class="w1131-menu-change">修改</em></a>`).join("");
    return `<aside class="risk-sidebar w1131-sidebar"><div class="risk-brand"><span>C</span><div><strong>总控后台管理系统</strong></div></div><nav><section class="w1131-menu-group ${state.menuOpen ? "is-expanded" : ""}"><button type="button" class="w1131-menu-parent" data-w1131-action="menu"><span>▣</span>${escape(current.menuGroup)}<i>⌄</i></button><div class="w1131-menu-children">${nav}</div></section></nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>总控管理员</small></div></div></aside>`;
  }
  function pager(total, kind) {
    const size = state[`${kind}Size`], count = Math.max(1, Math.ceil(total / size));
    state[`${kind}Page`] = Math.min(state[`${kind}Page`], count);
    const current = state[`${kind}Page`];
    return `<div class="w1131-pagination"><span>共 ${total} 条</span><select aria-label="每页数量" data-w1131-size="${kind}">${[10,20,50,100,200].map((n) => `<option value="${n}"${size === n ? " selected" : ""}>${n}条/页</option>`).join("")}</select>${button("‹", "page", `${kind}:${current-1}`, "", current === 1)}<span class="w1131-page-number">${current}</span>${button("›", "page", `${kind}:${current+1}`, "", current === count)}<span>前往</span><input type="number" min="1" max="${count}" value="${current}" aria-label="前往页" data-w1131-jump="${kind}" /><span>页</span></div>`;
  }
  function table(headers, rows, cls = "", id = "") {
    const cells = headers.map((h) => `<th${h.width ? ` style="min-width:${h.width}px"` : ""} class="${h.cls || ""}">${h.cls === "w1131-unchanged" ? `<span class="w1131-old-content">${h.label}</span>` : h.label}</th>`).join("");
    const body = rows.length ? rows.join("") : `<tr><td colspan="${headers.length}" class="w1131-empty">暂无数据</td></tr>`;
    const preservedBody=body.replace(/(<td(?:\s[^>]*)?>)CNY(<\/td>)/g,'$1<span data-preserve-currency>CNY</span>$2');
    const content = `<div class="w1131-table-wrap" data-page-scroll><table class="w1131-table ${cls}"><thead><tr>${cells}</tr></thead><tbody>${preservedBody}</tbody></table></div>`;
    return id ? annotated(id, content, "w1131-table-section") : content;
  }
  function settingFilters() {
    const f = state.settingFilters, aggregate = activeTab === "聚合通道";
    return `<form class="w1131-filters ${aggregate ? "" : "w1131-unchanged"}" data-w1131-filter="setting">${aggregate ? helpers.siteSelect("所属站点", "w1131-sites") + field("通道名称", "name", "", f.name) : ""}${field("取款类型", "method", ["", ...methods], f.method)}${field("取款币种", "currency", ["", "CNY", "USDT"], f.currency)}${field("状态", "enabled", ["", "启用", "停用"], f.enabled)}<div class="w1131-filter-actions">${button("⌕ 搜索", "search", "setting", "primary")}${button("↻ 重置", "reset", "setting")}</div></form>`;
  }
  function matchingSettings() {
    const f = state.settingFilters, aggregate = activeTab === "聚合通道";
    return (aggregate ? groups : channels).filter((c) => (!f.name || c.name.includes(f.name)) && (!f.method || c.method === f.method) && (!f.currency || c.currency === f.currency) && (!f.enabled || c.enabled === (f.enabled === "启用")) && (!aggregate || !f.sites || f.sites.some((site) => eligibleSite(c, site)))).sort((a,b) => (a.sort || 0) - (b.sort || 0));
  }
  function feeSummary(g){
    const describe=(f)=>f.mode==="fixed"?(f.fixedMode==="percentage"?`按申请金额 ${f.fixed}%`:`固定 ${money(f.fixed)} ${g.currency}`):`档位费率 ${f.tiers.map((t)=>`${t.rate}%`).join(" / ")}<small>最低 ${money(f.minFee)} CNY</small>`;
    return g.protocols.length ? g.protocols.map((p)=>`<div>${p}：${describe(g.protocolFees[p]||g)}</div>`).join("") : describe(g);
  }
  function settings() {
    const aggregate = activeTab === "聚合通道";
    const tabs = annotated("N01", page.tabs.map((t) => `<button role="tab" type="button" aria-selected="${t === activeTab}" class="w1131-tab ${t === activeTab ? "active" : ""}" data-w1131-tab="${escape(t)}">${escape(t)}${t === "聚合通道" ? '<em class="w1131-new">新增</em>' : ""}</button>`).join(""), "w1131-tabs", 'role="tablist"');
    const all = matchingSettings(), pagination = pager(all.length, "setting"), slice = all.slice((state.settingPage-1)*state.settingSize, state.settingPage*state.settingSize);
    const toolbar = `<div class="w1131-toolbar">${button("＋ 新增", "new", aggregate ? "group" : "channel", "plain-primary")}${button("✎ 修改", "selected-edit", "", "plain-success", state.selected.size !== 1)}${button("▱ 删除", "selected-delete", "", "plain-danger", !state.selected.size)}<div class="w1131-toolbar-right">${button("⌕", "toggle-search", "", "", false)}${button("↻", "refresh", "", "", false)}</div></div>`;
    const checkHead = { label: '<input type="checkbox" aria-label="全选当前页" data-w1131-all />', width: 46 };
    const checkCell = (c) => `<td><input type="checkbox" aria-label="选择${escape(c.name)}" data-w1131-row="${c.id}"${state.selected.has(String(c.id)) ? " checked" : ""} /></td>`;
    let content;
    if (aggregate) {
      content = table([checkHead, {label:"提现通道名称",width:180},{label:"取款类型",width:110},{label:"币种",width:75},{label:"适用站点",width:160},{label:"申请金额范围（通道币种）",width:200},{label:"会员手续费",width:230},{label:"关联渠道",width:100},{label:"状态",width:90},{label:"排序",width:60},{label:"最后修改人 / 时间",width:190},{label:"操作",width:210,cls:"w1131-sticky-action"}], slice.map((g) => `<tr>${checkCell(g)}<td>${escape(g.name)}</td><td>${g.method}</td><td>${g.currency}</td><td>${escape(g.sites.join("、") || "全部站点")}</td><td>${money(g.min)} — ${money(g.max)} ${g.currency}</td><td>${feeSummary(g)}</td><td>${button(`${g.channelIds.length} 个`,"relations",g.id,"link")}</td><td>${tag(g.enabled ? "启用" : "停用", g.enabled ? "success" : "info")}</td><td>${g.sort}</td><td>Mike<small>${g.updated}</small></td><td class="w1131-sticky-action">${button("修改","edit-group",g.id,"link")}${button(g.enabled ? "停用" : "启用","toggle-group",g.id,"link")}${button("删除","delete-group",g.id,"link danger-text")}</td></tr>`), "", "T01");
    } else {
      const headers = [checkHead, ...["ID","取款类型","取款币种","上游服务商","上游通道编码","取款汇率","单笔上限","每日限额","手续费模式","实名认证","协议手续费","支持平台","状态","创建时间"].map((label) => ({label, width: label === "协议手续费" ? 220 : label === "创建时间" ? 160 : 110, cls:"w1131-unchanged"})), {label:"操作",width:200,cls:"w1131-sticky-action"}];
      content = table(headers, slice.map((c) => `<tr>${checkCell(c)}${[c.id,c.method,c.currency,c.provider,c.code,c.exchange,money(c.max),money(c.daily),c.feeMode === "tiered" ? "按档位费率" : "固定手续费",c.realName?"需要认证":"不需要认证",c.feeMode === "tiered" ? `${c.tiers.map((t)=>`${money(t.min)}–${money(t.max)}：${t.rate}%`).join("；")}；最低 ${money(c.minFee)} CNY` : `固定 ${money(c.fee)} ${c.currency === "USDT" ? "U" : "CNY"}`,c.platforms.join(" / "),tag(c.enabled?"启用":"停用",c.enabled?"success":"info"),c.created].map((v) => `<td class="w1131-unchanged">${v}</td>`).join("")}<td class="w1131-sticky-action">${button("余额","balance",c.id,"link")}${button("修改","edit-channel",c.id,"link")}${button("删除","delete-channel",c.id,"link danger-text")}</td></tr>`), "w1131-channel-table", "C01");
    }
    return `<div class="w1131-settings">${tabs}${aggregate ? annotated("F01",settingFilters()) : settingFilters()}${aggregate ? annotated("B01",toolbar) : toolbar}${content}${pagination}</div>`;
  }
  function reviewDateControl(f) {
    const start = (f.start || "2026-10-02").split("-").map(Number), end = (f.end || f.start || "2026-10-02").split("-").map(Number);
    const container = document.createElement("div");
    container.innerHTML = helpers.dateControl({year:start[0],month:start[1],startDay:start[2],endDay:end[2],dateOnly:true,empty:!f.start});
    if (f.start) {
      container.querySelectorAll(".agent-498-date > span").forEach((span,i)=>{span.textContent=i ? f.end : f.start;});
      container.querySelectorAll(".calendar-panel").forEach((panel,i)=>{
        const [year,month,day] = i ? end : start;
        panel.dataset.year=year;panel.dataset.month=month;panel.querySelector("header strong").textContent=`${year}年${month}月`;
        panel.querySelector(".calendar-days").innerHTML='<span></span>'.repeat((new Date(year,month-1,1).getDay()+6)%7)+Array.from({length:new Date(year,month,0).getDate()},(_,n)=>`<button type="button" class="calendar-day${n+1===day?" selected":""}" data-day="${n+1}">${n+1}</button>`).join("");
      });
    }
    return container.innerHTML;
  }
  function reviewFilters() {
    const f=state.reviewFilters;
    const filters = [field("代理推荐人","referrer","",f.referrer),field("代理发展人","developer","",f.developer),field("代理所属招商","recruiter","",f.recruiter),field("总代","topAgent","",f.topAgent),helpers.siteSelect("站点名称","w1131-sites"),field("单号","code","",f.code),field("账号类型","accountType",["","站点管理员","代理","会员"],f.accountType),field("账号名称","account","",f.account),field("代理身份","agentType",["","普通代理","星级代理","多层级代理","负盈利主线","负盈利单线"],f.agentType),field("风控标签","riskTag",["","提款挂起","不返水"],f.riskTag),field("取款类型","method",["",...methods],f.method),field("用户状态","userStatus",["","处理中","已拒绝","已完成"],f.userStatus),field("平台状态","platformStatus",["","待审核","冻结","已重新发起","审核通过","待重选","待重选渠道","拒绝"],f.platformStatus),field("三方状态","providerStatus",["","未提交","处理中","三方拒绝","结果不明","失败（单次）","成功","未出款"],f.providerStatus)];
    return annotated("F01",`<form class="w1131-filters w1131-query-card" data-w1131-filter="review">${filters.map((v) => `<div class="w1131-unchanged">${v}</div>`).join("")}${field("会员提现通道","groupId",["",...groups.map((g)=>g.name),"原渠道流程"],f.groupId)}<div class="w1131-field w1131-date w1131-unchanged"><span>创建时间</span>${reviewDateControl(f)}</div><div class="w1131-filter-actions">${button("⌕ 搜索","search","review","primary")}${button("↻ 重置","reset","review")}</div></form>`);
  }
  function matchingOrders() {
    const f=state.reviewFilters;
    return orders.filter((o) => (!state.freezeOnly || o.stage === "冻结") && (!f.sites || f.sites.includes(siteName(o))) && ["referrer","developer","recruiter","topAgent","code","account"].every((k)=>!f[k]||o[k].includes(f[k])) && (!f.accountType||o.accountType===f.accountType) && (!f.agentType||(o.accountType === "代理" && o.level === f.agentType)) && (!f.riskTag||o.tags.includes(f.riskTag)) && (!f.method||o.method===f.method) && (!f.userStatus||memberStatus(o)===f.userStatus) && (!f.platformStatus||platformStatus(o)===f.platformStatus) && (!f.providerStatus||providerStatus(o)===f.providerStatus) && (!f.groupId||(f.groupId === "原渠道流程" ? !o.groupId : o.groupName===f.groupId)) && (!f.start||o.created.slice(0,10)>=f.start) && (!f.end||o.created.slice(0,10)<=f.end));
  }
  function review() {
    const frozen=orders.filter((o)=>o.stage==="冻结").length;
    const freeze=`<div class="w1131-freeze-panel w1131-unchanged"><div class="w1131-freeze-entry"><span class="w1131-lock">♙</span><div><span>冻结订单筛选</span><b>${frozen} <em>笔当前冻结</em></b></div>${button(state.freezeOnly?"取消筛选":"点击筛选","frozen","","plain-primary")}</div><span>由于账户异常或风险，被锁定的出款订单属于“冻结”状态。</span></div>`;
    const all=matchingOrders(), pagination=pager(all.length,"review"), slice=all.slice((state.reviewPage-1)*state.reviewSize,state.reviewPage*state.reviewSize);
    const baseHeaders=["站点名称","单号","账号类型","账号名称"];
    const restHeaders=["代理推荐人","代理发展人","代理所属招商","总代","代理身份","风控标签","等级","注册日期","取款类型"];
    const endHeaders=["银行名称","账户姓名","银行账号","平台类型","用户状态","平台状态","三方状态","操作备注","创建时间"];
    const headers=[...baseHeaders.map((label,i)=>({label,width:[120,150,80,130][i],cls:"w1131-unchanged"})),{label:"会员提现通道",width:160},{label:"实际出款渠道",width:180},{label:"尝试次数",width:90},...["取款金额","到账金额","手续费（CNY）"].map((label)=>({label,width:160,cls:"w1131-unchanged"})),...restHeaders.map((label)=>({label,width:label==="注册日期"?170:120,cls:"w1131-unchanged"})),...endHeaders.map((label)=>({label,width:label==="银行账号"?190:label==="操作备注"?220:140,cls:"w1131-unchanged"})),{label:"操作",width:160,cls:"w1131-sticky-action"}];
    const rows=slice.map((o)=>{
      const actual=channel(o.actualChannelId), last=o.attempts.at(-1);
      const base=[siteName(o),o.code,tag(o.accountType),o.account];
      const rest=[o.referrer,o.developer,o.recruiter,o.topAgent,o.accountType==="代理"?o.level:"-",o.tags.length?o.tags.map((t)=>tag(t,"warning")).join(" "):"-",o.level,o.registered,o.method];
      const platform=platformStatus(o),end=[o.bank,o.accountName,o.accountNumber,o.platform||"WEB",tag(memberStatus(o),o.stage==="成功"?"success":"warning"),platform==="待重选渠道"?tag(platform,"warning"):platform,tag(providerStatus(o),o.stage==="结果不明"?"warning":"info"),o.remark||last?.reason||"-",o.created];
      const endCells=end.map((v,i)=>i===5&&platform==="待重选渠道"?`<td>${v}</td>`:`<td class="w1131-unchanged"><span class="w1131-old-content">${v}</span></td>`).join("");
      const actions=button("查看","view-order",o.id,"link") + (o.groupId ? editableOrder(o)?button(o.stage==="待重新选择渠道"?"重选渠道":"审核","audit",o.id,"link"):o.stage==="冻结"?button("手动解冻","unfreeze",o.id,"link"): ["出款中","结果不明"].includes(o.stage)?button("查询三方","query-order",o.id,"link"):"" : (o.stage === "冻结" ? button("手动解冻","unfreeze",o.id,"link") : editableOrder(o)?button("审核","audit",o.id,"link"):""));
      return `<tr>${base.map((v)=>`<td class="w1131-unchanged"><span class="w1131-old-content">${v}</span></td>`).join("")}<td>${o.groupId?escape(o.groupName):"原渠道流程"}</td><td>${actual?escape(actual.name):"未选择"}</td><td>${o.attempts.length}</td><td class="w1131-unchanged"><span class="w1131-old-content">${money(o.amount)} ${o.currency}</span></td><td class="w1131-unchanged"><span class="w1131-old-content">${money(o.payout)} ${o.currency}</span></td><td class="w1131-unchanged"><span class="w1131-old-content">${money(o.fee)}</span></td>${rest.map((v)=>`<td class="w1131-unchanged"><span class="w1131-old-content">${v}</span></td>`).join("")}${endCells}<td class="w1131-sticky-action">${actions}</td></tr>`;
    });
    return `<div class="w1131-review">${freeze}${reviewFilters()}${table(headers,rows,"w1131-review-table","T01")}${pagination}</div>`;
  }
  function render(current, api) { page=current;helpers=api;activeTab=api.activeTab||current.tabs?.[0];return current.key === "control-withdraw-settings-1131" ? settings() : review(); }
  function closeModal(){document.getElementById("modal-root").innerHTML="";}
  function openModal(title,body,footer,kind="") {
    helpers.modal(title,body,"",`<footer>${footer}</footer>`);
    const root=document.getElementById("modal-root"), dialog=root.querySelector(".risk-modal"), pane=document.querySelector(".prototype-pane").getBoundingClientRect();
    dialog.classList.add("w1131-dialog",kind);root.querySelector(".modal-backdrop").style.right=`${Math.max(0,window.innerWidth-pane.right)}px`;
    helpers.bindLinks();return dialog;
  }
  function error(root,message){const node=root.querySelector(".w1131-error");if(node){node.textContent=message;node.hidden=false;node.scrollIntoView({block:"nearest"});}}
  function notice(message){let n=document.querySelector(".w1131-toast");if(!n){n=document.createElement("div");n.className="w1131-toast";n.setAttribute("role","status");document.querySelector(".prototype-pane").appendChild(n);}n.textContent=message;setTimeout(()=>n.remove(),3500);}
  function refresh(message=""){closeModal();state.selected.clear();helpers.rerender();if(message)notice(message);}
  function selectedSites(root){return [...root.querySelectorAll('.site-multi-options input:not([data-site-all]):checked')].map((input)=>input.value);}
  function restoreSites(root,selected){if(!selected)return;root.querySelectorAll('.site-multi-options input:not([data-site-all])').forEach((i)=>{i.checked=selected.includes(i.value);});}
  function plainForm(root){return Object.fromEntries([...root.querySelectorAll("[name]")].filter((i)=>!["checkbox","radio"].includes(i.type)||i.checked).map((i)=>[i.name,i.type==="checkbox"?true:i.value.trim()]));}
  function bindSites(root){helpers.bindSites?.();}
  function relationBody(g){return table([{label:"渠道ID"},{label:"实际渠道"},{label:"提现方式"},{label:"币种"},{label:"服务商"},{label:"支持站点"},{label:"状态"}],g.channelIds.map((id)=>{const c=channel(id);return c?`<tr><td>${c.id}</td><td>${escape(c.name)}</td><td>${c.method}</td><td>${c.currency}</td><td>${c.provider}</td><td>${escape(c.sites.join("、")||"全部站点")}</td><td>${tag(c.enabled?"启用":"停用",c.enabled?"success":"info")}</td></tr>`:"";}));}
  function tierRow(t={min:"",max:"",rate:""}){return `<tr><td><input aria-label="档位起始金额" type="number" min="0" step="0.01" value="${t.min}" data-tier="min" /></td><td><input aria-label="档位截止金额" type="number" min="0" step="0.01" value="${t.max}" data-tier="max" /></td><td><input aria-label="档位费率" type="number" min="0" max="100" step="0.01" value="${t.rate}" data-tier="rate" /><span> %</span></td><td>${button("删除","remove-tier","","link danger-text")}</td></tr>`;}
  function groupEditor(id) {
    const old=group(id),g=old?structuredClone(old):{id:"保存后生成",name:"",method:"银行卡",currency:"CNY",exchange:1,protocols:[],protocolFees:{},sites:[],min:100,max:50000,mode:"fixed",fixed:10,minFee:0,tiers:[{min:100,max:50000,rate:1}],channelIds:[],enabled:true,sort:groups.length+1,version:1,remark:""};
    const body=`<form class="w1131-group-form"><p class="w1131-error" role="alert" hidden></p>
      ${annotated("M01",`<h3>通道基本配置</h3><div class="w1131-form-grid">${field("提现通道名称","name","maxlength=30",g.name)}${field("状态","enabled",["启用","停用"],g.enabled?"启用":"停用")}${field("取款类型","method",methods,g.method)}${field("币种","currency",["CNY","USDT"],g.currency)}${helpers.siteSelect("适用站点","w1131-sites")}${field("排序","sort",'type="number" min="0" step="1"',g.sort)}${field(`申请金额下限（${g.currency}）`,"min",'type="number" min="0.01" step="0.01"',g.min)}${field(`申请金额上限（${g.currency}）`,"max",'type="number" min="0.01" step="0.01"',g.max)}${field("是否需要实名认证","requireRealName",["需要","不需要"],g.requireRealName===false?"不需要":"需要")}${field("取款汇率（CNY/USDT）","exchange",'type="number" min="0.01" step="0.01" readonly',g.exchange)}</div>`)}
      ${annotated("M02",`<h3>会员统一手续费</h3><div data-protocol-fees></div><div class="w1131-radio-line"><label><input name="mode" type="radio" value="fixed"${g.mode==="fixed"?" checked":""}/> 固定手续费</label><label><input name="mode" type="radio" value="tiered"${g.mode==="tiered"?" checked":""}/> 档位费率</label></div><div data-fee-fixed><label class="w1131-field w1131-fixed-value"><span>固定手续费</span><span class="w1131-unit-input"><input name="fixed" type="number" min="0" step="0.01" value="${g.fixed}" /><select name="fixedMode" aria-label="手续费方式"><option value="amount"${(g.fixedMode||"amount")==="amount"?" selected":""}>固定金额</option><option value="percentage"${g.fixedMode==="percentage"?" selected":""}>百分比</option></select><em data-fixed-unit>${g.currency}</em></span></label></div><div data-fee-tiered>${table([{label:"申请金额起始（CNY，含）"},{label:"申请金额截止（CNY）"},{label:"费率"},{label:"操作"}],g.tiers.map(tierRow),"w1131-tiers")}<div class="w1131-tier-footer">${button("＋ 添加档位","add-tier","","plain-primary")}${field("最低手续费（CNY）","minFee",'type="number" min="0" step="0.01"',g.minFee)}</div></div>`)}
      ${annotated("M03",`<div class="w1131-section-head"><h3>关联实际出款渠道</h3><span data-association-count></span></div><div class="w1131-inline-note" data-routing-rule></div><div data-channel-picker></div>`)}
      ${field("备注","remark","maxlength=200",g.remark)}</form>`;
    const root=openModal(old?"修改聚合提现通道":"新增聚合提现通道",body,`${button("取消","close")}${button("保存","save-group","","primary")}`,"w1131-group-dialog");
    restoreSites(root,g.sites.length?g.sites:helpers.sites);bindSites(root);
    const form=root.querySelector("form"),selected=new Set(g.channelIds),feeConfigs=structuredClone(g.protocolFees);let protocols=[...g.protocols],currentProtocol=protocols[0]||"";
    const readFees=()=>({mode:form.querySelector('[name="mode"]:checked').value,fixedMode:form.elements.fixedMode.value||"amount",fixed:Number(form.elements.fixed.value),minFee:Number(form.elements.minFee.value),tiers:[...form.querySelectorAll(".w1131-tiers tbody tr")].map((row)=>Object.fromEntries([...row.querySelectorAll("[data-tier]")].map((i)=>[i.dataset.tier,Number(i.value)])))});
    const applyFees=(f)=>{form.querySelector(`[name="mode"][value="${f.mode}"]`).checked=true;form.elements.fixedMode.value=f.fixedMode||"amount";form.elements.fixed.value=f.fixed;form.elements.minFee.value=f.minFee;form.querySelector(".w1131-tiers tbody").innerHTML=f.tiers.map(tierRow).join("");};
    const read=()=>{const f=plainForm(form),fees=readFees();if(currentProtocol)feeConfigs[currentProtocol]=fees;return {...g,...f,...fees,min:Number(f.min),max:Number(f.max),exchange:f.currency==="USDT"?Number(g.exchange||f.exchange):1,sort:Number(f.sort),enabled:f.enabled==="启用",requireRealName:f.requireRealName==="需要",sites:selectedSites(form),protocols:[...protocols],protocolFees:structuredClone(feeConfigs),channelIds:[...selected]};};
    function protocolPicker(){form.querySelector("[data-protocol-fees]").innerHTML=protocols.length?field("协议网络","protocol",protocols,currentProtocol):"";if(currentProtocol)applyFees(feeConfigs[currentProtocol]||readFees());}
    function picker(){
      const method=form.elements.method.value,currency=form.elements.currency.value,multiple=multiChannel({method,currency});channels.forEach((c)=>{if(c.method!==method||c.currency!==currency)selected.delete(c.id);});if(!multiple&&selected.size>1){const first=[...selected][0];selected.clear();selected.add(first);}
      form.querySelector("[data-routing-rule]").textContent=multiple?"可关联多个实际渠道，财务审核时选择其中一个出款。":"该取款类型本期关联一个实际渠道，会员通过统一提现通道申请。";
      form.querySelector("[data-channel-picker]").innerHTML=table([{label:"关联",width:55},{label:"渠道ID",width:70},{label:"实际渠道",width:145},{label:"取款类型 / 币种",width:120},{label:"服务商",width:100},{label:"状态",width:165}],channels.map((c)=>{const compatible=c.method===method&&c.currency===currency;return `<tr class="${compatible?"":"w1131-incompatible"}"><td><input aria-label="关联${escape(c.name)}" type="checkbox" data-associate="${c.id}"${selected.has(c.id)?" checked":""}${compatible?"":" disabled"} /></td><td>${c.id}</td><td>${escape(c.name)}</td><td>${c.method} / ${c.currency}</td><td>${c.provider}</td><td>${compatible?tag(c.enabled?"启用":"停用",c.enabled?"success":"info"):"方式或币种不匹配"}</td></tr>`;}));form.querySelector("[data-association-count]").textContent=`已关联 ${selected.size} 个`;
    }
    function syncEditorForm(){const f=read(),fixedMode=f.fixedMode||"amount";form.querySelector("[data-fee-fixed]").hidden=f.mode!=="fixed";form.querySelector("[data-fee-tiered]").hidden=f.mode!=="tiered";form.elements.exchange.closest("label").hidden=f.currency!=="USDT";for(const [name,label] of [["min","申请金额下限"],["max","申请金额上限"]])form.elements[name].closest("label").querySelector("span").textContent=`${label}（${f.currency}）`;form.querySelector("[data-fixed-unit]").textContent=fixedMode==="percentage"?"%":f.currency;}
    function syncSingle(c){
      if(!multiChannel(read())&&c){protocols=[...c.protocols];currentProtocol=protocols[0]||"";if(!old){form.elements.exchange.value=c.exchange;form.elements.min.value=Math.ceil(c.min/c.exchange*100)/100;form.elements.max.value=c.max;applyFees({mode:c.feeMode,fixedMode:"amount",fixed:c.fee,minFee:c.minFee,tiers:structuredClone(c.tiers)});}protocols.forEach((p)=>{feeConfigs[p] ||= structuredClone(readFees());});Object.keys(feeConfigs).forEach((p)=>{if(!protocols.includes(p))delete feeConfigs[p];});}else{protocols=[];currentProtocol="";Object.keys(feeConfigs).forEach((p)=>delete feeConfigs[p]);}protocolPicker();
    }
    protocolPicker();picker();syncEditorForm();form.addEventListener("input",syncEditorForm);form.addEventListener("change",(e)=>{
      if(e.target.name==="protocol"){if(currentProtocol)feeConfigs[currentProtocol]=readFees();currentProtocol=e.target.value;applyFees(feeConfigs[currentProtocol]||readFees());}
      if(["method","currency"].includes(e.target.name)){if(e.target.name==="method"){const c=channels.find((x)=>x.method===e.target.value);form.elements.currency.value=c?.currency||"CNY";}picker();syncSingle(channel([...selected][0]));}
      if(e.target.matches("[data-associate]")){const n=Number(e.target.dataset.associate);if(e.target.checked){if(!multiChannel(read()))selected.clear();selected.add(n);}else selected.delete(n);syncSingle(channel([...selected][0]));picker();}
      syncEditorForm();
    });
    root.addEventListener("click",(e)=>{const b=e.target.closest("[data-w1131-action]");if(!b)return;const a=b.dataset.w1131Action;if(a==="close")closeModal();if(a==="add-tier"){form.querySelector(".w1131-tiers tbody").insertAdjacentHTML("beforeend",tierRow());syncEditorForm();}if(a==="remove-tier"){b.closest("tr").remove();syncEditorForm();}if(a==="save-group"){const f=read(),message=validateGroup(f,old);if(message){error(root,message);return;}f.sites=f.sites.length===helpers.sites.length?[]:f.sites;f.updated=now().slice(0,16);f.version=old?old.version+1:1;f.id=old?old.id:`AG${String(Math.max(0,...groups.map((x)=>Number(x.id.slice(2))))+1).padStart(3,"0")}`;if(old)Object.assign(old,f);else groups.push(f);refresh("聚合提现通道已保存，新的配置仅用于后续申请。");}});
  }
  function validateGroup(g,old) {
    if(!g.name.trim())return "请填写会员展示名称。";
    if(groups.some((x)=>x!==old&&x.name===g.name))return "会员展示名称已存在，请使用可区分的名称。";
    if(!Number.isFinite(g.min)||!Number.isFinite(g.max)||g.min<=0||g.max<g.min)return "申请金额下限须大于0，上限不得小于下限。";
    if(!Number.isInteger(g.sort)||g.sort<0)return "排序须为非负整数。";
    if(g.currency==="USDT"&&(!Number.isFinite(g.exchange)||g.exchange<=0))return "请配置大于0的会员换算汇率。";
    if(!g.sites.length)return "请至少选择一个适用站点。";
    if(!g.channelIds.length)return "请至少关联一个方式和币种匹配的实际渠道。";
    if(!multiChannel(g)&&g.channelIds.length!==1)return "该取款类型本期只能关联一个实际渠道。";
    if(g.channelIds.some((id)=>{const c=channel(id);return !c||c.method!==g.method||c.currency!==g.currency;}))return "关联渠道的提现方式和币种不一致，请重新选择。";
    if(g.sites.some((site)=>!g.channelIds.some((id)=>{const c=channel(id);return eligibleSite(c,site)&&(!g.enabled||c.enabled);})))return "每个适用站点至少需要一个支持该站点的关联渠道；启用时该渠道也须启用。";
    if(g.currency==="USDT"&&(!g.protocols.length||g.protocols.some((p)=>!channel(g.channelIds[0]).protocols.includes(p))))return "请选择具备协议网络配置的实际渠道。";
    const configs=g.protocols.length?g.protocols.map((p)=>g.protocolFees[p]):[g],minCny=round(g.min*exchangeOf(g)),maxCny=round(g.max*exchangeOf(g));
    for(const f of configs){
      if(!f)return "协议网络缺少手续费配置。";
      if(f.mode==="fixed"){const fixedMode=f.fixedMode||"amount";if(!Number.isFinite(f.fixed)||f.fixed<0||(fixedMode==="percentage"&&f.fixed>=100))return fixedMode==="percentage"?"固定手续费百分比须在0%至100%之间。":"固定手续费须为非负数。";const fixedFee=fixedMode==="percentage"?(g.currency==="CNY"?Math.round:round)(minCny*f.fixed/100):round(f.fixed*exchangeOf(g));if(fixedFee>=minCny)return "固定手续费须小于申请金额下限。";}
      else {
        if(!f.tiers.length||!Number.isFinite(f.minFee)||f.minFee<0)return "请配置费率档位和非负最低手续费。";
        const tiers=f.tiers.slice().sort((a,b)=>a.min-b.min);f.tiers=tiers;
        if(tiers[0].min!==minCny||tiers.at(-1).max!==maxCny)return "费率档位须按CNY完整覆盖折算后的申请金额范围。";
        for(let i=0;i<tiers.length;i++){const t=tiers[i];if(![t.min,t.max,t.rate].every(Number.isFinite)||t.max<=t.min||t.rate<0||t.rate>=100)return "档位截止须大于起始，费率须在0%至100%之间。";if(i&&tiers[i-1].max!==t.min)return "费率档位不能重叠或留空，请保持首尾相接。";for(const amount of [t.min,t.max,Math.max(t.min,Math.round(t.min)),Math.max(t.min,Math.round(t.min)+0.01)]){if(amount>t.max)continue;const fee=(g.currency==="CNY"?Math.round:round)(Math.max(amount*t.rate/100,f.minFee));if(fee>=amount)return "部分允许申请金额的手续费不小于申请额，请调整费率、最低费或金额下限。";}}
      }
    }
    return "";
  }
  function channelEditor(id){
    const old=channel(id),c=old?structuredClone(old):{id:"保存后生成",name:"",method:"银行卡",currency:"CNY",provider:"HiPay",code:"",exchange:1,max:50000,daily:200000,min:100,fee:5,feeMode:"fixed",tiers:[{min:0,max:100000,rate:2}],minFee:0,enabled:true,realName:true,sites:[],platforms:["WEB","H5","APP"],condition:false,vip:0,depositAmount:0,depositCount:0,turnover:0,integerOnly:false,remark:""};
    const radios=(label,name,choices,value)=>`<div class="w1131-field"><span>${label}</span><div class="w1131-radio-line">${choices.map(([v,l])=>`<label><input type="radio" name="${name}" value="${v}"${value===v?" checked":""}/> ${l}</label>`).join("")}</div></div>`;
    const body=`<form class="w1131-channel-form"><p class="w1131-error" role="alert" hidden></p><div class="w1131-form-grid w1131-unchanged">${field("取款类型","method",methods,c.method)}${field("取款币种","currency",["CNY","USDT"],c.currency)}${field("上游服务商","provider",providers,c.provider)}${field("上游通道编码","code","",c.code)}<div class="w1131-field w1131-full-row" data-integer-rule><span>上游扩展配置</span><label><input name="integerOnly" type="checkbox"${c.integerOnly?" checked":""} /> 限制整数金额</label></div>${field("取款汇率","exchange",'type="number" min="0.01" step="0.01"',c.exchange)}${field("单笔上限","max",'type="number" min="0.01" step="0.01"',c.max)}${field("每日限额","daily",'type="number" min="0.01" step="0.01"',c.daily)}${radios("状态","enabled",[["启用","启用"],["停用","停用"]],c.enabled?"启用":"停用")}</div><div class="w1131-channel-fees w1131-unchanged">${radios("手续费模式","feeMode",[["tiered","按档位费率"],["fixed","固定手续费"]],c.feeMode)}<div data-channel-fixed>${field(`固定手续费（${c.currency==="USDT"?"U":"CNY"}）`,"fee",'type="number" min="0" step="0.01"',c.fee)}</div><div data-channel-tiered><div class="w1131-field"><span>费率档位</span>${table([{label:"最小金额(¥)"},{label:"最大金额(¥)"},{label:"费率(%)"},{label:"操作"}],c.tiers.map(tierRow),"w1131-tiers")}</div><div class="w1131-tier-footer">${button("＋ 添加档位","add-channel-tier","","plain-primary")}${field("最低手续费（CNY）","minFee",'type="number" min="0" step="0.01"',c.minFee)}</div></div>${field("最低提现额度（CNY）","min",'type="number" min="0" step="0.01"',c.min)}${radios("实名认证","realName",[["no","不需要认证"],["yes","需要认证"]],c.realName?"yes":"no")}<div class="w1131-platforms"><span>支持平台</span>${["WEB","H5","APP"].map((v)=>`<label><input type="checkbox" name="platform" value="${v}"${c.platforms.includes(v)?" checked":""} />${v}</label>`).join("")}</div>${helpers.siteSelect("支持站点","w1131-sites")}</div><div class="w1131-usage w1131-unchanged"><div><h3>使用条件设置</h3><label class="w1131-condition-switch"><span data-condition-label></span><input role="switch" aria-label="启用使用条件" name="condition" type="checkbox"${c.condition?" checked":""} /></label></div><div class="w1131-form-grid" data-conditions>${field("VIP等级限制","vip",["不限等级",...Array.from({length:10},(_,i)=>`VIP ${i+1} 及以上`)],c.vip?`VIP ${c.vip} 及以上`:"不限等级")}${field("历史充值额度限制","depositAmount",'type="number" min="0"',c.depositAmount)}${field("充值笔数限制","depositCount",'type="number" min="0" step="1"',c.depositCount)}${field("流水限制(打码投注限制)","turnover",'type="number" min="0"',c.turnover)}</div></div><div class="w1131-unchanged w1131-channel-remark"><label class="w1131-field"><span>备注</span><textarea name="remark" rows="3" placeholder="请输入内容">${escape(c.remark)}</textarea></label></div></form>`;
    const root=openModal(old?"修改取款通道":"添加取款通道",body,`${button("确定","save-channel","","primary")}${button("取消","close")}`,"w1131-channel-dialog");restoreSites(root,c.sites.length?c.sites:helpers.sites);bindSites(root);
    function syncForm(){const f=plainForm(root);root.querySelector("[data-channel-fixed]").hidden=f.feeMode!=="fixed";root.querySelector("[data-channel-tiered]").hidden=f.feeMode!=="tiered";root.querySelector("[data-integer-rule]").hidden=f.provider!=="XMFPay";root.querySelector("[data-condition-label]").textContent=f.condition?"启用（设置生效）":"关闭";root.querySelectorAll("[data-conditions] input,[data-conditions] select").forEach((i)=>{i.disabled=!f.condition;});root.querySelector('[name="fee"]').closest("label").querySelector("span").textContent=`固定手续费（${f.currency==="USDT"?"U":"CNY"}）`;}
    root.addEventListener("change",syncForm);syncForm();
    root.addEventListener("click",(e)=>{const b=e.target.closest("[data-w1131-action]");if(!b)return;if(b.dataset.w1131Action==="add-channel-tier")root.querySelector(".w1131-tiers tbody").insertAdjacentHTML("beforeend",tierRow());if(b.dataset.w1131Action==="remove-tier"&&root.querySelectorAll(".w1131-tiers tbody tr").length>1)b.closest("tr").remove();});
    root.querySelector('[data-w1131-action="close"]').onclick=closeModal;
    root.querySelector('[data-w1131-action="save-channel"]').onclick=()=>{
      const f=plainForm(root),tiers=[...root.querySelectorAll(".w1131-tiers tbody tr")].map((row)=>Object.fromEntries([...row.querySelectorAll("[data-tier]")].map((i)=>[i.dataset.tier,Number(i.value)])));
      if(!f.code||!["exchange","max","daily","fee","min","minFee","depositAmount","depositCount","turnover"].every((key)=>Number.isFinite(Number(f[key]))&&Number(f[key])>=0)||!["exchange","max","daily"].every((key)=>Number(f[key])>0)){error(root,"请填写上游编码及有效的汇率、金额、限额和手续费。");return;}
      if(f.feeMode==="tiered"&&tiers.some((t,i)=>![t.min,t.max,t.rate].every(Number.isFinite)||t.min<0||t.max<=t.min||t.rate<0||t.rate>100||(i&&tiers[i-1].max>t.min))){error(root,"请填写有效费率档位，金额范围不得重叠。");return;}
      const sites=selectedSites(root),platforms=[...root.querySelectorAll('[name="platform"]:checked')].map((i)=>i.value);if(!platforms.length){error(root,"请选择至少一个支持平台。");return;}
      const next={...c,...f,id:old?old.id:Math.max(...channels.map((x)=>x.id))+1,name:old&&f.provider===old.provider&&f.method===old.method?old.name:`${f.provider}${f.method}`,enabled:f.enabled==="启用",realName:f.realName==="yes",exchange:Number(f.exchange),max:Number(f.max),daily:Number(f.daily),fee:Number(f.fee),min:Number(f.min),minFee:Number(f.minFee),tiers,vip:Number(f.vip.match(/\d+/)?.[0]||0),depositAmount:Number(f.depositAmount),depositCount:Number(f.depositCount),turnover:Number(f.turnover),integerOnly:f.provider==="XMFPay"&&!!f.integerOnly,condition:!!f.condition,sites:sites.length===helpers.sites.length?[]:sites,platforms,created:c.created||now().slice(0,16),used:c.used||0,balance:c.balance??null};
      if(old&&groups.some((g)=>g.channelIds.includes(old.id)&&(g.method!==next.method||g.currency!==next.currency))){error(root,"该渠道已被聚合通道关联，请先解除关联后再修改提现方式或币种。");return;}if(old)Object.assign(old,next);else channels.push(next);refresh("实际渠道配置已保存。聚合通道会员手续费保持独立。");
    };
  }
  function accountCard(o){return `<div class="w1131-account-card w1131-unchanged"><div><div>${tag(o.accountType)} ${tag(o.level,"warning")}</div><div>账号名称：<b>${o.account}</b></div><small>注册日期：${o.registered}</small></div><div class="w1131-risk-tags"><b>◇ 风控标签</b><div>${o.tags.length?o.tags.map((t)=>tag(t,"warning")).join(" "):"未加风控标签"}</div></div></div>`;}
  function amounts(o){return `<div class="w1131-amount-row">${[["取款类型",o.method,false],["人民币金额（CNY）",money(round(o.amount*o.exchange)),true],[`取款金额（${o.currency}）`,money(o.amount),true],[`${o.stage==="成功"?"实际到账":"预计到账"}（${o.currency}）`,money(o.payout),true],["手续费（CNY）",money(o.fee),false],["站点资金池",money(500000),false]].map(([label,value,negative],i)=>`<div class="${i<3||i===5?"w1131-unchanged":""}"><span>${label}</span><b class="${negative?"w1131-negative":i===5?"w1131-pool":""}">${value}</b></div>`).join("")}</div>`;}
  function attemptBody(o){return annotated("M04",`<div class="w1131-section-head"><h3>出款尝试记录</h3><span>${o.attempts.length} 次</span></div>${table([{label:"次数",width:55},{label:"实际渠道",width:150},{label:"商户请求单号",width:160},{label:"三方单号",width:160},{label:`申请金额（${o.currency}）`,width:130},{label:`出款金额（${o.currency}）`,width:130},{label:"结果",width:150},{label:"原因",width:220},{label:"提交 / 结果时间",width:185},{label:"操作人",width:130}],o.attempts.map((a)=>`<tr><td>${a.number}</td><td>${escape(channel(a.channelId)?.name||a.channelId)}</td><td>${a.request}</td><td>${a.providerNo}</td><td>${money(o.amount)}</td><td>${money(o.payout)}</td><td>${tag(a.state,a.state.includes("失败")||a.state.includes("不明")?"warning":"")}</td><td>${escape(a.reason)}</td><td>${a.time}<small>${a.resultTime}</small></td><td>${a.operator}</td></tr>`))}`);}
  function candidateTable(o, loading = false) {
    const metric = (value) => loading ? `<span class="w1131-refresh-spinner" role="status" aria-label="加载中"></span>` : value;
    const rows = o.channelIds.map((id) => {
      const c = channel(id);
      if (!c) return `<tr><td>—</td><td>渠道已不存在</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td class="w1131-status-cell">${tag("渠道已不存在","warning")}</td></tr>`;
      const reasons = reasonFor(c, o);
      const visibleReasons = reasons.filter((reason) => !(reason === "超过单笔上限" && reasons.includes("今日剩余额度不足")));
      const labels = visibleReasons.length ? visibleReasons : [c.balance == null ? "余额未知" : "可选"];
      const statusTags = labels.map((label) => tag(label, label === "可选" ? "success" : "warning")).join("");
      return `<tr class="${reasons.length ? "w1131-unavailable" : ""}"><td><input type="radio" name="payout-channel" value="${c.id}" aria-label="选择${escape(c.name)}"${reasons.length || loading ? " disabled" : ""} /></td><td><b>${escape(c.name)}</b></td><td>${escape(c.provider)}</td><td>${metric(c.balance == null ? "余额未知" : money(c.balance))}</td><td>${metric(money(Math.max(0, c.daily - c.used)))}</td><td>${metric(money(c.max))}</td><td>${metric(money(c.daily))}</td><td class="w1131-status-cell">${statusTags}</td></tr>`;
    });
    return table([{label:"选择",width:50},{label:"实际渠道",width:150},{label:"上游服务商",width:105},{label:`实时余额（${o.currency}）`,width:120},{label:`剩余额度（${o.currency}）`,width:130},{label:`单笔限额（${o.currency}）`,width:130},{label:`单日限额（${o.currency}）`,width:130},{label:"状态",width:175}], rows, "w1131-candidates");
  }
  function selectionText(o, c) {
    return `已选择：${c.name}　出款金额：${money(o.payout)} ${o.currency}　出款后剩余额度：${money(Math.max(0, c.daily - c.used - o.amount))} ${o.currency}`;
  }
  function refreshCandidateMetrics(root, o) {
    const selectedId = root.querySelector('[name="payout-channel"]:checked')?.value;
    const refreshButton = root.querySelector('[data-w1131-action="refresh-candidates"]');
    refreshButton.disabled = true;
    root.querySelector("[data-candidates]").innerHTML = candidateTable(o, true);
    window.setTimeout(() => {
      if (!root.isConnected) return;
      o.channelIds.forEach((id) => { const c = channel(id); if (c) c.checkedAt = now(); });
      root.querySelector("[data-candidates]").innerHTML = candidateTable(o);
      const selected = selectedId && root.querySelector(`[name="payout-channel"][value="${selectedId}"]:not(:disabled)`);
      if (selected) selected.checked = true;
      root.querySelector('[data-w1131-action="approve-order"]').disabled = !selected;
      root.querySelector("[data-selection]").textContent = selected ? selectionText(o, channel(selectedId)) : "请选择一个实际出款渠道";
      refreshButton.disabled = false;
    }, 650);
  }
  function audit(o){
    const isNew=!!o.groupId,isRetry=o.stage==="待重新选择渠道",attempts=o.attempts.length?attemptBody(o):"";
    const body=`<div class="w1131-audit"><p class="w1131-error" role="alert" hidden></p>${accountCard(o)}${amounts(o)}${isRetry?attempts:""}${isNew?annotated("M02",`<div class="w1131-section-head"><h3>选择出款渠道</h3>${button("↻ 刷新余额及额度","refresh-candidates","","link")}</div><div class="w1131-payout-required">本单需出款：<strong>${money(o.payout)} ${o.currency}</strong></div><div data-candidates>${candidateTable(o)}</div><div class="w1131-selection" data-selection>请选择一个实际出款渠道</div>`,isRetry&&attempts?"w1131-retry-channel-section":""): `<div class="w1131-provider-balance w1131-unchanged"><span>三方账户余额</span><b>${channel(o.actualChannelId)?.balance==null?"暂不支持查询":money(channel(o.actualChannelId).balance)}</b><small>${channel(o.actualChannelId)?.name}</small><small>余额仅供参考，审核通过时仍会重新校验</small></div>`}${!isRetry?attempts:""}<div class="w1131-remark-title w1131-unchanged">▤ 添加审核备注 <span>（选填）</span></div><textarea aria-label="审核备注" class="w1131-remark w1131-unchanged" rows="5" placeholder="请输入详细的审核备注信息（可选择填入并记录入对账流，例如：已核实通过、异地登录风险挂起、打码量不足等）..."></textarea></div>`;
    const root=openModal(`取款审核 - ${o.code}`,body,`${button("取消","close")}${button("冻结","freeze-order",o.id,"warning")}${button(o.stage==="待重新选择渠道"?"终止提现":"拒绝","reject-order",o.id,"danger",false,"B02")}${button(o.stage==="待重新选择渠道"?"重选并发起":"通过","approve-order",o.id,"success",isNew,"B01")}`,"w1131-audit-dialog");
    root.addEventListener("change",(e)=>{if(!e.target.matches('[name="payout-channel"]'))return;const c=channel(e.target.value);root.querySelector("[data-selection]").textContent=selectionText(o,c);root.querySelector('[data-w1131-action="approve-order"]').disabled=false;});
    root.addEventListener("click",(e)=>{const b=e.target.closest("[data-w1131-action]");if(!b)return;const a=b.dataset.w1131Action;if(a==="close")closeModal();if(a==="refresh-candidates"){refreshCandidateMetrics(root,o);return;}
      const remark=root.querySelector("textarea")?.value.trim()||"";
      if(a==="approve-order"){if(!editableOrder(o)){error(root,"当前订单状态不允许再次出款。");return;}const c=channel(isNew?root.querySelector('[name="payout-channel"]:checked')?.value:o.actualChannelId);if(!c){error(root,"请选择实际出款渠道。");return;}const reasons=isNew?reasonFor(c,o):[];if(reasons.length){error(root,reasons.join("；"));return;}confirmPayout(o,c,remark);}
      if(a==="freeze-order"&&editableOrder(o)){o.stage="冻结";o.remark=remark||"财务冻结";o.operations.push({action:"冻结",time:now(),remark:o.remark});refresh("订单已冻结，申请款继续冻结。");}
      if(a==="reject-order")terminate(o,remark);
    });
  }
  function confirmPayout(o,c,remark){const root=openModal("确认发起出款",`<div class="w1131-confirm"><p class="w1131-error" hidden role="alert"></p><dl><dt>会员单号</dt><dd>${o.code}</dd><dt>会员提现通道</dt><dd>${escape(o.groupName||"原渠道流程")}</dd><dt>实际出款渠道</dt><dd>${escape(c.name)}（${c.id}）</dd><dt>会员申请金额</dt><dd>${money(o.amount)} ${o.currency}</dd><dt>会员手续费（已锁定）</dt><dd>${money(o.fee)} CNY</dd><dt>实际发给收款人</dt><dd class="w1131-negative">${money(o.payout)} ${o.currency}</dd></dl>${c.balance==null?'<div class="w1131-warning">该渠道余额未知，请人工核实。<label><input type="checkbox" data-verify-balance /> 已核实该渠道具备本次出款能力</label></div>':""}<p>提交后该次出款渠道锁定，处理中或结果不明期间不能再次发起。</p></div>`,`${button("返回审核","back-audit",o.id)}${button("确认并发起","submit-payout",o.id,"success",c.balance==null)}`,"w1131-confirm-dialog");root.querySelector('[data-w1131-action="back-audit"]').onclick=()=>audit(o);root.querySelector("[data-verify-balance]")?.addEventListener("change",(e)=>{root.querySelector('[data-w1131-action="submit-payout"]').disabled=!e.target.checked;});root.querySelector('[data-w1131-action="submit-payout"]').onclick=()=>{const reasons=o.groupId?reasonFor(c,o):[];if(!editableOrder(o)||reasons.length){error(root,reasons.join("；")||"订单状态已经变化，请返回重新核对。");return;}if(o.groupId)c.used=round(c.used+o.amount);o.actualChannelId=c.id;o.stage="出款中";o.remark=remark||"财务通过，已提交三方";const n=o.attempts.length+1;o.attempts.push({number:n,channelId:c.id,request:`${o.code}-A${String(n).padStart(2,"0")}`,providerNo:"待返回",state:"出款中",reason:"三方处理中",time:now(),resultTime:"-",operator:"Mike"});o.operations.push({action:"通过并发起",time:now(),remark:o.remark});refresh("已发起出款。会员手续费和预计到账额保持申请快照。");};}
  function terminate(o,remark=""){if(!editableOrder(o)){notice("当前订单不能终止，须先确认三方未出款。");return;}const root=openModal(o.stage==="待重新选择渠道"?"终止提现":"拒绝提现",`<p>确认终止 ${o.code}？</p><p>已确认未出款，退还会员冻结申请额 ${money(round(o.amount*o.exchange))} CNY。终止后会员显示提现失败。</p><label class="w1131-field"><span>终止原因（必填）</span><textarea name="reason" aria-label="终止原因" rows="3">${escape(remark)}</textarea></label><p class="w1131-error" hidden role="alert"></p>`,`${button("返回审核","back-audit",o.id)}${button("确认终止","finish-terminate",o.id,"danger")}`);root.querySelector('[data-w1131-action="back-audit"]').onclick=()=>audit(o);root.querySelector('[data-w1131-action="finish-terminate"]').onclick=()=>{const reason=root.querySelector("textarea").value.trim();if(!reason){error(root,"请填写终止原因。");return;}if(!editableOrder(o)){error(root,"订单状态已经变化，不允许终止。");return;}o.stage="已终止";o.frozen=false;o.remark=reason;o.operations.push({action:"终止并退款",time:now(),remark:reason});refresh("提现已终止，会员申请款已退回；不会重复退还。");};}
  function viewMetrics(o){
    const metricGrid=(labels)=>`<div class="w1131-metric-grid w1131-unchanged">${labels.map((l)=>`<div><span>${l}</span><b>—</b></div>`).join("")}</div>`;
    if(o.accountType!=="会员")return metricGrid(["总分润","总充值","总提现","垫付额度","欠款额度","红包"])+`<h3 class="w1131-unchanged">近三个月收支指标（转账 / 提现）</h3>`+metricGrid(["转账次数","转账总额","提现次数","提现总额"]);
    return `<div class="w1131-summary-grid w1131-unchanged">${[["账户总余额",12800],["可提现余额",o.frozen?12800-round(o.amount*o.exchange):12800],["锁定余额",o.frozen?round(o.amount*o.exchange):0],["余额是否正常","正常"]].map(([l,v],i)=>`<div><span>${l}</span><b>${typeof v==="number"?money(v):v}</b>${i<3?"<small>CNY</small>":""}</div>`).join("")}</div>`+metricGrid(["总存款","总提款","总盈亏","近30天盈亏","近30天提款额度","累计投注有效额","近30天提现次数","转账收入","彩金收入","账变记录余额","额度增加总计","额度扣减总计","红包"]);
  }
  function memberGameDetails(){
    const venues=(window.PROTOTYPE_VENUE_GAMES||[]).map((v)=>v.name);
    return `<section class="w1131-unchanged" data-bet-details><div class="w1131-section-head"><h3>会员投注详情<small>（全部历史，按会员赢钱最多排序）</small></h3>${button("↻ 刷新","refresh-bets","","plain-primary")}</div><div class="w1131-bet-toolbar"><select aria-label="选择场馆"><option value="">选择场馆</option>${venues.map((name)=>`<option>${escape(name)}</option>`).join("")}</select><input aria-label="搜索游戏名称" placeholder="搜索游戏名称"/>${button("查询","query-bets","","primary")}${button("重置","reset-bets")}</div>${table([{label:"场馆",width:120},{label:"游戏",width:170},{label:"净输赢值",width:120},{label:"注单数",width:90},{label:"投注总额",width:120},{label:"统计时间",width:170}],[])}</section>`;
  }
  function viewOrder(o){
    const body=`${accountCard(o)}${viewMetrics(o)}${amounts(o)}${["出款中","结果不明"].includes(o.stage)?annotated("M03",`<div class="w1131-warning"><b>${o.stage==="结果不明"?"出款结果尚未确认":"三方正在处理"}</b><p>当前渠道：${escape(channel(o.actualChannelId)?.name)}；仅可查询原尝试或对账，禁止换渠道、终止和重复付款。</p>${button("查询三方","query-order",o.id,"link")}</div>`):""}${o.groupId?attemptBody(o):""}<div class="w1131-warning-grid w1131-unchanged"><div><b>风险记录</b><p>${o.accountType==="会员"?"该会员暂无风险预警":"暂无风险预警"}</p></div><div><b>异常订单（近三个月）</b><p>暂无异常订单</p></div></div>${o.accountType==="会员"?memberGameDetails():""}<h3>操作流程及操作备注历史 (${o.operations.length})</h3>${o.operations.length?o.operations.map((log)=>`<div class="w1131-log">${tag(log.action)}<span> Mike</span><small>${log.time}</small><p>${escape(log.remark)}</p></div>`).join(""):'<div class="w1131-empty">该订单暂无任何后台操作流程记录</div>'}`;
    const root=openModal(`取款审核 - ${o.code}`,body,button("关闭已阅","close"),"w1131-view-dialog");root.querySelector('[data-w1131-action="close"]').onclick=closeModal;root.querySelector('[data-w1131-action="query-order"]')?.addEventListener("click",()=>queryOrder(o));
    root.querySelectorAll('[data-w1131-action$="-bets"]').forEach((b)=>b.addEventListener("click",()=>{const section=root.querySelector("[data-bet-details]");if(b.dataset.w1131Action==="reset-bets"){section.querySelector("select").value="";section.querySelector("input").value="";}section.querySelector(".w1131-empty").textContent=b.dataset.w1131Action==="query-bets"?"暂无匹配的投注数据":"暂无数据";}));
  }
  function queryOrder(o){const attempt=o.attempts.at(-1);const root=openModal("查询三方出款结果",`<dl class="w1131-query-result"><dt>单号</dt><dd>${o.code}</dd><dt>当前实际渠道</dt><dd>${escape(channel(o.actualChannelId)?.name||"-")}</dd><dt>商户请求单号</dt><dd>${attempt?.request||"-"}</dd><dt>三方结果</dt><dd>${tag(o.stage==="结果不明"?"尚未获得确定结果":"三方处理中","warning")}</dd></dl><div class="w1131-warning">继续保持原出款尝试和额度占用，会员显示提现处理中。需要获得确定结果或完成对账后才能进一步处理。</div>`,button("关闭","close"));root.querySelector('[data-w1131-action="close"]').onclick=closeModal;}
  function deleteItems(kind,ids){const list=kind==="group"?groups:channels,items=list.filter((c)=>ids.includes(String(c.id)));if(kind==="group"&&items.some((g)=>orders.some((o)=>o.groupId===g.id))){notice("通道已有订单引用，不能删除；可以停用。");return;}if(kind==="channel"&&items.some((c)=>groups.some((g)=>g.channelIds.includes(c.id))||orders.some((o)=>o.actualChannelId===c.id||o.channelIds.includes(c.id)))){notice("实际渠道已有通道或订单引用，不能删除；可以停用。");return;}const root=openModal("删除确认",`<p>确认删除 ${items.map((c)=>escape(c.name)).join("、")}？</p>`,`${button("取消","close")}${button("确认删除","confirm-delete","","danger")}`);root.querySelector('[data-w1131-action="close"]').onclick=closeModal;root.querySelector('[data-w1131-action="confirm-delete"]').onclick=()=>{items.forEach((c)=>list.splice(list.indexOf(c),1));refresh("已删除。");};}
  function bind(){
    const root=document.querySelector(".withdraw1131-app"),kind=page.key.includes("settings")?"setting":"review";
    restoreSites(root,state[`${kind}Filters`].sites);bindSites(root);if(kind==="review")helpers.bindDates();
    root.querySelectorAll("[data-w1131-tab]").forEach((b)=>b.addEventListener("click",()=>{state.settingFilters={};state.settingPage=1;state.selected.clear();helpers.setTab(b.dataset.w1131Tab);}));
    root.querySelectorAll("[data-w1131-size]").forEach((s)=>s.addEventListener("change",()=>{state[`${s.dataset.w1131Size}Size`]=Number(s.value);state[`${s.dataset.w1131Size}Page`]=1;helpers.rerender();}));
    root.querySelectorAll("[data-w1131-jump]").forEach((i)=>i.addEventListener("change",()=>{state[`${i.dataset.w1131Jump}Page`]=Math.max(1,Math.min(Number(i.max),Number(i.value)||1));helpers.rerender();}));
    const updateToolbar=()=>{root.querySelector('[data-w1131-action="selected-edit"]')?.toggleAttribute("disabled",state.selected.size!==1);root.querySelector('[data-w1131-action="selected-delete"]')?.toggleAttribute("disabled",!state.selected.size);};
    root.querySelectorAll("[data-w1131-row]").forEach((i)=>i.addEventListener("change",()=>{i.checked?state.selected.add(i.dataset.w1131Row):state.selected.delete(i.dataset.w1131Row);updateToolbar();}));
    root.querySelector("[data-w1131-all]")?.addEventListener("change",(e)=>{root.querySelectorAll("[data-w1131-row]").forEach((i)=>{i.checked=e.target.checked;i.checked?state.selected.add(i.dataset.w1131Row):state.selected.delete(i.dataset.w1131Row);});updateToolbar();});
    root.querySelector("form")?.addEventListener("submit",(e)=>{e.preventDefault();root.querySelector('[data-w1131-action="search"]')?.click();});
    root.addEventListener("click",(event)=>{const b=event.target.closest("[data-w1131-action]");if(!b||b.disabled)return;const a=b.dataset.w1131Action,v=b.dataset.value;
      if(a==="menu"){state.menuOpen=!state.menuOpen;root.querySelector(".w1131-menu-group").classList.toggle("is-expanded",state.menuOpen);return;}
      if(a==="search"){const form=root.querySelector("form"),filters=plainForm(form);filters.sites=selectedSites(form);const dates=[...form.querySelectorAll(".agent-498-date > span")].map((i)=>i.textContent);if(dates.length&&/^\d{4}-/.test(dates[0])){filters.start=dates[0].slice(0,10);filters.end=dates[1].slice(0,10);}state[`${v}Filters`]=filters;state[`${v}Page`]=1;helpers.rerender();}
      if(a==="reset"){state[`${v}Filters`]={};state[`${v}Page`]=1;state.freezeOnly=false;helpers.rerender();}
      if(a==="refresh"){helpers.rerender();notice("列表已刷新。");}
      if(a==="toggle-search")root.querySelector("form").hidden=!root.querySelector("form").hidden;
      if(a==="frozen"){state.freezeOnly=!state.freezeOnly;state.reviewPage=1;helpers.rerender();}
      if(a==="page"){const [k,n]=v.split(":");state[`${k}Page`]=Number(n);helpers.rerender();}
      if(a==="new")v==="group"?groupEditor():channelEditor();
      if(a==="edit-group")groupEditor(v);if(a==="edit-channel")channelEditor(v);
      if(a==="selected-edit")activeTab==="聚合通道"?groupEditor([...state.selected][0]):channelEditor([...state.selected][0]);
      if(a==="selected-delete")deleteItems(activeTab==="聚合通道"?"group":"channel",[...state.selected]);
      if(a==="delete-group"||a==="delete-channel")deleteItems(a==="delete-group"?"group":"channel",[v]);
      if(a==="toggle-group"){const g=group(v);if(!g.enabled){const check={...g,enabled:true,sites:g.sites.length?g.sites:helpers.sites};const message=validateGroup(check,g);if(message){notice(message);return;}}g.enabled=!g.enabled;g.version++;g.updated=now().slice(0,16);helpers.rerender();notice(g.enabled?"通道已启用。":"通道已停用，已提交订单仍按原申请快照处理。");}
      if(a==="relations"){const g=group(v),r=openModal(`${g.name} · 关联渠道`,relationBody(g),button("关闭","close"),"w1131-relations-dialog");r.querySelector('[data-w1131-action="close"]').onclick=closeModal;}
      if(a==="balance"){const c=channel(v),r=openModal("三方账户余额",`<div class="w1131-provider-balance"><span>${escape(c.name)}</span><b>${c.balance==null?"余额未知":`${money(c.balance)} ${c.currency}`}</b><small>${c.balance==null?c.balanceStatus||"暂不支持查询":"查询成功"}</small><small>${now()}</small></div>`,button("关闭","close"));r.querySelector('[data-w1131-action="close"]').onclick=closeModal;}
      if(["audit","view-order","query-order","unfreeze"].includes(a)){const o=orders.find((x)=>x.id===Number(v));if(a==="audit")audit(o);if(a==="view-order")viewOrder(o);if(a==="query-order")queryOrder(o);if(a==="unfreeze"&&o.stage==="冻结"){o.stage=o.attempts.at(-1)?.state.includes("失败")?"待重新选择渠道":"待选渠道";o.operations.push({action:"手动解冻",time:now(),remark:"恢复财务审核，申请款继续冻结"});helpers.rerender();notice("已解除订单冻结，申请款继续冻结，待财务审核。");}}
    });
  }
  window.Withdraw1131={render,bind,sidebar};
})();
