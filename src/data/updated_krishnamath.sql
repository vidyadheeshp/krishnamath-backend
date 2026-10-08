--
-- PostgreSQL database dump
--

\restrict fNQeO9LeYFqwbKxbgnq2hPe5fOJBB6aSpAmM6iwHj9i4HZYagxAkzeogwmba7ks

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-20 20:35:12

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 231 (class 1259 OID 16576)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    actor text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16508)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id text NOT NULL,
    devotee_id text NOT NULL,
    seva_id text NOT NULL,
    devotee_snapshot jsonb NOT NULL,
    booking_date date NOT NULL,
    booking_time time without time zone NOT NULL,
    status text NOT NULL,
    payment_mode text NOT NULL,
    payment_reference_number text DEFAULT ''::text NOT NULL,
    amount_payable numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    amount_collected numeric(12,2) DEFAULT 0 NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    receipt_number text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16469)
-- Name: devotees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devotees (
    id text NOT NULL,
    name text NOT NULL,
    mobile_number text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    gotra text DEFAULT ''::text NOT NULL,
    nakshatra text DEFAULT ''::text NOT NULL,
    raashi text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.devotees OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16546)
-- Name: expenditures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenditures (
    id text NOT NULL,
    expense_title text NOT NULL,
    expense_category text NOT NULL,
    expense_amount numeric(12,2) DEFAULT 0 NOT NULL,
    expense_date date NOT NULL,
    payment_mode text NOT NULL,
    vendor_details text DEFAULT ''::text NOT NULL,
    notes text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.expenditures OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16447)
-- Name: metadata_event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metadata_event_types (
    id text NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name_kn text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.metadata_event_types OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16403)
-- Name: metadata_gotras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metadata_gotras (
    id text NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name_kn text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.metadata_gotras OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16414)
-- Name: metadata_nakshatras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metadata_nakshatras (
    id text NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name_kn text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.metadata_nakshatras OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16436)
-- Name: metadata_payment_modes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metadata_payment_modes (
    id text NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name_kn text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.metadata_payment_modes OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16425)
-- Name: metadata_raashis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metadata_raashis (
    id text NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name_kn text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.metadata_raashis OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16458)
-- Name: metadata_seva_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metadata_seva_categories (
    id text NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    name_kn text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.metadata_seva_categories OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16564)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16487)
-- Name: sevas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sevas (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    duration integer DEFAULT 0 NOT NULL,
    category text NOT NULL,
    max_bookings_per_day integer DEFAULT 0 NOT NULL,
    availability_status text NOT NULL,
    instructions text DEFAULT ''::text NOT NULL,
    name_kn text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.sevas OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    password_hash text NOT NULL,
    last_login_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 16576)
-- Dependencies: 231
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, action, entity, actor, payload, created_at) FROM stdin;
13a537bc-f301-4439-84f5-ca24cf4fb1a0	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-19 16:04:18.414+05:30
2d8fb71b-2b2c-44b2-aa47-840bd14ee32c	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-17 18:05:29.935+05:30
4ba090d0-ae8a-44f8-ae2e-6f62d68459ab	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-17 17:58:21.674+05:30
ac4c8cfa-056a-4982-b917-ace73267d7fb	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-17 12:12:36.881+05:30
fbe0f2c6-c0be-4350-a604-451cf6e4fabf	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-16 21:19:52.906+05:30
8109c771-7b65-4d54-82f3-87bd178429f2	CREATE	booking	admin@krishnamath.co.in	{"id": "eb7ce343-e69d-4f23-8f77-bab26d4c6b30", "notes": "10 memberteertha prasasda", "sevaId": "f8e52806-d0e2-4a3f-a1b9-8c3778a4284c", "status": "confirmed", "devotee": {"id": "b0d8d3a7-7595-419d-974a-1bea66422d47", "name": "shrinivas", "gotra": "Bharadwaja", "raashi": "Makara", "address": "bgm", "nakshatra": "Shravana", "mobileNumber": "9886457735"}, "discount": 0, "createdAt": "2026-05-16T14:41:32.963Z", "devoteeId": "b0d8d3a7-7595-419d-974a-1bea66422d47", "updatedAt": "2026-05-16T14:41:32.963Z", "bookingDate": "2026-05-17", "bookingTime": "09:00", "paymentMode": "Cash", "amountPayable": 1000, "receiptNumber": "TS-2026-EC8C07D9", "amountCollected": 1000, "paymentReferenceNumber": ""}	2026-05-16 20:11:32.963+05:30
e10af19f-4901-453d-ad1c-1ef74080ebb1	UPDATE	gotras	admin@krishnamath.co.in	{"id": "gotra-02", "name": "Aangirasa", "enabled": true}	2026-05-16 19:59:02.637+05:30
005ffb71-d26f-43ba-82fb-ef2fdc9ad855	UPDATE	gotras	admin@krishnamath.co.in	{"id": "gotra-02", "name": "Aangirasa", "enabled": true}	2026-05-16 19:55:48.722+05:30
9193a046-378f-4f35-998a-6791f0d77ba8	CREATE	booking	admin@krishnamath.co.in	{"id": "1e0975e4-d8ac-4698-ba67-055d102c0b2d", "notes": "sdxhzcsdygcuc", "sevaId": "seva-026", "status": "confirmed", "devotee": {"id": "9c72d25c-fe4b-4104-a31d-56340d530d04", "name": "vidya", "gotra": "Goutama", "raashi": "Mesha", "address": "aaucgaduic", "nakshatra": "Dhanishta", "mobileNumber": "87572374527"}, "discount": 0, "createdAt": "2026-05-16T13:54:22.921Z", "devoteeId": "9c72d25c-fe4b-4104-a31d-56340d530d04", "updatedAt": "2026-05-16T13:54:22.921Z", "bookingDate": "2026-05-16", "bookingTime": "09:00", "paymentMode": "UPI", "amountPayable": 5000, "receiptNumber": "TS-2026-7F3160A8", "amountCollected": 5000, "paymentReferenceNumber": "784624fwedsf"}	2026-05-16 19:24:22.921+05:30
a9671641-afa3-462f-a577-2b884eb6ecfb	CREATE	booking	admin@krishnamath.co.in	{"id": "75d365aa-c200-4028-b69b-1319cb14ba4f", "notes": "sdhbcjasdhcvasjdc", "sevaId": "seva-053", "status": "confirmed", "devotee": {"id": "65b43424-1f38-4b31-805b-b74f77a228d3", "name": "Lakshi kulkarni", "gotra": "Aatreyas", "raashi": "Simha", "address": "asdjcvasdhcvs", "nakshatra": "Jyeshta", "mobileNumber": "9829462785"}, "discount": 0, "createdAt": "2026-05-16T13:43:08.901Z", "devoteeId": "65b43424-1f38-4b31-805b-b74f77a228d3", "updatedAt": "2026-05-16T13:43:08.901Z", "bookingDate": "2026-05-16", "bookingTime": "09:00", "paymentMode": "Cash", "amountPayable": 1500, "receiptNumber": "TS-2026-322D9822", "amountCollected": 1500, "paymentReferenceNumber": "aersdhfguyas35"}	2026-05-16 19:13:08.901+05:30
fa85d31c-0088-4990-ab68-8ab8ec510ca7	UPDATE	gotras	admin@krishnamath.co.in	{"id": "gotra-03", "name": "Atri", "enabled": true}	2026-05-16 18:57:00.613+05:30
e9953a94-d54c-4bac-819b-03e323c4df11	UPDATE	gotras	admin@krishnamath.co.in	{"id": "gotra-02", "name": "Aangirasa", "enabled": true}	2026-05-16 18:56:56.142+05:30
9952281c-3db6-4795-a8a8-4c85c8dc173d	CREATE	expenditure	admin@krishnamath.co.in	{"id": "63cfb07b-8b40-4348-8812-d0352bf42bb0", "notes": "towards lunch.", "expenseDate": "2026-05-16", "paymentMode": "Cash", "expenseTitle": "bananaa leaf", "expenseAmount": 999, "vendorDetails": "abcd", "expenseCategory": "Maintenance"}	2026-05-16 18:48:42.31+05:30
82fb727b-6987-44c9-a24f-545ba8cc9d43	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-16 18:41:07.208+05:30
381e3bb4-a7cb-4a36-b337-b868f814167b	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-16 16:43:32.339+05:30
f153a1f0-4047-4bec-861b-1986b8d99bc2	CREATE	booking	admin@krishnamath.co.in	{"id": "7b5c9f2e-b814-4d9f-95af-9d20e578a9c7", "notes": "kasdjhvailusvd", "sevaId": "seva-022", "status": "confirmed", "devotee": {"id": "d97636a9-5f54-4e8d-8437-98752ecc8e0d", "name": "shrihari", "gotra": "Bharadwaja", "raashi": "Simha", "address": "ajkshlag", "nakshatra": "Jyeshta", "mobileNumber": "8095013250"}, "discount": 0, "createdAt": "2026-05-15T16:17:11.509Z", "devoteeId": "d97636a9-5f54-4e8d-8437-98752ecc8e0d", "updatedAt": "2026-05-15T16:17:11.509Z", "bookingDate": "2026-05-15", "bookingTime": "09:00", "paymentMode": "UPI", "amountPayable": 2999, "receiptNumber": "TS-2026-71702B63", "amountCollected": 2999, "paymentReferenceNumber": "sydg76edcs"}	2026-05-15 21:47:11.509+05:30
16f827d0-e8d3-4980-af73-bf977fbc6c41	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-15 20:40:05.693+05:30
e54f5b67-789c-4344-aa6f-ce040e291410	CREATE	booking	admin@krishnamath.co.in	{"id": "38c75a86-d4df-4e49-ba2f-130665aba44d", "notes": "test", "sevaId": "f8e52806-d0e2-4a3f-a1b9-8c3778a4284c", "status": "confirmed", "devotee": {"id": "baf5636c-c5be-4ebe-a3ec-e6975113f7b2", "name": "vidya", "gotra": "Bharadwaja", "raashi": "Mesha", "address": "kutftydy", "nakshatra": "Ashwini", "mobileNumber": "8095013250"}, "discount": 0, "createdAt": "2026-05-13T15:50:03.963Z", "devoteeId": "baf5636c-c5be-4ebe-a3ec-e6975113f7b2", "updatedAt": "2026-05-13T15:50:03.963Z", "bookingDate": "2026-05-13", "bookingTime": "09:00", "paymentMode": "UPI", "amountPayable": 1000, "receiptNumber": "TS-2026-00A55554", "amountCollected": 1000, "paymentReferenceNumber": "y7654"}	2026-05-13 21:20:03.963+05:30
da383665-418c-4b5b-9394-781b6c996677	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-13 21:16:29.936+05:30
a3534e6c-9f34-4728-b963-5cd0dc3eeadc	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 16:38:07.953+05:30
671aa5e1-7775-4e78-ac6d-5cc41c0f7c13	LOGIN	user	admin@krishnamath.co.in	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 15:55:10.014+05:30
17fc8985-b8bd-48a9-9170-4fd15d167ec0	CREATE	booking	admin@temple.local	{"id": "b6e96675-9b8c-4aad-9a6e-cd847332ff7f", "notes": "dbfgn", "sevaId": "f8e52806-d0e2-4a3f-a1b9-8c3778a4284c", "status": "confirmed", "devotee": {"id": "c877fb00-fe7c-4ae0-8c1d-15a352b1dec0", "name": "abc", "gotra": "Bharadwaja", "raashi": "Mesha", "address": "bgm", "nakshatra": "Ashwini", "mobileNumber": "8095013250"}, "discount": 0, "createdAt": "2026-05-10T10:22:13.092Z", "devoteeId": "c877fb00-fe7c-4ae0-8c1d-15a352b1dec0", "updatedAt": "2026-05-10T10:22:13.092Z", "bookingDate": "2026-05-10", "bookingTime": "09:00", "paymentMode": "UPI", "amountPayable": 1000, "receiptNumber": "TS-2026-DA78C822", "amountCollected": 1000, "paymentReferenceNumber": "dsgy45ye5yw45"}	2026-05-10 15:52:13.092+05:30
2956002e-479a-41ab-ba6f-50f978270faa	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 15:49:29.572+05:30
8c55a2aa-9f63-48d2-9d5b-ae9a8a1e28dd	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 15:45:46.552+05:30
952574cf-cca5-41d2-aa9d-7ebe1125bf3e	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 15:45:00.991+05:30
42e26db0-e7ba-4a2e-a169-d03a4693aa06	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 15:41:49.611+05:30
a1eec490-13b7-45b9-89da-a697dd10580f	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 15:36:32.701+05:30
1ed6521e-2bd5-443b-9a19-3d527abd4ad6	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-10 15:27:17.51+05:30
0d8c83c4-d998-4c4c-b7d7-a52609d75cad	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-07 21:02:26.471+05:30
9826b444-b0b4-4719-a4f6-9338f3314a31	CREATE	booking	admin@temple.local	{"id": "5dd16b64-2836-4725-b08f-538791238151", "notes": "Validation booking", "sevaId": "42acdbf8-c507-4827-ab23-c28ae39710fe", "status": "confirmed", "devotee": {"id": "5e8beb16-b1ff-4188-af03-0421150c4710", "name": "Demo Devotee", "gotra": "Bharadwaja", "raashi": "Mesha", "address": "", "nakshatra": "Ashwini", "mobileNumber": "9876543210"}, "discount": 0, "createdAt": "2026-05-07T15:24:55.708Z", "devoteeId": "5e8beb16-b1ff-4188-af03-0421150c4710", "updatedAt": "2026-05-07T15:24:55.708Z", "bookingDate": "2026-05-07", "bookingTime": "09:00", "paymentMode": "Cash", "amountPayable": 250, "receiptNumber": "TS-2026-7B2C1A37", "amountCollected": 250, "paymentReferenceNumber": ""}	2026-05-07 20:54:55.709+05:30
ade1fc46-4dcd-4c6a-b53b-f7a99fa98bd4	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-07 20:54:55.672+05:30
bfd302c9-bede-47dc-86fb-43b329e8cd16	LOGIN	user	admin@temple.local	{"userId": "c5c1a59d-470b-4696-b7a3-715e34040dec"}	2026-05-07 20:46:47.268+05:30
\.


--
-- TOC entry 5119 (class 0 OID 16508)
-- Dependencies: 228
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, devotee_id, seva_id, devotee_snapshot, booking_date, booking_time, status, payment_mode, payment_reference_number, amount_payable, discount, amount_collected, notes, receipt_number, created_at, updated_at) FROM stdin;
eb7ce343-e69d-4f23-8f77-bab26d4c6b30	b0d8d3a7-7595-419d-974a-1bea66422d47	f8e52806-d0e2-4a3f-a1b9-8c3778a4284c	{"id": "b0d8d3a7-7595-419d-974a-1bea66422d47", "name": "shrinivas", "gotra": "Bharadwaja", "raashi": "Makara", "address": "bgm", "nakshatra": "Shravana", "mobileNumber": "9886457735"}	2026-05-17	09:00:00	confirmed	Cash		1000.00	0.00	1000.00	10 memberteertha prasasda	TS-2026-EC8C07D9	2026-05-16 20:11:32.963+05:30	2026-05-16 20:11:32.963+05:30
1e0975e4-d8ac-4698-ba67-055d102c0b2d	9c72d25c-fe4b-4104-a31d-56340d530d04	seva-026	{"id": "9c72d25c-fe4b-4104-a31d-56340d530d04", "name": "vidya", "gotra": "Goutama", "raashi": "Mesha", "address": "aaucgaduic", "nakshatra": "Dhanishta", "mobileNumber": "87572374527"}	2026-05-16	09:00:00	confirmed	UPI	784624fwedsf	5000.00	0.00	5000.00	sdxhzcsdygcuc	TS-2026-7F3160A8	2026-05-16 19:24:22.921+05:30	2026-05-16 19:24:22.921+05:30
75d365aa-c200-4028-b69b-1319cb14ba4f	65b43424-1f38-4b31-805b-b74f77a228d3	seva-053	{"id": "65b43424-1f38-4b31-805b-b74f77a228d3", "name": "Lakshi kulkarni", "gotra": "Aatreyas", "raashi": "Simha", "address": "asdjcvasdhcvs", "nakshatra": "Jyeshta", "mobileNumber": "9829462785"}	2026-05-16	09:00:00	confirmed	Cash	aersdhfguyas35	1500.00	0.00	1500.00	sdhbcjasdhcvasjdc	TS-2026-322D9822	2026-05-16 19:13:08.901+05:30	2026-05-16 19:13:08.901+05:30
7b5c9f2e-b814-4d9f-95af-9d20e578a9c7	d97636a9-5f54-4e8d-8437-98752ecc8e0d	seva-022	{"id": "d97636a9-5f54-4e8d-8437-98752ecc8e0d", "name": "shrihari", "gotra": "Bharadwaja", "raashi": "Simha", "address": "ajkshlag", "nakshatra": "Jyeshta", "mobileNumber": "8095013250"}	2026-05-15	09:00:00	confirmed	UPI	sydg76edcs	2999.00	0.00	2999.00	kasdjhvailusvd	TS-2026-71702B63	2026-05-15 21:47:11.509+05:30	2026-05-15 21:47:11.509+05:30
38c75a86-d4df-4e49-ba2f-130665aba44d	baf5636c-c5be-4ebe-a3ec-e6975113f7b2	f8e52806-d0e2-4a3f-a1b9-8c3778a4284c	{"id": "baf5636c-c5be-4ebe-a3ec-e6975113f7b2", "name": "vidya", "gotra": "Bharadwaja", "raashi": "Mesha", "address": "kutftydy", "nakshatra": "Ashwini", "mobileNumber": "8095013250"}	2026-05-13	09:00:00	confirmed	UPI	y7654	1000.00	0.00	1000.00	test	TS-2026-00A55554	2026-05-13 21:20:03.963+05:30	2026-05-13 21:20:03.963+05:30
b6e96675-9b8c-4aad-9a6e-cd847332ff7f	c877fb00-fe7c-4ae0-8c1d-15a352b1dec0	f8e52806-d0e2-4a3f-a1b9-8c3778a4284c	{"id": "c877fb00-fe7c-4ae0-8c1d-15a352b1dec0", "name": "abc", "gotra": "Bharadwaja", "raashi": "Mesha", "address": "bgm", "nakshatra": "Ashwini", "mobileNumber": "8095013250"}	2026-05-10	09:00:00	confirmed	UPI	dsgy45ye5yw45	1000.00	0.00	1000.00	dbfgn	TS-2026-DA78C822	2026-05-10 15:52:13.092+05:30	2026-05-10 15:52:13.092+05:30
5dd16b64-2836-4725-b08f-538791238151	5e8beb16-b1ff-4188-af03-0421150c4710	42acdbf8-c507-4827-ab23-c28ae39710fe	{"id": "5e8beb16-b1ff-4188-af03-0421150c4710", "name": "Demo Devotee", "gotra": "Bharadwaja", "raashi": "Mesha", "address": "", "nakshatra": "Ashwini", "mobileNumber": "9876543210"}	2026-05-07	09:00:00	confirmed	Cash		250.00	0.00	250.00	Validation booking	TS-2026-7B2C1A37	2026-05-07 20:54:55.708+05:30	2026-05-07 20:54:55.708+05:30
\.


--
-- TOC entry 5117 (class 0 OID 16469)
-- Dependencies: 226
-- Data for Name: devotees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devotees (id, name, mobile_number, address, gotra, nakshatra, raashi) FROM stdin;
c877fb00-fe7c-4ae0-8c1d-15a352b1dec0	abc	8095013250	bgm	Bharadwaja	Ashwini	Mesha
5e8beb16-b1ff-4188-af03-0421150c4710	Demo Devotee	9876543210		Bharadwaja	Ashwini	Mesha
65b43424-1f38-4b31-805b-b74f77a228d3	Lakshi kulkarni	9829462785	asdjcvasdhcvs	Aatreyas	Jyeshta	Simha
d97636a9-5f54-4e8d-8437-98752ecc8e0d	shrihari	8095013250	ajkshlag	Bharadwaja	Jyeshta	Simha
b0d8d3a7-7595-419d-974a-1bea66422d47	shrinivas	9886457735	bgm	Bharadwaja	Shravana	Makara
9c72d25c-fe4b-4104-a31d-56340d530d04	vidya	87572374527	aaucgaduic	Goutama	Dhanishta	Mesha
baf5636c-c5be-4ebe-a3ec-e6975113f7b2	vidya	8095013250	kutftydy	Bharadwaja	Ashwini	Mesha
\.


--
-- TOC entry 5120 (class 0 OID 16546)
-- Dependencies: 229
-- Data for Name: expenditures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenditures (id, expense_title, expense_category, expense_amount, expense_date, payment_mode, vendor_details, notes) FROM stdin;
63cfb07b-8b40-4348-8812-d0352bf42bb0	bananaa leaf	Maintenance	999.00	2026-05-16	Cash	abcd	towards lunch.
\.


--
-- TOC entry 5115 (class 0 OID 16447)
-- Dependencies: 224
-- Data for Name: metadata_event_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metadata_event_types (id, name, enabled, name_kn) FROM stdin;
ad9280f9-0743-4546-b4f7-3dc0e4495bb8	Festival	t	
9a75cd4f-efdd-488b-94d7-e831d2a3df69	Special Pooja	t	
\.


--
-- TOC entry 5111 (class 0 OID 16403)
-- Dependencies: 220
-- Data for Name: metadata_gotras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metadata_gotras (id, name, enabled, name_kn) FROM stdin;
gotra-02	Aangirasa	t	
gotra-10	Aatreyas	t	
gotra-01	Agastya	t	
gotra-03	Atri	t	
c6414be9-b37e-4f47-9c76-11783e2082ef	Bharadwaja	t	
gotra-07	Bharadwaja	t	
gotra-15	Gargya	t	
gotra-09	Goutama	t	
gotra-17	Haritas	t	
gotra-08	Jamadagni	t	
5308f4b7-5dbf-441e-950f-a1ca537eee2d	Kashyapa	t	
gotra-04	Kashyapa	t	
gotra-14	Koundinya	t	
gotra-13	Koushika	t	
gotra-11	Mudgala	t	
gotra-19	Parashara	t	
gotra-16	Shandilya	t	
gotra-18	Shounaka	t	
gotra-12	Shrivatsa	t	
gotra-05	Vasishta	t	
gotra-20	Vishnuvrudha	t	
gotra-06	Vishwamitra	t	
\.


--
-- TOC entry 5112 (class 0 OID 16414)
-- Dependencies: 221
-- Data for Name: metadata_nakshatras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metadata_nakshatras (id, name, enabled, name_kn) FROM stdin;
nakshatra-06	Aardra	t	
nakshatra-08	Aashlesha	t	
nakshatra-17	Anuradha	t	
nakshatra-01	Ashwini	t	
75e9f860-3f56-40fa-a90d-3ae4ad67128c	Ashwini	t	
nakshatra-02	Bharini	t	
nakshatra-14	Chitta	t	
nakshatra-23	Dhanishta	t	
nakshatra-13	Hasta	t	
nakshatra-18	Jyeshta	t	
nakshatra-03	Kritika	t	
nakshatra-10	Magha	t	
nakshatra-19	Moola	t	
nakshatra-05	Mrigasira	t	
nakshatra-25	Poorvabhadrapada	t	
nakshatra-20	Poorvashadha	t	
nakshatra-07	Punarvasu	t	
nakshatra-11	Purva Phalguni	t	
nakshatra-09	Pushya	t	
nakshatra-27	Revati	t	
50a8926b-3b26-485c-bfdf-ee7c0138666b	Rohini	t	
nakshatra-04	Rohini	t	
nakshatra-24	Shatabhisha	t	
nakshatra-22	Shravana	t	
nakshatra-15	Swati	t	
nakshatra-12	Uttara Phalguni	t	
nakshatra-26	Uttarabhadrapada	t	
nakshatra-21	Uttarashadha	t	
nakshatra-16	Vishakha	t	
\.


--
-- TOC entry 5114 (class 0 OID 16436)
-- Dependencies: 223
-- Data for Name: metadata_payment_modes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metadata_payment_modes (id, name, enabled, name_kn) FROM stdin;
32018d14-dd76-4176-b8c0-1f72d7f19b0f	Card	t	
ebf39d5f-f5fe-4cbc-9a3e-59e5ffd11345	Cash	t	
cd5756f2-42ee-4bfb-afca-b60ec12dd6c7	UPI	t	
\.


--
-- TOC entry 5113 (class 0 OID 16425)
-- Dependencies: 222
-- Data for Name: metadata_raashis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metadata_raashis (id, name, enabled, name_kn) FROM stdin;
raashi-09	Dhanu	t	
raashi-06	Kanya	t	
raashi-04	Karkataka	t	
raashi-11	Kumbha	t	
raashi-10	Makara	t	
raashi-12	Meena	t	
raashi-01	Mesha	t	
9524c694-7cb3-4049-81e3-834bcef7c2d6	Mesha	t	
raashi-03	Mithuna	t	
raashi-05	Simha	t	
raashi-07	Tula	t	
dc9ac8b1-2106-40d4-a013-d3bd80418cda	Vrishabha	t	
raashi-02	Vrushabha	t	
raashi-08	Vrushchika	t	
\.


--
-- TOC entry 5116 (class 0 OID 16458)
-- Dependencies: 225
-- Data for Name: metadata_seva_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metadata_seva_categories (id, name, enabled, name_kn) FROM stdin;
0f91088f-1cf7-4c58-9bf8-3a970b381346	Daily	t	
category-03	Homa	t	
category-01	Nitya Seva	t	
category-02	Purana Seva	t	
category-04	Shanti Homa	t	
a8c3c7fe-e6b3-4f76-88c1-b6ff2d46048f	Special	t	
\.


--
-- TOC entry 5121 (class 0 OID 16564)
-- Dependencies: 230
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, title, description, type, created_at) FROM stdin;
34166c37-c948-4ad7-9f4e-60ee892d09d7	Booking confirmed	shrinivas booked Abhisheka	booking	2026-05-16 20:11:32.963+05:30
b6645bb7-9f0f-40bf-86b8-896603a51961	Booking confirmed	vidya booked Gana Homa	booking	2026-05-16 19:24:22.921+05:30
b8fabdd9-3d41-4500-9fd1-0423252e49f6	Booking confirmed	Lakshi kulkarni booked Choula	booking	2026-05-16 19:13:08.901+05:30
f052c984-2008-468a-8c09-a7799a803344	Booking confirmed	shrihari booked Adhika Maasa Mahaatme	booking	2026-05-15 21:47:11.509+05:30
717c24f3-fd20-43d6-a142-4df254f08259	Booking confirmed	vidya booked Abhisheka	booking	2026-05-13 21:20:03.963+05:30
a103d4da-52c2-42de-b407-7d411dd9c11e	Booking confirmed	abc booked Abhisheka	booking	2026-05-10 15:52:13.092+05:30
71e1c49e-4ee9-49d2-9cbc-970a32138756	Booking confirmed	Demo Devotee booked Archana	booking	2026-05-07 20:54:55.709+05:30
ebec0376-7355-4fb8-8768-c023b39e2b2f	System ready	Temple booking platform initialized successfully.	system	2026-05-07 20:45:35.655+05:30
\.


--
-- TOC entry 5118 (class 0 OID 16487)
-- Dependencies: 227
-- Data for Name: sevas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sevas (id, name, description, amount, duration, category, max_bookings_per_day, availability_status, instructions, name_kn) FROM stdin;
seva-036	60th Shanti	60th Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-037	70th Shanti	70th Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-038	80th Shanti	80th Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-067	Aaradhana Sarva Seva	Aaradhana Sarva Seva seva offering.	2000.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
f8e52806-d0e2-4a3f-a1b9-8c3778a4284c	Abhisheka	Special abhisheka seva for auspicious days.	1000.00	60	Special	8	active	Traditional attire recommended.	
seva-022	Adhika Maasa Mahaatme	Adhika Maasa Mahaatme seva offering.	0.00	90	Purana Seva	10	active	Please contact temple administration for seva details.	
seva-005	Alankara	Alankara seva offering.	200.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-056	Annaprashana	Annaprashana seva offering.	0.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-068	Annasantarpane	Annasantarpane seva offering.	1000.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
42acdbf8-c507-4827-ab23-c28ae39710fe	Archana	Daily archana seva for devotees.	250.00	30	Daily	20	active	Please arrive 10 minutes early.	
seva-032	Ayushya Homa	Ayushya Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-025	Bala Ganapati Homa	Bala Ganapati Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-018	Bhagavata Purana	Bhagavata Purana seva offering.	0.00	90	Purana Seva	10	active	Please contact temple administration for seva details.	
seva-063	Brahmachari Aaradhane	Brahmachari Aaradhane seva offering.	200.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-048	Budha Shanti	Budha Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-046	Chandra Shanti	Chandra Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-053	Choula	Choula seva offering.	0.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-034	Dhanvantari Homa	Dhanvantari Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-026	Gana Homa	Gana Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-050	Gruhana Shanti	Gruhana Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-044	Guru Shanti	Guru Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-011	Hastodaka	Hastodaka seva offering.	150.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-066	Hastodaka	Hastodaka seva offering with alternate amount.	250.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-065	Huggi naivedya	Huggi naivedya seva offering.	250.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-002	KanakaBhisheka	KanakaBhisheka seva offering.	500.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-045	Ketu Shanti	Ketu Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-007	Krishnashtottara Archane	Krishnashtottara Archane seva offering.	50.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-041	Kuja Shanti	Kuja Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-031	Lakshmi Hrudaya Homa	Lakshmi Hrudaya Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-061	Maha pooja	Maha pooja seva offering.	500.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-003	Maha Pooja	Maha Pooja seva offering.	500.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-029	Manyusookta Homa	Manyusookta Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-010	Manyusukta Punashcharana	Manyusukta Punashcharana seva offering.	200.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-033	Mrutyunjaya Homa	Mrutyunjaya Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-052	Namakarana	Namakarana seva offering.	0.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-035	Navagruha Shanti	Navagruha Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-058	Nootana vastra samarpane	Nootana vastra samarpane seva offering.	200.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-006	Panchamruta	Panchamruta seva offering.	100.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-023	Pavamana Homa	Pavamana Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-020	Proshtapadi	Proshtapadi seva offering.	0.00	90	Purana Seva	10	active	Please contact temple administration for seva details.	
seva-027	PurushaSookta Homa	PurushaSookta Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-060	Pushpalankar seve	Pushpalankar seve seva offering.	150.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-064	pushpsalankara sevaq	pushpsalankara sevaq seva offering.	500.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-042	Rahu Shanti	Rahu Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-019	Ramayana Purana	Ramayana Purana seva offering.	0.00	90	Purana Seva	10	active	Please contact temple administration for seva details.	
seva-069	Rathotsava Seva	Rathotsava Seva seva offering.	2500.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-004	Ratri Pooja	Ratri Pooja seva offering.	200.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-039	Sahasra Chandra Darshana Shanti	Sahasra Chandra Darshana Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-055	Samavartana	Samavartana seva offering.	0.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-062	Samoohika Ashlesha Bali	Samoohika Ashlesha Bali seva offering.	300.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-016	Samuhika SatyaNarayana Pooje (1 Month)	Samuhika SatyaNarayana Pooje (1 Month) seva offering.	100.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-017	Samuhika SatyaNarayana Pooje (1 Year)	Samuhika SatyaNarayana Pooje (1 Year) seva offering.	1000.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-040	Sandhi Shanti	Sandhi Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-001	Sarva Seva	Sarva Seva seva offering.	1000.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-057	Satyanarayana Pooja Pratyeka	Satyanarayana Pooja Pratyeka seva offering.	0.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-051	Seemanta	Seemanta seva offering.	0.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-043	Shani Shanti	Shani Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-015	Shradha (Mahalaya) Sankalpa	Shradha (Mahalaya) Sankalpa seva offering.	400.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-012	Shradha (Pindapradana)	Shradha (Pindapradana) seva offering.	500.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-013	Shradha (Sankalpa)	Shradha (Sankalpa) seva offering.	350.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-014	Shradha Mahalaya	Shradha Mahalaya seva offering.	600.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-028	ShreeSookta Homa	ShreeSookta Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-049	Shukra Shanti	Shukra Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-047	Soma Shanti	Soma Shanti seva offering.	0.00	120	Shanti Homa	10	active	Please contact temple administration for seva details.	
seva-024	Swayamvara Parvati homa	Swayamvara Parvati homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-008	Tottilu Pooje	Tottilu Pooje seva offering.	150.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-054	Upanayana	Upanayana seva offering.	0.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-009	Vayustuti Punashcharana	Vayustuti Punashcharana seva offering.	250.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
seva-030	Vayustuti Punashcharana Homa	Vayustuti Punashcharana Homa seva offering.	0.00	120	Homa	10	active	Please contact temple administration for seva details.	
seva-021	Venkatesh Mahatme	Venkatesh Mahatme seva offering.	0.00	90	Purana Seva	10	active	Please contact temple administration for seva details.	
seva-059	Vishesha Phala Panchamrta Abhishek	Vishesha Phala Panchamrta Abhishek seva offering.	150.00	30	Nitya Seva	10	active	Please contact temple administration for seva details.	
\.


--
-- TOC entry 5110 (class 0 OID 16389)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, password_hash, last_login_at) FROM stdin;
c5c1a59d-470b-4696-b7a3-715e34040dec	Temple Admin	admin@krishnamath.co.in	admin	$2b$10$vgoiVO87WTcAuAhmeUXMs.fVZV7OL.9N0.7ptRRFAt3HrHOTjlT0O	2026-05-19 16:04:18.414+05:30
\.


--
-- TOC entry 4960 (class 2606 OID 16588)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 16535)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 16486)
-- Name: devotees devotees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devotees
    ADD CONSTRAINT devotees_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 16563)
-- Name: expenditures expenditures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenditures
    ADD CONSTRAINT expenditures_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 16457)
-- Name: metadata_event_types metadata_event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata_event_types
    ADD CONSTRAINT metadata_event_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 16413)
-- Name: metadata_gotras metadata_gotras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata_gotras
    ADD CONSTRAINT metadata_gotras_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 16424)
-- Name: metadata_nakshatras metadata_nakshatras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata_nakshatras
    ADD CONSTRAINT metadata_nakshatras_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 16446)
-- Name: metadata_payment_modes metadata_payment_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata_payment_modes
    ADD CONSTRAINT metadata_payment_modes_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 16435)
-- Name: metadata_raashis metadata_raashis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata_raashis
    ADD CONSTRAINT metadata_raashis_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 16468)
-- Name: metadata_seva_categories metadata_seva_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metadata_seva_categories
    ADD CONSTRAINT metadata_seva_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 16575)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 16507)
-- Name: sevas sevas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sevas
    ADD CONSTRAINT sevas_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 16402)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4936 (class 2606 OID 16400)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 16536)
-- Name: bookings bookings_devotee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_devotee_id_fkey FOREIGN KEY (devotee_id) REFERENCES public.devotees(id);


--
-- TOC entry 4962 (class 2606 OID 16541)
-- Name: bookings bookings_seva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_seva_id_fkey FOREIGN KEY (seva_id) REFERENCES public.sevas(id);


-- Completed on 2026-05-20 20:35:13

--
-- PostgreSQL database dump complete
--

\unrestrict fNQeO9LeYFqwbKxbgnq2hPe5fOJBB6aSpAmM6iwHj9i4HZYagxAkzeogwmba7ks

