# gitfetch 🖥️

<p align="center">
  <img src="public/step-1.png" alt="gitfetch - Beautiful GitHub CLI" width="800"/>
</p>

A beautiful, interactive CLI tool to browse and download GitHub repositories. Built with love for developers who prefer the terminal.

---

## ✨ Features

- **Beautiful TUI** - Stunning ASCII art logo with a modern, centered interface
- **Interactive File Browser** - Navigate repository file trees with arrow keys
- **File Selection** - Select specific files or entire folders with Space
- **Two Download Options**:
  - Clone entire repository with git
  - Download only selected files
- **Keyboard Navigation**:
  - `↑/↓` - Navigate files
  - `Space` - Select/deselect files
  - `Enter` - Open folders
  - `Esc` - Go back
  - `Ctrl+A` - Download all (clone)
  - `Ctrl+D` - Download selected files
  - `Ctrl+C` - Exit

---

## 🚀 Installation

```bash
# Using npx (no installation needed)
npx gitfetch

# Or install globally
npm install -g gitfetch-cli
gitfetch
```

---

## 📖 Usage

### 1. Launch the CLI

```bash
npx gitfetch
```

<p align="center">
  <img src="public/step-1.png" alt="Input Screen" width="800"/>
</p>

### 2. Enter a GitHub Repository URL

Type or paste a GitHub URL, for example:
- `facebook/react`
- `https://github.com/microsoft/vscode`
- `owner/repo`

Press **Enter** to fetch the repository.

<p align="center">
  <img src="public/step-2.png" alt="Loading" width="800"/>
</p>

### 3. Browse Files

Use arrow keys to navigate the file tree:
- `↑/↓` to move
- `Space` to select files
- `Enter` to open folders
- `Esc` to go back

<p align="center">
  <img src="public/step-3.png" alt="File Browser" width="800"/>
</p>

### 4. Download

Choose your download option:
- **`Ctrl+A`** - Clone the entire repository (uses git)
- **`Ctrl+D`** - Download only selected files

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate files |
| `Space` | Select/deselect file |
| `Enter` | Open folder |
| `Esc` | Go to parent folder |
| `Ctrl+A` | Clone entire repo |
| `Ctrl+D` | Download selected files |
| `Ctrl+C` | Exit |

---

## 🔧 Requirements

- **Node.js** 18+
- **Git** (for cloning repositories)
- **Windows Terminal** or **iTerm2** (macOS) / **gnome-terminal** (Linux)

---

## 🌐 Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Your GitHub personal access token (to avoid rate limits) |

### Setting up GitHub Token (Optional)

If you hit GitHub API rate limits, create a personal access token:

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Generate a new token (classic)
3. Set it as an environment variable:

```bash
# Windows
set GITHUB_TOKEN=your_token_here
gitfetch

# Linux/macOS
export GITHUB_TOKEN=your_token_here
gitfetch
```

---

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/yourusername/gitfetch-cli.git
cd gitfetch-cli

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
# or
node dist/index.js
```

---

## 📝 License

MIT License - feel free to use and modify!

---

## 🙏 Acknowledgments

- [Ink](https://github.com/vadimdemedes/ink) - TUI framework inspiration
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- All contributors and users!

---

<p align="center">
  Made with ❤️ for developers who ❤️ the terminal
</p>
