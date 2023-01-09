#!/usr/bin/env bash

echo "Starting client deploy script"

PATH_TO_BIN="<where you put the build result>"
PATH_TO_DEST="<apache or nginx or IIS public folder>"

echo "Looking for to public folder at $PATH_TO_DEST"
cd $PATH_TO_DEST;

echo "Clean public folder"
sudo rm -rf ./*

echo "Copying to public folder at $PATH_TO_DEST"
sudo cp -r  "${PATH_TO_BIN}*" "${PATH_TO_DEST}" 

echo "Securing Youtube URLs (http -> https)"
cd "$PATH_TO_DEST";
sudo sed -i -- 's,http://www.youtube.com/iframe_api,https://www.youtube.com/iframe_api,g' *js      

echo "OK Done!"