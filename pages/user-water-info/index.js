// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {
  wxAsyncApi,fmoney
} = require('./../../utils/util')
const {
  payWater,
  printWater,
  getUserBluetoolthInfoData
} = require('./../../apis/water')
const {
  handleCheckBill
} = require('./../../apis/financial-manager')
import {
  handleBusinessHallPayBill,
  handleBusinessHallBillReceipt
} from './../../apis/business-hall'

const GBK = require('./../../utils/gbk.min')
//只需要引用encoding.js,注意路径
var encoding = require("./../../utils/encoding.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,

    form: {},
    payStatusList: [],

    status: 'pay',
    showPay: false,
    printDeviceInfo: null,
    printInfo: '',
    source: '',

    showResult: false,
    check_result: '',
    check_detail: '',
    check_detail_error: false,
    size: {
      maxHeight: 100,
      minHeight: 100
    },
    printInfo: '', // 缴费单信息打印内容
    is_Printreturn: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang
    this.setData({
      lang: lang.userWaterInfo,
      btnName: lang.btnName,
      langDialog: lang.dialog,
    })
    const form = JSON.parse(options.data)
    console.log(form)
    const payStatusList = options.payWayList
    const source = options.source
    const createDate = form.check_time ? this.handleDate(form.check_time) : ""
    form.createDate = createDate
    let status = ''

    if (source === 'search-person') {
      // 查表员
      status = 'pay'
      if (form.status !== 1) {
        status = 'print'
      }
      if (form.receipt_status !== 1) {
        status = 'over'
      }
    }

    if (source === 'business-hall') {
      // 营业厅
      status = 'bank_pay'
      if (form.status !== 1) {
        status = 'print'
      }
      if (form.receipt_status !== 1) {
        status = 'print_two'
      }
    }

    if (source === 'financial-manager') {
      status = 'no'
      if (form.status !== 2) {
        status = 'yes'
      }
    }
    form.price = fmoney(form.price,2);
    this.setData({
      source,
      form,
      status,
      payStatusList: JSON.parse(payStatusList || '[]'),
      printInfo: '',
    })
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
    wxAsyncApi('navigateTo', {
      url: `/pages/user-total-info/index?wm_no=${this.data.form.wm_no}&wm_name=${this.data.form.meter.wm_name}&source=business-hall`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
    // this.setData({
    //   showPay: true
    // })
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
  printWaterInfo() {
    const up_id = this.data.form.up_id
    const params = {
      up_id,
    }
    printWater(params).then(res => {
      wx.showToast({
        title: lang.message.success,
        icon: 'none'
      })
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
   // 缴费单
  // 获取用户打印信息
  blueToothPrint(){
    let that = this;
    const params = {
      wm_no: that.data.form.wm_no,
    }
    if( !that.data.is_Printreturn ){
      return
    }
    that.setData({
      is_Printreturn: false
    })
    
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      console.log(userBluetoolthInfoData)
      let date = that.handleTimeValue();
      let user_type_price = userBluetoolthInfoData.user_type.price; // 用户类型单价
      let total_water = Number(that.data.form.water);
      let sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100).toFixed(2); // 污水量
      let sewage_rate_price =  Number(sewage_rate_num * user_type_price.toFixed(2)); // 污水价格
    
      let first_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_water:0;
      let first_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_price:0;
      let second_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_water:0;
      let second_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_price:0;
      let domestico_socio = Number(first_step_water * first_step_price).toFixed(2);
      let domestico_socio_2 = Number(second_step_water * second_step_price).toFixed(2);

      let months = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].months:0; // 月份
      let T_Fixa = Number(userBluetoolthInfoData.user_type.rent_money * months).toFixed(2);
      let consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
      let household_num = userBluetoolthInfoData.water_meter.household_num; // 供用水表户数；
      let average_pairce = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price/household_num.toFixed(2) : userBluetoolthInfoData.water_meter.user_bal/household_num.toFixed(2);  // 平均户数费用

      this.setData({
      // 缴费单
        printInfo_title:`EPASKS-E.P.`,
        printInfo_title_1:`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
0040.0000.9258.2876.1026.4 Banco Bai
0055.0000.4694.8358.1011.7 Banco Atlantica

Factura Simplificada N° ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].order_no:''}

Dados do Cliente
`,
printInfo_Comsumidor:`
Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}`,
printInfo_CustomerData:`
N° do Cliente: ${userBluetoolthInfoData.water_meter.user_code}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address}
N° da Porta: ${userBluetoolthInfoData.water_meter.house_number}
Giro: ${userBluetoolthInfoData.water_meter.area_code}
        `,
        printInfo_historyData_title:`
Histórico de Leituras
        `,
        printInfo_historyData_info:`
    Data       m³      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].check_date:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading_user:''}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `,
      printInfo_facturacao_title:`   Detalhes de Coberanca`,
      printInfo_facturacao_info:`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
T.Fixa ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}
Totalizador/Normal: ${userBluetoolthInfoData.water_meter.is_share ? 'Totalizador':'Normal' }
Unidades: ${userBluetoolthInfoData.water_meter.household_num }    
${userBluetoolthInfoData.water_meter.is_share?'O custo médio: ' +average_pairce +'KZ':'' }
IVA(0%) M04

`,
      printInfo_TOTAL:`
TOTAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:userBluetoolthInfoData.water_meter.user_bal} KZ`,
      pagamento_pagamento:`
limite de pagamento: ${this.getMoreDay(15)}`,
      printInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
Processado por programaválido n31.1/AGT20
`,     
      abolido:`
Foi abolido
      `,
      printInfo_time:`
${date.time}

`,
      })
      setTimeout(()=>{
        that.setData({
          is_Printreturn: true,
        })
      },1000)
      this.verifyBlueToothPrint();
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
    setTimeout(()=>{
      that.setData({
        is_Printreturn: true,
      })
    },1000)
  },
  // 蓝牙设备打印
  verifyBlueToothPrint() {
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
      wx.showToast({
        title: lang.blueToolth.connectDevice,
        icon: "none",
        duration: 30000,
      })
      this.handlePrint(connectDeviceInfo)
    }
  },

  handlePrint(p) {
    let that = this;
    let info = [
      ...blueToolth.printCommand.clear,
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...that.arrEncoderCopy(that.data.printInfo_title),
      ...blueToolth.printCommand.ct_zc,
      ...that.arrEncoderCopy(that.data.printInfo_title_1),
      ...blueToolth.printCommand.ct,
      ...that.arrEncoderCopy(that.data.printInfo_Comsumidor),
      ...blueToolth.printCommand.ct_zc,
      ...blueToolth.printCommand.left,
      ...that.arrEncoderCopy(that.data.printInfo_CustomerData),
      ...blueToolth.printCommand.center,
      ...that.arrEncoderCopy(that.data.printInfo_historyData_title),
      ...blueToolth.printCommand.left,
      ...that.arrEncoderCopy(that.data.printInfo_historyData_info),
      ...blueToolth.printCommand.center,
      ...that.arrEncoderCopy(that.data.printInfo_facturacao_title),
      ...blueToolth.printCommand.left,
      ...that.arrEncoderCopy(that.data.printInfo_facturacao_info),
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...that.arrEncoderCopy(that.data.printInfo_TOTAL),
      ...blueToolth.printCommand.ct_zc,
      ...blueToolth.printCommand.center,
      ...that.arrEncoderCopy(that.data.pagamento_pagamento),
      ...blueToolth.printCommand.ct,
      ...that.arrEncoderCopy(that.data.printInfo_valores),
      ...blueToolth.printCommand.ct_zc,
      ...blueToolth.printCommand.center,
      ...that.arrEncoderCopy(that.data.abolido), // 展示'已作废'
      ...that.arrEncoderCopy(that.data.printInfo_time),
      ...blueToolth.printCommand.enter
    ]
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
  // 
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