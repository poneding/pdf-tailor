# Deployment Guide / 部署指南

[English](#english) | [中文](#中文)

---

## English

### 🚀 GitHub Pages Deployment

The project will automatically deploy to GitHub Pages when you push to the `master` branch.

#### Setup Steps

1. **Enable GitHub Pages**
   - Go to your repository Settings
   - Navigate to Pages section
   - Under "Build and deployment", select "GitHub Actions" as the source

2. **Push to Master**

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin master
   ```

3. **Access Your Site**
   - Your site will be available at: `https://[username].github.io/pdf-tailor/`
   - You can find the URL in the Actions tab after deployment completes

#### Base Path Configuration

If your site is deployed to a subdirectory (e.g., `/pdf-tailor/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/pdf-tailor/', // Update this to match your repository name
  // ... other config
})
```

### 🐳 Docker Deployment

#### Build and Run with Docker

```bash
# Build the image
docker build -t pdf-tailor .

# Run the container
docker run -d -p 8080:80 --name pdf-tailor pdf-tailor
```

Access the application at `http://localhost:8080`

#### Using Docker Compose

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

#### Multi-platform Build

Build for both AMD64 and ARM64:

```bash
# Create a new builder
docker buildx create --name multiplatform --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t pdf-tailor:latest \
  --push .
```

### 📦 GitHub Container Registry

The Docker image is automatically built and pushed to GitHub Container Registry when you push to `master` or create a tag.

#### Pull and Run

```bash
# Pull the image
docker pull ghcr.io/[username]/pdf-tailor:latest

# Run the container
docker run -d -p 8080:80 ghcr.io/[username]/pdf-tailor:latest
```

### 🏷️ Version Tags

Create a version tag to trigger a release:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

This will create Docker images with the following tags:

- `latest`
- `v1.0.0`
- `v1.0`
- `v1`

---

## 中文

### 🚀 GitHub Pages 部署

当你推送到 `master` 分支时，项目会自动部署到 GitHub Pages。

#### 设置步骤

1. **启用 GitHub Pages**
   - 进入仓库的 Settings（设置）
   - 导航到 Pages 部分
   - 在 "Build and deployment" 下，选择 "GitHub Actions" 作为源

2. **推送到 Master**

   ```bash
   git add .
   git commit -m "部署到 GitHub Pages"
   git push origin master
   ```

3. **访问你的网站**
   - 网站地址：`https://[用户名].github.io/pdf-tailor/`
   - 部署完成后可以在 Actions 标签页找到 URL

#### 基础路径配置

如果网站部署到子目录（例如 `/pdf-tailor/`），需要更新 `vite.config.ts`：

```typescript
export default defineConfig({
  base: '/pdf-tailor/', // 更新为你的仓库名称
  // ... 其他配置
})
```

### 🐳 Docker 部署

#### 使用 Docker 构建和运行

```bash
# 构建镜像
docker build -t pdf-tailor .

# 运行容器
docker run -d -p 8080:80 --name pdf-tailor pdf-tailor
```

访问应用：`http://localhost:8080`

#### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 多平台构建

同时构建 AMD64 和 ARM64 版本：

```bash
# 创建新的构建器
docker buildx create --name multiplatform --use

# 构建多平台镜像
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t pdf-tailor:latest \
  --push .
```

### 📦 GitHub Container Registry

推送到 `master` 或创建标签时，Docker 镜像会自动构建并推送到 GitHub Container Registry。

#### 拉取和运行

```bash
# 拉取镜像
docker pull ghcr.io/[用户名]/pdf-tailor:latest

# 运行容器
docker run -d -p 8080:80 ghcr.io/[用户名]/pdf-tailor:latest
```

### 🏷️ 版本标签

创建版本标签以触发发布：

```bash
git tag -a v1.0.0 -m "发布版本 1.0.0"
git push origin v1.0.0
```

这将创建以下标签的 Docker 镜像：

- `latest`
- `v1.0.0`
- `v1.0`
- `v1`

---

## 🔧 Troubleshooting

### GitHub Pages 404 Error

If you see a 404 error after deployment:

1. Check if the `base` path in `vite.config.ts` matches your repository name
2. Ensure GitHub Pages is enabled in repository settings
3. Wait a few minutes for DNS propagation

### Docker Build Issues

If the Docker build fails:

1. Ensure you have enough disk space
2. Try clearing Docker cache: `docker system prune -a`
3. Check if all dependencies are correctly specified in `package.json`

### 故障排除

#### GitHub Pages 404 错误

如果部署后看到 404 错误：

1. 检查 `vite.config.ts` 中的 `base` 路径是否与仓库名称匹配
2. 确保在仓库设置中启用了 GitHub Pages
3. 等待几分钟让 DNS 传播

#### Docker 构建问题

如果 Docker 构建失败：

1. 确保有足够的磁盘空间
2. 尝试清理 Docker 缓存：`docker system prune -a`
3. 检查 `package.json` 中的依赖是否正确指定
