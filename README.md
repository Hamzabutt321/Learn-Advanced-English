# EnglishPath

A free English-learning website for beginners: lessons with audio, a quiz, and an AI Guide.

## Publish on GitHub Pages
1. Create a new repository on GitHub (for example `english-path`).
2. Upload all files from this folder: `index.html`, `style.css`, `app.js`, `config.js`, `README.md`.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
5. After a minute your site is live at `https://YOUR-USERNAME.github.io/english-path/`.

## Add more lessons
Open `app.js` and add words to `LESSONS`: `["English", "Roman Urdu meaning", "Example sentence"]`.

## Use a real AI (optional)
The built-in Guide works without a server. To connect a real AI, set `AI_ENDPOINT` in `config.js` to your own backend.
Never put a secret API key in these files: anyone can read them on GitHub.

## Connect the real AI Guide (Cloudflare Workers, free plan)
1. Create an Anthropic API key at console.anthropic.com (usage is paid, billed per use).
2. Sign up at cloudflare.com, then go to **Workers & Pages → Create → Create Worker**.
3. Open the Worker, click **Edit code**, paste everything from `worker.js`, then **Deploy**.
4. In the Worker go to **Settings → Variables and Secrets** and add:
   - `ANTHROPIC_API_KEY` (type: Secret) = your key
   - `ALLOWED_ORIGIN` (type: Text) = `https://YOUR-USERNAME.github.io` (so only your site can use it)
5. Copy the Worker URL (like `https://english-guide.YOURNAME.workers.dev`) and paste it in `config.js`:
   `window.AI_ENDPOINT = "https://english-guide.YOURNAME.workers.dev";`
6. Commit the change on GitHub. The Guide now answers any English question.

To control cost, set a spending limit in the Anthropic console. If the Worker is down, the website automatically uses the built-in Guide.
