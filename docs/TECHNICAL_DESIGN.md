# PDF裁缝 - 技术实现方案

## 1. 技术选型

### 1.1 核心技术栈

| 层级 | 技术选择 | 理由 |
| ---- | -------- | ---- |
| **PDF处理** | pdf-lib | 唯一支持浏览器端PDF切分/合并的成熟库，MIT许可 |
| **PDF预览** | PDF.js | Mozilla官方库，渲染效果最佳 |
| **前端框架** | React 18 + TypeScript | 生态成熟，类型安全 |
| **构建工具** | Vite | 快速的开发体验和优化的生产构建 |
| **样式方案** | Tailwind CSS | 快速开发，响应式设计友好 |
| **压缩下载** | JSZip | 批量文件打包下载 |

### 1.2 技术选型分析

#### pdf-lib vs PDF.js

| 能力 | pdf-lib | PDF.js |
| ---- | ------- | ------ |
| 读取PDF | ✅ | ✅ |
| 渲染/预览 | ❌ | ✅ |
| 切分页面 | ✅ | ❌ |
| 合并PDF | ✅ | ❌ |
| 修改内容 | ✅ | ❌ |
| 浏览器支持 | ✅ | ✅ |

**结论**：两者配合使用 —— pdf-lib处理切分/合并，PDF.js负责预览渲染。

---

## 2. 系统架构

### 2.1 整体架构

```txt
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │   UI Layer  │  │  State Mgmt │  │    PDF Processing   │   │
│  │   (React)   │◄─┤   (Zustand) │◄─┤  (Web Worker)       │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
│         │                                    │               │
│         ▼                                    ▼               │
│  ┌─────────────┐                   ┌─────────────────────┐   │
│  │   PDF.js    │                   │      pdf-lib        │   │
│  │  (Preview)  │                   │  (Split/Merge)      │   │
│  └─────────────┘                   └─────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 模块划分

```txt
src/
├── components/           # UI组件
│   ├── FileUploader/     # 文件上传组件
│   ├── PDFPreview/       # PDF预览组件
│   ├── SplitPanel/       # 切分控制面板
│   ├── MergePanel/       # 合并控制面板
│   └── common/           # 通用组件
├── hooks/                # 自定义Hooks
│   ├── usePDFDocument.ts # PDF文档操作
│   └── useFileDownload.ts# 文件下载
├── workers/              # Web Workers
│   └── pdf.worker.ts     # PDF处理Worker
├── services/             # 业务逻辑
│   ├── pdfSplitter.ts    # 切分服务
│   ├── pdfMerger.ts      # 合并服务
│   └── pdfRenderer.ts    # 渲染服务
├── store/                # 状态管理
│   └── pdfStore.ts       # PDF状态
├── types/                # TypeScript类型
│   └── pdf.ts
└── utils/                # 工具函数
    ├── fileUtils.ts
    └── pageRangeParser.ts
```

---

## 3. 核心功能实现

### 3.1 PDF切分实现

```typescript
import { PDFDocument } from 'pdf-lib';

interface SplitOptions {
  mode: 'byPageCount' | 'byParts' | 'custom';
  pageCount?: number;        // 每X页切分
  parts?: number;            // 切分为N份
  ranges?: string;           // 自定义范围 "1-3, 5, 8-10"
}

async function splitPDF(
  sourceBuffer: ArrayBuffer,
  options: SplitOptions
): Promise<Uint8Array[]> {
  const sourcePdf = await PDFDocument.load(sourceBuffer);
  const totalPages = sourcePdf.getPageCount();
  
  // 解析页码范围
  const pageRanges = parsePageRanges(options, totalPages);
  const results: Uint8Array[] = [];
  
  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create();
    const pageIndices = range.map(p => p - 1); // 转为0-based索引
    
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    results.push(pdfBytes);
  }
  
  return results;
}

// 解析页码范围字符串 "1-3, 5, 8-10"
function parsePageRanges(options: SplitOptions, total: number): number[][] {
  if (options.mode === 'byPageCount' && options.pageCount) {
    const ranges: number[][] = [];
    for (let i = 0; i < total; i += options.pageCount) {
      const end = Math.min(i + options.pageCount, total);
      ranges.push(Array.from({ length: end - i }, (_, idx) => i + idx + 1));
    }
    return ranges;
  }
  
  if (options.mode === 'custom' && options.ranges) {
    return parseCustomRanges(options.ranges, total);
  }
  
  // 默认：每页一个文件
  return Array.from({ length: total }, (_, i) => [i + 1]);
}
```

### 3.2 PDF合并实现

```typescript
import { PDFDocument } from 'pdf-lib';

interface MergeItem {
  buffer: ArrayBuffer;
  filename: string;
  selectedPages?: number[]; // 可选：只合并指定页
}

async function mergePDFs(items: MergeItem[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const item of items) {
    const sourcePdf = await PDFDocument.load(item.buffer);
    
    // 确定要复制的页面
    const pageIndices = item.selectedPages 
      ? item.selectedPages.map(p => p - 1)
      : sourcePdf.getPageIndices();
    
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }
  
  return mergedPdf.save();
}
```

### 3.3 PDF预览实现

```typescript
import * as pdfjsLib from 'pdfjs-dist';

// 设置worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

async function renderPageThumbnail(
  pdfBuffer: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 0.3
): Promise<void> {
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  const context = canvas.getContext('2d')!;
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
}
```

### 3.4 批量下载（ZIP打包）

```typescript
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

async function downloadAsZip(
  files: { name: string; data: Uint8Array }[]
): Promise<void> {
  const zip = new JSZip();
  
  files.forEach((file, index) => {
    const filename = file.name || `split-${index + 1}.pdf`;
    zip.file(filename, file.data);
  });
  
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'pdf-files.zip');
}
```

---

## 4. 性能优化

### 4.1 Web Worker处理

将PDF处理放入Web Worker，避免阻塞主线程：

```typescript
// pdf.worker.ts
import { PDFDocument } from 'pdf-lib';

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'SPLIT':
      const results = await splitPDF(payload.buffer, payload.options);
      self.postMessage({ type: 'SPLIT_COMPLETE', results });
      break;
      
    case 'MERGE':
      const merged = await mergePDFs(payload.items);
      self.postMessage({ type: 'MERGE_COMPLETE', result: merged });
      break;
  }
};
```

### 4.2 内存管理

```typescript
// 处理完成后及时释放内存
function cleanupPDFBuffers(buffers: ArrayBuffer[]): void {
  buffers.forEach(buffer => {
    // ArrayBuffer无法手动释放，但可以解除引用
    buffer = null as any;
  });
  
  // 建议垃圾回收（不保证立即执行）
  if (typeof gc !== 'undefined') {
    gc();
  }
}
```

### 4.3 大文件处理策略

| 文件大小 | 处理策略 |
| -------- | -------- |
| < 10MB | 直接处理 |
| 10-50MB | 显示进度条，Web Worker处理 |
| 50-100MB | 分批处理，显示详细进度 |
| > 100MB | 警告用户可能较慢，提供取消选项 |

---

## 5. 项目结构

### 5.1 依赖清单

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^4.0.379",
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/file-saver": "^2.0.7",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 5.2 Bundle Size预估

| 依赖 | Gzipped Size |
| ---- | ------------ |
| pdf-lib | ~200KB |
| pdfjs-dist | ~400KB (含worker) |
| jszip | ~45KB |
| React | ~45KB |
| **Total** | **~700KB** |

---

## 6. 开发计划

### Phase 1: 基础框架 (Day 1-2)

- [ ] 项目初始化 (Vite + React + TS)
- [ ] 配置Tailwind CSS
- [ ] 基础布局和路由

### Phase 2: 核心功能 (Day 3-5)

- [ ] 文件上传组件
- [ ] PDF切分功能实现
- [ ] PDF合并功能实现
- [ ] 文件下载功能

### Phase 3: 预览和优化 (Day 6-7)

- [ ] PDF页面预览
- [ ] Web Worker集成
- [ ] 性能优化
- [ ] 错误处理

### Phase 4: 完善 (Day 8-10)

- [ ] 响应式设计
- [ ] 边界情况处理
- [ ] 测试和修复
- [ ] 部署

---

## 7. 风险与对策

| 风险 | 影响 | 对策 |
| ---- | ---- | ---- |
| 大文件处理慢 | 用户体验差 | Web Worker + 进度提示 |
| 特殊PDF格式不支持 | 功能失效 | 错误捕获 + 友好提示 |
| 移动端内存不足 | 应用崩溃 | 限制文件大小 + 分批处理 |
| 浏览器兼容性 | 功能异常 | 特性检测 + 降级提示 |
