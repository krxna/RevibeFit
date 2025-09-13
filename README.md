# RevibeFit - Fitness & Wellness Platform

RevibeFit is a full-stack web application that provides personalized
fitness solutions, workout tracking, and health monitoring services.\
It connects fitness enthusiasts with certified trainers, classes, and
lab partners to create a complete wellness ecosystem.

## Features

-   User Authentication & Profiles (users, trainers, labs, admins)\
-   Live Interactive Workout Classes (real-time streaming & chat)\
-   Personalized Workout Plans & Scheduling\
-   Diet & Nutrition Planner\
-   Health Monitoring & Lab Test Recommendations\
-   Blogs & Community Features

## Tech Stack

-   **Frontend:** HTML5, CSS3, JavaScript, EJS, jQuery, Bootstrap\
-   **Backend:** Node.js, Express.js, MongoDB, REST APIs\
-   **Other:** Geolocation API, jQuery UI, Font Awesome

## Deployment

-   App runs on `localhost:3001`\
-   Database hosted locally

## Setup Instructions (Run Locally)

1.  **Clone the repository**

    ``` bash
    git clone https://github.com/your-username/revibefit.git
    cd revibefit
    ```

2.  **Install dependencies**

    ``` bash
    npm install
    ```

3.  **Configure environment variables**

    -   Create a `.env` file in the project root\

    -   Add the following keys:

            PORT=3001
            MONGO_URI=mongodb://localhost:27017/revibefit
            SESSION_SECRET=your_secret_key

4.  **Start MongoDB locally**

    ``` bash
    mongod
    ```

5.  **Run the application**

    ``` bash
    npm start
    ```

    The app will be available at <http://localhost:3001>

## Upcoming Features

-   Smart lab center recommendations\
-   Enhanced health analytics and insights\
-   E-commerce store (supplements, equipment, merchandise)
