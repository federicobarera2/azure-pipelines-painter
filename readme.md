# Introduction

Work in progress for an extension to draw azure devops pipelines in vscode while coding them

# Install

```
npm i
npm run build
```

# Run example

```
node dist\index.js examples\test.yaml > out.json
cat out.json
```

# WIP

- Local lexer, deal with all devops keywords
- Local parser, deal with all possible pipeline flows ( each, etc)
- Add draw interface
- Currently sub templates are only resolvable locally on file system. When referencing a resource (which we won't have offline), we need to implement a trickery to point the @resource to a local folder and/or implement a template resolver for remote resources?
- Gonna have to deal with extend
- NEW: Add ability to use the API provided by Azure as an alternative (but likely default one), way of compile the template
