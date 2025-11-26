const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {
  wxAsyncApi,fmoney,handleTimeValue
} = require('./../../utils/util')
const GBK = require('./../../utils/gbk.min')
//只需要引用encoding.js,注意路径
var encoding = require("./../../utils/encoding.js")
import {
  getFbuserStatis,getUserBluetoolthInfoData,getUserPayItemDetail
} from './../../apis/water'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,
    wm_no: '',
    status: '',
    admin_name:'', // 管理员搜索字段
    show: false,
    selectIndex: 0, // 状态索引
    isScroll: false,
    startTime: '',
    endTime: '',
    wm_id:'',
    water_mater: {}, // 水表信息
    wm_payment_statis: {}, //缴费单统计
    user_payment_list: [], //缴费单列表
    water_mater_pay_log_list: [], //缴费(支付)记录
    user_pay_log_count: '', //缴费(支付)次数
    user_pay_log_total_money_sum: '', //缴费(支付)总金额
    user_pay_log_discount_money_sum: '', //缴费(支付)减免总额
    water_mater_price_sum: '', //缴费单总金额
    water_mater_payment_count: '', //缴费单数量
    water_mater_arrears_money_sum: '', //欠费总额
    title_active: 1,
    infoData: {},
    payStatusList: [
      {key: 1,title: "Numerário"},
      {key: 2,title: "Cartão Multicaixa"},
      {key: 3,title: "Pagamento bancário"},
    ],
    pay_way:'',
    pay_text:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const data = JSON.parse(options.data)
    console.log(data)
    lang = app.globalData.lang
    this.setData({
      wm_id: data.wm_id,
      lang: lang.userWaterInfo,
      btnName: lang.btnName,
      langDialog: lang.dialog,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  handleGetTime(e) {
    const {
      endDate,
      endTime,
      startDate,
      startTime,
    } = e.detail
    this.setData({
      endDate,
      endTime,
      startDate,
      startTime,
      list: [],
      isScroll: true,
      loading: ''
    })
    this.getFbuserStatis();
  },
  getFbuserStatis(){
    let that = this;
    let p = {
      stime: this.data.startTime,
      etime: this.data.endTime,
      wm_id: this.data.wm_id,
    }
    getFbuserStatis(p).then( res =>{
      if(res.code == 200){
        let form = res.data.data;
        form.user_payment_list = form.user_payment_list.reverse();
        // form.user_bal = fmoney(form.water_mater.user_bal,2);
        form.user_bal = (form.water_mater.user_bal).toFixed(2);
        let water_mater_payment_count = form.water_mater_payment_count; //缴费单数量
        let user_pay_log_total_money_sum = form.user_pay_log_total_money_sum;//缴费(支付)总金额
        let user_pay_log_discount_money_sum = form.user_pay_log_discount_money_sum; //缴费(支付)减免总额
        let water_mater_price_sum = form.water_mater_price_sum; //缴费单总金额
        let water_mater_arrears_money_sum = form.water_mater_arrears_money_sum; //欠费总额
        let user_pay_log_count = form.user_pay_log_count; //缴费(支付)次数
        that.setData({
          form,
          water_mater_payment_count,
          user_pay_log_count,
          user_pay_log_total_money_sum,
          user_pay_log_discount_money_sum,
          water_mater_price_sum,
          water_mater_arrears_money_sum
        })
      }
    }).catch( e=>{
      console.log(e)
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onChange(e){
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      title_active,
    })

  },
  // ====================== ↓ =======================
  // 获取当前缴费记录收据下的 包含的缴费单数据
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
        that.getUserBluetoolthInfoData1(that.verifyBlueToothPrint);
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 点击缴费单列表打印
  clickPrintItem(e){
    console.log(e)
    let that = this;
    let selectPrintInfo = e.currentTarget.dataset.item;
    let print_type = e.currentTarget.dataset.type;
    that.setData({
      print_type,
      selectPrintInfo,
      selectImprimirIndex: e.currentTarget.dataset.index, 
    })
    if(print_type == 'reciboInfo'){
      that.setData({
        pay_way: selectPrintInfo.pay_way
      })
      that.getUserPayItemDetail(selectPrintInfo.id);
    }else{
      that.getUserBluetoolthInfoData(that.verifyBlueToothPrint);
    }
    
  },

  // 获取用户缴费单打印信息
  getUserBluetoolthInfoData(f){
    let that = this;
    let selectPrintInfo = that.data.selectPrintInfo;
    let user_payment_list = that.data.form.user_payment_list; // 缴费单列表
    let selectImprimirIndex = that.data.selectImprimirIndex;
    let date_time = handleTimeValue().time;
    let log_list = '';
    let arr = user_payment_list.slice(selectImprimirIndex,selectImprimirIndex + 3);

    arr.forEach((ele,index) => {
      log_list +=`${ ele.check_date }   ${ele.reading}   ${ele.reading_user?ele.reading_user:''}
`
    })
    const params = {
      wm_no: that.data.form.water_mater.wm_no,
    }
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      let user_type_price = userBluetoolthInfoData.user_type.price; // 用户类型单价
      let total_water = Number(selectPrintInfo.water);
      let sewage_rate_num = Number( total_water * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100).toFixed(2); // 污水量
      let sewage_rate_price =  Number(Number(sewage_rate_num) * Number(user_type_price)).toFixed(2); // 污水价格
      let months = selectPrintInfo.months; // 月份
      let T_Fixa = Number(userBluetoolthInfoData.user_type.rent_money * months).toFixed(2);
      let consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
      let household_num = userBluetoolthInfoData.water_meter.household_num; // 供用水表户数；
      let average_pairce = Number(selectPrintInfo.price)/household_num.toFixed(2);  // 平均户数费用
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

Factura Simplificada N° ${selectPrintInfo.order_no}

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
Totalizador/Normal: ${userBluetoolthInfoData.water_meter.is_share ? 'Totalizador':'Normal' }
Unidades: ${userBluetoolthInfoData.water_meter.household_num }  
        `,
        printInfo_historyData_title:`
Histórico de Leituras
        `,
        printInfo_historyData_info:`
    Data       m³      Leitor
--------------------------------
${log_list?log_list:''}
-------------------------------- `,
      printInfo_facturacao_title:`Detalhes de Coberanca`,
      printInfo_facturacao_info:`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
T.Fixa ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}  
${userBluetoolthInfoData.water_meter.is_share?'O custo médio: ' +average_pairce +'KZ':'' }
IVA(0%) M04
CFR: 11.00 Kz X ${selectPrintInfo.CFR_total_price?selectPrintInfo.months:0} = ${selectPrintInfo.CFR_total_price} Kz
`,
      printInfo_TOTAL:`
TOTAL A PAGAR  ${selectPrintInfo.price} KZ`,
      pagamento_pagamento:`
limite de pagamento: ${selectPrintInfo.created_at}`,
      printInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
Processado por programaválido n31.1/AGT20
`,     
      printInfo_time:`
${date_time}

`,

      })
      if (typeof f == 'function'){
        return f()
      }
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 获取用户收据打印信息
  getUserBluetoolthInfoData1(f){
    let that = this;
    let selectPrintInfo = that.data.selectPrintInfo;

    const params = {
      wm_no: that.data.form.water_mater.wm_no,
    }
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      let info = that.data.infoData; // 缴费记录下的缴费单信息
      let user_info = '';
      info.forEach(ele => {
        user_info += `${ ele.check_date }   ${Number(ele.arrears_money).toFixed(2)}KZ   ${Number(ele.arrears_money).toFixed(2)}KZ   ${Number(ele.price).toFixed(2)}KZ
`
      })
      console.log(user_info)
      console.log(selectPrintInfo)
     
      that.setData({
      //收据
      receiptInfo_title:`EPASKS-E.P.`,
      receiptInfo_title_1:`
Empresa Publica de Aguas e Saneamento do Cuanza Su7Sul Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF: 5601022917
Recibo N° ${selectPrintInfo.invoice_code}
ORIGINAL
Nome: ${userBluetoolthInfoData.water_meter.wm_name}
Contribuinte: ${userBluetoolthInfoData.water_meter.user_card}

`,
      receiptInfo_historyData:`
DATA: ${selectPrintInfo.pay_time}
  Data    Total    Pend.    Liq.
--------------------------------
${user_info?user_info:''}
--------------------------------
`,
      receiptInfo_TOTAL: `
TOTAL: ${selectPrintInfo.total_money} KZ
`,
      receiptInfo_Pagamento:`
Modos de Pagamento
`,
      receiptInfo_Modos: `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}   AOA    ${selectPrintInfo.total_money} KZ
--------------------------------`,
      receiptInfo_Saldo: `
Saldo: ${userBluetoolthInfoData.water_meter.user_bal} KZ

Water manager
Processado por programaválido n31.1/AGT20
Este documento nao serve de fatura
IVA Regime Simplificado
Utilizador: ${selectPrintInfo.operator_name}
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
        console.log('f()')
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
  // 蓝牙设备打印
  verifyBlueToothPrint() {
    console.log('蓝牙设备打印')
    const connectStorage = wx.getStorageSync('connectDevice')
    const connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
    const lang = getApp().globalData.lang
    console.log(connectDeviceInfo)
    if (!connectDeviceInfo) {
    console.log('无链接...')
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
      console.log('已链接...')
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
    let print_type = that.data.print_type;
    console.log(print_type)
    let info = [];
    // 收据
    if(print_type == 'receiptInfo'){
      console.log('printInfo')
      let selectPrintInfo = that.data.selectPrintInfo;
      if(selectPrintInfo.receipt_number){
        that.setData({
          receiptInfo_number: `
Ref. Recibo: ${selectPrintInfo.receipt_number}
`,
        })
        info = [
          ...blueToolth.printCommand.clear,
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...that.arrEncoderCopy(that.data.receiptInfo_title),
          ...blueToolth.printCommand.ct_zc,
          ...that.arrEncoderCopy(that.data.receiptInfo_title_1),
          ...that.arrEncoderCopy(that.data.receiptInfo_number),
          ...blueToolth.printCommand.left,
          ...that.arrEncoderCopy(that.data.receiptInfo_historyData),
          ...blueToolth.printCommand.center,
          ...blueToolth.printCommand.ct,
          ...that.arrEncoderCopy(that.data.receiptInfo_TOTAL),
          ...blueToolth.printCommand.ct_zc,
          ...that.arrEncoderCopy(that.data.receiptInfo_Pagamento),
          ...blueToolth.printCommand.left,
          ...that.arrEncoderCopy(that.data.receiptInfo_Modos),
          ...blueToolth.printCommand.center,
          ...that.arrEncoderCopy(that.data.receiptInfo_Saldo),
          ...blueToolth.printCommand.enter
        ]
      }else{
        addUserPayLogNumber({
          id: selectPrintInfo.id,
          type: 1
        }).then(res => {
          that.setData({
            receiptInfo_number: `
  Ref. Recibo: ${res.data.receipt_number}
  `,
          })
          info = [
            ...blueToolth.printCommand.clear,
            ...blueToolth.printCommand.center,
            ...blueToolth.printCommand.ct,
            ...that.arrEncoderCopy(that.data.receiptInfo_title),
            ...blueToolth.printCommand.ct_zc,
            ...that.arrEncoderCopy(that.data.receiptInfo_title_1),
            ...that.arrEncoderCopy(that.data.receiptInfo_number),
            ...blueToolth.printCommand.left,
            ...that.arrEncoderCopy(that.data.receiptInfo_historyData),
            ...blueToolth.printCommand.center,
            ...blueToolth.printCommand.ct,
            ...that.arrEncoderCopy(that.data.receiptInfo_TOTAL),
            ...blueToolth.printCommand.ct_zc,
            ...that.arrEncoderCopy(that.data.receiptInfo_Pagamento),
            ...blueToolth.printCommand.left,
            ...that.arrEncoderCopy(that.data.receiptInfo_Modos),
            ...blueToolth.printCommand.center,
            ...that.arrEncoderCopy(that.data.receiptInfo_Saldo),
            ...blueToolth.printCommand.enter
          ]
        })
      }
    }
    // 缴费单
    console.log('printInfo: 拼接缴费单信息...')
    if(print_type == 'printInfo'){
    console.log('printInfo')

      info = [
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
        ...that.arrEncoderCopy(that.data.printInfo_time),
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







// =========================  ↑   ====================

  // 打印信息
  imprimirInfo(){
    let that = this;
    let item = that.data.form;
    let water_mater_payment_count = item.water_mater_payment_count; //缴费单数量
    let user_pay_log_total_money_sum = item.user_pay_log_total_money_sum;//缴费(支付)总金额
    let user_pay_log_discount_money_sum = item.user_pay_log_discount_money_sum; //缴费(支付)减免总额
    let water_mater_price_sum = item.water_mater_price_sum; //缴费单总金额
    let water_mater_arrears_money_sum = item.water_mater_arrears_money_sum; //欠费总额
    let water_mater_pay_log_list = item.water_mater_pay_log_list; //缴费(支付)记录
    let log_list = '';
    let date_time = handleTimeValue().time;

    water_mater_pay_log_list.forEach((ele,index) => {
      log_list +=`${ ele.pay_time }     ${ele.total_money}KZ
`
    })
    // 获取信息
    that.setData({
      title:`EPASKS-E.P.`,
      title_1:`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
        `,
      printInfo:`
N° Contador: ${item.water_mater.wm_no}
Comsumidor: ${item.water_mater.wm_name}
Localidade: ${item.water_mater.area1} ${item.water_mater.area2} ${item.water_mater.area3} ${item.water_mater.wm_address}
NIF: ${item.water_mater.user_card}
Telefone: ${item.water_mater.wm_phone}
EMAIL: ${item.email}
Leitura anterior: ${item.water_mater.last_reading} (m³)
Ordem de pagamento: ${item.water_mater_payment_count?item.water_mater_payment_count:0}
Linha de pagamento pendente: ${item.water_mater_price_sum} KZ
Créditos já pagos: ${item.user_pay_log_total_money_sum} KZ
Valor total devido: ${item.water_mater_arrears_money_sum} KZ
Limite de redução: ${item.user_pay_log_discount_money_sum} KZ
Saldo da conta: ${item.user_bal} KZ
`,
print_order_info: `
${that.data.startTime} - ${that.data.endTime}
Registro de pagamentos:
--------------------------------
${log_list?log_list:''}
--------------------------------
`,
valores:`
Water manager
Processado por programaválido n31.1/AGT20
DATA: ${date_time}

    `
    })
    that.blueToothInfo();
  },
  // 蓝牙设备打印
  blueToothInfo() {
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
      this.handlePrint1(connectDeviceInfo)
    }
  },
  // 开始打印
  handlePrint1(p) {
    // GBK.encode({string}) 解码GBK为一个字节数组
    let info = [
      ...blueToolth.printCommand.clear,
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...this.arrEncoderCopy(this.data.title),
      ...blueToolth.printCommand.ct_zc,
      ...this.arrEncoderCopy(this.data.title_1),
      ...blueToolth.printCommand.left,
      ...this.arrEncoderCopy(this.data.printInfo),
      ...this.arrEncoderCopy(this.data.print_order_info),
      ...blueToolth.printCommand.center,
      ...this.arrEncoderCopy(this.data.valores),
      ...blueToolth.printCommand.enter
    ]
    console.log('开始打印，api传信息...')
    blueToolth.writeBLECharacteristicValue({
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
      },
      onFail(res){
        console.log('打印失败...')
        console.log(res)
      }
    });
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