// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')
const {
  arrEncoderCopy,
} = require('./../../../utils/print')
const {
  getStoredConnectDevice,
  runAfterBluetoothGate,
} = require('../../../utils/printBluetoothGate')

const {
  wxAsyncApi,judgmentData,handleTimeValue,fmoney,
  getAgtInvoiceData,isAgtValidationPassed,isAgtValidationPending,mergeAgtDocumentNo
} = require('../../../utils/util')
const {
  getUserPayItemDetail,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus,
  addUserPayLogNumber
} = require('../../../apis/water')
import {
  obterAgtEstado,
} from '../../../apis/admin'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    from: {},
    printDeviceInfo: null,

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
    payStatusList: [
      {key: 1,title: "Numerário"},
      {key: 2,title: "Cartão Multicaixa"},
      {key: 3,title: "Pagamento bancário"},
    ],
    print_type: '',
    pay_way:'',
    pay_text:'',
    receiptInfo:'', //  收据
    invoiceInfo:'',//  发票
    pay_success: false,
    user_payment_info: [], // 缴费记录下的缴费单信息
    total_water: 0, // 总用水量
    is_return: true,
    invoice_code: '', // 发票号
    source: '',
    password_layer: false,
    operator_name: '',
    name_error: false,
    operatorNameList: [],
    is_operatorLsPop: false,
    del_admin_id: '',
    item: {},
    cancelShowPop: false,
    cancelList: [], // 取消原因
    selt_cancel_status: {}, // 选中的取消原因
    status_type: '',
    agt_status_text: '',
    querying_agt: false,
    pendingPrintFlow: '',
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
      bluetoolthDevice: lang.admin.bluetoolthDevice
    })
    let item = JSON.parse(options.item);
    console.log(item)

    const {
      id,
      wm_no,
      wm_name,
      total_money,
      pay_time,
      discount_money,
      invoice_code,
      operator_name,
      pay_way
    } = item;
    const source = options.source; // 'search-person' 查表员-- pos机子 ,'business-hall'  营业厅
    this.setData({
      from: {
        id,
        wm_no,
        wm_name,
        total_money,
        pay_time,
        discount_money
      },
      item,
      invoice_code,
      pay_way,
      source,
      operator_name
    })
    if(item.del_admin_id){
      this.setData({
        del_admin_id: item.del_admin_id
      })
    }
    this.getUserPayItemDetail(id)
  },
  onShow(){
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
    const that = this
    if (flow === 'detail_receipt_print') {
      that.getUserBluetoolthInfoData(that.blueToothPrint)
      return
    }
    if (flow === 'detail_invoice_print') {
      that.getUserBluetoolthInfoData(that.blueToothPrint)
    }
  },
  // 获取当前缴费记录下的 包含的缴费单数据
  getUserPayItemDetail(i){
    let that = this;
    const id = i;
    const params = {
      user_pay_log_id: id,
    }
    getUserPayItemDetail(params).then(res => {
      let infoData = res.data.list; // 当前缴费记录下的 包含的缴费单数据
      let pay_way = that.data.pay_way;
        this.setData({
          infoData
        })
        const payStatusList = that.data.payStatusList;
        payStatusList.forEach( ele =>{
          if(ele.key == pay_way){
            that.setData({
              pay_text: ele.title
            })
          }
        })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },

  /** 按缴费记录 ID 查询 AGT 校验状态 */
  queryAgtStatus() {
    const that = this
    const lang = that.data.lang
    const oiLang = getApp().globalData.lang.otherInvoices || {}
    const payLogId = (that.data.item && that.data.item.id) || (that.data.from && that.data.from.id)
    if (!payLogId) {
      wx.showToast({
        title: getApp().globalData.lang.message.noMoreEmpty,
        icon: 'none',
      })
      return
    }
    if (that.data.querying_agt) {
      return
    }
    that.setData({ querying_agt: true })
    wx.showLoading({
      title: oiLang.agtLoading || lang.agtPendingStatus,
      mask: true,
    })
    obterAgtEstado({
      user_pay_log_id: payLogId,
      item: that.data.item,
      defaultType: 'FT',
    }).then((res) => {
      wx.hideLoading()
      that.setData({ querying_agt: false })
      const data = getAgtInvoiceData(res)
      const documentNo = mergeAgtDocumentNo(null, res)
      if (data.rate_limited === true) {
        that.setData({ agt_status_text: lang.agtPendingStatus })
        wx.showToast({
          title: oiLang.agtRateLimit || lang.agtPendingStatus,
          icon: 'none',
          duration: 3000,
        })
        return
      }
      if (isAgtValidationPassed(res)) {
        that.setData({ agt_status_text: lang.agtValid })
        wx.showToast({
          title: documentNo
            ? `${lang.agtValid} · ${documentNo}`
            : lang.agtValid,
          icon: 'none',
          duration: 3000,
        })
        return
      }
      if (isAgtValidationPending(res)) {
        that.setData({ agt_status_text: lang.agtPendingStatus })
        const pendingDocNo = documentNo || that.data.invoice_code || ''
        wx.showToast({
          title: pendingDocNo
            ? `${lang.agtPendingStatus} · ${pendingDocNo}`
            : (oiLang.agtPending || lang.agtPendingStatus),
          icon: 'none',
          duration: 3000,
        })
        return
      }
      that.setData({ agt_status_text: lang.agtInvalid })
      wx.showToast({
        title: oiLang.agtFailTitle || lang.agtInvalid,
        icon: 'none',
        duration: 3000,
      })
    }).catch((err) => {
      wx.hideLoading()
      that.setData({ querying_agt: false })
      wx.showToast({
        title: (err && err.desc) || oiLang.agtIssueFail || lang.agtInvalid,
        icon: 'none',
        duration: 3000,
      })
    })
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
 
  // 收据---收银员
  printWaterInfo(){
    let that = this;
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
    if(!is_judgmentData){
      wx.showToast({
        title: lang.message.businessHours,
        duration: 2000,
        icon: 'none'
      })
      return
    }
    that.setData({
      print_type: 'receiptInfo',
      status_type: ''
    })
    runAfterBluetoothGate(that, 'detail_receipt_print', () => {
      that.getUserBluetoolthInfoData(that.blueToothPrint)
    })
  },
  clickoperatorName(e) {
    this.setData({
      operator_name: e.currentTarget.dataset.name,
      is_operatorLsPop: false
    })
  },
   //  确认姓名
   clickPrint() {
     let that = this;
    let operator_name = that.data.operator_name;
    if (!operator_name) {
      that.setData({
        name_error: true
      })
      return
    }
    that.setData({
      print_type: 'receiptInfo'
    })
    let operatorNameList = that.data.operatorNameList;
    if (operatorNameList.indexOf(operator_name) == -1) {
      operatorNameList.push(operator_name);
      wx.setStorageSync('operatorNameList', JSON.stringify(operatorNameList))
    }
    that.getUserBluetoolthInfoData(that.blueToothPrint);
  },
   // 点击历史姓名记录
   operatorLs(){
    this.setData({
      is_operatorLsPop: true
    })
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
  // 发票
  blueToothInvoice(){
    let that = this;
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
    if(!is_judgmentData){
      wx.showToast({
        title: lang.message.businessHours,
        duration: 2000,
        icon: 'none'
      })
      return
    }
    that.setData({
      print_type: 'invoiceInfo'
    })
    runAfterBluetoothGate(that, 'detail_invoice_print', () => {
      that.getUserBluetoolthInfoData(that.blueToothPrint)
    })
  },

  // 蓝牙设备打印
  blueToothPrint() {
    const connectDeviceInfo = getStoredConnectDevice()
    const blueLang = getApp().globalData.lang.blueToolth
    if (!connectDeviceInfo) {
      const flow = this.data.print_type === 'invoiceInfo'
        ? 'detail_invoice_print'
        : 'detail_receipt_print'
      runAfterBluetoothGate(this, flow, () => {
        this.getUserBluetoolthInfoData(this.blueToothPrint)
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
    let status_type = that.data.status_type;
    let info = [];
    const buildReceiptInfo = (receiptInfo_number) => {
      that.setData({ receiptInfo_number })
      return [
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
    if (print_type == 'receiptInfo' && !status_type) {
      let item = that.data.item;
      if (item.receipt_number) {
        info = buildReceiptInfo(`
Ref. Recibo: ${item.receipt_number}
`)
        console.log('开始打印，蓝牙 writeBLECharacteristicValue...')
        that.writeBLECharacteristicValue(p, info, 1)
        return
      }
      addUserPayLogNumber({
        id: item.id,
        type: 1
      }).then(res => {
        info = buildReceiptInfo(`
Ref. Recibo: ${res.data.receipt_number}
`)
        that.writeBLECharacteristicValue(p, info, 1)
      })
      return
    }
    if (print_type == 'invoiceInfo' && !status_type) {
      let item = that.data.item;
      const buildInvoiceInfo = (invoiceInfo_number) => [
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
      if (item.invoice_number) {
        info = buildInvoiceInfo(`
Ref. Recibo: ${item.invoice_number}
`)
        that.writeBLECharacteristicValue(p, info, 1)
        return
      }
      addUserPayLogNumber({
        id: item.id,
        type: 2
      }).then(res => {
        info = buildInvoiceInfo(`
Ref. Recibo: ${res.data.invoice_number}
`)
        that.writeBLECharacteristicValue(p, info, 1)
      })
      return
    }
    if (status_type == 'recibo') {
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...arrEncoderCopy(that.data.cancelReceipt_title),
        ...blueToolth.printCommand.ct_zc,
        ...arrEncoderCopy(that.data.cancelReceipt_title_1),
        ...blueToolth.printCommand.left,
        ...arrEncoderCopy(that.data.cancelReceipt_N),
        ...arrEncoderCopy(that.data.cancelReceipt_info),
        ...blueToolth.printCommand.enter
      ]
    }
    if (status_type == 'fatura') {
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...arrEncoderCopy(that.data.cancelFatura_title),
        ...blueToolth.printCommand.ct_zc,
        ...arrEncoderCopy(that.data.cancelFatura_title_1),
        ...blueToolth.printCommand.left,
        ...arrEncoderCopy(that.data.cancelFatura_N),
        ...arrEncoderCopy(that.data.cancelFatura_info),
        ...blueToolth.printCommand.enter
      ]
    }
    if (!info.length) {
      return
    }
    console.log('开始打印，蓝牙 writeBLECharacteristicValue...')
    that.writeBLECharacteristicValue(p, info, 1)
  },
  writeBLECharacteristicValue(data, i, n) {
    let p = data;
    let info = i;
    let num = n;
    let that = this;
    let item = that.data.item;
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
          pay_success: false,
        })
        let print_type = that.data.print_type;
        let status_type = that.data.status_type;
        if (print_type == 'receiptInfo') {
          num++;
          if (num <= 2) {
            that.writeBLECharacteristicValue(p, i, num);
          } else {
            that.setReceiptStatus(2);
          }
        }
        if (print_type == 'invoiceInfo') {
          that.setInvoiceStatus(2);
        }
        if (status_type == 'recibo') {
          that.setInvoiceStatus(3);
          item.receipt_status = 3;
          that.setData({ item })
        }
        if (status_type == 'fatura') {
          that.setInvoiceStatus(3);
          item.invoice_status = 3;
          that.setData({ item })
        }
        that.onCloseType1Select();
      },
      onFail(res) {
        console.log('打印失败...', res)
      }
    });
  },
  // 获取用户打印信息
  getUserBluetoolthInfoData(f){
    let that = this;
    const params = {
      wm_no: that.data.from.wm_no,
    }
    if( !that.data.is_return ){
      return
    }
    that.setData({
      is_return: false
    })
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      let date = handleTimeValue();
      let info = that.data.infoData; // 缴费记录下的缴费单信息
      let user_info = '';
      console.log(user_info)

      info.forEach(ele => {
        user_info += `${ ele.check_date }   ${Number(ele.arrears_money).toFixed(2)}KZ   ${Number(ele.arrears_money).toFixed(2)}KZ   ${Number(ele.price).toFixed(2)}KZ
`
      })
      console.log(user_info)
      let total_water = that.data.total_water;
      let sewage_rate_num = 0; // 污水量
      let sewage_rate_price = 0; // 污水价格 
      let user_type_price = userBluetoolthInfoData.user_type.price;
      let consumo_price = 0;  // 非阶段计价 水费用展示
      if(total_water){
        sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100);
        sewage_rate_price = Number(sewage_rate_num * user_type_price).toFixed(2);
        consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
      }
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
DATA: ${that.data.from.pay_time}
  Data    Total    Liq.    Pend.
--------------------------------
${user_info?user_info:''}
--------------------------------`;
      let receiptInfo_TOTAL = `
TOTAL: ${that.data.from.total_money} KZ`;
      let receiptInfo_Pagamento = `Modos de Pagamento`;
      let receiptInfo_Modos = `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}     AOA      ${that.data.from.total_money} KZ
--------------------------------`;
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
Factura/Recibo N° ${that.data.invoice_code}
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
TOTAL A PAGAR  ${that.data.from.total_money} KZ

limite de pagamento: ${this.getMoreDay(15)}`;
      let invoiceInfo_valores = `
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
Processado por programaválido n31.1/AGT20
${date.time}
      
`;
      that.setData({
        receiptInfo_title,
        receiptInfo_title_1,
        receiptInfo_historyData,
        receiptInfo_TOTAL,
        receiptInfo_Pagamento,
        receiptInfo_Modos,
        receiptInfo_Saldo,
        invoiceInfo_title,
        invoiceInfo_title_1,
        invoiceInfo_invoice_code,
        invoiceInfo_CustomerData,
        invoiceInfo_historyData_title,
        invoiceInfo_historyData_info,
        invoiceInfo_facturacao_title,
        invoiceInfo_facturacao_info,
        invoiceInfo_valores,
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
  setReceiptStatus(n) {
    let that = this;
    setReceiptStatus({
      id: that.data.from.id,
      receipt_status: n,  // 1:未开具 2:已开具 3:已取消
    }).then(res => {
     
    }).catch(res => {
      wx.hideToast()
    })
  },
  // 5.修改发票状态
  setInvoiceStatus(n){
    let that = this;
    let p = {
      id: that.data.from.id,
      invoice_status: n,  // 1:未开具 2:已开具 3:已取消
    }
    if(p.invoice_status == 3){
      p.comment = that.data.valueinfo.text
    }
    setInvoiceStatus(p).then(res => {
    
    }).catch(res => {
      wx.hideToast()
    })
  },


  // 点击取消按钮
  clickQx(e){
    console.log(e)
    let status_type = e.currentTarget.dataset.type;
    if(status_type == 'fatura'){ // 发票
      this.setData({
        cancelList: [
          {id: 1,text:'Leitura Errada'},
          {id: 2,text:'Fatura Duplicada'},
          {id: 3,text:'Outro'},
        ]
      })
    }
    //收据
    if(status_type == 'recibo'){
      this.setData({
        cancelList: [
          {id: 1,text:'Erro de lançamento'},
          {id: 2,text:'Duplicação'},
          {id: 3,text:'Devolução do pagamento'},
          {id: 4,text:'Outro motivo justificado'},
        ]
      })
    }
    this.setData({
      status_type,
      cancelShowPop: true
    })
  },
  onCloseType1Select() {
    this.setData({
      cancelShowPop: false
    })
  },
  // 取消原因弹窗 确认
  onConfirmType1Select(e){
    let that = this;
    let valueinfo = e.detail.value;
    let datainfo = this.data.item; 
    let status_type = that.data.status_type;
    let date = handleTimeValue();
    if( !that.data.is_return ){
      return
    }
    that.setData({
      is_return: false
    })
    let p = {
      id: datainfo.id,
    }
    // 1:收据编码 2:发票编码 3:取消收据编码 4:取消发票编码
    if(status_type == 'fatura'){
      p.type = 4;
    }
    if(status_type == 'recibo'){
      p.type = 3;
    }
    // 获取编码
    addUserPayLogNumber(p).then(res => {
      console.log(res)
      that.setData({
        is_return: true
      })
      if(res.code == 200){
      // 取消发票信息
        if(status_type == 'fatura'){
          that.setData({
            selt_cancel_status: valueinfo,
            cancelFatura_title:`EPASKS-E.P.`,
            cancelFatura_title_1: `
NIF: 5601022917
Av. 14 de Abril nº 15, Sumbe/Cuanza-Sul
Tel: 941648993 / 942626722
--------------------------------
    `,
            cancelFatura_N:`
NOTA DE DÉBITO Nº: ${datainfo.invoice_code}
Data: ${datainfo.pay_time.split(" ")[0]}
Ref. Recibo: ${datainfo.invoice_number}
--------------------------------
    `,
            cancelFatura_info: `
Cliente: ${datainfo.water_meter.wm_name}
NIF: ${datainfo.water_meter.user_card}
N° Contador: ${datainfo.water_meter.wm_no}
Telefone: ${datainfo.water_meter.wm_phone}
EMAIL: ${datainfo.water_meter.email}
--------------------------------
Motivo: ${valueinfo.text}
--------------------------------
INFORMACOES DA FACTURA
${res.data.cancel_invoice_number}
VALOR:  ${datainfo.total_money} Kz
IVA(0%) M04
${date.time}
--------------------------------
Emitido por: Shufeng Wang
Gestor Comercial
Assinatura: ______________
    
--------------------------------
  *Obrigado e volte sempre!*
    
    `,
          })
        }
        if(status_type == 'recibo'){
          that.setData({
            selt_cancel_status: valueinfo,
            cancelReceipt_title:`EPASKS-E.P.`,
            cancelReceipt_title_1:`
NIF: 5601022917
Av. 14 de Abril nº 15, Sumbe/Cuanza-Sul
Tel: 941648993 / 942626722
--------------------------------
    `,
            cancelReceipt_N:`
NOTA DE DÉBITO Nº: ${datainfo.invoice_code}
Data: ${datainfo.pay_time.split(" ")[0]}
Ref. Recibo: ${datainfo.receipt_number}
--------------------------------
    `,
            cancelReceipt_info: `
Cliente: ${datainfo.water_meter.wm_name}
NIF: ${datainfo.water_meter.user_card}
N° Contador: ${datainfo.water_meter.wm_no}
Telefone: ${datainfo.water_meter.wm_phone}
EMAIL: ${datainfo.water_meter.email}
--------------------------------
Motivo: ${valueinfo.text}
--------------------------------
Nº do Recibo          Data
${res.data.cancel_receipt_number}    ${date.time}
Total:  ${datainfo.total_money} Kz
--------------------------------
Emitido por: Shufeng Wang
Gestor Comercial
Assinatura: ______________
    
--------------------------------
  *Obrigado e volte sempre!*
    
      `,
          })
        }
        that.blueToothPrint();
      }else{
        wx.showToast({
          title: 'Error',
          icon:'none'
        })
      }

    }).catch(e => {
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon: 'none'
      })
      that.setData({
        is_return: true
      })
    })
  },


  onCloseResult() {
    this.setData({
      showResult: false
    })

  },

})