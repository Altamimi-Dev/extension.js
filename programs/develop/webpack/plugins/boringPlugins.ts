import fs from 'fs'
import path from 'path'
import type webpack from 'webpack'
import colors, {bold, blue, yellow} from '@colors/colors/safe'
import Dotenv from 'dotenv-webpack'
import CleanHotUpdatesPlugin from './CleanHotUpdatesPlugin'

import SpecialFoldersPlugin from './SpecialFoldersPlugin'
import {type DevOptions} from '../../extensionDev'

let statsHasRun = false
export default function boringPlugins(projectPath: string, {mode}: DevOptions) {
  const project = require(`${projectPath}/manifest.json`)
  const projectName = project.name
  const projectVersion = project.version

  return {
    constructor: {name: 'BoringPlugin'},
    apply: (compiler: webpack.Compiler) => {
      // Writes the project name and version to the terminal
      compiler.hooks.done.tap('BoringPlugin', (stats) => {
        const divider = stats.hasErrors()
          ? colors.red('✖︎✖︎✖︎')
          : colors.green('►►►')

        if (!statsHasRun) {
          stats.compilation.name = `🧩 Extension ${divider} ${projectName} (v${projectVersion})`
        }

        statsHasRun = true
      })

      // Plugin to add special folders (public, pages, scripts) to the extension
      new SpecialFoldersPlugin({
        manifestPath: path.join(projectPath, 'manifest.json')
      }).apply(compiler)

      // Support .env files
      if (
        fs.existsSync(path.join(projectPath, '.env')) ||
        fs.existsSync(path.join(projectPath, '.env.example')) ||
        fs.existsSync(path.join(projectPath, '.env.local')) ||
        fs.existsSync(path.join(projectPath, '.env.defaults'))
      ) {
        console.log(
          bold(
            `🧩 Extension ${blue('►►►')} ${projectName} (v${projectVersion}) `
          ) + `${bold(yellow('env'))} file loaded.`
        )

        new Dotenv({
          path: fs.existsSync(path.join(projectPath, '.env'))
            ? path.join(projectPath, '.env')
            : fs.existsSync(path.join(projectPath, '.env.local'))
              ? path.join(projectPath, '.env.local')
              : path.join(projectPath, '.env.example'),
          allowEmptyValues: true,
          defaults: fs.existsSync(path.join(projectPath, '.env.defaults')),
          systemvars: true
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        }).apply(compiler as any)
      }

      // Since we write files to disk, we need to clean up the hot updates
      // to avoid having a lot of files in the output folder.
      // TODO: cezaraugusto this has some issues with content scripts.
      new CleanHotUpdatesPlugin().apply(compiler)
    }
  }
}
