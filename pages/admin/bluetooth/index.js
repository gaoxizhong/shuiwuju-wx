// index.js
const blueToolth = require('../../../utils/bluetoolth')
const pages = getCurrentPages()
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi
} = require('./../../../utils/util')
Page({
  data: {
    lang: lang.admin.bluetoolthDevice,
    langDialog: lang.dialog,
    isConnect: false,
    defaultAvatarUrl: '',
    deviceList: [],
    conncetDevice: {},
    unconncetedDeviceList: [],
    printDeviceInfo: {},
    origin: 'tabber'
  },
  onChooseAvatar(e) {
    const {
      avatarUrl
    } = e.detail
    this.setData({
      avatarUrl,
    })
  },
  onLoad: function (options) {
    let that = this;
    lang = app.globalData.lang
    that.setData({
      origin: options.origin || 'tabber',
      lang: lang.admin.bluetoolthDevice,
      langDialog: lang.dialog,
    })
    wxAsyncApi('getFuzzyLocation').then(res =>{
      console.log('getFuzzyLocation: res')
      console.log(res)

    }).catch(fail =>{
      console.log('getFuzzyLocation: fail')
      console.log(fail)
    })
    // wx.getFuzzyLocation({
    //   type: 'wgs84',
    //   success (res) {
    //     console.log(res)
    //   },
    //   complete (res) {
    //     console.log(res)
    //   },
    //  })
     console.log(wx.getStorageSync('connectDevice'))
     if(wx.getStorageSync('connectDevice')){
     let connectDevice = JSON.parse(wx.getStorageSync('connectDevice'));
      this.setData({
        printDeviceInfo: {},
        conncetDevice: connectDevice,
      })
    }else{
      // that.getblueToolth();
    }
     
  },
  // 返回上一个页面
  goBack() {
    const page = pages[pages.length - 1]
    wx.navigateBack({
      delta: page
    })
  },
  getblueToolth(){
    let that = this;
    blueToolth.initBlueToolth().then(() => {
      blueToolth.onBluetoothDeviceFound(that.getDevice)
      wx.showToast({
        title: that.data.lang.searching,
        icon: "none",
        duration: 10000,
        mask: true,
      })
      setTimeout(() => {
        blueToolth.stopBluetoothDevicesDiscovery().then(() => {
          if (!that.data.deviceList.length) {
            wx.showToast({
              title: that.data.lang.noSearchDevice,
              icon: "none",
              duration: 3000,
            })
          }
        }).catch(res => {
          const msg = res.errMsg.split('fail')[1]
          wx.showToast({
            title: msg,
            icon: "none",
            duration: 3000,
            mask: true,
          })
        })
      }, 10000)
    }).catch((res) => {
      if (that.data.origin === 'page') {
        that.goBack()
      } else {
        wx.switchTab({
          url: "/pages/admin/index",
          success(res) {
            wx.setNavigationBarTitle({
              title: lang.admin.name,
            })
          },
          fail(res) {
          }
        })
      }
    })
  },
  getDevice(devices) {
    console.log(devices)
    const foreverStorage = wx.getStorageSync('foreverDevice')
    const connectStorage = wx.getStorageSync('connectDevice')
    const foreverDevice = foreverStorage ? JSON.parse(foreverStorage).deviceId : ''
    const connectDevice = connectStorage ? JSON.parse(connectStorage).deviceId : ''
    // 优先级点击连接的设备高于常用设备
    this.setData({
      deviceList: devices,
      unconncetedDeviceList: devices,
    })
    if (!this.data.isConnect && connectDevice) {
      const item = devices.find(i => i.deviceId === connectDevice)
      if (item) {
        blueToolth.stopBluetoothDevicesDiscovery()
        return this.chooseDevice(null, connectDevice)
      }
    }
    if (!this.data.isConnect && foreverDevice) {
      const item = devices.find(i => i.deviceId === foreverDevice)
      if (item) {
        blueToolth.stopBluetoothDevicesDiscovery()
        return this.chooseDevice(null, foreverDevice)
      }
    }
  },
  chooseDevice(e, flag) {
    const deviceId = flag || e.currentTarget.dataset.id;

    if (deviceId) {
      const item = this.data.deviceList.find(i => i.deviceId === deviceId)
      if (!item) {
        return
      }
      wx.showToast({
        title: this.data.lang.connectDeviceing,
        icon: "none",
        duration: 30000,
      })
      blueToolth.createBLEConnection(deviceId).then(res => {
        console.log(res)
        if (res.errMsg && res.errMsg.includes('ok')) {
          const serviceId = item.advertisServiceUUIDs[0]
          blueToolth.getBLEDeviceServices({
            deviceId,
            serviceId
          }).then(data => {
            wx.hideToast()
            console.log(data)
            if (!flag) {
              wx.showModal({
                title: this.data.lang.defaultDevice,
                content: this.data.lang.isDefaultDevice,
                cancelText: lang.dialog.cancelText,
                confirmText: lang.dialog.confirmText,
                complete: (res) => {
                  if (res.confirm) {
                    wx.setStorageSync('foreverDevice', JSON.stringify({
                      deviceId,
                      serviceId
                    }))
                  }
                  wx.showToast({
                    title: this.data.lang.success,
                    icon: "none",
                    duration: 3000,
                  })
                }
              })
            }
            wx.setStorageSync('connectDevice', JSON.stringify({
              deviceId,
              serviceId,
              characteristicId:data.characteristicId,
              name: item.name
            }))
            console.log(wx.getStorageSync('connectDevice'))
            console.log(item)
            this.setData({
              isConnect: true,
              conncetDevice: item,
              printDeviceInfo: data,
              unconncetedDeviceList: this.data.deviceList.filter(i => i.deviceId !== deviceId)
            })
          }).catch((res) => {
            wx.hideToast()
            wx.showToast({
              title: this.data.lang.fail,
              icon: "none",
              duration: 3000,
            })
            this.setData({
              printDeviceInfo: {}
            })
          })

        } else {
          wx.hideToast()
        }
      }).catch((res) => {
        console.log(res)
        console.log(wx.getStorageSync('connectDevice'))
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
      
        
      })
    }
  },
  unChooseDevice() {
    this.setData({
      unconncetedDeviceList: this.data.deviceList,
      conncetDevice: {}
    })
  },
})