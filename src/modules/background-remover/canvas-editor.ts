import type { BrushSettings } from "./types"

export class CanvasEditor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private maskCanvas: HTMLCanvasElement
  private maskCtx: CanvasRenderingContext2D
  private originalImageData: ImageData
  private isDrawing = false
  private brushSettings: BrushSettings = { size: 20, mode: "erase" }

  constructor(canvas: HTMLCanvasElement, imageUrl: string) {
    this.canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Could not get canvas context")
    this.ctx = ctx

    // Create mask canvas for tracking what to keep/remove
    this.maskCanvas = document.createElement("canvas")
    const maskCtx = this.maskCanvas.getContext("2d")
    if (!maskCtx) throw new Error("Could not get mask canvas context")
    this.maskCtx = maskCtx

    this.loadImage(imageUrl)
  }

  private async loadImage(imageUrl: string): Promise<void> {
    const img = await this.loadImageElement(imageUrl)

    this.canvas.width = img.width
    this.canvas.height = img.height
    this.maskCanvas.width = img.width
    this.maskCanvas.height = img.height

    // Draw original image
    this.ctx.drawImage(img, 0, 0)
    this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

    // Initialize mask as white (keep everything initially)
    this.maskCtx.fillStyle = "white"
    this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)
  }

  private loadImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  setBrushSettings(settings: Partial<BrushSettings>): void {
    this.brushSettings = { ...this.brushSettings, ...settings }
  }

  startDrawing(x: number, y: number): void {
    this.isDrawing = true
    this.draw(x, y)
  }

  draw(x: number, y: number): void {
    if (!this.isDrawing) return

    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    const canvasX = (x - rect.left) * scaleX
    const canvasY = (y - rect.top) * scaleY

    // Update mask based on brush mode
    this.maskCtx.save()
    this.maskCtx.globalCompositeOperation = "source-over"
    this.maskCtx.beginPath()
    this.maskCtx.arc(canvasX, canvasY, this.brushSettings.size / 2, 0, Math.PI * 2)

    if (this.brushSettings.mode === "erase") {
      this.maskCtx.fillStyle = "black" // Mark for removal
    } else {
      this.maskCtx.fillStyle = "white" // Mark to keep
    }

    this.maskCtx.fill()
    this.maskCtx.restore()

    // Apply mask to show preview
    this.applyMaskPreview()
  }

  private applyMaskPreview(): void {
    const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height)
    const maskData = this.maskCtx.getImageData(0, 0, this.maskCanvas.width, this.maskCanvas.height)

    // Apply mask to original image
    for (let i = 0; i < this.originalImageData.data.length; i += 4) {
      const maskValue = maskData.data[i] // Use red channel of mask

      if (maskValue > 128) {
        // Keep the pixel (mask is white)
        imageData.data[i] = this.originalImageData.data[i] // R
        imageData.data[i + 1] = this.originalImageData.data[i + 1] // G
        imageData.data[i + 2] = this.originalImageData.data[i + 2] // B
        imageData.data[i + 3] = this.originalImageData.data[i + 3] // A
      } else {
        // Remove the pixel (mask is black) - make transparent
        imageData.data[i] = 0
        imageData.data[i + 1] = 0
        imageData.data[i + 2] = 0
        imageData.data[i + 3] = 0
      }
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  stopDrawing(): void {
    this.isDrawing = false
  }

  reset(): void {
    // Reset mask to white (keep everything)
    this.maskCtx.fillStyle = "white"
    this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height)

    // Redraw original image
    this.ctx.putImageData(this.originalImageData, 0, 0)
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  getMaskCanvas(): HTMLCanvasElement {
    return this.maskCanvas
  }
}
