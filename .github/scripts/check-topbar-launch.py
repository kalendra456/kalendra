"""Check the real header, both navigation directions and progressive enhancement."""
from pathlib import Path
import json
import os
import shutil
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

BASE = os.environ.get('PORTFOLIO_URL', 'https://kalendra456.github.io/kalendra/').rstrip('/') + '/'
OUT = Path(os.environ.get('CHECK_OUTPUT', 'verification/topbar'))
OUT.mkdir(parents=True, exist_ok=True)
checks, errors = [], []

def check(name, passed):
    checks.append({'name': name, 'passed': bool(passed)})
    print(('PASS ' if passed else 'FAIL ') + name, flush=True)
    assert passed, name

def within(box, width, height):
    return box and box['x'] >= -1 and box['y'] >= -1 and box['x'] + box['width'] <= width + 1 and box['y'] + box['height'] <= height + 1

try:
    with sync_playwright() as p:
        chrome = shutil.which('google-chrome') or shutil.which('chromium')
        options = {'headless': True, 'args': ['--no-sandbox']}
        if chrome:
            options['executable_path'] = chrome
        browser = p.chromium.launch(**options)
        for width in (1920, 1440, 1380, 1280, 1024, 901, 900, 768, 601, 600, 520, 390, 360, 320):
            context = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce', color_scheme='dark')
            page = context.new_page()
            page.set_default_timeout(15000)
            page.on('pageerror', lambda error: errors.append(str(error)))
            response = page.goto(BASE, wait_until='domcontentloaded', timeout=60000)
            check(f'{width}: homepage responds', response.status == 200)
            page.locator('#portfolio-view-dialog[open] .vc-stay').click()
            header = page.locator('#siteHeader')
            launch = header.locator('a.topbar-os-launch')
            check(f'{width}: one visible launch button in top bar', launch.count() == 1 and launch.is_visible())
            check(f'{width}: full launch label visible', launch.inner_text().strip() == 'Launch KALENDRA/OS')
            check(f'{width}: launch fits screen', within(launch.bounding_box(), width, 900))
            check(f'{width}: header does not overflow', header.evaluate('(e) => e.scrollWidth <= e.clientWidth + 1'))
            check(f'{width}: header controls do not overlap', header.evaluate('''e => {
              const nodes = [...e.querySelectorAll('.header-inner > .brand,.desktop-nav,.header-actions > *')].filter(n => n.getBoundingClientRect().width && getComputedStyle(n).display !== 'none');
              return nodes.every((a,i) => nodes.slice(i+1).every(b => {
                const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
                return Math.min(x.right,y.right)-Math.max(x.left,y.left)<=1 || Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)<=1;
              }));
            }'''))
            page.wait_for_function("document.querySelector('#siteHeader img.brand-mark').complete")
            check(f'{width}: existing logo decodes', header.locator('img.brand-mark').evaluate('(e) => e.complete && e.naturalWidth > 0'))
            page.evaluate('window.scrollTo(0,document.body.scrollHeight)')
            page.wait_for_timeout(200)
            check(f'{width}: launch stays visible after scrolling', within(launch.bounding_box(), width, 900))
            if width in (1440, 768, 390):
                page.screenshot(path=str(OUT / f'topbar-{width}.png'))
            if width <= 1380:
                page.locator('#menuToggle').click()
                check(f'{width}: section navigation remains available', page.locator('#mobileNav').is_visible())
                page.locator('#menuToggle').click()
            context.close()

        context = browser.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce', color_scheme='dark')
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE, wait_until='domcontentloaded')
        page.locator('#portfolio-view-dialog[open] .vc-stay').click()
        page.locator('#siteHeader .topbar-os-launch').click()
        page.wait_for_url(lambda u: urlsplit(u).path == urlsplit(BASE + 'os/').path)
        page.wait_for_selector('#portfolio-view-dialog', state='attached')
        check('Top-bar link opens the OS without a second prompt', not page.locator('#portfolio-view-dialog').is_visible())
        page.locator('[data-dock="terminal"]').click()
        check('Terminal still opens', page.locator('#window-terminal').is_visible())
        page.locator('.vc-toggle').click()
        check('OS top bar reopens both view choices', page.locator('#portfolio-view-dialog[open] [data-view]').count() == 2)
        page.locator('#portfolio-view-dialog [data-view="recruiter"]').click()
        page.wait_for_url(lambda u: urlsplit(u).path == urlsplit(BASE).path)
        page.wait_for_selector('#portfolio-view-dialog', state='attached')
        check('Return to Recruiter View works without a repeat prompt', not page.locator('#portfolio-view-dialog').is_visible())
        page.locator('#themeToggle').click()
        page.screenshot(path=str(OUT / 'topbar-light.png'))
        check('Launch remains visible in light theme', page.locator('#siteHeader .topbar-os-launch').is_visible())
        context.close()
        for width in (1440, 320):
            context = browser.new_context(java_script_enabled=False, viewport={'width': width, 'height': 900})
            page = context.new_page()
            page.goto(BASE, wait_until='domcontentloaded')
            link = page.locator('#siteHeader a.topbar-os-launch')
            check(f'{width}: native launch works without JavaScript', link.is_visible() and 'os/' in link.get_attribute('href') and within(link.bounding_box(), width, 900))
            context.close()
        check('No JavaScript errors', not errors)
        browser.close()
finally:
    (OUT / 'results.json').write_text(json.dumps({'site': BASE, 'checks': checks, 'javascript_errors': errors}, indent=2), encoding='utf-8')
