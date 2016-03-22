BABEL=node_modules/.bin/babel

FILES=$(shell find app -name '*.jsx')

SRC=$(shell find src -name '*.js')
DIST=build/

APPJS=$(DIST)public/static/app.js

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
	rsync -avz --exclude=public/upload --exclude=node_modules --delete $(DIST) core@huabot.com:app/daywork

publish: rsync
	ssh core@huabot.com docker build -t daywork app/daywork
	ssh core@huabot.com sudo systemctl restart daywork
	ssh core@huabot.com sudo systemctl restart daywork-worker
