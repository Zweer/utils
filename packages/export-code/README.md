# Export Code

[![npm version](https://img.shields.io/npm/v/@zweer/export-code.svg?style=flat)](https://www.npmjs.com/package/@zweer/export-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool to consolidate your entire project's source code into a single, well-formatted text file. Ideal for providing context to Large Language Models (LLMs) like GPT-4, Claude, or for creating a simple project archive.

## 🤔 Why?

When working with AI models, you often need to provide the full context of your codebase. Copy-pasting dozens of files is tedious and loses the file structure. This tool automates that process, creating a single file that is easy to copy and paste into an AI prompt.

## ✨ Features

- Exports all text-based files from your repository.
- Ignores files and directories listed in your `.gitignore` by default.
- Clearly separates each file's content with its path.
- Simple, zero-dependency execution.

## 📦 Installation

You can install the package globally:
```bash
npm install -g @zweer/export-code
```
Or use it directly with `npx` for on-the-fly execution:
```bash
npx @zweer/export-code --help
```

## 🚀 Usage

Navigate to the root directory of your project and run the command, specifying the output file:

```bash
npx export-code project-context.md
```

If you don't specify an output file, it will default to `docs/EXPORT.md`.

### Output Format

The generated file will have a structure like this, making it easy for both humans and AI to read:

`````markdown
# EXPORT

## File structure

```
export-code
 ├── .editorconfig
 ├── .env
 ├─> .husky
 │   └── pre-commit
 ├─> .vscode
 │   └── settings.json
 └── README.md
```

## File export

`src/index.js`:

```javascript
console.log("Hello, World!");
```

---

`src/utils.js`:
```javascript
export const a = () => {
  return 'a';
};
```

---

`package.json`:
```json
{
  "name": "my-project",
  "version": "1.0.0"
}
```
`````

## 🛠️ Options & Configuration

### Command-Line Arguments

| Argument | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `[outputFile]` | The path where the final text file will be saved. | `docs/EXPORT.md`| No |

### Ignoring Files

By default, `export-code` respects the rules found in your project's `.gitignore` file. It will automatically skip `node_modules`, build artifacts, and other ignored files.

**Future Work:** A `--ignore` flag is planned to allow for additional custom ignore patterns directly from the command line.

## 📄 License

Licensed under the MIT License.
