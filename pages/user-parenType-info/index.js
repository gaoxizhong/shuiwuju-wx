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
        that.setData({
          status: 'print',
          showPay: false,
          pay_success: true
        })
        that.getUserBluetoolthInfoData(that.blueToothPrint);
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
    this.payDemandNote();
  },
  // 点击历史姓名记录
  operatorLs(){
    this.setData({
      is_operatorLsPop: true
    })
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
      // this.connectBlueToothDevice(connectDeviceInfo)
      this.handlePrint(connectDeviceInfo)
    }
  },
  connectBlueToothDevice({
    deviceId,
    serviceId
  }) {
    wx.showToast({
      icon: "none",
      duration: 30000,
    })
    console.log('开始连接蓝牙设备')
    // 开始连接蓝牙设备
    blueToolth.createBLEConnection(deviceId).then(res => {
      // 连接蓝牙设备成功
      console.log('连接蓝牙设备成功')
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
          console.log(res)
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
        console.log('11')
        wx.hideToast()
        this.setData({
          printDeviceInfo: null,
        })
      }
    }).catch((res) => {
      console.log('连接蓝牙设备成功' + res)
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
  // 开始打印
  handlePrint(p) {
    let print_type = this.data.print_type;
    let info = [];
    // GBK.encode({string}) 解码GBK为一个字节数组
    //  收据
    if (print_type == 'receiptInfo') {
      info = [
        ...blueToolth.printCommand.clear,
        ...blueToolth.printCommand.center,
        // ...this.data.imgArr,
        ...blueToolth.printCommand.ct,
        ...this.arrEncoderCopy(this.data.receiptInfo_title),
        ...blueToolth.printCommand.ct_zc,
        ...this.arrEncoderCopy(this.data.receiptInfo_title_1),
        ...blueToolth.printCommand.left,
        ...this.arrEncoderCopy(this.data.receiptInfo_historyData),
        ...blueToolth.printCommand.center,
        ...blueToolth.printCommand.ct,
        ...this.arrEncoderCopy(this.data.receiptInfo_TOTAL),
        ...blueToolth.printCommand.ct_zc,
        ...this.arrEncoderCopy(this.data.receiptInfo_Pagamento),
        ...blueToolth.printCommand.left,
        ...this.arrEncoderCopy(this.data.receiptInfo_Modos),
        ...blueToolth.printCommand.center,
        ...this.arrEncoderCopy(this.data.receiptInfo_Saldo),
        ...blueToolth.printCommand.enter
      ]
    }
    console.log('开始打印，api传信息...')
    let n = 1;
    this.writeBLECharacteristicValue(p,info,n);
  },
  writeBLECharacteristicValue(data,i,n){
    let p = data;
    let info = i;
    let num = n; 
    let that = this;
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
          pay_way: '',
          pay_text: '',
          cheque_number: '',
        })
         // 5.修改发票收据状态
         that.setBillInvoiceCode();
        //  num++;
        //  if(num <= 2){
        //    that.writeBLECharacteristicValue(p,i,num);
        //  }
      },
      onFail(res) {
        console.log('打印失败...')
        console.log(res)
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
      that.setData({
        //收据
        receiptInfo_title: `EPASKS-E.P.`,
        receiptInfo_title_1: `
Empresa Publica de Aguas e Saneamento do Cuanza Su7Sul Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF: 5601022917
Dados do Cliente
Nome: ${userBluetoolthInfoData.water_meter.wm_name}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
Contribuinte: ${userBluetoolthInfoData.water_meter.user_card}

`,
        receiptInfo_historyData: `
DATA: ${itemInfo.pay_status == 1 ? that.data.itemInfo.pay_time:date.time}
`,
        receiptInfo_Pagamento: `
Modos de Pagamento
`,
        receiptInfo_Modos: `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}     AOA      ${that.data.total_money} KZ
--------------------------------
${that.data.pay_way == 4?"N* do Cheque: " +that.data.cheque_number : ''}
`,
        receiptInfo_Saldo: `
Saldo: ${userBluetoolthInfoData.water_meter.user_bal} KZ

Water manager
Processado por programaválido n31.1/AGT20
Este documento nao serve de fatura
IVA Regime Simplificado
Utilizador: ${that.data.operator_name}

--------------------------------
*Obrigado e volte sempre!*

`,
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


  // 获取图片
  async printImg() {
    let that = this;
    wx.getImageInfo({
      src: 'https://huanbaobi.oss-cn-beijing.aliyuncs.com/wx_shuiwuju/epasks-logo1.png',
      success: (res) => {
        var path = res.path;
        setTimeout(() => {
          const w = 116;
          const h = 120;
          // 设置canvas宽高
          that.setData({
            canvasHeight: w,
            canvasWidth: h,
          });
          //新版本的type 2d 获取方法
          const query = wx.createSelectorQuery();
          query.select('#shareCanvas')
          .fields({
            node: true,
            size: true
          })
          .exec(async (res_exec) => {
            const canvas = res_exec[0].node;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, w, h); //清空画板
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, w, h);
            //生成主图
            const mainImg = canvas.createImage();
            mainImg.src = res.path;
            mainImg.onload = (e) => {
              ctx.drawImage(mainImg, 0, 0,  w, h);
              const ctx11 = ctx.getImageData(0, 0, w, h);
              // const ctx11 = ctx.getImageData(0, 0, w*2,h*1.1);
              let arr = convert4to1(ctx11.data);
              let data = convert8to1(arr);
              const cmds = [].concat([29, 118, 48, 0, 35, 0, 100, 0], data, [27, 74, 3], [27, 64]);
            }
              
           
            // let arr = convert4to1(ctx11.data);
            // let data = convert8to1(arr);
            // let arrInfo = overwriteImageData(ctx11);
            // let arrInfo2 = getImageCommandArray(arrInfo)
            // console.log(arrInfo2[0])
            // that.setData({
            //   imgArr: arrInfo2[0]
            // })
          });
        }, 200)
      },
      fail: (res) => {
        console.log('get info fail', res);
        wx.hideLoading();
      },
    });
  },

})