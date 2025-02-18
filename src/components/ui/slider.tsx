
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/5">
      <SliderPrimitive.Range className="absolute h-full bg-[#9b87f5]" />
    </SliderPrimitive.Track>
    <div className="absolute left-1/2 w-[1px] h-full -translate-x-1/2 bg-white/5" />
    {Array.from({ length: 11 }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "absolute w-1 h-1 rounded-full",
          i === 0 || i === 10 ? "bg-white/30" : "bg-white/20"
        )}
        style={{
          left: '50%',
          transform: `translate(-50%, ${i * 10}%)`,
        }}
      />
    ))}
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-[#9b87f5] bg-[#222222] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
