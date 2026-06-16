// src/hooks/useGlobalNotifications.ts
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { playNotificationSound } from '../../utils/audio'
import { useSocket } from '../useSocket' // ваш хук сокета

export const useGlobalNotifications = () => {
  const { socket } = useSocket()
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      // Это сработает на ЛЮБОЙ странице
      if (
        document.hidden ||
        !window.location.pathname.includes('/dialogue/')
      ) {
        toast.success(`Новое сообщение от ${data.senderName}: ${data.text}`)

        // Тут можно добавить вызов playNotificationSound() и showBrowserNotification(data)
        playNotificationSound();
      }
    }

    socket?.on('new_message', handleNewMessage)
    return () => {
      socket?.off('new_message', handleNewMessage)
    }
  }, [socket])
}
