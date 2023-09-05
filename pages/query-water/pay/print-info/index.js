// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi,
} = require('./../../../../utils/util')
const blueToolth = require('./../../../../utils/bluetoolth')
const {
  payWater,
  printWater
} = require('./../../../../apis/water')
const GBK = require('./../../../../utils/gbk.min')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.pay.collectInfo,
    langDialog: lang.dialog,

    btnName: lang.btnName,
    form: {},
    payStatusList: [],
    active: 2,
    steps: lang.pay.steps,
    status: 'pay',
    showPay: false,
    printDeviceInfo: null,
    printInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const {
      imageUrl,
      reading,
      total_money,
      total_water,
      wm_no,
      last_reading,
      up_id,
      payStatusList,
      check_time_text
    } = options
    this.setData({
      form: {
        imageUrl,
        reading,
        total_money,
        total_water,
        wm_no,
        up_id,
        last_reading,
        check_time_text
      },
      payStatusList: JSON.parse(payStatusList),
      printInfo: `
EPAL CUANZA SUL WATER MANEGEMENT

${this.data.lang.wm_no}：${wm_no};
${this.data.lang.last_water}：${last_reading}（Litro）;
${this.data.lang.reading}：${reading}（Litro）;
${this.data.lang.total_water}：${total_water}（Litro）;
${this.data.lang.total_money}：${total_money}（KZ）;


`,
      lang: lang.pay.collectInfo,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      steps: lang.pay.steps,
    })
  },

  showPayPopup() {
    this.setData({
      showPay: true
    })
  },
  onClosePay() {
    this.setData({
      showPay: false
    })
  },
  onConfirmPay(e) {
    const {
      text,
      key
    } = e.detail.value
    const up_id = this.data.form.up_id
    const params = {
      up_id,
      pay_way: key
    }
    payWater(params).then(res => {
      this.setData({
        status: 'print',
        showPay: false
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none'
      })
    })
  },
  printWaterInfo() {
    const up_id = this.data.form.up_id
    const params = {
      up_id,
    }
    printWater(params).then(res => {
      this.setData({
        status: 'over',
        showPay: false
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none'
      })
    })
  },
  // 蓝牙设备打印
  blueToothPrint() {
    const connectStorage = wx.getStorageSync('connectDevice')
    const connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
    const lang = getApp().globalData.lang
    console.log(lang.blueToolth)
    console.log(connectDeviceInfo)
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
            }).then(res => {
              wx.setNavigationBarTitle({
                title: lang.blueToolth.title,
              })
            })
          }
          if (res.cancel) {
            wx.showToast({
              title: lang.blueToolth.cancel,
              icon: "none",
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: lang.blueToolth.connectDevice,
        icon: "none",
        duration: 30000,
      })
      this.handlePrint(connectDeviceInfo)
      // this.connectBlueToothDevice(connectDeviceInfo)
    }
  },
  connectBlueToothDevice({ deviceId, serviceId }) {
    wx.showToast({
      title: lang.blueToolth.connectDevice,
      icon: "none",
      duration: 30000,
    })
    blueToolth.createBLEConnection(deviceId).then(res => {
      console.log(res)
      if (res.errMsg && res.errMsg.includes('ok')) {
        blueToolth.getBLEDeviceServices({
          deviceId,
          serviceId
        }).then(data => {
          wx.hideToast()
          wx.showToast({
            title: lang.blueToolth.connectSuccess,
            icon: "none",
            duration: 3000,
          })

          this.setData({
            printDeviceInfo: data,
          })
          this.handlePrint()
        }).catch((res) => {
          wx.hideToast()
          wx.showToast({
            title: lang.blueToolth.connectfail,
            icon: "none",
            duration: 3000,
          })
          this.setData({
            printDeviceInfo: null,
          })
        })
      } else {
        wx.hideToast()
        this.setData({
          printDeviceInfo: null,
        })
      }
    }).catch((res) => {
      wx.hideToast()
      let msg = ''
      if (res.errCode) {
        msg = blueToolth.errorInfo[res.errCode]
      }
      msg = msg || res.errMsg.split('fail')[1]
      wx.showToast({
        title: msg,
        icon: "none",
        duration: 3000,
      })
      this.setData({
        printDeviceInfo: null,
      })
    })
  },
  handlePrint(p) {
    blueToolth.writeBLECharacteristicValue({
      // ...this.data.printDeviceInfo,
      ...p,
      value: new Uint8Array([...blueToolth.printCommand.clear, ...GBK.encode(this.data.printInfo), ...blueToolth.printCommand.enter])
        .buffer,
      lasterSuccess() {
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: "none",
          duration: 3000,
        })
      }
    });
  },
})