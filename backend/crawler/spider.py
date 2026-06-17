"""
爬虫模块 - 自动采集网盘资源链接
"""
import re
import time
import logging
import httpx
from bs4 import BeautifulSoup
from datetime import datetime

# 日志配置
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")
logger = logging.getLogger(__name__)

# 目标站点配置
TARGET_SITES = [
    {
        "name": "影剧搜",
        "base": "https://so.planorg.cn",
        "search_url": "https://so.planorg.cn/s/{keyword}.html",
        "parser": "planorg",  # 指定解析器
    },
]

# 常见短剧关键词（可扩展）
DEFAULT_KEYWORDS = [
    "短剧", "家里家外", "双向欲臣", "迷情", "花朝",
    "我在姜府当奶娘的日子", "请君入我怀", "江南第一深情",
    "轻烟染日暮", "人前不熟，人后上瘾",
]


class ResourceCrawler:
    """网盘资源爬虫"""

    def __init__(self):
        self.client = httpx.Client(
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            timeout=15.0,
            follow_redirects=True,
        )
        self.results = []

    def crawl(self, keywords=None):
        """执行爬取任务"""
        keywords = keywords or DEFAULT_KEYWORDS
        logger.info(f"开始爬取，关键词数: {len(keywords)}")

        for site in TARGET_SITES:
            for keyword in keywords:
                try:
                    self._crawl_keyword(site, keyword)
                    time.sleep(0.5)  # 礼貌间隔
                except Exception as e:
                    logger.error(f"[{site['name']}] {keyword} 爬取出错: {e}")

        self.client.close()
        logger.info(f"爬取完成，共获取 {len(self.results)} 条资源")
        return self.results

    def _crawl_keyword(self, site, keyword):
        """爬取单个关键词"""
        url = site["search_url"].format(keyword=keyword)
        resp = self.client.get(url)
        resp.encoding = "utf-8"

        if site["parser"] == "planorg":
            self._parse_planorg(resp.text, keyword)
        else:
            self._parse_generic(resp.text, keyword)

    def _parse_planorg(self, html, keyword):
        """解析影剧搜搜索结果页"""
        soup = BeautifulSoup(html, "lxml")

        # 查找资源条目
        items = soup.select("a[href*='/d/']")
        detail_urls = set()
        for a in items:
            href = a.get("href", "")
            text = a.get_text(strip=True)
            if "查看详情" in text and href not in detail_urls:
                detail_urls.add(href)

        logger.info(f"[影剧搜] '{keyword}' 找到 {len(detail_urls)} 个详情页")

        for path in list(detail_urls)[:3]:  # 取前3个
            detail_url = f"https://so.planorg.cn{path}"
            try:
                resp = self.client.get(detail_url)
                resp.encoding = "utf-8"
                resource = self._parse_detail_planorg(resp.text, detail_url)
                if resource:
                    self.results.append(resource)
                    logger.info(f"  → {resource['title']}: {resource['link']}")
                time.sleep(0.3)
            except Exception as e:
                logger.error(f"  详情页解析失败 {detail_url}: {e}")

    def _parse_detail_planorg(self, html, url):
        """解析影剧搜详情页"""
        soup = BeautifulSoup(html, "lxml")

        # 提取标题
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else ""
        # 清理标题
        title = re.sub(r'_[^_]+$', '', title).strip()

        # 提取夸克链接 - 页面文本中查找
        body_text = soup.get_text()
        quark_match = re.search(r'https?://pan\.quark\.cn/s/[a-zA-Z0-9]+', body_text)
        link = quark_match.group(0) if quark_match else ""

        if not title or not link:
            return None

        # 确定分类
        category = "短剧"
        for cat in ["电影", "电视剧", "动漫", "综艺"]:
            if cat in body_text or cat in title:
                category = cat
                break

        return {
            "title": title,
            "category": category,
            "source": "夸克网盘",
            "link": link,
            "description": "",
            "episodes": "",
            "actors": "",
            "is_hot": False,
        }

    def _parse_generic(self, html, keyword):
        """通用解析器（备用）"""
        soup = BeautifulSoup(html, "lxml")
        body_text = soup.get_text()

        # 提取夸克链接
        quark_links = re.findall(r'https?://pan\.quark\.cn/s/[a-zA-Z0-9]+', body_text)
        for link in quark_links[:3]:
            self.results.append({
                "title": keyword,
                "category": "短剧",
                "source": "夸克网盘",
                "link": link,
                "description": "",
                "episodes": "",
                "actors": "",
                "is_hot": False,
            })


def run_crawler(keywords=None):
    """运行爬虫（供外部调用）"""
    crawler = ResourceCrawler()
    return crawler.crawl(keywords)


if __name__ == "__main__":
    print("=" * 50)
    print("夸克搜 - 资源爬虫")
    print("=" * 50)
    results = run_crawler()
    print(f"\n共获取 {len(results)} 条资源:")
    for r in results:
        print(f"  [{r['category']}] {r['title']}")
        print(f"    {r['link']}")
