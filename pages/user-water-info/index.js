// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {
  arrEncoderCopy,
  appendAgtInvoiceQrCommands,
} = require('./../../utils/print')
const {
  getStoredConnectDevice,
  runAfterBluetoothGate,
} = require('./../../utils/printBluetoothGate')
const {
  wxAsyncApi,fmoney,parseMoneyNumber,isAgtValidationPassed,isAgtValidationPending,getAgtValidationErrors,mergeAgtDocumentNo,extractAgtRequestId
} = require('./../../utils/util')
const {
  new_payWater,
  printWater,
  getUserBluetoolthInfoData,
  getArrearsMoneySum
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
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    form: {},
    payStatusList: [],

    status: 'pay',
    showPay: false,
    showFtFrPay: false,
    payDocType: 'FT',
    paid_total_money: '',
    billPrice: 0,
    arrears_money_sum: 0,
    arrears_money_t: '0.00',
    pay_way: '',
    pay_text: '',
    pay_type_error: false,
    showCheck: false,
    cheque_number: '',
    check_num_error: false,
    totIndex: 0,
    ftfrSubmitting: false,
    // 已支付：仍展示 FT/FR/其他金额，但 FT/FR 置灰不可点
    ftFrDisabled: false,
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
    is_Printreturn: true,
    is_Invoicereturn: true,
    otherInvoices: lang.otherInvoices,
    invoiceIssued: false,
    invoiceStatusText: '',
    pay_log_id: '',
    agt_document_no: '', // AGT 返回 document_no，打印小票发票号
    agt_request_id: '',
    pendingPrintFlow: '',
  },

  onShow() {
    this.resumePendingPrintFlow()
  },

  resumePendingPrintFlow() {
    const flow = this.data.pendingPrintFlow
    if (!flow || !getStoredConnectDevice()) {
      return
    }
    this.setData({ pendingPrintFlow: '' })
    if (flow === 'submit_ftfr') {
      if (this.data.pay_log_id) {
        this.issueAgtInvoiceAfterPay(this.data.pay_log_id)
      } else {
        this.submitFtFrPay()
      }
      return
    }
    if (flow === 'agt_ft_invoice') {
      if (this.data.invoiceIssued) {
        this.blueToothPrint()
      } else {
        this.issueAgtInvoiceThenPrint()
      }
      return
    }
    if (flow === 'agt_print_only') {
      this.verifyBlueToothPrint()
    }
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
      bluetoolthDevice: lang.admin.bluetoolthDevice,
      otherInvoices: lang.otherInvoices,
    })
    const form = JSON.parse(options.data)
    console.log(form)
    const source = options.source
    const createDate = form.check_time ? this.handleDate(form.check_time) : ""
    form.createDate = createDate
    // status 驱动 wxml 底部按钮展示，条件自上而下覆盖
    let status = ''

    if (source === 'search-person') {
      // 查表员：pay(待付) → print(已付待开收据) → over(待打印缴费单)
      status = 'pay'                          // form.status === 1
      if (form.status !== 1) {
        status = 'print'                      // 已支付
      }
      if (form.receipt_status !== 1) {
        status = 'over'                       // 收据已处理，进入打印缴费单
      }
    }

    if (source === 'business-hall') {
      // 营业厅：bank_pay(待付) → print(已付待开收据) → print_two(补开收据)
      status = 'bank_pay'
      if (form.status !== 1) {
        status = 'print'
      }
      if (form.receipt_status !== 1) {
        status = 'print_two'
      }
    }

    if (source === 'financial-manager') {
      // 财务审核：no(待审核) / yes(已审核，无按钮)
      status = 'no'                           // form.status === 2
      if (form.status !== 2) {
        status = 'yes'
      }
    }
    // 本催缴单金额（数字）供 FT/FR 支付；展示用 fmoney 千分位
    const billPrice = parseMoneyNumber(form.price)
    form.price = fmoney(form.price, 2)
    // 总欠款：优先列表带入的 arrears_money，再接口刷新
    const arrearsRaw = parseMoneyNumber(
      form.arrears_money != null && form.arrears_money !== ''
        ? form.arrears_money
        : (form.meter && form.meter.user_bal)
    )
    // 已支付进详情：底部仍显示三按钮，FT/FR 置灰
    const ftFrDisabled = (source === 'search-person' || source === 'business-hall')
      && status !== 'pay'
      && status !== 'bank_pay'
    this.setData({
      source,
      form,
      status,
      ftFrDisabled,
      billPrice,
      paid_total_money: form.price,
      arrears_money_sum: Number.isFinite(arrearsRaw) ? arrearsRaw : 0,
      arrears_money_t: Number.isFinite(arrearsRaw) ? fmoney(arrearsRaw, 2) : '0.00',
      payStatusList: [],
      totIndex: 0,
      pay_way: '',
      pay_text: '',
      printInfo: '',
      invoiceIssued: this.getInvoiceStatus(form).invoiceIssued,
      invoiceStatusText: this.getInvoiceStatus(form).invoiceStatusText,
    })
    // 拉取总欠款；待支付时同时加载支付方式
    this.loadPayWayList(form.wm_no, status === 'pay' || status === 'bank_pay')
  },
  /**
   * 支付方式列表 + 总欠款，对齐 user-total-info.getArrearsMoneySum
   * loadPayWays：是否写入支付方式（待支付时为 true）
   */
  loadPayWayList(wm_no, loadPayWays) {
    if (!wm_no) return
    const that = this
    getArrearsMoneySum({
      wm_no,
    }).then(res => {
      const data = res.data || {}
      const arrearsSum = parseMoneyNumber(data.arrears_money_sum)
      const arrearsPatch = Number.isFinite(arrearsSum)
        ? {
          arrears_money_sum: Math.abs(arrearsSum),
          arrears_money_t: fmoney(Math.abs(arrearsSum), 2),
        }
        : {}
      if (!loadPayWays) {
        that.setData(arrearsPatch)
        return
      }
      const payWay = data.pay_way || {}
      let payWayList = []
      if (Array.isArray(payWay)) {
        payWayList = payWay.map(i => ({
          text: i.title,
          key: i.key,
        }))
      } else {
        payWayList = Object.keys(payWay).map(i => ({
          text: payWay[i].title,
          key: payWay[i].key,
        }))
      }
      const source = that.data.source
      if (source === 'search-person') {
        const payStatusList = payWayList[1] ? [payWayList[1]] : (payWayList[0] ? [payWayList[0]] : [])
        that.setData(Object.assign({}, arrearsPatch, {
          totIndex: 0,
          payStatusList,
          pay_way: payStatusList[0] ? payStatusList[0].key : '',
          pay_text: payStatusList[0] ? payStatusList[0].text : '',
          showCheck: false,
          cheque_number: '',
        }))
        return
      }
      // business-hall：全量支付方式，与 user-total-info 一致
      that.setData(Object.assign({}, arrearsPatch, {
        totIndex: 0,
        payStatusList: payWayList,
        pay_way: '',
        pay_text: '',
        showCheck: false,
        cheque_number: '',
      }))
    }).catch((res) => {
      wx.showToast({
        title: (res && res.desc) || 'error',
        icon: 'none',
      })
    })
  },
  getInvoiceStatus(form) {
    const userLang = lang.userWaterInfo
    const code = form.bill_invoice_code
      || form.invoice_code
      || form.agt_document_no
      || form.agt_invoice_no
      || ''
    const invoiceIssued = !!(code || form.invoice_status == 2)
    return {
      invoiceIssued,
      invoiceStatusText: invoiceIssued ? userLang.invoice_opened : userLang.invoice_not_open,
    }
  },
  /**
   * 从 tr_issue_agt_invoice 成功返回中解析发票号 / request_id
   * 典型结构：data.document_no / data.submission.document_no
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
    // 兜底：从 status_result.documentStatusList 取
    if (!document_no) {
      const statusData = (data.status_result && data.status_result.data) || {}
      const list = statusData.documentStatusList || []
      if (list[0] && (list[0].documentNo || list[0].document_no)) {
        document_no = list[0].documentNo || list[0].document_no
      }
    }
    // 再兜底：旧结构 extract
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
  extractAgtDocumentNo(agtInner) {
    return this.parseAgtInvoiceResult(agtInner).document_no
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
    return (meter && (meter.wm_name || meter.user_name)) || ''
  },
  buildAgtInvoiceParams(documentType, sourceId, options) {
    const form = this.data.form || {}
    const meter = form.meter || form.water_meter || {}
    const opts = options || {}
    // 收款后：source_id = 支付接口返回 data.data.id（缴费单支付记录ID）
    // 未收款开票：仍用催缴单 up_id
    const paymentId = sourceId || this.data.pay_log_id || form.up_id || form.id
    const params = {
      document_type: documentType || 'FT',
      // 状态查询改由前端 tr_obter_agt_estado（测试：60s 轮询至 V/I）
      poll: 0,
      poll_times: 0,
      poll_interval: 3,
      source_type: 'user_pay_log',
      source_id: paymentId,
      customer_tax_id: this.resolveAgtCustomerTaxId(
        meter,
        opts.customer_tax_id || form.customer_tax_id || form.nif || form.user_card
      ),
    }
    const companyName = this.resolveAgtCompanyName(
      meter,
      opts.company_name || form.company_name || form.wm_name
    )
    if (companyName) {
      params.company_name = companyName
    }
    return params
  },
  updateInvoiceIssued(agtDocumentNo, agtRequestId) {
    const form = Object.assign({}, this.data.form, {
      invoice_status: 2,
    })
    if (agtDocumentNo) {
      form.bill_invoice_code = agtDocumentNo
      form.agt_document_no = agtDocumentNo
      form.invoice_code = agtDocumentNo
    }
    const invoiceInfo = this.getInvoiceStatus(form)
    this.setData({
      form,
      agt_document_no: agtDocumentNo || this.data.agt_document_no || '',
      agt_request_id: agtRequestId || this.data.agt_request_id || '',
      invoiceIssued: invoiceInfo.invoiceIssued,
      invoiceStatusText: invoiceInfo.invoiceStatusText,
    })
  },
  handleInvoiceAction() {
    if (!this.data.is_Invoicereturn) {
      return
    }
    runAfterBluetoothGate(this, 'agt_ft_invoice', () => {
      if (this.data.invoiceIssued) {
        this.blueToothPrint()
        return
      }
      this.issueAgtInvoiceThenPrint()
    })
  },
  // 必须以 AGT 校验通过（validation_status/documentStatus = V）才算开票成功并打印
  isAgtIssueSuccess(res) {
    return isAgtValidationPassed(res)
  },
  showAgtIssueFailToast(res) {
    const otherInvoices = this.data.otherInvoices || lang.otherInvoices
    let title = otherInvoices.agtIssueFail
    if (res && isAgtValidationPending(res)) {
      const errors = getAgtValidationErrors(res)
      const is429 = errors.some((e) => String(e).indexOf('429') !== -1
        || /limite|限流|excedido/i.test(String(e)))
      title = is429
        ? (otherInvoices.agtRateLimit || otherInvoices.agtPending)
        : (otherInvoices.agtPending || otherInvoices.agtIssueFail)
    } else if (res) {
      const errors = getAgtValidationErrors(res)
      const detail = errors.length ? errors.slice(0, 2).join('；') : ''
      if (detail) {
        title = `${otherInvoices.agtIssueFail}：${detail}`.slice(0, 60)
      }
    }
    wx.showToast({
      title,
      icon: 'none',
      duration: 3000,
    })
  },
  issueAgtInvoiceThenPrint() {
    const that = this
    const otherInvoices = that.data.otherInvoices
    const paymentId = that.data.form.up_id || that.data.form.id
    if (!paymentId) {
      wx.showToast({
        title: otherInvoices.noDemandNoteId,
        icon: 'none',
      })
      return
    }
    that.setData({
      is_Invoicereturn: false,
    })
    wx.showLoading({
      title: otherInvoices.agtLoading,
      mask: true,
    })
    const resetInvoiceBtn = (delay = 1000) => {
      setTimeout(() => {
        that.setData({
          is_Invoicereturn: true,
        })
      }, delay)
    }
    const handleIssueFail = (res) => {
      wx.hideLoading()
      that.showAgtIssueFailToast(res)
      resetInvoiceBtn(0)
    }
    // 开票 → 查状态；V 直接打印；E92/pending 且已有发票号可「仍打印」
    issueAgtInvoiceThenQueryEstado(that.buildAgtInvoiceParams('FT')).then(({ issueRes, finalRes, request_id }) => {
      wx.hideLoading()
      const documentNo = mergeAgtDocumentNo(issueRes, finalRes)
      const requestId = request_id || extractAgtRequestId(finalRes) || extractAgtRequestId(issueRes)
      const doPrint = (no) => {
        that.updateInvoiceIssued(no || documentNo, requestId)
        that.blueToothPrint(no || documentNo)
        resetInvoiceBtn()
      }
      if (that.isAgtIssueSuccess(finalRes)) {
        wx.showToast({
          title: otherInvoices.agtSuccessTitle,
          icon: 'none',
        })
        doPrint(documentNo)
        return
      }
      const res = finalRes || issueRes
      if (isAgtValidationPending(res) && documentNo) {
        that.updateInvoiceIssued(documentNo, requestId)
        wx.showModal({
          title: otherInvoices.agtPending,
          content: `${otherInvoices.agtPendingPrintConfirm}\n${otherInvoices.agtInvoiceNo}: ${documentNo}`,
          confirmText: otherInvoices.printAnywayBtn || otherInvoices.printAnyway,
          cancelText: (getApp().globalData.lang.dialog || {}).cancelText || 'Cancel',
          success: (r) => {
            if (r.confirm) {
              doPrint(documentNo)
            } else {
              resetInvoiceBtn(0)
            }
          },
        })
        return
      }
      handleIssueFail(res)
    }).catch((err) => {
      handleIssueFail(err)
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

  // 「其他金额」：跳转 user-total-info，底部展示 FT / FR
  showPayPopup() {
    const meterName = (this.data.form.meter && this.data.form.meter.wm_name) || this.data.form.wm_name || ''
    wxAsyncApi('navigateTo', {
      url: `/pages/user-total-info/index?wm_no=${this.data.form.wm_no}&wm_name=${meterName}&price=${this.data.form.arrears_money}&source=${this.data.source || 'business-hall'}&from=other-amount`,
    }).then(() => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  // FT / FR：打开本催缴单缴费弹窗（实缴金额 = 本次应缴金额 / 本催缴单额度）
  openFtFrPay(e) {
    // 已支付：FT/FR 禁止点击
    if (this.data.ftFrDisabled || this.data.ftfrSubmitting) {
      return
    }
    const payDocType = (e.currentTarget.dataset.type || 'FT').toUpperCase()
    // 打开时重新拉取，确保支付方式与 user-total-info 一致（营业厅可选多种）
    this.loadPayWayList(this.data.form.wm_no, true)
    const patch = {
      showFtFrPay: true,
      payDocType,
      // 展示与提交均使用本催缴单金额
      paid_total_money: this.data.form.price,
      pay_type_error: false,
      check_num_error: false,
    }
    // 营业厅每次打开重置支付方式选择；查表员保留 POS 默认
    if (this.data.source === 'business-hall') {
      patch.pay_way = ''
      patch.pay_text = ''
      patch.showCheck = false
      patch.cheque_number = ''
    } else if (this.data.pay_way == 4) {
      patch.showCheck = true
    }
    this.setData(patch)
  },
  onCloseFtFrPay() {
    this.setData({
      showFtFrPay: false,
    })
  },
  showPayWayPicker() {
    if (!this.data.payStatusList.length) {
      this.loadPayWayList(this.data.form.wm_no, true)
      return
    }
    this.setData({
      showPay: true,
    })
  },
  onClosePay() {
    this.setData({
      showPay: false,
    })
  },
  // 支付方式确认（与 user-total-info 一致）
  onConfirmPay(e) {
    const {
      text,
      key
    } = e.detail.value
    this.setData({
      pay_way: key,
      pay_text: text,
      showPay: false,
      pay_type_error: false,
      showCheck: key == 4,
      cheque_number: key == 4 ? this.data.cheque_number : '',
      check_num_error: false,
    })
  },
  // 提交并打印 FT / FR（缴费接口与其他缴费页一致：fb_user_payment）
  submitFtFrPay() {
    const that = this
    if (that.data.ftfrSubmitting) {
      return
    }
    runAfterBluetoothGate(that, 'submit_ftfr', () => {
      that.doSubmitFtFrPay()
    })
  },

  doSubmitFtFrPay() {
    const that = this
    if (that.data.ftfrSubmitting) {
      return
    }
    const pay_text = that.data.pay_text
    const pay_way = that.data.pay_way
    if (!pay_text) {
      that.setData({
        pay_type_error: true,
      })
      wx.showToast({
        title: lang.message.formWarning,
        icon: 'none',
      })
      return
    }
    if (pay_way == 4 && !that.data.cheque_number) {
      that.setData({
        check_num_error: true,
      })
      wx.showToast({
        title: lang.message.formWarning,
        icon: 'none',
      })
      return
    }
    // 支付接口要求 total_money 为纯数字，禁止 "1,628.00" 这类千分位字符串
    const total_money = parseMoneyNumber(that.data.billPrice != null && that.data.billPrice !== ''
      ? that.data.billPrice
      : that.data.paid_total_money)
    if (!Number.isFinite(total_money)) {
      wx.showToast({
        title: lang.message.formWarning,
        icon: 'none',
      })
      return
    }
    const date = that.handleTimeValue()
    const form = that.data.form || {}
    const params = {
      wm_no: form.wm_no,
      total_money,
      pay_way,
      pay_time: date.time,
      discount_money: 0,
      operator_name: that.data.operator_name || '',
      user_payment_id: form.up_id || form.id || '',
    }
    if (pay_way == 4) {
      params.cheque_number = that.data.cheque_number
    }
    that.setData({
      ftfrSubmitting: true,
    })
    new_payWater(params).then((res) => {
      // 支付成功：data.data.id = 缴费单支付记录ID，用于 AGT source_id
      const pay_log_id = (res.data && res.data.data && res.data.data.id) || ''
      wx.showToast({
        title: lang.message.success,
        icon: 'none',
      })
      // 收款成功：FT/FR 置灰，底部仍保持三个按钮
      that.setData({
        pay_log_id,
        showFtFrPay: false,
        ftFrDisabled: true,
      })
      that.issueAgtInvoiceAfterPay(pay_log_id)
    }).catch((res) => {
      that.setData({
        ftfrSubmitting: false,
      })
      wx.showToast({
        title: (res && res.desc) || 'error',
        icon: 'none',
      })
    })
  },
  // 收款成功后按所选类型开 AGT 票并打印（payLogId = 支付记录ID）
  issueAgtInvoiceAfterPay(payLogId) {
    const that = this
    const otherInvoices = that.data.otherInvoices || lang.otherInvoices
    const paymentId = payLogId || that.data.pay_log_id
    if (!paymentId) {
      that.setData({
        ftfrSubmitting: false,
        showFtFrPay: false,
      })
      wx.showToast({
        title: otherInvoices.noDemandNoteId,
        icon: 'none',
      })
      return
    }
    wx.showLoading({
      title: otherInvoices.agtLoading,
      mask: true,
    })
    const finishSuccess = () => {
      // 开票结束：仍展示三按钮，仅 FT/FR 置灰
      that.setData({
        ftfrSubmitting: false,
        showFtFrPay: false,
        ftFrDisabled: true,
      })
    }
    const finishFail = () => {
      // 收款可能已成功：同样保持三按钮，FT/FR 置灰
      that.setData({
        ftfrSubmitting: false,
        showFtFrPay: false,
        ftFrDisabled: true,
      })
    }
    // 开票 → 查状态；V 直接打印；pending 且已有发票号可「仍打印」
    issueAgtInvoiceThenQueryEstado(
      that.buildAgtInvoiceParams(that.data.payDocType, paymentId)
    ).then(({ issueRes, finalRes, request_id }) => {
      wx.hideLoading()
      const documentNo = mergeAgtDocumentNo(issueRes, finalRes)
      const requestId = request_id || extractAgtRequestId(finalRes) || extractAgtRequestId(issueRes)
      const doPrint = () => {
        that.updateInvoiceIssued(documentNo, requestId)
        finishSuccess()
        that.blueToothPrint(documentNo)
      }
      if (that.isAgtIssueSuccess(finalRes)) {
        wx.showToast({
          title: otherInvoices.agtSuccessTitle,
          icon: 'none',
        })
        doPrint()
        return
      }
      const res = finalRes || issueRes
      if (isAgtValidationPending(res) && documentNo) {
        that.updateInvoiceIssued(documentNo, requestId)
        wx.showModal({
          title: otherInvoices.agtPending,
          content: `${otherInvoices.agtPendingPrintConfirm}\n${otherInvoices.agtInvoiceNo}: ${documentNo}`,
          confirmText: otherInvoices.printAnywayBtn || otherInvoices.printAnyway,
          cancelText: (getApp().globalData.lang.dialog || {}).cancelText || 'Cancel',
          success: (r) => {
            if (r.confirm) {
              doPrint()
            } else {
              finishFail()
            }
          },
        })
        return
      }
      that.showAgtIssueFailToast(res)
      finishFail()
    }).catch((err) => {
      wx.hideLoading()
      that.showAgtIssueFailToast(err)
      finishFail()
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
  // 缴费单 / AGT 开票后打印（invoiceNo 优先用 AGT document_no）
  blueToothPrint(invoiceNo){
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
      let sewage_rate_price =  Number(sewage_rate_num * user_type_price).toFixed(2); // 污水价格
    
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
      // 发票号：优先 AGT document_no，其次页面缓存，再次本地 order_no
      const agtDocNo = invoiceNo
        || that.data.agt_document_no
        || (that.data.form && (that.data.form.agt_document_no || that.data.form.bill_invoice_code))
        || ''
      const localOrderNo = userBluetoolthInfoData.user_payment[0]
        ? userBluetoolthInfoData.user_payment[0].order_no
        : ''
      const printInvoiceNo = agtDocNo || localOrderNo || ''
      const payDocType = (that.data.payDocType || '').toUpperCase()
      let facturaTitle = 'Aviso de cobrança'
      if (agtDocNo) {
        if (payDocType === 'FR' || String(agtDocNo).indexOf('FR ') === 0) {
          facturaTitle = 'Factura/Recibo'
        } else {
          facturaTitle = 'Factura'
        }
      }
      // 缴费单
      let printInfo_title =`EPASKS-E.P.`;
      let printInfo_title_1 =`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
0040.0000.9258.2876.1026.4 Banco Bai
0055.0000.4694.8358.1011.7 Banco Atlantica
${facturaTitle} N° ${printInvoiceNo}

Dados do Cliente`;
      let printInfo_Comsumidor = `
Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}`;
      let printInfo_CustomerData=`
N° do Cliente: ${userBluetoolthInfoData.water_meter.user_code}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address}
N° da Porta: ${userBluetoolthInfoData.water_meter.house_number}
Giro: ${userBluetoolthInfoData.water_meter.area_code}
Totalizador/Normal: ${userBluetoolthInfoData.water_meter.is_share ? 'Totalizador':'Normal' }
Unidades: ${userBluetoolthInfoData.water_meter.household_num }`;
      let abolido = `
ANULADO`;

      let printInfo_historyData_title =`
Histórico de Leituras`;
      let printInfo_historyData_info = `
Data       m³      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].check_date:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading_user:''}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `;
      let printInfo_facturacao_title =`Detalhes de Coberanca`;
      let printInfo_facturacao_info =`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
T.Fixa ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}  
${userBluetoolthInfoData.water_meter.is_share?'O custo médio: ' +average_pairce +'KZ':'' }
IVA(0%) M04
CFR: 11.00 Kz X ${userBluetoolthInfoData.user_payment[0].CFR_total_price?userBluetoolthInfoData.user_payment[0].months:0} = ${userBluetoolthInfoData.user_payment[0].CFR_total_price} Kz
`;
      let printInfo_TOTAL =`
TOTAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:userBluetoolthInfoData.water_meter.user_bal} KZ`;
      let printInfo_valores =`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager`; 
      let printInfo_time =`
Processado por programaválido FE/407/AGT/2026
${date.time}

`;
      // 旧打印：明文写入 data，再走 blueToolth + arrEncoderCopy
      that.setData({
        printInfo_title,
        printInfo_title_1,
        printInfo_Comsumidor,
        printInfo_CustomerData,
        abolido,
        printInfo_historyData_title,
        printInfo_historyData_info,
        printInfo_facturacao_title,
        printInfo_facturacao_info,
        printInfo_TOTAL,
        printInfo_valores,
        printInfo_time,
      })
      setTimeout(() => {
        that.setData({
          is_Printreturn: true,
        })
      }, 1000)
      that.verifyBlueToothPrint()
    }).catch((res) => {
      that.setData({
        is_Printreturn: true,
      })
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },

  // 旧蓝牙：检查已连接设备
  verifyBlueToothPrint() {
    const connectDeviceInfo = getStoredConnectDevice()
    const blueLang = getApp().globalData.lang
    if (!connectDeviceInfo || !connectDeviceInfo.deviceId) {
      runAfterBluetoothGate(this, 'agt_print_only', () => {
        this.verifyBlueToothPrint()
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

  // 旧蓝牙：ESC/POS + arrEncoderCopy + blueToolth.writeBLECharacteristicValue
  handlePrint(p) {
    const that = this
    const agtDoc = that.data.agt_document_no
      || (that.data.form && (that.data.form.agt_document_no || that.data.form.bill_invoice_code))
      || ''
    let info = [
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
      ...arrEncoderCopy(that.data.printInfo_valores),
      ...blueToolth.printCommand.ct_zc,
      ...blueToolth.printCommand.center,
      ...arrEncoderCopy(that.data.printInfo_time),
      ...blueToolth.printCommand.enter,
    ]
    if (agtDoc) {
      info = appendAgtInvoiceQrCommands(info, agtDoc)
    }
    console.log('开始打印，蓝牙 writeBLECharacteristicValue...')
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
          is_Printreturn: true,
        })
      },
      onFail(res) {
        console.log('打印失败...', res)
        that.setData({
          is_Printreturn: true,
        })
      },
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

})