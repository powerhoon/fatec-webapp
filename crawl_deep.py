#!/usr/bin/env python3
"""Deep crawler for WITTENSTEIN + DEPRAG media"""
import re, os, sys, subprocess, json, urllib.parse

SUPABASE_URL = "https://oatxlqxbsnfvoyopidla.supabase.co"

def get_admin_key():
    return subprocess.run(
        """bw list items --search supabase-fatec 2>&1 | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['notes'])" """,
        shell=True, capture_output=True, text=True,
        env={**os.environ, 'BW_SESSION':'Xq/CtmzhYq9CxSCkUEQ0PO59b1litBStVCVVsN/A0L61/bd8jbjBYgq+3LU80GSiaoA5Ix7aCuBwYKiuQgRw1g=='}
    ).stdout.strip()

# ─── WITTENSTEIN deeper pages ───
WITT_PAGES = {
    "wit_home": "https://www.wittenstein-group.com/en-us",
    "wit_products": "https://www.wittenstein-group.com/en-us/products/",
    "wit_gearboxes": "https://www.wittenstein-group.com/en-us/products/servo-gearboxes/",
    "wit_motors": "https://www.wittenstein-group.com/en-us/products/servo-motors/",
    "wit_actuators": "https://www.wittenstein-group.com/en-us/products/servo-actuators/",
    "wit_drives": "https://www.wittenstein-group.com/en-us/products/servo-drive-systems/",
    "wit_rackpinion": "https://www.wittenstein-group.com/en-us/products/rack-and-pinion-systems/",
    "wit_servodrives": "https://www.wittenstein-group.com/en-us/products/servo-drives/",
    "wit_software": "https://www.wittenstein-group.com/en-us/products/software-and-digitalization/",
    "wit_accessories": "https://www.wittenstein-group.com/en-us/products/accessories/",
    "wit_galaxie": "https://www.wittenstein-group.com/en-us/products/galaxie-drive-system/",
    "wit_industry_mech": "https://www.wittenstein-group.com/en-us/industries/mechanical-engineering/",
    "wit_industry_energy": "https://www.wittenstein-group.com/en-us/industries/energy/",
    "wit_industry_mobility": "https://www.wittenstein-group.com/en-us/industries/mobility/",
    "wit_industry_semi": "https://www.wittenstein-group.com/en-us/industries/semiconductor-electronics/",
    "wit_industry_robotics": "https://www.wittenstein-group.com/en-us/industries/robotics-and-automation/",
    "wit_industry_medical": "https://www.wittenstein-group.com/en-us/industries/medical-technology/",
    "wit_company_about": "https://www.wittenstein-group.com/en-us/company/",
    "wit_services": "https://www.wittenstein-group.com/en-us/services/",
    "wit_stories": "https://www.wittenstein-group.com/en-us/success-stories/",
}

# ─── DEPRAG deeper pages ───
DEPRAG_PAGES = {
    "dep_home": "https://www.deprag.com/en-us/",
    "dep_screwdriving": "https://www.deprag.com/en-us/screwdriving-technology/",
    "dep_feeding": "https://www.deprag.com/en-us/feeding-technology/",
    "dep_automation": "https://www.deprag.com/en-us/automation/",
    "dep_airmotors": "https://www.deprag.com/en-us/air-motors/",
    "dep_industry": "https://www.deprag.com/en-us/industries/",
    "dep_company": "https://www.deprag.com/en-us/company/",
    "dep_services": "https://www.deprag.com/en-us/service/",
}

def crawl_page(name, url):
    html = subprocess.run(['curl', '-s', '-L', '--max-time', '30', '-A', 'Mozilla/5.0', url],
                         capture_output=True, text=True).stdout
    if not html:
        return []
    
    img_urls = []
    base_domain = urllib.parse.urlparse(url).netloc
    base_scheme = urllib.parse.urlparse(url).scheme
    
    for m in re.finditer(r'(?:src|data-src|srcset)=["\']([^"\']+\.(?:webp|jpg|jpeg|png|svg))["\']', html, re.I):
        src = m.group(1).split('?')[0].split(' ')[0]
        if src.startswith('//'):
            src = base_scheme + ':' + src
        elif src.startswith('/'):
            src = f'{base_scheme}://{base_domain}{src}'
        if base_domain in src or 'wittenstein' in src.lower() or 'deprag' in src.lower():
            img_urls.append(src)
    
    # bg images
    for m in re.finditer(r'url\(["\']?([^"\')\s]+\.(?:webp|jpg|jpeg|png|svg))["\']?\)', html, re.I):
        src = m.group(1).split('?')[0]
        if src.startswith('/'):
            src = f'{base_scheme}://{base_domain}{src}'
        if base_domain in src:
            img_urls.append(src)
    
    # Deduplicate
    return list(dict.fromkeys(img_urls))

def download_upload(url, bucket, filename, admin_key):
    tmp = f'/tmp/{filename}'
    r = subprocess.run(['curl', '-s', '-L', '-o', tmp, '--max-time', '60', '-A', 'Mozilla/5.0', url])
    if r.returncode != 0: return None
    try:
        size = os.path.getsize(tmp)
    except: return None
    if size < 2000:
        try: os.remove(tmp)
        except: pass
        return None
    
    ext = filename.rsplit('.',1)[-1].lower() if '.' in filename else ''
    ct = {'webp':'image/webp','jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','svg':'image/svg+xml'}.get(ext, 'application/octet-stream')
    
    u = subprocess.run(['curl','-s','-X','POST',f'{SUPABASE_URL}/storage/v1/object/{bucket}/{filename}',
        '-H',f'apikey: {admin_key}','-H',f'Authorization: Bearer {admin_key}',
        '-H',f'Content-Type: {ct}','--data-binary',f'@{tmp}'], capture_output=True, text=True)
    
    try: os.remove(tmp)
    except: pass
    
    if 'Key' in u.stdout:
        return f'{SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}'
    return None

if __name__ == '__main__':
    admin_key = get_admin_key()
    if not admin_key: sys.exit(1)
    
    all_images = {}
    
    print("=== WITTENSTEIN Deep Crawl ===")
    for name, url in WITT_PAGES.items():
        try:
            imgs = crawl_page(name, url)
            all_images[name] = imgs
            print(f"  {name}: {len(imgs)} images")
        except Exception as e:
            print(f"  {name}: ERROR - {e}")
    
    print("\n=== DEPRAG Deep Crawl ===")
    for name, url in DEPRAG_PAGES.items():
        try:
            imgs = crawl_page(name, url)
            all_images[name] = imgs
            print(f"  {name}: {len(imgs)} images")
        except Exception as e:
            print(f"  {name}: ERROR - {e}")
    
    total = sum(len(v) for v in all_images.values())
    print(f"\n=== Total: {total} images ===")
    
    # Upload
    uploaded = 0
    for name, imgs in all_images.items():
        for img in imgs:
            fn = img.split('/')[-1].split('?')[0]
            if len(fn) > 80: fn = fn[:80]
            fn = f"{name}_{fn}"
            result = download_upload(img, 'images', fn, admin_key)
            if result:
                uploaded += 1
                if uploaded % 20 == 0:
                    print(f"  ... {uploaded} uploaded ...")
    
    print(f"\n=== Done! {uploaded} images uploaded ===")