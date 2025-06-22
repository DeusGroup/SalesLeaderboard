--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

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
-- Name: admin; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.admin OWNER TO neondb_owner;

--
-- Name: admin_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_id_seq OWNER TO neondb_owner;

--
-- Name: admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;


--
-- Name: participants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.participants (
    id integer NOT NULL,
    name text NOT NULL,
    board_revenue integer DEFAULT 0 NOT NULL,
    msp_revenue integer DEFAULT 0 NOT NULL,
    voice_seats integer DEFAULT 0 NOT NULL,
    total_deals integer DEFAULT 0 NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    role text DEFAULT 'Sales Representative'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    department text DEFAULT 'IT'::text,
    avatar_url text,
    board_revenue_goal integer DEFAULT 0 NOT NULL,
    msp_revenue_goal integer DEFAULT 0 NOT NULL,
    voice_seats_goal integer DEFAULT 0 NOT NULL,
    total_deals_goal integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.participants OWNER TO neondb_owner;

--
-- Name: participants_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.participants_id_seq OWNER TO neondb_owner;

--
-- Name: participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.participants_id_seq OWNED BY public.participants.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: admin id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin ALTER COLUMN id SET DEFAULT nextval('public.admin_id_seq'::regclass);


--
-- Name: participants id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.participants ALTER COLUMN id SET DEFAULT nextval('public.participants_id_seq'::regclass);


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin (id, username, password) FROM stdin;
1	admin	Welcome1
\.


--
-- Data for Name: participants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.participants (id, name, board_revenue, msp_revenue, voice_seats, total_deals, score, role, created_at, department, avatar_url, board_revenue_goal, msp_revenue_goal, voice_seats_goal, total_deals_goal) FROM stdin;
11	Lauren	4840	0	7	1	5910	Sales Representative	2025-03-07 19:05:06.824128	IT	\N	34000	500	25	4
10	Sharon 	0	0	0	0	0	Sales Representative	2025-03-07 19:04:50.625131	IT	\N	40000	500	25	4
12	Dylan 	0	0	0	0	0	Sales Representative	2025-03-07 19:05:11.664618	IT	\N	26000	500	25	4
13	Rebecca 	11997	999	0	1	14995	Sales Representative	2025-03-07 19:05:15.896971	IT	\N	15000	500	25	4
9	Andrew	20406	0	0	2	22406	Sales Representative	2025-03-07 18:59:14.10858	IT	\N	40000	500	25	4
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
JwfJXbjapIPreDxUyRmNDFDvjM_RrU5q	{"cookie":{"originalMaxAge":null,"expires":null,"secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-14 19:08:54
\.


--
-- Name: admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_id_seq', 1, true);


--
-- Name: participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.participants_id_seq', 13, true);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- Name: admin admin_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_username_key UNIQUE (username);


--
-- Name: participants participants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

