all: backend front
	mkdir -p dist/public/upload
	cp config.json dist
	sed -i 's@../config.json@./config.json@' dist/config.js
	sed -i -e 's@http://127.0.0.1:3000@@' \
		   -e 's@"Back"@"返回"@' \
		   -e 's@"Cancel"@"取消"@' \
		   -e 's@"OK"@"确定"@' \
		   dist/public/main.js

	sed -i 's@main@/main@' dist/public/index.html
	cp package/Dockerfile dist
	cp package/package.json dist

backend:
	babel -d dist src

front:
	reapp-build web
	mkdir -p dist/public
	cp -av build/web/* dist/public

dist.tar.bz2:
	tar cjvf dist.tar.bz2 dist

clean:
	rm -r dist
	rm -r build
