import {browser} from 'webextension-polyfill-ts'
;(browser.runtime.onMessageExternal as any).addListener(
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (request: any, _sender: any, sendResponse: any) => {
    const managementInfo = await new Promise(() => {
      browser.management.getSelf()
    })

    // Ping-pong between the user extension background page(this)
    // and the middleware socket client (reloadService.ts),
    // which will then send a message to the server
    // (startServer.ts) so it can display the extension info.
    if (request.initialLoadData) {
      sendResponse({
        id: browser.runtime.id,
        manifest: browser.runtime.getManifest(),
        management: managementInfo
      })
      return true
    }

    // Reload the extension runtime if the manifest or
    // service worker changes.
    if (
      request.changedFile === 'manifest.json' ||
      request.changedFile === 'service_worker' ||
      request.changedFile === '_locales'
    ) {
      setTimeout(() => {
        sendResponse({reloaded: true})
        browser.runtime.reload()
      }, 750)
    }

    // // Reload all tabs if the contextMenus code changes.
    // if (request.changedFile === 'contextMenus') {
    //   sendResponse({reloaded: true})
    //   browser.tabs.query({}, (tabs) => {
    //     if (!tabs) return
    //     tabs.forEach((tab) => browser.tabs.reload(tab.id!))
    //   })
    // }

    // Reload all tabs if the declarative_net_request code changes.
    if (request.changedFile === 'declarative_net_request') {
      sendResponse({reloaded: true})
      browser.runtime.reload()
    }

    return true
  }
)
