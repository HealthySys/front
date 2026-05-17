import type { User } from "../../../types";
import { Button } from "../../../components/ui/Button";
import { InputField, SelectField } from "../../../components/ui/FormField";
import patientStyles from "../../patients/components/PatientForm.module.css";

export type UserFormState = {
  username: string;
  nome: string;
  email: string;
  password: string;
  role: User["role"];
  active: boolean;
};

type UserFormProps = {
  form: UserFormState;
  setForm: React.Dispatch<React.SetStateAction<UserFormState>>;
  submitting: boolean;
  isEditing?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  roleOptions: User["role"][];
  roleLabel: (role: User["role"]) => string;
};

export function UserForm({
  form,
  setForm,
  submitting,
  isEditing = false,
  onSubmit,
  onCancel,
  roleOptions,
  roleLabel
}: UserFormProps) {
  return (
    <form className={patientStyles.formContainer} onSubmit={onSubmit}>
      <div className={patientStyles.card}>
        <div className={patientStyles.cardHeader}>
          <div>
            <h3 className={patientStyles.cardTitle}>Dados de acesso</h3>
            <p className={patientStyles.cardDesc}>Identificação, contato e perfil de permissões.</p>
          </div>
        </div>
        <div className={patientStyles.grid}>
          <InputField
            label="Usuário"
            required
            value={form.username}
            placeholder="recepcao.centro"
            onChange={(event) => setForm((c) => ({ ...c, username: event.target.value }))}
          />
          <InputField
            label="Nome completo"
            required
            value={form.nome}
            placeholder="Nome completo"
            onChange={(event) => setForm((c) => ({ ...c, nome: event.target.value }))}
          />
          <InputField
            label="E-mail"
            type="email"
            required
            value={form.email}
            placeholder="equipe@hospital.com"
            onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
          />
          <InputField
            label={isEditing ? "Nova senha (opcional)" : "Senha"}
            type="password"
            required={!isEditing}
            value={form.password}
            placeholder="8+ caracteres, maiúscula, número e símbolo"
            pattern={/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.source}
            onChange={(event) => setForm((c) => ({ ...c, password: event.target.value }))}
          />
          <SelectField
            label="Perfil"
            value={form.role}
            onChange={(event) => setForm((c) => ({ ...c, role: event.target.value as User["role"] }))}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </SelectField>
          {isEditing ? (
            <label className={patientStyles.switch}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((c) => ({ ...c, active: event.target.checked }))}
              />
              Usuário ativo
            </label>
          ) : null}
        </div>
      </div>

      <div className={patientStyles.formActions}>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Cadastrar usuário"}
        </Button>
      </div>
    </form>
  );
}
