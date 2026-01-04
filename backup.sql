--
-- PostgreSQL database dump
--

\restrict zE9vlsKSX8xrqXOc17Kko7g0Ykv6NLjgmUWaoydgDYXpqJsfXQGMjP6pR27cPJV

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.workspaces DROP CONSTRAINT IF EXISTS workspaces_owner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.lists DROP CONSTRAINT IF EXISTS lists_board_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_list_id_fkey;
ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS boards_workspace_id_fkey;
DROP INDEX IF EXISTS public.ix_workspaces_name;
DROP INDEX IF EXISTS public.ix_workspaces_id;
DROP INDEX IF EXISTS public.ix_users_username;
DROP INDEX IF EXISTS public.ix_users_id;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_lists_name;
DROP INDEX IF EXISTS public.ix_lists_id;
DROP INDEX IF EXISTS public.ix_cards_name;
DROP INDEX IF EXISTS public.ix_cards_id;
DROP INDEX IF EXISTS public.ix_boards_name;
DROP INDEX IF EXISTS public.ix_boards_id;
ALTER TABLE IF EXISTS ONLY public.workspaces DROP CONSTRAINT IF EXISTS workspaces_pkey;
ALTER TABLE IF EXISTS ONLY public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.lists DROP CONSTRAINT IF EXISTS lists_pkey;
ALTER TABLE IF EXISTS ONLY public.cards DROP CONSTRAINT IF EXISTS cards_pkey;
ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS boards_pkey;
ALTER TABLE IF EXISTS public.workspaces ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.lists ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cards ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.boards ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.workspaces_id_seq;
DROP TABLE IF EXISTS public.workspaces;
DROP TABLE IF EXISTS public.workspace_members;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.lists_id_seq;
DROP TABLE IF EXISTS public.lists;
DROP SEQUENCE IF EXISTS public.cards_id_seq;
DROP TABLE IF EXISTS public.cards;
DROP SEQUENCE IF EXISTS public.boards_id_seq;
DROP TABLE IF EXISTS public.boards;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: boards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boards (
    id integer NOT NULL,
    name character varying,
    workspace_id integer
);


--
-- Name: boards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.boards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: boards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cards (
    id integer NOT NULL,
    name character varying,
    description character varying,
    "position" integer,
    list_id integer
);


--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


--
-- Name: lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lists (
    id integer NOT NULL,
    name character varying,
    "position" integer,
    board_id integer
);


--
-- Name: lists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lists_id_seq OWNED BY public.lists.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying,
    email character varying,
    hashed_password character varying,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_members (
    workspace_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id integer NOT NULL,
    name character varying,
    owner_id integer
);


--
-- Name: workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workspaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workspaces_id_seq OWNED BY public.workspaces.id;


--
-- Name: boards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


--
-- Name: lists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists ALTER COLUMN id SET DEFAULT nextval('public.lists_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workspaces id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN id SET DEFAULT nextval('public.workspaces_id_seq'::regclass);


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.boards (id, name, workspace_id) FROM stdin;
2	Yapılacaklar listemiz	2
3	Alınacaklar listemiz	2
4	Günlük işler listemiz	2
7	Yemek listemiz	2
\.


--
-- Data for Name: cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cards (id, name, description, "position", list_id) FROM stdin;
10	Süpürge yapılacak 	\N	0	6
12	Pazar alışverişi 	\N	2	6
13	Market alışverişi	\N	3	6
14	Kek yapımı 	\N	4	6
15	Kocişle duş seansı 	\N	5	6
17	Fırında cipsli tavuk 	\N	0	13
18	Deniz börülcesi 	\N	1	13
19	Pilav 	\N	2	13
20	Salata 	\N	3	13
22	Yöresel börek 	\N	4	13
23	Kek 	\N	5	13
24	Karabuğday kısır 	\N	6	13
25	Soğan 	\N	0	9
26	Salatalık malzeme 	\N	1	9
27	Biber 	\N	2	9
28	Muz 	\N	3	9
29	Yumurta 	\N	4	9
30	Sucuk 	\N	5	9
31	Kaşar 	\N	6	9
32	Ezine peynir 	\N	7	9
21	Puding 	\N	6	13
11	Giyinme odası düzenleme 	\N	5	6
\.


--
-- Data for Name: lists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lists (id, name, "position", board_id) FROM stdin;
6	Yapılacak	0	2
7	Yapılıyor	1	2
8	Yapıldı	2	2
9	Alınacak	0	3
10	Yolda	1	3
11	Alındı	2	3
12	İade	3	3
13	Yapılacak	0	4
14	Yapılıyor	1	4
15	Yapıldı	2	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, hashed_password, is_active, created_at) FROM stdin;
1	Doğukan	dgkngk99@gmail.com	$2b$12$E.vCtxActEDhxf5Mli5WYOv1BkDdd6.F2XIYE56uWI6.UddD59WmS	t	2025-10-02 16:53:44.699078+00
2	asdasd	asdasd@asd.com	$2b$12$xKY4MClNjxcJTnBtmh.Dwe7/wyIwfOeD.oRnJO2y7vMBIxXTR9/W.	t	2025-10-02 16:55:16.871244+00
3	merve	merveeyilmazzz99@gmail.com	$2b$12$O9UZOPFTfs4kDbthrTnH9.lTI1OaNIIj5Gor5Ylt6eoNHfAz5fsJW	t	2025-10-03 06:32:42.117837+00
4	test	test@test.com	$2b$12$AvfFJ6CdLL/4T5QqHM7QjOqq6Pzpp73tL6RbYmLPVeMk8kPYBxjtO	t	2025-10-31 07:34:47.471101+00
\.


--
-- Data for Name: workspace_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workspace_members (workspace_id, user_id) FROM stdin;
2	3
\.


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workspaces (id, name, owner_id) FROM stdin;
2	Merve Doğukan Gök <3	1
\.


--
-- Name: boards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.boards_id_seq', 7, true);


--
-- Name: cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cards_id_seq', 32, true);


--
-- Name: lists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lists_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: workspaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workspaces_id_seq', 9, true);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: lists lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (workspace_id, user_id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: ix_boards_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_boards_id ON public.boards USING btree (id);


--
-- Name: ix_boards_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_boards_name ON public.boards USING btree (name);


--
-- Name: ix_cards_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_cards_id ON public.cards USING btree (id);


--
-- Name: ix_cards_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_cards_name ON public.cards USING btree (name);


--
-- Name: ix_lists_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_lists_id ON public.lists USING btree (id);


--
-- Name: ix_lists_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_lists_name ON public.lists USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: ix_workspaces_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_workspaces_id ON public.workspaces USING btree (id);


--
-- Name: ix_workspaces_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_workspaces_name ON public.workspaces USING btree (name);


--
-- Name: boards boards_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: cards cards_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;


--
-- Name: lists lists_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists
    ADD CONSTRAINT lists_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict zE9vlsKSX8xrqXOc17Kko7g0Ykv6NLjgmUWaoydgDYXpqJsfXQGMjP6pR27cPJV

