import React from "react";
import { Notification } from "./NotificationContext";
import NotificationItem from "./NotificationItem";
import './Notifications.css';

interface Props {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<Props> = ({
  notifications,
  onRemove,
}) => {
  return (
    <div id="global-notification-container">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onRemove={() => onRemove(n.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
