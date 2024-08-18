import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'

export const settings: SettingSchemaDesc[] = [
  {
    key: 'propertyName',
    type: 'string',
    default: '',
    title: 'Property Name',
    description:
      'If indicated, the specified property name will be used to show the path to the asset that was OCR-ed. If blank, no property will be created.',
  },
  {
    key: 'replaceImage',
    type: 'boolean',
    default: false,
    title: 'Replace Image',
    description:
      'If indicated, the image will be replaced with the text. If not, the text will be inserted as a child block.',
  },
]
