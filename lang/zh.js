const zh_lang = {
  // 错误码
  errorInfo: {
    10001: "当前蓝牙适配器不可用",
    10002: "没有找到指定设备",
    10003: "连接失败",
    10004: "没有找到指定服务",
    10005: "没有找到指定特征",
    10006: "当前连接已断开",
    10007: "当前特征不支持此操作",
    10008: "其余所有系统上报的异常",
    10009: "系统版本低于 4.3 不支持 BLE",
    10012: "连接超时",
    10013: "连接 deviceId 为空或者是格式不正确",
  },
  // 系统
  system: {
    name: '居民'
  },
  // 全部选项
  allOptions: {
    text: '全部',
    key: ''
  },
  // 通用message
  message: {
    loading: '加载中',
    scrollLoading: '下滑加载更多数据',
    noMoreEmpty: '暂无数据',
    success: '操作成功',
    fail: '操作失败',
    formWarning: '请输入完整的信息',
    info: '详情',
    deviceName: '设备权限'
  },
  // 弹框
  dialog: {
    confirmText: '确认',
    cancelText: '取消',
    refreshText: '刷新',
  },
  // 按钮
  btnName: {
    next: '下一步',
    updateName: '修改',
    submitName: '确认',
    cancelName: '取消',
    pay: '缴费',
    printOther: '打印收据',
    printOtherTwo: '补开收据',
    print: '打印缴费单',
    invoice: '打印发票',
    agree: '同意',
    disagree: '不同意',
    selectImg: '请选择图片',
    selectPop: '请选择'
  },
  // 蓝牙
  blueToolth: {
    title: '设备',
    onBlueAuth: '未获取蓝牙权限',
    onBlueAuthContent: '确认跳转至设置页面？',
    cancelText: '取消',
    confirmText: '确认',
    noConnect: '未连接到设备',
    noConnectWarning: "是否跳转设备连接页面？",
    connectDevice: '设备连接中...',
    connectSuccess: '设备连接成功',
    connectfail: '设备连接失败',
    cancel: '已取消',
    printSuccess: '打印成功'
  },
  // 时间选择器
  timeName: {
    today: '今日',
    lastDay: '昨天',
    theWeek: '本周',
    theMonth: '本月',
    lastMonth: '上月',
    sevenDay: '近七天',
    thirtyDay: '近三十天',
    year: "年",
    month: "月",
    day: "日",
  },
  // 首页
  index: {
    lang: '语言',
    searchBar: '请输入水表号',
    btnName: "搜索",

    descriptionEmpty: '搜索数据',
    noEmpty: '暂无数据',

    water: '用水量',
    money: '缴费金额',
    saldo: '账户余额',
    createTime: '查询时间',

    iconSearch: '用户查询',
    iconFunc: '功能',
    iconNotice: '停水公告',
    iconNoticeText: '暂无停水信息',
    wm_name: '用户名',
    historio: '历史记录',
    fecho: '交接班'
  },
  // 新增用户
  addAccount: {
    form: [{
        name: '水表号',
        placeholder: '请输入水表号',
        type: 'input',
        key: 'wm_no',
        maxlength: 10,
        required: true,
        is_button: true,
        orientation:'定位'
      },
      {
        name: '共有/独有',
        placeholder: '共有/独有',
        type: 'tot_sim',
        key: 'is_share',
        required: true
      },
      {
        name: '户数',
        placeholder: '户数',
        type: 'input',
        key: 'household_num',
        required: true,
      },
      {
        name: '地区',
        placeholder: '请选择地区',
        type: 'area',
        key: 'area1,area2,area3',
        required: true
      },
      {
        name: '详细地址',
        placeholder: '请输入详细地址',
        type: 'input',
        key: 'wm_address',
        required: true
      },
      {
        name: '门牌号',
        placeholder: '请输入门牌号',
        type: 'input',
        key: 'house_number',
        required: true
      },
      {
        name: '分区',
        placeholder: '请输入分区',
        type: 'area_code',
        key: 'area_code',
        required: true
      },
      {
        name: '初始读数',
        placeholder: '请输入初始读数',
        type: 'input',
        key: 'last_reading',
        required: true
      },
      {
        name: '上次读数时间',
        placeholder: '请选择上次读数时间',
        type: 'date',
        key: 'last_time',
        required: true
      },
      {
        name: '价格类型',
        placeholder: '请选择价格类型',
        type: 'priceType',
        key: 'user_type_id',
        required: true
      },
      {
        name: '是否有污水',
        placeholder: '是否有污水',
        type: 'sewage',
        key: 'sewage_rate',
        required: true
      },
      {
        name: '姓名',
        placeholder: '请输入姓名',
        type: 'input',
        key: 'wm_name',
        required: true
      },
      {
        name: '税号/身份证号',
        placeholder: '税号/身份证号',
        type: 'input',
        type_digit:'number',
        maxlength: 14,
        key: 'user_card',
        required: true
      },
      
      {
        name: '电话号码',
        placeholder: '请输入电话号码',
        type: 'input',
        key: 'wm_phone',
        required: true
      },
      {
        name: '邮箱',
        placeholder: '请输入邮箱',
        type: 'input',
        key: 'email',
        required: false
      },
    ],
    submit: '确认'
  },
  // 查表缴费
  pay: {
    steps: [{
        desc: '采集查表信息',
        activeIcon: 'success',
      },
      {
        desc: '确认采集信息',
        activeIcon: 'success',
      },
      {
        desc: '缴费、打印收据',
        activeIcon: 'success',
      },
    ],
    collectInfo: {
      title: '用水信息',
      wm_no: '水表号',
      wm_name: '用户名',
      last_water: '上次读数',
      reading: '本次读数',
      total_water: '用水量',
      months: '月份',
      total_money: '应缴金额',
      paid_total_money: '实缴金额',
      last_date:'上次抄表时间',
      now_date:'本次抄表时间',
      createDate: '查询时间',
      waterList: '照片',
      placeholder: '请输入',
      systemPlaceholder: '系统自动带出',
      btnName: "搜索",
      noData: "暂无数据",
      look: "查看附近用户"
    }
  },
  // 今日收费
  todaySummary: {
    todayNumber: '缴费单',
    todayMoney: '金额总数',
    cash: '现金',
    pos: 'POS机',
    itemWater: '用水量',
    itemMoney: '缴费金额',
    num: '个',
  },
  // 上报维修
  reportRepair: {
    form: [{
        name: '水表号',
        placeholder: '请输入',
        type: 'input',
        key: 'wm_no',
        required: false,
        error: false,
      },
      {
        name: '地区',
        placeholder: '请选择地区',
        type: 'area',
        key: 'area1,area2,area3',
        required: false,
        error: false,
      },
      {
        name: '详细地址',
        placeholder: '请输入详细地址',
        type: 'input',
        key: 'wm_address',
        required: false,
        error: false,
      },
    ],
    photo: '照片',
    placeholder: '请输入',
    type: '维修类型',
    remark: '情况',
  },
  // 维修
  maintenance: {
    phone: '电话号码',
    location: '地址',
    info: {
      title: '维修信息',
      status: '状态',
      name: '姓名',
      wm_no: '用户名',
      area: '地区',
      address: '详细地址',
      phone: '电话号码',
      report_pic: '照片',
      report_note: '情况',
      placeholder: "请输入"
    }
  },
  // 营业厅
  businessHall: {

  },
  // 财务经理
  financial: {
    tabs: {
      one: '现金',
      two: 'POS机',
      three: '银行',
    },
    totalNumber: '订单数',
    totalMoney: '缴费金额',
  },
  // 用水详情
  userWaterInfo: {
    title: '用水信息',
    wm_name: '用户名',
    wm_no: '水表号',
    last_water: '初始读数',
    reading: '本次读数',
    last_water_1:'末次读数',
    total_water: '用水量',
    total_money: '应缴金额',
    createDate: '查询时间',
    waterList: '照片',

    check_detail: '原因',
    placeholder: '请输入',
    pay_type: '支付方式',
    paid_total_money: '实缴金额',

  },
  // 功能列表
  func: {
    list: [{
        auth: 'L',
        key: '/img/index/add-account.png',
        title: '新增用户',
        color: '#6cbcfc',
        url: '/pages/query-water/add-account/index'
      },
      {
        auth: 'L',
        key: '/img/index/search-pay.png',
        title: '查表缴费',
        color: '#fc9c3c',
        url: '/pages/query-water/pay/collect-info/index'
      },
      {
        auth: 'L',
        key: '/img/index/today-summary.png',
        title: '今日收费',
        color: '#58cab4',
        url: '/pages/query-water/today-summary/index'
      },
      {
        auth: 'L',
        key: '/img/index/report-pepair.png',
        title: '请求维护',
        color: '#58cab4',
        url: '/pages/query-water/report-repair/index'
      },
      {
        auth: 'C',
        key: '/img/index/maintenance.png',
        title: '维修清单',
        color: '#fc9c3c',
        url: '/pages/maintenance/maintenance/index'
      },
      {
        auth: 'R',
        key: '/img/index/business-hall.png',
        title: '缴费和收据',
        color: '#58cab4',
        url: '/pages/business-hall/index/index',
      },
      {
        auth: 'CF',
        key: '/img/index/fm-search-account.png',
        title: '对账',
        color: '#6cbcfc',
        url: '/pages/financial-manager/search-account/index'
      },
      {
        auth: 'DG',
        key: '/img/index/gm-query-report.png',
        title: '查看报告',
        color: '#6cbcfc',
        url: '/pages/general-manager/query-report/index'
      },
      // addAccount: ['新增用户', '/pages/query-water/add-account/index'],
      // searchPay: ['查表缴费', '/pages/query-water/pay/collect-info/index'],
      // todaySummary: ['今日收费', '/pages/query-water/today-summary/index'],
      // reportRepair: ['请求维护', '/pages/query-water/report-repair/index'],
      // maintenance: ['维修清单', '/pages/maintenance/maintenance/index'],
      // businessHall: ['缴费和收据', '/pages/business-hall/index/index'],
      // fMSearchAccount: ['对账', '/pages/financial-manager/search-account/index'],
      // gMQueryReport: ['查看报告', '/pages/general-manager/query-report/index'],
    ]
  },
  // 我的
  admin: {
    name: '我的',
    meinfo: '员工认证',
    deviceItem: '我的设备',
    lang: '语言',
    employee: {
      name: '员工认证',
      form: [{
          name: '用户名',
          placeholder: '请输入',
          type: 'input',
          key: 'email',
          required: true,
          error: false
        },
        {
          name: '密码',
          placeholder: '请输入',
          type: 'password',
          key: 'password',
          required: true,
          error: false,
        },
        {
          name: '电话号码',
          placeholder: '请输入',
          type: 'input',
          key: 'mobile',
          error: false,
        },
      ],
      submit: '确认'
    },
    bluetoolthDevice: {
      connectDeviceTitle: '已连接设备',
      disConnectDeviceTitle: '待连接设备',
      noDevice: '未查询到设备',
      searching: '搜索附近设备中...',
      noSearchDevice: '暂无发现可用设备！',
      connectDeviceing: '设备连接中...',
      defaultDevice: '默认设备',
      isDefaultDevice: '是否将设置为常用设备？',
      success: '设备连接成功',
      fail: '设备连接失败',
      noDeviceBuleToolth: '未连接蓝牙设备'
    },
    setLang: {
      label: '设备语言',
      placeholder: '请选择'
    }
  },
  // tabber
  tabber: {
    list: [{
        no: 0,
        pagePath: "/pages/index/index",
        icon: 'home-o',
        text: "首页"
      },
      {
        no: 1,
        pagePath: "/pages/admin/index",
        icon: 'setting-o',
        text: "我的"
      }
    ]
  }
}

export default zh_lang