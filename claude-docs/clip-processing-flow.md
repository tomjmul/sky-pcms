# Clip Processing Flow in PCMS Curator Priority

**Date:** 2025-10-27
**Author:** Claude Code Analysis
**Module:** pcms-curator-priority

---

## Executive Summary

The `pcms-curator-priority` module is an **event-driven system** that processes Live Story Events (SLE) and short-form content (CLIPS) through Kafka. It **does not create clip nodes** - instead, it reacts to clip events and manages the relationship between clips and their parent stories.

**Key Insight:** Clips are created upstream (likely in `pcms-ingest-proxy` or another ingestion service). The curator-priority module receives Kafka notifications about these clips and handles their allocation to stories.

---

## Current Clip Processing Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    UPSTREAM SYSTEM                               │
│              (pcms-ingest-proxy or similar)                      │
│                                                                   │
│  1. Receives clip data from external source                      │
│  2. Creates SHORTFORM/CLIP node in database                      │
│  3. Publishes Kafka event to "ingest_notification" topic         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    KAFKA TOPIC                                   │
│                "ingest_notification"                             │
│                                                                   │
│  Event contains:                                                 │
│  - nodeId: UUID                                                  │
│  - operation: CREATE | UPDATE                                    │
│  - nodeType: ASSET                                               │
│  - nodeSubType: SHORTFORM                                        │
│  - nodeCategory: CLIP                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PCMS-CURATOR-PRIORITY MODULE                        │
│                                                                   │
│  EventConsumer → EventHandler → ClipProcessor                    │
│                                                                   │
│  • Finds parent story by provider variant ID                     │
│  • Adds clip to story's 'items' collection                       │
│  • Maintains chronological ordering                              │
│  • Publishes updated story                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Flow: When a Clip Arrives

### Step 1: Kafka Event Consumption

**Component:** `EventConsumer`
**Location:** `pcms-curator-priority/src/main/java/com/sky/pcms/curator/priority/event/EventConsumer.java`

```java
// Listens to "ingest_notification" Kafka topic
@KafkaListener(topics = "ingest_notification")
public void consume(ConsumerRecord<String, String> record) {
    IngestEvent event = parseEvent(record);
    eventHandler.handle(event);
}
```

**Event Structure:**
```json
{
  "nodeId": "123e4567-e89b-12d3-a456-426614174000",
  "fqn": "clip-fqn",
  "op": "CREATE",
  "nodeType": "ASSET",
  "nodeSubType": "SHORTFORM",
  "nodeCategory": "CLIP"
}
```

---

### Step 2: Event Handling

**Component:** `EventHandler`
**Location:** `pcms-curator-priority/src/main/java/com/sky/pcms/curator/priority/event/EventHandler.java`

```java
public void handle(IngestEvent event) {
    // 1. Fetch the clip node from database
    Node node = nodeService.getNode(event.getNodeId());

    // 2. Pass to all registered processors
    List<Op> operations = new ArrayList<>();
    for (Processor processor : processors) {
        operations.addAll(processor.process(event, node));
    }

    // 3. Execute operations (publish, delete, etc.)
    for (Op op : operations) {
        eventOpService.execute(op);
    }
}
```

**Registered Processors:**
- `ClipProcessor` - Handles clip events
- `LiveStorySleProcessor` - Handles live story events
- `CourtSideSleProcessor` - Handles courtside events

---

### Step 3: Clip Filter Validation

**Component:** `ClipProcessorFilter`
**Location:** `pcms-curator-priority/src/main/java/com/sky/pcms/curator/priority/event/processor/ClipProcessorFilter.java`

```java
public boolean accept(IngestEvent event, Node node) {
    return node != null
        && (CREATE.equals(event.getOp()) || UPDATE.equals(event.getOp()))
        && ASSET.equals(event.getNodeType())
        && SHORTFORM.equals(event.getNodeSubType())
        && CLIP.equals(event.getNodeCategory());
}
```

**Acceptance Criteria:**
- ✓ Node exists
- ✓ Operation is CREATE or UPDATE
- ✓ nodeType == "ASSET"
- ✓ nodeSubType == "SHORTFORM"
- ✓ nodeCategory == "CLIP"

---

### Step 4: Clip Processing

**Component:** `ClipProcessor`
**Location:** `pcms-curator-priority/src/main/java/com/sky/pcms/curator/priority/event/processor/ClipProcessor.java`

#### 4.1 Extract Clip Information

```java
// Create ClipInfo domain object
ClipInfo clip = ClipInfo.from(node);
// Contains: UUID id, long alternativeDateMillis
```

**ClipInfo Structure:**
```java
public record ClipInfo(
    @NonNull UUID id,
    long alternativeDateMillis
) {
    public static Comparator<ClipInfo> BY_ALTERNATIVE_DATE_ASC = ...;
    public static Comparator<ClipInfo> BY_ALTERNATIVE_DATE_DESC = ...;
}
```

#### 4.2 Find Parent Story

**Current Mechanism:** Provider Variant ID Linking

```java
// Extract RELATED_PROVIDER_VARIANT_ID from clip node
Optional<UUID> storyId = storyService.findStoryByClip(clip);
```

**How it works:**
1. Clip has a `SHORTFORM_LINKED_OBJECTS` variant
2. Contains `RELATED_PROVIDER_VARIANT_ID` field
3. This PVID points to the parent story
4. Query: `StoryDao.findStoryByProviderVariantId(pvid)`

**SQL Query:**
```sql
SELECT DISTINCT n.id
FROM content.node n
INNER JOIN content.nodecollectionitem nci ON nci.nodeid = n.id
INNER JOIN content.externalid e ON e.nodeid = nci.memberid
WHERE nci.collectionname = 'items'
  AND e.type = 'PROVIDER_VARIANT_ID'
  AND e.externalid = :pvid
```

#### 4.3 Check if Clip Already Linked

```java
List<ClipInfo> currentClips = storyService.findClipsByStoryId(storyId);

// Check if clip already exists in story
if (currentClips.stream().anyMatch(c -> c.id().equals(clip.id()))) {
    return Collections.emptyList(); // No changes needed
}
```

#### 4.4 Determine Changes

**Helper:** `ClipProcessorHelper`

```java
boolean isNew = clipProcessorHelper.isNew(currentClips, clip);
boolean isNewest = clipProcessorHelper.isNewest(currentClips, clip);
```

**Logic:**
- **isNew:** Clip ID not present in current clips list
- **isNewest:** Clip's `alternativeDateMillis` is greater than all existing clips

#### 4.5 Update Story

```java
// Add clip to story's items collection
Optional<List<String>> updatedMembers = clipProcessorHelper.getMembers(currentClips, clip);

// Update lastItemAdded variant if newest
Optional<List<DatagramVariant>> updatedVariants = null;
if (isNewest) {
    updatedVariants = Optional.of(storyService.getLastItemAddedVariant());
}

// Execute update
clipProcessorHelper.updaate(storyId, updatedMembers, updatedVariants);
```

**Members Update:**
- Adds clip UUID to items collection
- Maintains chronological order (oldest to newest)
- Sorted by `alternativeDateMillis`

**Variants Update (if newest clip):**
```java
DatagramVariant lastItemAdded = new DatagramVariant();
lastItemAdded.setVariantName("lastItemAdded");
lastItemAdded.setDateTime(Instant.now());
```

#### 4.6 Return Publish Operation

```java
return List.of(new PublishOp(storyId, TraverseMode.NONE));
```

**TraverseMode.NONE:** Publish only the story node (not descendants)

---

### Step 5: Operation Execution

**Component:** `EventOpService`

```java
// For PublishOp
publisherClientService.publish(storyId, TraverseMode.NONE);

// Story published to downstream systems
```

---

### Step 6: Completion

- Kafka message acknowledged
- Story now contains the new clip in chronological order
- Downstream consumers receive updated story

---

## Key Components Reference

### Domain Models

#### ClipInfo
**File:** `domain/ClipInfo.java`

```java
public record ClipInfo(
    @NonNull UUID id,
    long alternativeDateMillis
) {
    public static ClipInfo from(@NonNull Node node) {
        // Extract alternative date from node
        // Format: ISO_DATE or ISO_DATE_TIME
        // Defaults to -1L if missing
    }
}
```

#### StoryInfo
**File:** `domain/StoryInfo.java`

```java
public record StoryInfo(
    @NonNull UUID id,
    OtherTag tag  // Provider editorial tag (nullable)
) {}
```

### Services

#### StoryService
**File:** `service/StoryService.java`

**Key Methods:**
- `findStoryByClip(Node clip)` - Finds parent story via provider variant ID
- `findClipsByStoryId(UUID storyId)` - Gets all clips in a story
- `getLastItemAddedVariant()` - Creates lastItemAdded variant with current timestamp

#### NodeService
**File:** From pcms-core (external dependency)

**Key Methods:**
- `getNode(UUID nodeId)` - Fetches node by ID
- `updateNode(UpdateNodeRequest)` - Updates node attributes/collections

### Data Access

#### StoryDao
**File:** `dao/StoryDao.java`

**Key Methods:**
- `findStoryByProviderVariantId(String pvid)` - Finds story by PVID
- `findClipsByStoryId(UUID storyId)` - Gets clips with alternative dates

**SQL Queries:**
```sql
-- Find clips in story (with timestamps for ordering)
SELECT nci.memberid, dv.value
FROM content.nodecollectionitem nci
LEFT JOIN content.datagramvariant dv
  ON dv.nodeid = nci.memberid
  AND dv.variantname = 'alternativeDate'
WHERE nci.nodeid = :storyId
  AND nci.collectionname = 'items'
```

### Helpers

#### ClipProcessorHelper
**File:** `event/processor/ClipProcessorHelper.java`

**Key Methods:**
- `isNew(List<ClipInfo>, ClipInfo)` - Checks if clip is new
- `isNewest(List<ClipInfo>, ClipInfo)` - Checks if chronologically newest
- `getMembers(List<ClipInfo>, ClipInfo)` - Generates sorted member list
- `updaate(UUID, Optional<List<String>>, Optional<List<DatagramVariant>>)` - Executes update

#### DatagramVariantResolver
**File:** `service/DatagramVariantResolver.java`

**Key Methods:**
- `getRelatedProviderVariantId(Node)` - Extracts PVID from clip's linked objects

---

## Database Schema Context

### Tables Used

**content.node**
- All content nodes (stories, clips, events)
- Columns: id, type, subtype, category, fqn, etc.

**content.nodecollectionitem**
- Many-to-many relationships between nodes
- Columns: nodeid, memberid, collectionname, ordinal

**content.datagramvariant**
- Attribute values per node (JSON stored)
- Columns: nodeid, variantname, value, type

**content.externalid**
- External identifier mappings
- Columns: nodeid, type, externalid

### Collections

**items** - Clips contained in a story
- Stored in `nodecollectionitem` table
- `nodeid` = story UUID
- `memberid` = clip UUID
- `collectionname` = 'items'

**sle** - Stories contained in an event
- Same structure, different collection name

---

## Clip Chronological Ordering

### Alternative Date Format

Clips are ordered by `alternativeDateMillis` extracted from the `alternativeDate` variant.

**Supported Formats:**
1. `ISO_DATE` - e.g., "2025-10-27" (parsed to midnight UTC)
2. `ISO_DATE_TIME` - e.g., "2025-10-27T09:15:30Z"

**Parsing Logic:**
```java
try {
    return LocalDate.parse(value, ISO_DATE)
        .atStartOfDay(ZoneOffset.UTC)
        .toInstant()
        .toEpochMilli();
} catch (DateTimeParseException e) {
    return Instant.parse(value).toEpochMilli();
}
```

### Example Timeline

```
Story Created: 2025-10-27

09:00 - Clip A arrives (alternativeDate: 2025-10-27T09:00:00Z)
        → Story items: [Clip A]
        → lastItemAdded: 2025-10-27T09:00:00Z

09:15 - Clip B arrives (alternativeDate: 2025-10-27T09:15:00Z)
        → Story items: [Clip A, Clip B]
        → lastItemAdded: 2025-10-27T09:15:00Z (updated)

09:10 - Clip C arrives (alternativeDate: 2025-10-27T09:10:00Z)
        → Story items: [Clip A, Clip C, Clip B]
        → lastItemAdded: 2025-10-27T09:15:00Z (NOT updated)
```

**Key Point:** Clips are always sorted chronologically, but only the chronologically newest clip triggers the `lastItemAdded` variant update.

---

## Important Design Patterns

### 1. Event-Driven Architecture
- Decoupled producers and consumers
- Kafka as message backbone
- Asynchronous processing

### 2. Processor Chain Pattern
- Multiple processors handle different event types
- Each processor has a filter for acceptance
- Processors return operations for execution

### 3. Immutable Domain Models
- ClipInfo and StoryInfo are Java records
- No mutation, only creation
- Functional programming style

### 4. Optional-Based Control Flow
- Extensive use of `Optional<T>`
- Clear intent for nullable values
- Prevents NullPointerExceptions

### 5. Lazy Evaluation
- Changes only applied if needed
- Helper methods return Optional to indicate changes
- Reduces unnecessary database updates

### 6. Separation of Concerns
- **Filter:** Accepts/rejects events
- **Processor:** Business logic
- **Helper:** Utility methods
- **DAO:** Database access
- **Service:** Orchestration

---

## Current Limitations

### Provider Variant Linking

**Limitation:** Clips must have a `RELATED_PROVIDER_VARIANT_ID` pointing to a specific story.

**Implications:**
- Clip must know its parent story at creation time
- No dynamic allocation based on metadata
- Cannot re-allocate clips when metadata changes
- Tight coupling between clips and stories

### No Tag-Based Allocation

**Current State:** No mechanism to allocate clips to stories based on tags.

**What's Missing:**
- Tag extraction from clips
- Tag matching logic (e.g., `story:courtside` → Story with tag `courtside`)
- Re-allocation when clip tags change
- Removal from old story when re-allocated

---

## Comparison with Other Processors

| Aspect | ClipProcessor | LiveStorySleProcessor | CourtSideSleProcessor |
|--------|---------------|------------------------|------------------------|
| **Event Trigger** | CLIP events | SLE events | SLE events |
| **Creates Nodes** | No | Yes (stories) | Yes (stories) |
| **Updates Nodes** | Yes (stories) | Yes (stories) | Yes (stories) |
| **Members Updated** | items collection | sle collection | sle collection |
| **Complexity** | Low | Medium | High |
| **Features** | Chronological ordering | External ID, variants | Tag-based story splitting |

---

## Error Handling & Safety

### Null Safety
- Extensive use of `Optional<T>`
- `@NonNull` annotations on method parameters
- Null checks before processing

### Exception Handling
```java
// EventConsumer catches all exceptions
try {
    eventHandler.handle(event);
} catch (Exception e) {
    log.error("Error processing event", e);
    // Still acknowledges Kafka message to avoid reprocessing
}
```

### Graceful Degradation
- Missing alternative dates default to `-1L`
- Logged as error but doesn't crash
- Processing continues

### Transaction Safety
- Named parameter queries prevent SQL injection
- DAO uses `NamedParameterJdbcTemplate`

---

## Sequence Diagram: Complete Flow

```
┌──────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│Kafka │   │EventConsumer │   │EventHandler  │   │ClipProcessor │
└──┬───┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
   │              │                   │                   │
   │ Event        │                   │                   │
   ├─────────────>│                   │                   │
   │              │                   │                   │
   │              │ handle(event)     │                   │
   │              ├──────────────────>│                   │
   │              │                   │                   │
   │              │                   │ getNode(nodeId)   │
   │              │                   ├──────────────────>│ NodeService
   │              │                   │                   │
   │              │                   │ process(event, node)
   │              │                   ├──────────────────>│
   │              │                   │                   │
   │              │                   │                   │ ClipProcessorFilter
   │              │                   │                   │ .accept()?
   │              │                   │                   ├──> ✓ Pass
   │              │                   │                   │
   │              │                   │                   │ Extract ClipInfo
   │              │                   │                   │
   │              │                   │                   │ findStoryByClip()
   │              │                   │                   ├──────────────────>│ StoryService
   │              │                   │                   │                   ├──> StoryDao
   │              │                   │                   │                   │    .findStoryByProviderVariantId()
   │              │                   │                   │<──────────────────┤
   │              │                   │                   │ storyId
   │              │                   │                   │
   │              │                   │                   │ findClipsByStoryId()
   │              │                   │                   ├──────────────────>│ StoryService
   │              │                   │                   │<──────────────────┤
   │              │                   │                   │ List<ClipInfo>
   │              │                   │                   │
   │              │                   │                   │ isNew()?
   │              │                   │                   │ isNewest()?
   │              │                   │                   │ getMembers()
   │              │                   │                   ├──> ClipProcessorHelper
   │              │                   │                   │
   │              │                   │                   │ updateNode()
   │              │                   │                   ├──────────────────>│ NodeService
   │              │                   │                   │                   │ - Update items collection
   │              │                   │                   │                   │ - Update lastItemAdded
   │              │                   │                   │
   │              │                   │<──────────────────┤
   │              │                   │ PublishOp         │
   │              │                   │                   │
   │              │                   │ execute(PublishOp)│
   │              │                   ├──────────────────>│ EventOpService
   │              │                   │                   ├──> PublisherClientService
   │              │                   │                   │    .publish(storyId, NONE)
   │              │                   │                   │
   │              │<──────────────────┤                   │
   │              │                   │                   │
   │ ACK          │                   │                   │
   │<─────────────┤                   │                   │
   │              │                   │                   │
```

---

## Technology Stack

**Language:** Java 17
**Framework:** Spring Boot
**Messaging:** Apache Kafka
**Database:** PostgreSQL
**ORM:** JDBC (NamedParameterJdbcTemplate)
**Testing:** Groovy/Spock

---

## Open Questions

### Where are clips created?
- Likely in `pcms-ingest-proxy` module
- Or external ingestion service
- Need to explore upstream to understand full flow

### How are ProviderEditorial tags set?
- At clip creation time?
- Can they be updated later?
- What format do they use? (e.g., `story:courtside`)

### What is OtherTag?
- Enum or class?
- What values are supported?
- How are they matched?

---

## Next Steps for Tag-Based Allocation

To implement the requirements (tag-based clip allocation), we need to:

1. **Understand tag structure**
   - How ProviderEditorial tags are stored on clips
   - Pattern matching for `story:*` format
   - How to extract tags from nodes

2. **Find stories by tag**
   - SQL query to find Story with specific tag
   - Handle OtherTag in StoryInfo

3. **Replace/supplement provider variant linking**
   - Tag-based matching as primary mechanism
   - Provider variant as fallback?

4. **Handle re-allocation**
   - Remove clip from old story
   - Add clip to new story
   - Track previous allocations

5. **Update ClipProcessor**
   - Extract tag from clip
   - Match against stories
   - Manage allocations

---

## References

**Module Path:** `/Users/tommy/Development/ott-pcms/pcms-curator-priority`

**Key Files:**
- `src/main/java/com/sky/pcms/curator/priority/event/EventConsumer.java`
- `src/main/java/com/sky/pcms/curator/priority/event/EventHandler.java`
- `src/main/java/com/sky/pcms/curator/priority/event/processor/ClipProcessor.java`
- `src/main/java/com/sky/pcms/curator/priority/event/processor/ClipProcessorFilter.java`
- `src/main/java/com/sky/pcms/curator/priority/event/processor/ClipProcessorHelper.java`
- `src/main/java/com/sky/pcms/curator/priority/service/StoryService.java`
- `src/main/java/com/sky/pcms/curator/priority/dao/StoryDao.java`
- `src/main/java/com/sky/pcms/curator/priority/domain/ClipInfo.java`
- `src/main/java/com/sky/pcms/curator/priority/domain/StoryInfo.java`

**Database Schema:** `content` schema in PostgreSQL

---

**Document Version:** 1.0
**Last Updated:** 2025-10-27
