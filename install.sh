NAME=essential-tweaks
DOMAIN=lublst.github.io
ZIP_NAME=$NAME@$DOMAIN.zip

echo -e ":: Creating extension bundle..."
cd src
zip -qr $ZIP_NAME *

echo -e ":: Installing extension..."
gnome-extensions install -f $ZIP_NAME
rm -rf $ZIP_NAME
