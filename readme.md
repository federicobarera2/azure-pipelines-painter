# Introduction

Work in progress for an extension to draw azure devops pipelines in vscode while coding them.

# Dependencies & Install

```
npm i -g yarn
corepack enable

yarn
```

# Run Local GUI

```
#terminal 1
cd ./packages/common
yarn dev

#terminal 2
cd ./packages/viz2
yarn dev
```
> Debug via `Next.js: debug server-side` launch

## Get Started with the GUI

1. Paste the content of `docs/examples/test.yaml` in the top right editor
2. Set `__root` parameter to the absolute path of the repo on your project
3. You can start experiment and provide sub-templates to render as part of parameters. (eg. add `subTemplate: ./docs/examples/test2` and `subTemplate2: test3` )
4. Click on the nodes to see the rendered jobs/steps

# Run CLI

```
#terminal 1
cd ./packages/common
yarn dev

#terminal 2
cd ./packages/console
yarn dev

#terminal 3
cd ./packages/console
node dist/index ../../docs/examples/test.yaml

```
> Debug via `Launch Console` launch


# Packages

## Root

- ~~Re-org in yarn namespaces~~

## Frontend
- ~~Add draw interface~~
- Add [dependsOn] drawing
- Add drawing for templates nested steps/jobs/
- ~~Add frontend file resolution~~ (not possible)
- ~~Add raw content resolution~~
- Add open from file
- Add Resource panel

## Local Parser

- Local lexer, deal with all devops keywords/functions
    - ~~eq~~
    - ~~ne~~
    - ~~lt~~
    - ~~lte~~
    - ~~gt~~
    - ~~gte~~
    - ~~and~~
    - ~~or~~
    - ~~not~~
    - ~~true~~
    - ~~false~~
    - ~~add~~
    - ~~sub~~
    - ~~mul~~
    - ~~div~~
    - ~~mod~~
    - ~~coalesce~~
    - ~~in~~
    - ~~notIn~~
    - add from docs
- Local parser, deal with all possible pipeline flows:
    - ~~each~~
    - ~~if~~
    - ~~elseif~~
    - ~~else~~
    - ~~insert~~
    - add from docs
- Resolve pipelines using `extend`
- Add template resolution via resource

# Remote Parser

- NEW: Add ability to use the API provided by Azure as an alternative (but likely default one), way of compile the template
