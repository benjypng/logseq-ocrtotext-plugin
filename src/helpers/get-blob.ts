export const getBlob = async (fileName: string): Promise<Blob> => {
  try {
    const dirHandle = await window.showDirectoryPicker()
    const fileHandle = await dirHandle.getFileHandle(fileName)
    const file = await fileHandle.getFile()
    return await file.arrayBuffer().then((buffer) => new Blob([buffer]))
  } catch (error) {
    console.error(error)
    await logseq.UI.showMsg('Error reading file', 'error')
    throw new Error('Error reading file')
  }
}
