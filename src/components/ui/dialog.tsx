import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

import { cn } from "./utils.ts";

// Hook pour gérer le redimensionnement
function useResize(defaultSize: { width: number; height: number }) {
  const [size, setSize] = React.useState(defaultSize);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const isResizing = React.useRef(false);
  const startPos = React.useRef({ x: 0, y: 0 });
  const startSize = React.useRef({ width: 0, height: 0 });

  const setRef = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('.resize-handle')) {
        isResizing.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        if (elementRef.current) {
          startSize.current = {
            width: elementRef.current.offsetWidth,
            height: elementRef.current.offsetHeight,
          };
        }
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      setSize({
        width: Math.max(400, Math.min(window.innerWidth - 40, startSize.current.width + deltaX)),
        height: Math.max(300, Math.min(window.innerHeight - 40, startSize.current.height + deltaY)),
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return { size, setRef };
}

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    resizable?: boolean;
    defaultSize?: { width: number; height: number };
    hideCloseButton?: boolean;
  }
>(({ className, children, resizable = true, defaultSize = { width: 900, height: 700 }, hideCloseButton = false, ...props }, ref) => {
  const { size, setRef: setResizeRef } = useResize(defaultSize);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Combiner les refs
  const combinedRef = React.useCallback((node: HTMLDivElement | null) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    }
    setResizeRef(node);
    contentRef.current = node;
  }, [ref, setResizeRef]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={combinedRef}
        data-slot="dialog-content"
        aria-describedby={undefined}
        style={{
          width: resizable ? `${size.width}px` : undefined,
          height: resizable ? `${size.height}px` : undefined,
          maxWidth: resizable ? '95vw' : undefined,
          maxHeight: resizable ? '95vh' : undefined,
        }}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-4 sm:p-6 shadow-lg duration-200",
          resizable 
            ? "min-w-[calc(100%-2rem)] sm:min-w-[500px] min-h-[400px] max-h-[95vh] max-w-[calc(100%-2rem)]" 
            : "max-w-[calc(100%-2rem)] sm:max-w-2xl",
          className,
        )}
        {...props}
      >
        {children}
        {resizable && (
          <div
            className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-20"
            title="Redimensionner (glisser depuis le coin)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="absolute bottom-1 right-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <path
                d="M16 16L10 10L16 10L16 16Z"
                fill="currentColor"
              />
              <path
                d="M12 16L6 10L12 10L12 16Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
          </div>
        )}
        {!hideCloseButton && (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 z-20">
            <Cross2Icon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};