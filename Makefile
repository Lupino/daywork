BABEL=node_modules/.bin/babel

FILES=$(shell find app -name '*.jsx')

SRC=$(shell find src -name '*.js')
DIST=build/

APPJS=$(DIST)public/static/app.js

PUBLISHHOST=asiaroad

all: dist

$(DIST): $(SRC)
	$(BABEL) -d $(DIST) src
	@cp config.json $(DIST)
	@sed -i 's@../config.json@./config.json@' $(DIST)config.js
	@cp package/Dockerfile $(DIST)
	@cp package/package.json $(DIST)

$(APPJS): $(FILES)
	npm run build

front: $(APPJS)
	@cp -a www/* $(DIST)public

dist: $(DIST) front

dist-app: front
	cp -av $(DIST)/public/static Daywork/www

clean:
	rm -r $(DIST)

rsync: dist
	rsync -avz --exclude=public/upload --exclude=node_modules --delete $(DIST) $(PUBLISHHOST):/data/apps/yiqilaila.ml

publish: rsync
	ssh asiaroad docker build -t yiqilaila /data/apps/yiqilaila.ml

restart:
	ssh $(PUBLISHHOST) docker stop yiqilaila
	ssh $(PUBLISHHOST) docker rm yiqilaila
	ssh $(PUBLISHHOST) docker run -d \
		--name yiqilaila \
		-e TMPDIR=/src/public/upload \
		-v /data/conf/yiqilaila/config.json:/src/config.json \
		-v /data/files/yiqilaila:/src/public/upload \
		-p 192.168.42.1:4000:3000 \
		yiqilaila
