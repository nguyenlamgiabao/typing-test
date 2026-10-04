"""Gộp index.html + css/ + js/ thành dist/typing-test.html (1 file)."""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet" href="(.*?)">',
              lambda m: "<style>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "</style>", html)
js = [(root / m).read_text(encoding="utf-8") for m in re.findall(r'<script src="(.*?)"></script>', html)]
html = re.sub(r'(<script src=".*?"></script>\n)+', lambda m: "<script>\n" + "\n".join(js) + "</script>\n", html, count=1)
out = root / "dist"; out.mkdir(exist_ok=True)
(out / "typing-test.html").write_text(html, encoding="utf-8")
print("OK", out / "typing-test.html", len(html), "bytes")
