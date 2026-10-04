#!/usr/bin/env python3
"""Bundle src/ into one page: dist/artifact.html (Claude artifact) and dist/index.html (iPhone web app)."""
import json, os, pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "dist"
DIST.mkdir(exist_ok=True)
VERSION = "6.0.0"

js = "\n".join((SRC / f).read_text() for f in ("core.js", "game.js", "progress.js")) + "\nrenderHome();\n"
body = (SRC / "body.html").read_text()
fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap">')

# ---- PixNum: a tiny pixel font for digits only, drawn so 2 and 5 never blur ----
import base64, io
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
DIG = {
 '0':[".XXX.","X...X","X..XX","X.X.X","XX..X","X...X",".XXX."],
 '1':["..X..",".XX..","..X..","..X..","..X..","..X..",".XXX."],
 '2':[".XXX.","X...X","....X","...X.","..X..",".X...","XXXXX"],
 '3':["XXXX.","....X","....X",".XXX.","....X","....X","XXXX."],
 '4':["...X.","..XX.",".X.X.","X..X.","XXXXX","...X.","...X."],
 '5':["XXXXX","X....","XXXX.","....X","....X","X...X",".XXX."],
 '6':["..XX.",".X...","X....","XXXX.","X...X","X...X",".XXX."],
 '7':["XXXXX","....X","...X.","..X..",".X...",".X...",".X..."],
 '8':[".XXX.","X...X","X...X",".XXX.","X...X","X...X",".XXX."],
 '9':[".XXX.","X...X","X...X",".XXXX","....X","...X.",".XX.."],
}
U = 100  # one pixel in font units; digits are 7 px = 700 units tall
names = ['.notdef'] + ['d' + k for k in DIG]
fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder(names)
fb.setupCharacterMap({ord(k): 'd' + k for k in DIG})
glyphs, metrics = {}, {}
pen = TTGlyphPen(None); glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (600, 0)
for k, rows in DIG.items():
    pen = TTGlyphPen(None)
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch == 'X':
                x0, y0 = 50 + c * U, (6 - r) * U
                pen.moveTo((x0, y0)); pen.lineTo((x0, y0 + U)); pen.lineTo((x0 + U, y0 + U)); pen.lineTo((x0 + U, y0)); pen.closePath()
    glyphs['d' + k] = pen.glyph(); metrics['d' + k] = (620, 50)
fb.setupGlyf(glyphs); fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=900, descent=-200)
fb.setupNameTable({'familyName': 'PixNum', 'styleName': 'Regular'})
fb.setupOS2(sTypoAscender=900, sTypoDescender=-200, usWinAscent=900, usWinDescent=200, sCapHeight=700, sxHeight=500)
fb.setupPost()
buf = io.BytesIO(); fb.save(buf)
PIXNUM = ("@font-face{font-family:'PixNum';src:url(data:font/ttf;base64," + base64.b64encode(buf.getvalue()).decode() +
          ") format('truetype');unicode-range:U+0030-0039;font-display:block}\n")
css = PIXNUM + (SRC / "styles.css").read_text() + "\n#home{overflow-y:auto}\n" + (SRC / "cards.css").read_text()

import base64 as _b64
RABBIT = "data:image/png;base64," + _b64.b64encode((ROOT / "assets" / "rabbit_px.png").read_bytes()).decode()
CHIP = "data:image/png;base64," + _b64.b64encode((ROOT / "assets" / "chip.png").read_bytes()).decode()
body = body.replace("RABBIT_SRC", RABBIT).replace("CHIP_SRC", CHIP)
page = f"<title>Dead Rabbit</title>\n{fonts}\n<style>\n{css}\n</style>\n{body}\n<script>\n{js}\n</script>\n"
(DIST / "artifact.html").write_text(page)

head = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Dead Rabbit">
<meta name="theme-color" content="#17131f">
<link rel="apple-touch-icon" sizes="180x180" href="icon-180-v5.png">
<link rel="icon" type="image/png" href="favicon-v5.png">
<link rel="manifest" href="manifest.webmanifest?v=5">
<title>Dead Rabbit</title>
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
    "name": "Dead Rabbit", "short_name": "Dead Rabbit", "start_url": "./", "scope": "./",
    "display": "standalone", "orientation": "portrait", "background_color": "#17131f", "theme_color": "#17131f",
    "icons": [{"src": "icon-192-v5.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icon-512-v5.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
}
(DIST / "manifest.webmanifest").write_text(json.dumps(manifest, indent=2))

sw = f"""const CACHE='dead-rabbit-{VERSION}';
const CORE=['./','index.html','manifest.webmanifest','icon-180-v5.png','icon-192-v5.png','icon-512-v5.png','favicon-v5.png'];
self.addEventListener('install',e=>{{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));}});
self.addEventListener('activate',e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));}});
self.addEventListener('fetch',e=>{{
  const req=e.request;if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===location.origin){{
    // network first for the page so updates arrive, cache fallback for offline
    e.respondWith(fetch(req).then(r=>{{if(r.status===200){{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp)).catch(()=>{{}});}}return r;}}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  }} else if(/fonts\\.(googleapis|gstatic)\\.com/.test(url.hostname)){{
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;}})));
  }}
}});
"""
(DIST / "sw.js").write_text(sw)

# ---- icons + music come from assets/ (supplied artwork and soundtrack) ----
import shutil
for f in ("icon-180.png", "icon-192.png", "icon-512.png", "favicon.png"):
    shutil.copy(ROOT / "assets" / f, DIST / f.replace(".png", "-v5.png"))
for f in ("dirty-rat.mp3", "lucky-tooth.mp3", "stack-the-deck.mp3", "misdeal.mp3"):
    shutil.copy(ROOT / "assets" / f, DIST / f)
print("built", {p.name: p.stat().st_size for p in DIST.iterdir()})
