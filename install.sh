#!/usr/bin/env bash

BUNDLE=0

for arg in "$@"; do
    [ "$arg" = "--bundle" ] && BUNDLE=1
done

NAME=essential-tweaks
DOMAIN=lublst.github.io
ZIP_NAME=$NAME@$DOMAIN.zip

mkdir -p build
cp -r assets build
cp -r src/* build
cp LICENSE build
cp README.md build

echo -e ":: Creating extension bundle..."
cd build
zip -qr "$ZIP_NAME" *

if [ $BUNDLE -eq 1 ]; then
    cp "$ZIP_NAME" ..
else
    echo -e ":: Installing extension..."
    gnome-extensions install -f "$ZIP_NAME"
fi

cd ..
rm -rf build
