export interface ProcessedImage {
  original: string
  processed: string
  canvas?: HTMLCanvasElement
  requiresManualEdit?: boolean
}

export interface BrushSettings {
  size: number
  mode: "restore" | "erase"
}

export interface BackgroundRemoverConfig {
  model?: "small" | "medium"
  output?: {
    format: "image/png" | "image/jpeg"
    quality?: number
  }
}
