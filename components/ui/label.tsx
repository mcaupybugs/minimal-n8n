import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium tracking-wide text-[#2d2d2d] peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
