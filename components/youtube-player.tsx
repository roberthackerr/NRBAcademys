"use client"

import { useState } from "react"

interface YouTubePlayerProps {
  videoUrl: string
  title: string
  onComplete?: () => void
}

export function YouTubePlayer({ videoUrl, title, onComplete }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return url
  }

  const videoId = getYouTubeVideoId(videoUrl)

  if (!videoId) {
    return (
      <div className="w-full bg-gray-900 rounded-lg p-8 text-center">
        <p className="text-white text-lg">Invalid video URL</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  )
}
