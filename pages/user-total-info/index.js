// pages/query-water/status/print-info/index.js
const app = getApp()
console.log(new Date().getDay())
let lang = app.globalData.lang
const {wxAsyncApi,fmoney,parseMoneyNumber,judgmentData,handleTimeValue,isAgtValidationPassed,isAgtValidationPending,getAgtValidationErrors,mergeAgtDocumentNo,extractAgtRequestId} = require('./../../utils/util')
const blueToolth = require('./../../utils/bluetoolth')
//只需要引用encoding.js,注意路径
var encoding = require("./../../utils/encoding.js")
const {
  arrEncoderCopy,
  appendAgtInvoiceQrCommands,
} = require('./../../utils/print')
const {
  getStoredConnectDevice,
  runAfterBluetoothGate,
} = require('./../../utils/printBluetoothGate')


const {
  getArrearsMoneySum,
  new_payWater,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus,
  addUserPayLogNumber
} = require('./../../apis/water')
const {
  handleCheckBill
} = require('./../../apis/financial-manager')
import {
  handleBusinessHallBillReceipt
} from './../../apis/business-hall'
import {
  issueAgtInvoiceThenQueryEstado
} from './../../apis/admin'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    wm_no: '',
    wm_name: '',
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
    last_reading: '',
    last_time: '',
    arrears_money_sum: 0,
    arrears_money_t: 0,
    paid_total_money: '',
    discount_money: 0, // 优惠价格
    no_error: false,
    descontos_error: false,
    payStatusList: [],
    pay_way: '',
    pay_text: '',
    receiptInfo: '', //  收据
    invoiceInfo: '', //  发票
    pay_success: false,
    user_PayFees_info: {}, // 缴费记录信息
    user_payment_info: [], // 缴费记录下的缴费单信息
    total_water: 0, // 总用水量
    is_return: true,
    invoice_code: '', // 发票号（AGT document_no）
    agt_document_no: '',
    agt_request_id: '',
    userInfo: {},
    password_layer: false,
    is_operatorLsPop: false,
    operator_name: '',
    name_error: false,
    operatorNameList: [],
    is_pop: false,
    // 打印机纸张宽度，我用的打印几的纸张最大宽度是384，可以修改其他的
    paperWidth: 232,
    canvasWidth: 1,
    canvasHeight: 1,
    threshold: [200],
    img: '',
    printing: false,
    totIndex: 0, // 默认  选项下标
    showCheck: false,
    cheque_number: '',
    is_yujiao: '', // 'automatica' 预缴
    pay_log_id: '',
    up_id: '',
    price: 0,
    fromOtherAmount: false,
    fromMeterReadingFr: false,
    bill_quota_display: '',
    pendingPrintFlow: '',
    payDocType: 'FT',
    otherInvoices: lang.otherInvoices,
    automatica_title:`
Factura Automatica`,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang
    // const payStatusList = options.payWayList
    const source = options.source; // 'search-person' 查表员-- pos机子 ,'business-hall'  营业厅
    let status = '';
    if (source === 'search-person') {
      status = 'pay'
    }
    if (source === 'business-hall') {
      status = 'bank_pay'
    }

    const wm_no = options.wm_no;
    const wm_name = options.wm_name;
    const price = Number(options.price);
    const fromMeterReadingFr = options.from === 'meter-fr'
    const up_id = options.up_id != null && options.up_id !== '' ? String(options.up_id) : ''
    const userInfo = app.globalData.userInfo || {}
    const billQuotaPatch = {}
    if (fromMeterReadingFr && Number.isFinite(price)) {
      billQuotaPatch.bill_quota_display = fmoney(price, 2)
      billQuotaPatch.paid_total_money = String(price)
      billQuotaPatch.payDocType = 'FR'
      billQuotaPatch.print_type = 'invoiceInfo'
    }
    this.setData({
      lang: lang.userWaterInfo,
      btnName: lang.btnName,
      langDialog: lang.dialog,
      bluetoolthDevice: lang.admin.bluetoolthDevice,
      otherInvoices: lang.otherInvoices,
      price,
      wm_no,
      wm_name,
      source,
      status,
      userInfo,
      is_yujiao: options.is_yujiao,
      fromOtherAmount: options.from === 'other-amount',
      fromMeterReadingFr,
      up_id,
      ...billQuotaPatch,
      // payStatusList: JSON.parse(payStatusList || '[]')
    })
    this.getArrearsMoneySum(options.wm_no)

    if (wx.getStorageSync('operatorNameList')) {
      let operatorNameList = JSON.parse(wx.getStorageSync('operatorNameList'));
      console.log(operatorNameList)
      this.setData({
        operatorNameList
      })
    }
  },
  onShow() {
    this.setData({
      is_return: true
    })
    this.resumePendingPrintFlow()
  },

  resumePendingPrintFlow() {
    const flow = this.data.pendingPrintFlow
    if (!flow || !getStoredConnectDevice()) {
      return
    }
    this.setData({ pendingPrintFlow: '' })
    if (flow === 'ftfr') {
      if (!this.data.pay_success) {
        this.new_onConfirmPay()
      } else if (this.data.pay_log_id && (this.data.fromOtherAmount || this.data.fromMeterReadingFr)) {
        this.issueAgtInvoiceThenPrint(this.data.pay_log_id)
      } else {
        this.getUserBluetoolthInfoData()
      }
      return
    }
    if (flow === 'local_invoice') {
      if (!this.data.pay_success) {
        this.new_onConfirmPay()
      } else {
        this.getUserBluetoolthInfoData()
      }
      return
    }
    if (flow === 'local_receipt_pw') {
      this.setData({ password_layer: true })
      return
    }
    if (flow === 'local_receipt_pay') {
      this.continueReceiptPayAfterOperator()
      return
    }
    if (flow === 'local_print_only') {
      this.getUserBluetoolthInfoData()
    }
  },
  // 新改版  获取用户待缴费金额接口 
  getArrearsMoneySum(n) {
    let that = this;
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
      let money = arrears_money_sum;
      that.setData({
        last_reading,
        last_time,
        arrears_money_sum,
        arrears_money_t: fmoney(money,2)
      })
      if(that.data.payStatusList.length <= 0){
        const payWayList = Object.keys(res.data.pay_way).map(i => ({
          text: res.data.pay_way[i].title,
          key: res.data.pay_way[i].key
        }))
        if (that.data.source == 'search-person') {
          let payStatusList = [];
          payStatusList.push(payWayList[1])
          that.setData({
            totIndex: 1,
            payStatusList,
            pay_way: payStatusList[0].key,
            pay_text: payStatusList[0].text
          })
        }
        if (that.data.source == 'business-hall') {
          that.setData({
            totIndex: 0,
            payStatusList: payWayList,
            pay_way: '',
            pay_text: '',
            cheque_number: ''
          })
        }
        console.log(that.data.payStatusList)
      }
      
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  handleInputdescontos(e){
    const discount_money = Number(e.detail)
    const max = 100;
    if (max > Number(discount_money) ) {
      this.setData({
        discount_money:discount_money
      })
    }else{
      this.setData({
        discount_money:max
      })
    }
  },
  //输入实缴金额
  handleInputMoney(e) {
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
  handBlurdescontos(e){
    const discount_money = Number(e.detail.value);
    const max = 100;
    if (max > Number(discount_money) ) {
      this.setData({
        discount_money:discount_money
      })
    }else{
      this.setData({
        discount_money:max
      })
    }
    
  },
  // 失焦赋值
  handleReading(e) {
    console.log(e)
    const paid_total_money = e.detail.value;
    this.setData({
      paid_total_money
    })
  },
  //  新的确认支付
  new_onConfirmPay() {
    let that = this;
    let pay_success = that.data.pay_success;
    let arrears_money_sum = Math.abs(that.data.arrears_money_sum);
    console.log('pay_success',pay_success)
    if (pay_success) {
      that.getUserBluetoolthInfoData();
    } else {
      let date = handleTimeValue();
      // 支付接口要求 total_money 为纯数字，禁止 "1,628.00" 这类千分位字符串
      const total_money = parseMoneyNumber(that.data.paid_total_money)
      if (!Number.isFinite(total_money)) {
        that.setData({
          no_error: true
        })
        wx.showToast({
          title: lang.message.formWarning,
          icon: 'none'
        })
        return
      }
      const params = {
        wm_no: that.data.wm_no,
        total_money,
        pay_way: that.data.pay_way,
        pay_time: date.time,
        discount_money: Number(Number(arrears_money_sum * (that.data.discount_money / 100)).toFixed(2)),
        operator_name: that.data.operator_name
      }
      if(params.pay_way == 4){
        params.cheque_number = that.data.cheque_number;
      }
      if (that.data.up_id) {
        params.user_payment_id = that.data.up_id
      }
      new_payWater(params).then(res => {
        // 支付成功：data.data.id = 缴费单支付记录ID，用于 AGT source_id
        const pay_log_id = (res.data && res.data.data && res.data.data.id) || ''
        that.setData({
          status: 'print',
          showPay: false,
          pay_success: true,
          password_layer: false,
          user_PayFees_info: res.data.data, // 缴费记录信息
          user_payment_info: res.data.user_payment_info, // 缴费记录下的缴费单信息
          total_water: res.data.total_water, // 总用水量
          invoice_code: res.data.invoice_code,
          pay_log_id
        })
        //获取用户待缴费金额接口 
        that.getArrearsMoneySum(that.data.wm_no);
        // 从「其他金额」进入：收款后先开 AGT FT/FR，再打印
        if ((that.data.fromOtherAmount || that.data.fromMeterReadingFr) && that.data.payDocType) {
          that.issueAgtInvoiceThenPrint(pay_log_id)
        } else {
          that.getUserBluetoolthInfoData();
        }
      }).catch((res) => {
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      })
    }


  },
  /**
   * 从 tr_issue_agt_invoice 成功返回中解析发票号
   * 优先 data.document_no / submission.document_no
   */
  parseAgtInvoiceResult(res) {
    const root = res || {}
    const data = root.data || root
    const submission = data.submission || {}
    let document_no = data.document_no
      || data.documentNo
      || submission.document_no
      || submission.documentNo
      || ''
    if (!document_no) {
      const statusData = (data.status_result && data.status_result.data) || {}
      const list = statusData.documentStatusList || []
      if (list[0] && (list[0].documentNo || list[0].document_no)) {
        document_no = list[0].documentNo || list[0].document_no
      }
    }
    if (!document_no) {
      document_no = data.invoice_no
        || data.invoiceNo
        || (data.seriesFEResult && data.seriesFEResult.seriesCode)
        || ''
    }
    const request_id = data.request_id
      || data.requestID
      || submission.request_id
      || (data.submit_result && data.submit_result.data && data.submit_result.data.requestID)
      || ''
    return {
      document_no: document_no ? String(document_no) : '',
      request_id: request_id ? String(request_id) : '',
      validation_status: data.validation_status || submission.validation_status || '',
    }
  },
  extractAgtDocumentNo(agtData) {
    return this.parseAgtInvoiceResult(agtData).document_no
  },
  // 必须以 AGT 校验通过（validation_status/documentStatus = V）才算开票成功并打印
  isAgtIssueSuccess(res) {
    return isAgtValidationPassed(res)
  },
  /**
   * customer_tax_id：测试阶段固定 999999999
   * company_name 可选：默认用水表户名
   */
  resolveAgtCustomerTaxId(meter, explicitTaxId) {
    // TODO: 测试通过后恢复优先级：入参 > water_meter.nif/user_card > 999999999
    return '999999999'
  },
  resolveAgtCompanyName(meter, explicitName) {
    if (explicitName) return String(explicitName)
    return (meter && (meter.wm_name || meter.user_name)) || this.data.wm_name || ''
  },
  buildAgtInvoiceParams(documentType, sourceId, options) {
    const opts = options || {}
    const meter = opts.meter || {}
    const params = {
      document_type: documentType || 'FT',
      // 状态查询改由前端 tr_obter_agt_estado（测试：60s 轮询至 V/I）
      poll: 0,
      poll_times: 0,
      poll_interval: 3,
      source_type: 'user_pay_log',
      // 缴费单支付记录ID：支付接口返回 data.data.id
      source_id: sourceId || this.data.pay_log_id || (this.data.user_PayFees_info && this.data.user_PayFees_info.id),
      customer_tax_id: this.resolveAgtCustomerTaxId(meter, opts.customer_tax_id),
    }
    const companyName = this.resolveAgtCompanyName(meter, opts.company_name)
    if (companyName) {
      params.company_name = companyName
    }
    return params
  },
  issueAgtInvoiceThenPrint(payLogId) {
    const that = this
    const otherInvoices = that.data.otherInvoices || lang.otherInvoices
    const sourceId = payLogId || that.data.pay_log_id || (that.data.user_PayFees_info && that.data.user_PayFees_info.id)
    if (!sourceId) {
      wx.showToast({
        title: otherInvoices.noDemandNoteId,
        icon: 'none'
      })
      that.getUserBluetoolthInfoData()
      return
    }
    wx.showLoading({
      title: otherInvoices.agtLoading,
      mask: true
    })
    // 开票 → 查状态；V 直接打印；pending 且已有发票号可「仍打印」
    issueAgtInvoiceThenQueryEstado(that.buildAgtInvoiceParams(that.data.payDocType, sourceId, {
      company_name: that.data.wm_name
    })).then(({ issueRes, finalRes, request_id }) => {
      wx.hideLoading()
      const documentNo = mergeAgtDocumentNo(issueRes, finalRes)
      const requestId = request_id || extractAgtRequestId(finalRes) || extractAgtRequestId(issueRes)
      const saveDocAndPrint = () => {
        if (documentNo) {
          that.setData({
            invoice_code: documentNo,
            agt_document_no: documentNo,
            agt_request_id: requestId || ''
          })
        }
        that.getUserBluetoolthInfoData()
      }
      if (that.isAgtIssueSuccess(finalRes)) {
        wx.showToast({
          title: otherInvoices.agtSuccessTitle,
          icon: 'none'
        })
        saveDocAndPrint()
        return
      }
      const res = finalRes || issueRes
      if (isAgtValidationPending(res) && documentNo) {
        that.setData({
          invoice_code: documentNo,
          agt_document_no: documentNo,
          agt_request_id: requestId || ''
        })
        wx.showModal({
          title: otherInvoices.agtPending,
          content: `${otherInvoices.agtPendingPrintConfirm}\n${otherInvoices.agtInvoiceNo}: ${documentNo}`,
          confirmText: otherInvoices.printAnywayBtn || otherInvoices.printAnyway,
          cancelText: (getApp().globalData.lang.dialog || {}).cancelText || 'Cancel',
          success: (r) => {
            if (r.confirm) {
              saveDocAndPrint()
            }
          }
        })
        return
      }
      let title = otherInvoices.agtIssueFail
      if (isAgtValidationPending(res)) {
        const errors = getAgtValidationErrors(res)
        const is429 = errors.some((e) => String(e).indexOf('429') !== -1
          || /limite|限流|excedido/i.test(String(e)))
        title = is429
          ? (otherInvoices.agtRateLimit || otherInvoices.agtPending)
          : (otherInvoices.agtPending || otherInvoices.agtIssueFail)
      } else {
        const errors = getAgtValidationErrors(res)
        const detail = errors.length ? errors.slice(0, 2).join('；') : ''
        if (detail) {
          title = `${otherInvoices.agtIssueFail}：${detail}`.slice(0, 60)
        }
      }
      wx.showToast({
        title,
        icon: 'none',
        duration: 3000
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({
        title: otherInvoices.agtIssueFail,
        icon: 'none'
      })
    })
  },
  // 校验缴费表单（实缴金额 / 支付方式 / 支票号）
  validatePayForm() {
    const paid_total_money = this.data.paid_total_money
    const pay_text = this.data.pay_text
    if (!paid_total_money) {
      this.setData({
        no_error: true
      })
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return false
    }
    if (!pay_text) {
      this.setData({
        pay_type_error: true
      })
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return false
    }
    if (this.data.pay_way == 4 && !this.data.cheque_number) {
      this.setData({
        check_num_error: true
      })
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return false
    }
    return true
  },
  // 从「其他金额」进入：底部 FT / FR
  onFtFrSubmit(e) {
    if (!this.data.is_return) {
      return
    }
    const payDocType = ((e.currentTarget.dataset.type) || 'FT').toUpperCase()
    if (!this.validatePayForm()) {
      return
    }
    this.setData({
      payDocType,
      print_type: 'invoiceInfo',
    })
    runAfterBluetoothGate(this, 'ftfr', () => {
      this.new_onConfirmPay()
    })
  },

  // 近n天
  getMoreDay(value) {
    const _date = new Date().getTime();
    let letenddate = _date + (value * 24 * 60 * 60 * 1000);
    let _days = new Date(letenddate);
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
    console.log(e)
    const {
      text,
      key
    } = e.detail.value
    if(key == 4){
      this.setData({
        showCheck: true
      })
    }else{
      this.setData({
        showCheck: false
      })
    }
    this.setData({
      pay_way: key,
      pay_text: text,
      showPay: false,
      no_error: false
    })
  },
  // 收据按钮 ---  收银员
  printWaterInfo() {
    const dayTime = handleTimeValue().dayTime;
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const rq = weekdays[new Date().getDay()];
    let s = '';
    let e = '';
    if(rq == '星期六'){
      s = `${dayTime} 07:00:00`;
      e = `${dayTime} 14:00:00`;
    }else if(rq == '星期日'){
      s = `${dayTime} 00:00:00`;
      e = `${dayTime} 00:00:01`;
    }else{
      s = `${dayTime} 07:00:00`;
      e = `${dayTime} 16:00:00`;
    }
    
    const is_judgmentData = judgmentData(s,e);
    // if(!is_judgmentData){
    //   wx.showToast({
    //     title: lang.message.businessHours,
    //     duration: 2000,
    //     icon: 'none'
    //   })
    //   return
    // }

    const paid_total_money = this.data.paid_total_money;
    const pay_text = this.data.pay_text;
    if (!paid_total_money) {
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

    if (!pay_text) {
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

    const pay_way = this.data.pay_way;
    const cheque_number = this.data.cheque_number;

    if (pay_way == 4) {
      if(!cheque_number || cheque_number == ''){
        this.setData({
          check_num_error: true
        })
        wx.showToast({
          title: lang.message.formWarning,
          duration: 2000,
          icon: 'none'
        })
        return
      }
    }

    runAfterBluetoothGate(this, 'local_receipt_pw', () => {
      this.setData({ password_layer: true })
    })
    return
  },
  clickoperatorName(e) {
    this.setData({
      operator_name: e.currentTarget.dataset.name,
      is_operatorLsPop: false
    })
  },
  continueReceiptPayAfterOperator() {
    const operator_name = this.data.operator_name
    if (!operator_name) {
      this.setData({ name_error: true })
      return
    }
    this.setData({ print_type: 'receiptInfo' })
    let operatorNameList = this.data.operatorNameList
    if (operatorNameList.indexOf(operator_name) == -1) {
      operatorNameList.push(operator_name)
      wx.setStorageSync('operatorNameList', JSON.stringify(operatorNameList))
    }
    this.new_onConfirmPay()
  },
  //  确认姓名
  clickPrint() {
    if (!this.data.operator_name) {
      this.setData({ name_error: true })
      return
    }
    runAfterBluetoothGate(this, 'local_receipt_pay', () => {
      this.continueReceiptPayAfterOperator()
    })
  },
  // 点击历史姓名记录
  operatorLs(){
    this.setData({
      is_operatorLsPop: true
    })
  },
  // 发票
  blueToothInvoice() {
    const dayTime = handleTimeValue().dayTime;
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const rq = weekdays[new Date().getDay()];
    let s = '';
    let e = '';
    if(rq == '星期六'){
      s = `${dayTime} 07:00:00`;
      e = `${dayTime} 14:00:00`;
    }else if(rq == '星期日'){
      s = `${dayTime} 00:00:00`;
      e = `${dayTime} 00:00:01`;
    }else{
      s = `${dayTime} 06:00:00`;
      e = `${dayTime} 15:00:00`;
    }
    const is_judgmentData = judgmentData(s,e);
    // if(!is_judgmentData){
    //   wx.showToast({
    //     title: lang.message.businessHours,
    //     duration: 2000,
    //     icon: 'none'
    //   })
    //   return
    // }
    const paid_total_money = this.data.paid_total_money
    const pay_text = this.data.pay_text
    if (!paid_total_money) {
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
    if (!pay_text) {
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
    runAfterBluetoothGate(this, 'local_invoice', () => {
      this.new_onConfirmPay()
    })
  },

  blueToothPrint() {
    const connectDeviceInfo = getStoredConnectDevice()
    const blueLang = getApp().globalData.lang.blueToolth
    if (!connectDeviceInfo) {
      runAfterBluetoothGate(this, 'local_print_only', () => {
        this.blueToothPrint()
      })
      return
    }
    wx.showToast({
      title: blueLang.connectDevice,
      icon: 'none',
      duration: 30000,
    })
    this.handlePrint(connectDeviceInfo)
  },

  handlePrint(p) {
    let that = this;
    let print_type = that.data.print_type;
    let p_d = {
      id: that.data.pay_log_id,
    }
    const payDocType = (that.data.payDocType || 'FT').toUpperCase()
    const isOtherAmountFr = payDocType === 'FR'
      && (that.data.fromOtherAmount || that.data.fromMeterReadingFr)
    if (print_type == 'invoiceInfo') {
      p_d.type = isOtherAmountFr ? 1 : 2
    }
    if (print_type == 'receiptInfo') {
      p_d.type = 1
    }
    addUserPayLogNumber(p_d).then(res => {
      if (res.code != 200) {
        return
      }
      let info = [];
      if (print_type == 'invoiceInfo') {
        const refNo = isOtherAmountFr
          ? (res.data.receipt_number || res.data.invoice_number)
          : (res.data.invoice_number || res.data.receipt_number)
        const invoiceInfo_number = `
Ref. Recibo: ${refNo}
`;
        that.setData({ invoiceInfo_number })
        info = [
          ...blueToolth.printCommand.clear,
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.invoiceInfo_title),
          ...blueToolth.printCommand.ct_zc,
          ...arrEncoderCopy(that.data.invoiceInfo_title_1),
          ...arrEncoderCopy(that.data.invoiceInfo_invoice_code),
          ...arrEncoderCopy(invoiceInfo_number),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.invoiceInfo_CustomerData),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.invoiceInfo_historyData_title),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.invoiceInfo_historyData_info),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.invoiceInfo_facturacao_title),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.invoiceInfo_facturacao_info),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.invoiceInfo_valores),
          ...blueToolth.printCommand.enter
        ]
        if (that.data.agt_document_no) {
          info = appendAgtInvoiceQrCommands(info, that.data.agt_document_no)
        }
      }
      if (print_type == 'receiptInfo') {
        const receiptInfo_number = `
Ref. Recibo: ${res.data.receipt_number}
`;
        that.setData({ receiptInfo_number })
        info = [
          ...blueToolth.printCommand.clear,
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.receiptInfo_title),
          ...blueToolth.printCommand.ct_zc,
          ...arrEncoderCopy(that.data.receiptInfo_title_1),
          ...arrEncoderCopy(receiptInfo_number),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.receiptInfo_historyData),
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...arrEncoderCopy(that.data.receiptInfo_TOTAL),
          ...blueToolth.printCommand.ct_zc,
          ...arrEncoderCopy(that.data.receiptInfo_Pagamento),
          ...blueToolth.printCommand.left,
          ...arrEncoderCopy(that.data.receiptInfo_Modos),
          ...blueToolth.printCommand.center,
          ...arrEncoderCopy(that.data.receiptInfo_Saldo),
          ...blueToolth.printCommand.enter
        ]
      }
      console.log('开始打印，蓝牙 writeBLECharacteristicValue...')
      let n = 1;
      that.writeBLECharacteristicValue(p, info, n);
    }).catch(e => {
      console.log(e)
    })
  },
  writeBLECharacteristicValue(data, i, n) {
    let p = data;
    let info = i;
    let num = n;
    let that = this;
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
          paid_total_money: '',
          pay_success: false,
          pay_way: '',
          pay_text: '',
          cheque_number: '',
        })
        let print_type = that.data.print_type;
        if (print_type == 'receiptInfo') {
          num++;
          if (num <= 2) {
            that.writeBLECharacteristicValue(p, i, num);
          } else {
            that.setReceiptStatus();
          }
        }
        if (print_type == 'invoiceInfo') {
          const isFrDoc = (that.data.fromOtherAmount || that.data.fromMeterReadingFr)
            && (that.data.payDocType || '').toUpperCase() === 'FR'
          if (isFrDoc) {
            that.setReceiptStatus()
          } else {
            that.setInvoiceStatus()
          }
        }
      },
      onFail(res) {
        console.log('打印失败...', res)
      }
    });
  },
  // 获取用户打印信息
  getUserBluetoolthInfoData() {
    let that = this;
    console.log(that.data.pay_text)
    const params = {
      wm_no: that.data.wm_no,
    }
    if (!that.data.is_return) {
      return
    }
    that.setData({
      is_return: false
    })
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data;
      console.log(userBluetoolthInfoData)
      let date = handleTimeValue();
      let info = that.data.user_payment_info; // 缴费记录下的缴费单信息
      let arrears_money_sum = Math.abs(that.data.arrears_money_sum);
      let user_info = '';
      info.forEach(ele => {
        user_info += `${ele.check_time} ${ele.arrears_money}KZ  ${ele.pay_money}KZ  ${ele.arrears_money}KZ
`
      })
      let total_water = that.data.total_water;
      let sewage_rate_num = 0; // 污水量
      let sewage_rate_price = 0; // 污水价格 
      let user_type_price = userBluetoolthInfoData.user_type.price;
      let consumo_price = 0; // 非阶段计价 水费用展示
      if (total_water) {
        sewage_rate_num = Number(Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate) / 100);
        sewage_rate_price = Number(sewage_rate_num * user_type_price).toFixed(2);
        consumo_price = Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
      }
      // 发票号：优先 AGT document_no
      const printInvoiceNo = that.data.agt_document_no || that.data.invoice_code || ''
      const payDocType = (that.data.payDocType || '').toUpperCase()
      let facturaTitle = 'Factura/Recibo'
      if (payDocType === 'FT' || String(printInvoiceNo).indexOf('FT ') === 0) {
        facturaTitle = 'Factura'
      } else if (payDocType === 'FR' || String(printInvoiceNo).indexOf('FR ') === 0) {
        facturaTitle = 'Factura/Recibo'
      }
      let invoiceInfo_title = `EPASKS-E.P.`;
      let invoiceInfo_title_1 = `
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
`;
      let invoiceInfo_invoice_code = `
${facturaTitle} N° ${printInvoiceNo}
`;

      let invoiceInfo_CustomerData = `
Dados do Cliente 

Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}
N° do Cliente: ${userBluetoolthInfoData.water_meter.user_code}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address}
N° da Porta: ${userBluetoolthInfoData.water_meter.house_number}
Giro: ${userBluetoolthInfoData.water_meter.area_code}`;
      let invoiceInfo_historyData_title = `
Histórico de Leituras `;
      let invoiceInfo_historyData_info = `
Data       m³      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0].check_date}   ${userBluetoolthInfoData.user_payment[0].water}   ${userBluetoolthInfoData.user_payment[0].reading_user}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].water:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].water:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `;
      let invoiceInfo_facturacao_title = `Detalhes de Coberanca`;
      let invoiceInfo_facturacao_info = `
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${total_water} (m³)
${userBluetoolthInfoData.user_type.is_constant == 0?'Domestico： ' + (userBluetoolthInfoData.user_type.range_min >= 10?'> 10':(userBluetoolthInfoData.user_type.range_min + '-' + userBluetoolthInfoData.user_type.range_max) ):''}
T.Fixa ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}: ${ userBluetoolthInfoData.user_type.rent_money }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%)
IVA(0%) M04
TOTAL A PAGAR  ${that.data.user_PayFees_info.total_money} KZ

limite de pagamento: ${this.getMoreDay(15)}`;
      let invoiceInfo_valores = `
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
Processado por programaválido FE/407/AGT/2026
${date.time}
      
`;
//收据

      let receiptInfo_title = `EPASKS-E.P.`;
      let receiptInfo_title_1 = `
Empresa Publica de Aguas e Saneamento do Cuanza Su7Sul Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF: 5601022917
Recibo N° ${that.data.invoice_code}
ORIGINAL
Nome: ${userBluetoolthInfoData.water_meter.wm_name}
Contribuinte: ${userBluetoolthInfoData.water_meter.user_card}`;
      let receiptInfo_historyData = `
DATA: ${date.time}
  Data    Total    Liq.    Pend.
--------------------------------
${user_info?user_info:''}
--------------------------------
Desconto: ${Number(arrears_money_sum * (that.data.discount_money / 100)).toFixed(2)} KZ`;

      let receiptInfo_TOTAL = `
TOTAL: ${that.data.user_PayFees_info.total_money} KZ`;
      let receiptInfo_Pagamento = `Modos de Pagamento`;
      let receiptInfo_Modos = `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}     AOA      ${that.data.user_PayFees_info.total_money} KZ
--------------------------------
${that.data.pay_way == 4?"N* do Cheque: " +that.data.cheque_number : ''}`;
      let receiptInfo_Saldo = `
Saldo: ${userBluetoolthInfoData.water_meter.user_bal} KZ

Water manager
Processado por programaválido FE/407/AGT/2026
Este documento nao serve de fatura
IVA Regime Simplificado
Utilizador: ${that.data.operator_name}

--------------------------------
*Obrigado e volte sempre!*

`;

      that.setData({
        invoiceInfo_title,
        invoiceInfo_title_1,
        invoiceInfo_invoice_code,
        invoiceInfo_CustomerData,
        invoiceInfo_historyData_title,
        invoiceInfo_historyData_info,
        invoiceInfo_facturacao_title,
        invoiceInfo_facturacao_info,
        invoiceInfo_valores,
        receiptInfo_title,
        receiptInfo_title_1,
        receiptInfo_historyData,
        receiptInfo_TOTAL,
        receiptInfo_Pagamento,
        receiptInfo_Modos,
        receiptInfo_Saldo,
      })
      setTimeout(() => {
        that.setData({
          is_return: true
        })
      }, 1000)
      that.blueToothPrint()
      
      
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        that.setData({
          is_return: true
        })
      }, 1000)
    })
  },

  // 4.修改打印收据状态
  setReceiptStatus() {
    let that = this;
    setReceiptStatus({
      id: that.data.user_PayFees_info.id,
      receipt_status: 2,  // 1:未开具 2:已开具 3:已取消
    }).then(res => {

    }).catch(res => {
      wx.hideToast()
    })
  },
  // 5.修改发票收据状态
  setInvoiceStatus() {
    let that = this;
    setInvoiceStatus({
      id: that.data.user_PayFees_info.id,
      invoice_status: 2,  // 1:未开具 2:已开具 3:已取消
    }).then(res => {

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

  /**蒙板禁止滚动  bug 在开发工具模拟器底层页面上依然可以滚动，手机上不滚动*/
  myCatchTouch: function () {
    return
  },

  cover_layer() {
    this.setData({
      password_layer: false,
      operator_name: ''
    })
  },
  handleInputReading(e) {
    console.log(e)
    const operator_name = e.detail
    let name_error = this.data.name_error
    if (operator_name) {
      name_error = false
    }
    let operatorNameList = wx.getStorageSync('operatorNameList') ? JSON.parse(wx.getStorageSync('operatorNameList')) : this.data.operatorNameList;

    this.setData({
      operatorNameList,
      operator_name,
      name_error,
      is_pop: true
    })
  },
  operatorNameList_cover() {
    this.setData({
      is_operatorLsPop: false
    })
  },
  handleNameBlur(e) {
    console.log(e)
    const operator_name = e.detail.value
  },

})