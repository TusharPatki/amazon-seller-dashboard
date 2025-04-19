# Amazon Seller Dashboard

A dashboard for Amazon sellers to track inventory, analyze sales performance, and gain insights via AI-powered analytics.

## Features

- **Order Tracking**: View and analyze your Amazon orders
- **Inventory Management**: Track inventory levels and identify low stock items
- **Sales Analytics**: Visualize sales data with charts and trends
- **AI-powered Insights**: Ask questions about your data with natural language
- **Responsive UI**: Clean, modern interface built with React and Tailwind CSS

## Prerequisites

- Node.js >= 18.17.0
- npm or yarn
- Docker (optional for containerized deployment)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TusharPatki/amazon-seller-dashboard.git
   cd amazon-seller-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Perplexity API key:
   ```
   REACT_APP_PERPLEXITY_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Deployment Options

### Option 1: Deploy with Docker

1. Make sure Docker and Docker Compose are installed on your system.

2. Build and run the Docker container:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Build a Docker image for the application
   - Start a container exposing port 3000
   - Set up environment variables

3. Access your application at http://localhost:3000

### Option 2: Deploy on Railway

1. Set up a new project on Railway and connect your GitHub repository

2. Add the environment variable:
   - `REACT_APP_PERPLEXITY_API_KEY`

3. Railway will automatically deploy your application

### Option 3: Deploy on Render

1. In your Render dashboard, set up a new Web Service and connect your GitHub repository

2. Configure the service:
   - Build Command: `npm ci && npm run build`
   - Start Command: `serve -s build`

3. Add the environment variable:
   - `REACT_APP_PERPLEXITY_API_KEY`

4. Deploy the service

## Troubleshooting Docker Deployment

If you encounter issues with the Docker deployment, try these steps:

1. Check if Docker is running on your system

2. Verify that the Docker and Docker Compose files are in the root directory

3. Check for errors during the build process:
   ```bash
   docker build -t amazon-seller-dashboard .
   ```

4. Ensure your environment variables are properly set:
   ```bash
   export REACT_APP_PERPLEXITY_API_KEY=your_api_key_here
   ```

5. Check Docker logs if the container is running but the app isn't accessible:
   ```bash
   docker logs $(docker ps -q --filter ancestor=amazon-seller-dashboard)
   ```

6. For npm ci failures, try rebuilding with:
   ```bash
   docker build --no-cache -t amazon-seller-dashboard .
   ```

## License

MIT 