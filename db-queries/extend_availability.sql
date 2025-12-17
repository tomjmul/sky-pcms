-- Update availability end dates for a specific node
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
