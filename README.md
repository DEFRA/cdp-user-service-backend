# CDP User Service Backend

Core delivery platform User Service Backend.

[![Publish](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/publish.yml/badge.svg)](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/publish.yml)

[![Integration Tests](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/integration-tests.yml)

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
- [API endpoints](#api-endpoints)
- [Calling API endpoints](#calling-api-endpoints)
  - [Postman](#postman)
- [Versioning](#versioning)
  - [Auto minor versioning](#auto-minor-versioning)
  - [Major or Patch versioning](#major-or-patch-versioning)
- [Docker](#docker)
  - [Development Image](#development-image)
  - [Production Image](#production-image)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v18` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
$ cd cdp-user-service-backend
$ nvm use
```

## Local development

### Setup

Install application dependencies:

```bash
$ npm install
```

### Development

To run the application in `development` mode run:

```bash
$ npm run dev
```

### Production

To mimic the application running in `production` mode locally run:

```bash
$ npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
$ npm run
```

## API endpoints

| Endpoint                       | Description  |
| :----------------------------- | :----------- |
| `GET: /health`                 | Health       |
| `GET: /v1/entities`            | Entities     |
| `GET: /v1/entities/<entityId>` | Entity by ID |

## Calling API endpoints

### Postman

A [Postman](https://www.postman.com/) collection and environment are available for making calls to the Teams and
Repositories API. Simply import the collection and environment into Postman.

- [CDP Node Backend Template Postman Collection](postman/cdp-user-service-backend.postman_collection.json)
- [CDP Node Backend Template Postman Environment](postman/cdp-user-service-backend.postman_environment.json)

## Versioning

### Auto minor versioning

The [Publish GitHub Actions workflow](./.github/workflows/publish.yml) auto versions a Pull Requests code with a `minor`
version once it has been merged into the `main` branch.
All you have to do is commit your code and raise a Pull Request and the pipeline will auto version your code for you.

### Major or Patch versioning

If you wish to `patch` or `major` version your codebase use:

```bash
$ npm version <patch|major>
```

Then:

- Push this code with the auto generated commit to your GitHub Repository
- Raise a Pull Request
- Merge your code into the `main` branch
- The [Publish GitHub Actions workflow](./.github/workflows/publish.yml) will tag and push your `major` or `patch`
  version tags to your GitHub Repository
- The [Publish GitHub Actions workflow](./.github/workflows/publish.yml) will release your `major` or `patch`
  versioned code

## Docker

### Development image

Build:

```bash
$ docker build --target development --no-cache --tag cdp-user-service-backend:development .
```

Run:

```bash
$ docker run -e GITHUB_API_TOKEN -p 3008:3008 cdp-user-service-backend:development
```

### Production image

Build:

```bash
docker build --no-cache --tag cdp-user-service-backend .
```

Run:

```bash
$ docker run -e GITHUB_API_TOKEN -p 3001:3001 cdp-user-service-backend
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
