// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi
} = require('./../../../../utils/util')
const blueToolth = require('./../../../../utils/bluetoolth')
const {
  getArrearsMoneySum,
  payWater,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus,
  addUserPayLogNumber
} = require('./../../../../apis/water')
//只需要引用encoding.js,注意路径
var encoding = require("./../../../../utils/encoding.js")

// const { SendControlCommand } = require("./../../../../utils/print")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.pay.collectInfo,
    langDialog: lang.dialog,
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    paid_total_money: '',
    btnName: lang.btnName,
    form: {},
    payStatusList: [],
    active: 2,
    steps: lang.pay.steps,
    status: 'pay',
    showPay: false,
    printDeviceInfo: null,
    arrears_money_sum: '', //欠费
    printInfo: '', // 缴费单信息打印内容
    print_type: '',
    last_reading:'', // 本次读数
    is_Printreturn: true,
    is_Invoicereturn: true,
    // 打印机纸张宽度，我用的打印几的纸张最大宽度是384，可以修改其他的
    paperWidth: 384,
    canvasWidth: 1,
    canvasHeight: 1,
    img: '',
    printing: false,
    is_T: false,
    is_yujiao: '', // 'automatica' 预缴
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang
    const {
      imageUrl,
      reading,
      total_money,
      total_water,
      order_no,
      wm_no,
      wm_name,
      last_reading,
      up_id,
      check_time_text,
      is_T,
      now_time,
      months,
      is_yujiao
    } = options
    let arr = [];
    let payStatusList = JSON.parse(options.payStatusList);
    arr.push(payStatusList[1])
    this.setData({
      form: {
        imageUrl,
        reading,
        total_money,
        total_water,
        order_no,
        wm_no,
        wm_name,
        up_id,
        last_reading,
        check_time_text,
        now_time,
        months,
      },
      is_T: is_T == 'true'?true:false,
      payStatusList: arr,
      lang: lang.pay.collectInfo,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      steps: lang.pay.steps,
      bluetoolthDevice: lang.admin.bluetoolthDevice,
      is_yujiao
    })
  },
  onShow(){
    
  },
  // 新改版  获取用户待缴费金额接口 
  getArrearsMoneySum(n){
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
        const payWayList = Object.keys(res.data.pay_way).map(i => ({
          text: res.data.pay_way[i].title,
          key: res.data.pay_way[i].key
        }))
      this.setData({
        last_reading,
        last_time,
        arrears_money_sum,
        // arrears_money_sum: Math.abs(arrears_money_sum),
        payStatusList: payWayList
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
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
  onConfirmPay(e) {
    const {
      text,
      key
    } = e.detail.value
    const up_id = this.data.form.up_id
    const params = {
      up_id,
      pay_way: key
    }
    payWater(params).then(res => {
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
  // 缴费单
  blueToothPrint(){
    this.setData({
      print_type: 'printInfo'
    })
    this.getUserBluetoolthInfoData();
         
  },

   // 发票
   blueToothInvoice(){
     wx.navigateTo({
       url:  `/pages/user-total-info/index?wm_no=${this.data.form.wm_no}&wm_name=${this.data.form.wm_name}&source=search-person&is_yujiao=${this.data.automatica}`,
     })
  },
 
  handlePrint(p) {
    let that = this;
    let print_type = that.data.print_type;
    console.log(111)
    let is_yujiao = that.data.is_yujiao;
    if(print_type == 'printInfo'){
      if(is_yujiao == 'automatica'){
        let automatica_title =`
Factura Automatica`;
        let automatica_value = {
          "printType": 0,
          "text": encodeURIComponent(automatica_title) + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 26,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        };
        p.data.splice(-1, 0, automatica_value);
      }
      console.log('开始打印，传信息...');
      that.SendControlCommand(p);
      // console.log('打印成功...')
      //   wx.showToast({
      //     title: lang.blueToolth.printSuccess,
      //     icon: "none",
      //     duration: 3000,
      //   })
    }
  },
  //输入实缴金额
  handleInputMoney(e){
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
  // 获取用户打印信息
  getUserBluetoolthInfoData(){
    let that = this;
    const params = {
      wm_no: that.data.form.wm_no,
    }
    if(that.data.print_type == 'printInfo'){
      //缴费单
      if( !that.data.is_Printreturn ){
        return
      }
      that.setData({
        is_Printreturn: false
      })
    }
   
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      console.log(userBluetoolthInfoData)
      let date = that.handleTimeValue();
      let user_type_price = userBluetoolthInfoData.user_type.price; // 用户类型单价
      let total_water = that.data.form.total_water;
      let sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100).toFixed(2); // 污水量
      let sewage_rate_price =  Number(Number(sewage_rate_num) * Number(user_type_price)).toFixed(2); // 污水价格
   
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
Factura Simplificada N° ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].order_no:''}

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
        let pagamento_pagamento =`
limite de pagamento: ${this.getMoreDay(15)}`;
        let printInfo_valores =`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager`;    
        let printInfo_time =`
Processado por programaválido n31.1/AGT20
${date.time}

`;
        let printData = {
          "name": "printMix", //普通纸混合打印
          "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
          "runOnNewThread": true, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
          "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
          "data": [
            {
              "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
              "text":  encodeURIComponent(printInfo_title)+ "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
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
              "text": encodeURIComponent(printInfo_title_1) + "\n",
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
              "text": encodeURIComponent(printInfo_Comsumidor) + "\n",
              "concentration": 15,
              "align": 0,
              "lineHeight": 32,
              "isDoubleHeight": false, 
              "isDoubleWidth": false,
              "isUnderLine": 0,
              "isBold": true, //加粗；
            },
            {
              "printType": 0,
              "text": encodeURIComponent(printInfo_CustomerData) + "\n",
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
              "text": encodeURIComponent(printInfo_historyData_title) + "\n",
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
              "text": encodeURIComponent(printInfo_historyData_info) + "\n",
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
              "text": encodeURIComponent(printInfo_facturacao_title) + "\n",
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
              "text": encodeURIComponent(printInfo_facturacao_info) + "\n",
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
              "text": encodeURIComponent(printInfo_TOTAL) + "\n",
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
              "text": encodeURIComponent(pagamento_pagamento) + "\n",
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
              "text": encodeURIComponent(printInfo_valores) + "\n",
              "concentration": 15,
              "align": 1,
              "lineHeight": 34,
              "isDoubleHeight": false, 
              "isDoubleWidth": false,
              "isUnderLine": 0,
              "isBold": false,
            },
            {
              "printType": 0,
              "text": encodeURIComponent(printInfo_time) + "\n",
              "concentration": 15,
              "align": 1,
              "lineHeight": 26,
              "isDoubleHeight": false, 
              "isDoubleWidth": false,
              "isUnderLine": 0,
              "isBold": false,
            },
          ]
        }
        console.log('初始信息：',printData)
        that.setData({
          is_Printreturn: true,
        })
        setTimeout(() =>{
          that.handlePrint(printData)
        },100)
        
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
    that.setData({
      is_Printreturn: true,
    })
  },
  // 添加编码
  addUserPayLogNumber(n){
    let that = this;
    let p = {
      id: that.data.id,
      type: n,  // 1:收据编码 2:发票编码 3:取消收据编码 4:取消发票编码
    }
    // 获取编码
    addUserPayLogNumber(p).then(res => {

    }).catch(e => {
      console.log(e)
    })
  },
  // 4.修改打印收据状态
  setReceiptStatus (){
    let that = this;
    setReceiptStatus({
      id: that.data.id,
      receipt_status: 2,  // 1:未开具 2:已开具 3:已取消
    }).then(res => {
      if(res.code == 200){
        // 添加编码
        that.addUserPayLogNumber(1);
      }
    }).catch(res => {
      wx.hideToast()
    })
  },
  // 5.修改发票状态
  setInvoiceStatus(){
    let that = this;
    setInvoiceStatus({
      id: that.data.user_PayFees_info.id,
      invoice_status: 2,  // 1:未开具 2:已开具 3:已取消
    }).then(res => {
      if(res.code == 200){
        // 添加编码
        that.addUserPayLogNumber(2);
      }
    }).catch(res => {
      wx.hideToast()
    })
  },
  // 新打印机打印方法
  SendControlCommand(printData) {
    let that = this;
    let bluetoolthDevice = that.data.bluetoolthDevice;
    // 判断是否有设备SN码
    let terminalNo = wx.getStorageSync('terminalNo');
    if(!terminalNo || terminalNo == ''){
      wx.showModal({
        title: bluetoolthDevice.equipmentNumber,
        editable: true, // 开启输入框
        placeholderText: bluetoolthDevice.pleaseequipmentNumber, // 输入框提示文字
        success(res) {
          if (res.confirm) {
            // 用户点击确定后，通过res.content获取输入的内容
            console.log('设备SN码：', res.content)
            wx.setStorageSync('terminalNo',res.content);
            app.globalData.terminalNo = res.content;
            that.SendControlCommand_1(printData);
          }
        }
      })
      return
    }else{
      that.SendControlCommand_1(printData);
    }
  },
  SendControlCommand_1(printData){
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
        terminalNo: wx.getStorageSync('terminalNo'),
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
          that.getOrderInfo(res.data.data[0].orderId);
        }else{
          wx.showToast({
            title: 'error',
            icon: "none",
            duration: 3000,
          })
        }
        that.setData({
          is_Printreturn: true,
        })
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('err...',err)// 控制台打印完整错误，方便排查
        that.setData({
          is_Printreturn: true,
        })
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