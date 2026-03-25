# 上传到GitHub指南

## 仓库名称建议
由于 `layratcnai` 是你的GitHub用户名，我建议使用以下仓库名（选择一个）：
- `magic-jump-html5-game` - 描述性强，不容易重复
- `magic-jump-platformer` - 明确是平台跳跃游戏
- `magic-jump-game-v4` - 包含版本号

## 手动上传步骤

### 1. 在GitHub创建新仓库
1. 登录 https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `magic-jump-html5-game` (或你选择的名字)
   - **Description**: HTML5平台跳跃游戏，包含成长系统、BOSS战和技能商店
   - **Public** (公开)
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 2. 使用GitHub Desktop上传（推荐）
1. 下载安装 GitHub Desktop: https://desktop.github.com
2. 打开GitHub Desktop
3. 点击 "Add" → "Add Existing Repository"
4. 选择 `D:\WORKBUDDY\magic-jump` 文件夹
5. 填写提交信息："初始提交：魔法跳跃游戏 v4.0"
6. 点击 "Publish repository"
7. 选择你的GitHub账户和刚创建的仓库

### 3. 或者使用命令行（如果安装了Git）
```bash
# 进入项目目录
cd D:\WORKBUDDY\magic-jump

# 初始化Git
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "初始提交：魔法跳跃游戏 v4.0"

# 添加远程仓库（将YOUR_REPO_NAME替换为实际仓库名）
git remote add origin https://github.com/layratcnai/YOUR_REPO_NAME.git

# 推送代码
git branch -M main
git push -u origin main
```

## 项目文件清单
```
magic-jump/
├── index.html      # 游戏主页面
├── game.js         # 游戏核心逻辑（约3500行代码）
├── README.md       # 项目说明文档
└── UPLOAD_TO_GITHUB.md  # 本指南（上传后可删除）
```

## 仓库设置建议
1. **添加标签**：`html5`, `game`, `javascript`, `canvas`, `platformer`
2. **添加主题**：`game`, `javascript`, `html`
3. **设置项目网站**（可选）：
   - 仓库设置 → Pages → Source: `main` branch
   - 游戏将在 `https://layratcnai.github.io/magic-jump-html5-game/` 运行

## 游戏在线演示
上传后，你可以通过以下方式分享游戏：
1. GitHub Pages: `https://layratcnai.github.io/仓库名/`
2. 直接链接：`https://raw.githack.com/layratcnai/仓库名/main/index.html`

## 完成上传后
1. 删除本文件：`UPLOAD_TO_GITHUB.md`
2. 更新README.md中的作者信息
3. 在GitHub仓库添加项目描述

---
**上传完成后，游戏将公开在GitHub上，任何人都可以玩！** 🎮