const labels = ['katie']

const labeledFaceDescriptors = await Promise.all(
  labels.map(async label => {
    // fetch image data from urls and convert blob to HTMLImage element
    const imgUrl = './images/katie.png'
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

