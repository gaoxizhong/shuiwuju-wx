// pages/business-hall/hecho/index.js
const app = getApp()
let lang = app.globalData.lang

const {
  getAdminShift,
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
    let printInfo_title =`EPASKS-E.P.`;
    let printInfo = `
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
`;
    let printInfo_data =`
DATA: ${date.time}

`;
    let printData = {
      "name": "printMix", //普通纸混合打印
      "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
      "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
      "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
      "data": [
        {
          "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
          "text": encodeURIComponent(printInfo_title) + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
          "concentration": 15, //打印浓度1~20，默认15
          "align": 1, //0左对齐，1居中对齐，2右对齐；
          "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
          //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
          "isDoubleHeight": true, //是否倍高；
          "isDoubleWidth": false, //是否倍宽；
          "isUnderLine": 0, //是否加下划线；
          "isBold": true, //是否加粗；
        },
        {
          "printType": 0,
          "text": encodeURIComponent(printInfo) + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": encodeURIComponent(printInfo_data) + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
      ]
    }
    this.SendControlCommand(printData);
  },
// 新打印机打印方法
SendControlCommand(printData) {
  let that = this;
  wx.showLoading({
    title: ''
  });

  let printCtn = {
    "type":"print",
    "printJsonStr": printData
  }
  wx.request({
    url: app.globalData.apiUrl + "/iotAdmin/iot/write2Printer",
    method: "post",
    data: {
      terminalNo: app.globalData.terminalNo,
      groupId: app.globalData.groupId,
      printCtn: JSON.stringify(printCtn)
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    success: (res) => {
      wx.hideLoading();
      console.log('success...',res)
      if(res.data.code == 200){
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: "",
          duration: 3000,
        })
        that.getOrderInfo(res.data.data[0].orderId);
      }else{
        wx.showToast({
          title: 'error',
          icon: "none",
          duration: 3000,
        })
      }
      that.setData({
        pay_success: false,
      })
      that.getAdminShift(1,that.data.operator_name);
    },
    fail: (err) => {
      wx.hideLoading();
      console.log('err...',err)// 控制台打印完整错误，方便排查
     
    }
  })
},
getOrderInfo(id){

  wx.request({
    url: "https://iot.unioncore.vip/iotAdmin/iot/getOrderInfo",
    method: "post",
    data: {
      orderId: id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    success: (res) => {
      wx.hideLoading();
      console.log('success...',res)
      if(res.data.code == 200){
        
      }else{
       
      }
    },
    fail: (err) => {
      wx.hideLoading();
      console.log('err...',err)// 控制台打印完整错误，方便排查
      
    }
  })
},

})