"use client"

import { useState } from "react"

const ProfilePhoto = ({ src, alt, size = "md", className = "", onClick }) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20",
    "3xl": "h-44 w-44",
  }

  // Default image if src is not provided or fails to load
  const DEFAULT_PROFILE_IMAGE = "https://tse2.mm.bing.net/th?id=OIP.T60Aago6tLDepIF5alRigwHaHa&pid=Api&P=0&h=180"

  // Process the src URL to ensure it's complete
  const getProcessedSrc = () => {
    if (!src || imageError) {
      return DEFAULT_PROFILE_IMAGE
    }

    // If the URL already includes the full domain, use it as is
    if (src.startsWith("http")) {
      return src
    }

    // If it's a relative path, prepend the API base URL
    if (src.startsWith("/")) {
      return `https://updatedbackendcc.onrender.com${src}`
    }

    // If it doesn't start with /, add it
    return `https://updatedbackendcc.onrender.com/${src}`
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = (e) => {
    console.log("Image failed to load:", src)
    setImageError(true)
    setIsLoading(false)
    e.target.src = DEFAULT_PROFILE_IMAGE
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 rounded-full animate-pulse ${sizeClasses[size]}`}></div>
      )}
      <img
        src={getProcessedSrc() || "/placeholder.svg"}
        alt={alt || "Profile"}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
        onClick={onClick}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  )
}

export default ProfilePhoto
