import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "warning";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  const variantMap: Record<string, string> = {
    destructive: "ui-button-destructive",
    warning: "ui-button-warning",
    outline: "ui-button-outline",
    secondary: "ui-button-secondary",
    ghost: "ui-button-secondary",
    link: "ui-button-secondary",
  };
  const variantClass = variantMap[variant ?? "default"] ?? "ui-button-default";

  const sizeClass = size === "lg" ? "ui-button-lg" : "";

  return (
    <button
      className={`ui-button ${variantClass} ${sizeClass} ${className ?? ""}`.trim()}
      {...props}
    />
  );
};
