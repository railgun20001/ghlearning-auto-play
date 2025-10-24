import axios from 'axios'
import myClassCourseRPList from './data.js'
import './Math.uuid.js'

const vid = "302626008"
const myClassId = '141cc347-8951-4a23-97f7-3b1890b9804f'
const Cookie = 'JSESSIONID=FB83E216EB7DB182C350F7C2DB836D63; _ga=GA1.2.442463737.1761272129; _gid=GA1.2.388297229.1761272129; _ga_HJLQ16ZMWG=GS2.1.s1761272128$o1$g1$t1761272298$j60$l0$h0; client_id=72350559'
const Accountid = '7843f792-6882-4e62-ad8f-6223de7cf075'

let playduration
let pid
let index1 = 0
let index2 = 0

const headers = {
  Cookie: Cookie,
  Accountid: Accountid,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  Host: 'hnzj.user.ghlearning.com',
  Origin: 'https://hnzj.user.ghlearning.com',
  Referer: `https://hnzj.user.ghlearning.com/learning/index?myClassId=${myClassId}`,
  'Content-Type': 'application/x-www-form-urlencoded',
  'Sec-Ch-Ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
}

reset()

async function play() {
  if (!myClassCourseRPList[index1]) {
    console.log('没有更多视频了，重新开始')
    index1 = 0
    index2 = 0
    reset()
    return
  }
  if (!myClassCourseRPList[index1].videoRPs[index2]) {
    index1++
    index2 = 0
    console.log('下一课程', index1, index2)
    reset()
    return
  }

  const watchInfo = { "vid": vid, "pid": pid, "playduration": playduration, "timestamp": new Date().valueOf() }
  const data = {
    myClassId: myClassId,
    myClassCourseId: myClassCourseRPList[index1].myClassCourseId,
    myClassCourseVideoId: myClassCourseRPList[index1].videoRPs[index2].myClassCourseVideoId,
    watchInfo: JSON.stringify(watchInfo),
    isCalculateclassHourFlag: true,
  }
  console.log("cv.gson data", data, index1, index2)

  axios.post('https://hnzj.user.ghlearning.com/train/cms/my-video/cv.gson', data, {
    headers: headers
  }
  ).then(async (response) => {
    console.log('cv.gson response.data', response.data, index1, index2);
    console.log(`进度：第${index1 + 1}节，第${index2 + 1}课，${response?.data?.attribute?.data?.videoLearnRate}%`)
    if (response?.data?.attribute?.data?.videoLearnRate >= 100) {
      index2++
      console.log('下一课节', index1, index2)
      reset()
      return
    }
    if (response?.data?.attribute?.data?.respCode !== 'SUCCESS') {
      reset()
      return
    }
    setTimeout(() => {
      playduration = playduration + 20
      play()
    }, 20000);
  }).catch((error) => {
    console.log('cv.gson error', error, index1, index2);
    play()
  })
}

function reset() {
  if (!myClassCourseRPList[index1]) {
    console.log('没有更多视频了')
    index1 = 0
    index2 = 0
    reset()
    return
  }
  if (!myClassCourseRPList[index1].videoRPs[index2]) {
    index1++
    index2 = 0
    console.log('下一课程', index1, index2)
    reset()
    return
  }
  console.log('重置')
  playduration = 0
  pid = "BAIJIAYUN_" + Math.uuid().replace(/-/g, "")
  const watchInfo = { "vid": vid, "pid": pid, "playduration": playduration, "timestamp": new Date().valueOf() }
  const data = {
    myClassId: myClassId,
    myClassCourseId: myClassCourseRPList[index1].myClassCourseId,
    myClassCourseVideoId: myClassCourseRPList[index1].videoRPs[index2].myClassCourseVideoId,
    watchInfo: JSON.stringify(watchInfo),
    isCalculateclassHourFlag: true,
  }
  console.log("sv.gson data", data, index1, index2)
  return axios.post('https://hnzj.user.ghlearning.com/train/cms/my-video/sv.gson', data, {
    headers: headers
  }
  ).then((response) => {
    console.log('sv.gson response.data', response.data, index1, index2);
    setTimeout(() => {
      play()
    }, 5000);
  }).catch((error) => {
    console.log('sv.gson error', error, index1, index2);
    setTimeout(() => {
      reset()
    }, 5000);
  })
}