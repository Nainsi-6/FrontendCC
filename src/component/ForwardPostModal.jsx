"use client"

import { useState, useEffect } from "react"
import { FaTimes, FaSearch, FaUser, FaLink, FaExternalLinkAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom"



const ForwardPostModal = ({ isOpen, onClose, onForward, post }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState([])
  const [filteredConversations, setFilteredConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)

  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const currentUserId = localStorage.getItem("userId")

  useEffect(() => {
    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter((conv) => {
        const otherParticipant = conv.participants?.find((p) => p && p._id !== currentUserId)
        return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      })
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations, currentUserId])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://updatedbackendcc.onrender.com/api/messages/conversations", {
        headers: {
          Authorization: token,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConversations(data.conversations || [])
          setFilteredConversations(data.conversations || [])
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleForward = async () => {
    if (!selectedConversation || !post) return

    try {
      // Create a more comprehensive post link
      const postLink = `${window.location.origin}/post/${post._id}`

      // Enhanced post content with better formatting
      const postContent = `📌 *Forwarded Post*\n\n${post.content || ""}\n\n${
        post.images && post.images.length > 0 ? `🖼️ ${post.images.length} image(s) attached\n\n` : ""
      }👤 Originally posted by: ${post.userId?.name || post.username || "Unknown User"}\n\n🔗 View original post: ${postLink}`

      const response = await fetch("https://updatedbackendcc.onrender.com/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: postContent,
          forwardedPost: {
            postId: post._id,
            originalContent: post.content,
            images: post.images,
            author: post.userId?.name || post.username,
            postLink: postLink,
            createdAt: post.createdAt,
            isClickable: true,
            verified: true,
          },
        }),
      })

      if (response.ok) {
        onForward(selectedConversation)
        onClose()
        setSelectedConversation(null)
        setSearchQuery("")
      } else {
        console.error("Failed to forward post")
        alert("Failed to forward post. Please try again.")
      }
    } catch (error) {
      console.error("Error forwarding post:", error)
      alert("Error forwarding post. Please try again.")
    }
  }

  const handleViewOriginalPost = () => {
    if (post?._id) {
      navigate(`/post/${post._id}`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-t-lg">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaLink className="text-sm" />
            Forward Post
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="text-sm text-gray-700 mb-2 font-medium">Forwarding:</div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center mb-2">
              <FaUser className="text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-800">
                {post?.userId?.name || post?.username || "Unknown User"}
              </span>
            </div>
            <p className="text-sm text-gray-800 line-clamp-3 mb-2">{post?.content || "No content"}</p>
            {post?.images && post.images.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded mb-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                {post.images.length} image{post.images.length !== 1 ? "s" : ""}
              </div>
            )}
            <button
              onClick={handleViewOriginalPost}
              className="inline-flex items-center gap-1 text-base text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <FaExternalLinkAlt />
              View original post
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="p-2">
              {filteredConversations.map((conversation) => {
                const otherParticipant = conversation.participants?.find((p) => p && p._id !== currentUserId)
                if (!otherParticipant) return null

                return (
                  <button
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full flex items-center p-3 rounded-lg mb-2 transition-all ${
                      selectedConversation?._id === conversation._id
                        ? "bg-indigo-100 border-2 border-indigo-500 shadow-md"
                        : "hover:bg-gray-100 border-2 border-transparent hover:shadow-sm"
                    }`}
                  >
                    <img
                      src={
                        otherParticipant.profilePhotoUrl
                          ? `https://updatedbackendcc.onrender.com${otherParticipant.profilePhotoUrl}`
                          : "/placeholder.svg?height=40&width=40"
                      }
                      alt={otherParticipant.name}
                      className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=40&width=40"
                      }}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{otherParticipant.name}</div>
                      <div className="text-sm text-gray-500">{otherParticipant.role || "User"}</div>
                    </div>
                    {selectedConversation?._id === conversation._id && (
                      <div className="text-indigo-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <FaSearch className="text-2xl mb-2" />
              <p>No conversations found</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedConversation}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedConversation
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  )
}
export default ForwardPostModal
