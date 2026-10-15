import { useState } from 'react'

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false)

  const upload = async (fileList: FileList) => {
    setUploading(true)

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      console.warn(
        'Cloudinary credentials not set in .env. Using fallback garage images.',
      )
      return [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      ]
    }

    try {
      const uploadPromises = Array.from(fileList).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          },
        )

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        const imageUrl = data.secure_url as string

        return imageUrl
      })

      const uploadedImages = await Promise.all(uploadPromises)
      return uploadedImages
    } catch (error) {
      throw new Error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
