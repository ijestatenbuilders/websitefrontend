import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Toast.css';

/**
 * Toast – slides in from the top of the viewport.
 *
 * Props:
 *   message  string   – text to show
 *   type     'success' | 'error' | 'info'  (default 'success')
 *   onClose  fn       – called when dismissed or after duration
 *   duration number   – ms before auto-close (default 3500)
 */
function Toast({ message, type = 'success', onClose, duration = 3500 }) {
    useEffect(() => {
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [onClose, duration]);

    const icon = {
        success: <FaCheckCircle />,
        error:   <FaExclamationCircle />,
        info:    <FaInfoCircle />,
    }[type] || <FaInfoCircle />;

    return (
        <div className={`toast toast--${type}`} role="alert">
            <span className="toast__icon">{icon}</span>
            <span className="toast__message">{message}</span>
            <button className="toast__close" onClick={onClose} aria-label="Dismiss">
                <FaTimes />
            </button>
        </div>
    );
}

export default Toast;
