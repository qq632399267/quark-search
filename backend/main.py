"""
夸克搜 - FastAPI 后端入口
"""
import os
import re
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from models import init_db, get_db, Resource, Submission

app = FastAPI(title="夸克搜 API", version="1.0.0")

# CORS - 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 分类列表
CATEGORIES = ["短剧", "电影", "电视剧", "动漫", "综艺"]
# 网盘来源列表
SOURCES = ["夸克网盘", "百度网盘", "阿里云盘", "UC网盘", "迅雷网盘"]


@app.on_event("startup")
def startup():
    """启动时初始化数据库"""
    init_db()
    # 如果数据库为空，插入示例数据
    db = next(get_db())
    if db.query(Resource).count() == 0:
        _seed_data(db)
    db.close()


# ==================== 前台API ====================

@app.get("/api/categories")
def get_categories():
    """获取分类列表（含各分类数量）"""
    db = next(get_db())
    result = []
    for cat in CATEGORIES:
        count = db.query(Resource).filter(
            Resource.category == cat,
            Resource.status == "active"
        ).count()
        result.append({"name": cat, "count": count})
    db.close()
    return {"data": result}


@app.get("/api/search")
def search(
    q: str = Query("", description="搜索关键词"),
    category: str = Query("", description="分类筛选"),
    source: str = Query("", description="网盘来源筛选"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """搜索资源"""
    db = next(get_db())
    query = db.query(Resource).filter(Resource.status == "active")

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Resource.title.like(like), Resource.description.like(like))
        )
    if category:
        query = query.filter(Resource.category == category)
    if source:
        query = query.filter(Resource.source == source)

    total = query.count()
    items = query.order_by(desc(Resource.created_at)) \
                 .offset((page - 1) * page_size) \
                 .limit(page_size) \
                 .all()

    db.close()
    return {
        "data": [_resource_to_dict(r) for r in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@app.get("/api/detail/{resource_id}")
def get_detail(resource_id: int):
    """获取资源详情"""
    db = next(get_db())
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        db.close()
        raise HTTPException(status_code=404, detail="资源不存在")

    resource.click_count += 1
    db.commit()
    db.close()
    return {"data": _resource_to_dict(resource)}


@app.get("/api/hot")
def get_hot(limit: int = Query(12, ge=1, le=50)):
    """获取热门推荐"""
    db = next(get_db())
    items = db.query(Resource).filter(
        Resource.status == "active",
        Resource.is_hot == True
    ).order_by(desc(Resource.click_count)).limit(limit).all()
    db.close()
    return {"data": [_resource_to_dict(r) for r in items]}


@app.get("/api/latest")
def get_latest(limit: int = Query(20, ge=1, le=50)):
    """获取最新资源"""
    db = next(get_db())
    items = db.query(Resource).filter(
        Resource.status == "active"
    ).order_by(desc(Resource.created_at)).limit(limit).all()
    db.close()
    return {"data": [_resource_to_dict(r) for r in items]}


# ==================== 用户投稿 ====================

@app.post("/api/submit")
def submit_resource(submission: dict):
    """用户提交资源"""
    required = ["title", "link"]
    for field in required:
        if field not in submission or not submission[field].strip():
            raise HTTPException(status_code=400, detail=f"缺少必填字段: {field}")

    # 简单校验链接格式
    link = submission["link"].strip()
    if not re.match(r'^https?://pan\.(quark|baidu|aliyun)\.(cn|com)/', link):
        raise HTTPException(status_code=400, detail="链接格式不正确，请提供有效的网盘分享链接")

    db = next(get_db())
    sub = Submission(
        title=submission["title"].strip(),
        category=submission.get("category", "短剧"),
        link=link,
        source=submission.get("source", "夸克网盘"),
        description=submission.get("description", ""),
        contact=submission.get("contact", ""),
    )
    db.add(sub)
    db.commit()
    db.close()
    return {"message": "提交成功，等待审核"}


# ==================== 批量导入 ====================

@app.post("/api/admin/import")
def admin_import_resources(data: dict):
    """批量导入资源（JSON数组）"""
    items = data.get("items", [])
    if not items or not isinstance(items, list):
        raise HTTPException(400, "请提供items数组")

    import json, os
    db = next(get_db())
    count = 0
    for item in items:
        title = item.get("title", "").strip()
        link = item.get("link", "").strip()
        if not title or not link:
            continue
        # 去重
        exists = db.query(Resource).filter(Resource.title == title).first()
        if exists:
            continue
        r = Resource(
            title=title,
            category=item.get("category", "短剧"),
            description=item.get("description", ""),
            source=item.get("source", "夸克网盘"),
            link=link,
            episodes=item.get("episodes", ""),
            actors=item.get("actors", ""),
            is_hot=item.get("is_hot", False),
            click_count=item.get("click_count", 0),
        )
        db.add(r)
        count += 1
    db.commit()
    db.close()
    return {"message": f"导入成功，新增 {count} 条", "count": count}


@app.get("/api/admin/stats")
def admin_stats():
    """管理后台 - 统计信息"""
    db = next(get_db())
    total = db.query(Resource).count()
    active = db.query(Resource).filter(Resource.status == "active").count()
    hot = db.query(Resource).filter(Resource.is_hot == True).count()
    pending_sub = db.query(Submission).filter(Submission.status == "pending").count()
    db.close()
    return {
        "total_resources": total,
        "active_resources": active,
        "hot_resources": hot,
        "pending_submissions": pending_sub,
    }


# ==================== 管理后台API ====================

@app.get("/api/admin/resources")
def admin_list_resources(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = "",
):
    """管理后台 - 资源列表"""
    db = next(get_db())
    query = db.query(Resource)
    if status:
        query = query.filter(Resource.status == status)
    total = query.count()
    items = query.order_by(desc(Resource.created_at)) \
                 .offset((page - 1) * page_size) \
                 .limit(page_size) \
                 .all()
    db.close()
    return {
        "data": [_resource_to_dict(r) for r in items],
        "total": total,
    }


@app.post("/api/admin/resources")
def admin_add_resource(resource: dict):
    """管理后台 - 添加资源"""
    db = next(get_db())
    r = Resource(
        title=resource["title"],
        category=resource.get("category", "短剧"),
        description=resource.get("description", ""),
        source=resource.get("source", "夸克网盘"),
        link=resource["link"],
        episodes=resource.get("episodes", ""),
        actors=resource.get("actors", ""),
        is_hot=resource.get("is_hot", False),
    )
    db.add(r)
    db.commit()
    db.close()
    return {"message": "添加成功", "id": r.id}


@app.put("/api/admin/resources/{resource_id}")
def admin_update_resource(resource_id: int, data: dict):
    """管理后台 - 更新资源"""
    db = next(get_db())
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        db.close()
        raise HTTPException(404, "资源不存在")
    for key in ["title", "category", "description", "source", "link",
                "episodes", "actors", "is_hot", "status"]:
        if key in data:
            setattr(r, key, data[key])
    db.commit()
    db.close()
    return {"message": "更新成功"}


@app.delete("/api/admin/resources/{resource_id}")
def admin_delete_resource(resource_id: int):
    """管理后台 - 删除资源"""
    db = next(get_db())
    r = db.query(Resource).filter(Resource.id == resource_id).first()
    if not r:
        db.close()
        raise HTTPException(404, "资源不存在")
    db.delete(r)
    db.commit()
    db.close()
    return {"message": "删除成功"}


@app.get("/api/admin/submissions")
def admin_list_submissions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = "pending",
):
    """管理后台 - 投稿列表"""
    db = next(get_db())
    query = db.query(Submission)
    if status:
        query = query.filter(Submission.status == status)
    total = query.count()
    items = query.order_by(desc(Submission.created_at)) \
                 .offset((page - 1) * page_size) \
                 .limit(page_size) \
                 .all()
    db.close()
    return {
        "data": [{
            "id": s.id,
            "title": s.title,
            "category": s.category,
            "link": s.link,
            "source": s.source,
            "description": s.description,
            "contact": s.contact,
            "status": s.status,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M"),
        } for s in items],
        "total": total,
    }


@app.post("/api/admin/submissions/{sub_id}/approve")
def approve_submission(sub_id: int):
    """审核通过 - 投稿转为正式资源"""
    db = next(get_db())
    sub = db.query(Submission).filter(Submission.id == sub_id).first()
    if not sub:
        db.close()
        raise HTTPException(404, "投稿不存在")

    resource = Resource(
        title=sub.title,
        category=sub.category,
        description=sub.description,
        source=sub.source,
        link=sub.link,
        submitter=sub.contact or "用户投稿",
    )
    db.add(resource)
    sub.status = "approved"
    db.commit()
    db.close()
    return {"message": "审核通过，已转为正式资源"}


@app.post("/api/admin/submissions/{sub_id}/reject")
def reject_submission(sub_id: int):
    """审核驳回"""
    db = next(get_db())
    sub = db.query(Submission).filter(Submission.id == sub_id).first()
    if not sub:
        db.close()
        raise HTTPException(404, "投稿不存在")
    sub.status = "rejected"
    db.commit()
    db.close()
    return {"message": "已驳回"}


# ==================== 辅助函数 ====================

def _resource_to_dict(r: Resource) -> dict:
    """将Resource对象转为字典"""
    return {
        "id": r.id,
        "title": r.title,
        "category": r.category,
        "description": r.description,
        "source": r.source,
        "link": r.link,
        "cover": r.cover,
        "episodes": r.episodes,
        "actors": r.actors,
        "is_hot": r.is_hot,
        "click_count": r.click_count,
        "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
        "updated_at": r.updated_at.strftime("%Y-%m-%d %H:%M") if r.updated_at else "",
    }


def _seed_data(db: Session):
    """初始化示例数据"""
    samples = [
        Resource(title="家里家外（79集）王道铁&孙艺燃", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/e89c96061b97", episodes="79集", actors="王道铁&孙艺燃",
                 is_hot=True),
        Resource(title="家里家外2（111集）王道铁＆孙艺燃", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/b6036de25673", episodes="111集", actors="王道铁＆孙艺燃",
                 is_hot=True),
        Resource(title="双向欲臣（95集）", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/6002fc752e23", episodes="95集", is_hot=True),
        Resource(title="回到70年代霸道婆婆带我飞（95集）马晓伟&蔡欣洋", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/38dd56abcf99", episodes="95集", actors="马晓伟&蔡欣洋",
                 is_hot=True),
        Resource(title="关于黎秘书的一切", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/cf184ee756c8", is_hot=True),
        Resource(title="未婚妻与他人领证，我撤资离场", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/277ee2e3fd25"),
        Resource(title="迷情", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/efeda2b24dee", is_hot=True),
        Resource(title="我在姜府当奶娘的日子", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/710e13bf4850"),
        Resource(title="江南第一深情", category="短剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/a662ce26dfc6", is_hot=True),
        Resource(title="封神第二部：战火西岐", category="电影", source="夸克网盘",
                 link="https://pan.quark.cn/s/example001", is_hot=True),
        Resource(title="唐探1900", category="电影", source="夸克网盘",
                 link="https://pan.quark.cn/s/example002", is_hot=True),
        Resource(title="唐朝诡事录", category="电视剧", source="夸克网盘",
                 link="https://pan.quark.cn/s/example003", is_hot=True),
        Resource(title="凡人修仙传", category="动漫", source="夸克网盘",
                 link="https://pan.quark.cn/s/example004", is_hot=True),
        Resource(title="你好，星期六", category="综艺", source="夸克网盘",
                 link="https://pan.quark.cn/s/example005"),
    ]
    for s in samples:
        db.add(s)
    db.commit()
