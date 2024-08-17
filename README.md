Documentation for setting up, running, and testing the application

1. Overview

This application allows users to input multiple URLs and fetch metadata (title, description, and image) from those URLs. The frontend is built using React (tolstoy-task-client), while the backend uses Node.js with Express (tolstoy-task-server). Axios is utilized for HTTP requests, and Cheerio is used to parse HTML and extract metadata.

2. Setup

2.1 Prerequisites

Node.js (v14 or higher)
npm or yarn
React (for frontend)
Express (for backend)

2.2 Cloning the repositories

Clone the frontend repository:
git clone https://github.com/ilyalivy/tolstoy-task-client.git
cd tolstoy-task-client

Clone the backend repository:
git clone https://github.com/ilyalivy/tolstoy-task-server.git
cd tolstoy-task-server

2.3 Installation

Install dependencies for the frontend:
cd tolstoy-task-client
npm install

Install dependencies for the backend:
cd tolstoy-task-server
npm install

3. Running the application

3.1 Start the backend server

Navigate to the backend directory and start the server:
cd tolstoy-task-server
npm start

The backend will run on http://localhost:3001.

3.2 Start the frontend application

Navigate to the frontend directory and start the React application:
cd tolstoy-task-client
npm start

The frontend will run on http://localhost:3000.

4. Testing the application

4.1 Running frontend tests

The frontend tests are written using Jest and Testing Library. To run the tests:
cd tolstoy-task-client
npm test

4.2 Running backend tests

The backend tests are written using Jest and Supertest. To run the tests:
cd tolstoy-task-server
npm test

5. Design choices and trade-offs

5.1 Frontend

Component structure: The application is divided into small, manageable components. MultiURLForm is the main component responsible for handling user input, form submission, and displaying the fetched metadata.
Validation: Basic validation is included to ensure that users provide at least three URLs before submitting the form. Additional validation checks the URL format before sending requests to the backend.
Error Handling: Network errors and invalid URLs are handled gracefully, displaying appropriate error messages to the user.
Trade-offs:
    Limited URL Validation: The current setup validates URLs but doesn’t check if the URLs point to actual web pages until they are sent to the backend. This decision simplifies the frontend code but moves the responsibility to the backend.

5.2 Backend

Security: The backend includes middleware like xss-clean to sanitize input and express-rate-limit to prevent abuse by limiting the number of requests. express-rate-limit and CSRF protection are conditionally applied in production environments.
Error handling: The backend handles various errors, including network issues and invalid URLs, returning detailed error messages to the frontend.
