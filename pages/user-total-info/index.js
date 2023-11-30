// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {
  wxAsyncApi,
} = require('./../../utils/util')
const {
  payWater,
  printWater,
  getArrearsMoneySum,
  new_payWater,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus
} = require('./../../apis/water')
const {
  handleCheckBill
} = require('./../../apis/financial-manager')
import {
  handleBusinessHallPayBill,
  handleBusinessHallBillReceipt
} from './../../apis/business-hall'
const GBK = require('./../../utils/gbk.min')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,
    wm_no:'',
    form: {},

    status: 'pay',
    showPay: false,
    printDeviceInfo: null,
    source: '',

    showResult: false,
    check_result: '',
    check_detail: '',
    check_detail_error: false,
    size: {
      maxHeight: 100,
      minHeight: 100
    },
    last_reading:'',
    last_time:'',
    arrears_money_sum:'',
    paid_total_money: '',
    no_error: false,
    payStatusList: [],
    pay_way:'',
    pay_text:'',
    receiptInfo:'', //  收据
    invoiceInfo:'',//  发票
    pay_success: false,
    user_PayFees_info: {}, // 缴费记录信息
    user_payment_info: [], // 缴费记录下的缴费单信息
    total_water: 0, // 总用水量
    is_return: true,
    invoice_code: '', // 发票号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    this.setData({
      lang: lang.userWaterInfo,
      btnName: lang.btnName,
      langDialog: lang.dialog,
    })

    // const payStatusList = options.payWayList
    const source = options.source
    let status = ''

    // if (source === 'search-person') {
    //   status = 'pay'
    //   if (form.status !== 1) {
    //     status = 'print'
    //   }
    //   if (form.receipt_status !== 1) {
    //     status = 'over'
    //   }
    // }

    // if (source === 'business-hall') {
    //   status = 'bank_pay'
    //   if (form.status !== 1) {
    //     status = 'print'
    //   }
    //   if (form.receipt_status !== 1) {
    //     status = 'print_two'
    //   }
    // }

    // if (source === 'financial-manager') {
    //   status = 'no'
    //   if (form.status !== 2) {
    //     status = 'yes'
    //   }
    // }
    const wm_no = options.wm_no;
    this.setData({
      wm_no,
      source,
      status,
      // payStatusList: JSON.parse(payStatusList || '[]'),
    })
    this.getArrearsMoneySum(options.wm_no)
  },
  onShow(){
    this.setData({
      is_return: true
    })
  },
  // 新改版  获取用户待缴费金额接口 
  getArrearsMoneySum(n){
    const wm_no = n
    const params = {
      wm_no,
    }
    getArrearsMoneySum(params).then(res => {
      const {
        arrears_money_sum,
        last_reading,
        last_time,
        } = res.data
        const payWayList = Object.keys(res.data.pay_way).map(i => ({
          text: res.data.pay_way[i].title,
          key: res.data.pay_way[i].key
        }))
      this.setData({
        last_reading,
        last_time,
        arrears_money_sum,
        // arrears_money_sum: Math.abs(arrears_money_sum),
        payStatusList: payWayList
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },

   //输入实缴金额
   handleInputMoney(e){
     console.log(e)
    const paid_total_money = e.detail
    let no_error = this.data.no_error
    if (paid_total_money) {
      no_error = false
    }
    this.setData({
      paid_total_money,
      no_error
    })
  },
  // 失焦赋值
  handleReading(e) {
    console.log(e)
    const paid_total_money = e.detail.value;
    this.setData({
      paid_total_money,
    })
  },
  //  新的确认支付
  new_onConfirmPay(){
    let that =  this;
    let pay_success = that.data.pay_success;
    if(pay_success){
      that.getUserBluetoolthInfoData(that.blueToothPrint);
    }else{
      let date = that.handleTimeValue();
      const params = {
        wm_no: that.data.wm_no,
        total_money: that.data.paid_total_money,
        pay_way: that.data.pay_way,
        pay_time: date.time
      }
      new_payWater(params).then(res => {
        that.setData({
          status: 'print',
          showPay: false,
          pay_success: true
        })

        this.setData({
          user_PayFees_info: res.data.data, // 缴费记录信息
          user_payment_info: res.data.user_payment_info, // 缴费记录下的缴费单信息
          total_water: res.data.total_water, // 总用水量
          invoice_code: res.data.invoice_code,
        })
        that.getArrearsMoneySum(that.data.wm_no);
        that.getUserBluetoolthInfoData(that.blueToothPrint);
      }).catch((res) => {
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      })
    }


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
    console.log(time)
    console.log(timestamp)

    return {
      year,
      month,
      day,
      time,
      timestamp
    }
  },
  // 近n天
  getMoreDay(value) {
    const _date = new Date().getTime();
    let letenddate = _date + (value*24*60*60*1000);
    let  _days = new Date(letenddate);
    const year = _days.getFullYear()
    const month = _days.getMonth() + 1
    const day = _days.getDate()
    const time = `${day >= 10 ? day : '0' + day}.${month >= 10 ? month : '0' + month}.${year}`
    return time
  },
  handleDate(value) {
    const date = new Date(value * 1000)
    const YY = date.getFullYear()
    const MM = date.getMonth() + 1
    const DD = date.getDate()
    const hh = date.getHours()
    const mm = date.getMilliseconds()
    const ss = date.getSeconds()
    return `${YY}-${MM < 10 ? '0' + MM : MM}-${DD < 10 ? '0' + DD : DD} ${hh < 10 ? '0' + hh : hh}:${mm < 10 ? '0' + mm : mm}:${ss < 10 ? '0' + ss : ss}`
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
    this.setData({
      pay_way: key,
      pay_text: text,
      status: 'print',
      showPay: false,
      no_error: false
    })
    return
    const up_id = this.data.form.up_id
    const source = this.data.source
    const params = {
      up_id,
      pay_way: key
    }
    let api = () => {}
    if (source === 'search-person') {
      //查表员 现金/pos机子
      api = payWater
    } else if (source === 'business-hall') {
      //营业厅 银行支付
      api = handleBusinessHallPayBill
    }
    api(params).then(res => {
      wx.showToast({
        title: lang.message.success,
        icon: 'none'
      })
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
  
  // printWaterInfo() {
  //   const up_id = this.data.form.up_id
  //   const params = {
  //     up_id,
  //   }
  //   printWater(params).then(res => {
  //     wx.showToast({
  //       title: lang.message.success,
  //       icon: 'none'
  //     })
  //     this.setData({
  //       status: 'over',
  //       showPay: false
  //     })
  //   }).catch((res) => {
  //     wx.showToast({
  //       title: res.desc,
  //       icon: 'none'
  //     })
  //   })
  // },
  // 收据
  printWaterInfo(){
    const paid_total_money = this.data.paid_total_money
    const pay_text = this.data.pay_text
    if (!paid_total_money ) {
      this.setData({
        no_error: true
      })
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return
    }
    if (!pay_text ) {
      this.setData({
        pay_type_error: true
      })
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return
    }
    this.setData({
      print_type: 'receiptInfo'
    })
    this.new_onConfirmPay();
  },

  // 发票
  blueToothInvoice(){
    const paid_total_money = this.data.paid_total_money
    const pay_text = this.data.pay_text
    if (!paid_total_money ) {
      this.setData({
        no_error: true
      })
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return
    }
    if (!pay_text ) {
      this.setData({
        pay_type_error: true
      })
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return
    }

    this.setData({
      print_type: 'invoiceInfo'
    })
    // this.getUserBluetoolthInfoData(this.blueToothPrint);
    this.new_onConfirmPay();
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
      // this.connectBlueToothDevice(connectDeviceInfo)
     this.handlePrint(connectDeviceInfo)
    }
  },
  connectBlueToothDevice({
    deviceId,
    serviceId
  }) {
    wx.showToast({
      icon: "none",
      duration: 30000,
    })
    console.log('开始连接蓝牙设备')
    // 开始连接蓝牙设备
    blueToolth.createBLEConnection(deviceId).then(res => {
      // 连接蓝牙设备成功
      console.log('连接蓝牙设备成功')
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
          console.log(res)
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
      console.log('11')
        wx.hideToast()
        this.setData({
          printDeviceInfo: null,
        })
      }
    }).catch((res) => {
    console.log('连接蓝牙设备成功'+ res)
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
  // 开始打印
  handlePrint(p) {
    let print_type = this.data.print_type;
    let info = [];
    // 发票
    if(print_type == 'invoiceInfo'){
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...GBK.encode(this.data.invoiceInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...GBK.encode(this.data.invoiceInfo_title_1),
        ...GBK.encode(this.data.invoiceInfo_invoice_code),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.invoiceInfo_CustomerData),
        ...blueToolth.printCommand.center,
        ...GBK.encode(this.data.invoiceInfo_historyData_title),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.invoiceInfo_historyData_info),
        ...blueToolth.printCommand.center,
        ...GBK.encode(this.data.invoiceInfo_facturacao_title),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.invoiceInfo_facturacao_info),
        ...blueToolth.printCommand.center,
        ...GBK.encode(this.data.invoiceInfo_valores),
        ...blueToolth.printCommand.enter
      ]
    }
     //  收据
    if(print_type == 'receiptInfo'){
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...GBK.encode(this.data.receiptInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...GBK.encode(this.data.receiptInfo_title_1),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.receiptInfo_historyData),
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...GBK.encode(this.data.receiptInfo_TOTAL),
        ...blueToolth.printCommand.ct_zc,
        ...GBK.encode(this.data.receiptInfo_Pagamento),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.receiptInfo_Modos),
        ...blueToolth.printCommand.center,
        ...GBK.encode(this.data.receiptInfo_Saldo),
        ...blueToolth.printCommand.enter
      ]
    }
    console.log('开始打印，api传信息...')
    blueToolth.writeBLECharacteristicValue({
      // ...this.data.printDeviceInfo,
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
  // 获取用户打印信息
  getUserBluetoolthInfoData(f){
    let that = this;
    const params = {
      wm_no: that.data.wm_no,
    }
    if( !that.data.is_return ){
      return
    }
    that.setData({
      is_return: false
    })
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      console.log(userBluetoolthInfoData)
      let date = that.handleTimeValue();
      let info = that.data.user_payment_info; // 缴费记录下的缴费单信息
      let user_payment_info = '';
      info.forEach(ele =>{
        user_payment_info += `${ele.check_time}   ${ele.arrears_money}KZ   ${ele.arrears_money}KZ   ${ele.pay_money}KZ
        `
      })
      let total_water = that.data.total_water;
      let sewage_rate_num = 0; // 污水量
      let sewage_rate_price = 0; // 污水价格 
      let user_type_price = userBluetoolthInfoData.user_type.price;
      if(total_water){
        console.log(total_water)
        sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100);
        sewage_rate_price = Number(sewage_rate_num * user_type_price).toFixed(2);
      }
      that.setData({
      // 发票
      invoiceInfo_title:`EPASKS-E.P.`,
      invoiceInfo_title_1:`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicacao de Roturas941648999
Email info.epasksagmail.com

        `,
        invoiceInfo_invoice_code:`
Factura/Recibo N° ${that.data.invoice_code}

Dados do Cliente `,
        invoiceInfo_CustomerData:`
Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}
N° do Cliente: ${userBluetoolthInfoData.water_meter.user_code}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address}
N° da Porta: ${userBluetoolthInfoData.water_meter.house_number}
Giro: ${userBluetoolthInfoData.water_meter.area_code}

      `,
      invoiceInfo_historyData_title:`
Histórico de Leituras
      `,
      invoiceInfo_historyData_info:`
 Data       m3      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0].check_date}   ${userBluetoolthInfoData.user_payment[0].water}   ${userBluetoolthInfoData.user_payment[0].reading_user}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].water:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].water:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `,
    invoiceInfo_facturacao_title:`Detalhes de Coberanca`,
    invoiceInfo_facturacao_info:`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Domestico：${userBluetoolthInfoData.user_type.type_name} ${userBluetoolthInfoData.user_type?(userBluetoolthInfoData.user_type.range_min >= 10?'> 10':(userBluetoolthInfoData.user_type.range_min + '-' + userBluetoolthInfoData.user_type.range_max) ):''}
Consumo ${ total_water?total_water:0 }(m3)
T.Fixa Domestico ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.rent_money +' *1=' + userBluetoolthInfoData.user_type.rent_money:''}
Agua Resid (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}
IVA(0%)
TOTAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:0} KZ

limite de pagamento: ${this.getMoreDay(15)}
    `,
    invoiceInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
${date.time}

    `,
      //收据
      receiptInfo_title:`EPASKS-E.P.`,
      receiptInfo_title_1:`
Empresa Publica de Aguas e Saneamento do Cuanza Su7Sul Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF: 5601022917
Recibo N° ${that.data.invoice_code}
ORIGINAL
Nome: MARIA DA GRAÇA FERNANDES LIMA
Contribuinte: 001189995BA039

`,
      receiptInfo_historyData:`
DATA: ${date.time}
 Data    Total    Pend.    Liq.
--------------------------------
${user_payment_info?user_payment_info:''}
--------------------------------
`,
      receiptInfo_TOTAL: `
TOTAL: ${that.data.user_PayFees_info.total_money} KZ
`,
      receiptInfo_Pagamento:`
Modos de Pagamento
`,
      receiptInfo_Modos: `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}     AOA      ${that.data.user_PayFees_info.total_money} KZ
--------------------------------
`,
      receiptInfo_Saldo: `
Saldo: ${userBluetoolthInfoData.water_meter.user_bal} KZ

Este documento nao serve de fatura
IVA Regime Simplificado
Utilizador:ISAURA FERNANDOP DA CRUZ

--------------------------------
*Obrigado e volte sempre!*

`,
      })
      setTimeout(()=>{
        that.setData({
          is_return: true
        })
      },1000)
      if (typeof f == 'function'){
        return f()
      }
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
      setTimeout(()=>{
        that.setData({
          is_return: true
        })
      },1000)
    })
  },

  // 4.修改打印收据状态
  setReceiptStatus (){
    let that = this;
    setReceiptStatus({id: that.data.id}).then(res => {
     
    }).catch(res => {
      wx.hideToast()
    })
  },
  // 5.修改发票收据状态
  setInvoiceStatus(){
    let that = this;
    setInvoiceStatus({id: that.data.id}).then(res => {
    
    }).catch(res => {
      wx.hideToast()
    })
  },


  // 营业厅 打印（补开）
  businessHallPrint() {
    const up_id = this.data.form.up_id
    const params = {
      up_id,
    }
    handleBusinessHallBillReceipt(params).then(res => {
      wx.showToast({
        title: lang.message.success,
        icon: 'none'
      })
      this.setData({
        status: 'print_two'
      })
    })
  },

  handleOpenResult(e) {
    const check_result = e.currentTarget.dataset.status
    this.setData({
      check_result,
      check_detail_error: false,
      check_detail: '',
      showResult: true
    })
  },
  onCloseResult() {
    this.setData({
      showResult: false
    })
  },
  // ======= 拒绝原因的方法  ↓============
  handleInputResult() {
    if (this.data.check_detail) {
      this.setData({
        showResult: false
      })
      this.handleInfoStatus()
    } else {
      this.setData({
        check_detail_error: true
      })
    }
  },
  handleInputCheckDetail(e) {
    const check_detail = e.detail
    this.setData({
      check_detail_error: false,
      check_detail
    })
  },
  handleInfoStatus(e) {
    const up_id = this.data.form.up_id
    const check_result = e ? e.currentTarget.dataset.status : this.data.check_result
    const check_detail = e ? '' : this.data.check_detail
    const params = {
      up_id,
      check_result,
      check_detail
    }
    handleCheckBill(params).then(res => {
      wx.showToast({
        title: lang.message.success,
        icon: 'none'
      })
      this.setData({
        status: 'yes'
      })
    })
  },
  // ======= 拒绝原因的方法  ↑============




})