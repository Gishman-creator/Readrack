# Readrack

## Project Overview
**ReadRack** is a platform designed to help users easily find the order of book series, the complete works of authors, and curated book recommendations. The website also provides a streamlined way to explore authors' biographies, their works, and additional social media links. Visit the live project at [readrack.net](https://readrack.net).

---

## Project Structure
The project is organized as follows:

```
ReadRack/
├── app/
│   ├── back-end/
│   └── front-end/
```

### 1. **Back-end**
The back-end, located in the `app/back-end/` directory, is built using Node.js. It handles the server-side logic, database interactions, and API endpoints for managing books, authors, and recommendations.

### 2. **Front-end**
The front-end, located in the `app/front-end/` directory, is a React-based web application that provides an intuitive interface for users to interact with the platform.

---

## Installation Instructions
To set up the project on your local machine:

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Readrack
```

### 2. Navigate to the App Directory
```bash
cd app
```

### 3. Install Dependencies
#### Back-end
```bash
cd back-end
npm install
```

#### Front-end
```bash
cd ../front-end
npm install
```

---

## Running the Application

### 1. Starting the Back-end Server
Navigate to the `back-end` directory and run:
```bash
nodemon index.js
```
This will start the Node.js server, which serves as the API for the application.

### 2. Starting the Front-end Application
Navigate to the `front-end` directory and run:
```bash
npm run dev
```
This will start the React development server. You can access the application through the local development URL displayed in the terminal.

---

## Notes
- Ensure you have **Node.js** and **npm** installed on your machine.
- Remember to set your own environment variables in the **.env** file for both back-end and fron-end.
- Use `nodemon` for the back-end to monitor changes and restart the server automatically. Install globally if not already available:
  ```bash
  npm install -g nodemon
  ```

---

## Contribution Guidelines
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with descriptive commit messages.
4. Open a pull request to the main repository for review.

