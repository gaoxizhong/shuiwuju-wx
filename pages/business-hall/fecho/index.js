// pages/business-hall/hecho/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')

const {
  wxAsyncApi,
} = require('../../../utils/util')
const {
  getAdminShift,getAdminShiftData
} = require('../../../apis/water')
//只需要引用encoding.js,注意路径
var encoding = require("../../../utils/encoding.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.fecho,
    btnName: lang.btnName,
    operator_name: '',
    name_error: false,
    printInfo:'', //  打印数据
    infoData: null,
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
    this.getAdminShift(0);
  },
  // 转二进制 并数组复制
  arrEncoderCopy(str){
    let data = str;
    // const encoder = new TextEncoder('cp860');  // 微信小程序不支持 new TextEncoder
    // let arr = [...encoder.encode(data)]
    // console.log(arr)
    //utf8
    let inputBuffer = new encoding.TextEncoder().encode(str);
    let arr = [ ...inputBuffer ]
    return arr
  },
  //获取当前时间
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
      timestamp
    }
  },
  getAdminShift(n,op_name){
    let that = this;
    let date_time = that.handleTimeValue().time;
    let params = {
      date_time,
      type: n,
    }
    if(params.type == 1){
      params.operator_name = op_name;
    }
    getAdminShift(params).then(res => {
      that.setData({
        infoData: res.data.data
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
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
    console.log(e)
     const operator_name = e.detail.value
     let name_error = this.data.name_error
     if (operator_name) {
       name_error = false
     }
     this.setData({
       operator_name,
       name_error
     })
  },
  handleInputReading(e) {
    console.log(e)
    const operator_name = e.detail
    let name_error = this.data.name_error
    if (operator_name) {
      name_error = false
    }
    this.setData({
      operator_name,
      name_error
    })
  },
  clickPrint(){
    let operator_name = this.data.operator_name;
    if (!operator_name) {
      this.setData({
        name_error : true
      })
      return
    }
    // 获取打印信息
    let infoData = this.data.infoData;
    let date = this.handleTimeValue();
    this.setData({
      printInfo:`
recepcao:          ${infoData.receipt_num} Un
numerário:         ${infoData.receipt_cash} kZ
transferência:   ${infoData.receipt_transfer_accounts} kZ 
Cartao:            ${infoData.receipt_pos} kZ
--------------------------------
As facturas:       ${infoData.invoice_num} Un
numerário:         ${infoData.invoice_cash} kZ 
transferência:   ${infoData.invoice_transfer_accounts} kZ
Cartao:            ${infoData.invoice_pos} kZ
--------------------------------
As facturas:        ${infoData.total_price} kZ
numerário:          ${infoData.cash_sum} kZ
transferência:    ${infoData.transfer_accounts_sum} kZ
Cartao:             ${infoData.pos_sum} kZ
--------------------------------
Pessoa de entrega: ${operator_name}
0000007/01180000/AGT/2023
`,
      printInfo_data:`
DATA: ${date.time}

`,
      
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
      ...this.arrEncoderCopy(this.data.printInfo),
      ...blueToolth.printCommand.center,
      ...this.arrEncoderCopy(this.data.printInfo_data),
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
          pay_success: false,
        })
        that.getAdminShift(1,that.data.operator_name);
      },
      onFail(res){
        console.log('打印失败...')
        console.log(res)
      }
    });
  },

})