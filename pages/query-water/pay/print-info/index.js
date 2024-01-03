// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi
} = require('./../../../../utils/util')
const blueToolth = require('./../../../../utils/bluetoolth')
const {
  getArrearsMoneySum,
  new_payWater,
  payWater,
  printWater,
  getUserBluetoolthInfoData,
  setReceiptStatus,
  setInvoiceStatus
} = require('./../../../../apis/water')
//只需要引用encoding.js,注意路径
var encoding = require("./../../../../utils/encoding.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.pay.collectInfo,
    langDialog: lang.dialog,
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
    receiptInfo: '', // 收据信息打印内容
    invoiceInfo:'', // 发票打印内容
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
    is_T: false
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
      months
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
        months
      },
      is_T: is_T == 'true'?true:false,
      payStatusList: arr,
      lang: lang.pay.collectInfo,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      steps: lang.pay.steps,
    })
    // this.getArrearsMoneySum(options.wm_no)
    // 获取图片
    this.getLogoImage();
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
  //  新的确认支付
   new_onConfirmPay(){
     let that =  this;
    const form = that.data.form;
    let pay_success = that.data.pay_success;
    if(pay_success){
      that.getUserBluetoolthInfoData(that.verifyBlueToothPrint);
    }else{
      let date = that.handleTimeValue();
      const params = {
        wm_no: form.wm_no,
        total_money: form.total_money,
        pay_way: 2,
        pay_time: date.time,
        user_payment_id: that.data.up_id
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
        })
        // that.getArrearsMoneySum(form.wm_no);
        that.getUserBluetoolthInfoData(that.verifyBlueToothPrint);
      }).catch((res) => {
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      })
    }
   

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
  // printWaterInfo() {
  //   const up_id = this.data.form.up_id
  //   const params = {
  //     up_id,
  //   }
  //   printWater(params).then(res => {
  //     this.setData({
  //       status: 'over',
  //       showPay: false
  //     })
  //   }).catch((res) => {
  //     wx.showToast({
  //       title: res.desc,
  //       icon: 'none'
  //     })
  //   })
  // },
  // 缴费单
  blueToothPrint(){
    this.setData({
      print_type: 'printInfo'
    })
    this.getUserBluetoolthInfoData(this.verifyBlueToothPrint);
  },

   // 发票
   blueToothInvoice(){
    this.setData({
      print_type: 'invoiceInfo'
    })
    this.new_onConfirmPay();
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
    let info = [];
    // 发票
    if(print_type == 'invoiceInfo'){
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...that.arrEncoderCopy(that.data.invoiceInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...that.arrEncoderCopy(that.data.invoiceInfo_title_1),
        ...that.arrEncoderCopy(that.data.invoiceInfo_invoice_code),
        ...blueToolth.printCommand.left,
        ...that.arrEncoderCopy(that.data.invoiceInfo_CustomerData),
        ...blueToolth.printCommand.center,
        ...that.arrEncoderCopy(that.data.invoiceInfo_historyData_title),
        ...blueToolth.printCommand.left,
        ...that.arrEncoderCopy(that.data.invoiceInfo_historyData_info),
        ...blueToolth.printCommand.center,
        ...that.arrEncoderCopy(that.data.invoiceInfo_facturacao_title),
        ...blueToolth.printCommand.left,
        ...that.arrEncoderCopy(that.data.invoiceInfo_facturacao_info),
        ...blueToolth.printCommand.center,
        ...that.arrEncoderCopy(that.data.invoiceInfo_valores),
        ...blueToolth.printCommand.enter
      ]
    }
    // 缴费单
    console.log('printInfo: 拼接缴费单信息...')
    if(print_type == 'printInfo'){
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
        if(print_type == 'invoiceInfo'){
          that.setData({
            is_Printreturn: false
          })
           //修改发票收据状态
           that.setInvoiceStatus();
        }
       
      },
      onFail(res){
        console.log('打印失败...')
        console.log(res)
      }
    });
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
  getUserBluetoolthInfoData(f){
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
     if(that.data.print_type == 'invoiceInfo'){
      //发票
      if( !that.data.is_Invoicereturn ){
        return
      }
      that.setData({
        is_Invoicereturn: false
      })
    }
   
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      console.log(userBluetoolthInfoData)
      let date = that.handleTimeValue();
      let user_type_price = userBluetoolthInfoData.user_type.price; // 用户类型单价
      let total_water = that.data.form.total_water;
      let sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100).toFixed(2); // 污水量
      let sewage_rate_price =  Number(sewage_rate_num * user_type_price.toFixed(2)); // 污水价格
   
      let first_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_water:0;
      let first_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_price:0;
      let second_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_water:0;
      let second_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_price:0;
      let domestico_socio = Number(first_step_water * first_step_price).toFixed(2);
      let domestico_socio_2 = Number(second_step_water * second_step_price).toFixed(2);

      let months = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].months:0; // 月份
      let T_Fixa = Number(userBluetoolthInfoData.user_type.rent_money * months).toFixed(2);
      let consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示

      this.setData({
      // 发票
      invoiceInfo_title:`EPASKS-E.P.`,
      invoiceInfo_title_1:`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
        `,
        invoiceInfo_invoice_code:`
Factura/Recibo N°${that.data.invoice_code}

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
 Data       m³      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].check_date:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].water:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading_user:''}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].water:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].water:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `,
    invoiceInfo_facturacao_title:`Detalhes de Coberanca`,
    invoiceInfo_facturacao_info:`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
${userBluetoolthInfoData.user_type.is_constant == 0?
'Domestico：' + (userBluetoolthInfoData.user_type.range_min >= 10?'> 10':(userBluetoolthInfoData.user_type.range_min + '-' + userBluetoolthInfoData.user_type.range_max) )
+'                   Domestico socil: '+ first_step_water + '*'+ first_step_price +' = ' + domestico_socio 
+'    Domestico 2: '+ second_step_water + '* ' + second_step_price + ' = ' + domestico_socio_2
:''}
T.Fixa Domestico: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}
IVA(0%)
TOTAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:0} KZ

limite de pagamento: ${this.getMoreDay(15)}
`,
    invoiceInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
${date.time}

    `,
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

Factura Simplificada N° ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].order_no:''}

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
        `,
        printInfo_historyData_title:`
Histórico de Leituras
        `,
        printInfo_historyData_info:`
   Data       m³      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].check_date:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading_user:''}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `,
      printInfo_facturacao_title:`   Detalhes de Coberanca`,
      printInfo_facturacao_info:`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
${userBluetoolthInfoData.user_type.is_constant == 0?
'Domestico：' + (userBluetoolthInfoData.user_type.range_min >= 10?'> 10':(userBluetoolthInfoData.user_type.range_min + '-' + userBluetoolthInfoData.user_type.range_max) )
+'                   Domestico socil: '+ first_step_water + '*'+ first_step_price +' = ' + domestico_socio 
+'    Domestico 2: '+ second_step_water + '* ' + second_step_price + ' = ' + domestico_socio_2
:''}
T.Fixa Domestico: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}
IVA(0%) 
`,
      printInfo_TOTAL:`
TOTAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:userBluetoolthInfoData.water_meter.user_bal} KZ`,
      pagamento_pagamento:`
limite de pagamento: ${this.getMoreDay(15)}`,
      printInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
`,     
      printInfo_time:`
${date.time}

`,

      })
      setTimeout(()=>{
        that.setData({
          is_Printreturn: true,
          is_Invoicereturn: true,
        })
      },1000)
      console.log(typeof f)
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
    setTimeout(()=>{
      that.setData({
        is_Printreturn: true,
        is_Invoicereturn: true,
      })
    },1000)
  },
  // 获取图片
  getLogoImage(){
    const ctx = wx.createCanvasContext('secondCanvas');
    wx.getImageInfo({
      src: '../../../../img/epasks-logo.png',
      success: (res) => {
        console.log(res)
        // 打印宽度须是8的整数倍，这里处理掉多余的，使得宽度合适，不然有可能乱码
        const mw = this.data.paperWidth % 8;
        const w = mw === 0 ? this.data.paperWidth : this.data.paperWidth - mw;
        // 等比算出图片的高度
        const h = Math.floor((res.height * w) / res.width);
        // 设置canvas宽高
        this.setData({
          img: '../../../../img/epasks-logo.png',
          canvasHeight: h,
          canvasWidth: w,
        });
        // 在canvas 画一张图片
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.clearRect(0, 0, w, h);
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage('../../../../img/epasks-logo.png', 0, 0, w, h);
        ctx.draw(false, () => {
            wx.hideLoading();
        });
      },
      fail: (res) => {
        console.log('get info fail', res);
        wx.hideLoading();
      },
    })
  },
  

  // 4.修改打印收据状态
  setReceiptStatus (){
    let that = this;
    setReceiptStatus({id: that.data.id}).then(res => {
     
    }).catch(res => {
      wx.hideToast()
    })
  },
  // 5.修改发票收据状态
  setInvoiceStatus(){
    let that = this;
    setInvoiceStatus({id: that.data.user_PayFees_info.id}).then(res => {
    
    }).catch(res => {
      wx.hideToast()
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