#!/usr/bin/env bash

# Parts taken from https://stackoverflow.com/questions/59435639/fix-shell-script-to-increment-semversion

echo ""
echo ""
echo "Starting version bump script"

ROOT_PKG_JSON_PATH="./package.json"
CLIENT_PKG_JSON_PATH="./synk-client/package.json"
API_PKG_JSON_PATH="./synk-api/package.json"

echo "Reading package version"
echo ""

# Version key/value should be on his own line
UNTRIMMED_PACKAGE_VERSION=$(cat $ROOT_PKG_JSON_PATH \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo $UNTRIMMED_PACKAGE_VERSION
PACKAGE_VERSION=$(echo $UNTRIMMED_PACKAGE_VERSION | sed 's/ //g' )

echo "Parsing Semver into major minor patch"
echo ""

IFS=. read -r major minor patch <<<"$PACKAGE_VERSION"

echo "major: $major"
echo "minor: $minor"
echo "patch: $patch"

echo "Incrementing Semver patch number"
echo ""

PATCH_NUMBER="$((patch + 1))"

UNTRIMMED_NEXT_VERSION="$major.$minor.$PATCH_NUMBER"
NEXT_VERSION=$( echo $UNTRIMMED_NEXT_VERSION | sed 's/ //g')


echo "Old package.json version was $PACKAGE_VERSION"
echo "Next version will be $NEXT_VERSION"

while true; do
    read -p "Do you want to proceed? (y/n) " yn

    case $yn in 
        [yY] ) echo ok, we will proceed; echo "";
            break;;
        [nN] ) echo exiting...;
            exit;;
        * ) echo invalid response;;
    esac
done

echo "Updating root package.json to $NEXT_VERSION"
echo ""
echo "s/${PACKAGE_VERSION}/${NEXT_VERSION}/g"
echo "s/$PACKAGE_VERSION/$NEXT_VERSION/g"

sed -i -- "s/${PACKAGE_VERSION}/${NEXT_VERSION}/g" "$ROOT_PKG_JSON_PATH"
sed -i -- "s/${PACKAGE_VERSION}/${NEXT_VERSION}/g" "$CLIENT_PKG_JSON_PATH"
sed -i -- "s/${PACKAGE_VERSION}/${NEXT_VERSION}/g" "$API_PKG_JSON_PATH"

echo "Patched version in:"
echo $ROOT_PKG_JSON_PATH
echo $CLIENT_PKG_JSON_PATH
echo $API_PKG_JSON_PATH
echo ""

echo "Done !"

