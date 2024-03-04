// pages/maintenance/add-account/index.js
const app = getApp();
import {
  getLang
} from './../../../lang/index'
const pages = getCurrentPages()
const {
  wxAsyncApi,
} = require('./../../../utils/util')
import {
  addAccount
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
    })
    console.log(this.data.lang)
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
      let wm_no = data.wm_no;
      let str = wm_no.substring(0,3);
      console.log(str)
      if(data.user_type_id == 8){
        if(str !== '777'){
          wx.showToast({
            title: 'Serie do Contador: 777 início',
            icon: 'none'
          })
          return
        }
      }
      if(data.user_type_id == 9){
        if(str !== '888'){
          wx.showToast({
            title: 'Serie do Contador: 888 início',
            icon: 'none'
          })
          return
        }
      }
      if(data.user_type_id == 10){
        if(str !== '999'){
          wx.showToast({
            title: 'Serie do Contador: 999 início',
            icon: 'none'
          })
          return
        }
      }
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
    let type = null;
    fbUserType.forEach( ele =>{
      if(ele.id == user_type_id){
        type = ele.type_name
      }
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
N° Contador: ${info_data.wm_no}
Totalizador/Normal: ${info_data.is_share == 1?'Totalizador':'Normal'}
Unidades: ${info_data.household_num}
Localidade: ${info_data.area1} ${info_data.area2} ${info_data.area3} ${info_data.wm_address}
Nº de Porta: ${info_data.house_number}
Giro/Zona: ${info_data.area_code}
Leitura anterior: ${info_data.last_reading}kZ
Data de Registo: ${info_data.last_time}
Categoria: ${info_data.type}
Agua Residuais: ${info_data.sewage_rate}%
Comsumidor: ${info_data.wm_name}
NIF: ${info_data.user_card}
Telefone: ${info_data.wm_name}
EMAIL: ${info_data.email}

`,
valores:`
Water manager
0000007/01180000/AGT/2023
${info_data.last_time}

    `
    })
  that.blueToothPrint();
   
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