import {
  httpRequest
} from '../utils/request'

// 居民查询账单列表
export const searchWaterList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/mine/mine_search_bill`,
    method: 'POST',
    data
  })
}

// 获取列表选项详情
export const getWaterInfo = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/mine/mine_search_repair`,
    method: 'POST',
    data
  })
}