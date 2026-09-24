# 安哥拉水务小程序 — 发票 / 收据 / 票据逻辑梳理

> 项目：`shuiwuju-wx`  
> 更新：2026-09-18  
> 说明：本文档基于当前前端代码整理，区分 **AGT 电子发票** 与 **本地蓝牙打印** 两套体系。

---

## 目录

1. [概念分层](#一概念分层)
2. [AGT 统一开票接口](#二agt-统一开票接口)
3. [本地打印 vs AGT](#三本地打印-vs-agt)
4. [状态字段](#四状态字段)
5. [角色与权限](#五角色与权限)
6. [首页快捷入口](#六首页快捷入口)
7. [各场景完整流程](#七各场景完整流程)
8. [页面—接口对照表](#八页面接口对照表)
9. [业务决策树](#九业务决策树)
10. [待完善项](#十待完善--已知差异)
11. [业务共识摘要](#十一业务共识摘要)

---

## 一、概念分层

项目中存在三层概念，不要混用：

| 层级 | 名称 | 说明 | 是否上报 AGT |
|------|------|------|-------------|
| **业务单据** | 缴费单 / Factura Simplificada | 抄表后生成的应缴账单，可未付款 | 否（本地打印） |
| **AGT 电子票** | FT / FR / FA / RG 等 | 税务局 AGT 正式电子发票类型 | 是 |
| **本地凭证** | Recibo / Factura-proforma 等 | 蓝牙小票，部分仅内部留痕 | 否 |

### AGT 票据类型（`document_type`）

| 代码 | 葡语 | 中文 | 典型场景 | 是否需先收款 |
|------|------|------|----------|-------------|
| **FT** | Fatura | 发票 | 抄表缴费单先开票后收款；其他收费未付单开票 | 否 |
| **FR** | Fatura/Recibo | 发票/收据合一 | 其他收费收款后开票 | 是 |
| **FA** | Factura de Adiantamento | 预付款发票 | 预交水费 | 视业务 |
| **RG** | Recibo | 收据 | 首页「收据」快捷入口（营业厅） | 是 |

更完整的 AGT 字段说明见：`apis/agt.js`（AGT 原始接口文档注释）。

---

## 二、AGT 统一开票接口

| 项 | 值 |
|----|-----|
| **路径** | `POST /api/wx/tr/tr_issue_agt_invoice` |
| **前端封装** | `apis/admin.js` → `issueAgtInvoice()` |
| **超时** | 60 秒（含 AGT 轮询） |
| **后端职责** | `solicitarSerie` → `registarFactura` → `obterEstado` |

### 2.1 通用参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `document_type` | string | FT / FR / FA / RG |
| `poll` | number | 1=轮询 AGT 状态，0=否 |
| `poll_times` | number | 最大轮询次数，默认 5 |
| `poll_interval` | number | 轮询间隔（秒），默认 3 |
| `customer_tax_id` | string | 客户 NIF，通常取 `water_meter.user_card` |

### 2.2 数据来源（二选一）

| source_type | 业务 | source_id 取值 |
|-------------|------|----------------|
| `user_pay_log` | 抄表缴费单 | `up_id` 或列表 `item.id` |
| `user_pay_demand_note` | 其他收费缴费单 | `demand_note_id` / `item.id` |

> **常见错误**：传 `source_type: 'user_payment'` → 后端 400「不支持的 source_type，请使用 user_pay_demand_note 或 user_pay_log」。

### 2.3 调用示例

**抄表缴费单开 FT（营业厅详情）**

```json
{
  "document_type": "FT",
  "poll": 1,
  "poll_times": 5,
  "poll_interval": 3,
  "source_type": "user_pay_log",
  "source_id": 123,
  "customer_tax_id": "5601022917"
}
```

**其他收费开 FT（quick-factura Tab2）**

```json
{
  "document_type": "FT",
  "poll": 1,
  "poll_times": 5,
  "poll_interval": 3,
  "source_type": "user_pay_demand_note",
  "source_id": 456,
  "customer_tax_id": "5601022917"
}
```

**收款后开 FR（user-parenType-info）**

```json
{
  "document_type": "FR",
  "poll": 1,
  "poll_times": 5,
  "poll_interval": 3,
  "source_type": "user_pay_demand_note",
  "source_id": 456,
  "customer_tax_id": "5601022917"
}
```

### 2.4 成功 / 失败判定（前端）

**成功条件**

- HTTP 响应 `code === 200`
- 且 `data.success !== false`
- 且无 `error` 字段
- 可读发票号：`documentNo` / `document_no` / `invoice_no` / `agt_document_no`

**失败处理（user-water-info 已实现）**

- Toast 按当前语言：`开票失败` / `Falha na emissão da fatura`
- **不更新**发票状态、**不打印**、按钮保持可点击

---

## 三、本地打印 vs AGT

| 方式 | 实现 | 打印通道 |
|------|------|----------|
| **IoT 云打印** | `SendControlCommand` → `/iotAdmin/iot/write2Printer` | 一体机蓝牙打印机 |
| **AGT 开票** | `issueAgtInvoice` | 后端 AGT，前端获取票号 |
| **状态回写** | `fb_up_print_invoice_status` / `fb_up_print_receipt_status` | 更新 `invoice_status` / `receipt_status` |

### 常见小票标题

| 打印标题 | 含义 | 典型页面 |
|----------|------|----------|
| `Factura Simplificada N°` | 抄表缴费单（应缴通知） | `user-water-info`、`print-info` |
| `Factura/Recibo N°` | 发票/收据（查表员本地） | `user-total-info` |
| `Recibo N°` | 营业厅收据（非发票） | `user-total-info`、`user-pay-info` |
| `Factura-proforma` | 形式发票/报价 | `other-invoices` Tab 报价 |
| `Factura Automatica` | 预交水费 | `adiantamento-water`、`print-info` |

---

## 四、状态字段

### 4.1 抄表缴费单（`user_pay_log`）

| 字段 | 值 | 含义 |
|------|-----|------|
| `status` | 1 | 待支付 |
| `status` | ≠1 | 已支付 |
| `receipt_status` | 1 | 收据未开 |
| `receipt_status` | ≠1 | 收据已处理 |
| `invoice_status` | 1 | 发票未开 |
| `invoice_status` | 2 | 已开具 |
| `invoice_status` | 3 | 已取消 |
| `bill_invoice_code` / `agt_document_no` | 有值 | 视为已开票 |

**前端已开票判断**（quick-factura / user-water-info）：

```javascript
const code = ele.bill_invoice_code || ele.invoice_code || ele.agt_document_no || ele.agt_invoice_no || ''
const invoiceIssued = !!(code || ele.invoice_status == 2)
```

### 4.2 其他收费单（`demand_note`）

| 字段 | 值 | 含义 |
|------|-----|------|
| `pay_status` | 0 | 待付款 |
| `pay_status` | 1 | 已确认/已付 |
| `type` | 1 | 正常缴费单 |
| `type` | 2 | 形式发票（报价） |

---

## 五、角色与权限

| source | 角色 | 发票 | 收据 | 缴费单打印 |
|--------|------|------|------|------------|
| `search-person` | 查表员 | ✅ 本地 Factura/Recibo | ❌ 不显示 | ✅ 始终可打 |
| `business-hall` | 营业厅 | ✅ AGT FT（详情【发票】） | ✅ 本地 Recibo | ✅ 开票后/已开重打 |
| `financial-manager` | 财务审核 | — | — | 同意/不同意 |

### user-water-info 按钮状态机

**查表员（search-person）**

```
pay（待付）→ print（已付，打收据）→ over（打缴费单，始终显示打印按钮）
```

**营业厅（business-hall）**

```
bank_pay（待付）→ print（已付，开收据）→ print_two（补开收据）
底部：【发票】左侧 1/3 + 右侧操作按钮占满剩余宽度
```

**财务审核（financial-manager）**

```
no（待审核：同意/不同意）→ yes（已审核，无按钮）
```

---

## 六、首页快捷入口

配置位置：`lang/zh.js` → `index.quickActionList`

| 按钮 | 路由 | AGT 类型 | 当前实现 |
|------|------|----------|----------|
| 发票 / Factura | `/pages/query-water/quick-factura/index` | **FT** | ✅ 已接 AGT 批量开票 |
| 发票/收据 / Factura/Recibo | `other-invoices?title_active=1&docType=FR` | FR（意图） | ⚠️ 仅本地创建+打印 |
| 收据 / Recibo | `/pages/financial-manager/bill-payment/index` | 收据单 | ✅ 与功能模块「收据单」同页 |
| 预交费 / Adiantamento | `other-invoices?title_active=4&docType=FA` | FA（意图） | ⚠️ 未接 AGT |

> URL 参数 `docType` 目前**未被页面 onLoad 读取**，仅作入口标识。

---

## 七、各场景完整流程

### 7.1 抄表开缴费单（查表员主线）

```
查表 collect-info → confirm-info 提交
  → 生成 user_pay_log（status=1）
  → print-info 页
      ├─ 打印缴费单（Factura Simplificada，本地，不调 AGT）
      └─ 打印发票（本地 blueToothInvoice）
  → 可选缴费 payWater
```

**相关页面**

- `pages/query-water/pay/collect-info`
- `pages/query-water/pay/confirm-info`
- `pages/query-water/pay/print-info`
- `pages/user-water-info/index?source=search-person`（今日汇总入口）

---

### 7.2 营业厅抄表缴费单 + AGT FT

```
business-hall 列表 → user-water-info?source=business-hall
  详情：发票状态 未开/已开
  【发票】：
    未开 → issueAgtInvoice(FT, user_pay_log) → 成功 → 打印 Factura Simplificada
    已开 → 直接重打 Factura Simplificada
    失败 → Toast 开票失败，状态不变
  【缴费】→ user-total-info 收款
```

**关键文件**

- `pages/user-water-info/index.js` → `buildAgtInvoiceParams()` / `issueAgtInvoiceThenPrint()`
- `pages/user-water-info/index.wxml` → 发票状态展示 + 底部按钮布局

---

### 7.3 FT 快捷批量开票（首页 Factura）

**页面**：`pages/query-water/quick-factura/index`

**Tab1 — 缴费单（抄表）**

```
getBusinessHallList → 多选（未开 FT 且未开 FR 二合一；与是否待付/部分缴费无关）
  → 批量 issueAgtInvoice(FT, user_pay_log)
  → 不可选条目点击不勾选；Tab2 未可选时点击可进收款页
```

**Tab2 — 其他发票**

```
getDemandNoteList → 多选（同上：仅看发票/FR 标识）
  → 批量 issueAgtInvoice(FT, user_pay_demand_note)
  → 点击条目 → user-parenType-info 收款
```

**可选判断**（`canIssueFtForBill`）：已开 FT（`bill_invoice_code` / `invoice_status==2` 等）或已开 FR（`agt_document_type==FR`、双状态均已开等）则不可再开 FT。

**关键方法**：`buildAgtParams()` / `clickBatchIssue()`

---

### 7.4 其他收费 — other-invoices 各 Tab

| Tab | title_active | 流程 | AGT |
|-----|-------------|------|-----|
| 发票 | 1 | `createPayDemandNote(type=1)` → 本地打印 | ❌ |
| 报价 | 3 | `createPayDemandNote(type=2)` → Factura-proforma 本地打印 | ❌ |
| 预交费 | 4 | `getFbSelectWmList` 预交用户列表 | ❌ |
| 缴费单 | 2 | 历史列表 → `user-parenType-info` | 收款后 FR |

**形式发票转换**

```
Tab 缴费单 → 一键转换 trUpPayDemandMote(type=1) → 本地打印
```

---

### 7.5 其他收费 — 收款 + FR

**页面**：`pages/user-parenType-info/index?source=business-hall`

```
payDemandNote 收款 → pay_status=1
  → type==1：issueAgtInvoice(FR, user_pay_demand_note) → 打印
  → type==2：仅本地打印（形式发票，不调 AGT）
```

---

### 7.6 营业厅传统收据（Recibo）

**页面**：`user-total-info`（营业厅）、`business-hall/user-pay-info`

```
收款 → 输入操作员姓名 → printWaterInfo
  → 小票 Recibo N°
  → 页脚：Este documento nao serve de fatura
  → receipt_status = 2
```

**查表员**（`user-total-info?source=search-person`）

```
收款 → blueToothInvoice（本地 Factura/Recibo，非 AGT FR）
  → invoice_status = 2
```

---

### 7.7 预交水费

**页面**：`adiantamento-water`、`print-info?is_yujiao=automatica`

```
创建预交记录 → 打印 Factura Automatica（本地）
AGT FA 尚未在前端统一接入
```

---

## 八、页面—接口对照表

| 页面 | 主要接口 | AGT | 打印 |
|------|----------|-----|------|
| `quick-factura` | `getBusinessHallList` / `getDemandNoteList` / `issueAgtInvoice` | FT | 批量开票（无自动打印） |
| `user-water-info` | `issueAgtInvoice` / `getUserBluetoolthInfoData` | FT | 开票后/已开重打缴费单 |
| `user-parenType-info` | `payDemandNote` / `issueAgtInvoice` | FR | 收款后打印 |
| `other-invoices` | `createPayDemandNote` / `trUpPayDemandMote` | ❌ | 本地打印 |
| `user-total-info` | `payWater` / `handleBusinessHallPayBill` | ❌ | 本地发票或收据 |
| `pay/print-info` | `payWater` / `printWater` | ❌ | 抄表后本地打印 |
| `business-hall/user-pay-info` | 历史收款详情 | ❌ | 补打发票/收据 |
| `business-hall/index` | `getBusinessHallList` | ❌ | 作废单补打 |

### 相关 API 文件

| 文件 | 说明 |
|------|------|
| `apis/admin.js` | `issueAgtInvoice`、`createPayDemandNote`、`getDemandNoteList` 等 |
| `apis/business-hall.js` | `getBusinessHallList`、`handleBusinessHallPayBill`、`handleBusinessHallBillReceipt` |
| `apis/water.js` | `payWater`、`printWater`、打印状态回写 |
| `apis/agt.js` | AGT 原始 REST 接口（前端一般不直接调用） |

---

## 九、业务决策树

```
是否为抄表水费（user_pay_log）？
├─ 是
│   ├─ 需 AGT 先开票后收款 → FT + user_pay_log
│   │     入口：quick-factura / user-water-info【发票】
│   └─ 仅通知缴费、不打 AGT → 本地 Factura Simplificada
│         入口：print-info / 查表员【打印缴费单】
│
└─ 否（其他收费 demand_note）
    ├─ 未收款，创建通知单 → createPayDemandNote + 本地打印（other-invoices）
    ├─ 未收款，需 AGT → FT + user_pay_demand_note（quick-factura Tab2）
    └─ 已收款，需正式票 → FR + user_pay_demand_note（user-parenType-info）
```

### 模式对照

| 模式 | 时机 | document_type | source_type |
|------|------|---------------|-------------|
| 发票先行 | 未收款 | FT | user_pay_log / user_pay_demand_note |
| 收款后开票 | 已收款 | FR | user_pay_demand_note |
| 缴费通知 | 任意 | — | 本地 Factura Simplificada |
| 收款凭证 | 已收款（营业厅） | — | 本地 Recibo |

---

## 十、待完善 / 已知差异

| 项 | 现状 | 建议 |
|----|------|------|
| `other-invoices` Tab 发票 | 只本地打印，未调 AGT | 按业务决定收款前 FT 或收款后 FR |
| 首页 FR / FA / RG 入口 | `docType` 未读 | 页面按 docType 分支调 AGT |
| `source_id` 字段 | 当前 `up_id \|\| id` | 与后端确认抄表单正确 ID |
| FT 已开后再收款 | 可能重复开 FR | 需后端/产品确认 |
| 查表员本地 Factura/Recibo | 非 AGT，只更新 invoice_status | 与 AGT FT/FR 是并行体系 |
| quick-factura 批量开票 | 成功后不自动打印 | 可按需增加打印步骤 |

---

## 十一、业务共识摘要

1. **Factura Simplificada（缴费单）** ≠ AGT FT：前者是本地应缴通知，后者是税务局正式发票。
2. **FT**：先开票后收款（quick-factura、营业厅详情【发票】）。
3. **FR**：收款后开票（user-parenType-info，其他收费 type=1）。
4. **Recibo**：营业厅本地收据，页脚声明不能作发票；查表员不走 Recibo，走 Factura/Recibo。
5. **AGT 开票统一走** `issueAgtInvoice`，不要直接调 `apis/agt.js` 里的 AGT 原始接口。
6. **source_type 只能用** `user_pay_log` 或 `user_pay_demand_note`。

---

## 附录：关键代码位置

| 功能 | 文件 | 方法 |
|------|------|------|
| AGT 开票封装 | `apis/admin.js` | `issueAgtInvoice` |
| FT 批量参数 | `pages/query-water/quick-factura/index.js` | `buildAgtParams` |
| 营业厅详情开票 | `pages/user-water-info/index.js` | `buildAgtInvoiceParams` / `issueAgtInvoiceThenPrint` |
| 收款后 FR | `pages/user-parenType-info/index.js` | `issueAgtInvoiceThenPrint` |
| 缴费单蓝牙打印 | `pages/user-water-info/index.js` | `blueToothPrint` |
| 其他收费本地打印 | `pages/query-water/other-invoices/index.js` | `getPrint` |
| 查表员本地发票 | `pages/user-total-info/index.js` | `blueToothInvoice` |
| 营业厅本地收据 | `pages/user-total-info/index.js` | `printWaterInfo` |

---

*文档维护：功能变更时请同步更新本文档及 `apis/admin.js` 接口注释。*
