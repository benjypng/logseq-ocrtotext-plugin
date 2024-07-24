import '@logseq/libs'

import { createWorker } from 'tesseract.js'

import { handlePopup } from './handle-popup'
import { checkImage } from './helpers/check-image'
import { getBlob } from './helpers/get-blob'
import { settings } from './settings'

const main = async () => {
  console.log('logseq-ocrtotext-plugin loaded')
  // Used to handle any popups
  handlePopup()

  await logseq.UI.showMsg(
    `logseq-ocrtotext-plugin: 
You will be required to select your assets directory to give the plugin permissiom to OCR the file.
Only English is supported.`,
    'error',
  )

  // Create worker to be used for the life of the plugin
  const tessarectWorker = await createWorker('eng')
  const graph = await logseq.App.getCurrentGraph()
  const graphPath = graph?.path

  logseq.Editor.registerBlockContextMenuItem('OCR Image', async (e) => {
    const block = await logseq.Editor.getBlock(e.uuid)
    if (!block) return

    const regex = /!\[.*?\]\((.*?\/|.*?\\)?([\w-]+\.[a-zA-Z0-9]+)\)/
    const match = regex.exec(block.content)
    if (!match || !match[1] || !match[2]) {
      await logseq.UI.showMsg('Invalid path', 'error')
      return
    }

    const path = match[1]
    const fileName = match[2]
    if (!checkImage(fileName)) {
      await logseq.UI.showMsg(
        `Accepted extensions: bmp, jpg, jpeg, png, pbm, webp`,
        'error',
      )
      return
    }

    // Set loading state
    const loadingMsg = await logseq.UI.showMsg('Processing image...')
    try {
      let img
      if (path.startsWith('../assets/')) {
        img = await getBlob(fileName)
      } else {
        img = `${path}${fileName}`
      }

      const {
        data: { text },
      } = await tessarectWorker.recognize(img)

      logseq.UI.closeMsg(loadingMsg)
      if (text) {
        await logseq.Editor.updateBlock(e.uuid, text)
        if (logseq.settings!.propertyName !== '') {
          if (match[1].startsWith('../assets')) {
            await logseq.Editor.upsertBlockProperty(
              e.uuid,
              logseq.settings!.propertyName,
              `[${graphPath}/assets/${fileName}](${graphPath}/assets/${fileName})`,
            )
          } else {
            await logseq.Editor.upsertBlockProperty(
              e.uuid,
              logseq.settings!.propertyName,
              `[${match[1]}${fileName}](${match[1]}${fileName})`,
            )
          }
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
