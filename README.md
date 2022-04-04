# Suvanosa

A survey engine powered with Notion. Build with Go and React.

## Getting Started

**Clone the repository**

```bash
git clone https://github.com/mgilangjanuar/suvanosa.git
```

*Or, use git sparse checkout for clone the specific service:*

```bash
git init suvanosa
cd suvanosa

git remote add origin https://github.com/mgilangjanuar/suvanosa.git
git config core.sparseCheckout true

echo "server/" >> .git/info/sparse-checkout
# OR:
# echo "web/" >> .git/info/sparse-checkout

git pull origin main
```

### What you'll need

- [PostgreSQL](https://www.postgresql.org/) version 14.2 or above:

  Install with this command (Ubuntu):

  ```shell
  sudo apt install postgresql -y
  ```

- [Go](https://go.dev/doc/install) version 1.18 or above

- [Node.js](https://nodejs.org/en/download/) version 16.14.2 or above:

  Install LTS version with command:

  ```shell
  sudo apt install nodejs npm -y    # if, using Ubuntu

  # install stable version
  npm i -g n
  n stable
  ```

- [Yarn](https://yarnpkg.com/getting-started/install) version 1.22.17 or above:

  Install with npm:

  ```shell
  npm i -g yarn
  ```

### Create Notion integration

1. Go to the [Notion Developers page](https://www.notion.so/my-integrations)
2. Add new **public** integration:

   1. Set redirect URLs to:

      - `https://<your web URL>/auth/redirect`
      - `http://localhost:3000/auth/redirect` (for local development)

3. Save the `client_id` and `client_secret`


### Env variables

- Define all server variables in `./server/.env`, you can copy from `./server/.env.example`

  ```shell
  cp ./server/.env.example ./server/.env
  ```

  Explanation:

  | env                    | required | description                                           |
  | ---------------------- | -------- | ----------------------------------------------------- |
  | PORT                   | no       | Port for running API, default: 4000                   |
  | BASE_URL               | yes      | Application base API URL                              |
  | DATABASE_URI           | yes      | PostgreSQL connection URI, format: `postgresql://[user]:[password]@[host]:[port][/dbname][?paramspec]` |
  | SECRET_KEY             | yes      | Random hex string for encrypt users key               |
  | JWT_SECRET             | yes      | Random string for encrypt JSON web token              |
  | NOTION_CLIENT_ID       | yes      | Notion client_id from public integration              |
  | NOTION_CLIENT_SECRET   | yes      | Notion client_secret from public integration          |
  | NOTION_REDIRECT_URL    | yes      | Notion redirect_url from public integration           |

- Define all web variables in `./web/.env`, you can copy from `./web/.env.example`

  ```shell
  cp ./web/.env.example ./web/.env
  ```

   Explanation:

  | env                    | required | description                                                       |
  | ---------------------- | -------- | ----------------------------------------------------------------- |
  | REACT_APP_API_BASE_URL | no       | Base URL for the API, default: `''` (empty string)                |

## Build and Run

Build with Docker:

- Docker

  ```bash
  echo "DB_PASSWORD=<random-string-here>" > .env
  docker-compose up -d
  ```


Or, manual build with:

- Build and run server:

  ```bash
  cd server
  go mod download
  go build -o ./bin/main ./cmd/suvanosa

  # Run!
  ./bin/main
  ```

- Build and run web:

  ```bash
  cd web
  yarn install

  # Run!
  run start
  ```

## Daemonize Services

 - Systemctl: https://stackoverflow.com/questions/58022141/pm2-like-process-management-solution-for-golang-applications
 - PM2: https://pm2.keymetrics.io/

## License

[MIT](./LICENSE.md)