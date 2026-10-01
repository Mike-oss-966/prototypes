(function () {
  "use strict";

  const SITES = ["XY体育", "拉布布", "WC体育", "CS体育", "YY体育", "NS体育", "DW体育"];
  const SITE_IDS = Object.fromEntries(SITES.map((site, index) => [site, String(1000 + index)]));
  const TYPE_CODES = { 体育: "SPORTS", 真人: "LIVE", 电子: "SLOT", 棋牌: "POKER", 电竞: "ESPORT", 彩票: "LOTTERY", 捕鱼: "FISH", 哈希: "HASH" };
  const STATUS = {
    enabled: { label: "启用", className: "is-enabled" },
    maintenance_show: { label: "维护", className: "is-warning" },
    maintenance_hide: { label: "禁用", className: "is-hidden" }
  };
  const GAME_STATUS = { enabled: STATUS.enabled, maintenance_hide: { label: "停用", className: "is-hidden" } };
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const pad = (value) => String(value).padStart(2, "0");
  const dateTime = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const localInputTime = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const slug = (name, index) => name === "QuickGame电子" ? "QUICKGAME" : `VEN${String(index + 1).padStart(3, "0")}`;
  const catalogs = [...(window.PROTOTYPE_VENUE_GAMES || [])];
  if (!catalogs.some((item) => item.name === "QuickGame电子")) catalogs.unshift({ name: "QuickGame电子", type: "电子", games: [] });
  const types = [...new Set(catalogs.map((item) => item.type).concat(Object.keys(TYPE_CODES)))].filter(Boolean);
  const providersByVenue = { QUICKGAME: ["JDB", "PGSOFT", "PRAGMATIC"] };
  const nowText = "2026-09-24 16:40:12";

  let venues = catalogs.map((item, index) => {
    const code = slug(item.name, index);
    const authorizedSites = SITES.filter((site, siteIndex) => (index + siteIndex) % 4 !== 1).slice(0, 5);
    const siteStatuses = Object.fromEntries(authorizedSites.map((site, siteIndex) => [site, siteIndex === 1 && index % 8 === 0 ? "maintenance_show" : "enabled"]));
    return {
      id: 1000 + index,
      code,
      name: item.name,
      cnName: item.name,
      type: item.type,
      walletCode: code === "QUICKGAME" ? "WALLET-QG" : `WALLET-${code}`,
      sort: 1000 - index,
      remark: index % 7 === 0 ? "重点运营场馆" : "",
      updatedAt: nowText,
      authorizedAt: Object.fromEntries(authorizedSites.map((site, siteIndex) => [site, `2026-09-${pad(12 + siteIndex)} 11:20:00`])),
      globalStatus: "enabled",
      authorizedSites,
      siteStatuses: index === 3 || index === 8 ? Object.fromEntries(authorizedSites.map((site) => [site, index === 3 ? "maintenance_show" : "maintenance_hide"])) : siteStatuses,
      providers: providersByVenue[code] || [],
      games: item.games || []
    };
  });

  let games = [];
  venues.forEach((venue, venueIndex) => {
    const names = venue.games.length ? venue.games : [`${venue.name}大厅`];
    names.forEach((name, gameIndex) => {
      const platforms = gameIndex % 5 === 0 ? ["WEB", "H5", "APP"] : gameIndex % 3 === 0 ? ["H5", "APP"] : ["WEB", "H5"];
      games.push({
        id: `${venue.code}-${String(gameIndex + 1).padStart(4, "0")}`,
        code: `${venue.code}-G${String(gameIndex + 1).padStart(4, "0")}`,
        name,
        venueCode: venue.code,
        venueName: venue.name,
        type: venue.type,
        platforms,
        sort: Math.max(1, 500 - gameIndex),
        brand: venue.code === "QUICKGAME" ? venue.providers[gameIndex % venue.providers.length] : venue.name.replace(/真人|电子|体育|棋牌|捕鱼|彩票/g, ""),
        hot: gameIndex < 2,
        hotSort: gameIndex < 2 ? 100 - gameIndex : 0,
        globalStatus: "enabled",
        createdBy: "admin",
        createdAt: `2026-09-${pad(Math.max(1, 23 - (venueIndex % 18)))} 10:${pad(gameIndex % 60)}:00`,
        updatedBy: "admin",
        updatedAt: nowText,
        authSites: [...venue.authorizedSites],
        authorizedAt: {},
        siteStatuses: Object.fromEntries(venue.authorizedSites.map((site) => [site, gameIndex === 1 && venue.name === "PP电子" ? "maintenance_hide" : "enabled"]))
      });
    });
  });

  let wallets = venues.map((venue, index) => ({
    id: `W${String(index + 1).padStart(4, "0")}`,
    name: venue.code === "QUICKGAME" ? "QuickGame共享钱包" : `${venue.name}钱包`,
    code: venue.walletCode,
    venueCodes: venue.code === "QUICKGAME" ? ["QUICKGAME", venues.find((item) => item.type === "电子" && item.code !== "QUICKGAME")?.code].filter(Boolean) : [venue.code],
    status: index === 5 ? "locked" : "normal",
    updatedAt: nowText
  }));

  const rateConfigs = new Map();
  function subjectCodes(venue) { return venue.providers.length ? venue.providers : [""]; }
  function seedRates() {
    venues.forEach((venue, venueIndex) => SITES.forEach((site, siteIndex) => {
      subjectCodes(venue).forEach((provider, providerIndex) => {
        const base = 6 + ((venueIndex + siteIndex + providerIndex) % 5);
        rateConfigs.set(`${site}|${venue.code}|${provider}`, [
          { start: 0, end: 499999, rate: base },
          { start: 500000, end: null, rate: base - 0.5 }
        ]);
      });
    }));
  }
  seedRates();

  let logs = [
    { id: "ML202609240018", targetType: "场馆", venue: "QuickGame电子", game: "-", wallet: "-", range: "2026-09-24 02:00:00 至 2026-09-24 05:00:00", action: "维护", display: "维护", operator: "admin", operatedAt: "2026-09-23 19:26:10", reason: "上游线路例行维护", scope: "总站" },
    { id: "ML202609240019", targetType: "游戏", venue: "PG电子", game: "麻将胡了", wallet: "-", range: "-", action: "停用", display: "停用", operator: "site_xy_ops", operatedAt: "2026-09-24 08:55:32", reason: "游戏接口异常", scope: "XY体育" },
    { id: "ML202609240020", targetType: "游戏", venue: "PG电子", game: "麻将胡了", wallet: "-", range: "2026-09-24 09:00:00 至 2026-09-24 12:00:00", action: "开启", display: "-", operator: "site_xy_ops", operatedAt: "2026-09-24 11:42:06", reason: "上游服务已恢复", scope: "XY体育" }
  ];

  const initialFilters = () => ({ name: "", type: "", status: "", venue: "", platform: "", code: "", brand: "", remark: "", wallet: "", game: "" });
  const state = {
    portal: "control",
    tab: "场馆列表",
    menuOpen: true,
    page: { control: { 场馆列表: 1, 游戏列表: 1, 钱包列表: 1, 维护日志: 1 }, site: { 场馆列表: 1, 游戏列表: 1, 钱包列表: 1, 维护日志: 1 } },
    size: 10,
    oldTab: "游戏列表",
    selectedGames: new Set(),
    filters: { control: Object.fromEntries(["场馆列表", "游戏列表", "钱包列表", "维护日志"].map((tab) => [tab, initialFilters()])), site: Object.fromEntries(["场馆列表", "游戏列表", "钱包列表", "维护日志"].map((tab) => [tab, initialFilters()])) }
  };
  let helpers = {};
  let activePage = null;
  let xlsxPromise = null;

  function portalKey(page = activePage) { return page?.portal === "站点" ? "site" : "control"; }
  function currentSite() { return "XY体育"; }
  function statusTag(value, source = "") {
    const item = STATUS[value] || STATUS.enabled;
    return `<span class="venue599-status ${item.className}">${item.label}</span>${source ? `<small class="venue599-status-source">${source}</small>` : ""}`;
  }
  function statusControl(kind, row, portal, effective) {
    const action = kind === "场馆" ? "status-venue" : "status-game";
    if (portal === "control") {
      const item = (kind === "场馆" ? STATUS : GAME_STATUS)[effective.value] || STATUS.enabled;
      return `<button type="button" class="venue599-status-control" data-venue599-action="${action}" data-code="${escape(row.code)}" title="同步全部站点的${kind}状态"><span class="venue599-status ${item.className}">${item.label}<i aria-hidden="true"></i></span></button>`;
    }
    const item = (kind === "场馆" ? STATUS : GAME_STATUS)[effective.value] || STATUS.enabled;
    const source = effective.source ? `<small class="venue599-status-source">${escape(effective.source)}</small>` : "";
    return `<button type="button" class="venue599-status-control" data-venue599-action="${action}" data-code="${escape(row.code)}" aria-label="设置本站${kind}状态" title="点击设置本站${kind}状态"><span class="venue599-status ${item.className}">${item.label}<i aria-hidden="true"></i></span>${source}</button>`;
  }
  function effectiveStatus(row, portal) {
    if (portal !== "site") return { value: row.globalStatus, source: "" };
    return { value: row.siteStatuses[currentSite()] || "enabled", source: "只对本站生效" };
  }
  function effectiveGameStatus(game, portal) {
    if (portal !== "site") return { value: game.globalStatus, source: "" };
    const venue = venueByCode(game.venueCode);
    const gameSiteStatus = game.siteStatuses[currentSite()] || "enabled";
    if (gameSiteStatus !== "enabled") return { value: gameSiteStatus, source: "只对本站生效" };
    const venueSiteStatus = venue?.siteStatuses[currentSite()] || "enabled";
    if (venueSiteStatus !== "enabled") return { value: "enabled", source: `场馆${STATUS[venueSiteStatus].label}` };
    return { value: "enabled", source: "只对本站生效" };
  }
  function isAuthorized(venue, site) { return venue.authorizedSites.includes(site); }
  function configured(venue, site) { return subjectCodes(venue).every((provider) => (rateConfigs.get(`${site}|${venue.code}|${provider}`) || []).length); }
  function rateSummary(venue, site) {
    if (!configured(venue, site)) return '<span class="venue599-rate-missing">未配置</span>';
    const rates = subjectCodes(venue).flatMap((provider) => rateConfigs.get(`${site}|${venue.code}|${provider}`) || []).map((item) => item.rate);
    const unique = [...new Set(rates)];
    return unique.length === 1 ? `${unique[0]}%` : `<span class="venue599-rate-multi">${unique.length}种费率</span>`;
  }
  function badge(id) { return helpers.badge?.(id) || `<span class="component-badge">${id}</span>`; }
  function annotate(id, className = "") { return `class="annotated ${className}" data-component-id="${id}"`; }
  function actionButton(label, action, code, extra = "", className = "") { return `<button type="button" class="venue599-link${className ? ` ${className}` : ""}" data-venue599-action="${action}" data-code="${escape(code)}" ${extra}>${label}</button>`; }

  function sidebar(page) {
    const oldActive = page.key === "control-game-management-old-599";
    const unchangedItem = (name) => `<span class="venue599-menu-item is-unchanged" aria-disabled="true"><span>${escape(name)}</span></span>`;
    const menuItems = `${unchangedItem("站内信")}<a href="#requirement/%23599/page/control-venue-management-599" class="venue599-menu-item ${oldActive ? "" : "active"} annotated" data-component-id="N01">${badge("N01")}<span>场馆管理</span><em class="menu-change-badge is-new">新增</em></a><a href="#requirement/%23599/page/control-game-management-old-599" class="venue599-menu-item ${oldActive ? "active" : ""}"><span>游戏管理(旧)</span><em class="menu-change-badge">修改</em></a>${["前端皮肤", "App版本管理", "短信通道管理", "区号配置", "短信发送记录", "二要素验证通道"].map(unchangedItem).join("")}`;
    return `<aside class="risk-sidebar venue599-sidebar"><div class="venue599-brand"><span>C</span><div><strong>总控后台管理系统</strong><small>运营管理中心</small></div></div><nav><section><button type="button" class="venue599-menu-parent" data-venue599-menu-toggle aria-expanded="${state.menuOpen}"><i aria-hidden="true"></i><span>资源管理</span><b class="${state.menuOpen ? "open" : ""}"></b></button><div class="venue599-menu-children"${state.menuOpen ? "" : " hidden"}>${menuItems}</div></section></nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>总控管理员</small></div></div></aside>`;
  }

  function tabs(page) {
    return `<nav class="venue599-tabs" role="tablist" aria-label="场馆管理页面">${page.tabs.map((tab) => `<button type="button" role="tab" aria-selected="${state.tab === tab}" class="${state.tab === tab ? "active" : ""}" data-venue599-tab="${escape(tab)}">${escape(tab)}</button>`).join("")}</nav>`;
  }
  function selectOptions(values, selected, allLabel = "全部") {
    return `<option value="">${allLabel}</option>${values.map((item) => `<option value="${escape(item)}"${selected === item ? " selected" : ""}>${escape(item)}</option>`).join("")}`;
  }
  function filtersFor(tab, portal) {
    const filter = state.filters[portal][tab];
    const fields = tab === "场馆列表"
      ? `<label><span>场馆名称</span><input data-venue599-filter="name" value="${escape(filter.name)}" placeholder="请输入场馆名称" /></label><label><span>场馆类型</span><select data-venue599-filter="type">${selectOptions(types, filter.type, "全部类型")}</select></label><label><span>场馆状态</span><select data-venue599-filter="status">${selectOptions(Object.entries(STATUS).map(([, item]) => item.label), filter.status, "全部状态")}</select></label>${portal === "control" ? `<label><span>备注</span><input data-venue599-filter="remark" value="${escape(filter.remark)}" placeholder="请输入备注" /></label>` : ""}`
      : tab === "游戏列表"
      ? `<label><span>游戏名称</span><input data-venue599-filter="name" value="${escape(filter.name)}" placeholder="请输入游戏名称" /></label><label><span>支持平台</span><select data-venue599-filter="platform">${selectOptions(["WEB", "H5", "APP"], filter.platform, "全部平台")}</select></label><label><span>状态</span><select data-venue599-filter="status">${selectOptions(Object.values(GAME_STATUS).map((item) => item.label), filter.status, "全部状态")}</select></label><label><span>游戏场馆</span><select data-venue599-filter="venue">${selectOptions(venues.map((item) => item.name), filter.venue, "全部场馆")}</select></label><label><span>场馆类型</span><select data-venue599-filter="type">${selectOptions(types, filter.type, "全部类型")}</select></label>${portal === "control" ? `<label><span>游戏CODE</span><input data-venue599-filter="code" value="${escape(filter.code)}" placeholder="请输入游戏CODE" /></label><label><span>品牌</span><input data-venue599-filter="brand" value="${escape(filter.brand)}" placeholder="请输入品牌" /></label>` : ""}`
      : tab === "钱包列表"
      ? `<label><span>钱包名称</span><input data-venue599-filter="wallet" value="${escape(filter.wallet)}" placeholder="请输入钱包名称" /></label>`
      : `<label><span>维护场馆</span><input data-venue599-filter="venue" value="${escape(filter.venue)}" placeholder="请输入场馆名称" /></label><label><span>维护游戏</span><input data-venue599-filter="game" value="${escape(filter.game)}" placeholder="请输入游戏名称" /></label><label><span>维护钱包</span><input data-venue599-filter="wallet" value="${escape(filter.wallet)}" placeholder="请输入钱包名称" /></label>`;
    const id = tab === "场馆列表" ? (portal === "control" ? "F01" : "F11") : tab === "游戏列表" ? (portal === "control" ? "F02" : "F12") : tab === "钱包列表" ? "F03" : "F04";
    return `<section ${annotate(id, "venue599-filters")}>${badge(id)}<div class="venue599-filter-grid">${fields}<div class="venue599-filter-actions"><button type="button" class="main-action" data-venue599-search>筛选</button><button type="button" class="secondary-action" data-venue599-reset>重置</button></div></div></section>`;
  }

  function matchesText(value, query) { return !query || String(value ?? "").toLowerCase().includes(query.toLowerCase()); }
  function filteredVenues(portal) {
    const f = state.filters[portal]["场馆列表"];
    return venues.filter((venue) => portal === "control" || isAuthorized(venue, currentSite())).filter((venue) => {
      const status = effectiveStatus(venue, portal).value;
      return matchesText(`${venue.name} ${venue.cnName} ${venue.code}`, f.name) && (!f.type || venue.type === f.type) && (!f.status || STATUS[status].label === f.status) && matchesText(venue.remark, f.remark);
    });
  }
  function filteredGames(portal) {
    const f = state.filters[portal]["游戏列表"];
    return games.filter((game) => portal === "control" || (game.authSites.includes(currentSite()) && venueByCode(game.venueCode)?.authorizedSites.includes(currentSite()))).filter((game) => {
      const status = effectiveGameStatus(game, portal).value;
      return matchesText(`${game.name} ${game.code}`, f.name) && (!f.platform || game.platforms.includes(f.platform)) && (!f.status || GAME_STATUS[status]?.label === f.status) && (!f.venue || game.venueName === f.venue) && (!f.type || game.type === f.type) && matchesText(game.code, f.code) && matchesText(game.brand, f.brand);
    });
  }
  function filteredWallets(portal) {
    const f = state.filters[portal]["钱包列表"];
    return wallets.filter((wallet) => portal === "control" || wallet.venueCodes.some((code) => venues.find((venue) => venue.code === code)?.authorizedSites.includes(currentSite()))).filter((wallet) => matchesText(`${wallet.name} ${wallet.code}`, f.wallet));
  }
  function filteredLogs(portal) {
    const f = state.filters[portal]["维护日志"];
    return logs.filter((item) => portal === "control" || [currentSite(), "总站"].includes(item.scope)).filter((item) => matchesText(item.venue, f.venue) && matchesText(item.game, f.game) && matchesText(item.wallet, f.wallet));
  }
  function lockedWalletForVenue(venue) {
    return wallets.find((wallet) => wallet.status === "locked" && wallet.venueCodes.includes(venue.code));
  }
  function maintainedVenuesForWallet(wallet) {
    return wallet.venueCodes.map(venueByCode).filter((venue) => venue && venue.authorizedSites.some((site) => venue.siteStatuses[site] !== "enabled"));
  }
  function linkedStateName(name, warning) {
    return `<div class="venue599-linked-name${warning ? " is-warning" : ""}"><strong>${escape(name)}</strong>${warning ? `<span>${escape(warning)}</span>` : ""}</div>`;
  }
  function pager(rows, portal, tab) {
    const totalPages = Math.max(1, Math.ceil(rows.length / state.size));
    state.page[portal][tab] = Math.min(state.page[portal][tab], totalPages);
    const page = state.page[portal][tab];
    return { rows: rows.slice((page - 1) * state.size, page * state.size), page, totalPages };
  }
  function pagination(total, portal, tab, page, totalPages) {
    return `<div class="full-pagination venue599-pagination"><span>共 ${total} 条</span><select data-venue599-size aria-label="每页数量">${[10, 20, 50, 100, 200].map((size) => `<option value="${size}"${state.size === size ? " selected" : ""}>${size}条/页</option>`).join("")}</select><button type="button" data-venue599-page="${page - 1}"${page === 1 ? " disabled" : ""}>‹</button>${Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((value) => `<button type="button" data-venue599-page="${value}" class="${page === value ? "active" : ""}">${value}</button>`).join("")}<button type="button" data-venue599-page="${page + 1}"${page === totalPages ? " disabled" : ""}>›</button></div>`;
  }
  function tablePanel(id, toolbar, table, total, portal, tab, page, totalPages) {
    return `<section ${annotate(id, "venue599-list-card")}>${badge(id)}${toolbar}<div class="risk-table-wrap venue599-table-wrap" data-page-scroll>${table}</div>${pagination(total, portal, tab, page, totalPages)}</section>`;
  }

  function venueTable(portal) {
    const rows = filteredVenues(portal);
    const result = pager(rows, portal, "场馆列表");
    const id = portal === "control" ? "T01" : "T11";
    const toolbar = portal === "control"
      ? `<div class="venue599-toolbar"><div><button type="button" class="main-action annotated" data-component-id="B02" data-venue599-action="add-venue">${badge("B02")}新增场馆</button><button type="button" class="secondary-action annotated" data-component-id="B01" data-venue599-action="types">${badge("B01")}场馆类型设置</button><button type="button" class="secondary-action annotated" data-component-id="B04" data-venue599-action="authorize-all">${badge("B04")}全部授权</button></div></div>`
      : "";
    const body = result.rows.map((venue, index) => {
      const effective = effectiveStatus(venue, portal);
      const walletLocked = Boolean(lockedWalletForVenue(venue));
      const gameCount = games.filter((game) => game.venueCode === venue.code).length;
      const controlActions = `${actionButton("详情", "venue-detail", venue.code)}${actionButton("编辑", "edit-venue", venue.code)}${actionButton("授权管理", "authorize", venue.code)}`;
      const configuredSiteCount = SITES.filter((site) => configured(venue, site)).length;
      const rateCell = portal === "control"
        ? `<button type="button" class="venue599-rate-cell" data-venue599-action="rate" data-code="${escape(venue.code)}">${configuredSiteCount ? `${configuredSiteCount}个站点已配置` : "未配置"}</button>`
        : `<button type="button" class="venue599-rate-cell" data-venue599-action="view-rate" data-code="${escape(venue.code)}">${rateSummary(venue, currentSite())}</button>`;
      return `<tr><td>${(result.page - 1) * state.size + index + 1}</td><td>${linkedStateName(venue.name, walletLocked ? "钱包已锁定" : "")}</td><td><span class="venue599-code">${escape(venue.code)}</span></td><td>${escape(venue.cnName)}</td><td>${escape(venue.type)}</td><td>${rateCell}</td>${portal === "control" ? `<td>${escape(venue.updatedAt)}</td>` : ""}<td><button type="button" class="venue599-count-link" data-venue599-action="games" data-code="${escape(venue.code)}">${gameCount}</button></td>${portal === "control" ? `<td>${venue.authorizedSites.length}</td>` : ""}<td>${statusControl("场馆", venue, portal, effective)}</td>${portal === "control" ? `<td>${escape(venue.remark || "-")}</td><td class="venue599-actions">${controlActions}</td>` : ""}</tr>`;
    }).join("");
    const headers = `<tr><th>序号</th><th>场馆名称</th><th>场馆CODE</th><th>场馆中文名称</th><th>场馆类型</th><th>场馆费率</th>${portal === "control" ? "<th>最后更新时间</th>" : ""}<th>游戏数</th>${portal === "control" ? "<th>授权数</th>" : ""}<th>场馆状态</th>${portal === "control" ? '<th>备注</th><th class="venue599-sticky-action">操作</th>' : ""}</tr>`;
    const table = `<table class="risk-table venue599-table venue599-venue-table"><thead>${headers}</thead><tbody>${body || `<tr><td colspan="${portal === "control" ? 12 : 8}" class="venue599-empty">暂无符合条件的数据</td></tr>`}</tbody></table>`;
    return tablePanel(id, toolbar, table, rows.length, portal, "场馆列表", result.page, result.totalPages);
  }

  function gameTable(portal) {
    const rows = filteredGames(portal);
    const result = pager(rows, portal, "游戏列表");
    const id = portal === "control" ? "T02" : "T12";
    const toolbar = `<div class="venue599-toolbar"><div>${portal === "control" ? `<button type="button" class="main-action annotated" data-component-id="B06" data-venue599-action="add-game">${badge("B06")}新增游戏</button><button type="button" class="secondary-action" data-venue599-action="batch-game">批量新增</button>` : ""}<button type="button" class="secondary-action" data-venue599-action="selected-games">批量设置选中游戏${state.selectedGames.size ? `（${state.selectedGames.size}）` : ""}</button><button type="button" class="secondary-action" data-venue599-action="venue-games">整场馆游戏启停</button></div></div>`;
    const selectedOnPage = result.rows.filter((game) => state.selectedGames.has(game.code)).length;
    const pageSelected = result.rows.length > 0 && selectedOnPage === result.rows.length;
    const body = result.rows.map((game, index) => {
      const effective = effectiveGameStatus(game, portal);
      const actions = actionButton("编辑", "edit-game", game.code);
      return `<tr><td><label class="venue599-game-select"><input type="checkbox" data-venue599-game-select="${escape(game.code)}" ${state.selectedGames.has(game.code) ? "checked" : ""} aria-label="选择${escape(game.name)}" /><span>${(result.page - 1) * state.size + index + 1}</span></label></td><td><strong>${escape(game.name)}</strong></td><td>${escape(game.venueName)}</td><td>${escape(game.type)}</td><td><span class="venue599-code">${escape(game.code)}</span></td><td>${game.platforms.map((item) => `<span class="venue599-platform">${item}</span>`).join("")}</td><td>${game.sort}</td>${portal === "control" ? `<td><span class="venue599-image-thumb" role="img" aria-label="WEB游戏图片"><i aria-hidden="true"></i></span></td><td><span class="venue599-image-thumb is-mobile" role="img" aria-label="移动端游戏图片"><i aria-hidden="true"></i></span></td><td>${game.authSites.length}</td>` : ""}<td>${statusControl("游戏", game, portal, effective)}</td>${portal === "control" ? `<td>${escape(game.brand || "-")}</td><td>${escape(game.createdBy)}<small>${escape(game.createdAt)}</small></td><td>${escape(game.updatedBy)}<small>${escape(game.updatedAt)}</small></td><td class="venue599-actions">${actions}</td>` : ""}</tr>`;
    }).join("");
    const selectionHeader = `<label class="venue599-page-select"><input type="checkbox" data-venue599-game-page-select ${pageSelected ? "checked" : ""} ${result.rows.length ? "" : "disabled"} aria-label="全选本页" /><span>全选本页</span></label><span class="venue599-page-select-index">序号</span>`;
    const headers = portal === "control"
      ? `<tr><th>${selectionHeader}</th><th>游戏名称</th><th>游戏场馆</th><th>场馆类型</th><th>游戏CODE</th><th>支持平台</th><th>排序</th><th>WEB游戏图片</th><th>移动端游戏图片</th><th>授权数</th><th>游戏状态</th><th>品牌</th><th>创建人 / 时间</th><th>最后编辑人 / 时间</th><th class="venue599-sticky-action">操作</th></tr>`
      : `<tr><th>${selectionHeader}</th><th>游戏名称</th><th>游戏场馆</th><th>场馆类型</th><th>游戏CODE</th><th>支持平台</th><th>排序</th><th>游戏状态</th></tr>`;
    const table = `<table class="risk-table venue599-table venue599-game-table"><thead>${headers}</thead><tbody>${body || `<tr><td colspan="${portal === "control" ? 15 : 8}" class="venue599-empty">暂无符合条件的数据</td></tr>`}</tbody></table>`;
    return tablePanel(id, toolbar, table, rows.length, portal, "游戏列表", result.page, result.totalPages);
  }

  function walletTable(portal) {
    const rows = filteredWallets(portal);
    const result = pager(rows, portal, "钱包列表");
    const id = portal === "control" ? "T03" : "T13";
    const toolbar = "";
    const body = result.rows.map((wallet, index) => {
      const venueNames = wallet.venueCodes.map((code) => venues.find((venue) => venue.code === code)?.name || code);
      const venueMaintained = maintainedVenuesForWallet(wallet).length > 0;
      const actions = portal === "control" ? `${actionButton("编辑", "edit-wallet", wallet.code)}${actionButton(wallet.status === "normal" ? "锁定钱包" : "解锁钱包", "wallet-status", wallet.code, "", wallet.status === "locked" ? "is-danger" : "")}` : "-";
      return `<tr><td>${(result.page - 1) * state.size + index + 1}</td><td>${linkedStateName(wallet.name, venueMaintained ? "场馆已维护" : "")}</td><td><span class="venue599-code">${wallet.venueCodes.map(escape).join("、")}</span></td><td>${venueNames.map((name) => `<span class="venue599-venue-chip">${escape(name)}</span>`).join("")}</td><td>${new Set(wallet.venueCodes.flatMap((code) => venues.find((venue) => venue.code === code)?.authorizedSites || [])).size}</td><td><span class="venue599-status ${wallet.status === "normal" ? "is-enabled" : "is-hidden"}">${wallet.status === "normal" ? "正常" : "锁定"}</span></td><td class="venue599-actions">${actions}</td></tr>`;
    }).join("");
    const table = `<table class="risk-table venue599-table"><thead><tr><th>序号</th><th>钱包名称</th><th>场馆CODE</th><th>关联场馆</th><th>授权数</th><th>钱包状态</th><th class="venue599-sticky-action">操作</th></tr></thead><tbody>${body || '<tr><td colspan="7" class="venue599-empty">暂无符合条件的数据</td></tr>'}</tbody></table>`;
    return tablePanel(id, toolbar, table, rows.length, portal, "钱包列表", result.page, result.totalPages);
  }

  function logTable(portal) {
    const rows = filteredLogs(portal);
    const result = pager(rows, portal, "维护日志");
    const id = portal === "control" ? "T04" : "T14";
    const body = result.rows.map((row, index) => {
      const operationClass = row.action === "开启" ? "is-enabled" : row.action === "维护" ? "is-warning" : "is-hidden";
      return `<tr><td>${(result.page - 1) * state.size + index + 1}</td><td>${escape(row.venue)}</td><td>${escape(row.game)}</td><td>${escape(row.wallet)}</td><td>${escape(row.range)}</td><td><span class="venue599-status ${operationClass}">${escape(row.action)}</span></td><td>${escape(row.operator)}</td><td>${escape(row.operatedAt)}</td><td>${escape(row.reason)}</td>${portal === "control" ? `<td>${escape(row.scope)}</td>` : ""}</tr>`;
    }).join("");
    const table = `<table class="risk-table venue599-table"><thead><tr><th>序号</th><th>维护场馆</th><th>维护游戏</th><th>维护钱包</th><th>维护时间</th><th>操作</th><th>操作人</th><th>操作时间</th><th>维护原因</th>${portal === "control" ? "<th>操作范围</th>" : ""}</tr></thead><tbody>${body || `<tr><td colspan="${portal === "control" ? 10 : 9}" class="venue599-empty">暂无符合条件的数据</td></tr>`}</tbody></table>`;
    return tablePanel(id, "", table, rows.length, portal, "维护日志", result.page, result.totalPages);
  }

  function oldPage() {
    const items = ["游戏列表", "三方游戏币种配置", "游戏线路管理", "游戏厂商管理", "游戏管理", "游戏分组管理", "游戏自动下架日志"];
    if (!items.includes(state.oldTab)) state.oldTab = items[0];
    return `<section class="venue599-old-page" data-venue599-root><header><span>生产功能归档</span><h2>游戏管理(旧)</h2></header><nav class="venue599-old-tabs" aria-label="游戏管理旧功能">${items.map((item) => `<button type="button" class="${state.oldTab === item ? "active" : ""}" data-venue599-old-tab="${escape(item)}">${escape(item)}</button>`).join("")}</nav><div class="venue599-old-content"><strong>${escape(state.oldTab)}</strong><span>页面字段、权限、数据和交互与生产一致，本需求不修改。</span></div></section>`;
  }
  const memberPages = [
    ["member-venue-list-599", "场馆列表"],
    ["member-transfer-599", "转账"],
    ["member-withdraw-599", "提现"]
  ];
  const maintenanceTime = "2026-09-28 02:00 ~ 2026-09-28 05:00";
  const memberWalletNames = ["PG电子", "PP电子", "v8棋牌", "MG电子", "JDB电子", "DG视讯", "AG真人", "KY体育", "旺财电竞", "DB体育", "天成彩票", "DP棋牌", "PM捕鱼", "旺财电子", "旺财捕鱼", "旺财棋牌", "旺财彩票", "旺财电子", "旺财体育", "QuickGame"];

  function memberPrototypeNav(page) {
    return `<nav class="member-mobile-prototype-nav venue599-member-nav" aria-label="会员端原型页面切换"><span>会员端页面</span><div>${memberPages.map(([key, name]) => `<a class="${page.key === key ? "active" : ""}" href="#requirement/%23599/page/${key}">${name}</a>`).join("")}</div><small>原型评审导航，不属于生产功能</small></nav>`;
  }
  function memberHeader(title) {
    return `<div class="venue599-member-status"><strong>18:30</strong><span>● ● ●　87%</span></div><header class="venue599-member-header"><button type="button" aria-label="返回">‹</button><strong>${escape(title)}</strong><button type="button" aria-label="搜索" class="venue599-member-search"></button></header>`;
  }
  function maintenanceCover() {
    return `<div class="venue599-maintenance-cover"><strong>维护中</strong><span>${maintenanceTime}</span></div>`;
  }
  function memberVenuePage() {
    const categories = [["热", "热门"], ["哈", "哈希"], ["体", "体育"], ["真", "真人"], ["棋", "棋牌"], ["竞", "电竞"], ["彩", "彩票"], ["电", "电子"], ["鱼", "捕鱼"]];
    const cards = [
      ["venue-saba.png", "沙巴体育", false],
      ["venue-ky.png", "KY体育", true],
      ["venue-wc.png", "旺财体育", false],
      ["venue-dog.png", "狗蛋体育", false]
    ];
    return `<section ${annotate("M01", "venue599-member-screen venue599-member-venue-screen")}>${badge("M01")}${memberHeader("体育场馆")}<div class="venue599-member-venue-body"><nav class="venue599-member-categories">${categories.map(([icon, name]) => `<button type="button" class="${name === "体育" ? "active" : ""}"><i>${icon}</i><span>${name}</span></button>`).join("")}</nav><div class="venue599-member-venue-list">${cards.map(([asset, name, maintained]) => `<article class="venue599-member-venue-card${maintained ? " is-maintenance" : ""}"><img src="./assets/599/${asset}" alt="${escape(name)}" />${maintained ? maintenanceCover() : ""}</article>`).join("")}</div></div></section>`;
  }
  function memberWalletGrid() {
    return `<div class="venue599-member-wallet-grid">${memberWalletNames.map((name) => `<article class="${name === "PP电子" ? "is-maintenance" : ""}"><strong>${escape(name)}</strong><b>¥0.00</b>${name === "PP电子" ? '<span class="venue599-member-wallet-maintenance">维护</span>' : ""}</article>`).join("")}</div>`;
  }
  function memberTransferPage() {
    return `<section ${annotate("M03", "venue599-member-screen venue599-member-wallet-screen")}>${badge("M03")}${memberHeader("转账")}<div class="venue599-member-balance"><span>中心钱包余额</span><strong>¥12,680.00</strong><button type="button">一键回收</button></div><div class="venue599-member-switch-row"><span>隐藏无余额场馆</span><button type="button" aria-label="隐藏无余额场馆"></button></div>${memberWalletGrid()}</section>`;
  }
  function memberWithdrawPage() {
    return `<section ${annotate("M04", "venue599-member-screen venue599-member-withdraw-screen")}>${badge("M04")}${memberHeader("提现")}<div class="venue599-member-withdraw-balance"><span>可提现余额</span><strong>¥12,680.00</strong><small>中心钱包 ¥12,680.00</small></div><label class="venue599-member-amount"><span>提现金额</span><input value="1,000.00" readonly /><b>CNY</b></label><h3>选择提现钱包</h3><div class="venue599-member-switch-row"><span>隐藏无余额场馆</span><button type="button" aria-label="隐藏无余额场馆"></button></div>${memberWalletGrid()}<button type="button" class="venue599-member-submit">下一步</button></section>`;
  }
  function memberPage(page) {
    const screens = {
      "member-venue-list-599": memberVenuePage,
      "member-transfer-599": memberTransferPage,
      "member-withdraw-599": memberWithdrawPage
    };
    const screen = (screens[page.key] || memberVenuePage)();
    return `${memberPrototypeNav(page)}<div class="member-mobile-frame venue599-member-phone" data-venue599-root>${screen}</div>`;
  }
  function pageBody(page) {
    if (page.portal === "会员") return memberPage(page);
    if (page.key === "control-game-management-old-599") return oldPage();
    const portal = portalKey(page);
    const content = state.tab === "场馆列表" ? venueTable(portal) : state.tab === "游戏列表" ? gameTable(portal) : state.tab === "钱包列表" ? walletTable(portal) : logTable(portal);
    return `<div class="venue599-page" data-venue599-root>${tabs(page)}${filtersFor(state.tab, portal)}${content}</div>`;
  }
  function render(page, api) {
    activePage = page;
    helpers = api || {};
    if (page.portal === "会员") return pageBody(page);
    if (state.portal !== portalKey(page)) state.selectedGames.clear();
    state.portal = portalKey(page);
    state.tab = page.tabs?.includes(api.activeTab) ? api.activeTab : page.tabs?.[0] || "";
    return pageBody(page);
  }

  function showModal(title, body, options = {}) {
    const footer = options.closeOnly ? "" : `<footer><button type="button" class="secondary-action modal-cancel">取消</button><button type="button" class="main-action venue599-modal-save">${escape(options.saveText || "保存")}</button></footer>`;
    helpers.modal?.(title, body, options.closeOnly ? "关闭" : "保存", footer);
    const dialog = document.querySelector("#modal-root .risk-modal");
    if (!dialog) return null;
    dialog.classList.add("venue599-dialog", ...String(options.className || "").split(/\s+/).filter(Boolean));
    if (options.closeOnly) return dialog;
    dialog.querySelector(".venue599-modal-save")?.addEventListener("click", () => {
      if (options.onSave?.(dialog) === false) return;
      document.getElementById("modal-root").innerHTML = "";
      helpers.rerender?.();
    });
    return dialog;
  }
  function field(label, input, required = false) { return `<label class="venue599-form-field"><span>${required ? '<b>*</b>' : ""}${label}</span>${input}</label>`; }
  function venueByCode(code) { return venues.find((item) => item.code === code); }
  function gameByCode(code) { return games.find((item) => item.code === code); }
  function walletByCode(code) { return wallets.find((item) => item.code === code); }

  function openTypes() {
    const rows = types.map((type, index) => `<tr><td>${index + 1}</td><td><strong>${escape(type)}</strong></td><td><span class="venue599-code">${escape(TYPE_CODES[type] || `TYPE_${index + 1}`)}</span></td><td>${venues.filter((venue) => venue.type === type).length}</td><td><span class="venue599-status is-enabled">启用</span></td></tr>`).join("");
    showModal("场馆类型设置", `<div ${annotate("B01", "venue599-modal-section")}>${badge("B01")}<table class="risk-table"><thead><tr><th>序号</th><th>场馆类型</th><th>接口标识</th><th>场馆数</th><th>状态</th></tr></thead><tbody>${rows}</tbody></table></div>`, { closeOnly: true, className: "venue599-type-dialog" });
  }
  function openVenueForm(venue) {
    const editing = Boolean(venue);
    const nextId = venues.reduce((max, item) => Math.max(max, item.id), 1000) + 1;
    const immutableFields = editing ? "" : `${field("场馆ID", `<input name="id" value="${nextId}" />`, true)}${field("场馆CODE", '<input name="code" placeholder="全局唯一" />', true)}`;
    const walletField = editing ? "" : field("场馆钱包", `<select name="walletCode">${wallets.map((wallet) => `<option value="${escape(wallet.code)}">${escape(wallet.name)}</option>`).join("")}</select>`, true);
    const typeField = field("所属场馆类型", `<select name="type">${types.map((type) => `<option${(venue?.type || types[0]) === type ? " selected" : ""}>${escape(type)}</option>`).join("")}</select>`, true);
    const body = `<form class="venue599-form" data-venue599-form>${immutableFields}${field("场馆名称", `<input name="name" value="${escape(venue?.name || "")}" />`, true)}${field("场馆中文名称", `<input name="cnName" value="${escape(venue?.cnName || "")}" />`, true)}${typeField}${walletField}${field("排序", `<input name="sort" type="number" min="0" value="${venue?.sort ?? 0}" />`, true)}${field("备注", `<textarea name="remark" rows="3" placeholder="请输入备注">${escape(venue?.remark || "")}</textarea>`)}</form><p class="venue599-form-tip">${editing ? "费率在生产【三方场馆设置】维护，授权关系在场馆列表维护。" : "新增后默认禁用，完成配置后再设置开启。"}</p>`;
    showModal(editing ? "编辑场馆" : "新增场馆", body, { className: "venue599-form-dialog", onSave(dialog) {
      const form = dialog.querySelector("form");
      const value = Object.fromEntries(new FormData(form));
      const required = editing ? [value.name, value.cnName] : [value.code, value.name, value.cnName, value.type, value.walletCode];
      if (!required.every((item) => String(item || "").trim())) return notify(dialog, "请完整填写所有必填项");
      if (!editing && venues.some((item) => item.code.toUpperCase() === value.code.trim().toUpperCase())) return notify(dialog, "场馆CODE已存在，请重新填写");
      if (editing) {
        Object.assign(venue, { name: value.name.trim(), cnName: value.cnName.trim(), type: value.type, sort: Number(value.sort), remark: value.remark.trim(), updatedAt: dateTime() });
        games.filter((game) => game.venueCode === venue.code).forEach((game) => { game.venueName = venue.name; game.type = venue.type; });
      }
      else venues.unshift({ id: Number(value.id), code: value.code.trim().toUpperCase(), name: value.name.trim(), cnName: value.cnName.trim(), type: value.type, walletCode: value.walletCode, sort: Number(value.sort), remark: value.remark.trim(), updatedAt: dateTime(), globalStatus: "enabled", authorizedSites: [], authorizedAt: {}, siteStatuses: {}, providers: [], games: [] });
      return true;
    }});
  }
  function notify(dialog, message) {
    let error = dialog.querySelector(".venue599-form-error");
    if (!error) { error = document.createElement("p"); error.className = "venue599-form-error"; dialog.querySelector(".modal-body").prepend(error); }
    error.textContent = message;
    return false;
  }
  function openVenueDetail(venue) {
    const items = [["场馆ID", venue.id], ["场馆CODE", venue.code], ["场馆中文名称", venue.cnName], ["场馆类型", venue.type], ["关联钱包", venue.walletCode], ["排序", venue.sort], ["全局状态", STATUS[venue.globalStatus].label], ["授权站点", venue.authorizedSites.join("、") || "无"], ["备注", venue.remark || "-"]];
    showModal(`场馆详情 - ${venue.name}`, `<dl class="venue599-detail-list">${items.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>`, { closeOnly: true, className: "venue599-detail-dialog" });
  }

  function rateEditorHtml(venue, site) {
    return `<div class="venue599-rate-editor" data-venue599-rate-editor><div class="venue599-rate-context"><span>所属站点</span><strong>${escape(site)}</strong><span>计费场馆</span><strong>${escape(venue.name)}</strong></div>${subjectCodes(venue).map((provider) => {
      const rows = rateConfigs.get(`${site}|${venue.code}|${provider}`) || [{ start: 0, end: null, rate: "" }];
      return `<section class="venue599-rate-subject" data-provider="${escape(provider)}"><header><div><strong>${provider ? `Provider：${escape(provider)}` : "场馆计费"}</strong><span>${provider ? `${escape(venue.name)}按Provider分别结算` : "按场馆整体结算"}</span></div><button type="button" class="secondary-action" data-venue599-add-tier>增加档位</button></header><div class="venue599-tier-head"><span>档位</span><span>起始金额 CNY</span><span>封顶金额 CNY</span><span>费率</span><span>操作</span></div><div data-venue599-tier-list>${rows.map((row, index) => tierRow(row, index)).join("")}</div></section>`;
    }).join("")}<div class="venue599-rate-note"><strong>档位依据</strong><span>按本结算周期的平台视角场馆总输赢匹配，不按投注金额匹配。</span></div></div>`;
  }
  function tierRow(row, index) {
    return `<div class="venue599-tier-row"><span>档位${index + 1}</span><input type="number" min="0" step="1" data-tier="start" value="${row.start}" ${index === 0 ? "readonly" : ""} /><input type="number" min="0" step="1" data-tier="end" value="${row.end ?? ""}" placeholder="留空表示无上限" /><label><input type="number" min="0" max="100" step="0.0001" data-tier="rate" value="${row.rate}" /><b>%</b></label><button type="button" data-venue599-remove-tier ${index === 0 ? "disabled" : ""}>删除</button></div>`;
  }
  function bindRateEditor(dialog) {
    dialog.querySelectorAll("[data-venue599-add-tier]").forEach((button) => button.addEventListener("click", () => {
      const list = button.closest("section").querySelector("[data-venue599-tier-list]");
      const previous = list.lastElementChild;
      const end = Number(previous.querySelector('[data-tier="end"]').value);
      if (!Number.isInteger(end) || end < Number(previous.querySelector('[data-tier="start"]').value)) { notify(dialog, "请先填写上一档有效的封顶金额"); return; }
      previous.insertAdjacentHTML("afterend", tierRow({ start: end + 1, end: null, rate: "" }, list.children.length));
      bindTierRemove(dialog);
    }));
    bindTierRemove(dialog);
  }
  function bindTierRemove(dialog) {
    dialog.querySelectorAll("[data-venue599-remove-tier]:not([data-bound])").forEach((button) => {
      button.dataset.bound = "true";
      button.addEventListener("click", () => button.closest(".venue599-tier-row").remove());
    });
  }
  function readRateEditor(dialog) {
    const result = new Map();
    for (const subject of dialog.querySelectorAll(".venue599-rate-subject")) {
      const provider = subject.dataset.provider;
      const ranges = [];
      let expectedStart = 0;
      const rows = [...subject.querySelectorAll(".venue599-tier-row")];
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const start = Number(row.querySelector('[data-tier="start"]').value);
        const endText = row.querySelector('[data-tier="end"]').value;
        const end = endText === "" ? null : Number(endText);
        const rateText = row.querySelector('[data-tier="rate"]').value;
        const rate = Number(rateText);
        if (!Number.isInteger(start) || start !== expectedStart) return { error: `档位${index + 1}起始金额应为${expectedStart}` };
        if (end !== null && (!Number.isInteger(end) || end < start)) return { error: `档位${index + 1}封顶金额无效` };
        if (end === null && index !== rows.length - 1) return { error: "只有最后一档可以不设上限" };
        if (index === rows.length - 1 && end !== null) return { error: "最后一档封顶金额必须留空，确保档位完整覆盖" };
        if (!Number.isFinite(rate) || rate < 0 || rate > 100) return { error: `档位${index + 1}费率必须在0%至100%之间` };
        if (!/^\d+(?:\.\d{1,4})?$/.test(rateText)) return { error: `档位${index + 1}费率最多保留四位小数` };
        ranges.push({ start, end, rate });
        if (end !== null) expectedStart = end + 1;
      }
      result.set(provider, ranges);
    }
    return { result };
  }
  function openRate(venue, site = venue.authorizedSites[0] || SITES[0]) {
    const dialog = showModal(`场馆费率设置 - ${venue.name}`, `<div ${annotate("B03", "venue599-modal-section")}>${badge("B03")}${rateEditorHtml(venue, site)}</div>`, { className: "venue599-rate-dialog", saveText: "保存费率", onSave(current) {
      const parsed = readRateEditor(current);
      if (parsed.error) return notify(current, parsed.error);
      parsed.result.forEach((ranges, provider) => rateConfigs.set(`${site}|${venue.code}|${provider}`, ranges));
      venue.updatedAt = dateTime();
      return true;
    }});
    if (dialog) bindRateEditor(dialog);
  }
  function siteDirectoryRow(venue, site, rateOnly) {
    const authorized = isAuthorized(venue, site);
    const feeReady = configured(venue, site);
    const status = venue.siteStatuses[site] || "maintenance_hide";
    const actions = rateOnly
      ? `<button type="button" data-auth-view="${escape(site)}" ${feeReady ? "" : "disabled"}>查看费率</button>`
      : (authorized ? `<button type="button" class="danger" data-auth-cancel="${escape(site)}">取消授权</button>` : `<button type="button" class="primary" data-auth-create="${escape(site)}">授权</button>`);
    return `<tr data-auth-row="${escape(site)}"><td>${escape(site)}</td><td><span class="venue599-code">${SITE_IDS[site]}</span></td><td>${authorized ? statusTag(status) : "-"}</td><td>${feeReady ? '<span class="venue599-status is-enabled">已配置</span>' : '<span class="venue599-status is-hidden">未配置</span>'}</td><td>${authorized ? '<span class="venue599-status is-enabled">已授权</span>' : '<span class="venue599-status is-neutral">未授权</span>'}</td><td>${escape(venue.authorizedAt?.[site] || "-")}</td><td class="venue599-auth-actions">${actions}</td></tr>`;
  }
  function confirmSiteAuthorization(venue, site, authorize) {
    const action = authorize ? "授权" : "取消授权";
    const detail = authorize
      ? `确认向站点【${escape(site)}】授权场馆【${escape(venue.name)}】？授权后，该站点可以展示此场馆及其游戏。`
      : `确认取消站点【${escape(site)}】的场馆【${escape(venue.name)}】授权？取消后，该站点不再展示此场馆及其游戏；已经产生的场馆费仍继续计算。`;
    showModal(`确认${action}`, `<div class="venue599-confirm-copy"><strong>请确认${action}操作</strong><p>${detail}</p></div>`, { className: "venue599-confirm-dialog", saveText: `确认${action}`, onSave() {
      if (authorize) {
        venue.authorizedSites.push(site);
        venue.authorizedAt[site] = dateTime();
        venue.siteStatuses[site] = venue.siteStatuses[site] || "maintenance_hide";
        games.filter((game) => game.venueCode === venue.code).forEach((game) => { if (!game.authSites.includes(site)) game.authSites.push(site); });
      } else {
        venue.authorizedSites = venue.authorizedSites.filter((item) => item !== site);
        delete venue.authorizedAt[site];
        games.filter((game) => game.venueCode === venue.code).forEach((game) => { game.authSites = game.authSites.filter((item) => item !== site); });
      }
      document.getElementById("modal-root").innerHTML = "";
      openAuthorization(venue);
      helpers.rerender?.();
      return false;
    }});
  }
  function bindSiteDirectory(dialog, venue) {
    dialog?.querySelectorAll("[data-auth-create]").forEach((button) => button.addEventListener("click", () => {
      const site = button.dataset.authCreate;
      if (!configured(venue, site)) { notify(dialog, "请先配置场馆费率后再授权"); return; }
      confirmSiteAuthorization(venue, site, true);
    }));
    dialog?.querySelectorAll("[data-auth-cancel]").forEach((button) => button.addEventListener("click", () => {
      const site = button.dataset.authCancel;
      confirmSiteAuthorization(venue, site, false);
    }));
    dialog?.querySelectorAll("[data-auth-view]").forEach((button) => button.addEventListener("click", () => {
      document.getElementById("modal-root").innerHTML = "";
      openSiteRate(venue, button.dataset.authView);
    }));
    dialog?.querySelector("[data-auth-search]")?.addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      dialog.querySelectorAll("[data-auth-row]").forEach((row) => { row.hidden = !row.dataset.authRow.toLowerCase().includes(query) && !row.children[1].textContent.includes(query); });
    });
  }
  function siteDirectory(venue, rateOnly = false) {
    return `<div ${annotate(rateOnly ? "B03" : "B04", "venue599-auth-list")}>${badge(rateOnly ? "B03" : "B04")}<div class="venue599-auth-toolbar"><label><span>站点名称 / ID</span><input data-auth-search placeholder="请输入站点名称或ID" /></label><span>共 ${SITES.length} 个站点</span></div><div class="venue599-auth-table-wrap"><table class="risk-table venue599-auth-table"><thead><tr><th>站点名称</th><th>站点ID</th><th>场馆状态</th><th>场馆费率</th><th>授权状态</th><th>授权时间</th><th>操作</th></tr></thead><tbody>${SITES.map((site) => siteDirectoryRow(venue, site, rateOnly)).join("")}</tbody></table></div>${rateOnly ? '<p class="venue599-form-tip">费率在生产【三方场馆设置】维护，此处仅查看当前配置。</p>' : ""}</div>`;
  }
  function openRateDirectory(venue) {
    const dialog = showModal(`场馆费率 - ${venue.name}`, siteDirectory(venue, true), { closeOnly: true, className: "venue599-auth-dialog" });
    bindSiteDirectory(dialog, venue);
  }
  function openSiteRate(venue, site = currentSite()) {
    const subjects = subjectCodes(venue).map((provider) => {
      const rows = rateConfigs.get(`${site}|${venue.code}|${provider}`) || [];
      const body = rows.map((row, index) => `<tr><td>档位${index + 1}</td><td>${row.start.toLocaleString("zh-CN")}</td><td>${row.end === null ? "无上限" : row.end.toLocaleString("zh-CN")}</td><td><strong>${row.rate}%</strong></td></tr>`).join("");
      return `<section class="venue599-rate-view-subject"><header><strong>${provider ? `Provider：${escape(provider)}` : "场馆计费"}</strong></header><table class="risk-table venue599-rate-view-table"><thead><tr><th>档位</th><th>起始金额 CNY</th><th>封顶金额 CNY</th><th>费率</th></tr></thead><tbody>${body || '<tr><td colspan="4" class="venue599-empty">暂未配置费率</td></tr>'}</tbody></table></section>`;
    }).join("");
    showModal(`场馆费率 - ${venue.name}`, `<div class="venue599-rate-view"><div class="venue599-rate-context"><span>所属站点</span><strong>${escape(site)}</strong><span>计费场馆</span><strong>${escape(venue.name)}</strong></div>${subjects}<div class="venue599-rate-note"><strong>档位依据</strong><span>按本结算周期的平台视角场馆总输赢匹配，不按投注金额匹配。</span></div></div>`, { closeOnly: true, className: "venue599-rate-view-dialog" });
  }
  function openAuthorization(venue) {
    const dialog = showModal(`授权管理 - ${venue.name}`, siteDirectory(venue, false), { closeOnly: true, className: "venue599-auth-dialog" });
    bindSiteDirectory(dialog, venue);
  }
  function siteChoices(defaultSites = [], eligibleSites = SITES) {
    return `<div class="venue599-site-choices"><label class="venue599-site-all"><input type="checkbox" data-site-all ${eligibleSites.length > 0 && eligibleSites.every((site) => defaultSites.includes(site)) ? "checked" : ""} />全选可选站点</label><div>${SITES.map((site) => `<label class="${eligibleSites.includes(site) ? "" : "is-unavailable"}"><input type="checkbox" name="site" value="${escape(site)}" ${defaultSites.includes(site) ? "checked" : ""} ${eligibleSites.includes(site) ? "" : "disabled"} />${escape(site)}${eligibleSites.includes(site) ? "" : "（未授权）"}</label>`).join("")}</div></div>`;
  }
  function bindSiteChoices(dialog) {
    const all = dialog?.querySelector("[data-site-all]");
    const available = () => [...(dialog?.querySelectorAll('input[name="site"]:not(:disabled)') || [])];
    all?.addEventListener("change", () => { available().forEach((item) => { item.checked = all.checked; }); });
    dialog?.querySelectorAll('input[name="site"]').forEach((item) => item.addEventListener("change", () => {
      const choices = available();
      if (all) all.checked = choices.length > 0 && choices.every((choice) => choice.checked);
    }));
  }
  function selectedSites(dialog, portal) {
    return portal === "site" ? [currentSite()] : [...dialog.querySelectorAll('input[name="site"]:checked')].map((item) => item.value);
  }
  function openAuthorizeAll() {
    const dialog = showModal("全部授权场馆", `<div ${annotate("B04", "venue599-bulk-auth")}>${badge("B04")}<p class="venue599-form-tip">将授权全部场馆给所选站点</p>${siteChoices()}</div>`, { className: "venue599-status-dialog", saveText: "确认授权", onSave(current) {
      const sites = selectedSites(current, "control");
      if (!sites.length) return notify(current, "请至少选择一个站点");
      const missing = venues.filter((venue) => sites.some((site) => !configured(venue, site)));
      if (missing.length) return notify(current, `有${missing.length}个场馆未完成所选站点的费率配置，请先到三方场馆设置配置费率`);
      venues.forEach((venue) => sites.forEach((site) => {
        if (!venue.authorizedSites.includes(site)) venue.authorizedSites.push(site);
        venue.authorizedAt[site] ||= dateTime();
        venue.siteStatuses[site] ||= "maintenance_hide";
        games.filter((game) => game.venueCode === venue.code).forEach((game) => { if (!game.authSites.includes(site)) game.authSites.push(site); });
      }));
      return true;
    }});
    bindSiteChoices(dialog);
  }

  function openGameAuthorization(game) {
    const venue = venueByCode(game.venueCode);
    const row = (site) => {
      const venueAuthorized = isAuthorized(venue, site);
      const gameAuthorized = game.authSites.includes(site);
      const action = !venueAuthorized ? '<span class="venue599-auth-tip">需先授权场馆</span>' : gameAuthorized ? `<button type="button" class="danger" data-game-auth-cancel="${escape(site)}">取消授权</button>` : `<button type="button" class="primary" data-game-auth-create="${escape(site)}">授权游戏</button>`;
      return `<tr><td>${escape(site)}</td><td><span class="venue599-code">${SITE_IDS[site]}</span></td><td>${venueAuthorized ? '<span class="venue599-status is-enabled">已授权</span>' : '<span class="venue599-status is-neutral">未授权</span>'}</td><td>${gameAuthorized ? '<span class="venue599-status is-enabled">已授权</span>' : '<span class="venue599-status is-neutral">未授权</span>'}</td><td>${escape(game.authorizedAt?.[site] || (gameAuthorized ? game.updatedAt : "-"))}</td><td class="venue599-auth-actions">${action}</td></tr>`;
    };
    const body = `<div ${annotate("B07", "venue599-auth-list")}>${badge("B07")}<div class="venue599-auth-context"><span>所属场馆</span><strong>${escape(venue.name)}</strong><span>游戏</span><strong>${escape(game.name)}</strong></div><div class="venue599-auth-table-wrap"><table class="risk-table venue599-auth-table"><thead><tr><th>站点名称</th><th>站点ID</th><th>场馆授权</th><th>游戏授权</th><th>授权时间</th><th>操作</th></tr></thead><tbody>${SITES.map(row).join("")}</tbody></table></div></div>`;
    const dialog = showModal(`游戏授权管理 - ${game.name}`, body, { closeOnly: true, className: "venue599-auth-dialog venue599-game-auth-dialog" });
    dialog?.querySelectorAll("[data-game-auth-create]").forEach((button) => button.addEventListener("click", () => {
      const site = button.dataset.gameAuthCreate;
      if (!game.authSites.includes(site)) game.authSites.push(site);
      game.authorizedAt[site] = dateTime();
      document.getElementById("modal-root").innerHTML = "";
      openGameAuthorization(game);
    }));
    dialog?.querySelectorAll("[data-game-auth-cancel]").forEach((button) => button.addEventListener("click", () => {
      const site = button.dataset.gameAuthCancel;
      game.authSites = game.authSites.filter((item) => item !== site);
      document.getElementById("modal-root").innerHTML = "";
      openGameAuthorization(game);
    }));
  }

  function openStatus(kind, row, portal) {
    const current = portal === "site" ? (row.siteStatuses[currentSite()] || "enabled") : (row.globalStatus || "enabled");
    const starts = new Date(); starts.setMinutes(starts.getMinutes() + 5);
    const ends = new Date(starts); ends.setHours(ends.getHours() + 3);
    const id = portal === "control" ? (kind === "场馆" ? "B05" : "B07") : (kind === "场馆" ? "B11" : "B12");
    const options = kind === "场馆" ? STATUS : GAME_STATUS;
    const choices = Object.entries(options).map(([value, item]) => `<label><input type="radio" name="status" value="${value}" ${current === value ? "checked" : ""} />${item.label}</label>`).join("");
    const fields = kind === "场馆" ? `<div class="venue599-maintenance-fields">${field("维护开始时间", `<input type="datetime-local" name="start" value="${localInputTime(starts)}" />`, true)}${field("维护结束时间", `<input type="datetime-local" name="end" value="${localInputTime(ends)}" />`, true)}${field("维护原因", '<textarea name="reason" rows="3" placeholder="请输入维护原因"></textarea>', true)}</div>` : "";
    const tip = kind === "场馆" ? "维护：保留前端展示但不可进入场馆；禁用：前端不展示场馆。" : "停用：前端不展示游戏。";
    const body = `<form class="venue599-status-form" data-status-form><div ${annotate(id, "venue599-status-choice")}>${badge(id)}${choices}</div>${fields}<p class="venue599-form-tip">${tip}</p></form>`;
    const dialog = showModal(`${kind}状态 - ${row.name}`, body, { className: "venue599-status-dialog", saveText: "确认", onSave(currentDialog) {
      const form = currentDialog.querySelector("form");
      const value = Object.fromEntries(new FormData(form));
      if (!value.status) return notify(currentDialog, "请选择要设置的状态");
      if (kind === "场馆" && value.status === "maintenance_show" && (!value.start || !value.end || !value.reason.trim())) return notify(currentDialog, "设置维护时需填写完整时间范围和维护原因");
      if (kind === "场馆" && value.status === "maintenance_show" && value.start >= value.end) return notify(currentDialog, "维护开始时间必须早于结束时间");
      const targets = portal === "control" ? SITES : [currentSite()];
      if (portal === "control") row.globalStatus = value.status;
      targets.forEach((site) => { row.siteStatuses[site] = value.status; });
      const venue = kind === "场馆" ? row.name : row.venueName;
      logs.unshift({ id: `ML${Date.now()}`, targetType: kind, venue, game: kind === "游戏" ? row.name : "-", wallet: "-", range: value.status === "maintenance_show" ? `${value.start.replace("T", " ")}:00 至 ${value.end.replace("T", " ")}:00` : "-", action: options[value.status].label === "启用" ? "开启" : options[value.status].label, display: options[value.status].label, operator: portal === "control" ? "admin" : "site_xy_ops", operatedAt: dateTime(), reason: value.reason?.trim() || "-", scope: portal === "control" ? "全站点" : currentSite() });
      return true;
    }});
    const refreshFields = () => {
      const maintenance = dialog.querySelector('input[name="status"]:checked')?.value === "maintenance_show";
      const fields = dialog.querySelector(".venue599-maintenance-fields");
      if (fields) fields.hidden = !maintenance;
    };
    dialog?.querySelectorAll('input[name="status"]').forEach((input) => input.addEventListener("change", refreshFields));
    refreshFields();
  }

  function openGameBulk(mode, portal) {
    const selected = mode === "selected" ? games.filter((game) => state.selectedGames.has(game.code)) : [];
    if (mode === "selected" && !selected.length) {
      showModal("批量设置游戏", '<p class="venue599-form-tip">请先在游戏列表勾选要操作的游戏。</p>', { closeOnly: true });
      return;
    }
    const availableVenues = portal === "site" ? venues.filter((venue) => venue.authorizedSites.includes(currentSite())) : venues;
    const venuePicker = mode === "venue" ? `<label class="venue599-form-field"><span>选择场馆</span><select name="venueCode"><option value="">请选择场馆</option>${availableVenues.map((venue) => `<option value="${escape(venue.code)}">${escape(venue.name)}</option>`).join("")}</select></label>` : `<p class="venue599-site-fixed">已选 ${selected.length} 个游戏</p>`;
    const scopeTip = portal === "control" ? "全部站点" : "本站";
    const body = `<form class="venue599-game-bulk-form" data-status-form>${venuePicker}<div class="venue599-status-choice"><label><input type="radio" name="status" value="enabled" checked />启用</label><label><input type="radio" name="status" value="maintenance_hide" />停用</label></div><p class="venue599-form-tip">${mode === "venue" ? `将同步所选场馆下全部游戏在${scopeTip}的状态，不受当前列表筛选和分页限制。` : `将同步所选游戏在${scopeTip}的状态。`}</p></form>`;
    const dialog = showModal(mode === "venue" ? "整场馆游戏启停" : "批量设置选中游戏", body, { className: "venue599-status-dialog", saveText: "确认", onSave(current) {
      const form = current.querySelector("form");
      const value = Object.fromEntries(new FormData(form));
      const targetGames = mode === "venue" ? games.filter((game) => game.venueCode === value.venueCode) : selected;
      if (mode === "venue" && !value.venueCode) return notify(current, "请先选择场馆");
      if (!targetGames.length) return notify(current, "所选场馆下暂无游戏");
      const sites = portal === "control" ? SITES : [currentSite()];
      targetGames.forEach((game, gameIndex) => {
        if (portal === "control") game.globalStatus = value.status;
        sites.forEach((site) => { game.siteStatuses[site] = value.status; });
        logs.unshift({ id: `ML${Date.now()}${game.code}${gameIndex}`, targetType: "游戏", venue: game.venueName, game: game.name, wallet: "-", range: "-", action: GAME_STATUS[value.status].label === "启用" ? "开启" : "停用", display: GAME_STATUS[value.status].label, operator: portal === "control" ? "admin" : "site_xy_ops", operatedAt: dateTime(), reason: "-", scope: portal === "control" ? "全站点" : currentSite() });
      });
      state.selectedGames.clear();
      return true;
    }});
  }

  function openGameForm(game) {
    const editing = Boolean(game);
    const body = `<form class="venue599-form venue599-game-form">${field("游戏名称", `<input name="name" value="${escape(game?.name || "")}" />`, true)}${field("游戏场馆", `<select name="venueCode">${venues.map((venue) => `<option value="${escape(venue.code)}"${game?.venueCode === venue.code ? " selected" : ""}>${escape(venue.name)}</option>`).join("")}</select>`, true)}${field("游戏CODE", `<input name="code" value="${escape(game?.code || "")}" ${editing ? "disabled" : ""} />`, true)}${field("支持平台", `<span class="venue599-platform-checks">${["WEB", "H5", "APP"].map((platform) => `<label><input type="checkbox" name="platform" value="${platform}" ${!game || game.platforms.includes(platform) ? "checked" : ""} />${platform}</label>`).join("")}</span>`, true)}${field("WEB游戏图片", '<button type="button" class="venue599-upload">上传WEB图片</button>')}${field("移动端游戏图片", '<button type="button" class="venue599-upload">上传移动端图片</button>')}${field("排序", `<input name="sort" type="number" min="0" value="${game?.sort ?? 0}" />`, true)}${field("品牌", `<input name="brand" value="${escape(game?.brand || "")}" />`)}${field("热门排序", `<input name="hotSort" type="number" min="0" value="${game?.hotSort ?? 0}" />`)}${field("热门置顶", `<select name="hot"><option value="false">否</option><option value="true" ${game?.hot ? "selected" : ""}>是</option></select>`)}</form><p class="venue599-form-tip">H5与APP共用移动端游戏图片；新增游戏默认停用。</p>`;
    showModal(editing ? "编辑游戏" : "新增游戏", body, { className: "venue599-form-dialog venue599-game-dialog", onSave(dialog) {
      const form = dialog.querySelector("form");
      const value = Object.fromEntries(new FormData(form));
      const platforms = [...form.querySelectorAll('input[name="platform"]:checked')].map((item) => item.value);
      if (!value.name?.trim() || (!editing && !value.code?.trim()) || !platforms.length) return notify(dialog, "请完整填写必填项，并至少选择一个支持平台");
      const venue = venueByCode(value.venueCode);
      if (!editing && games.some((item) => item.code.toUpperCase() === value.code.trim().toUpperCase())) return notify(dialog, "游戏CODE已存在，请重新填写");
      if (editing) Object.assign(game, { name: value.name.trim(), venueCode: venue.code, venueName: venue.name, type: venue.type, platforms, sort: Number(value.sort), hot: value.hot === "true", hotSort: Number(value.hotSort), brand: value.brand.trim(), updatedAt: dateTime(), updatedBy: "admin", authSites: [...venue.authorizedSites], siteStatuses: game.venueCode === venue.code ? game.siteStatuses : Object.fromEntries(venue.authorizedSites.map((site) => [site, "maintenance_hide"])) });
      else games.unshift({ id: value.code.trim(), code: value.code.trim().toUpperCase(), name: value.name.trim(), venueCode: venue.code, venueName: venue.name, type: venue.type, platforms, sort: Number(value.sort), brand: value.brand.trim(), hot: value.hot === "true", hotSort: Number(value.hotSort), globalStatus: "enabled", createdBy: "admin", createdAt: dateTime(), updatedBy: "admin", updatedAt: dateTime(), authSites: [...venue.authorizedSites], authorizedAt: {}, siteStatuses: Object.fromEntries(venue.authorizedSites.map((site) => [site, "maintenance_hide"])) });
      return true;
    }});
  }
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (xlsxPromise) return xlsxPromise;
    xlsxPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./assets/vendor/xlsx-0.20.3.min.js";
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => { xlsxPromise = null; script.remove(); reject(new Error("Excel组件加载失败")); };
      document.head.appendChild(script);
    });
    return xlsxPromise;
  }
  async function downloadTemplate() {
    try {
      const xlsx = await loadXlsx();
      const sheet = xlsx.utils.aoa_to_sheet([
        ["游戏场馆", "游戏名称", "游戏CODE", "支持平台", "排序", "品牌"],
        ["PG电子", "示例游戏", "PG-DEMO-001", "WEB|H5|APP", 100, "PG"]
      ]);
      sheet["!cols"] = [{ wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 10 }, { wch: 16 }];
      const book = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(book, sheet, "游戏导入模板");
      xlsx.writeFile(book, "游戏批量新增模板.xlsx", { compression: true });
    } catch (error) {
      const dialog = document.querySelector(".venue599-import-dialog");
      if (dialog) notify(dialog, error.message || "模板下载失败，请稍后重试");
    }
  }
  function openBatchGame() {
    const dialog = showModal("批量新增游戏", `<div class="venue599-import"><ol><li><strong>1</strong><div><b>下载模板</b><span>单次最多500条，游戏CODE全局唯一。</span></div><button type="button" class="secondary-action" data-venue599-template>下载模板</button></li><li><strong>2</strong><div><b>上传填写后的文件</b><span>支持.xlsx；整份校验通过后才能提交。</span></div><label class="venue599-file-button">选择文件<input type="file" accept=".xlsx,.xls,.csv" data-venue599-file /></label></li><li><strong>3</strong><div><b>补充游戏图片</b><span>导入成功后通过编辑补充WEB、H5图片，APP复用H5图片。</span></div></li></ol><div class="venue599-import-result" hidden></div></div>`, { className: "venue599-import-dialog", saveText: "开始导入", onSave(current) {
      const file = current.querySelector("[data-venue599-file]").files[0];
      if (!file) return notify(current, "请先选择需要导入的文件");
      games.unshift({ id: `IMPORT-${Date.now()}`, code: `IMPORT-G${Date.now().toString().slice(-4)}`, name: "批量导入示例游戏", venueCode: venues[0].code, venueName: venues[0].name, type: venues[0].type, platforms: ["WEB", "H5", "APP"], sort: 100, brand: "导入示例", hot: false, hotSort: 0, globalStatus: "enabled", createdBy: "admin", createdAt: dateTime(), updatedBy: "admin", updatedAt: dateTime(), authSites: [...venues[0].authorizedSites], authorizedAt: {}, siteStatuses: Object.fromEntries(venues[0].authorizedSites.map((site) => [site, "maintenance_hide"])) });
      return true;
    }});
    dialog?.querySelector("[data-venue599-template]")?.addEventListener("click", downloadTemplate);
    dialog?.querySelector("[data-venue599-file]")?.addEventListener("change", (event) => {
      const result = dialog.querySelector(".venue599-import-result");
      const file = event.target.files[0];
      result.hidden = !file;
      if (file) result.innerHTML = `<strong>校验通过</strong><span>${escape(file.name)} · 共1条有效数据</span>`;
    });
  }

  function openWalletForm(wallet) {
    const venueField = field("关联场馆", `<div class="venue599-related-venues">${wallet.venueCodes.map((code) => `<span>${escape(venueByCode(code)?.name || code)}</span>`).join("")}</div>`, true);
    const body = `<form class="venue599-form venue599-wallet-form">${venueField}${field("场馆CODE", `<input name="code" value="${escape(wallet.venueCodes.join("、"))}" readonly />`, true)}${field("钱包名称", `<input name="name" value="${escape(wallet.name)}" />`, true)}</form>`;
    showModal("编辑钱包", body, { className: "venue599-form-dialog", onSave(current) {
      const value = Object.fromEntries(new FormData(current.querySelector("form")));
      if (!value.name?.trim()) return notify(current, "钱包名称不能为空");
      wallet.name = value.name.trim();
      wallet.updatedAt = dateTime();
      return true;
    }});
  }
  function openWalletStatus(wallet) {
    const locking = wallet.status === "normal";
    showModal(`${locking ? "锁定" : "解锁"}钱包 - ${wallet.name}`, `<div ${annotate("B08", "venue599-wallet-confirm")}>${badge("B08")}<p>${locking ? "锁定后禁止会员新进入关联场馆并禁止新上分；系统强制所有此场馆用户下分。" : "解锁后恢复相关场馆的进入和上分能力。"}</p><dl><div><dt>场馆CODE</dt><dd>${wallet.venueCodes.map(escape).join("、")}</dd></div><div><dt>关联场馆</dt><dd>${wallet.venueCodes.map((code) => escape(venueByCode(code)?.name || code)).join("、")}</dd></div></dl></div>`, { className: "venue599-confirm-dialog", saveText: locking ? "确认锁定" : "确认解锁", onSave() { wallet.status = locking ? "locked" : "normal"; wallet.updatedAt = dateTime(); return true; } });
  }

  function collectFilters(root) {
    const filter = state.filters[state.portal][state.tab];
    root.querySelectorAll("[data-venue599-filter]").forEach((input) => { filter[input.dataset.venue599Filter] = input.value.trim(); });
    state.page[state.portal][state.tab] = 1;
  }
  function handleAction(action, code) {
    const portal = state.portal;
    if (action === "types") return openTypes();
    if (action === "authorize-all") return openAuthorizeAll();
    if (action === "add-venue") return openVenueForm(null);
    if (action === "add-game") return openGameForm(null);
    if (action === "batch-game") return openBatchGame();
    if (action === "selected-games") return openGameBulk("selected", portal);
    if (action === "venue-games") return openGameBulk("venue", portal);
    if (action === "games") {
      const venue = venueByCode(code);
      state.filters[portal]["游戏列表"].venue = venue.name;
      helpers.setTab?.("游戏列表");
      return;
    }
    const venue = venueByCode(code);
    const game = gameByCode(code);
    const wallet = walletByCode(code);
    if (action === "venue-detail") return openVenueDetail(venue);
    if (action === "edit-venue") return openVenueForm(venue);
    if (action === "rate") return openRateDirectory(venue);
    if (action === "view-rate") return openSiteRate(venue);
    if (action === "authorize") return openAuthorization(venue);
    if (action === "status-venue") return openStatus("场馆", venue, portal);
    if (action === "edit-game") return openGameForm(game);
    if (action === "status-game") return openStatus("游戏", game, portal);
    if (action === "edit-wallet") return openWalletForm(wallet);
    if (action === "wallet-status") return openWalletStatus(wallet);
  }

  function bind() {
    document.querySelector("[data-venue599-menu-toggle]")?.addEventListener("click", (event) => {
      state.menuOpen = !state.menuOpen;
      event.currentTarget.setAttribute("aria-expanded", String(state.menuOpen));
      event.currentTarget.querySelector("b")?.classList.toggle("open", state.menuOpen);
      const children = document.querySelector(".venue599-menu-children");
      if (children) children.hidden = !state.menuOpen;
    });
    const root = document.querySelector("[data-venue599-root]");
    if (!root) return;
    root.querySelectorAll("[data-venue599-old-tab]").forEach((button) => button.addEventListener("click", () => { state.oldTab = button.dataset.venue599OldTab; helpers.rerender?.(); }));
    root.querySelectorAll("[data-venue599-tab]").forEach((button) => button.addEventListener("click", () => helpers.setTab?.(button.dataset.venue599Tab)));
    root.querySelector("[data-venue599-search]")?.addEventListener("click", () => { collectFilters(root); helpers.rerender?.(); });
    root.querySelector("[data-venue599-reset]")?.addEventListener("click", () => { state.filters[state.portal][state.tab] = initialFilters(); state.page[state.portal][state.tab] = 1; helpers.rerender?.(); });
    root.querySelectorAll("[data-venue599-action]").forEach((button) => button.addEventListener("click", () => handleAction(button.dataset.venue599Action, button.dataset.code)));
    const pageSelect = root.querySelector("[data-venue599-game-page-select]");
    const pageRows = [...root.querySelectorAll("[data-venue599-game-select]")];
    const updateGameSelection = () => {
      const button = root.querySelector('[data-venue599-action="selected-games"]');
      if (button) button.textContent = `批量设置选中游戏${state.selectedGames.size ? `（${state.selectedGames.size}）` : ""}`;
      if (pageSelect) {
        const checked = pageRows.filter((item) => item.checked).length;
        pageSelect.checked = pageRows.length > 0 && checked === pageRows.length;
        pageSelect.indeterminate = checked > 0 && checked < pageRows.length;
      }
    };
    root.querySelectorAll("[data-venue599-game-select]").forEach((input) => input.addEventListener("change", () => {
      if (input.checked) state.selectedGames.add(input.dataset.venue599GameSelect);
      else state.selectedGames.delete(input.dataset.venue599GameSelect);
      updateGameSelection();
    }));
    pageSelect?.addEventListener("change", (event) => {
      pageRows.forEach((input) => {
        input.checked = event.currentTarget.checked;
        if (input.checked) state.selectedGames.add(input.dataset.venue599GameSelect);
        else state.selectedGames.delete(input.dataset.venue599GameSelect);
      });
      updateGameSelection();
    });
    updateGameSelection();
    root.querySelectorAll("[data-venue599-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; state.page[state.portal][state.tab] = Number(button.dataset.venue599Page); helpers.rerender?.(); }));
    root.querySelector("[data-venue599-size]")?.addEventListener("change", (event) => { state.size = Number(event.target.value); state.page[state.portal][state.tab] = 1; helpers.rerender?.(); });
  }

  window.VenueManagement599 = { render, sidebar, bind };
})();
