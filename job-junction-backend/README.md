# Job Junction - Backend (MySQL + Sequelize)

A Node.js + Express + **MySQL** (Sequelize ORM) backend for Job Junction, a Nokri.com clone.

---

## Project Structure

```
job-junction-backend/
├── app.js                          # Entry point
├── .env.example                    # Copy to .env and fill in values
├── package.json
├── config/
│   └── db.js                       # Sequelize instance
├── database/
│   ├── schema.sql                  # Raw SQL (run manually if you prefer)
│   └── sync.js                     # npm run db:sync — auto-creates tables
├── models/
│   ├── index.js                    # Loads all models + defines associations
│   ├── user.model.js
│   ├── jobSeekerProfile.model.js   # Includes completeness scoring hook
│   ├── employerProfile.model.js
│   ├── job.model.js
│   └── application.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── jobSeeker.controller.js
│   ├── employer.controller.js
│   ├── job.controller.js
│   ├── application.controller.js
│   └── admin.controller.js
├── routes/                         # One file per controller
├── middlewares/
│   └── auth.middleware.js          # attachUser + authorize(role)
├── helpers/
│   ├── jwt.helper.js
│   └── multer.helper.js
└── uploads/
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — fill in DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT secrets

# 3. Create MySQL database
mysql -u root -p -e "CREATE DATABASE job_junction;"

# 4. Sync tables (Sequelize auto-creates all tables)
npm run db:sync

# 5. Start dev server
npm run dev
```

> **Alternative:** Run `database/schema.sql` directly in MySQL Workbench or CLI instead of step 4.

---

## Database Tables

| Table                  | Description                              |
|------------------------|------------------------------------------|
| `users`                | All users — seekers, employers, admin    |
| `job_seeker_profiles`  | Seeker profile with completeness score   |
| `employer_profiles`    | Company profile                          |
| `jobs`                 | Job listings                             |
| `applications`         | Applications linking seekers ↔ jobs      |

---

## Roles & Permissions

| Role        | Can do                                              |
|-------------|-----------------------------------------------------|
| `job_seeker`| Register, build profile, apply to jobs              |
| `employer`  | Post/manage jobs, view applicants, update status    |
| `admin`     | Full visibility, verify employers, manage users     |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path             | Auth | Description          |
|--------|------------------|------|----------------------|
| POST   | /signup          | —    | Register             |
| POST   | /login           | —    | Login                |
| POST   | /refresh-token   | —    | Refresh token        |
| GET    | /profile         | ✅   | My user info         |
| PUT    | /change-password | ✅   | Change password      |

### Job Seeker — `/api/job-seeker`
| Method | Path               | Role        | Description           |
|--------|--------------------|-------------|-----------------------|
| GET    | /ranked            | public      | Profiles by score     |
| GET    | /:userId           | public      | Public profile        |
| GET    | /me/profile        | job_seeker  | My profile            |
| POST   | /me/profile        | job_seeker  | Create profile        |
| PUT    | /me/profile        | job_seeker  | Update profile        |
| PUT    | /me/education      | job_seeker  | Update education      |
| PUT    | /me/experience     | job_seeker  | Update experience     |

### Employer — `/api/employer`
| Method | Path         | Role     | Description        |
|--------|--------------|----------|--------------------|
| GET    | /:userId     | public   | Company page       |
| GET    | /me/profile  | employer | My company profile |
| POST   | /me/profile  | employer | Create profile     |
| PUT    | /me/profile  | employer | Update profile     |

### Jobs — `/api/jobs`
| Method | Path        | Role     | Description      |
|--------|-------------|----------|------------------|
| GET    | /           | public   | List/search jobs |
| GET    | /:id        | public   | Job detail       |
| POST   | /           | employer | Post a job       |
| GET    | /me/my-jobs | employer | My jobs          |
| PUT    | /:id        | employer | Update job       |
| DELETE | /:id        | employer | Delete job       |

### Applications — `/api/applications`
| Method | Path                 | Role       | Description              |
|--------|----------------------|------------|--------------------------|
| POST   | /:jobId/apply        | job_seeker | Apply to job             |
| GET    | /me/my-applications  | job_seeker | My applications          |
| PUT    | /:id/withdraw        | job_seeker | Withdraw application     |
| GET    | /job/:jobId          | employer   | Applicants for a job     |
| PUT    | /:id/status          | employer   | Update applicant status  |

### Admin — `/api/admin`
| Method | Path                         | Description            |
|--------|------------------------------|------------------------|
| GET    | /dashboard                   | Platform stats         |
| GET    | /users                       | All users              |
| PATCH  | /users/:userId/toggle-status | Activate/deactivate    |
| GET    | /jobs                        | All jobs               |
| PATCH  | /employers/:userId/verify    | Verify employer        |
| GET    | /top-job-seekers             | Ranked seekers         |

---

## Profile Completeness Scoring

Computed automatically on every profile save via a Sequelize `beforeSave` hook.

| Field             | Weight |
|-------------------|--------|
| Headline          | 10%    |
| Bio               | 10%    |
| Profile Picture   | 10%    |
| Resume            | 15%    |
| Skills (≥ 3)      | 15%    |
| Education (≥ 1)   | 15%    |
| Experience (≥ 1)  | 15%    |
| Location          | 5%     |
| Expected Salary   | 5%     |

**Tiers:** `bronze` (0–39) → `silver` (40–69) → `gold` (70–89) → `platinum` (90–100)
