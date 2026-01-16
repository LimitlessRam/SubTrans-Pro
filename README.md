<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SubTrans Pro 🎬

### Professional Movie Subtitle Translation Powered by Gemini 3 Flash

**SubTrans Pro** is a high-performance web application designed for professional-grade subtitle translation. Leveraging the power of Google's **Gemini 3 Flash** model, it provides accurate, context-aware, and idiomatic translations while strictly preserving SRT formatting and timing.

---

## ✨ Features

- 🚀 **Gemini 3 Flash Powered**: High-speed, high-quality translations using the latest LLM tech.
- 🌍 **Multi-Language Support**: Support for 90+ languages including major world languages and regional dialects.
- 📦 **Smart Batching**: Automatically chunks large SRT files (50 blocks per batch) for maximum stability and API reliability.
- ⏱️ **Zero-Timing Drift**: Strictly maintains original sequence numbers, timestamps (`-->`), and line breaks.
- 🏷️ **Tag Preservation**: Correctly handles and preserves HTML-style tags like `<i>`, `<b>`, etc.
- 📊 **Real-time Progress**: Visual tracking of parsing, translation, and assembly phases.
- 🎨 **Premium UI/UX**: Modern dark-themed interface with glassmorphism, smooth animations, and responsive design.

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini 3 Flash)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Module System**: Modern ESM

---

## 🚦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LimitlessRam/SubTrans-Pro.git
   cd SubTrans-Pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your API Key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## 📖 Usage

1. **Select Languages**: Choose the source language and your desired target language.
2. **Upload SRT**: Drag and drop or click to upload your `.srt` file.
3. **Translate**: Click "Start Translation". You can watch the progress bar as the AI processes the file in batches.
4. **Preview & Download**: Once finished, preview the first few blocks and click "Download SRT" to save the translated file.

---

## 📁 Project Structure

```text
├── components/       # Reusable UI components (Uploader, Selects)
├── services/         # API logic and AI system instructions
├── utils/            # SRT parsing and rebuilding logic
├── types.ts          # TypeScript interfaces/types
├── App.tsx           # Main application logic & UI
├── index.html        # Entry point with Tailwind & Fonts
└── vite.config.ts    # Build configuration
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information (if applicable).

---

## 🙏 Acknowledgments

- Built with ❤️ for the cinematic community.
- Special thanks to the Google Gemini team for the incredible Flash model.
