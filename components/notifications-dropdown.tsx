"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  read: boolean
  link?: string
  course?: { title: string }
  createdAt: string
}

export function NotificationsDropdown() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
      return () => clearInterval(interval)
    }
  }, [status])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })
      fetchNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  if (status !== "authenticated") {
    return null
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="relative">
        🔔 Notifications
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No notifications yet</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b hover:bg-gray-50 transition ${!notification.read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {notification.course && (
                        <p className="text-xs text-gray-500 mt-1">Course: {notification.course.title}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                  {notification.link && (
                    <Link href={notification.link} className="block mt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
