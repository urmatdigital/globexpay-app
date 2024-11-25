# GlobExPay - Modern Payment System

GlobExPay is a modern payment system built with Next.js, Supabase, and Telegram integration. It provides a seamless payment experience with a beautiful, responsive interface.

## 🚀 Features

- 🔐 Secure Authentication with Supabase
- 💳 Payment Processing
- 🤖 Telegram Bot Integration
- 🌓 Dark/Light Mode
- 📱 Responsive Design
- ⚡ Real-time Updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, HeadlessUI
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Bot**: Telegram Bot API
- **Animations**: Framer Motion

## 🏗️ Project Structure

```
globexpay/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   └── lib/          # Utility functions and configurations
├── public/           # Static assets
└── supabase/        # Database migrations and configurations
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/globexpay.git
   cd globexpay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env` with your credentials

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔒 Environment Variables

Create a `.env` file with the following variables:

```env
# App
PORT=3000
APP_URL=your_app_url

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📦 Database Setup

The project uses Supabase as the database. Migrations are located in the `supabase/migrations` directory.

To run migrations:

1. Install Supabase CLI
2. Run `supabase init`
3. Run `supabase db reset`

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js Team
- Supabase Team
- Telegram Bot API Team
- All contributors

---

Made with ❤️ by Your Team
