import '@logseq/libs'
import { handlePopup } from './handle-popup'
import { settings } from './settings'
import { createWorker } from 'tesseract.js'
import { getBlob } from './helpers/get-blob'

const main = async () => {
  console.log('logseq-ocrtotext-plugin loaded')
  // Used to handle any popups
  handlePopup()

  await logseq.UI.showMsg(
    `logseq-ocrtotext-plugin: You will be required to select your assets directory to give the plugin permissiom to OCR the file`,
    'error',
  )

  // Create worker to be used for the life of the plugin
  const tessarectWorker = await createWorker('eng')
  const graph = await logseq.App.getCurrentGraph()

  logseq.Editor.registerBlockContextMenuItem('OCR Image', async (e) => {
    const block = await logseq.Editor.getBlock(e.uuid)
    if (!block) return

    const regex = /!\[.*?\]\(\.\.\/assets\/([^)]+)\)/
    const match = regex.exec(block.content)
    if (!match || !match[1]) {
      // TODO Need to match a list of image extensions
      await logseq.UI.showMsg('No image found in blob', 'error')
      return
    }

    const fileName = match[1]
    const blob = await getBlob(fileName)

    // Set loading state
    const loadingMsg = await logseq.UI.showMsg('Processing image...')
    try {
      const {
        data: { text },
      } = await tessarectWorker.recognize(blob)

      logseq.UI.closeMsg(loadingMsg)
      if (text) {
        await logseq.Editor.updateBlock(e.uuid, text)
        if (logseq.settings!.propertyName !== '') {
          await logseq.Editor.upsertBlockProperty(
            e.uuid,
            logseq.settings!.propertyName,
            `[${graph?.path}/assets/${fileName}](${graph?.path}/assets/${fileName})`,
          )
        }
      } else {
        await logseq.UI.showMsg('No text available')
        throw new Error('No text available')
      }
    } catch (error) {
      console.error(error)
      logseq.UI.showMsg(`Error processing image`, 'error')
      throw new Error('Error processing image')
    }
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
