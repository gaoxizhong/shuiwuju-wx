const { wxAsyncApi } = require('./util')

const BLUETOOTH_PAGE = '/pages/admin/bluetooth/index?origin=page'

function getStoredConnectDevice() {
  try {
    const raw = wx.getStorageSync('connectDevice')
    if (!raw) return null
    const device = JSON.parse(raw)
    return device && device.deviceId ? device : null
  } catch (e) {
    return null
  }
}

/**
 * 打印 / AGT 开票前：确认已配置蓝牙打印机
 * @returns {Promise<{ready:boolean, device?:object, navigatedToConnect?:boolean}>}
 */
function ensureBluetoothPrinterReady() {
  const device = getStoredConnectDevice()
  if (device) {
    return Promise.resolve({ ready: true, device })
  }
  const lang = getApp().globalData.lang
  const blueLang = lang.blueToolth || {}
  return new Promise((resolve) => {
    wx.showModal({
      title: blueLang.noConnect,
      content: blueLang.noConnectWarning,
      cancelText: blueLang.cancelText,
      confirmText: blueLang.confirmText,
      complete: (res) => {
        if (res.confirm) {
          wxAsyncApi('navigateTo', { url: BLUETOOTH_PAGE })
            .then(() => {
              wx.setNavigationBarTitle({ title: blueLang.title })
              resolve({ ready: false, navigatedToConnect: true })
            })
            .catch(() => resolve({ ready: false, navigatedToConnect: false }))
        } else {
          wx.showToast({
            title: blueLang.cancel,
            icon: 'none',
          })
          resolve({ ready: false, navigatedToConnect: false })
        }
      },
    })
  })
}

/**
 * 门禁通过后再执行；未连接且用户去连接页时写入 pendingPrintFlow，由 onShow 续流程
 * @param {WechatMiniprogram.Page.TrivialInstance} page
 * @param {string} [pendingFlowKey]
 * @param {Function} action
 */
function runAfterBluetoothGate(page, pendingFlowKey, action) {
  return ensureBluetoothPrinterReady().then(({ ready, navigatedToConnect }) => {
    if (ready && typeof action === 'function') {
      action()
      return
    }
    if (navigatedToConnect && pendingFlowKey && page && page.setData) {
      page.setData({ pendingPrintFlow: pendingFlowKey })
    }
  })
}

function isBluetoothReady() {
  return !!getStoredConnectDevice()
}

module.exports = {
  getStoredConnectDevice,
  ensureBluetoothPrinterReady,
  runAfterBluetoothGate,
  isBluetoothReady,
}
