import axios from 'axios'
import myClassCourseRPList from './data.js'
import './Math.uuid.js'

let playduration
let pid
let index1 = 0
let index2 = 0

const headers = {
  Cookie: 'client_id=33400503; cmsloginCookie=CQmCrlD9Wy/asWRmEQ1ZLTVu6o0l7cuR^security:Hb/qnGMYVC0f0tml2BJpJw==^1; JSESSIONID=2777D29DF223D9D4158BAEA327E427E1; SL_G_WPT_TO=zh-CN; SL_GWPT_Show_Hide_tmp=1; SL_wptGlobTipTmp=1',
  Accountid: 'd4494ad1-912e-41b6-9f9a-545e58dc9ce7',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Host: 'hnzj.user.ghlearning.com',
  Origin: 'https://hnzj.user.ghlearning.com',
  Referer: 'https://hnzj.user.ghlearning.com/learning/index?myClassId=77315508-6bbb-4b64-8747-9f8bb316ae21',
  'Sec-Ch-Ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Content-Type': 'application/x-www-form-urlencoded'
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

  const watchInfo = { "vid": "206920462", "pid": pid, "playduration": playduration, "timestamp": new Date().valueOf() }
  const data = {
    myClassId: '77315508-6bbb-4b64-8747-9f8bb316ae21',
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
  const watchInfo = { "vid": "206920462", "pid": pid, "playduration": playduration, "timestamp": new Date().valueOf() }
  const data = {
    myClassId: '77315508-6bbb-4b64-8747-9f8bb316ae21',
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