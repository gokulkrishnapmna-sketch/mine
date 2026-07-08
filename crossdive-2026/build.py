#!/usr/bin/env python3
"""Assemble the self-contained CrossDive film by embedding fonts into the template."""
import base64, pathlib
root = pathlib.Path(__file__).parent
def b64(p): return base64.b64encode((root/p).read_bytes()).decode()
html = (root/"film.template.html").read_text()
html = html.replace("__ANTON_B64__", b64("fonts/anton-latin.woff2"))
html = html.replace("__INTER_B64__", b64("fonts/inter-latin.woff2"))
(root/"film.html").write_text(html)
print("Wrote film.html (%d KB)" % (len((root/'film.html').read_bytes())//1024))
