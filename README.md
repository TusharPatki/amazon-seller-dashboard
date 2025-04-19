# Amazon Seller Dashboard

A React-based dashboard for Amazon sellers to analyze their sales and inventory data with AI-powered insights.

## Features

- 📊 Sales and inventory analytics
- 💡 AI-powered insights using Perplexity AI
- 📈 Interactive charts and visualizations
- 📦 Low stock alerts
- 💰 Revenue tracking
- ❌ Cancellation analysis

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Perplexity AI API
- date-fns

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd amazon-inventory-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Perplexity AI API key:
```bash
REACT_APP_PERPLEXITY_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

- `REACT_APP_PERPLEXITY_API_KEY`: Your Perplexity AI API key (required)

## Usage

1. Upload your Amazon order report (TSV format)
2. Upload your inventory report (TSV format)
3. View analytics and insights in the dashboard
4. Use the AI assistant to get specific insights about your data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 