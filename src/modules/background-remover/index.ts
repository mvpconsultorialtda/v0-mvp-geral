import { BackgroundRemoverCore } from "./core"
import { CanvasEditor } from "./canvas-editor"
export type { ProcessedImage, BrushSettings, BackgroundRemoverConfig } from "./types"

// Main API for easy usage
export const backgroundRemover = {
  core: BackgroundRemoverCore.getInstance(),
  createEditor: (canvas: HTMLCanvasElement, original: string, processed: string) =>
    new CanvasEditor(canvas, original, processed),
}
