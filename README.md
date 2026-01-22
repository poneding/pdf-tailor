# PDF Tailor

English | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md)

A modern, privacy-focused PDF processing tool that runs entirely in your browser. Split and merge PDF files without uploading to any server.

![PDF Tailor](https://img.shields.io/badge/PDF-Tailor-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **🔒 100% Privacy**: All file processing is done locally in your browser
- **✂️ PDF Splitting**: Multiple split modes to meet different needs
  - Split by page count
  - Split into N equal parts
  - Custom page ranges
  - Extract each page individually
- **🔗 PDF Merging**: Combine multiple PDF files into one
  - Drag and drop to reorder
  - Real-time preview
  - Batch processing
- **🎨 Modern UI**: Clean, intuitive interface with dark mode support
- **🌍 Multilingual**: Support for English, Simplified Chinese, and Traditional Chinese
- **⚡ Fast & Efficient**: No server uploads, instant processing
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pdf-tailor.git

# Navigate to the project directory
cd pdf-tailor

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📖 Usage

### Splitting PDFs

1. Click the **Split** tab
2. Upload or drag a PDF file
3. Choose your split mode:
   - **By Page Count**: Split every N pages
   - **Split into N Parts**: Divide into equal parts
   - **Custom Range**: Specify page ranges (e.g., 1-3, 5, 8-10)
   - **Extract Each Page**: Get individual pages
4. Click **Start Split**
5. Download individual files or all as a ZIP

### Merging PDFs

1. Click the **Merge** tab
2. Upload or drag multiple PDF files
3. Reorder files by dragging or using arrow buttons
4. Click **Merge into One PDF**
5. Download the merged file

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: pdf-lib
- **PDF Rendering**: pdfjs-dist
- **State Management**: Zustand
- **Internationalization**: Custom i18n implementation
- **Icons**: Lucide React

## 🏗️ Project Structure

```
pdf-tailor/
├── src/
│   ├── components/       # React components
│   ├── i18n/            # Internationalization
│   ├── services/        # PDF processing services
│   ├── store/           # State management
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── dist/                # Build output
└── docs/                # Documentation
```

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [pdf-lib](https://github.com/Hopding/pdf-lib) - PDF manipulation
- [PDF.js](https://github.com/mozilla/pdf.js) - PDF rendering
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Lucide Icons](https://lucide.dev) - Beautiful icons

## 📮 Contact

If you have any questions or suggestions, please open an issue on GitHub.

---

Made with ❤️ for privacy-conscious users
