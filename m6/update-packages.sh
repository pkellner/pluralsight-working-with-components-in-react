#!/usr/bin/env bash
# update-packages.sh
# ------------------------------------------------------------------
# 1. Recursively updates package.json files (root fields + versions)
#    — only if the keys already exist.
# 2. Overwrites any next.config.js it finds with a minimal stub.
# 3. Logs every file processed (console + update-packages.log).
#
# Requires: jq  (brew install jq)
# ------------------------------------------------------------------
set -euo pipefail

# ---------- desired root-level field values ------------------------
TARGET_NAME="designing-components-in-react-pluralsight-course"
TARGET_AUTHOR="Peter Kellner"
TARGET_VERSION="2.0.0"
TARGET_DESCRIPTION="Designing Components in React Course Demo Files"

# ---------- desired dependency versions ----------------------------
NEXT_VER="^15.4.3"
REACT_VER="^19.1.0"
AXIOS_VER="^1.11.0"
ESLINT_VER="^9.31.0"
ESLINT_CFG_NEXT_VER="^15.4.1"

# ---------- stub for next.config.js --------------------------------
NEXT_CONFIG_STUB=$'/** @type {import(\'next\').NextConfig} */\nconst nextConfig = {\n};\n\nmodule.exports = nextConfig;\n'
# --------------------------------------------------------------------

LOG_FILE="update-packages.log"
: > "$LOG_FILE"                       # truncate previous log

log() {
  printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" | tee -a "$LOG_FILE"
}

update_package_json() {
  local file=$1
  log "Processing package.json  →  $file"

  jq \
    --arg name        "$TARGET_NAME" \
    --arg author      "$TARGET_AUTHOR" \
    --arg version     "$TARGET_VERSION" \
    --arg description "$TARGET_DESCRIPTION" \
    --arg nextVer     "$NEXT_VER" \
    --arg reactVer    "$REACT_VER" \
    --arg axiosVer    "$AXIOS_VER" \
    --arg eslintVer   "$ESLINT_VER" \
    --arg eslintCfg   "$ESLINT_CFG_NEXT_VER" \
'
  # ---------- root fields ----------
  if has("name")        then .name        = $name        else . end
| if has("author")      then .author      = $author      else . end
| if has("version")     then .version     = $version     else . end
| if has("description") then .description = $description else . end

  # ---------- dependencies ----------
| if (.dependencies? // empty)                           then
      (if .dependencies | has("next")      then .dependencies.next          = $nextVer  else . end) |
      (if .dependencies | has("react")     then .dependencies.react         = $reactVer else . end) |
      (if .dependencies | has("react-dom") then .dependencies["react-dom"]  = $reactVer else . end) |
      (if .dependencies | has("axios")     then .dependencies.axios         = $axiosVer else . end)
  else . end

  # ---------- devDependencies -------
| if (.devDependencies? // empty)                                then
      (if .devDependencies | has("eslint")             then .devDependencies.eslint            = $eslintVer else . end) |
      (if .devDependencies | has("eslint-config-next") then .devDependencies["eslint-config-next"] = $eslintCfg else . end)
  else . end
' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"

  log "✔︎ Updated package.json   →  $file"
}

update_next_config() {
  local file=$1
  log "Processing next.config.js → $file"
  printf '%s' "$NEXT_CONFIG_STUB" > "${file}.tmp" && mv "${file}.tmp" "$file"
  log "✔︎ Reset next.config.js    → $file"
}

export -f update_package_json update_next_config log
export TARGET_NAME TARGET_AUTHOR TARGET_VERSION TARGET_DESCRIPTION
export NEXT_VER REACT_VER AXIOS_VER ESLINT_VER ESLINT_CFG_NEXT_VER
export NEXT_CONFIG_STUB LOG_FILE

log "🔍 Starting search for package.json and next.config.js …"

find . \( -type d -name node_modules -prune \) -o \
       \( -type f \( -name package.json -o -name next.config.js \) -print0 \) |
while IFS= read -r -d '' filepath; do
  case "$filepath" in
    */package.json)    bash -c 'update_package_json "$0"' "$filepath" ;;
    */next.config.js)  bash -c 'update_next_config  "$0"' "$filepath" ;;
  esac
done

log "✅ Script complete."
