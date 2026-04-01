# 🚀 Call Monitoring & Analytics System (WIP)

## 📌 Project Status

> ⚠️ This project is currently **under active development**
> Core APIs for authentication, hierarchy, call logging, and analytics are implemented.

---

## 🧠 Project Overview

A **multi-tenant call monitoring system** designed to manage organizational hierarchy and track call activities with analytics.

Supports:

* Role-based access (Super Admin → Admin → Manager → User)
* Call tracking & recordings
* Hierarchical analytics
* Organization-level data isolation

---

## 🧱 Tech Stack

* **Backend:** Node.js, Express.js
* **ORM:** Prisma
* **Database:** PostgreSQL
* **File Upload:** Multer
* **Deployment:** Vercel (partial)

---

# 🗄️ Database Schema Overview

## 🧩 Key Concepts

* **Multi-tenant system** using `Organization`
* **Hierarchical structure** using **Closure Table (UserHierarchy)**
* **Call tracking** with relations to users and organization
* **Recording linked 1:1 with calls**

---

# 📊 DB Schema

    ORGANIZATION {
        string id PK
        string name
        datetime createdAt
        datetime updatedAt
    }

    USER {
        string id PK
        string name
        string email
        string password
        string phoneNumber
        string organizationId FK
        string supervisorId FK
        string createdById FK
        enum orgRole
        enum platformRole
    }

    USERHIERARCHY {
        string ancestorId PK
        string descendantId PK
        int depth
    }

    CALL {
        string id PK
        string callerId FK
        string receiverId FK
        string organizationId FK
        string callerNumber
        string receiverNumber
        datetime startedAt
        datetime endedAt
        int duration
        enum callType
    }

    RECORDING {
        string id PK
        string callId FK
        string fileUrl
        int fileSize
    }
```

---

# 🧠 Special Design Decision

## 🔥 Closure Table (UserHierarchy)

Instead of simple parent-child, we implemented a **closure table**:

### Why?

* Fast querying of:

  * All subordinates
  * All managers
* Supports deep hierarchy (Admin → Manager → Leader → User)

### Example:

* Get all team members → O(log n)
* Get full hierarchy tree efficiently

---



--------------------------------------------------------------------------------------------------------------------------------


# 🔌 API Documentation

## 🌐 Base URLs

* Local: `http://localhost:5000/api`
* Deployed: `https://call-backend-tau.vercel.app/api`

---

# 🟣 Super Admin APIs

### 🔐 Login

**POST** `/login/super-admin`

**Body:**

```json
{
  "email": "superadmin@example.com",
  "password": "password"
}
```

---

### 🏢 Create Organization

**POST** `/super-admin/create-org`

**Body:**

```json
{
  "orgName": "TechNova",
  "adminName": "Rahul Sharma",
  "email": "rahul@technova.com",
  "password": "aq1",
  "phoneNumber": "1111111111"
}
```

📌 Creates organization + Admin user

---

# 🔵 Admin APIs

### 🔐 Login

**POST** `/login/admin`

👉 Deployed:

```
https://call-backend-tau.vercel.app/api/login/admin
```

**Body:**

```json
{
  "email": "rahul@technova.com",
  "password": "aq1"
}
```

---

### 📊 Dashboard

**GET** `/admin/dashboard`

---

### 👤 Register User (Admin / Manager / Leader / User)

**POST** `/admin/register-user`

**Body:**

```json
{
  "name": "Aman Leader",
  "email": "aman.leader@company.com",
  "password": "aq1",
  "phoneNumber": "9000000002",
  "role": "LEADER",
  "supervisorId": "bf26a94e-c118-4ed3-977b-ff2040055f30"
}
```

📌 Notes:

* `supervisorId` optional
* If not provided → assigned under logged-in user

---

### 🌳 Organization Tree

**GET** `/admin/org-tree`

**Query (Optional):**

```
?parentId=<userId>
```

📌 Behavior:

* Default → logged-in user's hierarchy (3 levels)
* With `parentId` → specific subtree

---

### 📊 Call Analytics

**GET** `/admin/call-analytics`

**Query:**

```
?parentId=<userId>
```

📌 If `parentId` not passed → shows logged-in user analytics

---

# 🟢 Manager APIs

### 🔐 Login

(Same as Admin login)

---

### 📊 Dashboard

**GET** `/manager/dashboard`

---

### 📞 Team Calls (Paginated)

**GET**

```
https://call-backend-tau.vercel.app/api/manager/calls?page=1&limit=10
```

📌 Supports:

* Pagination (`page`, `limit`)

---

# 🟡 User APIs

### 🔐 Login

**POST** `/login/user`

**Body:**

```json
{
  "email": "neha.user@gmail.com",
  "password": "aq1"
}
```

---

### 📞 Add Call Log

**POST** `/calls`

**Content-Type:** `multipart/form-data`

**Fields:**

* `receiverNumber`
* `callerNumber`
* `startedAt`
* `endedAt`
* `callType` (INCOMING / OUTGOING)
* `audio` (file)

---

## 🎧 Example (Form Data)

```
receiverNumber: 9000000098
callerNumber: 6666666666
startedAt: 2026-03-18T11:40:00.000Z
endedAt: 2026-03-18T11:50:03.000Z
callType: OUTGOING
audio: sample-15s.mp3
```

---

# 🔐 Authorization

All protected APIs require JWT token:

```
Authorization: Bearer <token>
```

---

# 📌 API Design Highlights

* Role-based API structure (Super Admin / Admin / Manager / User)
* Hierarchical filtering using `parentId`
* Pagination support for large datasets
* Multipart upload for call recordings
* Clean separation of responsibilities per role

---

# 🚧 Upcoming APIs

* Super Admin full dashboard
* Recording playback API
* Advanced analytics endpoints
* Export reports APIs
* Real-time call tracking (WebSocket)

---
