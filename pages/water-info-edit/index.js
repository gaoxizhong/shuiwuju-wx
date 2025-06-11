// pages/water-info-edit/index.js
const app = getApp()
let lang = app.globalData.lang
const {editWater} = require('./../../apis/business-hall')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    label: lang.waterInfoEdit,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    form: {},
    wm_no: '',
    wm_name: '',
    last_water: '',
    last_time: '',
    user_type: '',
    user_card: '',
    wm_phone: '',
    is_share: 0,
    household_num: 1,
    household_readonly: true,
    user_type_id: null,
    showSelectTime: false,
    showTotSim: false, // 共有/独有
    optionsTotSim:[ 
      { text: 'Normal', value: 0},
      {text: 'Totalizador', value: 1},
    ],
    totSimIndex: 0, // 默认 共有/独有 选项下标
    is_share_value: '',
    areavalue: '', // 地区
    showSelect: false,  // 地区弹窗
    columns: [],
    columnsIndex: [0, 0, 0],
    confirmIndex: [0, 0, 0],
    confirmValue: [0, 0, 0],
    wm_address: '', //详细地址
    house_number: '', //门牌号
    area_code: '', // 分区，
    showarea_code: false,
    optionsarea_code:[
      { text: '1',value: 1 }, 
      { text: '2',value: 2 },
      { text: '3', value: 3 }, 
      { text: '4', value: 4 },
      { text: '5', value: 5 }, 
      { text: 'A', value: 'A' },
      { text: 'B', value: 'B' },
      { text: 'C', value: 'C' },
      { text: 'D', value: 'D' }
    ],
    sewage_rate_value:'', // 污水
    showSewage: false, // 是否污水
    sewage_rate: '', // 选中的值
    optionsSewage: [
      { text: 'No',value: 0 },
      { text: 'Sim',value: 1 }, 
    ],
    email:'',
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}${lang.timeName.year}`;
      }
      if (type === 'month') {
        return `${value}${lang.timeName.month}`;
      }
      if (type === 'day') {
        return `${value}${lang.timeName.day}`;
      }
      return value;
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang;
    console.log(options)
    const form = JSON.parse(options.data);
    console.log(form)
    // 获取价格类型
    let fbUserType = JSON.parse(wx.getStorageSync('fbUserType'));
    let list = fbUserType.map(i => ({
      text: i.type_name,
      value: i.id
    }))
    let user_type_id = form.user_type_id;
    let type = '';
    list.forEach( ele =>{
      if(ele.value == user_type_id){
        type = ele.text
      }
    })
    let is_share_value = '';
    let is_share = form.is_share;
    let optionsTotSim = this.data.optionsTotSim;
    optionsTotSim.forEach( ele =>{
      if(ele.value == is_share){
        is_share_value = ele.text;
      }
    })
    if(is_share == 1){
      this.setData({
        household_readonly: false
      })
    }
    let optionsarea_code = this.data.optionsarea_code;
    let area_code = form.area_code;

    // 污水
    let sewage_rate = Number(form.sewage_rate);
    let optionsSewage = this.data.optionsSewage;
    this.setData({
      sewage_rate: sewage_rate > 0 ? 1 : 0,
      sewage_rate_value: sewage_rate > 0 ? 'Sim' : 'No',
      sewage_text: sewage_rate > 0 ? 1 : 0,
    })
    this.setData({
      label: lang.waterInfoEdit,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      form,
      wm_name: form.wm_name,
      wm_no: form.wm_no,
      last_water: Number(form.last_reading).toFixed(0),
      last_time: form.last_time,
      optionsPriceType: list,
      user_type: type,
      user_type_id,
      user_card: form.user_card,
      wm_phone: form.wm_phone,
      is_share: form.is_share,
      is_share_value,
      totSimIndex: form.is_share,
      household_num: form.household_num,
      areavalue: form.area1 + form.area2 + form.area3,
      wm_address: form.wm_address,
      house_number: form.house_number,
      area_code: form.area_code,
      email: form.email,
    })
    const area = app.globalData.area;
    console.log(area)
    const values1 = area.map(i => i.name); // 省
    const values2 = area[0].areas.map(i => i.name);  // 市
    const values3 = area[0].areas[0].areas.map(i => i.name); // 区
    let a_1 = '';
    let a_2 = '';
    let a_3 = '';
    let item_1 = [];
    let item_2 = [];
    area.forEach(ele =>{
      if(ele.name == form.area1){
        a_1 = ele.id;
        item_1 = ele.areas;
      }
    })
    item_1.forEach(ele =>{
      if(ele.name == form.area2){
        a_2 = ele.id;
        item_2 = ele.areas;
      }
    })
    item_2.forEach(ele =>{
      if(ele.name == form.area3){
        a_3 = ele.id;
      }
    })
    console.log(a_1);
    console.log(a_2);
    console.log(a_3);
    const columns = [{
      values: values1,
    }, {
      values: values2,
    }, {
      values: values3,
    }]

    this.setData({
      columns,
      area1: a_1,
      area2: a_2,
      area3: a_3,
    })
  },
  onOpenTimeSelect() {
    const value = this.data.last_time;
    this.setData({
      showSelectTime: true,
      currentDate: value ? new Date(value).getTime() : new Date().getTime()
    })
  },
  onCloseTimeSelect() {
    this.setData({
      showSelectTime: false,
    })
  },
  handleGetTime(e) {
    console.log(e)
    const date = new Date(e.detail)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const value = `${year}-${month > 10 ? month : '0' + month}-${day > 9 ? day : '0' + day}`
    this.setData({
      showSelectTime: false,
      last_time: value
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
  // 价格类型
  onPriceType(e){
    console.log(e)
    this.setData({
      showPriceType: true,
    })
  },
  // 价格类型弹窗确认
  handlePriceType(e){
    console.log(e)
    this.setData({
      user_type: e.detail.value.text,
      user_type_id: e.detail.value.value
    })
    this.onClosePriceType();
  },
  onClosePriceType() {
    this.setData({
      showPriceType: false
    })
  },
  // 共有、独有
  handleTotSim(e){
    if(e.detail.value.value == 0){ // 不共有
      this.setData({
        household_readonly: true,
      })
    }
    if(e.detail.value.value == 1){ // 共有
      this.setData({
        household_readonly: false,
      })
    }
    this.setData({
      is_share: e.detail.value.value,
      totSimIndex: e.detail.index,
      is_share_value: e.detail.value.text,
    })
    this.onCloseTotSim();
  },
  onTotSim(e){
    console.log(e)
    this.setData({
      showTotSim: true,
    })
  },
  onCloseTotSim() {
    this.setData({
      showTotSim: false
    })
  },
  // 地区
  onOpenSelect(e) {
    const area = app.globalData.area
    const picker = this.selectComponent('#wixi-area')
    const confirmIndex = this.data.confirmIndex
    if (picker) {
      confirmIndex.forEach((i, index) => {
        if (index === 0) {
          picker.setColumnValues(1, area[i].areas.map(i => i.name));
        } else if (index === 1) {
          picker.setColumnValues(2, area[confirmIndex[index - 1]].areas[i].areas.map(i => i.name));
        } else {
          setTimeout(() => {
            picker.setColumnIndex(index, i)
          }, 200)
        }
        picker.setColumnIndex(index, i)
      })
    }
    this.setData({
      showSelect: true,
      formIndex: e.currentTarget.dataset.index,
      columnsIndex: [...confirmIndex]
    })
  },
  onChangeSelect(e) {
    const area = app.globalData.area
    const {
      picker,
      index,
      value
    } = e.detail;
    if (index === 0) {
      const indexValue = value[index]
      const _columnsIndex = area.findIndex(i => i.name = indexValue)
      const columnsIndex = [_columnsIndex, 0, 0]
      this.setData({
        columnsIndex
      })
      // const _index = area[0].areas.findIndex(i => i.name === value[index])
      picker.setColumnValues(1, area[_columnsIndex].areas.map(i => i.name));
      picker.setColumnValues(2, area[_columnsIndex].areas[0].areas.map(i => i.name));
    } else if (index === 1) {
      const columnsIndex = this.data.columnsIndex
      const _index = area[columnsIndex[0]].areas.findIndex(i => i.name === value[index])
      columnsIndex[1] = _index
      columnsIndex[2] = 0
      this.setData({
        columnsIndex
      })
      picker.setColumnValues(2, area[columnsIndex[0]].areas[_index].areas.map(i => i.name));
    }

  },
  onConfirmSelect(e) {
    const {
      index,
      value
    } = e.detail
    console.log(e)
    const area = app.globalData.area;
    const confirmValue = this.data.confirmValue;
    const areavalue = value.join(',');
    console.log(area)
    index.forEach((i, _index) => {
      if (_index === 0) {
        confirmValue[_index] = area[i].id
      } else if (_index === 1) {
        confirmValue[_index] = area[index[0]].areas[i].id
      } else {
        confirmValue[_index] = area[index[0]].areas[index[1]].areas[i].id
      }
    })
    this.setData({
      confirmIndex: index,
      confirmValue,
      area1: confirmValue[0],
      area2: confirmValue[1],
      area3: confirmValue[2],
      areavalue,
    })
    this.onCloseSelect();
  },
  onCloseSelect() {
    this.setData({
      showSelect: false
    })
  },

  // 分区
  onarea_code(e){
    this.setData({
      showarea_code: true,
    })
  },
  onClosearea_code() {
    this.setData({
      showarea_code: false
    })
  },
  handlearea_code(e){
    this.setData({
      area_code: e.detail.value.value
    })
    this.onClosearea_code()
  },
    // 有无污水
    onSewage(e){
      this.setData({
        sewage_rate: 0,
        showSewage: false,
      })
      wx.nextTick(() => {
        // 回调函数会在当前同步任务完成后执行
        this.setData({
          sewage_rate: this.data.sewage_text,
          showSewage: true,
        })
      })
     
    },
    onCloseSewage() {
      this.setData({
        showSewage: false
      })
    },
    handleSewage(e){
      console.log(e)
      let text = e.detail.value.text;
      let value = e.detail.value.value;
      this.setData({
        sewage_rate_value: text,
        sewage_rate: value,
        sewage_text: value
      })
      this.onCloseSewage();
    },
  submitBtn(){
    let that = this;
    let form = that.data.form;
    let p = {
      wm_id: form.wm_id,
      wm_no:  that.data.wm_no,
      wm_name:  that.data.wm_name,
      last_time: that.data.last_time,
      last_reading: that.data.last_water,
      user_type_id: that.data.user_type_id,
      user_card: that.data.user_card,
      wm_phone: that.data.wm_phone,
      is_share: that.data.is_share,
      household_num: that.data.household_num,
      area1: that.data.area1,
      area2: that.data.area2,
      area3: that.data.area3,
      wm_address: that.data.wm_address,
      house_number:  that.data.house_number,
      area_code:  that.data.area_code,
      sewage_rate: that.data.sewage_rate,
      email: that.data.email,
    }
    editWater(p).then(res =>{
      if(res.code == 200){
        wx.showToast({
          title: lang.message.success,
        })
        setTimeout( () =>{
          wx.navigateBack({
            delta: 1
          })
        },1500)
      }else{
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      }
    }).catch(e =>{
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon: 'none'
      })
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
})