(function () {
  "use strict";

  const escape = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function componentBadge(id) {
    return `<span class="component-badge" data-component-badge="${escape(id)}" aria-hidden="true">${escape(id)}</span>`;
  }

  function menuItem(item, activeKey) {
    const active = item.active === true || item.key === activeKey;
    const disabled = item.disabled === true || !item.href;
    const classes = ["site-695-menu-item", item.className || "", active ? "active" : "", disabled ? "is-unchanged" : ""].filter(Boolean).join(" ");
    const marker = item.marker || `<span class="site-prototype-menu-icon icon-${escape(item.icon || "page")}" aria-hidden="true"></span>`;
    const content = `${marker}<span>${escape(item.name)}</span>`;
    if (disabled) return `<span class="${classes}" aria-disabled="true">${content}</span>`;
    return `<a href="${escape(item.href)}" class="${classes}"${active ? ' aria-current="page"' : ""}>${content}</a>`;
  }

  function menuGroup(group, activeKey) {
    const expanded = group.expanded === true || (group.items || []).some((item) => item.key === activeKey || item.active === true);
    const children = (group.items || []).map((item) => menuItem(item, activeKey)).join("");
    return `<section class="site-695-menu-group${expanded ? " is-expanded" : ""}" data-prototype-menu-group>
      <button type="button" class="site-695-menu-parent" data-prototype-menu-toggle aria-expanded="${expanded ? "true" : "false"}">
        <span class="site-prototype-menu-icon icon-${escape(group.icon || "folder")}" aria-hidden="true"></span><span>${escape(group.name)}</span><i></i>
      </button>
      <div class="site-695-menu-children">${children}</div>
    </section>`;
  }

  function siteSidebar(options = {}) {
    const nav = (options.nav || []).map((item) => {
      if (item.type === "label") return `<div class="site-prototype-menu-label">${escape(item.name)}</div>`;
      if (item.type === "group") return menuGroup(item, options.activeKey);
      return menuItem(item, options.activeKey);
    }).join("");
    const brandSubtitle = options.brandSubtitle ? `<small>${escape(options.brandSubtitle)}</small>` : "";
    const user = options.user || {};
    return `<aside class="risk-sidebar site-695-sidebar site-prototype-sidebar ${escape(options.className || "")}">
      <div class="site-695-brand"><span>${escape(options.brandMark || "S")}</span><div><strong>${escape(options.brandName || "站点后台管理系统")}</strong>${brandSubtitle}</div></div>
      <nav class="site-695-menu-tree">${nav}</nav>
      ${user.account ? `<div class="risk-user"><span>${escape(user.mark || "MK")}</span><div><strong>${escape(user.account)}</strong><small>${escape(user.label || "")}</small></div></div>` : ""}
    </aside>`;
  }

  function siteBusinessNavigation(options = {}) {
    const hrefs = options.hrefs || {};
    const item = (key, name, icon = "page") => ({ key, name, icon, href: hrefs[key] || "", disabled: !hrefs[key] });
    const direct = (key, name, icon) => ({ ...item(key, name, icon), className: "site-prototype-menu-direct" });
    return [
      direct("personal-center", "个人中心", "user"),
      { type: "group", name: "会员管理", icon: "members", items: [
        item("member-list", "会员列表"), item("active-members", "活跃会员"), item("member-ledger", "会员帐变记录"),
        item("deposit-list", "充值列表"), item("withdraw-list", "提现列表"), item("lottery-rebate", "彩票会员返水报表")
      ] },
      direct("operations-dashboard", "运营数据看板", "dashboard"),
      { type: "group", name: "财务管理", icon: "finance", items: [
        item("platform-finance", "平台财务管理"), item("agent-commission-settlement", "代理佣金结算"),
        item("site-profit", "站点利润明细"), item("commission-report", "佣金报表"),
        item("finance-report", "财务报表"), item("prepaid-account", "预付金账户")
      ] },
      { type: "group", name: "运营报表", icon: "reports", items: [
        item("deposit-withdraw-transfer", "充提转账统计"), item("game-report", "游戏报表"),
        item("site-transfer-detail", "全站转账明细"), item("venue-agent-fee", "三方场馆代理费用明细")
      ] },
      { type: "group", name: "代理模块", icon: "agent", items: [
        item("agent-list", "代理列表"), item("correction-report", "冲正统计报表"), item("correction-payment", "冲正回款报表"),
        item("negative-settlement", "负盈利代理佣金结算"), item("negative-report", "负盈利代理佣金报表"), item("team-agent", "团队代理管理")
      ] },
      direct("cooperation-config", "合营配置", "cooperation"),
      { type: "group", name: "活动管理", icon: "activity", items: [item("activity-list", "活动列表")] },
      { type: "group", name: "系统管理", icon: "system", expanded: options.systemExpanded === true, items: [item("role-management", "角色管理", "role")] }
    ];
  }

  function bindMenuToggles(root = document) {
    root.querySelectorAll("[data-prototype-menu-toggle]").forEach((button) => {
      if (button.dataset.prototypeMenuBound === "true") return;
      button.dataset.prototypeMenuBound = "true";
      button.addEventListener("click", () => {
        const group = button.closest("[data-prototype-menu-group]");
        if (!group) return;
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        group.classList.toggle("is-expanded", !expanded);
      });
    });
  }

  window.PrototypeUI = { componentBadge, siteSidebar, siteBusinessNavigation, bindMenuToggles };
})();
