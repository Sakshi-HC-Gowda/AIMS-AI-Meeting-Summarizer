import os
for root, _, files in os.walk('backend'):
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(root, f)
            data = open(path, 'rb').read()
            try:
                s = data.decode('utf-8')
            except Exception:
                continue
            for i,ch in enumerate(s):
                if ord(ch) > 127:
                    print(path, 'non-ascii', repr(ch), 'at', i)
                    break
