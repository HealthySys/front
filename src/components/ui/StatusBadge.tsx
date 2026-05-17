import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  active: boolean;
  labels?: { active: string; inactive: string };
}

export function StatusBadge({ active, labels }: StatusBadgeProps) {
  const text = active ? labels?.active ?? "Ativo" : labels?.inactive ?? "Inativo";
  return <span className={`${styles.badge} ${active ? styles.active : styles.inactive}`}>{text}</span>;
}
