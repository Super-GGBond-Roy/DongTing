# 贡献指南

感谢您对本项目的关注！本项目是一个公益开源的语言文化资料库，欢迎各种形式的贡献。

## 如何贡献

### 提交语言资料

1. Fork 本仓库
2. 在 `data/languages/` 目录下创建新的语言目录
3. 按照现有格式准备 `language.json`、`categories.json` 和 `entries.json`
4. 添加图片（webp/jpg/png）和音频（mp3）文件
5. 运行 `npm run validate:corpus` 校验数据
6. 提交 Pull Request

### 报告问题

如果您发现资料错误、翻译不当或文化说明不准确，请通过 Issue 告诉我们。

### 代码贡献

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 资料质量要求

- 每个词条必须有原文字和至少一张图片
- 每个词条必须有两个音频文件（source_a 和 source_b）
- 音频文件必须是 mp3 格式
- 图片建议使用 webp 格式，大小不超过 500KB
- 文件名不使用空格和中文字符

## 行为准则

请参阅 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。
