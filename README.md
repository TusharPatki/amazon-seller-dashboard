# Amazon Seller Dashboard

A dashboard for Amazon sellers to track inventory, analyze sales performance, and gain insights.

## Features

- **Order Tracking**: View and analyze your Amazon orders
- **Inventory Management**: Track inventory levels and identify low stock items
- **Sales Analytics**: Visualize sales data with charts and trends
- **Responsive UI**: Clean, modern interface built with React and Tailwind CSS

## Prerequisites

- Node.js >= 18.17.0
- npm or yarn

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

3. Start the development server:
   ```bash
   npm start
   ```

## Deployment on Netlify

1. Push your code to GitHub (already done).
2. Go to [Netlify](https://app.netlify.com/) and log in or sign up.
3. Click "Add new site" > "Import an existing project".
4. Connect your GitHub repository.
5. Set the build command to:
   ```
   npm run build
   ```
   and the publish directory to:
   ```
   build
   ```
6. (Optional) If you use React Router, add a file at `public/_redirects` with:
   ```
   /*    /index.html   200
   ```
7. Click "Deploy site".

Your site will be live on a Netlify URL!

## License

MIT 