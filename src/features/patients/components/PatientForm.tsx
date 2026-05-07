import { Trash2 } from "lucide-react";
import type { PatientPayload, VaccinePayload } from "../../../types";
import { useAuth } from "../../../auth/AuthProvider";
import { bloodTypeOptions, sexoLabel, sexoOptions } from "../../../utils/formatters";
import { Button } from "../../../components/ui/Button";
import { InputField, SelectField } from "../../../components/ui/FormField";
import styles from "./PatientForm.module.css";

type PatientFormProps = {
  form: PatientPayload;
  setForm: React.Dispatch<React.SetStateAction<PatientPayload>>;
  submitting: boolean;
  isEditing?: boolean;
  showClinicalSection?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

export function PatientForm({
  form,
  setForm,
  submitting,
  isEditing = false,
  showClinicalSection = true,
  onSubmit,
  onCancel
}: PatientFormProps) {
  const { user } = useAuth();
  const canEditClinicalData =
    user?.role === "ENFERMEIRO" || user?.role === "MEDICO" || user?.role === "ADMIN";
  const shouldShowClinicalEditor = showClinicalSection && canEditClinicalData;

  const addVaccine = () => {
    setForm((current) => ({
      ...current,
      vacinas: [...current.vacinas, { nomeVacina: "", dataAplicacao: "", lote: "", profissionalResp: "" }]
    }));
  };

  const updateVaccine = (index: number, field: keyof VaccinePayload, value: string) => {
    setForm((current) => ({
      ...current,
      vacinas: current.vacinas.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    }));
  };

  const removeVaccine = (index: number) => {
    setForm((current) => ({
      ...current,
      vacinas: current.vacinas.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    setForm((current) => ({
      ...current,
      alergias: [...current.alergias, { nomeAlergia: "", severidade: "LEVE" }]
    }));
  };

  const updateAllergy = (index: number, field: "nomeAlergia" | "severidade", value: string) => {
    setForm((current) => ({
      ...current,
      alergias: current.alergias.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    }));
  };

  const removeAllergy = (index: number) => {
    setForm((current) => ({
      ...current,
      alergias: current.alergias.filter((_, i) => i !== index)
    }));
  };

  return (
    <form className={styles.formContainer} onSubmit={onSubmit}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Dados administrativos</h3>
            <p className={styles.cardDesc}>Informações de identificação e contato.</p>
          </div>
        </div>
        <div className={styles.grid}>
          <InputField
            label="Nome completo"
            required
            value={form.nome}
            placeholder="Nome do paciente"
            onChange={(event) => setForm((c) => ({ ...c, nome: event.target.value }))}
            span2
          />
          <InputField
            label="Data de nascimento"
            type="date"
            required
            value={form.dataNascimento}
            onChange={(event) => setForm((c) => ({ ...c, dataNascimento: event.target.value }))}
          />
          <InputField
            label="CPF"
            required
            value={form.cpf}
            placeholder="Somente números"
            onChange={(event) => setForm((c) => ({ ...c, cpf: event.target.value }))}
          />
          <InputField
            label="E-mail"
            type="email"
            value={form.email}
            placeholder="paciente@exemplo.com"
            onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
          />
          <InputField
            label="Telefone"
            value={form.telefone}
            placeholder="(85) 99999-0000"
            onChange={(event) => setForm((c) => ({ ...c, telefone: event.target.value }))}
          />
          <SelectField
            label="Sexo"
            value={form.sexo}
            onChange={(event) => setForm((c) => ({ ...c, sexo: event.target.value as PatientPayload["sexo"] }))}
          >
            {sexoOptions.map((sexo) => (
              <option key={sexo} value={sexo}>
                {sexoLabel(sexo)}
              </option>
            ))}
          </SelectField>
          <InputField
            label="Endereço"
            value={form.endereco}
            placeholder="Rua, número, bairro e complemento"
            onChange={(event) => setForm((c) => ({ ...c, endereco: event.target.value }))}
            span2
          />
          {isEditing ? (
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(event) => setForm((c) => ({ ...c, ativo: event.target.checked }))}
              />
              Paciente ativo
            </label>
          ) : null}
        </div>
      </div>

      {shouldShowClinicalEditor ? (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Tipo sanguíneo</h3>
                <p className={styles.cardDesc}>Use para alertas de transfusão e prescrição.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <SelectField
                label="Tipo sanguíneo"
                value={form.tipoSanguineo}
                onChange={(event) => setForm((c) => ({ ...c, tipoSanguineo: event.target.value }))}
              >
                <option value="">Não informado</option>
                {bloodTypeOptions.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Alergias</h3>
                <p className={styles.cardDesc}>Medicamentos, alimentos ou insumos com reação relatada.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addAllergy}>
                + Adicionar alergia
              </Button>
            </div>
            {form.alergias.length === 0 ? (
              <p className={styles.empty}>Nenhuma alergia cadastrada.</p>
            ) : (
              form.alergias.map((allergy, index) => (
                <div key={index} className={styles.row}>
                  <span className={styles.numberCircle}>{index + 1}</span>
                  <input
                    className={styles.smallInput}
                    value={allergy.nomeAlergia}
                    onChange={(e) => updateAllergy(index, "nomeAlergia", e.target.value)}
                    placeholder="Ex: Dipirona, Amendoim, Látex…"
                    required
                  />
                  <select
                    className={styles.smallInput}
                    value={allergy.severidade}
                    onChange={(e) => updateAllergy(index, "severidade", e.target.value)}
                  >
                    <option value="LEVE">Leve</option>
                    <option value="MODERADA">Moderada</option>
                    <option value="GRAVE">Grave</option>
                  </select>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeAllergy(index)}
                    title="Remover alergia"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Vacinas</h3>
                <p className={styles.cardDesc}>Histórico de imunização do paciente.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addVaccine}>
                + Adicionar vacina
              </Button>
            </div>
            {form.vacinas.length === 0 ? (
              <p className={styles.empty}>Nenhuma vacina cadastrada.</p>
            ) : (
              form.vacinas.map((vaccine, index) => (
                <div key={index} className={styles.rowVaccine}>
                  <span className={styles.numberCircle}>{index + 1}</span>
                  <input
                    className={styles.smallInput}
                    value={vaccine.nomeVacina}
                    onChange={(e) => updateVaccine(index, "nomeVacina", e.target.value)}
                    placeholder="Nome da vacina"
                    required
                  />
                  <input
                    className={styles.smallInput}
                    type="date"
                    value={vaccine.dataAplicacao}
                    onChange={(e) => updateVaccine(index, "dataAplicacao", e.target.value)}
                    required
                  />
                  <input
                    className={styles.smallInput}
                    value={vaccine.lote ?? ""}
                    onChange={(e) => updateVaccine(index, "lote", e.target.value)}
                    placeholder="Lote"
                  />
                  <input
                    className={styles.smallInput}
                    value={vaccine.profissionalResp ?? ""}
                    onChange={(e) => updateVaccine(index, "profissionalResp", e.target.value)}
                    placeholder="Profissional responsável"
                    required
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeVaccine(index)}
                    title="Remover vacina"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className={styles.note}>
          {showClinicalSection
            ? "Apenas perfis clínicos (Enfermeiro, Médico, Admin) podem editar tipo sanguíneo, alergias e vacinas."
            : "O cadastro inicial registra apenas dados administrativos. Os dados clínicos são preenchidos depois, na triagem."}
        </div>
      )}

      <div className={styles.formActions}>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar paciente"}
        </Button>
      </div>
    </form>
  );
}
