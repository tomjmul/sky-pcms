# Accessing Jira via Firefox Cookies

## Quick Reference

Use this technique to read Jira tickets from `gspcloud.atlassian.net` using authenticated Firefox cookies.

**Note:** The `jira-get` script includes clickable links (OSC 8 hyperlinks) for tickets in modern terminals.

## Prerequisites

- Firefox with active Jira session
- Profile located at: `/Users/tommy/Library/Application Support/Firefox/Profiles/k2p85xj7.default-release`

## Step-by-Step Process

### 1. Extract Cookies from Firefox

```bash
# Copy cookies database to temp location
cp "/Users/tommy/Library/Application Support/Firefox/Profiles/k2p85xj7.default-release/cookies.sqlite" /tmp/cookies.sqlite

# Extract authentication tokens (for gspcloud.atlassian.net)
CLOUD_SESSION_TOKEN=$(sqlite3 /tmp/cookies.sqlite "SELECT value FROM moz_cookies WHERE host='auth.atlassian.com' AND name='cloud.session.token' LIMIT 1")
TENANT_SESSION_TOKEN=$(sqlite3 /tmp/cookies.sqlite "SELECT value FROM moz_cookies WHERE host='gspcloud.atlassian.net' AND name='tenant.session.token' LIMIT 1")

# Build cookie string
COOKIES="cloud.session.token=$CLOUD_SESSION_TOKEN; tenant.session.token=$TENANT_SESSION_TOKEN"
```

### 2. Query Jira API

#### Get a Single Ticket

```bash
# Create request payload
cat > /tmp/jira_request.json << 'EOF'
{
  "jql": "key=DISCCMS-4310",
  "fields": [
    "summary",
    "description",
    "status",
    "assignee",
    "issuetype",
    "priority",
    "created",
    "updated",
    "reporter",
    "labels",
    "fixVersions",
    "components"
  ]
}
EOF

# Execute query
curl -s -H "Cookie: $COOKIES" \
  -H "Content-Type: application/json" \
  -X POST -d @/tmp/jira_request.json \
  "https://gspcloud.atlassian.net/rest/api/3/search/jql" | python3 -m json.tool
```

#### Search for Multiple Tickets

```bash
# Search by project and filters
cat > /tmp/jira_request.json << 'EOF'
{
  "jql": "project=DISCCMS AND status='In Progress' ORDER BY updated DESC",
  "fields": ["key", "summary", "status", "assignee"],
  "maxResults": 10
}
EOF

curl -s -H "Cookie: $COOKIES" \
  -H "Content-Type: application/json" \
  -X POST -d @/tmp/jira_request.json \
  "https://gspcloud.atlassian.net/rest/api/3/search/jql" | python3 -m json.tool
```

#### Search by Ticket Number Range

```bash
cat > /tmp/jira_request.json << 'EOF'
{
  "jql": "project=DISCCMS AND issuekey >= DISCCMS-4300 AND issuekey <= DISCCMS-4320",
  "fields": ["key", "summary", "status"],
  "maxResults": 25
}
EOF

curl -s -H "Cookie: $COOKIES" \
  -H "Content-Type: application/json" \
  -X POST -d @/tmp/jira_request.json \
  "https://gspcloud.atlassian.net/rest/api/3/search/jql" | python3 -m json.tool
```

## Common JQL Queries

```
# Single ticket
key=DISCCMS-4310

# All tickets in project
project=DISCCMS ORDER BY created DESC

# Tickets by status
project=DISCCMS AND status='To Do'

# Tickets assigned to user
project=DISCCMS AND assignee=currentUser()

# Recent tickets
project=DISCCMS AND created >= -7d

# Tickets with specific label
project=DISCCMS AND labels=performance

# Tickets in range
project=DISCCMS AND issuekey >= DISCCMS-4300 AND issuekey <= DISCCMS-4320
```

## Available Fields

Common fields you can request:
- `summary` - Ticket title
- `description` - Standard description field (often empty in this project)
- `customfield_11171` - "Required Information" field (actual description in ADF format)
- `status` - Current status
- `assignee` - Assigned user
- `reporter` - Creator
- `issuetype` - Type (Bug, Story, etc.)
- `priority` - Priority level
- `created` - Creation date
- `updated` - Last update date
- `labels` - Tags/labels
- `fixVersions` - Target versions
- `components` - Components affected
- `customfield_*` - Other custom fields (project-specific)

Use `"*all"` to get all available fields.

**Note:** In the DISCCMS project, descriptions are stored in `customfield_11171` (Required Information) in ADF (Atlassian Document Format), not in the standard `description` field. The `jira-get` script automatically extracts text from this field.

## API Endpoints

- Search (JQL): `POST https://gspcloud.atlassian.net/rest/api/3/search/jql`
- Get Single Issue: `GET https://gspcloud.atlassian.net/rest/api/3/issue/{issueKey}`
  - Note: Direct GET may fail with auth issues, use JQL search instead

## Troubleshooting

### Issue: "Issue does not exist or you do not have permission"
- Cookies may have expired - open Firefox and navigate to Jira to refresh session
- Use JQL search instead of direct issue API
- Verify ticket key is correct and accessible

### Issue: Empty results for known ticket
- Try searching by issue number range instead of exact key
- Check if you have permission to view the ticket

### Issue: Cookies extraction fails
- Verify Firefox profile path is correct
- Ensure Firefox is not running (locks the database)
- Check that you're logged into Jira in Firefox

## Notes

- Cookies expire after period of inactivity (typically a few weeks)
- The cloud.session.token is from `auth.atlassian.com`
- The tenant.session.token is from `gspcloud.atlassian.net`
- Both tokens are required for successful authentication
- JQL search API is more reliable than direct issue GET API

## Security

- This file is in `.ignored/` directory and should not be committed
- Tokens are session-based and expire
- No permanent credentials are stored
