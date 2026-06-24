// pages/maintenance/today-summary/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  payWaterList,getAdminList
} from './../../../apis/water'
const {
  wxAsyncApi,fmoney
} = require('./../../../utils/util')
const blueToolth = require('../../../utils/bluetoolth')
//只需要引用encoding.js,注意路径
var encoding = require("../../../utils/encoding.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.todaySummary,
    langIndex: lang.index,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    list: [],
    payWayList: [],
    statusList: [],

    page: 1,
    total: 0,

    today_bill_count: 0,
    today_bill_amount: 0,
    today_cash_count: 0,
    today_cash_amount: 0,
    today_card_count: 0,
    today_card_amount: 0,

    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',

    wm_no: '',
    status: '',
    admin_name:'', // 管理员搜索字段
    show: false,
    selectIndex: 0, // 状态索引
    isScroll: false,
    loading: lang.message.scrollLoading,
    title_active: 1,
    adminList: [],
    tj: {},
    imprimirInfo:'', //  打印数据
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    const stime = this.data.startTime
    const etime = this.data.endTime
    this.setData({
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      loading: lang.message.scrollLoading
    })
  },
  handleSelectItem(e) {
    const {
      index,
      value
    } = e.detail;
    this.setData({
      selectIndex: index,
      status: value.key,
      page: 1,

      isScroll: true,
      loading: ''
    });
    this.onClosePopup()
    this.getList()
  },
  onChange(e){
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      title_active,
    })
  },
  // 管理员 input 事件
  handleChangeAdminName(e) {
    const value = e.detail
    this.setData({
      admin_name: value,
    })
  },
  // 管理员搜索事件
  onAdminNameSearch(){
    this.setData({
      adminList: [],
      list: [],
      wm_no: '',
      admin_name:'', // 管理员搜索字段
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading
    })
    this.getadminList()
  },
  // 水表用户 input 事件
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      wm_no: value,
    })
  },
  // 水表用户搜索事件
  onSearch() {
    this.setData({
      adminList: [],
      list: [],
      wm_no: '',
      admin_name:'', // 管理员搜索字段
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading
    })
    this.getList()
  },
  handleGetTime(e) {
    console.log(e)
    const {
      endDate,
      endTime,
      startDate,
      startTime,
    } = e.detail
    this.setData({
      endDate,
      endTime,
      startDate,
      startTime,
      adminList:[],
      list: [],
      wm_no: '',
      admin_name:'', // 管理员搜索字段
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading,
      loading: ''
    })
    if(this.data.title_active == 1){
      this.getList()
    }else{
      this.getadminList();
    }
  },
  //
  getadminList(){
    const params = {
      page: this.data.page,
      stime: this.data.startTime,
      etime: this.data.endTime,
      select: this.data.admin_name,
    }
    getAdminList(params).then(res => {

      const data = res.data.data || [];
      data.forEach(ele =>{
        ele.total_price = Number(ele.total_price)
      })
      const adminList = this.data.adminList.concat(data)
      console.log(adminList)
      let a = 0;
      let a1 = 0;
      let b = 0;
      let c = 0;
      let d = 0;
      let e = 0;
      let f = 0;
      let g = 0;
      let h = 0;
      adminList.forEach(ele=>{
        a += Number(ele.user_payment_count); // 缴费单
        a1 += Number(ele.price_sum); // 缴费单数
        b += Number(ele.invoice_num); // 发票数
        c += Number(ele.receipt_num); // 收据数
        d += Number(ele.total_price); // 收费金额

        e += Number(ele.pay_demand_note_data.user_pay_demand_note_count); // 其他项目开具收据数
        f += Number(ele.pay_demand_note_data.pay_demand_note_count); // 其他项目收据 已收费数量
        g += Number(ele.pay_demand_note_data.user_pay_demand_note_total_money_sum); // 其他项目收据 总金额
        h += Number(ele.pay_demand_note_data.pay_demand_note_total_money_sum); // 其他项目收据 已收总金额

      })
      console.log('缴费单:',a)
      console.log('缴费单额度:',a1)
      console.log('发票数:',b)
      console.log('收据数:',c)
      console.log('支付总额度:',d)
      let tj = {
        a: a.toFixed(0),
        a1: a1.toFixed(2),
        b: b.toFixed(0),
        c: c.toFixed(0),
        d: d.toFixed(2),
        e: e.toFixed(0),
        f: f.toFixed(0),
        g: g.toFixed(2),
        h: h.toFixed(2),
      }
      // const total = res.data.list.total
      this.setData({
        adminList,
        // total
        tj
      })
    }).catch(res => {})
  },
  // 个人数据---//缴费单列表
  getList() {
    let that = this;
    const params = {
      page: this.data.page,
      stime: this.data.startTime,
      etime: this.data.endTime,
      wm_no: this.data.wm_no,
      status: this.data.status
    }

    payWaterList(params).then(res => {
      let data = res.data.list.data || [];
      data.forEach(ele =>{
        ele.price = fmoney(Number(ele.price),2)
      })
      const list = that.data.list.concat(data)
      const total = res.data.list.total
      const {
        today_bill_count,  //用户数据 缴费单数
        today_bill_amount,
        today_cash_count,
        today_cash_amount,
        today_card_count,
        today_card_amount,
      } = res.data.stas
      const payWayList = res.data.pay_way.map(i => ({
        text: i.title,
        key: i.key
      }))

      const statusList = Object.keys(res.data.status).map(i => ({
        text: res.data.status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      that.setData({
        list,
        total,
        today_bill_count,
        today_cash_count,
        today_card_count,
        today_card_amount: fmoney(Number(today_card_amount),2),
        today_bill_amount: fmoney(Number(today_bill_amount),2),
        today_cash_amount: fmoney(Number(today_cash_amount),2),
        payWayList,
        statusList,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
    }).catch(res => {})
  },
  addListData() {
    let page = this.data.page
    const total = this.data.total
    if (total >= page * 15) {
      page += 1
      this.setData({
        page,
        loading: `${lang.message.loading}...`,
        isScroll: false,
      })
      this.getList()
    } else {
      this.setData({
        loading: lang.message.noMoreEmpty,
      })
    }
  },
  handleDetails(e) {
    const index = e.currentTarget.dataset.index
    const data = JSON.stringify(this.data.list[index])
    const payWayList = JSON.stringify(this.data.payWayList)
    wxAsyncApi('navigateTo', {
      url: `/pages/user-water-info/index?data=${data}&payWayList=${payWayList}&source=search-person`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  onShowPopup() {
    const select = this.selectComponent('#select')
    select && select.setColumnIndex(0, this.data.selectIndex)
    this.setData({
      show: true
    })
  },
  onClosePopup() {
    this.setData({
      show: false
    })
  },
  // 打印数据-- 获取打印信息
  imprimirInfo(){
    let that = this;
    // 获取打印信息
    let date = this.handleTimeValue();
    let tj = this.data.tj;
    let stime= this.data.startTime;
    let etime= this.data.endTime;
    let printInfo_title = `EPASKS-E.P.`;
    let printInfo = `
${stime} —— ${etime}
--------------------------------
Factura Simplificada: ${tj.a} Un / ${tj.a1} kZ
Facura/recibo:     ${tj.b} Un
Recibo:            ${tj.c} Un
Total:             ${tj.d} kZ 
--------------------------------
Outros itens carregados:
Factura Simplificada: ${tj.e} Un 
Facura/recibo:     ${tj.f} Un
Valor total:       ${tj.g} kZ 
Valor a pagar:     ${tj.h} kZ
--------------------------------`;
    let printInfo_data = `
Processado por programaválido n31.1/AGT20
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
          "lineHeight": 26,
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

  //获取当前时间
  handleTimeValue(date) {
    const _date = date ? new Date(date) : new Date()
    const year = _date.getFullYear()
    const month = _date.getMonth() + 1
    const day = _date.getDate()
    const days = _date.getDay()
    const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`
    return {
      time,
      year,
      month,
      day,
      days
    }
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
  }
})