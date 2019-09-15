import './styles/main.scss'
import * as faceapi from 'face-api.js';
import { docReady } from './utils/docReady'
import { consoleArt } from './scripts/logo'

const MODEL_URL = './models'
const MTCNN_OPTIONS = { minFaceSize: 200 }

docReady( async () => { 
  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
  await faceapi.loadMtcnnModel(MODEL_URL)
  await faceapi.loadFaceRecognitionModel(MODEL_URL)

  const labels = ['katie', 'ben', 'anthony', 'marya', 'mel', 'vietnam', 'john', 'greg']

  const labeledFaceDescriptors = await Promise.all(
    labels.map(async label => {
      // fetch image data from urls and convert blob to HTMLImage element
      const imgUrl = `./images/${label}.jpg`
      const img = await faceapi.fetchImage(imgUrl)
      
      // detect the face with the highest score in the image and compute it's landmarks and face descriptor
      const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      
      if (!fullFaceDescription) {
        throw new Error(`no faces detected for ${label}`)
      }
      
      const faceDescriptors = [fullFaceDescription.descriptor]
      return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
    })
  )

  console.log(labeledFaceDescriptors)
  

  navigator.getUserMedia(
    { 
      video: {} 
    },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
  )
  
let prevBoxCoords = null

const videoEl = document.getElementById('inputVideo');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const options = new faceapi.MtcnnOptions(MTCNN_OPTIONS)
    
const maxDescriptorDistance = 0.6

const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)


const detect = async () => {
  const results = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks().withFaceDescriptors()

  if (results) {
    results.forEach(result => {
      ctx.clearRect(0, 0, 640, 480)
  
      
      
      let dims = faceapi.matchDimensions(videoEl, canvas)
      let faceDescription = faceapi.resizeResults(result, dims)
      
      const matchResults = faceMatcher.findBestMatch(faceDescription.descriptor)
      
      console.log(matchResults)

      faceapi.draw.drawDetections(canvas, faceDescription)
    })
  }
  requestAnimationFrame(detect);
 }

  videoEl.onplay = detect

  consoleArt()

});
