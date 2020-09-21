find ./old_server ./server -name "*.js" -not -path "*/node_modules/*" | entr ./refresh.sh -p ~/sandbox/islands
