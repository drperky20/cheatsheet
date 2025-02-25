import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#00B2A9] text-white hover:bg-[#00a099] shadow-[0_4px_12px_rgba(0,178,169,0.3)] hover:shadow-[0_4px_16px_rgba(0,178,169,0.4)]",
        purple: "bg-[#7B5EA7] text-white hover:bg-[#6B4E97] shadow-[0_4px_12px_rgba(123,94,167,0.3)] hover:shadow-[0_4px_16px_rgba(123,94,167,0.4)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_4px_12px_rgba(255,0,0,0.2)]",
        outline: "border border-white/10 bg-black/40 backdrop-blur-md hover:bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
        secondary: "bg-[#121212] border border-white/10 text-white hover:bg-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
        ghost: "hover:bg-white/5 backdrop-blur-sm text-white hover:shadow-sm",
        link: "text-[#00B2A9] underline-offset-4 hover:underline",
        glass: "bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/30 shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3 }}
      >
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            loading && "opacity-80 pointer-events-none relative"
          )}
          ref={ref}
          disabled={props.disabled || loading}
          {...props}
        >
          {loading ? (
            <>
              <span className="opacity-0">{children}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              </div>
            </>
          ) : (
            children
          )}
        </Comp>
      </motion.div>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
