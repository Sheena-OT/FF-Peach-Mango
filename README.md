# Fibre Flow — Peach Mango Launch Timeline

Interactive Gantt chart for the Fibre Flow Peach Mango product launch.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import from GitHub
3. Select the repo — Vercel auto-detects React, no config needed
4. Click Deploy → done ✓

## Run locally

```bash
npm install
npm start
```

## Update the dashboard

All task data is in `src/App.jsx` in the `PHASES` array near the top of the file.
To update a due date, owner, or status — edit the relevant task object and push to GitHub.
Vercel will auto-redeploy within ~30 seconds.

## Share

Once deployed, paste the Vercel URL into:
- Slack canvas
- Notion page
- Email / anywhere

