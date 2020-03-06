#!/bin/bash
#
# This is a helper script that updates all core service files when needed
# It meant to be used with entr like this:
# du -a | awk '{print $2}' | entr ./update-build.sh /path/to/islands/dir
#

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d $1 ]]; then
    echo No update path provided, or path does not exist. Exiting...
    exit 1
fi


cp ${BASE}/drivers/* ${1}
cp ${BASE}/dev-activate.sh ${1}
cp -r ${BASE}/services/engine ${1}/apps
cp -r ${BASE}/../chat ${1}/apps
${BASE}/config-gen/generate.py -p ${1}/config
