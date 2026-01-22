# PDF裁縫

[English](./README.md) | [简体中文](./README.zh-CN.md) | 繁體中文

一個現代化、注重隱私的 PDF 處理工具，完全在瀏覽器中執行。無需上傳檔案到伺服器即可分割和合併 PDF 檔案。

![PDF Tailor](https://img.shields.io/badge/PDF-Tailor-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特性

- **🔒 100% 隱私保護**：所有檔案處理均在瀏覽器本地完成
- **✂️ PDF 分割**：多種分割模式滿足不同需求
  - 按頁數分割
  - 均分為 N 份
  - 自訂頁碼範圍
  - 每頁單獨提取
- **🔗 PDF 合併**：將多個 PDF 檔案合併為一個
  - 拖拽排序
  - 即時預覽
  - 批次處理
- **🎨 現代化介面**：簡潔直觀的介面，支援深色模式
- **🌍 多語言支援**：支援英文、簡體中文和繁體中文
- **⚡ 快速高效**：無需上傳伺服器，即時處理
- **📱 響應式設計**：支援桌面和行動裝置

## 🚀 快速開始

### 前置需求

- Node.js 18+ 和 npm

### 安裝

```bash
# 克隆儲存庫
git clone https://github.com/yourusername/pdf-tailor.git

# 進入專案目錄
cd pdf-tailor

# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev
```

在瀏覽器中存取 `http://localhost:5173`。

### 生產構建

```bash
npm run build
```

構建檔案將輸出到 `dist` 目錄。

## 📖 使用說明

### 分割 PDF

1. 點擊**分割**標籤頁
2. 上傳或拖拽 PDF 檔案
3. 選擇分割模式：
   - **按頁數分割**：每 N 頁分割一次
   - **均分為 N 份**：平均分成若干部分
   - **自訂範圍**：指定頁碼範圍（例如：1-3, 5, 8-10）
   - **每頁單獨提取**：提取每一頁為單獨檔案
4. 點擊**開始分割**
5. 下載單個檔案或打包下載全部

### 合併 PDF

1. 點擊**合併**標籤頁
2. 上傳或拖拽多個 PDF 檔案
3. 透過拖拽或箭頭按鈕調整檔案順序
4. 點擊**合併為一個 PDF**
5. 下載合併後的檔案

## 🛠️ 技術堆疊

- **前端框架**：React 18
- **構建工具**：Vite
- **開發語言**：TypeScript
- **樣式方案**：Tailwind CSS
- **PDF 處理**：pdf-lib
- **PDF 渲染**：pdfjs-dist
- **狀態管理**：Zustand
- **國際化**：自訂 i18n 實現
- **圖示庫**：Lucide React

## 🏗️ 專案結構

```
pdf-tailor/
├── src/
│   ├── components/       # React 元件
│   ├── i18n/            # 國際化
│   ├── services/        # PDF 處理服務
│   ├── store/           # 狀態管理
│   ├── types/           # TypeScript 型別定義
│   ├── utils/           # 工具函式
│   ├── App.tsx          # 主應用元件
│   └── main.tsx         # 應用入口
├── public/              # 靜態資源
├── dist/                # 構建輸出
└── docs/                # 文件
```

## 🌐 瀏覽器支援

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 貢獻指南

歡迎貢獻程式碼！請隨時提交 Pull Request。

1. Fork 本儲存庫
2. 建立特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

## 🙏 致謝

- [pdf-lib](https://github.com/Hopding/pdf-lib) - PDF 操作庫
- [PDF.js](https://github.com/mozilla/pdf.js) - PDF 渲染引擎
- [Tailwind CSS](https://tailwindcss.com) - 樣式框架
- [Lucide Icons](https://lucide.dev) - 精美圖示

## 📮 聯絡方式

如有任何問題或建議，請在 GitHub 上提出 issue。

---

用 ❤️ 為注重隱私的使用者打造
