"""
导入501条短剧数据到数据库
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))

from models import init_db, SessionLocal, Resource

def import_data(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    init_db()
    db = SessionLocal()

    # 清空旧数据（可选）
    # db.query(Resource).delete()

    count = 0
    for item in items:
        title = item.get('title', '').strip()
        link = item.get('link', '').strip()
        if not title or not link:
            continue
        # 去重
        exists = db.query(Resource).filter(Resource.title == title).first()
        if exists:
            continue
        r = Resource(
            title=title,
            category=item.get('category', '短剧'),
            description=item.get('description', ''),
            source=item.get('source', '夸克网盘'),
            link=link,
            episodes=item.get('episodes', ''),
            actors=item.get('actors', ''),
            is_hot=item.get('is_hot', False),
            click_count=item.get('click_count', 0),
        )
        db.add(r)
        count += 1

    db.commit()
    total = db.query(Resource).count()
    db.close()
    print(f'✅ 导入完成: 新增 {count} 条, 数据库总计 {total} 条')

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else '/workspace/quark-search-短剧数据.json'
    import_data(path)
