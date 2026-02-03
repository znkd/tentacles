# Gemit Workflow Skill

**Gemit Workflow** represents a standardized, AI-assisted Git collaboration process designed to enhance code quality and streamline development operations. It acts as an intelligent layer over standard Git commands, providing safety checks, automated message drafting, and synchronization guidance.

## Key Features

- **🛡️ Smart Staging & Safety Checks**: Automatically scans for potential sensitive files (e.g., `.env`, secrets) before staging to prevent accidental leaks.
- **🤖 AI-Generated Commit Messages**: Analyzes staged diffs to generate meaningful, [Conventional Commits](https://www.conventionalcommits.org/) compliant messages.
- **🚦 Risk Assessment**: Detects and warns about high-risk changes such as massive code deletions or core logic modifications.
- **🔄 Intelligent Sync**: automatically detects remote changes, guiding you through pull/push operations to minimize conflicts.
- **🇨🇳🇺🇸 Bilingual Support**: All status messages and interactions are provided in both English and Chinese.

## Visual Status Indicators

The workflow uses clear visual cues to indicate the state of operations:

- ✅ **Green**: Success, safe to proceed.
- ⚠️ **Yellow**: Warning, suggestion, or non-blocking attention required.
- ❌ **Red**: Critical error or manual intervention needed.

## Usage

Simply trigger the skill when you are ready to commit changes. The assistant will guide you through the following steps:

1.  **Staging**: Adds changes to the index.
2.  **Analysis**: Reviews the diff and assesses impact.
3.  **Drafting**: Proposes a commit message for your review.
4.  **Committing**: Commits the changes locally.
5.  **Syncing**: Checks for remote updates, pulls if necessary, and pushes your changes.

### Update Mode

To update the repository before starting work:

```bash
gemit-workflow --update
```

## License

See [LICENSE](LICENSE) file.
