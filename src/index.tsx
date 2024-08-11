import '@logseq/libs'

import { createWorker, OEM, PSM } from 'tesseract.js'

import { handlePopup } from './handle-popup'
import { checkImage } from './helpers/check-image'
import { getBlob } from './helpers/get-blob'
import { settings } from './settings'
import { handleInsertProperty } from './helpers/handle-property'

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
  const tessarectWorker = await createWorker('eng', OEM.LSTM_ONLY)
  tessarectWorker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    preserve_interword_spaces: '1',
    user_defined_dpi: '70',
  })
  const graph = await logseq.App.getCurrentGraph()
  const graphPath = graph?.path

  logseq.Editor.registerBlockContextMenuItem('OCR Image', async (e) => {
    const block = await logseq.Editor.getBlock(e.uuid)
    if (!block) return

    const regex = /!\[(.*?)\]\((.*?)\)/
    const match = regex.exec(block.content)

    if (!match || !match[2]) {
      console.error('logseq-ocrtotext-plugin', match)
      await logseq.UI.showMsg('Invalid path. Check logs.', 'error')
      return
    }

    const path = match[2]
    const fileName = path.split('/').pop()
    if (!fileName) {
      console.error('logseq-ocrtotext-plugin', match)
      await logseq.UI.showMsg('Invalid path. Check logs.', 'error')
      return
    }

    if (!checkImage(fileName)) {
      await logseq.UI.showMsg(
        `Accepted extensions: bmp, jpg, jpeg, png, pbm, webp`,
        'error',
      )
      return
    }

    const loadingMsg = await logseq.UI.showMsg('Processing image...')
    try {
      let img
      if (path.startsWith('../assets/')) {
        img = await getBlob(fileName)
      } else {
        img = `${path}${fileName}`
      }

      try {
        const {
          data: { text },
        } = await tessarectWorker.recognize(img)

        if (logseq.settings!.replaceText) {
          // Replaces image with text

          await logseq.Editor.updateBlock(e.uuid, text)

          await handleInsertProperty(graphPath!, path, fileName, match, e.uuid)
        } else {
          // Inserts text as a child block

          const blk = await logseq.Editor.insertBlock(e.uuid, text, {
            before: false,
            sibling: false,
          })

          await handleInsertProperty(
            graphPath!,
            path,
            fileName,
            match,
            blk!.uuid,
          )
        }
      } catch (error) {
        console.error(error)
        logseq.UI.showMsg(`Error processing image`, 'error')
        throw new Error('Error processing image')
      }

      logseq.UI.closeMsg(loadingMsg)
    } catch (error) {
      console.error(error)
      logseq.UI.showMsg(`Error processing image`, 'error')
      throw new Error('Error processing image')
    }
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
