import {
  httpRequest
} from '../utils/request'


// 新增水表用户
export const addAccount = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_create_wm`,
    method: 'POST',
    data
  })
}
// 获取价格类型
export const fbUserType = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/user_type`,
    method: 'POST',
    data
  })
}


// 计算水费
export const countWater = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_compute_price`,
    method: 'POST',
    data
  })
}

// 支付水费
export const payWater = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_pay_bill`,
    method: 'POST',
    data
  })
}
// 新支付水费
export const new_payWater = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_user_payment`,
    method: 'POST',
    data
  })
}

// 开收据
export const printWater = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_bill_receipt`,
    method: 'POST',
    data
  })
}

//缴费单列表
export const payWaterList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_bill_list`,
    method: 'POST',
    data
  })
}
export const getAdminList = (data) =>{
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_admin_statis`,
    method: 'POST',
    data
  })
}

// 获取待缴费金额接口
export const getArrearsMoneySum = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_arrears_money_sum`,
    method: 'POST',
    data
  })
}

// 获取用户打印信息
export const getUserBluetoolthInfoData = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_user_info`,
    method: 'POST',
    data
  })
}

// 修改打印收据状态
export const setReceiptStatus = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_up_print_receipt_status`,
    method: 'POST',
    data
  })
}
// 修改发票收据状态
export const setInvoiceStatus = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_up_print_invoice_status`,
    method: 'POST',
    data
  })
}

// 确认缴费单
export const readingPic = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_wm_reading`,
    method: 'POST',
    data
  })
}
// 确认缴费单
export const getUserListLngLat = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_get_user_list_by_lng_lat`,
    method: 'POST',
    data
  })
}

// 获取我的收款记录
export const getUserPayLog = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_user_pay_log`,
    method: 'POST',
    data
  })
}
// 删除我的收款记录
export const delUserPayLog = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_del_user_pay_log`,
    method: 'POST',
    data
  })
}

// 获取我的收款记录详情
export const getUserPayItemDetail = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_user_pay_item`,
    method: 'POST',
    data
  })
}
// 抄表员提交交接班 
export const getAdminShift = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_admin_shift`,
    method: 'POST',
    data
  })
}
// 抄表员提交交接班 
export const getAdminShiftData = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_admin_shift_data`,
    method: 'POST',
    data
  })
}
// 删除缴费单 
export const delUserPayment = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_del_user_payment`,
    method: 'POST',
    data
  })
}
// 获取列表选项详情
export const getFbuserStatis = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/fb/fb_user_statis`,
    method: 'POST',
    data
  })
}