create table if not exists last_scan_time
(
    id             int auto_increment primary key,
    last_scan_time datetime(3) default now(3)
);

insert into last_scan_time
values ();
