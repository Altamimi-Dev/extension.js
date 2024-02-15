import path from 'path'
import utils from './utils'

export default function getFilename(
  feature: string,
  filepath: string,
  exclude: string[]
) {
  const entryExt = path.extname(filepath)

  // Do not attempt to rewrite the asset path if it's in the exclude list.
  const shouldSkipRewrite = utils.shouldExclude(filepath, exclude)

  const fileOutputpath = shouldSkipRewrite ? path.normalize(filepath) : feature

  if (['.js', '.jsx', '.tsx', '.ts'].includes(entryExt)) {
    return fileOutputpath.replace(entryExt, '.js')
  }

  if (['.html', '.njk', '.nunjucks'].includes(entryExt)) {
    return fileOutputpath.replace(entryExt, '.html')
  }

  if (['.css', '.scss', '.sass', '.less'].includes(entryExt)) {
    return fileOutputpath.replace(entryExt, '.css')
  }

  return fileOutputpath
}
