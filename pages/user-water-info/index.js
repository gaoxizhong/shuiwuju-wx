// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {
  wxAsyncApi,
} = require('./../../utils/util')
const {
  payWater,
  printWater
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
    const form = JSON.parse(options.data)
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
    this.setData({
      source,
      form,
      status,
      payStatusList: JSON.parse(payStatusList || '[]'),
      printInfo: `
EPASKS
EMPRESA PUBLICA DE AGUAS E
SANEAMENTO DO KWANZA SUL-E.P.
No Contribuinte: 5601022917
Avenida Comandante Cassange - Zona 3 - ETASumbe - Cuanza Sul - Angola
Atendimento ao Cliente: 941648993
Comunicacao de Leituras: 941648993
Comunicacso de Rupturas: 941648999
Falhas de Aqua: 941648999
Email: info.epasksagmail.com

Nota de Coberanca Nr 2023-*******

Dados do Cliente

Comsumidor: MARIA DA GRAÇA FERNANDES LIMA
NIF: 001189995BA039
EMAIL: sinharena27@gmail.com
Endereco detalhado: BLOCO G DO BAIRRO E-15
Categoria Tarifaria: Doméstico escalão 2
N.º Série:2014-**********
Giro/Zona 4

Histórico de Leituras
Data        m3     Origem
21.08.2023  421   Leitor
21.08.2023  421   Leitor
21.08.2023  421   Leitor

Detalhes de Facturacao
CONTAS DE GUA
Domestico：
Tarifa Fixa Domestico
Taxa Aguas Residuais (80%)
IVA(0%)
TOTAL GERAL A PAGAR

Data limite de pagamento:  16.09.2023

valores pendentes

*****.** Kz



EPAL CUANZA SUL WATER MANEGEMENT

${this.data.lang.wm_no}：${form.wm_no};
${this.data.lang.last_water}：${form.last_reading}（m³）;
${this.data.lang.reading}：${form.reading}（m³）;
${this.data.lang.total_water}：${ (form.reading * 10000 - form.last_reading * 10000) /10000}（m³）;
${this.data.lang.total_money}：${form.price}（KZ）;


`
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
      url: `/pages/user-total-info/index?wm_no=${this.data.form.wm_no}&source=business-hall`,
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
      this.connectBlueToothDevice(connectDeviceInfo)
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
    // 开始连接蓝牙设备
    blueToolth.createBLEConnection(deviceId).then(res => {
      // 连接蓝牙设备成功
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
        wx.hideToast()
        this.setData({
          printDeviceInfo: null,
        })
      }
    }).catch((res) => {
      console.log(res)
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
  handlePrint() {
    blueToolth.writeBLECharacteristicValue({
      ...this.data.printDeviceInfo,
      value: new Uint8Array([...blueToolth.printCommand.clear, ...GBK.encode(this.data.printInfo), ...blueToolth.printCommand.enter])
        .buffer,
      lasterSuccess() {
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: "none",
          duration: 3000,
        })
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
})