FROM ubuntu:xenial

RUN echo updating sources... \
    && apt update \
    && echo installing curl... \
    && apt install curl -y \
    && echo installing Node.JS... \
    && apt install apt-transport-https -y \
    && echo 'deb https://deb.torproject.org/torproject.org xenial main' | tee -a /etc/apt/sources.list \
    && echo 'deb-src https://deb.torproject.org/torproject.org xenial main' | tee -a /etc/apt/sources.list \
    && gpg --keyserver keys.gnupg.net --recv A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 \
    && gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add - \
    && apt update \
    #\
    && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt install -y nodejs \
    && echo Node.JS installed successfully \
    && echo installing TOR... \
    && apt install tor -y




    # Setting tor control password:
RUN phash=$(tor --hash-password 'TheP@$sw0rd' | grep 16\:.*) \
    && echo 'ControlPort 9051' | tee -a /etc/tor/torrc \
    && echo 'HashedControlPassword' $phash | tee -a /etc/tor/torrc \
    && echo 'ExitPolicy reject *:*' | tee -a /etc/tor/torrc \
    # starting tor
    && mkdir /data/islandsData/history -p

#Create app directory
WORKDIR /usr/src/app
COPY config/config.json ./data/islandsData/
COPY package*.json ./
RUN npm install \
    #&& npm install -g forever\
    && npm install -g pm2 \
    && pm2 update \
    && apt install unzip -y
COPY . .
EXPOSE 4000
EXPOSE 80
EXPOSE 9229
STOPSIGNAL SIGTERM

CMD service tor start && \
    sed -i -e 's/\r$//' /usr/src/app/scripts/updategh.sh &&\
    sed -i -e 's/\r$//' /usr/src/app/scripts/update.sh &&\
    #forever -c  "node --inspect=0.0.0.0:9229" app.js -c /usr/src/app/config.json &&\
    pm2 start app.js --node-args="--inspect=0.0.0.0:9229 --experimental-worker" -- -c /usr/src/app/config.json &&\
    pm2 attach 0 &&\
    #pm2  start  app.js -- -c /usr/src/app/config.json &&\

    /bin/bash
#CMD ["node", "/usr/src/app/app.js", "-c /data/islandsData/config.json"]

