# Introduction

Work in progress for an extension to draw azure devops pipelines in vscode while coding them.

# Dependencies & Install

```
npm i -g yarn
yarn plugin import workspace-tools

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
