import {
  httpRequest
} from '../utils/request'


// 营业厅 获取列表
export const getBusinessHallList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_bill_list`,
    method: 'POST',
    data
  })
}
// 获取删除缴费单记录 
export const getDelUserPaymentList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_get_del_user_payment_list`,
    method: 'POST',
    data
  })
}
// 确认缴费
export const handleBusinessHallPayBill = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_pay_bill`,
    method: 'POST',
    data
  })
}

// 开具收据
export const handleBusinessHallBillReceipt = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_bill_receipt`,
    method: 'POST',
    data
  })
}
// 修改水表信息
export const editWater = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/tr/tr_update_water_meter`,
    method: 'POST',
    data
  })
}
