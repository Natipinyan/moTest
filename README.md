# moTest – MongoDB in Docker

A demo project: a MongoDB database running in a Docker container, preloaded with sample data.

## Project structure

```
moTest/
├── docker-compose.yml       ← starts the services (currently just MongoDB)
├── .env                     ← username, password and database name
├── README.md
└── mongoService/
    ├── Dockerfile           ← builds the MongoDB image and adds the init script
    └── init/
        └── 01-init.js       ← creates the collections and inserts sample data
```

## Requirements

- Docker + Docker Compose
- [MongoDB Compass](https://www.mongodb.com/products/tools/compass) (optional, a GUI for browsing the data)

## Running

From the project root:

```bash
docker compose up -d --build
```

Check that the service is running (`STATUS` should show `healthy`):

```bash
docker compose ps
```

Stopping:

```bash
docker compose down        # stops and removes the container, keeps the data
docker compose down -v     # also deletes the data
```

> **Note:** `init/01-init.js` runs **only on the first startup**, when the data volume is empty.
> After changing the script, delete the data and start again:
> `docker compose down -v && docker compose up -d --build`

## What's in the database

A database named `appdb` with 3 collections (MongoDB's equivalent of tables):

| Collection | Documents | Fields |
|---|---|---|
| `users` | 3 | `name`, `email` (unique), `age`, `createdAt` |
| `products` | 4 | `name`, `price`, `stock`, `tags` |
| `orders` | 3 | `userId` (references a user), `items` (list of products), `status`, `createdAt` |

Each collection has a validator with rules. For example, a user without an `email` is rejected.

## Connection parameters

| Parameter | Value | Where it comes from |
|---|---|---|
| **Host** | `localhost` | the container runs on the local machine |
| **Port** | `27017` | `docker-compose.yml` → `ports: "27017:27017"` |
| **Username** | `admin` | `.env` → `MONGO_ROOT_USER` |
| **Password** | `changeme` | `.env` → `MONGO_ROOT_PASSWORD` |
| **Authentication Database** | `admin` | MongoDB stores the root user in the `admin` database |
| **Database** | `appdb` | `.env` → `MONGO_DB` |

## Connecting with MongoDB Compass

### Option A: fill in the fields

1. Open Compass and click **+ Add new connection**.
2. Leave the default value in the **URI** field: `mongodb://localhost:27017/`.
   The field must not be empty, so don't delete it.
3. Click **▸ Advanced Connection Options** below the URI field.
4. Open the **Authentication** tab and fill in:
   - **Authentication Method:** `Username/Password`
   - **Username:** `admin`
   - **Password:** `changeme`
   - **Authentication Database:** `admin`
5. Click **Connect** (or **Save & Connect**).

While you fill in the fields, Compass updates the URI at the top automatically. That's expected.

### Option B: paste a connection string

Paste this into the **URI** field and click **Connect**:

```
mongodb://admin:changeme@localhost:27017/?authSource=admin
```

Breakdown:

```
mongodb://  admin : changeme @ localhost : 27017 / ?authSource=admin
   │          │        │          │          │              │
 scheme    username  password    host       port    database that stores the user
```

### After connecting

Click `appdb` in the left sidebar to see `users`, `products` and `orders`.

## Connecting from the terminal

```bash
docker exec -it mongodb mongosh -u admin -p changeme --authenticationDatabase admin appdb
```

Some example commands:

```js
show collections
db.users.find()
db.products.find({ price: { $lt: 100 } })
exit
```

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Authentication failed` | Authentication Database isn't set to `admin` | Set it to `admin` |
| `connect ECONNREFUSED` | The container isn't running | `docker compose up -d` |
| Collections are missing | The data was created before the script changed | `docker compose down -v && docker compose up -d --build` |

> The `changeme` password is for demo purposes only. In a real project, don't commit `.env` to GitHub.
