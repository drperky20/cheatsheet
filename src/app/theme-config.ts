export const themeConfig = {
  colors: {
    primary: {
      DEFAULT: "hsl(250, 95%, 65%)",
      hover: "hsl(250, 95%, 70%)",
      foreground: "hsl(210, 40%, 98%)",
    },
    secondary: {
      DEFAULT: "hsl(266, 80%, 60%)",
      hover: "hsl(266, 80%, 65%)",
      foreground: "hsl(210, 40%, 98%)",
    },
    accent: {
      DEFAULT: "hsl(286, 90%, 65%)",
      hover: "hsl(286, 90%, 70%)",
      foreground: "hsl(0, 0%, 100%)",
    },
    muted: {
      DEFAULT: "hsl(215, 15%, 15%)",
      foreground: "hsl(215, 20%, 65%)",
    },
    background: {
      DEFAULT: "hsl(222, 47%, 11%)",
      darker: "hsl(222, 47%, 8%)",
      lighter: "hsl(222, 47%, 14%)",
    },
    card: {
      DEFAULT: "hsla(228, 45%, 11%, 0.6)",
      hover: "hsla(228, 45%, 13%, 0.7)",
      border: "hsla(228, 100%, 70%, 0.15)",
      highlight: "hsla(228, 100%, 70%, 0.1)",
    },
    status: {
      success: {
        DEFAULT: "hsl(142, 70%, 45%)",
        muted: "hsla(142, 70%, 45%, 0.2)",
      },
      warning: {
        DEFAULT: "hsl(38, 95%, 50%)",
        muted: "hsla(38, 95%, 50%, 0.2)",
      },
      error: {
        DEFAULT: "hsl(358, 75%, 55%)",
        muted: "hsla(358, 75%, 55%, 0.2)",
      },
      info: {
        DEFAULT: "hsl(224, 90%, 60%)",
        muted: "hsla(224, 90%, 60%, 0.2)",
      },
    }
  },
  gradients: {
    primary: "from-primary via-secondary to-accent",
    subtle: "from-primary/20 via-secondary/20 to-accent/20",
    glass: "from-white/5 to-white/10",
    highlight: "from-white/10 via-white/5 to-transparent",
    card: "from-card via-card to-card/80",
  },
  glass: {
    card: "bg-card/60 backdrop-blur-md border border-card-border",
    heavy: "bg-card/80 backdrop-blur-xl border border-card-border",
    light: "bg-card/40 backdrop-blur-sm border border-card-border",
    subtle: "bg-black/20 backdrop-blur-sm",
  },
  shadow: {
    sm: "shadow-md shadow-black/20",
    DEFAULT: "shadow-lg shadow-black/30",
    lg: "shadow-xl shadow-black/40",
  },
  spacing: {
    page: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-12",
    card: "p-6",
  },
  radius: {
    sm: "rounded-md",
    DEFAULT: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
    card: "rounded-xl",
    button: "rounded-lg",
  },
  animation: {
    DEFAULT: "transition-all duration-300 ease-out",
    fast: "transition-all duration-150 ease-out",
    slow: "transition-all duration-500 ease-out",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
  }
}
