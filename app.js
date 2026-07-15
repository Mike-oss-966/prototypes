(function () {
  const app = document.getElementById("app");
  const requirements = window.PROTOTYPE_DATA.requirements;
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function statusClass(status) {
    return { "进行中": "status-progress", "待开始": "status-pending", "已完成": "status-done" }[status] || "";
  }

  function componentBadge(id) {
    return `<span class="component-badge" aria-hidden="true">${id}</span>`;
  }

  function listView() {
    const rows = requirements.map((item) => `
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
        <section class="summary-strip" aria-label="需求概览"><div><span>全部需求</span><strong>01</strong></div><div><span>进行中</span><strong>01</strong></div><div><span>待开始</span><strong>00</strong></div><div><span>本月完成</span><strong>00</strong></div></section>
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
    const summary = annotation.summary ? `<p class="annotation-summary">${summaryText}</p>` : "";
    const rules = [...annotation.rules];
    if (annotation.name.includes("筛选") || annotation.name.includes("输入处理")) rules.push("筛选按钮的可点击面积大于其他按钮一倍，可参考原型");
    if (annotation.type === "数据表格") rules.push("表格仅在内容超出对应可视区域时显示滚动条：横向滚动条高度、纵向滚动条宽度均保持15px；内容可完整显示时对应滚动条隐藏");
    return `<article class="annotation-card" data-spec-id="${annotation.id}" tabindex="0"><div class="annotation-heading"><span class="component-code">${annotation.id}</span><div><h3>${escapeHtml(annotation.name)}</h3></div></div>${summary}<ul>${rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul>${demoControls}</article>`;
  }

  function sidebar(requirement, page) {
    return `<aside class="risk-sidebar"><div class="risk-brand"><span>R</span><div><strong>RiskControl</strong><small>风控工作台</small></div></div><div class="risk-menu-label">风控管理</div><nav>${requirement.pages.map((item) => `<a href="#requirement/${encodeURIComponent(requirement.id)}/page/${item.key}" class="${item.key === page.key ? "active" : ""}"><span class="menu-symbol">${item.key === page.key ? "■" : "□"}</span>${item.name}</a>`).join("")}</nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>风控审核员</small></div></div></aside>`;
  }

  function timeRange(id) {
    const days = Array.from({length: 31}, (_, index) => `<button type="button" class="calendar-day ${index + 1 === 12 ? "selected" : ""}">${index + 1}</button>`).join("");
    return `<div class="risk-field risk-field-wide annotated date-range-field" data-component-id="${id}">${componentBadge(id)}<div class="field-title-row"><label>申请时间</label><div class="quick-ranges"><button type="button">今日</button><button type="button">昨日</button><button type="button">本周</button><button type="button">30天</button><button type="button">90天</button><button type="button">180天</button></div></div><button class="risk-range" type="button" data-date-trigger><span>2026-07-12 00:00:00</span><b>至</b><span>2026-07-12 14:41:00</span></button><div class="date-picker-popover dual-calendar" hidden><div class="calendar-panel"><header><button type="button">‹</button><strong>2026年7月</strong><span></span></header><div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="calendar-days">${days}</div><label class="calendar-time">开始时间<input type="time" value="00:00:00" step="1" /></label></div><div class="calendar-panel"><header><span></span><strong>2026年7月</strong><button type="button">›</button></header><div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="calendar-days">${days}</div><label class="calendar-time">结束时间<input type="time" value="14:41:00" step="1" /></label></div><footer><button type="button" class="secondary-action date-close">取消</button><button type="button" class="main-action date-apply">确定</button></footer></div></div>`;
  }

  function baseFilters(extra = "") {
    return `<div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入订单号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>会员VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP2</option><option>VIP3</option><option>VIP12</option></select></div><div class="risk-field"><label>真实姓名</label><input type="text" placeholder="请输入真实姓名" /></div><div class="risk-field site-field"><label>所属站点</label><input type="text" placeholder="请输入所属站点" autocomplete="off" /><div class="site-options" hidden><button type="button">旺财体育</button><button type="button">新旺体育</button><button type="button">彩虹站</button></div></div>${extra}`;
  }

  function filterActions(exportButton = false) {
    return `<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button>${exportButton ? `<button type="button" class="secondary-action annotated" data-component-id="B01">${componentBadge("B01")}导出表格</button>` : ""}</div>`;
  }

  function pagination(defaultSize = 50, total = 128) {
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
      const memberId = mode === "hold" ? "B03" : "B04";
      const memberAnnotation = index === 1 && (mode === "claim" || mode === "hold") ? ` annotated" data-component-id="${memberId}` : "";
      const showSystemTagAnchor = index === 1 && mode !== "review";
      const systemTagAnnotation = showSystemTagAnchor ? ` annotated" data-component-id="S02` : "";
      const systemResult = mode === "hold" ? `<td class="pending-system-cell${index === 1 ? ' annotated" data-component-id="S03' : ""}">${index === 1 ? componentBadge("S03") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td>` : "";
      return `<tr><td class="sticky-order"><strong class="mono">WD20260712000${index}</strong></td><td class="sticky-member${memberAnnotation}">${index === 1 && (mode === "claim" || mode === "hold") ? componentBadge(memberId) : ""}<a class="member-detail-link" href="javascript:void(0)" title="将在新Tab打开会员详情">${member}</a></td><td>VIP${5 + index}</td><td>旺财体育</td><td>agent_087</td><td>A10386</td><td>陈小明</td><td>6222123456783890</td><td><strong class="amount">¥ ${money(index * 2680)}</strong></td><td>2026-07-12<br />${10 + index}:2${index}:36</td><td><strong class="amount">¥ ${money(1000)}</strong></td><td class="pending-system-cell${systemTagAnnotation}">${showSystemTagAnchor ? componentBadge("S02") : ""}${questionMark("后续将提供完整标签和风控识别体系，此版本暂时留空")}</td>${mode !== "claim" ? `<td>mike.risk</td>` : ""}${systemResult}${mode === "hold" ? `<td><div class="stack-cell"><strong class="hold-time">2026-07-12 12:30:05</strong><span><i>挂起人：</i><b>mike.risk</b></span><span><i>挂起原因：</i><em class="data-tag">${riskTags[index]}</em></span></div></td>` : ""}<td class="row-actions sticky-action${anchor}">${badge}${actions}</td></tr>`;
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
    return `<div class="risk-page-heading"><div><h1>风控提款审核记录</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid">${baseFilters(extras)}${timeRange("F02")}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>审核记录</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table history-table"><thead><tr><th class="sticky-order">订单号</th><th class="sticky-member">会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>真实姓名</th><th>提款账户</th><th>提款金额</th><th>申请时间</th><th>系统标签</th><th>系统审核结果</th><th>挂起信息</th><th>审核人</th><th>审核时间</th><th>处理用时</th><th>出款状态</th><th>审核结果</th><th>风控备注</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(200)}</section>`;
  }

  function monitorRows(history = false) {
    return [1, 2, 3].map((index) => `<tr><td><input type="checkbox" aria-label="选择监控${index}" /></td><td class="sticky-monitor-order"><strong class="mono">MN2026071200${index}</strong></td><td class="sticky-monitor-member${index === 1 ? ' annotated" data-component-id="B03' : ""}">${index === 1 ? componentBadge("B03") : ""}<a class="member-detail-link" href="javascript:void(0)">${index === 1 ? "evan888" : "dengji000"}</a></td><td>VIP${5 + index}</td><td>旺财体育</td><td>agent_087</td><td>A10386</td><td><div class="stack-cell"><strong>PG电子</strong><span>麻将胡了</span><span><i>下分时间：</i><b>2026-07-12 14:2${index}:00</b></span></div></td><td><span class="sync-state ${index === 2 ? "pending" : ""}">${index === 2 ? "未同步" : "已同步"}</span></td><td>${8 + index * 3} 分钟</td><td>${2 + index} 次</td>${history ? `<td>${index === 1 ? "系统自动拒绝" : index === 2 ? "人工拒绝" : "人工完结"}</td><td>${index === 1 ? "系统" : "mike.risk"}</td><td>2026-07-12 14:2${index}:30</td>` : `<td class="row-actions${index === 1 ? ' annotated" data-component-id="B02' : ""}">${index === 1 ? componentBadge("B02") : ""}<button class="link-action redetect-action">重新检测</button><button class="link-action ignore-action">拒绝</button><button class="link-action finish-action">已完结</button></td>`}</tr>`).join("");
  }

  function monitorContent() {
    return `<div class="risk-page-heading"><div><h1>提款监控</h1></div></div><div class="inner-tabs annotated" data-component-id="N01">${componentBadge("N01")}<button class="active monitor-tab" data-monitor-tab="pending">结算监控审核</button><button class="monitor-tab" data-monitor-tab="history">审核历史</button></div><div id="monitor-view"></div>`;
  }

  function monitorView(history) {
    const monitorTime = timeRange("F02").replace("申请时间", "监控成立时间");
    const siteField = `<div class="risk-field site-field"><label>所属站点</label><input type="text" placeholder="请输入所属站点" autocomplete="off" /><div class="site-options" hidden><button type="button">旺财体育</button><button type="button">新旺体育</button><button type="button">彩虹站</button></div></div>`;
    const filters = `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid monitor-filters"><div class="risk-field"><label>会员账号</label><input placeholder="请输入会员账号" /></div><div class="risk-field"><label>真实姓名</label><input placeholder="请输入真实姓名" /></div><div class="risk-field"><label>会员VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP12</option></select></div>${siteField}${monitorTime}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action reset-action">重置</button></div></div></section>`;
    const toolbar = history ? "" : `<div class="monitor-toolbar"><button class="secondary-action annotated" data-component-id="B01" disabled>${componentBadge("B01")}批量拒绝</button><label class="switch-row annotated" data-component-id="S01">${componentBadge("S01")}<input type="checkbox" id="auto-ignore" /><span class="switch-track"></span><b>自动拒绝</b></label><button class="secondary-action annotated config-action" data-component-id="M01">${componentBadge("M01")}流水审核配置</button></div>`;
    const extraHeaders = history ? "<th>审核记录</th><th>审核人</th><th>审核时间</th>" : "";
    const operationHeader = history ? "" : "<th>操作</th>";
    const table = `<div class="risk-table-wrap"><table class="risk-table monitor-table"><thead><tr><th><input type="checkbox" aria-label="全选" /></th><th class="sticky-monitor-order">监控订单号</th><th class="sticky-monitor-member">会员账号</th><th>会员等级</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>最后一次场馆信息</th><th>投注记录同步状态</th><th>停留时长</th><th>提现刷新次数</th>${extraHeaders}${operationHeader}</tr></thead><tbody>${monitorRows(history)}</tbody></table></div>${pagination(50, 3)}`;
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
    return `<div class="risk-table-wrap"><table class="risk-table login-log-table"><thead><tr><th><input type="checkbox" aria-label="全选登录日志" /></th>${sortHeader("会员账号", "member", "sticky-login-member")}<th>会员等级</th><th>风控标签</th><th>所属站点</th><th>上级代理</th><th>上级代理编号</th><th>登录设备</th>${sortHeader("设备号", "device")}<th>版本号</th><th>登录时间</th>${sortHeader("登录IP", "loginIp")}${sortHeader("注册IP", "registerIp")}<th>登录地址</th><th>登录域名</th></tr></thead><tbody>${loginLogRows()}</tbody></table></div>${pagination(200, 20)}`;
  }

  function memberLoginContent() {
    const loginTime = timeRange("F02").replace("<label>申请时间</label>", "<label>登录时间</label>");
    const siteField = `<div class="risk-field site-field"><label>所属站点</label><input type="text" placeholder="请输入所属站点" autocomplete="off" /><div class="site-options" hidden><button type="button">旺财体育</button><button type="button">新旺体育</button><button type="button">彩虹站</button></div></div>`;
    return `<div class="risk-page-heading"><div><h1>会员登录日志</h1></div></div>
      <section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid login-filter-grid"><div class="risk-field"><label>设备号</label><input type="text" placeholder="请输入设备号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div>${siteField}<div class="risk-field"><label>上级代理</label><input type="text" placeholder="请输入上级代理" /></div><div class="risk-field"><label>上级代理编号</label><input type="text" placeholder="请输入代理编号" /></div><div class="risk-field ip-filter-field"><label>登录IP</label><input type="text" placeholder="例如 103.27.14.86" inputmode="decimal" /><span class="field-error" hidden>请输入正确的IPv4地址</span></div><div class="risk-field region-field"><label>登录地址</label><div class="region-selects"><select aria-label="省份"><option>全部省份</option><option>上海市</option><option>广东省</option></select><select aria-label="城市"><option>全部城市</option><option>上海市</option><option>深圳市</option></select></div></div><div class="risk-field"><label>登录设备</label><input type="text" placeholder="请输入操作系统或设备" /></div><div class="risk-field"><label>版本号</label><select><option>全部版本</option><option>0712</option><option>0719</option></select></div>${loginTime}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter login-filter-action">筛选</button><button type="button" class="secondary-action reset-action">重置</button><button type="button" class="secondary-action export-action">导出表格</button></div></div></section>
      <div class="login-toolbar"><button type="button" class="secondary-action annotated login-batch-device" data-component-id="B01" disabled>${componentBadge("B01")}批量拉黑设备</button><button type="button" class="secondary-action annotated login-batch-ip" data-component-id="B02" disabled>${componentBadge("B02")}批量拉黑IP</button><button type="button" class="secondary-action annotated login-dedup-action" data-component-id="B03">${componentBadge("B03")}数据去重</button></div>
      <section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员登录日志</h2>${loginState.searched ? `<span>共 20 条</span>` : ""}</div></div><div id="login-results">${loginResults()}</div></section>`;
  }

  function transactionQueryContent() {
    const rows = [1, 2, 3].map((index) => { const balance = index === 1 ? 0 : index * 1500; const met = balance === 0; const annotation = index === 1 ? ` annotated" data-component-id="B01` : ""; const statusAnnotation = index === 1 ? ` annotated" data-component-id="S02` : ""; return `<tr><td class="sticky-transaction-member">${memberCell(index === 2 ? "evan888" : "dengji000")}</td><td class="sticky-transaction-agent">${agentCell()}</td><td>${dateTimeCell("2026-07-1${3 - index}",`0${8 + index}:20:00`)}</td><td><strong class="amount">¥ ${money(index * 1000)}</strong></td><td>${index === 1 ? "银行卡存款" : "数字货币存款"}</td><td>${index + 1} 倍</td><td><strong class="amount">¥ ${money(index * 3000)}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 3000 : 1800))}</strong></td><td><strong class="amount">¥ ${money(index * 200)}</strong></td><td>${index === 1 ? "存款红利" : "活动红利"}</td><td>${index + 2} 倍</td><td><strong class="amount">¥ ${money(index * 800)}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 800 : 500))}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 3800 : 2300))}</strong></td><td><button type="button" class="balance-detail link-action${annotation}">${index === 1 ? componentBadge("B01") : ""}<strong class="amount">¥ ${money(balance)}</strong></button></td><td class="${statusAnnotation}">${index === 1 ? componentBadge("S02") : ""}<span class="result-tag ${met ? "approved" : "rejected"}">${met ? "已达标" : "未达标"}</span></td><td>${dateTimeCell("2026-07-12",`14:3${index}:00`)}</td></tr>`; }).join("");
    const siteField = `<div class="risk-field site-field"><label>所属站点</label><input type="text" placeholder="请输入所属站点" autocomplete="off" /><div class="site-options" hidden><button type="button">旺财体育</button><button type="button">新旺体育</button><button type="button">彩虹站</button></div></div>`;
    return `<div class="transaction-page"><div class="transaction-confirm-overlay"><div><strong>待提现流水算法和页面确认</strong><button type="button" class="main-action transaction-overlay-view">查看</button></div></div><div class="risk-page-heading"><div><h1>流水查询</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid transaction-filter-grid"><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div>${siteField}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter transaction-search">筛选</button><button type="button" class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员流水任务</h2><span class="transaction-count" ${transactionState.searched ? "" : "hidden"}>共 3 条</span></div></div><div class="search-empty-state transaction-empty" ${transactionState.searched ? "hidden" : ""}><strong>请先设置筛选条件并点击筛选</strong><span>未搜索前，数据表不显示任何数据</span></div><div class="transaction-results" ${transactionState.searched ? "" : "hidden"}><div class="risk-table-wrap"><table class="risk-table transaction-table"><thead><tr><th class="sticky-transaction-member">会员信息</th><th class="sticky-transaction-agent">上级代理</th><th>存款时间</th><th>存款金额</th><th>存款类型</th><th>存款流水倍数</th><th>存款要求流水</th><th>存款完成流水</th><th>红利金额</th><th>红利类型</th><th>红利流水倍数</th><th>红利要求流水</th><th>红利完成流水</th><th>总完成流水</th><th>流水结余</th><th>达标情况</th><th>流水同步时间</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination()}</div></section></div>`;
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
    return `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid blacklist-filter-grid">${filters}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>${isIp ? "IP黑名单" : "设备黑名单"}</h2><span>共 3 条</span></div></div><div class="risk-table-wrap"><table class="risk-table blacklist-table"><thead><tr>${headers}</tr></thead><tbody>${blacklistRows(type)}</tbody></table></div>${pagination(50, 3)}</section>`;
  }

  function riskListLibraryContent(page) {
    return `<div class="risk-page-heading"><div><h1>风控名单库</h1></div></div><div class="inner-tabs annotated blacklist-tabs" data-component-id="N01">${componentBadge("N01")}${page.tabs.map((tab) => { const type = tab === "设备黑名单" ? "device" : tab === "IP黑名单" ? "ip" : "legacy"; return `<button type="button" class="blacklist-tab ${type === "device" ? "active" : ""}" data-blacklist-type="${type}">${tab}</button>`; }).join("")}</div><div id="blacklist-view">${blacklistView("device")}</div>`;
  }

  function tabPlaceholderContent(page) {
    return `<div class="risk-page-heading"><div><p>风控管理</p><h1>${page.name}</h1></div></div><div class="inner-tabs annotated" data-component-id="N01">${componentBadge("N01")}${page.tabs.map((tab,index)=>`<button class="${index===0?"active":""}">${tab}</button>`).join("")}</div><section class="reserved-area"><div><strong>保持原功能布局不变即可，本原型只做合并形式展示。</strong></div></section>`;
  }

  function emptyPageContent(page) {
    return `<div class="risk-page-heading"><div><p>风控管理</p><h1>${page.name}</h1></div></div><section class="reserved-area annotated" data-component-id="P01">${componentBadge("P01")}<div><strong>页面暂时留白</strong><span>已保留菜单入口，不在需求未明确前虚构字段和交互。</span></div></section>`;
  }

  function pageContent(page) {
    if (page.key === "withdraw-review") return withdrawReviewContent();
    if (page.key === "hold-review") return holdReviewContent();
    if (page.key === "review-history") return historyContent();
    if (page.key === "withdraw-monitor") return monitorContent();
    if (page.key === "member-login-log") return memberLoginContent();
    if (page.key === "transaction-query") return transactionQueryContent();
    if (page.key === "risk-list-library") return riskListLibraryContent(page);
    if (page.tabs) return tabPlaceholderContent(page);
    return emptyPageContent(page);
  }

  function questionsBlock(page) {
    if (!page.questions?.length) return "";
    return `<section class="questions-block"><div class="questions-title"><span>?</span><div><strong>待确认事项</strong><small>${page.questions.length} 项</small></div></div><ol>${page.questions.map((question)=>`<li>${escapeHtml(question)}</li>`).join("")}</ol></section>`;
  }

  function addTopPaginators() {
    document.querySelectorAll(".risk-list-card").forEach((card) => {
      const bottom = card.querySelector(".full-pagination");
      const selectedSize = bottom?.querySelector("select option:checked")?.textContent;
      const tableWrap = card.querySelector(".risk-table-wrap");
      if (selectedSize !== "200条/页" || !tableWrap || card.querySelector(".full-pagination.top-pagination")) return;
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
    const page = requirement.pages.find((item) => item.key === requestedPageKey) || requirement.pages[0];
    if (page.key !== requestedPageKey) window.history.replaceState(null, "", `#requirement/${requirement.id}/page/${page.key}`);
    if (page.key === "member-login-log") loginState.searched = false;
    if (page.key === "transaction-query") transactionState.searched = false;
    const pageLogic = page.logic ? `<section class="logic-note"><span>逻辑说明</span><p>${escapeHtml(page.logic)}</p></section>` : "";
    const extraNotice = page.extraNotice ? `<section class="critical-note"><span>额外功能</span><p>${escapeHtml(page.extraNotice)}</p></section>` : "";
    app.innerHTML = `<main class="detail-shell"><section class="prototype-pane" aria-label="高保真原型展示区"><header class="prototype-context"><div><span class="prototype-mark">PROTOTYPE</span><strong>${requirement.id}</strong><span>${requirement.title}</span></div><nav aria-label="当前原型页面"><span class="current-page-label">${page.name}</span></nav></header><div class="prototype-canvas"><div class="risk-app">${sidebar(requirement,page)}<section class="risk-main"><header class="risk-topbar"><div><span>风控管理 /</span><strong>${page.name}</strong></div><div><span class="environment-tag">产品原型</span><strong>Mike</strong></div></header><div class="risk-content">${pageContent(page)}</div></section></div></div></section><aside class="spec-pane" aria-label="说明区"><div class="spec-sticky-header"><a class="back-link" href="#"><span>←</span> 返回需求列表</a><div class="spec-meta-line"><strong>开发说明</strong><span>角色：${page.role}</span><span>页面：${page.id}</span></div><div class="spec-title-row"><div><h2>${page.name}</h2></div><span class="version">V1.0</span></div></div><div class="spec-scroll">${questionsBlock(page)}<section class="page-note"><span>页面目标</span><p>${page.purpose}</p>${page.flow ? `<span>主流程</span><p>${page.flow}</p>` : ""}</section>${pageLogic}${extraNotice}<div class="spec-section-heading"><h2>组件说明</h2><span>${page.annotations.length} 项</span></div><div class="annotation-list">${page.annotations.map(annotationCard).join("")}</div></div></aside></main><div id="modal-root"></div>`;
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

  function modal(title, body, actionText = "确认") {
    const root = document.getElementById("modal-root");
    const footer = actionText === "关闭" ? `<footer><button class="main-action modal-confirm">关闭</button></footer>` : `<footer><button class="secondary-action modal-cancel">取消</button><button class="main-action modal-confirm">${actionText}</button></footer>`;
    root.innerHTML = `<div class="modal-backdrop"><section class="risk-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">${title}</h2><button class="modal-close" aria-label="关闭">×</button></header><div class="modal-body">${body}</div>${footer}</section></div>`;
    root.querySelectorAll(".modal-close,.modal-cancel,.modal-confirm").forEach((button)=>button.addEventListener("click",()=>{root.innerHTML="";}));
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
    document.querySelectorAll(".date-apply").forEach((button) => { if (button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { const popover = button.closest(".date-picker-popover"); const panels = Array.from(popover.querySelectorAll(".calendar-panel")); const values = panels.map((panel) => { const day = String(panel.querySelector(".calendar-day.selected")?.textContent || "12").padStart(2, "0"); const time = panel.querySelector("input[type='time']").value; return `2026-07-${day} ${time}`; }); const range = popover.parentElement.querySelector(".risk-range"); range.innerHTML = `<span>${values[0]}</span><b>至</b><span>${values[1]}</span>`; popover.hidden = true; }); });
    document.querySelectorAll(".quick-ranges button").forEach((button) => { if (button.dataset.dateBound) return; button.dataset.dateBound = "true"; button.addEventListener("click", () => { const range = button.closest(".date-range-field").querySelector(".risk-range"); range.classList.add("range-selected"); }); });
  }

  function bindSiteAutocomplete() {
    document.querySelectorAll(".site-field").forEach((field) => { const input = field.querySelector("input"); const options = field.querySelector(".site-options"); const items = Array.from(options.querySelectorAll("button")); const show = () => { const query = input.value.trim(); items.forEach((item) => { item.hidden = Boolean(query) && !item.textContent.includes(query); }); options.hidden = false; }; input.addEventListener("focus", show); input.addEventListener("input", show); items.forEach((item) => item.addEventListener("click", () => { input.value = item.textContent; options.hidden = true; })); input.addEventListener("blur", () => window.setTimeout(() => { options.hidden = true; input.value = input.value.trim(); }, 150)); });
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
    document.querySelectorAll(".inner-tabs:not(:has(.monitor-tab)):not(:has(.blacklist-tab)) button").forEach((button)=>button.addEventListener("click",()=>{button.parentElement.querySelectorAll("button").forEach(item=>item.classList.remove("active"));button.classList.add("active");}));
    bindSiteAutocomplete();
    bindLoginLogBehavior();
    bindBlacklistBehavior();
    document.querySelectorAll(".member-detail-link").forEach((link) => link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = { "withdraw-review": "B04", "hold-review": "B03", "review-history": "B01" }[page.key];
      if (targetId) selectComponent(targetId, "component");
    }));
    document.querySelector(".transaction-search")?.addEventListener("click", () => {
      setTransactionState(true);
    });
    document.querySelectorAll(".balance-detail").forEach((button) => button.addEventListener("click", () => selectComponent("B01", "component")));
    document.querySelector(".transaction-overlay-view")?.addEventListener("click", (event) => event.currentTarget.closest(".transaction-confirm-overlay")?.remove());
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
    const requirement = requirements.find((item) => item.id === decodeURIComponent(match[1]));
    if (!requirement) { window.location.hash = ""; return; }
    detailView(requirement, match[2] || requirement.pages[0].key);
    document.title = `${requirement.title} · 产品需求原型库`;
  }

  window.addEventListener("hashchange", render);
  render();
})();
