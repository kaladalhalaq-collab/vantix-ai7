create table public.profiles(id uuid primary key references auth.users on delete cascade,role text not null default 'user' check(role in('user','admin')),plan text not null default 'free',points int not null default 0 check(points>=0),daily_limit int not null default 3,expires_at timestamptz);
create table public.analyses(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,instrument text,timeframe text,engine text,result jsonb,cost int,created_at timestamptz default now());
alter table public.profiles enable row level security;alter table public.analyses enable row level security;
create policy "own profile read" on public.profiles for select using(auth.uid()=id);
create policy "own analyses read" on public.analyses for select using(auth.uid()=user_id);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into profiles(id) values(new.id);return new;end$$;
create trigger on_signup after insert on auth.users for each row execute function public.handle_new_user();
create function public.spend_points(p_user uuid,p_cost int) returns boolean language plpgsql security definer set search_path=public as $$
declare p profiles;used int;begin
select * into p from profiles where id=p_user for update;
if p is null or p.points<p_cost or (p.expires_at is not null and p.expires_at<now()) then return false;end if;
select count(*) into used from analyses where user_id=p_user and created_at>now()-interval '1 day';
if used>=p.daily_limit then return false;end if;
update profiles set points=points-p_cost where id=p_user;return true;end$$;
create function public.refund_points(p_user uuid,p_cost int) returns void language sql security definer set search_path=public as $$update profiles set points=points+p_cost where id=p_user$$;
revoke all on function public.spend_points,public.refund_points from public,anon,authenticated;
grant execute on function public.spend_points,public.refund_points to service_role;
