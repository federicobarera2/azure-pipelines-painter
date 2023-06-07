# Introduction

Work in progress for an extension to draw azure devops pipelines in vscode while coding them.

WIP: Code re-org in yarn namespaces

# Install

```
yarn
```

# Run example

```
node dist\index.js examples\test.yaml > out.json
cat out.json
```

# WIP

## Frontend
- ~~Add draw interface~~
- Add [dependsOn] drawing
- Add template type found in drawing template
- Add frontend file resolution
- Currently sub templates are only resolvable locally on file system. When referencing a resource (which we won't have offline), we need to implement a trickery to point the @resource to a local folder and/or implement a template resolver for remote resources?


## Local Parser

- Local lexer, deal with all devops keywords
- Local parser, deal with all possible pipeline flows ( each, etc)
- Gonna have to deal with extend

# Remote Parser

- NEW: Add ability to use the API provided by Azure as an alternative (but likely default one), way of compile the template
