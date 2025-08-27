import { removeBackground, preload, type Config } from "@imgly/background-removal"
import type { ProcessedImage, BackgroundRemoverConfig } from "./types"

export class BackgroundRemoverCore {
  private static instance: BackgroundRemoverCore
  private isInitialized = false

  static getInstance(): BackgroundRemoverCore {
    if (!BackgroundRemoverCore.instance) {
      BackgroundRemoverCore.instance = new BackgroundRemoverCore()
    }
    return BackgroundRemoverCore.instance
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log("[v0] Initializing @imgly/background-removal...")

      const config: Config = {
        debug: true,
        model: "isnet_fp16", // Use the default medium quality model
        proxyToWorker: false, // Disable web workers to fix MIME type issues in v0 environment
        output: {
          format: "image/png",
          quality: 0.8,
          type: "foreground",
        },
      }

      // Preload the model and assets
      await preload(config)
      this.isInitialized = true
      console.log("[v0] Background removal service initialized successfully")
    } catch (error) {
      console.error("[v0] Failed to initialize background removal:", error)
      throw error
    }
  }

  async removeBackground(imageFile: File | string, config: BackgroundRemoverConfig = {}): Promise<ProcessedImage> {
    try {
      console.log("[v0] Starting background removal with @imgly/background-removal")

      await this.initialize()

      const originalUrl = typeof imageFile === "string" ? imageFile : URL.createObjectURL(imageFile)

      // Configure @imgly/background-removal
      const imglyConfig: Config = {
        debug: true,
        model: "isnet_fp16",
        proxyToWorker: false, // Disable web workers to prevent MIME type errors
        output: {
          format: "image/png",
          quality: 0.8,
          type: "foreground",
        },
        progress: (key: string, current: number, total: number) => {
          console.log(`[v0] Downloading ${key}: ${current} of ${total}`)
        },
      }

      // Use @imgly/background-removal to process the image
      const resultBlob = await removeBackground(imageFile, imglyConfig)
      const processedUrl = URL.createObjectURL(resultBlob)

      console.log("[v0] Background removal completed successfully with AI")

      return {
        original: originalUrl,
        processed: processedUrl,
      }
    } catch (error) {
      console.error("[v0] Error with @imgly/background-removal:", error)

      console.log("[v0] Falling back to manual editing mode")
      const originalUrl = typeof imageFile === "string" ? imageFile : URL.createObjectURL(imageFile)

      return {
        original: originalUrl,
        processed: originalUrl,
        requiresManualEdit: true,
      }
    }
  }

  private async clientSideBackgroundRemoval(imageBase64: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple background removal: detect edges and remove uniform background
        const backgroundColor = this.detectBackgroundColor(data, canvas.width, canvas.height)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // If pixel is similar to background color, make it transparent
          const colorDistance = Math.sqrt(
            Math.pow(r - backgroundColor.r, 2) +
              Math.pow(g - backgroundColor.g, 2) +
              Math.pow(b - backgroundColor.b, 2),
          )

          if (colorDistance < 50) {
            // Threshold for background detection
            data[i + 3] = 0 // Make transparent
          }
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob"))
          }
        }, "image/png")
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageBase64
    })
  }

  private async simpleBackgroundRemoval(imageBase64: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Create a subtle vignette effect to simulate background removal
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          Math.max(canvas.width, canvas.height) / 2,
        )
        gradient.addColorStop(0, "rgba(255,255,255,1)")
        gradient.addColorStop(0.7, "rgba(255,255,255,0.8)")
        gradient.addColorStop(1, "rgba(255,255,255,0)")

        ctx.drawImage(img, 0, 0)
        ctx.globalCompositeOperation = "destination-in"
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob"))
          }
        }, "image/png")
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageBase64
    })
  }

  private detectBackgroundColor(
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ): { r: number; g: number; b: number } {
    // Sample corners to detect background color
    const corners = [
      { x: 0, y: 0 },
      { x: width - 1, y: 0 },
      { x: 0, y: height - 1 },
      { x: width - 1, y: height - 1 },
    ]

    let totalR = 0,
      totalG = 0,
      totalB = 0

    corners.forEach((corner) => {
      const index = (corner.y * width + corner.x) * 4
      totalR += data[index]
      totalG += data[index + 1]
      totalB += data[index + 2]
    })

    return {
      r: Math.round(totalR / corners.length),
      g: Math.round(totalG / corners.length),
      b: Math.round(totalB / corners.length),
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  createEditableCanvas(imageUrl: string, width: number, height: number): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }

  applyBackgroundMask(canvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const resultCanvas = document.createElement("canvas")
    const resultCtx = resultCanvas.getContext("2d")
    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")

    if (!resultCtx || !ctx || !maskCtx) {
      throw new Error("Could not get canvas contexts")
    }

    resultCanvas.width = canvas.width
    resultCanvas.height = canvas.height

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
    const resultData = resultCtx.createImageData(canvas.width, canvas.height)

    // Apply mask to make background transparent
    for (let i = 0; i < imageData.data.length; i += 4) {
      const maskAlpha = maskData.data[i + 3] || 0

      if (maskAlpha > 128) {
        // Keep the pixel (mask is white/opaque)
        resultData.data[i] = imageData.data[i] // R
        resultData.data[i + 1] = imageData.data[i + 1] // G
        resultData.data[i + 2] = imageData.data[i + 2] // B
        resultData.data[i + 3] = imageData.data[i + 3] // A
      } else {
        // Remove the pixel (mask is black/transparent)
        resultData.data[i] = 0
        resultData.data[i + 1] = 0
        resultData.data[i + 2] = 0
        resultData.data[i + 3] = 0
      }
    }

    resultCtx.putImageData(resultData, 0, 0)
    return resultCanvas
  }

  downloadImage(canvas: HTMLCanvasElement, filename = "background-removed.png"): void {
    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, "image/png")
  }
}
