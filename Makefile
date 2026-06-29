.PHONY: build build-chrome build-firefox clean typecheck test dev-chrome dev-firefox run-firefox lint-firefox package-firefox
.DEFAULT_GOAL := build

build:
	npm run build

build-chrome:
	npm run build:chrome

build-firefox:
	npm run build:firefox

clean:
	rm -rf dist/chrome dist/firefox

typecheck:
	npm run typecheck

test:
	npm run test

dev-chrome:
	npm run dev:chrome

dev-firefox:
	npm run dev:firefox

run-firefox:
	npx web-ext run --source-dir dist/firefox

lint-firefox:
	npx web-ext lint --source-dir dist/firefox

package-firefox:
	npx web-ext build --source-dir dist/firefox
