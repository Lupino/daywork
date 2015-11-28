BABEL=node_modules/.bin/babel
WEBPACK=node_modules/.bin/webpack --config=webpack.production.config.js

all: dist

backend:
	$(BABEL) -d dist src

front:
	$(WEBPACK)
	@cp www/* dist/public

dist: backend front
	mkdir -p dist/public/upload
	@cp config.json dist
	@sed -i 's@../config.json@./config.json@' dist/config.js
	@cp package/Dockerfile dist
	@cp package/package.json dist
	tar cjf dist.tar.bz2 dist

clean:
	rm -r dist
