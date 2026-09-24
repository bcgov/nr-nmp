# BC Ministry of Agriculture Nutritient Management Program

- [About](#about)
- [Development setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Getting started](#getting-started)
  - [Running NMP locally](#running-nmp-locally)
  - [CI/CD pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

## About

The Nutrient Management Calculator provides a starting point for the efficient use of fertilizer and manure on farms. This web based tool assists in choosing the right rate and nutrient source for your crops.

This application includes a [React](https://react.dev/) and [Vite](https://vite.dev/) frontend, [Node](https://nodejs.org/docs/latest/api/) and [Django](https://www.djangoproject.com/) backend, and [Postgres](https://www.postgresql.org/) database written in [TypeScript](https://www.typescriptlang.org/) with [Jest](https://jestjs.io/) and [Cypress](https://www.cypress.io/#create) testing.

## Development Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Environment Configuration

Clone this repo from GitHub, copy the `.env.template`, rename to `.env` and fill with env variables.

### Getting started

Follow the appropriate READme's below to setup this project locally.

- [Frontend Readme](/frontend/README.md)
- [Backend Readme](/backend/README.md)
- [Database Readme](/database/README.md)

### Running NMP locally

Once the .env file and setup are completed, open the Docker desktop app, ensure you are in the projects root folder in your CLI then run:

```bash
docker compose up --build
```

For future runs you can run:

```bash
docker compose up
```

### CI/CD pipeline

Utilizing GitHub actions, when a pull request is created an OpenShift pod is created in the dev environment. When a pr is merged into main an Openshift pod is created in test and prod then the dev environment is cleaned up.

## Contributing

Please report any [issues](https://github.com/bcgov/agri-nmp/issues).

[Pull requests](https://github.com/bcgov/agri-nmp/pulls) are always welcome.

If you would like to contribute, please see our [contributing](CONTRIBUTING.md) guidelines.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

[![MIT License](https://img.shields.io/github/license/bcgov/quickstart-openshift.svg)](/LICENSE.md)

  ```text
  Copyright 2026 Province of British Columbia

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at 

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  ```
