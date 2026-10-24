set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.sync_user_to_public_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_name text;
BEGIN
  v_name := initcap(substring(NEW.email from 1 for position('@' in NEW.email) - 1));

  INSERT INTO public.user (id, display_name, real_name)
  VALUES (NEW.id, v_name, v_name); RETURN NEW;
END;
$function$;
