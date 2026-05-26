from pathlib import Path
p=Path(r"c:\Users\Mark Jenesio Godes\Desktop\OJT\static\script.js")
s=p.read_text()
pairs={'(':')','{':'}','[':']'}
stack=[]
for i,ch in enumerate(s):
    if ch in pairs:
        stack.append((ch,i))
    elif ch in pairs.values():
        if not stack:
            print('Unmatched closing',ch,'at',i)
            break
        last,idx=stack.pop()
        if pairs[last]!=ch:
            print('Mismatched',last,'at',idx,'closed by',ch,'at',i)
            break
else:
    if stack:
        print('Unmatched openings:', [x for x,_ in stack][:10])
    else:
        print('Braces/paren/brackets look balanced')
