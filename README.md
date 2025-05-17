# EduPair 📘

EduPair is a minimalist VSCode extension built for academic use, allowing instructors to generate both student and solution versions of a Jupyter notebook from a single annotated source. By marking specific lines or blocks of code with lightweight comments (e.g., # HIDE, # HIDE-INLINE, # BEGIN HIDE), EduPair automatically produces two clean variants: one for students with code replaced by placeholders like `...`, and one full solution version.

EduPair was developed in just a few hours to support a specific academic need. While I've aimed to follow good development practices, this is a minimal prototype intended to serve a narrow purpose. It’s a small utility built to streamline my own workflow, and it's provided as-is, with no guarantees beyond that.

## Features

## Requirements

## Extension Settings

## Known Issues

## Release Notes


### 0.1.0

Initial release, it can generate student and solution notebook based on an annotated master notebook.


## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Compile the Extension

```
npm run compile                                                                            
vsce package
```

## Install Extension

Use VSCode command (ctrl+shift+p): "Extensions: Install from VSIX..."