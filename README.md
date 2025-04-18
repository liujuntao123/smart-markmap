# 智能思维导图 (Smart Markmap)
**极简设计 · 智能解析 · 高效可视化**
## 项目简介
面对碎片化信息无从下手？智能思维导图为您提供专业级解决方案！
基于前沿AI技术，我们能够将复杂文本智能转化为结构清晰的思维导图，助您快速理清思路，提升信息处理效率。

### 🌟 核心优势：
1. **智能语义解析** - 采用DeepSeek NLP技术，精准识别文本逻辑关系，保持原意不变
2. **极简操作体验** - 一步即可生成专业级思维导图
3. **无缝工作流整合** - 全面兼容主流文档格式，支持多格式导出与便捷分享
让思维可视化，让知识结构化！

## 核心功能
- **灵活输入**：支持文件上传与文本直接输入双模式
- **AI深度解析**：基于DeepSeek大模型实现智能内容分析
- **实时可视化**：流式响应，所见即所得的导图生成体验
- **交互式操作**：支持缩放、拖拽、节点展开/折叠等交互
- **多格式输出**：可导出HTML/Markdown等通用格式
- **API自定义**：开放API密钥与端点配置
## 界面预览
![PixPin_2025-04-18_17-33-34](https://github.com/user-attachments/assets/66112159-b5c4-4005-aadb-c5cf1a419e20)

![PixPin_2025-04-18_17-33-50](https://github.com/user-attachments/assets/71cbf5fe-64d9-4f51-a003-7c0372803e0c)
## 快速开始
1. 克隆项目仓库：
```bash
git clone https://github.com/your-username/smart-markmap.git
cd smart-markmap
```
2. 安装依赖：
```bash
npm install
# 或使用其他包管理器
yarn/pnpm/bun install
```
3. 启动开发服务器：
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000) 即可体验
## 使用指南
1. 选择输入方式（上传文件/输入文本）
2. 配置DeepSeek API参数（需自行申请API密钥）
3. 提交内容，系统将自动生成思维导图
4. 使用工具栏调整导图显示效果
5. 支持导出为HTML/Markdown格式保存
## 技术架构
- **前端框架**：Next.js 15.3.1 + React 19
- **UI设计**：TailwindCSS 4 + 自定义组件
- **可视化引擎**：Markmap系列库
- **文档处理**：React-Dropzone, DOCX, PDF-parse等
- **网络通信**：Axios
## 部署方案
推荐使用Vercel一键部署：
1. 推送代码至GitHub仓库
2. 在[Vercel平台](https://vercel.com/new)导入项目
3. 配置环境变量
4. 完成部署
## 参与贡献
欢迎通过以下方式参与项目：
- 提交功能建议或问题报告
- 参与代码开发
- 完善项目文档
请通过Issue或Pull Request提交您的贡献
## 开源协议
[MIT](LICENSE)
---
用技术传递价值，用开源分享智慧 ❤️
