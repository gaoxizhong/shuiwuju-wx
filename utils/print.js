/**
 * 完整旧蓝牙打印工具（与换新打印前一致）
 * - arrEncoderCopy：打印内容转字节
 * - printCommand：ESC/POS 指令（来自 bluetoolth）
 * - verifyBlueToothPrint：检查已连接设备，未连接跳转配对页
 * - writeBLECharacteristicValue：写入蓝牙特征值
 * - printEscPos：组装指令数组并发送
 */
const blueToolth = require('./bluetoolth')
const { wxAsyncApi } = require('./util')
var encoding = require('./encoding.js')

/** 打印内容转义/编码为字节数组（旧方法） */
function arrEncoderCopy(str) {
  const inputBuffer = new encoding.TextEncoder().encode(str == null ? '' : String(str))
  return [...inputBuffer]
}

/** ESC/POS 指令集 */
const printCommand = blueToolth.printCommand

/**
 * 检查蓝牙打印机连接；成功则回调 deviceInfo
 * @param {Function} onConnected function(deviceInfo)
 */
function verifyBlueToothPrint(onConnected) {
  const lang = getApp().globalData.lang
  const connectStorage = wx.getStorageSync('connectDevice')
  let connectDeviceInfo = ''
  try {
    connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
  } catch (e) {
    connectDeviceInfo = ''
  }
  if (!connectDeviceInfo || !connectDeviceInfo.deviceId) {
    wx.showModal({
      title: lang.blueToolth.noConnect,
      content: lang.blueToolth.noConnectWarning,
      cancelText: lang.blueToolth.cancelText,
      confirmText: lang.blueToolth.confirmText,
      complete: (res) => {
        if (res.confirm) {
          wxAsyncApi('navigateTo', {
            url: '/pages/admin/bluetooth/index?origin=page',
          }).then(() => {
            wx.setNavigationBarTitle({
              title: lang.blueToolth.title,
            })
          })
        } else if (res.cancel) {
          wx.showToast({
            title: lang.blueToolth.cancel,
            icon: 'none',
          })
        }
      },
    })
    return
  }
  wx.showToast({
    title: lang.blueToolth.connectDevice,
    icon: 'none',
    duration: 30000,
  })
  if (typeof onConnected === 'function') {
    onConnected(connectDeviceInfo)
  }
  return connectDeviceInfo
}

/**
 * 旧接口：写入蓝牙打印数据
 * options: { deviceId, serviceId, characteristicId, value, lasterSuccess, onFail }
 */
function writeBLECharacteristicValue(options) {
  return blueToolth.writeBLECharacteristicValue(options)
}

/**
 * 用 ESC/POS 指令数组直接打印
 * @param {Object} device connectDevice
 * @param {number[]} infoBytes 已拼接的指令+文本字节
 * @param {Object} [hooks] { success, fail }
 */
function printEscPos(device, infoBytes, hooks) {
  const lang = getApp().globalData.lang
  const cbs = hooks || {}
  return new Promise((resolve, reject) => {
    blueToolth.writeBLECharacteristicValue({
      ...device,
      value: new Uint8Array(infoBytes).buffer,
      lasterSuccess() {
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: 'none',
          duration: 3000,
        })
        cbs.success && cbs.success()
        resolve({ success: true })
      },
      onFail(err) {
        cbs.fail && cbs.fail(err)
        reject(err || new Error('printFail'))
      },
    })
  })
}

/**
 * 便捷：校验连接后，按片段打印
 * segments: [{ align:'left'|'center'|'right', bold?:boolean, text:string }]
 */
function printTextSegments(segments, hooks) {
  return new Promise((resolve, reject) => {
    verifyBlueToothPrint((device) => {
      const info = [...printCommand.clear]
      ;(segments || []).forEach((seg) => {
        if (!seg) return
        if (seg.align === 'center') info.push(...printCommand.center)
        else if (seg.align === 'right') info.push(...printCommand.right)
        else info.push(...printCommand.left)
        if (seg.bold) info.push(...printCommand.ct)
        else info.push(...printCommand.ct_zc)
        if (seg.text != null) info.push(...arrEncoderCopy(seg.text))
        if (seg.bold) info.push(...printCommand.ct_zc)
      })
      info.push(...printCommand.enter)
      printEscPos(device, info, hooks).then(resolve).catch(reject)
    })
  })
}

module.exports = {
  blueToolth,
  printCommand,
  arrEncoderCopy,
  verifyBlueToothPrint,
  writeBLECharacteristicValue,
  printEscPos,
  printTextSegments,
}
