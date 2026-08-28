--
-- PostgreSQL database dump
--

\restrict fppXnGaP6kqRGdzdLV9njfGj91Ra6NLIrr18Ou8CUM8B9ubH94Ig43lYT1seQAa

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-08-28 18:21:20

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

--
-- TOC entry 876 (class 1247 OID 16883)
-- Name: application_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.application_status AS ENUM (
    'submitted',
    'shortlisted',
    'interview_scheduled',
    'interviewed',
    'passed',
    'hired',
    'rejected'
);


ALTER TYPE public.application_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 16898)
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    candidate_id integer,
    position_applied character varying(150),
    status public.application_status DEFAULT 'submitted'::public.application_status,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16897)
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 223
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- TOC entry 233 (class 1259 OID 25146)
-- Name: bot_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bot_users (
    chat_id character varying(50) NOT NULL,
    language character varying(5) DEFAULT 'en'::character varying,
    candidate_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bot_users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16871)
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    khmer_name character varying(150),
    english_name character varying(150),
    id_card_number character varying(50),
    id_card_expiration date,
    current_address text,
    phone character varying(30),
    telegram_chat_id character varying(50),
    cv_file_url text,
    source character varying(20) DEFAULT 'web_form'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16870)
-- Name: candidates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candidates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.candidates_id_seq OWNER TO postgres;

--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 221
-- Name: candidates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candidates_id_seq OWNED BY public.candidates.id;


--
-- TOC entry 230 (class 1259 OID 16955)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    candidate_id integer,
    application_id integer,
    "position" character varying(150),
    salary numeric(12,2),
    hire_date date DEFAULT CURRENT_DATE,
    employment_status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16954)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 229
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 226 (class 1259 OID 16914)
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    application_id integer,
    scheduled_at timestamp without time zone,
    location character varying(200),
    interviewer_id integer,
    outcome character varying(50),
    notes text
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16913)
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interviews_id_seq OWNER TO postgres;

--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 225
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- TOC entry 235 (class 1259 OID 25160)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    candidate_id integer,
    application_id integer,
    message_type character varying(30),
    content text,
    channel character varying(20) DEFAULT 'telegram'::character varying,
    delivery_status character varying(20),
    sent_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 25159)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 234
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 237 (class 1259 OID 25182)
-- Name: onboarding_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.onboarding_forms (
    id integer NOT NULL,
    candidate_id integer,
    full_legal_name character varying(150),
    date_of_birth date,
    emergency_contact_name character varying(150),
    emergency_contact_phone character varying(30),
    bank_name character varying(100),
    bank_account_number character varying(50),
    start_date_preference date,
    notes text,
    submitted_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.onboarding_forms OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 25181)
-- Name: onboarding_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.onboarding_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.onboarding_forms_id_seq OWNER TO postgres;

--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 236
-- Name: onboarding_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.onboarding_forms_id_seq OWNED BY public.onboarding_forms.id;


--
-- TOC entry 220 (class 1259 OID 16854)
-- Name: recruiters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recruiters (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(50) DEFAULT 'recruiter'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.recruiters OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16853)
-- Name: recruiters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recruiters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recruiters_id_seq OWNER TO postgres;

--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 219
-- Name: recruiters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recruiters_id_seq OWNED BY public.recruiters.id;


--
-- TOC entry 232 (class 1259 OID 16977)
-- Name: salary_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_payments (
    id integer NOT NULL,
    employee_id integer,
    amount numeric(12,2) NOT NULL,
    pay_period character varying(20),
    paid_at timestamp without time zone DEFAULT now(),
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.salary_payments OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16976)
-- Name: salary_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salary_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salary_payments_id_seq OWNER TO postgres;

--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 231
-- Name: salary_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salary_payments_id_seq OWNED BY public.salary_payments.id;


--
-- TOC entry 228 (class 1259 OID 16934)
-- Name: status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.status_history (
    id integer NOT NULL,
    application_id integer,
    old_status public.application_status,
    new_status public.application_status,
    changed_by integer,
    changed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.status_history OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16933)
-- Name: status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.status_history_id_seq OWNER TO postgres;

--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 227
-- Name: status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.status_history_id_seq OWNED BY public.status_history.id;


--
-- TOC entry 4909 (class 2604 OID 16901)
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 16874)
-- Name: candidates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates ALTER COLUMN id SET DEFAULT nextval('public.candidates_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 16958)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4913 (class 2604 OID 16917)
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 25163)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 25185)
-- Name: onboarding_forms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_forms ALTER COLUMN id SET DEFAULT nextval('public.onboarding_forms_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 16857)
-- Name: recruiters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiters ALTER COLUMN id SET DEFAULT nextval('public.recruiters_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 16980)
-- Name: salary_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments ALTER COLUMN id SET DEFAULT nextval('public.salary_payments_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 16937)
-- Name: status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status_history ALTER COLUMN id SET DEFAULT nextval('public.status_history_id_seq'::regclass);


--
-- TOC entry 5120 (class 0 OID 16898)
-- Dependencies: 224
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, candidate_id, position_applied, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5129 (class 0 OID 25146)
-- Dependencies: 233
-- Data for Name: bot_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bot_users (chat_id, language, candidate_id, created_at) FROM stdin;
\.


--
-- TOC entry 5118 (class 0 OID 16871)
-- Dependencies: 222
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, khmer_name, english_name, id_card_number, id_card_expiration, current_address, phone, telegram_chat_id, cv_file_url, source, created_at) FROM stdin;
\.


--
-- TOC entry 5126 (class 0 OID 16955)
-- Dependencies: 230
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, candidate_id, application_id, "position", salary, hire_date, employment_status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5122 (class 0 OID 16914)
-- Dependencies: 226
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, application_id, scheduled_at, location, interviewer_id, outcome, notes) FROM stdin;
\.


--
-- TOC entry 5131 (class 0 OID 25160)
-- Dependencies: 235
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, candidate_id, application_id, message_type, content, channel, delivery_status, sent_at) FROM stdin;
\.


--
-- TOC entry 5133 (class 0 OID 25182)
-- Dependencies: 237
-- Data for Name: onboarding_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.onboarding_forms (id, candidate_id, full_legal_name, date_of_birth, emergency_contact_name, emergency_contact_phone, bank_name, bank_account_number, start_date_preference, notes, submitted_at) FROM stdin;
\.


--
-- TOC entry 5116 (class 0 OID 16854)
-- Dependencies: 220
-- Data for Name: recruiters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recruiters (id, name, email, password_hash, role, created_at) FROM stdin;
1	Test Recruiter	test@example.com	$2b$10$kNMj5uELCOow5OA7dws7hugSABL0Ld2ze6V7oR6UPh8hY5y3IMIlm	recruiter	2026-08-24 11:42:32.112408
2	Recruiter Two	recruiter2@example.com	$2b$10$..hW7zvTeaeTNSFz7HY62emRUnbks5f1QIO7PtnrMgPjkv/zf7s0O	recruiter	2026-08-24 15:56:54.580019
\.


--
-- TOC entry 5128 (class 0 OID 16977)
-- Dependencies: 232
-- Data for Name: salary_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_payments (id, employee_id, amount, pay_period, paid_at, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5124 (class 0 OID 16934)
-- Dependencies: 228
-- Data for Name: status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.status_history (id, application_id, old_status, new_status, changed_by, changed_at) FROM stdin;
\.


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 223
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 1, false);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 221
-- Name: candidates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidates_id_seq', 1, false);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 229
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 225
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, false);


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 234
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 236
-- Name: onboarding_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.onboarding_forms_id_seq', 1, false);


--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 219
-- Name: recruiters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recruiters_id_seq', 2, true);


--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 231
-- Name: salary_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salary_payments_id_seq', 1, false);


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 227
-- Name: status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.status_history_id_seq', 1, false);


--
-- TOC entry 4939 (class 2606 OID 16907)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 25153)
-- Name: bot_users bot_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_users
    ADD CONSTRAINT bot_users_pkey PRIMARY KEY (chat_id);


--
-- TOC entry 4936 (class 2606 OID 16881)
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 16965)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 16922)
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 25170)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 25191)
-- Name: onboarding_forms onboarding_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_forms
    ADD CONSTRAINT onboarding_forms_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 16869)
-- Name: recruiters recruiters_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_email_key UNIQUE (email);


--
-- TOC entry 4934 (class 2606 OID 16867)
-- Name: recruiters recruiters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 16988)
-- Name: salary_payments salary_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 16941)
-- Name: status_history status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status_history
    ADD CONSTRAINT status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 1259 OID 16952)
-- Name: idx_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_status ON public.applications USING btree (status);


--
-- TOC entry 4937 (class 1259 OID 16953)
-- Name: idx_candidates_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_created_at ON public.candidates USING btree (created_at);


--
-- TOC entry 4947 (class 1259 OID 16994)
-- Name: idx_employees_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_status ON public.employees USING btree (employment_status);


--
-- TOC entry 4956 (class 2606 OID 16908)
-- Name: applications applications_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 25154)
-- Name: bot_users bot_users_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_users
    ADD CONSTRAINT bot_users_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE SET NULL;


--
-- TOC entry 4961 (class 2606 OID 16971)
-- Name: employees employees_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE SET NULL;


--
-- TOC entry 4962 (class 2606 OID 16966)
-- Name: employees employees_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 4957 (class 2606 OID 16923)
-- Name: interviews interviews_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 4958 (class 2606 OID 16928)
-- Name: interviews interviews_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.recruiters(id);


--
-- TOC entry 4965 (class 2606 OID 25176)
-- Name: messages messages_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE SET NULL;


--
-- TOC entry 4966 (class 2606 OID 25171)
-- Name: messages messages_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 4967 (class 2606 OID 25192)
-- Name: onboarding_forms onboarding_forms_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_forms
    ADD CONSTRAINT onboarding_forms_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- TOC entry 4963 (class 2606 OID 16989)
-- Name: salary_payments salary_payments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_payments
    ADD CONSTRAINT salary_payments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 4959 (class 2606 OID 16942)
-- Name: status_history status_history_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status_history
    ADD CONSTRAINT status_history_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- TOC entry 4960 (class 2606 OID 16947)
-- Name: status_history status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status_history
    ADD CONSTRAINT status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.recruiters(id);


-- Completed on 2026-08-28 18:21:20

--
-- PostgreSQL database dump complete
--

\unrestrict fppXnGaP6kqRGdzdLV9njfGj91Ra6NLIrr18Ou8CUM8B9ubH94Ig43lYT1seQAa

