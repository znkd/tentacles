# tentacles

这是一个用于开发与维护多种 Codex skills 的工程，集中存放每个 skill 的指令、脚本与说明。

## 目录结构

- `skills/`：所有 skills 的根目录
- `skills/<skill-name>/SKILL.md`：该 skill 的入口与执行指引
- `skills/<skill-name>/scripts/`：该 skill 的脚本（如有）
- `skills/<skill-name>/assets/`：该 skill 的资源文件（如有）

## 当前技能

- `gemit-workflow`：颜色标记的 AI Git 工作流助手，支持安全检查、提交信息生成与同步引导。
- `lingualift-sync-cms-ui`：当 lingualift-cms-ui 检测到页面级变更时，同步更新 cms-web 的对应页面。

## 新增 Skill 指南

1. 在 `skills/` 下创建目录：`skills/<skill-name>/`。
2. 编写 `skills/<skill-name>/SKILL.md`，至少包含：
   - `name`：skill 名称
   - `description`：简短用途说明
   - 操作流程、约束、必要的环境变量等
3. 如需脚本或资源，放在 `scripts/`、`assets/` 等子目录中。
4. 更新本 README 的“当前技能”列表。

## 约定

- `SKILL.md` 是该 skill 的唯一入口文档。
- 尽量避免在指令中写死绝对路径，优先使用环境变量或相对路径。
- 若某个 skill 需要更详细说明，可在其目录内补充额外文档。

## License

See `LICENSE`.
