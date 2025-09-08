
"use client"

import { useState } from "react"
import { backgroundRemover } from "@/modules/background-remover"
import { ImageUploader } from "@/modules/background-remover/components/ImageUploader"
import { ImageEditor } from "@/modules/background-remover/components/ImageEditor"
import type { ProcessedImage } from "@/modules/background-remover/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BackgroundRemoverPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const result = await backgroundRemover.core.removeBackground(file)
      setProcessedImage(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditImage = () => {
    setShowEditor(true)
  }

  const handleDownload = (canvas?: HTMLCanvasElement) => {
    if (canvas) {
      backgroundRemover.core.downloadImage(canvas)
    } else if (processedImage?.processed) {
      // Download processed image directly
      const link = document.createElement("a")
      link.href = processedImage.processed
      link.download = "background-removed.png"
      link.click()
    }
  }

  const handleReset = () => {
    setProcessedImage(null)
    setShowEditor(false)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Removedor de Fundo</h1>
          <p className="text-muted-foreground">
            Faça o upload de uma imagem para remover automaticamente o fundo usando IA
          </p>
        </div>

        {error && (
          <Card className="p-4 mb-6 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {!processedImage ? (
          <ImageUploader onImageSelect={handleImageSelect} isProcessing={isProcessing} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Enviar Nova Imagem
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Original</h3>
                <img
                  src={processedImage.original || "/placeholder.svg"}
                  alt="Original"
                  className="w-full h-auto rounded-lg"
                />
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2">Fundo Removido</h3>
                <img
                  src={processedImage.processed || "/placeholder.svg"}
                  alt="Fundo removido"
                  className="w-full h-auto rounded-lg"
                />
              </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleEditImage}>Editar Imagem</Button>
              <Button variant="outline" onClick={() => handleDownload()}>
                Baixar
              </Button>
            </div>
          </div>
        )}

        {showEditor && processedImage && (
          <ImageEditor
            processedImage={processedImage}
            onDownload={handleDownload}
            onClose={() => setShowEditor(false)}
          />
        )}
      </div>
    </div>
  )
}
