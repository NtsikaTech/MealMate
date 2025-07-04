import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

const ToastComponent: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastComponent; 