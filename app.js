(function () {
  const app = document.getElementById("app");
  const requirements = window.PROTOTYPE_DATA.requirements;
  const isLocalPrototype = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const riskTags = ["高盈利会员", "职业玩家", "对冲套利风险", "羊毛党用户", "多账号关联", "异常投注用户"];
  const loginRecords = Array.from({ length: 20 }, (_, index) => ({
    id: `LOGIN20260712${String(index + 1).padStart(4, "0")}`,
    member: ["dengji000", "evan888", "mike_test", "dengji000", "risk_user88"][index % 5],
    vip: `VIP${(index % 8) + 1}`,
    site: ["旺财体育", "新旺体育", "彩虹站"][index % 3],
    agent: ["agent_087", "agent_102", "agent_205"][index % 3],
    agentNo: ["A10386", "A10822", "A12051"][index % 3],
    device: ["DEV-8F2A-71C9", "DEV-91BC-204E", "DEV-8F2A-71C9", "DEV-44CD-889A"][index % 4],
    loginIp: ["103.27.14.86", "45.122.68.19", "103.27.14.86", "118.89.32.77", "45.122.68.19"][index % 5],
    registerIp: ["103.27.14.20", "45.122.68.11", "103.27.14.20", "118.89.32.70"][index % 4],
    loginTime: `2026-07-12 ${String(14 + Math.floor(index / 12)).padStart(2, "0")}:${String(59 - index * 2).padStart(2, "0")}:30`,
    domain: `https://m.example.com/withdraw?channel=${index % 3 + 1}&campaign=summer0712&source=agent_${index % 4}`
  }));
  const loginState = { searched: false, sortKey: "", sortDirection: 1, dedupKeys: [] };
  const transactionState = { searched: false };
  const financeTabState = {};
  let blockedDepositViewState = "current";
  const blockedDepositSelection = new Set();
  let autoUnlockHours = 24;

  function visibleRequirements() {
    return requirements.filter((requirement) => !requirement.localOnly || isLocalPrototype);
  }
  let blockedDepositUsers = [
    { member: "afei666", site: "旺财体育", vip: "VIP7", agent: "agent_087 / A10386", count: 4, amounts: "CNY 3,588 / USDT 120", threshold: 3, order: "DP202607170041", appliedAt: "2026-07-17 08:42:16", blockedAt: "2026-07-17 08:42:18" },
    { member: "mike966", site: "新旺体育", vip: "VIP5", agent: "agent_102 / A10822", count: 3, amounts: "CNY 6,000", threshold: 3, order: "DP202607170037", appliedAt: "2026-07-17 08:13:52", blockedAt: "2026-07-17 08:13:55" },
    { member: "dengji000", site: "旺财体育", vip: "VIP3", agent: "agent_205 / A12051", count: 6, amounts: "USDT 480", threshold: 5, order: "DP202607160298", appliedAt: "2026-07-16 23:56:08", blockedAt: "2026-07-16 23:56:10" }
  ];
  let blockedDepositUnlockLogs = [
    { member: "test_member8", site: "旺财体育", count: 3, amounts: "CNY 2,400 / USDT 50", reason: "已联系会员确认异常订单，允许重新发起存款。", operator: "mike.finance", unlockedAt: "2026-07-17 07:35:20", result: "解锁成功" }
  ];
  const exceptionAgentCurrentRows = [
    { site: "旺财体育", number: "AG20318", account: "north_star", parentAgent: "main_agent", parentNumber: "AG10001", type: "多层级代理", status: "正常", subordinateCount: 42, activeCount: 7, abnormalCount: 5, notes: ["规则1 → 线下有效会员数：7人", "规则4 → 返水≤X元：返水18元", "规则6 → 近3个月使用相同IP：5人", "规则7 → 近3个月使用相同设备号：4人"], detectedAt: "2026-07-20 00:18:36", rules: ["规则1", "规则4", "规则6", "规则7"] },
    { site: "新旺体育", number: "AG10872", account: "river_88", parentAgent: "star_center", parentNumber: "AG10027", type: "星级代理", status: "正常", subordinateCount: 68, activeCount: 11, abnormalCount: 8, notes: ["任意一笔充值订单金额区间", "近3个月使用相同设备号"], detectedAt: "2026-07-20 00:18:36", rules: ["规则2", "规则7"] },
    { site: "彩虹站", number: "AG30651", account: "bright_team", parentAgent: "rainbow_top", parentNumber: "AG30002", type: "多层级代理", status: "停用", subordinateCount: 19, activeCount: 4, abnormalCount: 3, notes: ["【总有效流水/总存款】≤百分比", "近3个月使用相同虚拟币地址"], detectedAt: "2026-07-20 00:18:36", rules: ["规则3", "规则8"] },
    { site: "旺财体育", number: "AG20196", account: "summer_line", parentAgent: "main_agent", parentNumber: "AG10001", type: "星级代理", status: "正常", subordinateCount: 27, activeCount: 5, abnormalCount: 4, notes: ["返水≤X元", "首存后X天内未登录过"], detectedAt: "2026-07-20 00:18:36", rules: ["规则4", "规则5"] }
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function statusClass(status) {
    return { "进行中": "status-progress", "待开始": "status-pending", "已完成": "status-done", "已合并": "status-done" }[status] || "";
  }

  function componentBadge(id) {
    return `<span class="component-badge" aria-hidden="true">${id}</span>`;
  }

  function listView() {
    const listRequirements = visibleRequirements();
    const inProgress = listRequirements.filter((item) => item.status === "进行中").length;
    const pending = listRequirements.filter((item) => item.status === "待开始").length;
    const completedThisMonth = listRequirements.filter((item) => item.status === "已完成" && item.completionDate?.startsWith("2026-07")).length;
    const rows = [...listRequirements].sort((a, b) => Number(String(b.id).replace(/\D/g, "")) - Number(String(a.id).replace(/\D/g, ""))).map((item) => `
      <tr class="requirement-row" tabindex="0" data-requirement-id="${escapeHtml(item.id)}" aria-label="查看 ${escapeHtml(item.title)}">
        <td><span class="requirement-id">${escapeHtml(item.id)}</span></td>
        <td><strong class="requirement-title">${escapeHtml(item.title)}</strong><span class="requirement-summary">${escapeHtml(item.summary)}</span></td>
        <td><span class="priority">${escapeHtml(item.priority)}</span></td>
        <td><span class="status ${statusClass(item.status)}"><i></i>${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.owner)}</td><td class="date-cell">${escapeHtml(item.startDate)}</td><td class="date-cell">${escapeHtml(item.completionDate)}</td>
        <td><button class="icon-action" type="button" aria-label="查看需求" title="查看需求">→</button></td>
      </tr>`).join("");

    app.innerHTML = `
      <main class="list-shell">
        <header class="list-header"><div><p class="eyebrow">PRODUCT SPECIFICATION HUB</p><h1>产品需求原型库</h1><p class="header-copy">集中查看需求、高保真原型和组件级开发说明。</p></div><div class="owner-block"><span>产品负责人</span><strong>Mike</strong></div></header>
        <section class="summary-strip" aria-label="需求概览"><div><span>全部需求</span><strong>${String(requirements.length).padStart(2, "0")}</strong></div><div><span>进行中</span><strong>${String(inProgress).padStart(2, "0")}</strong></div><div><span>待开始</span><strong>${String(pending).padStart(2, "0")}</strong></div><div><span>本月完成</span><strong>${String(completedThisMonth).padStart(2, "0")}</strong></div></section>
        <section class="requirements-section"><div class="section-heading"><div><h2>需求列表</h2><p>点击需求查看交互原型与详细规则</p></div><span class="last-sync">最后更新 2026-07-12 14:41</span></div><div class="table-wrap"><table><thead><tr><th>需求编号</th><th>需求主题</th><th>优先级</th><th>状态</th><th>产品</th><th>开始时间</th><th>完成时间</th><th><span class="sr-only">操作</span></th></tr></thead><tbody>${rows}</tbody></table></div></section>
      </main>`;

    const latestUpdate = requirements.map((item) => item.updatedAt).filter(Boolean).sort().at(-1) || "—";
    app.querySelector(".last-sync").textContent = `最后更新 ${latestUpdate}`;

    app.querySelectorAll(".requirement-row").forEach((row) => {
      const open = () => { window.location.hash = `requirement/${encodeURIComponent(row.dataset.requirementId)}`; };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
    });
    applyTableRowLimits(app);
  }

  function annotationCard(annotation) {
    let demoControls = "";
    if (annotation.name === "列表状态切换") demoControls = `<div class="spec-demo-controls"><label><input type="checkbox" checked id="spec-claim-toggle" /><span>展示待领取数据</span></label><label><input type="checkbox" checked id="spec-review-toggle" /><span>展示待审核数据</span></label></div>`;
    if (annotation.name === "登录日志列表状态") demoControls = `<div class="spec-demo-controls"><label><input type="checkbox" ${loginState.searched ? "checked" : ""} id="spec-login-data-toggle" /><span>展示有数据状态</span></label></div>`;
    if (annotation.name === "流水列表状态") demoControls = `<div class="spec-demo-controls"><label><input type="checkbox" ${transactionState.searched ? "checked" : ""} id="spec-transaction-data-toggle" /><span>展示有数据状态</span></label></div>`;
    let summaryText = escapeHtml(annotation.summary);
    annotation.summaryHighlights?.forEach((term) => { summaryText = summaryText.replaceAll(escapeHtml(term), `<strong class="summary-danger">${escapeHtml(term)}</strong>`); });
    const summary = annotation.summary ? `<p class="annotation-summary${annotation.summaryTone === "danger" ? " annotation-summary-danger" : ""}">${summaryText}</p>` : "";
    const rules = [...annotation.rules];
    if (annotation.name.includes("筛选") || annotation.name.includes("输入处理")) rules.push("筛选按钮的可点击面积大于其他按钮一倍，可参考原型");
    if (annotation.type === "数据表格") rules.push("表格仅在内容超出对应可视区域时显示滚动条：横向滚动条高度、纵向滚动条宽度均保持15px；内容可完整显示时对应滚动条隐藏");
    const ruleHtml = rules.map((rule, index) => {
      let text = escapeHtml(rule);
      annotation.ruleHighlights?.forEach((term) => { text = text.replaceAll(escapeHtml(term), `<strong class="rule-highlight">${escapeHtml(term)}</strong>`); });
      return `<li${annotation.ruleEmphasisIndexes?.includes(index) ? ' class="rule-emphasis"' : ""}>${text}</li>`;
    }).join("");
    return `<article class="annotation-card${annotation.critical ? " critical-annotation" : ""}" data-spec-id="${annotation.id}" tabindex="0"><div class="annotation-heading"><span class="component-code">${annotation.id}</span><div><h3>${escapeHtml(annotation.name)}</h3></div></div>${summary}<ul>${ruleHtml}</ul>${demoControls}</article>`;
  }

  function visibleAnnotations(page, activeTab = financeTabState[page.key] || page.tabs?.[0]) {
    return page.annotations.filter((annotation) => !annotation.tab || annotation.tab === activeTab);
  }

  function visiblePages(requirement) {
    return requirement.pages.filter((page) => !page.localOnly || isLocalPrototype);
  }

  function sidebar(requirement, page) {
    const finance = requirement.moduleName === "财务管理";
    const member = requirement.moduleName === "会员管理";
    const brand = finance ? "Finance" : member ? "MemberCenter" : "RiskControl";
    const brandMark = finance ? "F" : member ? "M" : "R";
    const moduleName = requirement.moduleName || "风控管理";
    const workspaceName = requirement.workspaceName || "风控工作台";
    const roleName = requirement.roleName || "风控审核员";
    const memberDetailActive = member && member488DetailPages.some(([key]) => key === page.key);
    const navigationPages = member ? visiblePages(requirement).filter((item) => ["member-list-488", "member-logs-488"].includes(item.key)) : visiblePages(requirement);
    let links = navigationPages.map((item) => {
      const active = item.key === page.key || (item.key === "member-list-488" && memberDetailActive);
      const newBadge = item.key === "member-logs-488" ? '<em class="menu-change-badge is-new">新增</em>' : "";
      return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${item.key}" class="${active ? "active" : ""}"><span class="menu-symbol">${active ? "■" : "□"}</span><span class="menu-name">${item.name}</span>${newBadge || (item.changeLabel ? `<em class="menu-change-badge ${item.changeType === "纯新增" ? "is-new" : "is-merged"}">${item.changeLabel}</em>` : "")}</a>`;
    }).join("");
    if (member) {
      const listLink = links.match(/<a[^>]*member-list-488[\s\S]*?<\/a>/)?.[0] || "";
      const logLink = links.match(/<a[^>]*member-logs-488[\s\S]*?<\/a>/)?.[0] || "";
      const unchanged = ["同IP会员列表", "VIP会员设置", "会员推广邀请奖励设置", "会员实名认证列表"].map((name) => `<div class="member-menu-static"><span class="menu-symbol">□</span><span>${name}</span></div>`).join("");
      links = `${listLink}${unchanged}${logLink}`;
    }
    return `<aside class="risk-sidebar"><div class="risk-brand"><span>${brandMark}</span><div><strong>${brand}</strong><small>${workspaceName}</small></div></div><div class="risk-menu-label">${moduleName}</div><nav>${links}</nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>${roleName}</small></div></div></aside>`;
  }

  function timeRange(id) {
    const days = Array.from({length: 31}, (_, index) => `<button type="button" class="calendar-day ${index + 1 === 12 ? "selected" : ""}">${index + 1}</button>`).join("");
    return `<div class="risk-field risk-field-wide annotated date-range-field" data-component-id="${id}">${componentBadge(id)}<div class="field-title-row"><label>申请时间</label><div class="quick-ranges"><button type="button">今日</button><button type="button">昨日</button><button type="button">本周</button><button type="button">30天</button><button type="button">90天</button><button type="button">180天</button></div></div><button class="risk-range" type="button" data-date-trigger><span>2026-07-12 00:00:00</span><b>至</b><span>2026-07-12 14:41:00</span></button><div class="date-picker-popover dual-calendar" hidden><div class="calendar-panel"><header><button type="button">‹</button><strong>2026年7月</strong><span></span></header><div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="calendar-days">${days}</div><label class="calendar-time">开始时间<input type="time" value="00:00:00" step="1" /></label></div><div class="calendar-panel"><header><span></span><strong>2026年7月</strong><button type="button">›</button></header><div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="calendar-days">${days}</div><label class="calendar-time">结束时间<input type="time" value="14:41:00" step="1" /></label></div><footer><button type="button" class="secondary-action date-close">取消</button><button type="button" class="main-action date-apply">确定</button></footer></div></div>`;
  }

  const siteOptions = ["旺财体育", "新旺体育", "彩虹站", "财源客栈"];
  const agentOptions = [
    ["agent_087", "AG10386"],
    ["agent_102", "AG10822"],
    ["agent_205", "AG12051"],
    ["north_star", "AG20318"]
  ];

  function siteMultiSelect(label = "所属站点", extraClass = "") {
    return `<div class="risk-field site-multi-field ${extraClass}"><label>${label}</label><button type="button" class="site-multi-trigger" aria-haspopup="listbox" aria-expanded="false"><span class="site-multi-value">全部站点</span><b>▾</b></button><div class="site-multi-options" role="listbox" aria-multiselectable="true" hidden><label class="site-select-all"><input type="checkbox" data-site-all checked />全选站点</label>${siteOptions.map((site) => `<label><input type="checkbox" value="${site}" checked />${site}</label>`).join("")}</div></div>`;
  }

  function agentSmartField(extraClass = "", label = "代理账号/编号") {
    return `<div class="risk-field agent-smart-field ${extraClass}"><label>${label}</label><input type="text" placeholder="请输入代理账号或编号" autocomplete="off" /><div class="agent-smart-options" hidden>${agentOptions.map(([account, number]) => `<button type="button" data-agent-account="${account}" data-agent-number="${number}"><strong>${account}</strong><span>${number}</span></button>`).join("")}</div></div>`;
  }

  function baseFilters(extra = "") {
    return `<div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入订单号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>会员VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP2</option><option>VIP3</option><option>VIP12</option></select></div><div class="risk-field"><label>真实姓名</label><input type="text" placeholder="请输入真实姓名" /></div>${siteMultiSelect()}${extra}`;
  }

  function filterActions(exportButton = false) {
    return `<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button>${exportButton ? `<button type="button" class="secondary-action annotated" data-component-id="B01">${componentBadge("B01")}导出表格</button>` : ""}</div>`;
  }

  function pagination(defaultSize = 20, total = 128) {
    return `<div class="full-pagination"><span>共 ${total} 条</span><select aria-label="每页数量"><option ${defaultSize===10?"selected":""}>10条/页</option><option ${defaultSize===20?"selected":""}>20条/页</option><option ${defaultSize===50?"selected":""}>50条/页</option><option ${defaultSize===100?"selected":""}>100条/页</option><option ${defaultSize===200?"selected":""}>200条/页</option></select><button type="button" aria-label="上一页">‹</button><button type="button" class="active">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="下一页">›</button><label>前往 <input type="number" min="1" value="1" /> 页</label></div>`;
  }

  function questionMark(text) {
    return `<span class="inline-question" title="待确认：${escapeHtml(text)}">?</span>`;
  }

  function memberCell(name = "dengji000") {
    return `<div class="stack-cell"><strong>${name}</strong><span>VIP6</span><span><em class="data-tag">高盈利会员</em></span></div>`;
  }

  function agentCell() {
    return `<div class="stack-cell"><strong>旺财体育</strong><span><i>代理用户名：</i><b>agent_087</b></span><span><i>代理编号：</i><b>A10386</b></span></div>`;
  }

  function accountCell() {
    return `<div class="stack-cell"><strong>陈小明</strong><span><b>6222123456783890</b></span></div>`;
  }

  function money(value) {
    return Number(value).toLocaleString("zh-CN", { minimumFractionDigits: Number(value) % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }

  function dateTimeCell(date, time) {
    const displayDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "2026-07-12";
    return `<div class="stack-cell datetime-cell"><strong>${displayDate}</strong><span><b>${time}</b></span></div>`;
  }

  function reviewRows(mode) {
    return [1, 2, 3].map((index) => {
      const anchorId = mode === "claim" ? "B02" : mode === "hold" ? "B02" : "B03";
      const anchor = index === 1 ? ` annotated" data-component-id="${anchorId}` : "";
      const badge = index === 1 ? componentBadge(anchorId) : "";
      const actions = mode === "claim" ? `<button class="link-action claim-action" type="button">领取</button>` : mode === "hold" ? `<button class="link-action pass-action" type="button">通过</button><button class="link-action reject-action" type="button">拒绝</button>` : `<button class="link-action pass-action" type="button">通过</button><button class="link-action reject-action" type="button">拒绝</button><button class="link-action hold-action" type="button">挂起</button>`;
      const member = index === 2 ? "evan888" : "dengji000";
      const memberComponentId = mode === "hold" ? "B03" : "B04";
      const memberAnnotation = index === 1 && (mode === "claim" || mode === "hold") ? ` annotated" data-component-id="${memberComponentId}` : "";
      const showSystemTagAnchor = index === 1 && mode !== "review";
      const systemTagAnnotation = showSystemTagAnchor ? ` annotated" data-component-id="S02` : "";
      const systemResult = mode === "hold" ? `<td class="pending-system-cell${index === 1 ? ' annotated" data-component-id="S03' : ""}">${index === 1 ? componentBadge("S03") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td>` : "";
      return `<tr><td class="sticky-order"><strong class="mono">WD20260712000${index}</strong></td><td class="sticky-member${memberAnnotation}">${index === 1 && (mode === "claim" || mode === "hold") ? componentBadge(memberComponentId) : ""}<a class="member-detail-link" href="javascript:void(0)" title="将在新Tab打开会员详情">${member}</a></td><td>VIP${5 + index}</td><td>旺财体育</td><td>agent_087</td><td>A10386</td><td>陈小明</td><td>6222123456783890</td><td><strong class="amount">¥ ${money(index * 2680)}</strong></td><td>2026-07-12<br />${10 + index}:2${index}:36</td><td><strong class="amount">¥ ${money(1000)}</strong></td><td class="pending-system-cell${systemTagAnnotation}">${showSystemTagAnchor ? componentBadge("S02") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td>${mode !== "claim" ? `<td>mike.risk</td>` : ""}${systemResult}${mode === "hold" ? `<td><div class="stack-cell"><strong class="hold-time">2026-07-12 12:30:05</strong><span><i>挂起人：</i><b>mike.risk</b></span><span><i>挂起原因：</i><em class="data-tag">${riskTags[index]}</em></span></div></td>` : ""}<td class="row-actions sticky-action${anchor}">${badge}${actions}</td></tr>`;
    }).join("");
  }

  function commonReviewHeaders(mode) {
    return `<th class="sticky-order">订单号</th><th class="sticky-member">会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>真实姓名</th><th>提款账户</th><th>提款金额</th><th>申请时间</th><th>上笔存款金额</th><th>系统标签</th>${mode !== "claim" ? "<th>领取人</th>" : ""}${mode === "hold" ? `<th>系统审核结果</th><th>挂起信息</th>` : ""}<th class="sticky-action">操作</th>`;
  }

  function withdrawReviewContent() {
    return `<div class="risk-page-heading"><div><h1>风控提款审核</h1></div><span class="page-status">公共池实时更新</span></div>
      <section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>筛选表</label><select><option>待领取</option><option selected>待审核</option></select></div>${baseFilters()}${timeRange("F02")}${filterActions()}</div></section>
      <section class="risk-list-card annotated" data-component-id="T01"><div class="risk-list-heading"><div><h2>待领取</h2><span>公共池 · 3 条待处理</span></div><button type="button" class="collapse-button">收起列表</button></div>${componentBadge("T01")}<div id="claim-list-content"><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("claim")}</tr></thead><tbody>${reviewRows("claim")}</tbody></table></div>${pagination()}</div><div class="empty-state" id="claim-empty" hidden><strong>无待领取申请</strong><span>当前公共池暂无需要领取的提款申请</span></div></section>
      <section class="risk-list-card annotated" data-component-id="T02"><div class="risk-list-heading"><div><h2>待审核</h2><span>当前账号已领取 · 3 条</span></div></div>${componentBadge("T02")}<div id="review-list-content"><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("review")}</tr></thead><tbody>${reviewRows("review")}</tbody></table></div>${pagination()}</div><div class="empty-state" id="review-empty" hidden><strong>无待审核申请</strong><span>当前账号暂无已领取的待审核提款申请</span><a href="#requirement/${encodeURIComponent(requirements[0].id)}/page/review-history" class="secondary-action empty-history-link">查看审核历史</a></div></section>`;
  }

  function holdReviewContent() {
    const extras = `<div class="risk-field"><label>挂起原因</label><select><option>全部原因</option>${riskTags.map((tag) => `<option>${tag}</option>`).join("")}</select></div><div class="risk-field"><label>挂起人</label><select><option>全部操作人</option><option>mike.risk</option><option>risk_amy</option></select></div>`;
    return `<div class="risk-page-heading"><div><h1>风控提款挂起审核</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid">${baseFilters(extras)}${timeRange("F02")}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>挂起审核列表</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("hold")}</tr></thead><tbody>${reviewRows("hold")}</tbody></table></div>${pagination()}</section>`;
  }

  function historyContent() {
    const extras = `<div class="risk-field"><label>审核状态</label><select><option>全部</option><option>通过</option><option>拒绝</option></select></div><div class="risk-field"><label>出款状态</label><select><option>全部</option><option>已出款</option><option>待财务审核</option></select></div><div class="risk-field"><label>挂起</label><select><option>全部</option><option>无</option><option>有挂起</option></select></div><div class="risk-field"><label>审核人</label><select><option>全部审核员</option><option>mike.risk</option></select></div>`;
    const rows = [1,2,3].map((i)=>`<tr><td class="sticky-order"><strong class="mono">WD2026071100${i}</strong></td><td class="sticky-member${i === 1 ? ' annotated" data-component-id="B01' : ""}">${i === 1 ? componentBadge("B01") : ""}<a class="member-detail-link" href="javascript:void(0)">dengji000</a></td><td>VIP6</td><td>旺财体育</td><td>agent_087</td><td>A10386</td><td>陈小明</td><td>6222123456783890</td><td><strong class="amount">¥ ${money(i*1200)}</strong></td><td><span class="plain-datetime">2026-07-11 10:2${i}:30</span></td><td class="pending-system-cell${i === 1 ? ' annotated" data-component-id="S02' : ""}">${i === 1 ? componentBadge("S02") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td><td class="pending-system-cell${i === 1 ? ' annotated" data-component-id="S03' : ""}">${i === 1 ? componentBadge("S03") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td><td>${i===2 ? `<span class="plain-datetime">2026-07-11 10:30:00</span><div class="stack-cell"><span><i>挂起人：</i><b>mike.risk</b></span><span><em class="data-tag">对冲套利风险</em></span></div>` : "—"}</td><td>mike.risk</td><td><span class="plain-datetime">2026-07-11 10:4${i}:18</span></td><td>${12+i} 分钟</td><td><span class="data-tag ${i===1?"tag-green":"tag-amber"}">${i===1?"已出款":"待财务审核"}</span></td><td><span class="result-tag ${i===3?"rejected":"approved"}">${i===3?"拒绝：账户异常":"通过"}</span></td><td>${i===2 ? "会员要求延后处理，已核验近期提款记录。" : "—"}</td></tr>`).join("");
    return `<div class="risk-page-heading"><div><h1>风控提款审核记录</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid">${baseFilters(extras)}${timeRange("F02")}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>审核记录</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table history-table"><thead><tr><th class="sticky-order">订单号</th><th class="sticky-member">会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>真实姓名</th><th>提款账户</th><th>提款金额</th><th>申请时间</th><th>系统标签</th><th>系统审核结果</th><th>挂起信息</th><th>审核人</th><th>审核时间</th><th>处理用时</th><th>出款状态</th><th>审核结果</th><th>风控备注</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(50)}</section>`;
  }

  function monitorRows(history = false) {
    return [1, 2, 3].map((index) => `<tr><td><input type="checkbox" aria-label="选择监控${index}" /></td><td class="sticky-monitor-order"><strong class="mono">MN2026071200${index}</strong></td><td class="sticky-monitor-member${index === 1 ? ' annotated" data-component-id="B03' : ""}">${index === 1 ? componentBadge("B03") : ""}<a class="member-detail-link" href="javascript:void(0)">${index === 1 ? "evan888" : "dengji000"}</a></td><td>VIP${5 + index}</td><td>旺财体育</td><td>agent_087</td><td>A10386</td><td><div class="stack-cell"><strong>PG电子</strong><span>麻将胡了</span><span><i>下分时间：</i><b>2026-07-12 14:2${index}:00</b></span></div></td><td><span class="sync-state ${index === 2 ? "pending" : ""}">${index === 2 ? "未同步" : "已同步"}</span></td><td>${8 + index * 3} 分钟</td><td>${2 + index} 次</td>${history ? `<td>${index === 1 ? "系统自动拒绝" : index === 2 ? "人工拒绝" : "人工完结"}</td><td>${index === 1 ? "系统" : "mike.risk"}</td><td>2026-07-12 14:2${index}:30</td>` : `<td class="row-actions${index === 1 ? ' annotated" data-component-id="B02' : ""}">${index === 1 ? componentBadge("B02") : ""}<button class="link-action redetect-action">重新检测</button><button class="link-action ignore-action">拒绝</button><button class="link-action finish-action">已完结</button></td>`}</tr>`).join("");
  }

  function monitorContent() {
    return `<div class="risk-page-heading"><div><h1>提款监控</h1></div></div><div class="inner-tabs annotated" data-component-id="N01">${componentBadge("N01")}<button class="active monitor-tab" data-monitor-tab="pending">结算监控审核</button><button class="monitor-tab" data-monitor-tab="history">审核历史</button></div><div id="monitor-view"></div>`;
  }

  function monitorView(history) {
    const monitorTime = timeRange("F02").replace("申请时间", "监控成立时间");
    const siteField = siteMultiSelect();
    const filters = `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid monitor-filters"><div class="risk-field"><label>会员账号</label><input placeholder="请输入会员账号" /></div><div class="risk-field"><label>真实姓名</label><input placeholder="请输入真实姓名" /></div><div class="risk-field"><label>会员VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP12</option></select></div>${siteField}${monitorTime}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action reset-action">重置</button></div></div></section>`;
    const toolbar = history ? "" : `<div class="monitor-toolbar"><button class="secondary-action annotated" data-component-id="B01" disabled>${componentBadge("B01")}批量拒绝</button><label class="switch-row annotated" data-component-id="S01">${componentBadge("S01")}<input type="checkbox" id="auto-ignore" /><span class="switch-track"></span><b>自动拒绝</b></label><button class="secondary-action annotated config-action" data-component-id="M01">${componentBadge("M01")}流水审核配置</button></div>`;
    const extraHeaders = history ? "<th>审核记录</th><th>审核人</th><th>审核时间</th>" : "";
    const operationHeader = history ? "" : "<th>操作</th>";
    const table = `<div class="risk-table-wrap"><table class="risk-table monitor-table"><thead><tr><th><input type="checkbox" aria-label="全选" /></th><th class="sticky-monitor-order">监控订单号</th><th class="sticky-monitor-member">会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>最后一次场馆信息</th><th>投注记录同步状态</th><th>停留时长</th><th>提现刷新次数</th>${extraHeaders}${operationHeader}</tr></thead><tbody>${monitorRows(history)}</tbody></table></div>${pagination(20, 3)}`;
    return `${filters}${toolbar}<section class="risk-list-card annotated" data-component-id="${history?"T02":"T01"}">${componentBadge(history?"T02":"T01")}<div class="risk-list-heading"><div><h2>${history?"监控审核历史":"结算监控审核"}</h2><span>共 3 条</span></div></div>${table}</section>`;
  }

  function loginLogRows() {
    const records = [...loginRecords];
    if (loginState.sortKey) records.sort((a, b) => String(a[loginState.sortKey]).localeCompare(String(b[loginState.sortKey]), "zh-CN") * loginState.sortDirection || b.loginTime.localeCompare(a.loginTime));
    const duplicateCell = (record, key) => {
      if (!loginState.dedupKeys.includes(key)) return escapeHtml(record[key]);
      const same = records.filter((item) => item[key] === record[key]);
      if (same.length < 2) return escapeHtml(record[key]);
      const values = [...new Set(records.map((item) => item[key]).filter((value) => records.filter((row) => row[key] === value).length > 1))];
      const color = values.indexOf(record[key]) % 6 + 1;
      return `<span class="dedup-value dedup-color-${color} ${same[0] === record ? "dedup-primary" : "dedup-secondary"}">${escapeHtml(record[key])}</span>`;
    };
    return records.map((record, index) => {
      const relation = (key, label) => `<button type="button" class="link-action relation-action" data-relation-kind="${label}" data-relation-value="${escapeHtml(record[key])}">${duplicateCell(record, key)}</button>`;
      const memberAnnotation = index === 0 ? ` annotated" data-component-id="B05` : "";
      return `<tr><td><input type="checkbox" aria-label="选择登录日志${index + 1}" /></td><td class="sticky-login-member${memberAnnotation}">${index === 0 ? componentBadge("B05") : ""}<a class="member-detail-link login-member-link" href="javascript:void(0)">${duplicateCell(record, "member")}</a></td><td>${record.vip}</td><td><span class="data-tag">${riskTags[index % riskTags.length]}</span></td><td>${record.site}</td><td>${record.agent}</td><td>${record.agentNo}</td><td>${index % 3 === 0 ? "Windows 11 / Chrome 126" : index % 3 === 1 ? "iOS 18 / Safari" : "Android 15 / Chrome"}</td><td>${relation("device", "设备号")}</td><td>07${index % 2 ? "19" : "12"}</td><td>${dateTimeCell(record.loginTime.slice(0,10), record.loginTime.slice(11))}</td><td>${relation("loginIp", "登录IP")}</td><td>${relation("registerIp", "注册IP")}</td><td>${index % 3 === 1 ? "广东省 深圳市" : "上海市 上海市"}</td><td><button type="button" class="link-action domain-detail full-domain" data-domain="${escapeHtml(record.domain)}" title="点击查看完整登录域名">${escapeHtml(record.domain)}</button></td></tr>`;
    }).join("");
  }

  function loginResults() {
    if (!loginState.searched) return `<div class="search-empty-state login-empty"><strong>请先设置筛选条件并点击筛选</strong><span>未搜索前，数据表不显示任何数据</span></div>`;
    const sortHeader = (label, key, className = "") => `<th class="${className}"><button class="sort-header login-sort-header" type="button" data-sort-key="${key}">${label}<span>${loginState.sortKey === key ? loginState.sortDirection === 1 ? "↑" : "↓" : "↕"}</span></button></th>`;
    return `<div class="risk-table-wrap"><table class="risk-table login-log-table"><thead><tr><th><input type="checkbox" aria-label="全选登录日志" /></th>${sortHeader("会员账号", "member", "sticky-login-member")}<th>会员等级</th><th>风控标签</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>登录设备</th>${sortHeader("设备号", "device")}<th>版本号</th><th>登录时间</th>${sortHeader("登录IP", "loginIp")}${sortHeader("注册IP", "registerIp")}<th>登录地址</th><th>登录域名</th></tr></thead><tbody>${loginLogRows()}</tbody></table></div>${pagination(50, 20)}`;
  }

  function memberLoginContent() {
    const loginTime = timeRange("F02").replace("<label>申请时间</label>", "<label>登录时间</label>");
    const siteField = siteMultiSelect();
    return `<div class="risk-page-heading"><div><h1>会员登录日志</h1></div></div>
      <section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid login-filter-grid"><div class="risk-field"><label>设备号</label><input type="text" placeholder="请输入设备号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div>${siteField}<div class="risk-field"><label>上级代理</label><input type="text" placeholder="请输入上级代理" /></div><div class="risk-field"><label>上级代理编号</label><input type="text" placeholder="请输入代理编号" /></div><div class="risk-field ip-filter-field"><label>登录IP</label><input type="text" placeholder="例如 103.27.14.86" inputmode="decimal" /><span class="field-error" hidden>请输入正确的IPv4地址</span></div><div class="risk-field region-field"><label>登录地址</label><div class="region-selects"><select aria-label="省份"><option>全部省份</option><option>上海市</option><option>广东省</option></select><select aria-label="城市"><option>全部城市</option><option>上海市</option><option>深圳市</option></select></div></div><div class="risk-field"><label>登录设备</label><input type="text" placeholder="请输入操作系统或设备" /></div><div class="risk-field"><label>版本号</label><select><option>全部版本</option><option>0712</option><option>0719</option></select></div>${loginTime}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter login-filter-action">筛选</button><button type="button" class="secondary-action reset-action">重置</button><button type="button" class="secondary-action export-action">导出表格</button></div></div></section>
      <div class="login-toolbar"><button type="button" class="secondary-action annotated login-batch-device" data-component-id="B01" disabled>${componentBadge("B01")}批量拉黑设备</button><button type="button" class="secondary-action annotated login-batch-ip" data-component-id="B02" disabled>${componentBadge("B02")}批量拉黑IP</button><button type="button" class="secondary-action annotated login-dedup-action" data-component-id="B03">${componentBadge("B03")}数据去重</button></div>
      <section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员登录日志</h2>${loginState.searched ? `<span>共 20 条</span>` : ""}</div></div><div id="login-results">${loginResults()}</div></section>`;
  }

  function transactionQueryContent() {
    const rows = [1, 2, 3].map((index) => {
      const balance = index === 1 ? 0 : index * 1500;
      const met = balance === 0;
      const member = index === 2 ? "evan888" : "dengji000";
      const annotation = index === 1 ? ` annotated" data-component-id="B01` : "";
      const statusAnnotation = index === 1 ? ` annotated" data-component-id="S02` : "";
      return `<tr><td class="sticky-transaction-member">${memberCell(member)}</td><td class="sticky-transaction-agent">${agentCell()}</td><td>${dateTimeCell("2026-07-1${3 - index}",`${String(8 + index).padStart(2, "0")}:20:00`)}</td><td><strong class="amount">¥ ${money(index * 1000)}</strong></td><td>${index === 1 ? "银行卡存款" : "数字货币存款"}</td><td>${index + 1} 倍</td><td><strong class="amount">¥ ${money(index * 3000)}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 3000 : 1800))}</strong></td><td><strong class="amount">¥ ${money(index * 200)}</strong></td><td>${index === 1 ? "存款红利" : "活动红利"}</td><td>${index + 2} 倍</td><td><strong class="amount">¥ ${money(index * 800)}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 800 : 500))}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 3800 : 2300))}</strong></td><td><button type="button" class="balance-detail link-action${annotation}" data-member="${member}" data-site="旺财体育">${index === 1 ? componentBadge("B01") : ""}<strong class="amount">¥ ${money(balance)}</strong></button></td><td class="${statusAnnotation}">${index === 1 ? componentBadge("S02") : ""}<span class="result-tag ${met ? "approved" : "rejected"}">${met ? "已达标" : "未达标"}</span></td><td>${dateTimeCell("2026-07-12",`14:3${index}:00`)}</td></tr>`;
    }).join("");
    const siteField = siteMultiSelect();
    return `<div class="transaction-page"><div class="risk-page-heading"><div><h1>流水查询</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid transaction-filter-grid"><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div>${siteField}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter transaction-search">筛选</button><button type="button" class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员流水任务</h2><span class="transaction-count" ${transactionState.searched ? "" : "hidden"}>共 3 条</span></div></div><div class="search-empty-state transaction-empty" ${transactionState.searched ? "hidden" : ""}><strong>请先设置筛选条件并点击筛选</strong><span>未搜索前，数据表不显示任何数据</span></div><div class="transaction-results" ${transactionState.searched ? "" : "hidden"}><div class="risk-table-wrap"><table class="risk-table transaction-table"><thead><tr><th class="sticky-transaction-member">会员信息</th><th class="sticky-transaction-agent">上级代理</th><th>存款时间</th><th>存款金额</th><th>存款类型</th><th>存款流水倍数</th><th>存款要求流水</th><th>存款完成流水</th><th>红利金额</th><th>红利类型</th><th>红利流水倍数</th><th>红利要求流水</th><th>红利完成流水</th><th>总完成流水</th><th>流水结余</th><th>达标情况</th><th>流水同步时间</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination()}</div></section></div>`;
  }

  function backupTransactionRows() {
    const rows = [
      ["旺财体育", "qiaodashang", "member_10086", "¥50,000.00", "¥74,528.50", "¥64,152.50", "¥10,376.00", "¥31,320.00", "¥31,320.00", "¥22,528.50", "待本轮全部完成", "2026-07-14 18:32", "2026-07-14 21:20"],
      ["旺财体育", "WCO02", "wc_member02", "¥30,000.00", "¥26,400.00", "¥20,400.00", "¥6,000.00", "¥15,000.00", "¥15,000.00", "—", "亏损无解锁", "2026-07-14 16:05", "2026-07-14 21:18"],
      ["旺财体育", "qiaodashang", "vip_8821", "¥18,000.00", "¥20,000.00", "¥12,800.00", "¥7,200.00", "¥9,600.00", "¥9,000.00", "¥2,000.00", "待本轮全部完成", "2026-07-13 22:18", "2026-07-14 21:16"],
      ["旺财体育", "LGNB", "lgnb_5908", "¥12,000.00", "¥14,850.00", "¥11,650.00", "¥3,200.00", "¥10,000.00", "¥10,000.00", "¥2,850.00", "待本轮全部完成", "2026-07-14 19:47", "2026-07-14 20:52"],
      ["旺财体育", "daliwei001", "single_0201", "¥26,000.00", "¥31,560.00", "¥31,560.00", "¥0.00", "¥0.00", "¥0.00", "¥5,560.00", "可领取", "2026-07-12 13:23", "2026-07-14 21:08"],
      ["财源客栈", "FEE0426_A8", "fee_member8", "¥80,000.00", "¥92,600.00", "¥80,600.00", "¥12,000.00", "¥28,000.00", "¥28,000.00", "¥12,600.00", "待本轮全部完成", "2026-07-14 11:40", "2026-07-14 21:15"],
      ["财源客栈", "NA7", "na7_player", "¥10,000.00", "¥7,800.00", "¥5,300.00", "¥2,500.00", "¥6,800.00", "¥6,800.00", "—", "亏损无解锁", "2026-07-09 09:22", "2026-07-14 21:02"],
      ["旺财体育", "WCO02", "wc_member19", "¥45,000.00", "¥51,280.00", "¥44,980.00", "¥6,300.00", "¥17,400.00", "¥17,400.00", "¥6,280.00", "待本轮全部完成", "2026-07-14 08:13", "2026-07-14 21:19"]
    ];
    return rows.map((row, index) => {
      const venueClass = index === 0 ? ' annotated" data-component-id="B01' : "";
      const rechargeClass = index === 0 ? ' annotated" data-component-id="B02' : "";
      return `<tr><td>${row[0]}</td><td>${row[1]}</td><td><strong>${row[2]}</strong></td><td>CNY</td><td><strong class="amount">${row[3]}</strong></td><td><strong class="amount">${row[4]}</strong></td><td><strong class="amount flow-available">${row[5]}</strong></td><td><strong class="amount">${row[6]}</strong></td><td><button type="button" class="flow-detail-link venue-flow-detail${venueClass}" data-member="${row[2]}" data-site="${row[0]}">${index === 0 ? componentBadge("B01") : ""}<strong>${row[7]}</strong><span>查看明细</span></button></td><td><button type="button" class="flow-detail-link recharge-flow-detail${rechargeClass}" data-member="${row[2]}" data-site="${row[0]}">${index === 0 ? componentBadge("B02") : ""}<strong>${row[8]}</strong><span>查看明细</span></button></td><td><strong class="amount ${row[9] !== "—" ? "flow-profit" : ""}">${row[9]}</strong><small class="table-subline">${row[10]}</small></td><td>${row[11]}</td><td>${row[12]}</td></tr>`;
    }).join("");
  }

  function backupTransactionContent() {
    return `<div class="risk-page-heading"><div><h1>流水查询</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid backup-flow-filters"><div class="risk-field"><label>站点</label><select><option>全部站点</option><option>旺财体育</option><option>财源客栈</option></select></div><div class="risk-field"><label>代理账号</label><input type="text" placeholder="请输入代理账号" /></div><div class="risk-field"><label>会员账号 / ID</label><input type="text" placeholder="请输入会员账号或ID" /></div><div class="risk-filter-actions"><button type="button" class="main-action primary-filter backup-flow-search">查询</button><button type="button" class="secondary-action backup-flow-reset">重置</button><button type="button" class="secondary-action backup-flow-export">导出</button></div></div></section><section class="flow-scope-note annotated" data-component-id="P01">${componentBadge("P01")}<strong>金额与流水口径</strong><p>总余额 = 可提现余额 + 锁定余额；场馆提现流水为各场馆及通用任务仍需解锁流水之和；充值提现流水按充值与系统发放彩金生成独立记录并按发生时间 FIFO 解锁。</p></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员打码流水统计</h2><span>共 8 条</span></div></div><div class="risk-table-wrap"><table class="risk-table backup-flow-table"><thead><tr><th>站点</th><th>代理</th><th>会员账号 / ID</th><th>币种</th><th>充值额度</th><th>总余额</th><th>可提现余额</th><th>锁定余额</th><th>场馆提现流水</th><th>充值提现流水</th><th>盈利解锁额度</th><th>最近充值时间</th><th>最近统计时间</th></tr></thead><tbody>${backupTransactionRows()}</tbody></table></div>${pagination(10, 8)}</section>`;
  }

  function unifiedFlowStack(items) {
    return `<div class="unified-flow-stack">${items.map(([label, value, className = ""]) => `<span>${label}</span><strong class="${className}">${value}</strong>`).join("")}</div>`;
  }

  function unifiedTransactionRows() {
    const rows = [
      { site: "旺财体育", agent: "qiaodashang", member: "member_10086", recharge: "¥50,000.00", bonus: "¥2,000.00", total: "¥74,528.50", available: "¥64,152.50", locked: "¥10,376.00", venue: "¥31,320.00", source: "¥31,320.00", profit: "¥22,528.50", profitHint: "待本轮全部完成", met: false, recent: "2026-07-14 18:34", sync: "2026-07-14 21:20" },
      { site: "旺财体育", agent: "WCO02", member: "wc_member02", recharge: "¥30,000.00", bonus: "¥800.00", total: "¥26,400.00", available: "¥20,400.00", locked: "¥6,000.00", venue: "¥15,000.00", source: "¥9,600.00", profit: "—", profitHint: "亏损无解锁", met: false, recent: "2026-07-14 16:06", sync: "2026-07-14 21:18" },
      { site: "旺财体育", agent: "qiaodashang", member: "vip_8821", recharge: "¥18,000.00", bonus: "¥1,200.00", total: "¥20,000.00", available: "¥12,800.00", locked: "¥7,200.00", venue: "¥9,600.00", source: "¥9,000.00", profit: "¥2,000.00", profitHint: "待本轮全部完成", met: false, recent: "2026-07-13 22:20", sync: "2026-07-14 21:16" },
      { site: "旺财体育", agent: "LGNB", member: "lgnb_5908", recharge: "¥12,000.00", bonus: "¥600.00", total: "¥14,850.00", available: "¥11,650.00", locked: "¥3,200.00", venue: "¥10,000.00", source: "¥6,400.00", profit: "¥2,850.00", profitHint: "待本轮全部完成", met: false, recent: "2026-07-14 19:49", sync: "2026-07-14 20:52" },
      { site: "旺财体育", agent: "daliwei001", member: "single_0201", recharge: "¥26,000.00", bonus: "¥1,000.00", total: "¥31,560.00", available: "¥31,560.00", locked: "¥0.00", venue: "¥0.00", source: "¥0.00", profit: "¥5,560.00", profitHint: "可领取", met: true, recent: "2026-07-12 13:25", sync: "2026-07-14 21:08" },
      { site: "财源客栈", agent: "FEE0426_A8", member: "fee_member8", recharge: "¥80,000.00", bonus: "¥3,000.00", total: "¥92,600.00", available: "¥80,600.00", locked: "¥12,000.00", venue: "¥28,000.00", source: "¥16,000.00", profit: "¥12,600.00", profitHint: "待本轮全部完成", met: false, recent: "2026-07-14 11:42", sync: "2026-07-14 21:15" }
    ];
    return rows.map((row, index) => {
      const venueClass = index === 0 ? ' annotated" data-component-id="B01' : "";
      const sourceClass = index === 0 ? ' annotated" data-component-id="B02' : "";
      const statusClass = index === 0 ? ' annotated" data-component-id="S01' : "";
      return `<tr><td class="sticky-unified-site">${row.site}</td><td class="sticky-unified-agent">${row.agent}</td><td class="sticky-unified-member"><strong>${row.member}</strong></td><td>CNY</td><td>${unifiedFlowStack([["充值", row.recharge], ["活动/彩金", row.bonus, "flow-profit"]])}</td><td>${unifiedFlowStack([["总余额", row.total], ["可提现", row.available, "flow-available"], ["锁定", row.locked]])}</td><td><button type="button" class="flow-detail-link unified-venue-flow-detail${venueClass}" data-member="${row.member}" data-site="${row.site}">${index === 0 ? componentBadge("B01") : ""}<strong>${row.venue}</strong><span>查看场馆明细</span></button></td><td><button type="button" class="flow-detail-link unified-source-flow-detail${sourceClass}" data-member="${row.member}" data-site="${row.site}">${index === 0 ? componentBadge("B02") : ""}<strong>${row.source}</strong><span>查看充值/活动明细</span></button></td><td><strong class="amount ${row.profit !== "—" ? "flow-profit" : ""}">${row.profit}</strong><small class="table-subline">${row.profitHint}</small></td><td class="unified-flow-status${statusClass}">${index === 0 ? componentBadge("S01") : ""}<span class="result-tag ${row.met ? "approved" : "rejected"}">${row.met ? "已达标" : "未达标"}</span><small>${row.met ? "可以提现" : "暂不可提现"}</small></td><td>${row.recent}</td><td>${row.sync}</td></tr>`;
    }).join("");
  }

  function unifiedTransactionContent() {
    const countedAt = timeRange("F02").replaceAll("申请时间", "计入时间");
    return `<div class="risk-page-heading"><div><h1>流水查询-2</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid unified-flow-filters"><div class="risk-field"><label>站点</label><select><option>全部站点</option><option>旺财体育</option><option>财源客栈</option></select></div><div class="risk-field"><label>代理账号</label><input type="text" placeholder="请输入代理账号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>流水来源</label><select><option>全部来源</option><option>充值</option><option>活动彩金</option><option>系统发放彩金</option></select></div><div class="risk-field"><label>活动名称 / 编号</label><input type="text" placeholder="请输入活动名称或编号" /></div><div class="risk-field"><label>关联单号</label><input type="text" placeholder="请输入充值单号或彩金单号" /></div><div class="risk-field"><label>流水状态</label><select><option>全部状态</option><option>未达标</option><option>已达标</option></select></div>${countedAt}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter unified-flow-search">查询</button><button type="button" class="secondary-action reset-action">重置</button><button type="button" class="secondary-action unified-flow-export">导出</button></div></div></section><section class="flow-scope-note annotated" data-component-id="P01">${componentBadge("P01")}<strong>统一展示口径</strong><p>主表始终一名会员一行；充值/活动剩余流水沿用旧流水查询的“流水结余”口径。场馆剩余流水与充值/活动剩余流水分别展示，不重复计算；两项均为0且没有其他限制时，流水状态显示已达标、可以提现。</p></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员流水总览</h2><span>共 6 条</span></div></div><div class="risk-table-wrap"><table class="risk-table unified-flow-table"><thead><tr><th class="sticky-unified-site">站点</th><th class="sticky-unified-agent">上级代理</th><th class="sticky-unified-member">会员账号</th><th>币种</th><th>计入流水额度</th><th>资金概览</th><th>场馆剩余流水</th><th>充值/活动剩余流水</th><th>盈利解锁额度</th><th>流水状态</th><th>最近充值/彩金时间</th><th>流水同步时间</th></tr></thead><tbody>${unifiedTransactionRows()}</tbody></table></div>${pagination(10, 6)}</section>`;
  }

  function flowSummaryItem(label, value, hint = "", className = "") {
    return `<div><span>${label}</span><strong class="${className}">${value}</strong>${hint ? `<small>${hint}</small>` : ""}</div>`;
  }

  function venueFlowModalBody(member = "member_10086", site = "旺财体育", unified = false) {
    const rows = [["AG真人", "¥3,600.00", "¥26,900.00", "¥14,400.00", "¥0.00", "¥12,500.00"], ["PG电子", "¥2,850.00", "¥17,400.00", "¥8,750.00", "¥0.00", "¥8,650.00"], ["体育投注", "¥3,926.00", "¥20,950.00", "¥10,780.00", "¥0.00", "¥10,170.00"]];
    const totalLabel = unified ? "场馆剩余流水" : "场馆提现流水";
    return `<div class="flow-modal-content annotated" data-component-id="M01">${componentBadge("M01")}<p class="flow-modal-subtitle">${member} · ${site} · 统计截至 2026-07-14 21:20</p><section class="flow-modal-summary four">${flowSummaryItem("会员账号", member)}${flowSummaryItem("锁定余额", "¥10,376.00")}${flowSummaryItem(totalLabel, "¥31,320.00", "", "flow-profit")}${flowSummaryItem("当前状态", "进行中", "", "flow-status")}</section><div class="risk-table-wrap"><table class="risk-table flow-modal-table venue-flow-table"><thead><tr><th>场馆</th><th>锁定额度</th><th>目标流水</th><th>已完成有效流水</th><th>待确认流水</th><th>还需解锁流水</th><th>状态</th></tr></thead><tbody>${rows.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td><strong class="flow-profit">${row[5]}</strong></td><td><span class="result-tag">进行中</span></td></tr>`).join("")}</tbody></table></div><section class="flow-modal-note"><strong>统计口径</strong><p>单项还需解锁流水 = MAX（0，目标流水 - 已完成有效流水）；${unified ? "场馆剩余流水" : "总场馆提现流水"} = 各场馆及通用任务还需解锁流水之和。待确认流水仅展示进度，不提前计入已完成流水或释放锁定余额。</p></section></div>`;
  }

  function unifiedSourceFlowModalBody(member = "member_10086", site = "旺财体育") {
    const rows = [
      ["充值", "银行卡充值", "DP202607130018", "2026-07-13 10:18", "¥30,000.00", "1倍", "¥30,000.00", "¥30,000.00", "¥0.00", "已达标", "系统入账", "—"],
      ["活动彩金", "首存送彩金 / ACT-2026-071", "BG202607130003", "2026-07-13 10:19", "¥1,000.00", "1倍", "¥1,000.00", "¥1,000.00", "¥0.00", "已达标", "自动发放", "promo.system"],
      ["充值", "USDT充值", "DP202607140086", "2026-07-14 18:32", "¥20,000.00", "1.5倍", "¥30,000.00", "¥0.00", "¥30,000.00", "未达标", "系统入账", "—"],
      ["活动彩金", "周末加码 / ACT-2026-088", "BG202607140012", "2026-07-14 18:34", "¥1,000.00", "1.32倍", "¥1,320.00", "¥0.00", "¥1,320.00", "待解锁", "人工发放", "mike.activity"]
    ];
    return `<div class="flow-modal-content annotated" data-component-id="M02">${componentBadge("M02")}<p class="flow-modal-subtitle">${member} · ${site} · 按计入时间 FIFO 解锁</p><section class="flow-modal-summary five">${flowSummaryItem("会员账号", member)}${flowSummaryItem("流水任务", "4 笔")}${flowSummaryItem("充值计入", "¥50,000.00")}${flowSummaryItem("活动/彩金计入", "¥2,000.00")}${flowSummaryItem("剩余流水", "¥31,320.00", "", "flow-profit")}</section><div class="risk-table-wrap"><table class="risk-table flow-modal-table unified-source-flow-table"><thead><tr><th>顺序</th><th>来源类型</th><th>来源名称 / 活动编号</th><th>关联单号</th><th>计入时间</th><th>计入金额</th><th>流水倍数</th><th>要求流水</th><th>已完成有效流水</th><th>剩余流水</th><th>状态</th><th>发放方式</th><th>操作员</th></tr></thead><tbody>${rows.map((row, index) => `<tr><td>${index + 1}</td><td><span class="data-tag ${row[0] === "活动彩金" ? "tag-amber" : ""}">${row[0]}</span></td><td><strong>${row[1]}</strong></td><td><span class="mono">${row[2]}</span></td><td>${row[3]}</td><td><strong class="amount">${row[4]}</strong></td><td>${row[5]}</td><td>${row[6]}</td><td>${row[7]}</td><td><strong class="${row[8] !== "¥0.00" ? "flow-profit" : ""}">${row[8]}</strong></td><td><span class="result-tag ${row[9] !== "已达标" ? "rejected" : "approved"}">${row[9]}</span></td><td>${row[10]}</td><td>${row[11]}</td></tr>`).join("")}</tbody></table></div><section class="flow-modal-note"><strong>统一任务口径</strong><p>充值、活动彩金和系统发放彩金分别建立流水任务，并按计入时间 FIFO 解锁；旧流水查询中的存款/红利金额、流水倍数、要求流水、完成流水、流水结余和达标情况均在本明细中统一展示。</p></section></div>`;
  }

  function rechargeFlowModalBody(member = "member_10086", site = "旺财体育") {
    const rows = [["充值", "2026-07-13 10:18", "¥30,000.00", "¥30,000.00", "¥30,000.00", "¥0.00", "已完成"], ["系统发放彩金", "2026-07-13 10:19", "¥1,000.00", "¥1,000.00", "¥1,000.00", "¥0.00", "已完成"], ["充值", "2026-07-14 18:32", "¥20,000.00", "¥30,000.00", "¥0.00", "¥30,000.00", "进行中"], ["系统发放彩金", "2026-07-14 18:34", "¥1,000.00", "¥1,320.00", "¥0.00", "¥1,320.00", "待解锁"]];
    return `<div class="flow-modal-content annotated" data-component-id="M02">${componentBadge("M02")}<p class="flow-modal-subtitle">${member} · ${site} · 充值与系统发放彩金按发生顺序 FIFO 解锁</p><section class="flow-modal-summary five">${flowSummaryItem("会员账号", member)}${flowSummaryItem("流水记录", "4 笔（充值 / 系统发放彩金）")}${flowSummaryItem("计入额度", "¥50,000.00 / ¥2,000.00")}${flowSummaryItem("还需解锁流水", "¥31,320.00", "", "flow-profit")}${flowSummaryItem("盈利解锁额度", "¥22,528.50", "待本轮全部完成")}</section><div class="risk-table-wrap"><table class="risk-table flow-modal-table recharge-flow-table"><thead><tr><th>顺序</th><th>类型</th><th>发生时间</th><th>计入额度</th><th>目标流水</th><th>已完成流水</th><th>还需解锁流水</th><th>状态</th></tr></thead><tbody>${rows.map((row, index) => `<tr><td>${index + 1}</td><td><span class="data-tag ${row[0] === "系统发放彩金" ? "tag-amber" : ""}">${row[0]}</span></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td><strong class="${row[5] !== "¥0.00" ? "flow-profit" : ""}">${row[5]}</strong></td><td><span class="result-tag ${row[6] === "待解锁" ? "rejected" : ""}">${row[6]}</span></td></tr>`).join("")}</tbody></table></div><section class="flow-modal-note"><strong>统计口径</strong><p>成功充值与系统发放彩金均视为充值行为，独立建立流水记录，无需关联充值订单；按发生时间 FIFO 解锁，前一笔未完成时不得跳过。还需解锁流水为当前周期内各笔记录还需解锁流水之和；盈利解锁额度仅在用户盈利时展示，需本轮全部充值流水完成后才可领取。</p></section></div>`;
  }

  function transactionRechargeFlowModalBody(button) {
    const cells = button.closest("tr")?.cells;
    const value = (index) => {
      const cell = cells?.[index];
      if (!cell) return "—";
      const dateTime = cell.querySelector(".datetime-cell");
      if (dateTime) return `${dateTime.querySelector("strong")?.textContent.trim()} ${dateTime.querySelector("span")?.textContent.trim()}`;
      const content = cell.cloneNode(true);
      content.querySelectorAll(".component-badge").forEach((badge) => badge.remove());
      return content.innerText.trim() || "—";
    };
    const member = button.dataset.member;
    const site = button.dataset.site;
    const amountValue = (text) => Number(text.replace(/[^\d.-]/g, "")) || 0;
    const remaining = (required, completed) => `¥ ${money(Math.max(0, amountValue(required) - amountValue(completed)))}`;
    const detailRows = [
      ["充值", value(4), value(2), value(3), value(5), value(6), value(7)],
      ["红利", value(9), value(2), value(8), value(10), value(11), value(12)]
    ];
    return `<div class="flow-modal-content annotated" data-component-id="M01">${componentBadge("M01")}<p class="flow-modal-subtitle">${member} · ${site} · 当前流水结余对应的单笔充值及关联红利</p><section class="flow-modal-summary four">${flowSummaryItem("会员账号", member)}${flowSummaryItem("充值时间", value(2))}${flowSummaryItem("充值金额", value(3))}${flowSummaryItem("任务总流水结余", value(14), "", "flow-profit")}</section><div class="risk-table-wrap"><table class="risk-table flow-modal-table transaction-recharge-detail-table"><thead><tr><th>类型</th><th>名称 / 来源</th><th>发生时间</th><th>计入金额</th><th>流水倍数</th><th>要求流水</th><th>完成流水</th><th>剩余流水</th><th>达标情况</th></tr></thead><tbody>${detailRows.map((row) => { const rowRemaining = remaining(row[5], row[6]); const met = amountValue(rowRemaining) === 0; return `<tr><td><span class="data-tag ${row[0] === "红利" ? "tag-amber" : ""}">${row[0]}</span></td><td>${row[1]}</td><td>${row[2]}</td><td><strong class="amount">${row[3]}</strong></td><td>${row[4]}</td><td>${row[5]}</td><td>${row[6]}</td><td><strong class="${met ? "" : "flow-profit"}">${rowRemaining}</strong></td><td><span class="result-tag ${met ? "approved" : "rejected"}">${met ? "已达标" : "未达标"}</span></td></tr>`; }).join("")}</tbody></table></div></div>`;
  }

  function blacklistRows(type) {
    if (type === "ip") {
      const rows = [
        ["103.27.14.86", "IPv4", "中国 / 上海市 / 上海市", 12, "2026-07-13 16:42:08"],
        ["2001:db8:85a3::8a2e:370:7334", "IPv6", "新加坡 / 全部 / 新加坡", 5, "2026-07-13 15:18:36"],
        ["45.122.68.19", "IPv4", "菲律宾 / 马尼拉 / 马尼拉", 8, "2026-07-12 22:09:17"]
      ];
      return rows.map((row, index) => `<tr><td><strong class="mono">${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td><button type="button" class="link-action blacklist-relation${index === 0 ? ' annotated" data-component-id="M01' : ""}" data-relation="account" data-value="${row[0]}">${index === 0 ? componentBadge("M01") : ""}${row[3]} 个</button></td><td>${row[4]}</td><td class="row-actions${index === 0 ? ' annotated" data-component-id="B01' : ""}">${index === 0 ? componentBadge("B01") : ""}<button type="button" class="link-action blacklist-remove" data-kind="IP" data-value="${row[0]}">移除</button></td></tr>`).join("");
    }
    const rows = [
      ["手机", "IMEI", "865166028451320", "iPhone 16 Pro / iOS 18 / Safari 18", 6, 9, "2026-07-13 17:20:42"],
      ["PC", "磁盘序列号", "WD-WCC6Y7PX8T31", "Dell Latitude 7450 / Windows 11 / Chrome 126", 3, 5, "2026-07-13 14:08:15"],
      ["手机", "IMEI", "357341109286415", "Samsung Galaxy S25 / Android 15 / Chrome 126", 11, 14, "2026-07-12 20:36:59"]
    ];
    return rows.map((row, index) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td><strong class="mono">${row[2]}</strong></td><td class="device-detail-cell">${row[3]}</td><td><button type="button" class="link-action blacklist-relation${index === 0 ? ' annotated" data-component-id="M01' : ""}" data-relation="account" data-value="${row[2]}">${index === 0 ? componentBadge("M01") : ""}${row[4]} 个</button></td><td><button type="button" class="link-action blacklist-relation${index === 0 ? ' annotated" data-component-id="M02' : ""}" data-relation="ip" data-value="${row[2]}">${index === 0 ? componentBadge("M02") : ""}${row[5]} 个</button></td><td>${row[6]}</td><td class="row-actions${index === 0 ? ' annotated" data-component-id="B01' : ""}">${index === 0 ? componentBadge("B01") : ""}<button type="button" class="link-action blacklist-remove" data-kind="设备" data-value="${row[2]}">移除</button></td></tr>`).join("");
  }

  function blacklistView(type) {
    if (type === "legacy") return `<section class="reserved-area"><div><strong>原有名单功能保持现状</strong><span>本次需求仅新增设备黑名单与IP黑名单。</span></div></section>`;
    const isIp = type === "ip";
    const filters = isIp
      ? `<div class="risk-field"><label>IP地址</label><input type="text" placeholder="请输入IPv4或IPv6地址" /></div><div class="risk-field region-field"><label>所属地区</label><div class="region-selects"><select><option>全部国家</option><option>中国</option><option>新加坡</option><option>菲律宾</option></select><select><option>全部省份</option><option>上海市</option><option>马尼拉</option></select><select><option>全部城市</option><option>上海市</option><option>马尼拉</option></select></div></div>`
      : `<div class="risk-field"><label>设备类型</label><select><option>全部类型</option><option>手机</option><option>PC</option></select></div><div class="risk-field"><label>设备号</label><input type="text" placeholder="请输入设备号" /></div>`;
    const headers = isIp ? "<th>IP地址</th><th>IP类型</th><th>所属地区</th><th>关联账号数量</th><th>拉黑时间</th><th>操作</th>" : "<th>设备类型</th><th>设备识别类型</th><th>设备号</th><th>设备详情</th><th>关联账号数量</th><th>关联IP数量</th><th>拉黑时间</th><th>操作</th>";
    return `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid blacklist-filter-grid">${filters}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>${isIp ? "IP黑名单" : "设备黑名单"}</h2><span>共 3 条</span></div></div><div class="risk-table-wrap"><table class="risk-table blacklist-table"><thead><tr>${headers}</tr></thead><tbody>${blacklistRows(type)}</tbody></table></div>${pagination(20, 3)}</section>`;
  }

  function riskListLibraryContent(page) {
    return `<div class="risk-page-heading"><div><h1>风控名单库</h1></div></div><div class="inner-tabs annotated blacklist-tabs" data-component-id="N01">${componentBadge("N01")}${page.tabs.map((tab) => { const type = tab === "设备黑名单" ? "device" : tab === "IP黑名单" ? "ip" : "legacy"; return `<button type="button" class="blacklist-tab ${type === "device" ? "active" : ""}" data-blacklist-type="${type}">${tab}</button>`; }).join("")}</div><div id="blacklist-view">${blacklistView("device")}</div>`;
  }

  function exceptionAgentRuleTags(rules) {
    return `<div class="exception-rule-tags">${rules.map((rule) => `<span>${rule}</span>`).join("")}</div>`;
  }

  function exceptionAgentNotes(notes) {
    const lines = notes.map((note) => escapeHtml(note));
    return `<div class="exception-note-preview" tabindex="0"><div class="exception-note-clamp">${lines.join("<br />")}</div>${notes.length > 2 ? `<div class="exception-note-tooltip"><strong>完整异常备注</strong><ul>${lines.map((note) => `<li>${note}</li>`).join("")}</ul></div>` : ""}</div>`;
  }

  function exceptionAgentRows() {
    return exceptionAgentCurrentRows.map((row, index) => `<tr><td>${index + 1}</td><td><strong>${row.site}</strong></td><td><strong class="mono">${row.number}</strong></td><td>${row.account}</td><td><div class="stack-cell"><strong>${row.parentAgent}</strong><span>${row.parentNumber}</span></div></td><td>${row.type}</td><td><span class="result-tag ${row.status === "正常" ? "approved" : "rejected"}">${row.status}</span></td><td>${row.subordinateCount}</td><td>${row.activeCount}</td><td><strong class="exception-count">${row.abnormalCount}</strong></td><td>${row.detectedAt}</td><td class="exception-rules-cell">${exceptionAgentRuleTags(row.rules)}</td><td class="exception-note-cell">${exceptionAgentNotes(row.notes)}</td></tr>`).join("");
  }

  function exceptionAgentFilters() {
    const timeField = timeRange("F02").replaceAll("申请时间", "异常判定时间");
    return `<section class="risk-filter-panel annotated exception-agent-filter" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid exception-agent-filter-grid">${siteMultiSelect()}${agentSmartField()}<div class="risk-field"><label>代理状态</label><select><option>全部状态</option><option>正常</option><option>停用</option></select></div>${timeField}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter exception-agent-search">筛选</button><button type="button" class="secondary-action exception-agent-reset">重置</button><button type="button" class="secondary-action annotated exception-agent-export" data-component-id="B01">${componentBadge("B01")}导出</button></div></div></section>`;
  }

  function exceptionAgentTabBody() {
    const headers = '<th>序号</th><th>站点</th><th>代理编号</th><th>代理账号</th><th>上级代理</th><th>代理类型</th><th>代理状态</th><th>下级人数</th><th>有效活跃人数</th><th>异常会员数</th><th>异常判定时间</th><th>命中规则</th><th class="annotated exception-note-header" data-component-id="C01">' + componentBadge("C01") + "异常备注</th>";
    const scanNote = `<section class="exception-scan-note annotated" data-component-id="P01">${componentBadge("P01")}<div><strong>全平台每日检测</strong><span>仅检测注册大于7天且小于等于31天的代理；代理数据统计范围为注册日至今日。未命中任一开启规则的代理不进入列表，也不保存历史记录。</span></div><button type="button" class="secondary-action annotated exception-rule-config-action" data-component-id="B02">${componentBadge("B02")}异常规则配置</button></section>`;
    return `${exceptionAgentFilters()}${scanNote}<section class="risk-list-card annotated exception-agent-list-card" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>当前异常代理</h2><span>共 ${exceptionAgentCurrentRows.length} 条</span></div></div><div class="risk-table-wrap"><table class="risk-table exception-agent-table"><thead><tr>${headers}</tr></thead><tbody>${exceptionAgentRows()}</tbody></table></div>${pagination(20, exceptionAgentCurrentRows.length)}</section>`;
  }

  function exceptionAgentContent() {
    return `<div class="risk-page-heading"><div><h1>异常代理</h1></div><span class="page-status">全平台每日更新一次</span></div><div class="exception-agent-tab-body">${exceptionAgentTabBody()}</div>`;
  }

  function exceptionRuleInput(label, suffix, extraClass = "") {
    const integerOnly = suffix === "人" || suffix === "天";
    const max = suffix === "%" ? ' max="100"' : "";
    return `<label class="exception-rule-input ${extraClass}"><span>${label}</span><input type="number" min="0"${max} step="${integerOnly ? 1 : 0.01}" data-unit="${suffix}" placeholder="请输入" /><em>${suffix}</em></label>`;
  }

  function exceptionRuleRow(number, content, checked = false) {
    return `<section class="exception-rule-row"><label class="exception-rule-switch"><input type="checkbox" ${checked ? "checked" : ""} /><span class="switch-track"></span><strong>规则${number}</strong></label><div>${content}</div></section>`;
  }

  function exceptionAgentRuleConfigBody() {
    return `<div class="exception-rule-config annotated" data-component-id="M01">${componentBadge("M01")}<section class="exception-rule-scope"><strong>检测总前提</strong><span>仅检测注册大于7天且小于等于31天的代理；代理自身数据统计范围统一为注册日至今日。规则6-8的全平台相同信息比对范围为滚动近3个月。</span></section><div class="exception-rule-list">
      ${exceptionRuleRow(1, `<p>线下有效会员 ${exceptionRuleInput("≤", "人")}，且有效会员的【总有效流水/总存款】 ${exceptionRuleInput("≤", "%")}</p>`, true)}
      ${exceptionRuleRow(2, `<p>任意一笔充值订单金额区间 ${exceptionRuleInput("最低", "元")} 至 ${exceptionRuleInput("最高", "元")} 的线下有效会员数 ${exceptionRuleInput("≥", "人")}</p>`, true)}
      ${exceptionRuleRow(3, `<p>【总有效流水/总存款】 ${exceptionRuleInput("≤", "%")} 的线下有效会员数 ${exceptionRuleInput("≥", "人")}</p>`)}
      ${exceptionRuleRow(4, `<p>返水 ${exceptionRuleInput("≤", "元")} 的线下有效会员数 ${exceptionRuleInput("≥", "人")}</p>`)}
      ${exceptionRuleRow(5, `<p>首存后 ${exceptionRuleInput("天数", "天")} 内未登录过的线下有效会员数 ${exceptionRuleInput("≥", "人")}</p>`)}
      ${exceptionRuleRow(6, `<p>全平台近3个月与本代理有效会员使用相同IP的重叠人数 ${exceptionRuleInput("≥", "人")}，且重叠人数占本代理有效会员总数 ${exceptionRuleInput("≥", "%")}</p>`, true)}
      ${exceptionRuleRow(7, `<p>全平台近3个月与本代理有效会员使用相同设备号的重叠人数 ${exceptionRuleInput("≥", "人")}，且重叠人数占本代理有效会员总数 ${exceptionRuleInput("≥", "%")}</p>`)}
      ${exceptionRuleRow(8, `<p>全平台近3个月与本代理有效会员使用相同虚拟币地址的重叠人数 ${exceptionRuleInput("≥", "人")}，且重叠人数占本代理有效会员总数 ${exceptionRuleInput("≥", "%")}</p>`)}
    </div><p class="exception-rule-validation" role="alert" hidden></p><p class="exception-rule-footnote">符合任意一条已开启规则时，系统自动加入异常代理库。</p></div>`;
  }

  function financeTimeRange(id, label, fullDay = false) {
    const componentId = id || "__finance_time";
    let html = timeRange(componentId).replaceAll("申请时间", label);
    html = html.replaceAll("2026-07-12", "2026-07-16").replaceAll('<button type="button" class="calendar-day selected">12</button>', '<button type="button" class="calendar-day selected">16</button>');
    if (!id) html = html.replace(`risk-field-wide annotated date-range-field" data-component-id="${componentId}">${componentBadge(componentId)}`, 'risk-field-wide date-range-field">');
    if (fullDay) html = html.replace("2026-07-16 14:41:00", "2026-07-16 23:59:59").replace('value="14:41:00"', 'value="23:59:59"');
    return html;
  }

  function financeTimeWithMappingNote(html, _text, extraClass = "") {
    const classedHtml = extraClass ? html.replace("date-range-field", `date-range-field ${extraClass}`) : html;
    return classedHtml;
  }

  function financeFilterActions(exportable = false) {
    return `<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">搜索</button><button type="button" class="secondary-action reset-action">重置</button>${exportable ? '<button type="button" class="secondary-action">导出</button>' : ""}</div>`;
  }

  function financeTabs(page, activeTab) {
    return `<div class="inner-tabs annotated finance-tabs" data-component-id="N01">${componentBadge("N01")}${page.tabs.map((tab) => `<button type="button" class="finance-tab ${tab === activeTab ? "active" : ""}" data-finance-tab="${tab}">${tab}</button>`).join("")}</div>`;
  }

  function financeMenuChangeSummary(page) {
    if (!page.changeType) return "";
    const sources = page.menuSources?.length ? page.menuSources.map((item) => `<span>${item}</span>`).join('<b aria-hidden="true">→</b>') : '<span class="new-menu-source">无原菜单，纯新增功能</span>';
    return `<section class="menu-change-summary"><div><em class="menu-change-badge ${page.changeType === "纯新增" ? "is-new" : "is-merged"}">${page.changeType}</em><strong>${page.name}</strong></div><div class="menu-source-flow">${sources}${page.menuSources?.length ? `<b aria-hidden="true">→</b><span class="target-menu">${page.name}</span>` : ""}</div></section>`;
  }

  function depositSettingsRows() {
    const rows = [
      ["12", "USDT", "USDT", "TronPay", "1", "1", "固定+浮动", "固定：10,20,30,50,100 / 10-10000", "TRC20按档位费率", "启用", "2026-07-15 18:30"],
      ["14", "支付宝", "人民币", "HiPay", "—", "2", "固定+浮动", "固定：1000,2000,3000 / 1-10000", "—", "启用", "2026-07-15 18:30"],
      ["47", "NEXUS", "NEXUS", "NEXUS", "—", "3", "固定+浮动", "1-100000", "—", "启用", "2026-07-16 08:45"]
    ];
    return rows.map((row) => `<tr><td><input type="checkbox" aria-label="选择${row[1]}" /></td>${row.map((cell, index) => index === 9 ? `<td><span class="result-tag approved">${cell}</span></td>` : `<td>${index === 0 ? `<strong class="mono">${cell}</strong>` : cell}</td>`).join("")}<td class="row-actions"><button type="button" class="link-action finance-edit-setting">修改</button><button type="button" class="link-action finance-delete-setting">删除</button></td></tr>`).join("");
  }

  function depositSettingsContent() {
    return `<section class="risk-filter-panel audit-difference-panel deposit-settings-filter"><div class="unchanged-scope-banner"><strong>生产原筛选区</strong><span>全部沿用，本次不修改</span></div><div class="unchanged-production"><div class="risk-filter-grid finance-setting-filters"><div class="risk-field"><label>存款类型</label><select><option>全部存款类型</option><option>USDT</option><option>支付宝</option><option>NEXUS</option></select></div><div class="risk-field"><label>存款币种</label><select><option>全部存款币种</option><option>人民币</option><option>USDT</option></select></div><div class="risk-field"><label>通道状态</label><select><option>全部状态</option><option>启用</option><option>停用</option></select></div>${financeFilterActions()}</div></div></section>
      <div class="finance-setting-toolbar deposit-settings-change-toolbar"><div class="unchanged-production"><button type="button" class="secondary-action finance-add-setting">新增</button><button type="button" class="secondary-action finance-edit-selected">修改</button><button type="button" class="secondary-action finance-delete-selected">删除</button></div><label class="failure-limit-control annotated" data-component-id="F01">${componentBadge("F01")}<span>连续</span><input type="number" min="0" value="3" /><span>笔订单充值未成功后，禁止发起充值</span><button type="button" class="main-action finance-limit-save">确认更新</button></label></div>
      <section class="risk-list-card unchanged-production-section deposit-settings-table-scope annotated" data-component-id="T03">${componentBadge("T03")}<div class="unchanged-scope-banner compact"><strong>生产原数据表</strong><span>字段、数据、分页及操作全部沿用，本次不修改</span></div><div class="risk-list-heading"><div><h2>存款通道设置</h2><span>共 26 条</span></div></div><div class="risk-table-wrap"><table class="risk-table finance-settings-table"><thead><tr><th><input type="checkbox" aria-label="全选" /></th><th>ID</th><th>存款类型</th><th>存款币种</th><th>上游服务商</th><th>上游通道编码</th><th>展示排序</th><th>金额类型</th><th>支付区间</th><th>协议手续费</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${depositSettingsRows()}</tbody></table></div>${pagination(10, 26)}</section>`;
  }

  function blockedDepositCurrentRows() {
    return blockedDepositUsers.map((user, index) => `<tr><td class="sticky-blocked-member"><label class="blocked-member-select"><input type="checkbox" class="blocked-row-check" data-member="${user.member}" ${blockedDepositSelection.has(user.member) ? "checked" : ""} /><a class="member-detail-link" href="javascript:void(0)">${user.member}</a></label></td><td>${user.site}</td><td>${user.vip}</td><td>${user.agent}</td><td><button type="button" class="failed-count-detail" data-member="${user.member}" aria-label="查看${user.member}的${user.count}笔未成功充值订单"><strong>${user.count}</strong><span>笔</span></button></td><td><strong class="amount">${user.amounts}</strong></td><td>${user.threshold} 笔</td><td><strong class="mono">${user.order}</strong></td><td>${user.appliedAt}</td><td>${user.blockedAt}</td><td class="row-actions sticky-blocked-action${index === 0 ? ' annotated" data-component-id="B01' : ""}">${index === 0 ? componentBadge("B01") : ""}<button type="button" class="link-action manual-unlock-action" data-member="${user.member}">人工解锁</button></td></tr>`).join("");
  }

  function blockedDepositLogRows() {
    return blockedDepositUnlockLogs.map((log) => `<tr><td class="sticky-blocked-member"><strong>${log.member}</strong></td><td>${log.site}</td><td>${log.count} 笔</td><td><strong class="amount">${log.amounts}</strong></td><td class="unlock-reason-cell">${log.reason}</td><td>${log.operator}</td><td>${log.unlockedAt}</td><td><span class="result-tag approved">${log.result}</span></td></tr>`).join("");
  }

  function blockedDepositView(view = blockedDepositViewState) {
    if (view === "logs") return `<section class="risk-list-card annotated" data-component-id="T02">${componentBadge("T02")}<div class="risk-list-heading"><div><h2>人工解锁记录</h2><span>共 ${blockedDepositUnlockLogs.length} 条</span></div></div><div class="risk-table-wrap"><table class="risk-table blocked-log-table"><thead><tr><th class="sticky-blocked-member">会员账号</th><th>所属站点</th><th>解锁前未成功笔数</th><th>解锁前未成功金额</th><th>解锁原因</th><th>操作人</th><th>解锁时间</th><th>结果</th></tr></thead><tbody>${blockedDepositLogRows()}</tbody></table></div>${pagination(20, blockedDepositUnlockLogs.length)}</section>`;
    return `<section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading blocked-list-heading"><div><h2>当前禁止用户</h2><span>共 ${blockedDepositUsers.length} 条</span></div><button type="button" class="danger-action batch-unlock-action annotated" data-component-id="B02" ${blockedDepositSelection.size ? "" : "disabled"}>${componentBadge("B02")}批量解锁（${blockedDepositSelection.size}）</button></div><div class="risk-table-wrap"><table class="risk-table blocked-deposit-table"><thead><tr><th class="sticky-blocked-member"><label class="blocked-member-select"><input type="checkbox" class="blocked-check-all" ${blockedDepositUsers.length && blockedDepositSelection.size === blockedDepositUsers.length ? "checked" : ""} />会员账号</label></th><th>所属站点</th><th>VIP等级</th><th>上级代理</th><th class="blocked-count-header annotated" data-component-id="C01">${componentBadge("C01")}连续未成功笔数</th><th>连续未成功金额</th><th>当前触发阈值</th><th>最近未成功单号</th><th>最后一笔申请时间</th><th>禁止时间</th><th class="sticky-blocked-action">操作</th></tr></thead><tbody>${blockedDepositCurrentRows()}</tbody></table></div>${pagination(20, blockedDepositUsers.length)}</section>`;
  }

  function failedDepositModalBody(user) {
    const types = ["支付宝", "USDT", "银行卡", "USDT", "支付宝", "银行卡"];
    const providers = ["HiPay", "TronPay", "XMFPay"];
    const failureStates = [
      { status: "确认失败", className: "rejected" },
      { status: "待支付", className: "pending" },
      { status: "用户主动取消", className: "rejected" }
    ];
    const rows = Array.from({ length: user.count }, (_, index) => {
      const currency = types[index] === "USDT" ? "USDT" : "CNY";
      const amount = [500, 120, 1000, 60, 588, 1500][index] || 100;
      const failure = failureStates[index % failureStates.length];
      return `<tr><td><strong class="mono">DP20260717${String(index + 41).padStart(4, "0")}</strong></td><td>${types[index]}</td><td>2026-07-${index ? "16" : "17"} ${String(8 + index).padStart(2, "0")}:42:16</td><td>${currency}</td><td>${providers[index % providers.length]}</td><td><strong class="amount">${amount} ${currency}</strong></td><td><span class="result-tag ${failure.className}">${failure.status}</span></td></tr>`;
    }).join("");
    return `<div class="failed-deposit-modal annotated" data-component-id="M02">${componentBadge("M02")}<section class="failed-deposit-member"><div><span>会员账号</span><strong>${user.member}</strong></div><div><span>会员等级</span><strong>${user.vip}</strong></div></section><div class="risk-table-wrap"><table class="risk-table failed-deposit-table"><thead><tr><th>充值单号</th><th>充值类型</th><th>充值时间</th><th>充值币种</th><th>上游服务商</th><th>充值金额</th><th>状态</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }

  function openFailedDepositDetails(member) {
    const user = blockedDepositUsers.find((item) => item.member === member);
    if (!user) return;
    modal("连续未成功充值订单", failedDepositModalBody(user), "关闭");
  }

  function prohibitedDepositContent() {
    return `<section class="risk-filter-panel annotated" data-component-id="F02">${componentBadge("F02")}<div class="risk-filter-grid blocked-deposit-filters"><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>所属站点</label><input type="text" placeholder="请输入所属站点" /></div><div class="risk-field"><label>VIP等级</label><select><option>全部等级</option><option>VIP3</option><option>VIP5</option><option>VIP7</option></select></div><div class="risk-field"><label>上级代理</label><input type="text" placeholder="请输入上级代理" /></div>${financeTimeRange("F03", "禁止时间", true)}${financeFilterActions()}</div></section><section class="auto-unlock-setting annotated" data-component-id="F04">${componentBadge("F04")}<label for="auto-unlock-hours">会员进入禁止存款状态</label><input id="auto-unlock-hours" type="number" class="auto-unlock-hours" min="0" step="1" value="${autoUnlockHours}" inputmode="numeric" /><span>小时后自动解锁，0 表示关闭</span><button type="button" class="main-action auto-unlock-save">确认更新</button></section><div class="inner-tabs blocked-view-tabs annotated" data-component-id="N02">${componentBadge("N02")}<button type="button" class="blocked-view-tab ${blockedDepositViewState === "current" ? "active" : ""}" data-blocked-view="current">当前禁止用户</button><button type="button" class="blocked-view-tab ${blockedDepositViewState === "logs" ? "active" : ""}" data-blocked-view="logs">人工解锁记录</button></div><div class="blocked-deposit-view">${blockedDepositView()}</div>`;
  }

  function depositAuditRows() {
    const rows = [
      { order: "e1557e56c370408f", type: "会员", account: "afei666", accountId: "—", vip: "VIP7", site: "旺财体育", channel: "HiPay", rechargeType: "支付宝", transactionType: "充值", currency: "CNY", orderAmount: "500", rechargeAmount: "—", actual: "500", fee: "0", status: "支付处理中", time: "2026-07-17 09:27:35" },
      { order: "419b77a14c1a47d8", type: "代理", account: "agent_087", accountId: "A10386", vip: "—", site: "旺财体育", channel: "TronPay", rechargeType: "USDT", transactionType: "存款", currency: "USDT", orderAmount: "1000", rechargeAmount: "1000", actual: "986", fee: "14", status: "充值待支付", time: "2026-07-17 09:05:31" },
      { order: "0892615005924e67", type: "站点", account: "新旺体育", accountId: "—", vip: "—", site: "新旺体育", channel: "XMFPay", rechargeType: "支付宝", transactionType: "存款", currency: "CNY", orderAmount: "588", rechargeAmount: "588", actual: "588", fee: "0", status: "支付处理中", time: "2026-07-17 08:41:23" }
    ];
    return rows.map((row) => `<tr><td class="sticky-finance-order"><strong class="mono">${row.order}</strong></td><td class="sticky-finance-member"><a class="member-detail-link" href="javascript:void(0)">${row.account}</a></td><td><span class="data-tag">${row.type}</span></td><td>${row.accountId}</td><td>${row.vip}</td><td>${row.site}</td><td>${row.channel}</td><td>${row.rechargeType}</td><td>${row.transactionType}</td><td>${row.currency}</td><td><strong class="amount">${row.orderAmount} ${row.currency}</strong></td><td>${row.rechargeAmount === "—" ? "—" : `<strong class="amount">${row.rechargeAmount} ${row.currency}</strong>`}</td><td><strong class="amount">${row.actual} ${row.currency}</strong></td><td><strong class="amount">${row.fee} ${row.currency}</strong></td><td>—</td><td>—</td><td>${row.time}</td><td class="sticky-finance-status"><span class="result-tag">${row.status}</span></td><td class="row-actions sticky-finance-action"><button type="button" class="link-action">查看</button><button type="button" class="link-action">上分</button><button type="button" class="link-action">取消</button></td></tr>`).join("");
  }

  function depositAuditContent() {
    return `<section class="risk-filter-panel audit-difference-panel"><div class="unchanged-scope-banner"><strong>生产原筛选区</strong><span>除高亮字段外全部沿用，本次不修改</span></div><div class="risk-filter-grid finance-global-audit-filters"><div class="risk-field unchanged-production"><label>单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field unchanged-production"><label>账号类型</label><select><option>全部类型</option><option>会员</option><option>代理</option><option>站点</option></select></div><div class="risk-field unchanged-production"><label>账号名称</label><input type="text" placeholder="请输入账号名称" /></div><div class="risk-field unchanged-production"><label>账号ID / 编号</label><input type="text" placeholder="请输入账号ID或编号" /></div><div class="risk-field unchanged-production"><label>交易类型</label><select><option>全部交易类型</option><option>充值</option><option>存款</option></select></div><div class="risk-field unchanged-production"><label>所属站点</label><input type="text" placeholder="请输入所属站点" /></div><div class="risk-field unchanged-production"><label>充值类型</label><select><option>全部充值类型</option><option>支付宝</option><option>USDT</option></select></div><div class="risk-field unchanged-production"><label>币种</label><select><option>全部币种</option><option>CNY</option><option>USDT</option></select></div><div class="risk-field unchanged-production"><label>状态</label><select><option>全部状态</option><option>充值待支付</option><option>支付处理中</option></select></div>${financeTimeWithMappingNote(financeTimeRange("F02", "存款申请时间", true), "存款申请时间对应生产【创建时间】", "audit-changed-field")}<div class="unchanged-production unchanged-actions">${financeFilterActions()}</div></div></section>
      <section class="risk-list-card unchanged-production-section audit-table-scope annotated" data-component-id="T01">${componentBadge("T01")}<div class="unchanged-scope-banner compact"><strong>生产原数据表</strong><span>字段、数据、分页及操作全部沿用，本次不修改</span></div><div class="risk-list-heading"><div><h2>存款审核</h2><span>共 43 条</span></div></div><div class="risk-table-wrap"><table class="risk-table finance-audit-table global-deposit-audit-table"><thead><tr><th class="sticky-finance-order audit-changed-cell">单号</th><th class="sticky-finance-member audit-changed-cell">账号名称</th><th>账号类型</th><th>账号ID / 编号</th><th>VIP等级</th><th>站点名称</th><th>三方支付通道</th><th>充值类型</th><th>交易类型</th><th>币种</th><th>订单金额</th><th>充值金额</th><th>实际到账</th><th>手续费</th><th>异常备注</th><th>官方备注</th><th class="audit-changed-cell">存款申请时间</th><th class="sticky-finance-status audit-changed-cell">状态</th><th class="sticky-finance-action audit-changed-cell">操作</th></tr></thead><tbody>${depositAuditRows()}</tbody></table></div>${pagination(20, 43)}</section>`;
  }

  function financeRecordRows(subjectType, withdrawal) {
    const identities = subjectType === "代理" ? ["agent_087", "agent_102", "agent_205"] : subjectType === "站点" ? ["旺财体育", "新旺体育", "彩虹站"] : ["afei666", "mike966", "dengji000"];
    const states = withdrawal ? ["审核中", "转账中", "成功"] : subjectType === "会员" ? ["确认中", "确认成功", "用户主动取消"] : ["确认中", "确认失败", "确认成功"];
    const hasRisk = subjectType === "会员" && withdrawal;
    return identities.map((identity, index) => {
      const orderPrefix = withdrawal ? "WD" : "DP";
      const amount = [365, 1000, 588][index];
      const statusClassName = states[index] === "成功" || states[index] === "确认成功" ? "approved" : ["失败", "拒绝", "取消"].some((keyword) => states[index].includes(keyword)) ? "rejected" : "";
      const currency = index === 0 ? "USDT" : "CNY";
      const actual = withdrawal ? amount - 12 : amount;
      const converted = currency === "USDT" ? (amount * 6.76).toFixed(2) : amount.toFixed(2);
      const before = [12000, 8800, 15500][index];
      const after = withdrawal ? before - actual : before + actual;
      const riskColumns = hasRisk ? `<td>${index === 2 ? "risk_amy" : "mike.risk"}</td><td>2026-07-16 ${String(10 + index).padStart(2, "0")}:15:20</td>` : "";
      const agentNumber = subjectType === "代理" ? `<td class="finance-agent-number">AG${String(870 + index).padStart(4, "0")}</td>` : "";
      const siteColumn = subjectType === "会员" || subjectType === "代理" ? `<td>${index === 1 ? "新旺体育" : "旺财体育"}</td>` : "";
      return `<tr><td class="sticky-finance-order"><strong class="mono">${orderPrefix}2026071600${index + 1}</strong></td><td class="sticky-finance-member"><a class="member-detail-link" href="javascript:void(0)">${identity}</a></td>${agentNumber}${siteColumn}<td>${index === 0 ? "USDT" : "支付宝"}</td><td>${currency}</td><td><strong class="amount">${amount.toFixed(2)}</strong></td><td><strong class="amount">${actual.toFixed(2)}</strong></td><td><strong class="amount">${converted}</strong></td><td><strong class="amount">${before.toFixed(2)}</strong></td><td><strong class="amount">${after.toFixed(2)}</strong></td><td><strong class="amount">${converted}</strong></td><td>${currency === "USDT" ? "6.760000" : "1.000000"}</td><td><strong class="amount">${withdrawal ? "12.00" : "0.00"}</strong></td>${riskColumns}<td>mike.finance</td><td>—</td><td>2026-07-16 ${String(9 + index).padStart(2, "0")}:20:00</td><td>${withdrawal ? `2026-07-16 ${String(10 + index).padStart(2, "0")}:30:00` : "—"}</td><td class="sticky-finance-status"><span class="result-tag ${statusClassName}">${states[index]}</span></td><td class="row-actions sticky-finance-action finance-view-action"><button type="button" class="link-action">查看</button></td></tr>`;
    }).join("");
  }

  function financeRecordTotalRow(subjectType, withdrawal, position) {
    const values = withdrawal
      ? ["1,953.00", "1,917.00", "12,957.56", "36,300.00", "34,383.00", "12,957.56", "—", "36.00"]
      : ["1,953.00", "1,953.00", "12,957.56", "36,300.00", "38,253.00", "12,957.56", "—", "0.00"];
    const cells = [
      { value: "总计", className: "sticky-finance-order total-label" },
      { value: "—", className: "sticky-finance-member" }
    ];
    if (subjectType === "代理") cells.push({ value: "—" });
    if (subjectType === "会员" || subjectType === "代理") cells.push({ value: "—" });
    cells.push({ value: "—" }, { value: "—" });
    values.forEach((value, index) => cells.push({ value, className: index === 6 ? "" : "total-amount" }));
    if (subjectType === "会员" && withdrawal) cells.push({ value: "—" }, { value: "—" });
    cells.push({ value: "—" }, { value: "—" }, { value: "—" }, { value: "—" }, { value: "—", className: "sticky-finance-status" }, { value: "—", className: "sticky-finance-action finance-view-action" });
    return `<tr class="finance-total-row ${position}">${cells.map((cell) => `<th class="${cell.className || ""}">${cell.value}</th>`).join("")}</tr>`;
  }

  function financeRecordContent(subjectType, withdrawal, filterId, tableId, timeIdsOverride) {
    const identityLabel = subjectType === "代理" ? "代理账号" : subjectType === "站点" ? "站点名称" : "会员账号";
    const statusOptions = withdrawal ? ["审核中", "转账中", "拒绝", "成功", "失败"] : ["确认中", "确认失败", "确认成功", "待支付", ...(subjectType === "会员" ? ["用户主动取消"] : [])];
    const timeLabel = withdrawal ? "取款申请时间" : "存款申请时间";
    const title = `${subjectType}${withdrawal ? "取款" : "存款"}记录`;
    const timeIds = timeIdsOverride || (subjectType === "会员" ? (withdrawal ? ["F04", "F05"] : ["F05"]) : (withdrawal ? ["F02"] : ["F01"]));
    const hasRisk = subjectType === "会员" && withdrawal;
    const riskTime = hasRisk ? financeTimeRange(timeIds[1], "风控后创建时间", true) : "";
    const riskHeaders = hasRisk ? '<th class="record-changed-cell">风控审核人</th><th class="record-changed-cell">风控后创建时间</th>' : "";
    const agentHeader = subjectType === "代理" ? '<th class="record-changed-cell">代理编号</th>' : "";
    const siteHeader = subjectType === "会员" || subjectType === "代理" ? "<th>站点名称</th>" : "";
    const statusOptionsHtml = statusOptions.map((status) => `<option>${status}</option>`).join("");
    const isMember = subjectType === "会员";
    const orderChanged = isMember ? " record-changed-cell" : "";
    const identityChanged = " record-changed-cell";
    const memberChanged = isMember ? " record-changed-cell" : "";
    const unchanged = " unchanged-production";
    const statusFieldClass = " record-changed-field";
    const reviewerFieldClass = " record-changed-field";
    const agentNumberFilter = subjectType === "代理" ? '<div class="risk-field record-changed-field"><label>代理编号</label><input type="text" placeholder="请输入代理编号" /></div>' : "";
    const primaryTime = financeTimeWithMappingNote(financeTimeRange(timeIds[0], timeLabel, true), `${timeLabel}对应生产【创建时间】`, "record-changed-field");
    const filterActionsHtml = isMember ? financeFilterActions(true) : financeFilterActions(true).replace("risk-filter-actions", "risk-filter-actions unchanged-production");
    const differenceText = isMember ? "仅高亮字段名称、时间与状态选项有调整" : `与生产会员记录一致的筛选项已弱化，仅${subjectType}主体字段和新增差异高亮`;
    const tableDifferenceText = isMember ? "仅表头标识本次变更字段，数据内容保持弱化" : `与生产会员记录一致的表头和数据已弱化，仅${subjectType}主体字段和新增差异高亮`;
    const reviewerField = `<div class="risk-field${reviewerFieldClass}"><label>财务审核人</label><input type="text" placeholder="请输入财务审核人" /></div>`;
    return `<section class="risk-filter-panel record-filter-panel record-difference-mode${filterId ? ' annotated' : ''}"${filterId ? ` data-component-id="${filterId}"` : ""}>${filterId ? componentBadge(filterId) : ""}<div class="unchanged-scope-banner compact"><strong>生产原筛选区</strong><span>${differenceText}</span></div><div class="risk-filter-grid finance-record-filters"><div class="risk-field ${unchanged}"><label>单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field record-changed-field"><label>${identityLabel}</label><input type="text" placeholder="请输入${identityLabel}" /></div>${agentNumberFilter}${subjectType === "站点" ? "" : `<div class="risk-field ${unchanged}"><label>所属站点</label><input type="text" placeholder="请输入所属站点" /></div>`}<div class="risk-field ${unchanged}"><label>支付类型</label><select><option>全部支付类型</option><option>支付宝</option><option>USDT</option></select></div><div class="risk-field${statusFieldClass}"><label>状态</label><select><option>全部状态</option>${statusOptionsHtml}</select></div>${reviewerField}${primaryTime}${riskTime}${filterActionsHtml}</div></section>
      <section class="risk-list-card record-list-card record-difference-mode${tableId ? ' annotated' : ''}"${tableId ? ` data-component-id="${tableId}"` : ""}>${tableId ? componentBadge(tableId) : ""}<div class="unchanged-scope-banner compact"><strong>生产原数据表</strong><span>${tableDifferenceText}</span></div><div class="risk-list-heading"><div><h2>${title}</h2><span>共 9 条</span></div></div><div class="risk-table-wrap"><table class="risk-table finance-record-table${subjectType !== "会员" ? " compact-identity-table" : ""}"><thead>${financeRecordTotalRow(subjectType, withdrawal, "top")}<tr><th class="sticky-finance-order${orderChanged}">单号</th><th class="sticky-finance-member${identityChanged}">${identityLabel}</th>${agentHeader}${siteHeader}<th>支付类型</th><th>币种</th><th>订单金额</th><th>实际交易金额</th><th>折算金额CNY</th><th>变动前金额</th><th>变动后金额</th><th>人民币金额</th><th>汇率</th><th>手续费</th>${riskHeaders}<th class="record-changed-cell">财务审核人</th><th>审核备注</th><th class="record-changed-cell">${timeLabel}</th><th>订单完成时间</th><th class="sticky-finance-status record-changed-cell">状态</th><th class="sticky-finance-action finance-view-action${memberChanged}">操作</th></tr></thead><tbody>${financeRecordRows(subjectType, withdrawal)}</tbody><tfoot>${financeRecordTotalRow(subjectType, withdrawal, "bottom")}</tfoot></table></div>${pagination(50, 9)}</section>`;
  }

  function withdrawalAuditRows() {
    const rows = [
      { order: "WD1783498560783231", type: "会员", account: "dlwc0011", accountId: "—", site: "旺财体育", vip: "VIP7", registeredAt: "2026-06-11 11:45:03", transactionType: "取款", withdrawalType: "USDT提币", amount: "-90.00 U", actual: "88.00 U", fee: "2.00 CNY", userStatus: "处理中", platformStatus: "待审核", thirdStatus: "未提交" },
      { order: "WD1783493903745929", type: "代理", account: "agent_087", accountId: "A10386", site: "旺财体育", vip: "—", registeredAt: "—", transactionType: "代理取款", withdrawalType: "USDT提币", amount: "-10.00 U", actual: "9.50 U", fee: "3.40 CNY", userStatus: "处理中", platformStatus: "待审核", thirdStatus: "未提交" },
      { order: "WD1783390901534802", type: "站点", account: "新旺体育", accountId: "—", site: "新旺体育", vip: "—", registeredAt: "—", transactionType: "站点取款", withdrawalType: "人民币", amount: "-100.00 CNY", actual: "98.00 CNY", fee: "2.00 CNY", userStatus: "处理中", platformStatus: "待审核", thirdStatus: "未提交" }
    ];
      return rows.map((row, index) => `<tr><td class="sticky-finance-order"><strong class="mono">${row.order}</strong></td><td class="sticky-finance-member"><a class="member-detail-link" href="javascript:void(0)">${row.account}</a></td><td><span class="data-tag">${row.type}</span></td><td>${row.type === "会员" ? "—" : row.accountId}</td><td>${row.site}</td><td>${row.type === "会员" ? `<span class="data-tag">${riskTags[index]}</span>` : "—"}</td><td>${row.vip}</td><td>${row.registeredAt}</td><td>${row.transactionType}</td><td>${row.withdrawalType}</td><td><strong class="amount amount-negative">${String(row.amount).replace(/^-/, "")}</strong></td><td><strong class="amount">${row.actual}</strong></td><td>${row.fee}</td><td>${row.withdrawalType === "人民币" ? "ALIPAY,支付宝" : "ERC20"}</td><td>${row.type === "会员" ? "罚罪" : "—"}</td><td class="mono">${row.withdrawalType === "人民币" ? "15588889999" : "0xf59e59348407dc..."}</td><td>—</td><td>${row.type === "会员" ? "mike.risk" : "—"}</td><td>2026-07-17 09:${10 + index}:00</td><td>2026-07-17 09:${20 + index}:00</td><td class="sticky-finance-user-status"><span class="result-tag">${row.userStatus}</span></td><td class="sticky-finance-platform-status"><span class="result-tag">${row.platformStatus}</span></td><td class="sticky-finance-third-status"><span class="result-tag">${row.thirdStatus}</span></td><td class="row-actions sticky-finance-action"><button type="button" class="link-action">查看</button><button type="button" class="link-action">查询三方</button><button type="button" class="link-action finance-withdraw-audit" data-order="${row.order}" data-account-type="${row.type}" data-account="${row.account}">审核</button></td></tr>`).join("");
  }

  function withdrawalAuditContent() {
    return `<section class="risk-filter-panel audit-difference-panel"><div class="unchanged-scope-banner"><strong>生产原筛选区</strong><span>除高亮字段外全部沿用，本次不修改</span></div><div class="risk-filter-grid finance-global-audit-filters"><div class="risk-field unchanged-production"><label>单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field unchanged-production"><label>账号类型</label><select><option>全部类型</option><option>会员</option><option>代理</option><option>站点</option></select></div><div class="risk-field unchanged-production"><label>账号名称</label><input type="text" placeholder="请输入账号名称" /></div><div class="risk-field unchanged-production"><label>账号ID / 编号</label><input type="text" placeholder="请输入账号ID或编号" /></div><div class="risk-field unchanged-production"><label>交易类型</label><select><option>全部交易类型</option><option>取款</option><option>代理取款</option><option>站点取款</option></select></div><div class="risk-field unchanged-production"><label>所属站点</label><input type="text" placeholder="请输入所属站点" /></div><div class="risk-field unchanged-production"><label>风控标签</label><select><option>全部风控标签</option></select></div><div class="risk-field unchanged-production"><label>取款类型</label><select><option>全部取款类型</option><option>人民币</option><option>USDT提币</option></select></div><div class="risk-field unchanged-production"><label>用户状态</label><select><option>全部用户状态</option></select></div><div class="risk-field unchanged-production"><label>平台状态</label><select><option>全部平台状态</option></select></div><div class="risk-field unchanged-production"><label>三方状态</label><select><option>全部三方状态</option></select></div>${financeTimeWithMappingNote(financeTimeRange("F02", "取款申请时间", true), "取款申请时间对应生产【创建时间】", "audit-changed-field")}<div class="unchanged-production unchanged-actions">${financeFilterActions()}</div></div></section>
      <section class="risk-list-card unchanged-production-section audit-table-scope withdrawal-table-scope annotated" data-component-id="T01">${componentBadge("T01")}<div class="unchanged-scope-banner compact"><strong>生产原数据表</strong><span>新增风控审核人、风控后创建时间；取款申请时间对应生产【创建时间】；本表不展示财务审核人</span></div><div class="risk-list-heading"><div><h2>取款审核</h2><span>共 43 条</span></div></div><div class="risk-table-wrap"><table class="risk-table finance-withdraw-audit-table global-withdraw-audit-table"><thead><tr><th class="sticky-finance-order audit-changed-cell">单号</th><th class="sticky-finance-member audit-changed-cell">账号名称</th><th>账号类型</th><th>账号ID / 编号</th><th>站点名称</th><th>风控标签</th><th>VIP等级</th><th>注册日期</th><th>交易类型</th><th>取款类型</th><th>取款金额</th><th>实际到账</th><th>手续费</th><th>银行名称</th><th>账户姓名</th><th>银行账号</th><th>操作备注</th><th class="audit-changed-cell">风控审核人</th><th class="audit-changed-cell">风控后创建时间</th><th class="audit-changed-cell">取款申请时间</th><th class="sticky-finance-user-status audit-changed-cell">用户状态</th><th class="sticky-finance-platform-status audit-changed-cell">平台状态</th><th class="sticky-finance-third-status audit-changed-cell">三方状态</th><th class="sticky-finance-action audit-changed-cell">操作</th></tr></thead><tbody>${withdrawalAuditRows()}</tbody></table></div>${pagination(20, 43)}</section>`;
  }

  function unchangedFinanceContent(page) {
    const componentId = page.annotations?.some((annotation) => annotation.id === "P01") ? "P01" : "";
    return `<div class="risk-page-heading"><div><h1>${page.name}</h1></div></div><section class="reserved-area unchanged-page${componentId ? " annotated" : ""}"${componentId ? ` data-component-id="${componentId}"` : ""}>${componentId ? componentBadge(componentId) : ""}<div><strong>此页面无任何修改</strong><span>页面内容、字段、权限、数据和交互全部沿用#406。</span></div></section>`;
  }

  function financeTabBody(page, activeTab) {
    if (page.key === "deposit-withdraw-settings") {
      if (activeTab === "存款设置") return depositSettingsContent();
      if (activeTab === "取款设置") return `<section class="reserved-area unchanged-page compact"><div><strong>取款设置无修改</strong><span>原有设置内容和逻辑保持生产现状。</span></div></section>`;
      return prohibitedDepositContent();
    }
    if (page.key === "member-transactions") {
      if (activeTab === "存款记录") return financeRecordContent("会员", false, "F01", "T01", ["F02"]);
      return financeRecordContent("会员", true, "F03", "T02", ["F04", "F05"]);
    }
    const subjectType = page.key === "agent-transactions" ? "代理" : "站点";
    return financeRecordContent(subjectType, activeTab.includes("取款"), "", activeTab.includes("取款") ? "T02" : "T01");
  }

  function financeGroupedContent(page) {
    const activeTab = financeTabState[page.key] || page.tabs[0];
    return `<div class="risk-page-heading finance-page-heading"><div><h1>${page.name}</h1></div><span class="prototype-only-label">变更标记仅用于原型评审</span></div>${financeMenuChangeSummary(page)}${financeTabs(page, activeTab)}<div class="finance-tab-body">${financeTabBody(page, activeTab)}</div>`;
  }

  function financeStandaloneContent(page, content) {
    return `<div class="risk-page-heading finance-page-heading"><div><h1>${page.name}</h1></div><span class="prototype-only-label">变更标记仅用于原型评审</span></div>${financeMenuChangeSummary(page)}${content}`;
  }

  const member488DetailPages = [
    ["member-basic-488", "基本信息"], ["member-overview-488", "数据概览"], ["member-wallet-488", "中心钱包"],
    ["member-statistics-488", "用户统计"], ["bet-records-488", "投注记录"], ["deposit-info-488", "存款信息"],
    ["withdrawal-info-488", "提款信息"], ["bonus-info-488", "红利信息"], ["rebate-info-488", "返水信息"],
    ["manual-adjustments-488", "人工上下分记录"], ["account-adjustment-488", "账户调整"],
    ["balance-change-488", "账变记录"], ["risk-record-488", "风控记录"]
  ];

  function member488DateRange(id, label, annotated = true) {
    const annotation = annotated ? ` annotated" data-component-id="${id}` : "";
    return `<div class="risk-field risk-field-wide date-range-field${annotation}">${annotated ? componentBadge(id) : ""}<div class="field-title-row"><label>${label}</label><div class="quick-ranges"><button type="button">今日</button><button type="button">昨日</button><button type="button">本周</button><button type="button">30天</button><button type="button">90天</button><button type="button">180天</button></div></div><button class="risk-range" type="button" data-date-trigger><span>2026-07-19 00:00:00</span><b>至</b><span>2026-07-19 18:30:00</span></button><div class="date-picker-popover" hidden><div><label>开始时间<input type="datetime-local" step="1" value="2026-07-19T00:00:00" /></label><label>结束时间<input type="datetime-local" step="1" value="2026-07-19T18:30:00" /></label></div><footer><button type="button" class="secondary-action date-close">取消</button><button type="button" class="main-action date-apply">确定</button></footer></div></div>`;
  }

  function member488DetailHeader(page) {
    const tabs = member488DetailPages.map(([key, name]) => `<a href="#requirement/${encodeURIComponent("#488")}/page/${key}" class="${key === page.key ? "active" : ""}">${name}</a>`).join("");
    const annotation = page.key === "member-basic-488" ? ` annotated" data-component-id="N01` : "";
    return `<section class="member-context${annotation}">${page.key === "member-basic-488" ? componentBadge("N01") : ""}<div class="member-context-main"><div class="member-context-identity"><strong>会员账号：member_10086</strong><span>会员ID：<em>10886421</em></span><span>账号状态：<b>正常</b></span><span>会员等级：<b>VIP6</b></span></div><div class="member-context-search"><input type="text" placeholder="请输入会员账号" /><button type="button" class="main-action member-search-action">搜索</button><a href="#requirement/${encodeURIComponent("#488")}/page/member-list-488" aria-label="关闭会员详情" title="关闭会员详情">×</a></div></div><div class="member-detail-section-title">会员信息</div><nav class="member-detail-tabs" aria-label="会员详情三级菜单">${tabs}</nav></section>`;
  }

  function member488DetailPage(page, body) {
    return `${member488DetailHeader(page)}<div class="risk-page-heading member-page-heading"><div><h1>${page.name}</h1></div></div>${body}`;
  }

  function member488ListRows() {
    const rows = [
      { account: "member_10086", id: "10886421", site: "旺财体育", realName: "陈小明", gender: "男", birthday: "1992-08-18", status: "正常", vip: "VIP6", referral: "REF8M21K", agent: "agent_087", agentNo: "AG10386", region: "中国 / 上海", phone: "13800138899", attribution: "上海移动", qq: "81521086", wechat: "wx_member86", email: "member10086@mail.test", registerType: "代理" },
      { account: "summer_728", id: "10885137", site: "旺财体育", realName: "林夏", gender: "女", birthday: "1996-03-21", status: "正常", vip: "VIP3", referral: "REF3P18Q", agent: "star_009", agentNo: "AG10218", region: "中国 / 广东", phone: "13699882098", attribution: "广东联通", qq: "—", wechat: "summer728", email: "summer728@mail.test", registerType: "代理" },
      { account: "player_2026", id: "10883229", site: "彩虹站", realName: "佐藤健", gender: "男", birthday: "1989-11-02", status: "禁用", vip: "VIP1", referral: "REF1A09N", agent: "—", agentNo: "—", region: "日本 / 东京", phone: "08099166132", attribution: "Tokyo Mobile", qq: "—", wechat: "—", email: "player2026@mail.test", registerType: "直客" }
    ];
    return rows.map((row, index) => {
      const marker = (id) => index === 0 ? ` annotated" data-component-id="${id}` : "";
      const registerDate = `2026-06-${12 + index} 10:25:00`;
      const loginDate = `2026-07-${19 - index} ${16 - index}:25:36`;
      return `<tr><td class="sticky-member-account"><div class="member-list-stack"><div class="member-account-line"><strong>${row.account}</strong><button type="button" class="member-status-switch ${row.status === "禁用" ? "off" : ""}${marker("B02")}" data-member="${row.account}" data-status="${row.status === "禁用" ? "启用" : "禁用"}" aria-label="${row.status === "禁用" ? "启用" : "禁用"}${row.account}">${index === 0 ? componentBadge("B02") : ""}<span></span>${row.status}</button></div><span><i>会员ID：</i><b>${row.id}</b></span><span><i>所属站点：</i><b>${row.site}</b></span><span><i>真实姓名：</i><b>${row.realName}</b></span><span><i>性别 / 生日：</i><b>${row.gender} / ${row.birthday}</b></span><span><i>会员等级：</i><b>${row.vip}</b></span><span><i>推荐码：</i><b>${row.referral}</b></span></div></td><td><div class="member-list-stack"><span><i>中心钱包：</i><b>${money(15880 - index * 3920)} CNY</b></span><span><i>锁定钱包：</i><b>${money(index * 280)} CNY</b></span><span><i>场馆钱包：</i><b>${money(3600 - index * 670)} CNY</b></span><span><i>最后投注时间：</i><b>2026-07-${18-index} 22:18:36</b></span><span><i>最后存款成功：</i><b>2026-07-${17-index} 09:28:11</b></span></div></td><td><div class="member-list-stack"><span><i>国家 / 地区：</i><b>${row.region}</b></span><span><i>手机号：</i><b>${row.phone}</b></span><span><i>归属地：</i><b>${row.attribution}</b></span><span><i>QQ：</i><b>${row.qq}</b></span><span><i>微信：</i><b>${row.wechat}</b></span><span><i>邮箱：</i><b>${row.email}</b></span></div></td><td><div class="member-list-stack"><span><i>上级代理：</i><b>${row.agent}</b></span><span><i>代理编号：</i><b>${row.agentNo}</b></span><span><i>代理级别：</i><b>${row.agent === "—" ? "—" : "3级 / 1星"}</b></span><span><i>是否代理：</i><b>否</b></span></div></td><td><div class="member-list-stack"><span><i>注册时间：</i><b>${registerDate}</b></span><span><i>注册IP：</i><b>103.21.18.${21 + index}</b></span><span><i>登录时间：</i><b>${loginDate}</b></span><span><i>登录IP：</i><b>103.21.19.${31 + index}</b></span><span><i>注册类型：</i><b>${row.registerType}</b></span><span><i>注册设备：</i><b>${index ? "Android 14" : "iPhone 15 Pro / iOS 18"}</b></span><span><i>注册域名：</i><b>m.example.test</b></span><span><i>设备号：</i><b>DEV-${index + 1}8F31-A920</b></span><button type="button" class="link-action member-login-log${marker("B04")}" data-member="${row.account}">${index === 0 ? componentBadge("B04") : ""}查看登录日志</button></div></td><td><div class="member-empty-reserved${marker("S01")}">${index === 0 ? componentBadge("S01") : ""}<span>标签</span><b>—</b><span>备注</span><b>—</b></div></td><td class="row-actions member-list-actions"><button type="button" class="link-action member-488-detail${marker("B01")}" data-member="${row.account}">${index === 0 ? componentBadge("B01") : ""}详情</button><button type="button" class="link-action member-488-edit${marker("M01")}" data-member="${row.account}">${index === 0 ? componentBadge("M01") : ""}编辑</button><button type="button" class="link-action member-account-action${marker("B03")}" data-action="一键回收" data-member="${row.account}">${index === 0 ? componentBadge("B03") : ""}一键回收</button><button type="button" class="link-action member-account-action" data-action="修改登录密码" data-member="${row.account}">修改登录密码</button><button type="button" class="link-action member-account-action" data-action="重置取款密码" data-member="${row.account}">重置取款密码</button></td></tr>`;
    }).join("");
  }

  function member488ListContent() {
    return `<div class="risk-page-heading"><div><h1>会员列表</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-list-filters"><div class="risk-field site-field"><label>站点</label><input type="text" placeholder="请输入站点" /><div class="site-options" hidden><button type="button">旺财体育</button><button type="button">新旺体育</button></div></div><div class="risk-field member-account-batch"><label>会员账号</label><input type="text" placeholder="多个账号用英文逗号分隔，最多200个" /></div><div class="risk-field"><label>手机号</label><input type="text" placeholder="请输入手机号" /></div><div class="risk-field"><label>邮箱</label><input type="text" placeholder="请输入邮箱" /></div><div class="risk-field"><label>代理账号</label><input type="text" placeholder="请输入代理账号" /></div><div class="risk-field"><label>代理编号</label><input type="text" placeholder="请输入代理编号" /></div><div class="risk-field"><label>状态</label><select><option>全部状态</option><option>正常</option><option>禁用</option></select></div><div class="risk-field"><label>会员等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP3</option><option>VIP6</option></select></div><div class="risk-field"><label>最近登录IP</label><input type="text" placeholder="请输入IP" /></div><div class="risk-field"><label>注册IP</label><input type="text" placeholder="请输入IP" /></div><div class="risk-field"><label>会员标签</label><select><option>全部标签</option><option>高盈利会员</option><option>普通会员</option></select></div>${filterActions(false)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员列表</h2><span>共 12,680 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-list-table"><thead><tr><th class="sticky-member-account">会员信息</th><th>账户信息</th><th>联系信息</th><th>代理信息</th><th>注册登录信息</th><th>标签与备注</th><th>操作</th></tr></thead><tbody>${member488ListRows()}</tbody></table></div>${pagination(20, 12680)}</section>`;
  }

  function member488BasicContent(page) {
    const group = (title, fields) => `<section><h2>${title}</h2><div class="member-info-grid">${fields.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div></section>`;
    const multi = (...values) => `<span class="member-multi-values">${values.map((value) => `<b>${value}</b>`).join("")}</span>`;
    const body = `<div class="member-profile-groups annotated" data-component-id="P01">${componentBadge("P01")}${group("会员信息", [["所属站点","旺财体育"],["账号状态","正常"],["会员等级","VIP6"],["上级代理","agent_087"],["上级代理编号","AG10386"],["会员标签","高盈利会员、重点观察"]])}${group("个人资料", [["真实姓名","陈小明"],["性别","男"],["生日","1992-08-18"],["手机号","13800138899"],["邮箱","member10086@mail.test"],["QQ","81521086"],["微信","wx_member86"]])}${group("注册信息", [["注册时间","2026-06-12 10:25:00"],["最后登录时间","2026-07-19 16:25:36"],["注册IP","103.21.18.21"],["最近登录IP","103.21.19.31"],["注册设备","iPhone 15 Pro / iOS 18"],["最近登录设备","Chrome Mobile / Android 14"],["注册域名","m.example.test"],["最近登录设备号","DEV-8F31-A920"]])}${group("收款信息", [["银行卡信息",multi("招商银行 6225886500011886","中国银行 6217856100266931")],["EB地址",multi("EB-928351","EB-116820")],["支付宝账户",multi("member10086@alipay.test","13800138899")],["微信账户",multi("wx_member86","wx_member_backup")],["数字人民币账户",multi("DCEP-10886421","DCEP-10886421-02")],["USDT地址",multi("TRC20: TQx8bN7VKL3e2Fm9R4Jc6P1sA5dHv2Nc","ERC20: 0x86d94a62b1705e810a468f1d029ec251")]])}</div>`;
    return member488DetailPage(page, body);
  }

  function member488OverviewContent(page) {
    const cards = [
      ["总输赢", "+18,650 CNY"], ["总有效投注", "690,820 CNY"], ["总存款", "168,800 CNY"], ["总提款", "121,300 CNY"],
      ["总存提差", "47,500 CNY"], ["总收入", "28,560 CNY", [["被转账", "12,800 CNY"], ["红包金额", "3,260 CNY"], ["额度增加", "12,500 CNY"]]],
      ["总支出", "9,680 CNY"], ["总红利", "8,620 CNY", [["会员推荐会员奖励", "1,200 CNY"], ["活动奖励", "3,100 CNY"], ["人工发彩金", "1,500 CNY"], ["VIP周礼金", "820 CNY"], ["VIP月礼金", "900 CNY"], ["VIP晋升礼金", "700 CNY"], ["VIP生日礼金", "400 CNY"]]],
      ["总返水", "6,380 CNY"], ["总打赏金额", "1,280 CNY"], ["总打码金额", "712,460 CNY"]
    ];
    return member488DetailPage(page, `<section class="risk-filter-panel"><div class="risk-filter-grid">${member488DateRange("F01", "统计时间")}${filterActions()}</div></section><section class="member-stat-grid annotated" data-component-id="P01">${componentBadge("P01")}${cards.map(([label, value, details], index) => `<article class="${details ? "bonus-hover" : ""}${details && index === 5 ? " annotated" : ""}"${details && index === 5 ? ' data-component-id="C01"' : ""}>${details && index === 5 ? componentBadge("C01") : ""}<span>${label}</span><strong>${value}</strong>${details ? `<div class="bonus-tooltip">${details.map(([name, amount]) => `<span><b>${name}</b><em>${amount}</em></span>`).join("")}</div>` : ""}</article>`).join("")}</section>`);
  }

  function member488WalletContent(page) {
    const wallets = [
      ["中心钱包", "15,880.00 CNY", "正常"], ["锁定钱包", "560.00 CNY", "正常"], ["GOD彩票", "—", "暂未进入该场馆"], ["旺财体育", "3,680.00 CNY", "正常"],
      ["旺财棋牌", "1,820.00 CNY", "正常"], ["旺财彩票", "—", "暂未进入该场馆"], ["旺财电子", "1,260.00 CNY", "正常"], ["旺财真人", "820.50 USDT", "正常"],
      ["PG电子", "580.00 CNY", "正常"], ["PP电子", "—", "暂未进入该场馆"], ["DB哈希", "0 CNY", "维护中"], ["V8棋牌", "—", "暂未进入该场馆"],
      ["DB多宝电子", "0 CNY", "维护中"], ["NetEnt电子", "0 CNY", "维护中"], ["MG电子", "—", "暂未进入该场馆"], ["JDB电子", "—", "暂未进入该场馆"],
      ["DG视讯", "—", "暂未进入该场馆"], ["FC电子", "0 CNY", "维护中"], ["AG真人", "—", "暂未进入该场馆"], ["EVOPLAY电子", "—", "维护中"],
      ["PP真人", "—", "暂未进入该场馆"], ["RED TIGER电子", "0 CNY", "维护中"], ["BBIN真人", "0 CNY", "维护中"], ["SBO体育", "0 CNY", "维护中"],
      ["KV体育", "—", "暂未进入该场馆"], ["旺财电竞", "—", "暂未进入该场馆"], ["VM体育", "0 CNY", "维护中"], ["IM体育", "0 CNY", "维护中"],
      ["DB体育", "—", "暂未进入该场馆"], ["天成彩票", "—", "暂未进入该场馆"], ["PM棋牌", "0 CNY", "维护中"], ["DP棋牌", "—", "暂未进入该场馆"],
      ["PM电竞", "0 CNY", "维护中"], ["DP真人", "0 CNY", "维护中"], ["PM捕鱼", "—", "暂未进入该场馆"], ["VM真人", "0 CNY", "维护中"],
      ["旺财捕鱼", "—", "暂未进入该场馆"], ["PM彩票", "0 CNY", "维护中"]
    ];
    return member488DetailPage(page, `<section class="member-wallet-toolbar annotated" data-component-id="P01">${componentBadge("P01")}<button type="button" class="main-action member-wallet-recycle">一键回收</button><div><span>场馆钱包总计余额</span><strong>10,481.78 CNY</strong><small>全部场馆均为人民币，更新于 2026-07-19 18:28:16</small></div><button type="button" class="secondary-action member-wallet-refresh">↻ 刷新余额</button></section><section class="member-wallet-grid annotated" data-component-id="T01">${componentBadge("T01")}${wallets.map(([name,balance,status])=>`<article><strong>${name}</strong><b>${balance}</b><span class="${status === "正常" ? "is-normal" : ""}">${status}</span></article>`).join("")}</section>`);
  }

  function member488StatisticsContent(page) {
    const venues = [["DW体育","82,680","79,520","186","+6,820"],["SABA体育","51,300","48,900","102","-3,650"],["FB体育","26,880","24,560","68","+1,260"]];
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>场馆名称</label><select><option>全部场馆</option><option>DW体育</option><option>SABA体育</option></select></div>${member488DateRange("F01", "下注时间", false)}${filterActions(true)}</div></section><div class="inner-tabs member-category-tabs annotated" data-component-id="N01">${componentBadge("N01")}${["体育","真人","电子","电竞","棋牌","捕鱼","彩票","哈希"].map((x,i)=>`<button class="${i===0?"active":""}">${x}</button>`).join("")}</div><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>场馆统计</h2><span>总下注 160,860 CNY · 有效投注 152,980 CNY · 总盈亏 +4,430 CNY</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>序号</th><th>场馆名称</th><th>总下注</th><th>有效投注</th><th>注单笔数</th><th>总盈亏（会员视角）</th></tr></thead><tbody>${venues.map((r,i)=>`<tr><td>${i+1}</td><td>${r[0]}</td><td><strong class="amount">${r[1]} CNY</strong></td><td>${r[2]} CNY</td><td>${r[3]}</td><td><strong class="${r[4].startsWith("-")?"amount-negative":"amount"}">${r[4]} CNY</strong></td></tr>`).join("")}</tbody></table></div>${pagination(20,3)}</section>`);
  }

  function member488BetContent(page) {
    const rows = [
      ["BT26071900081","DW体育","体育","英超","让球 -0.5","1,000","980","赢 +860 CNY","已结算","阿森纳 vs 切尔西","亚洲让球","阿森纳","主队 -0.5","1.86"],
      ["BT26071900065","AG真人","真人","百家乐","庄","500","500","输 -500 CNY","已结算","旗舰厅 A12桌","庄闲","庄","庄","1.00"],
      ["BT26071900032","PG电子","电子","麻将胡了","普通投注","200","200","未结算","未结算","麻将胡了","普通投注","基础局","—","—"]
    ];
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-record-filters"><div class="risk-field"><label>注单号</label><input type="text" placeholder="请输入注单号" /></div><div class="risk-field"><label>场馆类型</label><select><option>全部类型</option><option>体育</option><option>真人</option><option>电子</option></select></div><div class="risk-field"><label>场馆名称</label><select><option>全部场馆</option><option>DW体育</option><option>AG真人</option></select></div><div class="risk-field"><label>游戏名称</label><input type="text" placeholder="请输入游戏名称" /></div><div class="risk-field"><label>状态</label><select><option>全部状态</option><option>未结算</option><option>已结算</option><option>已取消</option><option>已作废</option></select></div>${member488DateRange("F01", "下注时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>投注记录</h2><span>共 356 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-bet-table"><thead><tr><th class="sticky-member-seq">序号</th><th class="sticky-member-order with-seq">注单号</th><th>场馆名称</th><th>场馆类型</th><th>游戏名称</th><th>游戏类型</th><th>输赢情况</th><th>下注金额</th><th>有效下注</th><th class="sticky-member-detail">下注详情</th><th>下注时间</th><th>开赛时间</th><th>结算时间</th><th class="sticky-member-status">状态</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="sticky-member-seq">${i+1}</td><td class="sticky-member-order with-seq"><strong class="mono">${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[7]}</td><td>${r[5]} CNY</td><td>${r[6]} CNY</td><td class="sticky-member-detail"><div class="bet-detail-preview${i===0?' annotated" data-component-id="C01':''}" tabindex="0">${i===0?componentBadge("C01"):""}<span>${r[9]}</span><span>${r[10]}</span><span>${r[11]}</span><div class="bet-record-tooltip"><b>完整投注记录</b><span>赛事/游戏：${r[9]}</span><span>玩法：${r[10]}</span><span>下注内容：${r[11]}</span><span>盘口：${r[12]}</span><span>赔率：${r[13]}</span><span>下注金额：${r[5]} CNY</span><span>有效下注：${r[6]} CNY</span><span>输赢情况：${r[7]}</span><span>状态：${r[8]}</span></div></div></td><td>2026-07-19 ${12+i}:20:18</td><td>${i===0?"2026-07-19 15:00:00":"—"}</td><td>${i===2?"—":`2026-07-19 ${14+i}:32:10`}</td><td class="sticky-member-status"><span class="result-tag">${r[8]}</span></td></tr>`).join("")}</tbody></table></div>${pagination(20,356)}</section>`);
  }

  function member488MoneyRecordContent(page, withdrawal = false) {
    const title = withdrawal ? "提款" : "存款";
    const stateOptions = withdrawal ? ["审核中","转账中","拒绝","成功","失败"] : ["确认中","确认失败","确认成功","待支付","用户主动取消"];
    const headers = withdrawal ? ["订单号","订单类型","提现通道","提现金额","到账金额","开户行","银行卡号","币种","汇率","地址","订单时间","风控审核完成时间","风控操作人","风控审核备注","出款完成时间","财务操作人","财务审核备注","状态"] : ["订单号","虚拟币金额","汇率","订单金额","到账金额","上分金额","存款优惠","支付方式","订单时间","确认付款时间","完成时间","状态","取消原因","操作人"];
    const cells = withdrawal ? ["WD2607190086","会员提款","极速出款","5,000","4,980","招商银行","6225 **** 1886","CNY","1.000000","上海市浦东新区","2026-07-19 10:20:18","2026-07-19 10:32:20","mike.risk","正常通过","2026-07-19 11:05:18","mike.finance","已核验","成功"] : ["DP2607190068","—","1.000000","2,000","2,000","2,000","80","支付宝","2026-07-19 09:20:18","2026-07-19 09:21:16","2026-07-19 09:22:08","确认成功","—","mike.finance"];
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-record-filters"><div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入订单号" /></div><div class="risk-field"><label>订单状态</label><select><option>全部状态</option>${stateOptions.map(x=>`<option>${x}</option>`).join("")}</select></div><div class="risk-field"><label>${withdrawal?"订单类型":"支付方式"}</label><select><option>全部类型</option><option>${withdrawal?"会员提款":"支付宝"}</option></select></div>${member488DateRange("F01", "订单时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>${title}信息</h2><span>共 68 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-money-table"><thead><tr><th class="sticky-member-seq">序号</th>${headers.map((h,i)=>`<th class="${i===0?"sticky-member-order with-seq":i===headers.length-1?"sticky-member-status":""}">${h}</th>`).join("")}</tr></thead><tbody>${[0,1,2].map((_,row)=>`<tr><td class="sticky-member-seq">${row+1}</td>${cells.map((c,i)=>`<td class="${i===0?"sticky-member-order with-seq":i===cells.length-1?"sticky-member-status":""}">${i===0?`<strong class="mono">${c.slice(0,-1)}${8-row}</strong>`:i===cells.length-1?`<span class="result-tag">${row===2?stateOptions[1]:c}</span>`:c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${pagination(20,68)}</section>`);
  }

  function member488BonusContent(page) {
    const rows = [["BN2607190018","彩金","周末体育加码","680","场馆钱包","DW体育","3","已发放","2026-07-19 12:00:00","自动"],["BN2607180092","彩金","VIP晋级礼金","388","中心钱包","中心钱包","1","未发放","2026-07-18 09:30:00","手动"]];
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-record-filters"><div class="risk-field"><label>红利类型</label><select><option>全部类型</option><option>彩金</option></select></div><div class="risk-field"><label>发放状态</label><select><option>全部状态</option><option>未发放</option><option>已发放</option></select></div><div class="risk-field"><label>钱包类型</label><select><option>全部钱包</option><option>中心钱包</option><option>场馆钱包</option></select></div><div class="risk-field"><label>钱包名称</label><select><option>全部钱包名称</option><option>DW体育</option></select></div>${member488DateRange("F01", "红利申请时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>红利信息</h2><span>共 28 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-record-table"><thead><tr><th>序号</th><th>订单号</th><th>红利类型</th><th>红利标题</th><th>红利金额</th><th>钱包类型</th><th>钱包名称</th><th>流水倍数</th><th>发放状态</th><th>申请时间</th><th>发放类型</th><th>审核备注</th><th>发放时间</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td>${r.map((c,j)=>`<td>${j===3?`<strong class="amount">${c} CNY</strong>`:j===7?`<span class="result-tag">${c}</span>`:c}</td>`).join("")}<td>${i?"运营审批":"系统任务"}</td><td>${i?"—":"2026-07-19 12:10:18"}</td></tr>`).join("")}</tbody></table></div>${pagination(20,28)}</section>`);
  }

  function member488RebateContent(page) {
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-record-filters"><div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入订单号" /></div><div class="risk-field"><label>返水等级</label><select><option>全部等级</option><option>VIP6</option></select></div><div class="risk-field"><label>返水状态</label><select><option>全部状态</option><option>未领取</option><option>已领取</option><option>已过期</option></select></div>${member488DateRange("", "返水日期", false)}${member488DateRange("", "领取日期", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>返水信息</h2><span>共 16 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>序号</th><th>订单号</th><th>返水等级</th><th>返水金额</th><th>流水倍数</th><th>返水生成时间</th><th>领取时间</th><th>过期时间</th><th>状态</th></tr></thead><tbody>${["已领取","未领取","已过期"].map((s,i)=>`<tr><td>${i+1}</td><td><strong class="mono">RB26071${9-i}008${i}</strong></td><td>VIP6</td><td><strong class="amount">${280-i*60} CNY</strong></td><td>${i+1}</td><td>2026-07-${19-i} 02:00:00</td><td>${i===1?"—":`2026-07-${19-i} 10:18:20`}</td><td>2026-07-${26-i} 23:59:59</td><td><span class="result-tag">${s}</span></td></tr>`).join("")}</tbody></table></div>${pagination(20,16)}</section>`);
  }

  function member488ManualContent(page) {
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>类型</label><select><option>全部</option><option>上分</option><option>下分</option></select></div><div class="risk-field"><label>来源</label><select><option>全部来源</option><option>账户调整</option><option>手动上下分</option></select></div><div class="risk-field"><label>状态</label><select><option>全部状态</option><option>成功</option><option>失败</option></select></div>${member488DateRange("F01", "完成时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>人工上下分记录</h2><span>共 19 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>序号</th><th>订单号</th><th>来源</th><th>类型</th><th>操作金额</th><th>调整钱包</th><th>流水倍数</th><th>原因备注</th><th>完成时间</th><th>操作人</th><th>状态</th></tr></thead><tbody>${[["AD2607190081","账户调整","上分","680","DW体育","3","补发活动彩金","mike.finance","成功"],["MN2607180062","手动上下分","下分","120","中心钱包","0","订单冲正","amy.finance","成功"]].map((r,i)=>`<tr><td>${i+1}</td><td><strong class="mono">${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td><strong class="amount">${r[3]} CNY</strong></td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]}</td><td>2026-07-${19-i} 11:28:16</td><td>${r[7]}</td><td><span class="result-tag">${r[8]}</span></td></tr>`).join("")}</tbody></table></div>${pagination(20,19)}</section>`);
  }

  function member488AdjustmentContent(page) {
    return member488DetailPage(page, `<section class="member-adjustment-form annotated" data-component-id="F01">${componentBadge("F01")}<label class="member-locked-field"><span>会员账号</span><div><input type="text" value="member_10086" disabled /><b>已锁定</b></div></label><label class="member-locked-field"><span>中心钱包余额</span><div><input type="text" value="15,880 CNY" disabled /><button type="button" class="secondary-action member-wallet-refresh" title="刷新中心钱包余额">↻ 刷新</button></div><small>余额在打开页面和提交前均重新校验</small></label><label><span>调整类型</span><select id="member-adjust-type"><option>系统调整</option><option>输赢调整</option></select><small>系统调整不影响代理佣金；输赢调整影响代理佣金</small></label><label><span>调整方向</span><div class="segmented-control"><button type="button" class="active" data-direction="上分">上分</button><button type="button" data-direction="下分">下分</button></div></label><label><span>调整钱包</span><select id="member-adjust-wallet"><option>中心钱包</option><option>DW体育</option><option>AG真人</option></select></label><label><span>流水要求</span><div class="segmented-control"><button type="button" class="active" data-flow="无需流水">无需流水</button><button type="button" data-flow="需要流水">需要流水</button></div></label><label class="member-flow-multiple" hidden><span>流水倍数</span><input type="number" min="0" value="1" /><small>仅允许输入非负数</small></label><label><span>调整金额</span><div class="input-suffix"><input type="number" min="0.01" value="680" /><b>CNY</b></div></label><label><span>原因备注</span><textarea class="member-adjust-note" maxlength="200" placeholder="请输入本次调整原因，必填">补发活动彩金</textarea><small class="member-adjust-count">6/200</small></label><div class="adjustment-submit annotated" data-component-id="B01">${componentBadge("B01")}<button type="button" class="danger-action member-adjust-submit">提交账户调整</button></div></section>`);
  }

  function member488BalanceContent(page) {
    const rows = [["BC2607190088","存款","收入","2,000","13,880","15,880","成功","支付宝存款到账"],["BC2607190072","代理后台代客充值","收入","1,000","14,880","15,880","成功","代理 agent_087 为会员代客充值 1,000元"],["BC2607190069","场馆转入失败","—","0","15,880","15,880","失败","中心钱包转入AG真人失败：网络波动"]];
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>账变类型</label><select><option>全部类型</option><option>存款</option><option>提款</option><option>红利</option><option>返水</option><option>账户调整</option><option>手动上下分</option><option>代理后台代客充值</option><option>场馆转入</option><option>场馆转出</option><option>场馆转入失败</option><option>场馆转出失败</option></select></div>${member488DateRange("F01", "账变时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>账变记录</h2><span>共 286 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>订单号</th><th>账变类型</th><th>收支方向</th><th>账变金额</th><th>账变前金额</th><th>账变后金额</th><th>账变时间</th><th>执行结果</th><th>备注</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td><strong class="mono">${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td><strong class="amount">${r[3]} CNY</strong></td><td><strong class="amount">${r[4]} CNY</strong></td><td><strong class="amount">${r[5]} CNY</strong></td><td>2026-07-19 ${12-i}:20:18</td><td><span class="result-tag ${r[6]==="失败"?"failed":""}">${r[6]}</span></td><td>${r[7]}</td></tr>`).join("")}</tbody></table></div>${pagination(20,286)}</section>`);
  }

  function member488RiskContent(page) {
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid">${member488DateRange("F01", "操作时间", false)}${filterActions()}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>风控记录</h2><span>共 12 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-risk-record-table"><thead><tr><th>操作时间</th><th>记录类型</th><th>变更动作</th><th>变更前</th><th>变更后</th><th>操作原因</th><th>操作人账号</th></tr></thead><tbody><tr><td>2026-07-19 10:28:16</td><td>风控标签</td><td><span class="result-tag">新增</span></td><td>—</td><td>大额提款复核</td><td>会员近期提款金额异常</td><td>mike.risk</td></tr><tr><td>2026-07-18 16:03:22</td><td>风控标签</td><td><span class="result-tag">修改</span></td><td>疑似同设备</td><td>同设备重点观察</td><td>补充关联设备核查结论</td><td>amy.risk</td></tr><tr><td>2026-07-17 09:42:10</td><td>会员黑名单</td><td><span class="result-tag failed">拉黑</span></td><td>正常</td><td>已拉黑</td><td>多次触发异常提款规则</td><td>mike.risk</td></tr><tr><td>2026-07-16 14:18:06</td><td>会员黑名单</td><td><span class="result-tag">解黑</span></td><td>已拉黑</td><td>正常</td><td>复核通过，解除限制</td><td>risk.manager</td></tr></tbody></table></div>${pagination(20,12)}</section>`);
  }

  function member488LogBody(tab) {
    if (tab === "行为日志") return `<section class="risk-filter-panel annotated member-log-panel" data-component-id="F02">${componentBadge("F02")}<div class="risk-filter-grid"><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>IP地址</label><input type="text" placeholder="请输入IP地址" /></div><div class="risk-field"><label>执行结果</label><select><option>全部结果</option><option>成功</option><option>失败</option></select></div>${member488DateRange("F02", "行为时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated member-log-panel" data-component-id="T02">${componentBadge("T02")}<div class="risk-list-heading"><div><h2>行为日志</h2><span>共 2,186 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-behavior-log-table"><thead><tr><th>序号</th><th>日志类型</th><th>操作类型</th><th>会员ID</th><th>会员账号</th><th>站点编码</th><th>IP地址</th><th>地区信息</th><th>浏览器 / App</th><th>操作系统</th><th>设备信息</th><th>执行结果</th><th>消息</th><th>发生时间</th></tr></thead><tbody><tr><td>1</td><td>登录日志</td><td>会员登录</td><td>10886421</td><td>member_10086</td><td>333333</td><td>103.21.19.31</td><td>中国 上海</td><td>Chrome Mobile 149</td><td>Android 14</td><td>Pixel 8 / DEV-8F31-A920</td><td><span class="result-tag">成功</span></td><td>用户登录成功</td><td>2026-07-19 16:25:36</td></tr><tr><td>2</td><td>登录日志</td><td>会员登录</td><td>10885137</td><td>summer_728</td><td>333333</td><td>103.21.19.42</td><td>中国 广东</td><td>iOS App 8.2.1</td><td>iOS 18</td><td>iPhone 15 / DEV-931A-2230</td><td><span class="result-tag failed">失败</span></td><td>登录密码错误</td><td>2026-07-19 14:02:18</td></tr></tbody></table></div>${pagination(20,2186)}</section>`;
    return `<section class="risk-filter-panel annotated member-log-panel" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>操作人</label><input type="text" placeholder="请输入操作人" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>操作来源</label><select><option>全部来源</option><option>会员客户端</option><option>系统</option><option>后台</option></select></div>${member488DateRange("F01", "操作时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated member-log-panel" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员日志</h2><span>共 856 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-log-table"><thead><tr><th>序号</th><th>会员账号</th><th>操作菜单</th><th>操作内容</th><th>修改前</th><th>修改后</th><th>修改备注</th><th>操作人</th><th>操作来源</th><th>操作时间</th></tr></thead><tbody><tr><td>1</td><td>member_10086</td><td>会员信息-会员等级</td><td>设置会员等级</td><td>VIP5</td><td>VIP6</td><td>满足晋级条件</td><td>系统</td><td>系统</td><td>2026-07-19 02:00:00</td></tr><tr><td>2</td><td>summer_728</td><td>会员信息-手机号</td><td>修改手机号</td><td>13699881886</td><td>13699882098</td><td>会员提交客服修改</td><td>mike.cs</td><td>后台</td><td>2026-07-18 14:18:20</td></tr></tbody></table></div>${pagination(20,856)}</section>`;
  }

  function member488LogsContent(page) {
    const active = financeTabState[page.key] || page.tabs[0];
    return `<div class="risk-page-heading"><div><h1>会员日志</h1></div></div><div class="inner-tabs member-log-tabs annotated" data-component-id="N01">${componentBadge("N01")}${page.tabs.map(tab=>`<button type="button" class="${tab===active?"active":""}" data-member-log-tab="${tab}">${tab}</button>`).join("")}</div><div class="member-log-body">${member488LogBody(active)}</div>`;
  }

  function member488Content(page) {
    if (page.key === "member-list-488") return member488ListContent();
    if (page.key === "member-basic-488") return member488BasicContent(page);
    if (page.key === "member-overview-488") return member488OverviewContent(page);
    if (page.key === "member-wallet-488") return member488WalletContent(page);
    if (page.key === "member-statistics-488") return member488StatisticsContent(page);
    if (page.key === "bet-records-488") return member488BetContent(page);
    if (page.key === "deposit-info-488") return member488MoneyRecordContent(page, false);
    if (page.key === "withdrawal-info-488") return member488MoneyRecordContent(page, true);
    if (page.key === "bonus-info-488") return member488BonusContent(page);
    if (page.key === "rebate-info-488") return member488RebateContent(page);
    if (page.key === "manual-adjustments-488") return member488ManualContent(page);
    if (page.key === "account-adjustment-488") return member488AdjustmentContent(page);
    if (page.key === "balance-change-488") return member488BalanceContent(page);
    if (page.key === "risk-record-488") return member488RiskContent(page);
    if (page.key === "member-logs-488") return member488LogsContent(page);
    return "";
  }

  function tabPlaceholderContent(page) {
    return `<div class="risk-page-heading"><div><p>风控管理</p><h1>${page.name}</h1></div></div><div class="inner-tabs annotated" data-component-id="N01">${componentBadge("N01")}${page.tabs.map((tab,index)=>`<button class="${index===0?"active":""}">${tab}</button>`).join("")}</div><section class="reserved-area"><div><strong>保持原功能布局不变即可，本原型只做合并形式展示。</strong></div></section>`;
  }

  function emptyPageContent(page) {
    return `<div class="risk-page-heading"><div><p>风控管理</p><h1>${page.name}</h1></div></div><section class="reserved-area annotated" data-component-id="P01">${componentBadge("P01")}<div><strong>页面暂时留白</strong><span>已保留菜单入口，不在需求未明确前虚构字段和交互。</span></div></section>`;
  }

  function mergedRequirementContent(page) {
    return `<div class="risk-page-heading"><div><h1>${page.name}</h1></div></div><section class="merged-requirement-notice"><span>需求合并</span><strong>此需求已合并到${page.mergedInto}中一起实现。</strong><a href="#requirement/${encodeURIComponent(page.mergedInto)}/page/exception-agent">查看${page.mergedInto}异常代理原型</a></section>`;
  }

  function pageContent(page) {
    if (page.mergedInto) return mergedRequirementContent(page);
    if (page.key.endsWith("-488")) return member488Content(page);
    if (page.unchanged) return unchangedFinanceContent(page);
    if (["deposit-withdraw-settings", "member-transactions", "agent-transactions", "site-transactions"].includes(page.key)) return financeGroupedContent(page);
    if (page.key === "deposit-audit") return financeStandaloneContent(page, depositAuditContent());
    if (page.key === "withdrawal-audit") return financeStandaloneContent(page, withdrawalAuditContent());
    if (page.key === "withdraw-review") return withdrawReviewContent();
    if (page.key === "hold-review") return holdReviewContent();
    if (page.key === "review-history") return historyContent();
    if (page.key === "withdraw-monitor") return monitorContent();
    if (page.key === "member-login-log") return memberLoginContent();
    if (page.key === "transaction-query") return transactionQueryContent();
    if (page.key === "risk-list-library") return riskListLibraryContent(page);
    if (page.key === "exception-agent") return exceptionAgentContent(page);
    if (page.tabs) return tabPlaceholderContent(page);
    return emptyPageContent(page);
  }

  function questionsBlock(page, activeTab = financeTabState[page.key] || page.tabs?.[0]) {
    const questions = page.tabQuestions?.[activeTab] || page.questions || [];
    if (!questions.length) return "";
    return `<section class="questions-block"><div class="questions-title"><span>?</span><div><strong>待确认事项</strong><small>${questions.length} 项</small></div></div><ol>${questions.map((question)=>`<li>${escapeHtml(question)}</li>`).join("")}</ol></section>`;
  }

  function addTopPaginators() {
    document.querySelectorAll(".risk-list-card").forEach((card) => {
      const bottom = card.querySelector(".full-pagination");
      const selectedSize = bottom?.querySelector("select option:checked")?.textContent;
      const tableWrap = card.querySelector(".risk-table-wrap");
      if (selectedSize !== "50条/页" || !tableWrap || card.querySelector(".full-pagination.top-pagination")) return;
      const top = bottom.cloneNode(true);
      top.classList.add("top-pagination");
      const heading = card.querySelector(".risk-list-heading");
      if (heading) heading.appendChild(top); else card.insertBefore(top, tableWrap);
    });
  }

  function applyTableRowLimits(root = document) {
    root.querySelectorAll(".table-wrap, .mock-table-wrap, .risk-table-wrap").forEach((wrap) => {
      const table = wrap.querySelector(":scope > table") || wrap.querySelector("table");
      if (!table) return;
      const rows = Array.from(table.tBodies || []).flatMap((body) => Array.from(body.rows));
      wrap.classList.remove("table-row-limit");
      wrap.style.maxHeight = "";
      wrap.style.overflowY = "hidden";
      if (rows.length <= 10) return;
      const headerHeight = table.tHead?.getBoundingClientRect().height || 0;
      const rowsHeight = rows.slice(0, 10).reduce((height, row) => height + row.getBoundingClientRect().height, 0);
      const horizontalScrollbar = table.scrollWidth > wrap.clientWidth ? 15 : 0;
      wrap.style.maxHeight = `${Math.ceil(headerHeight + rowsHeight + horizontalScrollbar + 1)}px`;
      wrap.style.overflowY = "auto";
      wrap.classList.add("table-row-limit");
    });
  }

  function detailView(requirement, requestedPageKey) {
    const pages = visiblePages(requirement);
    const page = pages.find((item) => item.key === requestedPageKey) || pages[0];
    if (page.key !== requestedPageKey) window.history.replaceState(null, "", `#requirement/${encodeURIComponent(requirement.id)}/page/${page.key}`);
    if (page.key === "member-login-log") loginState.searched = false;
    if (page.key === "transaction-query") transactionState.searched = false;
    const pageLogic = page.logic ? `<section class="logic-note"><span>逻辑说明</span><p>${escapeHtml(page.logic)}</p></section>` : "";
    const extraNotice = page.extraNotice ? `<section class="critical-note"><span>额外功能</span><p>${escapeHtml(page.extraNotice)}</p></section>` : "";
    const currentAnnotations = visibleAnnotations(page);
    const moduleName = requirement.moduleName || "风控管理";
    const adjustmentNotice = requirement.id === "#427" ? '<section class="adjustment-note"><span>调整说明</span><p>未标注的地方均为未修改，保持原页面内容和逻辑即可。</p></section>' : "";
    const memberModuleMode = requirement.id === "#488";
    const memberDetailMode = requirement.id === "#488" && member488DetailPages.some(([key]) => key === page.key);
    app.innerHTML = `<main class="detail-shell"><section class="prototype-pane" aria-label="高保真原型展示区"><header class="prototype-context"><div><span class="prototype-mark">PROTOTYPE</span><strong>${requirement.id}</strong><span>${requirement.title}</span></div><nav aria-label="当前原型页面"><span class="current-page-label">${page.name}</span></nav></header><div class="prototype-canvas"><div class="risk-app${memberModuleMode ? " member-module-mode" : ""}${memberDetailMode ? " member-detail-mode" : ""}">${sidebar(requirement,page)}<section class="risk-main"><header class="risk-topbar"><div><span>${moduleName} /</span><strong>${page.name}</strong></div><div><span class="environment-tag">产品原型</span><strong>Mike</strong></div></header><div class="risk-content">${pageContent(page)}</div></section></div></div></section><aside class="spec-pane" aria-label="说明区"><div class="spec-sticky-header"><a class="back-link" href="#"><span>←</span> 返回需求列表</a><div class="spec-meta-line"><strong>开发说明</strong><span>角色：${page.role}</span><span>页面：${page.id}</span></div><div class="spec-title-row"><div><h2>${page.name}</h2></div><span class="version">V1.0</span></div></div><div class="spec-scroll"><div class="questions-slot">${questionsBlock(page)}</div><section class="page-note"><span>页面目标</span><p>${page.purpose || ""}</p>${page.flow ? `<span>主流程</span><p>${page.flow}</p>` : ""}</section>${pageLogic}${extraNotice}${adjustmentNotice}<div class="spec-section-heading"><h2>组件说明</h2><span>${currentAnnotations.length} 项</span></div><div class="annotation-list">${currentAnnotations.map(annotationCard).join("")}</div></div></aside></main><div id="modal-root"></div>`;
    if (page.key === "withdraw-monitor") renderMonitorView(false);
    if (page.hidePageNote) app.querySelector(".page-note")?.remove();
    addTopPaginators();
    bindComponentLinks();
    bindPageBehavior(page);
    bindDatePickers();
    applyTableRowLimits(app);
  }

  function selectComponent(id, source) {
    app.querySelectorAll("[data-component-id], [data-spec-id]").forEach((element) => element.classList.remove("is-selected"));
    const component = app.querySelector(`[data-component-id="${id}"]`);
    const spec = app.querySelector(`[data-spec-id="${id}"]`);
    component?.classList.add("is-selected"); spec?.classList.add("is-selected");
    (source === "spec" ? component : spec)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function bindComponentLinks() {
    app.querySelectorAll("[data-component-id]").forEach((component) => {
      if (component.dataset.componentLinkBound) return;
      component.dataset.componentLinkBound = "true";
      component.addEventListener("click", (event) => { if (event.target.closest("button,input,select,a") && event.target !== component) return; event.stopPropagation(); selectComponent(component.dataset.componentId, "component"); });
      component.addEventListener("mouseenter", () => app.querySelector(`[data-spec-id="${component.dataset.componentId}"]`)?.classList.add("is-hovered"));
      component.addEventListener("mouseleave", () => app.querySelector(`[data-spec-id="${component.dataset.componentId}"]`)?.classList.remove("is-hovered"));
    });
    app.querySelectorAll("[data-spec-id]").forEach((spec) => {
      if (spec.dataset.specLinkBound) return;
      spec.dataset.specLinkBound = "true";
      const activate = () => selectComponent(spec.dataset.specId, "spec");
      spec.addEventListener("click", activate);
      spec.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
  }

  function modal(title, body, actionText = "确认", customFooter = "") {
    const root = document.getElementById("modal-root");
    const footer = customFooter || (actionText === "关闭" ? `<footer><button class="main-action modal-confirm">关闭</button></footer>` : `<footer><button class="secondary-action modal-cancel">取消</button><button class="main-action modal-confirm">${actionText}</button></footer>`);
    root.innerHTML = `<div class="modal-backdrop"><section class="risk-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">${title}</h2><button class="modal-close" aria-label="关闭">×</button></header><div class="modal-body">${body}</div>${footer}</section></div>`;
    root.querySelectorAll(".modal-close,.modal-cancel,.modal-confirm,.withdraw-modal-cancel").forEach((button)=>button.addEventListener("click",()=>{root.innerHTML="";}));
    bindComponentLinks();
    applyTableRowLimits(root);
  }

  function bindDatePickers() {
    document.querySelectorAll("[data-date-trigger]").forEach((trigger) => {
      if (trigger.dataset.dateBound) return;
      trigger.dataset.dateBound = "true";
      trigger.addEventListener("click", () => {
        const field = trigger.closest(".date-range-field");
        const popover = field.querySelector(".date-picker-popover");
        const opening = popover.hidden;
        popover.hidden = !popover.hidden;
        if (!opening) return;
        popover.classList.remove("align-left", "align-right");
        popover.style.left = "";
        popover.style.right = "";
        const contentRect = trigger.closest(".risk-content").getBoundingClientRect();
        const paneRect = trigger.closest(".prototype-pane").getBoundingClientRect();
        const visibleLeft = Math.max(contentRect.left, paneRect.left);
        const visibleRight = Math.min(contentRect.right, paneRect.right);
        const fieldRect = field.getBoundingClientRect();
        const minOffset = visibleLeft - fieldRect.left;
        const maxOffset = visibleRight - fieldRect.left - popover.offsetWidth;
        const clampedOffset = Math.max(minOffset, Math.min(0, maxOffset));
        popover.style.left = `${Math.round(clampedOffset)}px`;
        popover.style.right = "auto";
      });
    });
    document.querySelectorAll(".date-close").forEach((button) => { if (button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { button.closest(".date-picker-popover").hidden = true; }); });
    document.querySelectorAll(".calendar-panel").forEach((panel) => panel.querySelectorAll(".calendar-day").forEach((day) => { if (day.dataset.dateBound) return; day.dataset.dateBound = "true"; day.addEventListener("click", () => { panel.querySelectorAll(".calendar-day").forEach((item) => item.classList.remove("selected")); day.classList.add("selected"); }); }));
    document.querySelectorAll(".date-apply").forEach((button) => { if (button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { const popover = button.closest(".date-picker-popover"); const panels = Array.from(popover.querySelectorAll(".calendar-panel")); const values = panels.length ? panels.map((panel) => { const day = String(panel.querySelector(".calendar-day.selected")?.textContent || "12").padStart(2, "0"); const time = panel.querySelector("input[type='time']").value; return `2026-07-${day} ${time}`; }) : Array.from(popover.querySelectorAll("input[type='datetime-local']")).map((input) => { const value = input.value.replace("T", " "); return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value) ? `${value}:00` : value; }); const range = popover.parentElement.querySelector(".risk-range"); if (values.length >= 2) range.innerHTML = `<span>${values[0]}</span><b>至</b><span>${values[1]}</span>`; popover.hidden = true; }); });
    document.querySelectorAll(".quick-ranges button").forEach((button) => { if (button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { const range = button.closest(".date-range-field").querySelector(".risk-range"); range.classList.add("range-selected"); }); });
  }

  function normalizeGlobalFilterFields(root = document) {
    root.querySelectorAll(".risk-filter-panel").forEach((panel) => {
      Array.from(panel.querySelectorAll(".risk-field")).forEach((field) => {
        const label = field.querySelector(":scope > label")?.textContent.trim();
        if (!["所属站点", "站点", "站点名称"].includes(label) || field.classList.contains("site-multi-field")) return;
        const classNames = Array.from(field.classList).filter((name) => !["risk-field", "site-field", "unchanged-production"].includes(name));
        classNames.push("global-filter-changed");
        field.insertAdjacentHTML("beforebegin", siteMultiSelect("所属站点", classNames.join(" ")));
        field.remove();
      });
      const fields = Array.from(panel.querySelectorAll(".risk-field"));
      const findField = (labels) => fields.find((field) => labels.includes(field.querySelector(":scope > label")?.textContent.trim()));
      const accountField = findField(["代理账号", "上级代理"]);
      const numberField = findField(["代理编号", "上级代理编号"]);
      if (!accountField && !numberField) return;
      const anchor = accountField || numberField;
      const upperAgent = [accountField, numberField].some((field) => field?.querySelector(":scope > label")?.textContent.includes("上级"));
      const classNames = Array.from(anchor.classList).filter((name) => !["risk-field", "unchanged-production"].includes(name));
      classNames.push("global-filter-changed");
      anchor.insertAdjacentHTML("beforebegin", agentSmartField(classNames.join(" "), upperAgent ? "上级代理账号/编号" : "代理账号/编号"));
      accountField?.remove();
      if (numberField !== accountField) numberField?.remove();
    });
  }

  function bindSiteAutocomplete() {
    normalizeGlobalFilterFields();
    document.querySelectorAll(".site-field").forEach((field) => { const input = field.querySelector("input"); const options = field.querySelector(".site-options"); const items = Array.from(options.querySelectorAll("button")); const show = () => { const query = input.value.trim(); items.forEach((item) => { item.hidden = Boolean(query) && !item.textContent.includes(query); }); options.hidden = false; }; input.addEventListener("focus", show); input.addEventListener("input", show); items.forEach((item) => item.addEventListener("click", () => { input.value = item.textContent; options.hidden = true; })); input.addEventListener("blur", () => window.setTimeout(() => { options.hidden = true; input.value = input.value.trim(); }, 150)); });
    document.querySelectorAll(".site-multi-field").forEach((field) => {
      if (field.dataset.siteMultiBound) return;
      field.dataset.siteMultiBound = "true";
      const trigger = field.querySelector(".site-multi-trigger");
      const options = field.querySelector(".site-multi-options");
      const all = field.querySelector("[data-site-all]");
      const choices = Array.from(options.querySelectorAll('input[type="checkbox"]:not([data-site-all])'));
      const sync = () => {
        const selected = choices.filter((choice) => choice.checked);
        all.checked = selected.length === choices.length;
        all.indeterminate = selected.length > 0 && selected.length < choices.length;
        field.querySelector(".site-multi-value").textContent = selected.length === choices.length ? "全部站点" : selected.length ? selected.map((choice) => choice.value).join("、") : "请选择站点";
      };
      trigger.addEventListener("click", () => { const opening = options.hidden; document.querySelectorAll(".site-multi-options").forEach((panel) => { panel.hidden = true; }); options.hidden = !opening; trigger.setAttribute("aria-expanded", String(opening)); });
      all.addEventListener("change", () => { choices.forEach((choice) => { choice.checked = all.checked; }); sync(); });
      choices.forEach((choice) => choice.addEventListener("change", sync));
      field.closest(".risk-filter-panel")?.querySelectorAll(".reset-action,.exception-agent-reset,.backup-flow-reset").forEach((button) => button.addEventListener("click", () => { choices.forEach((choice) => { choice.checked = true; }); sync(); options.hidden = true; }));
      sync();
    });
    document.querySelectorAll(".agent-smart-field").forEach((field) => {
      if (field.dataset.agentSmartBound) return;
      field.dataset.agentSmartBound = "true";
      const input = field.querySelector("input");
      const options = field.querySelector(".agent-smart-options");
      const items = Array.from(options.querySelectorAll("button"));
      const show = () => { const query = input.value.trim().toLowerCase(); items.forEach((item) => { item.hidden = Boolean(query) && !`${item.dataset.agentAccount} ${item.dataset.agentNumber}`.toLowerCase().includes(query); }); options.hidden = false; };
      input.addEventListener("focus", show);
      input.addEventListener("input", () => { delete input.dataset.agentAccount; delete input.dataset.agentNumber; show(); });
      items.forEach((item) => item.addEventListener("click", () => { input.value = `${item.dataset.agentAccount} / ${item.dataset.agentNumber}`; input.dataset.agentAccount = item.dataset.agentAccount; input.dataset.agentNumber = item.dataset.agentNumber; options.hidden = true; }));
      input.addEventListener("blur", () => window.setTimeout(() => { options.hidden = true; input.value = input.value.trim(); }, 150));
    });
    if (!document.body.dataset.siteMultiOutsideBound) {
      document.body.dataset.siteMultiOutsideBound = "true";
      document.addEventListener("click", (event) => { if (!event.target.closest(".site-multi-field")) document.querySelectorAll(".site-multi-options").forEach((panel) => { panel.hidden = true; }); });
    }
  }

  function relatedMembersBody(kind, value) {
    const rows = ["dengji000", "evan888", "mike_test"].map((member, index) => `<tr><td><strong>${member}</strong></td><td>${agentCell()}</td><td>VIP${6 + index}</td><td>${index === 1 ? "45.122.68.19" : "103.27.14.86"}</td><td><span class="data-tag">${riskTags[index]}</span></td><td><span class="result-tag ${index === 2 ? "rejected" : "approved"}">${index === 2 ? "已停用" : "正常"}</span></td></tr>`).join("");
    return `<div class="relation-modal-content annotated" data-component-id="M01">${componentBadge("M01")}<div class="relation-query"><span>${kind}</span><strong>${value}</strong></div><div class="risk-table-wrap"><table class="risk-table relation-table"><thead><tr><th>会员账号</th><th>上级代理</th><th>会员等级</th><th>登录IP</th><th>风控标签</th><th>账号状态</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(20)}</div>`;
  }

  function blacklistAccountsBody(value) {
    const rows = ["dengji000", "evan888", "mike_test"].map((member, index) => `<tr><td><div class="stack-cell"><strong>${member}</strong><span>VIP${6 + index}</span></div></td><td>${agentCell()}</td><td><span class="data-tag">${riskTags[index]}</span></td><td><span class="result-tag ${index === 2 ? "rejected" : "approved"}">${index === 2 ? "已停用" : "正常"}</span></td></tr>`).join("");
    return `<div class="relation-query"><span>关联对象</span><strong>${escapeHtml(value)}</strong></div><div class="risk-table-wrap"><table class="risk-table blacklist-relation-table"><thead><tr><th>会员信息</th><th>上级代理</th><th>风控标签</th><th>账号状态</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(20, 3)}`;
  }

  function blacklistIpsBody(value) {
    const rows = [["103.27.14.86", "已拉黑"], ["45.122.68.19", "正常"], ["2001:db8:85a3::8a2e:370:7334", "正常"]].map((row) => `<tr><td><strong class="mono">${row[0]}</strong></td><td><span class="result-tag ${row[1] === "已拉黑" ? "rejected" : "approved"}">${row[1]}</span></td></tr>`).join("");
    return `<div class="relation-query"><span>关联设备</span><strong>${escapeHtml(value)}</strong></div><div class="risk-table-wrap"><table class="risk-table blacklist-relation-table"><thead><tr><th>IP地址</th><th>IP状态</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(20, 3)}`;
  }

  function bindBlacklistBehavior() {
    const view = document.getElementById("blacklist-view");
    if (!view) return;
    const bindViewActions = () => {
      bindComponentLinks();
      document.querySelectorAll("#blacklist-view input[type='text']").forEach((input) => input.addEventListener("blur", () => { input.value = input.value.trim(); }));
      document.querySelectorAll("#blacklist-view .reset-action").forEach((button) => button.addEventListener("click", () => { const panel = button.closest(".risk-filter-panel"); panel.querySelectorAll("input").forEach((input) => { input.value = ""; }); panel.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; }); }));
      document.querySelectorAll(".blacklist-relation").forEach((button) => button.addEventListener("click", () => { const isIp = button.dataset.relation === "ip"; modal(isIp ? "关联IP列表" : "关联账号列表", isIp ? blacklistIpsBody(button.dataset.value) : blacklistAccountsBody(button.dataset.value), "关闭"); }));
      document.querySelectorAll(".blacklist-remove").forEach((button) => button.addEventListener("click", () => modal(`移除${button.dataset.kind}黑名单`, `<p class="danger-confirm">您现在操作的是<strong>【移除】</strong></p><p>确认将 ${escapeHtml(button.dataset.value)} 移出${button.dataset.kind}黑名单？移除后该对象不再受此黑名单规则限制。</p>`, "确认移除")));
      applyTableRowLimits(view);
    };
    document.querySelectorAll(".blacklist-tab").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll(".blacklist-tab").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      view.innerHTML = blacklistView(button.dataset.blacklistType);
      bindViewActions();
    }));
    bindViewActions();
  }

  function financeSettingModalBody() {
    return `<div class="config-form finance-channel-form"><label>存款类型<select><option>支付宝</option><option>USDT</option><option>NEXUS</option></select></label><label>存款币种<select><option>人民币</option><option>USDT</option></select></label><label>上游服务商<input type="text" value="HiPay" /></label><label>支付区间<input type="text" value="1-10000" /></label><label>状态<select><option>启用</option><option>停用</option></select></label></div>`;
  }

  function withdrawalAuditModalBody(accountType = "会员", account = "testhd021") {
    const memberOnly = accountType === "会员";
    return `<div class="withdraw-audit-modal"><section class="withdraw-member-summary unchanged-production"><div><span class="data-tag">${accountType}</span><em class="data-tag tag-amber">${memberOnly ? "VIP6" : "—"}</em><p><span>账号名称：</span><strong>${account}</strong></p><small>注册日期：${memberOnly ? "2026-05-01 14:38:50" : "—"}</small></div><div class="withdraw-risk-box"><span>风控标签</span><p>${memberOnly ? '未加风控标签 <button type="button" class="link-action">+添加</button>' : "—"}</p></div></section><section class="withdraw-amount-grid annotated changed-amount-scope" data-component-id="M01">${componentBadge("M01")}<div class="unchanged-amount-item"><span>取款类型</span><strong>USDT提币</strong></div><div class="unchanged-amount-item"><span>人民币金额</span><strong>68.00</strong></div><div><span>取款金额</span><strong>10.00 <small>U</small></strong></div><div><span>实际到账</span><strong>9.50 <small>U</small></strong></div><div><span>手续费</span><strong>3.40 <small>U</small></strong></div><div class="unchanged-amount-item"><span>资金池</span><strong class="pool-amount">1977728.41</strong></div></section><label class="modal-field unchanged-production"><span>添加审核备注 <small>（选填）</small></span><textarea placeholder="请输入详细的审核备注信息"></textarea></label></div>`;
  }

  function withdrawalAuditModalFooter() {
    return `<footer class="withdraw-modal-footer"><button type="button" class="secondary-action withdraw-modal-cancel">取消</button><div><button type="button" class="freeze-action withdraw-review-action" data-result="冻结">冻结</button><button type="button" class="danger-action withdraw-review-action" data-result="拒绝">拒绝</button><button type="button" class="approve-action withdraw-review-action" data-result="通过">通过</button></div></footer>`;
  }

  function renderBlockedDepositView(view = blockedDepositViewState) {
    blockedDepositViewState = view;
    document.querySelectorAll(".blocked-view-tab").forEach((button) => button.classList.toggle("active", button.dataset.blockedView === view));
    const container = document.querySelector(".blocked-deposit-view");
    if (container) container.innerHTML = blockedDepositView(view);
    bindBlockedDepositActions();
    bindComponentLinks();
    applyTableRowLimits(container || document);
  }

  function openManualUnlock(member) {
    const user = blockedDepositUsers.find((item) => item.member === member);
    if (!user) return;
    openUnlockConfirm([user]);
  }

  function openUnlockConfirm(users) {
    const batch = users.length > 1;
    const summary = batch ? `<div class="unlock-batch-members">${users.map((user) => `<span>${user.member}</span>`).join("")}</div>` : `<div class="unlock-summary"><span>会员账号</span><strong>${users[0].member}</strong><span>连续未成功</span><strong>${users[0].count} 笔 / ${users[0].amounts}</strong></div>`;
    modal(batch ? `批量解锁确认（${users.length}人）` : "人工解锁确认", `<div class="manual-unlock-modal"><p class="danger-confirm">您现在操作的是<strong>【${batch ? "批量解锁" : "人工解锁"}】</strong></p>${summary}<label class="modal-field"><span>解锁原因 <small>（必填）</small></span><textarea class="unlock-reason" placeholder="请输入人工解锁原因"></textarea></label><p class="unlock-consequence">确认后每位会员的连续未成功笔数和金额清零，并分别生成一条人工解锁记录。</p></div>`, batch ? "确认批量解锁" : "确认解锁");
    const reason = document.querySelector(".unlock-reason");
    const confirm = document.querySelector(".modal-confirm");
    if (confirm) confirm.disabled = true;
    reason?.addEventListener("input", () => { if (confirm) confirm.disabled = !reason.value.trim(); });
    confirm?.addEventListener("click", () => {
      const value = reason?.value.trim();
      if (!value) return;
      users.forEach((user) => blockedDepositUnlockLogs.unshift({ member: user.member, site: user.site, count: user.count, amounts: user.amounts, reason: value, operator: "mike.finance", unlockedAt: "2026-07-17 17:42:00", result: "解锁成功" }));
      const members = new Set(users.map((user) => user.member));
      blockedDepositUsers = blockedDepositUsers.filter((item) => !members.has(item.member));
      users.forEach((user) => blockedDepositSelection.delete(user.member));
      renderBlockedDepositView("current");
    }, { capture: true });
  }

  function bindBlockedDepositActions() {
    document.querySelectorAll(".blocked-view-tab").forEach((button) => { if (button.dataset.blockedBound) return; button.dataset.blockedBound = "true"; button.addEventListener("click", () => renderBlockedDepositView(button.dataset.blockedView)); });
    document.querySelectorAll(".manual-unlock-action").forEach((button) => { if (button.dataset.blockedBound) return; button.dataset.blockedBound = "true"; button.addEventListener("click", () => openManualUnlock(button.dataset.member)); });
    document.querySelectorAll(".failed-count-detail").forEach((button) => { if (button.dataset.blockedBound) return; button.dataset.blockedBound = "true"; button.addEventListener("click", () => openFailedDepositDetails(button.dataset.member)); });
    document.querySelectorAll(".blocked-row-check").forEach((checkbox) => checkbox.addEventListener("change", () => { checkbox.checked ? blockedDepositSelection.add(checkbox.dataset.member) : blockedDepositSelection.delete(checkbox.dataset.member); renderBlockedDepositView("current"); }));
    document.querySelector(".blocked-check-all")?.addEventListener("change", (event) => { blockedDepositSelection.clear(); if (event.currentTarget.checked) blockedDepositUsers.forEach((user) => blockedDepositSelection.add(user.member)); renderBlockedDepositView("current"); });
    document.querySelector(".batch-unlock-action")?.addEventListener("click", () => openUnlockConfirm(blockedDepositUsers.filter((user) => blockedDepositSelection.has(user.member))));
    document.querySelectorAll(".blocked-deposit-view .member-detail-link").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
  }

  function bindFinanceBodyActions(page) {
    bindSiteAutocomplete();
    document.querySelectorAll(".finance-tab-body .reset-action").forEach((button) => button.addEventListener("click", () => { const panel = button.closest(".risk-filter-panel"); panel?.querySelectorAll("input[type='text']").forEach((input) => { input.value = ""; }); panel?.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; }); }));
    document.querySelector(".finance-limit-save")?.addEventListener("click", () => { const input = document.querySelector(".failure-limit-control input"); const value = Number(input?.value); if (!Number.isInteger(value) || value < 0) { modal("配置错误", "<p>连续笔数仅允许输入大于或等于0的整数。</p>", "关闭"); return; } modal("配置已更新", `<p>连续未成功充值订单限制已设置为 <strong>${value}</strong> 笔。${value === 0 ? "当前不启用限制。" : ""}</p>`, "关闭"); });
    document.querySelector(".auto-unlock-save")?.addEventListener("click", () => { const input = document.querySelector(".auto-unlock-hours"); const value = Number(input?.value); if (!Number.isInteger(value) || value < 0) { modal("配置错误", "<p>自动解锁时长仅允许输入大于或等于0的整数。</p>", "关闭"); return; } autoUnlockHours = value; modal("设置已保存", `<p>${value === 0 ? "自动解锁已关闭。" : `会员进入禁止存款状态 <strong>${value}</strong> 小时后自动解锁。`}</p>`, "关闭"); });
    document.querySelector(".finance-add-setting")?.addEventListener("click", () => modal("新增存款设置", financeSettingModalBody(), "保存"));
    document.querySelectorAll(".finance-edit-setting,.finance-edit-selected").forEach((button) => button.addEventListener("click", () => modal("修改存款设置", financeSettingModalBody(), "保存")));
    document.querySelectorAll(".finance-delete-setting,.finance-delete-selected").forEach((button) => button.addEventListener("click", () => modal("删除存款设置", '<p class="danger-confirm">您现在操作的是<strong>【删除】</strong></p><p>确认删除所选存款通道设置？</p>', "确认删除")));
    document.querySelectorAll(".finance-withdraw-audit").forEach((button) => button.addEventListener("click", () => { modal(`取款审核 - ${button.dataset.order}`, withdrawalAuditModalBody(button.dataset.accountType, button.dataset.account), "", withdrawalAuditModalFooter()); document.querySelectorAll(".withdraw-review-action").forEach((action) => action.addEventListener("click", () => modal(`${action.dataset.result}确认`, `<p class="danger-confirm">您现在操作的是<strong>【${action.dataset.result}】</strong></p><p>确认后将更新该取款订单状态。</p>`, `确认${action.dataset.result}`))); }));
    bindBlockedDepositActions();
    document.querySelectorAll(".finance-tab-body .member-detail-link").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
    bindComponentLinks();
    bindDatePickers();
    addTopPaginators();
    applyTableRowLimits(document.querySelector(".finance-tab-body") || document);
  }

  function renderFinanceTab(page, tabName) {
    financeTabState[page.key] = tabName;
    document.querySelectorAll(".finance-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.financeTab === tabName));
    const body = document.querySelector(".finance-tab-body");
    if (!body) return;
    body.innerHTML = financeTabBody(page, tabName);
    syncFinanceTabSpec(page, tabName);
    const annotations = visibleAnnotations(page, tabName);
    const annotationList = document.querySelector(".annotation-list");
    if (annotationList) annotationList.innerHTML = annotations.map(annotationCard).join("");
    const annotationCount = document.querySelector(".spec-section-heading span");
    if (annotationCount) annotationCount.textContent = `${annotations.length} 项`;
    const questionsSlot = document.querySelector(".questions-slot");
    if (questionsSlot) questionsSlot.innerHTML = questionsBlock(page, tabName);
    bindFinanceBodyActions(page);
  }

  function syncFinanceTabSpec(page, tabName) {
    const specScroll = document.querySelector(".spec-scroll");
    const heading = specScroll?.querySelector(".spec-section-heading");
    if (!specScroll || !heading) return;
    if (["agent-transactions", "site-transactions"].includes(page.key)) {
      specScroll.querySelector(".page-note")?.remove();
      specScroll.querySelector(".adjustment-note")?.remove();
      specScroll.querySelector(".record-withdraw-logic")?.remove();
      const subject = page.key === "agent-transactions" ? "代理" : "站点";
      const target = document.createElement("section");
      target.className = "page-note";
      target.innerHTML = `<span>页面目标</span><p>独立展示${subject}${tabName.includes("取款") ? "取款" : "存款"}记录及对应查询、汇总信息。</p>`;
      heading.insertAdjacentElement("beforebegin", target);
      if (tabName.includes("取款")) {
        const logic = document.createElement("section");
        logic.className = "record-withdraw-logic";
        logic.innerHTML = `<span>逻辑说明</span><p>${subject}取款无需经过风控审核。</p>`;
        target.insertAdjacentElement("beforebegin", logic);
      }
      return;
    }
    if (page.key !== "deposit-withdraw-settings") return;
    specScroll.querySelector(".page-note")?.remove();
    if (tabName === "禁止存款用户") {
      specScroll.querySelector(".adjustment-note")?.remove();
      const target = document.createElement("section");
      target.className = "page-note";
      target.innerHTML = "<span>页面目标</span><p>被禁止充值的用户列表展示和操作。</p>";
      heading.insertAdjacentElement("beforebegin", target);
      return;
    }
    if (!specScroll.querySelector(".adjustment-note")) {
      heading.insertAdjacentHTML("beforebegin", '<section class="adjustment-note"><span>调整说明</span><p>未标注的地方均为未修改，保持原页面内容和逻辑即可。</p></section>');
    }
  }

  function bindFinanceBehavior(page) {
    if (!document.querySelector(".finance-tab-body")) {
      if (["deposit-audit", "withdrawal-audit"].includes(page.key)) bindFinanceBodyActions(page);
      return;
    }
    syncFinanceTabSpec(page, financeTabState[page.key] || page.tabs[0]);
    document.querySelectorAll(".finance-tab").forEach((tab) => tab.addEventListener("click", () => renderFinanceTab(page, tab.dataset.financeTab)));
    bindFinanceBodyActions(page);
  }

  function bindExceptionAgentBodyActions(page) {
    const panel = document.querySelector(".exception-agent-filter");
    panel?.querySelector(".exception-agent-search")?.addEventListener("click", () => {
      panel.querySelectorAll("input[type='text']").forEach((input) => { input.value = input.value.trim(); });
    });
    panel?.querySelector(".exception-agent-reset")?.addEventListener("click", () => {
      panel.querySelectorAll("input[type='text']").forEach((input) => { input.value = ""; });
      panel.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; });
    });
    panel?.querySelector(".exception-agent-export")?.addEventListener("click", () => {
      modal("导出异常代理", "<p>将导出当前筛选条件命中的全部异常代理，不限制当前页。</p>", "确认导出");
    });
    document.querySelector(".exception-rule-config-action")?.addEventListener("click", () => {
      modal("异常规则配置", exceptionAgentRuleConfigBody(), "保存配置");
      const root = document.getElementById("modal-root");
      const originalSave = root.querySelector(".modal-confirm");
      const save = originalSave?.cloneNode(true);
      if (originalSave && save) originalSave.replaceWith(save);
      save?.addEventListener("click", () => {
        const config = root.querySelector(".exception-rule-config");
        const error = config?.querySelector(".exception-rule-validation");
        const enabledRows = Array.from(config?.querySelectorAll(".exception-rule-row") || []).filter((row) => row.querySelector("input[type='checkbox']")?.checked);
        let message = "";
        if (!enabledRows.length) message = "至少开启一条异常检测规则。";
        for (const row of enabledRows) {
          const inputs = Array.from(row.querySelectorAll("input[type='number']"));
          const ruleName = row.querySelector("strong")?.textContent || "已开启规则";
          if (inputs.some((input) => input.value === "")) { message = `${ruleName}的阈值必须填写完整。`; break; }
          if (inputs.some((input) => !input.validity.valid)) { message = `${ruleName}存在超出范围或格式不正确的数值。`; break; }
          if (ruleName === "规则2" && Number(inputs[0].value) > Number(inputs[1].value)) { message = "规则2的最低金额不得高于最高金额。"; break; }
        }
        if (message) {
          if (error) { error.textContent = message; error.hidden = false; }
          return;
        }
        root.innerHTML = "";
        modal("配置保存成功", "<p>异常代理规则已保存，将从下一次每日检测脚本执行时生效。</p>", "关闭");
      });
      bindComponentLinks();
    });
    bindSiteAutocomplete();
    bindDatePickers();
    bindComponentLinks();
    addTopPaginators();
    applyTableRowLimits(document.querySelector(".exception-agent-tab-body") || document);
  }

  function bindExceptionAgentBehavior(page) {
    if (page.key !== "exception-agent") return;
    bindExceptionAgentBodyActions(page);
  }

  function renderLoginResultsView() {
    const container = document.getElementById("login-results");
    if (!container) return;
    container.innerHTML = loginResults();
    const demoToggle = document.getElementById("spec-login-data-toggle");
    if (demoToggle) demoToggle.checked = loginState.searched;
    const heading = container.closest(".risk-list-card")?.querySelector(".risk-list-heading > div");
    heading?.querySelector("span")?.remove();
    if (loginState.searched) heading?.insertAdjacentHTML("beforeend", "<span>共 20 条</span>");
    const table = container.querySelector(".login-log-table");
    if (!table) { bindComponentLinks(); return; }
    const rowChecks = Array.from(table.querySelectorAll("tbody input[type='checkbox']"));
    const allCheck = table.querySelector("thead input[type='checkbox']");
    const deviceButton = document.querySelector(".login-batch-device");
    const ipButton = document.querySelector(".login-batch-ip");
    const selectedCount = () => rowChecks.filter((checkbox) => checkbox.checked).length;
    const syncBatchState = () => { const disabled = selectedCount() === 0; if (deviceButton) deviceButton.disabled = disabled; if (ipButton) ipButton.disabled = disabled; if (allCheck) allCheck.checked = rowChecks.length > 0 && rowChecks.every((checkbox) => checkbox.checked); };
    rowChecks.forEach((checkbox) => checkbox.addEventListener("change", syncBatchState));
    allCheck?.addEventListener("change", () => { rowChecks.forEach((checkbox) => { checkbox.checked = allCheck.checked; }); syncBatchState(); });
    document.querySelectorAll(".relation-action").forEach((button) => button.addEventListener("click", () => modal(`${button.dataset.relationKind}关联会员`, relatedMembersBody(button.dataset.relationKind, button.dataset.relationValue), "关闭")));
    document.querySelectorAll(".domain-detail").forEach((button) => button.addEventListener("click", () => modal("完整登录域名", `<div class="full-domain-value">${escapeHtml(button.dataset.domain)}</div>`, "关闭")));
    document.querySelectorAll(".login-member-link").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); selectComponent("B05", "component"); }));
    document.querySelectorAll(".login-sort-header").forEach((button) => button.addEventListener("click", () => { const key = button.dataset.sortKey; loginState.sortDirection = loginState.sortKey === key ? loginState.sortDirection * -1 : 1; loginState.sortKey = key; renderLoginResultsView(); }));
    addTopPaginators();
    bindComponentLinks();
    applyTableRowLimits(container);
  }

  function bindLoginLogBehavior() {
    if (!document.getElementById("login-results")) return;
    const regionSelects = document.querySelector(".region-selects");
    if (regionSelects && !regionSelects.querySelector('[aria-label="国家"]')) regionSelects.insertAdjacentHTML("afterbegin", '<select aria-label="国家"><option>全部国家</option><option>中国</option><option>菲律宾</option><option>新加坡</option></select>');
    const exportButton = document.querySelector(".export-action");
    if (exportButton) { exportButton.classList.add("annotated"); exportButton.dataset.componentId = "B04"; exportButton.insertAdjacentHTML("afterbegin", componentBadge("B04")); }
    const deviceButton = document.querySelector(".login-batch-device");
    const ipButton = document.querySelector(".login-batch-ip");
    const selectedCount = () => document.querySelectorAll(".login-log-table tbody input[type='checkbox']:checked").length;
    deviceButton?.addEventListener("click", () => modal("批量拉黑设备确认", `<p class="danger-confirm">本次选中<strong>${selectedCount()}条登录日志</strong></p><p>确认后将对应设备写入风控名单库-设备黑名单。</p>`, "确认拉黑"));
    ipButton?.addEventListener("click", () => modal("批量拉黑IP确认", `<p class="danger-confirm">本次选中<strong>${selectedCount()}条登录日志</strong></p><p>确认后将对应IP写入风控名单库-IP黑名单。</p>`, "确认拉黑"));
    document.querySelector(".login-dedup-action")?.addEventListener("click", () => {
      modal("数据去重", `<fieldset class="dedup-options"><legend>选择去重维度（可多选）</legend><label><input type="checkbox" value="member" ${loginState.dedupKeys.includes("member") ? "checked" : ""} />会员账号</label><label><input type="checkbox" value="device" ${loginState.dedupKeys.includes("device") ? "checked" : ""} />设备号</label><label><input type="checkbox" value="loginIp" ${loginState.dedupKeys.includes("loginIp") ? "checked" : ""} />登录IP</label><label><input type="checkbox" value="registerIp" ${loginState.dedupKeys.includes("registerIp") ? "checked" : ""} />注册IP</label></fieldset>`, "确认去重");
      const root = document.getElementById("modal-root");
      root.querySelector(".modal-confirm")?.addEventListener("click", () => { loginState.dedupKeys = Array.from(root.querySelectorAll(".dedup-options input:checked")).map((input) => input.value); if (loginState.dedupKeys.length) { loginState.sortKey = loginState.dedupKeys[0]; loginState.sortDirection = 1; } loginState.searched = true; renderLoginResultsView(); }, true);
    });
    exportButton?.addEventListener("click", () => modal("导出登录日志", "<p>支持导出Excel或CSV格式，导出当前筛选条件下的全部登录日志，不限当前页。</p>", "确认导出"));
    const ipInput = document.querySelector(".ip-filter-field input");
    const ipError = document.querySelector(".ip-filter-field .field-error");
    const validateIp = () => { const value = ipInput.value.trim(); const valid = !value || value.split(".").length === 4 && value.split(".").every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255); ipInput.classList.toggle("is-invalid", !valid); ipError.hidden = valid; return valid; };
    ipInput?.addEventListener("blur", validateIp);
    document.querySelector(".login-filter-action")?.addEventListener("click", (event) => { if (!validateIp()) { event.preventDefault(); ipInput.focus(); return; } loginState.searched = true; renderLoginResultsView(); });
    renderLoginResultsView();
  }

  function syncMember488LogSpec(page, tab) {
    const annotations = visibleAnnotations(page, tab);
    const list = document.querySelector(".annotation-list");
    const count = document.querySelector(".spec-section-heading span");
    if (list) list.innerHTML = annotations.map(annotationCard).join("");
    if (count) count.textContent = `${annotations.length} 项`;
    bindComponentLinks();
  }

  function member488EditModal(member) {
    modal(`编辑会员信息 - ${member}`, `<div class="member-edit-form"><label class="member-region-edit">国家/地区<div><select><option>中国</option><option>日本</option></select><select><option>上海市</option><option>广东省</option></select><select><option>浦东新区</option><option>黄浦区</option></select></div></label><label>手机号<input type="text" value="13800138899" /></label><label>邮箱<input type="email" value="member10086@mail.test" /></label><label>会员生日<input type="date" value="1992-08-18" /></label><label>真实姓名<input type="text" value="陈小明" /></label><label>性别<div class="radio-row"><span><input type="radio" name="member-gender" checked /> 男</span><span><input type="radio" name="member-gender" /> 女</span></div></label><label class="member-edit-note">修改备注<textarea placeholder="请输入修改原因，必填"></textarea></label><button type="button" class="secondary-action member-edit-history">查看修改历史</button></div>`, "保存修改");
    document.querySelector(".member-edit-history")?.addEventListener("click", () => modal(`修改历史 - ${member}`, `<div class="risk-table-wrap"><table class="risk-table member-history-table"><thead><tr><th>修改字段</th><th>修改前</th><th>修改后</th><th>修改时间</th><th>修改备注</th><th>修改人</th></tr></thead><tbody><tr><td>手机号</td><td>13800136621</td><td>13800138899</td><td>2026-07-16 10:28:16</td><td>会员提交客服修改</td><td>mike.cs</td></tr><tr><td>会员生日</td><td>1992-08-08</td><td>1992-08-18</td><td>2026-07-10 11:09:22</td><td>资料校正</td><td>amy.cs</td></tr></tbody></table></div>${pagination(20,2)}`, "关闭"));
  }

  function member488BetModal(order) {
    modal(`下注详情 - ${order}`, `<div class="bet-detail-grid"><div><span>会员账号</span><strong>member_10086</strong></div><div><span>场馆</span><strong>DW体育</strong></div><div><span>赛事</span><strong>英格兰超级联赛</strong></div><div><span>对阵</span><strong>阿森纳 vs 切尔西</strong></div><div><span>玩法</span><strong>亚洲让球</strong></div><div><span>盘口</span><strong>主队 -0.5</strong></div><div><span>赔率</span><strong>1.86</strong></div><div><span>下注内容</span><strong>阿森纳</strong></div><div><span>下注金额</span><strong>1,000 CNY</strong></div><div><span>有效下注</span><strong>980 CNY</strong></div><div><span>输赢情况</span><strong>全赢 +860 CNY</strong></div><div><span>状态</span><strong>已结算</strong></div></div>`, "关闭");
  }

  function bindMember488Behavior(page) {
    if (!page.key.endsWith("-488")) return;
    document.querySelectorAll(".risk-filter-actions [data-component-id='B01']").forEach((button) => { button.removeAttribute("data-component-id"); button.classList.remove("annotated"); button.querySelector(".component-badge")?.remove(); });
    document.querySelectorAll(".member-488-detail").forEach((button) => button.addEventListener("click", () => { window.location.hash = `requirement/${encodeURIComponent("#488")}/page/member-basic-488`; }));
    document.querySelectorAll(".member-488-edit").forEach((button) => button.addEventListener("click", () => member488EditModal(button.dataset.member)));
    document.querySelectorAll(".member-status-switch").forEach((button) => button.addEventListener("click", () => modal(`${button.dataset.status}会员`, `<p class="danger-confirm">您现在操作的是<strong>【${button.dataset.status}】</strong></p><label class="modal-field">操作原因<textarea placeholder="请输入原因，必填"></textarea></label><p class="member-pending-note">该操作的业务影响范围沿用生产现有逻辑。</p>`, `确认${button.dataset.status}`)));
    document.querySelectorAll(".member-account-action").forEach((button) => button.addEventListener("click", () => modal(`${button.dataset.action} - ${button.dataset.member}`, `<p>确认对会员 <strong>${button.dataset.member}</strong> 执行【${button.dataset.action}】？</p>${button.dataset.action === "重置取款密码" ? '<p class="member-pending-note">重置后由前端用户自行重新设置取款密码。</p>' : ""}`, "确认执行")));
    document.querySelectorAll(".member-login-log").forEach((button) => button.addEventListener("click", () => { window.location.hash = `requirement/${encodeURIComponent("#406")}/page/member-login-log`; }));
    document.querySelector(".member-search-action")?.addEventListener("click", () => modal("切换会员", "<p>已按输入的会员账号加载对应会员详情；未找到时保留当前会员并提示无匹配结果。</p>", "关闭"));
    document.querySelector(".member-wallet-recycle")?.addEventListener("click", () => modal("一键回收场馆余额", "<p>确认将当前会员可回收的场馆余额统一转回中心钱包？维护中或回收失败的场馆需返回具体结果。</p>", "确认回收"));
    document.querySelectorAll(".member-wallet-refresh").forEach((button) => button.addEventListener("click", () => { const originalText = button.textContent; button.textContent = "刷新中…"; window.setTimeout(() => { button.textContent = originalText; }, 600); }));
    document.querySelectorAll(".segmented-control button").forEach((button) => button.addEventListener("click", () => {
      const group = button.parentElement;
      group.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (button.dataset.flow) document.querySelector(".member-flow-multiple")?.toggleAttribute("hidden", button.dataset.flow !== "需要流水");
      if (button.dataset.direction) {
        const wallet = document.getElementById("member-adjust-wallet");
        if (button.dataset.direction === "下分") { wallet.value = "中心钱包"; Array.from(wallet.options).forEach((option) => { option.disabled = option.value !== "中心钱包"; }); }
        else Array.from(wallet.options).forEach((option) => { option.disabled = false; });
      }
    }));
    document.querySelector(".member-adjust-submit")?.addEventListener("click", () => modal("账户调整确认", `<p class="danger-confirm">确认给会员 <strong>member_10086</strong> 上分 <strong>680 CNY</strong>？</p><p>调整钱包：DW体育；流水倍数：3倍；原因：补发活动彩金。</p>`, "确认提交"));
    document.querySelector(".member-adjust-note")?.addEventListener("input", (event) => { const count = document.querySelector(".member-adjust-count"); if (count) count.textContent = `${event.target.value.length}/200`; });
    document.querySelectorAll("[data-member-log-tab]").forEach((button) => button.addEventListener("click", () => {
      const tab = button.dataset.memberLogTab;
      financeTabState[page.key] = tab;
      document.querySelectorAll("[data-member-log-tab]").forEach((item) => item.classList.toggle("active", item === button));
      const body = document.querySelector(".member-log-body");
      if (body) body.innerHTML = member488LogBody(tab);
      body?.querySelectorAll(".risk-filter-actions [data-component-id='B01']").forEach((filterButton) => { filterButton.removeAttribute("data-component-id"); filterButton.classList.remove("annotated"); filterButton.querySelector(".component-badge")?.remove(); });
      syncMember488LogSpec(page, tab);
      bindDatePickers();
      bindSiteAutocomplete();
      bindComponentLinks();
      applyTableRowLimits(body || document);
    }));
  }

  function bindPageBehavior(page) {
    document.querySelectorAll("input[type='text']").forEach((input)=>input.addEventListener("blur",()=>{input.value=input.value.trim();}));
    const toggle = document.getElementById("spec-claim-toggle");
    toggle?.addEventListener("change",()=>{document.getElementById("claim-list-content").hidden=!toggle.checked;document.getElementById("claim-empty").hidden=toggle.checked;});
    const reviewToggle = document.getElementById("spec-review-toggle");
    reviewToggle?.addEventListener("change",()=>{document.getElementById("review-list-content").hidden=!reviewToggle.checked;document.getElementById("review-empty").hidden=reviewToggle.checked;});
    document.getElementById("spec-login-data-toggle")?.addEventListener("change", (event) => { loginState.searched = event.target.checked; renderLoginResultsView(); });
    const setTransactionState = (visible) => { transactionState.searched = visible; const demoToggle = document.getElementById("spec-transaction-data-toggle"); if (demoToggle) demoToggle.checked = visible; document.querySelector(".transaction-empty")?.toggleAttribute("hidden", visible); document.querySelector(".transaction-results")?.toggleAttribute("hidden", !visible); document.querySelector(".transaction-count")?.toggleAttribute("hidden", !visible); if (visible) { addTopPaginators(); applyTableRowLimits(app); } };
    document.getElementById("spec-transaction-data-toggle")?.addEventListener("change", (event) => setTransactionState(event.target.checked));
    document.querySelector(".collapse-button")?.addEventListener("click",(event)=>{const content=document.getElementById("claim-list-content");content.hidden=!content.hidden;event.currentTarget.textContent=content.hidden?"展开列表":"收起列表";});
    document.querySelectorAll(".claim-action").forEach((button)=>button.addEventListener("click",()=>modal("领取提款申请",'<p>领取后该订单将锁定到当前风控账号，其他风控人员不可再领取。</p>',"确认领取")));
    document.querySelectorAll(".pass-action").forEach((button)=>button.addEventListener("click",()=>modal("通过确认",'<p class="danger-confirm">您现在操作的是<strong>【通过】</strong></p><p>确认后，该提款申请将正式进入财务取款审核列表。</p>',"确认通过")));
    document.querySelectorAll(".reject-action").forEach((button)=>button.addEventListener("click",()=>modal("拒绝提款申请",'<label class="modal-field">拒绝理由<textarea placeholder="请输入拒绝理由，必填"></textarea></label>',"确认拒绝")));
    document.querySelectorAll(".hold-action").forEach((button)=>button.addEventListener("click",()=>modal("挂起提款申请",`<div class="hold-form"><label class="modal-field">挂起原因<select>${riskTags.map(tag=>`<option>${tag}</option>`).join("")}</select></label><label class="modal-field">风控备注<textarea placeholder="请输入风控备注"></textarea></label></div>`,"确认挂起")));
    document.querySelectorAll(".ignore-action").forEach((button)=>button.addEventListener("click",()=>modal("忽略确认",'<p class="danger-confirm">您现在操作的是<strong>【忽略】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工忽略。</p>',"确认忽略")));
    document.querySelectorAll(".finish-action").forEach((button)=>button.addEventListener("click",()=>modal("完结确认",'<p class="danger-confirm">您现在操作的是<strong>【完结】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工完结。</p>',"确认完结")));
    document.querySelector(".config-action")?.addEventListener("click",()=>openConfigModal());
    document.querySelectorAll(".inner-tabs:not(:has(.monitor-tab)):not(:has(.blacklist-tab)):not(:has(.exception-agent-tab)) button").forEach((button)=>button.addEventListener("click",()=>{button.parentElement.querySelectorAll("button").forEach(item=>item.classList.remove("active"));button.classList.add("active");}));
    bindSiteAutocomplete();
    bindLoginLogBehavior();
    bindBlacklistBehavior();
    bindFinanceBehavior(page);
    bindExceptionAgentBehavior(page);
    bindMember488Behavior(page);
    document.querySelectorAll(".member-detail-link").forEach((link) => link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = { "withdraw-review": "B04", "hold-review": "B03", "review-history": "B01" }[page.key];
      if (targetId) selectComponent(targetId, "component");
    }));
    document.querySelector(".transaction-search")?.addEventListener("click", () => {
      setTransactionState(true);
    });
    document.querySelectorAll(".balance-detail").forEach((button) => button.addEventListener("click", () => modal("充值提现流水明细", transactionRechargeFlowModalBody(button), "关闭")));
    document.querySelectorAll(".venue-flow-detail").forEach((button) => button.addEventListener("click", () => modal("场馆提现流水明细", venueFlowModalBody(button.dataset.member, button.dataset.site), "关闭")));
    document.querySelectorAll(".recharge-flow-detail").forEach((button) => button.addEventListener("click", () => modal("充值提现流水明细", rechargeFlowModalBody(button.dataset.member, button.dataset.site), "关闭")));
    document.querySelectorAll(".unified-venue-flow-detail").forEach((button) => button.addEventListener("click", () => modal("场馆剩余流水明细", venueFlowModalBody(button.dataset.member, button.dataset.site, true), "关闭")));
    document.querySelectorAll(".unified-source-flow-detail").forEach((button) => button.addEventListener("click", () => modal("充值/活动剩余流水明细", unifiedSourceFlowModalBody(button.dataset.member, button.dataset.site), "关闭")));
    document.querySelector(".backup-flow-reset")?.addEventListener("click", () => { const panel = document.querySelector(".backup-flow-filters"); panel?.querySelectorAll("input").forEach((input) => { input.value = ""; }); panel?.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; }); });
    document.querySelector(".backup-flow-search")?.addEventListener("click", () => document.querySelectorAll(".backup-flow-filters input").forEach((input) => { input.value = input.value.trim(); }));
    document.querySelector(".backup-flow-export")?.addEventListener("click", () => modal("导出流水统计", "<p>将按当前筛选条件导出会员打码流水统计数据。</p>", "确认导出"));
    document.querySelector(".unified-flow-search")?.addEventListener("click", () => document.querySelectorAll(".unified-flow-filters input[type='text']").forEach((input) => { input.value = input.value.trim(); }));
    document.querySelector(".unified-flow-export")?.addEventListener("click", () => modal("导出会员流水总览", "<p>按当前筛选条件导出会员流水总览；导出范围与当前账号可查询的数据权限一致。</p>", "确认导出"));
    document.querySelectorAll(".reset-action").forEach((button) => button.addEventListener("click", () => { const panel = button.closest(".risk-filter-panel"); panel?.querySelectorAll("input[type='text']").forEach((input) => { input.value = ""; input.classList.remove("is-invalid"); }); panel?.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; }); panel?.querySelectorAll(".field-error").forEach((error) => { error.hidden = true; }); }));
  }

  function openConfigModal() {
    modal("流水审核配置",'<div class="config-form"><label>停留时长大于<div><input type="number" min="1" value="10" /><span>分钟</span></div></label><label>刷新次数大于<div><input type="number" min="1" value="3" /><span>次</span></div></label><label class="config-switch-label">状态<div class="config-switch"><input type="checkbox" checked /><span class="switch-track"></span><b>启用</b></div></label></div>',"保存配置");
    document.querySelector(".config-switch input")?.addEventListener("change",(event)=>{event.target.closest(".config-switch").querySelector("b").textContent=event.target.checked?"启用":"停用";});
  }

  function renderMonitorView(history) {
    const view = document.getElementById("monitor-view");
    if (!view) return;
    view.innerHTML = monitorView(history);
    document.querySelectorAll(".monitor-tab").forEach((tab)=>tab.classList.toggle("active",tab.dataset.monitorTab===(history?"history":"pending")));
    bindComponentLinks();
    document.querySelectorAll(".monitor-tab").forEach((tab)=>tab.addEventListener("click",()=>renderMonitorView(tab.dataset.monitorTab==="history")));
    document.querySelector(".config-action")?.addEventListener("click",openConfigModal);
    document.querySelectorAll(".ignore-action").forEach((button)=>button.addEventListener("click",()=>modal("拒绝确认",'<p class="danger-confirm">您现在操作的是<strong>【拒绝】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工拒绝。</p>',"确认拒绝")));
    document.querySelectorAll(".finish-action").forEach((button)=>button.addEventListener("click",()=>modal("完结确认",'<p class="danger-confirm">您现在操作的是<strong>【完结】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工完结。</p>',"确认完结")));
    document.querySelectorAll(".monitor-table .member-detail-link").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); selectComponent("B03", "component"); }));
    document.querySelectorAll(".redetect-action").forEach((button)=>button.addEventListener("click",()=>{button.disabled=true;button.textContent="检测中";window.setTimeout(()=>{button.disabled=false;button.textContent="重新检测";},700);}));
    document.getElementById("auto-ignore")?.addEventListener("change", (event) => {
      view.querySelectorAll(".ignore-action, .finish-action").forEach((button) => { button.hidden = event.target.checked; });
    });
    const selected = () => Array.from(document.querySelectorAll(".monitor-table tbody input[type='checkbox']")).filter((input) => input.checked).length;
    const batch = document.querySelector(".monitor-toolbar .secondary-action[data-component-id='B01']");
    document.querySelectorAll(".monitor-table tbody input[type='checkbox']").forEach((checkbox)=>checkbox.addEventListener("change",()=>{if(batch) batch.disabled=selected()===0;}));
    batch?.addEventListener("click",()=>{const count=selected();if(count) modal("批量拒绝确认",`<p class="danger-confirm">本次将对<strong>${count}条记录进行拒绝操作</strong></p><p>确认后记录进入审核历史，审核记录标记为人工拒绝。</p>`,"确认拒绝");});
    document.querySelector(".config-switch input")?.addEventListener("change",(event)=>{event.target.closest(".config-switch").querySelector("b").textContent=event.target.checked?"启用":"停用";});
    bindDatePickers();
    bindSiteAutocomplete();
    applyTableRowLimits(view);
  }

  function render() {
    const match = window.location.hash.match(/^#requirement\/([^/]+)(?:\/page\/([^/]+))?$/);
    if (!match) { listView(); document.title = "产品需求原型库"; return; }
    const requirement = visibleRequirements().find((item) => item.id === decodeURIComponent(match[1]));
    if (!requirement) { window.location.hash = ""; return; }
    detailView(requirement, match[2] || visiblePages(requirement)[0].key);
    document.title = `${requirement.title} · 产品需求原型库`;
  }

  window.addEventListener("hashchange", render);
  render();
})();
