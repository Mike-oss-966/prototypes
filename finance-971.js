(function () {
  const pad = (value) => String(value).padStart(2, "0");
  const dateText = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const today = dateText(new Date());
  const state = { agent: { start: today, end: today }, site: { start: today, end: today, quick: "today" } };
  const money = (value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18M15 13h6M5 5V3h13"/></svg>';
  let helpers;
  let activePortal = "agent";

  // Stable sample records let date filters, entry amounts and detail totals share the same source.
  const sources = {
    venue: [
      ["FB体育", 86000, 10, true], ["PG电子", 42000, 8, true], ["DB真人", 14000, 6, true],
      ["DB捕鱼", 0, 5, true], ["沙巴体育", -12400, 10, true], ["CQ9电子", 18000, 8, false], ["MG电子", 0, 8, false]
    ],
    deposit: [["支付宝", 86000, 1.2, true], ["EBPay", 62000, 0.8, true], ["钱能钱包", 28600, 0.6, true], ["代理代存", 18000, 0.4, true], ["USDT", 0, 0.5, true], ["银行卡", 9000, 1, false]],
    withdraw: [["USDT", 128000, 1, true], ["支付宝", 46000, 1.2, true], ["EBPay", 32000, 0.8, true], ["钱能钱包", 0, 0.6, true], ["银行卡", 5000, 1, false]]
  };

  function rows(kind, portal) {
    const range = state[portal];
    const scale = portal === "site" ? 3 : 1;
    return sources[kind].map(([name, amount, rate, enabled]) => {
      let base = 0;
      let fee = 0;
      [0, -1, -6].forEach((offset) => {
        const date = new Date(`${today}T12:00:00`);
        date.setDate(date.getDate() + offset);
        const day = dateText(date);
        if (day < range.start || day > range.end || (!enabled && offset !== -1)) return;
        const value = round(amount * scale * (offset === 0 ? 1 : offset === -1 ? 0.6 : 0.4));
        base += value;
        fee += round(Math.max(value, 0) * rate / 100);
      });
      return { name, base: round(base), rate, fee: round(fee), enabled };
    }).filter((row) => row.enabled || row.fee !== 0);
  }

  const total = (kind, portal) => round(rows(kind, portal).reduce((sum, row) => sum + row.fee, 0));

  function metric(label, value, { tone = "blue", action = "", compare = false, blue = false } = {}) {
    const tag = action ? "button" : "article";
    const id = action === "venue" ? "M01" : "M02";
    return `<${tag} class="finance971-metric${action ? " finance971-open-fee" : " finance971-reference"}${blue ? " is-blue-card" : ""}"${action ? ` type="button" data-finance971-fee="${action}" aria-label="查看${label}明细"` : ""} style="--metric-tone:var(--finance971-${tone},#2563eb)">${action ? helpers.badge(id) : ""}<header><span>${escape(label)}</span><i class="finance971-metric-icon">${icon}</i></header><strong${action ? ` data-finance971-value="${action}"` : ""}>${escape(value)}</strong>${compare || action ? `<footer>${compare ? "<small>-- 较前一周期</small>" : ""}${action ? "<span>查看明细</span>" : ""}</footer>` : ""}</${tag}>`;
  }

  function section(title, cards, columns, funds = false) {
    return `<section class="finance971-section${funds ? " annotated finance971-funds" : ""}"${funds ? ' data-component-id="P01"' : ""}>${funds ? helpers.badge("P01") : ""}<h2 class="finance971-reference">${escape(title)}</h2><div class="finance971-metrics" style="--finance971-cols:${columns}">${cards.join("")}</div></section>`;
  }

  function feeCards(portal) {
    return [metric("场馆费", `¥${money(total("venue", portal))}`, { action: "venue" }), metric("存提手续费", `¥${money(total("deposit", portal) + total("withdraw", portal))}`, { action: "fee", tone: "red" })];
  }

  function agentSections() {
    const m = (label, value, tone = "blue", blue = false) => metric(label, value, { tone, blue, compare: true });
    return section("本期佣金预估净收益", [m("本期佣金预估净收益", "¥18,600", "green", true)], 4)
      + section("佣金余额", [m("当前余额", "¥86,000", "orange", true), m("总推广佣金", "¥126,800", "red", true), m("已结算佣金", "¥108,200", "green", true)], 3)
      + section("资金流水", [m("总充值", "¥286,000", "green"), m("总提现", "¥86,000", "red"), m("总投注", "¥1,286,000", "dark"), m("有效投注", "¥1,186,000", "dark"), m("总盈亏", "+¥128,600", "green"), m("会员VIP福利", "¥22,400"), m("活动福利", "¥18,600", "orange"), m("会员推广福利", "¥4,280"), m("充提手续运营费", "¥12,460", "red"), ...feeCards("agent")], 4, true)
      + section("代理数据", [m("代理总人数", "126", "blue", true), m("新增代理", "12"), m("活跃代理", "84")], 4)
      + section("会员数据", [m("会员总数", "1,286", "blue", true), m("新增会员", "186", "green"), m("活跃会员", "328", "orange"), m("付费会员", "241"), m("新增付费", "86", "orange"), m("代理推广会员", "128"), m("会员推广会员", "58"), m("30天未登录会员数", "42", "dark", true)], 4);
  }

  function siteSections() {
    const m = (label, value, tone = "blue", compare = false) => metric(label, value, { tone, compare });
    return section("网站收益", [m("总投注额度", "¥8,682,000"), m("总收益", "¥628,600", "green"), m("总投注人数", "2,186", "indigo")], 3)
      + section("资金明细", [m("本站用户总额", "¥2,186,000", "indigo"), m("资金池额度", "¥3,286,000"), m("充值总额", "¥1,286,000", "green"), m("提现总额", "¥386,000", "red"), ...feeCards("site")], 4, true)
      + section("用户增长动态", [m("总用户数", "28,640"), m("活跃用户数", "3,286", "orange", true), m("新增用户", "628", "green", true), m("付费用户", "2,186", "red", true), m("新增付费用户", "241", "red", true)], 5)
      + section("代理数据", [m("总代理数", "628"), m("新增代理数", "28", "indigo", true), m("代理佣金余额（含未结算）", "¥286,000", "orange"), m("代理余额", "¥328,000", "green")], 4)
      + `<div class="finance971-bottom finance971-reference"><section><h3>投注返彩趋势分析</h3><p>总投注金额 / 总返彩金额 / 总盈利金额</p><svg viewBox="0 0 600 180" aria-label="投注返彩趋势分析"><path d="M0 30h600M0 70h600M0 110h600M0 150h600" stroke="#e2e8f0"/>${[52,83,65,106,95,74,124,96,133,148].map((height, i) => `<rect x="${i * 59 + 15}" y="${170 - height}" width="20" height="${height}" fill="#fb923c"/>`).join("")}<polyline points="10,110 70,78 130,92 190,53 250,67 310,81 370,40 430,60 490,27 550,18" fill="none" stroke="#2563eb" stroke-width="3"/><polyline points="10,140 70,115 130,122 190,90 250,108 310,117 370,71 430,85 490,59 550,45" fill="none" stroke="#ec4899" stroke-width="3"/></svg></section><section><h3>游戏收益排行榜</h3><p>收益最高的前6名游戏</p>${["百家乐", "三公", "炸金花", "龙虎", "轮盘", "牛牛"].map((name, index) => `<div class="finance971-rank"><span>${name}</span><b>¥${money(48000 - index * 5600)}</b><i style="width:${95 - index * 12}%"></i></div>`).join("")}<footer>平台最高收益金额汇总</footer></section></div>`;
  }

  function render(page, api) {
    helpers = api;
    activePortal = page.portal === "站点" ? "site" : "agent";
    const range = state[activePortal];
    const date = new Date(`${range.start}T12:00:00`);
    const header = activePortal === "site"
      ? `<header class="finance971-board-header"><strong class="finance971-reference">全站运营数据看板</strong><div class="finance971-site-ranges annotated" data-component-id="F01">${helpers.badge("F01")}${[["today", "今日"], ["yesterday", "昨日"], ["3d", "近3日"], ["7d", "近7日"], ["30d", "近1月"]].map(([key, label]) => `<button type="button" data-finance971-range="${key}" class="${range.quick === key ? "active" : ""}">${label}</button>`).join("")}</div></header>`
      : `<header class="finance971-board-header"><button class="finance971-guide finance971-reference" type="button" disabled>看板说明</button><div class="finance971-date annotated" data-component-id="F01">${helpers.badge("F01")}${helpers.dateControl({ year: date.getFullYear(), month: date.getMonth() + 1, startDay: date.getDate(), endDay: Number(range.end.slice(-2)) })}</div></header><div class="finance971-board-tip finance971-reference">淡蓝底色卡片的数据，一般为总计数据，只有在获得新数据时会每天更新，不能通过日期筛选来更新，白底卡片数据会根据日期筛选而同步变化</div>`;
    return `<div class="finance971-page finance971-${activePortal}" data-finance971-portal="${activePortal}">${header}${activePortal === "site" ? siteSections() : agentSections()}</div>`;
  }

  function detailTable(kind, portal) {
    const venue = kind === "venue";
    const deposit = kind === "deposit";
    const data = rows(kind, portal);
    const amount = money(total(kind, portal));
    const label = venue ? "场馆费" : `${deposit ? "存款" : "提款"}手续费`;
    return `<div class="finance971-total-bar"><span>${label}总计（CNY）</span><strong>${amount}</strong></div><div class="risk-table-wrap finance971-modal-table-wrap"><table class="risk-table finance971-modal-table"><thead><tr><th>序号</th><th>${venue ? "场馆名称" : deposit ? "存款渠道" : "提款渠道"}</th><th>${venue ? "总输赢" : deposit ? "存款金额" : "提款金额"}（CNY）</th><th>${venue ? "场馆费率" : "费率"}</th><th>${venue ? "场馆费" : "手续费"}（CNY）</th></tr></thead><tbody>${data.map((row, index) => `<tr><td>${index + 1}</td><td>${escape(row.name)}</td><td>${money(row.base)}</td><td>${row.rate}%</td><td><strong>${money(row.fee)}</strong></td></tr>`).join("") || '<tr><td colspan="5">暂无数据</td></tr>'}</tbody><tfoot><tr><td colspan="4">总计</td><td><strong>${amount}</strong></td></tr></tfoot></table></div>`;
  }

  function openDetail(type) {
    const previousFocus = document.activeElement;
    const portal = activePortal;
    const id = type === "venue" ? "M01" : "M02";
    const range = state[portal];
    const time = `<div class="finance971-modal-period"><span>统计时间</span><strong>${range.start} 00:00:00</strong><span>至</span><strong>${range.end} 23:59:59</strong></div>`;
    const tabs = type === "venue" ? "" : '<div class="finance971-modal-tabs" role="tablist" aria-label="手续费类型"><button type="button" role="tab" aria-selected="true" class="active" data-finance971-fee-tab="deposit">存款手续费</button><button type="button" role="tab" aria-selected="false" data-finance971-fee-tab="withdraw">提款手续费</button></div>';
    helpers.modal(type === "venue" ? "场馆费明细" : "存提手续费明细", `<div class="finance971-modal-content annotated" data-component-id="${id}" data-finance971-modal-portal="${portal}">${helpers.badge(id)}${time}${tabs}<div class="finance971-fee-table-panel">${detailTable(type === "venue" ? "venue" : "deposit", portal)}</div></div>`, "关闭");
    const dialog = document.querySelector("#modal-root .risk-modal");
    dialog.classList.add("finance971-dialog", `finance971-${portal}-dialog`);
    helpers.select(id, "component");
    dialog.querySelectorAll(".modal-close,.modal-confirm").forEach((button) => button.addEventListener("click", () => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); }));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); dialog.querySelector(".modal-close").click(); }
      if (event.key !== "Tab") return;
      const buttons = [...dialog.querySelectorAll("button")];
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
    });
    dialog.querySelector(".modal-close").focus({ preventScroll: true });
    dialog.querySelectorAll("[data-finance971-fee-tab]").forEach((button) => button.addEventListener("click", () => {
      dialog.querySelectorAll("[data-finance971-fee-tab]").forEach((tab) => { tab.classList.toggle("active", tab === button); tab.setAttribute("aria-selected", String(tab === button)); });
      dialog.querySelector(".finance971-fee-table-panel").innerHTML = detailTable(button.dataset.finance971FeeTab, portal);
      helpers.limitRows(dialog);
    }));
    dialog.querySelector(".finance971-modal-tabs")?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const other = [...dialog.querySelectorAll("[data-finance971-fee-tab]")].find((tab) => tab !== event.target);
      other?.click();
      other?.focus();
    });
  }

  function updateAmounts() {
    document.querySelector('[data-finance971-value="venue"]').textContent = `¥${money(total("venue", activePortal))}`;
    document.querySelector('[data-finance971-value="fee"]').textContent = `¥${money(total("deposit", activePortal) + total("withdraw", activePortal))}`;
  }

  function bind() {
    const range = state[activePortal];
    document.querySelectorAll(".finance971-open-fee").forEach((button) => button.addEventListener("click", () => openDetail(button.dataset.finance971Fee)));
    ["M01", "M02"].forEach((id) => {
      const activate = () => { if (!document.querySelector(`#modal-root [data-component-id="${id}"]`)) openDetail(id === "M01" ? "venue" : "fee"); };
      const spec = document.querySelector(`[data-spec-id="${id}"]`);
      spec?.addEventListener("click", activate);
      spec?.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); activate(); } });
    });
    document.querySelectorAll("[data-finance971-range]").forEach((button) => button.addEventListener("click", () => {
      const start = new Date(`${today}T12:00:00`);
      const key = button.dataset.finance971Range;
      const offset = { today: 0, yesterday: 1, "3d": 2, "7d": 6, "30d": 29 }[key];
      start.setDate(start.getDate() - offset);
      Object.assign(range, { start: dateText(start), end: key === "yesterday" ? dateText(start) : today, quick: key });
      document.querySelectorAll("[data-finance971-range]").forEach((item) => item.classList.toggle("active", item === button));
      updateAmounts();
    }));
    if (activePortal !== "agent") return;
    helpers.bindDates();
    const field = document.querySelector(".finance971-date");
    const trigger = field.querySelector(".agent-498-date");
    const refreshLabel = () => { trigger.innerHTML = `<span>${range.start}</span><b>~</b><span>${range.end}</span>`; };
    refreshLabel();
    trigger.addEventListener("click", () => {
      if (field.querySelector(".agent-498-date-popover").hidden) return;
      field.querySelectorAll(".calendar-panel").forEach((panel) => {
        const start = panel.dataset.rangeSide === "start";
        const date = new Date(`${start ? range.start : range.end}T12:00:00`);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        Object.assign(panel.dataset, { year, month });
        panel.querySelector("header strong").textContent = `${year}年${month}月`;
        panel.querySelector(".calendar-days").innerHTML = '<span></span>'.repeat((new Date(year, month - 1, 1).getDay() + 6) % 7) + Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => `<button type="button" class="calendar-day${index + 1 === date.getDate() ? " selected" : ""}" data-day="${index + 1}">${index + 1}</button>`).join("");
        panel.querySelector("input[type='time']").value = start ? "00:00:00" : "23:59:59";
      });
    });
    field.querySelector(".date-apply").addEventListener("click", () => {
      if (!field.querySelector(".agent-498-date-popover").hidden) return;
      const spans = trigger.querySelectorAll("span");
      range.start = spans[0].textContent.slice(0, 10);
      range.end = spans[1].textContent.slice(0, 10);
      refreshLabel();
      updateAmounts();
    });
    field.querySelector(".date-close").addEventListener("click", refreshLabel);
  }

  window.Finance971 = { render, bind };
})();
