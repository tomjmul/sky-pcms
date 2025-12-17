# Jira Query Script

## jira-get

Query Jira tickets from the command line using your Firefox session cookies.

### Usage

```bash
# Get a single ticket
./jira-get DISCCMS-4415

# Search using JQL
./jira-get --jql "project=DISCCMS AND status='In Review'"

# Limit results
./jira-get --jql "project=DISCCMS ORDER BY created DESC" --max-results 5

# Get raw JSON output
./jira-get DISCCMS-4415 --json

# Custom fields
./jira-get DISCCMS-4415 --fields summary,status,assignee
```

### Options

- `-h, --help` - Show help message
- `-j, --jql JQL` - Search using JQL query
- `-f, --fields FIELDS` - Comma-separated fields to retrieve
- `-n, --max-results NUM` - Maximum results for JQL search (default: 10)
- `--json` - Output raw JSON instead of formatted text

### Requirements

- Firefox with active Jira session at `gspcloud.atlassian.net`
- `jq` for JSON parsing
- `sqlite3` for cookie extraction

### How it works

1. Extracts authentication cookies from your Firefox profile
2. Uses those cookies to query the Jira REST API
3. Formats the response for easy reading

### Troubleshooting

If you get authentication errors:
1. Make sure you're logged into Jira in Firefox
2. Navigate to `https://gspcloud.atlassian.net` to refresh your session
3. Try the command again

### Examples

```bash
# Find all your assigned tickets
./jira-get --jql "project=DISCCMS AND assignee=currentUser()"

# Recent tickets
./jira-get --jql "project=DISCCMS AND created >= -7d"

# Tickets in a specific status
./jira-get --jql "project=DISCCMS AND status='To Do'"

# Range of tickets
./jira-get --jql "project=DISCCMS AND issuekey >= DISCCMS-4300 AND issuekey <= DISCCMS-4320"
```
