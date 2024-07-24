export const checkImage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ['bmp', 'jpeg', 'jpg', 'png', 'pbm', 'webp'].includes(ext ?? '')
}
