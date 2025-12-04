# PMON CLI — Quick Reference (developer + AI-friendly)

This document collects examples and notes for the WinCC OA `pmon` command-line interface. It is written for developers and is also suitable for automated parsing / AI consumption.

Guidelines

# PMON CLI — Quick Reference (developer + AI-friendly)

This document collects examples and notes for the WinCC OA `pmon` command-line interface. It is written for developers and is also suitable for automated parsing / AI consumption.

Guidelines

- Preserve shell examples exactly when copying them into tests or parsers.

- Example outputs are real PMON stdout; use them as ground truth for parser unit tests.

Table of contents

- MGRLIST:LIST — manager configuration (LIST)

- MGRLIST:STATI — manager runtime status (STATI) and project state

- SINGLE_MGR — single-manager commands (STOP, START, INS, PROP_GET/PUT, DEBUG, DEL, KILL)

- Global project commands (START_ALL, STOP_ALL, RESTART_ALL, WAIT_MODE)

- Error formats

- Suggested parser tests (from examples)
---

## MGRLIST:LIST — configuration of managers

This command returns a list of configured managers and their static options. Each non-empty line after the header is semicolon-separated and follows this pattern (example):

```text
<component>;<startModeNum>;<seckill>;<restartCount>;<resetMin>;<optional start args>
```

- `startModeNum`: numeric code (0 = manual, 1 = once, 2 = always)

- `seckill`: seconds-to-kill on restart (negative values may indicate special behavior)

- `restartCount`: restart attempt count

- `resetMin`: reset start counter minutes

- trailing fields (after 5th semicolon) are joined back into a single start-arguments string

Example (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:LIST
LIST:9
WCCILpmon;0;30;3;1;
WCCILdataSQLite;0;30;3;1;
WCCOAnextgenarch;0;30;2;2;
WCCILevent;0;30;3;1;
WCCILproxy;0;30;2;2;
WCCOActrl;0;30;3;1;-num 1 -f pvss_scripts.lst
WCCILsim;0;-30;3;1;
WCCOActrl;2;30;2;2;webclient_http.ctl -num 2
WCCOAui;1;30;3;1;-m gedi -n -num 4
;

```

Parser notes

- Trim whitespace, ignore the initial `LIST:<n>` header if present.

- Split on `;` and map fixed columns; join remaining parts into `startOptions`.
---

## MGRLIST:STATI — runtime status of managers + project state

This command returns runtime information per manager and a final project-state line.

Per-manager STATI line format (semicolon-separated):

# PMON CLI — Quick Reference (developer + AI-friendly)

This document collects examples and notes for the WinCC OA `pmon` command-line interface. It is written for developers and is also suitable for automated parsing / AI consumption.

Guidelines

- Preserve shell examples exactly when copying them into tests or parsers.

- Example outputs are real PMON stdout; use them as ground truth for parser unit tests.

Table of contents

- MGRLIST:LIST — manager configuration (LIST)

- MGRLIST:STATI — manager runtime status (STATI) and project state

- SINGLE_MGR — single-manager commands (STOP, START, INS, PROP_GET/PUT, DEBUG, DEL, KILL)

- Global project commands (START_ALL, STOP_ALL, RESTART_ALL, WAIT_MODE)

- Error formats

- Suggested parser tests (from examples)

---

## MGRLIST:LIST — configuration of managers

This command returns a list of configured managers and their static options. Each non-empty line after the header is semicolon-separated and follows this pattern (example):

```text
<component>;<startModeNum>;<seckill>;<restartCount>;<resetMin>;<optional start args>
```

- `startModeNum`: numeric code (0 = manual, 1 = once, 2 = always)

- `seckill`: seconds-to-kill on restart (negative values may indicate special behavior)

- `restartCount`: restart attempt count

- `resetMin`: reset start counter minutes

- trailing fields (after 5th semicolon) are joined back into a single start-arguments string

Example (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:LIST
LIST:9
WCCILpmon;0;30;3;1;
WCCILdataSQLite;0;30;3;1;
WCCOAnextgenarch;0;30;2;2;
WCCILevent;0;30;3;1;
WCCILproxy;0;30;2;2;
WCCOActrl;0;30;3;1;-num 1 -f pvss_scripts.lst
WCCILsim;0;-30;3;1;
WCCOActrl;2;30;2;2;webclient_http.ctl -num 2
WCCOAui;1;30;3;1;-m gedi -n -num 4
;

```

Parser notes

- Trim whitespace, ignore the initial `LIST:<n>` header if present.

- Split on `;` and map fixed columns; join remaining parts into `startOptions`.

---

## MGRLIST:STATI — runtime status of managers + project state

This command returns runtime information per manager and a final project-state line.

Per-manager STATI line format (semicolon-separated):

```text
<runningStateNum>;<pid>;<startModeNum>;<startTimestamp>;<managerNumber>
```

- `runningStateNum` mapping (typical): 0 = NotRunning, 1 = Init, 2 = Running, 3 = Blocked

- `pid` can be `-1` (no process), `-2` (fatal start failure)

- `startModeNum` same mapping as LIST (0 = manual, 1 = once, 2 = always)

- `startTimestamp` may be a WinCC OA formatted timestamp (e.g. `YYYY.MM.DD hh:mm:ss.mmm`) or `1970...` if not started

- `managerNumber` is the manager index/number

The final project-state line has the format:

```text
<projectStateNum> <projectStateText> <emergencyFlag> <demoFlag>
```

Example — stopped project (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0

```

Example — stopped project (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0
;

```

Example — project in state `starting` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
1;11064;2;2025.12.04 08:58:43.564;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
1 START_MODE 0 0
;

```

Example — project in state `monitoring` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -2;2;2025.12.04 08:59:13.782;  2
2;32080;1;2025.12.04 08:59:25.318;  4
2 MONITOR_MODE 0 0
;

```

Example — unknown command (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGR:STATI
ERROR errCmd :unknown command

```

Parser notes

- The STATI output usually includes a `LIST:<n>` header; skip it and parse subsequent semicolon lines.

- Watch for padding/spacing in PID and numeric fields; use numeric parsing tolerant to whitespace.

- Treat `-1` PID as missing/undefined process.

- Treat `-2` PID as fatal failure (manager configured to always start but is not running).

- Convert `startTimeStamp` when it's a real timestamp; ignore `1970.01.01...` as sentinel for 'no start time'.
---

## SINGLE_MGR — single-manager commands

# PMON CLI — Quick Reference (developer + AI-friendly)

This document collects examples and notes for the WinCC OA `pmon` command-line interface. It is written for developers and is also suitable for automated parsing / AI consumption.

Guidelines

- Preserve shell examples exactly when copying them into tests or parsers.
- Example outputs are real PMON stdout; use them as ground truth for parser unit tests.

Table of contents

- MGRLIST:LIST — manager configuration (LIST)
- MGRLIST:STATI — manager runtime status (STATI) and project state
- SINGLE_MGR — single-manager commands (STOP, START, INS, PROP_GET/PUT, DEBUG, DEL, KILL)
- Global project commands (START_ALL, STOP_ALL, RESTART_ALL, WAIT_MODE)
- Error formats
- Suggested parser tests (from examples)

---

## MGRLIST:LIST — configuration of managers

This command returns a list of configured managers and their static options. Each non-empty line after the header is semicolon-separated and follows this pattern (example):

```text
<component>;<startModeNum>;<seckill>;<restartCount>;<resetMin>;<optional start args>
```

- `startModeNum`: numeric code (0 = manual, 1 = once, 2 = always)
- `seckill`: seconds-to-kill on restart (negative values may indicate special behavior)
- `restartCount`: restart attempt count
- `resetMin`: reset start counter minutes
- trailing fields (after 5th semicolon) are joined back into a single start-arguments string

Example (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:LIST
LIST:9
WCCILpmon;0;30;3;1;
WCCILdataSQLite;0;30;3;1;
WCCOAnextgenarch;0;30;2;2;
WCCILevent;0;30;3;1;
WCCILproxy;0;30;2;2;
WCCOActrl;0;30;3;1;-num 1 -f pvss_scripts.lst
WCCILsim;0;-30;3;1;
WCCOActrl;2;30;2;2;webclient_http.ctl -num 2
WCCOAui;1;30;3;1;-m gedi -n -num 4
;
```

Parser notes

- Trim whitespace, ignore the initial `LIST:<n>` header if present.
- Split on `;` and map fixed columns; join remaining parts into `startOptions`.

---

## MGRLIST:STATI — runtime status of managers + project state

This command returns runtime information per manager and a final project-state line.

Per-manager STATI line format (semicolon-separated):

```text
<runningStateNum>;<pid>;<startModeNum>;<startTimestamp>;<managerNumber>
```

- `runningStateNum` mapping (typical): 0 = NotRunning, 1 = Init, 2 = Running, 3 = Blocked
- `pid` can be `-1` (no process), `-2` (fatal start failure)
- `startModeNum` same mapping as LIST (0 = manual, 1 = once, 2 = always)
- `startTimestamp` may be a WinCC OA formatted timestamp (e.g. `YYYY.MM.DD hh:mm:ss.mmm`) or `1970...` if not started
- `managerNumber` is the manager index/number

The final project-state line has the format:

```text
<projectStateNum> <projectStateText> <emergencyFlag> <demoFlag>
```

Example — stopped project (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0
;
```

Example — stopped project (alternate raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0
;
```

Example — project in state `starting` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
1;11064;2;2025.12.04 08:58:43.564;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
1 START_MODE 0 0
;
```

Example — project in state `monitoring` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -2;2;2025.12.04 08:59:13.782;  2
2;32080;1;2025.12.04 08:59:25.318;  4
2 MONITOR_MODE 0 0
;
```

Example — unknown command (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGR:STATI
ERROR errCmd :unknown command
```

Parser notes

- The STATI output usually includes a `LIST:<n>` header; skip it and parse subsequent semicolon lines.
- Watch for padding/spacing in PID and numeric fields; use numeric parsing tolerant to whitespace.
- Treat `-1` PID as missing/undefined process.
- Treat `-2` PID as fatal failure (manager configured to always start but is not running).
- Convert `startTimeStamp` when it's a real timestamp; ignore `1970.01.01...` as sentinel for 'no start time'.

---

## SINGLE_MGR — single-manager commands

Common sub-commands: `START`, `STOP`, `KILL`, `DEL`, `INS`, `PROP_GET`, `PROP_PUT`, `DEBUG`.

Examples (raw stdout preserved):

Stop manager at index (OK):

```sh
C:\Program Files\Siemens\WinCC_OA\3.21\bin>WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 8
OK
```

Stop manager — invalid index example (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 19
ERROR errInvIdx :invalid manager index given
```

Stop manager — not possible in current state (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 8
ERROR errStop :STOP of this manager not possible
```

Insert manager (INS) — success:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:INS 10 WCCOAui once 30 3 1 "-m gedi -n -num 6"
OK
```

Insert manager — invalid position (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:INS 17 WCCOAui once 30 3 1 "-m gedi -n -num 6"
ERROR errIns :insertion at this position not allowed
```

Manager property get (example):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:PROP_GET 8
once 30 3 1 -m gedi -n -num 4
```

Notes

- Successful command responses: single line `OK`.
- Error responses: `ERROR <errorId> :<text>`.

---

## Global project commands

- `STOP_ALL:` — stop all managers (pmon remains running)
- `START_ALL:` — start all managers
- `RESTART_ALL:` — restart project (pmon remains running)
- `WAIT_MODE:` — set pmon into wait mode

Examples (raw stdout):

Stop all — OK:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command STOP_ALL:
OK
```

Start all — OK:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command START_ALL:
OK
```

Start all — error when already started:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command START_ALL:
ERROR errStartAll :START_ALL in this mode not allowed
```

---

## Error format

PMON uses a simple error format for failed commands:

```text
ERROR <errorId> :<errorText>
```

When building parsers, treat any line starting with `ERROR` as a command failure and surface both `errorId` and message.

---

## Suggested parser unit tests

Below are suggested Node/TypeScript test snippets you can add to unit tests for the parser in `npm-shared-library-core`. The examples use the real outputs above as fixtures — copy the exact blocks into test fixtures (do not alter them).

- Test: parse `MGRLIST:LIST` into manager option objects
  - Input: the `MGRLIST:LIST` example block above
  - Expected samples:
    - First manager: component `WCCILpmon`, `startMode` = `Manual` (0), `secondToKill` = 30, `restart` = 3, `resetStartCounter` = 1
    - Manager with `-num 1 -f pvss_scripts.lst` included in `startOptions`

- Test: parse `MGRLIST:STATI` (stopped example)
  - Input: the `MGRLIST:STATI` stopped sample block above
  - Expectations:
    - Manager 1: state = `Running`, pid = 33540, startMode = `Manual`, startTime parsed to a Date
    - Managers with pid `-1` should yield `pid = undefined` in parsed output
    - Project state line `0 WAIT_MODE 0 0` should map to project state `Down`/`Wait` (depending on your mapping)

- Test: parse `MGRLIST:STATI` (monitoring example)
  - Input: the `MGRLIST:STATI` monitoring sample block above
  - Expectations:
    - Manager lines with real timestamps should be parsed into `Date` objects
    - The final project state line `2 MONITOR_MODE 0 0` maps to `Monitoring` / `Started`

Suggested test pseudocode (Node / assert style)

```ts
import assert from 'assert';
import { PmonComponent } from '../dist/types/components/implementations/PmonComponent.js';

// The examples above can be used as fixtures. Prefer calling the runtime API
// that executes/collects PMON output and returns typed results.

const pmon = new PmonComponent();

// Example: parse manager options from the LIST fixture (if you mock execAndCollectLines):
// (pmon as any).execAndCollectLines = async () => listFixture.split('\n');
const options = await pmon.getManagerOptionsList('MyProject');
assert.strictEqual(options[0].component, 'WCCILpmon');
assert.strictEqual(options[0].startMode, 0);

// Example: parse STATI into project + manager state
// (pmon as any).execAndCollectLines = async () => statusFixture.split('\n');
const status = await pmon.getProjectStatus('MyProject');
assert.strictEqual(status.managers[0].pid, 33540);
assert.ok(status.managers[0].startTime instanceof Date);
assert.strictEqual(typeof status.project.statusCode, 'number');
```

When adding tests, use the exact shell blocks above as fixtures. They are real outputs and provide good coverage for edge cases (missing PID, sentinel timestamps, various start modes).

---

If you want, I can also:

- generate concrete unit test files in this repository using the examples above, or
- add a small CLI tool / fixture loader to run parser tests against the real outputs.

---

End of document.
---

## MGRLIST:LIST — configuration of managers

This command returns a list of configured managers and their static options. Each non-empty line after the header is semicolon-separated and follows this pattern (example):

```text
<component>;<startModeNum>;<seckill>;<restartCount>;<resetMin>;<optional start args>
```

- `startModeNum`: numeric code (0 = manual, 1 = once, 2 = always)
- `seckill`: seconds-to-kill on restart (negative values may indicate special behavior)
- `restartCount`: restart attempt count
- `resetMin`: reset start counter minutes
- trailing fields (after 5th semicolon) are joined back into a single start-arguments string

Example (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:LIST
LIST:9
WCCILpmon;0;30;3;1;
WCCILdataSQLite;0;30;3;1;
WCCOAnextgenarch;0;30;2;2;
WCCILevent;0;30;3;1;
WCCILproxy;0;30;2;2;
WCCOActrl;0;30;3;1;-num 1 -f pvss_scripts.lst
WCCILsim;0;-30;3;1;
WCCOActrl;2;30;2;2;webclient_http.ctl -num 2
WCCOAui;1;30;3;1;-m gedi -n -num 4
;
```

Parser notes

- Trim whitespace, ignore the initial `LIST:<n>` header if present.
- Split on `;` and map fixed columns; join remaining parts into `startOptions`.

---

## MGRLIST:STATI — runtime status of managers + project state

This command returns runtime information per manager and a final project-state line.

Per-manager STATI line format (semicolon-separated):

```text
<runningStateNum>;<pid>;<startModeNum>;<startTimestamp>;<managerNumber>
```

- `runningStateNum` mapping (typical): 0 = NotRunning, 1 = Init, 2 = Running, 3 = Blocked
- `pid` can be `-1` (no process), `-2` (fatal start failure)
- `startModeNum` same mapping as LIST (0 = manual, 1 = once, 2 = always)
- `startTimestamp` may be a WinCC OA formatted timestamp (e.g. `YYYY.MM.DD hh:mm:ss.mmm`) or `1970...` if not started
- `managerNumber` is the manager index/number

The final project-state line has the format:

```text
<projectStateNum> <projectStateText> <emergencyFlag> <demoFlag>
```

Example — stopped project (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0
;
```

Example — stopped project (alternate raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0
;
```

Example — project in state `starting` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
1;11064;2;2025.12.04 08:58:43.564;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
1 START_MODE 0 0
;
```

Example — project in state `monitoring` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -2;2;2025.12.04 08:59:13.782;  2
2;32080;1;2025.12.04 08:59:25.318;  4
2 MONITOR_MODE 0 0
;
```

Example — unknown command (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGR:STATI
ERROR errCmd :unknown command
```

Parser notes

- The STATI output usually includes a `LIST:<n>` header; skip it and parse subsequent semicolon lines.
- Watch for padding/spacing in PID and numeric fields; use numeric parsing tolerant to whitespace.
- Treat `-1` PID as missing/undefined process.
- Treat `-2` PID as fatal failure (manager configured to always start but is not running).
- Convert `startTimeStamp` when it's a real timestamp; ignore `1970.01.01...` as sentinel for 'no start time'.

---

## SINGLE_MGR — single-manager commands

Common sub-commands: `START`, `STOP`, `KILL`, `DEL`, `INS`, `PROP_GET`, `PROP_PUT`, `DEBUG`.

Examples (raw stdout preserved):

Stop manager at index (OK):

```sh
C:\Program Files\Siemens\WinCC_OA\3.21\bin>WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 8
OK
```

Stop manager — invalid index example (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 19
ERROR errInvIdx :invalid manager index given
```

Stop manager — not possible in current state (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 8
ERROR errStop :STOP of this manager not possible
```

Insert manager (INS) — success:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:INS 10 WCCOAui once 30 3 1 "-m gedi -n -num 6"
OK
```

Insert manager — invalid position (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:INS 17 WCCOAui once 30 3 1 "-m gedi -n -num 6"
ERROR errIns :insertion at this position not allowed
```

Manager property get (example):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:PROP_GET 8
once 30 3 1 -m gedi -n -num 4
```

Notes

- Successful command responses: single line `OK`.
- Error responses: `ERROR <errorId> :<text>`.

---

## Global project commands

- `STOP_ALL:` — stop all managers (pmon remains running)
- `START_ALL:` — start all managers
- `RESTART_ALL:` — restart project (pmon remains running)
- `WAIT_MODE:` — set pmon into wait mode

Examples (raw stdout):

Stop all — OK:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command STOP_ALL:
OK
```

Start all — OK:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command START_ALL:
OK
```

Start all — error when already started:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command START_ALL:
ERROR errStartAll :START_ALL in this mode not allowed
```

---

## Error format

PMON uses a simple error format for failed commands:

```text
ERROR <errorId> :<errorText>
```

When building parsers, treat any line starting with `ERROR` as a command failure and surface both `errorId` and message.

---

## Suggested parser unit tests

Below are suggested Node/TypeScript test snippets you can add to unit tests for the parser in `npm-shared-library-core`. The examples use the real outputs above as fixtures — copy the exact blocks into test fixtures (do not alter them).

- Test: parse `MGRLIST:LIST` into manager option objects
  - Input: the `MGRLIST:LIST` example block above
  - Expected samples:
    - First manager: component `WCCILpmon`, `startMode` = `Manual` (0), `secondToKill` = 30, `restart` = 3, `resetStartCounter` = 1
    - Manager with `-num 1 -f pvss_scripts.lst` included in `startOptions`

- Test: parse `MGRLIST:STATI` (stopped example)
  - Input: the `MGRLIST:STATI` stopped sample block above
  - Expectations:
    - Manager 1: state = `Running`, pid = 33540, startMode = `Manual`, startTime parsed to a Date
    - Managers with pid `-1` should yield `pid = undefined` in parsed output
    - Project state line `0 WAIT_MODE 0 0` should map to project state `Down`/`Wait` (depending on your mapping)

- Test: parse `MGRLIST:STATI` (monitoring example)
  - Input: the `MGRLIST:STATI` monitoring sample block above
  - Expectations:
    - Manager lines with real timestamps should be parsed into `Date` objects
    - The final project state line `2 MONITOR_MODE 0 0` maps to `Monitoring` / `Started`

Suggested test pseudocode (Node / assert style)

```ts
import assert from 'assert';
import { parseManagerList, parseManagerStatus } from '../src/parser/pmon';

const listFixture = `...` // paste MGRLIST:LIST example verbatim
const statusFixture = `...` // paste MGRLIST:STATI example verbatim

const options = parseManagerList(listFixture);
assert.strictEqual(options[0].component, 'WCCILpmon');
assert.strictEqual(options[0].startMode, 0);

const status = parseManagerStatus(statusFixture);
assert.strictEqual(status.managers[0].pid, 33540);
assert.ok(status.managers[0].startTime instanceof Date);
assert.strictEqual(status.projectState.statusCode, 0);
```

When adding tests, use the exact shell blocks above as fixtures. They are real outputs and provide good coverage for edge cases (missing PID, sentinel timestamps, various start modes).

---

If you want, I can also:

- generate concrete unit test files in this repository using the examples above, or
- add a small CLI tool / fixture loader to run parser tests against the real outputs.

---

End of document.
---

## MGRLIST:LIST — configuration of managers

This command returns a list of configured managers and their static options. Each non-empty line after the header is semicolon-separated and follows this pattern (example):

```text
<component>;<startModeNum>;<seckill>;<restartCount>;<resetMin>;<optional start args>
```

- `startModeNum`: numeric code (0 = manual, 1 = once, 2 = always)
- `seckill`: seconds-to-kill on restart (negative values may indicate special behavior)
- `restartCount`: restart attempt count
- `resetMin`: reset start counter minutes
- trailing fields (after 5th semicolon) are joined back into a single start-arguments string

Example (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:LIST
LIST:9
WCCILpmon;0;30;3;1;
WCCILdataSQLite;0;30;3;1;
WCCOAnextgenarch;0;30;2;2;
WCCILevent;0;30;3;1;
WCCILproxy;0;30;2;2;
WCCOActrl;0;30;3;1;-num 1 -f pvss_scripts.lst
WCCILsim;0;-30;3;1;
WCCOActrl;2;30;2;2;webclient_http.ctl -num 2
WCCOAui;1;30;3;1;-m gedi -n -num 4
;

```

Parser notes

- Trim whitespace, ignore the initial `LIST:<n>` header if present.
- Split on `;` and map fixed columns; join remaining parts into `startOptions`.

---

## MGRLIST:STATI — runtime status of managers + project state

This command returns runtime information per manager and a final project-state line.

Per-manager STATI line format (semicolon-separated):

```text
<runningStateNum>;<pid>;<startModeNum>;<startTimestamp>;<managerNumber>
```

- `runningStateNum` mapping (typical): 0 = NotRunning, 1 = Init, 2 = Running, 3 = Blocked
- `pid` can be `-1` (no process), `-2` (fatal start failure)
- `startModeNum` same mapping as LIST (0 = manual, 1 = once, 2 = always)
- `startTimestamp` may be a WinCC OA formatted timestamp (e.g. `YYYY.MM.DD hh:mm:ss.mmm`) or `1970...` if not started
- `managerNumber` is the manager index/number

The final project-state line has the format:

```text
<projectStateNum> <projectStateText> <emergencyFlag> <demoFlag>
```

Example — stopped project (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0

```

Example — stopped project (alternate raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;2;1970.01.01 01:00:00.000;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
0 WAIT_MODE 0 0
;

```

Example — project in state `starting` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
1;11064;2;2025.12.04 08:58:43.564;  2
0;   -1;1;1970.01.01 01:00:00.000;  4
1 START_MODE 0 0
;

```

Example — project in state `monitoring` (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGRLIST:STATI
LIST:9
2;33540;0;2025.12.04 08:51:42.036;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -1;0;1970.01.01 01:00:00.000;  1
0;   -2;2;2025.12.04 08:59:13.782;  2
2;32080;1;2025.12.04 08:59:25.318;  4
2 MONITOR_MODE 0 0
;

```

Example — unknown command (raw stdout):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command MGR:STATI
ERROR errCmd :unknown command

```

Parser notes

- The STATI output usually includes a `LIST:<n>` header; skip it and parse subsequent semicolon lines.
- Watch for padding/spacing in PID and numeric fields; use numeric parsing tolerant to whitespace.
- Treat `-1` PID as missing/undefined process.
- Treat `-2` PID as fatal failure (manager configured to always start but is not running).
- Convert `startTimeStamp` when it's a real timestamp; ignore `1970.01.01...` as sentinel for 'no start time'.

---

## SINGLE_MGR — single-manager commands

Common sub-commands: `START`, `STOP`, `KILL`, `DEL`, `INS`, `PROP_GET`, `PROP_PUT`, `DEBUG`.

Examples (raw stdout preserved):

Stop manager at index (OK):

```sh
C:\Program Files\Siemens\WinCC_OA\3.21\bin>WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 8
OK

```

Stop manager — invalid index example (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 19
ERROR errInvIdx :invalid manager index given

```

Stop manager — not possible in current state (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:STOP 8
ERROR errStop :STOP of this manager not possible

```

Insert manager (INS) — success:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:INS 10 WCCOAui once 30 3 1 "-m gedi -n -num 6"
OK

```

Insert manager — invalid position (error):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:INS 17 WCCOAui once 30 3 1 "-m gedi -n -num 6"
ERROR errIns :insertion at this position not allowed

```

Manager property get (example):

```sh
WCCILpmon.exe -proj Bla -log +stderr -command SINGLE_MGR:PROP_GET 8
once 30 3 1 -m gedi -n -num 4

```

Notes

- Successful command responses: single line `OK`.
- Error responses: `ERROR <errorId> :<text>`.

---

## Global project commands

- `STOP_ALL:` — stop all managers (pmon remains running)
- `START_ALL:` — start all managers
- `RESTART_ALL:` — restart project (pmon remains running)
- `WAIT_MODE:` — set pmon into wait mode

Examples (raw stdout):

Stop all — OK:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command STOP_ALL:
OK

```

Start all — OK:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command START_ALL:
OK

```

Start all — error when already started:

```sh
WCCILpmon.exe -proj Bla -log +stderr -command START_ALL:
ERROR errStartAll :START_ALL in this mode not allowed

```

---

## Error format

PMON uses a simple error format for failed commands:

```text
ERROR <errorId> :<errorText>
```

When building parsers, treat any line starting with `ERROR` as a command failure and surface both `errorId` and message.

---

## Suggested parser unit tests

Below are suggested Node/TypeScript test snippets you can add to unit tests for the parser in `npm-shared-library-core`. The examples use the real outputs above as fixtures — copy the exact blocks into test fixtures (do not alter them).

- Test: parse `MGRLIST:LIST` into manager option objects
  - Input: the `MGRLIST:LIST` example block above
  - Expected samples:
    - First manager: component `WCCILpmon`, `startMode` = `Manual` (0), `secondToKill` = 30, `restart` = 3, `resetStartCounter` = 1
    - Manager with `-num 1 -f pvss_scripts.lst` included in `startOptions`

- Test: parse `MGRLIST:STATI` (stopped example)
  - Input: the `MGRLIST:STATI` stopped sample block above
  - Expectations:
    - Manager 1: state = `Running`, pid = 33540, startMode = `Manual`, startTime parsed to a Date
    - Managers with pid `-1` should yield `pid = undefined` in parsed output
    - Project state line `0 WAIT_MODE 0 0` should map to project state `Down`/`Wait` (depending on your mapping)

- Test: parse `MGRLIST:STATI` (monitoring example)
  - Input: the `MGRLIST:STATI` monitoring sample block above
  - Expectations:
    - Manager lines with real timestamps should be parsed into `Date` objects
    - The final project state line `2 MONITOR_MODE 0 0` maps to `Monitoring` / `Started`

Suggested test pseudocode (Node / assert style)

```ts
import assert from 'assert';
import { parseManagerList, parseManagerStatus } from '../src/parser/pmon';

const listFixture = `...` // paste MGRLIST:LIST example verbatim
const statusFixture = `...` // paste MGRLIST:STATI example verbatim

const options = parseManagerList(listFixture);
assert.strictEqual(options[0].component, 'WCCILpmon');
assert.strictEqual(options[0].startMode, 0);

const status = parseManagerStatus(statusFixture);
assert.strictEqual(status.managers[0].pid, 33540);
assert.ok(status.managers[0].startTime instanceof Date);
assert.strictEqual(status.projectState.statusCode, 0);
```

When adding tests, use the exact shell blocks above as fixtures. They are real outputs and provide good coverage for edge cases (missing PID, sentinel timestamps, various start modes).

---

**Happy Coding! 🚀**

---

<div align="center">

**Quick Links**

• [📦 VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=mPokornyETM.wincc-oa-projects)

*Made with ❤️ for and by the WinCC OA community*
</div>

