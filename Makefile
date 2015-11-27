BABEL=node_modules/.bin/babel

all: dist

backend:
	$(BABEL) -d dist src

front:
	mkdir -p dist/public

dist: backend front
	mkdir -p dist/public/upload
	cp config.json dist
	cp package/Dockerfile dist
	cp package/package.json dist
	tar cjvf dist.tar.bz2 dist

clean:
	rm -r dist
