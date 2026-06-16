export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  
  // Важно: catch нужен, так как браузеры блокируют автовоспроизведение, 
  // если пользователь еще не кликнул по странице
  audio.volume = 0.2;
  audio.play().catch((err) => {
    console.warn('Звук уведомления заблокирован браузером:', err);
  });
};