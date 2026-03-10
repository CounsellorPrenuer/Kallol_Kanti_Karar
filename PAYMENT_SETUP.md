# Payment Setup Guide

This guide will help you deploy the Cloudflare Worker and connect it to your Razorypay account for processing payments.

## Prerequisites
1.  **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com) and get your **Key ID** and **Key Secret** from the Settings > API Keys section.
2.  **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com).
3.  **Wrangler installed**: `npm install -g wrangler` (optional, you can use `npx wrangler`).

## Step 1: Deploy the Worker

Navigate to the `payment-worker` directory and deploy the worker to Cloudflare:

```bash
cd payment-worker
npm install
npx wrangler deploy
```

Take note of the **URL** provided at the end of the deployment (e.g., `https://kallol-payment-worker.yourprofile.workers.dev`).

## Step 2: Configure Secrets

You need to store your Razorpay API keys as secrets in Cloudflare. Run these commands and enter your keys when prompted:

```bash
npx wrangler secret put RAZORPAY_KEY_ID
# Enter your Razorpay Key ID
```

```bash
npx wrangler secret put RAZORPAY_KEY_SECRET
# Enter your Razorpay Key Secret
```

## Step 3: Update Frontend

1.  Open `components/sections/ContactSection.tsx`.
2.  Find the `WORKER_URL` constant near the top of the file:
    ```javascript
    const WORKER_URL = 'https://kallol-payment-worker.yourprofile.workers.dev'
    ```
3.  Replace the URL with your actual deployed worker URL from Step 1.
4.  Push your changes to GitHub to update the live site.

## Troubleshooting

- **CORS Error**: Ensure that the `corsHeaders` in `payment-worker/src/index.js` allow the domain where your frontend is hosted.
- **Failed to Fetch**: This usually means the `WORKER_URL` is incorrect or the worker is not deployed.
- **Invalid Key ID**: Double-check that your Razorpay keys are correct and set as wrangler secrets.
