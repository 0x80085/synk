#!/usr/bin/env bash
VERSION="0.0.1"

PATH_TO_DIST="$PWD/dist"
PATH_TO_ENV="$PWD/.env"

echo
echo "Monitoring synk-api with PM2 script - version $VERSION"
echo
echo
echo Performing sanity check...
echo
echo Is PM2 installed?
echo ...
echo

isPM2InGlobalPackageList=$(npm list -g | grep pm2)
if [ "$isPM2InGlobalPackageList" = "" ]; then
  echo ERR Please install PM2 with following command:
  echo npm i -g pm2
  exit 1
fi

echo Yes. But..
echo
echo Is Typescript installed?
echo ...
echo

isTSInGlobalPackageList=$(npm list -g | grep typescript)
if [ "$isTSInGlobalPackageList" = "" ]; then
  echo ERR Please install TypeScript with following command:
  echo npm i -g typescript
  exit 1
fi

echo Yes. Environment spot check completed.
echo
echo Sanity check OK.
echo
echo Packaging and configuring API...
echo
echo Compiling code with tsc
echo ...

tsc

echo
echo Copying env file to bin folder
echo ...

cp $PATH_TO_ENV $PATH_TO_DIST

echo
echo Preparations completed.
echo
echo Starting monitoring with PM2...
echo

echo Launching api through PM2
echo ...

cd $PATH_TO_DIST && pm2 start "$PATH_TO_DIST/index.js"

echo
echo Success!
echo
echo View live updates with:
echo -e "\t pm2 monit"
echo
echo List all services:
echo -e "\t pm2 list"

exit 0
