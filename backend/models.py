"""
数据库模型 - 夸克搜
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./quark_search.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Resource(Base):
    """资源表 - 存储所有网盘资源"""
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)          # 资源标题
    category = Column(String(20), default="短剧", index=True)         # 分类：短剧/电影/电视剧/动漫/综艺
    description = Column(Text, default="")                           # 资源描述
    source = Column(String(20), default="夸克网盘", index=True)       # 网盘来源
    link = Column(String(500), nullable=False)                       # 网盘分享链接
    cover = Column(String(500), default="")                          # 封面图URL
    episodes = Column(String(50), default="")                        # 集数（如"95集"）
    actors = Column(String(200), default="")                         # 主演
    status = Column(String(10), default="active", index=True)        # active/expired/disabled
    is_hot = Column(Boolean, default=False, index=True)              # 是否热门推荐
    click_count = Column(Integer, default=0)                         # 点击次数
    submitter = Column(String(50), default="")                       # 提交者（用户投稿时记录）
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Submission(Base):
    """用户投稿表"""
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(20), default="短剧")
    link = Column(String(500), nullable=False)
    source = Column(String(20), default="夸克网盘")
    description = Column(Text, default="")
    contact = Column(String(100), default="")                        # 联系方式（可选）
    status = Column(String(10), default="pending")                   # pending/approved/rejected
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """初始化数据库，创建表"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
