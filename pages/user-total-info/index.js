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
  overwriteImageData,
  getImageCommandArray,
} = require('./../../utils/imgIrinting')

const {
  payWater,
  printWater,
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
    is_yujiao: '', // 'automatica' 预缴
    pay_log_id: '',
    price: 0,
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
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      lang: lang.userWaterInfo,
      btnName: lang.btnName,
      langDialog: lang.dialog,
      price,
      wm_no,
      wm_name,
      source,
      status,
      userInfo,
      is_yujiao: options.is_yujiao,
      // payStatusList: JSON.parse(payStatusList || '[]'),
    })
    this.getArrearsMoneySum(options.wm_no)

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
        arrears_money_t: fmoney(money,2),
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
            pay_text: payStatusList[0].text,
          })
        }
        if (that.data.source == 'business-hall') {
          that.setData({
            totIndex: 0,
            payStatusList: payWayList,
            pay_way: '',
            pay_text: '',
            cheque_number: '',
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
        discount_money:discount_money,
      })
    }else{
      this.setData({
        discount_money:max,
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
        discount_money:discount_money,
      })
    }else{
      this.setData({
        discount_money:max,
      })
    }
    
  },
  // 失焦赋值
  handleReading(e) {
    console.log(e)
    const paid_total_money = e.detail.value;
    this.setData({
      paid_total_money,
    })
  },
  //  新的确认支付
  new_onConfirmPay() {
    let that = this;
    let pay_success = that.data.pay_success;
    let arrears_money_sum = Math.abs(that.data.arrears_money_sum);

    if (pay_success) {
      that.getUserBluetoolthInfoData(that.handlePrint);
    } else {
      let date = handleTimeValue();
      const params = {
        wm_no: that.data.wm_no,
        total_money: that.data.paid_total_money,
        pay_way: that.data.pay_way,
        pay_time: date.time,
        discount_money: Number(arrears_money_sum * (that.data.discount_money / 100)).toFixed(2),
        operator_name: that.data.operator_name
      }
      if(params.pay_way == 4){
        params.cheque_number = that.data.cheque_number;
      }
      new_payWater(params).then(res => {
        that.setData({
          status: 'print',
          showPay: false,
          pay_success: true
        })

        this.setData({
          user_PayFees_info: res.data.data, // 缴费记录信息
          user_payment_info: res.data.user_payment_info, // 缴费记录下的缴费单信息
          total_water: res.data.total_water, // 总用水量
          invoice_code: res.data.invoice_code,
          pay_log_id: res.data.data.id
        })
        //获取用户待缴费金额接口 
        that.getArrearsMoneySum(that.data.wm_no);
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

    this.setData({
      password_layer: true
    })
    return
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
    this.new_onConfirmPay();
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
    this.new_onConfirmPay();
  },

  // 开始打印
  handlePrint(i_data,r_data) {
    let that = this;
    let print_type = that.data.print_type;
    let p_d = {
      id: that.data.pay_log_id,
    }
    // 发票
    if (print_type == 'invoiceInfo'){
      p_d.tyep = 2;  // 1:收据编码 2:发票编码 3:取消收据编码 4:取消发票编码
    }
    // 收据
    if (print_type == 'receiptInfo'){
      p_d.tyep = 1;
    }
    // 获取编码
    addUserPayLogNumber(p_d).then(res => {
      if(res.code == 200){
        let info = [];

        // 发票
        if (print_type == 'invoiceInfo') {
          let invoiceInfo_number = `Ref. Recibo: ${res.data.invoice_number}`;
          let i_value = {
            "printType": 0,
            "text": invoiceInfo_number + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 26,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          };
          i_data.data.splice(2, 0, i_value);
        }
        //  收据
        if (print_type == 'receiptInfo') {
          let receiptInfo_number = `Ref. Recibo: ${res.data.receipt_number}`;
            let r_value = {
              "printType": 0,
              "text": receiptInfo_number + "\n",
              "concentration": 15,
              "align": 0,
              "lineHeight": 26,
              "isDoubleHeight": false, 
              "isDoubleWidth": false,
              "isUnderLine": 0,
              "isBold": false,
            };
            r_data.data.splice(2, 0, r_value);
        }
        console.log('开始打印，api传信息...')
        let n = 1;
        that.writeBLECharacteristicValue(i_data,r_data,n);
      }
    }).catch(e => {
      console.log(e)
    })

  },
  writeBLECharacteristicValue(i_d,r_d,n){
    let num = n; 
    let that = this;
    let print_type = that.data.print_type;
    //打印收据
    if (print_type == 'receiptInfo') {
      that.SendControlCommand(r_d);
      num++;
      if(num <= 2){
        that.writeBLECharacteristicValue(i_d,r_d,num);
      }else{
        // 4.修改打印收据状态
        that.setReceiptStatus();
      }
    } 
    if (print_type == 'invoiceInfo'){
      that.SendControlCommand(i_d);
      // 5.修改发票状态
      that.setInvoiceStatus();
    }
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
        }else{
          wx.showToast({
            title: 'error',
            icon: "none",
            duration: 3000,
          })
        }
        that.getOrderInfo(res.data.data[0].orderId);
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
      const userBluetoolthInfoData = res.data
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
      // 发票
      let invoiceInfo_title = `EPASKS-E.P.`;
      let invoiceInfo_title_1 = `
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com

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
TOTAL A PAGAR  ${that.data.user_PayFees_info.total_money} KZ

limite de pagamento: ${this.getMoreDay(15)}`;
      let invoiceInfo_valores = `
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
Processado por programaválido n31.1/AGT20
${date.time}
      
`;
      let invoiceInfo_data = {
        "name": "printMix", //普通纸混合打印
        "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
        "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
        "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
        "data": [
          {
            "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
            "text": invoiceInfo_title + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
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
            "text": invoiceInfo_title_1 + "\n",
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
            "text": invoiceInfo_CustomerData + "\n",
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
            "text": invoiceInfo_historyData_title + "\n",
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
            "text": invoiceInfo_historyData_info + "\n",
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
            "text": invoiceInfo_facturacao_title + "\n",
            "concentration": 15,
            "align": 1,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": invoiceInfo_facturacao_info + "\n",
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
            "text": invoiceInfo_valores + "\n",
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
            "text": receiptInfo_title + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
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
            "text": receiptInfo_title_1 + "\n",
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
            "text": receiptInfo_historyData + "\n",
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
            "text": receiptInfo_TOTAL + "\n",
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
            "text": receiptInfo_Pagamento + "\n",
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
            "text": receiptInfo_Modos + "\n",
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
            "text": receiptInfo_Saldo + "\n",
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
      if (typeof f == 'function'){
        return f(invoiceInfo_data,receiptInfo_data)
      }
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
  
  },
  handleNameBlur(e) {
    console.log(e)
    const operator_name = e.detail.value;
    
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