#!/bin/bash
# this script will zip up current version of islands omitting any data

OUT=$(readlink -f "..")
FILENAME="islands_update"
CURDIR=$(pwd)
FULL_PACKAGE=false
EXCLUSIONS="-I data -I islands -I core -I update -I config"

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in

        -o|--out)
            OUT=$(readlink -f "$2")
            shift
            shift
            ;;
        -v|--version)
            VERSION=$2
            shift
            shift
            ;;
        -f|--full-package)
            FULL_PACKAGE=true
            FILENAME="islands"
            EXCLUSIONS="-I data -I islands"
            shift
            ;;
        -h|--help)
            echo "$USAGE"
            exit 0
            ;;

        *)
            break
    esac
done

if [[ ! -d  $OUT ]]; then
    echo Out directory does not exist
    exit 1
fi


if [[ -z $VERSION ]]; then
    VERSION=$(python -c "import sys, json
try:
    with open('${CURDIR}/apps/chat/package.json', 'r') as fp:
         print(json.load(fp)['version'])
except Exception:
    exit(0)
")
fi

FILENAME=${FILENAME}_${VERSION}.zip

DEST=${OUT}/${FILENAME}

if [[ -f $DEST ]]; then
    echo out file already exist and will be replaced
fi

mkdir ./islands
cp -r $(ls ${EXCLUSIONS} ) ./islands
mkdir ./islands/data


zip -r $DEST  ./islands
rm -rf ./islands

echo All set
