import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'premium' | 'free' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {

  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"

  const variants = {
    // PRIMARY: acento de marca (secondary = azul clínico)
    primary: "bg-secondary text-on-secondary hover:bg-on-secondary-container active:scale-95",

    // OUTLINE: borde sutil, fondo claro tenue
    outline: "bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-container-high transition-colors active:scale-95",

    secondary: "bg-transparent text-secondary border border-secondary/40 hover:bg-secondary/10 active:scale-95",

    premium: "bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim active:scale-95 cursor-pointer",
    free:    "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim active:scale-95 cursor-pointer",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-label-sm",
    md: "px-4 py-2 text-label-md",
    lg: "px-6 py-3 text-label-lg",
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}