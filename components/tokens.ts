// components/tokens.ts
// Gold-Anthracite Design Tokens

export const tokens = {
  colors: {
    primary: "#C9A227", // Gold
    neutral: "#1E2328", // Anthracite
    surface: "#F8FAFC", // Light gray/white
    text: {
      primary: "#1E2328",
      secondary: "#666",
      muted: "#999",
    },
    border: "#E5E7EB",
    success: "#00AA00",
    error: "#FF0000",
    warning: "#FFA500",
    info: "#0040FF",
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

// Card styles
export const cardStyle = {
  background: tokens.colors.surface,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.radius.md,
  padding: tokens.spacing.lg,
  boxShadow: tokens.shadow.sm,
};

// Button styles
export const buttonPrimary = {
  background: tokens.colors.primary,
  color: tokens.colors.neutral,
  border: "none",
  borderRadius: tokens.radius.md,
  padding: "10px 16px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  transition: "all 0.2s",
  outline: "none",
  boxShadow: tokens.shadow.sm,
};

// Focus ring for accessibility
export const focusRing = {
  outline: `2px solid ${tokens.colors.primary}`,
  outlineOffset: "2px",
};

// Button with focus ring
export const buttonPrimaryWithFocus = {
  ...buttonPrimary,
  ":focus": focusRing,
  ":focus-visible": focusRing,
};

