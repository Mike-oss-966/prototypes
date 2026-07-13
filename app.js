(function () {
  const app = document.getElementById("app");
  const requirements = window.PROTOTYPE_DATA.requirements;
  const riskTags = ["高盈利会员", "职业玩家", "对冲套利风险", "羊毛党用户", "多账号关联", "异常投注用户"];

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

    app.querySelectorAll(".requirement-row").forEach((row) => {
      const open = () => { window.location.hash = `requirement/${row.dataset.requirementId}`; };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
    });
  }

  function annotationCard(annotation) {
    const demoControls = annotation.name === "列表状态切换" ? `<div class="spec-demo-controls"><label><input type="checkbox" checked id="spec-claim-toggle" /><span>展示待领取数据</span></label><label><input type="checkbox" checked id="spec-review-toggle" /><span>展示待审核数据</span></label></div>` : "";
    let summaryText = escapeHtml(annotation.summary);
    annotation.summaryHighlights?.forEach((term) => { summaryText = summaryText.replaceAll(escapeHtml(term), `<strong class="summary-danger">${escapeHtml(term)}</strong>`); });
    const summary = annotation.summary ? `<p class="annotation-summary">${summaryText}</p>` : "";
    const rules = [...annotation.rules];
    if (annotation.name.includes("筛选") || annotation.name.includes("输入处理")) rules.push("筛选按钮的可点击面积大于其他按钮一倍，可参考原型");
    if (annotation.type === "数据表格") rules.push("表格仅在内容超出对应可视区域时显示滚动条：横向滚动条高度、纵向滚动条宽度均保持15px；内容可完整显示时对应滚动条隐藏");
    return `<article class="annotation-card" data-spec-id="${annotation.id}" tabindex="0"><div class="annotation-heading"><span class="component-code">${annotation.id}</span><div><h3>${escapeHtml(annotation.name)}</h3></div></div>${summary}<ul>${rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul>${demoControls}</article>`;
  }

  function sidebar(requirement, page) {
    return `<aside class="risk-sidebar"><div class="risk-brand"><span>R</span><div><strong>RiskControl</strong><small>风控工作台</small></div></div><div class="risk-menu-label">风控管理</div><nav>${requirement.pages.map((item) => `<a href="#requirement/${requirement.id}/page/${item.key}" class="${item.key === page.key ? "active" : ""}"><span class="menu-symbol">${item.key === page.key ? "■" : "□"}</span>${item.name}</a>`).join("")}</nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>风控审核员</small></div></div></aside>`;
  }

  function timeRange(id) {
    const days = Array.from({length: 31}, (_, index) => `<button type="button" class="calendar-day ${index + 1 === 12 ? "selected" : ""}">${index + 1}</button>`).join("");
    return `<div class="risk-field risk-field-wide annotated date-range-field" data-component-id="${id}">${componentBadge(id)}<div class="field-title-row"><label>申请时间</label><div class="quick-ranges"><button type="button">今日</button><button type="button">昨日</button><button type="button">本周</button><button type="button">30天</button><button type="button">90天</button><button type="button">180天</button></div></div><button class="risk-range" type="button" data-date-trigger><span>2026-07-12 00:00:00</span><b>至</b><span>2026-07-12 14:41:00</span></button><div class="date-picker-popover dual-calendar" hidden><div class="calendar-panel"><header><button type="button">‹</button><strong>2026年7月</strong><span></span></header><div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="calendar-days">${days}</div><label class="calendar-time">开始时间<input type="time" value="00:00:00" step="1" /></label></div><div class="calendar-panel"><header><span></span><strong>2026年7月</strong><button type="button">›</button></header><div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="calendar-days">${days}</div><label class="calendar-time">结束时间<input type="time" value="14:41:00" step="1" /></label></div><footer><button type="button" class="secondary-action date-close">取消</button><button type="button" class="main-action date-apply">确定</button></footer></div></div>`;
  }

  function baseFilters(extra = "") {
    return `<div class="risk-field"><label>订单号</label><input type="text" placeholder="请输入订单号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>会员VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP2</option><option>VIP3</option><option>VIP12</option></select></div><div class="risk-field"><label>真实姓名</label><input type="text" placeholder="请输入真实姓名" /></div><div class="risk-field annotated site-field" data-component-id="F01">${componentBadge("F01")}<label>所属站点</label><input type="text" placeholder="请输入所属站点" autocomplete="off" /><div class="site-options" hidden><button type="button">旺财体育</button><button type="button">新旺体育</button><button type="button">彩虹站</button></div></div>${extra}`;
  }

  function filterActions(exportButton = false) {
    return `<div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button>${exportButton ? `<button type="button" class="secondary-action annotated" data-component-id="B01">${componentBadge("B01")}导出表格</button>` : ""}</div>`;
  }

  function pagination(defaultSize = 50) {
    return `<div class="full-pagination"><span>共 128 条</span><select aria-label="每页数量"><option ${defaultSize===10?"selected":""}>10条/页</option><option ${defaultSize===20?"selected":""}>20条/页</option><option ${defaultSize===50?"selected":""}>50条/页</option><option ${defaultSize===100?"selected":""}>100条/页</option><option ${defaultSize===200?"selected":""}>200条/页</option></select><button type="button" aria-label="上一页">‹</button><button type="button" class="active">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="下一页">›</button><label>前往 <input type="number" min="1" value="1" /> 页</label></div>`;
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
      const actions = mode === "claim" ? `<button class="link-action claim-action" type="button">领取</button>` : mode === "hold" ? `<button class="link-action detail-action" type="button">详情</button><button class="link-action pass-action" type="button">通过</button><button class="link-action reject-action" type="button">拒绝</button>` : `<button class="link-action detail-action" type="button">详情</button><button class="link-action pass-action" type="button">通过</button><button class="link-action reject-action" type="button">拒绝</button><button class="link-action hold-action" type="button">挂起</button>`;
      return `<tr><td><strong class="mono">WD20260712000${index}</strong></td><td>${memberCell(index === 2 ? "evan888" : "dengji000")}</td><td>${agentCell()}</td><td>${accountCell()}</td><td><strong class="amount">¥ ${money(index * 2680)}</strong></td><td>2026-07-12<br />${10 + index}:2${index}:36</td><td><strong class="amount">¥ ${money(1000)}</strong></td><td><span class="data-tag">${riskTags[index - 1]}</span></td>${mode !== "claim" ? `<td>mike.risk</td>` : ""}${mode === "hold" ? `<td><span class="data-tag">待确认</span></td><td><div class="stack-cell"><strong class="hold-time">2026-07-12 12:30:05</strong><span><i>挂起人：</i><b>mike.risk</b></span><span><i>挂起原因：</i><em class="data-tag">${riskTags[index]}</em></span></div></td>` : ""}<td class="row-actions${anchor}">${badge}${actions}</td></tr>`;
    }).join("");
  }

  function commonReviewHeaders(mode) {
    return `<th>订单号</th><th>会员信息</th><th>上级代理</th><th>提款账户</th><th>提款金额</th><th>申请时间</th><th>上笔存款金额</th><th>系统标签</th>${mode !== "claim" ? "<th>领取人</th>" : ""}${mode === "hold" ? `<th>系统审核结果 ${questionMark("系统审核结果的数据来源？")}</th><th>挂起信息</th>` : ""}<th>操作</th>`;
  }

  function withdrawReviewContent() {
    return `<div class="risk-page-heading"><div><h1>风控提款审核</h1></div><span class="page-status">公共池实时更新</span></div>
      <section class="risk-filter-panel"><div class="risk-filter-grid">${baseFilters()}${timeRange("F02")}${filterActions()}</div></section>
      <section class="risk-list-card annotated" data-component-id="T01"><div class="risk-list-heading"><div><h2>待领取</h2><span>公共池 · 3 条待处理</span></div><button type="button" class="collapse-button">收起列表</button></div>${componentBadge("T01")}<div id="claim-list-content"><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("claim")}</tr></thead><tbody>${reviewRows("claim")}</tbody></table></div>${pagination()}</div><div class="empty-state" id="claim-empty" hidden><strong>无待领取申请</strong><span>当前公共池暂无需要领取的提款申请</span></div></section>
      <section class="risk-list-card annotated" data-component-id="T02"><div class="risk-list-heading"><div><h2>待审核</h2><span>当前账号已领取 · 3 条</span></div></div>${componentBadge("T02")}<div id="review-list-content"><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("review")}</tr></thead><tbody>${reviewRows("review")}</tbody></table></div>${pagination()}</div><div class="empty-state" id="review-empty" hidden><strong>无待审核申请</strong><span>当前账号暂无已领取的待审核提款申请</span><a href="#requirement/0712/page/review-history" class="secondary-action empty-history-link">查看审核历史</a></div></section>`;
  }

  function holdReviewContent() {
    const extras = `<div class="risk-field"><label>挂起原因</label><select><option>全部原因</option>${riskTags.map((tag) => `<option>${tag}</option>`).join("")}</select></div><div class="risk-field"><label>挂起人</label><select><option>全部操作人</option><option>mike.risk</option><option>risk_amy</option></select></div>`;
    return `<div class="risk-page-heading"><div><h1>风控提款挂起审核</h1></div></div><section class="risk-filter-panel"><div class="risk-filter-grid">${baseFilters(extras)}${timeRange("F02")}${filterActions(true)}</div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>挂起审核列表</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table"><thead><tr>${commonReviewHeaders("hold")}</tr></thead><tbody>${reviewRows("hold")}</tbody></table></div>${pagination()}</section>`;
  }

  function historyContent() {
    const extras = `<div class="risk-field"><label>审核状态</label><select><option>全部</option><option>通过</option><option>拒绝</option></select></div><div class="risk-field"><label>出款状态</label><select><option>全部</option><option>已出款</option><option>待财务审核</option></select></div><div class="risk-field"><label>挂起</label><select><option>全部</option><option>无</option><option>有挂起</option></select></div><div class="risk-field"><label>审核人</label><select><option>全部审核员</option><option>mike.risk</option></select></div>`;
    const rows = [1,2,3].map((i)=>`<tr><td><strong class="mono">WD2026071100${i}</strong></td><td>${memberCell()}</td><td>${agentCell()}</td><td>${accountCell()}</td><td><strong class="amount">¥ ${money(i*1200)}</strong></td><td>${dateTimeCell("2026-07-11",`10:2${i}:30`)}</td><td><span class="data-tag">待确认</span></td><td>${i===2 ? `${dateTimeCell("2026-07-11","10:30:00")}<div class="stack-cell"><span><i>挂起人：</i><b>mike.risk</b></span><span><em class="data-tag">对冲套利风险</em></span></div>` : "—"}</td><td>mike.risk</td><td>${dateTimeCell("2026-07-11",`10:4${i}:18`)}</td><td>${12+i} 分钟</td><td><span class="data-tag ${i===1?"tag-green":"tag-amber"}">${i===1?"已出款":"待财务审核"}</span></td><td><span class="result-tag ${i===3?"rejected":"approved"}">${i===3?"拒绝：账户异常":"通过"}</span></td><td>—</td></tr>`).join("");
    return `<div class="risk-page-heading"><div><h1>风控提款审核记录</h1></div></div><section class="risk-filter-panel"><div class="risk-filter-grid">${baseFilters(extras)}${timeRange("F02")}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>审核记录</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table history-table"><thead><tr><th>订单号</th><th>会员信息</th><th>上级代理</th><th>提款账户</th><th>提款金额</th><th>申请时间</th><th>系统审核结果</th><th>挂起信息</th><th>审核人</th><th>审核时间</th><th>处理用时</th><th>出款状态</th><th>审核结果</th><th>风控备注</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination(200)}</section>`;
  }

  function monitorRows(history = false) {
    return [1,2,3].map((i)=>{const anchor=!history&&i===1?' annotated" data-component-id="B02':'';return `<tr><td><input type="checkbox" aria-label="选择监控${i}" /></td><td><strong class="mono">MN2026071200${i}</strong></td><td>${memberCell(i===1?"evan888":"dengji000")}</td><td>${agentCell()}</td><td><div class="stack-cell"><strong>PG电子</strong><span>麻将胡了</span><span><i>下分时间：</i><b>2026-07-12 14:2${i}:00</b></span></div></td><td><span class="sync-state ${i===2?"pending":""}">${i===2?"未同步":"已同步"}</span></td><td>${8+i*3} 分钟</td><td>${2+i} 次</td><td>${i===1?"1分钟内":i===2?"38分钟":"1小时15分钟"}</td>${history?`<td>${i===1?"系统自动忽略":i===2?"人工忽略":"人工完结"}</td><td>${i===1?"系统":"mike.risk"}</td><td>2026-07-12 14:2${i}:30</td>`:""}<td class="row-actions${anchor}">${!history&&i===1?componentBadge("B02"):""}${history?"":'<button class="link-action detail-action">详情</button><button class="link-action redetect-action">重新检测</button><button class="link-action ignore-action">忽略</button><button class="link-action sync-action">人工同步</button><button class="link-action finish-action">已完结</button>'}</td></tr>`;}).join("");
  }

  function monitorContent() {
    return `<div class="risk-page-heading"><div><h1>提款监控</h1></div></div><div class="inner-tabs annotated" data-component-id="N01">${componentBadge("N01")}<button class="active monitor-tab" data-monitor-tab="pending">结算监控审核</button><button class="monitor-tab" data-monitor-tab="history">审核历史</button></div><div id="monitor-view"></div>`;
  }

  function monitorView(history) {
    const filters = `<section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid monitor-filters"><div class="risk-field"><label>会员账号</label><input placeholder="请输入会员账号" /></div><div class="risk-field"><label>真实姓名</label><input placeholder="请输入真实姓名" /></div><div class="risk-field"><label>会员VIP等级</label><select><option>全部等级</option><option>VIP1</option><option>VIP12</option></select></div>${timeRange("F02")}<div class="risk-filter-actions"><button class="main-action primary-filter">筛选</button><button class="secondary-action">重置</button></div></div></section>`;
    const toolbar = history ? "" : `<div class="monitor-toolbar"><button class="secondary-action annotated" data-component-id="B01" disabled>${componentBadge("B01")}批量忽略</button><label class="switch-row annotated" data-component-id="S01">${componentBadge("S01")}<input type="checkbox" id="auto-ignore" /><span class="switch-track"></span><b>自动忽略</b></label><button class="secondary-action annotated config-action" data-component-id="M01">${componentBadge("M01")}流水审核配置</button></div>`;
    const extraHeaders = history ? "<th>审核记录</th><th>审核人</th><th>审核时间</th>" : "";
    const operationHeader = history ? "" : "<th>操作</th>";
    return `${filters}${toolbar}<section class="risk-list-card annotated" data-component-id="${history?"T02":"T01"}">${componentBadge(history?"T02":"T01")}<div class="risk-list-heading"><div><h2>${history?"监控审核历史":"结算监控审核"}</h2><span>共 128 条</span></div></div><div class="risk-table-wrap"><table class="risk-table monitor-table"><thead><tr><th><input type="checkbox" aria-label="全选" /></th><th>监控订单号</th><th>会员信息</th><th>上级代理</th><th>最后一次场馆信息</th><th>投注记录同步状态</th><th>停留时长</th><th>提现刷新次数</th><th>处理时长</th>${extraHeaders}${operationHeader}</tr></thead><tbody>${monitorRows(history)}</tbody></table></div>${pagination()}</section>`;
  }

  function loginLogRows() {
    const members = ["dengji000", "evan888", "dengji000"];
    const devices = ["Windows 11 / Chrome 126", "iOS 18 / Safari", "Android 15 / Chrome"];
    const deviceIds = ["DEV-8F2A-71C9", "DEV-91BC-204E", "DEV-8F2A-71C9"];
    const loginIps = ["103.27.14.86", "45.122.68.19", "103.27.14.86"];
    const registerIps = ["103.27.14.20", "45.122.68.11", "118.89.32.77"];
    return members.map((member, index) => `<tr><td><input type="checkbox" aria-label="选择登录日志${index + 1}" /></td><td><div class="stack-cell"><strong>${member}</strong><span>VIP${6 + index}</span></div></td><td><span class="data-tag">${riskTags[index]}</span></td><td>${agentCell()}</td><td>${devices[index]}</td><td><button type="button" class="link-action relation-action" data-relation-kind="设备号" data-relation-value="${deviceIds[index]}">${deviceIds[index]}</button></td><td>07${index === 1 ? "19" : "12"}</td><td>${dateTimeCell("2026-07-12",`1${4 - index}:2${index}:3${index}`)}</td><td><button type="button" class="link-action relation-action" data-relation-kind="登录IP" data-relation-value="${loginIps[index]}">${loginIps[index]}</button></td><td><button type="button" class="link-action relation-action" data-relation-kind="注册IP" data-relation-value="${registerIps[index]}">${registerIps[index]}</button></td><td>${index === 1 ? "广东省 深圳市" : "上海市 上海市"}</td><td>m.${index === 1 ? "0719" : "0712"}.example.com</td></tr>`).join("");
  }

  function memberLoginContent() {
    const loginTime = timeRange("F02").replace("<label>申请时间</label>", "<label>登录时间</label>");
    return `<div class="risk-page-heading"><div><h1>会员登录日志</h1></div></div>
      <section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid login-filter-grid"><div class="risk-field"><label>设备号</label><input type="text" placeholder="请输入设备号" /></div><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-field"><label>上级代理</label><input type="text" placeholder="请输入上级代理" /></div><div class="risk-field"><label>上级代理编号</label><input type="text" placeholder="请输入代理编号" /></div><div class="risk-field ip-filter-field"><label>登录IP</label><input type="text" placeholder="例如 103.27.14.86" inputmode="decimal" /><span class="field-error" hidden>请输入正确的IPv4地址</span></div><div class="risk-field region-field"><label>登录地址</label><div class="region-selects"><select aria-label="省份"><option>全部省份</option><option>上海市</option><option>广东省</option></select><select aria-label="城市"><option>全部城市</option><option>上海市</option><option>深圳市</option></select></div></div><div class="risk-field"><label>登录设备</label><input type="text" placeholder="请输入操作系统或设备" /></div><div class="risk-field"><label>版本号</label><select><option>全部版本</option><option>0712</option><option>0719</option></select></div>${loginTime}<div class="risk-filter-actions"><button type="button" class="main-action primary-filter login-filter-action">筛选</button><button type="button" class="secondary-action reset-action">重置</button><button type="button" class="secondary-action export-action">导出表格</button></div></div></section>
      <div class="login-toolbar"><button type="button" class="secondary-action annotated login-batch-device" data-component-id="B01" disabled>${componentBadge("B01")}批量拉黑设备</button><button type="button" class="secondary-action annotated login-batch-ip" data-component-id="B02" disabled>${componentBadge("B02")}批量拉黑IP</button><button type="button" class="secondary-action annotated login-merge-action" data-component-id="B03">${componentBadge("B03")}合并重复</button></div>
      <section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员登录日志</h2><span>共 128 条 · 登录时间倒序</span></div></div><div class="risk-table-wrap"><table class="risk-table login-log-table"><thead><tr><th><input type="checkbox" aria-label="全选登录日志" /></th><th>会员账号</th><th>风控标签</th><th>上级代理</th><th>登录设备</th><th>设备号</th><th>版本号</th><th>登录时间</th><th>登录IP</th><th>注册IP</th><th>登录地址</th><th>登录域名</th></tr></thead><tbody>${loginLogRows()}</tbody></table></div>${pagination(200)}</section>`;
  }

  function transactionQueryContent() {
    const rows = [1, 2, 3].map((index) => { const met = index === 1; return `<tr><td>${memberCell(index === 2 ? "evan888" : "dengji000")}</td><td>${agentCell()}</td><td>${dateTimeCell("2026-07-1${3 - index}",`0${8 + index}:20:00`)}</td><td><strong class="amount">¥ ${money(index * 1000)}</strong></td><td>${index === 1 ? "银行卡存款" : "数字货币存款"}</td><td>${index + 1} 倍</td><td><strong class="amount">¥ ${money(index * 3000)}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 3000 : 1800))}</strong></td><td><strong class="amount">¥ ${money(index * 200)}</strong></td><td>${index === 1 ? "存款红利" : "活动红利"}</td><td>${index + 2} 倍</td><td><strong class="amount">¥ ${money(index * 800)}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 800 : 500))}</strong></td><td><strong class="amount">¥ ${money(index * (met ? 3800 : 2300))}</strong></td><td><strong class="amount">¥ ${money(met ? 0 : index * 1500)}</strong></td><td><span class="result-tag ${met ? "approved" : "rejected"}">${met ? "已达标" : "未达标"}</span></td><td>${dateTimeCell("2026-07-12",`14:3${index}:00`)}</td></tr>`; }).join("");
    return `<div class="risk-page-heading"><div><h1>流水查询</h1></div></div><section class="risk-filter-panel annotated" data-component-id="F01">${componentBadge("F01")}<div class="risk-filter-grid transaction-filter-grid"><div class="risk-field"><label>会员账号</label><input type="text" placeholder="请输入会员账号" /></div><div class="risk-filter-actions"><button type="button" class="main-action primary-filter">筛选</button><button type="button" class="secondary-action reset-action">重置</button></div></div></section><section class="risk-list-card annotated" data-component-id="T01">${componentBadge("T01")}<div class="risk-list-heading"><div><h2>会员流水任务</h2><span>共 3 条</span></div></div><div class="risk-table-wrap"><table class="risk-table transaction-table"><thead><tr><th>会员信息</th><th>上级代理</th><th>存款时间</th><th>存款金额</th><th>存款类型</th><th>存款流水倍数</th><th>存款要求流水</th><th>存款完成流水</th><th>红利金额</th><th>红利类型</th><th>红利流水倍数</th><th>红利要求流水</th><th>红利完成流水</th><th>总完成流水</th><th>流水结余</th><th>达标情况</th><th>流水同步时间</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination()}</section>`;
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
      card.insertBefore(top, tableWrap);
    });
  }

  function detailView(requirement, requestedPageKey) {
    const page = requirement.pages.find((item) => item.key === requestedPageKey) || requirement.pages[0];
    if (page.key !== requestedPageKey) window.history.replaceState(null, "", `#requirement/${requirement.id}/page/${page.key}`);
    const pageLogic = page.logic ? `<section class="logic-note"><span>逻辑说明</span><p>${escapeHtml(page.logic)}</p></section>` : "";
    app.innerHTML = `<main class="detail-shell"><section class="prototype-pane" aria-label="高保真原型展示区"><header class="prototype-context"><div><span class="prototype-mark">PROTOTYPE</span><strong>${requirement.id}</strong><span>${requirement.title}</span></div><nav aria-label="当前原型页面"><span class="current-page-label">${page.name}</span></nav></header><div class="prototype-canvas"><div class="risk-app">${sidebar(requirement,page)}<section class="risk-main"><header class="risk-topbar"><div><span>风控管理 /</span><strong>${page.name}</strong></div><div><span class="environment-tag">测试环境</span><strong>Mike</strong></div></header><div class="risk-content">${pageContent(page)}</div></section></div></div></section><aside class="spec-pane" aria-label="说明区"><div class="spec-sticky-header"><a class="back-link" href="#"><span>←</span> 返回需求列表</a><div class="spec-meta-line"><strong>开发说明</strong><span>角色：${page.role}</span><span>页面：${page.id}</span></div><div class="spec-title-row"><div><h2>${page.name}</h2></div><span class="version">V1.0</span></div></div><div class="spec-scroll">${questionsBlock(page)}<section class="page-note"><span>页面目标</span><p>${page.purpose}</p>${page.flow ? `<span>主流程</span><p>${page.flow}</p>` : ""}</section>${pageLogic}<div class="spec-section-heading"><h2>组件说明</h2><span>${page.annotations.length} 项</span></div><div class="annotation-list">${page.annotations.map(annotationCard).join("")}</div></div></aside></main><div id="modal-root"></div>`;
    if (page.key === "withdraw-monitor") renderMonitorView(false);
    if (page.hidePageNote) app.querySelector(".page-note")?.remove();
    addTopPaginators();
    bindComponentLinks();
    bindPageBehavior(page);
    bindDatePickers();
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
  }

  function bindDatePickers() {
    document.querySelectorAll("[data-date-trigger]").forEach((trigger) => {
      if (trigger.dataset.dateBound) return;
      trigger.dataset.dateBound = "true";
      trigger.addEventListener("click", () => { const popover = trigger.parentElement.querySelector(".date-picker-popover"); popover.hidden = !popover.hidden; });
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

  function bindLoginLogBehavior() {
    const table = document.querySelector(".login-log-table");
    if (!table) return;
    const regionSelects = document.querySelector(".region-selects");
    regionSelects?.insertAdjacentHTML("afterbegin", '<select aria-label="国家"><option>全部国家</option><option>中国</option><option>菲律宾</option><option>新加坡</option></select>');
    const exportButton = document.querySelector(".export-action");
    if (exportButton) { exportButton.classList.add("annotated"); exportButton.dataset.componentId = "B04"; exportButton.insertAdjacentHTML("afterbegin", componentBadge("B04")); }
    const headingSubtitle = table.closest(".risk-list-card")?.querySelector(".risk-list-heading span");
    headingSubtitle?.remove();
    const duplicateRow = table.querySelectorAll("tbody tr")[2];
    duplicateRow?.classList.add("duplicate-login-row");
    const rowChecks = Array.from(table.querySelectorAll("tbody input[type='checkbox']"));
    const allCheck = table.querySelector("thead input[type='checkbox']");
    const deviceButton = document.querySelector(".login-batch-device");
    const ipButton = document.querySelector(".login-batch-ip");
    const selectedCount = () => rowChecks.filter((checkbox) => checkbox.checked).length;
    const syncBatchState = () => { const disabled = selectedCount() === 0; deviceButton.disabled = disabled; ipButton.disabled = disabled; if (allCheck) allCheck.checked = rowChecks.length > 0 && rowChecks.every((checkbox) => checkbox.checked); };
    rowChecks.forEach((checkbox) => checkbox.addEventListener("change", syncBatchState));
    allCheck?.addEventListener("change", () => { rowChecks.forEach((checkbox) => { checkbox.checked = allCheck.checked; }); syncBatchState(); });
    deviceButton?.addEventListener("click", () => modal("批量拉黑设备确认", `<p class="danger-confirm">本次选中<strong>${selectedCount()}条登录日志</strong></p><p>黑名单承载对象仍待确认，本操作仅用于原型评审。</p>`, "确认拉黑"));
    ipButton?.addEventListener("click", () => modal("批量拉黑IP确认", `<p class="danger-confirm">本次选中<strong>${selectedCount()}条登录日志</strong></p><p>黑名单承载对象仍待确认，本操作仅用于原型评审。</p>`, "确认拉黑"));
    document.querySelector(".login-merge-action")?.addEventListener("click", (event) => { const merged = event.currentTarget.dataset.merged !== "true"; event.currentTarget.dataset.merged = String(merged); event.currentTarget.childNodes[event.currentTarget.childNodes.length - 1].textContent = merged ? "取消合并" : "合并重复"; if (duplicateRow) duplicateRow.hidden = merged; });
    exportButton?.addEventListener("click", () => modal("导出登录日志", "<p>支持导出Excel或CSV格式，导出当前筛选条件下的全部登录日志，不限当前页。</p>", "确认导出"));
    document.querySelectorAll(".relation-action").forEach((button) => button.addEventListener("click", () => modal(`${button.dataset.relationKind}关联会员`, relatedMembersBody(button.dataset.relationKind, button.dataset.relationValue), "关闭")));
    const ipInput = document.querySelector(".ip-filter-field input");
    const ipError = document.querySelector(".ip-filter-field .field-error");
    const validateIp = () => { const value = ipInput.value.trim(); const valid = !value || value.split(".").length === 4 && value.split(".").every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255); ipInput.classList.toggle("is-invalid", !valid); ipError.hidden = valid; return valid; };
    ipInput?.addEventListener("blur", validateIp);
    document.querySelector(".login-filter-action")?.addEventListener("click", (event) => { if (!validateIp()) { event.preventDefault(); ipInput.focus(); } });
    bindComponentLinks();
  }

  function bindPageBehavior(page) {
    document.querySelectorAll("input[type='text']").forEach((input)=>input.addEventListener("blur",()=>{input.value=input.value.trim();}));
    const toggle = document.getElementById("spec-claim-toggle");
    toggle?.addEventListener("change",()=>{document.getElementById("claim-list-content").hidden=!toggle.checked;document.getElementById("claim-empty").hidden=toggle.checked;});
    const reviewToggle = document.getElementById("spec-review-toggle");
    reviewToggle?.addEventListener("change",()=>{document.getElementById("review-list-content").hidden=!reviewToggle.checked;document.getElementById("review-empty").hidden=reviewToggle.checked;});
    document.querySelector(".collapse-button")?.addEventListener("click",(event)=>{const content=document.getElementById("claim-list-content");content.hidden=!content.hidden;event.currentTarget.textContent=content.hidden?"展开列表":"收起列表";});
    document.querySelectorAll(".claim-action").forEach((button)=>button.addEventListener("click",()=>modal("领取提款申请",'<p>领取后该订单将锁定到当前风控账号，其他风控人员不可再领取。</p>',"确认领取")));
    if (page.key !== "withdraw-monitor") document.querySelectorAll(".detail-action").forEach((button)=>button.addEventListener("click",()=>modal("提款申请详情",'<div class="detail-groups"><section><h3>会员与代理</h3><p>会员账号：dengji000　会员等级：VIP6</p><p>所属站点：旺财体育　上级代理用户名：agent_087　编号：A10386</p></section><section><h3>提款账户</h3><p>真实姓名：陈小明</p><p>收款账号：6222123456783890</p></section><section><h3>提款信息</h3><p>提款金额：<strong class="amount">¥ 5,360</strong>　申请时间：2026-07-12 11:22:36</p><p>上笔存款金额：<strong class="amount">¥ 1,000</strong></p></section></div>',"关闭")));
    document.querySelectorAll(".pass-action").forEach((button)=>button.addEventListener("click",()=>modal("通过确认",'<p class="danger-confirm">您现在操作的是<strong>【通过】</strong></p><p>确认后，该提款申请将正式进入财务取款审核列表。</p>',"确认通过")));
    document.querySelectorAll(".reject-action").forEach((button)=>button.addEventListener("click",()=>modal("拒绝提款申请",'<label class="modal-field">拒绝理由<textarea placeholder="请输入拒绝理由，必填"></textarea></label>',"确认拒绝")));
    document.querySelectorAll(".hold-action").forEach((button)=>button.addEventListener("click",()=>modal("挂起提款申请",`<label class="modal-field">挂起原因<select>${riskTags.map(tag=>`<option>${tag}</option>`).join("")}</select></label>`,"确认挂起")));
    document.querySelectorAll(".ignore-action").forEach((button)=>button.addEventListener("click",()=>modal("忽略确认",'<p class="danger-confirm">您现在操作的是<strong>【忽略】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工忽略。</p>',"确认忽略")));
    document.querySelectorAll(".finish-action").forEach((button)=>button.addEventListener("click",()=>modal("完结确认",'<p class="danger-confirm">您现在操作的是<strong>【完结】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工完结。</p>',"确认完结")));
    document.querySelector(".config-action")?.addEventListener("click",()=>openConfigModal());
    document.querySelectorAll(".inner-tabs:not(:has(.monitor-tab)) button").forEach((button)=>button.addEventListener("click",()=>{button.parentElement.querySelectorAll("button").forEach(item=>item.classList.remove("active"));button.classList.add("active");}));
    bindSiteAutocomplete();
    bindLoginLogBehavior();
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
    document.querySelectorAll(".ignore-action").forEach((button)=>button.addEventListener("click",()=>modal("忽略确认",'<p class="danger-confirm">您现在操作的是<strong>【忽略】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工忽略。</p>',"确认忽略")));
    document.querySelectorAll(".finish-action").forEach((button)=>button.addEventListener("click",()=>modal("完结确认",'<p class="danger-confirm">您现在操作的是<strong>【完结】</strong></p><p>确认后记录进入审核历史，审核记录标记为人工完结。</p>',"确认完结")));
    document.querySelectorAll(".detail-action").forEach((button)=>button.addEventListener("click",()=>modal("提款监控详情",'<div class="detail-groups"><section><h3>会员与代理</h3><div class="detail-fields"><div><span>会员账号</span><strong>dengji000</strong></div><div><span>会员等级</span><strong>VIP6</strong></div><div><span>所属站点</span><strong>旺财体育</strong></div><div><span>上级代理用户名</span><strong>agent_087</strong></div><div><span>代理编号</span><strong>A10386</strong></div></div></section><section><h3>最后一次场馆信息</h3><div class="detail-fields"><div><span>场馆</span><strong>PG电子</strong></div><div><span>游戏</span><strong>麻将胡了</strong></div><div><span>注单号</span><strong>BET202607120001</strong></div><div><span>开始时间</span><strong>2026-07-12 14:20:00</strong></div><div><span>订单金额</span><strong class="amount">¥ 500</strong></div><div><span>结束时间</span><strong>2026-07-12 14:25:00</strong></div><div><span>同步状态</span><strong>已同步</strong></div></div></section><section><h3>监控指标</h3><div class="detail-fields"><div><span>停留时长</span><strong>13分钟</strong></div><div><span>提现刷新次数</span><strong>3次</strong></div><div><span>最近刷新时间</span><strong>2026-07-12 14:41:00</strong></div></div></section></div>',"关闭")));
    document.querySelectorAll(".redetect-action").forEach((button)=>button.addEventListener("click",()=>{button.disabled=true;button.textContent="检测中";window.setTimeout(()=>{button.disabled=false;button.textContent="重新检测";},700);}));
    const selected = () => Array.from(document.querySelectorAll(".monitor-table tbody input[type='checkbox']")).filter((input) => input.checked).length;
    const batch = document.querySelector(".monitor-toolbar .secondary-action[data-component-id='B01']");
    document.querySelectorAll(".monitor-table tbody input[type='checkbox']").forEach((checkbox)=>checkbox.addEventListener("change",()=>{if(batch) batch.disabled=selected()===0;}));
    batch?.addEventListener("click",()=>{const count=selected();if(count) modal("批量忽略确认",`<p class="danger-confirm">本次将对<strong>${count}条记录进行忽略操作</strong></p><p>确认后记录进入审核历史，审核记录标记为人工忽略。</p>`,"确认忽略");});
    document.querySelector(".config-switch input")?.addEventListener("change",(event)=>{event.target.closest(".config-switch").querySelector("b").textContent=event.target.checked?"启用":"停用";});
    bindDatePickers();
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
