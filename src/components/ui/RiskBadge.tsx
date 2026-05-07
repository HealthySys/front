import { RiskConfig, type RiskLevel } from "../../design/tokens";
import type { RiskClassification } from "../../types";
import styles from "./RiskBadge.module.css";

interface RiskBadgeProps {
  risk: RiskClassification | RiskLevel;
}

function toLevel(risk: RiskClassification | RiskLevel): RiskLevel {
  return risk.toLowerCase() as RiskLevel;
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const level = toLevel(risk);
  const config = RiskConfig[level];

  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color
      }}
    >
      <span className={styles.dot} style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
