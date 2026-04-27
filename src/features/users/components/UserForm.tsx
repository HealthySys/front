import type { User } from "../../../types";

export type UserFormState = {
  username: string;
  nome: string;
  email: string;
  password: string;
  role: User["role"];
  active: boolean;
  assinaturaDigital: string;
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
    <form className="form-grid" onSubmit={onSubmit}>
      <label className="field">
        <span>Usuário</span>
        <input
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          placeholder="recepcao.centro"
          required
        />
      </label>

      <label className="field">
        <span>Nome completo</span>
        <input
          value={form.nome}
          onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
          placeholder="Nome completo"
          required
        />
      </label>

      <label className="field">
        <span>E-mail</span>
        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          type="email"
          placeholder="equipe@hospital.com"
          required
        />
      </label>

      <label className="field">
        <span>{isEditing ? "Nova senha (opcional)" : "Senha"}</span>
        <input
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          type="password"
          placeholder="Senha com 8+ caracteres, maiúsculas, números e símbolo"
          pattern={/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.source}
          required={!isEditing}
        />
      </label>

      <label className="field">
        <span>Assinatura digital</span>
        <input
          value={form.assinaturaDigital}
          onChange={(event) => setForm((current) => ({ ...current, assinaturaDigital: event.target.value }))}
          placeholder="Obrigatória para prescrições controladas"
        />
      </label>

      <label className="field">
        <span>Perfil</span>
        <select
          value={form.role}
          onChange={(event) =>
            setForm((current) => ({ ...current, role: event.target.value as User["role"] }))
          }
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
      </label>

      <label className="switch-field">
        <input
          checked={form.active}
          onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
          type="checkbox"
        />
        <span>Usuário ativo</span>
      </label>

      <div className="form-actions">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar usuário"}
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
