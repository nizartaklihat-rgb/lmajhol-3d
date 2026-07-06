# LMAJHOL — 3D Premium E-Commerce

## Setup rapido (5 minuta)

### 1. Telegram Bot
1. Open Telegram, search `@BotFather`
2. Send `/newbot`, name it `LMAJHOL Orders`
3. Copy the **Bot Token** (looks like `123456:ABC-DEF...`)
4. Send any message to your bot, then open: `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Find your **Chat ID** in the response (the `"id"` number)

### 2. Configure
Open `js/app.js` and replace:
```javascript
telegram: {
  botToken: 'YOUR_BOT_TOKEN',    // Paste your bot token
  chatId: 'YOUR_CHAT_ID',        // Paste your chat ID
},
adminPassword: 'lmajhol2025',     // Change this password!
```

### 3. Deploy to Netlify

**Option A: GitHub (Recommended)**
1. Create a GitHub repo and upload all files
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repo
4. In Site Settings → Environment Variables, add:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_CHAT_ID` = your chat ID
5. Deploy!

**Option B: Drag & Drop**
1. Go to [netlify.com](https://netlify.com) → "Add new site" → "Deploy manually"
2. Drag the entire `lmajhol` folder
3. Note: Telegram function won't work without environment variables (use direct API instead)

### 4. Admin Panel
Go to `your-site.netlify.app/admin.html`
- Password: `lmajhol2025` (change in both `js/app.js` AND `admin.html`)

---

## Project Structure
```
lmajhol/
├── index.html              # Main page (3D hero + products)
├── admin.html              # Admin panel (add/edit/delete products)
├── css/style.css           # All styles
├── js/app.js               # Three.js 3D + interactions + orders
├── data/products.json      # Product catalog
├── images/
│   ├── logo-white.png      # Brand logo
│   ├── hero-bg.jpg         # Hero background
│   ├── hero-bg-white.jpg   # Hero background (white tee)
│   ├── about-bg.jpg        # About section image
│   └── products/           # Product photos
├── netlify/
│   └── functions/
│       └── send-order.js   # Telegram order notification
├── netlify.toml            # Netlify config
└── _redirects              # Netlify redirects
```

## How Orders Work
1. Customer clicks a product → fills the order form
2. Form data is sent to your Telegram bot via Netlify Function
3. You receive a formatted message with all order details
4. You call the customer to confirm + arrange delivery (COD)

## Admin Workflow
1. Go to `/admin.html`, enter password
2. Add/edit/delete products with images
3. Click "Exporter JSON" to download products.json
4. Upload to your GitHub repo → Netlify auto-deploys

OR: Click "Publier sur le site" → copies JSON → paste into `data/products.json` on GitHub

## Customization
- **Colors**: Edit CSS variables in `style.css` (`:root` section)
- **Logo**: Replace `images/logo-white.png`
- **Products**: Edit via admin panel or directly in `data/products.json`
- **Password**: Change in BOTH `js/app.js` line 14 AND `admin.html` line ~160
