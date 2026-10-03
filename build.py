#!/usr/bin/env python3
"""Bundle src/ into one page: dist/artifact.html (Claude artifact) and dist/index.html (iPhone web app)."""
import json, os, pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "dist"
DIST.mkdir(exist_ok=True)
VERSION = "2.1.0"

css = (SRC / "styles.css").read_text() + "\n#home{overflow-y:auto}\n" + (SRC / "cards.css").read_text()
js = "\n".join((SRC / f).read_text() for f in ("core.js", "game.js", "progress.js")) + "\nrenderHome();\n"
body = (SRC / "body.html").read_text()
fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&family=Rubik:wght@400;500;600;700;800&display=swap">')

page = f"<title>Swirl Hold'em</title>\n{fonts}\n<style>\n{css}\n</style>\n{body}\n<script>\n{js}\n</script>\n"
(DIST / "artifact.html").write_text(page)

head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Hold'em">
<meta name="theme-color" content="#17131f">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" href="icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
<title>Swirl Hold'em</title>
{fonts}
<style>
:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
{css}
</style>
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
"""
(DIST / "index.html").write_text(head)

manifest = {
    "name": "Swirl Hold'em", "short_name": "Hold'em", "start_url": "./", "scope": "./",
    "display": "standalone", "orientation": "portrait", "background_color": "#17131f", "theme_color": "#17131f",
    "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
}
(DIST / "manifest.webmanifest").write_text(json.dumps(manifest, indent=2))

sw = f"""const CACHE='swirl-holdem-{VERSION}';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));}});
self.addEventListener('activate',e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));}});
self.addEventListener('fetch',e=>{{
  const req=e.request;if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===location.origin){{
    // network first for the page so updates arrive, cache fallback for offline
    e.respondWith(fetch(req).then(r=>{{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;}}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  }} else if(/fonts\\.(googleapis|gstatic)\\.com/.test(url.hostname)){{
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;}})));
  }}
}});
"""
(DIST / "sw.js").write_text(sw)

# ---- pixel icon: red swirl-back card with a cream spade on deep purple ----
SPADE = ["...X...", "..XXX..", ".XXXXX.", "XXXXXXX", "XXXXXXX", "XX.X.XX", "..XXX.."]
def icon(size):
    s = 32  # draw on a 32px grid, scale up crisp
    im = Image.new("RGB", (s, s), "#2a1840")
    d = ImageDraw.Draw(im)
    for y in range(s):  # banded swirl-ish background
        for x in range(s):
            if ((x * 3 + y * 5) // 7 + (x * y) // 40) % 4 == 0:
                im.putpixel((x, y), (60, 34, 92))
    d.rectangle([7, 3, 25, 28], fill="#17131f")          # shadow/outline
    d.rectangle([8, 3, 24, 26], fill="#f5f0e6")          # card face
    d.rectangle([8, 3, 24, 3], fill="#17131f")
    for y, row in enumerate(SPADE):
        for x, ch in enumerate(row):
            if ch == "X":
                d.rectangle([9 + x * 2, 9 + y * 2, 10 + x * 2, 10 + y * 2], fill="#2d2f45")
    # gold A in the corner
    A = [".X.", "X.X", "XXX", "X.X"]
    for y, row in enumerate(A):
        for x, ch in enumerate(row):
            if ch == "X":
                im.putpixel((10 + x, 5 + y - 1), (226, 54, 74))
    return im.resize((size, size), Image.NEAREST)
for n in (180, 192, 512):
    icon(n).save(DIST / f"icon-{n}.png")
print("built", {p.name: p.stat().st_size for p in DIST.iterdir()})
