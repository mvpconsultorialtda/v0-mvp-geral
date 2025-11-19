import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    return (
        <div className={`${bgColors[type]} text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 min-w-[200px] justify-between animate-in slide-in-from-right`}>
            <span>{message}</span>
            <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
                <X size={16} />
            </button>
        </div>
    );
};
