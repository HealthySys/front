import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDateTime } from "../../../utils/formatters";
import type { MedicalRecord } from "../../../types";
import styles from "./RecordAccordion.module.css";

interface RecordAccordionProps {
  records: MedicalRecord[];
  onView: (record: MedicalRecord) => void;
  onEdit: (record: MedicalRecord) => void;
}

function isFinalized(record: MedicalRecord): boolean {
  if (record.diagnosis && record.diagnosis.trim().length > 0) return true;
  return (record.entries ?? []).some((entry) => entry.type === "CONSULTA");
}

export function RecordAccordion({ records, onView, onEdit }: RecordAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={styles.list}>
      {records.map((record) => {
        const isOpen = openId === record.id;
        const finalized = isFinalized(record);
        return (
          <div key={record.id} className={styles.item}>
            <button
              type="button"
              className={styles.head}
              onClick={() => setOpenId(isOpen ? null : record.id)}
            >
              <span className={styles.iconBox}>
                <FileText size={18} />
              </span>
              <div className={styles.body}>
                <span className={styles.name}>{record.patientName}</span>
                <span className={styles.meta}>
                  {formatDateTime(record.updatedAt || record.createdAt)} ·{" "}
                  {record.responsibleDoctorName || "Sem responsável"} · {record.entries.length}{" "}
                  entrada(s)
                </span>
              </div>
              <div className={styles.right}>
                <StatusBadge
                  active={finalized}
                  labels={{ active: "Finalizado", inactive: "Em andamento" }}
                />
                <ChevronDown
                  size={18}
                  className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`}
                />
              </div>
            </button>
            {isOpen ? (
              <div className={styles.expanded}>
                <div className={styles.summary}>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Diagnóstico</span>
                    <span className={styles.cellValue}>
                      {record.diagnosis || "Não informado"}
                    </span>
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Tratamento</span>
                    <span className={styles.cellValue}>
                      {record.treatment || "Não informado"}
                    </span>
                  </div>
                </div>
                {record.observations ? (
                  <div className={styles.cell}>
                    <span className={styles.cellLabel}>Observações</span>
                    <span className={styles.cellValue}>{record.observations}</span>
                  </div>
                ) : null}
                <div className={styles.actions}>
                  <Button size="sm" onClick={() => onView(record)}>
                    Ver completo
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onEdit(record)}>
                    Editar
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
