# 智能思维导图 (Smart Markmap)


## 项目简介

还在为杂乱无章的笔记和文档头疼吗？智能思维导图是您信息整理的终极解决方案！

我们利用最先进的AI技术，将枯燥的文本瞬间转化为清晰直观的思维导图，让您的思路一目了然。

✨ 三大核心优势：
1. **AI智能解析** - 基于DeepSeek强大的自然语言处理能力，充分尊重原文档的同时，自动识别文本逻辑关系
2. **零学习成本** - 无需掌握复杂操作，上传文档或粘贴文字，快速生成专业级思维导图
3. **深度整合工作流** - 支持主流文档格式，一键导出多种格式，方便的分享给他人

告别信息过载，开启高效思考新时代！

## 核心功能

- **多种输入方式**：支持文件上传或直接输入文本
- **智能分析**：利用 DeepSeek AI 模型智能解析文本内容
- **实时渲染**：流式响应，实时生成思维导图
- **交互式思维导图**：支持缩放、拖拽、展开/折叠节点
- **多种导出选项**：支持导出为 HTML 或 Markdown 格式
- **自定义 API 设置**：可配置 API 密钥和端点

## 快速开始

首先，克隆项目并安装依赖：

```bash
git clone https://github.com/your-username/smart-markmap.git
cd smart-markmap
npm install
```

然后，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中访问 [http://localhost:3000](http://localhost:3000) 即可看到应用。

## 使用指南

1. 点击"上传文件"或"输入文本"选择您的输入方式
2. 配置 DeepSeek API 设置（需要您自己的 API 密钥）
3. 提交内容后，系统将自动分析并生成思维导图
4. 使用工具栏可以调整思维导图的显示方式
5. 需要时可以导出为 HTML 或 Markdown 格式保存

## 技术栈

- **前端框架**：Next.js 15.3.1 + React 19
- **UI 组件**：自定义组件 + TailwindCSS 4
- **思维导图**：Markmap 系列库
- **文件处理**：React-Dropzone, DOCX, PDF-parse 等
- **API 通信**：Axios

## 部署说明

推荐使用 Vercel 平台部署此 Next.js 应用：

1. 将代码推送到您的 GitHub 仓库
2. 在 [Vercel 平台](https://vercel.com/new) 导入您的项目
3. 配置必要的环境变量
4. 点击部署

## 贡献指南

我们欢迎各种形式的贡献，无论是功能请求、bug 报告还是代码贡献。请随时提交 Issue 或 Pull Request！

## 许可证

[MIT](LICENSE)

---

项目由 ❤️ 开发并开源分享
