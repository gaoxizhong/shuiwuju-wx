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
 * @param {string} [data.customer_tax_id]  客户 NIF，通常传 water_meter.user_card
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
 * })
 *
 * @example 其他收费开 FT（quick-factura 其他发票 Tab）
 * issueAgtInvoice({ document_type: 'FT', poll: 1, poll_times: 5, poll_interval: 3, source_type: 'user_pay_demand_note', source_id: 456, customer_tax_id: '5601022917' })
 *
 * @example 收款后开 FR（user-parenType-info，亦可仅传 demand_note_id）
 * issueAgtInvoice({ document_type: 'FR', poll: 1, poll_times: 5, poll_interval: 3, source_type: 'user_pay_demand_note', source_id: 456, customer_tax_id: '5601022917' })
 *
 * @returns {Promise} 成功时 data 含 AGT 返回信息，常见字段：documentNo / document_no / invoice_no
 */
export const issueAgtInvoice = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_issue_agt_invoice`,
    method: 'POST',
    data,
    timeout: 60000,
  })
}