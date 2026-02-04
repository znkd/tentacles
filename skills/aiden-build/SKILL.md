---
name: aiden-build
description: "Build the Aiden Tauri project with required chmod and codesign steps. Use when asked to build Aiden, run Tauri build/dev, or prepare Apple-darwin binaries for Aiden before a build."
---

# Aiden Build

## Workflow

1. Ensure you are in the Aiden project root (the folder that contains `src-tauri/`).
2. Run:
   - `chmod +x src-tauri/bin/*-apple-darwin`
3. Codesign each binary in order:
   - `codesign --force -s - ./src-tauri/bin/victoria-metrics-aarch64-apple-darwin`
   - `codesign --force -s - ./src-tauri/bin/victoria-logs-aarch64-apple-darwin`
   - `codesign --force -s - ./src-tauri/bin/otelcol-aarch64-apple-darwin`
4. Ask the user which command to run next:
   - `npm run tauri:build`
   - `npm run tauri:dev`
5. Run the user-selected command and report any errors.

## Notes

- If the binaries are missing, ask the user whether to proceed and how to obtain them.
- If codesign fails, capture the exact error and ask how to proceed.
