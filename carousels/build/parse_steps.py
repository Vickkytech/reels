"""Parses the 'Leverage AI Studio 20 Practical Carousels' brief (pandoc markdown) into JSON.

Usage: python3 parse_steps.py brief.md out.json
"""
import json, re, sys

md = open(sys.argv[1]).read().replace("\\", "")
# pandoc writes em and en dashes as --- and --
md = md.replace("---", "\u2014").replace("--", "\u2013")
text = re.sub(r"\n(?!\n)", " ", md)
carousels, cur, slide = [], None, None
for para in (p.strip() for p in text.split("\n")):
    if not para:
        continue
    m = re.match(r"^# (\d+) (.+)", para)
    if m:
        cur = {"num": int(m[1]), "title": m[2].strip(), "pillar": "", "slides": []}
        carousels.append(cur)
        continue
    if cur is None:
        continue
    m = re.match(r"^PILLAR: (\w+)", para)
    if m:
        cur["pillar"] = m[1].title()
        continue
    m = re.match(r"^\*\*SLIDE (\d+) \| (.+?)\*\*$", para)
    if m:
        slide = {"head": m[2].strip(), "body": ""}
        cur["slides"].append(slide)
        continue
    if para.startswith("Suggested footer"):
        slide = None
        continue
    if slide is not None:
        slide["body"] = (slide["body"] + " " + para).strip()

for c in carousels:
    assert len(c["slides"]) == 7 and c["pillar"], c["num"]
    assert all(s["body"] for s in c["slides"]), c["num"]
json.dump(carousels, open(sys.argv[2], "w"), indent=1, ensure_ascii=False)
print(len(carousels), "carousels")
