import React from "react";
import { Notification } from "./NotificationContext";
import classNames from "classnames";

interface Props {
  notification: Notification;
  onRemove: () => void;
}

const icons: Record<Notification["type"], string> = {
  error: "/icons/gn-icon-error.svg",
  success: "/icons/gn-icon-success.svg",
  warning: "/icons/gn-icon-warning.svg",
  info: "/icons/gn-icon-info.svg",
};

const NotificationItem: React.FC<Props> = ({ notification, onRemove }) => {
  const { type, message } = notification;

  return (
    <div
      className={classNames("global-notification", `global-notification-${type}`)}
      onClick={onRemove}
    >
      <div className="gn-icon">
        <img
          src={icons[type]}
          className="gn-icon-img"
          alt={type}
        />
      </div>
      <div className="gn-text">{message}</div>
    </div>
  );
};

export default NotificationItem;
