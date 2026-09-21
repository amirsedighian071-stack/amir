#!/bin/sh
# Registers the Vazirmatn TTFs (devDependency) with fontconfig so the
# screenshot generator (scripts/build-project-shots.cjs) can render Persian text.
set -e
DIR="${FONT_DIR:-$HOME/.fonts}"
mkdir -p "$DIR"
cp node_modules/vazirmatn/fonts/ttf/Vazirmatn-Regular.ttf \
   node_modules/vazirmatn/fonts/ttf/Vazirmatn-Medium.ttf \
   node_modules/vazirmatn/fonts/ttf/Vazirmatn-SemiBold.ttf \
   node_modules/vazirmatn/fonts/ttf/Vazirmatn-Bold.ttf "$DIR"/
command -v fc-cache >/dev/null 2>&1 && fc-cache -f "$DIR" || true
echo "Vazirmatn installed into $DIR"
