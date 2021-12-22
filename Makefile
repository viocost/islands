all: core-all bin/apps

full:
	./scripts/make-linux-core.sh -p ./bin && cd core && ./make-islands.sh -p ../bin

dev: core-linux js-dev

js: bin/apps
	cd ./bin/apps/chat && npm prune --production

js-dev: bin/apps
	cd ./bin/apps/chat && npm i

core-all: bin/core/linux

bin/core/linux:
	./scripts/make-linux-core.sh -p ./bin

bin/apps:
	cd ./core && ./make-islands.sh -p ../bin

install: core-all bin/apps
	./scripts/install.sh -s ./bin -p ./dist/islands

clean:
	rm -rf ./bin ./dist && cd ./chat && npm run unbuild && cd ../core/services/engine && npm run clean

update: bin/apps
	./scripts/make-update.sh -s ./bin -p ./dist/update

clean-apps:
	rm -rf ./bin/apps && cd ./chat && npm run unbuild && cd ../core/services/engine && npm run clean
