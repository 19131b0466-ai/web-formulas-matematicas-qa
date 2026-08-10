#!/usr/bin/env python3
"""Apply personal (tú) Idea/Objetivo to formulas-algebra.md and content-i18n."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD = ROOT / "content" / "formulas-algebra.md"
I18N_DIR = ROOT / "apps" / "web-public" / "content-i18n"

# Loaded from sibling module generated next to this file
from personal_viz_copy_data import COPY_ES, COPY_I18N  # noqa: E402


def main() -> None:
    text = MD.read_text()
    old_keys: set[str] = set()

    for fid, (obj, idea) in COPY_ES.items():
        pat = re.compile(
            rf"(\*\*ID:\*\* `{re.escape(fid)}`[\s\S]*?- \*\*Idea:\*\*\s*)(.+)(\n- \*\*Objetivo educativo:\*\*\s*)(.+)",
        )

        def repl(m: re.Match[str], _obj: str = obj, _idea: str = idea) -> str:
            old_keys.add(m.group(2).strip())
            old_keys.add(m.group(4).strip())
            return f"{m.group(1)}{_idea}{m.group(3)}{_obj}"

        text2, n = pat.subn(repl, text, count=1)
        if n != 1:
            print("WARN", fid)
        else:
            text = text2

    # Docs template lines (current + previous plain-language wording)
    for old, new in (
        (
            "- **Idea:** instrucción breve y clara: qué probar con los controles.\n"
            "- **Objetivo educativo:** en una frase, qué entiende el usuario al usar el gráfico.\n",
            "- **Idea:** instrucción en segunda persona: qué probar y qué observar.\n"
            "- **Objetivo educativo:** en una frase cercana (tú), qué descubre el usuario.\n",
        ),
        (
            "- **Idea:** comportamiento o comparación que la representación debe mostrar.\n"
            "- **Objetivo educativo:** relación que el estudiante debería comprender al verla.\n",
            "- **Idea:** instrucción en segunda persona: qué probar y qué observar.\n"
            "- **Objetivo educativo:** en una frase cercana (tú), qué descubre el usuario.\n",
        ),
    ):
        text = text.replace(old, new)

    MD.write_text(text)

    for loc in ("en", "de", "fr", "it", "pt"):
        path = I18N_DIR / f"{loc}.json"
        data = json.loads(path.read_text())
        for k in old_keys:
            data.pop(k, None)
        for fid, (obj_es, idea_es) in COPY_ES.items():
            obj_tr, idea_tr = COPY_I18N[loc][fid]
            data[obj_es] = obj_tr
            data[idea_es] = idea_tr
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        print(loc, len(data))

    print("updated", len(COPY_ES), "formulas")


if __name__ == "__main__":
    main()
