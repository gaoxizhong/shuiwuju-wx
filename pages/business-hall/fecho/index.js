// pages/business-hall/hecho/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi,
} = require('../../../utils/util')
const {

} = require('../../../apis/water')
import {
  handleBusinessHallPayBill,
  handleBusinessHallBillReceipt
} from '../../../apis/business-hall'
const GBK = require('../../../utils/gbk.min')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    username: '',
    name_error: false,
    printInfo:'', //  打印数据
    infoDta: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  handleReading(e){

  },
  handleInputReading(e) {
    console.log(e)
    const username = e.detail
    let name_error = this.data.name_error
    if (reading) {
      name_error = false
    }
    this.setData({
      username,
      name_error
    })
  },
  clickPrint(){
    let username = this.data.username;
    if (!username) {
      this.setData({
        name_error : true
      })
      return
    }
    // 获取打印信息
    let infoDta = this.data.infoDta;
    this.setData({
      printInfo:`
收据：*张；  现金：*
      
      `
    })
    this.blueToothPrint();
  },
  // 蓝牙设备打印
  blueToothPrint() {
    const connectStorage = wx.getStorageSync('connectDevice')
    const connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
    console.log(connectDeviceInfo)
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
      console.log('已连接。。。')
      wx.showToast({
        title: lang.blueToolth.connectDevice,
        icon: "none",
        duration: 30000,
      })
     this.handlePrint(connectDeviceInfo)
    }
  },
    // 开始打印
    handlePrint(p) {
      let print_type = this.data.print_type;
      // GBK.encode({string}) 解码GBK为一个字节数组
      let info = [
        ...blueToolth.printCommand.clear,
        ...GBK.encode(this.data.printInfo),
        ...blueToolth.printCommand.enter
      ]
      console.log('开始打印，api传信息...')
      blueToolth.writeBLECharacteristicValue({
        ...p,
        value: new Uint8Array(info).buffer,
        lasterSuccess() {
          console.log('打印成功...')
          wx.showToast({
            title: lang.blueToolth.printSuccess,
            icon: "none",
            duration: 3000,
          })
          that.setData({
            paid_total_money: '',
            pay_success: false,
            pay_way: '',
            pay_text: '',
          })
        },
        onFail(res){
          console.log('打印失败...')
          console.log(res)
        }
      });
    },

})