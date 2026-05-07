import type { ReactNode } from "react";
import { RiskConfig, type RiskLevel } from "../../design/tokens";
import { RiskBadge } from "./RiskBadge";
import type { RiskClassification } from "../../types";
import styles from "./QueueCard.module.css";

interface QueueCardProps {
  name: string;
  risk?: RiskClassification;
  complaint?: string;
  meta?: ReactNode;
  subMeta?: ReactNode;
  compact?: boolean;
  rightSlot?: ReactNode;
  children?: ReactNode;
}

export function QueueCard({
  name,
  risk,
  complaint,
  meta,
  subMeta,
  compact,
  rightSlot,
  children
}: QueueCardProps) {
  const accent = risk ? RiskConfig[risk.toLowerCase() as RiskLevel].color : "var(--hs-border)";
  return (
    <div
      className={`${styles.card}${compact ? ` ${styles.cardCompact}` : ""}`}
      style={{ borderLeftColor: accent }}
    >
      <div className={styles.head}>
        <span className={styles.name}>{name}</span>
        {rightSlot ?? (risk ? <RiskBadge risk={risk} /> : null)}
      </div>
      {meta ? <div className={styles.meta}>{meta}</div> : null}
      {complaint ? <p className={styles.complaint}>{complaint}</p> : null}
      {subMeta ? <div className={styles.subMeta}>{subMeta}</div> : null}
      {children}
    </div>
  );
}
