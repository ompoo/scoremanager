-- Enable RLS for the public catalog tables exposed through the Supabase API.
-- The catalog is publicly searchable, so SELECT is allowed for anon and
-- authenticated roles. No write policies are created here, so client-side
-- INSERT/UPDATE/DELETE remains denied.

alter table public.books enable row level security;
alter table public.songs enable row level security;
alter table public.artists enable row level security;
alter table public.lyricists enable row level security;
alter table public.songwriters enable row level security;
alter table public.arrangers enable row level security;
alter table public.song_artist_association enable row level security;
alter table public.song_lyricist_association enable row level security;
alter table public.song_writer_association enable row level security;
alter table public.song_arranger_association enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.books to anon, authenticated;
grant select on public.songs to anon, authenticated;
grant select on public.artists to anon, authenticated;
grant select on public.lyricists to anon, authenticated;
grant select on public.songwriters to anon, authenticated;
grant select on public.arrangers to anon, authenticated;
grant select on public.song_artist_association to anon, authenticated;
grant select on public.song_lyricist_association to anon, authenticated;
grant select on public.song_writer_association to anon, authenticated;
grant select on public.song_arranger_association to anon, authenticated;

create policy "Catalog books are publicly readable"
on public.books
for select
to anon, authenticated
using (true);

create policy "Catalog songs are publicly readable"
on public.songs
for select
to anon, authenticated
using (true);

create policy "Catalog artists are publicly readable"
on public.artists
for select
to anon, authenticated
using (true);

create policy "Catalog lyricists are publicly readable"
on public.lyricists
for select
to anon, authenticated
using (true);

create policy "Catalog songwriters are publicly readable"
on public.songwriters
for select
to anon, authenticated
using (true);

create policy "Catalog arrangers are publicly readable"
on public.arrangers
for select
to anon, authenticated
using (true);

create policy "Catalog song artist associations are publicly readable"
on public.song_artist_association
for select
to anon, authenticated
using (true);

create policy "Catalog song lyricist associations are publicly readable"
on public.song_lyricist_association
for select
to anon, authenticated
using (true);

create policy "Catalog song writer associations are publicly readable"
on public.song_writer_association
for select
to anon, authenticated
using (true);

create policy "Catalog song arranger associations are publicly readable"
on public.song_arranger_association
for select
to anon, authenticated
using (true);
