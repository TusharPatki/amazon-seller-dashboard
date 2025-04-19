# Amazon Inventory Dashboard

A React-based dashboard for Amazon sellers to track inventory, analyze sales performance, and get insights about their business.

## Features

- Inventory tracking and analysis
- Sales performance metrics
- Low stock alerts
- Advanced analytics with sales trends
- Cancellation analysis
- Replenishment recommendations

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- date-fns for date manipulation

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment on Render

1. Fork or clone this repository to your GitHub account
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Use the following settings:
   - Environment: Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
5. Click "Create Static Site"

The site will be automatically deployed and you'll get a URL to access it.

## Environment Variables

No environment variables are required for basic functionality.

## Build

To build the app for production:

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Contributing

Feel free to open issues and pull requests for any improvements.

## License

MIT 