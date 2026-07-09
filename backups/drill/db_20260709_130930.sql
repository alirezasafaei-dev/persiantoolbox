--
-- PostgreSQL database dump
--

\restrict sHykGHVPGokeSnmCC2AGwQUpX5VUcF8I5fbzoUguK7AWq4o8hGiImZf5nB7dNse

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.admin_audit_log (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    action text NOT NULL,
    user_id text DEFAULT ''::text NOT NULL,
    user_name text DEFAULT ''::text NOT NULL,
    details text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.admin_audit_log OWNER TO persiantoolbox;

--
-- Name: admin_coupons; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.admin_coupons (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    code text NOT NULL,
    percent integer DEFAULT 10 NOT NULL,
    max_uses integer DEFAULT 100 NOT NULL,
    used_count integer DEFAULT 0 NOT NULL,
    expires_at bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at bigint DEFAULT (EXTRACT(epoch FROM now()) * (1000)::numeric) NOT NULL,
    updated_at bigint DEFAULT (EXTRACT(epoch FROM now()) * (1000)::numeric) NOT NULL
);


ALTER TABLE public.admin_coupons OWNER TO persiantoolbox;

--
-- Name: admin_payments; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.admin_payments (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    user_id text NOT NULL,
    plan_id text NOT NULL,
    amount integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    coupon_code text,
    created_at bigint DEFAULT (EXTRACT(epoch FROM now()) * (1000)::numeric) NOT NULL
);


ALTER TABLE public.admin_payments OWNER TO persiantoolbox;

--
-- Name: admin_subscriptions; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.admin_subscriptions (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    user_id text NOT NULL,
    plan_id text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at bigint DEFAULT (EXTRACT(epoch FROM now()) * (1000)::numeric) NOT NULL,
    expires_at bigint DEFAULT ((EXTRACT(epoch FROM now()) + (86400)::numeric) * (1000)::numeric) NOT NULL,
    amount integer DEFAULT 0 NOT NULL,
    created_at bigint DEFAULT (EXTRACT(epoch FROM now()) * (1000)::numeric) NOT NULL,
    updated_at bigint DEFAULT (EXTRACT(epoch FROM now()) * (1000)::numeric) NOT NULL
);


ALTER TABLE public.admin_subscriptions OWNER TO persiantoolbox;

--
-- Name: analytics_counters; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.analytics_counters (
    kind text NOT NULL,
    key text NOT NULL,
    count bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.analytics_counters OWNER TO persiantoolbox;

--
-- Name: analytics_summary; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.analytics_summary (
    id integer NOT NULL,
    total_events bigint DEFAULT 0 NOT NULL,
    last_updated bigint
);


ALTER TABLE public.analytics_summary OWNER TO persiantoolbox;

--
-- Name: checkouts; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.checkouts (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    plan_id text NOT NULL,
    status text NOT NULL,
    created_at bigint NOT NULL,
    paid_at bigint
);


ALTER TABLE public.checkouts OWNER TO persiantoolbox;

--
-- Name: export_credits; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.export_credits (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    user_id text NOT NULL,
    plan_id text DEFAULT 'free'::text NOT NULL,
    monthly_used integer DEFAULT 0 NOT NULL,
    monthly_limit integer DEFAULT 0 NOT NULL,
    daily_used integer DEFAULT 0 NOT NULL,
    daily_limit integer DEFAULT 0 NOT NULL,
    monthly_reset_at bigint DEFAULT 0 NOT NULL,
    daily_reset_at bigint DEFAULT 0 NOT NULL,
    created_at bigint DEFAULT ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint NOT NULL,
    updated_at bigint DEFAULT ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint NOT NULL
);


ALTER TABLE public.export_credits OWNER TO persiantoolbox;

--
-- Name: export_transactions; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.export_transactions (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    user_id text NOT NULL,
    product text NOT NULL,
    credit_cost integer DEFAULT 1 NOT NULL,
    export_type text DEFAULT 'clean'::text NOT NULL,
    status text DEFAULT 'reserved'::text NOT NULL,
    completed_at bigint,
    created_at bigint DEFAULT ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint NOT NULL
);


ALTER TABLE public.export_transactions OWNER TO persiantoolbox;

--
-- Name: financial_scenarios; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.financial_scenarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    scenario_type text NOT NULL,
    inputs jsonb DEFAULT '{}'::jsonb NOT NULL,
    outputs jsonb DEFAULT '{}'::jsonb,
    notes text DEFAULT ''::text,
    created_at bigint NOT NULL,
    updated_at bigint NOT NULL
);


ALTER TABLE public.financial_scenarios OWNER TO persiantoolbox;

--
-- Name: history_entries; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.history_entries (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    tool text NOT NULL,
    input_summary text NOT NULL,
    output_summary text NOT NULL,
    output_url text,
    created_at bigint NOT NULL
);


ALTER TABLE public.history_entries OWNER TO persiantoolbox;

--
-- Name: history_share_links; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.history_share_links (
    token uuid NOT NULL,
    entry_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at bigint NOT NULL,
    expires_at bigint NOT NULL,
    output_url text
);


ALTER TABLE public.history_share_links OWNER TO persiantoolbox;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount bigint NOT NULL,
    currency text DEFAULT 'IRR'::text NOT NULL,
    method text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    metadata jsonb,
    created_at bigint NOT NULL,
    completed_at bigint
);


ALTER TABLE public.payments OWNER TO persiantoolbox;

--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at bigint DEFAULT (EXTRACT(epoch FROM now()))::bigint NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO persiantoolbox;

--
-- Name: rate_limit_metrics; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.rate_limit_metrics (
    key text NOT NULL,
    bucket_day bigint NOT NULL,
    blocked integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.rate_limit_metrics OWNER TO persiantoolbox;

--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.rate_limits (
    key text NOT NULL,
    count integer NOT NULL,
    window_start bigint NOT NULL
);


ALTER TABLE public.rate_limits OWNER TO persiantoolbox;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.sessions (
    id uuid NOT NULL,
    token text NOT NULL,
    user_id uuid NOT NULL,
    created_at bigint NOT NULL,
    expires_at bigint NOT NULL
);


ALTER TABLE public.sessions OWNER TO persiantoolbox;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.site_settings (
    key text NOT NULL,
    value text,
    updated_at bigint NOT NULL
);


ALTER TABLE public.site_settings OWNER TO persiantoolbox;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    plan_id text NOT NULL,
    status text NOT NULL,
    started_at bigint NOT NULL,
    expires_at bigint NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO persiantoolbox;

--
-- Name: tool_flags; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.tool_flags (
    tool_id text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    updated_at bigint DEFAULT (EXTRACT(epoch FROM now()) * (1000)::numeric) NOT NULL
);


ALTER TABLE public.tool_flags OWNER TO persiantoolbox;

--
-- Name: usage_tracking; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.usage_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_id text NOT NULL,
    date text NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    last_used_at bigint NOT NULL
);


ALTER TABLE public.usage_tracking OWNER TO persiantoolbox;

--
-- Name: users; Type: TABLE; Schema: public; Owner: persiantoolbox
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at bigint NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO persiantoolbox;

--
-- Data for Name: admin_audit_log; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.admin_audit_log (id, "timestamp", action, user_id, user_name, details) FROM stdin;
\.


--
-- Data for Name: admin_coupons; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.admin_coupons (id, code, percent, max_uses, used_count, expires_at, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_payments; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.admin_payments (id, user_id, plan_id, amount, status, coupon_code, created_at) FROM stdin;
\.


--
-- Data for Name: admin_subscriptions; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.admin_subscriptions (id, user_id, plan_id, status, started_at, expires_at, amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: analytics_counters; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.analytics_counters (kind, key, count) FROM stdin;
\.


--
-- Data for Name: analytics_summary; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.analytics_summary (id, total_events, last_updated) FROM stdin;
1	0	\N
\.


--
-- Data for Name: checkouts; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.checkouts (id, user_id, plan_id, status, created_at, paid_at) FROM stdin;
\.


--
-- Data for Name: export_credits; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.export_credits (id, user_id, plan_id, monthly_used, monthly_limit, daily_used, daily_limit, monthly_reset_at, daily_reset_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: export_transactions; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.export_transactions (id, user_id, product, credit_cost, export_type, status, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: financial_scenarios; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.financial_scenarios (id, user_id, title, scenario_type, inputs, outputs, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: history_entries; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.history_entries (id, user_id, tool, input_summary, output_summary, output_url, created_at) FROM stdin;
\.


--
-- Data for Name: history_share_links; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.history_share_links (token, entry_id, user_id, created_at, expires_at, output_url) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.payments (id, user_id, amount, currency, method, status, description, metadata, created_at, completed_at) FROM stdin;
45528992-259d-4451-8bee-efb5077be7d2	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	99000	IRR	zarinpal	pending	اشتراک پایه	{"planId": "basic"}	1782592917005	\N
dbefc296-f65b-437d-aa8e-8a09e3a3f1aa	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	99000	IRR	zarinpal	pending	اشتراک پایه	{"planId": "basic"}	1782593093347	\N
f558060a-483a-494b-9fbf-a4905fcf037c	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	99000	IRR	zarinpal	pending	اشتراک پایه	{"planId": "basic"}	1782593875644	\N
c82976cc-abef-4d75-a327-f087268575f2	56f8f5df-0eb6-407f-9c06-af836ce55d59	49000	IRR	zarinpal	pending	اشتراک بسته ۳ خروجی	{"planId": "pack-3"}	1783584964615	\N
35874728-76ee-4e1e-bb49-216b96ee5d28	56f8f5df-0eb6-407f-9c06-af836ce55d59	199000	IRR	zarinpal	pending	اشتراک استاندارد	{"planId": "standard"}	1783584969650	\N
4bd7cdc8-d80f-4726-ad35-416760028395	67afd1cb-1731-4d55-acd9-30631379c6fc	49000	IRR	zarinpal	pending	اشتراک بسته ۳ خروجی	{"planId": "pack-3"}	1783585125300	\N
97cdc654-3c23-498a-a4af-b07a43d7072e	67afd1cb-1731-4d55-acd9-30631379c6fc	199000	IRR	zarinpal	pending	اشتراک استاندارد	{"planId": "standard"}	1783585133946	\N
c3fde572-c6ce-4fa3-8a14-d774aca22d25	67afd1cb-1731-4d55-acd9-30631379c6fc	199000	IRR	zarinpal	pending	اشتراک استاندارد	{"planId": "standard"}	1783585141477	\N
9ec8b088-9454-44f3-a98b-c407ebc9fb0f	56f8f5df-0eb6-407f-9c06-af836ce55d59	199000	IRR	zarinpal	pending	اشتراک استاندارد	{"planId": "standard"}	1783591038496	\N
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at) FROM stdin;
\.


--
-- Data for Name: rate_limit_metrics; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.rate_limit_metrics (key, bucket_day, blocked) FROM stdin;
\.


--
-- Data for Name: rate_limits; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.rate_limits (key, count, window_start) FROM stdin;
auth:register:dbtest2@test.com:5.121.112.193	1	1782233305254
auth:login:dbtest2@test.com:5.121.112.193	1	1782233350816
auth:register:test-deploy-1782310799@example.com:5.121.112.193	1	1782310803981
auth:register:test-1782311686@example.com:5.121.112.193	1	1782311690340
auth:login:test-1782311686@example.com:5.121.112.193	1	1782312149605
auth:register:live-test-1782312864155@example.com:5.121.112.193	1	1782312866406
auth:register:asdevelooper@gmail.com:5.121.112.193	1	1782315743641
auth:register:test-audit-1782592113@example.com:146.70.72.210	1	1782592114670
auth:login:test@example.com:146.70.72.210	1	1782592149635
auth:register:audit-test-1782592177@example.com:146.70.72.210	1	1782592179171
subscription:checkout:5.122.207.84	3	1783585124795
auth:login:audit-test-1782592177@example.com:146.70.72.210	1	1782593873990
auth:login:asdevelooper@gmail.com:5.122.210.97	1	1782624719949
admin_site_settings:5.121.112.193	1	1782653174931
auth:login:asdevelooper@gmail.com:5.121.112.193	1	1782653200705
auth:login:asdevelooper@gmail.com:146.70.179.210	1	1782653361903
subscription:checkout:88.99.105.238	2	1783591116034
admin_site_settings:146.70.179.210	1	1782656173496
auth:forgot-password:test@test.com:146.70.179.210	1	1782667343727
auth:forgot-password:test@test.com:137.74.12.250	2	1782689537973
subscription:checkout:193.93.169.32	1	1783592245295
usage:track:137.74.12.250	7	1782689622893
admin_site_settings:5.121.108.237	1	1782714949357
auth:login:asdevelooper@gmail.com:5.121.108.237	2	1782714897252
auth:register:test@test.com:137.74.12.250	1	1782727032739
newsletter:5.122.75.1	3	1782812481845
usage:track:5.122.75.1	1	1782812527305
newsletter:146.70.72.210	1	1782822570030
auth:login:asdevelooper@gmail.com:137.74.12.250	1	1783260933108
admin_site_settings:56f8f5df-0eb6-407f-9c06-af836ce55d59:137.74.12.250	1	1783263772309
admin_site_settings:127.0.0.1	1	1783315399292
admin_site_settings:137.74.12.250	2	1783315481061
auth:login:asdevelooper@gmail.com:5.122.207.84	1	1783584936782
admin_site_settings:5.122.207.84	1	1783585008843
admin_site_settings:56f8f5df-0eb6-407f-9c06-af836ce55d59:5.122.207.84	5	1783585009043
auth:register:parsairaniiidev@gmail.com:5.122.207.84	1	1783585110043
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.sessions (id, token, user_id, created_at, expires_at) FROM stdin;
e9929687-74c2-4b88-8f63-3e70f0bcdffd	93d6c315e955a38776490e9be1c0bda49067e4bd5b47145da7fa151d36f3e5f4	f87022a9-a0de-4c41-8611-1523fe19190a	1782233305423	1782838105423
797c0514-5a19-4ada-950a-cedfedfea713	52e03f5a3c9b27d4034018db6eb7af243494702c70543f727ca1fb56952c5c1c	f87022a9-a0de-4c41-8611-1523fe19190a	1782233350935	1782838150935
5b5eb5ef-f836-4938-bf35-beb99346125e	ec93e27f1aa0860856cabf8012ef1e8b47b65840c067ea59a0544f2a40ed4395	b14a8017-570c-4c5f-823c-83aaf47f0317	1782310804154	1782915604154
d5cda0bf-ff02-4206-9f4e-70e12e26e93d	f8d220ac7fdb4507befc3b608e3e3c1f168b331bf7fa6510bc33bb6df1f0e990	b5e2b045-c724-4d2e-8819-f62effa1b3e0	1782311569277	1782916369277
b963b294-099a-460e-bc29-dfdd38cf9a98	7edc713f5aede6aeab14c5fb9306cc0c1c4336f9347ab963a23bc68788c90691	088f405b-49d2-470a-a5eb-a1efadf37951	1782311690538	1782916490538
993d2f63-2141-4661-a334-7cf2864529dc	cdfa54826de3b3f417092ecdfadfffd33e12b8d02ea52e045407e003461468be	088f405b-49d2-470a-a5eb-a1efadf37951	1782311694981	1782916494981
19cbf10c-7789-4931-a251-fc98cd6e4b50	215325b0d2d2d380ce1dc346a7fe884bac16b6df9b5e329137c93c172173b2a5	088f405b-49d2-470a-a5eb-a1efadf37951	1782312149821	1782916949821
182c43b0-8f6d-4a7d-81ae-e39cebaa5c3b	fffd3a4aaa0ea6a89652e01ff8b5f6781d8685963d476c74c01a33170dd2b407	da66c59e-04e8-44e0-b77c-df6af8ede7f8	1782312655967	1782917455967
6790be1b-78d2-49dd-aeee-9b278a3e3b61	7cdedc41ae1e25b51cff877c1a912e1bf334d054e41ec41f27b79b4b59b70e6f	be5c9698-7cc1-44fa-b5b2-93fd90a2050b	1782312866586	1782917666586
cf50b821-01e5-4c98-8efa-a2123b7c85ce	7f5de095653b00c06377ea1d972b58e19e2fadafe4cdb583bc08635598cf82e8	dbb78b7a-a2df-4e1b-a1f1-517e606677dd	1782313035730	1782917835730
288cfcb6-72fa-4604-b67f-9028fd9980d0	294e25fe56b6051abea08c61d2a6d21a3ba04bd860119ebc0466cef74cbfc71a	56f8f5df-0eb6-407f-9c06-af836ce55d59	1782315797045	1782920597045
ee0b5dd0-cc50-47da-a913-1230fcef87cc	372636c189d9a7482dd233c89c0e25c4a20945324607202169847677e2eaffdf	4127303e-c02e-4133-8dad-929a11994f62	1782592115373	1783196915373
401768d7-7bff-45d1-89ef-fa9c7a23cb21	7efdd7712e1aef5533e445390cd4063e3dbef642cf2316604f4a9a4d32a0da2b	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	1782592179388	1783196979388
e073873f-5d3a-47a4-80a5-3ea126c8e5d5	813f4d318355dc7f61bf2dba001a35842d18691689e16b82897156c169c2c65b	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	1782592193796	1783196993796
3d0fd79b-35e6-4c59-bc97-3b023b81d819	f3d1dd4e57aa4ccca4b3f45e098621bfa143b08d4784e28fed8ab86394f2e1c5	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	1782592216395	1783197016395
1e9f6153-1904-4ea0-9e7f-7228ed55326e	1eb80fbcc83263ec431261f9027a51dc34bd69d234cc3ab6c5d3b103e0bd048f	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	1782592915573	1783197715573
16137fbe-1637-4942-9a8d-41ade2921e55	1f1faeecd2b89d8115bee171b3f77488578982ead3a56d5c7bc1e73d72536834	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	1782593091752	1783197891752
345701dc-14da-46de-8b64-3d71cdc614be	6d039c2873b71d3eead5273a885bbc9bc1a90be3523adf9c31bffacf23ae2c60	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	1782593091774	1783197891774
c8ee42bd-3f10-46fc-b424-8c62a76cb982	f310e5579e25d26af47251fcc2c23792db220e76ab04392a55e79fadae8c31c3	553bfeec-5a5b-472f-a94c-70ad5d93ee2f	1782593874234	1783198674234
6685ff6f-28c8-46f1-97c1-3ddaba2a7d61	940fa74e5ef7766643d252b2b47acac5d155b4f8895bb8dd2d4724e431fc5682	56f8f5df-0eb6-407f-9c06-af836ce55d59	1782624720126	1783229520126
a56f636f-cac0-45dc-b45e-e8bf26be54f3	e72613f50e0ca69518ac23bae3e2162b9c2629163437bf35a405d71add761aa0	56f8f5df-0eb6-407f-9c06-af836ce55d59	1782653200894	1783258000894
2217ff89-15e4-42c5-8e51-0471921fb901	940a47a361474452c6c56cef01ce17dec5e15f706fdf197a96d7334326367d53	56f8f5df-0eb6-407f-9c06-af836ce55d59	1782714976927	1783319776927
f64c97ef-9667-4162-aac9-880b15691822	fc80c647c67901a8b719f5d2621e6ddf0256ecc3739c080bdd5a7ab0ca8c2f5b	16566f76-9e59-42ed-b6f1-5e7555a14aaf	1782727032958	1783331832958
ae2fc483-bcfb-4c52-9f2c-af965d4505e0	f9c4b0edf59a8cb9a4ca024eeb2dca191299fad24e7e6e31f4eb91631122c9e2	56f8f5df-0eb6-407f-9c06-af836ce55d59	1782755480476	1783360280476
0f3025fb-2031-4077-bcc5-aef4ac261605	7ab2a9ac575c41c2ded80f7230a242ee6f8be41a767fc31979fd90089b9bd56c	56f8f5df-0eb6-407f-9c06-af836ce55d59	1783259970237	1783864770237
92801b6c-b17d-4777-92e4-a4f8887e7ff5	cf5b7dabdd0eabd529a4b85d6f2768b66b07c2855de7a3969eea2eabf685d62a	56f8f5df-0eb6-407f-9c06-af836ce55d59	1783260933229	1783865733229
bfbc305b-a061-4467-8e0c-3dd0372767fb	bdb878adba18137bdd93b79df1d105469be39635b59a2d1884713fdd063ea692	67afd1cb-1731-4d55-acd9-30631379c6fc	1783585110590	1784189910590
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.site_settings (key, value, updated_at) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.subscriptions (id, user_id, plan_id, status, started_at, expires_at) FROM stdin;
\.


--
-- Data for Name: tool_flags; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.tool_flags (tool_id, enabled, updated_at) FROM stdin;
\.


--
-- Data for Name: usage_tracking; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.usage_tracking (id, user_id, tool_id, date, count, last_used_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: persiantoolbox
--

COPY public.users (id, email, password_hash, created_at, role) FROM stdin;
f87022a9-a0de-4c41-8611-1523fe19190a	dbtest2@test.com	598e37fc04564ac2b8a9860e094c118c:bb34cbbd9f4bacead0cb9ed1da1451c058773fe33215a01511c44f2c09d7184528e32e8e9f4be955e3695806139a40f26df6a805237d3014ef78335324889244	1782233305331	user
b14a8017-570c-4c5f-823c-83aaf47f0317	test-deploy-1782310799@example.com	0316581abc293cbbe0dc77ce939c03f1:9df3b29514b8bd8135956f3c6a1c2af55d4c5b938a5b5e3623d555861b9bb4c3eb05928740b78161aecb15b0c06b5dc062750b156bf2e45d7c7ea3e9a4a03d00	1782310804058	user
b5e2b045-c724-4d2e-8819-f62effa1b3e0	test-1782311564@example.com	9a3fbe768d2adb700568fb6b07e8d173:198cddfd480e08645af76119a3406b257f67efbb766a315437c5d20a1be0f5592ff5ae7cab5a5043a8dd038fa4f2ca240d27276a877927f4724e15cd0270a485	1782311569149	user
088f405b-49d2-470a-a5eb-a1efadf37951	test-1782311686@example.com	69b560378c2a0a6fa0703340893ad9f1:412040d3545be98d0a016da3a88489ad0be4f015ecb494cc3740dc6372b44f9ab3c73cb95bb039fe4ddd267e1199dda650fe87c1d70160ae65987590b2045150	1782311690416	user
da66c59e-04e8-44e0-b77c-df6af8ede7f8	live-test-1782312655679@example.com	b11029cc1ffd9f0ae3868e985a4fa2df:5b8b7d366b8fab349941418a86cf8d6ffee70660f560ad05b4a2e6f21c4d66971f2ebd989ce5f317868ac4258a8dd6d67c847bc04417be8942612fe898f1ca86	1782312655848	user
be5c9698-7cc1-44fa-b5b2-93fd90a2050b	live-test-1782312864155@example.com	7c40f61831dd88b13c75253279685021:b1ec7a5b23f30638a638f5049f8a9848d11850b7195ff2e7642be6fefcfb5352865fc1bdb7bd837fb1cdab983d958c085a223a903ef64ff77f1f257a607b875a	1782312866478	user
dbb78b7a-a2df-4e1b-a1f1-517e606677dd	live-test-1782313034560@example.com	5a7f08f0125116d0ebc760e572a05bc4:5f37018d06bf0d1f5034a4a3e133714e25056ac184d601a2db12a70e41984b753a5a48c4663635958019156d3d653f746dcfb2be156ede1dc309e27cbdaa1578	1782313035656	user
4127303e-c02e-4133-8dad-929a11994f62	test-audit-1782592113@example.com	d5aeed42496e9ef2fcea1f4695e29192:2a11c6b283728a37a25352ffc844685747f75377e702543a91e9761f39f7b5098898d8fe9ca28d419d4360425da756ab2aa141592733dcd18cf942b536468da0	1782592115214	user
553bfeec-5a5b-472f-a94c-70ad5d93ee2f	audit-test-1782592177@example.com	efd0e7eec40aa482277de4802a3b88f6:77991219154da02a118363474ee26afa5b0cf67d7cc84ab01150a881f01c4ccff8de3bac0c06f767cb509865d2ac6bc279d95dd36d488fe0cfa195d4dbdfcb3b	1782592179229	user
16566f76-9e59-42ed-b6f1-5e7555a14aaf	test@test.com	a67fdb7ed8c3dd394dceb10c61b6a60c:e07012ae00481027b139718856815dcbf8c4381671e9b37d682cf9c7b3206c37640b34ab5d4b74e6b611b226c4c0e5587cd6679599cd751a103e2579fca1bdb8	1782727032856	user
56f8f5df-0eb6-407f-9c06-af836ce55d59	asdevelooper@gmail.com	7b1ac399fdff81ffac9943103449bac2:296c0d6ee44b24c3c72c9ee10e95d060faad335817dba56cb2347a230acba28eab2c685939da3fea0ed06fe13bd4b268b599a61ba123530dc4ff983a1dfb990e	1782315743724	admin
67afd1cb-1731-4d55-acd9-30631379c6fc	parsairaniiidev@gmail.com	b0fed7567626bf4835b15cbf2a128d95:b240c932430f12666b49e525aae13bd97f4f839f5e3d092cce67836f30f4c657c382b7acc28ebe7c8cd1f5e26b306dc60120a1a63f01f64c43078f571b9d6f3f	1783585110218	user
\.


--
-- Name: admin_audit_log admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.admin_audit_log
    ADD CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id);


--
-- Name: admin_coupons admin_coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.admin_coupons
    ADD CONSTRAINT admin_coupons_code_key UNIQUE (code);


--
-- Name: admin_coupons admin_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.admin_coupons
    ADD CONSTRAINT admin_coupons_pkey PRIMARY KEY (id);


--
-- Name: admin_payments admin_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.admin_payments
    ADD CONSTRAINT admin_payments_pkey PRIMARY KEY (id);


--
-- Name: admin_subscriptions admin_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.admin_subscriptions
    ADD CONSTRAINT admin_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: analytics_counters analytics_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.analytics_counters
    ADD CONSTRAINT analytics_counters_pkey PRIMARY KEY (kind, key);


--
-- Name: analytics_summary analytics_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.analytics_summary
    ADD CONSTRAINT analytics_summary_pkey PRIMARY KEY (id);


--
-- Name: checkouts checkouts_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.checkouts
    ADD CONSTRAINT checkouts_pkey PRIMARY KEY (id);


--
-- Name: export_credits export_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.export_credits
    ADD CONSTRAINT export_credits_pkey PRIMARY KEY (id);


--
-- Name: export_credits export_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.export_credits
    ADD CONSTRAINT export_credits_user_id_key UNIQUE (user_id);


--
-- Name: export_transactions export_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.export_transactions
    ADD CONSTRAINT export_transactions_pkey PRIMARY KEY (id);


--
-- Name: financial_scenarios financial_scenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.financial_scenarios
    ADD CONSTRAINT financial_scenarios_pkey PRIMARY KEY (id);


--
-- Name: history_entries history_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.history_entries
    ADD CONSTRAINT history_entries_pkey PRIMARY KEY (id);


--
-- Name: history_share_links history_share_links_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.history_share_links
    ADD CONSTRAINT history_share_links_pkey PRIMARY KEY (token);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: rate_limit_metrics rate_limit_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.rate_limit_metrics
    ADD CONSTRAINT rate_limit_metrics_pkey PRIMARY KEY (key, bucket_day);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (key);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (token);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tool_flags tool_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.tool_flags
    ADD CONSTRAINT tool_flags_pkey PRIMARY KEY (tool_id);


--
-- Name: usage_tracking usage_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_pkey PRIMARY KEY (id);


--
-- Name: usage_tracking usage_tracking_user_id_tool_id_date_key; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_user_id_tool_id_date_key UNIQUE (user_id, tool_id, date);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: analytics_counters_kind_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX analytics_counters_kind_idx ON public.analytics_counters USING btree (kind);


--
-- Name: checkouts_status_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX checkouts_status_idx ON public.checkouts USING btree (status);


--
-- Name: checkouts_user_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX checkouts_user_idx ON public.checkouts USING btree (user_id);


--
-- Name: financial_scenarios_type_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX financial_scenarios_type_idx ON public.financial_scenarios USING btree (scenario_type);


--
-- Name: financial_scenarios_user_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX financial_scenarios_user_idx ON public.financial_scenarios USING btree (user_id);


--
-- Name: history_share_links_expires_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX history_share_links_expires_idx ON public.history_share_links USING btree (expires_at);


--
-- Name: history_share_links_user_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX history_share_links_user_idx ON public.history_share_links USING btree (user_id);


--
-- Name: history_user_created_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX history_user_created_idx ON public.history_entries USING btree (user_id, created_at DESC);


--
-- Name: idx_admin_coupon_code; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_admin_coupon_code ON public.admin_coupons USING btree (code);


--
-- Name: idx_admin_pay_status; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_admin_pay_status ON public.admin_payments USING btree (status);


--
-- Name: idx_admin_pay_user; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_admin_pay_user ON public.admin_payments USING btree (user_id);


--
-- Name: idx_admin_sub_status; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_admin_sub_status ON public.admin_subscriptions USING btree (status);


--
-- Name: idx_admin_sub_user; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_admin_sub_user ON public.admin_subscriptions USING btree (user_id);


--
-- Name: idx_audit_log_action; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_audit_log_action ON public.admin_audit_log USING btree (action);


--
-- Name: idx_audit_log_timestamp; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_audit_log_timestamp ON public.admin_audit_log USING btree ("timestamp" DESC);


--
-- Name: idx_export_credits_user; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_export_credits_user ON public.export_credits USING btree (user_id);


--
-- Name: idx_export_tx_created; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_export_tx_created ON public.export_transactions USING btree (created_at);


--
-- Name: idx_export_tx_status; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_export_tx_status ON public.export_transactions USING btree (status);


--
-- Name: idx_export_tx_user; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_export_tx_user ON public.export_transactions USING btree (user_id);


--
-- Name: idx_export_tx_user_product; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX idx_export_tx_user_product ON public.export_transactions USING btree (user_id, product, status);


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payments_user_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX payments_user_idx ON public.payments USING btree (user_id);


--
-- Name: push_subscriptions_endpoint_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX push_subscriptions_endpoint_idx ON public.push_subscriptions USING btree (endpoint);


--
-- Name: push_subscriptions_user_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX push_subscriptions_user_idx ON public.push_subscriptions USING btree (user_id);


--
-- Name: sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX sessions_expires_at_idx ON public.sessions USING btree (expires_at);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: subscriptions_expires_at_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX subscriptions_expires_at_idx ON public.subscriptions USING btree (expires_at);


--
-- Name: subscriptions_user_status_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX subscriptions_user_status_idx ON public.subscriptions USING btree (user_id, status);


--
-- Name: usage_tracking_date_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX usage_tracking_date_idx ON public.usage_tracking USING btree (date);


--
-- Name: usage_tracking_user_idx; Type: INDEX; Schema: public; Owner: persiantoolbox
--

CREATE INDEX usage_tracking_user_idx ON public.usage_tracking USING btree (user_id);


--
-- Name: checkouts checkouts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.checkouts
    ADD CONSTRAINT checkouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: financial_scenarios financial_scenarios_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.financial_scenarios
    ADD CONSTRAINT financial_scenarios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: history_entries history_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.history_entries
    ADD CONSTRAINT history_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: history_share_links history_share_links_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.history_share_links
    ADD CONSTRAINT history_share_links_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.history_entries(id) ON DELETE CASCADE;


--
-- Name: history_share_links history_share_links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.history_share_links
    ADD CONSTRAINT history_share_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: usage_tracking usage_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: persiantoolbox
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sHykGHVPGokeSnmCC2AGwQUpX5VUcF8I5fbzoUguK7AWq4o8hGiImZf5nB7dNse

