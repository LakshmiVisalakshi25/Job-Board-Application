# 🚀 Job Board Application

## 📌 Overview

This project is a **React-based Job Board Application** that allows users to browse, search, filter, sort, and bookmark job listings. It provides an interactive and user-friendly interface to manage job opportunities efficiently.

---

## 🎯 Features

* 🔍 Search jobs by title
* 🎯 Filter jobs by type (Remote, Hybrid, Onsite)
* 💰 Sort jobs by salary (High → Low)
* 📄 Pagination for handling multiple jobs
* ⭐ Bookmark jobs using Local Storage
* 📌 Tracker page to view bookmarked jobs
* 🔄 Clear all filters functionality
* 🔁 Grid and List view toggle
* 📱 Responsive UI using Tailwind CSS
* 🐳 Docker support for containerization

---

## 🛠️ Technologies Used

* React.js
* JavaScript (ES6+)
* Tailwind CSS
* React Router
* Local Storage
* Docker
* Vite

---

## 📂 Project Structure

```
src/
 ├── components/
 ├── pages/
 │    ├── Home.jsx
 │    ├── Tracker.jsx
 ├── data/
 │    └── mock-data.json
 ├── hooks/
 ├── store/
 ├── App.jsx
 ├── main.jsx
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone (https://github.com/LakshmiVisalakshi25/Job-Board-Application)
cd job-board
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the application

```bash
npm run dev
```

👉 Open:

```
http://localhost:5173
```

---

## 🐳 Docker Setup

### Build and run using Docker

```bash
docker-compose up --build
```

👉 Open:

```
http://localhost:3000
```

---

## 📊 Data Source

* The application uses a **local JSON file** (`mock-data.json`) as a mock database.
* Contains **20+ job listings**.

---

## 🔐 Bookmark Feature

* Bookmarked jobs are stored in **localStorage**
* Key used:

```
bookmarkedJobs
```

---

## 📄 Pages

### 🏠 Home Page

* Displays all job listings
* Supports filtering, searching, sorting, pagination

### 📌 Tracker Page

* Displays only bookmarked jobs


## 👨‍💻 Author

**Ganisetti Lakshmi Visalakshi**


