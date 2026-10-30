-- A ~1 KB blurred preview shown instantly while a member's photo loads.
alter table place_photos add column if not exists preview text check (char_length(preview) <= 4000);
