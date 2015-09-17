FROM ubuntu:14.04
MAINTAINER Li Meng Jun "lmjubuntu@gmail.com"

RUN apt-get update && \
    apt-get install -y --force-yes nodejs npm && \
    ln -s /usr/bin/nodejs /usr/bin/node

ENV TZ Asia/Shanghai

ADD package.json /src/package.json

RUN cd /src && npm install

ADD . /src

WORKDIR /src

EXPOSE 3000

CMD node app.js
