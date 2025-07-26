"use client";

import { motion } from "framer-motion";
import { BaseComponentProps } from "@/types";

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <div className="h-full w-full rounded-full border-2 border-current border-t-transparent" />
    </motion.div>
  );
}
