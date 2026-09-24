(function () {
  "use strict";

  const SITES = ["XY体育", "拉布布", "WC体育", "CS体育", "YY体育", "NS体育", "DW体育"];
  const SITE_IDS = Object.fromEntries(SITES.map((site, index) => [site, String(1000 + index)]));
  const TYPE_CODES = { 体育: "SPORTS", 真人: "LIVE", 电子: "SLOT", 棋牌: "POKER", 电竞: "ESPORT", 彩票: "LOTTERY", 捕鱼: "FISH", 哈希: "HASH" };
  const STATUS = {
    enabled: { label: "启用", className: "is-enabled" },
    maintenance_show: { label: "维护展示", className: "is-warning" },
    maintenance_hide: { label: "维护不展示", className: "is-hidden" }
  };
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
      globalStatus: index === 3 ? "maintenance_show" : index === 8 ? "maintenance_hide" : "enabled",
      authorizedSites,
      siteStatuses,
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
        globalStatus: gameIndex === 4 && venueIndex % 3 === 0 ? "maintenance_show" : "enabled",
        createdBy: "admin",
        createdAt: `2026-09-${pad(Math.max(1, 23 - (venueIndex % 18)))} 10:${pad(gameIndex % 60)}:00`,
        updatedBy: "admin",
        updatedAt: nowText,
        authSites: venue.authorizedSites.filter((site, index) => (gameIndex + index) % 5 !== 2),
        authorizedAt: {},
        siteStatuses: { ...venue.siteStatuses }
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
    venues.forEach((venue, venueIndex) => venue.authorizedSites.forEach((site, siteIndex) => {
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
    { id: "ML202609240018", targetType: "场馆", venue: "QuickGame电子", game: "-", wallet: "-", range: "2026-09-24 02:00:00 至 2026-09-24 05:00:00", action: "设置维护", display: "维护展示", operator: "admin", operatedAt: "2026-09-23 19:26:10", reason: "上游线路例行维护", scope: "总站" },
    { id: "ML202609240019", targetType: "游戏", venue: "PG电子", game: "麻将胡了", wallet: "-", range: "2026-09-24 09:00:00 至 2026-09-24 12:00:00", action: "设置维护", display: "维护不展示", operator: "site_xy_ops", operatedAt: "2026-09-24 08:55:32", reason: "游戏接口异常", scope: "XY体育" },
    { id: "ML202609240020", targetType: "游戏", venue: "PG电子", game: "麻将胡了", wallet: "-", range: "2026-09-24 09:00:00 至 2026-09-24 12:00:00", action: "设置开启", display: "-", operator: "site_xy_ops", operatedAt: "2026-09-24 11:42:06", reason: "上游服务已恢复", scope: "XY体育" }
  ];

  const initialFilters = () => ({ name: "", type: "", status: "", venue: "", platform: "", code: "", brand: "", remark: "", wallet: "", game: "" });
  const state = {
    portal: "control",
    tab: "场馆列表",
    menuOpen: true,
    page: { control: { 场馆列表: 1, 游戏列表: 1, 钱包列表: 1, 维护日志: 1 }, site: { 场馆列表: 1, 游戏列表: 1, 钱包列表: 1, 维护日志: 1 } },
    size: 10,
    oldTab: "线路管理",
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
    const item = STATUS[effective.value] || STATUS.enabled;
    const action = kind === "场馆" ? "status-venue" : "status-game";
    const source = effective.source ? `<small class="venue599-status-source">${escape(effective.source)}</small>` : "";
    const context = portal === "site" && effective.source?.startsWith("总站") ? "；当前实际状态由总站覆盖" : "";
    return `<button type="button" class="venue599-status-control" data-venue599-action="${action}" data-code="${escape(row.code)}" aria-label="设置${kind}状态${context}" title="点击设置${kind}状态${context}"><span class="venue599-status ${item.className}">${item.label}<i aria-hidden="true"></i></span>${source}</button>`;
  }
  function effectiveStatus(row, portal) {
    if (portal !== "site") return { value: row.globalStatus, source: "" };
    if (row.globalStatus !== "enabled") return { value: row.globalStatus, source: "总站" };
    return { value: row.siteStatuses[currentSite()] || "enabled", source: "本站" };
  }
  function effectiveGameStatus(game, portal) {
    if (portal !== "site") return { value: game.globalStatus, source: "" };
    const venue = venueByCode(game.venueCode);
    if (game.globalStatus !== "enabled") return { value: game.globalStatus, source: "总站游戏" };
    if (venue?.globalStatus !== "enabled") return { value: venue.globalStatus, source: "总站场馆" };
    const gameSiteStatus = game.siteStatuses[currentSite()] || "enabled";
    if (gameSiteStatus !== "enabled") return { value: gameSiteStatus, source: "本站游戏" };
    const venueSiteStatus = venue?.siteStatuses[currentSite()] || "enabled";
    if (venueSiteStatus !== "enabled") return { value: venueSiteStatus, source: "本站场馆" };
    return { value: "enabled", source: "本站" };
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
  function actionButton(label, action, code, extra = "") { return `<button type="button" class="venue599-link" data-venue599-action="${action}" data-code="${escape(code)}" ${extra}>${label}</button>`; }

  function sidebar(page) {
    const site = page.portal === "站点";
    const oldActive = page.key === "control-game-management-old-599";
    const menuItems = site
      ? `<a href="#requirement/%23599/page/site-venue-management-599" class="venue599-menu-item active annotated" data-component-id="N11">${badge("N11")}<span>场馆管理</span><em class="menu-change-badge is-new">新增</em></a>`
      : `<a href="#requirement/%23599/page/control-game-management-old-599" class="venue599-menu-item ${oldActive ? "active" : ""}"><span>游戏管理(旧)</span><em class="menu-change-badge">修改</em></a><a href="#requirement/%23599/page/control-venue-management-599" class="venue599-menu-item ${oldActive ? "" : "active"} annotated" data-component-id="N01">${badge("N01")}<span>场馆管理</span><em class="menu-change-badge is-new">新增</em></a>`;
    return `<aside class="risk-sidebar venue599-sidebar"><div class="venue599-brand"><span>${site ? "S" : "C"}</span><div><strong>${site ? "站点" : "总控"}后台管理系统</strong><small>${site ? currentSite() : "运营管理中心"}</small></div></div><nav><section><button type="button" class="venue599-menu-parent" data-venue599-menu-toggle aria-expanded="${state.menuOpen}"><i aria-hidden="true"></i><span>资源管理</span><b class="${state.menuOpen ? "open" : ""}"></b></button><div class="venue599-menu-children"${state.menuOpen ? "" : " hidden"}>${menuItems}</div></section></nav><div class="risk-user"><span>MK</span><div><strong>Mike</strong><small>${site ? "站点管理员" : "总控管理员"}</small></div></div></aside>`;
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
      ? `<label><span>游戏名称</span><input data-venue599-filter="name" value="${escape(filter.name)}" placeholder="请输入游戏名称" /></label><label><span>支持平台</span><select data-venue599-filter="platform">${selectOptions(["WEB", "H5", "APP"], filter.platform, "全部平台")}</select></label><label><span>状态</span><select data-venue599-filter="status">${selectOptions(Object.entries(STATUS).map(([, item]) => item.label), filter.status, "全部状态")}</select></label><label><span>游戏场馆</span><select data-venue599-filter="venue">${selectOptions(venues.map((item) => item.name), filter.venue, "全部场馆")}</select></label><label><span>场馆类型</span><select data-venue599-filter="type">${selectOptions(types, filter.type, "全部类型")}</select></label>${portal === "control" ? `<label><span>游戏CODE</span><input data-venue599-filter="code" value="${escape(filter.code)}" placeholder="请输入游戏CODE" /></label><label><span>品牌</span><input data-venue599-filter="brand" value="${escape(filter.brand)}" placeholder="请输入品牌" /></label>` : ""}`
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
    return games.filter((game) => portal === "control" || game.authSites.includes(currentSite())).filter((game) => {
      const status = effectiveGameStatus(game, portal).value;
      return matchesText(`${game.name} ${game.code}`, f.name) && (!f.platform || game.platforms.includes(f.platform)) && (!f.status || STATUS[status].label === f.status) && (!f.venue || game.venueName === f.venue) && (!f.type || game.type === f.type) && matchesText(game.code, f.code) && matchesText(game.brand, f.brand);
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
      ? `<div class="venue599-toolbar"><div><button type="button" class="main-action annotated" data-component-id="B02" data-venue599-action="add-venue">${badge("B02")}新增场馆</button><button type="button" class="secondary-action annotated" data-component-id="B01" data-venue599-action="types">${badge("B01")}场馆类型设置</button></div></div>`
      : "";
    const body = result.rows.map((venue, index) => {
      const effective = effectiveStatus(venue, portal);
      const gameCount = games.filter((game) => game.venueCode === venue.code).length;
      const controlActions = `${actionButton("详情", "venue-detail", venue.code)}${actionButton("编辑", "edit-venue", venue.code)}${actionButton("费率设置", "rate", venue.code)}${actionButton("授权管理", "authorize", venue.code)}`;
      const configuredSiteCount = venue.authorizedSites.filter((site) => configured(venue, site)).length;
      return `<tr><td>${(result.page - 1) * state.size + index + 1}</td><td><strong>${escape(venue.name)}</strong></td><td><span class="venue599-code">${escape(venue.code)}</span></td><td>${escape(venue.cnName)}</td><td>${escape(venue.type)}</td><td>${portal === "control" ? `<button type="button" class="venue599-rate-cell" data-venue599-action="rate" data-code="${escape(venue.code)}">${configuredSiteCount ? `${configuredSiteCount}个站点已配置` : "未配置"}</button>` : rateSummary(venue, currentSite())}</td><td>${escape(venue.updatedAt)}</td><td><button type="button" class="venue599-count-link" data-venue599-action="games" data-code="${escape(venue.code)}">${gameCount}</button></td>${portal === "control" ? `<td>${venue.authorizedSites.length}</td>` : ""}<td>${statusControl("场馆", venue, portal, effective)}</td><td>${escape(venue.remark || "-")}</td>${portal === "control" ? `<td class="venue599-actions">${controlActions}</td>` : ""}</tr>`;
    }).join("");
    const headers = `<tr><th>序号</th><th>场馆名称</th><th>场馆CODE</th><th>场馆中文名称</th><th>场馆类型</th><th>场馆费率</th><th>最后更新时间</th><th>游戏数</th>${portal === "control" ? "<th>授权数</th>" : ""}<th>场馆状态</th><th>备注</th>${portal === "control" ? '<th class="venue599-sticky-action">操作</th>' : ""}</tr>`;
    const table = `<table class="risk-table venue599-table venue599-venue-table"><thead>${headers}</thead><tbody>${body || `<tr><td colspan="${portal === "control" ? 12 : 10}" class="venue599-empty">暂无符合条件的数据</td></tr>`}</tbody></table>`;
    return tablePanel(id, toolbar, table, rows.length, portal, "场馆列表", result.page, result.totalPages);
  }

  function gameTable(portal) {
    const rows = filteredGames(portal);
    const result = pager(rows, portal, "游戏列表");
    const id = portal === "control" ? "T02" : "T12";
    const toolbar = portal === "control" ? `<div class="venue599-toolbar"><div><button type="button" class="main-action annotated" data-component-id="B06" data-venue599-action="add-game">${badge("B06")}新增游戏</button><button type="button" class="secondary-action" data-venue599-action="batch-game">批量新增</button></div></div>` : "";
    const body = result.rows.map((game, index) => {
      const effective = effectiveGameStatus(game, portal);
      const actions = `${actionButton("编辑", "edit-game", game.code)}${actionButton("授权管理", "authorize-game", game.code)}`;
      return `<tr><td>${(result.page - 1) * state.size + index + 1}</td><td><strong>${escape(game.name)}</strong></td><td>${escape(game.venueName)}</td><td>${escape(game.type)}</td><td><span class="venue599-code">${escape(game.code)}</span></td><td>${game.platforms.map((item) => `<span class="venue599-platform">${item}</span>`).join("")}</td><td>${game.sort}</td>${portal === "control" ? `<td><span class="venue599-image">WEB</span></td><td><span class="venue599-image">H5 / APP</span></td><td>${game.authSites.length}</td>` : ""}<td>${statusControl("游戏", game, portal, effective)}</td>${portal === "control" ? `<td>${escape(game.brand || "-")}</td><td>${escape(game.createdBy)}<small>${escape(game.createdAt)}</small></td><td>${escape(game.updatedBy)}<small>${escape(game.updatedAt)}</small></td><td class="venue599-actions">${actions}</td>` : ""}</tr>`;
    }).join("");
    const headers = portal === "control"
      ? "<tr><th>序号</th><th>游戏名称</th><th>游戏场馆</th><th>场馆类型</th><th>游戏CODE</th><th>支持平台</th><th>排序</th><th>WEB游戏图片</th><th>H5游戏图片</th><th>授权数</th><th>游戏状态</th><th>品牌</th><th>创建人 / 时间</th><th>最后编辑人 / 时间</th><th class=\"venue599-sticky-action\">操作</th></tr>"
      : "<tr><th>序号</th><th>游戏名称</th><th>游戏场馆</th><th>场馆类型</th><th>游戏CODE</th><th>支持平台</th><th>排序</th><th>游戏状态</th></tr>";
    const table = `<table class="risk-table venue599-table venue599-game-table"><thead>${headers}</thead><tbody>${body || `<tr><td colspan="${portal === "control" ? 15 : 8}" class="venue599-empty">暂无符合条件的数据</td></tr>`}</tbody></table>`;
    return tablePanel(id, toolbar, table, rows.length, portal, "游戏列表", result.page, result.totalPages);
  }

  function walletTable(portal) {
    const rows = filteredWallets(portal);
    const result = pager(rows, portal, "钱包列表");
    const id = portal === "control" ? "T03" : "T13";
    const toolbar = portal === "control" ? `<div class="venue599-toolbar"><button type="button" class="main-action annotated" data-component-id="B08" data-venue599-action="add-wallet">${badge("B08")}新增钱包</button></div>` : "";
    const body = result.rows.map((wallet, index) => {
      const venueNames = wallet.venueCodes.map((code) => venues.find((venue) => venue.code === code)?.name || code);
      const actions = portal === "control" ? `${actionButton("编辑", "edit-wallet", wallet.code)}${actionButton(wallet.status === "normal" ? "锁定钱包" : "解锁钱包", "wallet-status", wallet.code)}${actionButton("删除记录", "delete-wallet", wallet.code)}` : "-";
      return `<tr><td>${(result.page - 1) * state.size + index + 1}</td><td><strong>${escape(wallet.name)}</strong></td><td><span class="venue599-code">${escape(wallet.code)}</span></td><td>${venueNames.map((name) => `<span class="venue599-venue-chip">${escape(name)}</span>`).join("")}</td><td>${new Set(wallet.venueCodes.flatMap((code) => venues.find((venue) => venue.code === code)?.authorizedSites || [])).size}</td><td><span class="venue599-status ${wallet.status === "normal" ? "is-enabled" : "is-hidden"}">${wallet.status === "normal" ? "正常" : "锁定"}</span></td><td class="venue599-actions">${actions}</td></tr>`;
    }).join("");
    const table = `<table class="risk-table venue599-table"><thead><tr><th>序号</th><th>钱包名称</th><th>钱包CODE</th><th>关联场馆</th><th>授权数</th><th>钱包状态</th><th class="venue599-sticky-action">操作</th></tr></thead><tbody>${body || '<tr><td colspan="7" class="venue599-empty">暂无符合条件的数据</td></tr>'}</tbody></table>`;
    return tablePanel(id, toolbar, table, rows.length, portal, "钱包列表", result.page, result.totalPages);
  }

  function logTable(portal) {
    const rows = filteredLogs(portal);
    const result = pager(rows, portal, "维护日志");
    const id = portal === "control" ? "T04" : "T14";
    const body = result.rows.map((row, index) => `<tr><td>${(result.page - 1) * state.size + index + 1}</td><td>${escape(row.venue)}</td><td>${escape(row.game)}</td><td>${escape(row.wallet)}</td><td>${escape(row.range)}</td><td><span class="venue599-log-action">${escape(row.action)}</span></td><td>${escape(row.operator)}</td><td>${escape(row.operatedAt)}</td><td>${escape(row.reason)}</td>${portal === "control" ? `<td>${escape(row.scope)}</td>` : ""}</tr>`).join("");
    const table = `<table class="risk-table venue599-table"><thead><tr><th>序号</th><th>维护场馆</th><th>维护游戏</th><th>维护钱包</th><th>维护时间</th><th>操作</th><th>操作人</th><th>操作时间</th><th>维护原因</th>${portal === "control" ? "<th>操作范围</th>" : ""}</tr></thead><tbody>${body || `<tr><td colspan="${portal === "control" ? 10 : 9}" class="venue599-empty">暂无符合条件的数据</td></tr>`}</tbody></table>`;
    return tablePanel(id, "", table, rows.length, portal, "维护日志", result.page, result.totalPages);
  }

  function oldPage() {
    const items = ["线路管理", "游戏厂商管理", "游戏管理", "游戏分组", "自动下架日志", "三方场馆设置"];
    return `<section class="venue599-old-page" data-venue599-root><header><span>生产功能归档</span><h2>游戏管理(旧)</h2></header><nav class="venue599-old-tabs" aria-label="游戏管理旧功能">${items.map((item) => `<button type="button" class="${state.oldTab === item ? "active" : ""}" data-venue599-old-tab="${escape(item)}">${escape(item)}</button>`).join("")}</nav><div class="venue599-old-content"><strong>${escape(state.oldTab)}</strong><span>页面字段、权限、数据和交互与生产一致，本需求不修改。</span></div></section>`;
  }
  function pageBody(page) {
    if (page.key === "control-game-management-old-599") return oldPage();
    const portal = portalKey(page);
    const content = state.tab === "场馆列表" ? venueTable(portal) : state.tab === "游戏列表" ? gameTable(portal) : state.tab === "钱包列表" ? walletTable(portal) : logTable(portal);
    return `<div class="venue599-page" data-venue599-root>${tabs(page)}${filtersFor(state.tab, portal)}${content}</div>`;
  }
  function render(page, api) {
    activePage = page;
    helpers = api || {};
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
    const createOnlyFields = editing ? "" : `${field("场馆类型", `<select name="type">${types.map((type) => `<option>${escape(type)}</option>`).join("")}</select>`, true)}${field("场馆钱包", `<select name="walletCode">${wallets.map((wallet) => `<option value="${escape(wallet.code)}">${escape(wallet.name)}</option>`).join("")}</select>`, true)}${field("备注", '<textarea name="remark" rows="3" placeholder="请输入备注"></textarea>')}`;
    const body = `<form class="venue599-form" data-venue599-form>${immutableFields}${field("场馆名称", `<input name="name" value="${escape(venue?.name || "")}" />`, true)}${field("场馆中文名称", `<input name="cnName" value="${escape(venue?.cnName || "")}" />`, true)}${createOnlyFields}${field("排序", `<input name="sort" type="number" min="0" value="${venue?.sort ?? 0}" />`, true)}</form><p class="venue599-form-tip">${editing ? "费率和授权关系通过列表中的独立操作维护。" : "新增后默认进入“维护不展示”，配置完整后再设置启用。"}</p>`;
    showModal(editing ? "编辑场馆" : "新增场馆", body, { className: "venue599-form-dialog", onSave(dialog) {
      const form = dialog.querySelector("form");
      const value = Object.fromEntries(new FormData(form));
      const required = editing ? [value.name, value.cnName] : [value.code, value.name, value.cnName, value.type, value.walletCode];
      if (!required.every((item) => String(item || "").trim())) return notify(dialog, "请完整填写所有必填项");
      if (!editing && venues.some((item) => item.code.toUpperCase() === value.code.trim().toUpperCase())) return notify(dialog, "场馆CODE已存在，请重新填写");
      if (editing) Object.assign(venue, { name: value.name.trim(), cnName: value.cnName.trim(), sort: Number(value.sort), updatedAt: dateTime() });
      else venues.unshift({ id: Number(value.id), code: value.code.trim().toUpperCase(), name: value.name.trim(), cnName: value.cnName.trim(), type: value.type, walletCode: value.walletCode, sort: Number(value.sort), remark: value.remark.trim(), updatedAt: dateTime(), globalStatus: "maintenance_hide", authorizedSites: [], authorizedAt: {}, siteStatuses: {}, providers: [], games: [] });
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
  function openRate(venue, site = venue.authorizedSites[0] || SITES[0], authorizeOnSave = false) {
    const dialog = showModal(authorizeOnSave ? `配置费率并授权 - ${venue.name}` : `场馆费率设置 - ${venue.name}`, `<div ${annotate("B03", "venue599-modal-section")}>${badge("B03")}${rateEditorHtml(venue, site)}</div>`, { className: "venue599-rate-dialog", saveText: authorizeOnSave ? "保存并授权" : "保存费率", onSave(current) {
      const parsed = readRateEditor(current);
      if (parsed.error) return notify(current, parsed.error);
      parsed.result.forEach((ranges, provider) => rateConfigs.set(`${site}|${venue.code}|${provider}`, ranges));
      if (authorizeOnSave && !venue.authorizedSites.includes(site)) {
        venue.authorizedSites.push(site);
        venue.authorizedAt[site] = dateTime();
        venue.siteStatuses[site] = venue.siteStatuses[site] || "maintenance_hide";
      }
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
      ? (authorized ? `<button type="button" data-auth-edit="${escape(site)}">设置费率</button>` : '<span class="venue599-auth-tip">请从授权管理配置</span>')
      : (authorized ? `<button type="button" data-auth-edit="${escape(site)}">编辑费率</button><button type="button" class="danger" data-auth-cancel="${escape(site)}">取消授权</button>` : `<button type="button" class="primary" data-auth-create="${escape(site)}">配置费率并授权</button>`);
    return `<tr data-auth-row="${escape(site)}"><td>${escape(site)}</td><td><span class="venue599-code">${SITE_IDS[site]}</span></td><td>${authorized ? statusTag(status) : "-"}</td><td>${feeReady ? '<span class="venue599-status is-enabled">已配置</span>' : '<span class="venue599-status is-hidden">未配置</span>'}</td><td>${authorized ? '<span class="venue599-status is-enabled">已授权</span>' : '<span class="venue599-status is-neutral">未授权</span>'}</td><td>${escape(venue.authorizedAt?.[site] || "-")}</td><td class="venue599-auth-actions">${actions}</td></tr>`;
  }
  function bindSiteDirectory(dialog, venue) {
    dialog?.querySelectorAll("[data-auth-create]").forEach((button) => button.addEventListener("click", () => { document.getElementById("modal-root").innerHTML = ""; openRate(venue, button.dataset.authCreate, true); }));
    dialog?.querySelectorAll("[data-auth-edit]").forEach((button) => button.addEventListener("click", () => { document.getElementById("modal-root").innerHTML = ""; openRate(venue, button.dataset.authEdit, false); }));
    dialog?.querySelectorAll("[data-auth-cancel]").forEach((button) => button.addEventListener("click", () => {
      const site = button.dataset.authCancel;
      venue.authorizedSites = venue.authorizedSites.filter((item) => item !== site);
      games.filter((game) => game.venueCode === venue.code).forEach((game) => { game.authSites = game.authSites.filter((item) => item !== site); });
      document.getElementById("modal-root").innerHTML = "";
      helpers.rerender?.();
    }));
    dialog?.querySelector("[data-auth-search]")?.addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      dialog.querySelectorAll("[data-auth-row]").forEach((row) => { row.hidden = !row.dataset.authRow.toLowerCase().includes(query) && !row.children[1].textContent.includes(query); });
    });
  }
  function siteDirectory(venue, rateOnly = false) {
    return `<div ${annotate(rateOnly ? "B03" : "B04", "venue599-auth-list")}>${badge(rateOnly ? "B03" : "B04")}<div class="venue599-auth-toolbar"><label><span>站点名称 / ID</span><input data-auth-search placeholder="请输入站点名称或ID" /></label><span>共 ${SITES.length} 个站点</span></div><div class="venue599-auth-table-wrap"><table class="risk-table venue599-auth-table"><thead><tr><th>站点名称</th><th>站点ID</th><th>场馆状态</th><th>场馆费率</th><th>授权状态</th><th>授权时间</th><th>操作</th></tr></thead><tbody>${SITES.map((site) => siteDirectoryRow(venue, site, rateOnly)).join("")}</tbody></table></div></div>`;
  }
  function openRateDirectory(venue) {
    const dialog = showModal(`场馆费率设置 - ${venue.name}`, siteDirectory(venue, true), { closeOnly: true, className: "venue599-auth-dialog" });
    bindSiteDirectory(dialog, venue);
  }
  function openAuthorization(venue) {
    const dialog = showModal(`授权管理 - ${venue.name}`, siteDirectory(venue, false), { closeOnly: true, className: "venue599-auth-dialog" });
    bindSiteDirectory(dialog, venue);
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
    const current = portal === "control" ? row.globalStatus : (row.siteStatuses[currentSite()] || "enabled");
    const targetName = kind === "场馆" ? row.name : row.name;
    const starts = new Date(); starts.setMinutes(starts.getMinutes() + 5);
    const ends = new Date(starts); ends.setHours(ends.getHours() + 3);
    const id = portal === "control" ? (kind === "场馆" ? "B05" : "B07") : (kind === "场馆" ? "B11" : "B12");
    const body = `<form class="venue599-status-form" data-status-form><div ${annotate(id, "venue599-status-choice")}>${badge(id)}<label><input type="radio" name="status" value="enabled" ${current === "enabled" ? "checked" : ""} />设置开启</label><label><input type="radio" name="status" value="maintenance_show" ${current === "maintenance_show" ? "checked" : ""} />维护展示</label><label><input type="radio" name="status" value="maintenance_hide" ${current === "maintenance_hide" ? "checked" : ""} />维护不展示</label></div><div class="venue599-maintenance-fields">${field("维护开始时间", `<input type="datetime-local" name="start" value="${localInputTime(starts)}" />`, true)}${field("维护结束时间", `<input type="datetime-local" name="end" value="${localInputTime(ends)}" />`, true)}${field("维护原因", '<textarea name="reason" rows="3" placeholder="请输入维护原因"></textarea>', true)}</div><p class="venue599-form-tip">维护展示保留会员端入口并显示维护层；维护不展示直接隐藏入口。</p></form>`;
    const dialog = showModal(`${kind}状态 - ${targetName}`, body, { className: "venue599-status-dialog", saveText: "确认", onSave(currentDialog) {
      const form = currentDialog.querySelector("form");
      const value = Object.fromEntries(new FormData(form));
      if (portal === "site" && row.globalStatus !== "enabled" && value.status === "enabled") return notify(currentDialog, "总站正在维护，本站不能设置开启");
      if (value.status !== "enabled" && (!value.start || !value.end || !value.reason.trim())) return notify(currentDialog, "设置维护时需填写完整时间范围和维护原因");
      if (value.status !== "enabled" && value.start >= value.end) return notify(currentDialog, "维护开始时间必须早于结束时间");
      if (portal === "control") row.globalStatus = value.status; else row.siteStatuses[currentSite()] = value.status;
      const venue = kind === "场馆" ? row.name : row.venueName;
      logs.unshift({ id: `ML${Date.now()}`, targetType: kind, venue, game: kind === "游戏" ? row.name : "-", wallet: "-", range: value.status === "enabled" ? "-" : `${value.start.replace("T", " ")}:00 至 ${value.end.replace("T", " ")}:00`, action: value.status === "enabled" ? "设置开启" : "设置维护", display: value.status === "enabled" ? "-" : STATUS[value.status].label, operator: portal === "control" ? "admin" : "site_xy_ops", operatedAt: dateTime(), reason: value.status === "enabled" ? (value.reason.trim() || "服务恢复") : value.reason.trim(), scope: portal === "control" ? "总站" : currentSite() });
      return true;
    }});
    const refreshFields = () => {
      const enabled = dialog.querySelector('input[name="status"]:checked')?.value === "enabled";
      dialog.querySelector(".venue599-maintenance-fields").hidden = enabled;
    };
    dialog?.querySelectorAll('input[name="status"]').forEach((input) => input.addEventListener("change", refreshFields));
    refreshFields();
  }

  function openGameForm(game) {
    const editing = Boolean(game);
    const body = `<form class="venue599-form venue599-game-form">${field("游戏名称", `<input name="name" value="${escape(game?.name || "")}" />`, true)}${field("游戏场馆", `<select name="venueCode">${venues.map((venue) => `<option value="${escape(venue.code)}"${game?.venueCode === venue.code ? " selected" : ""}>${escape(venue.name)}</option>`).join("")}</select>`, true)}${field("游戏CODE", `<input name="code" value="${escape(game?.code || "")}" ${editing ? "disabled" : ""} />`, true)}${field("支持平台", `<span class="venue599-platform-checks">${["WEB", "H5", "APP"].map((platform) => `<label><input type="checkbox" name="platform" value="${platform}" ${!game || game.platforms.includes(platform) ? "checked" : ""} />${platform}</label>`).join("")}</span>`, true)}${field("WEB游戏图片", '<button type="button" class="venue599-upload">上传WEB图片</button>')}${field("H5 / APP游戏图片", '<button type="button" class="venue599-upload">上传H5图片</button>')}${field("排序", `<input name="sort" type="number" min="0" value="${game?.sort ?? 0}" />`, true)}${field("热门置顶", `<select name="hot"><option value="false">否</option><option value="true" ${game?.hot ? "selected" : ""}>是</option></select>`)}${field("热门排序", `<input name="hotSort" type="number" min="0" value="${game?.hotSort ?? 0}" />`)}${field("品牌", `<input name="brand" value="${escape(game?.brand || "")}" />`)}</form><p class="venue599-form-tip">APP端复用H5图片；新增游戏默认维护不展示。</p>`;
    showModal(editing ? "编辑游戏" : "新增游戏", body, { className: "venue599-form-dialog venue599-game-dialog", onSave(dialog) {
      const form = dialog.querySelector("form");
      const value = Object.fromEntries(new FormData(form));
      const platforms = [...form.querySelectorAll('input[name="platform"]:checked')].map((item) => item.value);
      if (!value.name?.trim() || (!editing && !value.code?.trim()) || !platforms.length) return notify(dialog, "请完整填写必填项，并至少选择一个支持平台");
      const venue = venueByCode(value.venueCode);
      if (!editing && games.some((item) => item.code.toUpperCase() === value.code.trim().toUpperCase())) return notify(dialog, "游戏CODE已存在，请重新填写");
      if (editing) Object.assign(game, { name: value.name.trim(), venueCode: venue.code, venueName: venue.name, type: venue.type, platforms, sort: Number(value.sort), hot: value.hot === "true", hotSort: Number(value.hotSort), brand: value.brand.trim(), updatedAt: dateTime(), updatedBy: "admin" });
      else games.unshift({ id: value.code.trim(), code: value.code.trim().toUpperCase(), name: value.name.trim(), venueCode: venue.code, venueName: venue.name, type: venue.type, platforms, sort: Number(value.sort), brand: value.brand.trim(), hot: value.hot === "true", hotSort: Number(value.hotSort), globalStatus: "maintenance_hide", createdBy: "admin", createdAt: dateTime(), updatedBy: "admin", updatedAt: dateTime(), authSites: [], authorizedAt: {}, siteStatuses: {} });
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
      games.unshift({ id: `IMPORT-${Date.now()}`, code: `IMPORT-G${Date.now().toString().slice(-4)}`, name: "批量导入示例游戏", venueCode: venues[0].code, venueName: venues[0].name, type: venues[0].type, platforms: ["WEB", "H5", "APP"], sort: 100, brand: "导入示例", hot: false, hotSort: 0, globalStatus: "maintenance_hide", createdBy: "admin", createdAt: dateTime(), updatedBy: "admin", updatedAt: dateTime(), authSites: [], authorizedAt: {}, siteStatuses: {} });
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
    const editing = Boolean(wallet);
    const selectedVenue = venues.find((venue) => venue.code === wallet?.venueCodes?.[0]) || venues[0];
    const body = `<form class="venue599-form venue599-wallet-form">${field("关联场馆", `<select name="venueCode" ${editing ? "disabled" : ""}>${venues.map((venue) => `<option value="${escape(venue.code)}"${selectedVenue.code === venue.code ? " selected" : ""}>${escape(venue.name)}</option>`).join("")}</select>`, true)}${field("钱包CODE", `<input name="code" value="${escape(wallet?.code || selectedVenue.walletCode)}" readonly />`, true)}${field("钱包名称", `<input name="name" value="${escape(wallet?.name || `${selectedVenue.name}钱包`)}" />`, true)}</form>`;
    const dialog = showModal(editing ? "编辑钱包" : "新增钱包", body, { className: "venue599-form-dialog", onSave(current) {
      const value = Object.fromEntries(new FormData(current.querySelector("form")));
      if (!value.name?.trim()) return notify(current, "钱包名称不能为空");
      if (editing) { wallet.name = value.name.trim(); wallet.updatedAt = dateTime(); }
      else {
        const venue = venueByCode(value.venueCode);
        if (wallets.some((item) => item.code === venue.walletCode)) return notify(current, "该钱包已存在管理记录，不能重复新增");
        wallets.unshift({ id: `W${Date.now()}`, name: value.name.trim(), code: venue.walletCode, venueCodes: [venue.code], status: "normal", updatedAt: dateTime() });
      }
      return true;
    }});
    if (!editing) dialog?.querySelector('select[name="venueCode"]')?.addEventListener("change", (event) => {
      const venue = venueByCode(event.target.value);
      dialog.querySelector('input[name="code"]').value = venue.walletCode;
      dialog.querySelector('input[name="name"]').value = `${venue.name}钱包`;
    });
  }
  function openWalletStatus(wallet) {
    const locking = wallet.status === "normal";
    showModal(`${locking ? "锁定" : "解锁"}钱包 - ${wallet.name}`, `<div ${annotate("B08", "venue599-wallet-confirm")}>${badge("B08")}<p>${locking ? "锁定后禁止会员新进入关联场馆并禁止新上分；已有余额仍可正常下分退出，系统不会强制下分。" : "解锁后恢复相关场馆的进入和上分能力。"}</p><dl><div><dt>钱包CODE</dt><dd>${escape(wallet.code)}</dd></div><div><dt>关联场馆</dt><dd>${wallet.venueCodes.map((code) => escape(venueByCode(code)?.name || code)).join("、")}</dd></div></dl></div>`, { className: "venue599-confirm-dialog", saveText: locking ? "确认锁定" : "确认解锁", onSave() { wallet.status = locking ? "locked" : "normal"; wallet.updatedAt = dateTime(); return true; } });
  }

  function collectFilters(root) {
    const filter = state.filters[state.portal][state.tab];
    root.querySelectorAll("[data-venue599-filter]").forEach((input) => { filter[input.dataset.venue599Filter] = input.value.trim(); });
    state.page[state.portal][state.tab] = 1;
  }
  function handleAction(action, code) {
    const portal = state.portal;
    if (action === "types") return openTypes();
    if (action === "add-venue") return openVenueForm(null);
    if (action === "add-game") return openGameForm(null);
    if (action === "batch-game") return openBatchGame();
    if (action === "add-wallet") return openWalletForm(null);
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
    if (action === "authorize") return openAuthorization(venue);
    if (action === "status-venue") return openStatus("场馆", venue, portal);
    if (action === "edit-game") return openGameForm(game);
    if (action === "authorize-game") return openGameAuthorization(game);
    if (action === "status-game") return openStatus("游戏", game, portal);
    if (action === "edit-wallet") return openWalletForm(wallet);
    if (action === "wallet-status") return openWalletStatus(wallet);
    if (action === "delete-wallet") {
      wallets = wallets.filter((item) => item.code !== wallet.code);
      helpers.rerender?.();
    }
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
    root.querySelectorAll("[data-venue599-page]").forEach((button) => button.addEventListener("click", () => { if (button.disabled) return; state.page[state.portal][state.tab] = Number(button.dataset.venue599Page); helpers.rerender?.(); }));
    root.querySelector("[data-venue599-size]")?.addEventListener("change", (event) => { state.size = Number(event.target.value); state.page[state.portal][state.tab] = 1; helpers.rerender?.(); });
  }

  window.VenueManagement599 = { render, sidebar, bind };
})();
