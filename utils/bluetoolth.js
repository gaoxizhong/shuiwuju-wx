// 蓝牙操作
const {
  wxAsyncApi
} = require('./util');

const app = getApp()
let lang = app.globalData.lang
let blueToolthLang = lang.blueToolth

// 初始化蓝牙模块
function initBlueToolth() {
  lang = app.globalData.lang
  blueToolthLang = lang.blueToolth
  return new Promise((resolve, reject) => {
    wxAsyncApi('openBluetoothAdapter').then(res => {
      wxAsyncApi('startBluetoothDevicesDiscovery').then(res => {
        resolve()
      })
    }).catch(res => {
      openBuletoothSetting(resolve, reject)
    })
  })
}

function openBuletoothSetting(resolve, reject) {
  const lang = app.globalData.lang
  const blueToolthLang = lang.blueToolth
  wx.showModal({
    title: blueToolthLang.onBlueAuth,
    content: blueToolthLang.onBlueAuthContent,
    cancelText: blueToolthLang.cancelText,
    confirmText: blueToolthLang.confirmText,
    complete: (res) => {
      if (res.cancel) {
        reject('cancel')
      }
      if (res.confirm) {
        wxAsyncApi('openSetting').then((res) => {
          const bluetoothStatus = res.authSetting['scope.bluetooth']
          if (!bluetoothStatus) {
            openBuletoothSetting(resolve, reject)
          } else {
            resolve()
          }
        }).catch(res => {
          wx.showToast({
            icon: 'error',
            title: res.errMsg,
          })
        })
      }
    }
  })
}

// 开始监听周围蓝牙设备
function onBluetoothDeviceFound(fn) {
  wx.onBluetoothDeviceFound(function (res) {
    wxAsyncApi('getBluetoothDevices').then((res) => {
      const list = res.devices.filter(i => i.advertisServiceUUIDs && i.advertisServiceUUIDs.length && !i.name.includes('未知'))
      fn && fn(list)
    }).catch((res) => {
    });
  })
}

// 停止监听周围蓝牙设备
function stopBluetoothDevicesDiscovery() {
  return wxAsyncApi('stopBluetoothDevicesDiscovery')
}

// 开始连接蓝牙设备
function createBLEConnection(deviceId) {
  return wxAsyncApi('createBLEConnection', {
    deviceId,
    timeout: 20000
  })
}

// 获取蓝牙设备信息
function getBLEDeviceServices({
  deviceId,
  serviceId
}) {
  return new Promise((resolve, reject) => {
    wxAsyncApi('getBLEDeviceServices', {
      deviceId
    }).then(res => {
      const serviceIdList = res.services.map(i => i.uuid)
      serviceIdList.unshift(serviceId)
      getBLEDeviceCharacteristics(deviceId, serviceIdList, (info) => {
        resolve(info)
      }, () => {
        reject()
      })
    })
  })

}

// 获取蓝牙设备的uuid
function getBLEDeviceCharacteristics(deviceId, list, success, fail) {
  const serviceList = list
  const serviceId = serviceList.shift()
  if (serviceList.length) {
    wxAsyncApi('getBLEDeviceCharacteristics', {
      deviceId,
      serviceId
    }).then(res => {
      let finished = false;
      let write = false;
      let notify = false;
      let indicate = false;
      for (var i = 0; i < res.characteristics.length; i++) {
        if (!notify) {
          notify = res.characteristics[i].properties.notify;
        }
        if (!indicate) {
          indicate = res.characteristics[i].properties.indicate;
        }
        if (!write) {
          write = res.characteristics[i].properties.write;
        }
        if ((notify || indicate) && write) {
          success &&
            success({
              deviceId,
              serviceId,
              characteristicId: res.characteristics[i].uuid,
            });
          finished = true;
          break;
        }
      }
      if (!finished) {
        getBLEDeviceCharacteristics(deviceId, serviceList, success, fail);
      }
    }).catch(res => {
      getBLEDeviceCharacteristics(deviceId, serviceList, success, fail);
    })
  } else {
    fail && fail()
  }
}


function writeBLECharacteristicValue(options) {
  let byteLength = options.value.byteLength;
  //这里默认一次20个字发送
  const speed = options.onceByleLength || 20;
  if (byteLength > 0) {
    wx.writeBLECharacteristicValue({
      ...options,
      writeType: "write",
      value: options.value.slice(0, byteLength > speed ? speed : byteLength),
      success: function (res) {
        if (byteLength > speed) {
          writeBLECharacteristicValue({
            ...options,
            value: options.value.slice(speed, byteLength),
          });
        } else {
          options.lasterSuccess && options.lasterSuccess();
        }
      },
      fail: function (res) {
        options.onError && options.onError(res);
      },
      complete: function (res) {
        options.onError && options.onError(res);
      },
    });
  }
}

// 使用的 ESC/POS指令， 十进制方式
// 更多指令请查看 ./PrintCommandDocs/ESC-POS指令文档(凯盛诺打印机代表).pdf

const printCommand = {
  left: [27, 97, 0], //居左
  center: [27, 97, 1], //居中
  right: [27, 97, 2], //居右
  clear: [27, 64], //初始化
  enter: [10], //换行
  ct: [27, 33, 31], // 粗体开始
  ct_n: [27, 33, 30], // 粗体结束
  ct_zc: [27, 33, '00'], // 打印方式正常
};

// 错误表
const errorInfo = lang.errorInfo

module.exports = {
  initBlueToolth,
  onBluetoothDeviceFound,
  stopBluetoothDevicesDiscovery,
  createBLEConnection,
  getBLEDeviceServices,
  writeBLECharacteristicValue,
  printCommand,
  errorInfo
}