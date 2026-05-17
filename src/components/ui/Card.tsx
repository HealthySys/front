import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  style?: CSSProperties;
}

export function Card({ children, padded = true, className, style, ...rest }: CardProps) {
  const classes = [styles.card, padded ? styles.padded : "", className].filter(Boolean).join(" ");

  return (
    <div className={classes} style={style} {...rest}>
      {children}
    </div>
  );
}
