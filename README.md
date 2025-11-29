# 📌 Anime Watchlist Manager

A personal self-hosted web application to organize your anime watchlist with category stages, tags, search, anime details, and full CRUD functionality.

Built for **local use**, with a clean **dark UI**, responsive layout, and **MongoDB cloud storage** for persistence.

---

## 🚀 Features

| Feature                                                  | Status |
| -------------------------------------------------------- | ------ |
| Plan to Watch / Watching / Completed / On Hold / Dropped | ✅      |
| Custom list categories in Settings                       | ✅      |
| Anime CRUD (Add, Edit, View, Delete)                     | ✅      |
| Tags (checkbox support & multi-tag search)               | ✅      |
| Dub/Sub toggle                                           | ✅      |
| Anime cards with pagination                              | ✅      |
| Prequel / Sequel linking                                 | ✅      |
| Search (global name search + tag filters)                | ✅      |
| Import / Export full DB to JSON                          | ✅      |
| Sidebar collapse / expand with icons                     | ✅      |
| Production launch without console window                 | ✅      |

---

## 🛠 Tech Stack

| Layer           | Technology                |
| --------------- | ------------------------- |
| Frontend        | React (Vite) + Custom CSS |
| Backend         | Node.js + Express         |
| Database        | MongoDB Atlas             |
| Package Manager | npm                       |
| Deployment Type | Local — desktop usage     |

---

## 📂 Project Structure (simplified)

```
anime-watchlist/
│ README.md
│ package.json
│ run_app_hidden.vbs
│ start_app.bat
│ stop_app.bat
│
├─ backend/
│  ├─ src/
│  │  ├─ server.js       ← Serves APIs + frontend build
│  │  ├─ models/
│  │  ├─ controllers/
│  │  └─ routes/
│  ├─ package.json
│  └─ .env   ← contains MongoDB URI + PORT
│
├─ frontend/
│  ├─ src/
│  ├─ public/
│  │   └─ favicon.png
│  ├─ dist/              ← Created after npm run build
│  ├─ index.html
│  └─ package.json
```

---

## 🔧 1. Install Dependencies (first time only)

Open terminal in project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## 🌐 2. Configure Database

Copy `.env.example` → `.env` inside `/backend` and set:

```
MONGODB_URI=YOUR_MONGODB_ATLAS_URL
PORT=5000
```

---

## 🧪 3. Development Mode (optional for coding)

```bash
npm run dev
```

Runs **backend + Vite frontend together**.
Hot reload / debugging available.

---

## 📦 4. Build for Production (only after code changes)

```bash
cd frontend
npm run build
```

This generates a static production bundle in:

```
frontend/dist/
```

---

## 🚀 5. Start Production App (with UI)

```bash
cd backend
node src/server.js
```

App becomes available at:

```
http://localhost:5000/
```

---

## 👻 6. Start App Invisibly (no console window)

For daily usage — runs in the background like a program.

Double-click:

```
run_app_hidden.vbs
```

✔ No terminal
✔ Server runs silently
✔ Browser can open `http://localhost:5000/`

To stop the app:

```
stop_app.bat
```

or kill `node.exe` from Task Manager.

---

## 🔁 Backup / Restore

Go to:

```
Settings → Backup & Restore
```

* **Export** — downloads a JSON file with all your data
* **Import** — replaces database completely using the JSON file

---

## 🎨 UI Tips

| UI Element   | Notes                                                 |
| ------------ | ----------------------------------------------------- |
| Sidebar      | Collapsed by default — toggle with hamburger          |
| Category Bar | Horizontal scroll when overflow                       |
| Cards        | 5 per row, pagination 10 rows/page                    |
| Detail Page  | Displays image, details, tags, rating, prequel/sequel |

---

## 🧱 Folder Notes

| Folder           | Meaning                            |
| ---------------- | ---------------------------------- |
| `/backend`       | API + server                       |
| `/frontend`      | React UI                           |
| `/frontend/dist` | Production build served by backend |
| `/public`        | favicon / images if needed         |

---

## ✨ Future Improvements (optional)

* User profile system
* MAL / AniList API import
* Watch progress tracker
* Episode history

---

## 💾 Local-Only App — Privacy First

✔ No telemetry
✔ No analytics
✔ Nothing stored on your PC except Node & your JSON backups
✔ MongoDB Atlas keeps your list safe