
while [[ $# -gt 0 ]]

do
key="$1"

case $key in
    -p|--path)
    ISLANDS_PATH="$2"
    shift
    shift
    ;;
esac
done

if [[ ! -d $ISLANDS_PATH ]]; then
    echo "Islands path not found"
    exit 1
fi

find ./old_server ./server -name "*.js" -not -path "*/node_modules/*" | entr ./refresh.sh -p $ISLANDS_PATH
