-- ============================================================
-- HUBIA — RLS Policies · Fase 1 (Fundação Multi-Tenant)
-- PRD v4.0 · Seção 4.5
-- ============================================================
-- Executar APÓS a primeira migration do Prisma.
-- Cada tabela com organization_id recebe a policy de isolamento.
-- Sem sessão válida + membership ativa, não há acesso a dados.
-- ============================================================

-- Habilitar RLS em todas as tabelas com organization_id

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: retorna os organization_ids do usuário autenticado
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
    AND is_active = true;
$$;

-- ============================================================
-- Policies: organizations
-- Usuário vê apenas as organizações de que é membro.
-- ============================================================

CREATE POLICY "tenant_isolation" ON organizations
  FOR ALL
  USING (id IN (SELECT public.get_user_org_ids()));

-- ============================================================
-- Policies: organization_members
-- Membro vê apenas membros da mesma organização.
-- ============================================================

CREATE POLICY "tenant_isolation" ON organization_members
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

-- ============================================================
-- Policy padrão para tabelas com organization_id
-- ============================================================

CREATE POLICY "tenant_isolation" ON organization_branding
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON organization_feature_overrides
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON ai_providers
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON creators
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON pedidos
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON prompt_outputs
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON projetos
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON agents
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON skills
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON entity_versions
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON knowledge_entries
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "tenant_isolation" ON activity_logs
  FOR ALL
  USING (organization_id IN (SELECT public.get_user_org_ids()));

-- ============================================================
-- Policies para tabelas filhas (via JOIN com pai)
-- ============================================================

CREATE POLICY "tenant_isolation" ON creator_appearances
  FOR ALL
  USING (creator_id IN (
    SELECT id FROM creators
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

CREATE POLICY "tenant_isolation" ON creator_environments
  FOR ALL
  USING (creator_id IN (
    SELECT id FROM creators
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

CREATE POLICY "tenant_isolation" ON creator_looks
  FOR ALL
  USING (creator_id IN (
    SELECT id FROM creators
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

CREATE POLICY "tenant_isolation" ON creator_voices
  FOR ALL
  USING (creator_id IN (
    SELECT id FROM creators
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

CREATE POLICY "tenant_isolation" ON agent_skills
  FOR ALL
  USING (agent_id IN (
    SELECT id FROM agents
    WHERE organization_id IN (SELECT public.get_user_org_ids())
  ));

-- ============================================================
-- Tabelas globais (plans, feature_flags) — leitura pública
-- ============================================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON plans
  FOR SELECT
  USING (true);

CREATE POLICY "public_read" ON feature_flags
  FOR SELECT
  USING (true);
