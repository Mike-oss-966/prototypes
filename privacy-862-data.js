(function () {
  const asset = (file, originalName, description = "") => ({
    path: `./assets/862/${file}`,
    originalName,
    description
  });

  const block = (id, menuPage, fields, screenshots, screenshotNote = "") => ({
    id,
    menuPage,
    fields,
    screenshots,
    screenshotNote
  });

  const sections = [
    {
      key: "control",
      name: "总控后台",
      blocks: [
        block("CTRL-001", "会员管理 → 会员列表", ["真实姓名", "手机号"], [asset("1788321608415-93a9e529-a097-444c-bcfd-c95308fb561b.png", "会员列表.png")]),
        block("CTRL-031", "会员管理 → 会员列表 → 编辑", ["真实姓名", "手机号"], [asset("1788321863629-4815e390-b61d-4adf-85c4-0b514b9ee307.png", "会员列表-编辑.png")]),
        block("CTRL-002", "会员管理 → 会员详情 → 基本信息", ["真实姓名"], [asset("1788321768435-54c49a44-99f2-4031-b1cb-6b46095a8391.png", "会员详情-基本信息.png")]),
        block("CTRL-030", "会员管理 → 会员详情 → 提现方式", ["真实姓名"], [asset("1788321800453-53cfbaa0-fe30-4ac5-a2b3-7b0d66647641.png", "会员详情-提现方式.png")]),
        block("CTRL-003", "会员管理 → 会员实名审核列表", ["真实姓名", "手机号", "审核真实姓名筛选项"], [asset("1788321926680-a96386ca-68ec-4306-ab2f-69a4bba2665e.png", "会员管理-会员实名审核列表.png")], "审核真实姓名筛选项 隐藏"),
        block("CTRL-032", "会员管理 → 会员实名审核列表 → 手动修改", ["真实姓名", "手机号"], [asset("1788322000136-9c0f28d1-ea00-4195-98c1-a30dd4eee813.png", "会员管理-会员实名审核列表-手动修改.png")]),
        block("CTRL-005", "资金管理 → 存款审核", ["真实姓名"], [asset("1788322051927-20b3c7df-c673-46e9-88da-304a58e744f2.png", "财务管理-存款审核.png")]),
        block("CTRL-006", "资金管理 → 提款审核", ["真实姓名"], [asset("1788322162991-12a82607-faae-4a6b-8e12-86981ff4bd8a.png", "财务管理-取款审核.png")]),
        block("CTRL-007", "资金管理 → 存取款记录", ["真实姓名"], [
          asset("1788322186448-7177b299-43fa-4a11-a889-e479a0762ccd.png", "财务管理-存取款记录.png", "后台页面 截图"),
          asset("1788325585386-96504cf2-b867-4ee0-bdac-94d1aba33195.png", "Screenshot_20260902130618.png", "导出表格  截图")
        ]),
        block("CTRL-033", "资金管理 → 存取款记录 → 查看", ["真实姓名"], [asset("1788322230901-c6284d35-3865-435a-8753-ade89a8855d6.png", "财务管理-存取款记录-查看.png")]),
        block("CTRL-010", "风控管理 → 风控提款审核 → 待审核", ["真实姓名"], [
          asset("1788322274466-44a887a6-dd97-4a48-8551-6e385ceb0820.png", "风控提款审核-待领取.png", "待领取 数据表"),
          asset("1788322277254-4ed396a8-ff50-4ad8-ab48-5dd17a5334d5.png", "风控提款审核-待审核.png", "待审核 数据表")
        ], "本页面涉及 两处修改"),
        block("CTRL-011", "风控管理 → 风控提款审核 → 挂起", ["真实姓名"], [asset("1788322318361-54a4550d-ec6e-48c5-8400-cd91d76d5780.png", "风控提款审核-挂起审核.png")]),
        block("CTRL-012", "风控管理 → 风控提款审核 → 审核历史", ["真实姓名"], [asset("1788322333347-9781494f-77af-42a9-8927-e53098d2b8e1.png", "风控提款审核-审核记录.png")]),
        block("CTRL-020", "资源管理 → 短信发送记录", ["手机号"], [asset("1788322379300-5f50482c-350b-413e-b19c-df417dcbf3f5.png", "资源管理-短信发送记录.png")]),
        block("CTRL-021", "运营报表 → 掉签分析", ["姓名", "手机号"], [
          asset("1788322403362-525f801f-1cb6-4f86-a068-0c9d322ed8fa.png", "运营报表-掉签分析.png", "后台页面截图"),
          asset("1788325815634-7f3e66db-1b2c-4ce0-a7f7-3929f16ec89a.png", "123.png", "导出表格 截图")
        ])
      ]
    },
    {
      key: "site",
      name: "站点后台",
      blocks: [
        block("SITE-001", "会员管理 → 会员列表", ["真实姓名"], [
          asset("1788322663116-07e548bf-3807-49c4-9238-48d61e9fb393.png", "会员列表.png", "后台页面 截图"),
          asset("1788325915434-059bb25a-eb0e-4312-9552-8c0fde33cb91.png", "Screenshot_20260902131149.png", "导出表格 截图")
        ])
      ]
    },
    {
      key: "agent",
      name: "代理后台",
      blocks: [
        block("AGENT-001", "会员管理 → 会员列表 → 下级会员", ["真实姓名"], [
          asset("1788323048515-94be35d8-cd41-44af-9e14-0a1c040a5882.png", "会员列表-下级会员列表.png", "后台页面 截图"),
          asset("1788326231322-0258fab8-9521-4de6-bb1f-4e26faf273a1.png", "111Screenshot_20260902131659.png", "导出表格 截图")
        ]),
        block("AGENT-007", "会员管理 → 会员列表 → 团队会员", ["真实姓名"], [
          asset("1788323073377-70198a69-be71-46bc-9210-63c81e34585c.png", "会员列表-团队会员列表.png", "后台页面 截图"),
          asset("1788326322393-8a46cfd8-278c-43db-b9b2-1cb71024753b.png", "222Screenshot_20260902131835.png", "导出表格 截图")
        ])
      ]
    },
    {
      key: "recruitment",
      name: "招商后台",
      blocks: [
        block("RECRUIT-001", "会员管理 → 会员列表", ["真实姓名"], [
          asset("1788323109131-a8312065-87aa-4e77-a97f-67f11442175e.png", "会员列表.png", "后台页面 截图"),
          asset("1788326361245-f55d9fbe-2e96-4d34-bbce-b7636e6c5e6b.png", "111Screenshot_20260902131659.png", "导出表格 截图")
        ])
      ]
    }
  ];

  window.PROTOTYPE_DATA.requirements.push({
    id: "#862",
    title: "全后台 用户个人数据隐私处理",
    owner: "Mike",
    status: "进行中",
    priority: "P1",
    startDate: "2026-09-02",
    completionDate: "",
    updatedAt: "2026-09-02 13:19",
    summary: "分别列出总控、站点、代理和招商后台涉及的用户个人数据字段及对应页面截图。",
    moduleName: "用户个人数据隐私处理",
    defaultPageKey: "privacy-control-862",
    pages: sections.map((section, index) => ({
      id: `P${String(index + 1).padStart(2, "0")}`,
      key: `privacy-${section.key}-862`,
      name: section.name,
      role: "产品、开发、测试",
      pageType: "mixed",
      purpose: `查看${section.name}涉及用户个人数据的菜单、字段及截图位置。`,
      privacyBlocks: section.blocks,
      questions: [],
      annotations: []
    }))
  });
})();
