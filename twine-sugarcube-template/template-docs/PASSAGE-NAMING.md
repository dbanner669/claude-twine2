# Passage Naming Convention

## PREFIX-NUMBER Pattern

Every content passage follows the `PREFIX-NUMBER Description` format:

```
DEMO-100 Arrival
DEMO-200 Lobby
DEMO-210 Question
DEMO-300 Street
CC-100 Name
CC-200 Appearance
```

## Rules

### Prefixes
Each story arc, location, or system gets a unique prefix:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `CC` | Character Creation | `CC-100 Name` |
| `DEMO` | Example/Demo scenes | `DEMO-100 Arrival` |
| `LOC` | Location exploration | `LOC-100 Downtown` |
| `QUEST` | Quest/mission passages | `QUEST-100 Briefing` |
| `NPC` | NPC interaction scenes | `NPC-100 Meet the Director` |
| `COMBAT` | Combat encounters | `COMBAT-100 Ambush` |

### Numbering
- **Major beats**: increment by 100 (`DEMO-100`, `DEMO-200`, `DEMO-300`)
- **Sub-beats**: increment by 10 (`DEMO-210`, `DEMO-220`)
- **Micro-beats**: increment by 1 (`DEMO-211`, `DEMO-212`)

This leaves room to insert passages between existing ones without renumbering.

### Descriptions
- Short, descriptive, title-case
- Describe the scene or action, not the choice that led there
- Good: `DEMO-200 Lobby` (where you are)
- Bad: `DEMO-200 Enter the building` (how you got there)

## Special Passages

System passages don't use the PREFIX-NUMBER pattern:

- `Start` - Entry point
- `StoryInit`, `StoryInterface`, `StoryCaption`, `PassageDone`
- `variables` - State initialization (included by StoryInit)
- Widget passages use descriptive names: `Avatar Display`, `Expression Widgets`

## Benefits

- **Sorting**: Passages sort naturally by arc, then chronologically
- **Searching**: Find all passages in an arc with `find_by_prefix`
- **Gaps**: The 100-increment spacing allows insertion without renumbering
- **Readability**: The description makes link targets self-documenting
