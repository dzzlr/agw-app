## Project setup
### Setup PostgreSQL using Docker
#### Pull docker image and run docker image of postgres
```
docker pull postgres
docker run --name postgres -e POSTGRES_PASSWORD=supersecretpassword -p 5432:5432 -d postgres
```

#### Access postgres container
```
docker exec -it postgres bash
psql -U postgres
```

#### Create user
```
CREATE USER developer WITH ENCRYPTED PASSWORD 'supersecretpassword';
```

#### Create database
```
CREATE DATABASE agw_db;
```

#### Manage user access
```
GRANT ALL ON DATABASE agw_db TO developer;
ALTER DATABASE agw_db OWNER TO developer;
```

### Install Dependency
```
npm install
```

### Run Migration
```
npm run migrate up
```

migrate create ‘<migration name>’: Digunakan untuk membuat berkas migration baru.
migrate up:  Digunakan untuk menjalankan seluruh up migration yang belum dijalankan.
migrate down: Digunakan untuk menjalankan satu down migration dari keadaan saat ini.
migrate redo: Digunakan untuk menjalankan ulang migration sebelumnya (menjalankan down migration kemudian up migration).