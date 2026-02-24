#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Run a Playwright CLI workflow from a plain-text step file.

Usage:
  scripts/playwright/run-workflow.sh --workflow <file> [--headed] [--retries <n>] [--output-dir <dir>]

Workflow format:
  ACTION|arg1|arg2
  # comments and blank lines are ignored

Examples:
  OPEN|https://example.com
  SNAPSHOT
  CLICK|e12
  FILL|e24|hello@example.com
  PRESS|Enter
  SLEEP|1
  SCREENSHOT
EOF
}

WORKFLOW_FILE=""
HEADED=0
RETRIES=3
OUTPUT_DIR="output/playwright"

while (($# > 0)); do
  case "$1" in
    --workflow)
      WORKFLOW_FILE="${2:-}"
      shift 2
      ;;
    --headed)
      HEADED=1
      shift
      ;;
    --retries)
      RETRIES="${2:-}"
      shift 2
      ;;
    --output-dir)
      OUTPUT_DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$WORKFLOW_FILE" ]]; then
  echo "--workflow is required" >&2
  usage >&2
  exit 2
fi

if [[ ! -f "$WORKFLOW_FILE" ]]; then
  echo "Workflow file not found: $WORKFLOW_FILE" >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  cat <<'EOF' >&2
npx is required. Install Node.js/npm first:
node --version
npm --version
EOF
  exit 1
fi

if ! [[ "$RETRIES" =~ ^[0-9]+$ ]]; then
  echo "--retries must be a non-negative integer" >&2
  exit 2
fi

REPO_ROOT="$(pwd)"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PWCLI="${PWCLI:-$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh}"

if [[ ! -x "$PWCLI" ]]; then
  echo "Playwright wrapper not found or not executable: $PWCLI" >&2
  exit 1
fi

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="$OUTPUT_DIR/$RUN_ID"
LOG_FILE="$RUN_DIR/run.log"
mkdir -p "$RUN_DIR"

log() {
  local msg="$1"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $msg" | tee -a "$LOG_FILE"
}

trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

run_pw() {
  "$PWCLI" "$@"
}

run_with_retry() {
  local step_label="$1"
  shift
  local -a cmd=("$@")
  local attempt=1
  local max_attempts=$((RETRIES + 1))

  while ((attempt <= max_attempts)); do
    if run_pw "${cmd[@]}" >>"$LOG_FILE" 2>&1; then
      return 0
    fi

    if ((attempt == max_attempts)); then
      log "FAILED $step_label after $attempt attempt(s)"
      return 1
    fi

    log "Retrying $step_label (attempt $((attempt + 1))/$max_attempts) after failure"
    run_pw snapshot >>"$LOG_FILE" 2>&1 || true
    sleep 1
    attempt=$((attempt + 1))
  done
}

cleanup() {
  set +e
  run_pw close >>"$LOG_FILE" 2>&1 || true
  if [[ -d "$REPO_ROOT/.playwright-cli" ]]; then
    mkdir -p "$RUN_DIR/playwright-cli"
    cp -R "$REPO_ROOT/.playwright-cli"/. "$RUN_DIR/playwright-cli"/ 2>/dev/null || true
  fi
}
trap cleanup EXIT

log "Starting workflow: $WORKFLOW_FILE"
log "Run directory: $RUN_DIR"
log "Using PWCLI: $PWCLI"
log "Retries per step: $RETRIES"

line_no=0
while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  line_no=$((line_no + 1))
  line="$(trim "$raw_line")"

  if [[ -z "$line" || "${line:0:1}" == "#" ]]; then
    continue
  fi

  IFS='|' read -r a1 a2 a3 a4 <<<"$line"
  action="$(printf '%s' "$(trim "${a1:-}")" | tr '[:lower:]' '[:upper:]')"
  arg1="$(trim "${a2:-}")"
  arg2="$(trim "${a3:-}")"
  arg3="$(trim "${a4:-}")"
  step="line $line_no ($action)"

  case "$action" in
    OPEN)
      if [[ -z "$arg1" ]]; then echo "Missing URL at $step" >&2; exit 1; fi
      log "Running $step: open $arg1"
      if ((HEADED == 1)); then
        run_with_retry "$step" open "$arg1" --headed
      else
        run_with_retry "$step" open "$arg1"
      fi
      ;;
    GOTO)
      if [[ -z "$arg1" ]]; then echo "Missing URL at $step" >&2; exit 1; fi
      log "Running $step: goto $arg1"
      run_with_retry "$step" goto "$arg1"
      ;;
    SNAPSHOT)
      log "Running $step: snapshot"
      run_with_retry "$step" snapshot
      ;;
    CLICK)
      if [[ -z "$arg1" ]]; then echo "Missing ref at $step" >&2; exit 1; fi
      log "Running $step: click $arg1"
      run_with_retry "$step" click "$arg1"
      ;;
    DBLCLICK)
      if [[ -z "$arg1" ]]; then echo "Missing ref at $step" >&2; exit 1; fi
      log "Running $step: dblclick $arg1"
      run_with_retry "$step" dblclick "$arg1"
      ;;
    FILL)
      if [[ -z "$arg1" ]]; then echo "Missing ref at $step" >&2; exit 1; fi
      log "Running $step: fill $arg1"
      run_with_retry "$step" fill "$arg1" "$arg2"
      ;;
    TYPE)
      log "Running $step: type"
      run_with_retry "$step" type "$arg1"
      ;;
    PRESS)
      if [[ -z "$arg1" ]]; then echo "Missing key at $step" >&2; exit 1; fi
      log "Running $step: press $arg1"
      run_with_retry "$step" press "$arg1"
      ;;
    HOVER)
      if [[ -z "$arg1" ]]; then echo "Missing ref at $step" >&2; exit 1; fi
      log "Running $step: hover $arg1"
      run_with_retry "$step" hover "$arg1"
      ;;
    SELECT)
      if [[ -z "$arg1" || -z "$arg2" ]]; then echo "Missing ref/value at $step" >&2; exit 1; fi
      log "Running $step: select $arg1 $arg2"
      run_with_retry "$step" select "$arg1" "$arg2"
      ;;
    CHECK)
      if [[ -z "$arg1" ]]; then echo "Missing ref at $step" >&2; exit 1; fi
      log "Running $step: check $arg1"
      run_with_retry "$step" check "$arg1"
      ;;
    UNCHECK)
      if [[ -z "$arg1" ]]; then echo "Missing ref at $step" >&2; exit 1; fi
      log "Running $step: uncheck $arg1"
      run_with_retry "$step" uncheck "$arg1"
      ;;
    UPLOAD)
      if [[ -z "$arg1" ]]; then echo "Missing file path at $step" >&2; exit 1; fi
      file_path="$arg1"
      if [[ ! "$file_path" = /* ]]; then
        file_path="$REPO_ROOT/$file_path"
      fi
      if [[ ! -f "$file_path" ]]; then
        echo "Upload file not found at $step: $file_path" >&2
        exit 1
      fi
      log "Running $step: upload $file_path"
      run_with_retry "$step" upload "$file_path"
      ;;
    TAB_NEW)
      log "Running $step: tab-new ${arg1:-}"
      if [[ -n "$arg1" ]]; then
        run_with_retry "$step" tab-new "$arg1"
      else
        run_with_retry "$step" tab-new
      fi
      ;;
    TAB_SELECT)
      if [[ -z "$arg1" ]]; then echo "Missing tab index at $step" >&2; exit 1; fi
      log "Running $step: tab-select $arg1"
      run_with_retry "$step" tab-select "$arg1"
      ;;
    TAB_LIST)
      log "Running $step: tab-list"
      run_with_retry "$step" tab-list
      ;;
    GO_BACK)
      log "Running $step: go-back"
      run_with_retry "$step" go-back
      ;;
    GO_FORWARD)
      log "Running $step: go-forward"
      run_with_retry "$step" go-forward
      ;;
    RELOAD)
      log "Running $step: reload"
      run_with_retry "$step" reload
      ;;
    SCREENSHOT)
      log "Running $step: screenshot ${arg1:-}"
      if [[ -n "$arg1" ]]; then
        run_with_retry "$step" screenshot "$arg1"
      else
        run_with_retry "$step" screenshot
      fi
      ;;
    PDF)
      log "Running $step: pdf"
      run_with_retry "$step" pdf
      ;;
    SLEEP)
      if [[ -z "$arg1" ]]; then echo "Missing seconds at $step" >&2; exit 1; fi
      log "Running $step: sleep $arg1"
      sleep "$arg1"
      ;;
    *)
      echo "Unknown action at line $line_no: $action" >&2
      exit 1
      ;;
  esac
done <"$WORKFLOW_FILE"

log "Workflow completed successfully"
log "Artifacts copied (if present) to $RUN_DIR/playwright-cli"
