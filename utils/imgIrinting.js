     /**
* overwriteImageData 图片数据转 位图数据
* @param {object} data
* {
        width,//图片宽度
        height,//图片高度
        imageData,//Uint8ClampedArray
        threshold,//阈值, 越大，打印点数越多，图形越黑
}
*/

  function overwriteImageData(data) {
    console.log(data)

    function grayPixle(pix) {
      return pix[0] * 0.299 + pix[1] * 0.587 + pix[2] * 0.114;
    }
    let sendWidth = data.width,
      sendHeight = data.height;
    const threshold = data.threshold || 180;
    let sendImageData = new ArrayBuffer((sendWidth * sendHeight) / 8);
    sendImageData = new Uint8Array(sendImageData);
    let pix = data.data;
    const part = [];
    let index = 0;
    for (let i = 0; i < pix.length; i += 32) {
      //横向每8个像素点组成一个字节（8位二进制数）。
      for (let k = 0; k < 8; k++) {
        const grayPixle1 = grayPixle(pix.slice(i + k * 4, i + k * 4 + (4 - 1)));
        //阈值调整
        if (grayPixle1 > threshold) {
          //灰度值大于128位   白色 为第k位0不打印
          part[k] = 0;
        } else {
          part[k] = 1;
        }
      }
      let temp = 0;
      for (let a = 0; a < part.length; a++) {
        temp += part[a] * Math.pow(2, part.length - 1 - a);
      }
      //开始不明白以下算法什么意思，了解了字节才知道，一个字节是8位的二进制数，part这个数组存的0和1就是二进制的0和1，传输到打印的位图数据的一个字节是0-255之间的十进制数，以下是用相权相加法转十进制数，理解了这个就用上面的for循环替代了
      // const temp =
      //   part[0] * 128 +
      //   part[1] * 64 +
      //   part[2] * 32 +
      //   part[3] * 16 +
      //   part[4] * 8 +
      //   part[5] * 4 +
      //   part[6] * 2 +
      //   part[7] * 1;
      sendImageData[index++] = temp;
    }
    return {
      array: Array.from(sendImageData),
      width: sendWidth / 8,
      height: sendHeight,
    };
  }
    /**
 * 获取打印图片的指令
 *
 * @export
 * @param {object} options
 * {
    lineByLine, // 是否逐行打印，默认true
    }
  * @param {object} imageInfo overwriteImageData 得到的位图数据数组和宽高信息
    {
        array,
        width,
        height
    }
 */
function getImageCommandArray(imageInfo = {}) {
    const width = imageInfo.width;
    const h = imageInfo.height;
    let arr = imageInfo.array;
    const xl = width % 256;
    const xh = (width - xl) / 256;
    const yl = h % 256;
    const yh = (h - yl) / 256;
    //打印图片的十进制指令数组
    let command = [];
    let writeArray = [];
    command = command.concat([29, 118, 48, 0, xl, xh, yl, yh]);
    writeArray.push(command.concat(arr));
    return writeArray;
  }
   //4合1
   function convert4to1(res) {
    let arr = [];
		for (let i = 0; i < res.length; i++) {
			if (i % 4 == 0) {
				let rule = 0.29900 * res[i] + 0.58700 * res[i + 1] + 0.11400 * res[i + 2];
				if (rule > 200) {
					res[i] = 0;
				} else {
					res[i] = 1;
				}
				arr.push(res[i]);
			}
		}
		return arr;
  }
  //8合1
  function convert8to1(arr) {
    let data = [];
    for (let k = 0; k < arr.length; k += 8) {
      let temp = arr[k] * 128 + arr[k + 1] * 64 + arr[k + 2] * 32 + arr[k + 3] * 16 + arr[k + 4] * 8 + arr[k + 5] * 4 + arr[k + 6] * 2 + arr[k + 7] * 1
      data.push(temp);
    }
    return data;
  }
module.exports = {
  overwriteImageData,
  getImageCommandArray,
  convert4to1,
  convert8to1
}