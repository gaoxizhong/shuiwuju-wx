// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi,
  mergeAgtDocumentNo,
  extractAgtRequestId,
  isAgtValidationPassed,
  isAgtValidationPending,
} = require('./../../../../utils/util')
const blueToolth = require('./../../../../utils/bluetoolth')
const {
  arrEncoderCopy,
  appendAgtInvoiceQrCommands,
} = require('./../../../../utils/print')
import {
  issueAgtInvoiceThenQueryEstado,
} from '../../../../apis/admin'
const {
  getArrearsMoneySum,
  payWater,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus,
  addUserPayLogNumber
} = require('./../../../../apis/water')
const { getRegistarFactura } = require('../../../../apis/agt')
import {
  getBusinessHallList,
} from '../../../../apis/business-hall'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.pay.collectInfo,
    otherInvoices: lang.otherInvoices,
    langDialog: lang.dialog,
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    paid_total_money: '',
    btnName: lang.btnName,
    form: {},
    payStatusList: [],
    active: 2,
    steps: lang.pay.steps,
    status: 'pay',
    showPay: false,
    printDeviceInfo: null,
    arrears_money_sum: '', //欠费
    printInfo: '', // 缴费单信息打印内容
    print_type: '',
    last_reading:'', // 本次读数
    is_Printreturn: true,
    is_Invoicereturn: true,
    // 打印机纸张宽度，我用的打印几的纸张最大宽度是384，可以修改其他的
    paperWidth: 384,
    canvasWidth: 1,
    canvasHeight: 1,
    img: '',
    printing: false,
    is_T: false,
    is_yujiao: '', // 'automatica' 预缴
    automatica_title: `
Factura Automatica`,
    historyPaymentBills: [],
    indexLang: lang.index,
    agt_document_no: '',
    agt_request_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang
    const {
      imageUrl,
      reading,
      total_money,
      total_water,
      order_no,
      wm_no,
      wm_name,
      last_reading,
      up_id,
      check_time_text,
      is_T,
      now_time,
      months,
      is_yujiao
    } = options
    let arr = [];
    let payStatusList = JSON.parse(options.payStatusList);
    arr.push(payStatusList[1])
    this.setData({
      form: {
        imageUrl,
        reading,
        total_money,
        total_water,
        order_no,
        wm_no,
        wm_name,
        up_id,
        last_reading,
        check_time_text,
        now_time,
        months,
      },
      is_T: is_T == 'true'?true:false,
      payStatusList: arr,
      lang: lang.pay.collectInfo,
      otherInvoices: lang.otherInvoices,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      steps: lang.pay.steps,
      bluetoolthDevice: lang.admin.bluetoolthDevice,
      is_yujiao,
      indexLang: lang.index,
    })
    if (wm_no) {
      this.getArrearsMoneySum(wm_no)
      this.loadHistoryPaymentBills(wm_no)
    }
  },
  onShow() {
    lang = app.globalData.lang
    this.setData({
      lang: lang.pay.collectInfo,
      otherInvoices: lang.otherInvoices,
      langDialog: lang.dialog,
      btnName: lang.btnName,
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

  loadHistoryPaymentBills(wm_no) {
    const currentUpId = this.data.form.up_id
    getBusinessHallList({
      wm_no,
      select: wm_no,
      type: 1,
      status: '',
      page: 1,
    }).then(res => {
      if (res.code != 200) return
      const raw = (res.data.list && res.data.list.data) || []
      const historyPaymentBills = raw
        .filter(item => !currentUpId || String(item.id) !== String(currentUpId))
        .map(item => ({
          ...item,
          display_reading: (Number(item.reading) * 10000) / 10000,
        }))
      this.setData({ historyPaymentBills })
    }).catch(() => {})
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
  // 缴费单（旧蓝牙打印机）
  blueToothPrint(){
    this.setData({
      print_type: 'printInfo'
    })
    this.getUserBluetoolthInfoData(this.verifyBlueToothPrint);
  },

  buildAgtInvoiceParams() {
    const form = this.data.form || {}
    const params = {
      document_type: 'FT',
      poll: 0,
      poll_times: 0,
      poll_interval: 3,
      source_type: 'user_pay_log',
      source_id: form.up_id,
    }
    if (form.wm_no) {
      // customer_tax_id 由后端按水表补全时可省略
    }
    return params
  },

  isAgtIssueSuccess(res) {
    return isAgtValidationPassed(res)
  },

  issueAgtInvoiceThenPrint() {
    const that = this
    const otherInvoices = that.data.otherInvoices
    const upId = that.data.form.up_id
    if (!upId) {
      wx.showToast({
        title: otherInvoices.noDemandNoteId || lang.message.fail,
        icon: 'none',
      })
      return
    }
    if (!that.data.is_Invoicereturn) {
      return
    }
    that.setData({ is_Invoicereturn: false })
    wx.showLoading({
      title: otherInvoices.agtLoading,
      mask: true,
    })
    const resetBtn = (delay = 1000) => {
      setTimeout(() => that.setData({ is_Invoicereturn: true }), delay)
    }
    const handleFail = (res) => {
      wx.hideLoading()
      wx.showToast({
        title: otherInvoices.agtIssueFail,
        icon: 'none',
        duration: 3000,
      })
      resetBtn(0)
    }
    issueAgtInvoiceThenQueryEstado(that.buildAgtInvoiceParams()).then(({ issueRes, finalRes, request_id }) => {
      wx.hideLoading()
      const documentNo = mergeAgtDocumentNo(issueRes, finalRes)
      const requestId = request_id || extractAgtRequestId(finalRes) || extractAgtRequestId(issueRes)
      const startPrint = (no) => {
        that.setData({
          agt_document_no: no || documentNo,
          agt_request_id: requestId || '',
          print_type: 'invoiceInfo',
          is_Invoicereturn: true,
        })
        that.getUserBluetoolthInfoData(that.verifyBlueToothPrint)
      }
      if (that.isAgtIssueSuccess(finalRes)) {
        wx.showToast({ title: otherInvoices.agtSuccessTitle, icon: 'none' })
        startPrint(documentNo)
        return
      }
      const res = finalRes || issueRes
      if (isAgtValidationPending(res) && documentNo) {
        wx.showModal({
          title: otherInvoices.agtPending,
          content: `${otherInvoices.agtPendingPrintConfirm}\n${otherInvoices.agtInvoiceNo}: ${documentNo}`,
          confirmText: otherInvoices.printAnywayBtn || otherInvoices.printAnyway,
          cancelText: lang.dialog.cancelText,
          success: (r) => {
            if (r.confirm) startPrint(documentNo)
            else resetBtn(0)
          },
        })
        return
      }
      handleFail(res)
    }).catch(handleFail)
  },

  // AGT 开票并蓝牙打印（含 QR）
  blueToothInvoice() {
    this.issueAgtInvoiceThenPrint()
  },

  // 蓝牙设备打印：检查已连接设备后写入 ESC/POS
  verifyBlueToothPrint() {
    const connectStorage = wx.getStorageSync('connectDevice')
    const connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
    const blueLang = getApp().globalData.lang
    if (!connectDeviceInfo) {
      wx.showModal({
        title: blueLang.blueToolth.noConnect,
        content: blueLang.blueToolth.noConnectWarning,
        cancelText: blueLang.blueToolth.cancelText,
        confirmText: blueLang.blueToolth.confirmText,
        complete: (res) => {
          if (res.confirm) {
            wxAsyncApi('navigateTo', {
              url: `/pages/admin/bluetooth/index?origin=page`,
            }).then(() => {
              wx.setNavigationBarTitle({
                title: blueLang.blueToolth.title,
              })
            })
          }
          if (res.cancel) {
            wx.showToast({
              title: blueLang.blueToolth.cancel,
              icon: 'none',
            })
          }
        }
      })
      return
    }
    wx.showToast({
      title: blueLang.blueToolth.connectDevice,
      icon: 'none',
      duration: 30000,
    })
    this.handlePrint(connectDeviceInfo)
  },

  // 旧打印机：组装 ESC/POS 指令并通过蓝牙特征值发送
  handlePrint(p) {
    let that = this;
    let print_type = that.data.print_type;
    let is_yujiao = that.data.is_yujiao;
    let info = [];
    if (print_type == 'printInfo' || print_type == 'invoiceInfo') {
      if (is_yujiao == 'automatica') {
        info = [
          ...blueToolth.printCommand.clear,
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_title),
          ...blueToolth.printCommand.ct_zc,
          ...arrEncoderCopy(that.data.printInfo_title_1),
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_Comsumidor),
          ...blueToolth.printCommand.ct_zc,
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.printInfo_CustomerData),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.printInfo_historyData_title),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.printInfo_historyData_info),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.printInfo_facturacao_title),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.printInfo_facturacao_info),
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_TOTAL),
          ...blueToolth.printCommand.ct_zc,
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.pagamento_pagamento),
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_valores),
          ...blueToolth.printCommand.ct_zc,
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.automatica_title),
          ...arrEncoderCopy(that.data.printInfo_time),
          ...blueToolth.printCommand.enter
        ]
      } else {
        info = [
          ...blueToolth.printCommand.clear,
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_title),
          ...blueToolth.printCommand.ct_zc,
          ...arrEncoderCopy(that.data.printInfo_title_1),
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_Comsumidor),
          ...blueToolth.printCommand.ct_zc,
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.printInfo_CustomerData),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.printInfo_historyData_title),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.printInfo_historyData_info),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.printInfo_facturacao_title),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.printInfo_facturacao_info),
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_TOTAL),
          ...blueToolth.printCommand.ct_zc,
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.pagamento_pagamento),
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.printInfo_valores),
          ...blueToolth.printCommand.ct_zc,
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.printInfo_time),
          ...blueToolth.printCommand.enter
        ]
      }
    }
    if (print_type === 'invoiceInfo' && that.data.agt_document_no) {
      info = appendAgtInvoiceQrCommands(info, that.data.agt_document_no)
    }
    console.log('开始打印，蓝牙传信息...')
    blueToolth.writeBLECharacteristicValue({
      ...p,
      value: new Uint8Array(info).buffer,
      lasterSuccess() {
        console.log('打印成功...')
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: 'none',
          duration: 3000,
        })
        that.setData({
          is_Printreturn: true,
          is_Invoicereturn: true,
        })
      },
      onFail(res) {
        console.log('打印失败...', res)
        that.setData({
          is_Printreturn: true,
          is_Invoicereturn: true,
        })
      }
    });
  },
  //输入实缴金额
  handleInputMoney(e){
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
  // 获取用户打印信息（写入 data 后回调旧蓝牙打印）
  getUserBluetoolthInfoData(f){
    let that = this;
    const params = {
      wm_no: that.data.form.wm_no,
    }
    if (that.data.print_type === 'printInfo') {
      if (!that.data.is_Printreturn) {
        return
      }
      that.setData({ is_Printreturn: false })
    }
    if (that.data.print_type === 'invoiceInfo') {
      if (!that.data.is_Invoicereturn) {
        return
      }
      that.setData({ is_Invoicereturn: false })
    }
   
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      console.log(userBluetoolthInfoData)
      let date = that.handleTimeValue();
      let user_type_price = userBluetoolthInfoData.user_type.price; // 用户类型单价
      let total_water = that.data.form.total_water;
      let sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100).toFixed(2); // 污水量
      let sewage_rate_price =  Number(Number(sewage_rate_num) * Number(user_type_price)).toFixed(2); // 污水价格
   
      let first_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_water:0;
      let first_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_price:0;
      let second_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_water:0;
      let second_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_price:0;

      let months = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].months:0; // 月份
      let T_Fixa = Number(userBluetoolthInfoData.user_type.rent_money * months).toFixed(2);
      let consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
      let household_num = userBluetoolthInfoData.water_meter.household_num; // 供用水表户数；
      let average_pairce = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price/household_num.toFixed(2) : userBluetoolthInfoData.water_meter.user_bal/household_num.toFixed(2);  // 平均户数费用

      const isInvoicePrint = that.data.print_type === 'invoiceInfo'
      const agtNo = that.data.agt_document_no || ''
      const docLine = isInvoicePrint && agtNo
        ? `Factura N° ${agtNo}`
        : `Aviso de cobrança N° ${userBluetoolthInfoData.user_payment[0] ? userBluetoolthInfoData.user_payment[0].order_no : ''}`

      that.setData({
        printInfo_title: `EPASKS-E.P.`,
        printInfo_title_1: `
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
0040.0000.9258.2876.1026.4 Banco Bai
0055.0000.4694.8358.1011.7 Banco Atlantica

${docLine}

Dados do Cliente
`,
        printInfo_Comsumidor: `
Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}`,
        printInfo_CustomerData: `
N° do Cliente: ${userBluetoolthInfoData.water_meter.user_code}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address}
N° da Porta: ${userBluetoolthInfoData.water_meter.house_number}
Giro: ${userBluetoolthInfoData.water_meter.area_code}
Totalizador/Normal: ${userBluetoolthInfoData.water_meter.is_share ? 'Totalizador':'Normal' }
Unidades: ${userBluetoolthInfoData.water_meter.household_num }  
        `,
        printInfo_historyData_title: `
Histórico de Leituras
        `,
        printInfo_historyData_info: `
   Data       m³      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].check_date:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading_user:''}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `,
        printInfo_facturacao_title: `Detalhes de Coberanca`,
        printInfo_facturacao_info: `
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
T.Fixa ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}  
${userBluetoolthInfoData.water_meter.is_share?'O custo médio: ' +average_pairce +'KZ':'' }
IVA(0%) M04
CFR: 11.00 Kz X ${userBluetoolthInfoData.user_payment[0].CFR_total_price?userBluetoolthInfoData.user_payment[0].months:0} = ${userBluetoolthInfoData.user_payment[0].CFR_total_price} Kz
`,
        printInfo_TOTAL: `
TOTAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:userBluetoolthInfoData.water_meter.user_bal} KZ`,
        pagamento_pagamento: `
limite de pagamento: ${that.getMoreDay(15)}`,
        printInfo_valores: `
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
Processado por programaválido n31.1/AGT20
`,
        printInfo_time: `
${date.time}

`,
      })
      setTimeout(() => {
        const patch = { is_Printreturn: true }
        if (that.data.print_type === 'invoiceInfo') {
          patch.is_Invoicereturn = true
        }
        that.setData(patch)
      }, 1000)
      if (typeof f == 'function') {
        return f()
      }
    }).catch((res) => {
      that.setData({
        is_Printreturn: true,
        is_Invoicereturn: true,
      })
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 添加编码
  addUserPayLogNumber(n){
    let that = this;
    let p = {
      id: that.data.id,
      type: n,  // 1:收据编码 2:发票编码 3:取消收据编码 4:取消发票编码
    }
    // 获取编码
    addUserPayLogNumber(p).then(res => {

    }).catch(e => {
      console.log(e)
    })
  },
  // 4.修改打印收据状态
  setReceiptStatus (){
    let that = this;
    setReceiptStatus({
      id: that.data.id,
      receipt_status: 2,  // 1:未开具 2:已开具 3:已取消
    }).then(res => {
      if(res.code == 200){
        // 添加编码
        that.addUserPayLogNumber(1);
      }
    }).catch(res => {
      wx.hideToast()
    })
  },
  // 5.修改发票状态
  setInvoiceStatus(){
    let that = this;
    setInvoiceStatus({
      id: that.data.user_PayFees_info.id,
      invoice_status: 2,  // 1:未开具 2:已开具 3:已取消
    }).then(res => {
      if(res.code == 200){
        // 添加编码
        that.addUserPayLogNumber(2);
      }
    }).catch(res => {
      wx.hideToast()
    })
  },
})