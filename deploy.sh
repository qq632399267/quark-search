#!/bin/bash
# =====================================================
# 夸克搜 - 后端一键部署脚本
# 用法: ./deploy.sh
# 前提: 服务器已安装 Python 3.10+
# =====================================================

set -e

cd "$(dirname "$0")"
echo "🚀 夸克搜 后端部署开始..."

# 1. 安装依赖
echo "📦 安装 Python 依赖..."
pip3 install --break-system-packages -r backend/requirements.txt 2>/dev/null || pip3 install -r backend/requirements.txt

# 2. 导入数据（如果数据库为空）
echo "📥 导入资源数据..."
cd backend
if [ ! -f "quark_search.db" ] || [ "$(python3 -c "from models import SessionLocal, Resource; db=SessionLocal(); print(db.query(Resource).count()); db.close()")" = "0" ]; then
    # 检查是否有数据文件
    if [ -f "../../quark-search-短剧数据.json" ]; then
        python3 import_data.py ../../quark-search-短剧数据.json
    else
        echo "⚠️ 未找到数据文件，将使用默认种子数据"
    fi
else
    echo "✅ 数据库已有数据，跳过导入"
fi
cd ..

# 3. 启动服务
echo "🌐 启动 API 服务 (端口 8000)..."
nohup python3 -m uvicorn backend.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 2 \
    > /tmp/quark-search-backend.log 2>&1 &

BACKEND_PID=$!
echo "✅ 后端已启动 PID: $BACKEND_PID"
echo "📋 API 地址: http://localhost:8000"
echo ""
echo "=== 接下来你需要 ==="
echo "1. 用 Nginx/Caddy 反代到 8000 端口并配置 HTTPS"
echo "2. 设置前端 VITE_API_URL=https://你的域名"
echo "3. 重新构建前端: cd frontend && VITE_API_URL=https://你的域名 npm run build"
echo "4. 部署前端到你的静态服务器"
echo ""
echo "使用 systemd 管理（推荐）:"
echo "  [Unit]"
echo "  Description=夸克搜 Backend"
echo "  [Service]"
echo "  WorkingDirectory=$(pwd)/backend"
echo "  ExecStart=$(which python3) -m uvicorn main:app --host 0.0.0.0 --port 8000"
echo "  Restart=always"
echo "  [Install]"
echo "  WantedBy=multi-user.target"
