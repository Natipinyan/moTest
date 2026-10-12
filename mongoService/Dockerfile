FROM mongo:8

# Scripts in this folder run once, on first startup with an empty data volume
COPY init/ /docker-entrypoint-initdb.d/
