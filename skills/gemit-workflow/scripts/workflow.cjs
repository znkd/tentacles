#!/usr/bin/env node

/**
 * Gemit Workflow Orchestrator
 * Handles git operations, safety checks, and risk assessment for the gemit-workflow skill.
 */

const { execSync } = require('child_process');



// ANSI Color Codes



const colors = {



  green: (text) => `\x1b[1;32m${text}\x1b[0m`, // Bold Green



  yellow: (text) => `\x1b[1;33m${text}\x1b[0m`, // Bold Yellow



  red: (text) => `\x1b[1;31m${text}\x1b[0m`, // Bold Red



};







const SENSITIVE_PATTERNS = [

  /\.env.*/, /\.pem$/, /\.key$/, /id_rsa.*/, /secrets\..*/, /credentials\..*/

];



function run(cmd) {

  try {

    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

  } catch (e) {

    return null;

  }

}



const command = process.argv[2];



switch (command) {

  case 'update':

    try {

      const out = execSync('git pull', { encoding: 'utf8' }).trim();

      process.stdout.write(`${colors.green('✅ Repository updated successfully / 仓库更新成功。')}\n${out}\n`);

    } catch (e) {

      process.stderr.write(`${colors.red(`❌ Update failed / 更新失败: ${e.stderr || e.message}`)}\n`);

      process.exit(1);

    }

    break;



  case 'stage':

    const status = run('git status --short');

    if (!status) {

        process.stdout.write(`${colors.green('✅ Working tree clean / 工作区干净。')}\n`);

        process.exit(0);

    }

    const untracked = status.split('\n')

        .filter(l => l.startsWith('??'))

        .map(l => l.slice(3).trim());

    

    const sensitive = untracked.filter(f => SENSITIVE_PATTERNS.some(p => p.test(f)));

    

    if (sensitive.length > 0) {

      process.stdout.write(`${colors.red(`❌ ⚠️ Warning: Potential sensitive files detected but not ignored! / 警告：检测到疑似敏感文件未被忽略！: ${sensitive.join(', ')}`)}\n`);

      process.exit(1);

    }



    run('git add .');

    process.stdout.write(`${colors.green('✅ Local changes staged / 已将本地变更添加到追踪。')}\n`);

    break;



  case 'analyze':

    const diff = run('git diff --cached');

    if (!diff) {

      const unpushed = run('git rev-list --count @{u}..HEAD');

      if (unpushed && parseInt(unpushed) > 0) {

        process.stdout.write(`${colors.yellow(`⚠️ No staged changes, but ${unpushed} local commits detected / 暂存区无变更，但检测到 ${unpushed} 条本地提交。`)}\nSTATUS:UNPUSHED:${unpushed}\n`);

      } else {

        process.stdout.write(`${colors.green('✅ Nothing to commit, working tree clean / 无待提交变更，工作区干净。')}\nSTATUS:CLEAN\n`);

      }

      process.exit(0);

    }



    const lines = diff.split('\n');

    const deletions = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;

    const additions = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;

    

    if (deletions > 100 && deletions > additions * 2) {

      process.stdout.write(`${colors.yellow(`⚠️ Note: Massive deletion detected / 注意：检测到大幅度代码删减，请谨慎核对。`)}\n`);

      process.stdout.write(`RISK:HIGH\n`);

    } else {

      process.stdout.write(`${colors.green(`✅ Analysis complete / 变更分析完成。`)}\n`);

      process.stdout.write(`RISK:NORMAL\n`);

    }

    process.stdout.write(`SUMMARY: +${additions} -${deletions}\n`);

    break;



  case 'sync-status':

    run('git fetch -q');

    const behind = run('git rev-list --count HEAD..@{u}') || "0";

    const ahead = run('git rev-list --count @{u}..HEAD') || "0";

    

    if (parseInt(behind) > 0) {

      process.stdout.write(`${colors.yellow(`⚠️ Remote changes detected (${behind}), push will be rejected / 检测到远程仓库有更新，直接 Push 将会被拒绝。`)}\nSYNC:NEED_PULL:${behind}\n`);

    } else {

      process.stdout.write(`${colors.yellow(`⚠️ Note: ${ahead} commits not pushed yet / 提示：当前本地有 ${ahead} 条记录尚未推送至远程。`)}\nSYNC:AHEAD:${ahead}\n`);

    }

    break;

  default:
    process.stderr.write('Usage: workflow.cjs <update|stage|analyze|sync-status>\n');
    process.exit(1);
}
