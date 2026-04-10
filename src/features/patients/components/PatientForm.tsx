import type { PatientPayload } from "../../../types";
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

      <label className="switch-field">
        <input
          checked={form.ativo}
          onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))}
          type="checkbox"
        />
        <span>Paciente ativo</span>
      </label>

      <label className="field field-span-2">
        <span>Alergias</span>
        <textarea
          value={form.alergias}
          onChange={(event) => setForm((current) => ({ ...current, alergias: event.target.value }))}
          rows={3}
          placeholder="Medicamentos, alimentos, insumos ou observações relevantes"
        />
      </label>

      <label className="field field-span-2">
        <span>Histórico de vacinas</span>
        <textarea
          value={form.historicoVacinas}
          onChange={(event) => setForm((current) => ({ ...current, historicoVacinas: event.target.value }))}
          rows={3}
          placeholder="Vacinas registradas, datas ou pendências conhecidas"
        />
      </label>

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