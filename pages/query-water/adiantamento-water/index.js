// pages/query-water/adiantamento-water/index.js — 预交费：抄表 → 收款 → AGT FA → 打印
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')
const {
  handleTimeValue,
  mergeAgtDocumentNo,
  extractAgtRequestId,
  isAgtValidationPassed,
  isAgtValidationPending,
  getAgtValidationErrors,
} = require('../../../utils/util')
const {
  arrEncoderCopy,
  appendAgtInvoiceQrCommands,
} = require('../../../utils/print')
const {
  getStoredConnectDevice,
  runAfterBluetoothGate,
} = require('../../../utils/printBluetoothGate')
const {
  countWater,
  readingPic,
  getUserBluetoolthInfoData,
  payWater,
} = require('../../../apis/water')
import {
  issueAgtInvoiceThenQueryEstado,
} from '../../../apis/admin'
import {
  getBusinessHallList,
} from '../../../apis/business-hall'

Page({
  data: {
    lang: lang.pay.collectInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,
    otherInvoices: lang.otherInvoices,
    form: {},
    userBluetoolthInfoData: {},
    reading: '',
    total_water: '',
    total_money: '',
    months: '',
    wm_no_error: false,
    reading_error: false,
    image_error: false,
    data_error: false,
    isAdmin: false,
    showPay: false,
    payStatusList: [],
    prepayContext: null,
    agt_document_no: '',
    agt_request_id: '',
    faSubmitting: false,
    pendingPrintFlow: '',
    automatica_title: `
Factura Automatica`,
  },

  onLoad(options) {
    lang = app.globalData.lang
    const form = JSON.parse(options.item)
    this.setData({
      form,
      lang: lang.pay.collectInfo,
      btnName: lang.btnName,
      langDialog: lang.dialog,
      otherInvoices: lang.otherInvoices,
    })
    this.getListData()
    this.getUserBluetoolthInfoData()
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
    if (flow === 'adiantamento_fa') {
      const ctx = this.data.prepayContext
      if (ctx && ctx.pay_log_id) {
        this.issueAgtFaThenPrint(ctx.pay_log_id)
      }
    }
    if (flow === 'adiantamento_fa_print') {
      this.getUserBluetoolthInfoData(this.verifyBlueToothPrint)
    }
  },

  getListData() {
    const params = {
      wm_no: this.data.form.wm_no,
      status: '',
      page: 1,
      select: this.data.form.wm_no,
      type: 1,
    }
    getBusinessHallList(params).then(() => {})
  },

  next() {
    const that = this
    if (that.data.faSubmitting) {
      return
    }
    const date = handleTimeValue()
    const form = that.data.form
    const wm_no = form.wm_no
    const reading = that.data.reading
    const params = {
      wm_no,
      reading: Number(reading),
      check_time: date.timestamp,
      type: 2,
    }
    if (!params.reading || params.reading === '') {
      that.setData({ reading_error: true })
      return
    }
    that.setData({ faSubmitting: true })
    readingPic(params).then((res) => {
      that.setData({ faSubmitting: false })
      if (res.code != 200) {
        wx.showToast({
          title: res.desc,
          duration: 2000,
          icon: 'none',
        })
        return
      }
      wx.showToast({
        title: lang.message.success,
        duration: 1500,
        icon: 'none',
      })
      const payWayRaw = res.data.pay_way || []
      const payStatusList = payWayRaw.map((i) => ({
        text: i.title,
        key: i.key,
      }))
      that.setData({
        prepayContext: {
          up_id: res.data.data.up_id,
          order_no: res.data.data.order_no,
          total_water: res.data.data.water,
          check_time_text: date.time,
        },
        payStatusList,
        showPay: true,
      })
    }).catch((res) => {
      that.setData({ faSubmitting: false })
      wx.showToast({
        title: res.desc,
        icon: 'none',
      })
    })
  },

  onClosePay() {
    this.setData({ showPay: false })
  },

  onConfirmPay(e) {
    const key = e.detail.value.key
    const ctx = this.data.prepayContext
    if (!ctx || !ctx.up_id) {
      wx.showToast({
        title: lang.message.fail,
        icon: 'none',
      })
      return
    }
    this.setData({ showPay: false, faSubmitting: true })
    payWater({
      up_id: ctx.up_id,
      pay_way: key,
    }).then((res) => {
      const pay_log_id = (res.data && res.data.data && res.data.data.id) || ctx.up_id
      const prepayContext = Object.assign({}, ctx, { pay_log_id })
      this.setData({ prepayContext })
      runAfterBluetoothGate(this, 'adiantamento_fa', () => {
        this.issueAgtFaThenPrint(pay_log_id)
      })
    }).catch((res) => {
      this.setData({ faSubmitting: false })
      wx.showToast({
        title: res.desc,
        icon: 'none',
      })
    })
  },

  buildAgtFaParams(payLogId) {
    const form = this.data.form || {}
    const params = {
      document_type: 'FA',
      poll: 0,
      poll_times: 0,
      poll_interval: 3,
      source_type: 'user_pay_log',
      source_id: payLogId,
      customer_tax_id: '999999999',
    }
    if (form.wm_name) {
      params.company_name = form.wm_name
    }
    return params
  },

  issueAgtFaThenPrint(payLogId) {
    const that = this
    const oi = that.data.otherInvoices || lang.otherInvoices
    if (!payLogId) {
      that.setData({ faSubmitting: false })
      wx.showToast({
        title: oi.noDemandNoteId || lang.message.fail,
        icon: 'none',
      })
      return
    }
    wx.showLoading({
      title: oi.agtLoading,
      mask: true,
    })
    issueAgtInvoiceThenQueryEstado(that.buildAgtFaParams(payLogId)).then(({ issueRes, finalRes, request_id }) => {
      wx.hideLoading()
      const documentNo = mergeAgtDocumentNo(issueRes, finalRes)
      const requestId = request_id || extractAgtRequestId(finalRes) || extractAgtRequestId(issueRes)
      const goPrint = () => {
        that.setData({
          agt_document_no: documentNo,
          agt_request_id: requestId,
        })
        runAfterBluetoothGate(that, 'adiantamento_fa_print', () => {
          that.getUserBluetoolthInfoData(that.verifyBlueToothPrint)
        })
      }
      if (isAgtValidationPassed(finalRes)) {
        wx.showToast({
          title: oi.agtSuccessTitle,
          icon: 'none',
        })
        goPrint()
        return
      }
      const res = finalRes || issueRes
      if (isAgtValidationPending(res) && documentNo) {
        that.setData({
          agt_document_no: documentNo,
          agt_request_id: requestId,
        })
        wx.showModal({
          title: oi.agtPending,
          content: `${oi.agtPendingPrintConfirm}\n${oi.agtInvoiceNo}: ${documentNo}`,
          confirmText: oi.printAnywayBtn || oi.printAnyway,
          cancelText: lang.dialog.cancelText,
          success(r) {
            if (r.confirm) {
              goPrint()
            } else {
              that.setData({ faSubmitting: false })
            }
          },
        })
        return
      }
      that.setData({ faSubmitting: false })
      const errors = getAgtValidationErrors(res)
      wx.showToast({
        title: errors.length ? errors.slice(0, 2).join('；').slice(0, 80) : oi.agtIssueFail,
        icon: 'none',
        duration: 3000,
      })
    }).catch((err) => {
      wx.hideLoading()
      that.setData({ faSubmitting: false })
      wx.showToast({
        title: (err && err.desc) || oi.agtIssueFail,
        icon: 'none',
        duration: 3000,
      })
    })
  },

  getUserBluetoolthInfoData(f) {
    const that = this
    getUserBluetoolthInfoData({ wm_no: that.data.form.wm_no }).then((res) => {
      that.setData({ userBluetoolthInfoData: res.data })
      if (typeof f === 'function') {
        f()
      }
    }).catch((res) => {
      that.setData({ faSubmitting: false })
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000,
      })
    })
  },

  verifyBlueToothPrint() {
    const connectDeviceInfo = getStoredConnectDevice()
    const blueLang = app.globalData.lang.blueToolth
    if (!connectDeviceInfo) {
      runAfterBluetoothGate(this, 'adiantamento_fa_print', () => {
        this.verifyBlueToothPrint()
      })
      return
    }
    wx.showToast({
      title: blueLang.connectDevice,
      icon: 'none',
      duration: 30000,
    })
    this.handlePrintFa(connectDeviceInfo)
  },

  getMoreDay(value) {
    const _date = new Date().getTime()
    const letenddate = _date + (value * 24 * 60 * 60 * 1000)
    const _days = new Date(letenddate)
    const year = _days.getFullYear()
    const month = _days.getMonth() + 1
    const day = _days.getDate()
    return `${day >= 10 ? day : '0' + day}.${month >= 10 ? month : '0' + month}.${year}`
  },

  handlePrintFa(p) {
    const that = this
    const userBluetoolthInfoData = that.data.userBluetoolthInfoData || {}
    const wm = userBluetoolthInfoData.water_meter || {}
    const ctx = that.data.prepayContext || {}
    const date = handleTimeValue()
    const agtNo = that.data.agt_document_no || ''
    const orderNo = ctx.order_no || ''
    const docLine = agtNo
      ? `${that.data.lang.faDocTitle} N° ${agtNo}`
      : `Aviso N° ${orderNo}`
    const totalMoney = that.data.total_money || (userBluetoolthInfoData.user_payment[0] && userBluetoolthInfoData.user_payment[0].price) || ''
    const reading = that.data.reading
    const totalWater = that.data.total_water || ctx.total_water || ''

    let info = [
      ...blueToolth.printCommand.clear,
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...arrEncoderCopy('EPASKS-E.P.'),
      ...blueToolth.printCommand.ct_zc,
      ...arrEncoderCopy(`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
${docLine}

Dados do Cliente
`),
      ...blueToolth.printCommand.center,
      ...arrEncoderCopy(`Comsumidor: ${wm.wm_name || that.data.form.wm_name}`),
      ...blueToolth.printCommand.left,
      ...arrEncoderCopy(`
N° do Cliente: ${wm.user_code || ''}
N° Contador: ${wm.wm_no || that.data.form.wm_no}
NIF: ${wm.user_card || ''}
Endereco: ${wm.wm_address || ''}
`),
      ...blueToolth.printCommand.center,
      ...arrEncoderCopy('Detalhes de Coberanca'),
      ...blueToolth.printCommand.left,
      ...arrEncoderCopy(`
Leitura: ${reading} (m³)
Consumo: ${totalWater} (m³)
TOTAL ADIANTAMENTO: ${totalMoney} KZ
`),
      ...blueToolth.printCommand.center,
      ...arrEncoderCopy(that.data.automatica_title),
      ...arrEncoderCopy(`
Processado por programaválido FE/407/AGT/2026
${date.time}
`),
      ...blueToolth.printCommand.enter,
    ]
    if (agtNo) {
      info = appendAgtInvoiceQrCommands(info, agtNo)
    }

    blueToolth.writeBLECharacteristicValue({
      ...p,
      value: new Uint8Array(info).buffer,
      lasterSuccess() {
        that.setData({ faSubmitting: false })
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: 'none',
          duration: 3000,
        })
      },
      onFail() {
        that.setData({ faSubmitting: false })
      },
    })
  },

  handleInputReading(e) {
    const reading = e.detail
    let reading_error = this.data.reading_error
    if (reading) {
      reading_error = false
    }
    this.setData({ reading, reading_error })
  },

  handleReading(e) {
    const type = e.currentTarget.dataset.type
    const reading = e.detail.value
    let reading_error = this.data.reading_error
    if (reading) {
      reading_error = false
    }
    this.setData({ reading, reading_error })
    if (type === 'reading' && reading) {
      this.waterCount()
    } else {
      this.setData({ total_money: '', total_water: '' })
    }
  },

  waterCount() {
    const reading = Number(this.data.reading)
    const wm_no = this.data.form.wm_no
    const now_time = this.data.now_time
    if (!wm_no) {
      return
    }
    countWater({ wm_no, reading, now_time }).then((res) => {
      const { water = 1, price, months } = res.data
      this.setData({
        total_water: water,
        total_money: price,
        months,
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000,
      })
    })
  },
})
