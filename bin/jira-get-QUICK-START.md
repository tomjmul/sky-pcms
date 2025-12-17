# Jira Quick Reference for Tom Muldoon

**Note:** Ticket links are clickable in modern terminals (iTerm2, Wezterm, etc.)

## Instant Commands (Your Most Common Queries)

```bash
# See all your work in review (most common!)
jira-get review

# See what you're currently working on
jira-get progress

# See your TODO list
jira-get todo

# See everything assigned to you
jira-get mine

# See your current sprint work
jira-get sprint

# See recent activity on your tickets
jira-get recent
```

## Viewing Individual Tickets

```bash
# Basic view
jira-get DISCCMS-4415

# With subtasks
jira-get DISCCMS-3570 --subtasks

# With comments
jira-get DISCCMS-4415 --comments

# Everything
jira-get DISCCMS-3570 --subtasks --comments

# Raw JSON (for piping to jq)
jira-get DISCCMS-4415 --json
```

## Limiting Results

```bash
# Just show top 5
jira-get review -n 5

# Show top 10 from your TODO
jira-get todo -n 10
```

## Custom JQL Queries

```bash
# Your P1 tickets
jira-get --jql "assignee = tom.muldoon@sky.uk AND priority = P1"

# Tickets you created in the last 2 weeks
jira-get --jql "reporter = tom.muldoon@sky.uk AND created >= -14d"

# Blocked tickets
jira-get --jql "assignee = tom.muldoon@sky.uk AND status = Blocked"

# Tickets with a specific label
jira-get --jql "assignee = tom.muldoon@sky.uk AND labels = performance"
```

## Tips & Tricks

### Suppress Progress Messages

Add `2>/dev/null` to hide the "Extracting cookies..." messages:

```bash
jira-get review 2>/dev/null
```

### Pipe to Less for Long Output

```bash
jira-get mine | less
```

### Count Your Tickets

```bash
jira-get mine --json 2>/dev/null | jq '.issues | length'
```

### Get Just the Keys

```bash
jira-get review --json 2>/dev/null | jq -r '.issues[].key'
```

### Quick Status Overview

```bash
jira-get mine --json 2>/dev/null | jq -r '.issues[] | "\(.key): \(.fields.status.name)"'
```

## Add an Alias to Your Shell

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias jira='/Users/tommy/Development/ott-pcms/.ignored/bin/jira-get'
alias jreview='jira review 2>/dev/null'
alias jprogress='jira progress 2>/dev/null'
alias jmine='jira mine 2>/dev/null'
alias jsprint='jira sprint 2>/dev/null'
```

Then you can just type:

```bash
jreview          # See your review tickets
jprogress        # See your in-progress work
jmine            # See all your tickets
```

## Preset Reference

| Preset    | Shows                                                    |
|-----------|----------------------------------------------------------|
| `mine`    | All unresolved tickets assigned to you                  |
| `review`  | Your tickets in "In Review" status                      |
| `progress`| Your tickets in "In Progress" status                    |
| `todo`    | Your tickets in "To Do" status (sorted by priority)     |
| `sprint`  | Your tickets in the current sprint                      |
| `recent`  | Tickets you're involved in, updated in last 7 days      |
| `created` | Tickets you created in the last 14 days                 |
| `watching`| Tickets you're watching                                 |

## Common Workflows

### Starting Your Day

```bash
# What's in review?
jira-get review -n 5 2>/dev/null

# What am I working on?
jira-get progress 2>/dev/null

# What's my sprint looking like?
jira-get sprint 2>/dev/null
```

### Checking a Parent Ticket's Progress

```bash
jira-get DISCCMS-3570 --subtasks 2>/dev/null
```

### Reading Full Context on a Ticket

```bash
jira-get DISCCMS-4415 --comments --subtasks 2>/dev/null | less
```

### Finding Old Tickets

```bash
jira-get --jql "assignee = tom.muldoon@sky.uk AND updated < -30d" 2>/dev/null
```

## Troubleshooting

**"Error: Could not extract authentication tokens"**
- Open Firefox and navigate to https://gspcloud.atlassian.net to refresh your session
- Make sure Firefox is closed (cookies database might be locked)

**"Issue does not exist or you do not have permission"**
- The ticket might not exist
- You might not have permission to view it
- Your session might have expired - refresh by visiting Jira in Firefox

**Empty results when you know tickets exist**
- Your cookies may have expired
- Refresh your Jira session in Firefox
