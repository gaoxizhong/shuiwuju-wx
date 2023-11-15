// pages/query-water/status/print-info/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi, 
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
const GBK = require('./../../../../utils/gbk.min')
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
    is_return: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const {
      imageUrl,
      reading,
      total_money,
      total_water,
      wm_no,
      last_reading,
      up_id,
      payStatusList,
      check_time_text
    } = options
    this.setData({
      form: {
        imageUrl,
        reading,
        total_money,
        total_water,
        wm_no,
        up_id,
        last_reading,
        check_time_text
      },
      payStatusList: JSON.parse(payStatusList),
      // 打印内容
//       printInfo: `  
// EPAL CUANZA SUL WATER MANEGEMENT

// ${this.data.lang.wm_no}：${wm_no};
// ${this.data.lang.last_water}：${last_reading}（m³）;
// ${this.data.lang.reading}：${reading}（m³）;
// ${this.data.lang.total_water}：${total_water}（m³）;
// ${this.data.lang.total_money}：${total_money}（KZ）;


// `,
      lang: lang.pay.collectInfo,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      steps: lang.pay.steps,
    })
    this.getArrearsMoneySum(options.wm_no)
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
        last_reading
        } = res.data
         
      this.setData({
        arrears_money_sum: Math.abs(arrears_money_sum),
        last_reading
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
    const paid_total_money = this.data.paid_total_money
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
   new_onConfirmPay(e){
     let that =  this;
    const {
      text,
      key
    } = e.detail.value
    const form = that.data.form
    let date = that.handleTimeValue();
    const params = {
      wm_no: form.wm_no,
      total_money: that.data.paid_total_money,
      pay_way: key,
      pay_time: date.time
    }
    new_payWater(params).then(res => {
      that.setData({
        status: 'print',
        showPay: false
      })
      console.log('11')
      that.getUserBluetoolthInfoData();
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none'
      })
    })

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
  // 收据
  printWaterInfo(){
    this.setData({
      print_type: 'receiptInfo'
    })
    this.getUserBluetoolthInfoData(this.verifyBlueToothPrint);
  },
  // 发票
  blueToothInvoice(){
    this.setData({
      print_type: 'invoiceInfo'
    })
    this.getUserBluetoolthInfoData(this.verifyBlueToothPrint);
  },
  // 蓝牙设备打印
  verifyBlueToothPrint() {
    console.log('蓝牙设备打印')
    const connectStorage = wx.getStorageSync('connectDevice')
    const connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
    const lang = getApp().globalData.lang
    console.log(lang.blueToolth)
    console.log(connectDeviceInfo)
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
      wx.showToast({
        title: lang.blueToolth.connectDevice,
        icon: "none",
        duration: 30000,
      })
      this.handlePrint(connectDeviceInfo)

      // this.connectBlueToothDevice(connectDeviceInfo)
    }
  },
  connectBlueToothDevice({ deviceId, serviceId }) {
    wx.showToast({
      title: lang.blueToolth.connectDevice,
      icon: "none",
      duration: 30000,
    })
    blueToolth.createBLEConnection(deviceId).then(res => {
      console.log(res)
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
  handlePrint(p) {
    let print_type = this.data.print_type;
    let info = [];
    // 缴费单
    if(print_type == 'printInfo'){
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...GBK.encode(this.data.printInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...GBK.encode(this.data.printInfo_title_1),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.printInfo_CustomerData),
        ...blueToolth.printCommand.center,
        ...GBK.encode(this.data.printInfo_historyData_title),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.printInfo_historyData_info),
        ...blueToolth.printCommand.center,
        ...GBK.encode(this.data.printInfo_facturacao_title),
        ...blueToolth.printCommand.left,
        ...GBK.encode(this.data.printInfo_facturacao_info),
        ...blueToolth.printCommand.center,
        ...GBK.encode(this.data.printInfo_valores),
        ...blueToolth.printCommand.enter
      ]
    }
    blueToolth.writeBLECharacteristicValue({
      // ...this.data.printDeviceInfo,
      ...p,
      value: new Uint8Array(info).buffer,
      lasterSuccess() {
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: "none",
          duration: 3000,
        })
        //修改发票收据状态
        // this.setInvoiceStatus();
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
    if( !that.data.is_return ){
      return
    }
    that.setData({
      is_return: false
    })
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      let date = that.handleTimeValue();

      this.setData({
        printInfo_title:`EPASKS-E.P.`,
        printInfo_title_1:`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida Comandante Cassange - Zona 3 ETASumbe - Cuanza Sul - Angola
NIF:5601022917
Atendimento ao Cliente941648993
Comunicacao de Leituras941648993
Comunicacao de Roturas941648999
Falhas de Aqua 941648999
Email info.epasksagmail.com

Nota de Coberanca Nr 2023/29259

Dados do Cliente

          `,
        printInfo_CustomerData:`
Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address} ${userBluetoolthInfoData.water_meter.area_code}
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Nr Série: ${userBluetoolthInfoData.water_meter.user_code}
Giro/Zona: ${userBluetoolthInfoData.water_meter.household_num}

        `,
        printInfo_historyData_title:`
Histórico de Leituras
        `,
        printInfo_historyData_info:`
   Data       m3      Origem
--------------------------------
${userBluetoolthInfoData.user_payment[0].check_date}   ${userBluetoolthInfoData.user_payment[0].water}   ${userBluetoolthInfoData.user_payment[0].reading_user}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].water:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].water:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
--------------------------------
      `,
      printInfo_facturacao_title:`
Detalhes de Facturacao
      `,
      printInfo_facturacao_info:`
Contas de água ${this.data.form.total_water?this.data.form.total_water:0}(m3)
Domestico：${userBluetoolthInfoData.user_type?(userBluetoolthInfoData.user_type.range_min >= 10?'> 10':(userBluetoolthInfoData.user_type.range_min + '-' + userBluetoolthInfoData.user_type.range_max) ):''}
Tarifa Fixa Domestico  ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.rent_money:''}
Taxa Aguas Residuais (${userBluetoolthInfoData.water_meter.sewage_rate}%)
IVA(0%)
TOTAL GERAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:0} KZ

Data limite de pagamento: ${this.getMoreDay(15)}
      `,
      printInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
${date.time}

      `,
      })
      console.log(typeof f)
      if (typeof f == 'function'){
        return f()
      }
      setTimeout(()=>{
        that.setData({
          is_return: true
        })
      },1000)
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
    setTimeout(()=>{
      that.setData({
        is_return: true
      })
    },1000)
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
    setInvoiceStatus({id: that.data.id}).then(res => {
    
    }).catch(res => {
      wx.hideToast()
    })
  },
})