"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import "suneditor/dist/css/suneditor.min.css";
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Layout, 
  Code,
  Maximize2,
  HelpCircle,
  Zap,
  Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
  loading: () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full border border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 text-center"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#03215F] to-[#9cc2ed] flex items-center justify-center">
            <Type className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#AE9B66] to-[#ECCF0F] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Loading Editor</p>
          <p className="text-xs text-gray-500 mt-1">Preparing rich text experience...</p>
        </div>
      </div>
    </motion.div>
  ),
});

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your content here...",
  className = "",
  height = 520,
  label = "Content Editor",
  showTips = true,
}) {
  const [content, setContent] = useState(value || "");
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setContent(value || "");
    updateCounts(value || "");
  }, [value]);

  const updateCounts = (html) => {
    const text = html.replace(/<[^>]+>/g, '').trim();
    setCharCount(text.length);
    setWordCount(text ? text.split(/\s+/).length : 0);
  };

  const handleChange = (html) => {
    setContent(html || "");
    updateCounts(html || "");
    onChange && onChange(html || "");
  };

  const options = useMemo(() => {
    return {
      mode: "classic",
      rtl: false,
      height: `${height}px`,
      minHeight: "280px",
      maxHeight: isFullscreen ? "90vh" : "800px",
      placeholder,
      resizingBar: true,
      charCounter: false,
      showPathLabel: true,
      katex: null,
      font: [
        "Arial",
        "Helvetica",
        "Georgia",
        "Trebuchet MS",
        "Courier New",
        "Tahoma",
        "Verdana"
      ],
      defaultStyle: "font-family: 'Inter', sans-serif; line-height: 1.6;",
      buttonList: [
        ["undo", "redo"],
        ["font", "fontSize"],
        ["formatBlock"],
        ["bold", "italic", "underline", "strike", "subscript", "superscript"],
        ["fontColor", "hiliteColor", "textStyle"],
        ["removeFormat"],
        ["outdent", "indent"],
        ["align", "horizontalRule", "list", "lineHeight"],
        ["table", "link", "image", "video"],
        ["fullScreen", "showBlocks", "codeView"],
        ["preview", "print"],
      ],
      formats: [
        "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre"
      ],
      imageUploadUrl: "/api/upload",
      imageResizing: true,
      imageWidth: "100%",
      imageFileInput: true,
      videoFileInput: true,
      videoResizing: true,
      videoWidth: "100%",
      videoHeight: "360",
      attributesWhitelist: {
        all: "class|style|id|data-*|src|alt|title|href|target|width|height",
      },
      toolbarWidth: "100%",
      popupDisplay: "full",
      callBackSave: (contents) => {
        console.log("Content saved:", contents);
      },
    };
  }, [height, placeholder, isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getReadabilityScore = () => {
    const words = wordCount;
    const sentences = content.split(/[.!?]+/).length;
    if (words === 0 || sentences === 0) return 100;
    
    const avgWordsPerSentence = words / sentences;
    if (avgWordsPerSentence < 15) return 90;
    if (avgWordsPerSentence < 20) return 75;
    if (avgWordsPerSentence < 25) return 60;
    return 50;
  };

  const readabilityScore = getReadabilityScore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''} ${className}`}
    >
      {/* Editor Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#03215F] to-[#9cc2ed] shadow-sm">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Rich text editor with advanced formatting
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm"
            >
              <Maximize2 className="w-4 h-4" />
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className={`rounded-2xl border border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-sm overflow-hidden ${
        isFullscreen ? 'h-[calc(100vh-180px)]' : ''
      }`}>
        {/* Toolbar Customization */}
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Formatting
              </span>
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Media
              </span>
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5" />
                Layout
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Powered by SunEditor
              </span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className={isFullscreen ? 'h-[calc(100%-80px)]' : ''}>
          <SunEditor
            setContents={content}
            setOptions={options}
            onChange={handleChange}
            onImageUpload={(_error, result) => {
              if (result === 'success') {
                toast.success('Image uploaded successfully!');
              }
            }}
          />
        </div>

        {/* Editor Footer */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  readabilityScore >= 80 ? 'bg-green-500' :
                  readabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-600">
                  Readability: {readabilityScore}%
                </span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {wordCount} words
                </span>
                <span className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  {charCount} characters
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = content.replace(/<[^>]+>/g, '').trim();
                  navigator.clipboard.writeText(text);
                  toast.success('Text copied to clipboard!');
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Copy Text
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleanContent = content.replace(/<[^>]+>/g, '').trim();
                  setContent(cleanContent);
                  onChange && onChange(cleanContent);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Formatting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Panel */}
      {showTips && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-blue-200">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Pro Tips for Great Content
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/80 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs font-medium text-blue-800 mb-1">📱 Mobile Responsive</div>
                    <p className="text-xs text-blue-700">
                      Use relative units (%) instead of fixed pixels for images
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs font-medium text-blue-800 mb-1">🎨 Tailwind CSS</div>
                    <p className="text-xs text-blue-700">
                      Switch to "Code View" to add Tailwind classes for custom styling
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs font-medium text-blue-800 mb-1">⚡ Performance</div>
                    <p className="text-xs text-blue-700">
                      Compress images before uploading for faster page loads
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                  <Code className="w-3.5 h-3.5" />
                  <span>
                    Common Tailwind classes: <code className="bg-white px-1.5 py-0.5 rounded border">text-center</code>,{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded border">bg-gray-100</code>,{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded border">p-4</code>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Character Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-1">Words</div>
          <div className="text-lg font-semibold text-gray-900">{wordCount.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-1">Characters</div>
          <div className="text-lg font-semibold text-gray-900">{charCount.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-1">Readability</div>
          <div className="text-lg font-semibold text-gray-900">{readabilityScore}%</div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-1">Status</div>
          <div className="text-lg font-semibold text-green-600">
            {content.trim() ? 'Ready' : 'Empty'}
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#03215F] to-[#9cc2ed]">
                <Type className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Fullscreen Editor</h2>
            </div>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}