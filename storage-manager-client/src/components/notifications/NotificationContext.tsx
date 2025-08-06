import React, {
    createContext,
    useContext,
    useState,
    useRef,
    ReactNode,
  } from "react";
  import { v4 as uuidv4 } from "uuid";
import NotificationContainer from "./NotificationContainer";
  
  // Типы уведомлений
  export type NotificationType = "error" | "success" | "warning" | "info";
  
  // Интерфейс уведомления
  export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
  }
  
  // API контекста
  interface NotificationContextProps {
    addNotification: (type: NotificationType, message: string) => void;
  }
  
  // Создаём контекст
  const NotificationContext = createContext<
    NotificationContextProps | undefined
  >(undefined);
  
  // Хук для удобного доступа к API
  export const useNotification = (): NotificationContextProps => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
      throw new Error(
        "useNotification должен использоваться внутри NotificationProvider"
      );
    }
    return ctx;
  };
  
  export const MAX_NOTIFICATIONS = 5;
  export const DISPLAY_TIME = 5000;
  
  interface ProviderProps {
    children: ReactNode;
  }
  
  export const NotificationProvider: React.FC<ProviderProps> = ({
    children,
  }) => {
    // Активные уведомления на экране
    const [notifications, setNotifications] = useState<Notification[]>([]);
    // Очередь ожидающих уведомлений
    const queueRef = useRef<Notification[]>([]);
  
    // Удаление уведомления по id
    const removeNotification = (id: string) => {
      setNotifications((current) => {
        const updated = current.filter((n) => n.id !== id);
  
        // Если в очереди что-то есть – показываем следующее
        if (queueRef.current.length > 0) {
          const next = queueRef.current.shift()!;
          scheduleRemoval(next);
          return [...updated, next];
        }
  
        return updated;
      });
    };
  
    // Запланировать автоматическое удаление
    const scheduleRemoval = (notification: Notification) => {
      setTimeout(() => removeNotification(notification.id), DISPLAY_TIME);
    };
  
    // Публичная функция добавления уведомления
    const addNotification = (type: NotificationType, message: string) => {
      const newNote: Notification = {
        id: uuidv4(),
        type,
        message,
      };
  
      setNotifications((current) => {
        if (current.length < MAX_NOTIFICATIONS) {
          scheduleRemoval(newNote);
          return [...current, newNote];
        } else {
          queueRef.current.push(newNote);
          return current;
        }
      });
    };
  
    return (
      <NotificationContext.Provider value={{ addNotification }}>
        {children}
        <NotificationContainer
          notifications={notifications}
          onRemove={removeNotification}
        />
      </NotificationContext.Provider>
    );
  };
  