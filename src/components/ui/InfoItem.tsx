import type { ReactNode } from "react";
import styles from "./InfoItem.module.css";

interface InfoItemProps {
  label: string;
  value: ReactNode;
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className={styles.item}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value || "—"}</span>
    </div>
  );
}
