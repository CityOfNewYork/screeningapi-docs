# NYC Benefits Screening API Documentation

Documentation site for NYC Benefits Screening API maintained by [NYC Opportunity](https://github.com/NYCOpportunity). To learn more about the API view the live documentation at [screeningapidocs.cityofnewyork.us](https://screeningapidocs.cityofnewyork.us).

1. [Updating the Static Site Front-end](#updating-the-static-site-front-end)
2. [Content Management](#content-management)

## Updating the Static Site Front-end

Clone this repository and install dependencies by running the following command;

```console
$ npm i
```

Then start the development server and asset watcher;

```console
$ npm start
```

This will watch for changes to specific files in the [**./src**](src) directory (the CLI will print the globing patterns that are being watched). It will also set the `NODE_ENV` to `development` which tells the application front-end to pull content in Markdown files from the [drafting content branch](https://github.com/CityOfNewYork/screeningapi-docs/tree/content/draft) of this repository. To view live content in the [published content branch](https://github.com/CityOfNewYork/screeningapi-docs/tree/content) use the following command;

```console
$ npm run production
```

This will set the `NODE_ENV` to `production` but run the same development server and asset watcher.

### Patterns CLI

The site uses the [Patterns CLI](https://github.com/CityOfNewYork/patterns-cli), also maintained by [NYC Opportunity](https://github.com/NYCOpportunity), to build assets from the [**./src**](src) directory to the [**./dist**](dist) directory. All of [the commands from the CLI](https://github.com/CityOfNewYork/patterns-cli#commands) are available for compiling different asset types. It uses the [Patterns Twig Plugin](https://github.com/CityOfNewYork/patterns-plugin-twig) in place of the Slm Lang compiler for templating.

### Publishing

The live documentation site is published from the [**./dist**](dist) directory to the GitHub Pages branch of this repository. To publish changes run the `ghpages` npm script of this package.

```console
$ npm run ghpages
```

The project will build in production mode and then deploy to the GitHub Pages site.

## Content Management

The API guide content is managed in the `content` branch using Markdown files. To edit these files and move them from draft to published follow these instructions;

### Drafting Content

Content is drafted in the `content/draft` branch.

1. **Viewing files**. View the [table of contents in the content README file](https://github.com/CityOfNewYork/screeningapi-docs/blob/content/README.md) to find a link to each page's content source.
1. **Editing files**. When you are on the file's page you will see the rendered Markdown preview. Click the pencil icon in top right corner, just above the preview. Once you are in edit mode you can make and preview changes using [GitHub Flavored Markdown syntax](https://guides.github.com/features/mastering-markdown/). View GitHub's [guide on editing files in GitHub to learn more](https://docs.github.com/en/github/managing-files-in-a-repository/editing-files-in-your-repository).
1. **Commit changes**. When you are done making changes you will commit your changes with a message reflecting the scope of the change. The commit description underneath the message is optional. Preferably, commit directly to the `content/draft` branch.

### Creating a Pull Request for Review

When you are done drafting changes create a new pull request to stage changes from the `content/draft` branch to the `content` branch.

1. Create a new pull request by going to [./compare](https://github.com/CityOfNewYork/screeningapi-docs/compare) or go to the **Pull Requests** tab at the top of the repository page then click **New pull request**.
1. In the **Compare changes** page change the base branch from `base:main` to `content` and the compare branch from `compare:main` branch to `content/draft`.
1. You will be able to see a preview of the changes in your pull request. Click **Create pull request** to create a title, description, and add reviewers. View GitHub's [guide on creating pull requests to learn more](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).
1. Click **Create pull request** again in the next view to make the pull request.

### Publishing Content

Once the pull request is approved changes are ready to be published. Click **Merge pull request**.
