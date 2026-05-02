# 💻 B.R. INDUSTRIES - Frontend

The frontend for the Industrial Billing System, built with a modern, responsive stack.

## 🚀 Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide-React
- **PDF Generation**: jsPDF & jsPDF-AutoTable
- **Routing**: React Router DOM

## 🛠️ Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in this directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Run Locally**:
   ```bash
   npm run dev
   ```

## 📱 Responsive Features
- **Mobile Drawer**: A custom-built hamburger menu for mobile devices.
- **Adaptive Tables**: All tables support horizontal scrolling on smaller screens.
- **Glassmorphism Login**: A premium login experience with modern aesthetics.

## 📦 Build & Deploy
To build for production:
```bash
npm run build
```
The output will be in the `dist/` folder. This project is optimized for deployment on **Netlify** using the included `netlify.toml`.
