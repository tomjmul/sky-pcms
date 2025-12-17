# Availability Restrictions Search


## Overview

The availability restrictions search allows you to query content based on restriction metadata associated with availabilities. Restrictions define platform access, usage permissions, and parameters that control content distribution.

## Architecture

### Components

1. **AvailabilitiesFieldGenerator** - Indexes restriction data into Solr fields during content ingestion
2. **AvailabilityRestrictionsHandler** - Processes search queries and maps them to appropriate Solr fields
3. **Solr Fields** - Indexed restriction data for fast searching

### Indexed Fields

The following Solr fields are created for restriction searching:

```
availabilities_restrictions_type_ss           - Restriction types (e.g., "platform", "territory")
availabilities_restrictions_usage_ss          - Usage types (e.g., "inclusive", "exclusive") 
availabilities_restrictions_value_ss          - Restriction values (e.g., "sky:syndication", "GB")
availabilities_restrictions_parameter_type_ss - Parameter types (e.g., "partner", "region")
availabilities_restrictions_parameter_value_ss- Parameter values (e.g., "WSC", "EMEA")
availabilities_restrictions_composite_ss      - Composite format (type:usage:value)
availabilities_restrictions_with_params_ss    - Full format (type:usage:value:paramType:paramValue)
```

## Query Types

### 1. Component Queries

Search individual restriction components.

#### Query Names

| Query Name | Description | Maps to Solr Field |
|------------|-------------|---------------------|
| `restrictions.type` | Restriction type | `availabilities_restrictions_type_ss` |
| `restrictions.usage` | Usage type | `availabilities_restrictions_usage_ss` |
| `restrictions.value` | Restriction value | `availabilities_restrictions_value_ss` |
| `restrictions.parameterType` | Parameter type | `availabilities_restrictions_parameter_type_ss` |
| `restrictions.parameterValue` | Parameter value | `availabilities_restrictions_parameter_value_ss` |

#### Examples

**Search for platform restrictions:**
```json
{
  "name": "restrictions.type",
  "op": "EQ",
  "value": "platform"
}
```

**Search for inclusive usage:**
```json
{
  "name": "restrictions.usage", 
  "op": "EQ",
  "value": "inclusive"
}
```

**Search for multiple restriction types:**
```json
{
  "name": "restrictions.type",
  "op": "IN", 
  "values": ["platform", "territory"]
}
```

**Search for specific syndication values:**
```json
{
  "name": "restrictions.value",
  "op": "IN",
  "values": ["sky:syndication", "sky:linear"]
}
```

**Search for partner parameters:**
```json
{
  "name": "restrictions.parameterType",
  "op": "EQ",
  "value": "partner"
}
```

### 2. Composite Queries

Search using combined type:usage:value format.

#### Format
```
type:usage:value
```

#### Query Names
- `restrictions.composite`

#### Examples

**Search for inclusive platform syndication:**
```json
{
  "name": "restrictions.composite",
  "op": "EQ", 
  "value": "platform:inclusive:sky:syndication"
}
```

**Search for exclusive territory restrictions:**
```json
{
  "name": "composite",
  "op": "EQ",
  "value": "territory:exclusive:GB"
}
```

**Search for multiple composite restrictions:**
```json
{
  "name": "restrictions.composite",
  "op": "IN",
  "values": [
    "platform:inclusive:sky:syndication",
    "territory:exclusive:GB",
    "platform:inclusive:sky:linear"
  ]
}
```

**Require all composite restrictions (AND logic):**
```json
{
  "name": "restrictions.composite", 
  "op": "IN_ALL",
  "values": [
    "platform:inclusive:sky:syndication",
    "territory:inclusive:GB"
  ]
}
```

**Exclude specific composite restrictions:**
```json
{
  "name": "restrictions.composite",
  "op": "NOT_IN",
  "values": ["territory:exclusive:US"]
}
```

### 3. WithParams Queries

Search using full restriction format including parameters.

#### Format
```
type:usage:value:parameterType:parameterValue
```

#### Query Names
- `restrictions.withParams`

#### Examples

**Search for platform syndication with WSC partner:**
```json
{
  "name": "restrictions.withParams",
  "op": "EQ",
  "value": "platform:inclusive:sky:syndication:partner:WSC"
}
```

**Search for territory restriction with region parameter:**
```json
{
  "name": "withParams",
  "op": "EQ", 
  "value": "territory:exclusive:GB:region:EMEA"
}
```

**Search for multiple parameterized restrictions:**
```json
{
  "name": "restrictions.withParams",
  "op": "IN",
  "values": [
    "platform:inclusive:sky:syndication:partner:WSC",
    "platform:inclusive:sky:linear:partner:NOW",
    "territory:exclusive:GB:region:EMEA"
  ]
}
```

**Extended format with additional parameters:**
```json
{
  "name": "restrictions.withParams",
  "op": "EQ",
  "value": "platform:inclusive:sky:syndication:partner:WSC:extra:metadata"
}
```

## Supported Operators

| Operator | Description | Example Use Case |
|----------|-------------|------------------|
| `EQ` | Exact match | Single restriction value |
| `IN` | Match any of the values (OR logic) | Multiple acceptable restrictions |
| `IN_ALL` | Match all values (AND logic) | Content must have all restrictions |
| `NOT_IN` | Exclude values | Content without specific restrictions |

### Operator Examples

**EQ - Exact Match:**
```json
{
  "name": "restrictions.type",
  "op": "EQ",
  "value": "platform"
}
```

**IN - Match Any (OR Logic):**
```json
{
  "name": "restrictions.composite", 
  "op": "IN",
  "values": [
    "platform:inclusive:sky:syndication",
    "platform:inclusive:sky:linear"
  ]
}
// Returns content with EITHER restriction
```

**IN_ALL - Match All (AND Logic):**
```json
{
  "name": "restrictions.type",
  "op": "IN_ALL", 
  "values": ["platform", "territory"]
}
// Returns content with BOTH platform AND territory restrictions
```

**NOT_IN - Exclude:**
```json
{
  "name": "restrictions.value",
  "op": "NOT_IN",
  "values": ["sky:blocked", "restricted:content"]
}
// Returns content WITHOUT these restriction values
```

## Case Sensitivity

All query names are **case-insensitive**:

```json
// These are all equivalent:
{"name": "restrictions.type", ...}
{"name": "restrictions.TYPE", ...}
{"name": "restrictions.Type", ...}
{"name": "TYPE", ...}
{"name": "type", ...}
```

## Real-World Examples

### Example 1: Find Sky Syndication Content
```json
{
  "name": "restrictions.composite",
  "op": "EQ", 
  "value": "platform:inclusive:sky:syndication"
}
```

### Example 2: Find GB/IE-Available Content
```json
{
  "name": "restrictions.composite",
  "op": "IN",
  "values": [
    "territory:inclusive:IE",
    "territory:inclusive:GB"
  ]
}
```

### Example 3: Find Partner-Specific Content
```json
{
  "name": "restrictions.withParams",
  "op": "EQ",
  "value": "platform:inclusive:sky:syndication:partner:WSC"
}
```

### Example 4: Complex Multi-Restriction Search
```json
{
  "name": "restrictions.type",
  "op": "IN_ALL",
  "values": ["platform", "territory"]
}
// AND
{
  "name": "restrictions.usage", 
  "op": "EQ",
  "value": "inclusive"
}
// AND  
{
  "name": "restrictions.parameterType",
  "op": "EQ",
  "value": "partner"
}
```

### Example 5: Exclude Blocked Content
```json
{
  "name": "restrictions.value",
  "op": "NOT_IN", 
  "values": ["blocked", "restricted", "unavailable"]
}
```

### Example 6: Regional Content Distribution
```json
{
  "name": "restrictions.withParams",
  "op": "IN",
  "values": [
    "territory:inclusive:GB:region:EMEA",
    "territory:inclusive:IE:region:EMEA", 
    "territory:inclusive:DE:region:EMEA"
  ]
}
```

## Data Structure

### Restriction Model
```json
{
  "type": "platform",
  "usage": "inclusive", 
  "value": "sky:syndication",
  "parameters": [
    {
      "type": "partner",
      "value": "WSC"
    }
  ]
}
```

### Indexed Values
From the above restriction, these values are indexed:

- **Type**: `"platform"`
- **Usage**: `"inclusive"`
- **Value**: `"sky:syndication"`
- **Parameter Type**: `"partner"`
- **Parameter Value**: `"WSC"`
- **Composite**: `"platform:inclusive:sky:syndication"`
- **WithParams**: `"platform:inclusive:sky:syndication:partner:WSC"`

## Error Handling

### Invalid Operators
Unsupported operators return NO_OP:
```json
{
  "name": "restrictions.type",
  "op": "LIKE",  //  Not supported
  "value": "platform"
}
```

### Empty Values
Empty or null values return NO_OP:
```json
{
  "name": "restrictions.type", 
  "op": "EQ",
  "value": ""  //  Empty value
}
```

### Invalid Formats

**Invalid Composite Format:**
```json
{
  "name": "restrictions.composite",
  "op": "EQ",
  "value": "platform:inclusive"  //  Missing value part
}
```

**Invalid WithParams Format:**
```json
{
  "name": "restrictions.withParams",
  "op": "EQ", 
  "value": "platform:inclusive:sky:syndication"  //  Missing parameter parts
}
```

## Performance Tips

1. **Use specific queries**: Component queries are fastest for single-field searches
2. **Batch multiple values**: Use `IN` operator instead of multiple `EQ` queries
3. **Use composite format**: More efficient than separate component queries
4. **Limit NOT_IN usage**: Can be slower than positive matches

## Integration Examples

### REST API Query
```http
POST /core/catalog/curation/config/preview
{
  "searchQuery": {
    "offset": 0,
    "parserType": "LUCENE",
    "advancedParams": [
      {
        "paramsLogicalOp": "AND",
        "advancedParams": [
          {
            "paramsLogicalOp": "AND",
            "advancedParams": [],
            "params": [
              {
                "name": "restrictions.composite",
                "op": "IN",
                "values": [
                  "platform:inclusive:sky:syndication"
                ]
              }
            ]
          }
        ],
        "params": []
      }
    ],
    "limit": 10,
    "sorts": null,
    "language": "en",
    "paramsLogicalOp": "AND"
  },
  "excludedItems": []
```

### Java Search Builder
```java
SearchQuery query = SearchQuery.builder()
  .withParam("restrictions.type", EQ, "platform")
  .withParam("restrictions.usage", EQ, "inclusive") 
  .build();
```


## Troubleshooting

### Common Issues

1. **No results returned**
   - Check if restriction data exists in availabilities
   - Verify correct field name and format
   - Ensure values match exactly (case-sensitive for values)

2. **Query ignored (NO_OP)**
   - Check operator is supported (EQ, IN, IN_ALL, NOT_IN only)
   - Verify values are not empty or null
   - Check composite/withParams format is valid

3. **Unexpected results**
   - Remember IN is OR logic, IN_ALL is AND logic
   - Verify parameter order in withParams format
   - Check for trailing colons in format strings

### Debugging

Enable debug logging to see query processing:
```java
logger.debug("Processing restriction query: {}", searchParam);
```

Query validation logs:
```
WARN  - No valid composite restriction formats found in values: [invalid:format]
DEBUG - Invalid composite format 'platform:inclusive', expected at least 3 parts
```

## While waiting for data from upstream...

### Add restrictions to an SLE

```sql
-- Update query to add restrictions to all availabilities for a specific node

UPDATE content.datagramvariant
SET values = (
    SELECT jsonb_agg(
        CASE 
            WHEN jsonb_array_length(avail->'restrictions') > 0 THEN
                -- If restrictions already exist, append the new one
                jsonb_set(
                    avail,
                    '{restrictions}',
                    (avail->'restrictions') || jsonb_build_array(
                        jsonb_build_object(
                            'type', 'platform',
                            'usage', 'inclusive',
                            'value', 'sky:syndication',
                            'parameters', jsonb_build_array(
                                jsonb_build_object(
                                    'type', 'partner',
                                    'value', 'WSC'
                                )
                            )
                        )
                    )
                )
            ELSE
                -- If no restrictions exist, create a new array with the restriction
                jsonb_set(
                    avail,
                    '{restrictions}',
                    jsonb_build_array(
                        jsonb_build_object(
                            'type', 'platform',
                            'usage', 'inclusive',
                            'value', 'sky:syndication',
                            'parameters', jsonb_build_array(
                                jsonb_build_object(
                                    'type', 'partner',
                                    'value', 'WSC'
                                )
                            )
                        )
                    )
                )
        END
    )
    FROM jsonb_array_elements(values) AS avail
)
WHERE nodeid = 'NODE_ID_HERE'
  AND name = 'AVAILABILITIES'
  AND values IS NOT NULL;

```

### Bring an SLE back into window

```sql
-- Update query to set availability into the future
-- This sets end dates to January 1, 2030 (timestamp: 1893456000)

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
```

### Touch SLE to re-index

```shell
curl -X "POST" "http://local.pcms.sky.com/core/node/touch/NODE_ID_HERE?publish=true&forceUpdate=true" \
     -H 'X-SkyOTT-Territory: GB' \
     -H 'X-SkyOTT-Language: en-GB' \
     -H 'X-SkyOTT-Proposition: NOWOTTGB' \
     -H 'X-SkyOTT-Device: COMPUTER' \
     -H 'X-SkyOTT-Platform: PC' \
     -H 'X-SkyOTT-ServiceToken: admin' \
     -H 'X-SkyOTT-Service: service-integration@pcms.uk' \
     -H 'Accept: application/json' \
     -H 'Content-Type: application/json'
```
