export const handleInsertProperty = async (
  graphPath: string,
  path: string,
  fileName: string,
  match: string[],
  uuid: string,
) => {
  if (logseq.settings!.propertyName !== '') {
    const content = path.startsWith('../assets')
      ? `[${graphPath}/assets/${fileName}](${graphPath}/assets/${fileName})`
      : `[${match[1]}${fileName}](${match[1]}${fileName})`

    await logseq.Editor.upsertBlockProperty(
      uuid,
      logseq.settings!.propertyName,
      content,
    )
  }
}
