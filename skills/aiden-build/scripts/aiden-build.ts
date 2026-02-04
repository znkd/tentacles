import { existsSync, readdirSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";
import readline from "readline";

function usage(): void {
  console.log(`Usage: aiden-build.ts <command>

Commands:
  prep         Clean bundle folder, chmod binaries, and codesign.
  build        Run npm run tauri:build (after prep).
  dev          Run npm run tauri:dev (after prep).
  --uploadDMG  Prompt to upload the built DMG (shows the DMG path).

If no command is provided, the script will run prep, then prompt
you to choose build or dev.`);
}

function run(cmd: string, args: string[] = []): void {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runShell(command: string): void {
  const result = spawnSync(command, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureRoot(): void {
  if (!existsSync("src-tauri")) {
    console.error("Error: src-tauri/ not found. Run this script from the Aiden project root.");
    process.exit(1);
  }
}

async function prep(): Promise<void> {
  ensureRoot();

  const bundleDir = "LinguaLift/aiden/src-tauri/bundle/com.aiden.monitor";
  if (existsSync(bundleDir)) {
    const shouldDelete = await promptDeleteBundle(bundleDir);
    if (shouldDelete) {
      run("rm", ["-rf", bundleDir]);
    }
  } else {
    console.error(`Warning: ${bundleDir} does not exist. Skipping clean step.`);
  }

  runShell("chmod +x src-tauri/bin/*-apple-darwin");

  run("codesign", ["--force", "-s", "-", "./src-tauri/bin/victoria-metrics-aarch64-apple-darwin"]);
  run("codesign", ["--force", "-s", "-", "./src-tauri/bin/victoria-logs-aarch64-apple-darwin"]);
  run("codesign", ["--force", "-s", "-", "./src-tauri/bin/otelcol-aarch64-apple-darwin"]);
}

function runBuild(): void {
  run("npm", ["run", "tauri:build"]);
}

function runDev(): void {
  run("npm", ["run", "tauri:dev"]);
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askWithTimeout(question: string, timeoutMs: number): Promise<string | null> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      rl.close();
      resolve(null);
    }, timeoutMs);

    rl.question(question, (answer) => {
      clearTimeout(timer);
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function promptDeleteBundle(bundleDir: string): Promise<boolean> {
  console.log(`即将删除${bundleDir}`);
  console.log("1) 同意");
  console.log("2) 拒绝");
  const choice = await askWithTimeout("请选择 1 或 2（10秒内无输入将默认不删除）: ", 10_000);

  if (choice === "1") {
    console.log("用户同意");
    return true;
  }
  if (choice === "2") {
    console.log("用户拒绝");
    return false;
  }

  console.log("超时未选择，默认不删除");
  return false;
}

async function promptBuildOrDev(): Promise<void> {
  console.log("Choose next command:");
  console.log("1) npm run tauri:build");
  console.log("2) npm run tauri:dev");
  const choice = await ask("Enter 1 or 2: ");

  if (choice === "1") {
    runBuild();
  } else if (choice === "2") {
    runDev();
  } else {
    console.error("Invalid selection. Expected 1 or 2.");
    process.exit(1);
  }
}

async function promptUploadDmg(): Promise<void> {
  const dmgDir = "LinguaLift/aiden/src-tauri/target/release/bundle/dmg";
  if (!existsSync(dmgDir)) {
    console.error(`Error: ${dmgDir} not found.`);
    process.exit(1);
  }

  const files = readdirSync(dmgDir).filter((file) => file.endsWith(".dmg"));
  if (files.length === 0) {
    console.error(`Error: no .dmg files found in ${dmgDir}.`);
    process.exit(1);
  }

  const dmgPath = path.join(dmgDir, files[0]);
  const displayPath = dmgPath.startsWith("/") ? dmgPath : `/${dmgPath}`;

  console.log(`即将上传${displayPath}`);
  console.log("1) 同意");
  console.log("2) 拒绝");
  const choice = await ask("请选择 1 或 2: ");

  if (choice === "1") {
    console.log("用户同意");
  } else if (choice === "2") {
    console.log("用户拒绝");
  } else {
    console.error("Invalid selection. Expected 1 or 2.");
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? "";

  switch (command) {
    case "prep":
      await prep();
      break;
    case "build":
      await prep();
      runBuild();
      break;
    case "dev":
      await prep();
      runDev();
      break;
    case "--uploadDMG":
      await promptUploadDmg();
      break;
    case "":
      await prep();
      await promptBuildOrDev();
      break;
    case "-h":
    case "--help":
      usage();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
