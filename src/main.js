import './styles/main.scss'
import * as faceapi from 'face-api.js';
import { docReady } from './utils/docReady'
import { consoleArt } from './scripts/logo'

const axios = require('axios')

const MODEL_URL = './models'
const MTCNN_OPTIONS = { minFaceSize: 100 }


docReady( async () => { 
  chad()
  consoleArt()
})


const party = () => {
  const body = document.querySelector('body')
  body.classList.add('party-on')
}


const chad = async () => {
  const videoEl = document.getElementById('inputVideo');
  const canvas = document.getElementById('overlay');
  const ctx = canvas.getContext('2d');
  
  const statusDiv = document.getElementById('status')
  
  statusDiv.innerHTML = 'Model loading...'

  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
  await faceapi.loadMtcnnModel(MODEL_URL)  
  await faceapi.loadFaceRecognitionModel(MODEL_URL)

  let res = await axios.get('/data.json')

  statusDiv.innerHTML = 'Face Descriptors loading...'
  
  let labeledFaceDescriptors = await Promise.all(
      res.data.map(async elem => {
        let arr = new Float32Array( Object.values(elem._descriptors[0]) )
        return new faceapi.LabeledFaceDescriptors(elem._label, [arr])
      })
    )

  statusDiv.innerHTML = 'Connecting video...'
  
  navigator.getUserMedia(
    { 
      video: {} 
    },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
  )
  
statusDiv.innerHTML = 'Face matcher loading...'

const options = new faceapi.MtcnnOptions(MTCNN_OPTIONS)
const maxDescriptorDistance = 0.6
const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)


const detect = async () => {
  statusDiv.innerHTML = 'Are you Chad? Detecting...'
  
  const results = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks().withFaceDescriptors()

  let name;

  if (results) {
    results.forEach(result => {      
      ctx.clearRect(0, 0, 640, 480)
      
      let dims = faceapi.matchDimensions(videoEl, canvas)
      let faceDescription = faceapi.resizeResults(result, dims)
      
      const matchResults = faceMatcher.findBestMatch(faceDescription.descriptor)
      const box = faceDescription.detection.box
      let text = matchResults.label
      
      name = text.slice(0, -2)

      if (name !== 'chad') {
        text = `not chad - ${name}?`
      }

      const drawBox = new faceapi.draw.DrawBox(
        box, 
        { 
          label: text, 
          lineWidth: 2, 
          boxColor: 'yellow',
          drawLabelOptions: {
            fontColor: 'black',
            fontSize: 36,
            fontStyle: 'Pacifico',
            padding: 6
          } 
        }
      )

      drawBox.draw(canvas)
    })
  }

  if (name !== 'chad') {
    requestAnimationFrame(detect);
  } else {
    const body = document.querySelector('body')
    body.classList.add('chad-detected')
    statusDiv.innerHTML = 'It\'s Chad!' 

    setTimeout(() => {
      party()
    }, 2000)
  }
 }
  videoEl.onplay = detect
}
