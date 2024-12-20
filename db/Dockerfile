FROM mysql:8.3.0

COPY init.sql /docker-entrypoint-initdb.d
COPY 1.sql /docker-entrypoint-initdb.d

ENV MYSQL_ROOT_PASSWORD="password"

ENV DB_DATABASE="meals-app-db" DB_USERNAME="myuser" DB_PASSWORD="mypass"

EXPOSE 3306

CMD ["mysqld"]
