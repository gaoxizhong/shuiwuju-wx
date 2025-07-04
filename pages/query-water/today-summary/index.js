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
    this.setData({
      printInfo_title:`
EPASKS-E.P.
`,
      printInfo:`
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
--------------------------------
Processado por programaválido n31.1/AGT20
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
    let that = this;
    // GBK.encode({string}) 解码GBK为一个字节数组
      //  收据
    let info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.ct,
        ...blueToolth.printCommand.center,
        ...this.arrEncoderCopy(this.data.printInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...blueToolth.printCommand.left,
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
      },
      onFail(res){
        console.log('打印失败...')
        console.log(res)
      }
    });
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