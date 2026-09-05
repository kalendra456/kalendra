"""Regression checks for KALENDRA/OS window interactions using real browser events."""
from pathlib import Path
import json, os, shutil
from playwright.sync_api import sync_playwright
BASE = os.environ.get('PORTFOLIO_URL', 'https://kalendra456.github.io/kalendra/').rstrip('/') + '/'
OUT = Path(os.environ.get('CHECK_OUTPUT', 'verification/windows'))
OUT.mkdir(parents=True, exist_ok=True)
checks, errors = [], []
def check(label, ok):
    checks.append({'name': label, 'passed': bool(ok)})
    print(('PASS ' if ok else 'FAIL ') + label, flush=True)
    if not ok:
        raise AssertionError(label)
def box(p, id='home'):
    return p.locator('#window-' + id).bounding_box()
def close_enough(a, b):
    return all(abs(a[k] - b[k]) < 2 for k in ('x', 'y', 'width', 'height'))
def drag(p, start, dx, dy):
    p.mouse.move(*start)
    p.mouse.down()
    p.mouse.move(start[0]+dx, start[1]+dy, steps=8)
    p.mouse.up()
    p.wait_for_timeout(80)
def title_point(r):
    return (r['x'] + min(190, r['width']*.4), r['y']+23)
def click(p, action, id='home'):
    p.locator(f'#window-{id} [data-window-action="{action}"]').click()
    p.wait_for_timeout(80)
def contained(p, id='home'):
    r = box(p, id)
    a = p.locator('#window-layer').bounding_box()
    dock = p.locator('.dock').bounding_box()
    bar = p.locator('.system-bar').bounding_box()
    return r['x'] >= a['x'] and r['y'] >= bar['y']+bar['height'] and r['x']+r['width'] <= a['x']+a['width']+1 and r['y']+r['height'] < dock['y']
def load(context, w=1440, h=900):
    p = context.new_page()
    p.set_viewport_size({'width': w, 'height': h})
    p.set_default_timeout(15000)
    p.on('pageerror', lambda e: errors.append(str(e)))
    r = p.goto(BASE+'os/index.html?portfolio-view=os', wait_until='domcontentloaded', timeout=60000)
    check(f'{w}: OS responds', r.status == 200)
    p.wait_for_selector('#window-home')
    p.wait_for_timeout(350)
    return p
try:
    with sync_playwright() as pw:
        options = {'headless': True, 'args': ['--no-sandbox']}
        chrome = shutil.which('chromium') or shutil.which('google-chrome')
        if chrome:
            options['executable_path'] = chrome
        browser = pw.chromium.launch(**options)
        ctx = browser.new_context(viewport={'width':1440,'height':900}, reduced_motion='reduce')
        p = load(ctx)
        r = box(p)
        check('Floating window inside usable desktop', contained(p))
        check('All eight resize directions exist', p.locator('#window-home [data-resize]').count() == 8)
        for _ in range(3):
            click(p,'maximize')
            maxr = box(p)
            check('Maximize fills desktop without covering dock', contained(p) and maxr['width'] > r['width'])
            check('Maximize becomes Restore control', p.locator('#window-home [data-window-action=maximize]').get_attribute('aria-label') == 'Restore window')
            check('Resize handles unavailable while maximized', p.locator('#window-home [data-resize]:visible').count() == 0)
            click(p,'maximize')
            check('Restore returns exact size and position', close_enough(r,box(p)))
        p.locator('#window-home .window-titlebar').dblclick(position={'x':200,'y':24})
        p.wait_for_timeout(70)
        check('Title-bar double-click maximizes', p.locator('#window-home').get_attribute('data-window-mode') == 'maximized')
        p.locator('#window-home .window-titlebar').dblclick(position={'x':200,'y':24})
        p.wait_for_timeout(70)
        check('Title-bar double-click restores exact rectangle', close_enough(r,box(p)))
        p.keyboard.press('Alt+Enter')
        p.wait_for_timeout(80)
        check('Alt+Enter maximizes', p.locator('#window-home').get_attribute('data-window-mode') == 'maximized')
        p.keyboard.press('Alt+Enter')
        p.wait_for_timeout(80)
        check('Alt+Enter restores', close_enough(r,box(p)))
        for edge, dx, dy in [('e',55,0),('w',-35,0),('n',0,-15),('s',0,12),('ne',20,-8),('nw',-15,-7),('sw',-14,10),('se',25,12)]:
            before = box(p)
            handle = p.locator(f'#window-home [data-resize="{edge}"]').bounding_box()
            drag(p,(handle['x']+handle['width']/2,handle['y']+handle['height']/2),dx,dy)
            after = box(p)
            check(edge+': pointer resize changes size', abs(after['width']-before['width']) > 2 or abs(after['height']-before['height']) > 2)
            check(edge+': resize remains bounded', contained(p))
            if 'e' in edge:
                check(edge+': left edge stays fixed', abs(after['x']-before['x']) < 2)
            if 'w' in edge:
                check(edge+': right edge stays fixed', abs(after['x']+after['width']-before['x']-before['width']) < 2)
            if 'n' in edge:
                check(edge+': bottom edge stays fixed', abs(after['y']+after['height']-before['y']-before['height']) < 2)
        handle = p.locator('#window-home .resize-grip').bounding_box()
        drag(p,(handle['x']+13,handle['y']+13),-1400,-1000)
        r = box(p)
        check('Minimum size is enforced without inversion', abs(r['width']-380) < 2 and abs(r['height']-300) < 2)
        p.locator('#window-home .resize-grip').focus()
        p.keyboard.press('ArrowRight')
        p.keyboard.press('Shift+ArrowDown')
        p.wait_for_timeout(80)
        r = box(p)
        check('Keyboard resize and larger Shift steps', abs(r['width']-400) < 2 and abs(r['height']-350) < 2)
        grip = p.locator('#window-home .resize-grip').bounding_box()
        p.mouse.move(grip['x']+12,grip['y']+12)
        p.mouse.down()
        p.mouse.move(grip['x']+100,grip['y']+80,steps=4)
        p.wait_for_timeout(80)
        check('Live dimensions visible while resizing', p.locator('#window-home .wm-size-readout').is_visible())
        p.keyboard.press('Escape')
        p.mouse.up()
        p.wait_for_timeout(80)
        check('Escape cancels resize and restores original rectangle', close_enough(r,box(p)))
        check('Pointer state cleared after cancellation', p.locator('body').get_attribute('class') != 'wm-interacting')
        click(p,'maximize')
        before = box(p)
        drag(p,title_point(before),80,100)
        check('Dragging maximized title bar restores window', p.locator('#window-home').get_attribute('data-window-mode') == 'floating')
        check('Drag-to-restore preserves floating dimensions', abs(box(p)['width']-r['width']) < 2 and abs(box(p)['height']-r['height']) < 2)
        check('Drag-to-restore stays in workspace', contained(p))
        r = box(p)
        drag(p,title_point(r),-2000,-1500)
        check('Window cannot be dragged offscreen', contained(p))
        p.locator('[data-dock=terminal]').click()
        p.wait_for_timeout(80)
        terminal = box(p,'terminal')
        click(p,'maximize','terminal')
        click(p,'minimize','terminal')
        check('Minimizing selects the next visible window', 'is-active' in p.locator('#window-home').get_attribute('class'))
        p.locator('[data-dock=terminal]').click()
        p.wait_for_timeout(80)
        check('Dock restores maximized state', p.locator('#window-terminal').get_attribute('data-window-mode') == 'maximized')
        click(p,'maximize','terminal')
        check('Terminal keeps independent restore geometry', close_enough(terminal,box(p,'terminal')))
        p.locator('#terminal-input').fill('whoami')
        p.locator('#terminal-input').press('Enter')
        check('Terminal remains functional after resizing', 'Yaswanth' in p.locator('.terminal-output').inner_text())
        click(p,'maximize','terminal')
        p.locator('#show-desktop').click()
        p.locator('#show-desktop').click()
        p.wait_for_timeout(80)
        check('Show desktop preserves active window and maximized state', p.locator('#window-terminal.is-active').is_visible() and p.locator('#window-terminal').get_attribute('data-window-mode') == 'maximized')
        p.set_viewport_size({'width':950,'height':660})
        p.wait_for_timeout(250)
        check('Maximized window adapts to browser resize', contained(p,'terminal'))
        p.set_viewport_size({'width':1440,'height':900})
        p.wait_for_timeout(250)
        click(p,'maximize','terminal')
        check('Viewport resize retains saved floating size', close_enough(terminal,box(p,'terminal')))
        p.set_viewport_size({'width':390,'height':844})
        p.wait_for_timeout(250)
        check('Mobile uses bounded full-size panels', contained(p,'terminal') and p.locator('#window-terminal').get_attribute('data-window-mode') == 'mobile')
        check('Mobile does not show unusable resize or maximize controls', p.locator('#window-terminal [data-resize]:visible').count() == 0 and not p.locator('#window-terminal [data-window-action=maximize]').is_visible())
        p.set_viewport_size({'width':1440,'height':900})
        p.wait_for_timeout(250)
        check('Leaving mobile restores desktop size', close_enough(terminal,box(p,'terminal')))
        p.locator('[data-dock=config]').click()
        p.wait_for_timeout(80)
        click(p,'minimize','home')
        p.locator('[data-dock=config]').click()
        p.locator('#window-config [data-arrange]').click()
        p.wait_for_timeout(80)
        check('Arrange preserves active focus rather than insertion order', p.locator('#window-config.is-active').is_visible())
        check('Arrange does not unminimize hidden windows', not p.locator('#window-home').is_visible())
        p.close()
        apps = ['home','profile','surface','findings','lab','recognition','operations','terminal','contact','config']
        issues = []
        for w,h in [(1920,1080),(1440,900),(1024,768),(820,1180),(701,540),(700,850),(390,844),(320,640),(900,430)]:
            page = load(ctx,w,h)
            for app in apps:
                page.locator(f'[data-dock="{app}"]').evaluate('(e)=>e.click()')
                page.wait_for_timeout(30)
                if w > 700:
                    click(page,'maximize',app)
                check(f'{w} {app}: window avoids chrome and dock', contained(page,app))
                body = page.locator(f'#window-{app} .window-body')
                dim = body.evaluate('(e)=>({w:e.clientWidth,sw:e.scrollWidth})')
                if dim['sw'] > dim['w']+1:
                    issues.append([w,app,dim])
                if app == 'home' and w in (1440,390):
                    page.screenshot(path=str(OUT/f'maximized-{w}.png'))
                if w > 700:
                    click(page,'maximize',app)
                    handle = page.locator(f'#window-{app} .resize-grip').bounding_box()
                    drag(page,(handle['x']+12,handle['y']+12),-2000,-1400)
                    dim = body.evaluate('(e)=>({w:e.clientWidth,sw:e.scrollWidth})')
                    if dim['sw'] > dim['w']+1:
                        issues.append([w,app,'minimum',dim])
                if app != 'home':
                    click(page,'close',app)
            page.close()
        check('Content reflows at maximized, mobile and minimum window sizes', not issues)
        check('No uncaught JavaScript errors', not errors)
        ctx.close()
        browser.close()
finally:
    (OUT/'results.json').write_text(json.dumps({'site':BASE,'checks':checks,'javascript_errors':errors,'overflow_issues':globals().get('issues',[])},indent=2), encoding='utf-8')
