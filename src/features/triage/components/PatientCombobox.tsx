import { useEffect, useMemo, useRef, useState } from "react";
import { InputField } from "../../../components/ui/FormField";
import type { Patient } from "../../../types";
import styles from "./PatientCombobox.module.css";

type PatientComboboxProps = {
  patients: Patient[];
  value: string;
  onChange: (patientId: string) => void;
  required?: boolean;
};

const onlyDigits = (text: string) => text.replace(/\D+/g, "");

export function PatientCombobox({ patients, value, onChange, required }: PatientComboboxProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(
    () => patients.find((patient) => String(patient.id) === value),
    [patients, value]
  );

  useEffect(() => {
    if (selected) {
      setQuery(`${selected.nome} · ${selected.cpf}`);
    } else if (!value) {
      setQuery("");
    }
  }, [selected, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const selectedLabel = selected ? `${selected.nome} · ${selected.cpf}`.toLowerCase() : null;
    if (!trimmed || trimmed === selectedLabel) {
      return patients;
    }
    const digits = onlyDigits(trimmed);
    return patients.filter((patient) => {
      const nameMatch = patient.nome.toLowerCase().includes(trimmed);
      const cpfMatch = digits.length > 0 && onlyDigits(patient.cpf).includes(digits);
      return nameMatch || cpfMatch;
    });
  }, [patients, query, selected]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const selectPatient = (patient: Patient) => {
    onChange(String(patient.id));
    setQuery(`${patient.nome} · ${patient.cpf}`);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        event.preventDefault();
        selectPatient(filtered[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <InputField
        label="Paciente"
        required={required}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por nome ou CPF"
        autoComplete="off"
        span2
      />
      {open ? (
        <ul className={styles.list} role="listbox">
          {filtered.length === 0 ? (
            <li className={styles.empty}>Nenhum paciente encontrado.</li>
          ) : (
            filtered.map((patient, index) => (
              <li
                key={patient.id}
                role="option"
                aria-selected={index === activeIndex}
                className={`${styles.option}${index === activeIndex ? ` ${styles.optionActive}` : ""}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectPatient(patient);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>{patient.nome}</span>
                <span className={styles.optionMeta}>CPF {patient.cpf}</span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
