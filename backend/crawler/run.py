"""
爬虫命令行入口 - 手动触发爬取并将结果写入数据库
"""
import sys
import os

# 将上级目录加入路径，以便导入 models
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from crawler.spider import run_crawler
from models import init_db, get_db, Resource


def crawl_and_save(keywords=None):
    """爬取资源并保存到数据库"""
    print("正在爬取资源...")
    results = run_crawler(keywords)

    if not results:
        print("未爬取到任何资源")
        return

    init_db()
    db = next(get_db())

    added = 0
    skipped = 0
    for r in results:
        # 去重检查
        exists = db.query(Resource).filter(Resource.link == r["link"]).first()
        if exists:
            skipped += 1
            continue
        resource = Resource(**r)
        db.add(resource)
        added += 1

    db.commit()
    db.close()
    print(f"新增 {added} 条资源，跳过 {skipped} 条重复")


if __name__ == "__main__":
    keywords = sys.argv[1:] if len(sys.argv) > 1 else None
    crawl_and_save(keywords)
