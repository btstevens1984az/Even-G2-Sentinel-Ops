export const DISPLAY_W = 576
export const DISPLAY_H = 288

export const PANEL_W = 288
export const PANEL_H = 144

export const SPLASH_TILE_W = PANEL_W
export const SPLASH_TILE_H = PANEL_H

export const HUD_X = 0
export const HUD_Y = 0
export const HUD_W = DISPLAY_W
export const HUD_H = PANEL_H

export const MENU_X = 0
export const MENU_Y = PANEL_H
export const MENU_W = DISPLAY_W
export const MENU_H = PANEL_H

export const CONTAINER_IDS = {
  splashTL: 3,
  splashTR: 5,
  hud: 4,
  menu: 10,
} as const
