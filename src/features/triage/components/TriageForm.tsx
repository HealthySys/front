import { Trash2 } from "lucide-react";
import type { AllergyPayload, Patient, Severidade, TriageEntry, VaccinePayload } from "../../../types";
import {
  riskLabel,
  riskOptions,
  riskSla,
  statusLabel,
  triageStatusOptions
} from "../../../utils/formatters";
import { Button } from "../../../components/ui/Button";
import { SelectField, TextAreaField } from "../../../components/ui/FormField";
import { PatientCombobox } from "./PatientCombobox";
import patientStyles from "../../patients/components/PatientForm.module.css";

export type TriageFormState = {
  patientId: string;
  riskClassification: TriageEntry["riskClassification"];
  chiefComplaint: string;
  vitalSigns: string;
  observations: string;
  status: TriageEntry["status"];
  alergiasReportadas: AllergyPayload[];
  vacinasReportadas: VaccinePayload[];
  existingAllergies: AllergyPayload[];
  existingVaccines: VaccinePayload[];
};

export const initialTriageForm: TriageFormState = {
  patientId: "",
  riskClassification: "AMARELO",
  chiefComplaint: "",
  vitalSigns: "",
  observations: "",
  status: "AGUARDANDO_ATENDIMENTO",
  alergiasReportadas: [],
  vacinasReportadas: [],
  existingAllergies: [],
  existingVaccines: []
};

const emptyAllergy: AllergyPayload = { nomeAlergia: "", severidade: "LEVE" };
const emptyVaccine: VaccinePayload = { nomeVacina: "", dataAplicacao: "" };
const severityOptions: Severidade[] = ["LEVE", "MODERADA", "GRAVE"];

const formatVaccineDate = (raw: string) => {
  if (!raw) return "—";
  const [year, month, day] = raw.split("-");
  if (!year || !month || !day) return raw;
  return `${day}/${month}/${year}`;
};

type TriageFormProps = {
  patients: Patient[];
  form: TriageFormState;
  setForm: React.Dispatch<React.SetStateAction<TriageFormState>>;
  submitting: boolean;
  isEditing?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

export function TriageForm({
  patients,
  form,
  setForm,
  submitting,
  isEditing = false,
  onSubmit,
  onCancel
}: TriageFormProps) {
  const updateAllergy = (index: number, patch: Partial<AllergyPayload>) =>
    setForm((current) => ({
      ...current,
      alergiasReportadas: current.alergiasReportadas.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      )
    }));

  const removeAllergy = (index: number) =>
    setForm((current) => ({
      ...current,
      alergiasReportadas: current.alergiasReportadas.filter((_, i) => i !== index)
    }));

  const addAllergy = () =>
    setForm((current) => ({
      ...current,
      alergiasReportadas: [...current.alergiasReportadas, { ...emptyAllergy }]
    }));

  const updateVaccine = (index: number, patch: Partial<VaccinePayload>) =>
    setForm((current) => ({
      ...current,
      vacinasReportadas: current.vacinasReportadas.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      )
    }));

  const removeVaccine = (index: number) =>
    setForm((current) => ({
      ...current,
      vacinasReportadas: current.vacinasReportadas.filter((_, i) => i !== index)
    }));

  const addVaccine = () =>
    setForm((current) => ({
      ...current,
      vacinasReportadas: [...current.vacinasReportadas, { ...emptyVaccine }]
    }));

  const hasExistingAllergies = form.existingAllergies.length > 0;
  const hasExistingVaccines = form.existingVaccines.length > 0;
  const lockFields = !form.patientId;

  return (
    <form className={patientStyles.formContainer} onSubmit={onSubmit}>
      <div className={patientStyles.card}>
        <div className={patientStyles.cardHeader}>
          <div>
            <h3 className={patientStyles.cardTitle}>Identificação e classificação</h3>
            <p className={patientStyles.cardDesc}>Selecione o paciente e defina o risco.</p>
          </div>
        </div>
        <div className={patientStyles.grid}>
          <PatientCombobox
            patients={patients}
            value={form.patientId}
            onChange={(patientId) => setForm((c) => ({ ...c, patientId }))}
            required
          />

          <SelectField
            label="Classificação de risco"
            value={form.riskClassification}
            disabled={lockFields}
            onChange={(event) =>
              setForm((c) => ({
                ...c,
                riskClassification: event.target.value as TriageEntry["riskClassification"]
              }))
            }
          >
            {riskOptions.map((risk) => (
              <option key={risk} value={risk}>
                {riskLabel(risk)} · {riskSla(risk)}
              </option>
            ))}
          </SelectField>

          {isEditing ? (
            <SelectField
              label="Status"
              value={form.status}
              disabled={lockFields}
              onChange={(event) =>
                setForm((c) => ({ ...c, status: event.target.value as TriageEntry["status"] }))
              }
            >
              {triageStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </SelectField>
          ) : null}
        </div>
        {lockFields ? (
          <p className={patientStyles.cardDesc} style={{ marginTop: 8 }}>
            Selecione um paciente para liberar o preenchimento da triagem.
          </p>
        ) : null}
      </div>

      <div className={patientStyles.card}>
        <div className={patientStyles.cardHeader}>
          <div>
            <h3 className={patientStyles.cardTitle}>Avaliação clínica</h3>
            <p className={patientStyles.cardDesc}>Queixa, sinais vitais e observações relevantes.</p>
          </div>
        </div>
        <div className={patientStyles.grid}>
          <TextAreaField
            label="Queixa principal"
            value={form.chiefComplaint}
            disabled={lockFields}
            onChange={(event) => setForm((c) => ({ ...c, chiefComplaint: event.target.value }))}
            placeholder="Sintomas, sinais e motivo principal da procura"
            rows={3}
            span2
          />
          <TextAreaField
            label="Sinais vitais"
            value={form.vitalSigns}
            disabled={lockFields}
            onChange={(event) => setForm((c) => ({ ...c, vitalSigns: event.target.value }))}
            placeholder="PA, FC, FR, SpO₂, temperatura e outros dados relevantes"
            rows={3}
            span2
          />
          <TextAreaField
            label="Observações adicionais"
            value={form.observations}
            disabled={lockFields}
            onChange={(event) => setForm((c) => ({ ...c, observations: event.target.value }))}
            placeholder="Informações complementares para priorização e continuidade"
            rows={2}
            span2
          />
        </div>
      </div>

      {!isEditing ? (
        <>
          {hasExistingAllergies || hasExistingVaccines ? (
            <div className={patientStyles.card}>
              <div className={patientStyles.cardHeader}>
                <div>
                  <h3 className={patientStyles.cardTitle}>Histórico do paciente</h3>
                  <p className={patientStyles.cardDesc}>
                    Itens já cadastrados no prontuário. Apenas para consulta — não serão duplicados.
                  </p>
                </div>
              </div>

              {hasExistingAllergies ? (
                <>
                  <p className={patientStyles.cardDesc}>Alergias cadastradas</p>
                  {form.existingAllergies.map((allergy, index) => (
                    <div key={`existing-allergy-${index}`} className={patientStyles.row}>
                      <span className={patientStyles.numberCircle}>{index + 1}</span>
                      <input
                        className={patientStyles.smallInput}
                        value={allergy.nomeAlergia}
                        readOnly
                        disabled
                      />
                      <input
                        className={patientStyles.smallInput}
                        value={allergy.severidade}
                        readOnly
                        disabled
                      />
                      <span />
                    </div>
                  ))}
                </>
              ) : null}

              {hasExistingVaccines ? (
                <>
                  <p className={patientStyles.cardDesc}>Vacinas cadastradas</p>
                  {form.existingVaccines.map((vaccine, index) => (
                    <div key={`existing-vaccine-${index}`} className={patientStyles.row}>
                      <span className={patientStyles.numberCircle}>{index + 1}</span>
                      <input
                        className={patientStyles.smallInput}
                        value={vaccine.nomeVacina}
                        readOnly
                        disabled
                      />
                      <input
                        className={patientStyles.smallInput}
                        value={formatVaccineDate(vaccine.dataAplicacao)}
                        readOnly
                        disabled
                      />
                      <span />
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          ) : null}

          <div className={patientStyles.card}>
            <div className={patientStyles.cardHeader}>
              <div>
                <h3 className={patientStyles.cardTitle}>Novas alergias relatadas</h3>
                <p className={patientStyles.cardDesc}>
                  Adicione apenas alergias informadas nesta triagem. Itens já no prontuário não precisam ser repetidos.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addAllergy} disabled={lockFields}>
                + Adicionar alergia
              </Button>
            </div>
            {form.alergiasReportadas.length === 0 ? (
              <p className={patientStyles.empty}>Nenhuma nova alergia relatada.</p>
            ) : (
              form.alergiasReportadas.map((allergy, index) => (
                <div key={index} className={patientStyles.row}>
                  <span className={patientStyles.numberCircle}>{index + 1}</span>
                  <input
                    className={patientStyles.smallInput}
                    value={allergy.nomeAlergia}
                    disabled={lockFields}
                    onChange={(e) => updateAllergy(index, { nomeAlergia: e.target.value })}
                    placeholder="Ex: Dipirona, Amendoim, Látex…"
                  />
                  <select
                    className={patientStyles.smallInput}
                    value={allergy.severidade}
                    disabled={lockFields}
                    onChange={(e) => updateAllergy(index, { severidade: e.target.value as Severidade })}
                  >
                    {severityOptions.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                  <Button type="button" variant="danger" size="sm" onClick={() => removeAllergy(index)} disabled={lockFields}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className={patientStyles.card}>
            <div className={patientStyles.cardHeader}>
              <div>
                <h3 className={patientStyles.cardTitle}>Novas vacinas relatadas</h3>
                <p className={patientStyles.cardDesc}>
                  Imunizações informadas nesta triagem. Vacinas já no prontuário não precisam ser repetidas.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addVaccine} disabled={lockFields}>
                + Adicionar vacina
              </Button>
            </div>
            {form.vacinasReportadas.length === 0 ? (
              <p className={patientStyles.empty}>Nenhuma nova vacina relatada.</p>
            ) : (
              form.vacinasReportadas.map((vaccine, index) => (
                <div key={index} className={patientStyles.row}>
                  <span className={patientStyles.numberCircle}>{index + 1}</span>
                  <input
                    className={patientStyles.smallInput}
                    value={vaccine.nomeVacina}
                    disabled={lockFields}
                    onChange={(e) => updateVaccine(index, { nomeVacina: e.target.value })}
                    placeholder="Nome da vacina"
                  />
                  <input
                    className={patientStyles.smallInput}
                    type="date"
                    value={vaccine.dataAplicacao}
                    disabled={lockFields}
                    onChange={(e) => updateVaccine(index, { dataAplicacao: e.target.value })}
                  />
                  <Button type="button" variant="danger" size="sm" onClick={() => removeVaccine(index)} disabled={lockFields}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      ) : null}

      <div className={patientStyles.formActions}>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting || lockFields}>
          {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Registrar triagem"}
        </Button>
      </div>
    </form>
  );
}
