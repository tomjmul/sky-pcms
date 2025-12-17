/*
--DROP DATABASE IF EXISTS pcms;
--
-- Name: pcms; Type: DATABASE; Schema: -; Owner: postgres
--

--CREATE DATABASE pcms WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


--:ALTER DATABASE pcms OWNER TO postgres;
 */



ALTER SCHEMA content RENAME TO new_name
ALTER SCHEMA client_content RENAME TO new_name
