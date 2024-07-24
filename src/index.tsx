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
    `Note: Select your assets directory
This step is needed to give the plugin permissions to read the file to OCR`,
    'warning',
  )

  // Create worker to be used for the life of the plugin
  const tessarectWorker = await createWorker('eng')

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
    const text = await tessarectWorker.recognize(blob)

    // Close loading state
    if (text) {
      logseq.UI.closeMsg(loadingMsg)
      console.log(text)
      // TODO: Convert text to block
    } else {
      logseq.UI.showMsg('Error processing image', 'error')
    }
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
