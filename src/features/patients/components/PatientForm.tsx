import type { PatientPayload, VaccinePayload } from "../../../types";
import { bloodTypeOptions, sexoLabel, sexoOptions } from "../../../utils/formatters";

type PatientFormProps = {
  form: PatientPayload;
  setForm: React.Dispatch<React.SetStateAction<PatientPayload>>;
  submitting: boolean;
  isEditing?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

export function PatientForm({
  form,
  setForm,
  submitting,
  isEditing = false,
  onSubmit,
  onCancel
}: PatientFormProps) {

  const addVaccine = () => {
    setForm((current) => ({
      ...current,
      vacinas: [...current.vacinas, { nomeVacina: "", dataAplicacao: "" }]
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
      alergias: [...current.alergias, { nomeAlergia: "" }]
    }));
  };

  const updateAllergy = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      alergias: current.alergias.map((a, i) => (i === index ? { ...a, nomeAlergia: value } : a))
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

      <label className="field">
        <span>Tipo sanguíneo</span>
        <select
          value={form.tipoSanguineo}
          onChange={(event) => setForm((current) => ({ ...current, tipoSanguineo: event.target.value }))}
        >
          {bloodTypeOptions.map((bloodType) => (
            <option key={bloodType} value={bloodType}>
              {bloodType}
            </option>
          ))}
        </select>
      </label>

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

      {/* Alergias */}
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
                onChange={(e) => updateAllergy(index, e.target.value)}
                placeholder="Ex: Dipirona, Amendoim, Látex..."
                required
              />
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

      {/* Vacinas */}
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