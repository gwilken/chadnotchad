export const docReady = (cb) => {
  document.addEventListener("DOMContentLoaded", () => {
    cb()
  }) 
}
