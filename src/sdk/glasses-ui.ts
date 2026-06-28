import {
  CreateStartUpPageContainer,
  ImageContainerProperty,
  ImageRawDataUpdate,
  ImageRawDataUpdateResult,
  ListContainerProperty,
  ListItemContainerProperty,
  RebuildPageContainer,
  StartUpPageCreateResult,
  TextContainerProperty,
  TextContainerUpgrade,
  type EvenAppBridge,
} from '@evenrealities/even_hub_sdk'
import type { SplashTiles } from '../render/splash-renderer'
import {
  CONTAINER_IDS,
  HUD_H,
  HUD_W,
  HUD_X,
  HUD_Y,
  MENU_H,
  MENU_W,
  MENU_X,
  MENU_Y,
  PANEL_H,
  PANEL_W,
} from './layout'

export interface PageView {
  hudText: string
  listItems: string[]
}

/** HUD + list for tools, or banner art + skip list for splashes. */
export function createGlassesUi(bridge: EvenAppBridge) {
  let startupDone = false
  let imageReady = false
  let splashMode = false
  let renderChain: Promise<void> = Promise.resolve()
  let renderGen = 0
  let statusChain: Promise<void> = Promise.resolve()
  let pushChain: Promise<void> = Promise.resolve()

  function mainText(view: PageView): TextContainerProperty {
    return new TextContainerProperty({
      xPosition: HUD_X,
      yPosition: HUD_Y,
      width: HUD_W,
      height: HUD_H,
      borderWidth: 1,
      borderColor: 10,
      paddingLength: 4,
      containerID: CONTAINER_IDS.hud,
      containerName: 'hud',
      content: view.hudText.slice(0, 1000),
      isEventCapture: 0,
    })
  }

  function splashTile(id: number, name: string, x: number): ImageContainerProperty {
    return new ImageContainerProperty({
      xPosition: x,
      yPosition: HUD_Y,
      width: PANEL_W,
      height: PANEL_H,
      containerID: id,
      containerName: name,
    })
  }

  function buildList(items: string[], capture = true): ListContainerProperty | null {
    if (items.length === 0) return null
    return new ListContainerProperty({
      xPosition: MENU_X,
      yPosition: MENU_Y,
      width: MENU_W,
      height: MENU_H,
      borderWidth: 0,
      borderColor: 5,
      paddingLength: 0,
      containerID: CONTAINER_IDS.menu,
      containerName: 'menu',
      itemContainer: new ListItemContainerProperty({
        itemCount: items.length,
        itemWidth: 0,
        isItemSelectBorderEn: 1,
        itemName: items.map(i => i.slice(0, 64)),
      }),
      isEventCapture: capture ? 1 : 0,
    })
  }

  function pagePayload(view: PageView) {
    const texts = [mainText(view)]
    const list = buildList(view.listItems)
    const total = texts.length + (list ? 1 : 0)
    return {
      containerTotalNum: total,
      textObject: texts,
      imageObject: [] as ImageContainerProperty[],
      listObject: list ? [list] : [],
    }
  }

  function splashPayload(listItems: string[]) {
    const list = buildList(listItems)
    return {
      containerTotalNum: 2 + (list ? 1 : 0),
      textObject: [] as TextContainerProperty[],
      imageObject: [
        splashTile(CONTAINER_IDS.splashTL, 'splashTL', 0),
        splashTile(CONTAINER_IDS.splashTR, 'splashTR', PANEL_W),
      ],
      listObject: list ? [list] : [],
    }
  }

  async function pushSplashTiles(tiles: SplashTiles): Promise<void> {
    if (!imageReady) return
    const parts = [
      { id: CONTAINER_IDS.splashTL, name: 'splashTL', data: tiles.left },
      { id: CONTAINER_IDS.splashTR, name: 'splashTR', data: tiles.right },
    ]
    pushChain = pushChain.then(async () => {
      for (const part of parts) {
        try {
          const result = await bridge.updateImageRawData(new ImageRawDataUpdate({
            containerID: part.id,
            containerName: part.name,
            imageData: part.data,
          }))
          if (!ImageRawDataUpdateResult.isSuccess(result)) {
            console.warn(`[ui] ${part.name}:`, result)
          }
        } catch (err) {
          console.warn(`[ui] ${part.name} push failed`, err)
        }
      }
    })
    await pushChain
  }

  async function rebuild(view: PageView): Promise<void> {
    splashMode = false
    imageReady = false
    const gen = ++renderGen
    const payload = pagePayload(view)
    renderChain = renderChain.then(async () => {
      if (gen !== renderGen) return
      if (!startupDone) {
        const result = await bridge.createStartUpPageContainer(
          new CreateStartUpPageContainer(payload),
        )
        startupDone = true
        if (result !== StartUpPageCreateResult.success) {
          await bridge.rebuildPageContainer(new RebuildPageContainer(payload))
        }
      } else {
        await bridge.rebuildPageContainer(new RebuildPageContainer(payload))
      }
    })
    await renderChain
  }

  async function rebuildSplash(tiles: SplashTiles, listItems: string[]): Promise<void> {
    splashMode = true
    const gen = ++renderGen
    const payload = splashPayload(listItems)
    renderChain = renderChain.then(async () => {
      if (gen !== renderGen) return
      if (!startupDone) {
        const result = await bridge.createStartUpPageContainer(
          new CreateStartUpPageContainer(payload),
        )
        startupDone = true
        if (result !== StartUpPageCreateResult.success) {
          await bridge.rebuildPageContainer(new RebuildPageContainer(payload))
        }
      } else {
        await bridge.rebuildPageContainer(new RebuildPageContainer(payload))
      }
      imageReady = true
      await pushSplashTiles(tiles)
    })
    await renderChain
    for (let i = 0; i < 3 && splashMode; i++) {
      await new Promise(r => setTimeout(r, 120))
      await pushSplashTiles(tiles)
    }
  }

  async function refreshSplash(tiles: SplashTiles, listItems: string[]): Promise<void> {
    if (!splashMode) {
      await rebuildSplash(tiles, listItems)
      return
    }
    await pushSplashTiles(tiles)
  }

  async function updateHud(text: string): Promise<void> {
    if (!startupDone || splashMode) return
    statusChain = statusChain.then(async () => {
      try {
        await bridge.textContainerUpgrade(new TextContainerUpgrade({
          containerID: CONTAINER_IDS.hud,
          containerName: 'hud',
          content: text.slice(0, 2000),
        }))
      } catch (err) {
        console.warn('[ui] hud upgrade failed', err)
      }
    })
    await statusChain
  }

  return {
    init: (view: PageView) => rebuild(view),
    refresh: (view: PageView) => rebuild(view),
    refreshSplash,
    updateHud,
    isSplashMode: () => splashMode,
  }
}
