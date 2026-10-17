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
pages = {file.name: SiteParser() for file in ROOT.glob('*.html')}
titles=set(); descriptions=set()
for name,p in pages.items():
    source=(ROOT/name).read_text(); p.feed(source)
    assert p.h1==1, f'{name}: expected one primary heading'
    assert len(p.ids)==len(set(p.ids)), f'{name}: duplicate IDs'
    assert not p.errors, (name,p.errors)
    import re
    title=re.search(r'<title>(.*?)</title>',source,re.S)[1]
    description=re.search(r'<meta name="description" content="([^"]+)"',source)[1]
    assert title not in titles, f'{name}: duplicate title'
    assert description not in descriptions, f'{name}: duplicate description'
    titles.add(title);descriptions.add(description)
    expected='https://www.powerupmyproperty.co.uk/'+('' if name=='index.html' else name)
    assert f'rel="canonical" href="{expected}"' in source, f'{name}: canonical mismatch'
    ld=json.loads(''.join(p.ld)); nodes=ld.get('@graph',[ld])
    business=next(n for n in nodes if n.get('@id')=='https://www.powerupmyproperty.co.uk/#business')
    assert business['telephone']=='+447553097529'
    assert business['email']=='powerupmyproperty@gmail.com'
    assert 'mailto:powerupmyproperty@gmail.com' in p.refs
    assert 'tel:+447553097529' in p.refs
for name,p in pages.items():
    for ref in p.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        path=unquote(u.path).lstrip('/') or (name if not u.path else 'index.html')
        target=ROOT
        for component in Path(path).parts:
            assert component in {child.name for child in target.iterdir()}, f'{name}: missing or case-mismatched path {ref}'
            target=target/component
        assert target.is_file(), f'{name}: missing file {ref}'
        if u.fragment:
            assert target.name in pages and u.fragment in pages[target.name].ids, f'{name}: broken section {ref}'
urls={n.text for n in ET.parse(ROOT/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
assert urls=={'https://www.powerupmyproperty.co.uk/'+('' if n=='index.html' else n) for n in pages}, 'Sitemap mismatch'
assert (ROOT/'CNAME').read_text().strip()=='www.powerupmyproperty.co.uk'
print(f'PASS: {len(pages)} pages; {sum(len(p.refs) for p in pages.values())} references; local assets and cross-page anchors; unique titles and descriptions; canonical URLs; JSON-LD; sitemap; contact details.')
