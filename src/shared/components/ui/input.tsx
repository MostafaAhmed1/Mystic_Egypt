import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/core/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-sand/60 bg-white px-3 py-2 text-base text-obsidian transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-obsidian placeholder:text-obsidian/30 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-sand/30 disabled:opacity-50 aria-invalid:border-terracotta aria-invalid:ring-2 aria-invalid:ring-terracotta/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
