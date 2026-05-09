# 🚀 Vercel Deployment Guide (Nested Folder)

Since your project is located in a nested directory (`Week-3/StakingDApp`) within your `Blockchain` repository, follow these specific steps to deploy correctly on Vercel.

### 1. Connect to Vercel
1.  Go to [Vercel.com](https://vercel.com) and click **"Add New"** -> **"Project"**.
2.  Connect your GitHub account and select the **`Blockchain`** repository.

### 2. Configure Root Directory (CRITICAL)
In the **Configure Project** screen, look for the **"Root Directory"** setting:
1.  Click the **"Edit"** button next to the Root Directory.
2.  Navigate into the folders: `Week-3` -> `StakingDApp`.
3.  Click **"Select"**.
    *   *Vercel will now only look inside this folder for the `package.json` and build scripts.*

### 3. Framework Preset
*   Vercel should automatically detect **"Vite"** as the framework.
*   The build command should be `npm run build`.
*   The output directory should be `dist`.

### 4. Deploy
Click the **"Deploy"** button. Vercel will:
1.  Clone only the necessary part of the repo.
2.  Install dependencies (`ethers`, `framer-motion`, `react-hot-toast`).
3.  Build the production bundle.
4.  Provide you with a live URL (e.g., `scai-staking-abc.vercel.app`).

### 5. Update your Submission
Once you have the live URL:
1.  Copy the URL.
2.  Add it to your GitHub README under the **"Live Demo"** section.
3.  Submit the URL to your evaluator.

---

## 🛠️ Troubleshooting
*   **Error: No `package.json` found**: This means you didn't select the correct Root Directory in Step 2.
*   **White screen after deploy**: Ensure your `vite.config.js` does not have a hardcoded base path that conflicts with Vercel's root. (The current config is correct).
