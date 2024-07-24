export const checkImage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ['bmp', 'jpg', 'png', 'pbm', 'webp'].includes(ext ?? '')
}
