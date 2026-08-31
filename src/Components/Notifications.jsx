import { useEffect, useState } from "react";
import { getBackendBase } from "../api";

export default function Notifications() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const backendBase = getBackendBase();
    fetch(`${backendBase}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jb_token")}`,
      },
    })
      .then(res => res.json())
      .then(setList);
  }, []);

  return (
    <div className="notification-panel">
      <h3>Notifications</h3>
      {list.length === 0 && <p>No notifications</p>}
      {list.map(n => (
        <div key={n._id} className="notification-item">
          {n.message}
        </div>
      ))}
    </div>
  );
}
