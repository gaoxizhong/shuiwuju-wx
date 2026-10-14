import {
  httpRequest
} from '../utils/request'

// 员工认证
export const employeeCertification = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/rs/rs_bind_admin`,
    method: 'POST',
    data
  })
}

// 判断用户是否存在 查询用户现在用水量
export const isAdmin = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_search_wm`,
    method: 'POST',
    data
  })
}
// 获取收费及目标
export const getTrPriceList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_price_list`,
    method: 'POST',
    data
  })
}
// 创建收费账单
export const createPayDemandNote = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_create_pay_demand_note`,
    method: 'POST',
    data
  })
}

// 收费项目列表
export const getDemandNoteList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_get_demand_note_list`,
    method: 'POST',
    data
  })
}
//  收费项目缴费
export const payDemandNote= (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_pay_demand_note`,
    method: 'POST',
    data
  })
}
//  修改缴费项目收据的开发票状态'
export const setBillInvoiceCode= (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_bill_invoice_code`,
    method: 'POST',
    data
  })
}
// 形式发票转换
export const trUpPayDemandMote = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_up_pay_demand_note`,
    method: 'POST',
    data
  })
}
// 计算其他收费项目应收费用
export const getTrDemandNoteTotalMoney = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_demand_note_total_money`,
    method: 'POST',
    data
  })
}

// 删除缴费单（仅未付款可删）
export const deletePayDemandNote = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_delete_pay_demand_note`,
    method: 'POST',
    data
  })
}

/**
 * AGT 电子发票开具
 * POST /api/wx/tr/tr_issue_agt_invoice
 * 后端封装 solicitarSerie + registarFactura + obterEstado 全流程
 *
 * @param {Object} data 请求体
 * @param {string} data.document_type  AGT 票据类型（必填）
 *   - FT  发票（抄表缴费单先开票后收款，见 quick-factura / user-water-info）
 *   - FR  发票/收据（其他收费收款后开票，见 user-parenType-info）
 *   - FA  预付款发票
 *   - RG  收据
 * @param {number} [data.poll=1]           是否轮询 AGT 开票状态：1 是，0 否
 * @param {number} [data.poll_times=5]     轮询最大次数
 * @param {number} [data.poll_interval=3]  轮询间隔（秒）
 * @param {string} [data.customer_tax_id]  买方税号（AGT customerTaxID / NIF）
 *   取值优先级：接口入参 > water_meter.nif/user_card > 999999999（最终消费者占位）
 * @param {string} [data.company_name]     买方名称（可选）；不传时默认用水表户名
 * @param {string} [data.schema_version]   AGT schema 版本，须 2.x（如 "2.0"）；1.2 已不被 AGT 支持
 *
 * --- 抄表缴费单（user_pay_log）---
 * @param {string} data.source_type  固定为 user_pay_log
 * @param {number} data.source_id    抄表缴费单 ID（up_id / list item.id）
 *
 * --- 其他收费缴费单（user_pay_demand_note）---
 * @param {string} data.source_type  固定为 user_pay_demand_note
 * @param {number} data.source_id    其他收费缴费单 ID（demand_note_id）
 *
 * @example 抄表缴费单开 FT（营业厅详情 user-water-info）
 * issueAgtInvoice({
 *   document_type: 'FT',
 *   poll: 1, poll_times: 5, poll_interval: 3,
 *   source_type: 'user_pay_log',
 *   source_id: 123,
 *   customer_tax_id: '5601022917',
 *   schema_version: '2.0',
 * })
 *
 * @example 其他收费开 FT（quick-factura 其他发票 Tab）
 * issueAgtInvoice({ document_type: 'FT', poll: 1, poll_times: 5, poll_interval: 3, source_type: 'user_pay_demand_note', source_id: 456, customer_tax_id: '5601022917', schema_version: '2.0' })
 *
 * @example 收款后开 FR（user-parenType-info，亦可仅传 demand_note_id）
 * issueAgtInvoice({ document_type: 'FR', poll: 1, poll_times: 5, poll_interval: 3, source_type: 'user_pay_demand_note', source_id: 456, customer_tax_id: '5601022917', schema_version: '2.0' })
 *
 * @returns {Promise} 成功时 data 含 AGT 返回信息，常见字段：documentNo / document_no / invoice_no
 */
export const issueAgtInvoice = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  // AGT 2026 起要求 schemaVersion 2.x；1.2 会返回 E99
  const payload = Object.assign({
    schema_version: '2.0',
    schemaVersion: '2.0',
  }, data || {})
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_issue_agt_invoice`,
    method: 'POST',
    data: payload,
    timeout: 60000,
  })
}

/**
 * 查询 AGT 校验状态（obterEstado）
 * POST /api/wx/tr/tr_obter_agt_estado
 *
 * 三选一传参（优先 request_id）：
 * @param {string} [data.request_id]       AGT 提交后的 requestID
 * @param {number} [data.user_pay_log_id]  缴费支付记录 ID
 * @param {number} [data.submission_id]    本地 submission ID
 *
 * 关注返回：invoice_ok / validation_status(V|I|null) / rate_limited / document_no
 */
export const obterAgtEstado = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_obter_agt_estado`,
    method: 'POST',
    data: data || {},
    timeout: 60000,
  })
}

/**
 * AGT 贷项通知单（NC 冲红）
 * POST /api/wx/tr/tr_issue_agt_credit_note
 *
 * @param {Object} data
 * @param {number} data.user_pay_log_id  缴费记录 ID（jc 缴费记录删除冲红）
 * @param {string} [data.reason]         冲红原因
 * @param {number} [data.poll=1]
 * @param {number} [data.poll_times=5]
 * @param {number} [data.poll_interval=3]
 *
 * 其他收费单示例：source_type=user_pay_demand_note + demand_note_id
 */
export const issueAgtCreditNote = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_issue_agt_credit_note`,
    method: 'POST',
    data: data || {},
    timeout: 60000,
  })
}

function delayMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pickAgtRequestId(res) {
  const root = res || {}
  const data = root.data || root
  const inner = data.data || data
  const submission = inner.submission || {}
  return String(
    inner.request_id
    || inner.requestID
    || submission.request_id
    || (inner.submit_result && inner.submit_result.data && inner.submit_result.data.requestID)
    || ''
  )
}

/** 开票后查状态：最多 3 次，间隔 30s；仍 pending（如 E92）则返回，由页面决定「仍打印」 */
const AGT_OBTER_INTERVAL_SEC = 30
const AGT_OBTER_MAX_TIMES = 3

/**
 * 开票成功后用 request_id 调用 tr_obter_agt_estado 查询校验结果
 * 仅 invoice_ok===true 或 validation_status===V 视为校验通过
 * 默认最多查 max_poll_times 次；仍 pending（如 E92）则返回，由页面决定「仍打印」
 *
 * @param {Object} issueData 同 issueAgtInvoice（建议 poll:0，由前端查状态）
 * @param {Object} [options]
 * @param {number} [options.poll_interval=30]  轮询间隔（秒）
 * @param {number} [options.max_poll_times=3] 最多查询次数（0=开票后不查）
 * @returns {Promise<{issueRes:any, estadoRes:any, finalRes:any, request_id:string}>}
 */
export const issueAgtInvoiceThenQueryEstado = (issueData, options) => {
  const opts = options || {}
  const pollIntervalMs = (opts.poll_interval != null
    ? Number(opts.poll_interval)
    : AGT_OBTER_INTERVAL_SEC) * 1000
  const maxPollTimes = opts.max_poll_times != null
    ? Number(opts.max_poll_times)
    : AGT_OBTER_MAX_TIMES
  const util = require('../utils/util')
  // 开票阶段不让后端轮询 obterEstado，统一由前端查询
  const issuePayload = Object.assign({}, issueData || {}, {
    poll: 0,
    poll_times: 0,
  })

  return issueAgtInvoice(issuePayload).then((issueRes) => {
    // 开票接口已直接返回 V，无需再查
    if (util.isAgtValidationPassed(issueRes)) {
      return {
        issueRes,
        estadoRes: null,
        finalRes: issueRes,
        request_id: pickAgtRequestId(issueRes),
      }
    }
    const requestId = pickAgtRequestId(issueRes)
    if (!requestId || maxPollTimes <= 0) {
      return {
        issueRes,
        estadoRes: null,
        finalRes: issueRes,
        request_id: requestId || '',
      }
    }

    let pollCount = 0
    const runQuery = () => {
      return obterAgtEstado({ request_id: requestId }).then((estadoRes) => {
        pollCount += 1
        if (util.isAgtValidationPassed(estadoRes)) {
          return {
            issueRes,
            estadoRes,
            finalRes: estadoRes,
            request_id: requestId,
          }
        }
        const { validationStatus, docStatus } = util.getAgtDocStatuses(estadoRes)
        // 明确无效，或已达查询上限（含 E92 处理中）→ 返回给页面
        if (validationStatus === 'I' || docStatus === 'I' || pollCount >= maxPollTimes) {
          return {
            issueRes,
            estadoRes,
            finalRes: estadoRes,
            request_id: requestId,
          }
        }
        return delayMs(pollIntervalMs).then(() => runQuery())
      })
    }
    return runQuery()
  })
}