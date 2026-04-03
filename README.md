# MFProject

## Indian Mutual Fund Portfolio Dashboard

A React-based dashboard that uses `mfapi.in` to fetch Indian mutual fund schemes and NAV history.

### Prerequisites

- Node.js (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)

### Setup

1. Install dependencies:
   - `npm install`

### Run

- `npm start`

### Deploy to GitHub Pages

1. Ensure repository is pushed to GitHub at `https://github.com/<username>/<repo>` (e.g. `DevankNassa/MFProject`).
2. `npm run deploy`
3. Open `https://<username>.github.io/<repo>` (e.g. `https://DevankNassa.github.io/MFProject`).

> Note: In `package.json`, `homepage` should match this URL and deployment uses `gh-pages`.

### How it works

- Calls `https://mfapi.in/mf` to load scheme list
- `https://mfapi.in/mf/<scheme_code>` to load historical NAV
- Sidebar search and multi-select for funds
- Portfolio snapshot + NAV trend charts
- Responsive design with charts using Recharts

### Tech Stack

- React 18
- Axios for API calls
- Recharts for data visualization
- CSS for styling
