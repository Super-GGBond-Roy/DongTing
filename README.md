# 侗听

一个离线可用、安装即用的语言文化资料库桌面应用。用于保存语言文字、图片资料、真实录音与文化说明。

## 功能特点

- 完全离线运行，无需联网、登录或配置
- 支持原文字、转写、中文释义、例句和文化说明
- 每个词条可关联多张图片
- 每个词条支持两个真实录音音源
- 支持按分类浏览和全文搜索
- 公益开源，免费使用

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **桌面壳**: Tauri 2
- **后端**: Rust + SQLite
- **构建工具**: Vite

## 开发

### 环境要求

- Node.js >= 18
- Rust >= 1.77
- 系统依赖: [Tauri Prerequisites](https://tauri.app/start/prerequisites/)

### 安装依赖

```bash
npm install
```

### 开发流程

```bash
# 1. 校验资料
npm run validate:corpus

# 2. 检查图片
npm run check:images

# 3. 检查音频
npm run check:audio

# 4. 构建数据库
npm run build:corpus

# 5. 启动开发服务器
npm run tauri:dev
```

### 构建安装包

```bash
npm run tauri:build
```

## 项目结构

```
language-archive/
├── src/                    # React 前端
│   ├── app/               # 应用壳和路由
│   ├── modules/           # 功能模块
│   │   ├── archive/       # 数据类型和 API
│   │   ├── entries/       # 词条组件
│   │   ├── search/        # 搜索组件
│   │   ├── categories/    # 分类组件
│   │   ├── audio/         # 音频播放
│   │   ├── about/         # 关于页面
│   │   └── shared/        # 共享组件
│   └── main.tsx
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   ├── commands/      # Tauri 命令
│   │   ├── database/      # 数据库操作
│   │   └── resources/     # 资源路径
│   └── resources/         # 打包资源
├── data/                  # 源数据 (JSON + 媒体)
├── scripts/               # 构建脚本
└── package.json
```

## 资料维护

开发者通过 JSON 文件维护语言资料，由构建脚本自动生成 SQLite 数据库。

```
data/languages/
└── lang_001/
    ├── language.json      # 语言基本信息
    ├── categories.json    # 分类列表
    ├── entries.json       # 词条列表
    ├── images/            # 图片文件
    └── audio/             # 音频文件
```

## 协议

- 代码: MIT License
- 内容资料: 见 CONTENT_LICENSE.md
