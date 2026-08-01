# BCSITHub - Pokhara University BCSIT Student Portal

BCSITHub is a complete, feature-rich academic portal designed specifically for Pokhara University **BCSIT (Bachelor of Computer Science & Information Technology)** students. The platform centralizes study resources, syllabus trackers, past exam papers, and modern study utilities to enhance the learning and exam preparation experience.

---

## 🏗️ System Architecture

The project is structured as a monorepo with distinct separation between the frontend interface and the backend server:

```
BCSITHub/ (Root)
├── frontend/                 # React SPA (TypeScript, Vite, Tailwind CSS)
└── backend/                  # REST API Server (Python, FastAPI, Supabase client)
```

- **Frontend**: A highly responsive Single Page Application (SPA) utilizing Framer Motion for premium animations, Tailwind CSS for styling, and Lucide React icons.
- **Backend API**: A high-performance Python server built with FastAPI. It handles business logic, proxies file uploads, and validates user access.
- **Database & Storage**: Powered by Supabase (PostgreSQL database for relations, and Supabase Storage for past papers and notices).

---

## 🛠️ Setup & Local Development

### 1. Database Setup (Supabase)
1. Register/Login to [Supabase Console](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in your Supabase project, copy the content from [`backend/schema.sql`](backend/schema.sql), paste it, and run it. This creates the SQL schema, triggers, and Row-Level Security (RLS) policies.
4. Open the **Storage** tab and create two new **Public** buckets:
   - `past-papers`
   - `notices`

---

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-random-jwt-secret-string
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend dev server:
   ```bash
   python run.py
   ```
   *The Swagger UI documentation will be available at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Copy `.env.example` to `.env` and add the backend API endpoint:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_QUIZ_API_KEY=your-quizapi-io-key  # Optional
   ```
3. Install node dependencies:
   ```bash
   npm install
   ```
4. Run the frontend dev server:
   ```bash
   npm run dev
   ```

---

## 🚀 Key Features

1. **Chapter Notes & solved past questions**: Organized semestr-wise (1-8 semesters) with offline-first PWA caching support for smooth access.
2. **SGPA/CGPA Calculator**: Customized according to Pokhara University credit system and grade guidelines.
3. **Academic Toolkits**: Built-in Pomodoro focus timer, multi-language Online Code Compiler, and AI practice exam Quiz Generator.
4. **PU Notices**: Real-time official Pokhara University exam notifications, results, and admission calls.
5. **Dashboard Roles**: Separate student dashboards, teacher review panels, and administrator approval panels.
