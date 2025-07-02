# 🛡️ [CodeShield Web Platform](https://codeshield-web-prod-client.vercel.app/)

**CodeShield** is an **AI-powered cybersecurity tool** that helps developers **detect, analyze, and remediate software vulnerabilities in real time**—directly within their development workflow.

Imagine this: A flagship app is about to launch. Investors are excited, users are waiting, but a last-minute security audit fails—delaying the launch and risking millions. This scenario is more common than you think.

**CodeShield prevents this.**

With a powerful combination of real-time AI analysis, developer-first design, and seamless automation, CodeShield ensures cybersecurity is never a bottleneck. It includes three main components:

- **CodeShield Web** – centralized dashboard with team management, scans, AI recommendations, and insights
- **CodeShield Extension** – IDE-integrated plugin for instant vulnerability feedback
- **CodeShield CI/CD** – security scanning integration with DevOps pipelines

---

## 🧰 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React (Vite)                   |
| Backend      | Node.js + Express              |
| Cloud        | Firebase                       |
| AI Services  | Gemini, Snyk, Together AI       |
| Styling      | Tailwind CSS                   |
| Package Mgmt | npm                            |

---

## 📁 Project Structure

```

codeshield-web-prod/
│
├── client/               # Frontend (React + Vite)
│   ├── src/              # Source code (components, hooks, services, types, etc.)
│   └── .env              # Firebase environment variables
│
├── server/               # Backend (Node.js + Express)
│   ├── uploads/          # Uploaded scan results or files
│   └── .env              # API keys for Gemini, Snyk, Together AI
│
└── README.md

````

> ⚠️ This is a simplified representation to give developers an idea of the file structure.

---

## 🔐 Environment Variables

### 🌐 Frontend `.env`

Located in `/client/.env`, this should include your Firebase Web App credentials:

```env
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER=your_messaging_id
VITE_APP_ID=your_app_id
````

---

### 🛠️ Backend `.env`

Located in `/server/.env`, this includes tokens for external AI and security services:

```env
SNYK_TOKEN=your_snyk_api_key
TOGETHER_API_KEY=your_together_ai_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## ✅ Prerequisites

Ensure the following are installed:

* [Node.js](https://nodejs.org/) (v16 or above)
* npm
* Git

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://gitfront.io/r/CodeShield/XbjoF1jQGSFy/codeshield-web-prod/
cd codeshield-web-prod

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

---

## ▶️ Running the Application

Open two terminal windows to run both frontend and backend.

### Frontend

```bash
cd client
npm run dev
```

Runs at: [http://localhost:5173](http://localhost:5173)

### Backend

```bash
cd server
node server.js
```

Runs at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Usage Guidelines

* Ensure both frontend and backend are running
* Setup proper `.env` variables for Firebase and APIs
* Log in via Google and access the dashboard
* Scan your repository, view vulnerabilities, use AI recommendation and rewriting
* Try out our conversational AI and secure code generator
* Visualize past trends and team activity via dashboard
* Collaborate and gamify your secure development experience

---

> Built with ♥ by the CodeShield Team
