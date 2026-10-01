(function () {
  "use strict";

  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  const permissionGroups = [
    {
      name: "会员管理",
      pages: [
        ["会员列表", ["查看存款/场馆/投注明细", "修改会员备注", "导出"]],
        ["活跃会员", ["导出"]],
        ["会员帐变记录", []],
        ["充值列表", []],
        ["提现列表", []],
        ["彩票会员返水报表", ["查看代理返水佣金", "导出"]]
      ]
    },
    { name: "运营数据看板", pages: [["运营数据看板", []]] },
    {
      name: "财务管理",
      pages: [
        ["平台财务管理", ["导出", "快速充值", "余额提现", "内部转账给会员", "内部转账给代理", "发放红包", "更换提现账号"]],
        ["代理佣金结算", ["发放佣金", "导出"]],
        ["站点利润明细", ["导出"]],
        ["佣金报表", []],
        ["财务报表", []],
        ["预付金账户", ["转入预付金"]]
      ]
    },
    {
      name: "运营报表",
      pages: [
        ["充提转账统计", ["导出"]],
        ["游戏报表", ["导出"]],
        ["全站转账明细", ["导出"]],
        ["三方场馆代理费用明细", ["导出"]]
      ]
    },
    {
      name: "代理模块",
      pages: [
        ["代理列表", ["新增", "代理信息修改操作", "导出"]],
        ["冲正统计报表", []],
        ["冲正回款报表", ["导出"]],
        ["负盈利代理佣金结算", ["发放佣金", "导出"]],
        ["负盈利代理佣金报表", ["导出"]],
        ["团队代理管理", ["团队改名", "开设副线", "冻结/解冻", "提交关系调整", "批准/驳回关系调整", "导出"]]
      ]
    },
    { name: "合营配置", pages: [["合营配置", ["修改合营配置"]]] },
    { name: "活动管理", pages: [["活动列表", []]] }
  ];

  function expandPermissionNames(names) {
    if (!Array.isArray(names)) return [];
    const pages = new Set();
    names.forEach((name) => {
      const group = permissionGroups.find((item) => item.name === name);
      if (group) group.pages.forEach(([page]) => pages.add(page));
      else pages.add(name);
    });
    return [...pages];
  }

  function buildActionPermissions(names, allowedActions = {}) {
    return Object.fromEntries(expandPermissionNames(names).map((pageName) => [pageName, allowedActions[pageName] || []]));
  }

  const roles = [
    { id: "ROLE-001", name: "站点管理员", description: "站点全部业务权限", status: "启用", users: 1, updatedAt: "系统内置", system: true, permissions: "all" },
    { id: "ROLE-002", name: "财务专员", description: "负责财务管理和财务类报表", status: "启用", users: 2, updatedAt: "2026-09-24 15:20:18", permissions: ["财务管理", "运营报表"], actionPermissions: buildActionPermissions(["财务管理", "运营报表"]) },
    { id: "ROLE-003", name: "运营专员", description: "负责会员、活动和运营数据查看", status: "启用", users: 4, updatedAt: "2026-09-23 11:08:42", permissions: ["会员管理", "运营数据看板", "活动管理"], actionPermissions: buildActionPermissions(["会员管理", "运营数据看板", "活动管理"]) },
    { id: "ROLE-004", name: "招商人员", description: "负责本站点会员与代理业务查看", status: "停用", users: 1, updatedAt: "2026-09-19 09:46:10", permissions: ["会员管理", "代理模块"], actionPermissions: buildActionPermissions(["会员管理", "代理模块"]) }
  ];

  let roleSequence = roles.length + 1;
  let context = {};
  let filterState = { name: "", status: "全部" };
  let pageState = 1;
  let pageSize = 10;

  function currentTimestamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  function selectedRolePages(role) {
    if (!role || role.permissions === "all") return permissionGroups.flatMap((group) => group.pages.map(([page]) => page));
    const permissionNames = Array.isArray(role.permissions) && role.permissions.length ? role.permissions : Object.keys(role.actionPermissions || {});
    return expandPermissionNames(permissionNames);
  }

  function hasPage(role, pageName) {
    return selectedRolePages(role).includes(pageName);
  }

  function sidebar(page) {
    const roleHref = "#requirement/%231025/page/site-rbac-role-1025";
    return window.PrototypeUI.siteSidebar({
      className: "site-rbac-1025-sidebar",
      brandMark: "S",
      brandName: "站点管理系统",
      activeKey: "role-management",
      nav: [{ type: "group", name: "系统管理", icon: "system", expanded: true, items: [{ key: "role-management", name: "角色管理", icon: "role", href: roleHref }] }],
      user: { mark: "MK", account: "site_admin", label: "站点最高权限" }
    });
  }

  function filteredRoles() {
    return roles.filter((role) => (!filterState.name || role.name.includes(filterState.name.trim())) && (filterState.status === "全部" || role.status === filterState.status));
  }

  function statusTag(status) {
    return `<span class="site-rbac-1025-status ${status === "启用" ? "is-enabled" : "is-disabled"}"><i></i>${status}</span>`;
  }

  function roleTable() {
    const allRoles = filteredRoles();
    const totalPages = Math.max(1, Math.ceil(allRoles.length / pageSize));
    pageState = Math.min(pageState, totalPages);
    const offset = (pageState - 1) * pageSize;
    const rows = allRoles.slice(offset, offset + pageSize).map((role, index) => {
      const operations = role.system
        ? '<span class="site-rbac-1025-locked">系统内置，不可编辑</span>'
        : `<button type="button" class="link-action" data-rbac-edit="${escape(role.id)}">编辑权限</button><button type="button" class="link-action ${role.status === "启用" ? "is-danger" : ""}" data-rbac-toggle="${escape(role.id)}">${role.status === "启用" ? "停用" : "启用"}</button>`;
      return `<tr><td>${offset + index + 1}</td><td><strong>${escape(role.name)}</strong>${role.system ? '<span class="site-rbac-1025-system-tag">系统角色</span>' : '<span class="site-rbac-1025-custom-tag">自定义角色</span>'}</td><td>${escape(role.description)}</td><td>${statusTag(role.status)}</td><td>${role.users}</td><td>${escape(role.updatedAt)}</td><td class="site-rbac-1025-actions">${operations}</td></tr>`;
    }).join("");
    const pageButtons = Array.from({ length: totalPages }, (_, index) => `<button type="button" class="${pageState === index + 1 ? "active" : ""}" data-rbac-page="${index + 1}">${index + 1}</button>`).join("");
    return `<section class="site-rbac-1025-table-card annotated" data-component-id="T01">${context.badge("T01")}<header class="site-rbac-1025-card-header"><div><h2>角色列表</h2><span>可配置本站点业务角色及其权限</span></div><button type="button" class="main-action annotated" data-component-id="B01">${context.badge("B01")}<span>＋</span>新增角色</button></header><div class="site-rbac-1025-table-wrap"><table class="risk-table site-rbac-1025-table"><thead><tr><th>序号</th><th>角色名称</th><th>角色说明</th><th>状态</th><th>关联账号</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="7" class="empty-state">暂无符合条件的角色</td></tr>'}</tbody></table></div><div class="site-rbac-1025-pagination"><span>共 ${allRoles.length} 条</span><select aria-label="每页数量" data-rbac-page-size><option value="10" ${pageSize === 10 ? "selected" : ""}>10条/页</option><option value="20" ${pageSize === 20 ? "selected" : ""}>20条/页</option></select><button type="button" aria-label="上一页" data-rbac-page-prev ${pageState === 1 ? "disabled" : ""}>上一页</button>${pageButtons}<button type="button" aria-label="下一页" data-rbac-page-next ${pageState === totalPages ? "disabled" : ""}>下一页</button></div></section>`;
  }

  function render(page, options) {
    if (options) context = options;
    return `<div class="site-rbac-1025-page"><section class="risk-page-heading site-rbac-1025-heading"><div><p>系统管理</p><h1>角色管理</h1></div><span class="page-status">站点最高权限账号</span></section><section class="site-rbac-1025-owner-note"><div class="site-rbac-1025-owner-icon">!</div><div><strong>仅站点最高权限账号可配置角色</strong><p>自定义角色只能分配业务权限；【系统管理】及其下级功能不进入授权树，始终仅由最高权限账号操作。</p></div></section><section class="risk-filter-panel site-rbac-1025-filter annotated" data-component-id="F01">${context.badge("F01")}<div class="site-rbac-1025-filter-grid"><label><span>角色名称</span><input type="text" data-rbac-filter-name value="${escape(filterState.name)}" placeholder="请输入角色名称" /></label><label><span>角色状态</span><select data-rbac-filter-status><option ${filterState.status === "全部" ? "selected" : ""}>全部</option><option ${filterState.status === "启用" ? "selected" : ""}>启用</option><option ${filterState.status === "停用" ? "selected" : ""}>停用</option></select></label><div class="site-rbac-1025-filter-actions"><button type="button" class="main-action" data-rbac-search>查询</button><button type="button" class="secondary-action" data-rbac-reset>重置</button></div></div></section>${roleTable()}</div>`;
  }

  function checkbox(label, attrs = "", checked = false, disabled = false) {
    return `<label class="site-rbac-1025-check"><input type="checkbox" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} ${attrs}><span class="site-rbac-1025-box"></span><span>${escape(label)}</span></label>`;
  }

  function roleHasAction(role, pageName, action) {
    if (role?.permissions === "all") return true;
    return Boolean(role?.actionPermissions?.[pageName]?.includes(action));
  }

  function syncPermissionState(root) {
    root.querySelectorAll("[data-rbac-page-view]").forEach((view) => {
      root.querySelectorAll(`[data-rbac-action="${CSS.escape(view.dataset.rbacPageView)}"]`).forEach((action) => {
        action.disabled = !view.checked;
        if (!view.checked) action.checked = false;
      });
    });
    root.querySelectorAll("[data-rbac-group]").forEach((input) => {
      const group = permissionGroups[Number(input.dataset.rbacGroup)];
      const pages = group?.pages.map(([page]) => root.querySelector(`[data-rbac-page-view="${CSS.escape(page)}"]`)).filter(Boolean) || [];
      const checked = pages.filter((page) => page.checked).length;
      input.checked = pages.length > 0 && checked === pages.length;
      input.indeterminate = checked > 0 && checked < pages.length;
      input.dataset.indeterminate = String(input.indeterminate);
    });
  }

  function roleEditorBody(role) {
    const current = role || { name: "", description: "", status: "启用", actionPermissions: {} };
    const tree = permissionGroups.map((group, groupIndex) => {
      if (group.name === "运营数据看板") {
        const pageName = group.pages[0][0];
        return `<section class="site-rbac-1025-permission-group"><header><label class="site-rbac-1025-group-check"><input type="checkbox" ${hasPage(current, pageName) ? "checked" : ""} data-rbac-page-view="${escape(pageName)}"><span class="site-rbac-1025-box"></span><span>${escape(group.name)}</span></label><span>整体权限</span></header></section>`;
      }
      const allPages = group.pages.every(([page]) => hasPage(current, page));
      const pageRows = group.pages.map(([pageName, actions]) => {
        const pageChecked = hasPage(current, pageName);
        const actionMarkup = actions.length ? `<div class="site-rbac-1025-action-list">${actions.map((action) => checkbox(action, `data-rbac-action="${escape(pageName)}" data-rbac-action-name="${escape(action)}"`, roleHasAction(current, pageName, action), !pageChecked)).join("")}</div>` : '<span class="site-rbac-1025-no-action">全部权限</span>';
        return `<div class="site-rbac-1025-permission-row"><div class="site-rbac-1025-page-name">${checkbox(pageName, `data-rbac-page-view="${escape(pageName)}"`, pageChecked)}<small>查看列表</small></div>${actionMarkup}</div>`;
      }).join("");
      const groupCheckbox = `<label class="site-rbac-1025-group-check"><input type="checkbox" ${allPages ? "checked" : ""} data-rbac-group="${groupIndex}"><span class="site-rbac-1025-box"></span><span>${escape(group.name)}</span></label>`;
      return `<section class="site-rbac-1025-permission-group"><header>${groupCheckbox}<span>${group.pages.length} 个页面</span></header>${pageRows}</section>`;
    }).join("");
    return `<div class="site-rbac-1025-editor annotated" data-component-id="M01">${context.badge("M01")}<p class="site-rbac-1025-form-error" data-rbac-form-error hidden></p><div class="site-rbac-1025-editor-grid"><label><span>角色名称 <em>*</em></span><input data-rbac-role-name value="${escape(current.name)}" maxlength="30" placeholder="请输入角色名称" ${role?.system ? "disabled" : ""} /></label><label><span>角色状态</span><select data-rbac-role-status ${role?.system ? "disabled" : ""}><option ${current.status === "启用" ? "selected" : ""}>启用</option><option ${current.status === "停用" ? "selected" : ""}>停用</option></select></label><label class="site-rbac-1025-full-field"><span>角色说明</span><input data-rbac-role-description value="${escape(current.description)}" maxlength="60" placeholder="请输入角色用途说明" ${role?.system ? "disabled" : ""} /></label></div><div class="site-rbac-1025-permission-heading"><div><strong>业务权限</strong><span>数据范围固定为当前站点全部数据；勾选页面权限后，可配置该页面的操作权限</span></div><button type="button" class="secondary-action" data-rbac-clear>清空权限</button></div><div class="site-rbac-1025-system-lock"><span class="site-rbac-1025-lock-icon">锁</span><div><strong>系统管理</strong><p>系统管理及其下级页面不进入授权树，仅站点最高权限账号可操作。</p></div><span>不可授权</span></div><div class="site-rbac-1025-permission-tree">${tree}</div></div>`;
  }

  function openRoleEditor(role) {
    const title = role ? `编辑角色：${escape(role.name)}` : "新增角色";
    context.modal(title, roleEditorBody(role), "", '<footer><button type="button" class="secondary-action modal-cancel">取消</button><button type="button" class="main-action site-rbac-1025-save">保存</button></footer>');
    const root = document.getElementById("modal-root");
    root.querySelectorAll("[data-rbac-group]").forEach((input) => input.addEventListener("change", () => {
      const group = permissionGroups[Number(input.dataset.rbacGroup)];
      group.pages.forEach(([page]) => {
        const view = root.querySelector(`[data-rbac-page-view="${CSS.escape(page)}"]`);
        if (view) view.checked = input.checked;
        root.querySelectorAll(`[data-rbac-action="${CSS.escape(page)}"]`).forEach((action) => { action.checked = input.checked; action.disabled = !input.checked; });
      });
      syncPermissionState(root);
    }));
    root.querySelectorAll("[data-rbac-page-view]").forEach((input) => input.addEventListener("change", () => {
      root.querySelectorAll(`[data-rbac-action="${CSS.escape(input.dataset.rbacPageView)}"]`).forEach((action) => { action.disabled = !input.checked; if (!input.checked) action.checked = false; });
      syncPermissionState(root);
    }));
    root.querySelectorAll("[data-rbac-action]").forEach((input) => input.addEventListener("change", () => syncPermissionState(root)));
    root.querySelector("[data-rbac-clear]")?.addEventListener("click", () => {
      root.querySelectorAll("[data-rbac-group], [data-rbac-page-view], [data-rbac-action]").forEach((input) => { input.checked = false; if (input.dataset.rbacAction) input.disabled = true; });
      syncPermissionState(root);
    });
    syncPermissionState(root);
    root.querySelector(".site-rbac-1025-save")?.addEventListener("click", () => {
      const nameInput = root.querySelector("[data-rbac-role-name]");
      const name = nameInput?.value.trim() || "";
      const showError = (message, target = nameInput) => {
        const error = root.querySelector("[data-rbac-form-error]");
        if (error) { error.textContent = message; error.hidden = false; }
        target?.focus();
      };
      if (!name) { showError("请输入角色名称"); return; }
      if (roles.some((item) => item.id !== role?.id && item.name.trim() === name)) { showError("角色名称已存在，请更换后再保存"); return; }
      const selectedViews = Array.from(root.querySelectorAll("[data-rbac-page-view]:checked"));
      if (!selectedViews.length) { showError("请至少选择一个业务页面权限"); return; }
      const actionPermissions = {};
      selectedViews.forEach((input) => {
        const pageName = input.dataset.rbacPageView;
        actionPermissions[pageName] = Array.from(root.querySelectorAll(`[data-rbac-action="${CSS.escape(pageName)}"]:checked`)).map((item) => item.dataset.rbacActionName);
      });
      if (role) {
        role.name = name;
        role.description = root.querySelector("[data-rbac-role-description]")?.value.trim() || "";
        role.status = root.querySelector("[data-rbac-role-status]")?.value || "启用";
        role.actionPermissions = actionPermissions;
        role.permissions = Object.keys(actionPermissions);
        role.updatedAt = currentTimestamp();
      } else {
        roles.push({ id: `ROLE-${String(roleSequence++).padStart(3, "0")}`, name, description: root.querySelector("[data-rbac-role-description]")?.value.trim() || "", status: root.querySelector("[data-rbac-role-status]")?.value || "启用", users: 0, updatedAt: currentTimestamp(), permissions: Object.keys(actionPermissions), actionPermissions });
      }
      window.setTimeout(() => context.rerender(), 0);
    }, true);
  }

  function bind(options) {
    if (options) context = { ...context, ...options };
    window.PrototypeUI?.bindMenuToggles(document);
    document.querySelector("[data-rbac-search]")?.addEventListener("click", () => {
      filterState.name = document.querySelector("[data-rbac-filter-name]")?.value.trim() || "";
      filterState.status = document.querySelector("[data-rbac-filter-status]")?.value || "全部";
      pageState = 1;
      context.rerender();
    });
    document.querySelector("[data-rbac-filter-name]")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") document.querySelector("[data-rbac-search]")?.click();
    });
    document.querySelector("[data-rbac-reset]")?.addEventListener("click", () => { filterState = { name: "", status: "全部" }; pageState = 1; context.rerender(); });
    document.querySelector("[data-component-id='B01']")?.addEventListener("click", () => openRoleEditor());
    document.querySelectorAll("[data-rbac-edit]").forEach((button) => button.addEventListener("click", () => {
      const role = roles.find((item) => item.id === button.dataset.rbacEdit);
      if (role && !role.system) openRoleEditor(role);
    }));
    document.querySelectorAll("[data-rbac-toggle]").forEach((button) => button.addEventListener("click", () => {
      const role = roles.find((item) => item.id === button.dataset.rbacToggle);
      if (!role) return;
      const next = role.status === "停用" ? "启用" : "停用";
      context.modal(`确认${next}角色`, `<div class="site-rbac-1025-confirm"><strong>${escape(role.name)}</strong><p>${next === "启用" ? "启用后，关联账号将恢复使用该角色已有权限。" : "停用后，关联账号将立即失去该角色的业务权限，角色配置保留。"}</p></div>`, `确认${next}`);
      document.querySelector("#modal-root .modal-confirm")?.addEventListener("click", () => { role.status = next; role.updatedAt = currentTimestamp(); window.setTimeout(() => context.rerender(), 0); }, true);
    }));
    document.querySelector("[data-rbac-page-size]")?.addEventListener("change", (event) => { pageSize = Number(event.target.value) || 10; pageState = 1; context.rerender(); });
    document.querySelectorAll("[data-rbac-page]").forEach((button) => button.addEventListener("click", () => { pageState = Number(button.dataset.rbacPage) || 1; context.rerender(); }));
    document.querySelector("[data-rbac-page-prev]")?.addEventListener("click", () => { pageState = Math.max(1, pageState - 1); context.rerender(); });
    document.querySelector("[data-rbac-page-next]")?.addEventListener("click", () => { pageState += 1; context.rerender(); });
  }

  window.SiteRbac1025 = { sidebar, render, bind };
})();
