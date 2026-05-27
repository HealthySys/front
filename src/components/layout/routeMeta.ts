interface RouteMeta {
  eyebrow: string;
  title: string;
}

const matchers: Array<{ test: RegExp; meta: RouteMeta }> = [
  { test: /^\/app\/?$/,                          meta: { eyebrow: "Visão geral",    title: "Painel" } },
  { test: /^\/app\/usuarios\/novo/,              meta: { eyebrow: "Administração",  title: "Novo usuário" } },
  { test: /^\/app\/usuarios\/[^/]+\/editar/,     meta: { eyebrow: "Administração",  title: "Editar usuário" } },
  { test: /^\/app\/usuarios/,                    meta: { eyebrow: "Administração",  title: "Usuários" } },
  { test: /^\/app\/pacientes\/novo/,             meta: { eyebrow: "Gestão",         title: "Novo paciente" } },
  { test: /^\/app\/pacientes\/[^/]+\/editar/,    meta: { eyebrow: "Gestão",         title: "Editar paciente" } },
  { test: /^\/app\/pacientes/,                   meta: { eyebrow: "Gestão",         title: "Pacientes" } },
  { test: /^\/app\/triagem\/nova/,               meta: { eyebrow: "Operação",       title: "Nova triagem" } },
  { test: /^\/app\/triagem\/[^/]+\/editar/,      meta: { eyebrow: "Operação",       title: "Editar triagem" } },
  { test: /^\/app\/triagem/,                     meta: { eyebrow: "Operação",       title: "Triagem" } },
  { test: /^\/app\/atendimento\/[^/]+/,          meta: { eyebrow: "Atendimento",    title: "Em atendimento" } },
  { test: /^\/app\/prontuarios\/novo/,           meta: { eyebrow: "Operação",       title: "Novo prontuário" } },
  { test: /^\/app\/prontuarios\/[^/]+\/editar/,  meta: { eyebrow: "Operação",       title: "Editar prontuário" } },
  { test: /^\/app\/prontuarios\/[^/]+/,          meta: { eyebrow: "Operação",       title: "Prontuário" } },
  { test: /^\/app\/prontuarios/,                 meta: { eyebrow: "Operação",       title: "Prontuários" } }
];

export function getRouteMeta(pathname: string): RouteMeta {
  for (const matcher of matchers) {
    if (matcher.test.test(pathname)) {
      return matcher.meta;
    }
  }
  return { eyebrow: "HealthSys", title: "Plataforma" };
}
