-- ============================================================================
-- Gokul's Workspace — seed data (run after schema.sql)
-- ============================================================================
-- NOTE: profiles normally come from Google SSO via the on_auth_user_created
-- trigger. For local seeding we insert profile rows directly with fixed UUIDs.
-- In a hosted project, create the matching auth.users first or seed via the
-- Supabase Admin API.
-- ----------------------------------------------------------------------------

insert into profiles (id, name, email, avatar_color, role, department) values
  ('00000000-0000-0000-0000-000000000001', 'Gokul Krishna', 'gokul@company.com', '#6366f1', 'admin', null),
  ('00000000-0000-0000-0000-000000000002', 'Aisha Verma',   'aisha@company.com', '#ec4899', 'requester', 'Marketing'),
  ('00000000-0000-0000-0000-000000000003', 'Daniel Cruz',   'daniel@company.com','#0ea5e9', 'requester', 'Sales'),
  ('00000000-0000-0000-0000-000000000004', 'Meera Nair',    'meera@company.com', '#10b981', 'requester', 'Product'),
  ('00000000-0000-0000-0000-000000000005', 'Tom Becker',    'tom@company.com',   '#f59e0b', 'requester', 'People & Culture'),
  ('00000000-0000-0000-0000-000000000006', 'Lena Schmidt',  'lena@company.com',  '#8b5cf6', 'requester', 'Leadership')
on conflict (id) do nothing;

insert into tasks
  (title, description, business_objective, status, priority, deliverable_type, department,
   requester_id, contact_name, contact_email, contact_phone, deadline, effort, tags, intake_score)
values
  ('Q3 Product Launch — LinkedIn campaign creatives',
   'Coordinated set of 6 LinkedIn creatives for the v3 launch: hero, 3 feature spotlights, customer quote, demo CTA.',
   'Drive demo signups for the v3 launch and establish the refreshed visual identity.',
   'in_progress', 'critical', 'linkedin_creative', 'Marketing',
   '00000000-0000-0000-0000-000000000002', 'Aisha Verma', 'aisha@company.com', '+1 415 555 0142',
   (now() + interval '4 days')::date, 'large', '{launch,campaign,linkedin}', 92),

  ('Investor update deck — Q2 results',
   'Visual design pass on the 18-slide quarterly investor deck: charts, dividers, appendix template.',
   'Present Q2 performance to the board and investors with a professional, on-brand deck.',
   'waiting_inputs', 'high', 'presentation', 'Leadership',
   '00000000-0000-0000-0000-000000000006', 'Lena Schmidt', 'lena@company.com', '+1 415 555 0190',
   (now() + interval '6 days')::date, 'medium', '{deck,investor,board}', 71),

  ('Sales one-pager for enterprise prospects',
   'Single-page PDF leave-behind: 3 enterprise value props, logo wall, one ROI stat. Letter + A4.',
   'Increase reply rate on enterprise outbound with a polished leave-behind.',
   'todo', 'high', 'print_design', 'Sales',
   '00000000-0000-0000-0000-000000000003', 'Daniel Cruz', 'daniel@company.com', '+1 415 555 0177',
   (now() + interval '8 days')::date, 'small', '{sales,one-pager,enterprise}', 78),

  ('Onboarding welcome motion graphic',
   '15-second looping motion graphic for the new-hire welcome screen. Warm, human, no voiceover.',
   'Improve first-day experience and reinforce employer brand.',
   'backlog', 'medium', 'motion_graphic', 'People & Culture',
   '00000000-0000-0000-0000-000000000005', 'Tom Becker', 'tom@company.com', null,
   (now() + interval '20 days')::date, 'large', '{motion,hr,onboarding}', 64),

  ('Feature announcement — in-app banner asset',
   'Static 1200x300 dashboard banner announcing the analytics module. Small illustration + CTA chip.',
   'Drive adoption of the new analytics module among existing users.',
   'review', 'medium', 'website_asset', 'Product',
   '00000000-0000-0000-0000-000000000004', 'Meera Nair', 'meera@company.com', '+1 415 555 0133',
   (now() + interval '2 days')::date, 'small', '{product,banner,in-app}', 80);

-- A representative activity + comment for the launch task
with launch as (select id from tasks where title like 'Q3 Product Launch%' limit 1)
insert into activity_events (task_id, type, actor_id, message)
select launch.id, 'created', '00000000-0000-0000-0000-000000000002', 'Task created' from launch
union all
select launch.id, 'status_changed', '00000000-0000-0000-0000-000000000001', 'Moved to In Progress' from launch;
