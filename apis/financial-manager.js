import {
  httpRequest
} from '../utils/request'

// 查询账单列表
export const searchBillList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/jc/jc_bill_list`,
    method: 'POST',
    data
  })
}

// 处理账单
export const handleCheckBill = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/jc/jc_check_bill`,
    method: 'POST',
    data
  })
}

// 获取所有缴费单记录
export const getAllUserPayLog = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/jc/jc_user_pay_log`,
    method: 'POST',
    data
  })
}
// 删除缴费单的记录
export const delAllUserPayLog = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/jc/jc_del_user_pay_log`,
    method: 'POST',
    data
  })
}
// 获取删除缴费单的记录
export const getDelAllUserPayLog = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/jc/jc_get_del_user_pay_log_list`,
    method: 'get',
    data
  })
}