import re,json,sys
md=open(sys.argv[1]).read()
md=md.replace('\\','')
brands=[];cur=None;car=None
for line in re.split(r'\n(?=#)',md):
    pass
text=re.sub(r'\n(?!\n)',' ',md)  # unwrap
for para in text.split('\n'):
    p=para.strip()
    if not p: continue
    m=re.match(r'^# (.+?) \| @(\S+)',p)
    if m: cur={'name':m[1],'handle':'@'+m[2],'carousels':[]};brands.append(cur);continue
    m=re.match(r'^## (\d+)\. (.+)',p)
    if m: car={'num':int(m[1]),'title':m[2].strip(),'slides':[],'caption':''};cur['carousels'].append(car);continue
    m=re.match(r'^\*\*Slide (\d)\*\* (.+)',p)
    if m: car['slides'].append(m[2].strip());continue
    m=re.match(r'^\*\*Caption\*\* (.+)',p)
    if m: car['caption']=m[1].strip()
for b in brands:
    assert len(b['carousels'])==15,b['name']
    for c in b['carousels']:
        assert len(c['slides'])==5,(b['name'],c['num'])
        if c['slides'][0]!=c['title']: print('TITLE DIFF',b['name'],c['num'],c['title'],'|',c['slides'][0])
json.dump(brands,open(sys.argv[2],'w'),indent=1,ensure_ascii=False)
print([ (b['name'],b['handle']) for b in brands])
