// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')
const {
  wxAsyncApi,judgmentData,handleTimeValue,fmoney
} = require('../../../utils/util')
const {
  getUserPayItemDetail,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus,
  addUserPayLogNumber
} = require('../../../apis/water')
//只需要引用encoding.js,注意路径
var encoding = require("../../../utils/encoding.js")
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
      operator_name,
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
    // this.setData({
    //   password_layer: true
    // })
    // return
    that.getUserBluetoolthInfoData(that.handlePrint);
  },
  clickoperatorName(e) {
    this.setData({
      operator_name: e.currentTarget.dataset.name,
      is_operatorLsPop: false,
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
    that.getUserBluetoolthInfoData(that.handlePrint);
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
      operator_name: '',
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
      operator_name,
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
    that.getUserBluetoolthInfoData(that.handlePrint);
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
    let status_type = that.data.status_type;
    //  收据
    if(print_type == 'receiptInfo' && !status_type){
      /// 判断是否有收据编码
      let item = that.data.item;
      if(item.receipt_number){
        let receiptInfo_number = `
Ref. Recibo: ${item.receipt_number}`;
        let r_value = {
          "printType": 0,
          "text": encodeURIComponent(receiptInfo_number) + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 26,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        };
        p.data.splice(2, 0, r_value);
        
      }else{
        addUserPayLogNumber({
          id: item.id,
          type: 1
        }).then(res => {
          let receiptInfo_number = `
Ref. Recibo: ${res.data.receipt_number}`;
        let r_value = {
          "printType": 0,
          "text": encodeURIComponent(receiptInfo_number) + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 26,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        };
        p.data.splice(2, 0, r_value);
        })
      }
    }

    console.log('开始打印，api传信息...')
    let n = 1;
    that.writeBLECharacteristicValue(p,n);
  },
  writeBLECharacteristicValue(data,n){
    let p = data;
    let num = n; 
    let that = this;
    let print_type = that.data.print_type;
    that.setData({
      pay_success: false,
    })
    //打印收据
    if (print_type == 'receiptInfo') {
      that.SendControlCommand(p);
      num++;
      if(num <= 2){
        that.writeBLECharacteristicValue(p,num);
      }else{
        // 4.修改打印收据状态
        that.setReceiptStatus(2);
      }
    }
    that.onCloseType1Select();

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
      let receiptInfo_data = {
        "name": "printMix", //普通纸混合打印
        "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
        "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
        "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
        "data": [
          {
            "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
            "text": encodeURIComponent(receiptInfo_title) + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
            "concentration": 15, //打印浓度1~20，默认15
            "align": 1, //0左对齐，1居中对齐，2右对齐；
            "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
            //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
            "isDoubleHeight": true, //是否倍高；
            "isDoubleWidth": false, //是否倍宽；
            "isUnderLine": 0, //是否加下划线；
            "isBold": true, //是否加粗；
          },
          {
            "printType": 0,
            "text": encodeURIComponent(receiptInfo_title_1) + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": encodeURIComponent(receiptInfo_historyData) + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": encodeURIComponent(receiptInfo_TOTAL) + "\n",
            "concentration": 15,
            "align": 1,
            "lineHeight": 24,
            "isDoubleHeight": true, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": encodeURIComponent(receiptInfo_Pagamento) + "\n",
            "concentration": 15,
            "align": 1, // 居中
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": encodeURIComponent(receiptInfo_Modos) + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": encodeURIComponent(receiptInfo_Saldo) + "\n",
            "concentration": 15,
            "align": 1,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
        ]
      };

      setTimeout(()=>{
        that.setData({
          is_return: true
        })
      },1000)
      if (typeof f == 'function'){
        console.log('f()')
        return f(receiptInfo_data)
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
    setInvoiceStatus().then(res => {
    
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
          })
          let cancelFatura_title = `EPASKS-E.P.`;
          let cancelFatura_title_1 = `
NIF: 5601022917
Av. 14 de Abril nº 15, Sumbe/Cuanza-Sul
Tel: 941648993 / 942626722
--------------------------------
NOTA DE DÉBITO Nº: ${datainfo.invoice_code}
Data: ${datainfo.pay_time.split(" ")[0]}
Ref. Recibo: ${datainfo.invoice_number}
--------------------------------
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
    
`;
          let c_d = {
              "name": "printMix", //普通纸混合打印
              "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
              "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
              "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
              "data": [
                {
                  "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
                  "text": encodeURIComponent(cancelFatura_title) + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
                  "concentration": 15, //打印浓度1~20，默认15
                  "align": 1, //0左对齐，1居中对齐，2右对齐；
                  "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
                  //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
                  "isDoubleHeight": true, //是否倍高；
                  "isDoubleWidth": false, //是否倍宽；
                  "isUnderLine": 0, //是否加下划线；
                  "isBold": true, //是否加粗；
                },
                {
                  "printType": 0,
                  "text": encodeURIComponent(cancelFatura_title_1) + "\n",
                  "concentration": 15,
                  "align": 0,
                  "lineHeight": 30,
                  "isDoubleHeight": false, 
                  "isDoubleWidth": false,
                  "isUnderLine": 0,
                  "isBold": false,
                },

              ]
        
          }
          that.SendControlCommand(c_d);
        }
        // 取消收据信息
        if(status_type == 'recibo'){
          that.setData({
            selt_cancel_status: valueinfo,
          })
          let cancelReceipt_title = `EPASKS-E.P.`;
          let cancelReceipt_title_1 = `
NIF: 5601022917
Av. 14 de Abril nº 15, Sumbe/Cuanza-Sul
Tel: 941648993 / 942626722
--------------------------------
NOTA DE DÉBITO Nº: ${datainfo.invoice_code}
Data: ${datainfo.pay_time.split(" ")[0]}
Ref. Recibo: ${datainfo.receipt_number}
--------------------------------
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
    
      
`;
          let r_d = {
            "name": "printMix", //普通纸混合打印
            "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
            "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
            "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
            "data": [
              {
                "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
                "text": encodeURIComponent(cancelReceipt_title) + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
                "concentration": 15, //打印浓度1~20，默认15
                "align": 1, //0左对齐，1居中对齐，2右对齐；
                "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
                //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
                "isDoubleHeight": true, //是否倍高；
                "isDoubleWidth": false, //是否倍宽；
                "isUnderLine": 0, //是否加下划线；
                "isBold": true, //是否加粗；
              },
              {
                "printType": 0,
                "text": encodeURIComponent(cancelReceipt_title_1) + "\n",
                "concentration": 15,
                "align": 0,
                "lineHeight": 30,
                "isDoubleHeight": false, 
                "isDoubleWidth": false,
                "isUnderLine": 0,
                "isBold": false,
              },

            ]

          }  
         
          that.SendControlCommand(r_d);
        }
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
  },
   // 新打印机打印方法
   SendControlCommand(printData) {
    let that = this;
     wx.showLoading({
      title: ''
    });
    let print_type = that.data.print_type;
    let status_type = that.data.status_type;
    let item = that.data.item;

    let printCtn = {
      "type":"print",
      "printJsonStr": printData
    }
    wx.request({
      url: app.globalData.apiUrl + "/iotAdmin/iot/write2Printer",
      method: "post",
      data: {
        terminalNo: app.globalData.terminalNo,
        groupId: app.globalData.groupId,
        printCtn: JSON.stringify(printCtn)
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: (res) => {
        wx.hideLoading();
        console.log('success...',res)
        if(res.data.code == 200){
          wx.showToast({
            title: lang.blueToolth.printSuccess,
            icon: "",
            duration: 3000,
          })
          //发票
          if(print_type == 'invoiceInfo'){
            that.setInvoiceStatus(2);
          }
          //取消收据
          if(status_type == 'recibo'){
            that.setInvoiceStatus(3);
            item.receipt_status = 3;
            that.setData({
              item
            })
          }
          //取消发票
          if(status_type == 'fatura'){
            that.setInvoiceStatus(3);
            item.invoice_status = 3;
            that.setData({
              item
            })
          }
          that.onCloseType1Select();
          that.getOrderInfo(res.data.data[0].orderId);
        }else{
          wx.showToast({
            title: 'error',
            icon: "none",
            duration: 3000,
          })
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('err...',err)// 控制台打印完整错误，方便排查
      }
    })
  },
  getOrderInfo(id){

    wx.request({
      url: "https://iot.unioncore.vip/iotAdmin/iot/getOrderInfo",
      method: "post",
      data: {
        orderId: id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success: (res) => {
        wx.hideLoading();
        console.log('success...',res)
        if(res.data.code == 200){
          
        }else{
         
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('err...',err)// 控制台打印完整错误，方便排查
        
      }
    })
  },
})