import type { PatientPayload, VaccinePayload } from "../../../types";
import { useAuth } from "../../../auth/AuthProvider";
import { bloodTypeOptions, sexoLabel, sexoOptions } from "../../../utils/formatters";

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
    <form className="form-grid wide-grid" onSubmit={onSubmit}>
      <label className="field">
        <span>Nome completo</span>
        <input
          value={form.nome}
          onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
          placeholder="Nome do paciente"
          required
        />
      </label>

      <label className="field">
        <span>Data de nascimento</span>
        <input
          value={form.dataNascimento}
          onChange={(event) => setForm((current) => ({ ...current, dataNascimento: event.target.value }))}
          type="date"
          required
        />
      </label>

      <label className="field">
        <span>CPF</span>
        <input
          value={form.cpf}
          onChange={(event) => setForm((current) => ({ ...current, cpf: event.target.value }))}
          placeholder="Somente números"
          required
        />
      </label>

      <label className="field">
        <span>E-mail</span>
        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          type="email"
          placeholder="paciente@exemplo.com"
        />
      </label>

      <label className="field">
        <span>Telefone</span>
        <input
          value={form.telefone}
          onChange={(event) => setForm((current) => ({ ...current, telefone: event.target.value }))}
          placeholder="(85) 99999-0000"
        />
      </label>

      <label className="field">
        <span>Sexo</span>
        <select
          value={form.sexo}
          onChange={(event) =>
            setForm((current) => ({ ...current, sexo: event.target.value as PatientPayload["sexo"] }))
          }
        >
          {sexoOptions.map((sexo) => (
            <option key={sexo} value={sexo}>
              {sexoLabel(sexo)}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-span-2">
        <span>Endereço</span>
        <input
          value={form.endereco}
          onChange={(event) => setForm((current) => ({ ...current, endereco: event.target.value }))}
          placeholder="Rua, número, bairro e complemento"
        />
      </label>

      {shouldShowClinicalEditor ? (
        <label className="field">
          <span>Tipo sanguíneo</span>
          <select
            value={form.tipoSanguineo}
            onChange={(event) => setForm((current) => ({ ...current, tipoSanguineo: event.target.value }))}
          >
            <option value="">Não informado</option>
            {bloodTypeOptions.map((bloodType) => (
              <option key={bloodType} value={bloodType}>
                {bloodType}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {isEditing && (
        <label className="switch-field">
          <input
            checked={form.ativo}
            onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))}
            type="checkbox"
          />
          <span>Paciente ativo</span>
        </label>
      )}

      {shouldShowClinicalEditor ? (
        <>
          <section className="form-section field-span-2">
            <div className="form-section-header">
              <div>
                <h3 className="form-section-title">Alergias</h3>
                <p className="form-section-desc">Medicamentos, alimentos ou insumos</p>
              </div>
              <button type="button" className="button small secondary add-button" onClick={addAllergy}>
                + Adicionar alergia
              </button>
            </div>

            <div className="form-section-body">
              {form.alergias.length === 0 && (
                <p className="field-empty">Nenhuma alergia cadastrada.</p>
              )}
              {form.alergias.map((allergy, index) => (
                <div key={index} className="inline-row">
                  <span className="inline-row-number">{index + 1}</span>
                  <input
                    value={allergy.nomeAlergia}
                    onChange={(e) => updateAllergy(index, "nomeAlergia", e.target.value)}
                    placeholder="Ex: Dipirona, Amendoim, Látex..."
                    required
                  />
                  <select
                    value={allergy.severidade}
                    onChange={(e) => updateAllergy(index, "severidade", e.target.value)}
                  >
                    <option value="LEVE">Leve</option>
                    <option value="MODERADA">Moderada</option>
                    <option value="GRAVE">Grave</option>
                  </select>
                  <button
                    type="button"
                    className="button small danger"
                    onClick={() => removeAllergy(index)}
                    title="Remover alergia"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section field-span-2">
            <div className="form-section-header">
              <div>
                <h3 className="form-section-title">Vacinas</h3>
                <p className="form-section-desc">Registro de imunizações do paciente</p>
              </div>
              <button type="button" className="button small secondary add-button" onClick={addVaccine}>
                + Adicionar vacina
              </button>
            </div>

            <div className="form-section-body">
              {form.vacinas.length === 0 && (
                <p className="field-empty">Nenhuma vacina cadastrada.</p>
              )}
              {form.vacinas.map((vaccine, index) => (
                <div key={index} className="inline-row">
                  <span className="inline-row-number">{index + 1}</span>
                  <input
                    value={vaccine.nomeVacina}
                    onChange={(e) => updateVaccine(index, "nomeVacina", e.target.value)}
                    placeholder="Nome da vacina"
                    required
                  />
                  <input
                    value={vaccine.dataAplicacao}
                    onChange={(e) => updateVaccine(index, "dataAplicacao", e.target.value)}
                    type="date"
                    required
                  />
                  <input
                    value={vaccine.lote ?? ""}
                    onChange={(e) => updateVaccine(index, "lote", e.target.value)}
                    placeholder="Lote"
                  />
                  <input
                    value={vaccine.profissionalResp ?? ""}
                    onChange={(e) => updateVaccine(index, "profissionalResp", e.target.value)}
                    placeholder="Profissional responsável"
                    required
                  />
                  <button
                    type="button"
                    className="button small danger"
                    onClick={() => removeVaccine(index)}
                    title="Remover vacina"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="form-section field-span-2">
          <div className="form-section-header">
            <div>
              <h3 className="form-section-title">Dados clínicos</h3>
              <p className="form-section-desc">
                Tipo sanguíneo, alergias e vacinas são preenchidos e atualizados por enfermagem ou equipe médica.
              </p>
            </div>
          </div>

          <div className="form-section-body">
            <p className="field-empty">
              {showClinicalSection
                ? "A recepção cadastra apenas os dados administrativos do paciente nesta etapa."
                : "O cadastro inicial registra apenas os dados administrativos. Os dados clínicos devem ser preenchidos depois, no atendimento de triagem ou atualização clínica."}
            </p>
          </div>
        </section>
      )}

      <div className="form-actions field-span-2">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar paciente"}
        </button>

        {onCancel ? (
          <button type="button" className="button ghost" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
