import { httpRequest } from '../utils/request'
// 获取token
export const getToken = (data) => {
const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/login`,
    method: 'POST',
    data
  })
}
// 获取用户权限
export const getUserInfo = () => {
const baseUrl = getApp().globalData.baseUrl
return httpRequest({
    url: `${baseUrl}/api/wx/mine/mine_index`,
    method: 'POST'
  })
}

// 获取地区

export const getArea = () => {
const baseUrl = getApp().globalData.baseUrl
return httpRequest({
    url: `${baseUrl}/api/wx/mine/mine_get_area`,
    method: 'POST',
  })
}

// 设置语言
export const updateLang = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
      url: `${baseUrl}/api/wx/mine/mine_update_lang`,
      method: 'POST',
      data
    })
  }