SELECT pg_terminate_backend (pid) FROM pg_stat_activity WHERE datname = 'pcms';
SELECT pg_terminate_backend (pid) FROM pg_stat_activity WHERE datname = 'pcms_environment';
alter database pcms_environment rename to pcms_environment_xx;
alter database pcms rename to pcms_xx;

alter database pcms_environment_xx rename to pcms_environment;
alter database pcms_xx rename to pcms;
