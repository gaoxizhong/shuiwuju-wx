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
  getFbuserStatis,
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    const form = JSON.parse(options.data)
    lang = app.globalData.lang
    this.setData({
      wm_id: form.wm_id,
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
        form.user_bal = fmoney(form.water_mater.user_bal,2);
        that.setData({
          form
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
  
  // 打印信息
  imprimirInfo(){
    let that = this;
    let item = that.data.form;
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
Valor da factura: ${item.user_bal} KZ
`,
print_order_info: `
${that.data.startTime} - ${that.data.endTime}
Registro de pagamentos:
--------------------------------
${log_list?log_list:''}
--------------------------------
Total: ${item.user_pay_log_total_money_sum} KZ
Total em atraso: ${item.water_mater_arrears_money_sum} KZ
`,
valores:`
Water manager
Processado por programaválido n31.1/AGT20
DATA: ${date_time}

    `
    })
    that.blueToothPrint();
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