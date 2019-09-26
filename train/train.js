require('@tensorflow/tfjs-node')
const canvas = require('canvas')
const faceapi = require('face-api.js')
const fs = require('fs').promises;

const { Canvas, Image, ImageData, loadImage } = canvas

faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const run = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models')
  await faceapi.nets.mtcnn.loadFromDisk('./models')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models')

  console.log('models loaded.')

  const labels = [
    'chad-1',
    'chad-2',
    'chad-3',
    // 'chad-4',
    'chad-5',
    'chad-6',
    'chad-7',
    'chad-8',
    'greg-1',
    'john-1',
    'john-2',
    'john-3',
    'katie-1',
    'katie-2',
    'katie-3',
    'katie-4'
  ]

  const labeledFaceDescriptors = await Promise.all(
    labels.map(async label => {
      // fetch image data from urls and convert blob to HTMLImage element
      const imgPath = `./images/${label}.jpg`
      const img = await loadImage(imgPath)
      
      // detect the face with the highest score in the image and compute it's landmarks and face descriptor
      const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      
      if (!fullFaceDescription) {
        throw new Error(`no faces detected for ${label}`)
      }
      
      const faceDescriptors = [fullFaceDescription.descriptor]
      
      console.log(faceDescriptors)
      
      return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
    })
  )

    console.log(labeledFaceDescriptors)
    console.log('loaded.')

    const data = JSON.stringify(labeledFaceDescriptors)

    fs.writeFile('data.json', data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });

}

run()
