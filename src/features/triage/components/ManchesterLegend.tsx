import { RiskConfig, type RiskLevel } from "../../../design/tokens";
import { riskSla } from "../../../utils/formatters";
import styles from "./ManchesterLegend.module.css";

const order: RiskLevel[] = ["vermelho", "laranja", "amarelo", "verde", "azul"];

export function ManchesterLegend() {
  return (
    <div className={styles.legend}>
      <span className={styles.label}>Risco</span>
      {order.map((level) => {
        const config = RiskConfig[level];
        const sla = riskSla(level.toUpperCase() as never);
        return (
          <span
            key={level}
            className={styles.pill}
            style={{ backgroundColor: config.bg, borderColor: config.border, color: config.color }}
            title={sla}
          >
            <span className={styles.dot} style={{ backgroundColor: config.color }} />
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
