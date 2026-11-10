(function () {
  const state = { preview: "attempts", passwordKind: "login", strength: 0, loginAction: "freeze", fundAction: "cooldown" };
  const scenarios = [
    { id: "attempts", number: "01", title: "密码错误次数配置" },
    { id: "password", number: "02", title: "强密码要求提示" },
    { id: "authenticator", number: "03", title: "验证器修改或解绑" }
  ];
  const operationGroups = [
    [{ number: "01", name: "修改登录密码" }, { number: "02", name: "忘记登录密码" }],
    [{ number: "03", name: "更换实名手机号" }, { number: "04", name: "修改资金密码" }, { number: "05", name: "新增资金密码" }],
    [{ number: "06", name: "提现" }, { number: "07", name: "修改提现账户" }, { number: "08", name: "新增提现账户" }]
  ];
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function shell(requirement) {
    const active = scenarios.find((item) => item.id === state.preview) || scenarios[0];
    return `<main class="s1300-page">
      <header class="s1300-header"><div><span class="s1300-kicker">#1300 · 方案说明</span><h1>平台安全验证补齐</h1></div><a href="#" class="s1300-back">返回方案列表</a></header>
      <div class="s1300-layout">
        <section class="s1300-explainer" aria-label="方案说明">
          <section class="s1300-copy-section"><h2>敏感操作</h2><div class="s1300-operation-columns">${operationGroups.map((group) => `<ul class="s1300-operation-list">${group.map((item) => `<li><span>${item.number}</span>${item.name}</li>`).join("")}</ul>`).join("")}</div></section>
          <section class="s1300-copy-section"><h2>密码错误处理</h2><div class="s1300-policy-lines"><div><b>登录密码</b><p>达到配置次数后，冻结或封禁登录；冻结时可设置时长，并支持管理员解冻或解封。</p></div><div><b>资金密码</b><p>达到配置次数后，可选择冷静资金操作或冻结账号；冷静期仅暂停资金操作，冻结时可设置时长。</p></div></div></section>
          <section class="s1300-copy-section"><div class="s1300-auth-method-summary"><span class="s1300-auth-method-icon" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none"><path d="M32 5 52 13v15c0 13-8.4 23.8-20 30C20.4 51.8 12 41 12 28V13L32 5Z" fill="currentColor" opacity=".12"/><path d="M32 7.5 50 14.7v13.2c0 11.7-7.4 21.6-18 27.5-10.6-5.9-18-15.8-18-27.5V14.7l18-7.2Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><rect x="23" y="28" width="18" height="15" rx="3" fill="currentColor" opacity=".2"/><rect x="23" y="28" width="18" height="15" rx="3" stroke="currentColor" stroke-width="2.5"/><path d="M27 28v-3a5 5 0 0 1 10 0v3M32 34v3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></span><div><h2>验证方式变更</h2><p>敏感操作使用密保问题或验证器验证。解绑验证器前，需使用历史充值账户完成一笔 100 CNY 等值充值验证。</p></div></div></section>
          <section class="s1300-copy-section s1300-examples"><h2>界面示例</h2><div class="s1300-example-list">${scenarios.map((item) => `<button type="button" data-s1300-preview="${item.id}" class="${item.id === state.preview ? "active" : ""}"><span>${item.number}</span><strong>${item.title}</strong><i aria-hidden="true">›</i></button>`).join("")}</div></section>
        </section>
        <section class="s1300-preview" aria-label="界面示例"><header class="s1300-preview-heading"><h2>${esc(active.title)}</h2></header><div class="s1300-preview-body">${previewContent()}</div></section>
      </div>
    </main>`;
  }

  function previewContent() {
    if (state.preview === "password") return passwordPreview();
    if (state.preview === "authenticator") return authenticatorPreview();
    return attemptsPreview();
  }

  function attemptsPreview() {
    return `<div class="s1300-admin-preview">
      <section class="s1300-config-block"><header><b>登录密码错误</b></header>
        <div class="s1300-setting-row"><label class="s1300-setting-name required">错误次数</label><div class="s1300-setting-control"><div class="s1300-inline-number"><input type="number" min="1" value="5" aria-label="登录密码错误次数" /><span>次</span></div><small>周期内连续输错达到该次数触发处理，输入正确一次即清零。行业常用 5 次</small></div></div>
        <div class="s1300-setting-row"><span class="s1300-setting-name required">达到次数后</span><div><div class="s1300-choice-row"><label><input type="radio" name="s1300-login-action" value="freeze" data-s1300-action ${state.loginAction === "freeze" ? "checked" : ""} /><span>冻结账号</span></label><label><input type="radio" name="s1300-login-action" value="ban" data-s1300-action ${state.loginAction === "ban" ? "checked" : ""} /><span>封禁账号</span></label></div><small class="s1300-ban-note" data-s1300-ban-note ${state.loginAction === "ban" ? "" : "hidden"}>封禁账号需管理员手动解封</small></div></div>
        <div class="s1300-setting-row" data-s1300-freeze ${state.loginAction === "ban" ? "hidden" : ""}><label class="s1300-setting-name required">冻结时长</label><div class="s1300-setting-control"><div class="s1300-inline-duration"><input type="number" min="1" value="30" aria-label="冻结时长" /><select aria-label="冻结时长单位"><option selected>分钟</option><option>小时</option><option>天</option></select></div><small>冻结期间账号无法登录，到期后自动解除并清零</small></div></div>
      </section>
      <section class="s1300-config-block fund"><header><b>资金密码错误</b></header>
        <div class="s1300-setting-row"><label class="s1300-setting-name required">错误次数</label><div class="s1300-setting-control"><div class="s1300-inline-number"><input type="number" min="1" value="3" aria-label="资金密码错误次数" /><span>次</span></div><small>资金密码用于提现、转账等高风险操作，行业常用 3 次</small></div></div>
        <div class="s1300-setting-row"><span class="s1300-setting-name required">达到次数后</span><div><div class="s1300-choice-row"><label><input type="radio" name="s1300-fund-action" value="cooldown" data-s1300-fund-action ${state.fundAction === "cooldown" ? "checked" : ""} /><span>冷静资金操作</span></label><label><input type="radio" name="s1300-fund-action" value="freeze" data-s1300-fund-action ${state.fundAction === "freeze" ? "checked" : ""} /><span>冻结账号</span></label></div></div></div>
        <div class="s1300-setting-row" data-s1300-fund-cooldown ${state.fundAction === "freeze" ? "hidden" : ""}><label class="s1300-setting-name required">冷静时长</label><div class="s1300-setting-control"><div class="s1300-inline-duration"><input type="number" min="1" value="2" aria-label="资金操作冷静时长" /><select aria-label="资金操作冷静时长单位"><option>分钟</option><option selected>小时</option><option>天</option></select></div><div class="s1300-info-note"><span>ⓘ</span><p>达到次数后仅暂停资金敏感操作，不影响登录和只读查看。</p></div></div></div>
        <div class="s1300-setting-row" data-s1300-fund-freeze ${state.fundAction === "freeze" ? "" : "hidden"}><label class="s1300-setting-name required">冻结时长</label><div class="s1300-setting-control"><div class="s1300-inline-duration"><input type="number" min="1" value="30" aria-label="资金账号冻结时长" /><select aria-label="资金账号冻结时长单位"><option selected>分钟</option><option>小时</option><option>天</option></select></div><small>冻结期间账号无法登录，到期后自动解除并清零</small></div></div>
      </section></div>`;
  }

  function passwordPreview() {
    const kind = state.passwordKind === "login" ? "登录密码" : "资金密码";
    const score = state.strength;
    const label = score === 0 ? "未输入" : score < 45 ? "偏弱" : score < 75 ? "中等" : "较强";
    const checks = [
      { text: "至少 8 位", ok: score >= 15 },
      { text: "包含字母与数字", ok: score >= 45 },
      { text: "建议加入符号", ok: score >= 75 }
    ];
    return `<div class="s1300-mobile-form"><header><b>设置${kind}</b></header><div class="s1300-password-tabs"><button type="button" data-s1300-password-kind="login" class="${state.passwordKind === "login" ? "active" : ""}">登录密码</button><button type="button" data-s1300-password-kind="fund" class="${state.passwordKind === "fund" ? "active" : ""}">资金密码</button></div><div class="s1300-password-content"><p class="s1300-password-note">请勿与另一种密码相同</p><label>新${kind}<input type="password" data-s1300-strength placeholder="8–20 位，字母和数字组合" /></label><div class="s1300-strength-row"><span>密码强度</span><b>${label}</b></div><div class="s1300-strength-track"><i style="width:${score}%" class="${score >= 75 ? "strong" : score >= 45 ? "medium" : score > 0 ? "weak" : ""}"></i></div><ul class="s1300-check-list">${checks.map((check) => `<li class="${check.ok ? "done" : ""}"><i>${check.ok ? "✓" : "·"}</i>${check.text}</li>`).join("")}</ul><label>确认${kind}<input type="password" placeholder="请再次输入" /></label><button type="button" class="s1300-primary">确认修改</button><small>强度规则为方案示意，最终长度与复杂度策略待确认。</small></div></div>`;
  }

  function authenticatorPreview() {
    return `<div class="s1300-auth-stage"><section class="s1300-auth-settings"><header><div><span class="s1300-auth-status-dot"></span><b>验证器已绑定</b></div><button type="button" class="s1300-unbind-button" data-s1300-unbind>解绑</button></header><p>解绑验证器前，需要通过历史充值账户完成充值验证。</p></section><div class="s1300-unbind-modal" data-s1300-unbind-modal hidden><button type="button" class="s1300-modal-scrim" data-s1300-dismiss aria-label="关闭弹窗"></button><section class="s1300-unbind-dialog" role="dialog" aria-modal="true" aria-labelledby="s1300-unbind-title"><span class="s1300-unbind-symbol" aria-hidden="true">!</span><h3 id="s1300-unbind-title">解绑验证器</h3><p>需要使用历史充值账户完成一笔 <b>100 CNY 等值充值验证</b>，验证通过后方可解绑。</p><div class="s1300-dialog-actions"><button type="button" class="s1300-secondary" data-s1300-dismiss>知道了</button></div></section></div></div>`;
  }

  function paint(app, requirement) {
    app.innerHTML = shell(requirement);
    bind(app, requirement);
  }

  function bind(app, requirement) {
    app.querySelectorAll("[data-s1300-preview]").forEach((button) => button.addEventListener("click", () => {
      state.preview = button.dataset.s1300Preview;
      paint(app, requirement);
    }));
    app.querySelectorAll("[data-s1300-action]").forEach((input) => input.addEventListener("change", (event) => {
      state.loginAction = event.target.value;
      const duration = app.querySelector("[data-s1300-freeze]");
      if (duration) duration.hidden = state.loginAction === "ban";
      const banNote = app.querySelector("[data-s1300-ban-note]");
      if (banNote) banNote.hidden = state.loginAction !== "ban";
    }));
    app.querySelectorAll("[data-s1300-fund-action]").forEach((input) => input.addEventListener("change", (event) => {
      state.fundAction = event.target.value;
      const cooldown = app.querySelector("[data-s1300-fund-cooldown]");
      const freeze = app.querySelector("[data-s1300-fund-freeze]");
      if (cooldown) cooldown.hidden = state.fundAction !== "cooldown";
      if (freeze) freeze.hidden = state.fundAction !== "freeze";
    }));
    app.querySelectorAll("[data-s1300-password-kind]").forEach((button) => button.addEventListener("click", () => {
      state.passwordKind = button.dataset.s1300PasswordKind;
      state.strength = 0;
      paint(app, requirement);
    }));
    app.querySelector("[data-s1300-strength]")?.addEventListener("input", (event) => {
      const value = event.target.value;
      const classes = [/[a-z]/i.test(value), /\d/.test(value), /[^a-z\d]/i.test(value)].filter(Boolean).length;
      state.strength = value.length < 8 ? Math.min(20, value.length * 2) : Math.min(100, 30 + classes * 18 + (value.length >= 12 ? 16 : 0));
      const score = state.strength;
      const strengthLabel = score === 0 ? "未输入" : score < 45 ? "偏弱" : score < 75 ? "中等" : "较强";
      const label = app.querySelector(".s1300-strength-row b");
      const bar = app.querySelector(".s1300-strength-track i");
      if (label) label.textContent = strengthLabel;
      if (bar) {
        bar.style.width = `${score}%`;
        bar.className = score >= 75 ? "strong" : score >= 45 ? "medium" : score > 0 ? "weak" : "";
      }
      app.querySelectorAll(".s1300-check-list li").forEach((item, index) => {
        const passed = [score >= 15, score >= 45, score >= 75][index];
        item.classList.toggle("done", passed);
        item.querySelector("i").textContent = passed ? "✓" : "·";
      });
    });
    const unbindModal = app.querySelector("[data-s1300-unbind-modal]");
    app.querySelector("[data-s1300-unbind]")?.addEventListener("click", () => {
      if (unbindModal) unbindModal.hidden = false;
    });
    app.querySelectorAll("[data-s1300-dismiss]").forEach((button) => button.addEventListener("click", () => {
      if (unbindModal) unbindModal.hidden = true;
    }));
  }

  function mount({ app, requirement }) {
    paint(app, requirement);
  }

  window.Security1300 = { mount };
})();
