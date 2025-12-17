## Issues Fixed: Rights Merging, Missing Parameter Data, and WSC Filtering

### Problems Identified

#### Issue 1: Restriction Data Lost During Rights Merge
- When merging overlapping availability windows, restrictions from some rights were completely lost
- Example: 4 rights input (2 without restrictions, 2 with restrictions) resulted in 1 merged right with zero restrictions
- All restriction data from the latter rights was silently dropped

#### Issue 2: Missing Parameter Data in Restrictions
- The restriction model was incomplete and couldn't capture parameter data from source
- Source data contained restriction parameters (e.g., partner regions) that were being lost during transformation
- This data was present in the source but had no way to be stored or passed through

#### Issue 3: Missing WSC Partner Filtering
- The feed needs to only include rights that are specifically for the WSC partner syndication
- No filtering was in place to ensure only WSC-relevant rights were included

#### Issue 4: Simplified Asset Filtering
- After adding WSC rights filtering in the transformer, the `hasSyndicationInclusiveRestriction` method in IntegrationFeedTask became redundant
- The method was checking for syndication restrictions, but since we now filter for WSC rights in the transformer, we can simply filter out assets that have no rights remaining
- This simplifies the logic to just checking if an asset has any rights after WSC filtering

### Root Causes

**Issue 1**: The merge logic incorrectly combined all overlapping rights but only preserved restrictions from the first right

**Issue 2**: The data model was incomplete and couldn't represent the full restriction structure from source data

**Issue 3**: No filtering logic existed to ensure only partner-specific rights were included in the feed

**Issue 4**: Complex filtering logic when a simple rights existence check would suffice after WSC filtering

### Solutions Implemented

#### Issue 1: Fixed Merge Behavior

**Previous Behavior:**
- The system would merge ANY rights with overlapping time periods
- When merging, it would combine the date ranges (taking earliest start and latest end)
- BUT it would only keep the restrictions from the FIRST right in the sequence
- All restrictions from subsequent overlapping rights were discarded
- This meant if Right 1 had no restrictions and overlapped with Rights 2, 3, 4 that had restrictions, the merged result would have NO restrictions at all

**New Behavior:**
- Rights are now only merged if they have BOTH:
  1. Overlapping time periods AND
  2. Exactly identical restrictions (same type, value, usage, and parameters)
- Rights with different restrictions are kept as separate entries, even if their dates overlap
- This preserves the distinct availability rules for each set of restrictions
- Example: If content is available on mobile Jan 1-15 and on web Jan 10-20, these remain as two separate rights rather than being incorrectly merged into one

#### Issue 2: Extended Data Model

**Previous State:**
- The restriction model couldn't store parameter data that existed in the source
- Parameter information (like regional restrictions) was present in source data but had nowhere to go
- This resulted in incomplete restriction data being passed downstream

**New State:**
- Extended the data model to capture and preserve the complete restriction structure including all parameter data
- All restriction information from source now flows through to the output without loss

#### Issue 3: Added WSC Partner Filtering

**Previous State:**
- All rights were included regardless of partner
- No validation that rights were intended for WSC syndication

**New State:**
- Added filtering to only include rights with the specific WSC syndication restriction shape
- Rights must have a platform restriction with:
  - Type: "platform"
  - Usage: "inclusive"
  - Value: "sky:syndication"
  - Parameter with type "partner" and value "WSC"
- Only rights matching this criteria are included in the feed output

#### Issue 4: Simplified Asset Filtering Logic

**Previous State:**
- Complex syndication restriction checking in IntegrationFeedTask
- Duplicate logic checking for syndication platform restrictions

**New State:**
- Removed redundant `hasSyndicationInclusiveRestriction` method
- Simply filter out assets that have no rights remaining after WSC filtering
- Cleaner, simpler code that relies on the transformer's WSC filtering

### Impact
- All restriction data is now preserved during merging
- Complete restriction information including parameters flows through to the output
- Different availability rules remain distinct and aren't incorrectly combined
- No data loss between source and transformed output
- Feed now only contains rights specifically intended for WSC partner syndication
- Cleaner, more maintainable code with filtering logic in one place