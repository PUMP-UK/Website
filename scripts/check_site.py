"""Dependency-free checks for the static site; run from any directory."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]; self.errors=[]; self.ld=[]; self.in_ld=False; self.h1=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='img' and not a.get('alt'): self.errors.append('Image missing alternative text')
        for key in ('src','href'):
            if a.get(key): self.refs.append(a[key])
        if a.get('srcset'):
            self.refs.extend(part.strip().split()[0] for part in a['srcset'].split(','))
        if tag=='script' and a.get('type')=='application/ld+json': self.in_ld=True
    def handle_endtag(self, tag):
        if tag=='script': self.in_ld=False
    def handle_data(self, data):
        if self.in_ld: self.ld.append(data)
p=SiteParser(); p.feed((ROOT/'index.html').read_text())
assert p.h1==1, 'Expected one primary heading'
assert len(p.ids)==len(set(p.ids)), 'Duplicate IDs'
for ref in p.refs:
    u=urlsplit(ref)
    if u.scheme or u.netloc: continue
    if u.path:
        target=ROOT
        for component in Path(unquote(u.path)).parts:
            assert component in {child.name for child in target.iterdir()}, f'Missing or case-mismatched path: {ref}'
            target=target/component
        assert target.is_file(), f'Missing asset: {ref}'
    elif u.fragment: assert u.fragment in p.ids, f'Broken section link: {ref}'
assert not p.errors, p.errors
ld=json.loads(''.join(p.ld)); assert ld['telephone']=='+447553097529'
assert ld['email']=='powerupmyproperty@gmail.com'
ET.parse(ROOT/'sitemap.xml')
assert (ROOT/'CNAME').read_text().strip()=='www.powerupmyproperty.co.uk'
assert 'mailto:powerupmyproperty@gmail.com' in p.refs
assert 'tel:+447553097529' in p.refs
print(f'PASS: {len(p.refs)} references; local assets and section links; unique IDs; image alt text; structured data; sitemap; domain; contact links.')
