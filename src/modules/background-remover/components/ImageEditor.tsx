"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { CanvasEditor } from "../canvas-editor"
import { Download, RotateCcw, Paintbrush, Eraser, Sparkles } from 'lucide-react'
import type { BrushSettings, ProcessedImage } from "../types"

interface ImageEditorProps {
  processedImage: ProcessedImage
  onDownload: (canvas: HTMLCanvasElement) => void
  onClose: () => void
}

export function ImageEditor({ processedImage, onDownload, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [editor, setEditor] = useState<CanvasEditor | null>(null)
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    size: 20,
    mode: "erase",
  })
  const [showManualTools, setShowManualTools] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      const imageToEdit = processedImage.requiresManualEdit ? processedImage.original : processedImage.processed
      const canvasEditor = new CanvasEditor(canvasRef.current, imageToEdit)
      setEditor(canvasEditor)
      
      setShowManualTools(!!processedImage.requiresManualEdit)
    }
  }, [processedImage])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editor) {
      editor.startDrawing(e.clientX, e.clientY)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editor) {
      editor.draw(e.clientX, e.clientY)
    }
  }

  const handleMouseUp = () => {
    if (editor) {
      editor.stopDrawing()
    }
  }

  const handleReset = () => {
    if (editor) {
      editor.reset()
    }
  }

  const handleDownload = () => {
    if (editor) {
      onDownload(editor.getCanvas())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Background Removed</h2>
              {!processedImage.requiresManualEdit ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Processed
                </div>
              ) : (
                <div className="text-orange-600 text-sm">Manual Editing Required</div>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {showManualTools ? (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <strong>Manual Editing:</strong> AI removal failed. Use the <strong>Erase</strong> tool to remove background areas. Use{" "}
                  <strong>Restore</strong> to bring back accidentally removed parts.
                </div>
              ) : (
                <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                  <strong>AI Processing Complete!</strong> Background has been automatically removed. You can still use manual tools for fine-tuning if needed.
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="border rounded-lg max-w-full h-auto cursor-crosshair bg-gray-100"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {showManualTools ? "Brush Tools" : "Fine-tune (Optional)"}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={brushSettings.mode === "erase" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBrushSettings((prev) => ({ ...prev, mode: "erase" }))}
                  >
                    <Eraser className="w-4 h-4 mr-1" />
                    Apagar Fundo
                  </Button>
                  <Button
                    variant={brushSettings.mode === "restore" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBrushSettings((prev) => ({ ...prev, mode: "restore" }))}
                  >
                    <Paintbrush className="w-4 h-4 mr-1" />
                    Restore
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Brush Size: {brushSettings.size}px</h3>
                <Slider
                  value={[brushSettings.size]}
                  onValueChange={([size]) => setBrushSettings((prev) => ({ ...prev, size }))}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Button onClick={handleReset} variant="outline" className="w-full bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
div>
  )
}
      </Card>
    </div>
  )
}
v>
  )
}
    </div>
  )
}
  )
}
