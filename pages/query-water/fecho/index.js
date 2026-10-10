// pages/query-water/fecho/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')
const {
  wxAsyncApi,
} = require('../../../utils/util')
const {
  getAdminShift,
} = require('../../../apis/water')
const {
  arrEncoderCopy,
} = require('../../../utils/print')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.fecho,
    btnName: lang.btnName,
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    operator_name: '',
    name_error: false,
    printInfo: '',
    printInfo_title: '',
    printInfo_data: '',
    infoData: null,
  },

  onLoad(options) {},

  onReady() {},

  onShow() {
    lang = app.globalData.lang
    this.setData({
      lang: lang.fecho,
      btnName: lang.btnName,
      bluetoolthDevice: lang.admin.bluetoolthDevice,
    })
    this.getAdminShift(0)
  },

  handleTimeValue(date) {
    const _date = date ? new Date(date) : new Date()
    const year = _date.getFullYear()
    const month = _date.getMonth() + 1
    const day = _date.getDate()
    const hh = _date.getHours()
    const mm = _date.getMinutes()
    const ss = _date.getSeconds()
    const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hh >= 10 ? hh : '0' + hh}:${mm >= 10 ? mm : '0' + mm}:${ss >= 10 ? ss : '0' + ss}`
    const timestamp = new Date(year, month - 1, day, hh, mm, ss).getTime() / 1000
    return {
      year,
      month,
      day,
      time,
      timestamp,
    }
  },

  getAdminShift(n, op_name) {
    let that = this
    let date_time = that.handleTimeValue().time
    let params = {
      date_time,
      type: n,
    }
    if (params.type == 1) {
      params.operator_name = op_name
    }
    getAdminShift(params).then(res => {
      that.setData({
        infoData: res.data.data,
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000,
      })
    })
  },

  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  handleReading(e) {
    const operator_name = e.detail.value
    let name_error = this.data.name_error
    if (operator_name) {
      name_error = false
    }
    this.setData({
      operator_name,
      name_error,
    })
  },

  handleInputReading(e) {
    const operator_name = e.detail
    let name_error = this.data.name_error
    if (operator_name) {
      name_error = false
    }
    this.setData({
      operator_name,
      name_error,
    })
  },

  clickPrint() {
    let operator_name = this.data.operator_name
    if (!operator_name) {
      this.setData({
        name_error: true,
      })
      return
    }
    let infoData = this.data.infoData
    if (!infoData) {
      wx.showToast({
        title: this.data.lang.noData || getApp().globalData.lang.message.noMoreEmpty,
        icon: 'none',
      })
      return
    }
    let date = this.handleTimeValue()
    this.setData({
      printInfo_title: `EPASKS-E.P.`,
      printInfo: `
Factura Simplificada:     ${infoData.user_payment_count} Un
Valor a pagar:      ${infoData.price_sum} kZ
--------------------------------
recibo:                  ${infoData.receipt_num} Un
Valor a pagar:       ${infoData.receipt_total_price} kZ 
--------------------------------
Facura/recibo:           ${infoData.invoice_num} Un
Valor a pagar:         ${infoData.invoice_total_price} kZ
--------------------------------
Pessoa de entrega: ${operator_name}
Processado por programaválido n31.1/AGT20
`,
      printInfo_data: `
DATA: ${date.time}

`,
    })
    this.blueToothPrint()
  },

  blueToothPrint() {
    const connectStorage = wx.getStorageSync('connectDevice')
    const connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
    const lang = getApp().globalData.lang
    if (!connectDeviceInfo) {
      wx.showModal({
        title: lang.blueToolth.noConnect,
        content: lang.blueToolth.noConnectWarning,
        cancelText: lang.blueToolth.cancelText,
        confirmText: lang.blueToolth.confirmText,
        complete: (res) => {
          if (res.confirm) {
            wxAsyncApi('navigateTo', {
              url: `/pages/admin/bluetooth/index?origin=page`,
            }).then(() => {
              wx.setNavigationBarTitle({
                title: lang.blueToolth.title,
              })
            })
          }
          if (res.cancel) {
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
    this.handlePrint(connectDeviceInfo)
  },

  handlePrint(p) {
    const that = this
    const lang = getApp().globalData.lang
    const info = [
      ...blueToolth.printCommand.clear,
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...arrEncoderCopy(this.data.printInfo_title),
      ...blueToolth.printCommand.ct_zc,
      ...arrEncoderCopy(this.data.printInfo),
      ...blueToolth.printCommand.center,
      ...arrEncoderCopy(this.data.printInfo_data),
      ...blueToolth.printCommand.enter,
    ]
    console.log('BLE writeBLECharacteristicValue...')
    blueToolth.writeBLECharacteristicValue({
      ...p,
      value: new Uint8Array(info).buffer,
      lasterSuccess() {
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: 'none',
          duration: 3000,
        })
        that.setData({
          pay_success: false,
        })
        that.getAdminShift(1, that.data.operator_name)
      },
      onFail(res) {
        console.log('BLE print fail', res)
      },
    })
  },
})
