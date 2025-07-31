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