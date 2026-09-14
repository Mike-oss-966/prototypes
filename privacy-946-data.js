// Generated from the completed local #946 draft.
window.PROTOTYPE_DATA.requirements.push({
  "id": "#946",
  "title": "用户隐私数据取消姓名隐匿",
  "owner": "Mike",
  "status": "已完成",
  "priority": "P1",
  "startDate": "2026-09-07",
  "completionDate": "2026-09-11",
  "updatedAt": "2026-09-11 12:34",
  "summary": "恢复清单内姓名字段的完整显示及审核真实姓名筛选项，手机号隐匿规则保持不变。",
  "moduleName": "用户隐私数据取消姓名隐匿",
  "defaultPageKey": "privacy-control-946",
  "snapshot": {
    "sourceUpdatedAt": "2026-09-07 15:07:24",
    "sourceSha256": "486cd2f32aa57b879d1f675281b0f78dd9fa3596c5fda31f836c9119820b7879"
  },
  "pages": [
    {
      "id": "P01",
      "key": "privacy-control-946",
      "name": "总控后台",
      "role": "产品、开发、测试",
      "pageType": "mixed",
      "purpose": "查看总控后台需要取消姓名隐匿的菜单、字段及截图位置。",
      "privacyNameDisclosure": true,
      "privacyBlocks": [
        {
          "id": "CTRL-001",
          "menuPage": "会员管理 → 会员列表",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788763467599-83f52c04-2fff-40bf-8f37-92abc203c9d5.png",
              "originalName": "Screenshot_20260907144354.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-031",
          "menuPage": "会员管理 → 会员列表 → 编辑",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788763529477-94806652-a845-4a08-8337-6cbd2187be03.png",
              "originalName": "会员列表-编辑.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-002",
          "menuPage": "会员管理 → 会员详情 → 基本信息",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788763742374-f87c9b9b-1a72-4dac-9b59-b72488167d8b.png",
              "originalName": "会员详情-基本信息.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-030",
          "menuPage": "会员管理 → 会员详情 → 提现方式",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788763756353-7f2da34e-77c3-4b17-ba85-155daefa5bf5.png",
              "originalName": "会员详情-提现方式.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-003",
          "menuPage": "会员管理 → 会员实名审核列表",
          "fields": [
            "真实姓名",
            "审核真实姓名筛选项"
          ],
          "screenshotNote": "恢复【审核真实姓名】筛选项，可按真实姓名筛选会员实名审核记录。",
          "screenshots": [
            {
              "path": "./assets/946/1788763763249-64cae83f-733c-48c6-b6a8-0e64ee119013.png",
              "originalName": "会员管理-会员实名审核列表.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-032",
          "menuPage": "会员管理 → 会员实名审核列表 → 手动修改",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788763874949-08d34ff2-2a5a-40f4-a021-fc4fb40c51a4.png",
              "originalName": "会员管理-会员实名审核列表-修改.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-005",
          "menuPage": "资金管理 → 存款审核",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788322051927-20b3c7df-c673-46e9-88da-304a58e744f2.png",
              "originalName": "财务管理-存款审核.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-006",
          "menuPage": "资金管理 → 提款审核",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788322162991-12a82607-faae-4a6b-8e12-86981ff4bd8a.png",
              "originalName": "财务管理-取款审核.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-007",
          "menuPage": "资金管理 → 存取款记录",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788322186448-7177b299-43fa-4a11-a889-e479a0762ccd.png",
              "originalName": "财务管理-存取款记录.png",
              "description": "后台页面 截图"
            },
            {
              "path": "./assets/946/1788325585386-96504cf2-b867-4ee0-bdac-94d1aba33195.png",
              "originalName": "Screenshot_20260902130618.png",
              "description": "导出表格  截图"
            }
          ]
        },
        {
          "id": "CTRL-033",
          "menuPage": "资金管理 → 存取款记录 → 查看",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788322230901-c6284d35-3865-435a-8753-ade89a8855d6.png",
              "originalName": "财务管理-存取款记录-查看.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-010",
          "menuPage": "风控管理 → 风控提款审核 → 待审核",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "本页面涉及 两处修改",
          "screenshots": [
            {
              "path": "./assets/946/1788322274466-44a887a6-dd97-4a48-8551-6e385ceb0820.png",
              "originalName": "风控提款审核-待领取.png",
              "description": "待领取 数据表"
            },
            {
              "path": "./assets/946/1788322277254-4ed396a8-ff50-4ad8-ab48-5dd17a5334d5.png",
              "originalName": "风控提款审核-待审核.png",
              "description": "待审核 数据表"
            }
          ]
        },
        {
          "id": "CTRL-011",
          "menuPage": "风控管理 → 风控提款审核 → 挂起",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788322318361-54a4550d-ec6e-48c5-8400-cd91d76d5780.png",
              "originalName": "风控提款审核-挂起审核.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-012",
          "menuPage": "风控管理 → 风控提款审核 → 审核历史",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788322333347-9781494f-77af-42a9-8927-e53098d2b8e1.png",
              "originalName": "风控提款审核-审核记录.png",
              "description": ""
            }
          ]
        },
        {
          "id": "CTRL-021",
          "menuPage": "运营报表 → 掉签分析",
          "fields": [
            "真实姓名"
          ],
          "screenshotNote": "",
          "screenshots": [
            {
              "path": "./assets/946/1788764800859-af76a8c5-5bf1-437d-bd99-f3dfce114e57.png",
              "originalName": "运营报表-调签分析.png",
              "description": ""
            },
            {
              "path": "./assets/946/1788764803105-e2ef9565-d405-4fae-a1e2-5f59dbf578c4.png",
              "originalName": "运营报表-调签分析-导出.png",
              "description": ""
            }
          ]
        }
      ],
      "questions": [],
      "annotations": []
    },
    {
      "id": "P02",
      "key": "privacy-site-946",
      "name": "站点后台",
      "role": "产品、开发、测试",
      "pageType": "mixed",
      "purpose": "查看站点后台需要取消姓名隐匿的菜单、字段及截图位置。",
      "privacyNameDisclosure": true,
      "privacyBlocks": [],
      "questions": [],
      "annotations": []
    },
    {
      "id": "P03",
      "key": "privacy-agent-946",
      "name": "代理后台",
      "role": "产品、开发、测试",
      "pageType": "mixed",
      "purpose": "查看代理后台需要取消姓名隐匿的菜单、字段及截图位置。",
      "privacyNameDisclosure": true,
      "privacyBlocks": [],
      "questions": [],
      "annotations": []
    },
    {
      "id": "P04",
      "key": "privacy-recruitment-946",
      "name": "招商后台",
      "role": "产品、开发、测试",
      "pageType": "mixed",
      "purpose": "查看招商后台需要取消姓名隐匿的菜单、字段及截图位置。",
      "privacyNameDisclosure": true,
      "privacyBlocks": [],
      "questions": [],
      "annotations": []
    }
  ]
});
