# PDF裁缝

[English](./README.md) | 简体中文 | [繁體中文](./README.zh-TW.md)

一个现代化、注重隐私的 PDF 处理工具，完全在浏览器中运行。无需上传文件到服务器即可分割和合并 PDF 文件。

![PDF Tailor](https://img.shields.io/badge/PDF-Tailor-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特性

- **🔒 100% 隐私保护**：所有文件处理均在浏览器本地完成
- **✂️ PDF 切分**：多种切分模式满足不同需求
  - 按页数切分
  - 均分为 N 份
  - 自定义页码范围
  - 每页单独提取
- **🔗 PDF 合并**：将多个 PDF 文件合并为一个
  - 拖拽排序
  - 实时预览
  - 批量处理
- **🎨 现代化界面**：简洁直观的界面，支持深色模式
- **🌍 多语言支持**：支持英文、简体中文和繁体中文
- **⚡ 快速高效**：无需上传服务器，即时处理
- **📱 响应式设计**：支持桌面和移动设备

## 🚀 快速开始

### 前置要求

- Node.js 18+ 和 npm

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/pdf-tailor.git

# 进入项目目录
cd pdf-tailor

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中访问 `http://localhost:5173`。

### 生产构建

```bash
npm run build
```

构建文件将输出到 `dist` 目录。

## 📖 使用说明

### 切分 PDF

1. 点击**切分**标签页
2. 上传或拖拽 PDF 文件
3. 选择切分模式：
   - **按页数切分**：每 N 页切分一次
   - **均分为 N 份**：平均分成若干部分
   - **自定义范围**：指定页码范围（例如：1-3, 5, 8-10）
   - **每页单独提取**：提取每一页为单独文件
4. 点击**开始切分**
5. 下载单个文件或打包下载全部

### 合并 PDF

1. 点击**合并**标签页
2. 上传或拖拽多个 PDF 文件
3. 通过拖拽或箭头按钮调整文件顺序
4. 点击**合并为一个 PDF**
5. 下载合并后的文件

## 🛠️ 技术栈

- **前端框架**：React 18
- **构建工具**：Vite
- **开发语言**：TypeScript
- **样式方案**：Tailwind CSS
- **PDF 处理**：pdf-lib
- **PDF 渲染**：pdfjs-dist
- **状态管理**：Zustand
- **国际化**：自定义 i18n 实现
- **图标库**：Lucide React

## 🏗️ 项目结构

```
pdf-tailor/
├── src/
│   ├── components/       # React 组件
│   ├── i18n/            # 国际化
│   ├── services/        # PDF 处理服务
│   ├── store/           # 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 应用入口
├── public/              # 静态资源
├── dist/                # 构建输出
└── docs/                # 文档
```

## 🌐 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 贡献指南

欢迎贡献代码！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [pdf-lib](https://github.com/Hopding/pdf-lib) - PDF 操作库
- [PDF.js](https://github.com/mozilla/pdf.js) - PDF 渲染引擎
- [Tailwind CSS](https://tailwindcss.com) - 样式框架
- [Lucide Icons](https://lucide.dev) - 精美图标

## 📮 联系方式

如有任何问题或建议，请在 GitHub 上提出 issue。

---

用 ❤️ 为注重隐私的用户打造
