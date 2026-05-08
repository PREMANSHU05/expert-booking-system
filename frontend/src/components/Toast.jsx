import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast ${type}`} onClick={onClose}>
      <span className="toast-icon">{type === 'success' ? '✓' : '✕'}</span>
      <span className="toast-msg">{message}</span>
    </div>
  );
};

export default Toast;
