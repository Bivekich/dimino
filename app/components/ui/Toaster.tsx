'use client';

// Stub components - these need to be implemented or imported from a UI library
interface ToastProps {
  children?: React.ReactNode;
  key?: string;
  id?: string;
}

const Toast = ({ children, ...props }: ToastProps) => (
  <div {...props}>{children}</div>
);
const ToastClose = () => <button>×</button>;
const ToastDescription = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
const ToastTitle = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
const ToastViewport = () => <div></div>;

// Stub hook
const useToast = () => ({
  toasts: [] as Array<{
    id: string;
    title?: string;
    description?: string;
    action?: React.ReactNode;
  }>,
});

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
