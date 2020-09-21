find -name "*.js" -not -path "*/node_modules/*" | entr ./refresh.sh -p ~/sandbox/islands -bf
