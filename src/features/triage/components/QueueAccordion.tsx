import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RiskConfig, type RiskLevel } from "../../../design/tokens";
import { RiskBadge } from "../../../components/ui/RiskBadge";
import { Button } from "../../../components/ui/Button";
import { formatDateTime, riskSla } from "../../../utils/formatters";
import type { TriageEntry } from "../../../types";
import styles from "./QueueAccordion.module.css";

interface QueueAccordionProps {
  entries: TriageEntry[];
  onStartAttendance?: (entry: TriageEntry) => void;
  onViewRecord?: (entry: TriageEntry) => void;
  onReclassify?: (entry: TriageEntry) => void;
  loadingId?: number | null;
}

export function QueueAccordion({
  entries,
  onStartAttendance,
  onViewRecord,
  onReclassify,
  loadingId
}: QueueAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className={styles.list}>
      {entries.map((entry, index) => {
        const level = entry.riskClassification.toLowerCase() as RiskLevel;
        const config = RiskConfig[level];
        const isOpen = openId === entry.id;

        return (
          <div
            key={entry.id}
            className={styles.item}
            style={{ borderLeftColor: config.color }}
          >
            <button
              type="button"
              className={styles.head}
              onClick={() => setOpenId(isOpen ? null : entry.id)}
            >
              <span
                className={styles.numberCircle}
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                {index + 1}
              </span>
              <div className={styles.body}>
                <span className={styles.name}>{entry.patientName}</span>
                <span className={styles.meta}>
                  Triado em {formatDateTime(entry.triageDate)} · Espera máx. {riskSla(entry.riskClassification)}
                </span>
              </div>
              <div className={styles.right}>
                <RiskBadge risk={entry.riskClassification} />
                <ChevronDown
                  className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`}
                  size={18}
                />
              </div>
            </button>
            {isOpen ? (
              <div className={styles.expanded}>
                <div className={styles.grid}>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Queixa principal</span>
                    <span className={styles.cellValue}>{entry.chiefComplaint || "—"}</span>
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Triado em</span>
                    <span className={styles.cellValue}>{formatDateTime(entry.triageDate)}</span>
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Tempo máximo</span>
                    <span className={styles.cellValue}>{riskSla(entry.riskClassification)}</span>
                  </div>
                </div>
                {onStartAttendance || onViewRecord || onReclassify ? (
                  <div className={styles.actions}>
                    {onStartAttendance ? (
                      <Button
                        size="sm"
                        disabled={loadingId === entry.id}
                        onClick={() => onStartAttendance(entry)}
                      >
                        {loadingId === entry.id ? "Iniciando..." : "Iniciar atendimento"}
                      </Button>
                    ) : null}
                    {onViewRecord ? (
                      <Button variant="secondary" size="sm" onClick={() => onViewRecord(entry)}>
                        Ver prontuário
                      </Button>
                    ) : null}
                    {onReclassify ? (
                      <Button variant="ghost" size="sm" onClick={() => onReclassify(entry)}>
                        Reclassificar
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
