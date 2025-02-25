import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-black/40 backdrop-blur-[10px] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
        interactive && "hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:translate-y-[-5px] hover:scale-[1.02] transition-all duration-300",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: "teal" | "purple" | "none"
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, highlight = "none", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        highlight === "teal" && "border-l-4 border-l-[#00B2A9]",
        highlight === "purple" && "border-l-4 border-l-[#7B5EA7]",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-white/70 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 gap-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized Card types
const GlassCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn("backdrop-blur-md bg-black/30", className)}
      {...props}
    />
  )
)
GlassCard.displayName = "GlassCard"

const AccentCard = React.forwardRef<
  HTMLDivElement, 
  CardProps & { accent: "teal" | "purple" }
>(({ className, accent = "teal", ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "border-t-2",
      accent === "teal" ? "border-t-[#00B2A9]" : "border-t-[#7B5EA7]",
      className
    )}
    {...props}
  />
))
AccentCard.displayName = "AccentCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  GlassCard,
  AccentCard
}
