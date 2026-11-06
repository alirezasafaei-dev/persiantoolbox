#!/usr/bin/env bash
# Library owned by the canonical production engine; not a deployment entrypoint.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo '[invoice-font-routing] invoke through the canonical production engine' >&2
  exit 64
fi

reconcile_invoice_font_routing() (
  set -Eeuo pipefail
  local source_dir="$1" current_release="$2" current_port="$3" base_url="$4" state_dir="$5"
  local nginx_root="${6:-/etc/nginx}"
  local work target install_tmp='' backup='' changed=false accepted=false
  local owner group mode
  work="$(mktemp -d "$state_dir/invoice-font-routing.XXXXXX")"
  chmod 700 "$work"

  atomic_install() {
    local content="$1"
    install_tmp="$(sudo mktemp "${target}.invoice-font.XXXXXX")" || return 1
    sudo install -o "$owner" -g "$group" -m "$mode" "$content" "$install_tmp" || return 1
    sudo mv -Tf "$install_tmp" "$target" || return 1
    install_tmp=''
  }

  cleanup() {
    local status=$?
    trap - EXIT
    if [[ "$changed" == true && "$accepted" != true ]]; then
      echo '[invoice-font-routing] restoring original nginx configuration' >&2
      if ! atomic_install "$backup" || ! sudo nginx -t || ! sudo systemctl reload nginx; then
        echo '[invoice-font-routing] RESTORE FAILED; protected backup retained' >&2
        status=1
      fi
    fi
    [[ -z "$install_tmp" ]] || sudo rm -f "$install_tmp"
    rm -rf "$work"
    exit "$status"
  }
  trap cleanup EXIT
  trap 'exit 1' INT TERM

  verify_fonts() {
    local url="$1" weight font reference metrics code mime size
    for weight in Regular Bold; do
      font="Vazirmatn-$weight.ttf"
      reference="$current_release/.next/standalone/public/fonts/$font"
      [[ -s "$reference" ]] || { echo '[invoice-font-routing] missing active reference font' >&2; return 1; }
      metrics="$(env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy \
        curl --fail --silent --show-error --connect-timeout 5 --max-time 30 \
        -H 'Cache-Control: no-cache' -o "$work/font.ttf" -w '%{http_code}\t%{content_type}\t%{size_download}' "$url/fonts/$font")"
      IFS=$'\t' read -r code mime size <<< "$metrics"
      [[ "$code" == 200 && "${size%.*}" -gt 0 ]] || return 1
      case "${mime%%;*}" in
        font/ttf|font/sfnt|application/x-font-ttf|application/font-sfnt|application/octet-stream) ;;
        *) echo '[invoice-font-routing] invalid invoice font content type' >&2; return 1 ;;
      esac
      cmp -s "$reference" "$work/font.ttf" || { echo '[invoice-font-routing] invoice font bytes differ from active release' >&2; return 1; }
    done
  }

  verify_fonts "http://127.0.0.1:$current_port"
  sudo nginx -T > "$work/nginx.txt" 2> "$work/nginx-status.txt"
  node "$source_dir/scripts/deploy/reconcile-font-routing.mjs" --select "$work/nginx.txt" "$work/target"
  target="$(sudo readlink -f "$(cat "$work/target")")"
  [[ "$target" == "$nginx_root"/* && -f "$target" ]] || { echo '[invoice-font-routing] unsafe nginx target' >&2; exit 1; }
  sudo cat "$target" > "$work/original"
  node "$source_dir/scripts/deploy/reconcile-font-routing.mjs" --transform "$work/original" "$work/candidate"

  if ! cmp -s "$work/original" "$work/candidate"; then
    read -r owner group mode < <(sudo stat -c '%u %g %a' "$target")
    backup="$state_dir/invoice-font-before-$(basename "$work").conf"
    sudo install -m 600 "$work/original" "$backup"
    sudo cmp -s "$target" "$work/original" || { echo '[invoice-font-routing] nginx changed during preparation' >&2; exit 1; }
    changed=true
    atomic_install "$work/candidate"
    sudo nginx -t
    sudo systemctl reload nginx
  fi
  verify_fonts "$base_url"
  accepted=true
  echo '[invoice-font-routing] active invoice font routing and exact bytes verified'
)
