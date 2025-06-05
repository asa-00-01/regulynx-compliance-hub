
import { cva } from "class-variance-authority"

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "warning" | "success";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        warning:
          "border-transparent bg-amber-500 text-amber-50 hover:bg-amber-500/80",
        success:
          "border-transparent bg-green-500 text-green-50 hover:bg-green-500/80",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-1.5 py-0 text-xs",
        lg: "px-3 py-0.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
