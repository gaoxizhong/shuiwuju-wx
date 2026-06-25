// pages/maintenance/add-account/index.js
const app = getApp();
let lang = app.globalData.lang;
import {
  getLang
} from './../../../lang/index'
const pages = getCurrentPages()
const {
  wxAsyncApi,
} = require('./../../../utils/util')
import {
  addAccount,fbUserType
} from './../../../apis/water'
const blueToolth = require('./../../../utils/bluetoolth')
//只需要引用encoding.js,注意路径
var encoding = require("./../../../utils/encoding.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: getLang(),
    bluetoolthDevice: lang.admin.bluetoolthDevice,
    form: [],
    is_true:false,
    info_data: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const form = getLang().addAccount.form.map(i => ({
      ...i,
      value: ''
    }))
    this.setData({
      form
    })

  },
  onShow(){
    this.setData({
      lang: getLang(),
      bluetoolthDevice: lang.admin.bluetoolthDevice,

    })
    console.log(this.data.lang)
    // 获取价格类型
    this.getFbUserType();
  },
   // 获取价格类型
   getFbUserType() {
    fbUserType({}).then(res => {
      let list = JSON.stringify(res.data.data);
      wx.setStorageSync('fbUserType',list)
    }).catch((res) => {})
  },
  getFormInfo() {
    let that = this;
    wx.showToast({
      title: this.data.lang.message.loading,
      duration: 999999,
      icon: 'none'
    })
    const wixiForm = this.selectComponent('#add-form')
    if (!wixiForm) {
      wx.hideToast()
      return
    }
    const data = wixiForm.getFormData()
    if (data) {
      // let wm_no = data.wm_no;
      // let str = wm_no.substring(0,3);
      // if(data.user_type_id == 8){
      //   if(str !== '777'){
      //     wx.showToast({
      //       title: 'Serie do Contador: 777 início',
      //       icon: 'none'
      //     })
      //     return
      //   }
      // }
      // if(data.user_type_id == 9){
      //   if(str !== '888'){
      //     wx.showToast({
      //       title: 'Serie do Contador: 888 início',
      //       icon: 'none'
      //     })
      //     return
      //   }
      // }
      // if(data.user_type_id == 10){
      //   if(str !== '999'){
      //     wx.showToast({
      //       title: 'Serie do Contador: 999 início',
      //       icon: 'none'
      //     })
      //     return
      //   }
      // }
      if(!data.latitude){
        wx.showToast({
          title: 'Clique para localizar',
          icon: 'none'
        })
        return
      }
      addAccount(data).then(res => {
        wx.hideToast()
        wx.showToast({
          title: this.data.lang.message.success,
          icon: 'none',
          duration: 2000
        })
        that.setData({
          is_true: true,
          info_data: data
        })
      }).catch(res => {
        wx.hideToast()
      })
    } else {
      wx.hideToast()
      wx.showToast({
        title: this.data.lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
    }
  },
  clickYES(){
    let that = this;
    let info_data = this.data.info_data;
    console.log(info_data)
    // 获取价格类型
    let fbUserType = JSON.parse(wx.getStorageSync('fbUserType'));
    let user_type_id = info_data.user_type_id;
    let type = '';
    fbUserType.forEach( ele =>{
      if(ele.id == user_type_id){
        type = ele.type_name
      }
    })
    console.log(type)
    // 获取信息
    let title = `EPASKS-E.P.`;
    let title_1 = `
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com

N° Contador: ${info_data.wm_no}
Totalizador/Normal: ${info_data.is_share == 1?'Totalizador':'Normal'}
Unidades: ${info_data.household_num}
Localidade: ${info_data.area1} ${info_data.area2} ${info_data.area3} ${info_data.wm_address}
Nº de Porta: ${info_data.house_number}
Giro/Zona: ${info_data.area_code}
Leitura anterior: ${info_data.last_reading}kZ
Data de Registo: ${info_data.last_time}
Categoria: ${type}
Agua Residuais: ${info_data.sewage_rate}%
Comsumidor: ${info_data.wm_name}
NIF: ${info_data.user_card}
Telefone: ${info_data.wm_phone}
EMAIL: ${info_data.email}`;

    let valores = `
Water manager
Processado por programaválido n31.1/AGT20
${info_data.last_time}

`;
    let printData = {
      "name": "printMix", //普通纸混合打印
      "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
      "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
      "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
      "data": [
        {
          "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
          "text": encodeURIComponent(title) + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
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
          "text": encodeURIComponent(title_1) + "\n",
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
          "text": encodeURIComponent(valores) + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
      ]
    }

    this.SendControlCommand(printData);
   
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
  SendControlCommand_1(printData) {
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
  clickNO(){
    this.setData({
      is_true: false
    })
    const page = pages[pages.length - 2]
    wx.navigateBack({
      delta: page
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