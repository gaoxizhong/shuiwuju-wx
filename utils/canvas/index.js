const query = {}
const wixiCanvas = {
  option: [],
  color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
  width: 0,
  height: 0,
  // 默认点坐标
  point: [25, 10],
  xDistance: 20,
  pointMax: [0, 0],
  // 默认y轴分成6等份
  itemGap: 6,
  yMax: 0,
  yI: -1,
  // x轴配置
  xAxis: {
    barWidth: 20,
    data: ['1', '2', '3', "4", "5", "6", "7"]
  },
  // 线配置
  lineStyle: {
    color: '#000',
    lineWidth: 1
  },
  init(id, option, data) {
    // 配置同步
    this.initOption(id, option)
    // y轴数据同步
    this.yI = -1
    this.initY(Math.max(...data))
    // 画图
    this.starCanvas(id, data)
  },
  // 配置同步
  initOption(id, option) {
    this.option[id] = Object.assign({}, this.option, option)
  },
  // y轴数据同步 获取数据最高位
  initY(num) {
    const newNum = parseInt(num / 10)
    this.yI += 1
    if (newNum > 10) {
      this.initY(newNum)
    } else {
      this.yMax = 10 ** this.yI * (newNum + 1) * this.itemGap
    }
  },
  // 画图
  starCanvas(id, data) {
    query[id] = wx.createSelectorQuery()
    query[id].select(id)
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        this.width = res[0].width
        this.height = res[0].height
        canvas.width = this.width * dpr
        canvas.height = this.height * dpr
        ctx.scale(dpr, dpr)
        // 点位置确认
        this.handlePonitPosition()
        ctx.beginPath()
        // 坐标轴配置
        if (['bar', 'line'].includes(this.option[id].type)) {
          this.initAxis(ctx, data)
          switch (this.option[id].type) {
            case 'bar':
              bar(ctx, data);
              break;
            case 'line':
              line(ctx, data);
              break;
          }
        } else if (this.option[id].type === 'pie') {
          pie(ctx, data);
        }
        ctx.closePath()
      })
  },
  // 点位置确认
  handlePonitPosition() {
    this.pointMax[0] = this.width - 5 // -5 离右边5
    this.pointMax[1] = this.height - this.xDistance - this.point[1]
  },
  // 画坐标轴
  initAxis(ctx, data) {
    ctx.fillStyle = '#333'
    ctx.strokeStyle = '#333'
    ctx.moveTo(this.point[0], this.point[1])
    ctx.lineTo(this.point[0], this.pointMax[1])
    ctx.lineTo(this.pointMax[0], this.pointMax[1])
    ctx.strokeStyle = this.lineStyle.color
    ctx.lineWidth = this.lineStyle.lineWidth
    ctx.stroke()
    let point = this.point[1]
    const num = this.yMax / this.itemGap
    const height = (this.pointMax[1] - this.point[1] - 20) / this.itemGap
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'end'
    // x轴标准
    ctx.beginPath()
    ctx.moveTo(this.point[0] - 4, this.point[1] + 4)
    ctx.lineTo(this.point[0], this.point[1])
    ctx.lineTo(this.point[0] + 4, this.point[1] + 4)
    ctx.stroke()
    // y轴标准
    ctx.beginPath()
    ctx.moveTo(this.pointMax[0] - 4, this.pointMax[1] - 4)
    ctx.lineTo(this.pointMax[0], this.pointMax[1])
    ctx.lineTo(this.pointMax[0] - 4, this.pointMax[1] + 4)
    ctx.stroke()
    for (let i = 0; i <= this.itemGap; i++) {
      point = i * height + this.point[1] + 20
      ctx.beginPath()
      ctx.strokeStyle = '#e8e4f4'
      if (i === this.itemGap) {
        ctx.strokeStyle = '#333'
      }
      ctx.moveTo(this.point[0], point)
      ctx.lineTo(this.pointMax[0], point)
      ctx.stroke()
      // 微调
      ctx.fillText((this.itemGap - i) * num, this.point[0] - 3, point)
    }
  }
}

const bar = (ctx, data) => {
  const dataLength = data.length
  const xAxis = wixiCanvas.xAxis
  const yToy = (wixiCanvas.pointMax[0] - wixiCanvas.point[0] - 20) / dataLength - xAxis.barWidth
  const defaultPonitY = wixiCanvas.point[1] + 20
  const yHeight = wixiCanvas.pointMax[1] - wixiCanvas.point[1] - 20
  for (let i = 0; i < dataLength; i++) {
    const x = yToy + i * (xAxis.barWidth + yToy) + wixiCanvas.point[0]
    const y = defaultPonitY + (wixiCanvas.yMax - data[i]) / wixiCanvas.yMax * yHeight
    ctx.fillStyle = wixiCanvas.color[0]
    ctx.fillRect(x, y, xAxis.barWidth, data[i] / wixiCanvas.yMax * yHeight);
    ctx.textBaseline = 'hanging'
    ctx.textAlign = 'center'
    // x轴 文字填充
    ctx.fillStyle = '#333'
    ctx.fillText(wixiCanvas.xAxis.data[i], x + xAxis.barWidth / 2, wixiCanvas.pointMax[1] + 5)
    // 柱状图上方文字
    ctx.textBaseline = 'bottom'
    ctx.fillText(data[i], x + xAxis.barWidth / 2, y)
  }
}

const line = (ctx, data) => {
  const dataLength = data.length
  const xAxis = wixiCanvas.xAxis
  const yToy = (wixiCanvas.pointMax[0] - wixiCanvas.point[0] - 20) / dataLength - xAxis.barWidth
  const defaultPonitY = wixiCanvas.point[1] + 20
  const yHeight = wixiCanvas.pointMax[1] - wixiCanvas.point[1] - 20
  ctx.beginPath()
  for (let i = 0; i < dataLength; i++) {
    const x = yToy + i * (xAxis.barWidth + yToy) + wixiCanvas.point[0]
    const y = defaultPonitY + (wixiCanvas.yMax - data[i]) / wixiCanvas.yMax * yHeight
    ctx.textBaseline = 'hanging'
    ctx.textAlign = 'center'
    if (i === 0) {
      ctx.moveTo(x, y)
    }
    ctx.lineTo(x, y)
    // x轴 文字填充
    ctx.fillStyle = '#333'
    ctx.fillText(wixiCanvas.xAxis.data[i], x + xAxis.barWidth / 2, wixiCanvas.pointMax[1] + 5)
    // 柱状图上方文字
    ctx.textBaseline = 'bottom'
    ctx.fillText(data[i], x + xAxis.barWidth / 2, y)
  }
  ctx.stroke()
}

const pie = (ctx, data) => {
  const cx = wixiCanvas.width / 2
  const cy = wixiCanvas.height / 2
  const r = wixiCanvas.width > wixiCanvas.heigh ? parseInt(wixiCanvas.heigh / 4) - 5 : parseInt(wixiCanvas.width / 4 ) - 5
  let startAngle = 0
  const num = data.reduce((total, i) => total + i)
  for (let i = 0; i < data.length; i++) {
    let endAngle = startAngle + data[i] / num * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, startAngle, endAngle, false)
    ctx.closePath()
    ctx.fillStyle = wixiCanvas.color[i]
    ctx.fill()
    startAngle = endAngle
  }
}
module.exports = wixiCanvas