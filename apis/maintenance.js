import {
  httpRequest
} from '../utils/request'


// 查询维修单
export const getMaintenanceList = (data) => {
  const baseUrl = getApp().globalData.baseUrl
  return httpRequest({
    url: `${baseUrl}/api/wx/m/m_repair_list`,
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