with lines(kind, line) as (
  select 'extension', extname::text from pg_extension
  union all
  select 'column', format('%s.%s.%s %s null=%s default=%s identity=%s', c.table_schema, c.table_name, c.column_name, c.udt_name, c.is_nullable, coalesce(c.column_default,''), c.is_identity)
    from information_schema.columns c where c.table_schema = 'public'
  union all
  select 'relation', format('%s.%s kind=%s rls=%s force=%s', n.nspname, cl.relname, cl.relkind, cl.relrowsecurity, cl.relforcerowsecurity)
    from pg_class cl join pg_namespace n on n.oid = cl.relnamespace
   where n.nspname = 'public' and cl.relkind in ('r','v','m','p','S')
  union all
  select 'view', format('%s.%s md5=%s', schemaname, viewname, md5(replace(definition, chr(13), ''))) from pg_views where schemaname = 'public'
  union all
  select 'constraint', format('%s.%s %s', conrelid::regclass, conname, pg_get_constraintdef(oid))
    from pg_constraint where connamespace = 'public'::regnamespace
  union all
  select 'index', format('%s', indexdef) from pg_indexes where schemaname = 'public'
  union all
  select 'type', format('%s %s', t.typname, string_agg(e.enumlabel, ',' order by e.enumsortorder))
    from pg_type t join pg_enum e on e.enumtypid = t.oid where t.typnamespace = 'public'::regnamespace group by t.typname
  union all
  select 'function', format('%s(%s) returns %s secdef=%s volatile=%s config=%s md5=%s', p.proname, pg_get_function_identity_arguments(p.oid), pg_get_function_result(p.oid), p.prosecdef, p.provolatile, coalesce(array_to_string(p.proconfig, ','), ''), md5(replace(p.prosrc, chr(13), '')))
    from pg_proc p where p.pronamespace = 'public'::regnamespace
  union all
  select 'trigger', format('%s %s %s', tgrelid::regclass, tgname, regexp_replace(pg_get_triggerdef(t.oid), 'eyJ[A-Za-z0-9._-]+', '<jwt>'))
    from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
   where not t.tgisinternal and (n.nspname = 'public' or (n.nspname, c.relname) in (('auth','users'),('storage','objects')))
  union all
  select 'policy', format('%s.%s %s cmd=%s permissive=%s roles=%s using=%s check=%s', schemaname, tablename, policyname, cmd, permissive, roles, coalesce(qual,''), coalesce(with_check,''))
    from pg_policies where schemaname in ('public','storage')
  union all
  select 'grant', format('%s %s %s', c.oid::regclass, coalesce(nullif(a.grantee, 0)::regrole::text, 'PUBLIC'), string_agg(a.privilege_type, ',' order by a.privilege_type))
    from pg_class c, aclexplode(c.relacl) a
   where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','v','m','p','S')
     and coalesce(nullif(a.grantee, 0)::regrole::text, 'PUBLIC') in ('anon','authenticated','service_role','PUBLIC')
   group by c.oid, a.grantee
  union all
  select 'routine_grant', format('%s(%s) %s', p.proname, pg_get_function_identity_arguments(p.oid), coalesce(string_agg(distinct coalesce(nullif(a.grantee, 0)::regrole::text, 'PUBLIC'), ','), 'default'))
    from pg_proc p left join lateral aclexplode(p.proacl) a on true
   where p.pronamespace = 'public'::regnamespace
   group by p.oid, p.proname
  union all
  select 'bucket', format('%s public=%s limit=%s mimes=%s', id, public, coalesce(file_size_limit::text,''), coalesce(array_to_string(allowed_mime_types, ','),'')) from storage.buckets
  union all
  select 'publication', format('%s %s.%s', pubname, schemaname, tablename) from pg_publication_tables where schemaname <> 'realtime'
  union all
  select 'publication_flags', format('%s ins=%s upd=%s del=%s', pubname, pubinsert, pubupdate, pubdelete) from pg_publication where pubname not like '%messages%'
)
select kind || ' ' || line as line from lines order by 1
