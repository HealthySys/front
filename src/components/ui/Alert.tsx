import type { ReactNode } from "react";
import styles from "./Alert.module.css";

type Variant = "error" | "success" | "info";

interface AlertProps {
  variant?: Variant;
  children: ReactNode;
}

export function Alert({ variant = "info", children }: AlertProps) {
  return <div className={`${styles.alert} ${styles[variant]}`}>{children}</div>;
}
