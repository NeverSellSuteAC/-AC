FROM anapsix/alpine-java:8_server-jre_unlimited

MAINTAINER somewhere0813@gmail.com

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

RUN mkdir -p /admin

WORKDIR /admin

EXPOSE 4000

ADD ./target/admin-1.jar ./

CMD java -Djava.security.egd=file:/dev/./urandom -jar admin.jar
