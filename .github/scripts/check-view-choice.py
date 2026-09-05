"""Browser regression checks for both portfolio entry routes."""
from pathlib import Path
import json
import os
import shutil
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

BASE = os.environ.get('PORTFOLIO_URL', 'https://kalendra456.github.io/kalendra/').rstrip('/') + '/'
OUT = Path(os.environ.get('CHECK_OUTPUT', 'view-choice-verification'))
OUT.mkdir(parents=True, exist_ok=True)
checks, errors = [], []

def check(name, condition):
    checks.append({'name': name, 'passed': bool(condition)})
    print(('PASS ' if condition else 'FAIL ') + name, flush=True)
    if not condition:
        raise AssertionError(name)

def watch(page):
    page.set_default_timeout(12000)
    page.on('pageerror', lambda error: errors.append(str(error)))

def visit(page, route=''):
    response = page.goto(BASE + route, wait_until='domcontentloaded', timeout=60000)
    check('HTTP 200: ' + (route or 'Recruiter View'), response.status == 200)
    page.locator('#portfolio-view-dialog[open]').wait_for(state='visible')
    return page.locator('#portfolio-view-dialog')

try:
    with sync_playwright() as p:
        chrome = shutil.which('google-chrome') or shutil.which('chromium')
        options = {'headless': True, 'args': ['--no-sandbox']}
        if chrome:
            options['executable_path'] = chrome
        browser = p.chromium.launch(**options)
        for width, height in [(1440, 900), (768, 1024), (390, 844), (320, 640)]:
            for route, view in [('', 'recruiter'), ('os/', 'os')]:
                context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
                page = context.new_page()
                watch(page)
                modal = visit(page, route)
                check(f'{view} {width}: both choices present', modal.locator('[data-view]').count() == 2)
                box = modal.bounding_box()
                check(f'{view} {width}: prompt fits viewport', box['x'] >= -1 and box['y'] >= -1 and box['x'] + box['width'] <= width + 1 and box['y'] + box['height'] <= height + 1)
                check(f'{view} {width}: no horizontal dialog overflow', modal.evaluate('(e) => e.scrollWidth <= e.clientWidth + 1'))
                if width in (1440, 390):
                    page.screenshot(path=str(OUT / f'{view}-{width}.png'))
                modal.locator(f'[data-view="{view}"]').click()
                check(f'{view} {width}: same-view choice dismisses', not modal.is_visible())
                toggle = page.locator('.vc-toggle')
                check(f'{view} {width}: switch control available', toggle.count() == 1 and toggle.is_visible())
                toggle.click()
                check(f'{view} {width}: switch control reopens chooser', modal.is_visible())
                page.keyboard.press('Escape')
                check(f'{view} {width}: Escape restores focus', toggle.evaluate('(e) => document.activeElement === e'))
                context.close()

        context = browser.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
        page = context.new_page()
        watch(page)
        modal = visit(page)
        modal.locator('[data-view="os"]').click()
        page.wait_for_url(lambda url: urlsplit(url).path == urlsplit(BASE + 'os/').path)
        page.wait_for_selector('#portfolio-view-dialog', state='attached')
        check('Recruiter to OS: no repeat prompt', not page.locator('#portfolio-view-dialog').is_visible())
        check('OS landing: handoff parameter consumed', 'portfolio-view=' not in page.url)
        page.locator('[data-dock="terminal"]').click()
        check('OS terminal remains functional', page.locator('#window-terminal').is_visible())
        page.locator('.vc-toggle').click()
        for _ in range(6):
            page.keyboard.press('Tab')
            check('Focus stays inside welcome dialog', page.evaluate("document.querySelector('#portfolio-view-dialog').contains(document.activeElement)"))
        page.keyboard.press('Control+k')
        check('Chooser blocks background OS shortcuts', not page.locator('#command-palette').is_visible())
        page.locator('#portfolio-view-dialog [data-view="recruiter"]').click()
        page.wait_for_url(lambda url: urlsplit(url).path == urlsplit(BASE).path)
        page.wait_for_selector('#portfolio-view-dialog', state='attached')
        check('OS to Recruiter: correct route', '/os/' not in page.url)
        check('OS to Recruiter: no repeat prompt', not page.locator('#portfolio-view-dialog').is_visible())
        check('Recruiter landing: handoff parameter consumed', 'portfolio-view=' not in page.url)
        page.reload(wait_until='domcontentloaded')
        page.locator('#portfolio-view-dialog[open]').wait_for(state='visible')
        check('Reload asks again rather than saving a default', page.locator('#portfolio-view-dialog').is_visible())
        page.locator('#portfolio-view-dialog [data-view="recruiter"]').click()
        page.locator('a.os-launch').click()
        page.wait_for_url(lambda url: urlsplit(url).path == urlsplit(BASE + 'os/').path)
        page.wait_for_selector('#portfolio-view-dialog', state='attached')
        check('Existing explicit OS launcher avoids duplicate prompt', not page.locator('#portfolio-view-dialog').is_visible())
        page.keyboard.press('Control+k')
        check('OS command palette works after choosing', page.locator('#command-palette').is_visible())
        page.keyboard.press('Escape')
        context.close()

        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        context.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage disabled');}}); Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Storage disabled');}});")
        page = context.new_page()
        watch(page)
        modal = visit(page, 'os/#terminal')
        modal.locator('[data-view="os"]').click()
        check('Storage-disabled browsers can choose a view', not modal.is_visible())
        check('Same-view selection preserves OS deep link', page.url.endswith('#terminal') and page.locator('#window-terminal').is_visible())
        page.locator('[data-theme-toggle]').first.click()
        page.locator('.vc-toggle').click()
        page.screenshot(path=str(OUT / 'os-light.png'))
        check('Light-theme chooser uses light palette', modal.evaluate('(e) => getComputedStyle(e).getPropertyValue("--vc-bg").trim()') == '#f4f8fa')
        context.close()

        context = browser.new_context(java_script_enabled=False)
        page = context.new_page()
        page.goto(BASE, wait_until='domcontentloaded')
        check('No-JavaScript visitors retain the standard portfolio', page.locator('a.os-launch').is_visible() and page.locator('#portfolio-view-dialog').count() == 0)
        context.close()
        check('No JavaScript runtime errors', not errors)
        browser.close()
finally:
    (OUT / 'results.json').write_text(json.dumps({'site': BASE, 'checks': checks, 'javascript_errors': errors}, indent=2), encoding='utf-8')
