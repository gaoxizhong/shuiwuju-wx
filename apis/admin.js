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
