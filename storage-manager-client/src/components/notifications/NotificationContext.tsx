import React, {
    createContext,
    useContext,
    useState,
    useRef,
    ReactNode,
  } from "react";
  import { v4 as uuidv4 } from "uuid";
import NotificationContainer from "./NotificationContainer";
  
  export type NotificationType = "error" | "success" | "warning" | "info";
  
  export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
  }
  
  interface NotificationContextProps {
    addNotification: (type: NotificationType, message: string) => void;
  }
  
  const NotificationContext = createContext<
    NotificationContextProps | undefined
  >(undefined);
  
  export const useNotification = (): NotificationContextProps => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
      throw new Error(
        "useNotification should be used inside the NotificationProvider"
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
    const [notifications, setNotifications] = useState<Notification[]>([]);
 
    const queueRef = useRef<Notification[]>([]);
  
    const removeNotification = (id: string) => {
      setNotifications((current) => {
        const updated = current.filter((n) => n.id !== id);
  
        if (queueRef.current.length > 0) {
          const next = queueRef.current.shift()!;
          scheduleRemoval(next);
          return [...updated, next];
        }
  
        return updated;
      });
    };
  
    const scheduleRemoval = (notification: Notification) => {
      setTimeout(() => removeNotification(notification.id), DISPLAY_TIME);
    };
  
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
  