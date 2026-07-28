#!/usr/bin/env python3
"""Generate organized media catalog from Supabase"""
import os, sys, json, subprocess

SUPABASE_URL = "https://oatxlqxbsnfvoyopidla.supabase.co"
ADMIN_KEY = subprocess.run(
    """bw list items --search supabase-fatec 2>&1 | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['notes'])" """,
    shell=True, capture_output=True, text=True,
    env={**os.environ, 'BW_SESSION':'Xq/CtmzhYq9CxSCkUEQ0PO59b1litBStVCVVsN/A0L61/bd8jbjBYgq+3LU80GSiaoA5Ix7aCuBwYKiuQgRw1g=='}
).stdout.strip()

def list_files(bucket, prefix="", offset=0):
    """List files in Supabase bucket"""
    body = json.dumps({"prefix": prefix, "limit": 200, "offset": offset})
    r = subprocess.run(['curl','-s','-X','POST',
        f'{SUPABASE_URL}/storage/v1/object/list/{bucket}',
        '-H',f'apikey: {ADMIN_KEY}','-H',f'Authorization: Bearer {ADMIN_KEY}',
        '-H','Content-Type: application/json','-d',body],
        capture_output=True, text=True)
    try:
        files = json.loads(r.stdout)
        return files if isinstance(files, list) else []
    except:
        return []

# Category mapping by filename prefix
PREFIX_MAP = {
    "wit_gearboxes": ("WITTENSTEIN", "Servo Gearboxes"),
    "wit_motors": ("WITTENSTEIN", "Servo Motors"),
    "wit_actuators": ("WITTENSTEIN", "Servo Actuators"),
    "wit_drives": ("WITTENSTEIN", "Servo Drive Systems"),
    "wit_rackpinion": ("WITTENSTEIN", "Rack & Pinion Systems"),
    "wit_servodrives": ("WITTENSTEIN", "Servo Drives"),
    "wit_software": ("WITTENSTEIN", "Software & Digitalization"),
    "wit_accessories": ("WITTENSTEIN", "Accessories"),
    "wit_galaxie": ("WITTENSTEIN", "Galaxie Drive System"),
    "wit_home": ("WITTENSTEIN", "Company/Home"),
    "wit_products": ("WITTENSTEIN", "Products Overview"),
    "wit_industry_mech": ("WITTENSTEIN", "Industries - Mechanical Engineering"),
    "wit_industry_energy": ("WITTENSTEIN", "Industries - Energy"),
    "wit_industry_mobility": ("WITTENSTEIN", "Industries - Mobility"),
    "wit_industry_semi": ("WITTENSTEIN", "Industries - Semiconductor"),
    "wit_industry_robotics": ("WITTENSTEIN", "Industries - Robotics"),
    "wit_industry_medical": ("WITTENSTEIN", "Industries - Medical"),
    "wit_company_about": ("WITTENSTEIN", "Company/About"),
    "wit_services": ("WITTENSTEIN", "Services"),
    "wit_stories": ("WITTENSTEIN", "Success Stories"),
    "dep_home": ("DEPRAG", "Company/Home"),
    "dep_screwdriving": ("DEPRAG", "Screwdriving Technology"),
    "dep_feeding": ("DEPRAG", "Feeding Technology"),
    "dep_automation": ("DEPRAG", "Automation Solutions"),
    "dep_airmotors": ("DEPRAG", "Air Motors"),
    "dep_industry": ("DEPRAG", "Industries"),
    "dep_company": ("DEPRAG", "Company/About"),
    "dep_services": ("DEPRAG", "Services"),
    "home": ("WITTENSTEIN", "Home"),
    "products": ("WITTENSTEIN", "Products"),
    "gearboxes": ("WITTENSTEIN", "Servo Gearboxes"),
    "motors": ("WITTENSTEIN", "Servo Motors"),
    "actuators": ("WITTENSTEIN", "Servo Actuators"),
    "drives": ("WITTENSTEIN", "Servo Drive Systems"),
}

def categorize(filename):
    """Determine brand and category from filename"""
    for prefix, (brand, cat) in PREFIX_MAP.items():
        if filename.startswith(prefix + "_"):
            return brand, cat
    return "Unknown", "Uncategorized"

def clean_name(filename, brand, category):
    """Create human-readable name from filename"""
    # Remove prefix
    name = filename
    for p in PREFIX_MAP:
        if name.startswith(p + "_"):
            name = name[len(p)+1:]
            break
    
    # Remove hash suffixes
    import re
    name = re.sub(r'_[a-f0-9]{8,}\.(webp|png|jpg|svg)$', r'.\1', name)
    
    # Clean up
    name = name.replace('csm_', '').replace('_', ' ').replace('.webp', '').replace('.png', '').replace('.jpg', '').replace('.svg', '')
    
    # Un-capitalize
    words = name.split()
    words = [w[0].upper() + w[1:].lower() if len(w) > 2 else w.upper() if w.isupper() and len(w) <= 3 else w for w in words]
    name = ' '.join(words)
    
    if len(name) > 80:
        name = name[:77] + '...'
    
    return name.strip() or filename

if __name__ == '__main__':
    # Get all images
    all_files = list_files('images')
    print(f"Found {len(all_files)} images in Supabase")
    
    # Group by brand and category
    catalog = {}
    for f in all_files:
        name = f['name']
        brand, category = categorize(name)
        key = f"{brand} / {category}"
        if key not in catalog:
            catalog[key] = []
        
        pub_url = f"{SUPABASE_URL}/storage/v1/object/public/images/{name}"
        clean = clean_name(name, brand, category)
        catalog[key].append({
            'file': name,
            'name': clean,
            'url': pub_url,
            'size_kb': f['metadata']['size'] // 1024,
            'type': name.rsplit('.',1)[-1],
        })
    
    # Generate catalog markdown
    md = """# 📸 Fatec System Media Catalog

> Auto-generated from Supabase Storage
> Total: **{total} images** | **{brands}** brands

---

""".format(total=len(all_files), brands="WITTENSTEIN + DEPRAG")
    
    for key in sorted(catalog.keys()):
        items = catalog[key]
        brand, cat = key.split(' / ')
        md += f"## {brand} — {cat} ({len(items)} images)\n\n"
        md += "| # | Preview | Name | Size | URL |\n"
        md += "|---|---------|------|------|-----|\n"
        for i, item in enumerate(items, 1):
            md += f"| {i} | ![img]({item['url']}) | {item['name']} | {item['size_kb']}KB | `{item['url'][:50]}...` |\n"
        md += "\n"
    
    md += "\n---\n*Catalog auto-generated by Fatec System media crawler*"
    
    # Save locally
    with open('/root/fatec-webapp/media-catalog.md', 'w') as f:
        f.write(md)
    
    # Save JSON summary
    summary = {k: [{'name':i['name'],'url':i['url'],'size':i['size_kb'],'file':i['file']} for i in v] for k,v in catalog.items()}
    with open('/root/fatec-webapp/media-catalog.json', 'w') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    # Upload catalog to Supabase documents bucket
    json_str = json.dumps(summary, indent=2, ensure_ascii=False)
    r = subprocess.run(['curl','-s','-X','POST',
        f'{SUPABASE_URL}/storage/v1/object/documents/media-catalog.json',
        '-H',f'apikey: {ADMIN_KEY}','-H',f'Authorization: Bearer {ADMIN_KEY}',
        '-H','Content-Type: application/json','--data-binary',json_str],
        capture_output=True, text=True)
    
    # Print summary
    print("\n=== 📊 카탈로그 요약 ===\n")
    for key in sorted(catalog.keys()):
        print(f"  {key}: {len(catalog[key])} images")
    
    print(f"\n=== ✅ 완료 ===")
    print(f"  media-catalog.md  → /root/fatec-webapp/media-catalog.md")
    print(f"  media-catalog.json → /root/fatec-webapp/media-catalog.json")
    print(f"  Supabase: documents/media-catalog.json")
    print(f"\n  Supabase 저장 용량 확인:")
    
    total_size = sum(sum(i['size_kb'] for i in v) for v in catalog.values())
    print(f"  총 용량: {total_size//1024}MB ({total_size}KB) / Supabase 무료 1GB")
    print(f"  사용률: {total_size/10240:.1f}%")