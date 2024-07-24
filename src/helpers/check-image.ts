export const checkImage = (fileName: string) => {
  const imgExtArray = ['bmp', 'jpg', 'png', 'pbm', 'webp']
  imgExtArray.forEach((ext) => {
    if (fileName.endsWith(ext)) return true
  })
  return false
}
