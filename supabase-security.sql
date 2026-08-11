-- SHOT Security Hardening for Production
-- IMPORTANT:
-- 1) Do not store admin PINs / passwords in public settings tables.
-- 2) Use Supabase Auth for admin users and keep admin write access behind auth.role() = 'authenticated'.
-- 3) Public anon users may only create contact/order messages; they must not modify site content.

-- OPTIONAL: if you still have admin_pin in settings, remove it before going live.
-- ALTER TABLE public.settings DROP COLUMN IF EXISTS admin_pin;

-- Enable RLS on all tables used by the website.
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public read access for site content.
CREATE POLICY "works_select_public" ON public.works
FOR SELECT USING (true);

CREATE POLICY "plans_select_public" ON public.plans
FOR SELECT USING (true);

CREATE POLICY "testimonials_select_public" ON public.testimonials
FOR SELECT USING (true);

CREATE POLICY "services_select_public" ON public.services
FOR SELECT USING (true);

CREATE POLICY "hero_content_select_public" ON public.hero_content
FOR SELECT USING (true);

CREATE POLICY "about_content_select_public" ON public.about_content
FOR SELECT USING (true);

CREATE POLICY "settings_select_public" ON public.settings
FOR SELECT USING (true);

-- Public contact/order form insert only.
CREATE POLICY "messages_insert_public" ON public.messages
FOR INSERT WITH CHECK (true);

-- Admin-only write access.
CREATE POLICY "works_admin_write" ON public.works
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "works_admin_update" ON public.works
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "works_admin_delete" ON public.works
FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "plans_admin_write" ON public.plans
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "plans_admin_update" ON public.plans
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "plans_admin_delete" ON public.plans
FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "testimonials_admin_write" ON public.testimonials
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "testimonials_admin_update" ON public.testimonials
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "testimonials_admin_delete" ON public.testimonials
FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "services_admin_write" ON public.services
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "services_admin_update" ON public.services
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "services_admin_delete" ON public.services
FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "hero_content_admin_write" ON public.hero_content
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "hero_content_admin_update" ON public.hero_content
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "about_content_admin_write" ON public.about_content
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "about_content_admin_update" ON public.about_content
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "settings_admin_write" ON public.settings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "settings_admin_update" ON public.settings
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Messages read/update/delete should be admin-only.
CREATE POLICY "messages_admin_read" ON public.messages
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "messages_admin_update" ON public.messages
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "messages_admin_delete" ON public.messages
FOR DELETE USING (auth.role() = 'authenticated');

-- Recommended: Create a real admin user in Supabase Auth and grant only that account access.
-- You should not use the anon key for admin operations in production.
