// pages/query-water/status/print-info/index.js
const app = getApp()
console.log(new Date().getDay())

let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {
  arrEncoderCopy,
} = require('./../../utils/print')
const {
  getStoredConnectDevice,
  runAfterBluetoothGate,
} = require('./../../utils/printBluetoothGate')

const {wxAsyncApi,fmoney,judgmentData,handleTimeValue,isAgtValidationPassed,isAgtValidationPending,getAgtValidationErrors,mergeAgtDocumentNo,extractAgtRequestId} = require('./../../utils/util')
//只需要引用encoding.js,注意路径
var encoding = require("./../../utils/encoding.js")
const {
  convert4to1,
  convert8to1,
} = require('./../../utils/imgIrinting')

const {
  getArrearsMoneySum,
  getUserBluetoolthInfoData,
  setReceiptStatus,
} = require('./../../apis/water')
const {
  payDemandNote,
  issueAgtInvoiceThenQueryEstado,
} = require('./../../apis/admin')
const GBK = require('./../../utils/gbk.min')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.index,
    otherInvoices: lang.otherInvoices,
    btnName: lang.btnName,
    langDialog: lang.dialog,
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    wm_no: '',
    wm_name: '',
    form: {},

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
    arrears_money_sum: '',
    no_error: false,
    payStatusList: [],
    pay_way: '',
    pay_text: '',
    receiptInfo: '', //  收据
    pay_success: false,
    user_PayFees_info: {}, // 缴费记录信息
    user_payment_info: [], // 缴费记录下的缴费单信息
    is_return: true,
    invoice_code: '', // 发票号
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
    itemInfo: null,
    total_money: 0,
    paid_total_money: 0,
    agt_document_no: '',
    agtInvoiceResult: null,
    payDocType: 'FR',
    pendingPrintFlow: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang;
    let that = this;
    that.setData({
      lang: lang.index,
      otherInvoices: lang.otherInvoices,
      btnName: lang.btnName,
      langDialog: lang.dialog,
      bluetoolthDevice: lang.admin.bluetoolthDevice
    })
    const source = options.source; // 'search-person' 查表员-- pos机子 ,'business-hall'  营业厅
    const itemInfo = JSON.parse(options.data);
    if(itemInfo.type == 2){
      itemInfo.pay_status = 1
    }
    console.log(itemInfo)
    const total_money = JSON.parse(options.data).total_money;
    const userInfo = app.globalData.userInfo || {};
    that.getArrearsMoneySum(options.wm_no);

    that.setData({
      wm_no: itemInfo.water_meter.wm_no,
      wm_name: itemInfo.water_meter.wm_name,
      source,
      userInfo,
      itemInfo,
      total_money: fmoney(total_money,2),
      paid_total_money: JSON.parse(options.data).total_money,
      operator_name: itemInfo.operator_name?itemInfo.operator_name: ''
    })

    if (wx.getStorageSync('operatorNameList')) {
      let operatorNameList = JSON.parse(wx.getStorageSync('operatorNameList'));
      console.log(operatorNameList)
      this.setData({
        operatorNameList
      })
    }
  },
  onShow() {
    lang = app.globalData.lang
    this.setData({
      is_return: true,
      lang: lang.index,
      otherInvoices: lang.otherInvoices,
      btnName: lang.btnName,
      langDialog: lang.dialog
    })
    this.resumePendingPrintFlow()
  },

  resumePendingPrintFlow() {
    const flow = this.data.pendingPrintFlow
    if (!flow || !getStoredConnectDevice()) {
      return
    }
    this.setData({ pendingPrintFlow: '' })
    if (flow === 'demand_pw') {
      this.setData({ password_layer: true })
      return
    }
    if (flow === 'demand_pay') {
      this.continueDemandPayAfterOperator()
      return
    }
    if (flow === 'proforma_print') {
      this.getPrint(this.data.itemInfo)
      return
    }
    if (flow === 'local_print_only') {
      this.blueToothPrint()
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
      that.setData({
        last_reading,
        last_time,
        arrears_money_sum: fmoney(arrears_money_sum,2)
      })
      if(that.data.payStatusList.length <= 0){
        const payWayList = Object.keys(res.data.pay_way).map(i => ({
          text: res.data.pay_way[i].title,
          key: res.data.pay_way[i].key
        }))
        that.setData({
          totIndex: 0,
          payStatusList: payWayList,
          pay_way: '',
          pay_text: '',
          cheque_number: ''
        })
        if(that.data.itemInfo.pay_status == 1){
          let way = that.data.itemInfo.pay_way;
          let text = payWayList.find( ele => ele.key == way).text;
          that.setData({
            pay_way: way,
            pay_text: text
          })
          if (way == 4){
            that.setData({
              showCheck: true,
              cheque_number: that.data.itemInfo.cheque_number?that.data.itemInfo.cheque_number:''
            })
          }
        }
      }
      
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
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

  // 失焦赋值
  handleReading(e) {
    console.log(e)
    const paid_total_money = e.detail.value;
    this.setData({
      paid_total_money
    })
  },
  extractAgtDocumentNo(agtData) {
    if (!agtData) return ''
    const inner = agtData.data || agtData
    return inner.documentNo
      || inner.document_no
      || inner.invoice_no
      || inner.invoiceNo
      || (inner.seriesFEResult && inner.seriesFEResult.seriesCode)
      || ''
  },
  formatAgtResultForDisplay(res) {
    try {
      const payload = res.data || res
      return JSON.stringify(payload, null, 2).slice(0, 800)
    } catch (e) {
      return String(res)
    }
  },
  // 收款成功后向 AGT 开票，再打印
  issueAgtInvoiceThenPrint() {
    const that = this
    const itemInfo = that.data.itemInfo
    const water_meter = itemInfo.water_meter || {}
    const otherInvoices = that.data.otherInvoices || lang.otherInvoices
    // customer_tax_id：测试阶段固定 999999999
    // TODO: 测试通过后恢复优先级：入参 > water_meter.nif/user_card > 999999999
    // company_name 可选：默认用水表户名
    const companyName = water_meter.wm_name || water_meter.user_name || that.data.wm_name || ''
    const payDocType = (that.data.payDocType || 'FR').toUpperCase()
    const params = {
      document_type: payDocType === 'FT' ? 'FT' : 'FR',
      // 状态查询改由前端 tr_obter_agt_estado（测试：60s 轮询至 V/I）
      poll: 0,
      poll_times: 0,
      poll_interval: 3,
      source_type: 'user_pay_demand_note',
      source_id: itemInfo.id,
      customer_tax_id: '999999999',
    }
    if (companyName) {
      params.company_name = companyName
    }
    wx.showLoading({
      title: otherInvoices.agtLoading,
      mask: true
    })
    // 开票 → 查状态；V 直接打印；pending 且已有发票号可「仍打印」
    issueAgtInvoiceThenQueryEstado(params).then(({ issueRes, finalRes, request_id }) => {
      wx.hideLoading()
      const documentNo = mergeAgtDocumentNo(issueRes, finalRes)
      const requestId = request_id || extractAgtRequestId(finalRes) || extractAgtRequestId(issueRes)
      const doPrint = () => {
        that.setData({
          agtInvoiceResult: (finalRes && finalRes.data) || finalRes,
          agt_document_no: documentNo,
          agt_request_id: requestId
        })
        that.getUserBluetoolthInfoData(that.blueToothPrint)
      }
      if (isAgtValidationPassed(finalRes)) {
        wx.showModal({
          title: otherInvoices.agtSuccessTitle,
          content: that.formatAgtResultForDisplay(finalRes) + (documentNo ? `\n\n${otherInvoices.agtInvoiceNo}: ${documentNo}` : ''),
          showCancel: false,
          confirmText: lang.dialog.confirmText,
          success() {
            doPrint()
          }
        })
        return
      }
      const res = finalRes || issueRes
      if (isAgtValidationPending(res) && documentNo) {
        that.setData({
          agt_document_no: documentNo,
          agt_request_id: requestId
        })
        wx.showModal({
          title: otherInvoices.agtPending,
          content: `${otherInvoices.agtPendingPrintConfirm}\n${otherInvoices.agtInvoiceNo}: ${documentNo}`,
          confirmText: otherInvoices.printAnywayBtn || otherInvoices.printAnyway,
          cancelText: lang.dialog.cancelText,
          success: (r) => {
            if (r.confirm) {
              doPrint()
            }
          }
        })
        return
      }
      const errors = getAgtValidationErrors(res)
      let failContent = ''
      if (isAgtValidationPending(res)) {
        const is429 = errors.some((e) => String(e).indexOf('429') !== -1
          || /limite|限流|excedido/i.test(String(e)))
        failContent = is429
          ? (otherInvoices.agtRateLimit || otherInvoices.agtPending)
          : (otherInvoices.agtPending || otherInvoices.agtIssueFail)
        if (errors.length) {
          failContent += `\n${errors.join('\n')}`
        }
      } else {
        failContent = errors.length
          ? errors.join('\n')
          : that.formatAgtResultForDisplay(res)
      }
      wx.showModal({
        title: otherInvoices.agtFailTitle,
        content: failContent.slice(0, 500),
        showCancel: false,
        confirmText: lang.dialog.confirmText
      })
    }).catch(e => {
      wx.hideLoading()
      console.log('AGT开票失败', e)
      wx.showModal({
        title: otherInvoices.agtFailTitle,
        content: (e.desc || e.msg || that.formatAgtResultForDisplay(e)).slice(0, 500),
        showCancel: false,
        confirmText: lang.dialog.confirmText
      })
    })
  },
  //  缴费
  payDemandNote() {
    let that = this;
    let pay_success = that.data.pay_success;
    let itemInfo = that.data.itemInfo;
    if(itemInfo.pay_status == 1){
      pay_success = true;
    }
    if (pay_success) {
      that.getUserBluetoolthInfoData(that.blueToothPrint);
    } else {
      let date = handleTimeValue();
      const params = {
        wm_id: that.data.itemInfo.wm_id,
        total_money: that.data.paid_total_money,
        pay_way: that.data.pay_way,
        date_time: date.time,
        demand_note_id: that.data.itemInfo.id
      }
      if(params.pay_way == 4){
        params.cheque_number = that.data.cheque_number;
      }
      payDemandNote(params).then(res => {
        const itemInfo = Object.assign({}, that.data.itemInfo, { pay_status: 1 })
        that.setData({
          status: 'print',
          showPay: false,
          pay_success: true,
          password_layer: false,
          itemInfo
        })
        if (itemInfo.type == 1) {
          const payDocType = (that.data.payDocType || '').toUpperCase()
          if (payDocType === 'RC') {
            that.getUserBluetoolthInfoData(that.blueToothPrint)
          } else {
            that.issueAgtInvoiceThenPrint()
          }
        } else {
          that.getUserBluetoolthInfoData(that.blueToothPrint);
        }
      }).catch((res) => {
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      })
    }
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
  // FT / FR / RC
  openDocPay(e) {
    if (!this.data.is_return) {
      return
    }
    const payDocType = (e.currentTarget.dataset.type || 'FR').toUpperCase()
    // 已支付：仅 RC 可重打收据；形式发票(type=2)三个都可点
    if (this.data.itemInfo.pay_status == 1 && this.data.itemInfo.type != 2 && payDocType !== 'RC') {
      return
    }
    this.setData({
      payDocType
    })
    this.printWaterInfo()
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
    const pay_text = this.data.pay_text;
    if(this.data.itemInfo.type == 1){
      // 已支付重打收据：跳过支付方式校验
      if (this.data.itemInfo.pay_status != 1) {
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
      }
      runAfterBluetoothGate(this, 'demand_pw', () => {
        this.setData({ password_layer: true })
      })
    }
    // 补开形式发票
    if (this.data.itemInfo.type == 2) {
      runAfterBluetoothGate(this, 'proforma_print', () => {
        this.getPrint(this.data.itemInfo)
      })
    }
  },
  clickoperatorName(e) {
    this.setData({
      operator_name: e.currentTarget.dataset.name,
      is_operatorLsPop: false
    })
  },
  continueDemandPayAfterOperator() {
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
    this.payDemandNote()
  },
  //  确认姓名
  clickPrint() {
    if (!this.data.operator_name) {
      this.setData({ name_error: true })
      return
    }
    runAfterBluetoothGate(this, 'demand_pay', () => {
      this.continueDemandPayAfterOperator()
    })
  },
  // 点击历史姓名记录
  operatorLs(){
    this.setData({
      is_operatorLsPop: true
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
    let itemInfo = that.data.itemInfo;
    let info = [];
    if (itemInfo.type == 1) {
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...arrEncoderCopy(that.data.receiptInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...arrEncoderCopy(that.data.receiptInfo_title_1),
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
    if (itemInfo.type == 2) {
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...arrEncoderCopy(that.data.proForm_title),
        ...blueToolth.printCommand.ct_zc,
        ...blueToolth.printCommand.ct,
        ...arrEncoderCopy(that.data.invoiceInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...arrEncoderCopy(that.data.invoiceInfo_title_1),
        ...blueToolth.printCommand.left,
        ...arrEncoderCopy(that.data.invoiceInfo_CustomerData),
        ...blueToolth.printCommand.center,
        ...arrEncoderCopy(that.data.invoiceInfo_valores),
        ...blueToolth.printCommand.enter
      ]
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
        if (itemInfo.type == 1) {
          that.setData({
            pay_success: false,
            pay_way: '',
            pay_text: '',
            cheque_number: '',
          })
        }
      },
      onFail(res) {
        console.log('打印失败...', res)
      }
    });
  },
  // 获取用户打印信息
  getUserBluetoolthInfoData(f) {
    let that = this;
    let itemInfo = that.data.itemInfo;
    if (!that.data.is_return) {
      return
    }
    that.setData({
      is_return: false
    })
    getUserBluetoolthInfoData({wm_no:itemInfo.water_meter.wm_no}).then(res => {
      const userBluetoolthInfoData = res.data;
      let date = handleTimeValue();
      let receiptInfo_title = `EPASKS-E.P.`;
      const otherInvoices = that.data.otherInvoices || lang.otherInvoices
      const agt_document_no = that.data.agt_document_no
      let receiptInfo_title_1 = `
Empresa Publica de Aguas e Saneamento do Cuanza Su7Sul Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF: 5601022917
${agt_document_no ? `${otherInvoices.facturaNoLabel}: ${agt_document_no}` : ''}
Dados do Cliente
Nome: ${userBluetoolthInfoData.water_meter.wm_name}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
Contribuinte: ${userBluetoolthInfoData.water_meter.user_card}`;
      let receiptInfo_historyData = `
DATA: ${itemInfo.pay_status == 1 ? that.data.itemInfo.pay_time:date.time}`;
      let receiptInfo_TOTAL = `
TOTAL: ${that.data.total_money} KZ`;
      let receiptInfo_Pagamento = `
Modos de Pagamento`;
      let receiptInfo_Modos = `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}     AOA      ${that.data.total_money} KZ
--------------------------------
${that.data.pay_way == 4?"N* do Cheque: " +that.data.cheque_number : ''}`;
      let receiptInfo_Saldo = `
Saldo: ${userBluetoolthInfoData.water_meter.user_bal} KZ

Water manager
Processado por programaválido n31.1/AGT20
Este documento nao serve de fatura
IVA Regime Simplificado
Utilizador: ${that.data.operator_name}

--------------------------------
*Obrigado e volte sempre!*

`;
      that.setData({
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
      if (typeof f == 'function') {
        return f()
      }
    });
    
      
  },
  // 形式发票打印
  getPrint(info){
    let selectradio_info = info;
    let date = this.handleTimeValue();
    let invoiceInfo_title = `EPASKS-E.P.`;
    let invoiceInfo_title_1 = `
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com

Dados do Cliente
`;
    let invoiceInfo_CustomerData = `
Comsumidor: ${selectradio_info.wm_name}
N° do Cliente: ${selectradio_info.user_code}
N° Contador: ${selectradio_info.wm_no}
NIF: ${selectradio_info.user_card}
EMAIL: ${selectradio_info.email}
Endereco detalhado: ${selectradio_info.wm_address}
N° da Porta: ${selectradio_info.house_number}
Giro: ${selectradio_info.area_code}

Espécies: ${selectradio_info.price_name}
Montante: ${fmoney(selectradio_info.total_money,2)} KZ
Recibo N°: ${selectradio_info.proforma_number?selectradio_info.proforma_number:''}
`;
      let invoiceInfo_valores = `
Water manager
Processado por programaválido n31.1/AGT20
${date.time}

`;
    this.setData({
      proForm_title: `
Factura-proforma

`,
      invoiceInfo_title,
      invoiceInfo_title_1,
      invoiceInfo_CustomerData,
      invoiceInfo_valores,
    })
    this.blueToothPrint();
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
    const operator_name = e.detail.value;
    this.setData({
      operator_name
    })
  },

})
