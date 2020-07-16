#!/usr/bin/env bash

VERSION="0.0.1"

echo "starting server deploy script"

PATH_TO_BIN="<where you put the build result>"

echo "going to binaries at $PATH_TO_BIN"
cd $PATH_TO_BIN;

echo "Running npm  install"

npm install

echo "Starting api via PM2, named 'api'"

pm2 start index.js -n api                                                                                              

echo "OK Done!"