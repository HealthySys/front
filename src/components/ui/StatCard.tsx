import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: ReactNode;
  subtitle?: string;
  color: string;
  icon?: ReactNode;
}

function withAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `${hex}${a}`;
}

export function StatCard({ label, value, subtitle, color, icon }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.label}>{label}</span>
        {icon ? (
          <div
            className={styles.iconBox}
            style={{ backgroundColor: withAlpha(color, 0.12), color }}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <div className={styles.value} style={{ color }}>
        {value}
      </div>
      {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
    </div>
  );
}
