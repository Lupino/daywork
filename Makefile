BABEL=node_modules/.bin/babel

all: dist

backend:
	$(BABEL) -d dist src

front:
	npm run build
	@cp -a www/* dist/public

dist: backend front
	mkdir -p dist/public/upload
	@cp config.json dist
	@sed -i 's@../config.json@./config.json@' dist/config.js
	@cp package/Dockerfile dist
	@cp package/package.json dist
	tar cjf dist.tar.bz2 dist

dist-app: front
	cp -av dist/public/static Daywork/www

clean:
	rm -r dist
