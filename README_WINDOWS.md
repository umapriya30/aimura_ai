# Aimura AI Windows Setup

Use this when copying the project folder to a Windows PC.

## Requirements

- Windows 10 or later
- Node.js LTS from `https://nodejs.org`
- npm, which comes with Node.js

## One-Command Launch

1. Copy the full project folder to the Windows PC.
2. Open the folder.
3. Double-click:

```text
open_aimura_windows.bat
```

The launcher will:

- install web dependencies if `node_modules` is missing
- open the project folder
- start the Next.js app on the first free port from `3000`
- open Aimura AI in the default browser when ready

## Manual Launch

Open Command Prompt or PowerShell in the project folder and run:

```powershell
npm install
npm run dev -- --port 3000
```

Then open:

```text
http://localhost:3000
```

## Copying Between Computers

Do not depend on copied dependency folders. If the app does not start, delete these folders and reinstall:

```text
node_modules
.next
```

Then run:

```powershell
npm install
npm run dev -- --port 3000
```

## Optional Python Prototype

The main interface is the Next.js app. The older Streamlit prototype can still be run on Windows:

```powershell
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

## Troubleshooting

- If `npm` is not recognised, reinstall Node.js LTS and tick the option that adds Node to PATH.
- If port `3000` is busy, the launcher will choose the next free port automatically.
- If the browser does not open, look in the terminal for the local URL and open it manually.
