#!/usr/bin/env python3
"""Cache-bust main.js / styles.css for GitHub Pages.

GitHub Pages serves every file with `Cache-Control: max-age=600`, and a normal
browser reload only revalidates the HTML document - so right after a push a
visitor can get the new index.html together with the old, still-cached
main.js and styles.css (new buttons rendered unstyled and with no handlers).

This rewrites the `?v=...` suffix on those two references in index.html to a
short hash of each file's current contents. Whenever either file changes, its
URL changes, so browsers have to fetch the new version. Run it before
committing a change to main.js or styles.css:

    python3 scripts/stamp_asset_versions.py
"""

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
ASSETS = ["styles.css", "main.js"]


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    for name in ASSETS:
        digest = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()[:10]
        pattern = re.compile(r'(["\']\./' + re.escape(name) + r')(\?v=[^"\']*)?(["\'])')
        html, count = pattern.subn(rf"\g<1>?v={digest}\g<3>", html)
        if count != 1:
            raise SystemExit(f"expected exactly one reference to ./{name} in index.html, found {count}")
        print(f"{name}: v={digest}")
    INDEX.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    main()
