import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'

export const settings: SettingSchemaDesc[] = [
  {
    key: 'propertyName',
    type: 'string',
    default: 'asset-path',
    title: 'Property Name',
    description:
      'If indicated, the specified property name will be used to show the path to the asset that was OCR-ed. If blank, no property will be created.',
  },
]
