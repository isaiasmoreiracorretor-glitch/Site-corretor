create table public.about_profile (
  id text primary key default 'main',
  name text not null default '',
  role_line text not null default '',
  bio text not null default '',
  photo text,
  photo_thumb text,
  photos jsonb not null default '[]'::jsonb,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint about_profile_single_row check (id = 'main')
);

grant select on public.about_profile to anon;
grant select, insert, update on public.about_profile to authenticated;
grant all on public.about_profile to service_role;

alter table public.about_profile enable row level security;

create policy "Anyone can view about profile"
  on public.about_profile for select to public using (true);

create policy "Admins can insert about profile"
  on public.about_profile for insert to authenticated
  with check (private.has_role(auth.uid(), 'admin'));

create policy "Admins can update about profile"
  on public.about_profile for update to authenticated
  using (private.has_role(auth.uid(), 'admin'))
  with check (private.has_role(auth.uid(), 'admin'));

create trigger about_profile_set_updated_at
  before update on public.about_profile
  for each row execute function public.set_updated_at();

insert into public.about_profile (id, name, role_line, bio, content) values (
  'main',
  'Isaías Moreira',
  'Corretor de Imóveis · CRECI-BA 32.373',
  'Especialista em lançamentos, imóveis na planta, prontos para morar e usados em Salvador e região metropolitana. Atendimento direto e personalizado do primeiro contato até a entrega das chaves.',
  'Em breve o Isaías vai contar aqui a história dele, a experiência no mercado imobiliário e o que o motiva a ajudar cada cliente a encontrar o imóvel ideal.'
);