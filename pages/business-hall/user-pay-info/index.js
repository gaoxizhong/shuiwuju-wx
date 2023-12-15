// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')
const {
  wxAsyncApi,
} = require('../../../utils/util')
const {
  getUserPayItemDetail,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus
} = require('../../../apis/water')
const GBK = require('../../../utils/gbk.min')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,
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
    pay_way:'',
    pay_text:'',
    receiptInfo:'', //  收据
    invoiceInfo:'',//  发票
    pay_success: false,
    user_payment_info: [], // 缴费记录下的缴费单信息
    total_water: 0, // 总用水量
    is_return: true,
    invoice_code: '', // 发票号
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
    const {
      id,
      wm_no,
      wm_name,
      total_money,
      pay_way,
      invoice_code,
      pay_time,
    } = options;
    this.setData({
      from: {
        id,
        wm_no,
        wm_name,
        total_money,
        pay_time
      },
      invoice_code,
      pay_way,
    })
    this.getUserPayItemDetail(options.id)
  },
  onShow(){
    this.setData({
      is_return: true
    })
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
          infoData,
        })
        const payStatusList = that.data.payStatusList;
        payStatusList.forEach( ele =>{
          if(ele.key == pay_way){
            that.setData({
              pay_text: ele.title,
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
 
  // 收据
  printWaterInfo(){
    this.setData({
      print_type: 'receiptInfo'
    })
    this.getUserBluetoolthInfoData(this.blueToothPrint);
  },

  // 发票
  blueToothInvoice(){
    this.setData({
      print_type: 'invoiceInfo'
    })
    this.getUserBluetoolthInfoData(this.blueToothPrint);
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
    let print_type = that.data.print_type;
    let info = [];
    // GBK.encode({string}) 解码GBK为一个字节数组
    console.log(print_type)
    // 发票
    if(print_type == 'invoiceInfo'){
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...GBK.encode(that.data.invoiceInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...GBK.encode(that.data.invoiceInfo_title_1),
        ...GBK.encode(that.data.invoiceInfo_invoice_code),
        ...blueToolth.printCommand.left,
        ...GBK.encode(that.data.invoiceInfo_CustomerData),
        ...blueToolth.printCommand.center,
        ...GBK.encode(that.data.invoiceInfo_historyData_title),
        ...blueToolth.printCommand.left,
        ...GBK.encode(that.data.invoiceInfo_historyData_info),
        ...blueToolth.printCommand.center,
        ...GBK.encode(that.data.invoiceInfo_facturacao_title),
        ...blueToolth.printCommand.left,
        ...GBK.encode(that.data.invoiceInfo_facturacao_info),
        ...blueToolth.printCommand.center,
        ...GBK.encode(that.data.invoiceInfo_valores),
        ...blueToolth.printCommand.enter
      ]
    }
     //  收据
    if(print_type == 'receiptInfo'){
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...GBK.encode(that.data.receiptInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...GBK.encode(that.data.receiptInfo_title_1),
        ...blueToolth.printCommand.left,
        ...GBK.encode(that.data.receiptInfo_historyData),
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...GBK.encode(that.data.receiptInfo_TOTAL),
        ...blueToolth.printCommand.ct_zc,
        ...GBK.encode(that.data.receiptInfo_Pagamento),
        ...blueToolth.printCommand.left,
        ...GBK.encode(that.data.receiptInfo_Modos),
        ...blueToolth.printCommand.center,
        ...GBK.encode(that.data.receiptInfo_Saldo),
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
        that.setData({
          pay_success: false,
        })
        if(print_type == 'receiptInfo'){
          // 4.修改打印收据状态
          that.setReceiptStatus();
        }else{
          // 5.修改发票收据状态
          that.setInvoiceStatus();
        }
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
      console.log(userBluetoolthInfoData)
      let date = that.handleTimeValue();
      let info = that.data.infoData; // 缴费记录下的缴费单信息
      console.log(info)
      let user_info = '';
      info.forEach(ele =>{
user_info += `${ele.cycle_end}   ${ele.user_pay_payment_relation.arrears_money}KZ   ${ele.user_pay_payment_relation.arrears_money}KZ   ${ele.user_pay_payment_relation.pay_money}KZ
`
      })
      let total_water = that.data.total_water;
      let sewage_rate_num = 0; // 污水量
      let sewage_rate_price = 0; // 污水价格 
      let user_type_price = userBluetoolthInfoData.user_type.price;
      let consumo_price = 0;  // 非阶段计价 水费用展示
      if(total_water){
        console.log(total_water)
        sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100);
        sewage_rate_price = Number(sewage_rate_num * user_type_price).toFixed(2);
        consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
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
${total_water?'Consumo: '+total_water+ '(m3)':''}
${userBluetoolthInfoData.user_type.is_constant == 0?'Domestico： ' + (userBluetoolthInfoData.user_type.range_min >= 10?'> 10':(userBluetoolthInfoData.user_type.range_min + '-' + userBluetoolthInfoData.user_type.range_max) ):''}
T.Fixa Domestico: ${ userBluetoolthInfoData.user_type.rent_money }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%)
IVA(0%)
TOTAL A PAGAR  ${that.data.from.total_money} KZ

limite de pagamento: ${this.getMoreDay(15)}
`,
    invoiceInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
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
Nome: ${userBluetoolthInfoData.water_meter.wm_name}
Contribuinte: ${userBluetoolthInfoData.water_meter.user_card}

`,
      receiptInfo_historyData:`
DATA: ${date.time}
 Data    Total    Pend.    Liq.
--------------------------------
${user_info?user_info:''}
--------------------------------
`,
      receiptInfo_TOTAL: `
TOTAL: ${that.data.from.total_money} KZ
`,
      receiptInfo_Pagamento:`
Modos de Pagamento
`,
      receiptInfo_Modos: `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}   AOA    ${that.data.from.total_money} KZ
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
  setReceiptStatus() {
    let that = this;
    setReceiptStatus({id: that.data.from.id}).then(res => {
     
    }).catch(res => {
      wx.hideToast()
    })
  },
  // 5.修改发票收据状态
  setInvoiceStatus(){
    let that = this;
    setInvoiceStatus({id: that.data.from.id}).then(res => {
    
    }).catch(res => {
      wx.hideToast()
    })
  },

  onCloseResult() {
    this.setData({
      showResult: false
    })
  },

})