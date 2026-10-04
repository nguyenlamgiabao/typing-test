"""Gộp src.html + css/ + js/ thành 1 file duy nhất.
Chạy:  python build.py
Kết quả: index.html (ở thư mục gốc, dùng để đăng GitHub Pages) và dist/typing-test.html.
Sau khi sửa css/ hoặc js/ nhớ chạy lại build.py rồi mới commit."""
import re, pathlib, shutil
root = pathlib.Path(__file__).parent
html = (root / "src.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet" href="(.*?)">',
              lambda m: "<style>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "</style>", html)
js = [(root / m).read_text(encoding="utf-8") for m in re.findall(r'<script src="(.*?)"></script>', html)]
html = re.sub(r'(<script src=".*?"></script>\n)+', lambda m: "<script>\n" + "\n".join(js) + "</script>\n", html, count=1)
(root / "index.html").write_text(html, encoding="utf-8")
out = root / "dist"; out.mkdir(exist_ok=True)
(out / "typing-test.html").write_text(html, encoding="utf-8")
if (root / "images").exists(): shutil.copytree(root / "images", out / "images", dirs_exist_ok=True)
print("OK", len(html), "bytes")
