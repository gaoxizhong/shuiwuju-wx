import {
  httpRequest
} from '../utils/request'


// 获取所有维修单
export const getMaintenanceList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_all_list`,
    method: 'POST',
    data
  })
}
// 获取我的维修和投诉单
export const getMyMaintenanceList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_list`,
    method: 'POST',
    data
  })
}
// 获取维修人员列表
export const getRepairUserList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_user_list`,
    method: 'POST',
    data
  })
}
// 手动分配维修/投诉单给相关人员
export const handleRepairAssig = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_assign`,
    method: 'POST',
    data
  })
}

// 完成维修单
export const handleRepairDone = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_done`,
    method: 'POST',
    data
  })
}
//维修投诉总数据统计
export const getRepairAllStatis = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_all_statis`,
    method: 'POST',
    data
  })
}
//我的维修投诉总数据统计
export const getMyRepairAllStatis = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_statis`,
    method: 'POST',
    data
  })
}
