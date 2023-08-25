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