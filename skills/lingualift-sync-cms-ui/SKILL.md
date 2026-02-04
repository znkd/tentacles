---
name: lingualift-sync-cms-ui
description: Sync CMS pages from lingualift-cms-ui to cms-web when page-level changes are detected
---

# 精准CMS页面同步智能体 (AGENT.md)

## 0. 前置条件（路径变量）
- **CMS_UI_ROOT**：指向 `lingualift-cms-ui` 工程根目录。
- **CMS_WEB_ROOT**：指向 `cms-web` 工程根目录。

所有命令与路径必须使用上述变量进行拼接，不允许写死绝对路径。

## 0.1 变量示例与传入方式
示例（使用当前 shell 环境变量）：
```sh
export CMS_UI_ROOT="/path/to/lingualift-cms-ui"
export CMS_WEB_ROOT="/path/to/cms-web"
```

在执行脚本或命令时，使用变量拼接路径：
```sh
${CMS_UI_ROOT}/scripts/update_and_detect.sh
```

## 1. 任务前提
仅当 lingualift-cms-ui 本次拉取的代码中存在页面变更时，才对 cms-web 进行相应的同步更新。

## 2. 核心技能：增量页面同步 (Incremental Page Sync)
- **触发词：** "CMS同步页面"、"检查更新并同步 cms-web"、"sync CMS UI"。
- **目标工程 B 路径：** `${CMS_WEB_ROOT}`

### 严格执行流程：
1. **变更检测 (Pre-condition)：**
   - 运行 `${CMS_UI_ROOT}/scripts/update_and_detect.sh`。
   - **分支判断：**
     - 如果脚本返回 `NO_PAGE_CHANGES`：告知用户“没有检测到页面级别的变更，无需同步 cms-web”，并停止任务。
     - 如果返回 `DETECTED_CHANGES`：列出这些变更文件，并继续下一步。

2. **跨项目对比：**
   - 针对脚本列出的**每一个变更文件**，在 cms-web 中寻找对应的组件或页面。
   - 参考 lingualift-cms-ui 的修改，在 cms-web 中实现相同功能的 UI 对应部分。
   - 读取 lingualift-cms-ui 变更后的**最新完整代码**。


3. **代码生成与覆盖：**
   - **目标：** 使 cms-web 的相关页面在视觉和交互上与 lingualift-cms-ui 保持 1:1 一致。
   - **同步范围：** 仅限脚本识别到的变更页面及其关联样式。
   - **逻辑保护：** 在同步 lingualift-cms-ui 的交互逻辑时，保留 cms-web 工程中特有的后端 API 地址或环境变量。

4. **确认机制：**
   - 向用户展示：“由于 lingualift-cms-ui 的 [文件名] 发生了变化，我计划更新 cms-web 的 [文件名]。”
   - 得到确认后，执行 `write_file`。

## 3. 约束
- 严禁在 cms-web 中修改 lingualift-cms-ui 中未发生变更的页面。
- 确保所有的修改都在用户确认的清单范围内。
