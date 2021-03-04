# NYC Benefits Screening API Documentation

Documentation site source for the NYC Benefits Screening API maintained by [@nycopportunity](https://github.com/NYCOpportunity). Screen clients for **benefits at scale** or create **new benefits screening tools**. Send household composition data to eligibility rules for **35+** City, State, and Federal programs including SNAP, Cash Assistance, WIC, HEAP, and more. To learn more about the API view the public documentation at [screeningapidocs.cityofnewyork.us](https://screeningapidocs.cityofnewyork.us).

## Readme Contents

* [Updating the Static Site Front-end](#updating-the-static-site-front-end)
  * [Git Flow](#git-flow)
  * [NPM](#npm)
    * [Patterns CLI](#patterns-cli)
    * [CDN Path](#cdn-path)
  * [Migrate changes back to `main`](#migrate-changes-back-to-main)
  * [Publishing](#publishing)
* [Content Management](#content-management)
  * [Drafting Content](#drafting-content)
  * [Preview](#preview)
  * [Creating a Pull Request for Review](#creating-a-pull-request-for-review)
  * [Publishing Content](#publishing-content)

## Updating the Static Site Front-end

The site source is written in JavaScript (ES Module format), Dart Sass, and Twig templates. The source is compiled by the Patterns CLI ([more details below](#patterns-cli)) with some custom commands and configuration.

### Git Flow

Clone this repository and checkout the `env/development` branch.

```console
$ git clone https://github.com/CityOfNewYork/screeningapi-docs.git --branch env/development
```

Create a new feature branch based on `env/development`. For example; `feature/new-page` or `fix/a-new-bug`.

```console
$ git checkout -b feature/new-page
```

### NPM

Install dependencies by running the following command;

```console
$ npm i
```

Then start the development server and asset watcher;

```console
$ npm start
```

This will set the `NODE_ENV` to `development` which tells the development server to watch for specific file changes in the [**./src**](src) directory (the CLI will print the globing patterns that are being watched) and compile views and assets into the [**./dist/drafts**](dist/drafts) directory. The site's main script will pull content in Markdown files from the [`drafts` content branch](https://github.com/CityOfNewYork/screeningapi-docs/tree/drafts) of this repository.

The drafts directory serves as the local development site preview and the content preview in the production site. See [Content Management](#content-management) below for more details.

The public-facing site is stored in the root of the [**./dist**](dist) directory. To preview the public-facing site locally and view published content in the [`content` branch](https://github.com/CityOfNewYork/screeningapi-docs/tree/content) use the following command;

```console
$ npm run production
```

This will set the `NODE_ENV` to `production` but and run the same development server and source file watcher/compiler.

#### Patterns CLI

The site uses the [Patterns CLI](https://github.com/CityOfNewYork/patterns-cli), also maintained by [@nycopportunity](https://github.com/NYCOpportunity), to build source files from the [**./src**](src) directory to the [**./dist**](dist) directory. All of [the commands from the CLI](https://github.com/CityOfNewYork/patterns-cli#commands) are available for compiling different asset types. It uses the [Patterns Twig Plugin](https://github.com/CityOfNewYork/patterns-plugin-twig) in place of the Slm Lang compiler for templating.

The CLI is configured by scripts in the [**./config**](config) directory (each [command in the CLI can have local project configuration](https://github.com/CityOfNewYork/patterns-cli#no-config-or-custom-build)). The build paths for `production` and `development` are set in the [**./config/global.js**](config/global.js)

[Custom commands](https://github.com/CityOfNewYork/patterns-cli#custom-commands) that extend the Patterns CLI are stored in the [**./bin**](bin) directory.

#### CDN Path

The path to the content CDN is stored in the [**package.json**](package.json). This is where the `content` branch is mapped to the `production` and the `drafts` branch is mapped to `development`.

### Migrate changes back to `main`

After changes are made, create a pull request to migrate changes from your feature branch back into `env/development`. When the changes are approved by another developer create a merge commit or **squash and merge** (preferably squash for feature branches). Create and merge/squash another pull request from `env/development` into `main`.

### Publishing

The public-facing site (and drafts directory for content managers) is published from the [**./dist**](dist) directory to the `gh-pages` branch of this repository. To publish changes check out the `main` branch. Tag the repository with the latest version using the `npm version {{ major / minor / patch }}` command. For example;

```console
$ npm version minor
```

Then run the `ghpages` npm script build in production mode and then deploy to the GitHub Pages site.

```console
$ npm run ghpages
```

## Content Management

The API guide content is managed in the `content` branch using Markdown files. To edit these files and move them from draft to published follow these instructions;

### Drafting Content

Content is drafted in the `drafts` branch.

1. **Viewing files**. View the [table of contents in the `drafts` README file](https://github.com/CityOfNewYork/screeningapi-docs/blob/drafts/README.md) to find a link to each page's content source.

1. **Editing files**. When you are on the file's page you will see the rendered Markdown preview. Click the pencil icon in the top right corner, just above the preview. Once you are in edit mode you can make and preview changes using [GitHub Flavored Markdown syntax](https://guides.github.com/features/mastering-markdown/). View GitHub's [guide on editing files in GitHub to learn more](https://docs.github.com/en/github/managing-files-in-a-repository/editing-files-in-your-repository).

1. **Commit changes**. When you are done making changes you will commit your changes with a message reflecting the scope of the change. The commit description underneath the message is optional. Commit directly to the `drafts` branch.

### Preview

You can now view drafted changes in the site in the [drafts](https://screeningapidocs.cityofnewyork.us/drafts) directory on the public site.

### Creating a Pull Request for Review

When you are done drafting changes create a new pull request to stage changes from the `drafts` branch to the `content` branch.

1. Create a new pull request by going to [./compare](https://github.com/CityOfNewYork/screeningapi-docs/compare) or go to the **Pull Requests** tab at the top of the repository page then click **New pull request**.

1. In the **Compare changes** page change the base branch from `base:main` to `content` and the compare branch from `compare:main` branch to `drafts`.

1. You will be able to see a preview of the changes in your pull request. Click **Create pull request** to create a title, description, and add reviewers. View GitHub's [guide on creating pull requests to learn more](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

1. Click **Create pull request** again in the next view to make the pull request.

### Publishing Content

Once the pull request is approved changes are ready to be published. Click **Merge pull request**. The content will be live.

---

<p><img src="nyco-civic-tech.blue@2x.png" width="300" alt="The Mayor's Office for Economic Opportunity Civic Tech"></p>

[The Mayor's Office for Economic Opportunity](http://nyc.gov/opportunity) is committed to sharing open source software that we use in our products. Feel free to ask questions and share feedback. **Interested in contributing?** See our open positions on [buildwithnyc.github.io](http://buildwithnyc.github.io/). Follow our team on GitHub [@nycopportunity](https://github.com/orgs/NYCOpportunity) and [@cityofnewyork:nycopportunity](https://github.com/orgs/CityOfNewYork/teams/nycopportunity) or [browse our work on Github](https://github.com/search?q=nycopportunity).
