import { EntryConfig, type EntryType } from "../../design/tokens";
import styles from "./EntryBadge.module.css";

interface EntryBadgeProps {
  type: string;
}

export function EntryBadge({ type }: EntryBadgeProps) {
  const upper = type.toUpperCase() as EntryType;
  const config = EntryConfig[upper] ?? EntryConfig.TRIAGEM;
  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label.toUpperCase()}
    </span>
  );
}
