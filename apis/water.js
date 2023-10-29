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