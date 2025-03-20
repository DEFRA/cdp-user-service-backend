# CDP User Service Backend

Core delivery platform User Service Backend.

[![Publish](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/publish.yml/badge.svg)](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/publish.yml)

[![Integration Tests](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/DEFRA/cdp-user-service-backend/actions/workflows/integration-tests.yml)

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
    - [Updating dependencies](#updating-dependencies)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
- [Swagger API documentation](#swagger-api-documentation)
- [Versioning](#versioning)
  - [Auto minor versioning](#auto-minor-versioning)
  - [Major or Patch versioning](#major-or-patch-versioning)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
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

Install the application dependencies:

```bash
$ npm install
```

### Development

To run the application in `development` mode run:

```bash
$ npm run dev
```

#### Updating dependencies

To update dependencies, globally install https://www.npmjs.com/package/npm-check-updates. Then run the below script,
run tests, test the application and commit the altered `package.json` and `package-lock.json` files. For more
options around updates check the package docs.

```bash
ncu -i
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

## Swagger API documentation

Swagger API docs are available locally only. You can view them
at [http://localhost:3001/docs](http://localhost:3001/docs)

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
