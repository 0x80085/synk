#!/usr/bin/env bash

VERSION="0.0.1"

echo "Starting client deploy script"

PATH_TO_BIN="<where you put the build result>"
PATH_TO_DEST="<apache or nginx or IIS public folder>"

API_PORT="<port of your backend server>"
API_URL="<uri of your backend server>"

echo "Looking for to public folder at $PATH_TO_DEST"
cd $PATH_TO_DEST;

echo "Clean public folder"
sudo rm -rf ./*

echo "Copying to public folder at $PATH_TO_DEST"
sudo cp -r  "${PATH_TO_BIN}*" "${PATH_TO_DEST}" 

echo "Replacing env vars in binaries in public folder"
cd $PATH_TO_DEST;
sudo sed -i -- 's,__SYNK_API_URL__,"${API_URL}":"${API_PORT}",g' *js

echo "Securing Youtube URLs (http -> https)"
sudo sed -i -- 's,http://www.youtube.com/iframe_api,https://www.youtube.com/iframe_api,g' *js      

echo "OK Done!"