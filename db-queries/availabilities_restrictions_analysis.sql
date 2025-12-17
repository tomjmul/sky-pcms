-- ================================================================
-- PCMS Availabilities Restrictions Analysis Queries
-- ================================================================
-- These queries analyze the availabilities data structure and search
-- for restrictions within the PCMS content database.
--
-- Database: pcms (localhost:5432)
-- Schema: content
-- Primary Tables: node, datagramvariant
-- ================================================================


UPDATE content.datagramvariant
SET values = (
    SELECT jsonb_agg(
        jsonb_set(
            avail,
            '{startEnd,end}',
            '1893456000.000000000'::jsonb
        )
    )
    FROM jsonb_array_elements(values) AS avail
)
WHERE nodeid = 'NODE_ID_HERE'
  AND name = 'AVAILABILITIES'
  AND values IS NOT NULL;

-- ================================================================
-- 1. DATABASE STRUCTURE EXPLORATION
-- ================================================================

-- Check available tables in content schema
\dt content.*;

-- Examine node table structure
\d content.node;

-- Examine datagramvariant table structure
\d content.datagramvariant;

-- ================================================================
-- 2. ASSET TYPE ANALYSIS
-- ================================================================

-- Count total SLE assets in the system
SELECT COUNT(*) as total_sle_assets
FROM content.node
WHERE type = 'ASSET'
  AND subtype = 'SLE';

-- Count SLE assets with availabilities datagram
SELECT COUNT(*) as sle_with_availabilities
FROM content.node n
JOIN content.datagramvariant dv ON n.id = dv.nodeid
WHERE n.type = 'ASSET'
  AND n.subtype = 'SLE'
  AND dv.name = 'AVAILABILITIES';

-- ================================================================
-- 3. AVAILABILITIES DATA STRUCTURE ANALYSIS
-- ================================================================

-- Get detailed structure of availabilities for one SLE asset
SELECT
    n.id as node_id,
    jsonb_pretty(dv.values) as availabilities_structure
FROM content.node n
JOIN content.datagramvariant dv ON n.id = dv.nodeid
WHERE n.type = 'ASSET'
  AND n.subtype = 'SLE'
  AND dv.name = 'AVAILABILITIES'
LIMIT 1;

-- Sample multiple availabilities to understand variations
SELECT
    n.id as node_id,
    n.type,
    n.subtype,
    dv.name as datagram_name,
    jsonb_array_length(dv.values) as values_count,
    dv.values
FROM content.node n
JOIN content.datagramvariant dv ON n.id = dv.nodeid
WHERE n.type = 'ASSET'
  AND n.subtype = 'SLE'
  AND dv.name = 'AVAILABILITIES'
LIMIT 5;

-- ================================================================
-- 4. RESTRICTIONS SEARCH QUERIES
-- ================================================================

-- Find SLE assets with availabilities containing non-empty restrictions
-- This is the primary query for finding populated restrictions
SELECT
    n.id as node_id,
    n.type,
    n.subtype,
    dv.name as datagram_name,
    jsonb_pretty(elem->'restrictions') as restrictions
FROM content.node n
JOIN content.datagramvariant dv ON n.id = dv.nodeid,
jsonb_array_elements(dv.values) as elem
WHERE n.type = 'ASSET'
  AND n.subtype = 'SLE'
  AND dv.name = 'AVAILABILITIES'
  AND elem ? 'restrictions'
  AND jsonb_typeof(elem->'restrictions') = 'array'
  AND jsonb_array_length(elem->'restrictions') > 0
LIMIT 10;

-- Count all availabilities with non-empty restrictions (any asset type)
SELECT COUNT(*) as total_availabilities_with_restrictions
FROM content.datagramvariant dv,
jsonb_array_elements(dv.values) as elem
WHERE dv.name = 'AVAILABILITIES'
  AND elem ? 'restrictions'
  AND jsonb_typeof(elem->'restrictions') = 'array'
  AND jsonb_array_length(elem->'restrictions') > 0;

-- Count total availability records with restrictions field (should match all)
SELECT COUNT(*) as total_availabilities_records
FROM content.datagramvariant dv,
jsonb_array_elements(dv.values) as elem
WHERE dv.name = 'AVAILABILITIES'
  AND elem ? 'restrictions';

-- ================================================================
-- 5. CROSS-ASSET TYPE RESTRICTIONS ANALYSIS
-- ================================================================

-- Check which asset types have restrictions across all content
SELECT
    n.type,
    n.subtype,
    COUNT(*) as count_with_restrictions
FROM content.node n
JOIN content.datagramvariant dv ON n.id = dv.nodeid,
jsonb_array_elements(dv.values) as elem
WHERE dv.name = 'AVAILABILITIES'
  AND elem ? 'restrictions'
  AND jsonb_typeof(elem->'restrictions') = 'array'
  AND jsonb_array_length(elem->'restrictions') > 0
GROUP BY n.type, n.subtype
ORDER BY count_with_restrictions DESC;

-- ================================================================
-- 6. AVAILABILITY STRUCTURE BREAKDOWN
-- ================================================================

-- Extract all unique field names from availabilities objects
-- Useful for understanding the complete data model
SELECT DISTINCT jsonb_object_keys(elem) as field_name
FROM content.datagramvariant dv,
jsonb_array_elements(dv.values) as elem
WHERE dv.name = 'AVAILABILITIES'
ORDER BY field_name;

-- ================================================================
-- 7. SAMPLE RESTRICTION DATA QUERIES (for testing when data exists)
-- ================================================================

-- Find availabilities with specific restriction types
-- (Example query for when restriction data is populated)
SELECT
    n.id as node_id,
    jsonb_pretty(restriction) as restriction_detail
FROM content.node n
JOIN content.datagramvariant dv ON n.id = dv.nodeid,
jsonb_array_elements(dv.values) as availability,
jsonb_array_elements(availability->'restrictions') as restriction
WHERE dv.name = 'AVAILABILITIES'
  AND restriction->>'type' = 'platform'
  AND restriction->>'usage' = 'inclusive'
LIMIT 5;

-- Find restriction parameters
-- (Example query for when restriction data is populated)
SELECT
    n.id as node_id,
    restriction->>'type' as restriction_type,
    restriction->>'usage' as restriction_usage,
    restriction->>'value' as restriction_value,
    jsonb_pretty(restriction->'parameters') as parameters
FROM content.node n
JOIN content.datagramvariant dv ON n.id = dv.nodeid,
jsonb_array_elements(dv.values) as availability,
jsonb_array_elements(availability->'restrictions') as restriction
WHERE dv.name = 'AVAILABILITIES'
  AND restriction ? 'parameters'
  AND jsonb_array_length(restriction->'parameters') > 0
LIMIT 5;

-- ================================================================
-- USAGE NOTES:
-- ================================================================
-- 1. All queries target the 'content' schema in the 'pcms' database
-- 2. The main tables are 'node' (content metadata) and 'datagramvariant' (attribute data)
-- 3. Availabilities are stored as JSONB arrays in datagramvariant.values
-- 4. Each availability object contains a 'restrictions' array field
-- 5. As of the last check, all restrictions arrays are empty in this database
-- 6. The structure is ready for restrictions data - just needs content ingestion
-- ================================================================
