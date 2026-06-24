// pages/query-water/status/print-info/index.js
const app = getApp()
console.log(new Date().getDay())

let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {wxAsyncApi,fmoney,judgmentData,handleTimeValue} = require('./../../utils/util')
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
  payDemandNote,setBillInvoiceCode
} = require('./../../apis/admin')
const GBK = require('./../../utils/gbk.min')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.index,
    btnName: lang.btnName,
    langDialog: lang.dialog,
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
    paid_total_money: 0
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
      btnName: lang.btnName,
      langDialog: lang.dialog,
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
        operatorNameList,
      })
    }
  },
  onShow() {
    this.setData({
      is_return: true
    })
    // this.printImg();
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
        arrears_money_sum: fmoney(arrears_money_sum,2),
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
          cheque_number: '',
        })
        if(that.data.itemInfo.pay_status == 1){
          let way = that.data.itemInfo.pay_way;
          let text = payWayList.find( ele => ele.key == way).text;
          that.setData({
            pay_way: way,
            pay_text: text,
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
      paid_total_money,
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
      that.getUserBluetoolthInfoData(that.handlePrint);
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
        that.setData({
          status: 'print',
          showPay: false,
          pay_success: true
        })
        that.getUserBluetoolthInfoData(that.handlePrint);
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
      this.setData({
        password_layer: true
      })
    }
    // 补开形式发票
    if(this.data.itemInfo.type == 2){
      this.getPrint(this.data.itemInfo);
    }
  },
  clickoperatorName(e) {
    this.setData({
      operator_name: e.currentTarget.dataset.name,
      is_operatorLsPop: false,
    })
  },
  //  确认姓名
  clickPrint() {
    let operator_name = this.data.operator_name;
    if (!operator_name) {
      this.setData({
        name_error: true
      })
      return
    }
    this.setData({
      print_type: 'receiptInfo'
    })
    let operatorNameList = this.data.operatorNameList;
    if (operatorNameList.indexOf(operator_name) == -1) {
      operatorNameList.push(operator_name);
      wx.setStorageSync('operatorNameList', JSON.stringify(operatorNameList))
    }
    this.payDemandNote();
  },
  // 点击历史姓名记录
  operatorLs(){
    this.setData({
      is_operatorLsPop: true
    })
  },
  // 开始打印
  handlePrint(p) {
    console.log('开始打印  p...',p)
    let that = this;
    let itemInfo = that.data.itemInfo;
    // GBK.encode({string}) 解码GBK为一个字节数组
    // 形式发票
    if(itemInfo.type == 2){
      let proForm_title = `Factura-proforma
`;
      let proForm_title_data = {
        "printType": 0,
        "text": encodeURIComponent(proForm_title) + "\n", 
        "concentration": 15,
        "align": 1,
        "lineHeight": 28,
        "isDoubleHeight": true, //是否倍高；
        "isDoubleWidth": false, //是否倍宽；
        "isUnderLine": 0, //是否加下划线；
        "isBold": true, //是否加粗；
      }
      p.data.splice(0, 0, proForm_title_data);
    }
    console.log('开始打印，api传信息...')
    let n = 1;
    that.writeBLECharacteristicValue(p,n);
  },
  writeBLECharacteristicValue(data,n){
    let p = data;
    let that = this;
    that.SendControlCommand(p);
    
    //  n++;
    //  if(n <= 2){
    //    that.writeBLECharacteristicValue(p,n);
    //  }
  },
  // 新打印机打印方法
  SendControlCommand(printData) {
    let that = this;
     wx.showLoading({
      title: ''
    });

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
           // 5.修改发票收据状态
          if(that.data.itemInfo.type == 1){
            that.setData({
              pay_success: false,
              pay_way: '',
              pay_text: '',
              cheque_number: '',
            })
            that.setBillInvoiceCode();
            that.getOrderInfo(res.data.data[0].orderId);
          }
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
      let receiptInfo_title_1 = `
Empresa Publica de Aguas e Saneamento do Cuanza Su7Sul Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF: 5601022917
Dados do Cliente
Nome: ${userBluetoolthInfoData.water_meter.wm_name}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
Contribuinte: ${userBluetoolthInfoData.water_meter.user_card}`;
      let receiptInfo_historyData = `
DATA: ${itemInfo.pay_status == 1 ? that.data.itemInfo.pay_time:date.time}`;
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

      setTimeout(() => {
        that.setData({
          is_return: true
        })
      }, 1000)
      if (typeof f == 'function') {
        return f(receiptInfo_data)
      }
    });
    
      
  },
  // 5.修改发票收据状态
  setBillInvoiceCode() {
    let that = this;
    setBillInvoiceCode({
      wm_id: that.data.itemInfo.wm_id,
      demand_note_id: that.data.itemInfo.id,
    }).then(res => {

    }).catch(res => {
      wx.hideToast()
    })
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
Recibo N°: ${selectradio_info.proforma_number?selectradio_info.proforma_number:''}`;
      let invoiceInfo_valores = `
Water manager
Processado por programaválido n31.1/AGT20
${date.time}

`;
    this.setData({
      proForm_title: `
Factura-proforma

`,
      
    })
    let invoiceInfo_data = {
      "name": "printMix", //普通纸混合打印
      "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
      "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
      "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
      "data": [
        {
          "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
          "text": encodeURIComponent(invoiceInfo_title) + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
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
          "text": encodeURIComponent(invoiceInfo_title_1) + "\n",
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
          "text": encodeURIComponent(invoiceInfo_valores) + "\n",
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
    this.handlePrint(invoiceInfo_data);
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
  // 转二进制 并数组复制
  arrEncoderCopy(str) {
    let data = str;
    // const encoder = new TextEncoder('cp860');  // 微信小程序不支持 new TextEncoder
    // let arr = [...encoder.encode(data)]
    // console.log(arr)
    //utf8
    let inputBuffer = new encoding.TextEncoder().encode(str);
    let arr = [...inputBuffer]
    return arr
  },


})