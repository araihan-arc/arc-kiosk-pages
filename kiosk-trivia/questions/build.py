"""Rebuild the trivia question bank inside ../index.html from easy.txt, normal.txt and serious.txt.
Each file has three sections (## 1 warm-up, ## 2 tricky, ## 3 tough); each line is
Question|Correct answer|Wrong|Wrong|Wrong.  Run:  python3 build.py"""
import json, re, pathlib
here = pathlib.Path(__file__).parent
bank, seen = {}, set()
for lv in ['easy', 'normal', 'serious']:
    tiers, t = {}, None
    for n, line in enumerate((here / f'{lv}.txt').read_text(encoding='utf-8').splitlines(), 1):
        if line.startswith('## '): t = int(line[3:]); tiers[t] = []; continue
        if not line.strip() or line.startswith('#'): continue
        parts = [p.strip() for p in line.split('|')]
        assert len(parts) == 5 and all(parts), f'{lv}.txt line {n}: need 5 non-empty fields'
        assert len(set(parts[1:])) == 4, f'{lv}.txt line {n}: answers must all differ'
        key = re.sub(r'\W', '', parts[0].lower()); assert key not in seen, f'{lv}.txt line {n}: duplicate question'
        seen.add(key); tiers[t].append(parts)
    assert all(len(tiers[i]) >= 5 for i in (1, 2, 3)), f'{lv}: each section needs at least 5 questions'
    bank[lv] = [tiers[1], tiers[2], tiers[3]]
    print(lv, [len(x) for x in bank[lv]], 'total', sum(len(x) for x in bank[lv]))
data = json.dumps(bank, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
page = here.parent / 'index.html'
html = page.read_text(encoding='utf-8')
html = re.sub(r'(<script type="application/json" id="triviaBank">).*?(</script>)', lambda m: m.group(1) + data + m.group(2), html, flags=re.S)
page.write_text(html, encoding='utf-8'); print('index.html updated')
