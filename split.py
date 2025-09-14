import os, re
from pathlib import Path

PROJECT_ROOT = Path(".").resolve()
APP_FILE = PROJECT_ROOT / "app" / "page.tsx"
COMPONENTS_DIR = PROJECT_ROOT / "components"
SUBCOMPONENTS = [
    "Hero",
    "ResultsSection",
    "Charts",
    "AboutSection",
    "FAQSection",
    "TestimonialsSection",
    "NewsletterSection",
    "DonationsSection",
    "ContactSection",
    "FooterSection",
]

COMPONENTS_DIR.mkdir(exist_ok=True)
content = APP_FILE.read_text(encoding="utf-8")
backup_file = APP_FILE.with_suffix(".tsx.bak")
backup_file.write_text(content, encoding="utf-8")
print(f"Backup creato in {backup_file}")

new_imports = []
for comp in SUBCOMPONENTS:
    pattern = rf"(function {comp}\s*\([^)]*\)\s*{{.*?^}})"
    match = re.search(pattern, content, re.DOTALL | re.MULTILINE)
    if not match:
        print(f"⚠️  {comp} non trovato")
        continue
    code = match.group(1)
    target_file = COMPONENTS_DIR / f"{comp}.tsx"
    with open(target_file, "w", encoding="utf-8") as f:
        f.write('"use client";\n\n')
        f.write("import React from 'react';\n")
        f.write("import { useTranslation } from 'react-i18next';\n")
        f.write("import Image from 'next/image';\n")
        f.write("import { motion } from 'framer-motion';\n")
        f.write("import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';\n\n")
        f.write(code + "\n")
        f.write(f"export default {comp};\n")
    print(f"✅ Estratto {comp} → {target_file}")
    new_imports.append(f"import {comp} from '@/components/{comp}';")
    content = content.replace(code, f"// 🔁 {comp} spostato in components/{comp}.tsx")

import_block = "\n".join(new_imports)
content = re.sub(r"(// Components.*)", r"\1\n" + import_block, content, count=1)
APP_FILE.write_text(content, encoding="utf-8")
print(f"✍️  Aggiornato {APP_FILE}")
