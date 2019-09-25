import './styles/main.scss'
import * as faceapi from 'face-api.js';
import { docReady } from './utils/docReady'
import { consoleArt } from './scripts/logo'

const axios = require('axios')

const MODEL_URL = './models'
const MTCNN_OPTIONS = { minFaceSize: 100 }


docReady( async () => { 
  const videoEl = document.getElementById('inputVideo');
  const canvas = document.getElementById('overlay');
  const ctx = canvas.getContext('2d');

  const statusDiv = document.getElementById('status')
  // const faceScoreDiv = document.getElementById('face-score')
  // const faceLabelDiv = document.getElementById('face-label')

  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
  await faceapi.loadMtcnnModel(MODEL_URL)  
  await faceapi.loadFaceRecognitionModel(MODEL_URL)

  statusDiv.innerHTML = 'Models loaded.'


  let res = await axios.get('/data.json')
  
  let labeledFaceDescriptors = await Promise.all(
      res.data.map(async elem => {
        let arr = new Float32Array( Object.values(elem._descriptors[0]) )
        return new faceapi.LabeledFaceDescriptors(elem._label, [arr])
      })
    )

  statusDiv.innerHTML = 'Face Descriptors loaded.'
  
  navigator.getUserMedia(
    { 
      video: {} 
    },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
  )
  
const options = new faceapi.MtcnnOptions(MTCNN_OPTIONS)
const maxDescriptorDistance = 0.6
const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)

statusDiv.innerHTML = 'Face Matcher loaded.'

const detect = async () => {
  statusDiv.innerHTML = 'Detecting...'
  
  const results = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks().withFaceDescriptors()

  if (results) {
    results.forEach(result => {      
      // faceScoreDiv.innerHTML = `face detected score: ${result.detection.score}`
      
      ctx.clearRect(0, 0, 640, 480)
      
      let dims = faceapi.matchDimensions(videoEl, canvas)
      let faceDescription = faceapi.resizeResults(result, dims)
      
      const matchResults = faceMatcher.findBestMatch(faceDescription.descriptor)
      const box = faceDescription.detection.box
      let text = matchResults.label
      
      if (text === 'unknown') {
        text = 'not chad'
      }

      // faceLabelDiv.innerHTML = `best match: ${text}`
    
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
  requestAnimationFrame(detect);
 }

  videoEl.onplay = detect

  consoleArt()
});
