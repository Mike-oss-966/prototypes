(function () {
  const app = document.getElementById("app");
  const requirements = window.PROTOTYPE_DATA.requirements;
  const localTools = window.PROTOTYPE_DATA.localTools || [];
  const isLocalPrototype = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const siteOptions = ["XY体育", "拉布布", "WC体育", "CS体育", "YY体育", "NS体育", "DW体育"];
  const rebateVenueCatalog = Array.isArray(window.PROTOTYPE_VENUE_GAMES) ? window.PROTOTYPE_VENUE_GAMES : [];
  const bonusTypeOptions = ["VIP晋升礼金", "VIP周礼金", "VIP月礼金", "VIP生日礼金", "签到奖励", "推广首充奖励", "推广存款奖励", "推广投注返佣", "活动任务奖励", "指定会员红包", "活动彩金", "新人首充彩金", "余额宝利息"];
  const memberCustomTagOptions = [
    { name: "世界杯高活跃", type: "运营标签", description: "世界杯活动期间高活跃会员", count: "2,816", operator: "mike.ops", updatedAt: "2026-07-23 16:18:20" },
    { name: "线下补充核验", type: "风控标签", description: "需补充线下身份或资金核验", count: "93", operator: "amy.risk", updatedAt: "2026-07-22 11:30:08" },
    { name: "大额存款关注", type: "财务标签", description: "近30天单笔存款超过配置阈值", count: "218", operator: "mike.finance", updatedAt: "2026-07-21 14:42:16" }
  ];
  const memberSystemTagOptions = [
    { name: "不返水", type: "系统标签", description: "跑返水脚本时，此用户不进行任何返水。", count: "1,286", operator: "system", updatedAt: "2026-07-23 09:10:00" },
    { name: "提款挂起", type: "系统标签", description: "此用户提款时直接进入挂起审核，无需初审。", count: "318", operator: "system", updatedAt: "2026-07-23 09:10:00" }
  ];
  const memberTagAssignments = {
    member_10086: { custom: ["世界杯高活跃"], system: ["不返水"], remark: "重点维护，近期存款活跃" },
    summer_728: { custom: ["线下补充核验"], system: ["提款挂起"], remark: "提款需重点复核" },
    player_2026: { custom: ["大额存款关注"], system: [], remark: "关注账户恢复情况" }
  };
  const riskTags = ["高盈利会员", "职业玩家", "对冲套利风险", "羊毛党用户", "多账号关联", "异常投注用户"];
  const loginRecords = Array.from({ length: 20 }, (_, index) => ({
    id: `LOGIN20260712${String(index + 1).padStart(4, "0")}`,
    member: ["dengji000", "evan888", "mike_test", "dengji000", "risk_user88"][index % 5],
    vip: `VIP${(index % 8) + 1}`,
    site: siteOptions[index % siteOptions.length],
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
  const agent498SubViewState = {};
  let agent498ProfileTab = "基本资料";
  let agent498ProfileUnlocked = false;
  const agent498UnlockedBalances = new Set();
  const agent498WithdrawAccounts = [
    { currency: "USDT", protocol: "TRC20", account: "TJ8••••••r2K" },
    { currency: "EB", protocol: "—", account: "EB••••966" }
  ];
  let agent498Identity = "TEAM_LEADER_MULTI";
  let agent498ShowHidden = false;
  let agent498TeamIdentity = "NORMAL";
  const agent498CommonPageKeys = [
    "agent-dashboard-498", "agent-members-498", "agent-deposits-498", "agent-bonuses-498",
    "agent-games-498", "agent-active-members-498", "agent-withdrawal-498",
    "agent-deposit-service-498", "agent-balance-recharge-498", "agent-financial-report-498",
    "agent-commission-report-498", "agent-wallet-ledger-498", "agent-profile-498",
    "agent-overflow-498", "agent-notices-498", "agent-downloads-498"
  ];
  const agent498IdentityConfig = {
    STAR: { label: "星级代理", account: "star_agent", description: "看板不统计下级代理，且不可新增下级代理。", pages: ["agent-list-498", "agent-correction-report-498", "agent-reversal-repayment-498", "agent-activity-management-498", "agent-venue-fee-detail-498"] },
    MULTI_LEVEL: { label: "多层级代理", account: "multi_agent", description: "可管理下级代理，并查看冲正、回款、活动和场馆费用。", pages: ["agent-list-498", "agent-correction-report-498", "agent-reversal-repayment-498", "agent-activity-management-498", "agent-venue-fee-detail-498"] },
    TEAM_LEADER_MULTI: { label: "团队负责人（多线）", account: "agent_mike", description: "可查看团队汇总、团队代理列表、团队冲正和场馆费用。", pages: ["agent-team-498", "agent-list-498", "agent-transfer-498", "agent-negative-profit-report-498", "agent-correction-report-498", "agent-venue-fee-detail-498"] },
    TEAM_LEADER_SINGLE: { label: "团队负责人（单线）", account: "single_leader", description: "具备团队负责人权限，但团队代理列表仅展示负责人本人。", pages: ["agent-team-498", "agent-list-498", "agent-transfer-498", "agent-negative-profit-report-498", "agent-correction-report-498", "agent-venue-fee-detail-498"] },
    TEAM_SUBLINE: { label: "团队副线", account: "subline_a", description: "只查看个人经营数据及自身负盈利贡献，不可查看团队管理功能。", pages: ["agent-negative-profit-report-498"] }
  };
  const exportExcelRules = [
    "导出表格的字段、顺序和字段含义必须与后台当前数据表逐列对应，不得遗漏、合并或省略",
    "导出结果不得出现无业务含义的空白行",
    "数量、金额、比例等数字必须以Excel数值格式写入单元格，禁止导出为带单位或无法直接求和的文本；单位统一放在表头"
  ];
  let blockedDepositViewState = "current";
  const blockedDepositSelection = new Set();
  let autoUnlockHours = 24;
  let currentRequirementId = "";
  let currentPageKey = "";
  let memberVipSelectedLevel = 0;
  let memberVipDetailTab = "VIP福利";
  let memberVipDepositProgressVisible = true;
  let skipRiskWithdrawReview = false;
  let memberProfileSaved = false;
  let memberVipConfigSite = "总控默认配置";
  const memberVipIndependentSites = new Set(["WC体育", "XY体育"]);
  const profitSimulatorDefaults = {
    view: "journey",
    journeyStep: 0,
    journeyScenario: "direct",
    journeyValidBet: 222.22,
    journeyRebateRate: 4.5,
    journeyMemberWallet: 100,
    journeySiteRate: 60,
    journeyAgentARate: 20,
    journeyParentRate: 30,
    mode: "legacy-multi",
    resultSign: 1,
    platformResult: 100000,
    operatingExpense: 12000,
    siteRate: 60,
    agentARate: 20,
    agentBRate: 30,
    agentCRate: 40,
    agentAWallet: 8000,
    agentBWallet: 12000,
    agentCWallet: 18000,
    legacyDebt: 0,
    newActiveCount: 5,
    activeMemberCount: 18,
    historicalWinLoss: 0,
    historicalExpense: 0,
    historicalCommission: 0,
    historicalDebt: 0,
    previousLevel: 1,
    teamLeaderWallet: 20000,
    treatment: "GRANT",
    reducedGrant: 10000
  };
  const profitSimulatorState = { ...profitSimulatorDefaults };

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
    { site: "旺财体育", number: "AG20318", account: "north_star", parentAgent: "main_agent", parentNumber: "AG10001", type: "多层级代理", status: "正常", subordinateCount: 42, activeCount: 7, abnormalCount: 5, notes: ["规则1 → 线下有效会员数", "规则4 → 返水≤X元", "规则6 → 近3个月使用相同IP", "规则7 → 近3个月使用相同设备号"], detectedAt: "2026-07-20 00:18:36", rules: ["规则1", "规则4", "规则6", "规则7"] },
    { site: "新旺体育", number: "AG10872", account: "river_88", parentAgent: "star_center", parentNumber: "AG10027", type: "星级代理", status: "正常", subordinateCount: 68, activeCount: 11, abnormalCount: 8, notes: ["规则2 → 任意一笔充值订单金额区间", "规则7 → 近3个月使用相同设备号"], detectedAt: "2026-07-20 00:18:36", rules: ["规则2", "规则7"] },
    { site: "彩虹站", number: "AG30651", account: "bright_team", parentAgent: "rainbow_top", parentNumber: "AG30002", type: "多层级代理", status: "停用", subordinateCount: 19, activeCount: 4, abnormalCount: 3, notes: ["规则3 → 【总有效流水/总存款】≤百分比", "规则8 → 近3个月使用相同虚拟币地址"], detectedAt: "2026-07-20 00:18:36", rules: ["规则3", "规则8"] },
    { site: "旺财体育", number: "AG20196", account: "summer_line", parentAgent: "main_agent", parentNumber: "AG10001", type: "星级代理", status: "正常", subordinateCount: 27, activeCount: 5, abnormalCount: 4, notes: ["规则4 → 返水≤X元", "规则5 → 首存后X天内未登录过"], detectedAt: "2026-07-20 00:18:36", rules: ["规则4", "规则5"] }
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
        <td><div class="requirement-title-line">${item.mergedInto ? `<span class="merge-target-badge">合并至 ${escapeHtml(item.mergedInto)}</span>` : ""}<strong class="requirement-title">${escapeHtml(item.title)}</strong></div><span class="requirement-summary">${escapeHtml(item.summary)}</span></td>
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
        ${isLocalPrototype && localTools.length ? `<section class="local-tools-section"><div class="section-heading"><div><h2>本地工具</h2><p>独立辅助工具，不属于任何需求</p></div></div><div class="local-tools-grid">${localTools.map((tool) => `<button type="button" class="local-tool-card" data-local-tool="${escapeHtml(tool.id)}"><span class="local-only-badge">仅本地可见</span><strong>${escapeHtml(tool.title)}</strong><p>${escapeHtml(tool.summary)}</p><i aria-hidden="true">→</i></button>`).join("")}</div></section>` : ""}
      </main>`;

    const latestUpdate = requirements.map((item) => item.updatedAt).filter(Boolean).sort().at(-1) || "—";
    app.querySelector(".last-sync").textContent = `最后更新 ${latestUpdate}`;

    app.querySelectorAll(".requirement-row").forEach((row) => {
      const open = () => { window.location.hash = `requirement/${encodeURIComponent(row.dataset.requirementId)}`; };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
    });
    app.querySelectorAll("[data-local-tool]").forEach((button) => button.addEventListener("click", () => {
      window.location.hash = `tool/${encodeURIComponent(button.dataset.localTool)}`;
    }));
    applyTableRowLimits(app);
  }

  function localToolView(tool) {
    const page = tool.page;
    currentRequirementId = "";
    currentPageKey = page.key;
    const annotations = page.annotations || [];
    app.innerHTML = `<main class="detail-shell"><section class="prototype-pane" aria-label="本地工具展示区"><header class="prototype-context"><div><span class="prototype-mark">LOCAL TOOL</span><strong>仅本地可见</strong><span>${escapeHtml(tool.title)}</span></div><nav aria-label="当前工具"><span class="current-page-label">${escapeHtml(page.name)}</span></nav></header><div class="prototype-canvas profit-simulator-canvas"><div class="profit-simulator-stage">${profitSimulatorContent()}</div></div></section><aside class="spec-pane" aria-label="说明区"><div class="spec-sticky-header"><a class="back-link" href="#"><span>←</span> 返回需求列表</a><div class="spec-meta-line"><strong>工具说明</strong><span>仅用于本地业务推演</span></div><div class="spec-title-row"><div><h2>${escapeHtml(tool.title)}</h2></div><span class="version">LOCAL</span></div></div><div class="spec-scroll"><section class="scope-spec-note"><span>工具边界</span><p>本工具独立于产品需求，不属于代理后台或总控后台生产功能。</p></section><div class="spec-section-heading"><h2>组件说明</h2><span>${annotations.length} 项</span></div><div class="annotation-list">${annotations.map(annotationCard).join("")}</div></div></aside></main><div id="modal-root"></div>`;
    bindComponentLinks();
    bindProfitSimulatorBehavior(page);
  }

  function annotationCard(annotation) {
    let demoControls = "";
    if (annotation.name === "列表状态切换") demoControls = `<div class="spec-demo-controls"><label><input type="checkbox" checked id="spec-claim-toggle" /><span>展示待领取数据</span></label><label><input type="checkbox" checked id="spec-review-toggle" /><span>展示待审核数据</span></label></div>`;
    if (annotation.name === "登录日志列表状态") demoControls = `<div class="spec-demo-controls"><label><input type="checkbox" ${loginState.searched ? "checked" : ""} id="spec-login-data-toggle" /><span>展示有数据状态</span></label></div>`;
    if (annotation.name === "流水列表状态") demoControls = `<div class="spec-demo-controls"><label><input type="checkbox" ${transactionState.searched ? "checked" : ""} id="spec-transaction-data-toggle" /><span>展示有数据状态</span></label></div>`;
    if (annotation.name === "晋升存款进度") demoControls = `<div class="spec-view-switch" aria-label="晋升存款进度演示"><span>晋升存款进度演示</span><div><button type="button" class="${memberVipDepositProgressVisible ? "active" : ""}" data-deposit-progress="show">显示</button><button type="button" class="${memberVipDepositProgressVisible ? "" : "active"}" data-deposit-progress="hide">隐藏</button></div><small>隐藏代表后台将当前VIP晋升存款配置为0，仅用于原型评审</small></div>`;
    if (annotation.name === "个人资料填写状态") demoControls = `<div class="spec-view-switch" aria-label="个人资料状态演示"><span>原型状态演示</span><div><button type="button" class="${memberProfileSaved ? "" : "active"}" data-profile-state="editing">首次填写</button><button type="button" class="${memberProfileSaved ? "active" : ""}" data-profile-state="saved">已保存只读</button></div><small>仅用于原型评审，不属于会员端生产功能</small></div>`;
    let summaryText = escapeHtml(annotation.summary);
    annotation.summaryHighlights?.forEach((term) => { summaryText = summaryText.replaceAll(escapeHtml(term), `<strong class="summary-danger">${escapeHtml(term)}</strong>`); });
    const summary = annotation.summary ? `<p class="annotation-summary${annotation.summaryTone === "danger" ? " annotation-summary-danger" : ""}">${summaryText}</p>` : "";
    const rules = [...annotation.rules];
    if (annotation.name.includes("筛选") || annotation.name.includes("输入处理")) rules.push("筛选按钮的可点击面积大于其他按钮一倍，可参考原型");
    if (annotation.type === "数据表格") rules.push("表格仅在内容超出对应可视区域时显示滚动条：横向滚动条高度、纵向滚动条宽度均保持15px；内容可完整显示时对应滚动条隐藏");
    if (annotation.name.includes("导出") || annotation.type.includes("导出")) exportExcelRules.forEach((rule) => { if (!rules.includes(rule)) rules.push(rule); });
    const ruleHtml = rules.map((rule, index) => {
      let text = escapeHtml(rule);
      annotation.ruleHighlights?.forEach((term) => { text = text.replaceAll(escapeHtml(term), `<strong class="rule-highlight">${escapeHtml(term)}</strong>`); });
      return `<li${annotation.ruleEmphasisIndexes?.includes(index) ? ' class="rule-emphasis"' : ""}>${text}</li>`;
    }).join("");
    return `<article class="annotation-card${annotation.critical ? " critical-annotation" : ""}" data-spec-id="${annotation.id}" tabindex="0"><div class="annotation-heading"><span class="component-code">${annotation.id}</span><div><h3>${escapeHtml(annotation.name)}</h3></div></div>${summary}<ul>${ruleHtml}</ul>${demoControls}</article>`;
  }

  function agent498IsTeamIdentity(identity = agent498Identity) {
    return identity.startsWith("TEAM_");
  }

  function agent498IsTeamLeader(identity = agent498Identity) {
    return identity === "TEAM_LEADER_MULTI" || identity === "TEAM_LEADER_SINGLE";
  }

  function agent498AllowedPageKeys(identity = agent498Identity) {
    return new Set([...agent498CommonPageKeys, ...(agent498IdentityConfig[identity]?.pages || [])]);
  }

  function agent498PageIsAllowed(key, identity = agent498Identity) {
    return key.startsWith("control-") || agent498AllowedPageKeys(identity).has(key);
  }

  function agent498VisibleTabs(page, identity = agent498Identity) {
    const tabs = page.tabs || [];
    if (!tabs.length) return tabs;
    if (page.key === "agent-members-498") return agent498IsTeamLeader(identity) ? tabs : tabs.filter((tab) => tab === "会员管理");
    if (["agent-financial-report-498", "agent-commission-report-498"].includes(page.key)) {
      return agent498IsTeamLeader(identity) ? tabs : tabs.filter((tab) => tab.startsWith("个人"));
    }
    return tabs;
  }

  function agent498ActiveTab(page) {
    const visibleTabs = agent498VisibleTabs(page);
    const requested = agent498SubViewState[page.key];
    return visibleTabs.includes(requested) ? requested : visibleTabs[0];
  }

  function agent498HiddenReason(key, identity = agent498Identity) {
    const label = agent498IdentityConfig[identity]?.label || "当前身份";
    const reasons = {
      "agent-team-498": "仅团队负责人可查看团队信息",
      "agent-list-498": identity === "TEAM_SUBLINE" ? "团队副线不可查看团队代理列表" : "当前身份无代理列表权限",
      "agent-transfer-498": "仅团队负责人可向同团队副线转账",
      "agent-negative-profit-report-498": "仅团队代理使用负盈利佣金报表",
      "agent-correction-report-498": identity === "TEAM_SUBLINE" ? "团队副线不可查看冲正统计" : "当前身份无冲正统计权限",
      "agent-reversal-repayment-498": "团队代理不可访问传统冲正回款报表",
      "agent-activity-management-498": "团队代理不可访问活动管理",
      "agent-venue-fee-detail-498": "团队副线不可查看场馆代理费用明细"
    };
    return reasons[key] || `${label}无此功能权限`;
  }

  function agent498PageDisplayName(page) {
    return page.key === "agent-list-498" && agent498IsTeamLeader() ? "团队代理" : page.name;
  }

  function activePageTab(page) {
    return page.key.endsWith("-498")
      ? agent498ActiveTab(page)
      : financeTabState[page.key] || page.tabs?.[0];
  }

  function visibleAnnotations(page, activeTab = activePageTab(page)) {
    return page.annotations.filter((annotation) => !annotation.tab || annotation.tab === activeTab);
  }

  function visiblePages(requirement) {
    return requirement.pages.filter((page) => !page.localOnly || isLocalPrototype);
  }

  function sidebar(requirement, page) {
    if (requirement.id === "#498" && page.key.startsWith("control-")) {
      const links = [
        ["control-agent-quota-498", "代存额度设置"],
        ["control-overflow-498", "溢出管理"]
      ].map(([key, name]) => `<a href="#requirement/${encodeURIComponent("#498")}/page/${key}" class="agent-menu-level-two ${page.key === key ? "active" : ""}"><span></span><span class="menu-name">${name}</span></a>`).join("");
      return `<aside class="risk-sidebar agent-498-sidebar control-498-sidebar"><div class="risk-brand"><span>C</span><div><strong>ControlCenter</strong><small>总控后台</small></div></div><div class="risk-menu-label">功能导航</div><nav class="agent-menu-tree"><section class="agent-menu-group active is-expanded"><button type="button" class="agent-menu-level-one" data-agent-menu-toggle aria-expanded="true"><span class="menu-symbol">■</span><span class="menu-name">代理管理</span><span class="agent-menu-arrow" aria-hidden="true"></span></button><div class="agent-menu-children">${links}</div></section></nav><div class="risk-user"><span>MC</span><div><strong>Mike</strong><small>总控运营</small></div></div></aside>`;
    }
    if (requirement.id === "#498" && page.key !== "profit-simulator-498") {
      const groups = [
        { key: "agent-dashboard-498", name: "数据看板", children: [] },
        { name: "下级管理", children: [
          { key: "agent-members-498", name: "会员管理" },
          { key: "agent-deposits-498", name: "存款管理" },
          { key: "agent-bonuses-498", name: "红利记录" },
          { key: "agent-games-498", name: "游戏记录" },
          { key: "agent-team-498", name: "团队信息" },
          { key: "agent-active-members-498", name: "活跃会员" },
          { key: "agent-list-498", name: "代理列表" }
        ] },
        { name: "运营中心", children: [
          { key: "agent-activity-management-498", name: "活动管理" }
        ] },
        { name: "财务中心", children: [
          { key: "agent-withdrawal-498", name: "提款申请" },
          { key: "agent-deposit-service-498", name: "代理代存" },
          { key: "agent-balance-recharge-498", name: "额度充值" },
          { key: "agent-transfer-498", name: "代理转账" },
          { key: "agent-financial-report-498", name: "财务报表" },
          { key: "agent-commission-report-498", name: "佣金报表" },
          { key: "agent-negative-profit-report-498", name: "负盈利佣金报表" },
          { key: "agent-correction-report-498", name: "冲正统计报表" },
          { key: "agent-reversal-repayment-498", name: "冲正回款报表" },
          { key: "agent-venue-fee-detail-498", name: "场馆代理费用明细" },
          { key: "agent-wallet-ledger-498", name: "账变明细" }
        ] },
        { name: "个人中心", children: [
          { key: "agent-profile-498", name: "个人中心" },
          { key: "agent-overflow-498", name: "溢出申请" },
          { key: "agent-notices-498", name: "系统公告" },
          { key: "agent-downloads-498", name: "我的下载" }
        ] }
      ];
      const allowedPages = agent498AllowedPageKeys();
      const currentIdentity = agent498IdentityConfig[agent498Identity];
      const menuTree = groups.map((group) => {
        const groupActive = group.key ? page.key === group.key : page.menuGroup === group.name;
        if (!group.children.length) return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${group.key}" class="agent-menu-level-one agent-menu-direct ${groupActive ? "active" : ""}"><span class="menu-symbol">${groupActive ? "■" : "□"}</span><span class="menu-name">${group.name}</span></a>`;
        const visibleChildren = group.children.filter((child) => allowedPages.has(child.key) || agent498ShowHidden);
        if (!visibleChildren.length) return "";
        const children = visibleChildren.map((child) => {
          const allowed = allowedPages.has(child.key);
          const displayName = child.key === "agent-list-498" && agent498IsTeamLeader() ? "团队代理" : child.name;
          if (!allowed) return `<span class="agent-menu-level-two is-permission-hidden" title="${escapeHtml(agent498HiddenReason(child.key))}" aria-disabled="true"><span class="agent-menu-lock" aria-hidden="true">×</span><span class="menu-name">${escapeHtml(displayName)}</span><small>${escapeHtml(agent498HiddenReason(child.key))}</small></span>`;
          return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${child.key}" class="agent-menu-level-two ${page.key === child.key ? "active" : ""}"><span></span><span class="menu-name">${escapeHtml(displayName)}</span></a>`;
        }).join("");
        return `<section class="agent-menu-group ${groupActive ? "active is-expanded" : ""}"><button type="button" class="agent-menu-level-one" data-agent-menu-toggle aria-expanded="${groupActive ? "true" : "false"}"><span class="menu-symbol">${groupActive ? "■" : "□"}</span><span class="menu-name">${group.name}</span><span class="agent-menu-arrow" aria-hidden="true"></span></button><div class="agent-menu-children">${children}</div></section>`;
      }).join("");
      const annotated = page.annotations?.some((annotation) => annotation.id === "N01");
      return `<aside class="risk-sidebar agent-498-sidebar"><div class="risk-brand"><span>A</span><div><strong>AgentPortal</strong><small>代理后台</small></div></div><div class="risk-menu-label">功能导航</div><nav class="agent-menu-tree${annotated ? " annotated" : ""}"${annotated ? ' data-component-id="N01"' : ""}>${annotated ? componentBadge("N01") : ""}${menuTree}</nav><div class="risk-user"><span>AG</span><div><strong>${escapeHtml(currentIdentity.account)}</strong><small>${escapeHtml(currentIdentity.label)}</small></div></div></aside>`;
    }
    const pageModuleName = ["#509", "#643"].includes(requirement.id) ? page.moduleName || requirement.moduleName : requirement.moduleName;
    const finance = pageModuleName === "财务管理";
    const member = pageModuleName === "会员管理";
    const operation = pageModuleName === "运营管理";
    const brand = finance ? "Finance" : member ? "MemberCenter" : operation ? "Operations" : "RiskControl";
    const brandMark = finance ? "F" : member ? "M" : operation ? "O" : "R";
    const moduleName = pageModuleName || "风控管理";
    const workspaceName = ["#509", "#643"].includes(requirement.id) ? page.workspaceName || requirement.workspaceName || "风控工作台" : requirement.workspaceName || "风控工作台";
    const roleName = requirement.roleName || "风控审核员";
    const memberDetailActive = member && requirement.id === "#488" && member488DetailPages.some(([key]) => key === page.key);
    const navigationPages = member ? visiblePages(requirement).filter((item) => ["member-list-488", "member-logs-488"].includes(item.key)) : visiblePages(requirement);
    let links = navigationPages.map((item) => {
      const active = item.key === page.key || (item.key === "member-list-488" && memberDetailActive);
      const newBadge = item.key === "member-logs-488" ? '<em class="menu-change-badge is-new">新增</em>' : "";
      return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${item.key}" class="${active ? "active" : ""}"><span class="menu-symbol">${active ? "■" : "□"}</span><span class="menu-name">${item.name}</span>${newBadge || (item.changeLabel ? `<em class="menu-change-badge ${item.changeType === "纯新增" ? "is-new" : "is-merged"}">${item.changeLabel}</em>` : "")}</a>`;
    }).join("");
    if (requirement.id === "#509") {
      const pagesByKey = new Map(visiblePages(requirement).map((item) => [item.key, item]));
      const memberLink = (key, name = pagesByKey.get(key)?.name, badge = "") => {
        const item = pagesByKey.get(key);
        if (!item) return "";
        const rebateActive = key === "rebate-level-config-509" && rebate509Tabs.some(([tabKey]) => tabKey === page.key);
        const active = item.key === page.key || rebateActive;
        const badgeClass = badge === "新增" ? "is-new" : "is-modified";
        return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${item.key}" class="${active ? "active" : ""}"><span class="menu-symbol">${active ? "■" : "□"}</span><span class="menu-name">${escapeHtml(name)}</span>${badge ? `<em class="menu-change-badge ${badgeClass}">${escapeHtml(badge)}</em>` : ""}</a>`;
      };
      links = [
        '<div class="member-menu-static"><span class="menu-symbol">□</span><span>会员列表</span></div>',
        '<div class="member-menu-static"><span class="menu-symbol">□</span><span>同IP会员列表</span></div>',
        memberLink("vip-settings-509", "VIP会员设置", "修改"),
        memberLink("rebate-level-config-509", "VIP返水配置", "新增"),
        '<div class="member-menu-static"><span class="menu-symbol">□</span><span>会员推广邀请奖励设置</span></div>',
        '<div class="member-menu-static"><span class="menu-symbol">□</span><span>会员实名认证列表</span></div>',
        '<div class="member-menu-static"><span class="menu-symbol">□</span><span>会员日志</span></div>'
      ].join("");
    } else if (requirement.id === "#643") {
      const pagesByKey = new Map(visiblePages(requirement).map((item) => [item.key, item]));
      const memberLink = (key, name = pagesByKey.get(key)?.name, badge = "") => {
        const item = pagesByKey.get(key);
        if (!item) return "";
        const configActive = key === "member-level-config-643" && ["member-level-config-643", "member-tag-config-643"].includes(page.key);
        const active = item.key === page.key || configActive;
        return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${item.key}" class="${active ? "active" : ""}"><span class="menu-symbol">${active ? "■" : "□"}</span><span class="menu-name">${escapeHtml(name)}</span>${badge ? `<em class="menu-change-badge is-new">${escapeHtml(badge)}</em>` : ""}</a>`;
      };
      links = [
        memberLink("member-list-643"),
        memberLink("same-ip-members-643"),
        memberLink("member-level-config-643", "会员配置", "新增"),
        memberLink("vip-rebate-config-643", "VIP返水配置"),
        memberLink("invite-reward-settings-643"),
        memberLink("identity-list-643"),
        memberLink("member-logs-643")
      ].join("");
    } else if (member && requirement.id === "#493") {
      const pagesByKey = new Map(visiblePages(requirement).map((item) => [item.key, item]));
      const memberLink = (key) => {
        const item = pagesByKey.get(key);
        if (!item) return "";
        const active = item.key === page.key;
        const annotateMenu = active && ["account-adjustment-record-493", "bet-records-493"].includes(key);
        const badge = item.changeLabel ? `<em class="menu-change-badge is-merged">${item.changeLabel}</em>` : "";
        return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${item.key}" class="${active ? "active" : ""}${annotateMenu ? " annotated" : ""}"${annotateMenu ? ' data-component-id="N01"' : ""}>${annotateMenu ? componentBadge("N01") : ""}<span class="menu-symbol">${active ? "■" : "□"}</span><span class="menu-name">${item.name}</span>${badge}</a>`;
      };
      const basics = ["member-list-493", "same-ip-members-493", "vip-settings-493", "invite-reward-settings-493", "identity-list-493", "member-logs-493"].map((key) => memberLink(key)).join("");
      const recordActive = page.key === "account-adjustment-record-493";
      const recordMenu = `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/account-adjustment-record-493" class="${recordActive ? "active" : ""} annotated" data-component-id="N01">${componentBadge("N01")}<span class="menu-symbol">${recordActive ? "■" : "□"}</span><span class="menu-name">记录管理</span><em class="menu-change-badge is-new">新增二级</em></a>`;
      links = `${basics}${recordMenu}${memberLink("bet-records-493")}`;
    } else if (requirement.id === "#406") {
      const reviewKeys = ["withdraw-review", "hold-review", "review-history"];
      const reviewActive = reviewKeys.includes(page.key);
      const reviewLink = `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/withdraw-review" class="${reviewActive ? "active" : ""}"><span class="menu-symbol">${reviewActive ? "■" : "□"}</span><span class="menu-name">风控提款审核</span></a>`;
      const remainingLinks = navigationPages.filter((item) => !reviewKeys.includes(item.key)).map((item) => {
        const active = item.key === page.key;
        return `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${item.key}" class="${active ? "active" : ""}"><span class="menu-symbol">${active ? "■" : "□"}</span><span class="menu-name">${item.name}</span>${item.changeLabel ? `<em class="menu-change-badge ${item.changeType === "纯新增" ? "is-new" : "is-merged"}">${item.changeLabel}</em>` : ""}</a>`;
      }).join("");
      links = `${reviewLink}${remainingLinks}`;
    } else if (member) {
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
    return `<div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP2</option><option>VIP3</option><option>VIP12</option></select></div><div class="risk-field"><label>真实姓名</label><input type="text" placeholder="请输入真实姓名" /></div>${siteMultiSelect()}${extra}`;
  }

  function filterActions(exportButton = false, extraActions = "") {
    return `<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button>${extraActions}${exportButton ? `<button type="button" class="secondary-action annotated" data-component-id="B01">${componentBadge("B01")}导出表格</button>` : ""}</div>`;
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

  function withdrawReviewTabs(activeKey) {
    const tabs = [["withdraw-review", "提款审核"], ["hold-review", "挂起审核"], ["review-history", "审核记录"]];
    return `<nav class="inner-tabs withdraw-review-tabs" aria-label="风控提款审核三级菜单">${tabs.map(([key, name]) => `<a href="#requirement/${encodeURIComponent("#406")}/page/${key}" class="${key === activeKey ? "active" : ""}">${name}</a>`).join("")}</nav>`;
  }

  function withdrawReviewContent() {
    return `<div class="risk-page-heading"><div><h1>提款审核</h1></div><span class="page-status">公共池实时更新</span></div>${withdrawReviewTabs("withdraw-review")}
      <section class="withdraw-routing-control annotated" data-component-id="S03">${componentBadge("S03")}<div><strong>提款审核流转</strong><span>全平台统一配置，仅影响切换后新进入审核流程的订单</span></div><label class="switch-row"><input type="checkbox" id="skip-risk-withdraw-review" ${skipRiskWithdrawReview ? "checked" : ""} /><span class="switch-track"></span><b>跳过风控审核</b></label><em class="withdraw-routing-state">${skipRiskWithdrawReview ? "已开启：新订单直接进入财务审核" : "已关闭：新订单先进入风控审核"}</em></section>
      <section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>筛选表</label><select><option>待领取</option><option selected>待审核</option></select></div>${baseFilters()}${timeRange("F02")}${filterActions()}</div></section>
      <section class="risk-list-card annotated" data-component-id="T01"><div class="risk-list-heading"><div><h2>待领取</h2><span>公共池 · 3 条待处理</span></div><button type="button" class="collapse-button">收起列表</button></div>${componentBadge("T01")}<div id="claim-list-content"><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("claim")}</tr></thead><tbody>${reviewRows("claim")}</tbody></table></div>${pagination()}</div><div class="empty-state" id="claim-empty" hidden><strong>无待领取申请</strong><span>当前公共池暂无需要领取的提款申请</span></div></section>
      <section class="risk-list-card annotated" data-component-id="T02"><div class="risk-list-heading"><div><h2>待审核</h2><span>当前账号已领取 · 3 条</span></div></div>${componentBadge("T02")}<div id="review-list-content"><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("review")}</tr></thead><tbody>${reviewRows("review")}</tbody></table></div>${pagination()}</div><div class="empty-state" id="review-empty" hidden><strong>无待审核申请</strong><span>当前账号暂无已领取的待审核提款申请</span><a href="#requirement/${encodeURIComponent(requirements[0].id)}/page/review-history" class="secondary-action empty-history-link">查看审核历史</a></div></section>`;
  }

  function holdReviewContent() {
    const extras = `<div class="risk-field"><label>挂起原因</label><select><option>全部原因</option>${riskTags.map((tag) => `<option>${tag}</option>`).join("")}</select></div><div class="risk-field"><label>挂起人</label><select><option>全部操作人</option><option>mike.risk</option><option>risk_amy</option></select></div>`;
    return `<div class="risk-page-heading"><div><h1>挂起审核</h1></div></div>${withdrawReviewTabs("hold-review")}<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid">${baseFilters(extras)}${timeRange("F02")}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>挂起审核列表</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("hold")}</tr></thead><tbody>${reviewRows("hold")}</tbody></table></div>${pagination()}</section>`;
  }

  function historyContent() {
    const extras = `<div class="risk-field"><label>审核状态</label><select><option>全部</option><option>通过</option><option>拒绝</option></select></div><div class="risk-field"><label>出款状态</label><select><option>全部</option><option>已出款</option><option>待财务审核</option></select></div><div class="risk-field"><label>挂起</label><select><option>全部</option><option>无</option><option>有挂起</option></select></div><div class="risk-field"><label>审核人</label><select><option>全部审核员</option><option>mike.risk</option></select></div>`;
    const rows = [1,2,3].map((i)=>`<tr><td class="sticky-order"><strong class="mono">WD2026071100${i}</strong></td><td class="sticky-member${i === 1 ? ' annotated" data-component-id="B01' : ""}">${i === 1 ? componentBadge("B01") : ""}<a class="member-detail-link" href="javascript:void(0)">dengji000</a></td><td>VIP6</td><td>旺财体育</td><td>agent_087</td><td>A10386</td><td>陈小明</td><td>6222123456783890</td><td><strong class="amount">¥ ${money(i*1200)}</strong></td><td><span class="plain-datetime">2026-07-11 10:2${i}:30</span></td><td class="pending-system-cell${i === 1 ? ' annotated" data-component-id="S02' : ""}">${i === 1 ? componentBadge("S02") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td><td class="pending-system-cell${i === 1 ? ' annotated" data-component-id="S03' : ""}">${i === 1 ? componentBadge("S03") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td><td>${i===2 ? `<span class="plain-datetime">2026-07-11 10:30:00</span><div class="stack-cell"><span><i>挂起人：</i><b>mike.risk</b></span><span><em class="data-tag">对冲套利风险</em></span></div>` : "—"}</td><td>mike.risk</td><td><span class="plain-datetime">2026-07-11 10:4${i}:18</span></td><td>${12+i} 分钟</td><td><span class="data-tag ${i===1?"tag-green":"tag-amber"}">${i===1?"已出款":"待财务审核"}</span></td><td><span class="result-tag ${i===3?"rejected":"approved"}">${i===3?"拒绝：账户异常":"通过"}</span></td><td>${i===2 ? "会员要求延后处理，已核验近期提款记录。" : "—"}</td></tr>`).join("");
    return `<div class="risk-page-heading"><div><h1>审核记录</h1></div></div>${withdrawReviewTabs("review-history")}<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid">${baseFilters(extras)}${timeRange("F02")}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>审核记录</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table history-table"><thead><tr><th class="sticky-order">订单号</th><th class="sticky-member">会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>真实姓名</th><th>提款账户</th><th>提款金额</th><th>申请时间</th><th>系统标签</th><th>系统审核结果</th><th>挂起信息</th><th>审核人</th><th>审核时间</th><th>处理用时</th><th>出款状态</th><th>审核结果</th><th>风控备注</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(50)}</section>`;
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
    const filters = `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid monitor-filters"><div class="risk-field"><label>会员账号</label><input placeholder="请输入会员账号" /></div><div class="risk-field"><label>真实姓名</label><input placeholder="请输入真实姓名" /></div><div class="risk-field"><label>VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP12</option></select></div>${siteField}${monitorTime}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action reset-action">重置</button></div></div></section>`;
    const toolbar = history ? "" : `<div class="monitor-toolbar"><button class="secondary-action annotated" data-component-id="B01" disabled>${componentBadge("B01")}批量拒绝</button><label class="switch-row annotated" data-component-id="S01">${componentBadge("S01")}<input type="checkbox" id="auto-ignore" /><span class="switch-track"></span><b>自动拒绝</b></label><button class="secondary-action annotated config-action" data-component-id="M01">${componentBadge("M01")}流水审核配置</button></div>`;
    const extraHeaders = history ? "<th>审核记录</th><th>审核人</th><th>审核时间</th>" : "";
    const operationHeader = history ? "" : "<th>操作</th>";
    const table = `<div class="risk-table-wrap"><table class="risk-table monitor-table"><thead><tr><th><input type="checkbox" aria-label="全选" /></th><th class="sticky-monitor-order">监控订单号</th><th class="sticky-monitor-member">会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>最后一次场馆信息</th><th>投注记录同步状态</th><th>停留时长</th><th>提款刷新次数</th>${extraHeaders}${operationHeader}</tr></thead><tbody>${monitorRows(history)}</tbody></table></div>${pagination(20, 3)}`;
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
      const site = "WC体育";
      const upperAgentAccount = "agent_087";
      const upperAgentNumber = "A10386";
      const depositDate = `2026-07-1${3 - index}`;
      const depositTime = `${String(8 + index).padStart(2, "0")}:20:00`;
      const bonusTime = `${String(8 + index).padStart(2, "0")}:25:00`;
      const depositAmount = `¥ ${money(index * 1000)}`;
      const depositType = index === 1 ? "银行卡存款" : "数字货币存款";
      const depositMultiple = `${index + 1} 倍`;
      const depositRequired = `¥ ${money(index * 3000)}`;
      const depositCompleted = `¥ ${money(index * (met ? 3000 : 1800))}`;
      const bonusAmount = `¥ ${money(index * 200)}`;
      const bonusType = index === 1 ? "存款红利" : "活动红利";
      const bonusMultiple = `${index + 2} 倍`;
      const bonusRequired = `¥ ${money(index * 800)}`;
      const bonusCompleted = `¥ ${money(index * (met ? 800 : 500))}`;
      const totalCompleted = `¥ ${money(index * (met ? 3800 : 2300))}`;
      const taskBalance = `¥ ${money(balance)}`;
      const detailData = `data-deposit-time="${depositDate} ${depositTime}" data-deposit-amount="${depositAmount}" data-deposit-multiple="${depositMultiple}" data-deposit-required="${depositRequired}" data-deposit-completed="${depositCompleted}" data-bonus-time="${depositDate} ${bonusTime}" data-bonus-amount="${bonusAmount}" data-bonus-multiple="${bonusMultiple}" data-bonus-required="${bonusRequired}" data-bonus-completed="${bonusCompleted}" data-task-balance="${taskBalance}"`;
      const annotation = index === 1 ? ` annotated" data-component-id="B01` : "";
      const statusAnnotation = index === 1 ? ` annotated" data-component-id="S02` : "";
      return `<tr><td class="sticky-transaction-member">${memberCell(member)}</td><td>${site}</td><td class="sticky-transaction-agent">${upperAgentAccount}</td><td>${upperAgentNumber}</td><td>${dateTimeCell(depositDate, depositTime)}</td><td><strong class="amount">${depositAmount}</strong></td><td>${depositType}</td><td>${depositMultiple}</td><td><strong class="amount">${depositRequired}</strong></td><td><strong class="amount">${depositCompleted}</strong></td><td><strong class="amount">${bonusAmount}</strong></td><td>${bonusType}</td><td>${bonusMultiple}</td><td><strong class="amount">${bonusRequired}</strong></td><td><strong class="amount">${bonusCompleted}</strong></td><td><strong class="amount">${totalCompleted}</strong></td><td><button type="button" class="balance-detail link-action${annotation}" data-member="${member}" data-site="${site}" ${detailData}>${index === 1 ? componentBadge("B01") : ""}<strong class="amount">${taskBalance}</strong></button></td><td class="${statusAnnotation}">${index === 1 ? componentBadge("S02") : ""}<span class="result-tag ${met ? "approved" : "rejected"}">${met ? "已达标" : "未达标"}</span></td><td>${dateTimeCell("2026-07-12",`14:3${index}:00`)}</td></tr>`;
    }).join("");
    const siteField = siteMultiSelect();
    return `<div class="transaction-page"><div class="risk-page-heading"><div><h1>流水查询</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid transaction-filter-grid"><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div>${siteField}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter transaction-search">筛选</button><button type="button" class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员流水任务</h2><span class="transaction-count" ${transactionState.searched ? "" : "hidden"}>共 3 条</span></div></div><div class="search-empty-state transaction-empty" ${transactionState.searched ? "hidden" : ""}><strong>请先设置筛选条件并点击筛选</strong><span>未搜索前，数据表不显示任何数据</span></div><div class="transaction-results" ${transactionState.searched ? "" : "hidden"}><div class="risk-table-wrap"><table class="risk-table transaction-table"><thead><tr><th class="sticky-transaction-member">会员信息</th><th>所属站点</th><th class="sticky-transaction-agent">上级代理账号</th><th>上级代理编号</th><th>存款时间</th><th>存款金额</th><th>存款类型</th><th>存款流水倍数</th><th>存款要求流水</th><th>存款完成流水</th><th>红利金额</th><th>红利类型</th><th>红利流水倍数</th><th>红利要求流水</th><th>红利完成流水</th><th>总完成流水</th><th>流水结余</th><th>达标情况</th><th>流水同步时间</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination()}</div></section></div>`;
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
    return `<div class="risk-page-heading"><div><h1>流水查询</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid backup-flow-filters"><div class="risk-field"><label>站点</label><select><option>全部站点</option><option>旺财体育</option><option>财源客栈</option></select></div><div class="risk-field"><label>代理账号</label><input type="text" placeholder="请输入代理账号" /></div><div class="risk-field"><label>会员账号 / ID</label><input type="text" placeholder="请输入会员账号或ID" /></div><div class="risk-filter-actions"><button type="button" class="main-action primary-filter backup-flow-search">查询</button><button type="button" class="secondary-action backup-flow-reset">重置</button><button type="button" class="secondary-action backup-flow-export">导出</button></div></div></section><section class="flow-scope-note annotated" data-component-id="P01">${componentBadge("P01")}<strong>金额与流水口径</strong><p>总余额 = 可提款余额 + 锁定余额；场馆提款流水为各场馆及通用任务仍需解锁流水之和；充值提款流水按充值与系统发放彩金生成独立记录并按发生时间 FIFO 解锁。</p></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员打码流水统计</h2><span>共 8 条</span></div></div><div class="risk-table-wrap"><table class="risk-table backup-flow-table"><thead><tr><th>站点</th><th>代理</th><th>会员账号 / ID</th><th>币种</th><th>充值额度</th><th>总余额</th><th>可提款余额</th><th>锁定余额</th><th>场馆提款流水</th><th>充值提款流水</th><th>盈利解锁额度</th><th>最近充值时间</th><th>最近统计时间</th></tr></thead><tbody>${backupTransactionRows()}</tbody></table></div>${pagination(10, 8)}</section>`;
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
      return `<tr><td class="sticky-unified-site">${row.site}</td><td class="sticky-unified-agent">${row.agent}</td><td class="sticky-unified-member"><strong>${row.member}</strong></td><td>CNY</td><td>${unifiedFlowStack([["充值", row.recharge], ["活动/彩金", row.bonus, "flow-profit"]])}</td><td>${unifiedFlowStack([["总余额", row.total], ["可提款", row.available, "flow-available"], ["锁定", row.locked]])}</td><td><button type="button" class="flow-detail-link unified-venue-flow-detail${venueClass}" data-member="${row.member}" data-site="${row.site}">${index === 0 ? componentBadge("B01") : ""}<strong>${row.venue}</strong><span>查看场馆明细</span></button></td><td><button type="button" class="flow-detail-link unified-source-flow-detail${sourceClass}" data-member="${row.member}" data-site="${row.site}">${index === 0 ? componentBadge("B02") : ""}<strong>${row.source}</strong><span>查看充值/活动明细</span></button></td><td><strong class="amount ${row.profit !== "—" ? "flow-profit" : ""}">${row.profit}</strong><small class="table-subline">${row.profitHint}</small></td><td class="unified-flow-status${statusClass}">${index === 0 ? componentBadge("S01") : ""}<span class="result-tag ${row.met ? "approved" : "rejected"}">${row.met ? "已达标" : "未达标"}</span><small>${row.met ? "可以提款" : "暂不可提款"}</small></td><td>${row.recent}</td><td>${row.sync}</td></tr>`;
    }).join("");
  }

  function unifiedTransactionContent() {
    const countedAt = timeRange("F02").replaceAll("申请时间", "计入时间");
    return `<div class="risk-page-heading"><div><h1>流水查询-2</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid unified-flow-filters"><div class="risk-field"><label>站点</label><select><option>全部站点</option><option>旺财体育</option><option>财源客栈</option></select></div><div class="risk-field"><label>代理账号</label><input type="text" placeholder="请输入代理账号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>流水来源</label><select><option>全部来源</option><option>充值</option><option>活动彩金</option><option>系统发放彩金</option></select></div><div class="risk-field"><label>活动名称 / 编号</label><input type="text" placeholder="请输入活动名称或编号" /></div><div class="risk-field"><label>关联单号</label><input type="text" placeholder="请输入充值单号或彩金单号" /></div><div class="risk-field"><label>流水状态</label><select><option>全部状态</option><option>未达标</option><option>已达标</option></select></div>${countedAt}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter unified-flow-search">查询</button><button type="button" class="secondary-action reset-action">重置</button><button type="button" class="secondary-action unified-flow-export">导出</button></div></div></section><section class="flow-scope-note annotated" data-component-id="P01">${componentBadge("P01")}<strong>统一展示口径</strong><p>主表始终一名会员一行；充值/活动剩余流水沿用旧流水查询的“流水结余”口径。场馆剩余流水与充值/活动剩余流水分别展示，不重复计算；两项均为0且没有其他限制时，流水状态显示已达标、可以提款。</p></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员流水总览</h2><span>共 6 条</span></div></div><div class="risk-table-wrap"><table class="risk-table unified-flow-table"><thead><tr><th class="sticky-unified-site">站点</th><th class="sticky-unified-agent">上级代理</th><th class="sticky-unified-member">会员账号</th><th>币种</th><th>计入流水额度</th><th>资金概览</th><th>场馆剩余流水</th><th>充值/活动剩余流水</th><th>盈利解锁额度</th><th>流水状态</th><th>最近充值/彩金时间</th><th>流水同步时间</th></tr></thead><tbody>${unifiedTransactionRows()}</tbody></table></div>${pagination(10, 6)}</section>`;
  }

  function flowSummaryItem(label, value, hint = "", className = "") {
    return `<div><span>${label}</span><strong class="${className}">${value}</strong>${hint ? `<small>${hint}</small>` : ""}</div>`;
  }

  function venueFlowModalBody(member = "member_10086", site = "旺财体育", unified = false) {
    const rows = [["AG真人", "¥3,600.00", "¥26,900.00", "¥14,400.00", "¥0.00", "¥12,500.00"], ["PG电子", "¥2,850.00", "¥17,400.00", "¥8,750.00", "¥0.00", "¥8,650.00"], ["体育投注", "¥3,926.00", "¥20,950.00", "¥10,780.00", "¥0.00", "¥10,170.00"]];
    const totalLabel = unified ? "场馆剩余流水" : "场馆提款流水";
    return `<div class="flow-modal-content annotated" data-component-id="M01">${componentBadge("M01")}<p class="flow-modal-subtitle">${member} · ${site} · 统计截至 2026-07-14 21:20</p><section class="flow-modal-summary four">${flowSummaryItem("会员账号", member)}${flowSummaryItem("锁定余额", "¥10,376.00")}${flowSummaryItem(totalLabel, "¥31,320.00", "", "flow-profit")}${flowSummaryItem("当前状态", "进行中", "", "flow-status")}</section><div class="risk-table-wrap"><table class="risk-table flow-modal-table venue-flow-table"><thead><tr><th>场馆</th><th>锁定额度</th><th>目标流水</th><th>已完成有效流水</th><th>待确认流水</th><th>还需解锁流水</th><th>状态</th></tr></thead><tbody>${rows.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td><strong class="flow-profit">${row[5]}</strong></td><td><span class="result-tag">进行中</span></td></tr>`).join("")}</tbody></table></div><section class="flow-modal-note"><strong>统计口径</strong><p>单项还需解锁流水 = MAX（0，目标流水 - 已完成有效流水）；${unified ? "场馆剩余流水" : "总场馆提款流水"} = 各场馆及通用任务还需解锁流水之和。待确认流水仅展示进度，不提前计入已完成流水或释放锁定余额。</p></section></div>`;
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
    const member = button.dataset.member;
    const site = button.dataset.site;
    const detail = button.dataset;
    const amountValue = (text) => Number(String(text || "").replace(/[^\d.-]/g, "")) || 0;
    const remaining = (required, completed) => `¥ ${money(Math.max(0, amountValue(required) - amountValue(completed)))}`;
    const detailRows = [
      ["充值", detail.depositTime, detail.depositAmount, detail.depositMultiple, detail.depositRequired, detail.depositCompleted],
      ["红利", detail.bonusTime, detail.bonusAmount, detail.bonusMultiple, detail.bonusRequired, detail.bonusCompleted]
    ];
    return `<div class="flow-modal-content annotated" data-component-id="M01">${componentBadge("M01")}<p class="flow-modal-subtitle">${member} · ${site} · 当前流水结余对应的单笔充值及关联红利</p><section class="flow-modal-summary four">${flowSummaryItem("会员账号", member)}${flowSummaryItem("充值时间", detail.depositTime)}${flowSummaryItem("充值金额", detail.depositAmount)}${flowSummaryItem("任务总流水结余", detail.taskBalance, "", "flow-profit")}</section><div class="risk-table-wrap"><table class="risk-table flow-modal-table transaction-recharge-detail-table"><thead><tr><th>类型</th><th>发生时间</th><th>计入金额</th><th>流水倍数</th><th>要求流水</th><th>完成流水</th><th>剩余流水</th><th>达标情况</th></tr></thead><tbody>${detailRows.map((row) => { const rowRemaining = remaining(row[4], row[5]); const met = amountValue(rowRemaining) === 0; return `<tr><td><span class="data-tag ${row[0] === "红利" ? "tag-amber" : ""}">${row[0]}</span></td><td>${row[1]}</td><td><strong class="amount">${row[2]}</strong></td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td><td><strong class="${met ? "" : "flow-profit"}">${rowRemaining}</strong></td><td><span class="result-tag ${met ? "approved" : "rejected"}">${met ? "已达标" : "未达标"}</span></td></tr>`; }).join("")}</tbody></table></div></div>`;
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
    const timeLabel = withdrawal ? "提款申请时间" : "存款申请时间";
    const title = `${subjectType}${withdrawal ? "提款" : "存款"}记录`;
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
      { order: "WD1783498560783231", type: "会员", account: "dlwc0011", accountId: "—", site: "旺财体育", vip: "VIP7", registeredAt: "2026-06-11 11:45:03", transactionType: "提款", withdrawalType: "USDT提币", amount: "-90.00 U", actual: "88.00 U", fee: "2.00 CNY", userStatus: "处理中", platformStatus: "待审核", thirdStatus: "未提交" },
      { order: "WD1783493903745929", type: "代理", account: "agent_087", accountId: "A10386", site: "旺财体育", vip: "—", registeredAt: "—", transactionType: "代理提款", withdrawalType: "USDT提币", amount: "-10.00 U", actual: "9.50 U", fee: "3.40 CNY", userStatus: "处理中", platformStatus: "待审核", thirdStatus: "未提交" },
      { order: "WD1783390901534802", type: "站点", account: "新旺体育", accountId: "—", site: "新旺体育", vip: "—", registeredAt: "—", transactionType: "站点提款", withdrawalType: "人民币", amount: "-100.00 CNY", actual: "98.00 CNY", fee: "2.00 CNY", userStatus: "处理中", platformStatus: "待审核", thirdStatus: "未提交" }
    ];
      return rows.map((row, index) => `<tr><td class="sticky-finance-order"><strong class="mono">${row.order}</strong></td><td class="sticky-finance-member"><a class="member-detail-link" href="javascript:void(0)">${row.account}</a></td><td><span class="data-tag">${row.type}</span></td><td>${row.type === "会员" ? "—" : row.accountId}</td><td>${row.site}</td><td>${row.type === "会员" ? `<span class="data-tag">${riskTags[index]}</span>` : "—"}</td><td>${row.vip}</td><td>${row.registeredAt}</td><td>${row.transactionType}</td><td>${row.withdrawalType}</td><td><strong class="amount amount-negative">${String(row.amount).replace(/^-/, "")}</strong></td><td><strong class="amount">${row.actual}</strong></td><td>${row.fee}</td><td>${row.withdrawalType === "人民币" ? "ALIPAY,支付宝" : "ERC20"}</td><td>${row.type === "会员" ? "罚罪" : "—"}</td><td class="mono">${row.withdrawalType === "人民币" ? "15588889999" : "0xf59e59348407dc..."}</td><td>—</td><td>${row.type === "会员" ? "mike.risk" : "—"}</td><td>2026-07-17 09:${10 + index}:00</td><td>2026-07-17 09:${20 + index}:00</td><td class="sticky-finance-user-status"><span class="result-tag">${row.userStatus}</span></td><td class="sticky-finance-platform-status"><span class="result-tag">${row.platformStatus}</span></td><td class="sticky-finance-third-status"><span class="result-tag">${row.thirdStatus}</span></td><td class="row-actions sticky-finance-action"><button type="button" class="link-action">查看</button><button type="button" class="link-action">查询三方</button><button type="button" class="link-action finance-withdraw-audit" data-order="${row.order}" data-account-type="${row.type}" data-account="${row.account}">审核</button></td></tr>`).join("");
  }

  function withdrawalAuditContent() {
    return `<section class="risk-filter-panel audit-difference-panel"><div class="unchanged-scope-banner"><strong>生产原筛选区</strong><span>除高亮字段外全部沿用，本次不修改</span></div><div class="risk-filter-grid finance-global-audit-filters"><div class="risk-field unchanged-production"><label>单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field unchanged-production"><label>账号类型</label><select><option>全部类型</option><option>会员</option><option>代理</option><option>站点</option></select></div><div class="risk-field unchanged-production"><label>账号名称</label><input type="text" placeholder="请输入账号名称" /></div><div class="risk-field unchanged-production"><label>账号ID / 编号</label><input type="text" placeholder="请输入账号ID或编号" /></div><div class="risk-field unchanged-production"><label>交易类型</label><select><option>全部交易类型</option><option>提款</option><option>代理提款</option><option>站点提款</option></select></div><div class="risk-field unchanged-production"><label>所属站点</label><input type="text" placeholder="请输入所属站点" /></div><div class="risk-field unchanged-production"><label>风控标签</label><select><option>全部风控标签</option></select></div><div class="risk-field unchanged-production"><label>提款类型</label><select><option>全部提款类型</option><option>人民币</option><option>USDT提币</option></select></div><div class="risk-field unchanged-production"><label>用户状态</label><select><option>全部用户状态</option></select></div><div class="risk-field unchanged-production"><label>平台状态</label><select><option>全部平台状态</option></select></div><div class="risk-field unchanged-production"><label>三方状态</label><select><option>全部三方状态</option></select></div>${financeTimeWithMappingNote(financeTimeRange("F02", "提款申请时间", true), "提款申请时间对应生产【创建时间】", "audit-changed-field")}<div class="unchanged-production unchanged-actions">${financeFilterActions()}</div></div></section>
      <section class="risk-list-card unchanged-production-section audit-table-scope withdrawal-table-scope annotated" data-component-id="T01">${componentBadge("T01")}<div class="unchanged-scope-banner compact"><strong>生产原数据表</strong><span>新增风控审核人、风控后创建时间；提款申请时间对应生产【创建时间】；本表不展示财务审核人</span></div><div class="risk-list-heading"><div><h2>提款审核</h2><span>共 43 条</span></div></div><div class="risk-table-wrap"><table class="risk-table finance-withdraw-audit-table global-withdraw-audit-table"><thead><tr><th class="sticky-finance-order audit-changed-cell">单号</th><th class="sticky-finance-member audit-changed-cell">账号名称</th><th>账号类型</th><th>账号ID / 编号</th><th>站点名称</th><th>风控标签</th><th>VIP等级</th><th>注册日期</th><th>交易类型</th><th>提款类型</th><th>提款金额</th><th>实际到账</th><th>手续费</th><th>银行名称</th><th>账户姓名</th><th>银行账号</th><th>操作备注</th><th class="audit-changed-cell">风控审核人</th><th class="audit-changed-cell">风控后创建时间</th><th class="audit-changed-cell">提款申请时间</th><th class="sticky-finance-user-status audit-changed-cell">用户状态</th><th class="sticky-finance-platform-status audit-changed-cell">平台状态</th><th class="sticky-finance-third-status audit-changed-cell">三方状态</th><th class="sticky-finance-action audit-changed-cell">操作</th></tr></thead><tbody>${withdrawalAuditRows()}</tbody></table></div>${pagination(20, 43)}</section>`;
  }

  function unchangedFinanceContent(page) {
    if (page.key.endsWith("-493")) return `<div class="risk-page-heading"><div><h1>${page.name}</h1></div></div>`;
    const componentId = page.annotations?.some((annotation) => annotation.id === "P01") ? "P01" : "";
    return `<div class="risk-page-heading"><div><h1>${page.name}</h1></div></div><section class="reserved-area unchanged-page${componentId ? " annotated" : ""}"${componentId ? ` data-component-id="${componentId}"` : ""}>${componentId ? componentBadge(componentId) : ""}<div><strong>此页面无任何修改</strong><span>页面内容、字段、权限、数据和交互全部沿用生产现状。</span></div></section>`;
  }

  function financeTabBody(page, activeTab) {
    if (page.key === "deposit-withdraw-settings") {
      if (activeTab === "存款设置") return depositSettingsContent();
      if (activeTab === "提款设置") return `<section class="reserved-area unchanged-page compact"><div><strong>提款设置无修改</strong><span>原有设置内容和逻辑保持生产现状。</span></div></section>`;
      return prohibitedDepositContent();
    }
    if (page.key === "member-transactions") {
      if (activeTab === "存款记录") return financeRecordContent("会员", false, "F01", "T01", ["F02"]);
      return financeRecordContent("会员", true, "F03", "T02", ["F04", "F05"]);
    }
    const subjectType = page.key === "agent-transactions" ? "代理" : "站点";
    return financeRecordContent(subjectType, activeTab.includes("提款"), "", activeTab.includes("提款") ? "T02" : "T01");
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
      return `<tr><td class="sticky-member-account"><div class="member-list-stack"><div class="member-account-line"><strong>${row.account}</strong><button type="button" class="member-status-switch ${row.status === "禁用" ? "off" : ""}${marker("B02")}" data-member="${row.account}" data-status="${row.status === "禁用" ? "启用" : "禁用"}" aria-label="${row.status === "禁用" ? "启用" : "禁用"}${row.account}">${index === 0 ? componentBadge("B02") : ""}<span></span>${row.status}</button></div><span><i>会员ID：</i><b>${row.id}</b></span><span><i>所属站点：</i><b>${row.site}</b></span><span><i>真实姓名：</i><b>${row.realName}</b></span><span><i>性别 / 生日：</i><b>${row.gender} / ${row.birthday}</b></span><span><i>会员等级：</i><b>${row.vip}</b></span><span><i>推荐码：</i><b>${row.referral}</b></span></div></td><td><div class="member-list-stack"><span><i>中心钱包：</i><b>${money(15880 - index * 3920)} CNY</b></span><span><i>锁定钱包：</i><b>${money(index * 280)} CNY</b></span><span><i>场馆钱包：</i><b>${money(3600 - index * 670)} CNY</b></span><span><i>最后投注时间：</i><b>2026-07-${18-index} 22:18:36</b></span><span><i>最后存款成功：</i><b>2026-07-${17-index} 09:28:11</b></span></div></td><td><div class="member-list-stack"><span><i>国家 / 地区：</i><b>${row.region}</b></span><span><i>手机号：</i><b>${row.phone}</b></span><span><i>归属地：</i><b>${row.attribution}</b></span><span><i>QQ：</i><b>${row.qq}</b></span><span><i>微信：</i><b>${row.wechat}</b></span><span><i>邮箱：</i><b>${row.email}</b></span></div></td><td><div class="member-list-stack"><span><i>上级代理：</i><b>${row.agent}</b></span><span><i>代理编号：</i><b>${row.agentNo}</b></span><span><i>代理级别：</i><b>${row.agent === "—" ? "—" : "3级 / 1星"}</b></span><span><i>是否代理：</i><b>否</b></span></div></td><td><div class="member-list-stack"><span><i>注册时间：</i><b>${registerDate}</b></span><span><i>注册IP：</i><b>103.21.18.${21 + index}</b></span><span><i>登录时间：</i><b>${loginDate}</b></span><span><i>登录IP：</i><b>103.21.19.${31 + index}</b></span><span><i>注册类型：</i><b>${row.registerType}</b></span><span><i>注册设备：</i><b>${index ? "Android 14" : "iPhone 15 Pro / iOS 18"}</b></span><span><i>注册域名：</i><b>m.example.test</b></span><span><i>设备号：</i><b>DEV-${index + 1}8F31-A920</b></span><button type="button" class="link-action member-login-log${marker("B04")}" data-member="${row.account}">${index === 0 ? componentBadge("B04") : ""}查看登录日志</button></div></td><td><div class="member-empty-reserved${marker("S01")}">${index === 0 ? componentBadge("S01") : ""}<span>标签</span><b>—</b><span>备注</span><b>—</b></div></td><td class="row-actions member-list-actions"><button type="button" class="link-action member-488-detail${marker("B01")}" data-member="${row.account}">${index === 0 ? componentBadge("B01") : ""}详情</button><button type="button" class="link-action member-488-edit${marker("M01")}" data-member="${row.account}">${index === 0 ? componentBadge("M01") : ""}编辑</button><button type="button" class="link-action member-account-action${marker("B03")}" data-action="一键回收" data-member="${row.account}">${index === 0 ? componentBadge("B03") : ""}一键回收</button><button type="button" class="link-action member-account-action" data-action="修改登录密码" data-member="${row.account}">修改登录密码</button><button type="button" class="link-action member-account-action" data-action="重置提款密码" data-member="${row.account}">重置提款密码</button></td></tr>`;
    }).join("");
  }

  function member488ListContent() {
    return `<div class="risk-page-heading"><div><h1>会员列表</h1></div></div><section class="risk-filter-panel annotated member-488-production-diff" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-list-filters"><div class="risk-field site-field"><label>站点</label><input type="text" placeholder="请输入站点" /><div class="site-options" hidden><button type="button">旺财体育</button><button type="button">新旺体育</button></div></div><div class="risk-field member-account-batch"><label>会员账号</label><input type="text" placeholder="多个账号用英文逗号分隔，最多200个" /></div><div class="risk-field"><label>手机号</label><input type="text" placeholder="请输入手机号" /></div><div class="risk-field"><label>邮箱</label><input type="text" placeholder="请输入邮箱" /></div><div class="risk-field"><label>代理账号</label><input type="text" placeholder="请输入代理账号" /></div><div class="risk-field"><label>代理编号</label><input type="text" placeholder="请输入代理编号" /></div><div class="risk-field"><label>状态</label><select><option>全部状态</option><option>正常</option><option>禁用</option></select></div><div class="risk-field"><label>会员等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP3</option><option>VIP6</option></select></div><div class="risk-field"><label>最近登录IP</label><input type="text" placeholder="请输入IP" /></div><div class="risk-field"><label>注册IP</label><input type="text" placeholder="请输入IP" /></div><div class="risk-field"><label>会员标签</label><select><option>全部标签</option><option>高盈利会员</option><option>普通会员</option></select></div>${member488DateRange("F02", "注册时间范围")}${member488DateRange("F03", "最后登录时间范围")}${filterActions(false)}</div></section><section class="risk-list-card annotated member-488-production-diff" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员列表</h2><span>共 12,680 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-list-table"><thead><tr><th class="sticky-member-account annotated" data-component-id="C02">${componentBadge("C02")}会员信息</th><th>账户信息</th><th>联系信息</th><th>代理信息</th><th>注册登录信息</th><th>标签与备注</th><th>操作</th></tr></thead><tbody>${member488ListRows()}</tbody></table></div>${pagination(20, 12680)}</section>`;
  }

  function memberTagOption(name, system = false) {
    return (system ? memberSystemTagOptions : memberCustomTagOptions).find((tag) => tag.name === name);
  }

  function member488TagChip(name, system = false, removable = false) {
    const tag = memberTagOption(name, system);
    if (!tag) return "";
    const hint = system ? `<span class="functional-tag-hint" tabindex="0" role="note" title="${escapeHtml(tag.description)}" aria-label="${escapeHtml(tag.name)}用途：${escapeHtml(tag.description)}" data-tooltip="${escapeHtml(tag.description)}">?</span>` : "";
    const remove = removable ? `<button type="button" class="member-tag-remove" data-tag-name="${escapeHtml(tag.name)}" data-tag-system="${system}" aria-label="删除${escapeHtml(tag.name)}标签" title="删除标签">×</button>` : "";
    return `<span class="member-tag-chip ${system ? "is-system" : "is-custom"}" data-current-tag="${escapeHtml(tag.name)}" data-tag-system="${system}"><b>${escapeHtml(tag.name)}</b>${hint}${remove}</span>`;
  }

  function hydrateMember488Tags() {
    document.querySelectorAll(".member-list-table tbody tr").forEach((row, index) => {
      const member = row.querySelector(".member-account-line > strong")?.textContent.trim();
      const assignment = memberTagAssignments[member] || { custom: [], system: [], remark: "—" };
      const cell = row.children[5];
      if (!cell) return;
      const currentTags = [...assignment.custom.map((name) => member488TagChip(name)), ...assignment.system.map((name) => member488TagChip(name, true))].join("");
      cell.innerHTML = `<div class="member-tags-current${index === 0 ? ' annotated" data-component-id="S01' : ""}">${index === 0 ? componentBadge("S01") : ""}${currentTags || '<span class="member-no-tags">暂无标签</span>'}</div><div class="member-tag-remark"><span>备注</span><p>${escapeHtml(assignment.remark || "—")}</p></div><button type="button" class="secondary-action member-edit-tags${index === 0 ? ' annotated" data-component-id="M02' : ""}" data-member="${escapeHtml(member)}">${index === 0 ? componentBadge("M02") : ""}编辑标签</button>`;
    });
  }

  function member488BasicContent(page) {
    const group = (title, fields) => `<section><h2>${title}</h2><div class="member-info-grid">${fields.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div></section>`;
    const multi = (...values) => `<span class="member-multi-values">${values.map((value) => `<b>${value}</b>`).join("")}</span>`;
    const body = `<div class="member-profile-groups annotated" data-component-id="P01">${componentBadge("P01")}${group("会员信息", [["所属站点","旺财体育"],["账号状态","正常"],["会员等级","VIP6"],["上级代理","agent_087"],["上级代理编号","AG10386"],["会员标签","高盈利会员、重点观察"]])}${group("个人资料", [["真实姓名","陈小明"],["性别","男"],["生日","1992-08-18"],["手机号","13800138899"],["邮箱","member10086@mail.test"],["QQ","81521086"],["微信","wx_member86"]])}${group("注册信息", [["注册时间","2026-06-12 10:25:00"],["最后登录时间","2026-07-19 16:25:36"],["注册IP","103.21.18.21"],["最近登录IP","103.21.19.31"],["注册设备","iPhone 15 Pro / iOS 18"],["最近登录设备","Chrome Mobile / Android 14"],["注册域名","m.example.test"],["最近登录设备号","DEV-8F31-A920"]])}${group("收款信息", [["银行卡信息",multi("招商银行 6225886500011886","中国银行 6217856100266931")],["EB地址",multi("EB-928351","EB-116820")],["支付宝账户",multi("member10086@alipay.test","13800138899")],["微信账户",multi("wx_member86","wx_member_backup")],["数字人民币账户",multi("DCEP-10886421","DCEP-10886421-02")],["USDT地址",multi("TRC20: TQx8bN7VKL3e2Fm9R4Jc6P1sA5dHv2Nc","ERC20: 0x86d94a62b1705e810a468f1d029ec251")]])}</div>`;
    return member488DetailPage(page, body);
  }

  function member488OverviewContent(page) {
    const headers = ["总输赢", "总有效投注", "总存款", "总提款", "总存提差", "总收入", "总支出", "总红利", "总返水", "总打赏金额", "总打码金额"];
    const values = ["+18,650 CNY", "690,820 CNY", "168,800 CNY", "121,300 CNY", "47,500 CNY", "28,560 CNY", "9,680 CNY", "8,620 CNY", "6,380 CNY", "1,280 CNY", "712,460 CNY"];
    const incomeDetails = [["被转账", "12,800"], ["红包金额", "3,260"], ["额度增加", "12,500"]];
    const bonusDetails = [["会员推荐会员奖励", "1,200"], ["活动奖励", "3,100"], ["人工发彩金", "1,500"], ["VIP周礼金", "820"], ["VIP月礼金", "900"], ["VIP晋升礼金", "700"], ["VIP生日礼金", "400"]];
    const detailCell = (value, details, annotated = false) => `<div class="overview-table-value bonus-hover${annotated ? ' annotated" data-component-id="C01' : ""}" tabindex="0">${annotated ? componentBadge("C01") : ""}<strong class="amount">${value}</strong><div class="bonus-tooltip">${details.map(([name, amount]) => `<span><b>${name}</b><em>${amount}</em></span>`).join("")}</div></div>`;
    const productionIndexes = new Set([0, 1, 2, 3, 10]);
    const cells = values.map((value, index) => `<td class="${productionIndexes.has(index) ? "production-same" : ""}">${index === 5 ? detailCell(value, incomeDetails, true) : index === 7 ? detailCell(value, bonusDetails) : `<strong class="amount">${value}</strong>`}</td>`).join("");
    return member488DetailPage(page, `<section class="risk-filter-panel"><div class="risk-filter-grid">${member488DateRange("F01", "统计时间")}${filterActions()}</div></section><section class="risk-list-card annotated member-488-production-diff" data-component-id="P01">${componentBadge("P01")}<div class="risk-table-wrap"><table class="risk-table member-overview-table"><thead><tr>${headers.map((header, index) => `<th class="${productionIndexes.has(index) ? "production-same" : ""}">${header}</th>`).join("")}</tr></thead><tbody><tr>${cells}</tr></tbody></table></div></section>`);
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
    return member488DetailPage(page, `<section class="member-wallet-toolbar annotated member-488-production-diff" data-component-id="P01">${componentBadge("P01")}<button type="button" class="main-action member-wallet-recycle production-same">一键回收</button><div><span>场馆钱包总计余额</span><strong>10,481.78 CNY</strong><small>全部场馆均为人民币，更新于 2026-07-19 18:28:16</small></div><button type="button" class="secondary-action member-wallet-refresh">↻ 刷新余额</button></section><section class="unchanged-production-section annotated member-wallet-production-scope" data-component-id="T01">${componentBadge("T01")}<div class="member-wallet-grid">${wallets.map(([name,balance,status])=>`<article><strong>${name}</strong><b>${balance}</b><span class="${status === "正常" ? "is-normal" : ""}">${status}</span></article>`).join("")}</div></section>`);
  }

  function member488StatisticsContent(page) {
    const venues = [["DW体育","82,680","79,520","186","+6,820"],["SABA体育","51,300","48,900","102","-3,650"],["FB体育","26,880","24,560","68","+1,260"]];
    const columns = `<colgroup><col class="statistics-seq" /><col class="statistics-venue" /><col /><col /><col /><col /></colgroup>`;
    const totalCells = `<td colspan="2"><strong>总计</strong></td><td><strong class="amount">160,860</strong></td><td><strong class="amount">152,980</strong></td><td><strong>356</strong></td><td><strong class="amount">+4,430</strong></td>`;
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>场馆名称</label><select><option>全部场馆</option><option>DW体育</option><option>SABA体育</option></select></div>${member488DateRange("F01", "下注时间", false)}${filterActions(true)}</div></section><div class="inner-tabs member-category-tabs annotated" data-component-id="N01">${componentBadge("N01")}${["体育","真人","电子","电竞","棋牌","捕鱼","彩票","哈希"].map((x,i)=>`<button class="${i===0?"active":""}">${x}</button>`).join("")}</div><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>场馆统计</h2><span>共 3 个场馆</span></div></div><div class="risk-table-wrap member-statistics-wrap"><table class="risk-table member-statistics-table member-statistics-total-top" aria-label="场馆统计顶部总计">${columns}<tbody><tr class="table-total-row top">${totalCells}</tr></tbody></table><table class="risk-table member-statistics-table">${columns}<thead><tr><th>序号</th><th>场馆名称</th><th>总下注</th><th>有效投注</th><th>注单笔数</th><th>总盈亏（会员视角）</th></tr></thead><tbody>${venues.map((r,i)=>`<tr><td>${i+1}</td><td>${r[0]}</td><td><strong class="amount">${r[1]} CNY</strong></td><td>${r[2]} CNY</td><td>${r[3]}</td><td><strong class="${r[4].startsWith("-")?"amount-negative":"amount"}">${r[4]} CNY</strong></td></tr>`).join("")}</tbody><tfoot><tr class="table-total-row bottom">${totalCells}</tr></tfoot></table></div>${pagination(20,3)}</section>`);
  }

  function member488BetContent(page) {
    const rows = [
      { member: "member_10086", vip: "VIP6", agent: "agent_087 / AG10386", venue: "DB真人", venueType: "真人", game: "经典百家乐", gameType: "国际厅", gameNo: "GB08267193F", activity: "荷官打赏 20", detail: ["厅别：国际厅", "下注：闲", "牌型：庄 ♥7♠J；闲 ♥Q♣Q♦Q", "结果：庄7；闲0"], bet: "20.00", valid: "20.00", result: "20.00", early: "否", second: "否", status: "已结算", times: ["2026-07-19 13:03:41", "—", "2026-07-19 13:04:12"], order: "1286689241258828160", venueOrder: "DB260719130341" },
      { member: "member_10086", vip: "VIP6", agent: "agent_087 / AG10386", venue: "DW体育", venueType: "体育", game: "足球", gameType: "欧洲厅", gameNo: "MATCH-88931", activity: "—", detail: ["足球（2026-07-20 03:00:00）", "世界杯2026：西班牙 v 阿根廷", "2-0 @10（欧洲盘）", "早盘；玩法：全场波胆", "下注时比分：暂无比分"], bet: "200.00", valid: "200.00", result: "-200.00", early: "否", second: "是", status: "已结算", times: ["2026-07-19 13:02:23", "2026-07-20 03:00:00", "2026-07-20 05:18:43"], order: "1286688941858090880", venueOrder: "DW260719130223" },
      { member: "member_10086", vip: "VIP6", agent: "agent_087 / AG10386", venue: "开元棋牌", venueType: "棋牌", game: "炸金花", gameType: "旗舰厅", gameNo: "ROOM-6158", activity: "—", detail: null, bet: "500.00", valid: "480.00", result: "1,240.00", early: "否", second: "否", status: "已结算", times: ["2026-07-19 09:54:51", "—", "2026-07-19 09:55:21"], order: "BMKR4N3KX000010", venueOrder: "KY260719095451" }
    ];
    const body = rows.map((row, index) => `<tr><td class="sticky-member-493-account"><strong>${row.member}</strong></td><td>${row.vip}</td><td>${row.agent}</td><td>${row.venue}</td><td>${row.venueType}</td><td>${row.game}</td><td>${row.gameType}</td><td><strong class="mono">${row.gameNo}</strong></td><td>${row.activity}</td><td>${member493BetDetail(row.detail, row.game, index === 0)}</td><td><strong class="amount">${row.bet}</strong></td><td><strong class="amount">${row.valid}</strong></td><td>${row.result}</td><td>${row.early}</td><td>${row.second}</td><td><span class="result-tag approved">${row.status}</span></td><td>${row.times[0]}</td><td>${row.times[1]}</td><td>${row.times[2]}</td><td><strong class="mono">${row.order}</strong></td><td><strong class="mono">${row.venueOrder}</strong></td></tr>`).join("");
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-493-bet-filters"><div class="risk-field"><label>场馆名称</label><select><option>全部场馆</option><option>DB真人</option><option>DW体育</option><option>开元棋牌</option></select></div><div class="risk-field"><label>场馆类型</label><select><option>全部类型</option><option>真人</option><option>体育</option><option>电子</option><option>棋牌</option></select></div><div class="risk-field"><label>游戏名称</label><input type="text" placeholder="请输入游戏名称" /></div><div class="risk-field"><label>游戏类型</label><input type="text" placeholder="请输入具体厅名称" /></div><div class="risk-field"><label>游戏编号</label><input type="text" placeholder="赛事ID / 局号 / 期号" /></div><div class="risk-field"><label>提前结算</label><select><option>全部</option><option>是</option><option>否</option></select></div><div class="risk-field"><label>二次结算</label><select><option>全部</option><option>是</option><option>否</option></select></div><div class="risk-field"><label>注单号</label><input type="text" placeholder="请输入投注单号" /></div>${member488DateRange("F01", "下注时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated member-488-production-diff" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>已结算投注记录</h2><span>共 356 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-493-bet-table member-488-bet-table"><thead><tr><th class="sticky-member-493-account">会员账号</th><th>会员等级</th><th>上级代理账号/编号</th><th>场馆名称</th><th>场馆类型</th><th>游戏名称</th><th>游戏类型</th><th class="annotated" data-component-id="C02">${componentBadge("C02")}游戏编号</th><th>场馆活动</th><th>下注详情</th><th>下注金额（CNY）</th><th>有效投注（CNY）</th><th>输赢情况（CNY）</th><th>提前结算</th><th>二次结算</th><th>注单状态</th><th>下注时间</th><th>开赛时间</th><th>结算时间</th><th>投注单号</th><th>场馆单号</th></tr></thead><tbody>${body}</tbody></table></div>${pagination(20,356)}</section>`);
  }

  function member488MoneyRecordContent(page, withdrawal = false) {
    const title = withdrawal ? "提款" : "存款";
    const stateOptions = withdrawal ? ["审核中","转账中","拒绝","成功","失败"] : ["确认中","确认失败","确认成功","待支付","用户主动取消"];
    const headers = withdrawal ? ["订单号","订单类型","提款通道","提款金额","到账金额","开户行","银行卡号","币种","汇率","地址","订单时间","风控审核完成时间","风控操作人","风控审核备注","出款完成时间","财务操作人","财务审核备注","状态"] : ["订单号","虚拟币金额","汇率","订单金额","到账金额","上分金额","存款优惠","支付方式","订单时间","确认付款时间","完成时间","状态","取消原因","操作人"];
    const cells = withdrawal ? ["WD2607190086","会员提款","极速出款","5,000","4,980","招商银行","6225 **** 1886","CNY","1.000000","上海市浦东新区","2026-07-19 10:20:18","2026-07-19 10:32:20","mike.risk","正常通过","2026-07-19 11:05:18","mike.finance","已核验","成功"] : ["DP2607190068","—","1.000000","2,000","2,000","2,000","80","支付宝","2026-07-19 09:20:18","2026-07-19 09:21:16","2026-07-19 09:22:08","确认成功","—","mike.finance"];
    const productionHeaders = new Set();
    const headerClass = (header, index) => [index === 0 ? "sticky-member-order with-seq" : index === headers.length - 1 ? "sticky-member-status" : "", productionHeaders.has(header) ? "production-same" : ""].filter(Boolean).join(" ");
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-record-filters"><div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field"><label>订单状态</label><select><option>全部状态</option>${stateOptions.map(x=>`<option>${x}</option>`).join("")}</select></div><div class="risk-field"><label>${withdrawal?"订单类型":"支付方式"}</label><select><option>全部类型</option><option>${withdrawal?"会员提款":"支付宝"}</option></select></div>${member488DateRange("F01", "订单时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated member-488-production-diff" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>${title}信息</h2><span>共 68 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-money-table"><thead><tr><th class="sticky-member-seq">序号</th>${headers.map((header,index)=>`<th class="${headerClass(header,index)}">${header}</th>`).join("")}</tr></thead><tbody>${[0,1,2].map((_,row)=>`<tr><td class="sticky-member-seq">${row+1}</td>${cells.map((cell,index)=>`<td class="${headerClass(headers[index],index)}">${index===0?`<strong class="mono">${cell.slice(0,-1)}${8-row}</strong>`:index===cells.length-1?`<span class="result-tag">${row===2?stateOptions[1]:cell}</span>`:cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${pagination(20,68)}</section>`);
  }

  function member488BonusContent(page) {
    const bonusTypes = ["VIP晋升礼金","VIP周礼金","VIP月礼金","VIP生日礼金","签到奖励","推广首充奖励","推广存款奖励","推广投注返佣","活动任务奖励","指定会员红包","活动彩金","新人首充彩金","余额宝利息"];
    const rows = [
      ["VIP晋升礼金","晋升VIP6礼金","688","中心钱包","中心钱包","1","系统自动","VIP晋升任务"], ["VIP周礼金","VIP6周礼金","188","中心钱包","中心钱包","1","系统自动","每周礼金任务"],
      ["VIP月礼金","VIP6月礼金","588","中心钱包","中心钱包","1","系统自动","每月礼金任务"], ["VIP生日礼金","VIP生日专享礼金","288","中心钱包","中心钱包","1","系统自动","生日礼金任务"],
      ["签到奖励","连续签到7天奖励","18","中心钱包","中心钱包","1","系统自动","签到任务"], ["推广首充奖励","下级会员首充奖励","68","中心钱包","中心钱包","1","系统自动","推广结算"],
      ["推广存款奖励","下级会员存款奖励","36","中心钱包","中心钱包","1","系统自动","推广结算"], ["推广投注返佣","下级会员投注返佣","92","中心钱包","中心钱包","1","系统自动","推广结算"],
      ["活动任务奖励","周末挑战任务奖励","128","中心钱包","中心钱包","3","系统自动","活动任务"], ["指定会员红包","运营定向红包","88","中心钱包","中心钱包","1","人工发放","运营审批"],
      ["活动彩金","体育加码活动彩金","680","场馆钱包","DW体育","3","人工发放","运营审批"], ["新人首充彩金","新人首充专享彩金","108","场馆钱包","PG电子","5","系统自动","首充活动"],
      ["余额宝利息","余额宝每日利息","12.68","中心钱包","中心钱包","1","系统自动","余额宝结算"]
    ];
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-record-filters"><div class="risk-field annotated" data-component-id="C01">${componentBadge("C01")}<label>红利类型</label><select><option>全部类型</option>${bonusTypes.map((type)=>`<option>${type}</option>`).join("")}</select></div><div class="risk-field"><label>发放状态</label><select><option>全部状态</option><option>未发放</option><option>已发放</option></select></div><div class="risk-field"><label>钱包类型</label><select><option>全部钱包</option><option>中心钱包</option><option>场馆钱包</option></select></div><div class="risk-field"><label>钱包名称</label><select><option>全部钱包名称</option><option>中心钱包</option><option>DW体育</option><option>PG电子</option></select></div>${member488DateRange("F01", "红利申请时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>红利信息</h2><span>共 13 条示例</span></div></div><div class="risk-table-wrap"><table class="risk-table member-record-table"><thead><tr><th>序号</th><th>订单号</th><th>红利类型</th><th>红利标题</th><th>红利金额</th><th>钱包类型</th><th>钱包名称</th><th>流水倍数</th><th>发放状态</th><th>申请时间</th><th>发放类型</th><th>审核备注</th><th>发放时间</th></tr></thead><tbody>${rows.map((row,index)=>`<tr><td>${index+1}</td><td><strong class="mono">BN2607${String(1900+index).padStart(4,"0")}</strong></td><td>${row[0]}</td><td>${row[1]}</td><td><strong class="amount">${row[2]} CNY</strong></td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td><td><span class="result-tag approved">已发放</span></td><td>2026-07-${String(19-(index%5)).padStart(2,"0")} 09:30:00</td><td>${row[6]}</td><td>${row[7]}</td><td>2026-07-${String(19-(index%5)).padStart(2,"0")} 10:00:00</td></tr>`).join("")}</tbody></table></div>${pagination(20,13)}</section>`);
  }

  function member488RebateContent(page) {
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-record-filters"><div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field"><label>返水等级</label><select><option>全部等级</option><option>VIP6</option></select></div><div class="risk-field"><label>返水状态</label><select><option>全部状态</option><option>未领取</option><option>已领取</option><option>已过期</option></select></div>${member488DateRange("", "返水日期", false)}${member488DateRange("", "领取日期", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>返水信息</h2><span>共 16 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>序号</th><th>订单号</th><th>返水等级</th><th>返水金额</th><th>流水倍数</th><th>返水生成时间</th><th>领取时间</th><th>过期时间</th><th>状态</th></tr></thead><tbody>${["已领取","未领取","已过期"].map((s,i)=>`<tr><td>${i+1}</td><td><strong class="mono">RB26071${9-i}008${i}</strong></td><td>VIP6</td><td><strong class="amount">${280-i*60} CNY</strong></td><td>${i+1}</td><td>2026-07-${19-i} 02:00:00</td><td>${i===1?"—":`2026-07-${19-i} 10:18:20`}</td><td>2026-07-${26-i} 23:59:59</td><td><span class="result-tag">${s}</span></td></tr>`).join("")}</tbody></table></div>${pagination(20,16)}</section>`);
  }

  function member488ManualContent(page) {
    return member488DetailPage(page, `<section class="member-empty-page annotated" data-component-id="P01">${componentBadge("P01")}<strong>此板块先留空</strong></section>`);
  }

  function member488AdjustmentContent(page) {
    return member488DetailPage(page, `<section class="member-empty-page annotated" data-component-id="P01">${componentBadge("P01")}<strong>此板块先留空</strong></section>`);
  }

  function member488BalanceContent(page) {
    const rows = [["BC2607190088","存款","收入","2,000","13,880","15,880","成功","通过支付宝存款2,000 CNY"],["BC2607190072","代理后台代客充值","收入","1,000","14,880","15,880","成功","代理agent_087代客充值1,000元"],["BC2607190069","场馆转入失败","—","0","15,880","15,880","失败","转入AG真人500 CNY失败"]];
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>账变类型</label><select><option>全部类型</option><option>存款</option><option>提款</option><option>红利</option><option>返水</option><option>账户调整</option><option>手动上下分</option><option>代理后台代客充值</option><option>场馆转入</option><option>场馆转出</option><option>场馆转入失败</option><option>场馆转出失败</option></select></div>${member488DateRange("F01", "账变时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated member-488-production-diff" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>账变记录</h2><span>共 286 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>订单号</th><th>账变类型</th><th>收支方向</th><th>账变金额（CNY）</th><th>账变前金额（CNY）</th><th>账变后金额（CNY）</th><th>账变时间</th><th>执行结果</th><th class="annotated member-balance-note-header" data-component-id="C01">${componentBadge("C01")}备注</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td><strong class="mono">${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td><strong class="amount">${r[3]}</strong></td><td><strong class="amount">${r[4]}</strong></td><td><strong class="amount">${r[5]}</strong></td><td>2026-07-19 ${12-i}:20:18</td><td><span class="result-tag ${r[6]==="失败"?"failed":""}">${r[6]}</span></td><td>${r[7]}</td></tr>`).join("")}</tbody></table></div>${pagination(20,286)}</section>`);
  }

  function member488RiskContent(page) {
    return member488DetailPage(page, `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid">${member488DateRange("F01", "操作时间", false)}${filterActions()}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>风控记录</h2><span>共 12 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-risk-record-table"><thead><tr><th>操作时间</th><th>记录类型</th><th>变更动作</th><th>变更前</th><th>变更后</th><th>操作原因</th><th>操作人账号</th></tr></thead><tbody><tr><td>2026-07-19 10:28:16</td><td>风控标签</td><td><span class="result-tag">新增</span></td><td>—</td><td>大额提款复核</td><td>会员近期提款金额异常</td><td>mike.risk</td></tr><tr><td>2026-07-18 16:03:22</td><td>风控标签</td><td><span class="result-tag">修改</span></td><td>疑似同设备</td><td>同设备重点观察</td><td>补充关联设备核查结论</td><td>amy.risk</td></tr><tr><td>2026-07-17 09:42:10</td><td>会员黑名单</td><td><span class="result-tag failed">拉黑</span></td><td>正常</td><td>已拉黑</td><td>多次触发异常提款规则</td><td>mike.risk</td></tr><tr><td>2026-07-16 14:18:06</td><td>会员黑名单</td><td><span class="result-tag">解黑</span></td><td>已拉黑</td><td>正常</td><td>复核通过，解除限制</td><td>risk.manager</td></tr></tbody></table></div>${pagination(20,12)}</section>`);
  }

  function member488LogBody(tab) {
    if (tab === "行为日志") return `<section class="risk-filter-panel annotated member-log-panel" data-component-id="F02">${componentBadge("F02")}<div class="risk-filter-grid"><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>IP地址</label><input type="text" placeholder="请输入IP地址" /></div><div class="risk-field"><label>执行结果</label><select><option>全部结果</option><option>成功</option><option>失败</option></select></div>${member488DateRange("F02", "行为时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated member-log-panel member-488-production-diff" data-component-id="T02">${componentBadge("T02")}<div class="risk-list-heading"><div><h2>行为日志</h2><span>共 2,186 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-behavior-log-table"><thead><tr><th>序号</th><th class="production-same">日志类型</th><th class="production-same">操作类型</th><th class="production-same">会员ID</th><th>会员账号</th><th class="production-same">站点编码</th><th>IP地址</th><th class="production-same">地区信息</th><th>浏览器 / App</th><th class="production-same">操作系统</th><th>设备信息</th><th class="production-same">执行结果</th><th class="production-same">消息</th><th class="production-same">发生时间</th></tr></thead><tbody><tr><td>1</td><td class="production-same">登录日志</td><td class="production-same">会员登录</td><td class="production-same">10886421</td><td>member_10086</td><td class="production-same">333333</td><td><button type="button" class="link-action member-behavior-relation" data-kind="同IP" data-value="103.21.19.31">103.21.19.31</button></td><td class="production-same">中国 上海</td><td>Chrome Mobile 149</td><td class="production-same">Android 14</td><td><button type="button" class="link-action member-behavior-relation" data-kind="同设备" data-value="DEV-8F31-A920">Pixel 8 / DEV-8F31-A920</button></td><td class="production-same"><span class="result-tag">成功</span></td><td class="production-same">用户登录成功</td><td class="production-same">2026-07-19 16:25:36</td></tr><tr><td>2</td><td class="production-same">登录日志</td><td class="production-same">会员登录</td><td class="production-same">10885137</td><td>summer_728</td><td class="production-same">333333</td><td><button type="button" class="link-action member-behavior-relation" data-kind="同IP" data-value="103.21.19.42">103.21.19.42</button></td><td class="production-same">中国 广东</td><td>iOS App 8.2.1</td><td class="production-same">iOS 18</td><td><button type="button" class="link-action member-behavior-relation" data-kind="同设备" data-value="DEV-931A-2230">iPhone 15 / DEV-931A-2230</button></td><td class="production-same"><span class="result-tag failed">失败</span></td><td class="production-same">登录密码错误</td><td class="production-same">2026-07-19 14:02:18</td></tr></tbody></table></div>${pagination(20,2186)}</section>`;
    return `<section class="risk-filter-panel annotated member-log-panel" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid"><div class="risk-field"><label>操作人</label><input type="text" placeholder="请输入操作人" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>操作来源</label><select><option>全部来源</option><option>会员客户端</option><option>系统</option><option>后台</option></select></div>${member488DateRange("F01", "操作时间", false)}${filterActions(true)}</div></section><section class="risk-list-card annotated member-log-panel" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员日志</h2><span>共 856 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-log-table"><thead><tr><th>序号</th><th>会员账号</th><th>操作菜单</th><th>操作内容</th><th>修改前</th><th>修改后</th><th>修改备注</th><th>操作人</th><th>操作来源</th><th>操作时间</th></tr></thead><tbody><tr><td>1</td><td>member_10086</td><td>会员信息-会员等级</td><td>设置会员等级</td><td>VIP5</td><td>VIP6</td><td>满足晋级条件</td><td>系统</td><td>系统</td><td>2026-07-19 02:00:00</td></tr><tr><td>2</td><td>summer_728</td><td>会员信息-手机号</td><td>修改手机号</td><td>13699881886</td><td>13699882098</td><td>会员提交客服修改</td><td>mike.cs</td><td>后台</td><td>2026-07-18 14:18:20</td></tr></tbody></table></div>${pagination(20,856)}</section>`;
  }

  function member488RelationModal(kind, value) {
    const detailHref = `#requirement/${encodeURIComponent("#488")}/page/member-basic-488`;
    const rows = [["member_10086", "VIP6", "旺财体育", "agent_087 / AG10386", "正常"], ["summer_728", "VIP3", "旺财体育", "star_009 / AG10218", "正常"], ["player_2026", "VIP1", "彩虹站", "—", "禁用"]];
    modal(`${kind}会员列表`, `<div class="relation-query"><span>${escapeHtml(kind)}条件</span><strong>${escapeHtml(value)}</strong></div><div class="risk-table-wrap"><table class="risk-table member-log-relation-table"><thead><tr><th>会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理账号/编号</th><th>账号状态</th></tr></thead><tbody>${rows.map((row) => `<tr><td><a class="member-detail-link" href="${detailHref}" target="_blank" rel="noopener">${row[0]}</a></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td><span class="result-tag ${row[4] === "禁用" ? "failed" : "approved"}">${row[4]}</span></td></tr>`).join("")}</tbody></table></div>${pagination(20, rows.length)}`, "关闭");
  }

  function bindMember488RelationLinks(root = document) {
    root.querySelectorAll(".member-behavior-relation").forEach((button) => {
      if (button.dataset.relationBound) return;
      button.dataset.relationBound = "true";
      button.addEventListener("click", () => member488RelationModal(button.dataset.kind, button.dataset.value));
    });
  }

  function bindMember488OverviewTooltips(root = document) {
    root.querySelectorAll(".overview-table-value").forEach((preview) => {
      const tooltip = preview.querySelector(".bonus-tooltip");
      if (!tooltip || preview.dataset.tooltipBound) return;
      preview.dataset.tooltipBound = "true";
      const positionTooltip = () => {
        const rect = preview.getBoundingClientRect();
        const pane = preview.closest(".prototype-pane")?.getBoundingClientRect();
        const width = Math.min(330, Math.max(240, (pane?.width || window.innerWidth) - 24));
        const leftBoundary = Math.max(12, (pane?.left || 0) + 12);
        const rightBoundary = Math.min(window.innerWidth - 12, (pane?.right || window.innerWidth) - 12);
        const left = Math.max(leftBoundary, Math.min(rect.right - width, rightBoundary - width));
        tooltip.style.position = "fixed";
        tooltip.style.width = `${width}px`;
        tooltip.style.left = `${Math.round(left)}px`;
        tooltip.style.right = "auto";
        tooltip.style.top = `${Math.round(Math.min(rect.bottom + 6, window.innerHeight - Math.min(tooltip.scrollHeight || 260, 420) - 12))}px`;
      };
      preview.addEventListener("mouseenter", positionTooltip);
      preview.addEventListener("focus", positionTooltip);
    });
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

  function member493AccountAdjustmentContent() {
    const rows = [
      ["QA-M2026072022281535", "testsc002", "旺财体育", "人工加分", "CNY", "+100.00", "人工分审核成功", "—", "admin", "2026-07-20 22:28:15", "admin", "额度增减-会员人工上分", "额度增加-会员人工上分", "2026-07-20 22:28:15"],
      ["12T3F59283EC11F1AC9E42F", "testhd000", "旺财体育", "人工减分", "CNY", "-100,000.00", "人工减分审核成功", "TEST_BALANCE", "codex", "2026-07-20 11:35:37", "codex", "按用户指令调整测试额度", "中心钱包及可提款金额各扣减100000", "2026-07-20 11:35:37"]
    ];
    return `<div class="risk-page-heading"><div><h1>账户调整记录</h1></div></div><nav class="inner-tabs member-493-record-tabs" aria-label="记录管理三级菜单"><a class="active" href="#requirement/${encodeURIComponent("#493")}/page/account-adjustment-record-493">账户调整记录</a></nav><section class="production-unchanged-block annotated" data-component-id="P01">${componentBadge("P01")}<div class="production-unchanged-content"><section class="risk-filter-panel"><div class="risk-filter-grid member-493-adjust-filters"><div class="risk-field"><label>单号</label><input type="text" placeholder="请输入单号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号名称" /></div>${siteMultiSelect()}<div class="risk-field"><label>交易类型</label><select><option>全部交易类型</option><option>人工加分</option><option>人工减分</option></select></div><div class="risk-field"><label>状态</label><select><option>全部状态</option><option>审核成功</option><option>审核失败</option></select></div><div class="risk-field"><label>申请人</label><input type="text" placeholder="请输入申请人" /></div><div class="risk-field"><label>审核人</label><input type="text" placeholder="请输入审核人" /></div><div class="risk-field"><label>调整原因</label><select><option>全部调整原因</option></select></div>${member488DateRange("P01", "创建时间", false)}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button><button type="button" class="secondary-action">导出</button><button type="button" class="secondary-action" disabled>下载文件</button></div></div></section><section class="risk-list-card"><div class="risk-table-wrap"><table class="risk-table member-493-adjust-table"><thead><tr><th>单号</th><th>会员账号</th><th>所属站点</th><th>交易类型</th><th>币种</th><th>金额</th><th>状态</th><th>调整原因</th><th>申请人</th><th>申请时间</th><th>审核人</th><th>审核备注</th><th>备注</th><th>创建时间</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<td>${index === 0 ? `<strong class="mono">${cell}</strong>` : index === 5 ? `<strong class="amount">${cell}</strong>` : index === 6 ? `<span class="result-tag approved">${cell}</span>` : cell}</td>`).join("")}</tr>`).join("")}</tbody><tfoot><tr><td><strong>总计</strong></td><td colspan="4">—</td><td><strong class="amount">-99,900.00</strong></td><td colspan="8">—</td></tr></tfoot></table></div>${pagination(20, 2)}</section></div></section>`;
  }

  function member493BetDetail(detail, gameName, annotate = false) {
    const lines = detail?.length ? detail : [`游戏名称：${gameName}`];
    return `<div class="bet-detail-preview member-493-bet-detail${annotate ? ' annotated" data-component-id="C01' : ""}" tabindex="0">${annotate ? componentBadge("C01") : ""}${lines.slice(0, 3).map((line) => `<span>${escapeHtml(line)}</span>`).join("")}<div class="bet-record-tooltip"><b>完整下注详情</b>${lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</div></div>`;
  }

  function member493BetContent() {
    const rows = [
      { member: "testhd000", vip: "VIP6", site: "旺财体育", agent: "agent_087 / AG10386", venue: "DB真人", venueType: "真人", game: "经典百家乐", gameType: "百家乐", gameId: "GB08267193", activity: "荷官打赏 20 CNY", detail: ["厅别：国际厅", "下注：闲", "牌型：庄 ♥7♠J；闲 ♥Q♣Q♦Q", "结果：庄7；闲0"], bet: "20.00", valid: "20.00", result: "赢 20.00 CNY", early: "否", second: "否", fee: "—", status: "已结算", order: "1286689241258828160", venueOrder: "DB260719130341", gameNo: "GB08267193F", times: ["2026-07-19 13:03:41", "—", "2026-07-19 13:04:12", "2026-07-19 13:06:22"] },
      { member: "sports_886", vip: "VIP4", site: "新旺体育", agent: "north_star / AG20318", venue: "DW体育", venueType: "体育", game: "足球", gameType: "串关", gameId: "MATCH-20260720", activity: "—", detail: ["足球（2026-07-20 03:00:00）", "世界杯2026：西班牙 v 阿根廷", "2-0 @10（欧洲盘）", "早盘；玩法：全场波胆", "下注时比分：暂无比分", "足球（2026-07-19 05:00:00）", "世界杯2026：法国 v 英格兰", "3-1 @13.5（欧洲盘）", "早盘；玩法：全场波胆", "下注时比分：暂无比分"], bet: "200.00", valid: "200.00", result: "输 -200.00 CNY", early: "否", second: "是", fee: "—", status: "已结算", order: "1286688941858090880", venueOrder: "DW260719130223", gameNo: "MATCH-88931", times: ["2026-07-19 13:02:23", "2026-07-20 03:00:00", "2026-07-20 05:18:43", "2026-07-20 05:20:10"] },
      { member: "chess_102", vip: "VIP3", site: "彩虹站", agent: "agent_205 / AG12051", venue: "开元棋牌", venueType: "棋牌", game: "炸金花", gameType: "桌台游戏", gameId: "ROOM-6158", activity: "—", detail: null, bet: "500.00", valid: "480.00", result: "赢 1,240.00 CNY", early: "否", second: "否", fee: "3.50 CNY", status: "已结算", order: "BMKR4N3KX000010", venueOrder: "KY260719095451", gameNo: "ROOM-6158", times: ["2026-07-19 09:54:51", "—", "2026-07-19 09:55:21", "2026-07-19 09:57:02"] },
      { member: "lottery_21", vip: "VIP2", site: "旺财体育", agent: "agent_102 / AG10822", venue: "彩票三方", venueType: "彩票", game: "分分彩", gameType: "定位胆", gameId: "ISSUE-11557215", activity: "—", detail: ["玩法：第一球定位胆", "下注：6", "开奖结果：3,9,1,1,6"], bet: "80.00", valid: "80.00", result: "输 -80.00 CNY", early: "否", second: "否", fee: "—", status: "已结算", order: "BMRR4M5DL00001N", venueOrder: "LH260719093836", gameNo: "ISSUE-11557215", times: ["2026-07-19 09:38:36", "—", "2026-07-19 09:39:01", "2026-07-19 09:39:01"] }
    ];
    const body = rows.map((row, index) => `<tr><td class="sticky-member-493-account"><strong>${row.member}</strong></td><td>${row.vip}</td><td>${row.site}</td><td>${row.agent}</td><td>${row.venue}</td><td>${row.venueType}</td><td>${row.game}</td><td>${row.gameType}</td><td><strong class="mono">${row.gameNo}</strong></td><td>${row.activity}</td><td>${member493BetDetail(row.detail, row.game, index === 0)}</td><td><strong class="amount">${row.bet} CNY</strong></td><td><strong class="amount">${row.valid} CNY</strong></td><td>${row.result}</td><td>${row.early}</td><td>${row.second}</td><td>${row.fee}</td><td><span class="result-tag approved">${row.status}</span></td><td>${row.times[0]}</td><td>${row.times[1]}</td><td>${row.times[2]}</td><td>${row.times[3]}</td><td><strong class="mono">${row.order}</strong></td><td><strong class="mono">${row.venueOrder}</strong></td></tr>`).join("");
    return `<div class="risk-page-heading"><div><h1>投注记录</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid member-493-bet-filters">${siteMultiSelect()}<div class="risk-field"><label>场馆名称</label><select><option>全部场馆</option><option>DB真人</option><option>DW体育</option><option>开元棋牌</option></select></div><div class="risk-field"><label>场馆类型</label><select><option>全部类型</option><option>真人</option><option>体育</option><option>电子</option><option>棋牌</option><option>捕鱼</option><option>彩票</option></select></div><div class="risk-field"><label>游戏名称</label><input type="text" placeholder="请输入游戏名称" /></div><div class="risk-field"><label>游戏类型</label><input type="text" placeholder="请输入具体厅名称" /></div><div class="risk-field"><label>游戏编号</label><input type="text" placeholder="赛事ID / 局号 / 期号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>会员类型</label><select><option>全部类型</option><option>官代</option><option>普代</option></select></div><div class="risk-field"><label>VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP2</option><option>VIP3</option></select></div>${agentSmartField("", "上级代理账号/编号")}<div class="risk-field"><label>注单状态</label><select><option>全部状态</option><option>未结算</option><option>已结算</option><option>已取消</option><option>已作废</option></select></div><div class="risk-field"><label>联赛/赛事名称</label><input type="text" placeholder="请输入联赛或赛事名称" /></div><div class="risk-field"><label>提前结算</label><select><option>全部</option><option>是</option><option>否</option></select></div><div class="risk-field"><label>二次结算</label><select><option>全部</option><option>是</option><option>否</option></select></div><div class="risk-field"><label>投注单号</label><input type="text" placeholder="请输入投注单号" /></div>${member488DateRange("F02", "下注时间")}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>投注记录</h2><span>共 52,950 条</span></div></div><div class="risk-table-wrap"><table class="risk-table member-493-bet-table"><thead><tr><th class="sticky-member-493-account">会员账号</th><th>VIP等级</th><th>所属站点</th><th>上级代理账号/编号</th><th>场馆名称</th><th>场馆类型</th><th>游戏名称</th><th>游戏类型</th><th class="annotated" data-component-id="C02">${componentBadge("C02")}游戏编号</th><th>场馆活动</th><th>下注详情</th><th>下注金额</th><th>有效投注</th><th>输赢金额（会员视角）</th><th>提前结算</th><th>二次结算</th><th>服务费</th><th>注单状态</th><th>下注时间</th><th>开赛时间</th><th>结算时间</th><th>同步时间</th><th>投注单号</th><th>场馆单号</th></tr></thead><tbody>${body}</tbody></table></div>${pagination(20, 52950)}</section>`;
  }

  function member493Content(page) {
    if (page.key === "account-adjustment-record-493") return member493AccountAdjustmentContent();
    if (page.key === "bet-records-493") return member493BetContent();
    return unchangedFinanceContent(page);
  }

  function tabPlaceholderContent(page) {
    return `<div class="risk-page-heading"><div><p>风控管理</p><h1>${page.name}</h1></div></div><div class="inner-tabs annotated" data-component-id="N01">${componentBadge("N01")}${page.tabs.map((tab,index)=>`<button class="${index===0?"active":""}">${tab}</button>`).join("")}</div><section class="reserved-area"><div><strong>保持原功能布局不变即可，本原型只做合并形式展示。</strong></div></section>`;
  }

  function emptyPageContent(page) {
    return `<div class="risk-page-heading"><div><p>风控管理</p><h1>${page.name}</h1></div></div><section class="reserved-area annotated" data-component-id="P01">${componentBadge("P01")}<div><strong>页面暂时留白</strong><span>已保留菜单入口，不在需求未明确前虚构字段和交互。</span></div></section>`;
  }

  function mergedRequirementContent(page) {
    const targetPage = page.mergedTargetPage || "exception-agent";
    const linkText = page.mergedLinkText || `查看${page.mergedInto}异常代理原型`;
    return `<div class="risk-page-heading"><div><h1>${page.name}</h1></div></div><section class="merged-requirement-notice"><span>需求合并</span><strong>此需求已合并到${page.mergedInto}中一起实现。</strong><a href="#requirement/${encodeURIComponent(page.mergedInto)}/page/${targetPage}">${linkText}</a></section>`;
  }

  function requirementPageTabs(requirementId, page, items, componentId = "N01") {
    return `<nav class="inner-tabs requirement-page-tabs annotated" data-component-id="${componentId}">${componentBadge(componentId)}${items.map(([key, name]) => `<a href="#requirement/${encodeURIComponent(requirementId)}/page/${key}" class="${page.key === key ? "active" : ""}">${name}</a>`).join("")}</nav>`;
  }

  const member643Tabs = [["member-level-config-643", "会员等级"], ["member-tag-config-643", "标签管理"]];
  const rebate509Tabs = [["rebate-level-config-509", "返水等级"], ["rebate-records-509", "返水记录"], ["no-rebate-games-509", "不返水游戏列表"]];

  const memberVipConfigSites = ["总控默认配置", ...siteOptions];

  function memberVipSiteMeta(site = memberVipConfigSite) {
    const isDefault = site === "总控默认配置";
    const inherited = !isDefault && !memberVipIndependentSites.has(site);
    return { isDefault, inherited, editable: isDefault || !inherited, status: isDefault ? "总控默认配置" : inherited ? "使用总控默认配置" : "本站点单独配置" };
  }

  function memberVipSiteSelector() {
    const selectedMeta = memberVipSiteMeta();
    const selectedLabel = selectedMeta.isDefault || selectedMeta.inherited ? "默认总控" : "单独配置";
    const options = memberVipConfigSites.map((site) => {
      const meta = memberVipSiteMeta(site);
      const label = meta.isDefault || meta.inherited ? "默认总控" : "单独配置";
      return `<button type="button" role="option" aria-selected="${site === memberVipConfigSite}" class="vip-site-option${site === memberVipConfigSite ? " selected" : ""}" data-vip-site="${site}"><span>${site}</span><em class="${label === "单独配置" ? "independent" : ""}">${label}</em></button>`;
    }).join("");
    return `<div class="vip-site-selector"><button type="button" class="vip-site-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span>${memberVipConfigSite}</span><em class="${selectedLabel === "单独配置" ? "independent" : ""}">${selectedLabel}</em><i aria-hidden="true">⌄</i></button><div class="vip-site-options" role="listbox" hidden>${options}</div></div>`;
  }

  function vipSiteConfigPanel({ enableId, restoreId, independentScope }) {
    const meta = memberVipSiteMeta();
    const statusHint = meta.isDefault ? "修改后，所有使用总控默认配置的站点同步生效" : meta.inherited ? "当前只读；如需修改，请先启用本站点单独配置" : "当前站点使用独立配置，不受总控默认配置后续修改影响";
    const siteAction = meta.inherited
      ? `<button type="button" class="main-action vip-site-enable annotated" data-component-id="${enableId}" data-independent-scope="${independentScope}">${componentBadge(enableId)}为本站点单独配置</button>`
      : !meta.isDefault ? `<button type="button" class="secondary-action vip-site-restore annotated" data-component-id="${restoreId}" data-independent-scope="${independentScope}">${componentBadge(restoreId)}恢复使用总控默认</button>` : "";
    return `<section class="vip-site-config-panel${meta.inherited ? " is-inherited" : ""} annotated" data-component-id="P01">${componentBadge("P01")}<div class="vip-site-config-main"><div class="vip-site-field annotated" data-component-id="F01">${componentBadge("F01")}<span class="vip-site-field-label">当前配置站点</span>${memberVipSiteSelector()}</div><div><span>当前使用</span><strong class="config-status ${meta.inherited ? "inherited" : ""}">${meta.status}</strong><small>${statusHint}</small></div></div>${siteAction ? `<div class="vip-site-config-actions">${siteAction}</div>` : ""}</section>`;
  }

  function member509LevelRows() {
    const editable = memberVipSiteMeta().editable;
    const editDisabled = editable ? "" : ' disabled title="当前站点使用总控默认配置，如需编辑请先启用本站点单独配置"';
    const siteFactor = { "总控默认配置": 1, "WC体育": 1, "XY体育": 1.12, "拉布布": 1, "CS体育": 1.05, "YY体育": 1, "NS体育": 1, "DW体育": 1.08 }[memberVipConfigSite] || 1;
    const format = (value) => Math.round(value * siteFactor).toLocaleString("en-US");
    return Array.from({ length: 13 }, (_, index) => {
      const deposit = index === 0 ? 0 : index * index * 500;
      const turnover = index === 0 ? 0 : index * index * 3000;
      const retention = index === 0 ? 0 : index * index * 2000;
      const promotion = index === 0 ? 0 : 8 + (index - 1) * 10;
      const birthday = index < 2 ? 0 : 18 + (index - 2) * 18;
      const weekly = index === 0 ? 0 : 8 + (index - 1) * 10;
      const monthly = index === 0 ? 0 : 18 + (index - 1) * 20;
      const memberCount = Math.max(86, Math.round(68421 / Math.pow(index + 1, 1.65)));
      const annotated = index === 1;
      return `<tr><td class="sticky-vip-level"><strong>VIP${index}</strong></td><td><strong class="amount">${format(deposit)}</strong></td><td><strong class="amount">${format(turnover)}</strong></td><td><strong class="amount">${format(retention)}</strong></td><td>${format(promotion)}</td><td>${format(birthday)}</td><td>${format(weekly)}</td><td>${format(monthly)}</td><td>${index < 4 ? 5 : 10}</td><td>${format(index < 4 ? 200000 : 250000)}</td><td>${format(index < 4 ? 1000000 : 1500000)}</td><td><button type="button" class="link-action vip-member-count${annotated ? ' annotated" data-component-id="C01' : ""}" data-level="VIP${index}">${annotated ? componentBadge("C01") : ""}${memberCount.toLocaleString("en-US")}</button></td><td>${index % 2 ? "mike.ops" : "amy.ops"}</td><td>2026-07-26 23:${String(10 + index).padStart(2, "0")}:16</td><td class="row-actions sticky-vip-action"><button type="button" class="link-action vip-level-config${annotated ? ' annotated" data-component-id="M01' : ""}" data-level="VIP${index}"${editDisabled}>${annotated ? componentBadge("M01") : ""}等级配置</button><button type="button" class="link-action vip-bonus-config${annotated ? ' annotated" data-component-id="M02' : ""}" data-level="VIP${index}"${editDisabled}>${annotated ? componentBadge("M02") : ""}红利配置</button></td></tr>`;
    }).join("");
  }

  function member509LevelContent(page) {
    const meta = memberVipSiteMeta();
    const siteContext = vipSiteConfigPanel({ enableId: "M04", restoreId: "M06", independentScope: "会员等级、红利与VIP返水" });
    const table = `<section class="risk-list-card${meta.inherited ? " vip-config-readonly" : ""} annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>${memberVipConfigSite} · VIP等级配置</h2><span>共 13 个等级${meta.inherited ? " · 当前完整使用总控默认配置" : ""}</span></div></div><div class="risk-table-wrap"><table class="risk-table vip-level-table"><thead><tr><th class="sticky-vip-level">VIP等级</th><th>晋升存款（CNY）</th><th>晋升流水（CNY）</th><th>保级流水（CNY）</th><th>VIP晋升礼金（CNY）</th><th>VIP生日礼金（CNY）</th><th>VIP周礼金（CNY）</th><th>VIP月礼金（CNY）</th><th>日提款次数</th><th>每日CNY提款额度</th><th>每日总提款额度</th><th>会员数量</th><th>最后操作人</th><th>最后操作时间</th><th class="sticky-vip-action">操作</th></tr></thead><tbody>${member509LevelRows()}</tbody></table></div>${pagination(20, 13)}</section>`;
    return `<div class="risk-page-heading vip-page-heading"><div><h1>会员等级</h1><span>总控默认配置与例外站点单独配置</span></div><div class="vip-heading-actions"><button type="button" class="secondary-action vip-algorithm-guide annotated" data-component-id="M07">${componentBadge("M07")}VIP算法说明</button><button type="button" class="secondary-action vip-copy-config annotated" data-component-id="M03">${componentBadge("M03")}VIP文案配置</button></div></div>${requirementPageTabs("#643", page, member643Tabs)}${siteContext}${table}`;
  }

  function member509TagRows(system = false) {
    const rows = (system ? memberSystemTagOptions : memberCustomTagOptions)
      .map((row) => [row.name, row.type, row.description, row.count, row.operator, row.updatedAt]);
    return rows.map((row, index) => `<tr><td>${index + 1}</td><td><strong>${row[0]}</strong>${system ? `<span class="functional-tag-hint" tabindex="0" role="note" title="${escapeHtml(row[2])}" aria-label="${escapeHtml(row[0])}用途：${escapeHtml(row[2])}" data-tooltip="${escapeHtml(row[2])}">?</span>` : ""}</td><td><span class="data-tag">${row[1]}</span></td><td>${row[2]}</td><td><button type="button" class="link-action tag-member-count${index === 0 ? ' annotated" data-component-id="M01' : ""}" data-tag-name="${row[0]}" data-tag-system="${system}">${index === 0 ? componentBadge("M01") : ""}${row[3]}</button></td><td>${row[4]}</td><td>${row[5]}</td><td class="row-actions"><button type="button" class="link-action tag-edit" data-tag-name="${row[0]}" data-system="${system}">${system ? "编辑备注" : "编辑"}</button>${system ? "" : '<button type="button" class="link-action tag-delete">删除</button>'}</td></tr>`).join("");
  }

  function member509TagContent(page) {
    return `<div class="risk-page-heading vip-page-heading"><div><h1>标签管理</h1><span>自定义标签与系统标签统一入口</span></div><button type="button" class="main-action tag-add annotated" data-component-id="B01">${componentBadge("B01")}新增标签</button></div>${requirementPageTabs("#643", page, member643Tabs)}<div class="segmented-control tag-type-tabs annotated" data-component-id="N01"><button type="button" class="active" data-tag-view="custom">自定义标签</button><button type="button" data-tag-view="system">系统标签</button></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid vip-tag-filters"><div class="risk-field"><label>标签名称</label><input type="text" placeholder="请输入标签名称" /></div><div class="risk-field"><label>业务类型</label><select><option>全部类型</option><option>运营标签</option><option>风控标签</option><option>财务标签</option></select></div><div class="risk-field"><label>最后编辑人</label><input type="text" placeholder="请输入管理员账号" /></div>${member488DateRange("F01", "最后编辑时间", false)}${filterActions(false)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2 class="tag-list-title">自定义标签</h2><span class="tag-list-count">共 3 条</span></div></div><div class="risk-table-wrap"><table class="risk-table tag-config-table"><thead><tr><th>序号</th><th>标签名称</th><th>业务类型</th><th>备注</th><th>用户数量</th><th>最后编辑人</th><th>最后编辑时间</th><th>操作</th></tr></thead><tbody class="tag-custom-body">${member509TagRows(false)}</tbody><tbody class="tag-system-body" hidden>${member509TagRows(true)}</tbody></table></div>${pagination(20, 3)}</section><section class="functional-tag-note annotated" data-component-id="S01" hidden>${componentBadge("S01")}<strong>功能性系统标签</strong><span>【不返水】跑返水脚本时排除该用户；【提款挂起】提款时直接进入挂起审核、无需初审。标签名称与作用不可编辑。</span></section>`;
  }

  function vipSettings509Content() {
    const fields = [
      ["晋升流水（≥）", "6,000", "CNY", "C01", 6000], ["晋升存款（≥）", "0", "CNY", "C02", 1000],
      ["晋升礼金", "8", "CNY", "", 8], ["周礼金", "8", "CNY", "", 8],
      ["月礼金", "18", "CNY", "", 8], ["礼金过期时间", "30", "天", "", 0], ["礼金流水倍数", "1", "倍", "", 0]
    ];
    const benefits = [["日提款次数", "5"], ["RMB每日额度", "200,000"], ["每日总额度", "1,000,000"]];
    const card = (level, active = false) => `<article class="production-vip-card${active ? " active" : ""}"><header class="unchanged-production"><div class="production-vip-badge"><span>VIP</span><strong>${level}</strong></div><div><h2>VIP ${level}</h2><span>等级标识</span></div><button type="button" aria-label="删除VIP${level}">×</button></header><div class="production-vip-card-body"><section class="production-vip-fields">${fields.map(([label, value, unit, componentId, step]) => `<label class="${componentId ? `production-vip-field-changed annotated" data-component-id="${componentId}` : "unchanged-production"}">${componentId ? componentBadge(componentId) : ""}<span>${label}</span><div><input type="number" min="0" value="${Number(value.replaceAll(",", "")) + level * step}" /><em>${unit}</em></div></label>`).join("")}</section><section class="production-vip-benefits unchanged-production"><h3>VIP 提款福利</h3>${benefits.map(([label, value]) => `<label><span>${label}</span><input type="number" value="${Number(value.replaceAll(",", "")) + level * 2}" /></label>`).join("")}</section></div></article>`;
    return `<div class="production-vip-settings"><header class="production-vip-heading unchanged-production"><div><span class="production-vip-title-icon">V</span><div><h1>会员VIP等级与返水设置</h1><p>统一配置VIP等级门槛及各等级对应福利</p></div></div><div><label>站点<select disabled><option>总站</option></select></label><button type="button" class="secondary-action">＋ 新增等级</button><button type="button" class="main-action">保存全部配置</button></div></header><section class="production-vip-tip unchanged-production"><strong>配置说明</strong><span>在此页面设置每个VIP等级的晋升要求、礼金规则和提款福利。</span></section><section class="production-vip-list annotated" data-component-id="T01">${componentBadge("T01")}${card(0, true)}${card(1)}${card(2)}</section><button type="button" class="main-action production-vip-add unchanged-production">＋ 新增 VIP 等级体系</button></div>`;
  }

  function rebate512LevelRows() {
    const editable = memberVipSiteMeta().editable;
    const editDisabled = editable ? "" : ' disabled title="当前站点使用总控默认配置，如需编辑请先启用本站点单独配置"';
    const rows = [
      ["VIP0", "100", "5,000", "1天", "1", "3", "28", "mike.ops", "2026-07-23 19:06:12"],
      ["VIP1", "200", "10,000", "1天", "1", "4", "46", "mike.ops", "2026-07-23 19:08:30"],
      ["VIP2", "500", "20,000", "2天", "1", "5", "73", "amy.ops", "2026-07-23 19:12:44"],
      ["VIP3", "1,000", "50,000", "2天", "1.5", "6", "112", "amy.ops", "2026-07-23 19:18:03"],
      ["VIP4", "2,000", "100,000", "3天", "2", "7", "168", "mike.ops", "2026-07-23 19:22:51"]
    ];
    return rows.map((row, index) => `<tr><td class="sticky-rebate-level"><strong>${row[0]}</strong></td><td><strong class="amount">${row[1]} CNY</strong></td><td><strong class="amount">${row[2]} CNY</strong></td><td>${row[3]}</td><td>${row[4]} 倍</td><td>${row[5]}</td><td>${row[6]}</td><td>${row[7]}</td><td>${row[8]}</td><td class="row-actions sticky-rebate-action"><button type="button" class="link-action rebate-setting${index === 1 ? ' annotated" data-component-id="M01' : ""}" data-level="${row[0]}"${editDisabled}>${index === 1 ? componentBadge("M01") : ""}设置</button><button type="button" class="link-action rebate-view${index === 1 ? ' annotated" data-component-id="B01' : ""}" data-level="${row[0]}">${index === 1 ? componentBadge("B01") : ""}详情</button></td></tr>`).join("");
  }

  function rebate512LevelContent(page) {
    const meta = memberVipSiteMeta();
    const siteContext = vipSiteConfigPanel({ enableId: "M02", restoreId: "M03", independentScope: "VIP返水" });
    return `<div class="risk-page-heading vip-page-heading"><div><h1>返水等级</h1><span>总控默认配置与例外站点单独配置</span></div></div>${requirementPageTabs("#509", page, rebate509Tabs)}${siteContext}<section class="risk-list-card${meta.inherited ? " vip-config-readonly" : ""} annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>${memberVipConfigSite} · 返水等级配置</h2><span>共 5 个等级${meta.inherited ? " · 当前完整使用总控默认配置" : ""}</span></div></div><div class="risk-table-wrap"><table class="risk-table rebate-level-table"><thead><tr><th class="sticky-rebate-level">VIP等级</th><th>每日最高返水</th><th>最低流水要求</th><th>领取有效期</th><th>返水流水倍数</th><th>单独配置的场馆</th><th>单独配置的游戏</th><th>最后操作人</th><th>最后操作时间</th><th class="sticky-rebate-action">操作</th></tr></thead><tbody>${rebate512LevelRows()}</tbody></table></div>${pagination(20, 5)}</section>`;
  }

  function rebate512RecordContent(page) {
    const rows = [
      ["RB202607230086", "WC体育", "member_10086", "agent_087 / AG10386", "VIP3", "168.42", "1.5", "2026-07-23 01:12:06", "2026-07-23 09:36:18", "2026-07-25 01:12:06", "部分领取"],
      ["RB202607230085", "XY体育", "evan888", "agent_102 / AG10822", "VIP2", "88.16", "1", "2026-07-23 01:11:52", "—", "2026-07-25 01:11:52", "未领取"],
      ["RB202607220312", "CS体育", "mike_test", "agent_205 / AG12051", "VIP1", "26.80", "1", "2026-07-22 01:10:18", "—", "2026-07-23 01:10:18", "已过期"]
    ];
    const body = rows.map((row, index) => `<tr><td class="sticky-rebate-order"><strong class="mono">${row[0]}</strong></td><td>${row[1]}</td><td class="sticky-rebate-member"><a class="member-detail-link" href="javascript:void(0)">${row[2]}</a></td><td>${row[3]}</td><td>${row[4]}</td><td><button type="button" class="link-action rebate-detail${index === 0 ? ' annotated" data-component-id="M01' : ""}" data-order="${row[0]}" data-member="${row[2]}" data-amount="${row[5]}">${index === 0 ? componentBadge("M01") : ""}${row[5]} CNY</button></td><td>${row[6]} 倍</td><td>${row[7]}</td><td>${row[8]}</td><td>${row[9]}</td><td class="sticky-rebate-status"><span class="result-tag ${row[10] === "已领取" ? "approved" : row[10] === "已过期" ? "rejected" : row[10] === "部分领取" ? "pending" : ""}">${row[10]}</span></td></tr>`).join("");
    return `<div class="risk-page-heading vip-page-heading"><div><h1>返水记录</h1><span>生成、领取与过期全链路</span></div></div>${requirementPageTabs("#509", page, rebate509Tabs)}<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid rebate-record-filters">${siteMultiSelect()}<div class="risk-field"><label>返水订单号</label><input type="text" placeholder="请输入返水订单号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div>${agentSmartField("", "上级代理账号/编号")}<div class="risk-field"><label>返水状态</label><select><option>全部状态</option><option>未领取</option><option>部分领取</option><option>已领取</option><option>已过期</option></select></div>${member488DateRange("F02", "返水生成时间")}${member488DateRange("F03", "返水领取时间")}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>返水记录</h2><span>共 628 条</span></div></div><div class="risk-table-wrap"><table class="risk-table rebate-record-table"><thead><tr><th class="sticky-rebate-order">订单号</th><th>所属站点</th><th class="sticky-rebate-member">会员账号</th><th>上级代理</th><th>返水等级</th><th>返水金额</th><th>流水倍数</th><th>返水生成时间</th><th>领取时间</th><th>过期时间</th><th class="sticky-rebate-status">返水状态</th></tr></thead><tbody>${body}</tbody></table></div>${pagination(20, 628)}</section>`;
  }

  function rebate512ExcludedContent(page) {
    const rows = [
      { site: "总控默认", vip: "VIP3", venueType: "电子", venue: "PP电子", game: "疯狂大鲈鱼竞赛" },
      { site: "WC体育", vip: "VIP5", venueType: "电子", venue: "CQ9电子", game: "鸿福齐天" },
      { site: "总控默认", vip: "VIP7", venueType: "电子", venue: "DB电子", game: "赤壁之战" },
      { site: "XY体育", vip: "VIP2", venueType: "电子", venue: "JDB电子", game: "芝麻开门 Mega" },
      { site: "总控默认", vip: "VIP10", venueType: "电子", venue: "FC电子", game: "锦鲤跃钱" }
    ];
    const defaultSites = siteOptions.filter((site) => !memberVipIndependentSites.has(site));
    const defaultSiteCell = `<span class="default-rebate-site bonus-hover" tabindex="0" aria-label="总控默认，当前适用站点：${defaultSites.map(escapeHtml).join("、")}"><strong>总控默认</strong><span class="bonus-tooltip default-rebate-site-tooltip" role="tooltip"><b>使用总控默认的站点</b><span>${defaultSites.map(escapeHtml).join("、")}</span></span></span>`;
    const venueOptions = rebateVenueCatalog.filter((venue) => venue.type === "电子").map((venue) => `<option>${escapeHtml(venue.name)}</option>`).join("");
    return `<div class="risk-page-heading vip-page-heading"><div><h1>不返水游戏列表</h1><span>只读查询</span></div></div>${requirementPageTabs("#509", page, rebate509Tabs)}<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid excluded-game-filters">${siteMultiSelect()}<div class="risk-field"><label>场馆名称</label><select><option>全部电子场馆</option>${venueOptions}</select></div><div class="risk-field"><label>游戏名称</label><input type="text" placeholder="请输入游戏名称" /></div>${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>不返水游戏</h2><span>共 28 条</span></div></div><div class="risk-table-wrap"><table class="risk-table excluded-game-table"><thead><tr><th>序号</th><th>所属站点</th><th>VIP等级</th><th>场馆类型</th><th>场馆名称</th><th>游戏名称</th><th>最后更新时间</th></tr></thead><tbody>${rows.map((row, index) => `<tr><td>${index + 1}</td><td>${row.site === "总控默认" ? defaultSiteCell : escapeHtml(row.site)}</td><td><strong>${escapeHtml(row.vip)}</strong></td><td><span class="data-tag">${escapeHtml(row.venueType)}</span></td><td>${escapeHtml(row.venue)}</td><td><strong>${escapeHtml(row.game)}</strong></td><td>2026-07-23 ${String(12 + index).padStart(2, "0")}:20:16</td></tr>`).join("")}</tbody></table></div>${pagination(20, 28)}</section>`;
  }

  const memberVipMobileKeys = [
    "member-vip-center-509", "member-electronic-rebate-509",
    "member-vip-center-643", "member-vip-detail-643", "member-vip-rules-643", "member-settings-643", "member-profile-643"
  ];

  function memberMobilePrototypeNav(activeKey) {
    const phaseTwo = activeKey.endsWith("-643");
    const requirementId = phaseTwo ? "#643" : "#509";
    const pages = phaseTwo
      ? [["member-vip-center-643", "VIP页面"], ["member-settings-643", "设置"], ["member-profile-643", "个人资料"]]
      : [["member-vip-center-509", "VIP页面"], ["member-electronic-rebate-509", "电子返水明细"]];
    const active = ["member-vip-detail-643", "member-vip-rules-643"].includes(activeKey) ? "member-vip-center-643" : activeKey;
    return `<nav class="member-mobile-prototype-nav" aria-label="会员端原型页面切换"><span>会员端页面</span><div>${pages.map(([key, name]) => `<a class="${active === key ? "active" : ""}" href="#requirement/${encodeURIComponent(requirementId)}/page/${key}">${name}</a>`).join("")}</div><small>原型评审导航，不属于生产功能</small></nav>`;
  }

  function mobileVipFrame(content, extraClass = "") {
    return `<div class="member-mobile-frame ${extraClass}"><div class="mobile-status-bar"><strong>18:30</strong><span>● ● ●　87%</span></div>${content}</div>`;
  }

  function memberVipMobileHeader(title, backKey = "", rightAction = "") {
    const requirementId = backKey.endsWith("-643") ? "#643" : "#509";
    const back = backKey ? `<a class="mobile-back" href="#requirement/${encodeURIComponent(requirementId)}/page/${backKey}" aria-label="返回">‹</a>` : '<button type="button" class="mobile-back" aria-label="返回">‹</button>';
    return `<header class="member-mobile-header">${back}<h1>${title}</h1>${rightAction || '<span class="mobile-header-placeholder"></span>'}</header>`;
  }

  function memberVipPerks(level) {
    const next = level === 0;
    const values = next
      ? [["5", "日提款次数", "次"], ["200,000", "每日CNY提款额度", "¥"], ["1,000,000", "每日总提款额度", "¥"], ["0", "VIP晋升礼金", "¥"], ["0", "VIP周礼金", "¥"], ["0", "VIP月礼金", "¥"]]
      : [["5", "日提款次数", "次"], ["200,000", "每日CNY提款额度", "¥"], ["1,000,000", "每日总提款额度", "¥"], ["8", "VIP晋升礼金", "¥"], ["8", "VIP周礼金", "¥"], ["18", "VIP月礼金", "¥"]];
    const symbols = ["#", "¥", "Σ", "↑", "7", "30"];
    return values.map((item, index) => `<div class="member-vip-perk"><span class="perk-symbol" aria-hidden="true">${symbols[index]}</span><div><strong>${item[2]}${item[0]}</strong><small>${item[1]}</small></div></div>`).join("");
  }

  function memberVipRebateSummary(phaseTwo = false) {
    const values = [["0.4%", "体育返水"], ["0.4%", "真人返水"], ["0.5%", "电竞返水"], ["0.5%", "棋牌返水"], ["0.0%", "彩票返水"], ["0.8%", "电子返水"], ["0.1%", "捕鱼返水"]];
    const detailHref = `#requirement/${encodeURIComponent("#509")}/page/member-electronic-rebate-509`;
    return `<section class="member-vip-rebate-summary"><h2><span></span><b>VIP0返水比例</b><span></span></h2><div>${values.map(([rate, label]) => label === "电子返水" ? `<a class="member-electronic-rebate-link${phaseTwo ? " unchanged-production" : ' annotated" data-component-id="B01'}" href="${detailHref}">${phaseTwo ? "" : componentBadge("B01")}<strong>${rate}</strong><span>${label}</span><small>查看明细 ›</small></a>` : `<article class="unchanged-production"><strong>${rate}</strong><span>${label}</span></article>`).join("")}</div></section>`;
  }

  function memberVipCenter509Content(page) {
    const phaseTwo = page.key.endsWith("-643");
    const detailHref = `#requirement/${encodeURIComponent("#643")}/page/member-vip-detail-643`;
    const currentDeposit = phaseTwo
      ? `<div class="deposit-progress unchanged-production"${memberVipDepositProgressVisible ? "" : " hidden"}><span>晋升存款</span><b>1,000 / 1,000</b><i><em style="width:100%"></em></i></div>`
      : `<div class="deposit-progress annotated" data-component-id="P01"${memberVipDepositProgressVisible ? "" : " hidden"}>${componentBadge("P01")}<span>晋升存款</span><b>1,000 / 1,000</b><i><em style="width:100%"></em></i></div>`;
    const nextDeposit = phaseTwo
      ? `<div class="unchanged-production"${memberVipDepositProgressVisible ? "" : " hidden"}><dt>晋升存款要求</dt><dd>1,000</dd></div>`
      : `<div class="annotated" data-component-id="P02"${memberVipDepositProgressVisible ? "" : " hidden"}>${componentBadge("P02")}<dt>晋升存款要求</dt><dd>1,000</dd></div>`;
    return mobileVipFrame(`${memberVipMobileHeader("VIP尊享中心").replace('class="member-mobile-header"', 'class="member-mobile-header unchanged-production"')}
      <section class="member-vip-profile unchanged-production"><span class="member-vip-avatar">MK</span><div><strong>Mike966 <em>VIP0</em></strong><small>加入平台第12天</small></div></section>
      <section class="member-benefit-strip unchanged-production"><div><span class="benefit-mark">礼</span><p>待领取福利礼金<strong>¥0</strong></p></div><button type="button">福利领取</button></section>
      <section class="member-vip-carousel"><div class="member-vip-card-track" tabindex="0">
        <button type="button" class="member-vip-card current" data-vip-level="0"><span class="vip-card-watermark unchanged-production">VIP</span><header class="unchanged-production"><div><strong>VIP0</strong><small>当前等级</small></div><span class="vip-emblem">0</span></header><div class="vip-progress-group">${currentDeposit}<div class="unchanged-production"><span>晋升流水</span><b>4,200 / 6,000</b><i><em style="width:70%"></em></i></div></div></button>
        <button type="button" class="member-vip-card next" data-vip-level="1"><span class="vip-card-watermark unchanged-production">VIP</span><header class="unchanged-production"><div><strong>VIP1</strong><small>尚未达成</small></div><span class="vip-emblem muted">1</span></header><dl>${nextDeposit}<div class="unchanged-production"><dt>晋升流水要求</dt><dd>6,000</dd></div><div class="unchanged-production"><dt>90天保级流水要求</dt><dd>4,000</dd></div></dl></button>
      </div><div class="member-vip-card-dots unchanged-production" aria-hidden="true"><i class="active"></i><i></i></div></section>
      <section class="member-vip-privileges annotated" data-component-id="N01">${componentBadge("N01")}<div class="member-production-same-scope"><h2><span></span><b class="member-vip-perk-title">VIP0尊享特权</b><span></span></h2><div class="member-vip-perk-grid" data-vip-perks="0">${memberVipPerks(0)}</div><div class="member-vip-perk-grid" data-vip-perks="1" hidden>${memberVipPerks(1)}</div></div>${memberVipRebateSummary(phaseTwo)}
        ${phaseTwo ? `<a class="member-vip-detail-link annotated" data-component-id="B01" href="${detailHref}">${componentBadge("B01")}<div><strong>查看VIP详情</strong><small>完整等级福利、返水比例与提款额度</small></div><span>›</span></a>` : ""}
      </section>`, "member-vip-center");
  }

  function memberElectronicRebateContent() {
    const venues = rebateVenueCatalog.filter((venue) => venue.type === "电子");
    const currentLevel = 0;
    const rateFor = (level, venueIndex, gameIndex) => {
      const seed = level * 31 + venueIndex * 17 + gameIndex;
      if (seed % 97 === 0) return 0;
      return Number((0.5 + level * 0.03 + (seed % 9) * 0.01).toFixed(2));
    };
    const rows = venues.map((venue, venueIndex) => {
      const games = venue.games.length ? venue.games : ["暂无游戏数据"];
      return games.map((game, gameIndex) => {
        const rate = venue.games.length ? rateFor(currentLevel, venueIndex, gameIndex) : null;
        return `<tr><td><strong>${escapeHtml(venue.name)}</strong></td><td>${escapeHtml(game)}</td><td>${rate === null ? "—" : `<strong>${rate.toFixed(2)}%</strong>${rate === 0 ? '<small class="no-rebate">不返水</small>' : ""}`}</td></tr>`;
      }).join("");
    }).join("");
    return mobileVipFrame(`${memberVipMobileHeader("电子返水明细", "member-vip-center-509")}<main class="member-electronic-rebate-page"><section class="electronic-rebate-overview"><span>当前会员VIP等级</span><strong>VIP${currentLevel}</strong></section><section class="member-electronic-rebate-table annotated" data-component-id="T01">${componentBadge("T01")}<div class="member-electronic-rebate-table-scroll"><table><thead><tr><th>场馆</th><th>游戏名称</th><th>返水比例</th></tr></thead><tbody>${rows}</tbody></table></div></section></main>`, "member-electronic-rebate");
  }

  function memberVipBenefitTab() {
    const levels = Array.from({ length: 13 }, (_, level) => ({
      level: `VIP${level}`,
      weeklyRequirement: level === 0 ? 0 : level * level * 3000,
      monthlyRequirement: level === 0 ? 0 : level * level * 12000,
      upgrade: level === 0 ? 0 : 8 + level * 10,
      birthday: level === 0 ? 0 : level * 18,
      weekly: level === 0 ? 0 : 8 + level * 10,
      monthly: level === 0 ? 0 : 18 + level * 20
    }));
    const columns = [
      ["weeklyRequirement", "周礼金有效投注要求"], ["monthlyRequirement", "月礼金有效投注要求"],
      ["upgrade", "VIP晋升礼金"], ["birthday", "VIP生日礼金"], ["weekly", "VIP周礼金"], ["monthly", "VIP月礼金"]
    ].filter(([key]) => levels.some((item) => Number(item[key]) !== 0));
    const rows = levels.map((item) => `<tr><th>${item.level}</th>${columns.map(([key]) => `<td>${Number(item[key]).toLocaleString("en-US")}</td>`).join("")}</tr>`).join("");
    return `<section class="mobile-vip-benefit-note"><strong>VIP福利说明</strong><p>VIP福利根据会员当前VIP等级计算。周礼金和月礼金需满足对应周期的有效投注要求，达到领取条件后可在福利中心领取。</p><p>各项福利的领取时间和有效期以实际规则为准。</p></section><section class="mobile-vip-table-block annotated" data-component-id="T01">${componentBadge("T01")}<div class="mobile-vip-table-scroll"><table><thead><tr><th>VIP等级</th>${columns.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function memberVipRebateTableRows() {
    const venues = [
      ["电子", "PG电子", ["马上赢", "地狱狂想", "美食夏日祭"]],
      ["真人", "DB真人", ["经典百家乐", "极速轮盘", "龙虎"]],
      ["体育", "DW体育", ["足球", "篮球", "网球"]],
      ["棋牌", "开元棋牌", ["炸金花", "德州扑克", "抢庄牛牛"]]
    ];
    return Array.from({ length: 13 }, (_, level) => venues.map(([type, venue, games], venueIndex) => games.map((game, gameIndex) => {
      const rate = level === 0 && venueIndex === 3 && gameIndex === 2 ? "0% · 不返水" : `${(0.1 + level * 0.06 + venueIndex * 0.05 + gameIndex * 0.03).toFixed(2)}%`;
      const vipCell = venueIndex === 0 && gameIndex === 0 ? `<th rowspan="${venues.reduce((total, item) => total + item[2].length, 0)}" scope="rowgroup">VIP${level}</th>` : "";
      const venueCell = gameIndex === 0 ? `<td rowspan="${games.length}" class="rebate-venue-merged"><span>${type}</span><strong>${venue}</strong></td>` : "";
      return `<tr>${vipCell}${venueCell}<td>${game}</td><td><strong class="${rate.includes("不返水") ? "no-rebate" : ""}">${rate}</strong></td></tr>`;
    }).join("")).join("")).join("");
  }

  function memberVipRebateTable() {
    return `<section class="mobile-vip-rebate-table annotated" data-component-id="T02">${componentBadge("T02")}<div class="mobile-vip-table-scroll"><table><thead><tr><th>VIP等级</th><th>场馆</th><th>游戏</th><th>返水比例</th></tr></thead><tbody>${memberVipRebateTableRows()}</tbody></table></div></section>`;
  }

  function memberVipWithdrawalTab() {
    const rows = Array.from({ length: 13 }, (_, level) => { const count = level < 4 ? 5 : level < 8 ? 10 : 15; const daily = 200000 + level * 50000; const total = 1000000 + level * 250000; return `<tr><th>VIP${level}</th><td>${count}</td><td>${daily.toLocaleString("en-US")}</td><td>${total.toLocaleString("en-US")}</td></tr>`; }).join("");
    return `<section class="mobile-vip-table-block annotated" data-component-id="T03">${componentBadge("T03")}<div class="mobile-vip-table-scroll"><table class="mobile-withdrawal-table"><thead><tr><th>VIP等级</th><th>日提款次数</th><th>每日CNY提款额度</th><th>每日总提款额度</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function memberVipDetailTabContent(tab) {
    if (tab === "返水比例") return memberVipRebateTable();
    if (tab === "提款额度") return memberVipWithdrawalTab();
    return memberVipBenefitTab();
  }

  function memberVipDetail509Content(page) {
    const rulesHref = `#requirement/${encodeURIComponent("#643")}/page/member-vip-rules-643`;
    const tabs = ["VIP福利", "返水比例", "提款额度"];
    const rebateTableView = memberVipDetailTab === "返水比例";
    return mobileVipFrame(`${memberVipMobileHeader("VIP详情", "member-vip-center-643", `<a class="mobile-rule-link annotated" data-component-id="B01" href="${rulesHref}">${componentBadge("B01")}VIP规则</a>`)}<nav class="mobile-vip-detail-tabs annotated" data-component-id="N02">${componentBadge("N02")}${tabs.map((tab) => `<button type="button" class="${memberVipDetailTab === tab ? "active" : ""}" data-vip-detail-tab="${tab}">${tab}</button>`).join("")}</nav><main class="mobile-vip-detail-body${rebateTableView ? " rebate-table-view" : ""}">${memberVipDetailTabContent(memberVipDetailTab)}</main>`, "member-vip-detail");
  }

  function memberVipRules509Content() {
    const rules = [
      ["晋升标准", "晋升存款和晋升流水同时达到下一等级要求后，平台将在次日14:00统一完成VIP升级。"],
      ["晋升顺序", "每次结算最多提升一个VIP等级，不支持越级晋升。升级后超出当前门槛的存款和流水不结转。"],
      ["保级要求", "升级成功后开始计算90天保级周期。周期内达到当前等级保级流水要求，等级保持不变并重新开始下一周期。"],
      ["降级标准", "保级期满未达到要求时，VIP等级固定降低一级，并按降级后的等级重新计算升级进度和保级周期。"],
      ["VIP晋升礼金", "会员实际升级成功后生成对应等级的晋升礼金，每个等级每位会员仅可获得一次。"],
      ["VIP生日礼金", "注册满90天的会员可在生日当天按当前VIP等级领取生日礼金，每年限领一次。"],
      ["VIP周礼金", "达到上一周期对应的有效投注要求后，可在规定时间内领取当前VIP等级的周礼金。"],
      ["VIP月礼金", "达到上一周期对应的有效投注要求后，可在规定时间内领取当前VIP等级的月礼金。"],
      ["晋级优惠", "领取晋级优惠后开始计算活动有效流水，具体适用场馆和领取条件以页面展示为准。"],
      ["VIP晋级", "晋级优惠只可申请当前VIP等级对应的指定场馆优惠。"],
      ["VIP返水", "返水按照有效投注、会员VIP等级及具体游戏返水比例计算，生成后可在福利中心查看和领取。"]
    ];
    return mobileVipFrame(`${memberVipMobileHeader("VIP规则说明", "member-vip-detail-643")}<main class="mobile-vip-rules annotated" data-component-id="P01">${componentBadge("P01")}<p class="mobile-rules-intro">以下规则由总控后台统一维护，实际门槛、金额和有效期以页面最新展示为准。</p>${rules.map(([title, content], index) => `<section><span>${String(index + 1).padStart(2, "0")}</span><div><h2>${title}</h2><p>${content}</p></div></section>`).join("")}</main>`, "member-vip-rules");
  }

  function memberSettings509Content() {
    const profileHref = `#requirement/${encodeURIComponent("#643")}/page/member-profile-643`;
    const items = [
      ["person", "个人资料", "完善性别、生日及联系方式", profileHref, "B01"],
      ["lock", "修改登录密码", "", "javascript:void(0)"],
      ["shield", "谷歌验证", "未绑定", "javascript:void(0)"],
      ["clean", "清除缓存", "12.6 MB", "javascript:void(0)"]
    ];
    const icon = (type) => ({ person: "人", lock: "锁", shield: "盾", clean: "清" }[type]);
    const rows = items.map(([type, name, meta, href, id], index) => `<a class="member-settings-row${id ? " annotated" : index === 1 ? " member-production-same-item annotated" : " unchanged-production"}"${id ? ` data-component-id="${id}"` : index === 1 ? ' data-component-id="N01"' : ""} href="${href}">${id ? componentBadge(id) : index === 1 ? componentBadge("N01") : ""}<span class="member-settings-icon ${type}" aria-hidden="true">${icon(type)}</span><div><strong>${name}</strong>${meta ? `<small>${meta}</small>` : ""}</div><span class="member-settings-arrow">›</span></a>`).join("");
    return mobileVipFrame(`${memberVipMobileHeader("设置").replace('class="member-mobile-header"', 'class="member-mobile-header unchanged-production"')}<main class="member-settings-page"><section class="member-settings-list">${rows}</section><button type="button" class="member-logout-action unchanged-production">退出登录</button></main>`, "member-settings");
  }

  function memberProfile509Content() {
    const readonly = memberProfileSaved;
    const field = (label, control, value) => `<label class="member-profile-field"><span>${label}</span>${readonly ? `<strong>${value}</strong>` : control}</label>`;
    const fields = [
      field("性别", '<select><option>请选择</option><option selected>男</option><option>女</option></select>', "男"),
      field("出生日期", '<input type="date" value="1996-08-18" />', "1996-08-18"),
      field("所在地区", '<button type="button" class="member-profile-picker">中国 / 广东省 / 深圳市<span>›</span></button>', "中国 / 广东省 / 深圳市"),
      field("QQ", '<input type="text" value="96652018" placeholder="请输入QQ号" />', "96652018"),
      field("微信", '<input type="text" value="Mike_966" placeholder="请输入微信号" />', "Mike_966"),
      field("邮箱", '<input type="email" value="mike966@example.com" placeholder="请输入邮箱" />', "mike966@example.com")
    ].join("");
    const footer = readonly
      ? `<section class="member-profile-locked annotated" data-component-id="S01">${componentBadge("S01")}<span>✓</span><div><strong>资料已保存</strong><p>如需修改，请联系在线客服处理。</p></div></section>`
      : `<section class="member-profile-submit annotated" data-component-id="B01">${componentBadge("B01")}<p>请确认资料准确无误，保存成功后会员端不可自行修改。</p><button type="button" class="member-profile-save">确认并保存</button></section>`;
    return mobileVipFrame(`${memberVipMobileHeader("个人资料", "member-settings-643")}<main class="member-profile-page"><section class="member-profile-intro"><strong>${readonly ? "个人资料" : "请完善个人资料"}</strong><p>${readonly ? "以下为您已保存的资料。" : "资料仅支持首次填写，提交前请仔细核对。"}</p></section><section class="member-profile-form annotated${readonly ? " is-readonly" : ""}" data-component-id="P01">${componentBadge("P01")}${fields}</section>${footer}</main>`, "member-profile");
  }

  function vipAlgorithm509Content() {
    const sections = [
      ["一", "VIP升级", [
        "VIP等级每次最多只能提升一级，不允许一次跨越多个等级。",
        "晋升存款和晋升流水分别记录在会员当前等级的升级账本中，按下一级VIP要求判断是否满足升级条件。",
        "升级成功后，当前等级的晋升存款账本和晋升流水账本全部清零，按新等级重新开始累计。",
        "超过本次升级要求的存款和投注流水同时失效，不计入下一级VIP的升级进度。"
      ]],
      ["二", "VIP保级与降级", [
        "会员保级失败时，每次最多只降低一级，不允许一次连续降低多个等级。",
        "降级成功后，会员的保级流水账本、升级流水账本和升级存款账本全部清零。",
        "账本清零后按降级后的VIP等级重新开始累计升级存款、升级流水和保级流水。",
        "历史累计统计可以继续保留用于查询，但不得直接恢复或补回已经清零的VIP账本进度。"
      ]],
      ["三", "场景举例", [
        "未达标：会员当前为VIP1，升VIP2需要累计存款1万元且有效流水10万元。会员已完成存款1万元，但有效流水只有8万元，因此不升级，两项进度继续保留。",
        "正常升级：会员当前为VIP1，晋升存款和晋升流水均达到VIP2要求。次日14:00升级为VIP2，两项升级进度清零，并从升级成功时间重新开始VIP2的90天保级周期。",
        "超额不结转：会员升VIP2需要存款1万元、流水10万元，实际累计存款1.5万元、流水18万元。次日只升级到VIP2，多出的0.5万元存款和8万元流水均不计入VIP2升VIP3的进度。",
        "禁止跨级：会员当前为VIP1，即使晋升存款和晋升流水同时达到VIP2和VIP3门槛，本次任务也只能升级到VIP2，只生成VIP2晋升礼金。",
        "清零边界：会员在昨日结束前已达到升级门槛，并在今天00:00至14:00又产生一笔成功存款和2万元有效流水。14:00升级时只清除本次已参与判定的进度，今天新增的存款和流水保留到次日计算。",
        "保级失败：会员当前为VIP3，90天保级期满仍未达标，则固定降为VIP2；VIP3的升级进度和保级进度清零，并按VIP2重新开始计算，不得因历史累计流水再次升回VIP3。"
      ], true]
    ];
    const sectionHtml = sections.map(([number, title, items, emphasizeLead]) => `<section class="vip-copy-section${title === "关联需求" ? " is-related" : ""}"><header><span>${number}</span><h2>${title}</h2></header><ol>${items.map((item, index) => {
      let content = escapeHtml(item);
      if (emphasizeLead) {
        const separator = content.indexOf("：");
        if (separator > 0) content = `<strong>${content.slice(0, separator)}</strong>：${content.slice(separator + 1)}`;
      }
      return `<li><span>${index + 1}</span><p>${content}</p></li>`;
    }).join("")}</ol></section>`).join("");
    return `<article class="vip-algorithm-document">
      <header class="vip-algorithm-header"><div><span>TECHNICAL RULE VIEW · 非生产页面</span><h1>新VIP算法说明</h1><p>负责产品：Mike　　版本：20260804</p></div></header>
      <main class="vip-algorithm-body">${sectionHtml}</main>
    </article>`;
  }

  function vipOptimizationContent(page) {
    if (page.key === "vip-settings-509") return vipSettings509Content();
    if (["member-vip-center-509", "member-vip-center-643"].includes(page.key)) return memberVipCenter509Content(page);
    if (page.key === "member-electronic-rebate-509") return memberElectronicRebateContent();
    if (page.key === "member-vip-detail-643") return memberVipDetail509Content(page);
    if (page.key === "member-vip-rules-643") return memberVipRules509Content();
    if (page.key === "member-settings-643") return memberSettings509Content();
    if (page.key === "member-profile-643") return memberProfile509Content();
    if (page.key === "vip-algorithm-509") return vipAlgorithm509Content();
    if (page.key === "member-level-config-643") return member509LevelContent(page);
    if (page.key === "member-tag-config-643") return member509TagContent(page);
    if (page.key === "rebate-level-config-509") return rebate512LevelContent(page);
    if (page.key === "rebate-records-509") return rebate512RecordContent(page);
    if (page.key === "no-rebate-games-509") return rebate512ExcludedContent(page);
    return "";
  }

  function simulatorRound(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function simulatorSignedMoney(value) {
    const amount = simulatorRound(value);
    const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
    return `${sign}¥${money(Math.abs(amount))}`;
  }

  function simulatorPercent(value) {
    return `${simulatorRound(Number(value) * 100)}%`;
  }

  function simulatorHelp(label, tip) {
    const text = `${label}说明：${tip}`;
    return `<span class="sim-help" tabindex="0" aria-label="${escapeHtml(text)}" data-tip="${escapeHtml(tip)}">?</span>`;
  }

  function simulatorTip(meaning, source, usage) {
    return `是什么：${meaning}\n数据从哪来：${source}\n怎么用：${usage}`;
  }

  function simulatorInput(label, key, options = {}) {
    const value = profitSimulatorState[key];
    const min = options.min ?? 0;
    const max = options.max ?? 1000000;
    const step = options.step ?? 1;
    return `<div class="sim-input"><span>${escapeHtml(label)}${options.tip ? simulatorHelp(label, options.tip) : ""}</span><div><input type="number" data-sim-input="${key}" aria-label="${escapeHtml(label)}" min="${min}" max="${max}" step="${step}" value="${value}" /><b>${escapeHtml(options.unit || "")}</b></div></div>`;
  }

  function legacySimulatorResult() {
    const state = profitSimulatorState;
    const platformWinLoss = simulatorRound(Math.abs(state.platformResult) * state.resultSign);
    const expense = Math.max(0, simulatorRound(state.operatingExpense));
    const siteRate = Math.min(1, Math.max(0, state.siteRate / 100));
    const star = state.mode === "legacy-star";
    const sourceRates = star
      ? [{ key: "A", name: "星级代理", rate: state.agentARate / 100, wallet: state.agentAWallet }]
      : [
          { key: "A", name: "直属代理A", rate: state.agentARate / 100, wallet: state.agentAWallet },
          { key: "B", name: "上级代理B", rate: state.agentBRate / 100, wallet: state.agentBWallet },
          { key: "C", name: "上级代理C", rate: state.agentCRate / 100, wallet: state.agentCWallet }
        ];
    let previousRate = 0;
    const agents = sourceRates.map((agent) => {
      const normalizedRate = Math.min(siteRate, Math.max(previousRate, Number(agent.rate) || 0));
      const share = simulatorRound(normalizedRate - previousRate);
      previousRate = normalizedRate;
      return { ...agent, rate: normalizedRate, share };
    });
    const highestRate = agents.at(-1)?.rate || 0;
    const siteShare = Math.max(0, simulatorRound(siteRate - highestRate));
    const hqShare = Math.max(0, simulatorRound(1 - siteRate));
    let forwardedDeficit = Math.max(0, simulatorRound(state.legacyDebt));
    const agentResults = agents.map((agent) => {
      const gross = simulatorRound(platformWinLoss * agent.share);
      const allocatedExpense = simulatorRound(expense * agent.share);
      const raw = simulatorRound(gross - allocatedExpense);
      const currentAvailable = Math.max(raw, 0);
      const burden = simulatorRound(Math.max(-raw, 0) + forwardedDeficit);
      const currentUsed = Math.min(currentAvailable, burden);
      const afterCurrent = simulatorRound(burden - currentUsed);
      const walletUsed = Math.min(Math.max(0, Number(agent.wallet) || 0), afterCurrent);
      const deficit = simulatorRound(afterCurrent - walletUsed);
      const commission = simulatorRound(currentAvailable - currentUsed);
      forwardedDeficit = deficit;
      return {
        ...agent,
        gross,
        expense: allocatedExpense,
        commission,
        walletUsed,
        walletAfter: simulatorRound(Math.max(0, Number(agent.wallet) || 0) - walletUsed),
        deficit,
        burden
      };
    });
    const siteRaw = simulatorRound(platformWinLoss * siteShare - expense * siteShare - forwardedDeficit);
    const hqNet = simulatorRound(platformWinLoss * hqShare - expense * hqShare);
    return {
      platformWinLoss,
      expense,
      siteRate,
      highestRate,
      siteShare,
      hqShare,
      agents: agentResults,
      siteNet: siteRaw,
      siteAdvance: forwardedDeficit,
      hqNet,
      distributable: simulatorRound(platformWinLoss - expense),
      star
    };
  }

  const negativeProfitLevels = [
    { level: 1, newActive: 1, active: 3, netWinLoss: 5000, rate: 0.2 },
    { level: 2, newActive: 3, active: 8, netWinLoss: 15000, rate: 0.3 },
    { level: 3, newActive: 5, active: 15, netWinLoss: 30000, rate: 0.4 }
  ];

  function negativeProfitSimulatorResult() {
    const state = profitSimulatorState;
    const currentWinLoss = simulatorRound(Math.abs(state.platformResult) * state.resultSign);
    const currentExpense = Math.max(0, simulatorRound(state.operatingExpense));
    const matched = [...negativeProfitLevels].reverse().find((level) =>
      Number(state.newActiveCount) >= level.newActive
      && Number(state.activeMemberCount) >= level.active
      && currentWinLoss >= level.netWinLoss
    ) || null;
    const combinedWinLoss = simulatorRound(currentWinLoss + Number(state.historicalWinLoss || 0));
    const combinedExpense = simulatorRound(currentExpense + Number(state.historicalExpense || 0));
    const historicalDebt = Math.max(0, simulatorRound(state.historicalDebt));
    const historicalCommission = Math.max(0, simulatorRound(state.historicalCommission));
    const carryOnly = !matched && currentWinLoss >= 0;
    const fallback = negativeProfitLevels.find((level) => level.level === Number(state.previousLevel)) || negativeProfitLevels[0];
    const settlement = matched || fallback;
    const beforeDebt = carryOnly ? 0 : simulatorRound((combinedWinLoss - combinedExpense) * settlement.rate + historicalCommission);
    const debtRecovery = carryOnly ? 0 : simulatorRound(Math.min(Math.max(beforeDebt, 0), historicalDebt));
    const newDebt = carryOnly ? 0 : simulatorRound(Math.abs(Math.min(beforeDebt, 0)));
    const remainingDebt = carryOnly ? historicalDebt : simulatorRound(historicalDebt - debtRecovery + newDebt);
    const netCommission = carryOnly ? 0 : simulatorRound(beforeDebt - historicalDebt);
    const payable = Math.max(0, netCommission);
    let grantAmount = payable;
    let reductionAmount = 0;
    let carryCommission = 0;
    if (state.treatment === "NO_GRANT") {
      grantAmount = 0;
      carryCommission = payable;
    } else if (state.treatment === "REDUCED_GRANT") {
      grantAmount = Math.min(payable, Math.max(0, simulatorRound(state.reducedGrant)));
      reductionAmount = simulatorRound(payable - grantAmount);
    }
    const multi = state.mode === "negative-team";
    const lineShares = multi
      ? [
          { name: "团队负责人", share: 0.4, role: "负责人" },
          { name: "副线A", share: 0.35, role: "贡献数据" },
          { name: "副线B", share: 0.25, role: "贡献数据" }
        ]
      : [{ name: "单线负责人", share: 1, role: "负责人" }];
    return {
      currentWinLoss,
      currentExpense,
      combinedWinLoss,
      combinedExpense,
      matched,
      settlement,
      carryOnly,
      beforeDebt,
      historicalDebt,
      debtRecovery,
      newDebt,
      remainingDebt,
      netCommission,
      payable,
      grantAmount,
      reductionAmount,
      carryCommission,
      lineShares,
      leaderBalanceAfter: simulatorRound(Number(state.teamLeaderWallet || 0) + grantAmount),
      operatingPool: simulatorRound(currentWinLoss - currentExpense),
      multi
    };
  }

  function simulatorModeSelector() {
    const modes = [
      ["legacy-multi", "现行多层级"],
      ["legacy-star", "现行星级"],
      ["negative-team", "负盈利团队多线"],
      ["negative-single", "负盈利单线"]
    ];
    return `<div class="sim-mode-switch annotated" data-component-id="N01">${componentBadge("N01")}${modes.map(([key, label]) => `<button type="button" data-sim-mode="${key}" class="${profitSimulatorState.mode === key ? "active" : ""}">${label}</button>`).join("")}</div>`;
  }

  function simulatorCommonParameters() {
    const state = profitSimulatorState;
    return `<div class="sim-result-direction"><span>本期会员结果${simulatorHelp("本期会员结果", simulatorTip("会员这一期整体是亏钱还是赢钱。", "这是本次模拟时主动选择的场景。真实结算时由本期会员注单结果汇总得出。", "会员亏损代表平台有正收益，可以向各方分润；会员盈利代表平台亏损，各方需要按比例承担。"))}</span><div><button type="button" data-result-sign="1" class="${state.resultSign === 1 ? "active" : ""}" title="会员整体亏损，平台产生正向输赢">会员亏损</button><button type="button" data-result-sign="-1" class="${state.resultSign === -1 ? "active loss" : ""}" title="会员整体盈利，平台产生负向输赢">会员盈利</button></div></div>
      ${simulatorInput("平台输赢绝对值", "platformResult", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("本轮结算中，平台从会员输赢中获得或承担的金额；这里只填写金额大小，不填写正负号。", "把本轮已纳入结算的会员注单结果汇总，再转换成平台视角。", "结合上方会员结果决定正负：会员亏损时是平台收益，会员盈利时是平台亏损。") })}
      ${simulatorInput("运营费用合计", "operatingExpense", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("本轮需要由代理、站点和总站共同分担的运营成本总额。", "来自已领取的礼金、返水、推广奖励、活动奖励、余额宝利息，以及充值手续费差额、提款手续费差额和场馆费。", "先从可分配收益中扣除，再按照各方比例分担；模拟器把不同费用合并成一个总数。") })}`;
  }

  function legacySimulatorParameters(result) {
    const star = result.star;
    return `<section class="sim-parameter-panel annotated" data-component-id="F01">${componentBadge("F01")}<header><div><span>输入</span><h2>经营数据与分配比例</h2></div><button type="button" class="sim-reset" data-sim-reset>重置</button></header><div class="sim-parameter-grid">
      ${simulatorCommonParameters()}
      ${simulatorInput("站点分润比例", "siteRate", { min: 0, max: 100, step: 1, unit: "%", tip: simulatorTip("站点这一侧最多可以参与分配的总比例。", "来自该站点当前生效的分润配置，结算时会保留当期配置。", "代理佣金从站点这一侧的比例中分出；站点拿剩余部分，总站拿站点比例之外的部分。") })}
      ${simulatorInput(star ? "星级代理比例" : "直属代理A比例", "agentARate", { min: 0, max: 100, step: 1, unit: "%", tip: star ? simulatorTip("星级代理从直属会员经营结果中参与分配的累计比例。", "来自该代理当前绑定的佣金方案和星级配置。", "只计算该代理直属会员，不再向更高层代理分配级差；费用和负盈利也按该比例承担。") : simulatorTip("直属代理A从直属会员经营结果中参与分配的累计比例。", "来自该代理当前绑定的佣金方案和代理等级。", "会员产生收益时按该比例计算代理A的基础佣金；费用或亏损也按相同比例承担。") })}
      ${star ? "" : simulatorInput("上级代理B比例", "agentBRate", { min: 0, max: 100, step: 1, unit: "%", tip: simulatorTip("上级代理B在整条代理链上的累计比例，不是额外再拿完整比例。", "来自代理B当前绑定的佣金方案和代理等级。", "先扣除代理A已经使用的比例，B只拿多出来的那一段；如果B比例不高于A，B就没有级差。") })}
      ${star ? "" : simulatorInput("上级代理C比例", "agentCRate", { min: 0, max: 100, step: 1, unit: "%", tip: simulatorTip("上级代理C在整条代理链上的累计比例。", "来自代理C当前绑定的佣金方案和代理等级。", "先扣除下方代理链已经使用的最高比例，C只拿剩余的正向级差。") })}
      ${simulatorInput(star ? "星级代理可用余额" : "代理A可用余额", "agentAWallet", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("对应代理账户中当前可以使用和申请提款的余额。", "来自该代理主账户的实时可用余额。", "本期佣金不够承担费用、亏损或历史欠款时，会继续从该余额中扣减。") })}
      ${star ? "" : simulatorInput("代理B可用余额", "agentBWallet", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("上级代理B账户中当前可使用的余额。", "来自代理B主账户的实时可用余额。", "下级代理仍有不足并向上转移时，先使用B可用的佣金，再使用B的账户余额；仍不足则继续向上。") })}
      ${star ? "" : simulatorInput("代理C可用余额", "agentCWallet", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("上级代理C账户中当前可使用的余额。", "来自代理C主账户的实时可用余额。", "下方代理链仍有不足时继续使用；整条代理链都无法承担的部分，最后由站点垫付。") })}
      ${simulatorInput("代理A历史待偿债务", "legacyDebt", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("代理A以前结算周期欠下、目前还没有还清的金额。", "通常是以前的会员盈利或运营费用超过代理佣金和余额后，由上级代理或站点先垫付形成。", "代理以后产生佣金或可用资金时，需要先偿还历史欠款，再形成新的可发佣金。") })}
    </div></section>`;
  }

  function negativeSimulatorParameters() {
    const state = profitSimulatorState;
    return `<section class="sim-parameter-panel annotated" data-component-id="F01">${componentBadge("F01")}<header><div><span>输入</span><h2>团队经营数据与历史项</h2></div><button type="button" class="sim-reset" data-sim-reset>重置</button></header><div class="sim-parameter-grid">
      ${simulatorCommonParameters()}
      ${simulatorInput("新增活跃会员", "newActiveCount", { min: 0, max: 10000, step: 1, unit: "人", tip: simulatorTip("团队本轮新增加的有效活跃会员人数。", "统计团队负责人和当前生效副线在本结算周期内新增、且符合活跃条件的会员。", "需要同时结合活跃会员总数和团队经营结果，匹配本轮可使用的最高返佣等级。") })}
      ${simulatorInput("活跃会员", "activeMemberCount", { min: 0, max: 10000, step: 1, unit: "人", tip: simulatorTip("团队本轮符合活跃条件的会员总人数。", "汇总团队负责人和当前生效副线在本结算周期内的有效活跃会员。", "作为返佣等级的人数门槛之一；人数不足时不能匹配更高等级。") })}
      ${simulatorInput("历史结转输赢", "historicalWinLoss", { min: -10000000, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("以前周期暂时没有结算、延续到本期的团队经营输赢。", "来自上一期团队账单中保留下来的未结算经营结果。", "与本期团队输赢合并后，一起参与本轮返佣计算。") })}
      ${simulatorInput("历史结转费用", "historicalExpense", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("以前周期随经营结果一起延续到本期的运营费用。", "来自上一期团队账单中保留下来的未结算费用。", "与本期运营费用合并，并从本期及历史经营收益中一起扣除。") })}
      ${simulatorInput("历史结转佣金", "historicalCommission", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("以前已经算出，但当时选择不发放、继续留到本期的佣金。", "来自以前团队账单的“不发放”处理结果。", "本轮先按经营结果计算佣金，再加上这部分历史佣金，之后处理历史欠款。") })}
      ${simulatorInput("历史欠款", "historicalDebt", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("团队以前亏损时由站点先垫付、目前尚未还清的金额。", "来自以前团队账单产生的站点垫付记录。", "本轮产生正佣金时先还欠款；本轮继续亏损时，站点垫付和欠款会继续增加。") })}
      ${simulatorInput("负责人账户余额", "teamLeaderWallet", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("团队负责人当前代理账户中已有的可用余额。", "来自团队负责人的代理账户。", "团队佣金审核并发放后只增加到负责人账户；副线只贡献经营数据，不会单独收到团队佣金。") })}
      <div class="sim-input"><span>上期匹配等级${simulatorHelp("上期匹配等级", simulatorTip("团队上一个结算周期使用的返佣等级。", "来自上一期团队账单。没有历史记录时按最低等级处理。", "当本期为负、无法按正向门槛重新匹配等级时，用上期等级计算本轮需要承担的金额。"))}</span><div><select data-sim-input="previousLevel" aria-label="上期匹配等级">${negativeProfitLevels.map((level) => `<option value="${level.level}" ${Number(state.previousLevel) === level.level ? "selected" : ""}>${level.level}级</option>`).join("")}</select></div></div>
    </div><div class="sim-treatment"><span>账单处理${simulatorHelp("账单处理", simulatorTip("决定本轮算出的应发佣金如何处理。", "由账单审核或处理人员在结算时选择。", "全额发放会全部进入负责人账户；调减发放只发确认金额；不发放会把全部应发佣金留到后续周期。"))}</span><div>${[["GRANT", "全额发放"], ["REDUCED_GRANT", "调减发放"], ["NO_GRANT", "不发放"]].map(([key, label]) => `<button type="button" data-treatment="${key}" class="${state.treatment === key ? "active" : ""}">${label}</button>`).join("")}</div>${state.treatment === "REDUCED_GRANT" ? simulatorInput("调减后发放", "reducedGrant", { min: 0, max: 10000000, step: 1000, unit: "CNY", tip: simulatorTip("审核后实际决定发给团队负责人的佣金金额。", "由账单处理人员在选择“调减发放”后填写。", "不能超过本轮应发佣金；填写超过时，模拟器按应发佣金封顶。") }) : ""}</div></section>`;
  }

  function legacyRelationshipGraph(result) {
    const agentNodes = result.agents.map((agent) => `<div class="sim-flow-arrow"><span>${simulatorPercent(agent.share)}</span></div><article class="sim-flow-node agent" title="${escapeHtml(agent.name)}：本期正向佣金${simulatorSignedMoney(agent.commission)}；账户消化${simulatorSignedMoney(-agent.walletUsed)}"><small>${agent.key === "A" ? "直属" : "级差"}</small><strong>${agent.name}</strong><b>${simulatorSignedMoney(agent.commission)}</b><em>${simulatorPercent(agent.rate)}累计比例</em></article>`).join("");
    return `<section class="sim-flow-panel annotated" data-component-id="P01">${componentBadge("P01")}<header><span>关系与资金流</span><strong>${result.star ? "星级代理止于直属关系" : "沿代理链只计算正级差"}</strong></header><div class="sim-flow-track"><article class="sim-flow-node member" title="会员注单结算后，平台输赢按归属代理链参与分配"><small>业务起点</small><strong>直属会员</strong><b>${simulatorSignedMoney(result.platformWinLoss)}</b><em>平台输赢</em></article>${agentNodes}<div class="sim-flow-arrow"><span>${simulatorPercent(result.siteShare)}</span></div><article class="sim-flow-node site" title="站点获得站点比例扣除代理链最高有效比例后的剩余份额，并承担最终垫付"><small>结算主体</small><strong>站点</strong><b>${simulatorSignedMoney(result.siteNet)}</b><em>${result.siteAdvance > 0 ? `垫付 ¥${money(result.siteAdvance)}` : "站点账单"}</em></article><div class="sim-flow-arrow"><span>${simulatorPercent(result.hqShare)}</span></div><article class="sim-flow-node hq" title="总站取得1减站点分润比例对应的份额"><small>平台侧</small><strong>总站</strong><b>${simulatorSignedMoney(result.hqNet)}</b><em>平台留存</em></article></div></section>`;
  }

  function negativeRelationshipGraph(result) {
    const lines = result.lineShares.map((line) => `<article class="sim-team-line ${line.role === "负责人" ? "leader" : "subline"}" title="${line.role === "负责人" ? "负责人参与经营数据汇总，并接收最终发放佣金" : "副线只贡献经营数据，不直接领取团队佣金"}"><span>${line.role}</span><strong>${line.name}</strong><b>${simulatorSignedMoney(result.currentWinLoss * line.share)}</b><em>${simulatorPercent(line.share)}经营贡献</em></article>`).join("");
    return `<section class="sim-flow-panel annotated" data-component-id="P01">${componentBadge("P01")}<header><span>关系与资金流</span><strong>${result.multi ? "团队负责人 + 直接副线" : "只有负责人，不存在副线"}</strong></header><div class="sim-team-flow"><div class="sim-team-lines">${lines}</div><div class="sim-team-merge"><span>汇总</span></div><article class="sim-team-bill" title="团队所有生效成员的经营数据先汇总，再统一匹配团队等级"><small>统一账单</small><strong>负盈利团队账单</strong><b>${result.matched ? `匹配 ${result.matched.level}级` : result.carryOnly ? "未达标·结转" : `回退 ${result.settlement.level}级`}</b><em>应发 ${simulatorSignedMoney(result.payable)}</em></article><div class="sim-team-payout"><span>${result.grantAmount > 0 ? "审核后发放" : result.newDebt > 0 ? "站点形成垫付" : "本期不发放"}</span></div><article class="sim-flow-node agent leader-result" title="负盈利团队佣金只向团队负责人发放，副线不获得独立佣金"><small>唯一收款方</small><strong>团队负责人账户</strong><b>${simulatorSignedMoney(result.grantAmount)}</b><em>结算后 ¥${money(result.leaderBalanceAfter)}</em></article></div></section>`;
  }

  function legacyCalculationSteps(result) {
    const agentGross = result.agents.reduce((sum, item) => sum + item.gross, 0);
    const agentExpense = result.agents.reduce((sum, item) => sum + item.expense, 0);
    const agentCommission = result.agents.reduce((sum, item) => sum + item.commission, 0);
    return [
      ["01", "确定可分经营结果", `${simulatorSignedMoney(result.platformWinLoss)} - ¥${money(result.expense)}费用 = ${simulatorSignedMoney(result.distributable)}`],
      ["02", result.star ? "切出直属代理份额" : "沿代理链切出正级差", `代理毛份额 ${simulatorSignedMoney(agentGross)}，代理费用份额 -¥${money(agentExpense)}`],
      ["03", "计算站点与总站份额", `站点使用 ${simulatorPercent(result.siteRate)} - ${simulatorPercent(result.highestRate)}；总站使用 ${simulatorPercent(result.hqShare)}`],
      ["04", "消化负担与历史债务", result.siteAdvance > 0 ? `代理佣金及余额不足，最终由站点垫付 ¥${money(result.siteAdvance)}` : "本期代理佣金和余额足以覆盖费用及历史债务"],
      ["05", "形成可发账单", `代理正向佣金合计 ${simulatorSignedMoney(agentCommission)}；站点账单 ${simulatorSignedMoney(result.siteNet)}`]
    ];
  }

  function negativeCalculationSteps(result) {
    return [
      ["01", "汇总团队经营数据", `本期输赢 ${simulatorSignedMoney(result.currentWinLoss)}，本期费用 -¥${money(result.currentExpense)}`],
      ["02", "匹配团队等级", result.matched ? `同时满足人数及净输赢门槛，匹配最高 ${result.matched.level}级 / ${simulatorPercent(result.matched.rate)}` : result.carryOnly ? "未满足任何等级，本期输赢与费用结转" : `本期负盈利未匹配等级，回退 ${result.settlement.level}级 / ${simulatorPercent(result.settlement.rate)}`],
      ["03", "计算债务前佣金", result.carryOnly ? "本期不产生佣金" : `(${simulatorSignedMoney(result.combinedWinLoss)} - ¥${money(result.combinedExpense)}) × ${simulatorPercent(result.settlement.rate)} + 历史佣金 = ${simulatorSignedMoney(result.beforeDebt)}`],
      ["04", "处理历史欠款", `收回历史欠款 ¥${money(result.debtRecovery)}；新增站点垫付 ¥${money(result.newDebt)}；剩余欠款 ¥${money(result.remainingDebt)}`],
      ["05", "审核与发放处理", result.carryOnly ? "本期无可处理佣金" : `应发 ${simulatorSignedMoney(result.payable)}，实际发放 ${simulatorSignedMoney(result.grantAmount)}${result.carryCommission ? `，结转 ¥${money(result.carryCommission)}` : ""}${result.reductionAmount ? `，调减 ¥${money(result.reductionAmount)}` : ""}`]
    ];
  }

  function simulatorSteps(steps) {
    return `<section class="sim-steps annotated" data-component-id="P02">${componentBadge("P02")}<header><span>计算过程</span><strong>按生产顺序逐步拆解</strong></header><ol>${steps.map(([number, title, text]) => `<li><span>${number}</span><div><strong>${title}</strong><p>${text}</p></div></li>`).join("")}</ol></section>`;
  }

  function legacySettlement(result) {
    const agentRows = result.agents.map((agent) => `<tr><td><strong>${agent.name}</strong><span>${agent.key === "A" ? "直属份额" : "正级差"}</span></td><td>${simulatorSignedMoney(agent.commission)}</td><td>${agent.walletUsed ? simulatorSignedMoney(-agent.walletUsed) : "¥0"}</td><td><strong>${simulatorSignedMoney(agent.walletAfter + agent.commission)}</strong><span>审核发放后账户余额</span></td><td><em class="sim-eligibility ${agent.commission > 0 ? "yes" : "no"}">${agent.commission > 0 ? "可增加提款余额" : "无新增可发佣金"}</em></td></tr>`).join("");
    return `<section class="sim-settlement annotated" data-component-id="P03">${componentBadge("P03")}<header><span>最终结果</span><strong>计算完成不等于立即到账</strong></header><div class="sim-settlement-scroll"><table><thead><tr><th>参与方</th><th>本期正向入账</th><th>账户消化</th><th>结算后结果</th><th>可申请提款变化</th></tr></thead><tbody>${agentRows}<tr><td><strong>站点</strong><span>允许正负账单</span></td><td>${simulatorSignedMoney(result.siteNet)}</td><td>${result.siteAdvance ? `垫付 ¥${money(result.siteAdvance)}` : "¥0"}</td><td><strong>${simulatorSignedMoney(result.siteNet)}</strong><span>进入站点结算账单</span></td><td><em class="sim-eligibility ${result.siteNet > 0 ? "yes" : "no"}">${result.siteNet > 0 ? "结算后可增加站点余额" : "不增加可提款余额"}</em></td></tr><tr><td><strong>总站</strong><span>平台留存</span></td><td>${simulatorSignedMoney(result.hqNet)}</td><td>—</td><td><strong>${simulatorSignedMoney(result.hqNet)}</strong><span>不生成代理提款余额</span></td><td><em class="sim-eligibility no">不属于代理/站点提款</em></td></tr></tbody></table></div></section>`;
  }

  function negativeSettlement(result) {
    return `<section class="sim-settlement annotated" data-component-id="P03">${componentBadge("P03")}<header><span>最终结果</span><strong>团队佣金只向负责人发放</strong></header><div class="sim-settlement-scroll"><table><thead><tr><th>参与方</th><th>经营贡献</th><th>佣金/债务结果</th><th>账户结果</th><th>可申请提款变化</th></tr></thead><tbody>${result.lineShares.map((line) => `<tr><td><strong>${line.name}</strong><span>${line.role}</span></td><td>${simulatorSignedMoney(result.currentWinLoss * line.share)}</td><td>${line.role === "负责人" ? simulatorSignedMoney(result.grantAmount) : "¥0"}</td><td>${line.role === "负责人" ? `结算后 ¥${money(result.leaderBalanceAfter)}` : "不接收团队佣金"}</td><td><em class="sim-eligibility ${line.role === "负责人" && result.grantAmount > 0 ? "yes" : "no"}">${line.role === "负责人" && result.grantAmount > 0 ? "发放后增加提款余额" : "无团队佣金提款余额"}</em></td></tr>`).join("")}<tr><td><strong>站点</strong><span>团队债权人</span></td><td>—</td><td>${result.newDebt ? `垫付 ¥${money(result.newDebt)}` : result.debtRecovery ? `收回 ¥${money(result.debtRecovery)}` : "¥0"}</td><td>剩余应收 ¥${money(result.remainingDebt)}</td><td><em class="sim-eligibility no">按站点结算流程处理</em></td></tr></tbody></table></div></section>`;
  }

  function profitSimulatorViewSelector() {
    return `<div class="sim-view-switch annotated" data-component-id="N02">${componentBadge("N02")}<button type="button" data-sim-view="journey" class="${profitSimulatorState.view === "journey" ? "active" : ""}"><strong>业务推演</strong><span>跟着一笔返水看钱如何流转</span></button><button type="button" data-sim-view="advanced" class="${profitSimulatorState.view === "advanced" ? "active" : ""}"><strong>综合计算</strong><span>自由组合经营数据与结算模式</span></button></div>`;
  }

  function rebateJourneyResult() {
    const state = profitSimulatorState;
    const rebate = simulatorRound(Math.max(0, Number(state.journeyValidBet)) * Math.max(0, Number(state.journeyRebateRate)) / 100);
    const siteRate = Math.min(100, Math.max(0, Number(state.journeySiteRate)));
    const directRate = Math.min(siteRate, Math.max(0, Number(state.journeyAgentARate)));
    const parentRate = state.journeyScenario === "multi"
      ? Math.min(siteRate, Math.max(directRate, Number(state.journeyParentRate)))
      : directRate;
    if (state.journeyScenario === "full-agent") {
      return { rebate, siteRate, directRate, parentRate, directCost: rebate, parentCost: 0, siteCost: 0, hqCost: 0 };
    }
    const directCost = simulatorRound(rebate * directRate / 100);
    const parentCost = simulatorRound(rebate * Math.max(0, parentRate - directRate) / 100);
    const hqCost = simulatorRound(rebate * Math.max(0, 100 - siteRate) / 100);
    const siteCost = simulatorRound(Math.max(0, rebate - directCost - parentCost - hqCost));
    return { rebate, siteRate, directRate, parentRate, directCost, parentCost, siteCost, hqCost };
  }

  function journeyInput(label, key, unit, tip, options = {}) {
    return `<div class="sim-input"><span>${escapeHtml(label)}${simulatorHelp(label, tip)}</span><div><input type="number" data-journey-input="${key}" min="${options.min ?? 0}" max="${options.max ?? 1000000}" step="${options.step ?? 1}" value="${profitSimulatorState[key]}" /><b>${unit}</b></div></div>`;
  }

  function rebateJourneyParameters() {
    const scenario = profitSimulatorState.journeyScenario;
    const scenarios = [
      ["direct", "只有直属代理", "最常见的两级承担"],
      ["multi", "存在多级代理", "上级只承担比例级差"],
      ["full-agent", "直属代理全额承担", "命中特殊费用配置"]
    ];
    return `<aside class="journey-parameter-panel annotated" data-component-id="F02">${componentBadge("F02")}<header><div><span>案例设定</span><h2>这笔返水从哪里开始</h2></div><button type="button" class="sim-reset" data-journey-reset>重置</button></header><div class="journey-scenarios">${scenarios.map(([key, title, text]) => `<button type="button" data-journey-scenario="${key}" class="${scenario === key ? "active" : ""}"><strong>${title}</strong><span>${text}</span></button>`).join("")}</div><div class="journey-member-line"><span>会员归属</span><strong>A站点 / 直属B代理${scenario === "multi" ? " / 上级C代理" : ""}</strong></div><div class="sim-parameter-grid">
      ${journeyInput("有效投注", "journeyValidBet", "CNY", simulatorTip("这笔投注中可以参与返水计算的金额。", "由场馆结算后的有效投注结果汇总得出。", "它乘以返水比例，决定会员可以获得多少返水。"), { step: 10 })}
      ${journeyInput("返水比例", "journeyRebateRate", "%", simulatorTip("会员每产生一元有效投注，可以获得多少比例的返水。", "优先读取A站点针对当前VIP等级和场馆的配置；没有单独配置时使用总控默认值。", "它只决定会员拿多少，不决定代理、站点和总站各自承担多少。"), { max: 100, step: 0.1 })}
      ${journeyInput("会员主钱包原余额", "journeyMemberWallet", "CNY", simulatorTip("会员领取返水之前，主钱包已有的可用金额。", "来自会员主钱包实时余额。", "用于直观看到领取前后变化，不参与返水金额计算。"), { step: 10 })}
      ${scenario === "full-agent" ? "" : journeyInput("A站点分润比例", "journeySiteRate", "%", simulatorTip("A站点这一侧参与经营结果分配的累计比例。", "来自A站点当前生效的分润配置。", "在费用承担中，总站承担比例外的部分，代理从站点这一侧按各自比例承担，站点承担剩余部分。"), { max: 100 })}
      ${scenario === "full-agent" ? "" : journeyInput("直属B代理比例", "journeyAgentARate", "%", simulatorTip("直属B代理在代理链上的累计佣金比例。", "来自B代理当前生效的佣金方案和等级。", "普通分摊时，B代理按这个比例承担返水费用。"), { max: 100 })}
      ${scenario === "multi" ? journeyInput("上级C代理比例", "journeyParentRate", "%", simulatorTip("上级C代理在整条代理链上的累计佣金比例。", "来自C代理当前生效的佣金方案和等级。", "C代理只承担高于B代理比例的那一段，不会再按完整比例重复承担。"), { max: 100 }) : ""}
    </div></aside>`;
  }

  function rebateJourneyStepData(result) {
    const walletBefore = simulatorRound(Number(profitSimulatorState.journeyMemberWallet));
    const walletAfter = simulatorRound(walletBefore + result.rebate);
    const scenario = profitSimulatorState.journeyScenario;
    const burdenSummary = scenario === "full-agent"
      ? `直属B代理承担 ¥${money(result.directCost)}，其他各方本笔承担 ¥0`
      : `${scenario === "multi" ? `B代理 ¥${money(result.directCost)}，C代理 ¥${money(result.parentCost)}，` : `B代理 ¥${money(result.directCost)}，`}A站点 ¥${money(result.siteCost)}，总站 ¥${money(result.hqCost)}`;
    return [
      { title: "投注发生", kicker: "会员完成一笔有效投注", text: `会员在A站点产生 ¥${money(profitSimulatorState.journeyValidBet)} 有效投注。此时只形成投注数据，还没有返水到账。`, formula: `有效投注 = ¥${money(profitSimulatorState.journeyValidBet)}`, why: "返水只计算有效投注。投注额中被判定无效的部分，不进入这笔返水。" },
      { title: "生成返水", kicker: "系统生成一笔待领取返水", text: `按当前场馆和VIP等级适用的 ${money(profitSimulatorState.journeyRebateRate)}% 返水比例，生成 ¥${money(result.rebate)}。`, formula: `¥${money(profitSimulatorState.journeyValidBet)} × ${money(profitSimulatorState.journeyRebateRate)}% = ¥${money(result.rebate)}`, why: "先找A站点的单独配置；A站点没有配置时，才使用总控默认配置。" },
      { title: "会员领取", kicker: "完整返水进入会员主钱包", text: `会员点击领取后，一次性得到完整 ¥${money(result.rebate)}，主钱包从 ¥${money(walletBefore)} 变为 ¥${money(walletAfter)}。`, formula: `¥${money(walletBefore)} + ¥${money(result.rebate)} = ¥${money(walletAfter)}`, why: "会员到账与费用分摊是两本账。代理、站点和总站不会在此刻分别向会员转账。" },
      { title: "冻结分摊口径", kicker: "保存费用发生时的关系和比例", text: scenario === "full-agent" ? "当前案例命中“直属代理承担全部返水费用”，本笔费用直接锁定由B代理承担。" : `系统保存本笔返水发生时的代理关系：${scenario === "multi" ? "会员 → B代理 → C代理 → A站点" : "会员 → B代理 → A站点"}，以及当期生效比例。`, formula: scenario === "full-agent" ? "费用承担口径 = 直属B代理 100%" : `站点 ${money(result.siteRate)}% / B代理 ${money(result.directRate)}%${scenario === "multi" ? ` / C代理 ${money(result.parentRate)}%` : ""}`, why: "以后配置或代理关系发生变化，也不能回头改写这笔已经发生的费用口径。" },
      { title: "周结分摊", kicker: "费用进入各方结算账单", text: `这 ¥${money(result.rebate)} 不是再次发给会员，而是作为运营费用按冻结口径拆分：${burdenSummary}。`, formula: burdenSummary, why: scenario === "multi" ? "多级代理按正级差承担：C代理只承担30%-20%=10%，避免同一比例重复计算。" : scenario === "full-agent" ? "这是费用配置的特殊分支，不再按普通站点与代理比例拆分。" : "总站承担站点分润比例之外的部分；B代理承担自身比例；A站点承担站点侧剩余部分。" },
      { title: "余额影响", kicker: "账单结算后才影响各方可用资金", text: `默认各方当期佣金足够，本笔费用分别从其结算结果中扣减。会员的 ¥${money(result.rebate)} 不会因此被扣回。`, formula: `${burdenSummary}；合计 ¥${money(result.rebate)}`, why: "若代理当期佣金不足，才继续使用代理余额、向上级传递不足或由站点垫付。该异常链路可在综合计算中继续模拟。" }
    ];
  }

  function rebateJourneyStage(result) {
    const step = Math.min(5, Math.max(0, Number(profitSimulatorState.journeyStep)));
    const steps = rebateJourneyStepData(result);
    const current = steps[step];
    const scenario = profitSimulatorState.journeyScenario;
    const costRows = [
      ["直属B代理", result.directCost, "代理自身比例"],
      ...(scenario === "multi" ? [["上级C代理", result.parentCost, "只承担正级差"]] : []),
      ["A站点", result.siteCost, "站点侧剩余"],
      ["总站", result.hqCost, "站点比例之外"]
    ];
    return `<section class="journey-stage annotated" data-component-id="P04">${componentBadge("P04")}<nav class="journey-stepper" aria-label="返水推演步骤">${steps.map((item, index) => `<button type="button" data-journey-step="${index}" class="${index === step ? "active" : ""} ${index < step ? "done" : ""}"><span>${index + 1}</span><strong>${item.title}</strong></button>`).join("")}</nav><div class="journey-scene"><header><div><span>第 ${step + 1} 步 / 6</span><h2>${current.kicker}</h2><p>${current.text}</p></div><strong class="journey-main-amount">${step === 0 ? `¥${money(profitSimulatorState.journeyValidBet)}` : `¥${money(result.rebate)}`}</strong></header><div class="journey-flow-map step-${step}"><article class="journey-node member visible"><small>会员</small><strong>完成有效投注</strong><b>¥${money(profitSimulatorState.journeyValidBet)}</b></article><i class="journey-arrow ${step >= 1 ? "visible" : ""}"></i><article class="journey-node rebate ${step >= 1 ? "visible" : ""}"><small>待领取返水</small><strong>系统生成</strong><b>¥${money(result.rebate)}</b></article><i class="journey-arrow ${step >= 2 ? "visible" : ""}"></i><article class="journey-node wallet ${step >= 2 ? "visible" : ""}"><small>会员主钱包</small><strong>${step >= 2 ? `¥${money(profitSimulatorState.journeyMemberWallet)} → ¥${money(Number(profitSimulatorState.journeyMemberWallet) + result.rebate)}` : "等待领取"}</strong><b>完整到账</b></article>${step >= 4 ? `<div class="journey-cost-branch count-${costRows.length}"><span>后续周结承担</span>${costRows.map(([name, amount, note]) => `<article><strong>${name}</strong><b>-¥${money(amount)}</b><small>${note}</small></article>`).join("")}</div>` : ""}${step > 0 ? `<span class="journey-money-token token-${step}">¥${money(result.rebate)}</span>` : ""}</div><div class="journey-receipt"><div><span>本步计算</span><strong>${current.formula}</strong></div><div><span>为什么这样算</span><p>${current.why}</p></div></div></div><div class="journey-ledgers"><article class="${step >= 2 ? "active" : ""}"><span>账本 A</span><strong>会员到账账本</strong><p>${step < 2 ? "尚未领取，主钱包不变" : `会员已完整收到 ¥${money(result.rebate)}，主钱包余额 ¥${money(Number(profitSimulatorState.journeyMemberWallet) + result.rebate)}`}</p></article><article class="${step >= 3 ? "active" : ""}"><span>账本 B</span><strong>运营费用承担账本</strong><p>${step < 3 ? "尚未冻结费用分摊口径" : step < 4 ? "已保存当期代理关系和比例，等待周结" : costRows.map(([name, amount]) => `${name} -¥${money(amount)}`).join(" / ")}</p></article></div><footer class="journey-actions"><button type="button" class="secondary-action" data-journey-prev ${step === 0 ? "disabled" : ""}>上一步</button><span>先看清当前发生了什么，再继续下一步</span>${step < 5 ? `<button type="button" class="main-action" data-journey-next>下一步</button>` : `<button type="button" class="main-action" data-open-advanced>进入综合计算查看不足场景</button>`}</footer></section>`;
  }

  function rebateJourneyContent() {
    const result = rebateJourneyResult();
    return `<div class="journey-workspace">${rebateJourneyParameters()}${rebateJourneyStage(result)}</div><section class="simulator-scope annotated" data-component-id="S01">${componentBadge("S01")}<strong>模拟口径</strong><span>依据当前生产结算规则演示典型返水链路，不生成真实返水、账单或余额变动。</span></section>`;
  }

  function profitSimulatorInner() {
    const journey = profitSimulatorState.view === "journey";
    const legacy = profitSimulatorState.mode.startsWith("legacy");
    const result = legacy ? legacySimulatorResult() : negativeProfitSimulatorResult();
    const advanced = `${simulatorModeSelector()}<div class="simulator-workspace">${legacy ? legacySimulatorParameters(result) : negativeSimulatorParameters()}<div class="simulator-output">${legacy ? legacyRelationshipGraph(result) : negativeRelationshipGraph(result)}${simulatorSteps(legacy ? legacyCalculationSteps(result) : negativeCalculationSteps(result))}</div></div>${legacy ? legacySettlement(result) : negativeSettlement(result)}<section class="simulator-scope annotated" data-component-id="S01">${componentBadge("S01")}<strong>模拟口径</strong><span>依据当前生产计算规则；只解释典型关系与资金流，不产生任何真实账单或余额变动。</span></section>`;
    return `<header class="simulator-heading"><div><span>COMMISSION FLOW LAB</span><h1>分润与代理模式模拟器</h1><p>${journey ? "跟随一笔业务逐步观察会员到账、费用承担和后续结算。" : "调整参数，观察关系、计算和可申请提款余额如何同步变化。"}</p></div><div class="simulator-live"><i></i><span>${journey ? "逐步推演" : "实时计算"}</span></div></header>${profitSimulatorViewSelector()}${journey ? rebateJourneyContent() : advanced}`;
  }

  function profitSimulatorContent() {
    return `<main id="profit-simulator-root" class="profit-simulator">${profitSimulatorInner()}</main>`;
  }

  function agent498DateControl(options = {}) {
    const startDay = options.startDay || 1;
    const endDay = options.endDay || 31;
    const startTime = options.startTime || "00:00:00";
    const endTime = options.endTime || "23:59:59";
    const calendarDays = (selectedDay) => Array.from({ length: 31 }, (_, index) => {
      const day = index + 1;
      return `<button type="button" class="calendar-day${day === selectedDay ? " selected" : ""}" data-day="${day}">${day}</button>`;
    }).join("");
    const calendar = (rangeSide, selectedDay, time) => `<section class="calendar-panel" data-range-side="${rangeSide}" data-year="2026" data-month="7"><header><button type="button" class="agent-date-month-nav" data-month-step="-1" aria-label="上个月">‹</button><strong>2026年7月</strong><button type="button" class="agent-date-month-nav" data-month-step="1" aria-label="下个月">›</button></header><div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="calendar-days">${calendarDays(selectedDay)}</div><label class="calendar-time">${rangeSide === "start" ? "开始时间" : "结束时间"}<input type="time" value="${time}" step="1" /></label></section>`;
    return `<div class="date-range-field agent-498-date-field"><button class="risk-range agent-498-date" type="button" data-date-trigger aria-expanded="false"><span>2026-07-${String(startDay).padStart(2, "0")} ${startTime}</span><b>至</b><span>2026-07-${String(endDay).padStart(2, "0")} ${endTime}</span></button><div class="date-picker-popover dual-calendar agent-498-date-popover" hidden><div class="quick-ranges agent-498-date-quick"><button type="button" data-range-days="0">今日</button><button type="button" data-range-days="1">昨日</button><button type="button" data-range-days="week">本周</button><button type="button" data-range-days="30">30天</button><button type="button" data-range-days="90">90天</button><button type="button" data-range-days="180">180天</button></div>${calendar("start", startDay, startTime)}${calendar("end", endDay, endTime)}<p class="agent-date-error" role="alert" hidden>开始时间不得晚于结束时间</p><footer><button type="button" class="secondary-action date-close">取消</button><button type="button" class="main-action date-apply">确定</button></footer></div></div>`;
  }

  function agent498Field(label, type = "input", options = [], className = "") {
    if (label === "所属站点") return siteMultiSelect(label, className);
    if (["代理账号/编号", "上级代理账号/编号"].includes(label)) return agentSmartField(className, label);
    const control = type === "select"
      ? `<select>${options.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select>`
      : type === "date"
        ? agent498DateControl()
        : `<input type="text" placeholder="请输入${escapeHtml(label)}" />`;
    return `<div class="risk-field ${type === "date" ? "risk-field-wide agent-498-date-wrapper " : ""}${className}"><label>${escapeHtml(label)}</label>${control}</div>`;
  }

  function agent498Filter(fields, exportable = false, compactActions = false) {
    const normalizedFields = currentPageKey.startsWith("control-") ? fields : fields.filter((field) => !["所属站点", "站点", "站点名称"].includes(field[0]));
    const exportButton = exportable ? `<button type="button" class="secondary-action annotated" data-component-id="B01">${componentBadge("B01")}导出表格</button>` : "";
    return `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid agent-498-filter-grid${compactActions ? " compact-filter-actions" : ""}">${normalizedFields.map((field) => agent498Field(...field)).join("")}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button>${exportButton}</div></div></section>`;
  }

  function agent498Table(title, headers, rows, total = 128, className = "") {
    return `<section class="risk-list-card annotated agent-498-table-card" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>${escapeHtml(title)}</h2><span>共 ${total} 条</span></div></div><div class="risk-table-wrap"><table class="risk-table agent-498-table ${className}"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${pagination(20, total)}</section>`;
  }

  function agent498PageHeading(title, subtitle = "") {
    return `<div class="risk-page-heading agent-498-heading"><div><h1>${escapeHtml(title)}</h1>${subtitle ? `<span>${escapeHtml(subtitle)}</span>` : ""}</div></div>`;
  }

  function agent498DashboardContent(page) {
    const help = {
      estimatedCommissionNetProfit: ["本期佣金预估净收益", "当前佣金周期内，系统根据您自身会员和下级代理产生的数据，预估扣除相关运营费用后本期可能获得的净佣金；不随页面日期筛选变化。"],
      estimatedTeamCommissionNetProfit: ["本期团队佣金预估净收益", "当前负盈利佣金周期内，按团队负责人及有效副线的团队经营数据、适用返佣等级、运营费用和历史结转项实时试算的团队净佣金；最终以生成的团队账单为准。"],
      currentBalance: ["当前余额", "当前可提款或可用于转账的代理余额；提款审核通过后从此余额扣除，不随页面日期筛选变化。"],
      totalPromotionCommission: ["总推广佣金", "历史累计产生的全部推广佣金，包含已结算和待结算佣金；不随页面日期筛选变化。"],
      settledCommission: ["已结算佣金", "平台已经完成结算并发放的历史佣金总额；不随页面日期筛选变化。"],
      monthlyTotalWinLoss: ["本月总输赢", "本月当前代理体系下会员游戏结果对应的平台盈亏合计；正数表示平台盈利，负数表示平台亏损。"],
      monthlyNetWinLoss: ["本月净输赢", "本月总输赢扣除当前佣金规则纳入的运营费用后得到的净结果；计算公式和费用口径与佣金报表保持一致。"],
      subordinateBonus: ["下级红利", "本月当前代理体系下会员产生并由代理实际承担的红利金额合计。"],
      monthlyRebate: ["本月返水", "本月当前代理体系下会员产生并由代理实际承担的返水金额合计。"],
      depositWithdrawFee: ["充提手续费", "本月当前代理按承担比例分摊后的存款、提款手续费合计。"],
      totalAgents: ["代理总人数", "名下所有层级的下级代理总人数，不包含当前代理本人；星级代理当前不统计下级代理人数。"],
      newAgentsMonthly: ["新增代理", "筛选时间内，名下新增注册的下级代理人数，不包含当前代理本人；星级代理当前不统计。"],
      activeAgents: ["活跃代理", "筛选时间内，下级代理中存在登录或活跃记录的代理人数，不包含当前代理本人。"],
      totalMembers: ["会员总数", "当前代理体系下注册会员总人数，为历史累计数据，不随页面日期筛选变化。"],
      newMembersMonthly: ["新增会员", "筛选时间内，新增注册到当前代理体系下的会员人数。"],
      newActiveMembers: ["新增活跃会员", "按【总控后台 → 代理管理 → 返佣方案 → 负盈利返佣方案】当前生效的新增活跃会员判定标准统计，同一会员只计算一次。"],
      activeMembers: ["活跃会员", "按【总控后台 → 代理管理 → 返佣方案 → 负盈利返佣方案】当前生效的活跃会员判定标准统计，同一会员只计算一次。"],
      paidMembers: ["付费会员", "筛选时间内，当前代理体系下充值成功且实际到账金额大于0的会员人数，同一会员只计算一次。"],
      newPaidMembersMonthly: ["新增付费", "筛选时间内，在平台完成首次成功充值的会员人数。"],
      agentPromotedMembers: ["代理推广会员", "筛选时间内，下级代理推广新增的会员人数；不包含当前代理本人直接推广的会员。"],
      memberPromotedMembers: ["会员推广会员", "筛选时间内，由当前代理体系下会员邀请注册的新会员人数，同一会员只计算一次。"],
      lostMembersMonthly: ["30天未登录会员数", "当前代理体系下连续30天未登录或未活跃的会员人数，不随页面日期筛选变化。"]
    };
    const card = (key, value, footer = "— 较上周期", extra = "", detail = "", changeState = "") => {
      const [name, description] = help[key];
      return `<article class="agent-dashboard-card${["estimatedCommissionNetProfit", "estimatedTeamCommissionNetProfit", "currentBalance", "totalPromotionCommission", "settledCommission", "totalAgents", "totalMembers", "lostMembersMonthly"].includes(key) ? " static" : ""}${changeState ? ` ${changeState}` : ""}"><header><span>${name}</span><button type="button" class="agent-dashboard-help" data-help-title="${name}" data-help-description="${description}" aria-label="查看${name}说明">?</button></header><strong>${value}</strong><footer><small>${footer}</small>${extra ? `<b>${extra}</b>` : ""}${detail ? `<button type="button" class="agent-dashboard-detail" data-detail-type="${detail}">点击查看详情</button>` : ""}</footer></article>`;
    };
    const section = (title, cards, cols = 4, annotated = false, changeState = "", componentId = "T01") => `<section class="agent-dashboard-section${annotated ? " annotated" : ""}${changeState ? ` ${changeState}` : ""}"${annotated ? ` data-component-id="${componentId}"` : ""}>${annotated ? componentBadge(componentId) : ""}<h2>${title}</h2><div class="agent-dashboard-grid cols-${cols}">${cards.join("")}</div></section>`;
    const levelPanel = `<section class="agent-498-level-panel annotated" data-component-id="P01">${componentBadge("P01")}<div class="agent-level-ring"><strong>0星</strong><span>当前佣金比例</span><b>20%</b></div><div class="agent-level-progress"><header><div><span>距离下一等级</span><strong>1星代理 · 佣金比例35%</strong></div><button type="button" class="secondary-action agent-level-detail">查看等级阶梯</button></header><label>新增活跃会员 <b>1 / 1</b></label><div><i style="width:100%"></i></div><label>活跃会员 <b>18 / 20</b></label><div><i style="width:90%"></i></div></div></section>`;
    const teamContext = agent498IsTeamIdentity();
    const teamLeaderContext = agent498IsTeamLeader();
    const starContext = agent498Identity === "STAR";
    const scopeLabel = agent498Identity === "TEAM_SUBLINE" ? "当前副线个人数据" : teamContext ? "当前团队权限数据" : "当前代理权限数据";
    const traditionalCommissionEstimate = section("本期佣金预估净收益", [card("estimatedCommissionNetProfit", "¥32,680", "↑ 8.6% 较上周期", "结算时间 2026-08-05")], starContext ? 1 : 4, !starContext, "production-unchanged-section", "P01");
    const teamCommissionEstimate = section("本期团队佣金预估净收益", [card("estimatedTeamCommissionNetProfit", "¥46,280", "当前负盈利佣金周期", "预计结算日 2026-08-05")], 4, true, "", "P01");
    const commissionFeature = starContext
      ? `<div class="agent-dashboard-feature-row">${traditionalCommissionEstimate}${levelPanel}</div>`
      : teamLeaderContext
        ? teamCommissionEstimate
        : agent498Identity === "TEAM_SUBLINE"
          ? ""
          : traditionalCommissionEstimate;
    const commissionBalanceCards = teamContext
      ? [card("currentBalance", "¥128,600", "— 较上周期"), card("settledCommission", "¥269,660", "— 较上周期")]
      : [card("currentBalance", "¥128,600", "— 较上周期"), card("totalPromotionCommission", "¥398,260", "— 较上周期"), card("settledCommission", "¥269,660", "— 较上周期")];
    const commissionBalance = section("佣金余额", commissionBalanceCards, teamContext ? 2 : 3, false, "production-unchanged-section");
    const agentMetrics = starContext || agent498Identity === "TEAM_SUBLINE" ? "" : section("代理数据", [card("totalAgents", "8", "— 较上周期"), card("newAgentsMonthly", "2", "↑ 100% 较上周期"), card("activeAgents", "6", "↑ 20% 较上周期", "活跃率 75%")], 4, false, "production-unchanged-section");
    return `${agent498PageHeading("WC后台管理", `代理数据看板 · ${scopeLabel}`)}<div class="agent-dashboard-toolbar production-unchanged-controls"><button type="button" class="secondary-action agent-dashboard-guide"><span aria-hidden="true">?</span>看板说明</button><div class="agent-dashboard-date">${agent498DateControl({ startDay: 4, endDay: 4, endTime: "10:30:00" })}</div></div>${commissionFeature}${commissionBalance}${section("资金流水", [card("monthlyTotalWinLoss", "+¥286,540", "↑ 9.3% 较上周期", "", "", "dashboard-name-only-change"), card("monthlyNetWinLoss", "+¥221,680", "↑ 7.8% 较上周期"), card("subordinateBonus", "¥18,260", "↑ 4.2% 较上周期"), card("monthlyRebate", "¥24,880", "↑ 5.6% 较上周期"), card("depositWithdrawFee", "¥12,460", "↑ 2.6% 较上周期", "", "", "dashboard-name-only-change")], 4, true)}${agentMetrics}${section("会员数据", [card("totalMembers", "1,286", "— 较上周期"), card("newMembersMonthly", "186", "↑ 18.4% 较上周期"), card("newActiveMembers", "74", "↑ 12.1% 较上周期"), card("activeMembers", "328", "↑ 9.6% 较上周期", "活跃率 25.5%"), card("paidMembers", "241", "↑ 7.2% 较上周期", "付费率 18.7%"), card("newPaidMembersMonthly", "93", "↑ 14.8% 较上周期"), card("agentPromotedMembers", "142", "↑ 6.1% 较上周期", "占比 11%"), card("memberPromotedMembers", "44", "↑ 3.5% 较上周期", "裂变率 3.4%"), card("lostMembersMonthly", "86", "— 较上周期", "流失率 6.7%")], 4, false, "production-unchanged-section")}`;
  }

  function agent498MemberRows(team = false) {
    return [
      ["member_087", "张明", team ? "subline_a" : '<span class="data-tag tag-green">高价值</span>', "68,000", "12,500", "+8,620", "2026-07-30 22:18:06", "2026-05-12 10:26:30", "2026-05-12 10:45:12", "2026-07-30 21:36:18", "重点维护", '<button class="link-action agent-member-detail">详情</button><button class="link-action agent-member-more">更多</button>'],
      ["member_102", "李娜", team ? "subline_b" : '<span class="data-tag">稳定</span>', "36,800", "9,200", "-1,260", "2026-07-30 20:11:38", "2026-06-03 14:20:18", "2026-06-03 15:02:41", "2026-07-30 19:52:06", "—", '<button class="link-action agent-member-detail">详情</button><button class="link-action agent-member-more">更多</button>'],
      ["member_205", "王强", team ? "agent_mike" : '<span class="data-tag tag-amber">待跟进</span>', "12,000", "3,600", "+560", "2026-07-29 18:36:20", "2026-07-02 09:18:16", "2026-07-02 09:35:04", "2026-07-28 16:20:05", "首存后活跃", '<button class="link-action agent-member-detail">详情</button><button class="link-action agent-member-more">更多</button>']
    ];
  }

  function agent498SubordinateContent(page, tab) {
    if (tab === "代理列表") {
      if (agent498IsTeamLeader()) {
        const rows = agent498Identity === "TEAM_LEADER_SINGLE"
          ? [["1086", "agent_mike", agent498TeamIdentity === "OFFICIAL" ? "官方代理" : "普通代理", "负责人", "单线", "328", "2026-05-01 10:12:30", '<span class="result-tag approved">正常</span>']]
          : [["1086", "agent_mike", agent498TeamIdentity === "OFFICIAL" ? "官方代理" : "普通代理", "负责人", "多线", "328", "2026-05-01 10:12:30", '<span class="result-tag approved">正常</span>'], ["1102", "subline_a", agent498TeamIdentity === "OFFICIAL" ? "官方代理" : "普通代理", "副线", "多线", "186", "2026-06-01 10:00:00", '<span class="result-tag approved">正常</span>']];
        return `<div class="unchanged-production">${agent498Filter([["代理账号/编号", "input"], ["代理身份", "select", ["全部身份", "官方代理", "普通代理"]], ["代理状态", "select", ["全部状态", "正常", "禁用"]]], true)}${agent498Table("团队代理", ["代理ID", "代理账号", "代理身份", "团队角色", "团队模式", "直属会员数", "加入团队时间", "状态"], rows, rows.length)}</div>`;
      }
      return `<div class="unchanged-production">${agent498Filter([["代理账号/编号", "input"], ["代理状态", "select", ["全部状态", "正常", "禁用"]]], true)}${agent498Table("代理列表", ["代理ID", "代理账号", "代理类型", "注册时间", "上级代理账号", "上级代理编号", "代理状态", "直属会员数", "佣金方案", "代理钱包余额（CNY）", "最后登录"], [["1086", agent498IdentityConfig[agent498Identity].account, agent498IdentityConfig[agent498Identity].label, "2026-05-01 10:12:30", "parent_agent", "AG10001", '<span class="result-tag approved">正常</span>', agent498Identity === "STAR" ? "0" : "86", "传统佣金方案A", "128,600", "2026-07-31 00:18:06"]], 8)}</div>`;
    }
    if (["会员管理", "团队会员"].includes(tab)) {
      const team = tab === "团队会员";
      const fields = [...(team ? [["代理账号/编号", "input"]] : []), ["会员账号", "input"], ["VIP等级", "select", ["全部等级", "VIP0", "VIP1", "VIP2"]], ["状态", "select", ["全部状态", "正常", "禁用"]], ["统计时间", "date"], ["注册时间", "date"]];
      const headers = ["会员账号", "真实姓名", team ? "所属代理" : "代理标签", "总存款（CNY）", "总提款（CNY）", "总输赢（代理视角）（CNY）", "最后登录时间", "注册时间", "首存时间", "最后投注时间", "备注", "操作"];
      return `${agent498Filter(fields)}${agent498Table(tab, headers, agent498MemberRows(team), team ? 328 : 186, "agent-member-table")}`;
    }
    if (tab === "存款管理") return `${agent498Filter([["会员账号", "input"], ["支付方式", "select", ["全部方式", "USDT", "支付宝", "代理代存"]], ["状态", "select", ["全部状态", "待支付", "确认中", "成功", "确认失败", "用户取消"]], ["存款申请时间", "date"]], true, true)}${agent498Table("存款记录", ["序号", "会员账号", "上级代理账号", "上级代理编号", "单号", "订单金额（CNY）", "实际到账（CNY）", "存款申请时间", "完成时间", "状态", "支付方式"], [["1", "member_087", "agent_mike", "AG10086", "DP202608040086", "5,000", "5,000", "2026-08-04 08:20:06", "2026-08-04 08:21:30", '<span class="result-tag approved">成功</span>', "代理代存"], ["2", "member_102", "subline_a", "AG10102", "DP202608040072", "2,000", "0", "2026-08-04 07:12:40", "2026-08-04 07:15:08", '<span class="result-tag rejected">用户取消</span>', "USDT"]], 236)}`;
    if (tab === "红利记录") return `${agent498Filter([["会员账号", "input"], ["红利类型", "select", ["全部类型", ...bonusTypeOptions]], ["领取时间", "date"]], true, true)}${agent498Table("红利记录", ["序号", "会员账号", "上级代理账号", "上级代理编号", "钱包类型", "钱包名称", "红利类型", "金额（CNY）", "流水倍数", "发放时间", "领取时间"], [["1", "member_087", "agent_mike", "AG10086", "中心钱包", "主钱包", "VIP周礼金", "188", "1倍", "2026-08-04 08:00:00", "2026-08-04 08:36:18"], ["2", "member_102", "subline_a", "AG10102", "中心钱包", "主钱包", "活动彩金", "500", "3倍", "2026-08-04 09:20:00", "2026-08-04 09:25:06"]], 92)}`;
    if (tab === "游戏记录") {
      const detailA = member493BetDetail(["厅别：国际厅", "玩法：英超 · 全场让球", "盘口：主队 -0.5", "赔率：1.86", "赛果：2 : 1", "结算结果：全赢"], "英超联赛", true);
      const detailB = member493BetDetail(null, "麻将胡了");
      const rows = [
        ["1", "BET202608040186", "member_087", "agent_mike", "VIP3", "DW体育", "英超联赛", detailA, "1,000", "1,000", "2026-08-04 08:12:36", '<span class="result-tag approved">已结算</span>', "1,860"],
        ["2", "BET202608040152", "member_102", "subline_a", "VIP1", "PG电子", "麻将胡了", detailB, "500", "500", "2026-08-04 08:36:18", '<span class="result-tag approved">已结算</span>', "0"],
        ["3", "BET202608040143", "member_205", "agent_mike", "VIP2", "DB真人", "龙虎", member493BetDetail(["玩法：龙虎", "投注项：龙", "赛果：龙"], "龙虎"), "800", "800", "2026-08-04 09:02:41", '<span class="result-tag approved">已结算</span>', "1,560"],
        ["4", "BET202608040128", "member_311", "subline_b", "VIP4", "FB体育", "日职联", detailA, "2,000", "2,000", "2026-08-04 09:18:05", '<span class="result-tag">未结算</span>', "0"],
        ["5", "BET202608040106", "member_422", "subline_a", "VIP2", "DB彩票", "时时彩", member493BetDetail(["期号：20260804058", "玩法：五星直选", "投注号码：1,3,5,7,9"], "时时彩"), "300", "300", "2026-08-04 09:46:22", '<span class="result-tag approved">已结算</span>', "540"],
        ["6", "BET202608040091", "member_536", "agent_mike", "VIP5", "PA捕鱼", "深海捕鱼", member493BetDetail(null, "深海捕鱼"), "1,200", "1,180", "2026-08-04 10:05:49", '<span class="result-tag approved">已结算</span>', "920"]
      ];
      return `${agent498Filter([["会员账号", "input"], ["场馆名称", "select", ["全部场馆", ...rebateVenueCatalog.map((item) => item.name)]], ["注单状态", "select", ["全部状态", "未结算", "已结算", "已取消", "已作废"]], ["时间类型", "select", ["下注时间", "结算时间", "开赛时间"]], ["时间范围", "date"]], true)}${agent498Table("游戏记录", ["序号", "投注单号", "会员账号", "代理账号", "VIP等级", "场馆名称", "游戏名称", "下注详情", "总投注（CNY）", "有效投注（CNY）", "下注时间", "注单状态", "派彩（CNY）"], rows, 568)}`;
    }
    if (tab === "团队信息") return `<section class="agent-team-summary annotated" data-component-id="P01">${componentBadge("P01")}<div><span>主线账号</span><strong>agent_mike</strong></div><div><span>团队名称</span><strong>北极星团队</strong></div><div><span>团队代理</span><strong>8</strong></div><div><span>下级会员数</span><strong>328</strong></div></section>${agent498Filter([["代理账号/编号", "input"], ["加入团队时间", "date"]], true)}${agent498Table("团队信息", ["序号", "代理账号", "下级会员数", "首存人数", "加入团队时间", "备注", "操作"], [["1", "subline_a", '<button class="link-action agent-team-members">86</button>', "24", "2026-06-01 10:00:00", "体育线", '<button class="link-action agent-team-report" data-report="财务报表">团队财务</button><button class="link-action agent-team-report" data-report="佣金报表">团队佣金</button><button class="link-action agent-team-note">修改备注</button>'], ["2", "subline_b", '<button class="link-action agent-team-members">62</button>', "18", "2026-06-08 12:20:00", "电子线", '<button class="link-action agent-team-report" data-report="财务报表">团队财务</button><button class="link-action agent-team-report" data-report="佣金报表">团队佣金</button><button class="link-action agent-team-note">修改备注</button>']], 8)}`;
    if (tab === "操作记录") return `${agent498Filter([["团队名称", "input"], ["代理账号/编号", "input"], ["操作时间", "date"]], true)}${agent498Table("操作记录", ["序号", "团队名称", "代理身份", "主线编号", "主线账号", "副线账号", "操作内容", "操作理由", "操作时间", "操作人"], [["1", "北极星团队", "团队负责人（多线）", "AG10086", "agent_mike", "subline_b", "新增副线", "扩展电子业务线", "2026-08-04 09:20:18", "admin.mike"], ["2", "北极星团队", "团队负责人（多线）", "AG10086", "agent_mike", "subline_a", "修改备注", "更新业务分工", "2026-08-04 08:36:02", "admin.lina"], ["3", "北极星团队", "团队负责人（多线）", "AG10086", "agent_mike", "—", "创建团队", "建立负盈利团队", "2026-07-30 14:12:40", "admin.mike"]], 36)}`;
    return `${agent498Filter([["会员账号", "input"], ["统计月份", "select", ["2026-07", "2026-06", "2026-05"]], ["注册时间", "date"], ["活跃类型", "select", ["全部类型", "新增活跃", "活跃会员", "首存会员"]]], true)}${agent498Table("活跃会员", ["序号", "会员账号", "活跃类型", "存款金额（CNY）", "提款金额（CNY）", "首存时间", "注册时间"], [["1", "member_087", '<span class="data-tag tag-green">新增活跃</span>', "5,000", "0", "2026-07-06 12:30:00", "2026-07-06 12:12:10"], ["2", "member_102", '<span class="data-tag">活跃会员</span>', "12,000", "3,000", "2026-06-03 15:02:41", "2026-06-03 14:20:18"]], 328)}`;
  }

  function agent498WalletPanel(kind, title, mode = "") {
    const balanceKey = `${kind}-${mode || "default"}`;
    const unlocked = agent498UnlockedBalances.has(balanceKey);
    const balanceValue = kind === "withdraw" ? "128,600" : kind === "recharge" ? "86,000" : mode.includes("佣金") ? "128,600" : "86,000";
    const fields = kind === "withdraw"
      ? `${agent498Field("提款账户", "select", ["USDT · TRC20 · TJ8...r2K", "EBPAY · EB****966"])}${agent498Field("提款金额")}<div class="agent-amount-preview"><span>手续费</span><strong>20 CNY</strong></div><div class="agent-amount-preview"><span>预计到账</span><strong>7,980 CNY</strong></div>`
      : kind === "deposit"
        ? `${agent498Field("下级会员账号")}${agent498Field("代存金额")}${agent498Field("提款流水倍数")}<div class="agent-amount-preview"><span>当前操作类型</span><strong>${escapeHtml(mode)}</strong></div>`
        : kind === "recharge"
          ? `${agent498Field("付款方式", "select", ["USDT", "支付宝", "银行卡"])}${agent498Field("充值金额")}`
          : `${agent498Field("团队副线账号")}${agent498Field("转账金额")}<div class="agent-amount-preview"><span>当前操作类型</span><strong>${escapeHtml(mode)}</strong></div><div class="agent-amount-preview"><span>今日剩余额度</span><strong>48,000 CNY</strong></div>`;
    const accountAction = kind === "withdraw" ? '<button type="button" class="secondary-action agent-add-withdraw-account">管理提款账户</button>' : "";
    const remark = ["deposit", "transfer"].includes(kind) ? '<label class="agent-498-remark">备注<textarea placeholder="请输入备注"></textarea></label>' : "";
    return `<section class="agent-transaction-panel annotated" data-component-id="P01">${componentBadge("P01")}<header><div><span>${escapeHtml(title)}</span><strong class="masked-balance" data-balance-key="${escapeHtml(balanceKey)}">${unlocked ? `${balanceValue} CNY <button type="button" class="link-action agent-balance-hide">隐藏</button>` : '•••••• <button type="button" class="link-action agent-balance-unlock">显示余额</button>'}</strong></div><span class="data-tag">${kind === "transfer" ? "仅团队主线可用" : "安全验证后提交"}</span></header><div class="agent-transaction-form">${fields}${remark}</div><footer><span>提交时进行支付密码及当前生效的安全校验</span>${accountAction}<button type="button" class="main-action agent-transaction-submit">提交</button></footer></section>`;
  }

  function agent498SubView(page) {
    const visibleTabs = agent498VisibleTabs(page);
    if (visibleTabs.length <= 1) return "";
    const active = agent498ActiveTab(page);
    const componentId = page.tabComponentId || "N02";
    const hiddenTabs = agent498ShowHidden ? page.tabs.filter((tab) => !visibleTabs.includes(tab)) : [];
    const annotated = page.annotations?.some((annotation) => annotation.id === componentId);
    return `<nav class="inner-tabs agent-498-tertiary-tabs${annotated ? " annotated" : ""}"${annotated ? ` data-component-id="${componentId}"` : ""}>${annotated ? componentBadge(componentId) : ""}${visibleTabs.map((option) => `<button type="button" class="${option === active ? "active" : ""}" data-agent-498-subview="${escapeHtml(page.key)}" data-agent-498-subview-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}${hiddenTabs.map((option) => `<button type="button" class="is-permission-hidden" disabled title="当前身份无${escapeHtml(option)}数据权限">${escapeHtml(option)} · 已隐藏</button>`).join("")}</nav>`;
  }

  function agent498FinanceContent(page) {
    const menu = page.contentKey || page.name;
    const active = agent498ActiveTab(page) || menu;
    if (menu === "负盈利佣金报表") {
      if (agent498Identity === "TEAM_SUBLINE") return `<div class="unchanged-production">${agent498Filter([["佣金周期", "select", ["2026-07", "2026-06", "2026-05"]]], true)}${agent498Table("个人负盈利贡献", ["佣金周期", "代理账号", "新增活跃人数", "活跃会员人数", "存款金额（CNY）", "总输赢（CNY）", "运营费用（CNY）", "加入团队时间"], [["2026-07", "subline_a", "26", "186", "168,000", "+78,000", "31,200", "2026-06-01 10:00:00"]], 1)}</div>`;
      return `<div class="unchanged-production">${agent498Filter([["佣金周期", "select", ["2026-07", "2026-06", "2026-05"]], ["代理身份", "select", ["全部身份", "官方代理", "普通代理"]], ["代理账号/编号", "input"]], true)}${agent498Table("负盈利代理佣金报表", ["团队名称", "团队负责人", "代理身份", "佣金周期", "新增活跃人数", "活跃会员人数", "存款金额（CNY）", "总输赢（CNY）", "运营费用（CNY）", "应发佣金（CNY）", "加入团队时间"], [["北极星团队", "agent_mike", agent498TeamIdentity === "OFFICIAL" ? "官方代理" : "普通代理", "2026-07", "42", "328", "286,000", "+128,600", "54,800", "32,680", "2026-06-01 10:00:00"]], 1)}</div>`;
    }
    if (menu === "冲正统计报表") {
      const team = agent498IsTeamLeader();
      const headers = team ? ["统计周期", "团队名称", "团队负责人", "历史欠款（CNY）", "本期冲正（CNY）", "剩余欠款（CNY）", "最后更新时间"] : ["统计周期", "代理账号", "下级代理账号", "代冲正（CNY）", "已回款（CNY）", "剩余欠款（CNY）", "最后更新时间"];
      const rows = team ? [["2026-07", "北极星团队", "agent_mike", "12,000", "8,000", "4,000", "2026-07-31 02:10:00"]] : [["2026-07", agent498IdentityConfig[agent498Identity].account, "lower_agent_01", "12,000", "8,000", "4,000", "2026-07-31 02:10:00"]];
      return `<div class="unchanged-production">${agent498Filter([["统计周期", "select", ["2026-07", "2026-06", "2026-05"]]], true)}${agent498Table(team ? "团队冲正统计报表" : "冲正统计报表", headers, rows, 1)}</div>`;
    }
    if (menu === "冲正回款报表") return `<div class="unchanged-production">${agent498Filter([["发生时间", "date"], ["债务类型", "select", ["全部类型", "佣金不足", "余额不足"]], ["资金方向", "select", ["全部方向", "代冲正", "回款"]], ["代理账号/编号", "input"]], true)}${agent498Table("代理冲正/回款报表", ["债务类型", "代理账号", "上级代理账号", "资金方向", "额度（CNY）", "额度缺口（CNY）", "冲正账目ID", "发生时间"], [["佣金不足", "lower_agent_01", agent498IdentityConfig[agent498Identity].account, '<span class="data-tag tag-amber">代冲正</span>', "12,000", "4,000", "RV2026070018", "2026-07-31 02:10:00"], ["佣金不足", "lower_agent_01", agent498IdentityConfig[agent498Identity].account, '<span class="data-tag tag-green">回款</span>', "8,000", "4,000", "RV2026070018", "2026-07-31 18:20:00"]], 2)}</div>`;
    if (menu === "场馆代理费用明细") return `<div class="unchanged-production">${agent498Filter([["代理账号/编号", "input"], ["完整周范围", "date"]], true)}${agent498Table("三方场馆代理费用明细", ["时间", "上级代理账号", "代理账号", "代理级别", "代理返佣", "场馆数量", "直属承担三方场馆费用（CNY）", "级差三方场馆费用（CNY）", "总承担费用（CNY）"], [["2026-07-20 至 2026-07-26", "parent_agent", agent498IdentityConfig[agent498Identity].account, agent498IsTeamLeader() ? "团队负责人" : "一级代理", "35%", '<button type="button" class="link-action agent-venue-fee-detail">7</button>', "8,600", "2,400", "11,000"]], 1)}</div>`;
    if (menu === "提款申请") return `${agent498WalletPanel("withdraw", "可用佣金")} ${agent498Filter([["提款类型", "select", ["全部类型", "USDT", "EBPAY"]], ["状态", "select", ["全部状态", "审核中", "成功", "失败"]], ["提款申请时间", "date"]])}${agent498Table("提款记录", ["序号", "单号", "提款类型", "提款金额（CNY）", "手续费（CNY）", "预计到账（CNY）", "提款申请时间", "状态"], [["1", "WD202607300018", "USDT", "8,000", "20", "7,980", "2026-07-30 12:20:06", '<span class="result-tag">审核中</span>'], ["2", "WD202607260086", "EBPAY", "5,000", "10", "4,990", "2026-07-26 16:10:20", '<span class="result-tag approved">成功</span>']], 18)}`;
    if (menu === "代理代存") {
      const rows = active === "额度代存"
        ? [["1", "AD202607300028", "member_087", "额度代存", "5,000", '<span class="result-tag approved">成功</span>', "线下存款", "2026-07-30 18:20:06"]]
        : [["1", "AD202607290066", "member_102", "佣金代存", "2,000", '<span class="result-tag">审核中</span>', "会员补充资金", "2026-07-29 16:06:32"]];
      return `${agent498WalletPanel("deposit", active === "额度代存" ? "可用额度" : "可用佣金", active)}${agent498Filter([["下级会员账号", "input"], ["状态", "select", ["全部状态", "审核中", "成功", "失败"]], ["操作时间", "date"]], true)}${agent498Table("代存记录", ["序号", "单号", "下级会员账号", "代存类型", "代存金额（CNY）", "状态", "备注", "操作时间"], rows, 58)}`;
    }
    if (menu === "额度充值") return `${agent498WalletPanel("recharge", "当前剩余额度")} ${agent498Filter([["状态", "select", ["全部状态", "待支付", "确认中", "成功", "失败"]], ["充值时间", "date"]], true)}${agent498Table("额度充值记录", ["序号", "单号", "充值时间", "订单金额（CNY）", "实际到账（CNY）", "上分金额（CNY）", "状态"], [["1", "AR202607300019", "2026-07-30 09:26:10", "20,000", "20,000", "20,000", '<span class="result-tag approved">成功</span>'], ["2", "AR202607290072", "2026-07-29 18:14:06", "10,000", "0", "0", '<span class="result-tag">确认中</span>']], 26)}`;
    if (menu === "代理转账") {
      const rows = active === "额度转账"
        ? [["1", "AT202607300012", "subline_a", "额度转账", "5,000", '<span class="result-tag approved">成功</span>', "活动额度", "2026-07-30 10:12:08"]]
        : [["1", "AT202607280038", "subline_b", "佣金转账", "2,000", '<span class="result-tag approved">成功</span>', "佣金分配", "2026-07-28 16:32:20"]];
      return `${agent498WalletPanel("transfer", active === "额度转账" ? "可用额度" : "可用佣金", active)} ${agent498Filter([["代理账号/编号", "input"], ["状态", "select", ["全部状态", "成功", "失败"]], ["操作时间", "date"]], true)}${agent498Table("转账记录", ["序号", "单号", "代理账号", "转账类型", "转账金额（CNY）", "状态", "备注", "操作时间"], rows, 32)}`;
    }
    if (menu === "财务报表") {
      const metrics = ["存款", "提款", "红利", "返水", "场馆费", "总输赢", "净输赢", "账户调整", "存提手续费", "有效投注"].map((name, index) => `<article><span>${name}</span><strong>${index === 1 ? "-" : "+"}${money((index + 2) * 3860)}</strong></article>`).join("");
      const teamTable = active === "团队财务" ? agent498Table("团队财务", ["序号", "代理账号", "存款（CNY）", "提款（CNY）", "总输赢（CNY）", "场馆费（CNY）", "红利（CNY）", "返水（CNY）", "净输赢（CNY）", "补单输赢（CNY）", "存提手续费（CNY）"], [["—", "团队总数据", "286,000", "86,000", "+128,600", "12,800", "18,600", "22,400", "+74,800", "+2,600", "8,200"], ["1", "subline_a", "168,000", "52,000", "+78,000", "7,600", "10,200", "13,000", "+44,600", "+1,200", "4,800"], ["2", "subline_b", "118,000", "34,000", "+50,600", "5,200", "8,400", "9,400", "+30,200", "+1,400", "3,400"]], 8) : "";
      const overview = active === "团队财务" ? "" : `<section class="agent-finance-metrics annotated" data-component-id="P01">${componentBadge("P01")}${metrics}</section>`;
      return `${agent498Filter(active === "团队财务" ? [["代理账号/编号", "input"], ["统计月份", "select", ["2026-07", "2026-06", "2026-05"]]] : [["统计时间", "date"]], true)}${overview}${teamTable}`;
    }
    if (menu === "佣金报表") {
      const commissionItems = [["佣金", "32,680"], ["佣金比例", "35%"], ["活跃会员", "328"], ["新增活跃会员", "42"], ["总输赢", "+128,600"], ["净输赢", "+96,800"], ["冲正后净输赢", "+92,800"], ["上月结余", "12,000"], ["场馆费", "12,800"], ["红利", "18,600"], ["返水", "22,400"], ["账户调整", "+500"], ["补单输赢", "+2,600"], ["佣金调整", "+800"]].map(([name, value]) => `<article><span>${name}</span><strong>${value}</strong></article>`).join("");
      const teamTable = active === "团队佣金" ? agent498Table("团队佣金", ["序号", "代理账号", "下级人数", "首存人数", "新增活跃会员", "活跃人数", "新注册人数", "补单输赢（CNY）", "净输赢（CNY）", "上月结余（CNY）"], [["—", "团队总数据", "328", "93", "42", "328", "186", "+2,600", "+96,800", "12,000"], ["1", "subline_a", "186", "52", "26", "186", "108", "+1,200", "+58,600", "8,000"], ["2", "subline_b", "142", "41", "16", "142", "78", "+1,400", "+38,200", "4,000"]], 8) : "";
      const overview = active === "团队佣金" ? "" : `<section class="agent-commission-summary annotated" data-component-id="P01">${componentBadge("P01")}${commissionItems}<article><span>存提手续费</span><button type="button" class="link-action agent-fee-detail">8,200 · 查看详情</button></article></section>`;
      return `${agent498Filter(active === "团队佣金" ? [["代理账号/编号", "input"], ["佣金月份", "select", ["2026-06", "2026-05", "2026-04"]]] : [["佣金月份", "select", ["2026-06", "2026-05", "2026-04"]]], true)}${overview}${teamTable}`;
    }
    const wallet = active;
    return `${agent498Filter([["账变类型", "select", ["全部类型", "佣金结算", "代理代存", "代理转账", "额度充值"]], ["账变时间", "date"]], true)}${agent498Table(`${wallet}账变明细`, ["时间", "单号", "账变类型", "账变金额（CNY）", "余额（CNY）", "备注"], [["2026-07-30 18:20:06", "AC202607300086", wallet === "佣金钱包" ? "佣金代存" : "额度代存", "-5,000", "68,500", "向member_087代存"], ["2026-07-28 16:32:20", "AC202607280038", wallet === "佣金钱包" ? "佣金转账" : "额度转账", "-2,000", "73,500", "向subline_b转账"]], 126)}`;
  }

  function agent498ProfileContent(page, tab) {
    if (tab === "个人中心") {
      const protectedValue = (value) => agent498ProfileUnlocked ? value : "••••••••";
      const disabled = agent498ProfileUnlocked ? "" : "disabled";
      const accountRows = [["代理账号", "agent_mike"], ["代理编号", "AG10086"], ["站点名称", "WC体育"], ["下级成员", "328"], ["创建日期", "2026-05-01"], ["最近登录IP", "103.28.11.86"], ["最近登录时间", "2026-08-03 09:42:18"], ["最近登录地点", "中国 · 广东 · 深圳"]];
      const promotionRows = [["推广码", "WC966"], ["国内推广链接", "m.wc.example/r/WC966"], ["国外推广链接", "intl.wc.example/r/WC966"], ["Telegram推广链接", "t.me/wc_bot?start=WC966"], ["App下载链接", "dl.wc.example/app"], ["备用链接1", "dl-1.wc.example/app"], ["备用链接2", "dl-2.wc.example/app"], ["备用链接3", "dl-3.wc.example/app"]];
      const securityRow = (name, value, actions) => `<article><div><strong>${name}</strong><span>${protectedValue(value)}</span></div><div>${actions.map(([label, className]) => `<button type="button" class="${className}" data-security="${name}" ${disabled}>${label}</button>`).join("")}</div></article>`;
      const profileForm = agent498ProfileTab === "基本资料"
        ? `<div class="agent-profile-form agent-profile-basic-form"><label>用户昵称<input type="text" value="${protectedValue("Mike代理")}" ${disabled} /></label><label>手机号码<input type="text" value="${protectedValue("13896609660")}" ${disabled} /></label><label>性别<select ${disabled}><option>${agent498ProfileUnlocked ? "男" : "••••••••"}</option>${agent498ProfileUnlocked ? "<option>女</option><option>未知</option>" : ""}</select></label><label>出生日期<input type="${agent498ProfileUnlocked ? "date" : "text"}" value="${protectedValue("1996-08-18")}" ${disabled} /></label><footer><button type="button" class="main-action agent-profile-save" ${disabled}>保存资料</button></footer></div>`
        : `<div class="agent-security-list">${securityRow("代理邮箱", "mike.agent@mail.com", [["修改", "secondary-action agent-security-action"], ["重置", "link-action agent-security-action"]])}${securityRow("支付密码", "已设置，用于资金操作验证", [["修改", "secondary-action agent-security-action"], ["重置", "link-action agent-security-action"]])}${securityRow("安全密保", "已设置安全问题", [["修改", "secondary-action agent-security-action"], ["重置", "link-action agent-security-action"]])}${securityRow("登录密码", "已设置", [["修改", "secondary-action agent-security-password"]])}${securityRow("谷歌验证器", "已绑定，用于登录及资金安全校验", [["重置", "secondary-action agent-security-action"], ["解绑", "link-action agent-security-remove"]])}</div>`;
      return `<section class="agent-profile-unified annotated${agent498ProfileUnlocked ? "" : " is-locked"}" data-component-id="P01">${componentBadge("P01")}<header class="agent-profile-unified-header"><div class="agent-profile-avatar">${agent498ProfileUnlocked ? "AM" : "••"}</div><div class="agent-profile-identity"><h2>${protectedValue("Mike代理")}</h2><span>${protectedValue("agent_mike · AG10086")}</span><div><b>${protectedValue("团队负责人（多线）")}</b><b>${protectedValue("WC体育")}</b></div></div><div class="agent-profile-unlock-state"><span>${agent498ProfileUnlocked ? "账户信息已解锁" : "账户信息已加密"}</span><small>${agent498ProfileUnlocked ? "本次访问期间可查看和维护" : "验证身份后查看和维护全部资料"}</small></div><button type="button" class="secondary-action agent-profile-${agent498ProfileUnlocked ? "lock" : "unlock"}">${agent498ProfileUnlocked ? "锁定信息" : "解锁查看"}</button></header><div class="agent-profile-unified-body"><aside class="agent-profile-summary"><section><h3>账户与登录</h3><dl>${accountRows.map(([label, value]) => `<div><dt>${label}</dt><dd>${protectedValue(value)}</dd></div>`).join("")}</dl></section><section><h3>推广工具</h3><dl>${promotionRows.map(([label, value]) => `<div class="agent-profile-promotion-row"><dt>${label}</dt><dd><button type="button" class="link-action agent-profile-copy" data-copy-label="${label}" data-copy-value="${value}" ${disabled}>复制</button></dd></div>`).join("")}</dl></section></aside><main class="agent-profile-workspace"><nav>${["基本资料", "安全设置"].map((item) => `<button type="button" class="${agent498ProfileTab === item ? "active" : ""}" data-agent-profile-tab="${item}">${item}</button>`).join("")}</nav><div class="agent-profile-workspace-body">${profileForm}</div></main></div></section>`;
    }
    if (tab === "溢出申请") return `<section class="agent-overflow-form annotated" data-component-id="P01">${componentBadge("P01")}<header><h2>溢出申请</h2><span>提交部长级别以上同意截图</span></header><div>${agent498Field("会员账号")}${agent498Field("目标代理账号")}${agent498Field("目标代理编号")}<label>申请附图<input type="file" /></label></div><button type="button" class="main-action agent-overflow-submit">提交申请</button></section>${agent498Filter([["会员账号", "input"], ["状态", "select", ["全部状态", "待审核", "已通过", "已拒绝"]], ["新增时间", "date"], ["审核时间", "date"]])}${agent498Table("申请记录", ["会员账号", "代理账号", "代理编号", "原代理账号", "原代理编号", "状态", "备注", "新增时间", "审核时间"], [["member_087", "subline_b", "AG10126", "subline_a", "AG10102", '<span class="result-tag">待审核</span>', "业务线调整", "2026-07-30 16:20:08", "—"], ["member_102", "agent_mike", "AG10086", "subline_b", "AG10126", '<span class="result-tag approved">已通过</span>', "团队合并", "2026-07-26 12:06:18", "2026-07-26 14:20:06"]], 12)}`;
    if (tab === "系统公告") return `<div class="agent-notice-toolbar"><label><input type="checkbox" /> 全选</label><button type="button" class="secondary-action">批量已读</button><button type="button" class="secondary-action">批量删除</button></div>${agent498Table("系统公告", ["选择", "标题", "状态", "时间", "操作"], [['<input type="checkbox" />', "7月佣金结算通知", '<span class="data-tag tag-amber">未读</span>', "2026-07-30 18:00:00", '<button class="link-action">查看</button>'], ['<input type="checkbox" />', "代理后台安全升级", '<span class="data-tag">已读</span>', "2026-07-28 12:30:00", '<button class="link-action">查看</button>']], 18)}`;
    return `${agent498Filter([["发起时间", "date"], ["报表名称", "input"], ["状态", "select", ["全部状态", "等待", "进行中", "成功", "失败", "已过期"]]])}<section class="agent-download-warning"><strong>文件保留提示</strong><span>导出文件按最终确认的有效期保留，请在有效时间内完成下载。</span></section>${agent498Table("我的下载", ["序号", "下载任务编号", "报表名称", "发起时间", "结束时间", "状态", "操作"], [["1", "EXP202607300028", "团队佣金报表", "2026-07-30 18:10:00", "2026-07-30 18:10:26", '<span class="result-tag approved">成功</span>', '<button class="link-action">下载</button>'], ["2", "EXP202607300018", "存款记录", "2026-07-30 16:20:00", "—", '<span class="result-tag">进行中</span>', "—"]], 26)}`;
  }

  function agent498OperationsContent() {
    return `<div class="unchanged-production">${agent498Filter([["活动名称", "input"], ["活动类型", "select", ["全部类型", "存款活动", "投注活动", "签到活动"]], ["查询日期", "date"]])}${agent498Table("活动管理", ["时间", "活动编码", "活动名称", "活动类型", "活动对象", "开始时间", "结束时间", "活动排序", "热门排序", "当前状态", "操作"], [["2026-07-30 10:00:00", "ACT202607018", "夏日存款礼遇", "存款活动", "全部会员", "2026-07-30", "2026-08-15", "10", "3", '<span class="result-tag approved">进行中</span>', '<button type="button" class="link-action agent-activity-detail">详细</button>'], ["2026-07-15 10:00:00", "ACT202607006", "周末体育加码", "投注活动", "体育会员", "2026-07-15", "2026-07-31", "20", "8", '<span class="result-tag">已结束</span>', '<button type="button" class="link-action agent-activity-detail">详细</button>']], 18)}</div>`;
  }

  function control498Content(page) {
    if (page.key === "control-agent-quota-498") {
      const typeRows = [
        ["官代", "10,000", "100,000", '<span class="result-tag approved">启用</span>', "mike.admin", "2026-08-02 15:20:06", '<button type="button" class="link-action control-quota-type-edit" data-agent-type="官代" data-single-limit="10000" data-daily-limit="100000" data-status="启用">编辑</button>'],
        ["普代", "5,000", "50,000", '<span class="result-tag approved">启用</span>', "mike.admin", "2026-08-02 15:20:06", '<button type="button" class="link-action control-quota-type-edit" data-agent-type="普代" data-single-limit="5000" data-daily-limit="50000" data-status="启用">编辑</button>']
      ];
      const accountRows = [
        ["AG10086", "agent_mike", "官代", "20,000", "200,000", "2026-07-28 10:20:06", "mike.admin", "2026-08-02 15:26:18"],
        ["AG10102", "subline_a", "普代", "8,000", "80,000", "2026-07-29 11:10:20", "mike.admin", "2026-08-01 18:06:32"]
      ];
      const accountBody = accountRows.map((row, index) => `<tr><td class="control-quota-select-cell"><input type="checkbox" class="control-quota-row-select" aria-label="选择代理 ${row[1]}" data-agent-account="${row[1]}" /></td><td>${index + 1}</td>${row.map((cell) => `<td>${cell}</td>`).join("")}<td><button type="button" class="link-action control-quota-account-edit" data-agent-number="${row[0]}" data-agent-account="${row[1]}" data-agent-type="${row[2]}" data-single-limit="${row[3].replaceAll(",", "")}" data-daily-limit="${row[4].replaceAll(",", "")}">编辑</button><button type="button" class="link-action control-quota-remove" data-agent-account="${row[1]}">移出</button></td></tr>`).join("");
      return `<div class="agent-498-page">${agent498PageHeading("代存额度设置", "代理管理")}<section class="risk-list-card annotated agent-498-table-card" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>按代理类型设置</h2><span>账号级配置优先</span></div></div><div class="risk-table-wrap"><table class="risk-table agent-498-table control-quota-type-table"><thead><tr>${["代理类型", "单次代存金额（CNY）", "当日限额（CNY）", "状态", "最后操作人", "最后操作时间", "操作"].map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${typeRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>${agent498Filter([["所属站点", "select"], ["代理账号/编号", "input"], ["代理类型", "select", ["全部类型", "官代", "普代"]], ["操作时间", "date"]])}<section class="risk-list-card annotated agent-498-table-card" data-component-id="T02">${componentBadge("T02")}<div class="risk-list-heading"><div><h2>按代理账号设置</h2><span>共 2 条</span></div><div class="control-quota-toolbar"><span class="control-quota-selected-count">已选 0 条</span><button type="button" class="main-action control-quota-add">新增代理配置</button><button type="button" class="secondary-action control-quota-batch-remove" disabled>批量移出</button></div></div><div class="risk-table-wrap"><table class="risk-table agent-498-table control-quota-account-table"><thead><tr><th class="control-quota-select-cell"><input type="checkbox" class="control-quota-select-all" aria-label="全选代理配置" /></th>${["序号", "代理编号", "代理账号", "代理类型", "单次代存金额（CNY）", "当日限额（CNY）", "创建时间", "最后操作人", "最后操作时间", "操作"].map((item) => `<th>${item}</th>`).join("")}</tr></thead><tbody>${accountBody}</tbody></table></div>${pagination(20, 2)}</section></div>`;
    }
    const active = agent498ActiveTab(page) || "溢出审核";
    const rows = active === "溢出审核"
      ? [["1", "WC体育", "member_087", "subline_b", "AG10126", "subline_a", "AG10102", "业务线调整", '<button type="button" class="link-action control-overflow-image">查看图片</button>', "2026-07-30 16:20:08", '<button type="button" class="link-action control-overflow-pass">通过</button><button type="button" class="link-action control-overflow-reject">拒绝</button>']]
      : [["1", "WC体育", "member_102", "agent_mike", "AG10086", "subline_b", "AG10126", "团队合并", "已通过", "mike.admin", "2026-07-26 14:20:06", "同意调整"]];
    const headers = active === "溢出审核"
      ? ["序号", "所属站点", "会员账号", "目标代理账号", "目标代理编号", "原代理账号", "原代理编号", "申请理由", "申请附图", "申请时间", "操作"]
      : ["序号", "所属站点", "会员账号", "目标代理账号", "目标代理编号", "原代理账号", "原代理编号", "申请理由", "审核结果", "审核人", "审核时间", "审核备注"];
    return `<div class="agent-498-page">${agent498PageHeading("溢出管理", "代理管理")}${agent498SubView(page)}${agent498Filter([["所属站点", "select"], ["代理账号/编号", "input"], ["代理类型", "select", ["全部类型", "官代", "普代"]], ["会员账号", "input"], ["申请时间", "date"]])}${agent498Table(active, headers, rows, active === "溢出审核" ? 12 : 86)}</div>`;
  }

  function agentBackend498Content(page) {
    const activeView = agent498ActiveTab(page) || page.contentKey || page.name;
    const tertiaryTabs = page.tabs?.length ? agent498SubView(page) : "";
    const pageName = agent498PageDisplayName(page);
    const content = page.key === "agent-dashboard-498"
      ? agent498DashboardContent(page)
      : page.menuGroup === "下级管理"
        ? `${agent498PageHeading(pageName, page.menuGroup)}${tertiaryTabs}<div class="agent-498-tab-body">${agent498SubordinateContent(page, activeView)}</div>`
        : page.menuGroup === "运营中心"
          ? `${agent498PageHeading(pageName, page.menuGroup)}<div class="agent-498-tab-body">${agent498OperationsContent()}</div>`
        : page.menuGroup === "财务中心"
          ? `${agent498PageHeading(pageName, page.menuGroup)}${tertiaryTabs}<div class="agent-498-tab-body">${agent498FinanceContent(page)}</div>`
          : `${agent498PageHeading(pageName, page.menuGroup)}${tertiaryTabs}<div class="agent-498-tab-body">${agent498ProfileContent(page, page.contentKey || page.name)}</div>`;
    return `<div class="agent-498-page">${content}</div>`;
  }

  function refreshProfitSimulator(page) {
    const root = document.getElementById("profit-simulator-root");
    if (!root) return;
    root.innerHTML = profitSimulatorInner();
    bindProfitSimulatorBehavior(page);
    bindComponentLinks();
  }

  function bindProfitSimulatorBehavior(page) {
    if (page.key !== "profit-simulator-498") return;
    document.querySelectorAll("[data-sim-view]").forEach((button) => button.addEventListener("click", () => {
      profitSimulatorState.view = button.dataset.simView;
      refreshProfitSimulator(page);
    }));
    document.querySelectorAll("[data-journey-scenario]").forEach((button) => button.addEventListener("click", () => {
      profitSimulatorState.journeyScenario = button.dataset.journeyScenario;
      profitSimulatorState.journeyStep = 0;
      refreshProfitSimulator(page);
    }));
    document.querySelectorAll("[data-journey-step]").forEach((button) => button.addEventListener("click", () => {
      profitSimulatorState.journeyStep = Number(button.dataset.journeyStep);
      refreshProfitSimulator(page);
    }));
    document.querySelectorAll("[data-journey-input]").forEach((input) => input.addEventListener("change", () => {
      profitSimulatorState[input.dataset.journeyInput] = Number(input.value || 0);
      refreshProfitSimulator(page);
    }));
    document.querySelector("[data-journey-prev]")?.addEventListener("click", () => {
      profitSimulatorState.journeyStep = Math.max(0, profitSimulatorState.journeyStep - 1);
      refreshProfitSimulator(page);
    });
    document.querySelector("[data-journey-next]")?.addEventListener("click", () => {
      profitSimulatorState.journeyStep = Math.min(5, profitSimulatorState.journeyStep + 1);
      refreshProfitSimulator(page);
    });
    document.querySelector("[data-open-advanced]")?.addEventListener("click", () => {
      profitSimulatorState.view = "advanced";
      refreshProfitSimulator(page);
    });
    document.querySelector("[data-journey-reset]")?.addEventListener("click", () => {
      const { view, journeyScenario } = profitSimulatorState;
      Object.assign(profitSimulatorState, profitSimulatorDefaults, { view, journeyScenario });
      refreshProfitSimulator(page);
    });
    document.querySelectorAll("[data-sim-mode]").forEach((button) => button.addEventListener("click", () => {
      profitSimulatorState.mode = button.dataset.simMode;
      refreshProfitSimulator(page);
    }));
    document.querySelectorAll("[data-result-sign]").forEach((button) => button.addEventListener("click", () => {
      profitSimulatorState.resultSign = Number(button.dataset.resultSign);
      refreshProfitSimulator(page);
    }));
    document.querySelectorAll("[data-treatment]").forEach((button) => button.addEventListener("click", () => {
      profitSimulatorState.treatment = button.dataset.treatment;
      refreshProfitSimulator(page);
    }));
    document.querySelectorAll("[data-sim-input]").forEach((input) => input.addEventListener("change", () => {
      profitSimulatorState[input.dataset.simInput] = Number(input.value || 0);
      refreshProfitSimulator(page);
    }));
    document.querySelector("[data-sim-reset]")?.addEventListener("click", () => {
      const mode = profitSimulatorState.mode;
      Object.assign(profitSimulatorState, profitSimulatorDefaults, { mode });
      refreshProfitSimulator(page);
    });
  }

  function pageContent(page) {
    if (page.mergedInto) return mergedRequirementContent(page);
    if (page.unchanged) return unchangedFinanceContent(page);
    if (page.key === "profit-simulator-498") return profitSimulatorContent(page);
    if (page.key.startsWith("control-") && page.key.endsWith("-498")) return control498Content(page);
    if (page.key.startsWith("agent-") && page.key.endsWith("-498")) return agentBackend498Content(page);
    if (page.key.endsWith("-509") || page.key.endsWith("-643")) return vipOptimizationContent(page);
    if (page.key.endsWith("-488")) return member488Content(page);
    if (page.key.endsWith("-493")) return member493Content(page);
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

  function questionsBlock(page, activeTab = activePageTab(page)) {
    if (!["#509", "#498"].includes(currentRequirementId)) return "";
    const questions = page.tabQuestions?.[activeTab] || page.questions || [];
    if (!questions.length) return "";
    return `<section class="questions-block"><div class="questions-title"><span>?</span><div><strong>待确认事项</strong><small>${questions.length} 项</small></div></div><ol>${questions.map((question)=>`<li>${escapeHtml(question)}</li>`).join("")}</ol></section>`;
  }

  function pageNoteBlock(page) {
    const activeTab = activePageTab(page);
    const tabGoal = page.pageGoals?.[activeTab];
    const isNewPage = page.pageType === "new" || page.changeType === "纯新增";
    const goalText = tabGoal || page.purpose;
    const goal = (tabGoal || isNewPage || page.showPageGoal) && goalText ? `<span>页面目标</span><p>${escapeHtml(goalText)}</p>` : "";
    const flow = page.showMainFlow && page.flow ? `<span>主流程</span><p>${escapeHtml(page.flow)}</p>` : "";
    return goal || flow ? `<section class="page-note">${goal}${flow}</section>` : "";
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
    normalizeConfirmedFieldNames(root, currentRequirementId, currentPageKey);
    normalizeTableCurrencyUnits(root);
    normalizeTableWinLossValues(root);
    root.querySelectorAll(".table-wrap, .mock-table-wrap, .risk-table-wrap").forEach((wrap) => {
      const table = wrap.querySelector(":scope > table") || wrap.querySelector("table");
      if (!table) return;
      const rows = Array.from(table.tBodies || []).flatMap((body) => Array.from(body.rows));
      wrap.classList.remove("table-row-limit");
      wrap.style.maxHeight = "";
      if (wrap.classList.contains("agent-498-matrix-wrap")) {
        wrap.style.overflowY = "auto";
        return;
      }
      wrap.style.overflowY = "hidden";
      if (wrap.classList.contains("rebate-game-table-wrap")) {
        wrap.style.overflowY = "visible";
        return;
      }
      if (rows.length <= 10) return;
      const headerHeight = table.tHead?.getBoundingClientRect().height || 0;
      const rowsHeight = rows.slice(0, 10).reduce((height, row) => height + row.getBoundingClientRect().height, 0);
      const horizontalScrollbar = table.scrollWidth > wrap.clientWidth ? 15 : 0;
      wrap.style.maxHeight = `${Math.ceil(headerHeight + rowsHeight + horizontalScrollbar + 1)}px`;
      wrap.style.overflowY = "auto";
      wrap.classList.add("table-row-limit");
    });
  }

  function normalizeTableCurrencyUnits(root = document) {
    root.querySelectorAll("table").forEach((table) => {
      const headerRows = Array.from(table.tHead?.rows || []);
      const headerRow = headerRows.at(-1);
      const headers = Array.from(headerRow?.cells || []);
      if (!headers.length) return;
      const currencyColumns = new Set();
      const scanRow = (row) => {
        let columnIndex = 0;
        Array.from(row.cells).forEach((cell) => {
          const span = Math.max(1, Number(cell.colSpan) || 1);
          if (/\bCNY\b/.test(cell.textContent)) {
            for (let offset = 0; offset < span; offset += 1) currencyColumns.add(columnIndex + offset);
          }
          columnIndex += span;
        });
      };
      Array.from(table.tBodies || []).forEach((body) => Array.from(body.rows).forEach(scanRow));
      Array.from(table.tFoot?.rows || []).forEach(scanRow);
      headerRows.filter((row) => row !== headerRow).forEach(scanRow);
      currencyColumns.forEach((index) => {
        const header = headers[index];
        const amountHeader = /(金额|余额|流水|存款|提款|红利|礼金|返水|收入|支出|输赢|盈亏|费用|手续费|额度|下注|有效投注|中心钱包|上分)/.test(header?.textContent || "");
        if (header && amountHeader && !/CNY/.test(header.textContent) && !/币种/.test(header.textContent)) header.append("（CNY）");
      });
      const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.parentElement?.closest("th")) continue;
        if (/\bCNY\b/.test(walker.currentNode.nodeValue)) textNodes.push(walker.currentNode);
      }
      textNodes.forEach((node) => { node.nodeValue = node.nodeValue.replace(/\s*\bCNY\b/g, "").replace(/\bCNY\b\s*/g, ""); });
    });
  }

  function replaceDirectFieldText(element, nextText) {
    const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
    if (textNode) textNode.nodeValue = textNode.nodeValue.replace(textNode.nodeValue.trim(), nextText);
  }

  function splitUpperAgentColumns(root) {
    root.querySelectorAll("table").forEach((table) => {
      if (table.dataset.upperAgentColumnsNormalized) return;
      const headerRows = Array.from(table.tHead?.rows || []);
      const headerRow = headerRows.at(-1);
      if (!headerRow) return;
      const headers = Array.from(headerRow.cells);
      const index = headers.findIndex((header) => ["上级代理", "上级代理账号/编号"].includes(header.textContent.trim()));
      if (index < 0) return;
      const header = headers[index];
      const nextHeader = headers[index + 1];
      replaceDirectFieldText(header, "上级代理账号");
      if (nextHeader?.textContent.trim() === "上级代理编号") {
        table.dataset.upperAgentColumnsNormalized = "true";
        return;
      }
      const numberHeader = document.createElement("th");
      numberHeader.textContent = "上级代理编号";
      header.after(numberHeader);
      Array.from(table.tBodies || []).forEach((body) => Array.from(body.rows).forEach((row) => {
        const cell = row.cells[index];
        if (!cell) return;
        const [account, number = "—"] = cell.textContent.split("/").map((value) => value.trim());
        cell.textContent = account || "—";
        const numberCell = document.createElement("td");
        numberCell.textContent = number || "—";
        cell.after(numberCell);
      }));
      table.dataset.upperAgentColumnsNormalized = "true";
    });
  }

  function normalizeConfirmedFieldNames(root = document, requirementId = "", pageKey = "") {
    splitUpperAgentColumns(root);
    root.querySelectorAll(".risk-content label, .risk-content th, .modal-body label, .modal-body th").forEach((element) => {
      const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
      if (!textNode) return;
      const original = textNode.nodeValue.trim();
      let next = original
        .replace(/^会员等级$/, "VIP等级")
        .replace(/^注单号$/, "投注单号")
        .replace(/^到账金额$/, "实际到账")
        .replace(/^注册日期$/, "注册时间")
        .replace(/^操作人账号$/, "操作人")
        .replace(/^用户数量$/, "会员数量")
        .replace(/^最后编辑人$/, "最后操作人")
        .replace(/^最后编辑时间$/, "最后操作时间")
        .replace(/^场馆$/, "场馆名称")
        .replace(/^总盈亏（会员视角）$/, "总输赢（会员视角）")
        .replace(/^输赢情况$/, "输赢金额（会员视角）")
        .replace(/^升级存款$/, "晋升存款")
        .replace(/^升级流水$/, "晋升流水")
        .replace(/^升级红利$/, "VIP晋升礼金")
        .replace(/^生日红利$/, "VIP生日礼金")
        .replace(/^每周红利$/, "VIP周礼金")
        .replace(/^每月红利$/, "VIP月礼金");

      if (pageKey === "rebate-records-509" && next === "订单号") next = "返水订单号";
      else if (!pageKey.includes("bet-records") && next === "订单号") next = "单号";

      const siteSpecific = requirementId === "#427" && pageKey === "site-transactions";
      if (!siteSpecific && ["站点", "站点名称"].includes(next)) next = "所属站点";
      if (siteSpecific && next === "所属站点" && element.tagName === "TH") next = "站点名称";

      if (requirementId === "#406" && ["withdraw-review", "hold-review", "review-history"].includes(pageKey) && next === "申请时间") next = "提款申请时间";
      if (pageKey === "deposit-info-488" && next === "订单时间") next = "存款申请时间";
      if (pageKey === "withdrawal-info-488" && next === "订单时间") next = "提款申请时间";
      if (pageKey === "bonus-info-488" && next === "申请时间") next = "红利申请时间";
      if (pageKey === "rebate-info-488" && next === "返水日期") next = "返水生成时间";
      if (pageKey === "rebate-info-488" && ["领取日期", "领取时间"].includes(next)) next = "返水领取时间";
      if (pageKey === "rebate-records-509" && next === "领取时间") next = "返水领取时间";

      if (next !== original) replaceDirectFieldText(element, next);
    });
  }

  function normalizeTableWinLossValues(root = document) {
    root.querySelectorAll("table").forEach((table) => {
      const headers = Array.from(table.tHead?.rows?.[0]?.cells || []);
      const resultColumns = headers.reduce((indexes, header, index) => {
        if (/(输赢|盈亏)/.test(header.textContent)) indexes.push(index);
        return indexes;
      }, []);
      if (!resultColumns.length) return;
      Array.from(table.tBodies || []).forEach((body) => Array.from(body.rows).forEach((row) => {
        resultColumns.forEach((index) => {
          const cell = row.cells[index];
          if (!cell) return;
          const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
          const textNodes = [];
          while (walker.nextNode()) textNodes.push(walker.currentNode);
          textNodes.forEach((node) => {
            node.nodeValue = node.nodeValue.replace(/^\s*(?:全赢|全输|赢|输)\s*(?=[+-]?\s*[\d,.])/u, "");
          });
        });
      }));
    });
  }

  function bindExportStandardLink(root = document, componentId = "B99") {
    const notice = app.querySelector(".export-standard-note");
    if (!notice) return;
    notice.classList.add("annotated");
    notice.dataset.specId = componentId;
    if (!notice.querySelector(".component-code")) notice.insertAdjacentHTML("afterbegin", `<span class="component-code">${componentId}</span>`);
    root.querySelectorAll(".risk-filter-actions button").forEach((button) => {
      if (!button.textContent.includes("导出")) return;
      button.dataset.componentId = componentId;
      button.classList.add("annotated");
      button.querySelector(".component-badge")?.remove();
      button.insertAdjacentHTML("afterbegin", componentBadge(componentId));
    });
  }

  function scopeSpecNotice(annotation) {
    if (!annotation) return "";
    return `<section class="scope-spec-note"><span>${escapeHtml(annotation.name)}</span><p>${escapeHtml(annotation.summary)}</p><ul>${annotation.rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul></section>`;
  }

  function productionComparisonNotice(requirement, page) {
    const showForMember488 = requirement.id === "#488";
    const showForMember493 = requirement.id === "#493" && page.key === "account-adjustment-record-493";
    const activeAgentTab = activePageTab(page);
    const showForAgent498 = requirement.id === "#498" && page.key !== "profit-simulator-498" && page.pageType !== "new" && !page.showPageGoal && !page.pageGoals?.[activeAgentTab];
    if (!showForMember488 && !showForMember493 && !showForAgent498) return "";
    return '<section class="comparison-spec-note"><span>对比说明</span><p>低对比度的是和生产一致，无需修改</p></section>';
  }

  function agent498PermissionReviewControls() {
    const identityOptions = Object.entries(agent498IdentityConfig).map(([value, config]) => `<option value="${value}"${value === agent498Identity ? " selected" : ""}>${escapeHtml(config.label)}</option>`).join("");
    const dashboardMatrixButton = currentPageKey === "agent-dashboard-498" ? '<button type="button" class="secondary-action" id="agent-498-dashboard-matrix">查看看板完全权限显示</button>' : "";
    return `<section class="agent-498-permission-review"><header><div><strong>代理身份权限预览</strong><span>仅用于原型评审，不属于生产功能</span></div><div class="agent-498-permission-actions"><button type="button" class="secondary-action" id="agent-498-permission-matrix">完整功能权限矩阵</button>${dashboardMatrixButton}</div></header><div class="agent-498-review-fields"><label><span>当前代理身份</span><select id="agent-498-identity">${identityOptions}</select></label><label class="agent-498-hidden-toggle"><input type="checkbox" id="agent-498-show-hidden"${agent498ShowHidden ? " checked" : ""} /><span>显示被隐藏的功能</span></label></div></section>`;
  }

  function agent498PermissionMatrixBody() {
    const identities = Object.entries(agent498IdentityConfig);
    const rows = [
      ["直属会员与个人报表", "agent-members-498"],
      ["团队会员、团队财务、团队佣金", "team-tabs"],
      ["团队信息", "agent-team-498"],
      ["代理列表 / 团队代理", "agent-list-498"],
      ["活动管理", "agent-activity-management-498"],
      ["代理转账", "agent-transfer-498"],
      ["负盈利佣金报表", "agent-negative-profit-report-498"],
      ["冲正统计报表", "agent-correction-report-498"],
      ["冲正回款报表", "agent-reversal-repayment-498"],
      ["场馆代理费用明细", "agent-venue-fee-detail-498"]
    ];
    const cell = (key, identity) => {
      if (key === "team-tabs") return agent498IsTeamLeader(identity) ? '<span class="permission-state is-team">团队视图</span>' : '<span class="permission-state is-hidden">隐藏</span>';
      if (key === "agent-members-498") return identity === "TEAM_SUBLINE" ? '<span class="permission-state is-personal">仅个人</span>' : '<span class="permission-state is-visible">可见</span>';
      if (key === "agent-negative-profit-report-498" && identity === "TEAM_SUBLINE") return '<span class="permission-state is-personal">仅自身贡献</span>';
      if (key === "agent-list-498" && agent498IsTeamLeader(identity)) return `<span class="permission-state is-team">${identity === "TEAM_LEADER_SINGLE" ? "仅负责人" : "负责人+副线"}</span>`;
      return agent498PageIsAllowed(key, identity) ? '<span class="permission-state is-visible">可见</span>' : '<span class="permission-state is-hidden">隐藏</span>';
    };
    return `<div class="risk-table-wrap agent-498-matrix-wrap"><table class="risk-table agent-498-matrix"><thead><tr><th>功能</th>${identities.map(([, config]) => `<th>${escapeHtml(config.label)}</th>`).join("")}</tr></thead><tbody>${rows.map(([label, key]) => `<tr><td>${escapeHtml(label)}</td>${identities.map(([identity]) => `<td>${cell(key, identity)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function agent498DashboardMatrixBody() {
    const identities = Object.entries(agent498IdentityConfig);
    const visible = (text = "显示", type = "") => `<span class="permission-state${type ? ` ${type}` : ""}">${text}</span>`;
    const module = (title, scope, type = "") => `<span class="permission-state permission-module${type ? ` ${type}` : ""}"><strong>显示</strong><small>标题：${escapeHtml(title)}</small><small>范围：${escapeHtml(scope)}</small></span>`;
    const hidden = () => '<span class="permission-state is-hidden">隐藏</span>';
    const rows = [
      ["星级、佣金比例与晋级进度", { STAR: visible("星级口径") }],
      ["佣金预估净收益模块", {
        STAR: module("本期佣金预估净收益", "当前代理"),
        MULTI_LEVEL: module("本期佣金预估净收益", "代理体系"),
        TEAM_LEADER_MULTI: module("本期团队佣金预估净收益", "团队汇总", "is-team"),
        TEAM_LEADER_SINGLE: module("本期团队佣金预估净收益", "单线团队", "is-team")
      }],
      ["当前余额", Object.fromEntries(identities.map(([identity]) => [identity, visible(identity === "TEAM_SUBLINE" ? "本人余额" : "显示")]))],
      ["总推广佣金", { STAR: visible(), MULTI_LEVEL: visible() }],
      ["已结算佣金", Object.fromEntries(identities.map(([identity]) => [identity, visible(identity === "TEAM_SUBLINE" ? "本人记录" : "显示")]))],
      ["资金流水", { STAR: visible("当前代理"), MULTI_LEVEL: visible("代理体系"), TEAM_LEADER_MULTI: visible("团队汇总", "is-team"), TEAM_LEADER_SINGLE: visible("单线团队", "is-team"), TEAM_SUBLINE: visible("仅本人", "is-personal") }],
      ["代理数据", { MULTI_LEVEL: visible("下级代理"), TEAM_LEADER_MULTI: visible("负责人+副线", "is-team"), TEAM_LEADER_SINGLE: visible("单线团队", "is-team") }],
      ["会员数据", { STAR: visible("直属会员"), MULTI_LEVEL: visible("代理体系"), TEAM_LEADER_MULTI: visible("团队汇总", "is-team"), TEAM_LEADER_SINGLE: visible("单线团队", "is-team"), TEAM_SUBLINE: visible("仅本人", "is-personal") }]
    ];
    return `<div class="agent-498-matrix-note">同一行表示同一个页面位置，单元格同时说明实际标题和数据统计范围。</div><div class="risk-table-wrap agent-498-matrix-wrap"><table class="risk-table agent-498-matrix agent-498-dashboard-matrix"><thead><tr><th>看板数据块</th>${identities.map(([, config]) => `<th>${escapeHtml(config.label)}</th>`).join("")}</tr></thead><tbody>${rows.map(([label, states]) => `<tr><td>${escapeHtml(label)}</td>${identities.map(([identity]) => `<td>${states[identity] || hidden()}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function exportStandardNotice(annotation) {
    const rules = [...(annotation?.rules || [])];
    exportExcelRules.forEach((rule) => { if (!rules.includes(rule)) rules.push(rule); });
    const summary = annotation?.summary ? `${escapeHtml(annotation.summary)} ` : "";
    return `<section class="export-standard-note"><span>${escapeHtml(annotation?.name || "导出规范")}</span><p>${summary}${rules.map(escapeHtml).join("；")}。</p></section>`;
  }

  function prototypeEndpointSwitch(requirement, page) {
    if (requirement.id === "#498") {
      const annotated = page.annotations?.some((annotation) => annotation.id === "N09");
      return `<div class="prototype-endpoint-switch${annotated ? " annotated" : ""}"${annotated ? ' data-component-id="N09"' : ""}>${annotated ? componentBadge("N09") : ""}<a href="#requirement/${encodeURIComponent("#498")}/page/agent-dashboard-498" class="${page.key.startsWith("agent-") ? "active" : ""}">代理后台改造</a><a href="#requirement/${encodeURIComponent("#498")}/page/control-agent-quota-498" class="${page.key.startsWith("control-") ? "active" : ""}">总控后台改造</a></div>`;
    }
    if (!["#509", "#643"].includes(requirement.id)) return `<span class="current-page-label">${page.name}</span>`;
    const memberActive = memberVipMobileKeys.includes(page.key);
    const algorithmActive = page.key === "vip-algorithm-509";
    const annotated = page.annotations?.some((annotation) => annotation.id === "N09");
    const currentPageLabel = algorithmActive ? "" : `<span class="current-page-label">${page.name}</span>`;
    if (requirement.id === "#643") {
      return `<div class="prototype-endpoint-switch${annotated ? " annotated" : ""}"${annotated ? ' data-component-id="N09"' : ""}>${annotated ? componentBadge("N09") : ""}<a href="#requirement/${encodeURIComponent("#643")}/page/member-level-config-643" class="${!memberActive ? "active" : ""}">总控后台</a><a href="#requirement/${encodeURIComponent("#643")}/page/member-vip-center-643" class="${memberActive ? "active" : ""}">会员端</a></div>${currentPageLabel}`;
    }
    return `<div class="prototype-endpoint-switch${annotated ? " annotated" : ""}"${annotated ? ' data-component-id="N09"' : ""}>${annotated ? componentBadge("N09") : ""}<a href="#requirement/${encodeURIComponent("#509")}/page/vip-settings-509" class="${!memberActive && !algorithmActive ? "active" : ""}">总控后台</a><a href="#requirement/${encodeURIComponent("#509")}/page/member-vip-center-509" class="${memberActive ? "active" : ""}">会员端</a><a href="#requirement/${encodeURIComponent("#509")}/page/vip-algorithm-509" class="${algorithmActive ? "active" : ""}">新VIP算法</a></div>${currentPageLabel}`;
  }

  function detailView(requirement, requestedPageKey) {
    const pages = visiblePages(requirement);
    let page = pages.find((item) => item.key === requestedPageKey) || pages[0];
    if (requirement.id === "#498" && !agent498PageIsAllowed(page.key)) {
      page = pages.find((item) => item.key === "agent-dashboard-498") || pages[0];
      window.history.replaceState(null, "", `#requirement/${encodeURIComponent(requirement.id)}/page/${page.key}`);
    }
    currentRequirementId = requirement.id;
    currentPageKey = page.key;
    if (page.key !== requestedPageKey) window.history.replaceState(null, "", `#requirement/${encodeURIComponent(requirement.id)}/page/${page.key}`);
    if (page.key === "member-login-log") loginState.searched = false;
    if (page.key === "transaction-query") transactionState.searched = false;
    const pageLogic = page.logic ? `<section class="logic-note"><span>逻辑说明</span><p>${escapeHtml(page.logic)}</p></section>` : "";
    const extraNotice = page.extraNotice ? `<section class="critical-note"><span>额外功能</span><p>${escapeHtml(page.extraNotice)}</p></section>` : "";
    const currentAnnotations = visibleAnnotations(page);
    const moduleName = ["#509", "#643"].includes(requirement.id) ? page.moduleName || requirement.moduleName || "风控管理" : requirement.moduleName || "风控管理";
    const adjustmentNotice = requirement.id === "#427" ? '<section class="adjustment-note"><span>调整说明</span><p>未标注的地方均为未修改，保持原页面内容和逻辑即可。</p></section>' : "";
    const memberModuleMode = requirement.id === "#488";
    const member493Mode = requirement.id === "#493";
    const memberDetailMode = requirement.id === "#488" && member488DetailPages.some(([key]) => key === page.key);
    const member509MobileMode = ["#509", "#643"].includes(requirement.id) && memberVipMobileKeys.includes(page.key);
    const vipAlgorithmMode = requirement.id === "#509" && page.key === "vip-algorithm-509";
    const profitSimulatorMode = requirement.id === "#498" && page.key === "profit-simulator-498";
    const control498Mode = requirement.id === "#498" && page.key.startsWith("control-");
    const agent498Mode = requirement.id === "#498" && !profitSimulatorMode && !control498Mode;
    const agent498ActiveMenu = agent498Mode && page.key !== "agent-dashboard-498" ? activePageTab(page) : "";
    const displayPageName = agent498ActiveMenu || (agent498Mode ? agent498PageDisplayName(page) : page.name);
    const renderedPageContent = pageContent(page);
    const exportAnnotation = currentAnnotations.find((annotation) => annotation.name.includes("导出") || annotation.type.includes("导出")) || null;
    const scopeAnnotation = page.key === "member-logs-488" ? currentAnnotations.find((annotation) => annotation.id === "P01" && annotation.tab === "会员日志") : null;
    const exportLinkId = exportAnnotation?.id || "B99";
    const cardAnnotations = currentAnnotations.filter((annotation) => annotation !== exportAnnotation && annotation !== scopeAnnotation);
    const exportNotice = renderedPageContent.includes("导出") ? exportStandardNotice(exportAnnotation) : "";
    const topSpecNotices = `${productionComparisonNotice(requirement, page)}${scopeSpecNotice(scopeAnnotation)}`;
    const prototypeBody = profitSimulatorMode
      ? `<div class="profit-simulator-stage">${renderedPageContent}</div>`
      : member509MobileMode
      ? `<div class="member-mobile-stage">${memberMobilePrototypeNav(page.key)}${renderedPageContent}</div>`
      : vipAlgorithmMode
        ? `<div class="vip-algorithm-stage">${renderedPageContent}</div>`
      : `<div class="risk-app${memberModuleMode ? " member-module-mode" : ""}${member493Mode ? " member-493-mode" : ""}${memberDetailMode ? " member-detail-mode" : ""}${agent498Mode || control498Mode ? " agent-498-app" : ""}">${sidebar(requirement,page)}<section class="risk-main"><header class="risk-topbar"><div><span>${control498Mode ? `总控后台 / ${page.menuGroup}` : agent498Mode ? (page.key === "agent-dashboard-498" ? "代理后台" : `${page.menuGroup} / ${page.name}`) : moduleName} /</span><strong>${displayPageName}</strong></div><div><span class="environment-tag">产品原型</span><strong>Mike</strong></div></header><div class="risk-content">${renderedPageContent}</div></section></div>`;
    const permissionReview = agent498Mode ? agent498PermissionReviewControls() : "";
    app.innerHTML = `<main class="detail-shell"><section class="prototype-pane" aria-label="高保真原型展示区"><header class="prototype-context"><div><span class="prototype-mark">PROTOTYPE</span><strong>${requirement.id}</strong><span>${requirement.title}</span></div><nav${["#509", "#643", "#498"].includes(requirement.id) ? ' class="prototype-endpoint-nav"' : ""} aria-label="当前原型页面">${prototypeEndpointSwitch(requirement, page)}</nav></header><div class="prototype-canvas${member509MobileMode ? " member-mobile-canvas" : ""}${vipAlgorithmMode ? " vip-algorithm-canvas" : ""}${profitSimulatorMode ? " profit-simulator-canvas" : ""}">${prototypeBody}</div></section><aside class="spec-pane" aria-label="说明区"><div class="spec-sticky-header"><a class="back-link" href="#"><span>←</span> 返回需求列表</a><div class="spec-meta-line"><strong>开发说明</strong><span>角色：${agent498Mode ? escapeHtml(agent498IdentityConfig[agent498Identity].label) : page.role}</span><span>页面：${page.id}</span></div><div class="spec-title-row"><div><h2>${displayPageName}</h2></div><span class="version">V1.0</span></div></div><div class="spec-scroll">${permissionReview}<div class="spec-top-notices">${topSpecNotices}</div><div class="questions-slot">${questionsBlock(page)}</div>${pageNoteBlock(page)}${pageLogic}${extraNotice}${adjustmentNotice}${exportNotice}<div class="spec-section-heading"><h2>组件说明</h2><span>${cardAnnotations.length} 项</span></div><div class="annotation-list">${cardAnnotations.map(annotationCard).join("")}</div></div></aside></main><div id="modal-root"></div>`;
    if (exportNotice) bindExportStandardLink(app, exportLinkId);
    if (page.key === "withdraw-monitor") renderMonitorView(false);
    addTopPaginators();
    bindComponentLinks();
    bindPageBehavior(page);
    bindDatePickers();
    if (agent498Mode || control498Mode) bindAgent498DatePickers();
    normalizeTableCurrencyUnits(app);
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
    normalizeTableCurrencyUnits(root);
    applyTableRowLimits(root);
  }

  function bindDatePickers() {
    document.querySelectorAll("[data-date-trigger]").forEach((trigger) => {
      if (trigger.classList.contains("agent-498-date")) return;
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
    document.querySelectorAll(".date-close").forEach((button) => { if (button.closest(".agent-498-date-field") || button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { button.closest(".date-picker-popover").hidden = true; }); });
    document.querySelectorAll(".calendar-panel").forEach((panel) => { if (panel.closest(".agent-498-date-field")) return; panel.querySelectorAll(".calendar-day").forEach((day) => { if (day.dataset.dateBound) return; day.dataset.dateBound = "true"; day.addEventListener("click", () => { panel.querySelectorAll(".calendar-day").forEach((item) => item.classList.remove("selected")); day.classList.add("selected"); }); }); });
    document.querySelectorAll(".date-apply").forEach((button) => { if (button.closest(".agent-498-date-field") || button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { const popover = button.closest(".date-picker-popover"); const panels = Array.from(popover.querySelectorAll(".calendar-panel")); const values = panels.length ? panels.map((panel) => { const day = String(panel.querySelector(".calendar-day.selected")?.textContent || "12").padStart(2, "0"); const time = panel.querySelector("input[type='time']").value; return `2026-07-${day} ${time}`; }) : Array.from(popover.querySelectorAll("input[type='datetime-local']")).map((input) => { const value = input.value.replace("T", " "); return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value) ? `${value}:00` : value; }); const range = popover.parentElement.querySelector(".risk-range"); if (values.length >= 2) range.innerHTML = `<span>${values[0]}</span><b>至</b><span>${values[1]}</span>`; popover.hidden = true; }); });
    document.querySelectorAll(".quick-ranges button").forEach((button) => { if (button.closest(".agent-498-date-field") || button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { const range = button.closest(".date-range-field").querySelector(".risk-range"); range.classList.add("range-selected"); }); });
  }

  function bindAgent498DatePickers() {
    document.querySelectorAll(".agent-498-date-field").forEach((field) => {
      const trigger = field.querySelector(".agent-498-date");
      const popover = field.querySelector(".agent-498-date-popover");
      if (!trigger || !popover || trigger.dataset.agentDateBound) return;
      trigger.dataset.agentDateBound = "true";
      const pad = (value) => String(value).padStart(2, "0");
      const formatDateTime = (date, time) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${time}`;
      const renderPanel = (panel, year, month, selectedDay) => {
        const dayCount = new Date(year, month, 0).getDate();
        panel.dataset.year = String(year);
        panel.dataset.month = String(month);
        panel.querySelector("header strong").textContent = `${year}年${month}月`;
        panel.querySelector(".calendar-days").innerHTML = Array.from({ length: dayCount }, (_, index) => {
          const day = index + 1;
          return `<button type="button" class="calendar-day${day === selectedDay ? " selected" : ""}" data-day="${day}">${day}</button>`;
        }).join("");
      };
      const selectPanelDate = (panel, date) => renderPanel(panel, date.getFullYear(), date.getMonth() + 1, date.getDate());
      const panelValue = (panel) => {
        const day = Number(panel.querySelector(".calendar-day.selected")?.dataset.day || 1);
        const time = panel.querySelector("input[type='time']").value || (panel.dataset.rangeSide === "start" ? "00:00:00" : "23:59:59");
        return `${panel.dataset.year}-${pad(panel.dataset.month)}-${pad(day)} ${time}`;
      };
      const positionPopover = () => {
        const paneRect = trigger.closest(".prototype-pane")?.getBoundingClientRect();
        const contentRect = trigger.closest(".risk-content")?.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const visibleLeft = Math.max(paneRect?.left || 0, contentRect?.left || 0) + 12;
        const visibleRight = Math.min(paneRect?.right || window.innerWidth, contentRect?.right || window.innerWidth) - 12;
        const availableWidth = Math.max(320, visibleRight - visibleLeft);
        popover.style.width = `${Math.min(620, availableWidth)}px`;
        const width = popover.getBoundingClientRect().width;
        popover.style.left = `${Math.round(Math.max(visibleLeft, Math.min(triggerRect.left, visibleRight - width)))}px`;
        const height = popover.getBoundingClientRect().height;
        const lowerTop = triggerRect.bottom + 6;
        const upperTop = triggerRect.top - height - 6;
        const visibleTop = Math.max(paneRect?.top || 0, contentRect?.top || 0) + 8;
        const visibleBottom = Math.min(paneRect?.bottom || window.innerHeight, contentRect?.bottom || window.innerHeight) - 8;
        popover.style.top = `${Math.round(lowerTop + height <= visibleBottom ? lowerTop : Math.max(visibleTop, upperTop))}px`;
        popover.style.maxHeight = `${Math.max(260, visibleBottom - visibleTop)}px`;
      };
      const close = () => {
        popover.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        field.querySelector(".agent-date-error").hidden = true;
      };
      trigger.addEventListener("click", () => {
        const opening = popover.hidden;
        document.querySelectorAll(".agent-498-date-popover:not([hidden])").forEach((item) => { if (item !== popover) item.hidden = true; });
        popover.hidden = !opening;
        trigger.setAttribute("aria-expanded", String(opening));
        if (opening) positionPopover();
      });
      field.querySelector(".date-close")?.addEventListener("click", close);
      popover.addEventListener("click", (event) => {
        const dayButton = event.target.closest(".calendar-day");
        if (dayButton) {
          const panel = dayButton.closest(".calendar-panel");
          panel.querySelectorAll(".calendar-day").forEach((item) => item.classList.remove("selected"));
          dayButton.classList.add("selected");
          return;
        }
        const navButton = event.target.closest(".agent-date-month-nav");
        if (navButton) {
          const panel = navButton.closest(".calendar-panel");
          const target = new Date(Number(panel.dataset.year), Number(panel.dataset.month) - 1 + Number(navButton.dataset.monthStep), 1);
          renderPanel(panel, target.getFullYear(), target.getMonth() + 1, 1);
          return;
        }
        const quickButton = event.target.closest("[data-range-days]");
        if (!quickButton) return;
        const end = new Date(2026, 6, 31);
        let start = new Date(end);
        const range = quickButton.dataset.rangeDays;
        if (range === "1") {
          start.setDate(start.getDate() - 1);
          end.setDate(end.getDate() - 1);
        } else if (range === "week") {
          start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        } else if (Number(range) > 1) {
          start.setDate(start.getDate() - Number(range) + 1);
        }
        const panels = Array.from(popover.querySelectorAll(".calendar-panel"));
        selectPanelDate(panels[0], start);
        selectPanelDate(panels[1], end);
        panels[0].querySelector("input[type='time']").value = "00:00:00";
        panels[1].querySelector("input[type='time']").value = "23:59:59";
        trigger.innerHTML = `<span>${formatDateTime(start, "00:00:00")}</span><b>至</b><span>${formatDateTime(end, "23:59:59")}</span>`;
        trigger.classList.add("range-selected");
      });
      field.querySelector(".date-apply")?.addEventListener("click", () => {
        const values = Array.from(popover.querySelectorAll(".calendar-panel")).map(panelValue);
        const error = field.querySelector(".agent-date-error");
        if (values[0] > values[1]) {
          error.hidden = false;
          return;
        }
        trigger.innerHTML = `<span>${values[0]}</span><b>至</b><span>${values[1]}</span>`;
        trigger.classList.add("range-selected");
        close();
      });
    });
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
    return `<div class="withdraw-audit-modal"><section class="withdraw-member-summary unchanged-production"><div><span class="data-tag">${accountType}</span><em class="data-tag tag-amber">${memberOnly ? "VIP6" : "—"}</em><p><span>账号名称：</span><strong>${account}</strong></p><small>注册日期：${memberOnly ? "2026-05-01 14:38:50" : "—"}</small></div><div class="withdraw-risk-box"><span>风控标签</span><p>${memberOnly ? '未加风控标签 <button type="button" class="link-action">+添加</button>' : "—"}</p></div></section><section class="withdraw-amount-grid annotated changed-amount-scope" data-component-id="M01">${componentBadge("M01")}<div class="unchanged-amount-item"><span>提款类型</span><strong>USDT提币</strong></div><div class="unchanged-amount-item"><span>人民币金额</span><strong>68.00</strong></div><div><span>提款金额</span><strong>10.00 <small>U</small></strong></div><div><span>实际到账</span><strong>9.50 <small>U</small></strong></div><div><span>手续费</span><strong>3.40 <small>U</small></strong></div><div class="unchanged-amount-item"><span>资金池</span><strong class="pool-amount">1977728.41</strong></div></section><label class="modal-field unchanged-production"><span>添加审核备注 <small>（选填）</small></span><textarea placeholder="请输入详细的审核备注信息"></textarea></label></div>`;
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
    document.querySelectorAll(".finance-withdraw-audit").forEach((button) => button.addEventListener("click", () => { modal(`提款审核 - ${button.dataset.order}`, withdrawalAuditModalBody(button.dataset.accountType, button.dataset.account), "", withdrawalAuditModalFooter()); document.querySelectorAll(".withdraw-review-action").forEach((action) => action.addEventListener("click", () => modal(`${action.dataset.result}确认`, `<p class="danger-confirm">您现在操作的是<strong>【${action.dataset.result}】</strong></p><p>确认后将更新该提款订单状态。</p>`, `确认${action.dataset.result}`))); }));
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
    specScroll.querySelector(".page-note")?.remove();
    const tabGoal = page.pageGoals?.[tabName];
    if (tabGoal) {
      const target = document.createElement("section");
      target.className = "page-note";
      target.innerHTML = `<span>页面目标</span><p>${escapeHtml(tabGoal)}</p>`;
      heading.insertAdjacentElement("beforebegin", target);
    }
    if (["agent-transactions", "site-transactions"].includes(page.key)) {
      specScroll.querySelector(".adjustment-note")?.remove();
      specScroll.querySelector(".record-withdraw-logic")?.remove();
      const subject = page.key === "agent-transactions" ? "代理" : "站点";
      if (tabName.includes("提款")) {
        const logic = document.createElement("section");
        logic.className = "record-withdraw-logic";
        logic.innerHTML = `<span>逻辑说明</span><p>${subject}提款无需经过风控审核。</p>`;
        const pageGoal = specScroll.querySelector(".page-note");
        (pageGoal || heading).insertAdjacentElement("beforebegin", logic);
      }
      return;
    }
    if (page.key !== "deposit-withdraw-settings") return;
    if (tabName === "禁止存款用户") {
      specScroll.querySelector(".adjustment-note")?.remove();
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
    const scopeAnnotation = annotations.find((annotation) => annotation.id === "P01" && annotation.tab === "会员日志");
    const exportAnnotation = annotations.find((annotation) => annotation.name.includes("导出") || annotation.type.includes("导出"));
    const cards = annotations.filter((annotation) => annotation !== scopeAnnotation && annotation !== exportAnnotation);
    const topNotices = document.querySelector(".spec-top-notices");
    const list = document.querySelector(".annotation-list");
    const count = document.querySelector(".spec-section-heading span");
    if (topNotices) topNotices.innerHTML = `<section class="comparison-spec-note"><span>对比说明</span><p>低对比度的是和生产一致，无需修改</p></section>${scopeSpecNotice(scopeAnnotation)}`;
    if (list) list.innerHTML = cards.map(annotationCard).join("");
    if (count) count.textContent = `${cards.length} 项`;
    bindComponentLinks();
  }

  function member488EditModal(member) {
    modal(`编辑会员信息 - ${member}`, `<div class="member-edit-form"><label class="member-region-edit">国家/地区<div><select><option>中国</option><option>日本</option></select><select><option>上海市</option><option>广东省</option></select><select><option>浦东新区</option><option>黄浦区</option></select></div></label><label>手机号<input type="text" value="13800138899" /></label><label>邮箱<input type="email" value="member10086@mail.test" /></label><label>会员生日<input type="date" value="1992-08-18" /></label><label>真实姓名<input type="text" value="陈小明" /></label><label>性别<div class="radio-row"><span><input type="radio" name="member-gender" checked /> 男</span><span><input type="radio" name="member-gender" /> 女</span></div></label><label class="member-edit-note">修改备注<textarea placeholder="请输入修改原因，必填"></textarea></label><button type="button" class="secondary-action member-edit-history">查看修改历史</button></div>`, "保存修改");
    document.querySelector(".member-edit-history")?.addEventListener("click", () => modal(`修改历史 - ${member}`, `<div class="risk-table-wrap"><table class="risk-table member-history-table"><thead><tr><th>修改字段</th><th>修改前</th><th>修改后</th><th>修改时间</th><th>修改备注</th><th>修改人</th></tr></thead><tbody><tr><td>手机号</td><td>13800136621</td><td>13800138899</td><td>2026-07-16 10:28:16</td><td>会员提交客服修改</td><td>mike.cs</td></tr><tr><td>会员生日</td><td>1992-08-08</td><td>1992-08-18</td><td>2026-07-10 11:09:22</td><td>资料校正</td><td>amy.cs</td></tr></tbody></table></div>${pagination(20,2)}`, "关闭"));
  }

  function member488TagEditorModal(member) {
    const assignment = memberTagAssignments[member] || { custom: [], system: [], remark: "—" };
    const currentTags = [...assignment.custom.map((name) => member488TagChip(name, false, true)), ...assignment.system.map((name) => member488TagChip(name, true, true))].join("");
    const choices = (tags, system) => tags.map((tag) => `<label><input type="checkbox" value="${escapeHtml(tag.name)}" data-tag-system="${system}" /><span>${escapeHtml(tag.name)}</span>${system ? `<span class="functional-tag-hint" tabindex="0" role="note" title="${escapeHtml(tag.description)}" aria-label="${escapeHtml(tag.name)}用途：${escapeHtml(tag.description)}" data-tooltip="${escapeHtml(tag.description)}">?</span>` : ""}<small>${escapeHtml(tag.description)}</small></label>`).join("");
    const historyRows = [
      ["系统标签", "不返水", "增加", "mike.risk", "2026-08-03 16:28:10", "返水审核确认"],
      ["自定义标签", "世界杯高活跃", "增加", "amy.ops", "2026-08-01 10:06:32", "活动会员分组"],
      ["自定义标签", "线下补充核验", "删除", "mike.cs", "2026-07-28 14:42:16", "资料已补充完成"]
    ];
    modal(`编辑标签 - ${member}`, `<div class="member-tag-editor"><section class="member-current-tags"><header><strong>当前标签</strong><span>点击标签后的 × 可删除</span></header><div>${currentTags || '<span class="member-no-tags">暂无标签</span>'}</div></section><section class="member-tag-selector"><header><strong>增加标签</strong><span>标签选项读取#509标签管理当前有效配置</span></header><nav class="segmented-control member-tag-type-tabs"><button type="button" class="active" data-member-tag-view="custom">自定义标签</button><button type="button" data-member-tag-view="system">系统标签</button></nav><div class="member-tag-choice-panel" data-member-tag-panel="custom">${choices(memberCustomTagOptions, false)}</div><div class="member-tag-choice-panel" data-member-tag-panel="system" hidden>${choices(memberSystemTagOptions, true)}</div><div class="member-tag-selector-footer"><label>操作备注<input type="text" class="member-tag-note" placeholder="请输入本次调整备注" /></label><button type="button" class="main-action member-tag-add-selected">增加所选标签</button></div></section><section class="member-tag-history"><header><strong>标签编辑历史</strong><span>共 3 条</span></header><div class="risk-table-wrap"><table class="risk-table member-tag-history-table"><thead><tr><th>标签类型</th><th>标签名称</th><th>操作类型</th><th>操作人</th><th>操作时间</th><th>备注</th></tr></thead><tbody>${historyRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${pagination(20, 3)}</section></div>`, "保存标签");
    const root = document.getElementById("modal-root");
    const current = root.querySelector(".member-current-tags > div");
    const historyBody = root.querySelector(".member-tag-history-table tbody");
    const addHistory = (system, name, action) => {
      const note = root.querySelector(".member-tag-note")?.value.trim() || "后台调整标签";
      historyBody?.insertAdjacentHTML("afterbegin", `<tr><td>${system ? "系统标签" : "自定义标签"}</td><td>${escapeHtml(name)}</td><td>${action}</td><td>mike.ops</td><td>2026-08-04 11:30:00</td><td>${escapeHtml(note)}</td></tr>`);
      const count = root.querySelectorAll(".member-tag-history-table tbody tr").length;
      const countLabel = root.querySelector(".member-tag-history > header span");
      if (countLabel) countLabel.textContent = `共 ${count} 条`;
    };
    root.querySelectorAll("[data-member-tag-view]").forEach((button) => button.addEventListener("click", () => {
      const view = button.dataset.memberTagView;
      root.querySelectorAll("[data-member-tag-view]").forEach((item) => item.classList.toggle("active", item === button));
      root.querySelectorAll("[data-member-tag-panel]").forEach((panel) => { panel.hidden = panel.dataset.memberTagPanel !== view; });
    }));
    current?.addEventListener("click", (event) => {
      const remove = event.target.closest(".member-tag-remove");
      if (!remove) return;
      const chip = remove.closest(".member-tag-chip");
      addHistory(remove.dataset.tagSystem === "true", remove.dataset.tagName, "删除");
      chip?.remove();
      if (!current.querySelector(".member-tag-chip")) current.innerHTML = '<span class="member-no-tags">暂无标签</span>';
    });
    root.querySelector(".member-tag-add-selected")?.addEventListener("click", () => {
      const visiblePanel = Array.from(root.querySelectorAll("[data-member-tag-panel]")).find((panel) => !panel.hidden);
      const selected = Array.from(visiblePanel?.querySelectorAll('input[type="checkbox"]:checked') || []);
      selected.forEach((input) => {
        const system = input.dataset.tagSystem === "true";
        if (current.querySelector(`[data-current-tag="${CSS.escape(input.value)}"][data-tag-system="${system}"]`)) return;
        current.querySelector(".member-no-tags")?.remove();
        current.insertAdjacentHTML("beforeend", member488TagChip(input.value, system, true));
        addHistory(system, input.value, "增加");
        input.checked = false;
      });
    });
    applyTableRowLimits(root);
  }

  function member488BetModal(order) {
    modal(`下注详情 - ${order}`, `<div class="bet-detail-grid"><div><span>会员账号</span><strong>member_10086</strong></div><div><span>场馆</span><strong>DW体育</strong></div><div><span>赛事</span><strong>英格兰超级联赛</strong></div><div><span>对阵</span><strong>阿森纳 vs 切尔西</strong></div><div><span>玩法</span><strong>亚洲让球</strong></div><div><span>盘口</span><strong>主队 -0.5</strong></div><div><span>赔率</span><strong>1.86</strong></div><div><span>下注内容</span><strong>阿森纳</strong></div><div><span>下注金额</span><strong>1,000 CNY</strong></div><div><span>有效下注</span><strong>980 CNY</strong></div><div><span>输赢情况</span><strong>全赢 +860 CNY</strong></div><div><span>状态</span><strong>已结算</strong></div></div>`, "关闭");
  }

  function bindMember488Behavior(page) {
    if (!page.key.endsWith("-488")) return;
    if (page.key === "member-list-488") {
      hydrateMember488Tags();
      bindComponentLinks();
    }
    bindMember488RelationLinks();
    if (!page.annotations?.some((annotation) => annotation.id === "B01")) document.querySelectorAll(".risk-filter-actions [data-component-id='B01']").forEach((button) => { button.removeAttribute("data-component-id"); button.classList.remove("annotated"); button.querySelector(".component-badge")?.remove(); });
    bindExportStandardLink(app, page.annotations?.some((annotation) => annotation.id === "B01" && (annotation.name.includes("导出") || annotation.type.includes("导出"))) ? "B01" : "B99");
    bindMember488OverviewTooltips();
    document.querySelectorAll(".member-488-detail").forEach((button) => button.addEventListener("click", () => { window.location.hash = `requirement/${encodeURIComponent("#488")}/page/member-basic-488`; }));
    document.querySelectorAll(".member-488-edit").forEach((button) => button.addEventListener("click", () => member488EditModal(button.dataset.member)));
    document.querySelectorAll(".member-edit-tags").forEach((button) => button.addEventListener("click", () => member488TagEditorModal(button.dataset.member)));
    document.querySelectorAll(".member-status-switch").forEach((button) => button.addEventListener("click", () => modal(`${button.dataset.status}会员`, `<p class="danger-confirm">您现在操作的是<strong>【${button.dataset.status}】</strong></p><label class="modal-field">操作原因<textarea placeholder="请输入原因，必填"></textarea></label><p class="member-pending-note">该操作的业务影响范围沿用生产现有逻辑。</p>`, `确认${button.dataset.status}`)));
    document.querySelectorAll(".member-account-action").forEach((button) => button.addEventListener("click", () => modal(`${button.dataset.action} - ${button.dataset.member}`, `<p>确认对会员 <strong>${button.dataset.member}</strong> 执行【${button.dataset.action}】？</p>${button.dataset.action === "重置提款密码" ? '<p class="member-pending-note">重置后由前端用户自行重新设置提款密码。</p>' : ""}`, "确认执行")));
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
      bindExportStandardLink(body || document, "B99");
      syncMember488LogSpec(page, tab);
      bindDatePickers();
      bindSiteAutocomplete();
      bindComponentLinks();
      bindMember488RelationLinks(body || document);
      applyTableRowLimits(body || document);
    }));
  }

  function bindMember493Behavior(page) {
    document.querySelectorAll(".member-493-bet-detail").forEach((preview) => {
      const tooltip = preview.querySelector(".bet-record-tooltip");
      const positionTooltip = () => {
        const rect = preview.getBoundingClientRect();
        const pane = preview.closest(".prototype-pane")?.getBoundingClientRect();
        const width = Math.min(390, Math.max(280, (pane?.width || window.innerWidth) - 24));
        const rightBoundary = Math.min(window.innerWidth - 12, (pane?.right || window.innerWidth) - 12);
        const leftBoundary = Math.max(12, (pane?.left || 0) + 12);
        const left = Math.max(leftBoundary, Math.min(rect.left, rightBoundary - width));
        tooltip.style.position = "fixed";
        tooltip.style.width = `${width}px`;
        tooltip.style.left = `${Math.round(left)}px`;
        tooltip.style.right = "auto";
        tooltip.style.top = `${Math.round(Math.min(rect.bottom + 6, window.innerHeight - Math.min(tooltip.scrollHeight || 360, 520) - 12))}px`;
      };
      preview.addEventListener("mouseenter", positionTooltip);
      preview.addEventListener("focus", positionTooltip);
    });
    if (!["bet-records-493", "bet-records-488"].includes(page.key)) return;
    if (page.key === "bet-records-493") document.querySelector(".member-493-bet-filters [data-component-id='B01']")?.addEventListener("click", () => modal("导出投注记录", `<p>按当前筛选条件导出全部命中记录，不受当前页限制。</p><p>导出文件中的下注详情位于同一个单元格，每个详情字段换行展示。</p><p>${exportExcelRules.map(escapeHtml).join("；")}。</p>`, "确认导出"));
  }

  function vipLevelConfigModal(level) {
    modal(`${memberVipConfigSite} · ${level} 等级配置`, `<div class="modal-context-line"><span>所属站点</span><strong>${memberVipConfigSite}</strong><span>VIP等级</span><strong>${level}</strong></div><div class="vip-modal-toolbar"><button type="button" class="secondary-action">← 上一等级</button><label>快速跳转<select><option>${level}</option>${Array.from({ length: 13 }, (_, index) => `<option>VIP${index}</option>`).join("")}</select></label><button type="button" class="secondary-action">下一等级 →</button></div><p class="config-validation-note">金额必须大于0；次数、周期等其他数值允许填写0。</p><div class="vip-config-sections"><section><h3>晋升规则</h3><div class="config-grid"><label>晋升存款<div><input type="number" value="2000" min="0.01" step="0.01" /><span>CNY</span></div></label><label>晋升流水<div><input type="number" value="12000" min="0.01" step="0.01" /><span>CNY</span></div></label></div><p>两项同时满足后，次日最多晋升一级；超出部分不结转到下一等级。</p></section><section><h3>保级规则</h3><div class="config-grid"><label>保级流水<div><input type="number" value="8000" min="0.01" step="0.01" /><span>CNY</span></div></label><label>保级周期<div><input type="number" value="90" min="0" step="1" /><span>天</span></div></label></div></section><section><h3>提款福利</h3><div class="config-grid config-grid-three"><label>日提款次数<div><input type="number" value="5" min="0" step="1" /><span>次</span></div></label><label>每日CNY提款额度<div><input type="number" value="200000" min="0.01" step="0.01" /><span>CNY</span></div></label><label>每日总提款额度<div><input type="number" value="1000000" min="0.01" step="0.01" /><span>CNY</span></div></label></div></section></div>`, "保存配置");
    document.querySelector(".risk-modal")?.classList.add("vip-config-modal");
  }

  function vipBonusConfigModal(level) {
    const independentLimit = memberVipConfigSite === "总控默认配置" ? "" : '<p class="config-limit-note">本站点所有红利金额不得高于同VIP等级、同红利类型的总控默认金额，保存时逐项校验。</p>';
    const reward = (name, amount, condition, unit = "天") => `<section><h3>${name}</h3><div class="reward-config-row"><label>红利金额<div><input type="number" value="${amount}" min="0.01" step="0.01" /><span>CNY</span></div></label>${condition ? `<label>${condition}<div><input type="number" value="3000" min="0.01" step="0.01" /><span>CNY</span></div></label>` : ""}<label>领取有效期<div><input type="number" value="7" min="0" step="1" /><span>${unit}</span></div></label><label>流水倍数<div><input type="number" value="1" min="1" step="0.1" /><span>倍</span></div></label></div></section>`;
    modal(`${memberVipConfigSite} · ${level} 红利配置`, `<div class="modal-context-line"><span>所属站点</span><strong>${memberVipConfigSite}</strong><span>VIP等级</span><strong>${level}</strong></div><div class="vip-modal-toolbar"><button type="button" class="secondary-action">← 上一等级</button><label>快速跳转<select><option>${level}</option>${Array.from({ length: 13 }, (_, index) => `<option>VIP${index}</option>`).join("")}</select></label><button type="button" class="secondary-action">下一等级 →</button></div><p class="config-validation-note">金额必须大于0；流水倍数不得小于1；领取有效期等其他数值允许填写0。</p>${independentLimit}<div class="reward-config-list">${reward("VIP晋升礼金", "18", "")}${reward("VIP生日礼金", "18", "")}${reward("VIP周礼金", "18", "上周流水要求")}${reward("VIP月礼金", "68", "上月流水要求")}</div>`, "保存配置");
    document.querySelector(".risk-modal")?.classList.add("vip-config-modal");
  }

  function vipCopyConfigModal() {
    const labels = ["晋升标准", "晋升顺序", "保级要求", "降级标准", "VIP晋升礼金", "VIP生日礼金", "VIP周礼金", "VIP月礼金", "晋级优惠", "VIP晋级", "VIP返水"];
    modal("VIP文案配置", `<div class="copy-config-layout"><nav>${labels.map((label, index) => `<button type="button" class="${index === 0 ? "active" : ""}">${label}</button>`).join("")}</nav><section><label>晋升标准<textarea>累计存款和有效流水同时达到相应级别要求后，可在次日24点前晋级相应VIP等级。</textarea></label><div class="copy-preview"><span>用户端预览</span><p>累计存款和有效流水同时达到相应级别要求后，可在次日24点前晋级相应VIP等级。</p></div></section></div>`, "保存文案");
    document.querySelector(".risk-modal")?.classList.add("vip-copy-modal");
    document.querySelectorAll(".copy-config-layout nav button").forEach((button) => button.addEventListener("click", () => { button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("active")); button.classList.add("active"); }));
  }

  function vipAlgorithmGuideModal() {
    modal("VIP算法说明", `<div class="vip-algorithm-guide"><header><h3>VIP等级如何计算</h3><p>平台按固定时间统计已完成注单，并依据会员当前等级配置完成晋升或保级判断。</p></header><section><strong>每日晋升</strong><ol><li>每天14:00统计前一自然日内完成的有效注单。</li><li>晋升存款和晋升流水同时达到下一等级要求时升级。</li><li>每次最多晋升一级，不允许跨级。</li><li>升级后，超过当前等级门槛的存款和流水不结转，下一等级重新累计。</li></ol></section><section><strong>保级与降级</strong><ol><li>会员升级后，按当前等级配置的保级周期累计保级流水。</li><li>周期内达到保级流水，保留当前等级并开始下一保级周期。</li><li>周期结束仍未达标时降一级，再按降级后的等级重新计算。</li></ol></section><footer><b>统计口径</b><span>晋升与保级均以注单完成时间归属统计日；未完成或无效注单不计入有效流水。</span></footer></div>`, "关闭");
    document.querySelector(".risk-modal")?.classList.add("vip-algorithm-guide-modal");
  }

  function vipSiteEnableModal() {
    const scope = document.querySelector(".vip-site-enable")?.dataset.independentScope || "会员等级、红利与VIP返水";
    modal(`为 ${memberVipConfigSite} 单独配置`, `<div class="site-config-modal"><div class="modal-context-line"><span>当前使用</span><strong>总控默认配置</strong></div><p>确认后将完整复制当前总控默认配置，并切换为<strong>【${memberVipConfigSite}单独配置】</strong>。</p><p class="form-warning">${scope}将作为一套完整配置复制，包括全部VIP等级规则、返水流水倍数以及场馆与游戏返水比例，不支持选择部分范围。此后总控默认配置的修改不再影响该站点。</p><label class="confirm-check"><input type="checkbox" /> 我已确认启用本站点单独配置</label></div>`, "确认启用");
    const confirm = document.querySelector(".risk-modal .modal-confirm");
    const acknowledgement = document.querySelector(".risk-modal .confirm-check input");
    if (confirm) confirm.disabled = true;
    acknowledgement?.addEventListener("change", () => { if (confirm) confirm.disabled = !acknowledgement.checked; });
    confirm?.addEventListener("click", () => {
      if (!acknowledgement?.checked) return;
      memberVipIndependentSites.add(memberVipConfigSite);
      render();
    }, { capture: true });
  }

  function vipSiteRestoreModal() {
    const scope = document.querySelector(".vip-site-restore")?.dataset.independentScope || "会员等级、红利与VIP返水";
    modal("恢复使用总控默认配置", `<p class="danger-confirm">确认将 <strong>【${memberVipConfigSite}】</strong> 恢复为使用总控默认配置？</p><p>该站点独立的${scope}将整套停止生效，并立即读取最新总控默认配置；不支持只恢复部分配置。已生成记录继续保留原配置快照。</p>`, "确认恢复");
    document.querySelector(".risk-modal .modal-confirm")?.addEventListener("click", () => {
      memberVipIndependentSites.delete(memberVipConfigSite);
      render();
    }, { capture: true });
  }

  function tagFormModal(name = "", system = false) {
    modal(system ? `编辑系统标签备注 - ${name}` : name ? `编辑自定义标签 - ${name}` : "新增自定义标签", `<div class="tag-form"><label>标签名称<input type="text" value="${escapeHtml(name)}" ${system ? "disabled" : ""} placeholder="请输入标签名称" /></label><label>业务类型<select ${system ? "disabled" : ""}><option>运营标签</option><option>风控标签</option><option>财务标签</option></select></label><label>备注<textarea placeholder="请输入标签用途和适用范围">${system ? "系统功能性标签，仅允许维护说明备注。" : ""}</textarea></label>${system ? '<p class="form-lock-note">系统标签名称、业务类型和功能不可修改。</p>' : ""}</div>`, "保存");
  }

  function tagMembersModal(tagName, vipLevel = false, system = false) {
    const title = vipLevel ? `${tagName} 会员列表` : `标签关联会员 - ${tagName}`;
    const queryLabel = vipLevel ? "当前等级" : "当前标签";
    const typeName = system ? "系统标签" : "自定义标签";
    const detailHref = `#requirement/${encodeURIComponent("#488")}/page/member-basic-488`;
    const actionHeader = vipLevel ? "" : "<th>操作</th>";
    const options = system ? ["不返水", "提款挂起"] : ["世界杯高活跃", "线下补充核验", "大额存款关注"];
    const memberRow = (member, wallet, vip, agent, registered, login, index) => {
      const actionCell = vipLevel ? "" : `<td><button type="button" class="link-action tag-member-adjust" data-adjust-index="${index}">调整标签</button></td>`;
      const adjustRow = vipLevel ? "" : `<tr class="tag-member-adjust-row" data-adjust-panel="${index}" hidden><td colspan="7"><div class="tag-member-inline-editor"><div class="tag-member-editor-heading"><div><strong>${escapeHtml(member)}</strong><span>仅可操作${typeName}</span></div><button type="button" class="modal-close tag-member-editor-close" aria-label="收起调整区">×</button></div><div class="segmented-control tag-member-action-tabs"><button type="button" class="active" data-inline-tag-mode="edit">修改标签</button><button type="button" data-inline-tag-mode="remove">删除标签</button></div><div class="tag-member-inline-panel" data-inline-panel="edit"><div class="tag-member-choice-list">${options.map((name) => `<label><input type="checkbox" ${name === tagName ? "checked" : ""} /><span>${name}</span></label>`).join("")}</div><label class="modal-field"><span>调整备注</span><textarea placeholder="请输入本次调整原因"></textarea></label><div class="tag-member-inline-actions"><button type="button" class="secondary-action tag-member-editor-cancel">取消</button><button type="button" class="main-action tag-member-inline-save">保存修改</button></div></div><div class="tag-member-inline-panel" data-inline-panel="remove" hidden><p class="tag-member-remove-copy">解除该会员与${typeName}【${escapeHtml(tagName)}】的关联，不删除标签定义。</p><label class="modal-field"><span>删除备注</span><textarea placeholder="请输入删除原因"></textarea></label><div class="tag-member-inline-actions"><button type="button" class="secondary-action tag-member-editor-cancel">取消</button><button type="button" class="main-action danger-action tag-member-inline-remove">确认删除</button></div></div></div></td></tr>`;
      return `<tr><td><a class="member-detail-link" href="${detailHref}" target="_blank" rel="noopener">${member}</a></td><td>${wallet}</td><td>${vip}</td><td>${agent}</td><td>${registered}</td><td>${login}</td>${actionCell}</tr>${adjustRow}`;
    };
    const rows = memberRow("member_10086", "18,620 CNY", "VIP3", "agent_087 / AG10386", "2026-03-18 10:20:16", "2026-07-23 18:12:33", 0) + memberRow("evan888", "8,216 CNY", "VIP2", "agent_102 / AG10822", "2026-05-06 09:18:42", "2026-07-23 17:02:18", 1);
    modal(title, `<div class="relation-query"><span>${queryLabel}</span><strong>${escapeHtml(tagName)}</strong></div><div class="risk-table-wrap"><table class="risk-table tag-member-table"><thead><tr><th>会员账号</th><th>中心钱包</th><th>会员等级</th><th>上级代理</th><th>注册时间</th><th>最后登录时间</th>${actionHeader}</tr></thead><tbody>${rows}</tbody></table></div>${pagination(20, 2)}`, "关闭");
    document.querySelector(".risk-modal")?.classList.add("tag-members-modal");
    document.querySelector(".tag-member-table")?.addEventListener("click", (event) => {
      const button = event.target.closest(".tag-member-adjust");
      if (button) {
        const panel = document.querySelector(`[data-adjust-panel="${button.dataset.adjustIndex}"]`);
        document.querySelectorAll(".tag-member-adjust-row").forEach((row) => { if (row !== panel) row.hidden = true; });
        if (panel) panel.hidden = !panel.hidden;
        return;
      }
      const editor = event.target.closest(".tag-member-inline-editor");
      if (!editor) return;
      if (event.target.closest(".tag-member-editor-close,.tag-member-editor-cancel")) {
        editor.closest(".tag-member-adjust-row").hidden = true;
        return;
      }
      const modeButton = event.target.closest("[data-inline-tag-mode]");
      if (modeButton) {
        editor.querySelectorAll("[data-inline-tag-mode]").forEach((item) => item.classList.toggle("active", item === modeButton));
        editor.querySelectorAll("[data-inline-panel]").forEach((panel) => { panel.hidden = panel.dataset.inlinePanel !== modeButton.dataset.inlineTagMode; });
        return;
      }
      if (event.target.closest(".tag-member-inline-save,.tag-member-inline-remove")) {
        editor.innerHTML = `<div class="tag-member-inline-success"><strong>标签关联已更新</strong><span>本次操作将记录操作人、操作时间和备注。</span></div>`;
      }
    });
    applyTableRowLimits(document.getElementById("modal-root"));
  }

  function rebateSettingModal(level, readonly = false) {
    const venueCatalog = rebateVenueCatalog.filter((venue) => venue.type === "电子");
    let currentVenue = venueCatalog.find((venue) => venue.games.length) || venueCatalog[0] || { name: "暂无电子场馆", type: "电子", games: [] };
    const venueTypes = [["体育", "0.40"], ["真人", "0.40"], ["电竞", "0.50"], ["棋牌", "0.50"], ["彩票", "0.00"], ["电子", "0.80"], ["捕鱼", "0.10"]];
    const footer = readonly ? `<footer><button class="main-action modal-confirm">关闭</button></footer>` : "";
    const context = `<div class="modal-context-line"><span>所属站点</span><strong>${memberVipConfigSite}</strong><span>VIP等级</span><strong>${level}</strong></div>`;
    const typeRates = `<section class="rebate-type-config"><header><div><strong>场馆类型默认比例</strong><span>所有游戏先读取所属场馆类型的默认比例</span></div><em>7种类型</em></header><div>${venueTypes.map(([type, rate]) => `<label class="rebate-type-rate${type === "电子" ? " electronic" : ""}"><span>${type}</span>${readonly ? `<strong>${rate}%</strong>` : `<div><input type="number" value="${rate}" min="0" step="0.0001" /><em>%</em></div>`}${type === "电子" ? '<small>支持游戏覆盖</small>' : ""}</label>`).join("")}</div></section>`;
    const priorityNote = `<section class="rebate-priority-note"><strong>最终比例优先级</strong><span>电子游戏单独配置比例 ＞ 电子类型默认比例。未单独配置的电子游戏自动使用电子默认比例。</span></section>`;
    const venueList = `<nav class="venue-config-sidebar" aria-label="电子场馆选择">${venueCatalog.map((venue) => `<button type="button" class="${venue.name === currentVenue.name ? "active" : ""}" data-venue-name="${escapeHtml(venue.name)}"><span>${escapeHtml(venue.name)}</span><em>${venue.games.length}</em></button>`).join("")}</nav>`;
    const venueTools = `<div class="venue-game-tools"><div><strong class="current-venue-name">${escapeHtml(currentVenue.name)}</strong><span class="current-venue-meta">${escapeHtml(currentVenue.type)} · ${currentVenue.games.length}款游戏</span></div></div>`;
    const gameTable = `<div class="risk-table-wrap rebate-game-table-wrap"><table class="risk-table rebate-game-table"><thead><tr>${readonly ? "" : "<th>选择</th>"}<th>游戏名称</th><th>覆盖比例</th><th>生效来源</th></tr></thead><tbody class="rebate-game-body"></tbody></table></div><div class="venue-game-foot"><span class="venue-game-result-count"></span><small>留空表示使用电子类型默认比例。</small></div>`;
    const batchToolbar = readonly ? "" : `<div class="rebate-batch-toolbar"><label><input type="checkbox" class="rebate-check-all" />全选当前场馆游戏</label><span class="rebate-selected-count">已选 0 项</span><label class="rebate-batch-rate"><input type="number" class="rebate-batch-value" min="0" step="0.0001" placeholder="覆盖比例" /><span>%</span></label><button type="button" class="secondary-action rebate-batch-action" data-batch-action="设置" disabled>批量设置</button><button type="button" class="secondary-action rebate-batch-clear" disabled>恢复电子默认</button></div><p class="rebate-batch-help">仅需维护例外游戏；恢复默认后不再保存游戏级比例。</p>`;
    const venueWorkspace = `<section class="electronic-override-config"><header><div><strong>电子游戏单独覆盖</strong><span>按电子场馆切换并维护例外游戏</span></div><em>${venueCatalog.length}个电子场馆</em></header><div class="venue-config-workspace">${venueList}<div class="venue-config-main">${venueTools}${batchToolbar}${gameTable}</div></div></section>`;
    const independentLimit = memberVipConfigSite === "总控默认配置" ? "" : '<p class="config-limit-note">本站点金额配置不得高于同VIP等级对应的总控默认金额，保存时逐项校验。</p>';
    const body = readonly
      ? `${context}<div class="rebate-readonly-summary"><div><span>每日最高返水</span><strong>200 CNY</strong></div><div><span>最低流水要求</span><strong>10,000 CNY</strong></div><div><span>领取有效期</span><strong>1天</strong></div><div><span>返水流水倍数</span><strong>1倍</strong></div></div>${typeRates}${priorityNote}${venueWorkspace}`
      : `${context}${independentLimit}<div class="rebate-base-config"><label>每日最高返水<div><input type="number" value="200" min="0.01" step="0.01" /><span>CNY</span></div></label><label>最低流水要求<div><input type="number" value="10000" min="0.01" step="0.01" /><span>CNY</span></div></label><label>领取有效期<div><input type="number" value="1" min="0" step="1" /><span>天</span></div></label><label>返水流水倍数<div><input type="number" value="1" min="1" step="0.1" /><span>倍</span></div></label></div>${typeRates}${priorityNote}${venueWorkspace}`;
    modal(`${level} 返水${readonly ? "详情" : "设置"}`, body, readonly ? "关闭" : "保存配置", footer);
    document.querySelector(".risk-modal")?.classList.add("rebate-setting-modal");
    const modalElement = document.querySelector(".risk-modal.rebate-setting-modal");
    const checkAll = modalElement?.querySelector(".rebate-check-all");
    const selectedCount = modalElement?.querySelector(".rebate-selected-count");
    const batchButtons = Array.from(modalElement?.querySelectorAll(".rebate-batch-action") || []);
    const batchClear = modalElement?.querySelector(".rebate-batch-clear");
    const batchInput = modalElement?.querySelector(".rebate-batch-value");
    const batchHelp = modalElement?.querySelector(".rebate-batch-help");
    const gameBody = modalElement?.querySelector(".rebate-game-body");
    const selectedChecks = () => Array.from(modalElement?.querySelectorAll(".rebate-game-check:checked") || []);
    const updateBatchSelection = () => {
      const rowChecks = Array.from(modalElement?.querySelectorAll(".rebate-game-check") || []);
      const count = selectedChecks().length;
      if (selectedCount) selectedCount.textContent = `已选 ${count} 项`;
      batchButtons.forEach((button) => { button.disabled = count === 0; });
      if (batchClear) batchClear.disabled = count === 0;
      if (checkAll) {
        checkAll.checked = count === rowChecks.length && rowChecks.length > 0;
        checkAll.indeterminate = count > 0 && count < rowChecks.length;
      }
    };
    const rateFor = (venueIndex, gameIndex) => {
      const seed = venueIndex * 17 + gameIndex;
      if (seed % 17 === 0) return "0";
      if (seed % 4 !== 0) return "";
      return (0.82 + (seed % 12) / 100).toFixed(2);
    };
    const renderCurrentVenue = () => {
      const venueIndex = Math.max(0, venueCatalog.findIndex((venue) => venue.name === currentVenue.name));
      const games = currentVenue.games.map((name, index) => ({ name, index }));
      if (modalElement) {
        modalElement.querySelector(".current-venue-name").textContent = currentVenue.name;
        modalElement.querySelector(".current-venue-meta").textContent = `${currentVenue.type} · ${currentVenue.games.length}款游戏`;
        modalElement.querySelector(".venue-game-result-count").textContent = `共 ${currentVenue.games.length} 款游戏`;
      }
      if (gameBody) gameBody.innerHTML = games.length ? games.map((game) => {
        const rate = rateFor(venueIndex, game.index);
        return `<tr>${readonly ? "" : '<td><input type="checkbox" class="rebate-game-check" /></td>'}<td><strong>${escapeHtml(game.name)}</strong></td><td>${readonly ? `<strong>${rate === "" ? "—" : `${rate}%`}</strong>` : `<div class="inline-rate-input"><input type="number" value="${rate}" min="0" placeholder="使用电子默认" step="0.0001" /><span>%</span></div>`}</td><td><span class="data-tag ${rate === "" ? "" : "tag-amber"}">${rate === "" ? "电子默认 0.80%" : "游戏单独配置"}</span></td></tr>`;
      }).join("") : `<tr><td colspan="${readonly ? 3 : 4}"><div class="venue-games-empty"><strong>暂无游戏数据</strong><span>该场馆暂未出现在场馆游戏对应表中</span></div></td></tr>`;
      if (checkAll) { checkAll.checked = false; checkAll.indeterminate = false; }
      updateBatchSelection();
      applyTableRowLimits(modalElement || document);
    };
    modalElement?.querySelectorAll("[data-venue-name]").forEach((button) => button.addEventListener("click", () => {
      currentVenue = venueCatalog.find((venue) => venue.name === button.dataset.venueName) || currentVenue;
      button.parentElement.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
      button.scrollIntoView({ behavior: "smooth", block: "nearest" });
      renderCurrentVenue();
    }));
    checkAll?.addEventListener("change", () => {
      modalElement?.querySelectorAll(".rebate-game-check").forEach((check) => { check.checked = checkAll.checked; });
      updateBatchSelection();
    });
    modalElement?.addEventListener("change", (event) => { if (event.target.classList.contains("rebate-game-check")) updateBatchSelection(); });
    const batchDescriptions = { 设置: "覆盖全部选中游戏的当前返水比例。" };
    batchButtons.forEach((button) => button.addEventListener("click", () => {
      const action = button.dataset.batchAction;
      const value = Number(batchInput?.value);
      if (!batchInput?.value.trim() || !Number.isFinite(value) || value < 0) {
        if (batchHelp) batchHelp.textContent = "请输入大于或等于 0 的有效比例。";
        batchInput?.focus();
        return;
      }
      let changed = 0;
      let skipped = 0;
      selectedChecks().forEach((check) => {
        const rateInput = check.closest("tr")?.querySelector(".inline-rate-input input");
        if (!rateInput || rateInput.disabled) { skipped += 1; return; }
        rateInput.value = String(Number(value.toFixed(4)));
        changed += 1;
      });
      if (batchHelp) batchHelp.textContent = `${batchDescriptions[action]} 已处理 ${changed} 项${skipped ? `，跳过 ${skipped} 项` : ""}；点击“保存配置”后提交。`;
    }));
    batchClear?.addEventListener("click", () => {
      let changed = 0;
      selectedChecks().forEach((check) => {
        const rateInput = check.closest("tr")?.querySelector(".inline-rate-input input");
        if (rateInput) { rateInput.value = ""; changed += 1; }
      });
      if (batchHelp) batchHelp.textContent = `已将 ${changed} 项恢复为电子类型默认比例；点击“保存配置”后提交。`;
    });
    renderCurrentVenue();
  }

  function rebateRecordDetailModal(order, member, amount) {
    const claimRows = [
      ["电子", "83.79", "已领取", "2026-07-23 09:36:18"],
      ["真人", "30.00", "已领取", "2026-07-23 09:36:22"],
      ["体育", "20.00", "未领取", "—"],
      ["棋牌", "12.50", "已领取", "2026-07-23 09:36:28"],
      ["彩票", "8.13", "已过期", "—"],
      ["捕鱼", "9.00", "未领取", "—"],
      ["电竞", "5.00", "已领取", "2026-07-23 09:36:35"]
    ];
    const detailRows = [
      ["PP电子", "电子", "疯狂大鲈鱼竞赛", "18,620", "320", "0.45%", "83.79"],
      ["DB真人", "真人", "DB真人", "7,500", "1,200", "0.40%", "30.00"],
      ["沙巴体育", "体育", "沙巴体育", "5,000", "0", "0.40%", "20.00"],
      ["旺财棋牌", "棋牌", "宾果", "2,500", "0", "0.50%", "12.50"],
      ["DB彩票", "彩票", "DB彩票", "2,710", "90", "0.30%", "8.13"],
      ["PA捕鱼", "捕鱼", "捕鱼王 2D", "2,000", "0", "0.45%", "9.00"],
      ["IM电竞", "电竞", "IM电竞", "1,250", "0", "0.40%", "5.00"]
    ];
    const claimBody = claimRows.map((row) => `<tr><td><strong>${row[0]}</strong></td><td><strong class="amount">${row[1]}</strong></td><td><span class="result-tag ${row[2] === "已领取" ? "approved" : row[2] === "已过期" ? "rejected" : ""}">${row[2]}</span></td><td>${row[3]}</td></tr>`).join("");
    const detailBody = detailRows.map((row) => `<tr><td>WC体育</td><td>${row[0]}</td><td>${row[1]}</td><td><strong>${row[2]}</strong></td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td><td><strong class="amount">${row[6]}</strong></td></tr>`).join("");
    modal(`返水明细 - ${order}`, `<div class="rebate-order-summary"><div><span>会员账号</span><strong>${escapeHtml(member)}</strong></div><div><span>返水等级</span><strong>VIP3</strong></div><div><span>返水金额</span><strong>${escapeHtml(amount)} CNY</strong></div><div><span>返水状态</span><strong><span class="result-tag pending">部分领取</span></strong></div></div><section class="modal-table-section"><h3>领取记录</h3><div class="risk-table-wrap"><table class="risk-table rebate-claim-table"><thead><tr><th>场馆类型</th><th>返水金额（CNY）</th><th>领取状态</th><th>领取时间</th></tr></thead><tbody>${claimBody}</tbody></table></div>${pagination(20, 7)}</section><section class="modal-table-section"><div class="modal-section-heading"><h3>返水明细</h3></div><div class="risk-table-wrap"><table class="risk-table rebate-detail-table"><thead><tr><th>所属站点</th><th>场馆名称</th><th>场馆类型</th><th>游戏名称</th><th>有效流水（CNY）</th><th>无效流水（CNY）</th><th>返水比例</th><th>返水金额（CNY）</th></tr></thead><tbody>${detailBody}</tbody></table></div>${pagination(20, 7)}</section>`, "关闭");
    document.querySelector(".risk-modal")?.classList.add("rebate-detail-modal");
    applyTableRowLimits(document.getElementById("modal-root"));
  }

  function syncMemberVipDetailSpec(page, tab) {
    financeTabState[page.key] = tab;
    const annotations = visibleAnnotations(page, tab);
    const list = document.querySelector(".annotation-list");
    const count = document.querySelector(".spec-section-heading span");
    if (list) list.innerHTML = annotations.map(annotationCard).join("");
    if (count) count.textContent = `${annotations.length} 项`;
    bindComponentLinks();
  }

  function updateMemberVipCenterLevel(level) {
    memberVipSelectedLevel = level;
    document.querySelectorAll("[data-vip-perks]").forEach((panel) => { panel.hidden = Number(panel.dataset.vipPerks) !== level; });
    const title = document.querySelector(".member-vip-perk-title");
    if (title) title.textContent = `VIP${level}尊享特权`;
    document.querySelectorAll(".member-vip-card-dots i").forEach((dot, index) => dot.classList.toggle("active", index === level));
  }

  function bindMember509MobileBehavior(page) {
    document.querySelectorAll("[data-profile-state]").forEach((button) => button.addEventListener("click", () => {
      memberProfileSaved = button.dataset.profileState === "saved";
      render();
    }));
    if (page.key === "member-profile-643") {
      document.querySelector(".member-profile-save")?.addEventListener("click", () => {
        modal("确认保存个人资料", '<div class="member-profile-confirm"><strong>保存后会员端不可自行修改</strong><p>请再次确认性别、出生日期、所在地区、QQ、微信和邮箱填写准确。如需修改，保存后需联系在线客服。</p></div>', "确认保存");
        document.querySelector(".risk-modal .modal-confirm")?.addEventListener("click", () => {
          memberProfileSaved = true;
          render();
        }, { capture: true });
      });
    }
    if (["member-vip-center-509", "member-vip-center-643"].includes(page.key)) {
      document.querySelectorAll("[data-deposit-progress]").forEach((button) => button.addEventListener("click", () => {
        memberVipDepositProgressVisible = button.dataset.depositProgress === "show";
        render();
      }));
      const track = document.querySelector(".member-vip-card-track");
      const cards = Array.from(document.querySelectorAll(".member-vip-card"));
      const selectCard = (card) => {
        if (!card) return;
        const level = Number(card.dataset.vipLevel);
        updateMemberVipCenterLevel(level);
        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      };
      cards.forEach((card) => card.addEventListener("click", () => selectCard(card)));
      let scrollTimer = 0;
      track?.addEventListener("scroll", () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          const center = track.getBoundingClientRect().left + track.clientWidth / 2;
          const nearest = cards.reduce((best, card) => Math.abs(card.getBoundingClientRect().left + card.clientWidth / 2 - center) < Math.abs(best.getBoundingClientRect().left + best.clientWidth / 2 - center) ? card : best, cards[0]);
          updateMemberVipCenterLevel(Number(nearest?.dataset.vipLevel || 0));
        }, 80);
      });
      if (memberVipSelectedLevel > 0) window.setTimeout(() => selectCard(cards[memberVipSelectedLevel]), 0);
    }
    if (page.key === "member-vip-detail-643") {
      document.querySelectorAll("[data-vip-detail-tab]").forEach((button) => button.addEventListener("click", () => {
        memberVipDetailTab = button.dataset.vipDetailTab;
        document.querySelectorAll("[data-vip-detail-tab]").forEach((item) => item.classList.toggle("active", item === button));
        const body = document.querySelector(".mobile-vip-detail-body");
        if (body) {
          body.innerHTML = memberVipDetailTabContent(memberVipDetailTab);
          body.classList.toggle("rebate-table-view", memberVipDetailTab === "返水比例");
        }
        syncMemberVipDetailSpec(page, memberVipDetailTab);
      }));
      syncMemberVipDetailSpec(page, memberVipDetailTab);
    }
  }

  function bindVipOptimizationBehavior(page) {
    if (!page.key.endsWith("-509") && !page.key.endsWith("-643")) return;
    bindMember509MobileBehavior(page);
    if (page.key === "rebate-records-509") {
      const generatedRange = document.querySelector('[data-component-id="F02"] .risk-range');
      const claimedRange = document.querySelector('[data-component-id="F03"] .risk-range');
      if (generatedRange) {
        const values = generatedRange.querySelectorAll("span");
        if (values[0]) values[0].textContent = "2026-07-23 00:00:00";
        if (values[1]) values[1].textContent = "2026-07-23 20:35:00";
      }
      if (claimedRange) {
        const values = claimedRange.querySelectorAll("span");
        if (values[0]) values[0].textContent = "不限";
        if (values[1]) values[1].textContent = "";
        const separator = claimedRange.querySelector("b");
        if (separator) separator.textContent = "";
        claimedRange.closest(".date-range-field")?.querySelectorAll('input[type="datetime-local"]').forEach((input) => { input.value = ""; });
      }
    }
    const tagTypeTabs = document.querySelector(".tag-type-tabs");
    if (tagTypeTabs) {
      tagTypeTabs.dataset.componentId = "N02";
      tagTypeTabs.insertAdjacentHTML("afterbegin", componentBadge("N02"));
      delete tagTypeTabs.dataset.componentLinkBound;
      document.querySelectorAll('.tag-system-body [data-component-id="M01"]').forEach((element) => {
        element.removeAttribute("data-component-id");
        element.classList.remove("annotated");
        element.querySelector(".component-badge")?.remove();
      });
      bindComponentLinks();
    }
    const vipSiteSelector = document.querySelector(".vip-site-selector");
    const vipSiteTrigger = vipSiteSelector?.querySelector(".vip-site-select-trigger");
    const vipSiteOptions = vipSiteSelector?.querySelector(".vip-site-options");
    vipSiteTrigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      const opening = vipSiteOptions.hidden;
      vipSiteOptions.hidden = !opening;
      vipSiteTrigger.setAttribute("aria-expanded", String(opening));
      if (opening) window.setTimeout(() => document.addEventListener("click", () => {
        if (vipSiteOptions) vipSiteOptions.hidden = true;
        vipSiteTrigger?.setAttribute("aria-expanded", "false");
      }, { once: true }), 0);
    });
    vipSiteSelector?.querySelectorAll("[data-vip-site]").forEach((button) => button.addEventListener("click", () => {
      memberVipConfigSite = button.dataset.vipSite;
      render();
    }));
    document.querySelector(".vip-site-enable")?.addEventListener("click", vipSiteEnableModal);
    document.querySelector(".vip-site-restore")?.addEventListener("click", vipSiteRestoreModal);
    document.querySelectorAll(".vip-level-config").forEach((button) => button.addEventListener("click", () => vipLevelConfigModal(button.dataset.level)));
    document.querySelectorAll(".vip-bonus-config").forEach((button) => button.addEventListener("click", () => vipBonusConfigModal(button.dataset.level)));
    document.querySelector(".vip-algorithm-guide")?.addEventListener("click", vipAlgorithmGuideModal);
    document.querySelector(".vip-copy-config")?.addEventListener("click", vipCopyConfigModal);
    document.querySelector(".vip-level-table")?.addEventListener("click", (event) => {
      const button = event.target.closest(".vip-member-count");
      if (button) tagMembersModal(button.dataset.level, true);
    }, true);
    const tagAddButton = document.querySelector(".tag-add");
    const tagResetButton = document.querySelector(".vip-tag-filters .reset-action");
    if (tagAddButton && tagResetButton) tagResetButton.insertAdjacentElement("afterend", tagAddButton);
    tagAddButton?.addEventListener("click", () => tagFormModal());
    document.querySelectorAll(".tag-edit").forEach((button) => button.addEventListener("click", () => tagFormModal(button.dataset.tagName, button.dataset.system === "true")));
    document.querySelectorAll(".tag-delete").forEach((button) => button.addEventListener("click", () => modal("删除自定义标签", '<p class="danger-confirm">确认删除该标签？<strong>【删除后解除当前会员关联】</strong></p><p>历史标签操作记录保留。</p>', "确认删除")));
    document.querySelector(".tag-config-table")?.addEventListener("click", (event) => {
      const button = event.target.closest(".tag-member-count");
      if (button) tagMembersModal(button.dataset.tagName, false, button.dataset.tagSystem === "true");
    }, true);
    document.querySelectorAll("[data-tag-view]").forEach((button) => button.addEventListener("click", () => {
      const system = button.dataset.tagView === "system";
      button.parentElement.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelector(".tag-custom-body").hidden = system;
      document.querySelector(".tag-system-body").hidden = !system;
      document.querySelector(".tag-list-title").textContent = system ? "系统标签" : "自定义标签";
      document.querySelector(".tag-list-count").textContent = system ? "共 2 条" : "共 3 条";
      document.querySelector(".functional-tag-note").hidden = !system;
      if (tagAddButton) tagAddButton.hidden = system;
      applyTableRowLimits(document);
    }));
    document.querySelectorAll(".rebate-setting").forEach((button) => button.addEventListener("click", () => rebateSettingModal(button.dataset.level, false)));
    document.querySelectorAll(".rebate-view").forEach((button) => button.addEventListener("click", () => rebateSettingModal(button.dataset.level, true)));
    document.querySelectorAll(".rebate-detail").forEach((button) => button.addEventListener("click", () => rebateRecordDetailModal(button.dataset.order, button.dataset.member, button.dataset.amount)));
    document.querySelectorAll(".default-rebate-site").forEach((preview) => {
      const tooltip = preview.querySelector(".default-rebate-site-tooltip");
      if (!tooltip) return;
      const positionTooltip = () => {
        const rect = preview.getBoundingClientRect();
        const pane = preview.closest(".prototype-pane")?.getBoundingClientRect();
        const width = Math.min(320, Math.max(240, (pane?.width || window.innerWidth) - 24));
        const leftBoundary = Math.max(12, (pane?.left || 0) + 12);
        const rightBoundary = Math.min(window.innerWidth - 12, (pane?.right || window.innerWidth) - 12);
        tooltip.style.position = "fixed";
        tooltip.style.width = `${width}px`;
        tooltip.style.left = `${Math.round(Math.max(leftBoundary, Math.min(rect.left, rightBoundary - width)))}px`;
        tooltip.style.right = "auto";
        tooltip.style.top = `${Math.round(Math.min(rect.bottom + 6, window.innerHeight - 96))}px`;
      };
      preview.addEventListener("mouseenter", positionTooltip);
      preview.addEventListener("focus", positionTooltip);
    });
    document.querySelector(".rebate-record-filters [data-component-id='B01']")?.addEventListener("click", () => modal("导出返水记录", "<p>按当前筛选条件导出全部命中返水记录，不受当前页限制。</p>", "确认导出"));
    document.querySelector(".excluded-game-filters [data-component-id='B01']")?.addEventListener("click", () => modal("导出不返水游戏", "<p>按当前筛选条件导出全部命中游戏，不受当前页限制。</p>", "确认导出"));
  }

  function agent498DashboardDetailModal(type) {
    const configs = {
      VIP_BENEFIT: {
        title: "会员VIP福利详情",
        headers: ["会员账号", "VIP等级", "福利类型", "发放金额（CNY）", "发放时间"],
        rows: [["member_087", "VIP3", "VIP周礼金", "188", "2026-07-29 12:36:18"], ["member_102", "VIP1", "VIP晋升礼金", "88", "2026-07-26 08:12:06"]]
      },
      ACTIVITY_BENEFIT: {
        title: "活动福利详情",
        headers: ["会员账号", "参与活动", "奖励类目", "活动奖励（CNY）", "时间"],
        rows: [["member_087", "夏日充值任务", "活动任务奖励", "500", "2026-07-28 18:25:06"], ["member_205", "新客首存活动", "活动彩金", "288", "2026-07-25 10:18:30"]]
      },
      MEMBER_PROMOTION: {
        title: "会员推广福利详情",
        headers: ["推荐人", "被推荐人", "推广类型", "产生奖励（CNY）", "时间"],
        rows: [["member_087", "member_318", "推广首充奖励", "168", "2026-07-27 16:36:20"], ["member_102", "member_266", "推广存款奖励", "86", "2026-07-24 11:08:42"]]
      },
      DEPOSIT_WITHDRAW_FEE: {
        title: "充提手续运营费详情",
        headers: ["会员账号", "交易类型", "交易金额（CNY）", "承担金额（CNY）", "交易时间"],
        rows: [["member_087", "存款", "50,000", "600", "2026-07-30 18:21:30"], ["member_102", "提款", "30,000", "300", "2026-07-28 15:12:08"]]
      }
    };
    const config = configs[type];
    if (!config) return;
    const table = `<div class="risk-table-wrap"><table class="risk-table"><thead><tr>${config.headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${config.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${pagination(20, config.rows.length)}`;
    modal(config.title, table, "关闭");
  }

  function openAgent498WithdrawAccounts() {
    const rows = agent498WithdrawAccounts.map((item, index) => `<tr><td>${item.currency}</td><td>${item.protocol}</td><td>${item.account}</td><td><button type="button" class="link-action agent-withdraw-replace" data-account-index="${index}">更换</button><button type="button" class="link-action agent-withdraw-delete" data-account-index="${index}">删除</button></td></tr>`).join("");
    modal("管理提款账户", `<div class="agent-withdraw-account-toolbar"><span>已绑定账户</span><button type="button" class="main-action agent-withdraw-add">添加账户</button></div><div class="risk-table-wrap"><table class="risk-table agent-withdraw-account-table"><thead><tr><th>货币币种</th><th>虚拟币协议</th><th>账户</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>`, "关闭");
    document.querySelector(".agent-withdraw-add")?.addEventListener("click", () => {
      modal("添加提款账户", '<div class="agent-profile-form"><label>货币种类<select><option>USDT</option><option>EB</option></select></label><label>虚拟币协议<select><option>TRC20</option><option>ERC20</option><option>不适用</option></select></label><label>虚拟币地址 / EB账户<input type="text" placeholder="请输入账户" /></label></div>', "确认添加");
      document.querySelector(".modal-confirm")?.addEventListener("click", () => { agent498WithdrawAccounts.push({ currency: "USDT", protocol: "ERC20", account: "0x86••••20" }); });
    });
    document.querySelectorAll(".agent-withdraw-replace").forEach((button) => button.addEventListener("click", () => modal("更换提款账户", '<label class="modal-field">新账户<input type="text" placeholder="请输入新地址或EB账户" /></label>', "确认更换")));
    document.querySelectorAll(".agent-withdraw-delete").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.accountIndex);
      modal("删除提款账户", "<p>确认删除该提款账户？</p>", "确认删除");
      document.querySelector(".modal-confirm")?.addEventListener("click", () => { agent498WithdrawAccounts.splice(index, 1); });
    }));
  }

  function bindAgent498Behavior(page) {
    if (!page.key.endsWith("-498") || page.key === "profit-simulator-498") return;
    const rerenderAgent498 = (preferredKey = page.key) => {
      const requirement = requirements.find((item) => item.id === "#498");
      const targetKey = agent498PageIsAllowed(preferredKey) ? preferredKey : "agent-dashboard-498";
      const targetHash = `#requirement/${encodeURIComponent("#498")}/page/${targetKey}`;
      if (window.location.hash !== targetHash) window.location.hash = targetHash;
      else detailView(requirement, targetKey);
    };
    document.getElementById("agent-498-identity")?.addEventListener("change", (event) => {
      agent498Identity = event.target.value;
      Object.keys(agent498SubViewState).forEach((key) => { delete agent498SubViewState[key]; });
      rerenderAgent498();
    });
    document.getElementById("agent-498-show-hidden")?.addEventListener("change", (event) => {
      agent498ShowHidden = event.target.checked;
      rerenderAgent498();
    });
    document.getElementById("agent-498-permission-matrix")?.addEventListener("click", () => modal("代理身份完整权限矩阵", agent498PermissionMatrixBody(), "关闭"));
    document.getElementById("agent-498-dashboard-matrix")?.addEventListener("click", () => modal("数据看板完整权限显示", agent498DashboardMatrixBody(), "关闭"));
    document.querySelectorAll("[data-agent-menu-toggle]").forEach((button) => button.addEventListener("click", () => {
      const group = button.closest(".agent-menu-group");
      const shouldExpand = !group.classList.contains("is-expanded");
      document.querySelectorAll(".agent-menu-group").forEach((item) => {
        item.classList.remove("is-expanded");
        item.querySelector("[data-agent-menu-toggle]")?.setAttribute("aria-expanded", "false");
      });
      if (shouldExpand) {
        group.classList.add("is-expanded");
        button.setAttribute("aria-expanded", "true");
      }
    }));
    document.querySelectorAll(".agent-498-page .reset-action").forEach((button) => button.addEventListener("click", () => {
      const panel = button.closest(".risk-filter-panel");
      panel?.querySelectorAll("input[type='text']").forEach((input) => { input.value = ""; });
      panel?.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; });
    }));
    document.querySelectorAll(".agent-dashboard-help").forEach((button) => button.addEventListener("click", () => {
      modal(button.dataset.helpTitle, `<div class="agent-dashboard-help-content"><strong>数据属性说明</strong><p>${escapeHtml(button.dataset.helpDescription)}</p></div>`, "我知道了");
    }));
    document.querySelector(".agent-dashboard-guide")?.addEventListener("click", () => modal("代理看板说明", `<div class="agent-dashboard-guide-content"><section><strong>本期佣金预估净收益</strong><p>展示本期预计可结算的佣金净收益，不受日期筛选影响。</p></section><section><strong>佣金余额</strong><p>展示当前余额和历史佣金资产，不受日期筛选影响。</p></section><section><strong>资金流水</strong><p>展示输赢、红利、返水和充提手续费等金额结果，随日期筛选变化。</p></section><section><strong>代理数据</strong><p>展示名下代理规模、新增和活跃情况；累计人数不受日期筛选影响。</p></section><section><strong>会员数据</strong><p>展示当前代理体系下会员规模、活跃、付费、推广和流失情况。</p></section></div>`, "关闭"));
    document.querySelectorAll(".agent-dashboard-detail").forEach((button) => button.addEventListener("click", () => agent498DashboardDetailModal(button.dataset.detailType)));
    document.querySelectorAll(".agent-activity-detail").forEach((button) => button.addEventListener("click", () => modal("活动详情", '<div class="agent-dashboard-guide-content"><section><strong>夏日存款礼遇</strong><p>活动对象：全部会员</p><p>活动时间：2026-07-30 至 2026-08-15</p><p>当前状态：进行中</p></section></div>', "关闭")));
    document.querySelectorAll(".agent-venue-fee-detail").forEach((button) => button.addEventListener("click", () => modal("场馆费用明细", '<div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>场馆名称</th><th>盈亏金额（CNY）</th><th>费用比例</th><th>费用金额（CNY）</th><th>直属承担（CNY）</th><th>级差承担（CNY）</th></tr></thead><tbody><tr><td>FB体育</td><td>86,000</td><td>10%</td><td>8,600</td><td>6,200</td><td>2,400</td></tr><tr><td>PG电子</td><td>24,000</td><td>10%</td><td>2,400</td><td>2,400</td><td>0</td></tr></tbody></table></div>', "关闭")));
    document.querySelector(".agent-level-detail")?.addEventListener("click", () => modal("佣金等级阶梯", `<div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>等级</th><th>新增活跃会员</th><th>活跃会员</th><th>净输赢要求</th><th>佣金比例</th></tr></thead><tbody><tr><td>0星</td><td>0</td><td>1</td><td>0</td><td>20%</td></tr><tr><td>1星</td><td>1</td><td>20</td><td>30,000</td><td>35%</td></tr><tr><td>2星</td><td>3</td><td>50</td><td>80,000</td><td>40%</td></tr></tbody></table></div>`, "关闭"));
    document.querySelectorAll(".agent-member-detail").forEach((button) => button.addEventListener("click", () => {
      const venueRows = [["DW体育", "86,200", "+8,620"], ["PG电子", "32,800", "-1,200"], ["DB真人", "18,600", "-860"], ["FB体育", "12,300", "+420"], ["PA捕鱼", "6,900", "-310"]];
      modal("会员详情", `<section class="agent-member-modal-summary">${[["会员账号", "member_087 · VIP3"], ["状态", "正常"], ["注册时间", "2026-05-12 10:26:30"], ["首存时间", "2026-05-12 10:45:12"], ["中心钱包余额", "12,680"], ["锁定钱包", "2,000"], ["存款", "68,000"], ["提款", "12,500"], ["红利", "1,688"], ["返水", "2,460"], ["总投注", "119,000"], ["有效投注", "116,800"], ["账户调整", "+500"], ["总输赢（会员视角）", "+7,420"]].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</section><div class="agent-modal-range-note">统计范围：今日 2026-08-04 00:00:00 至当前时间</div><section class="agent-member-detail-section annotated" data-component-id="M01">${componentBadge("M01")}<h3>场馆流水记录</h3><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>序号</th><th>场馆名称</th><th>流水（CNY）</th><th>输赢（会员视角）（CNY）</th></tr></thead><tbody>${venueRows.map((row, index) => `<tr><td>${index + 1}</td><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join("")}</tbody></table></div>${pagination(20, venueRows.length)}</section><section class="agent-member-detail-section"><h3>上级代理变更记录</h3><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>变更时间</th><th>变更前代理</th><th>变更后代理</th></tr></thead><tbody><tr><td>2026-06-01 12:20:00</td><td>北区拓展组 / subline_old</td><td>米娜代理 / agent_mina</td></tr><tr><td>2026-05-20 09:18:36</td><td>新客运营组 / starter_agent</td><td>北区拓展组 / subline_old</td></tr></tbody></table></div></section>`, "关闭");
      bindComponentLinks();
    }));
    document.querySelectorAll(".agent-member-more").forEach((button) => button.addEventListener("click", () => {
      const teamMemberView = page.key === "agent-members-498" && agent498ActiveTab(page) === "团队会员";
      modal("更多操作", `<div class="agent-more-actions"><button class="secondary-action" data-open-agent-page="agent-deposits-498">查看存款记录</button><button class="secondary-action" data-open-agent-page="agent-games-498">查看游戏记录</button><button class="secondary-action" data-open-agent-page="agent-bonuses-498">查看红利记录</button><button class="secondary-action agent-edit-tag">${teamMemberView ? "编辑备注" : "编辑代理标签"}</button></div>`, "关闭");
      document.querySelectorAll("[data-open-agent-page]").forEach((action) => action.addEventListener("click", () => { document.querySelector(".modal-close")?.click(); window.location.hash = `#requirement/%23498/page/${action.dataset.openAgentPage}`; }));
      document.querySelector(".agent-edit-tag")?.addEventListener("click", () => modal(teamMemberView ? "编辑备注" : "编辑代理标签", teamMemberView ? '<label class="modal-field"><span>备注</span><textarea placeholder="请输入备注">重点维护</textarea></label>' : '<label class="modal-field"><span>代理标签</span><input type="text" value="高价值" placeholder="请输入标签" /></label>', "保存"));
    }));
    document.querySelectorAll(".agent-team-members").forEach((button) => button.addEventListener("click", () => {
      const rows = Array.from({ length: 10 }, (_, index) => `<tr><td><button type="button" class="link-action">member_${String(87 + index).padStart(3, "0")}</button></td><td>${68_000 - index * 2_300}</td><td>${12_500 - index * 380}</td><td>${index % 2 ? "-" : "+"}${860 + index * 127}</td><td>2026-08-04 ${String(10 - Math.floor(index / 3)).padStart(2, "0")}:${String(58 - index * 4).padStart(2, "0")}:06</td><td>2026-05-${String(12 + index).padStart(2, "0")} 10:26:30</td></tr>`).join("");
      modal("下级会员详情", `<div class="agent-team-member-filters"><label>会员账号<input type="text" placeholder="请输入会员账号" /></label><label>存款金额区间<span><input type="number" placeholder="最低" /><b>至</b><input type="number" placeholder="最高" /></span></label><label>提款金额区间<span><input type="number" placeholder="最低" /><b>至</b><input type="number" placeholder="最高" /></span></label><label>统计时间<input type="text" value="2026-08-04 00:00:00 至 2026-08-04 10:30:00" readonly /></label><button type="button" class="main-action">筛选</button><button type="button" class="secondary-action">重置</button></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>会员账号</th><th>存款（CNY）</th><th>提款（CNY）</th><th>总输赢（CNY）</th><th>最后登录时间</th><th>注册时间</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(10, 86)}`, "关闭");
    }));
    document.querySelectorAll(".agent-team-note").forEach((button) => button.addEventListener("click", () => modal("修改团队备注", '<label class="modal-field">备注内容<textarea placeholder="请输入备注">体育线</textarea></label>', "保存")));
    document.querySelectorAll(".agent-team-report").forEach((button) => button.addEventListener("click", () => {
      const targetPage = button.dataset.report === "财务报表" ? "agent-financial-report-498" : "agent-commission-report-498";
      const targetTab = button.dataset.report === "财务报表" ? "团队财务" : "团队佣金";
      window.location.hash = `#requirement/%23498/page/${targetPage}/menu/${encodeURIComponent(targetTab)}`;
    }));
    document.querySelectorAll("[data-agent-498-subview]").forEach((button) => button.addEventListener("click", () => {
      agent498SubViewState[button.getAttribute("data-agent-498-subview")] = button.getAttribute("data-agent-498-subview-value");
      window.location.hash = `#requirement/%23498/page/${page.key}/menu/${encodeURIComponent(button.getAttribute("data-agent-498-subview-value"))}`;
      render();
    }));
    document.querySelector(".agent-add-withdraw-account")?.addEventListener("click", openAgent498WithdrawAccounts);
    document.querySelectorAll(".agent-balance-unlock").forEach((button) => button.addEventListener("click", () => {
      const key = button.closest("[data-balance-key]")?.dataset.balanceKey;
      modal("安全验证", '<label class="modal-field">支付密码<input type="password" placeholder="输入任意内容演示解锁" /></label>', "确认并显示");
      document.querySelector(".modal-confirm")?.addEventListener("click", () => { if (key) agent498UnlockedBalances.add(key); rerenderAgent498(page.key); });
    }));
    document.querySelectorAll(".agent-balance-hide").forEach((button) => button.addEventListener("click", () => { const key = button.closest("[data-balance-key]")?.dataset.balanceKey; if (key) agent498UnlockedBalances.delete(key); rerenderAgent498(page.key); }));
    document.querySelectorAll(".agent-transaction-submit").forEach((button) => button.addEventListener("click", () => modal("提交确认", '<p class="danger-confirm">请确认账号、金额和钱包类型。<strong>提交后将按最终确认的资金状态规则处理。</strong></p><label class="modal-field">支付密码<input type="password" placeholder="请输入支付密码" /></label>', "确认提交")));
    document.querySelector(".agent-fee-detail")?.addEventListener("click", () => modal("存提手续费详情", `<div class="risk-table-wrap"><table class="risk-table"><thead><tr><th>费用来源</th><th>支付方式</th><th>金额（CNY）</th><th>费率</th><th>手续费（CNY）</th></tr></thead><tbody><tr><td>会员存款</td><td>支付宝</td><td>50,000</td><td>1.2%</td><td>600</td></tr><tr><td>代理额度充值</td><td>USDT</td><td>20,000</td><td>0.8%</td><td>160</td></tr><tr><td>会员提款</td><td>银行卡</td><td>30,000</td><td>1.0%</td><td>300</td></tr></tbody></table></div>`, "关闭"));
    document.querySelector(".agent-overflow-submit")?.addEventListener("click", () => modal("提交溢出申请", '<p>确认提交当前会员的溢出申请？提交后进入总控或站点审核。</p>', "确认提交"));
    document.querySelectorAll("[data-agent-profile-tab]").forEach((button) => button.addEventListener("click", () => { agent498ProfileTab = button.dataset.agentProfileTab; rerenderAgent498(page.key); }));
    document.querySelector(".agent-profile-unlock")?.addEventListener("click", () => {
      modal("解锁账户信息", '<div class="agent-profile-unlock-form"><label>验证方式<select><option>支付密码</option><option>邮箱验证码</option><option>谷歌验证器</option></select></label><label>验证内容<input type="password" placeholder="输入任意内容演示解锁" /></label></div>', "确认并解锁");
      document.querySelector(".modal-confirm")?.addEventListener("click", () => { agent498ProfileUnlocked = true; rerenderAgent498(page.key); });
    });
    document.querySelector(".agent-profile-lock")?.addEventListener("click", () => { agent498ProfileUnlocked = false; rerenderAgent498(page.key); });
    document.querySelectorAll(".agent-profile-setting").forEach((button) => button.addEventListener("click", () => modal(`${button.dataset.profileSetting}设置`, '<label class="modal-field">安全验证<input type="password" placeholder="请输入当前验证信息" /></label>', "下一步")));
    document.querySelector(".agent-profile-save")?.addEventListener("click", () => modal("保存基本资料", "<p>确认保存当前昵称、手机号、性别和出生日期？</p>", "确认保存"));
    document.querySelector(".agent-security-password")?.addEventListener("click", () => modal("修改登录密码", '<div class="agent-profile-form agent-profile-password-form"><label>当前登录密码<input type="password" placeholder="请输入当前密码" /></label><label>新登录密码<input type="password" placeholder="请输入新密码" /></label><label>确认新密码<input type="password" placeholder="请再次输入新密码" /></label></div><p class="modal-help">修改成功后需重新登录。</p>', "确认修改"));
    document.querySelectorAll(".agent-profile-copy").forEach((button) => button.addEventListener("click", () => modal("复制成功", `<p>已复制${button.dataset.copyLabel}。</p>`, "关闭")));
    document.querySelectorAll(".agent-security-action,.agent-security-remove").forEach((button) => button.addEventListener("click", () => modal(button.textContent.trim(), '<label class="modal-field">验证内容<input type="password" placeholder="请输入当前安全验证信息" /></label>', "确认")));
    document.querySelector(".control-quota-add")?.addEventListener("click", () => modal("新增代理配置", '<div class="agent-profile-form"><label>代理账号/编号<input type="text" placeholder="请输入代理账号或编号" /></label><label>单次代存金额（CNY）<input type="number" min="0" value="10000" /></label><label>当日限额（CNY）<input type="number" min="0" value="100000" /></label></div>', "保存"));
    document.querySelectorAll(".control-quota-type-edit").forEach((button) => button.addEventListener("click", () => modal("编辑代理类型额度", `<div class="control-quota-edit-form"><div class="control-quota-context"><span>代理类型</span><strong>${button.dataset.agentType}</strong></div><label>单次代存金额（CNY）<input type="number" min="0" value="${button.dataset.singleLimit}" /></label><label>当日限额（CNY）<input type="number" min="0" value="${button.dataset.dailyLimit}" /></label><label>状态<select><option selected>启用</option><option>停用</option></select></label></div>`, "保存")));
    document.querySelectorAll(".control-quota-account-edit").forEach((button) => button.addEventListener("click", () => modal("编辑代理额度", `<div class="control-quota-edit-form"><div class="control-quota-context"><span>代理账号</span><strong>${button.dataset.agentAccount}</strong><small>${button.dataset.agentNumber} · ${button.dataset.agentType}</small></div><label>单次代存金额（CNY）<input type="number" min="0" value="${button.dataset.singleLimit}" /></label><label>当日限额（CNY）<input type="number" min="0" value="${button.dataset.dailyLimit}" /></label></div>`, "保存")));
    const quotaSelectAll = document.querySelector(".control-quota-select-all");
    const quotaRowSelections = Array.from(document.querySelectorAll(".control-quota-row-select"));
    const quotaBatchRemove = document.querySelector(".control-quota-batch-remove");
    const quotaSelectedCount = document.querySelector(".control-quota-selected-count");
    const syncQuotaSelections = () => {
      const selected = quotaRowSelections.filter((checkbox) => checkbox.checked);
      if (quotaSelectAll) {
        quotaSelectAll.checked = quotaRowSelections.length > 0 && selected.length === quotaRowSelections.length;
        quotaSelectAll.indeterminate = selected.length > 0 && selected.length < quotaRowSelections.length;
      }
      if (quotaBatchRemove) quotaBatchRemove.disabled = selected.length === 0;
      if (quotaSelectedCount) quotaSelectedCount.textContent = `已选 ${selected.length} 条`;
    };
    quotaSelectAll?.addEventListener("change", () => { quotaRowSelections.forEach((checkbox) => { checkbox.checked = quotaSelectAll.checked; }); syncQuotaSelections(); });
    quotaRowSelections.forEach((checkbox) => checkbox.addEventListener("change", syncQuotaSelections));
    document.querySelectorAll(".control-quota-remove").forEach((button) => button.addEventListener("click", () => modal("移出代理配置", `<p>确认移出代理账号【${button.dataset.agentAccount}】的单独配置？移出后立即回退到所属代理类型的默认额度配置。</p>`, "确认移出")));
    quotaBatchRemove?.addEventListener("click", () => {
      const selectedAccounts = quotaRowSelections.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.dataset.agentAccount);
      if (!selectedAccounts.length) return;
      modal("批量移出代理配置", `<p>确认移出已选择的 ${selectedAccounts.length} 个代理账号？</p><div class="control-quota-selected-agents">${selectedAccounts.map((account) => `<span>${account}</span>`).join("")}</div><p>移出后立即回退到各自代理类型的默认额度配置。</p>`, "确认移出");
    });
    document.querySelectorAll(".control-overflow-pass").forEach((button) => button.addEventListener("click", () => modal("通过溢出申请", "<p>确认将该会员归属变更为目标代理？</p>", "确认通过")));
    document.querySelectorAll(".control-overflow-reject").forEach((button) => button.addEventListener("click", () => modal("拒绝溢出申请", '<label class="modal-field">拒绝原因<textarea placeholder="请输入拒绝原因，必填"></textarea></label>', "确认拒绝")));
    document.querySelectorAll(".control-overflow-image").forEach((button) => button.addEventListener("click", () => modal("申请附图", '<div class="agent-overflow-image-placeholder">部长级别以上同意截图</div>', "关闭")));
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
    document.querySelectorAll(".pass-action").forEach((button)=>button.addEventListener("click",()=>modal("通过确认",'<p class="danger-confirm">您现在操作的是<strong>【通过】</strong></p><p>确认后，该提款申请将正式进入财务提款审核列表。</p>',"确认通过")));
    document.querySelectorAll(".reject-action").forEach((button)=>button.addEventListener("click",()=>modal("拒绝提款申请",'<label class="modal-field">拒绝理由<textarea placeholder="请输入拒绝理由，必填"></textarea></label>',"确认拒绝")));
    document.querySelectorAll(".hold-action").forEach((button)=>button.addEventListener("click",()=>modal("挂起提款申请",`<div class="hold-form"><label class="modal-field">挂起原因<select>${riskTags.map(tag=>`<option>${tag}</option>`).join("")}</select></label><label class="modal-field">风控备注<textarea placeholder="请输入风控备注"></textarea></label></div>`,"确认挂起")));
    document.getElementById("skip-risk-withdraw-review")?.addEventListener("change", (event) => {
      skipRiskWithdrawReview = event.target.checked;
      const state = document.querySelector(".withdraw-routing-state");
      if (state) state.textContent = skipRiskWithdrawReview ? "已开启：新订单直接进入财务审核" : "已关闭：新订单先进入风控审核";
    });
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
    bindMember493Behavior(page);
    bindVipOptimizationBehavior(page);
    bindProfitSimulatorBehavior(page);
    bindAgent498Behavior(page);
    document.querySelectorAll(".member-detail-link").forEach((link) => link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = { "withdraw-review": "B04", "hold-review": "B03", "review-history": "B01" }[page.key];
      if (targetId) selectComponent(targetId, "component");
    }));
    document.querySelector(".transaction-search")?.addEventListener("click", () => {
      setTransactionState(true);
    });
    document.querySelectorAll(".balance-detail").forEach((button) => button.addEventListener("click", () => modal("充值提款流水明细", transactionRechargeFlowModalBody(button), "关闭")));
    document.querySelectorAll(".venue-flow-detail").forEach((button) => button.addEventListener("click", () => modal("场馆提款流水明细", venueFlowModalBody(button.dataset.member, button.dataset.site), "关闭")));
    document.querySelectorAll(".recharge-flow-detail").forEach((button) => button.addEventListener("click", () => modal("充值提款流水明细", rechargeFlowModalBody(button.dataset.member, button.dataset.site), "关闭")));
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
    const toolMatch = window.location.hash.match(/^#tool\/([^/]+)$/);
    if (toolMatch) {
      const tool = isLocalPrototype ? localTools.find((item) => item.id === decodeURIComponent(toolMatch[1])) : null;
      if (!tool) { window.location.hash = ""; return; }
      localToolView(tool);
      document.title = `${tool.title} · 本地工具`;
      return;
    }
    const match = window.location.hash.match(/^#requirement\/([^/]+)(?:\/page\/([^/]+))?(?:\/menu\/([^/]+))?$/);
    if (!match) { listView(); document.title = "产品需求原型库"; return; }
    const requestedRequirementId = decodeURIComponent(match[1]);
    const requirement = visibleRequirements().find((item) => item.id === requestedRequirementId);
    if (!requirement) { window.location.hash = ""; return; }
    if (requirement.id === "#498" && match[2] && match[3]) {
      const targetPage = visiblePages(requirement).find((item) => item.key === match[2]);
      const requestedMenu = decodeURIComponent(match[3]);
      if (targetPage?.tabs?.includes(requestedMenu)) agent498SubViewState[targetPage.key] = requestedMenu;
    }
    detailView(requirement, match[2] || requirement.defaultPageKey || visiblePages(requirement)[0].key);
    document.title = `${requirement.title} · 产品需求原型库`;
  }

  window.addEventListener("hashchange", render);
  render();
})();
