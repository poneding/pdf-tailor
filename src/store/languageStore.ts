import { create } from 'zustand';

type Language = 'zh' | 'en' | 'zh-TW';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    'app.title': 'PDF裁缝',
    'app.footer': '所有文件处理均在浏览器本地完成，不会上传到服务器',
    'tabs.split': 'PDF切分',
    'tabs.merge': 'PDF合并',
    
    'upload.drag': '拖拽PDF文件到此处',
    'upload.release': '释放以上传文件',
    'upload.click': '或点击选择文件',
    'upload.support_multiple': '(支持多选)',
    'upload.processing': '正在处理...',
    'upload.wait': '请稍候',
    
    'split.mode.page_count': '按页数切分',
    'split.mode.parts': '均分为N份',
    'split.mode.custom': '自定义范围',
    'split.mode.extract': '每页单独提取',
    'split.label.every': '每',
    'split.label.pages': '页切分一次',
    'split.label.split_into': '切分为',
    'split.label.parts': '份',
    'split.placeholder.ranges': '例如: 1-3, 5, 8-10',
    'split.hint.ranges': '每个范围将生成一个独立的PDF文件',
    'split.btn.start': '开始切分',
    'split.btn.processing': '处理中...',
    'split.result.title': '切分结果',
    'split.result.files': '个文件',
    'split.btn.download_all': '全部下载 (ZIP)',
    'split.btn.download': '下载',
    'split.label.page_range': '页码',
    'split.btn.remove': '移除',
    
    'merge.btn.start': '合并为一个PDF',
    'merge.btn.processing': '处理中...',
    'merge.summary': '共 {count} 个文件，{pages} 页',
    'merge.btn.clear': '清空全部',
    'merge.loading.file': '正在加载 {filename}...',
    'merge.loading.merging': '正在合并...',
    
    'error.load_failed': '无法加载PDF文件，请确保文件格式正确',
    'error.split_failed': '切分失败，请重试',
    'error.merge_failed': '合并失败，请重试',
    'error.zip_failed': '打包失败，请重试',
    
    'theme.selector': '主题',
    'theme.light': '浅色',
    'theme.dark': '深色',
    'theme.system': '系统',
  },
  'zh-TW': {
    'app.title': 'PDF裁縫',
    'app.footer': '所有檔案處理均在瀏覽器本地完成，不會上傳到伺服器',
    'tabs.split': 'PDF分割',
    'tabs.merge': 'PDF合併',
    
    'upload.drag': '拖拽PDF檔案到處',
    'upload.release': '釋放以上傳檔案',
    'upload.click': '或點擊選擇檔案',
    'upload.support_multiple': '(支援多選)',
    'upload.processing': '正在處理...',
    'upload.wait': '請稍候',
    
    'split.mode.page_count': '按頁數分割',
    'split.mode.parts': '均分為N份',
    'split.mode.custom': '自訂範圍',
    'split.mode.extract': '每頁單獨提取',
    'split.label.every': '每',
    'split.label.pages': '頁分割一次',
    'split.label.split_into': '分割為',
    'split.label.parts': '份',
    'split.placeholder.ranges': '例如: 1-3, 5, 8-10',
    'split.hint.ranges': '每個範圍將生成一個獨立的PDF檔案',
    'split.btn.start': '開始分割',
    'split.btn.processing': '處理中...',
    'split.result.title': '分割結果',
    'split.result.files': '個檔案',
    'split.btn.download_all': '全部下載 (ZIP)',
    'split.btn.download': '下載',
    'split.label.page_range': '頁碼',
    'split.btn.remove': '移除',
    
    'merge.btn.start': '合併為一個PDF',
    'merge.btn.processing': '處理中...',
    'merge.summary': '共 {count} 個檔案，{pages} 頁',
    'merge.btn.clear': '清空全部',
    'merge.loading.file': '正在載入 {filename}...',
    'merge.loading.merging': '正在合併...',
    
    'error.load_failed': '無法載入PDF檔案，請確保檔案格式正確',
    'error.split_failed': '分割失敗，請重試',
    'error.merge_failed': '合併失敗，請重試',
    'error.zip_failed': '打包失敗，請重試',
    
    'theme.selector': '主題',
    'theme.light': '淺色',
    'theme.dark': '深色',
    'theme.system': '系統',
  },
  en: {
    'app.title': 'PDF Tailor',
    'app.footer': 'All processing is done locally in your browser. No files are uploaded to any server.',
    'tabs.split': 'Split PDF',
    'tabs.merge': 'Merge PDF',
    
    'upload.drag': 'Drag PDF files here',
    'upload.release': 'Release to upload',
    'upload.click': 'Or click to select files',
    'upload.support_multiple': '(Multiple allowed)',
    'upload.processing': 'Processing...',
    'upload.wait': 'Please wait',
    
    'split.mode.page_count': 'By Page Count',
    'split.mode.parts': 'Fixed Number of Files',
    'split.mode.custom': 'Custom Ranges',
    'split.mode.extract': 'Extract All Pages',
    'split.label.every': 'Every',
    'split.label.pages': 'pages',
    'split.label.split_into': 'Split into',
    'split.label.parts': 'files',
    'split.placeholder.ranges': 'e.g. 1-3, 5, 8-10',
    'split.hint.ranges': 'Each range will be a separate PDF file',
    'split.btn.start': 'Start Splitting',
    'split.btn.processing': 'Processing...',
    'split.result.title': 'Split Results',
    'split.result.files': 'files',
    'split.btn.download_all': 'Download All (ZIP)',
    'split.btn.download': 'Download',
    'split.label.page_range': 'Pages',
    'split.btn.remove': 'Remove',
    
    'merge.btn.start': 'Merge into One PDF',
    'merge.btn.processing': 'Processing...',
    'merge.summary': '{count} files, {pages} pages total',
    'merge.btn.clear': 'Clear All',
    'merge.loading.file': 'Loading {filename}...',
    'merge.loading.merging': 'Merging...',
    
    'error.load_failed': 'Failed to load PDF. Please ensure the file format is correct.',
    'error.split_failed': 'Split failed. Please try again.',
    'error.merge_failed': 'Merge failed. Please try again.',
    'error.zip_failed': 'Failed to create ZIP. Please try again.',
    
    'theme.selector': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
  }
};

export const useLanguage = create<LanguageState>((set, get) => ({
  language: 'zh',
  setLanguage: (lang) => set({ language: lang }),
  t: (key) => {
    const lang = get().language;
    return translations[lang][key as keyof typeof translations['zh']] || key;
  }
}));
