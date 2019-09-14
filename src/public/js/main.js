const MODEL_URL = '/models'

const mtcnnForwardParams = {
  minFaceSize: 200
}

let prevBoxCoords = null

const videoEl = document.getElementById('inputVideo');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const options = new faceapi.MtcnnOptions(mtcnnForwardParams)


const onPlay = async () => {
  const results = await faceapi.detectSingleFace(videoEl, options)

  if (results) {
    ctx.clearRect(0, 0, 640, 480)  
    let dims = faceapi.matchDimensions(videoEl, canvas);
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(results, dims));
  }
  
  requestAnimationFrame(onPlay);
 }


const run = async () => {
  await faceapi.loadMtcnnModel(MODEL_URL);
  await faceapi.loadFaceRecognitionModel(MODEL_URL);
  
  navigator.getUserMedia(
    { 
      video: {} 
    },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
  )


  // const input = document.getElementById('image')
  // console.log(input)

  // const results = await faceapi.detectAllFaces(input)

  // console.log(results)

  // const canvas = document.getElementById('overlay')
  
  // faceapi.matchDimensions(canvas, input)
  // faceapi.draw.drawDetections(canvas, faceapi.resizeResults(results, input))

 
}

run()




















console.log(`                                                      
██████╗██╗  ██╗ █████╗ ██████╗ 
██╔════╝██║  ██║██╔══██╗██╔══██╗
██║     ███████║███████║██║  ██║
██║     ██╔══██║██╔══██║██║  ██║
╚██████╗██║  ██║██║  ██║██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
                                
███╗   ██╗ ██████╗ ████████╗    
████╗  ██║██╔═══██╗╚══██╔══╝    
██╔██╗ ██║██║   ██║   ██║       
██║╚██╗██║██║   ██║   ██║       
██║ ╚████║╚██████╔╝   ██║       
╚═╝  ╚═══╝ ╚═════╝    ╚═╝       
                                
 ██████╗██╗  ██╗ █████╗ ██████╗ 
██╔════╝██║  ██║██╔══██╗██╔══██╗
██║     ███████║███████║██║  ██║
██║     ██╔══██║██╔══██║██║  ██║
╚██████╗██║  ██║██║  ██║██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
happy birthday chad! g. wilken 2019`)
