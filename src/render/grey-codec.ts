const GREY: Record<number, number> = {
  0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 12, 7: 14, 8: 15,
}

export function rgbToGrey(r: number, g: number, b: number): number {
  const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  return GREY[Math.min(8, Math.floor(lum / 32))] ?? 0
}

export function encode4bitGrey(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData
  const out = new Uint8Array((width * height) / 2)
  let oi = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x += 2) {
      const i1 = (y * width + x) * 4
      const g1 = rgbToGrey(data[i1], data[i1 + 1], data[i1 + 2])
      let g2 = 0
      if (x + 1 < width) {
        const i2 = (y * width + x + 1) * 4
        g2 = rgbToGrey(data[i2], data[i2 + 1], data[i2 + 2])
      }
      out[oi++] = (g1 << 4) | g2
    }
  }
  return out
}

export function encodeRegion(full: ImageData, x: number, y: number, w: number, h: number): Uint8Array {
  const cropped = new ImageData(w, h)
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const si = ((y + row) * full.width + (x + col)) * 4
      const di = (row * w + col) * 4
      cropped.data[di] = full.data[si]
      cropped.data[di + 1] = full.data[si + 1]
      cropped.data[di + 2] = full.data[si + 2]
      cropped.data[di + 3] = full.data[si + 3]
    }
  }
  return encode4bitGrey(cropped)
}

/** G2 green phosphor palette → grey levels that read well on glasses. */
export const C = {
  bg: '#000000',
  dim: '#3a7a3a',
  mid: '#5ee85e',
  bright: '#9fff9f',
  rule: '#4a9a4a',
} as const
