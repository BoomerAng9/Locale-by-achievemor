from playwright.async_api import async_playwright
import httpx
import asyncio
import logging

logger = logging.getLogger(__name__)

class URLFetcher:
    def __init__(self):
        self.browser = None
        self.http_client = httpx.AsyncClient(timeout=10)
    
    async def fetch(self, url: str, use_js: bool = True) -> dict:
        """
        Fetch URL content.
        Try JS rendering first (Playwright), fall back to HTTP.
        """
        try:
            # Try HTTP first (faster)
            response = await self.http_client.get(url)
            if response.status_code == 200:
                return {
                    "status": 200,
                    "content": response.text,
                    "method": "http"
                }
        except Exception as e:
            logger.warning(f"HTTP fetch failed for {url}: {e}")
        
        if use_js:
            try:
                # Fall back to Playwright for JS-heavy sites
                async with async_playwright() as p:
                    # In production we might want to attach to a persistent browser, but for now launch new
                    browser = await p.chromium.launch(headless=True)
                    page = await browser.new_page()
                    await page.goto(url, wait_until="networkidle")
                    content = await page.content()
                    await browser.close()
                    return {
                        "status": 200,
                        "content": content,
                        "method": "playwright"
                    }
            except Exception as e:
                logger.error(f"Playwright fetch failed for {url}: {e}")
                return {"status": 0, "error": str(e)}
        
        return {"status": 0, "error": "Failed to fetch"}
