# GitHub Profile Analyzer

Enter any GitHub username and instantly see a breakdown of their profile — language distribution, top repositories, push activity, and a developer personality tag based on their most-used languages. Switch to Compare mode to analyze two users side by side.

## Features

- **Language breakdown** — segmented bar chart showing language distribution across all public repos
- **Developer personality** — automatically tagged based on top language (e.g. Data & AI Nerd, Web Builder)
- **Top repositories** — sorted by stars, with description, language, and fork count
- **Push activity** — bar chart of commit activity over the last 7 days
- **Compare mode** — analyze two GitHub users side by side

## Tech Stack

- Vanilla JavaScript (no frameworks, no libraries)
- GitHub REST API v3 (no API key required for public endpoints)
- HTML/CSS

## What I Learned

- `fetch` and `async/await` for handling asynchronous API requests
- `Promise.all()` to fire multiple requests simultaneously
- Working with paginated API responses
- Dynamic DOM rendering with template literals
- Data aggregation and sorting in JavaScript

## Run Locally

No build step needed. Clone the repo and open `index.html` in your browser or with Live Server in VS Code.

```bash
git clone https://github.com/edub966/github-profile-analyzer.git
cd github-profile-analyzer
```

Then open `index.html` with Live Server or just double-click it.

## Rate Limits

GitHub's public API allows 60 unauthenticated requests per hour per IP. For higher limits, you can add a personal access token to the request headers.
