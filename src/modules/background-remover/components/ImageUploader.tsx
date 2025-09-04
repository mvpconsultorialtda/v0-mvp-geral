"use client"

import type React from "react"

import { useCallback } from "react"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Upload } from "lucide-react"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  isProcessing?: boolean
}

export function ImageUploader({ onImageSelect, isProcessing }: ImageUploaderProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file)
      }
    },
    [onImageSelect],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        onImageSelect(file)
      }
    },
    [onImageSelect],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  return (
    <Card className="p-8">
      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Envie uma imagem</h3>
        <p className="text-muted-foreground mb-4">Arraste e solte uma imagem aqui, ou clique para selecionar</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
          disabled={isProcessing}
        />
        <Button asChild disabled={isProcessing}>
          <label htmlFor="image-upload" className="cursor-pointer">
            {isProcessing ? "Processando..." : "Selecionar Imagem"}
          </label>
        </Button>
      </div>
    </Card>
  )
}
