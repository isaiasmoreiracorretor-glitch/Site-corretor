CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.assign_first_user_as_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_user_as_admin();

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('lancamento', 'pronto', 'usado')),
  type text NOT NULL CHECK (type IN ('apartamento', 'casa', 'cobertura', 'terreno')),
  developer_slug text NOT NULL DEFAULT 'particular',
  neighborhood text NOT NULL,
  city text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  area numeric NOT NULL DEFAULT 0,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  parking integer NOT NULL DEFAULT 0,
  image text,
  highlight text,
  delivery_date text,
  description text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT '{}',
  minha_casa_minha_vida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties" ON public.properties
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update properties" ON public.properties
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete properties" ON public.properties
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER properties_set_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.properties (ref, slug, title, category, type, developer_slug, neighborhood, city, price, area, bedrooms, bathrooms, parking, highlight, delivery_date, description, features, minha_casa_minha_vida) VALUES
('MRV-1001','spazio-boa-vista-mrv','Spazio Boa Vista — MRV','lancamento','apartamento','mrv','Cajazeiras','Salvador',189000,43,2,1,1,'Entrada em até 60x','Dez/2027','Apartamentos de 2 quartos em condomínio fechado com piscina, salão de festas e playground. Documentação grátis e possibilidade de usar FGTS na entrada.',ARRAY['Piscina adulto e infantil','Salão de festas','Playground','Portaria 24h','Bicicletário'],true),
('TEN-2010','residencial-vila-verde-tenda','Residencial Vila Verde — Tenda','lancamento','apartamento','tenda','Águas Claras','Salvador',175000,40,2,1,1,'Subsídio de até R$ 55 mil','Jun/2027','Empreendimento da Tenda com apartamentos compactos e bem distribuídos, ao lado de comércio, escolas e transporte público.',ARRAY['Quadra poliesportiva','Espaço gourmet','Área verde','Guarita blindada'],true),
('DIR-3005','riviera-park-direcional','Riviera Park — Direcional','lancamento','apartamento','direcional','Paralela','Salvador',329000,58,3,2,1,'Lazer completo','Mar/2028','Torres com 3 quartos na região da Paralela, próximo a shoppings e universidades. Excelente valorização.',ARRAY['Piscina com deck','Academia','Coworking','Pet place','Elevador'],false),
('CUR-4002','cury-station-pituba','Cury Station Pituba','lancamento','apartamento','cury','Pituba','Salvador',415000,52,2,2,1,'Ótimo para investir','Set/2027','Studios e apartamentos de 2 quartos a poucos minutos da praia da Pituba, com alta demanda de locação.',ARRAY['Rooftop','Lavanderia compartilhada','Bicicletário','Fechadura digital'],false),
('MRV-1102','parque-chapada-mrv-pronto','Parque Chapada — MRV (pronto)','pronto','apartamento','mrv','Mussurunga','Salvador',215000,45,2,1,1,'Chave na mão',NULL,'Unidades prontas para morar, com possibilidade de mudança imediata após a assinatura do financiamento.',ARRAY['Piscina','Churrasqueira','Playground','Portaria 24h'],true),
('TEN-2115','tenda-alto-do-cabrito-pronto','Residencial Alto do Cabrito — Tenda','pronto','apartamento','tenda','Alto do Cabrito','Salvador',198000,42,2,1,1,'Entrega imediata',NULL,'Apartamento pronto, com acabamento entregue e condomínio já em funcionamento. Aceita FGTS e financiamento Caixa.',ARRAY['Área de lazer','Salão de festas','Vaga coberta'],true),
('JCG-5001','edificio-mar-azul-jc-gomes','Edifício Mar Azul — JC Gomes','pronto','cobertura','jc-gomes','Rio Vermelho','Salvador',780000,128,3,3,2,'Vista mar',NULL,'Cobertura duplex com vista para o mar do Rio Vermelho, varanda ampla e suíte master com closet.',ARRAY['Vista mar','Varanda gourmet','Suíte master','2 vagas','Elevador social'],false),
('DIR-3210','direcional-lauro-de-freitas-pronto','Reserva Villas — Lauro de Freitas','pronto','casa','direcional','Vilas do Atlântico','Lauro de Freitas',620000,110,3,2,2,'Casa em condomínio',NULL,'Casa em condomínio fechado a 5 minutos da praia de Vilas, com quintal e espaço para piscina.',ARRAY['Condomínio fechado','Quintal','Churrasqueira','Segurança 24h'],false),
('PAR-9001','casa-2-quartos-barros-reis','Casa 2 quartos — Barros Reis','usado','casa','particular','Barros Reis','Salvador',140000,65,2,1,1,'Aceita financiamento',NULL,'Casa térrea reformada, com sala ampla, cozinha americana e quintal nos fundos. Rua tranquila e servida por transporte público.',ARRAY['Reformada','Quintal','Cozinha americana','Documentação ok'],false),
('PAR-9002','apartamento-3-quartos-costa-azul','Apartamento 3 quartos — Costa Azul','usado','apartamento','particular','Costa Azul','Salvador',460000,92,3,2,1,'Perto da praia',NULL,'Apartamento em prédio com portaria 24h, uma suíte, dependência completa e varanda. A duas quadras da orla.',ARRAY['1 suíte','Varanda','Portaria 24h','Armários planejados'],false),
('PAR-9003','apartamento-2-quartos-pituba-usado','Apartamento 2 quartos — Pituba','usado','apartamento','particular','Pituba','Salvador',320000,70,2,2,1,NULL,NULL,'Imóvel bem conservado em rua residencial da Pituba, próximo a escolas, supermercados e restaurantes.',ARRAY['Piso porcelanato','Cozinha com armários','Área de serviço','Vaga demarcada'],false),
('PAR-9004','casa-3-quartos-camacari','Casa 3 quartos — Camaçari','usado','casa','particular','Centro','Camaçari',285000,120,3,2,2,'Ótimo custo-benefício',NULL,'Casa espaçosa com 3 quartos, garagem para 2 carros e área externa com churrasqueira. Ideal para famílias.',ARRAY['Churrasqueira','2 vagas','Área externa','Perto do centro'],false);