#!/usr/bin/env python3
"""
Advanced Conceptual Art Generator for all 54 cards for:
1. "Baraja Michis & Gatos" (public/cards/michis/01.jpg .. 54.jpg)
2. "Baraja Lomitos & Perros" (public/cards/lomitos/01.jpg .. 54.jpg)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CARD_W = 850
CARD_H = 1275

CARD_NAMES = [
    (1, "EL GALLO"),
    (2, "EL DIABLITO"),
    (3, "LA DAMA"),
    (4, "EL CATRÍN"),
    (5, "EL PARAGUAS"),
    (6, "LA SIRENA"),
    (7, "LA ESCALERA"),
    (8, "LA BOTELLA"),
    (9, "EL BARRIL"),
    (10, "EL ÁRBOL"),
    (11, "EL MELÓN"),
    (12, "EL VALIENTE"),
    (13, "EL GORRITO"),
    (14, "LA MUERTE"),
    (15, "LA PERA"),
    (16, "LA BANDERA"),
    (17, "EL BANDOLÓN"),
    (18, "EL VIOLONCELLO"),
    (19, "LA GARZA"),
    (20, "EL PÁJARO"),
    (21, "LA MANO"),
    (22, "LA BOTA"),
    (23, "LA LUNA"),
    (24, "EL COTORRO"),
    (25, "EL BORRACHO"),
    (26, "EL NEGRITO"),
    (27, "EL CORAZÓN"),
    (28, "LA SANDÍA"),
    (29, "EL TAMBOR"),
    (30, "EL CAMARÓN"),
    (31, "LAS JARAS"),
    (32, "EL MÚSICO"),
    (33, "LA ARAÑA"),
    (34, "EL SOLDADO"),
    (35, "LA ESTRELLA"),
    (36, "EL CAZO"),
    (37, "EL MUNDO"),
    (38, "EL APACHE"),
    (39, "EL NOPAL"),
    (40, "EL ALACRÁN"),
    (41, "LA ROSA"),
    (42, "LA CALAVERA"),
    (43, "LA CAMPANA"),
    (44, "EL CANTARITO"),
    (45, "EL VENADO"),
    (46, "EL SOL"),
    (47, "LA CORONA"),
    (48, "LA CHALUPA"),
    (49, "EL PINO"),
    (50, "EL PESCADO"),
    (51, "LA PALMA"),
    (52, "LA MACETA"),
    (53, "EL ARPA"),
    (54, "LA RANA"),
]

def get_font(size):
    font_paths = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Times.ttc",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                continue
    return ImageFont.load_default()

def draw_vintage_card_frame(draw, w, h, border_color, accent_color):
    draw.rectangle([0, 0, w, h], fill=(247, 240, 222))
    
    m1 = 28
    draw.rectangle([m1, m1, w - m1, h - m1], outline=border_color, width=12)
    
    m2 = 46
    draw.rectangle([m2, m2, w - m2, h - m2], outline=accent_color, width=3)
    
    corners = [(m1 + 8, m1 + 8), (w - m1 - 8, m1 + 8), (m1 + 8, h - m1 - 8), (w - m1 - 8, h - m1 - 8)]
    for cx, cy in corners:
        draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=border_color)
        draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(255, 215, 0))

def draw_card_number(draw, n, x=65, y=65, color=(140, 30, 25)):
    font = get_font(52)
    radius = 48
    draw.ellipse([x - 10, y - 10, x + radius * 2 - 10, y + radius * 2 - 10], fill=(242, 230, 205), outline=color, width=3)
    text = str(n)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = x + radius - 10 - tw // 2
    ty = y + radius - 10 - th // 2 - 4
    draw.text((tx, ty), text, font=font, fill=color)

def draw_card_title(draw, title, w, y, color=(25, 20, 18), ribbon_color=(180, 50, 40)):
    font = get_font(48)
    bbox = draw.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    tx = (w - tw) // 2
    
    rw = max(tw + 80, 320)
    rx = (w - rw) // 2
    draw.line([rx, y + 60, rx + rw, y + 60], fill=ribbon_color, width=4)
    draw.polygon([(rx, y + 60), (rx - 16, y + 50), (rx - 16, y + 70)], fill=ribbon_color)
    draw.polygon([(rx + rw, y + 60), (rx + rw + 16, y + 50), (rx + rw + 16, y + 70)], fill=ribbon_color)
    
    draw.text((tx, y), title, font=font, fill=color)

# Coat palettes for variety
MICHI_VARIETIES = [
    {"name": "orange", "fur": (235, 125, 40), "belly": (252, 230, 200), "eyes": (35, 135, 55), "outline": (130, 60, 15)},
    {"name": "siamese", "fur": (245, 230, 210), "belly": (255, 245, 235), "ears": (90, 50, 30), "eyes": (45, 140, 240), "outline": (80, 45, 25)},
    {"name": "black", "fur": (45, 40, 45), "belly": (70, 65, 70), "eyes": (250, 204, 21), "outline": (20, 15, 20)},
    {"name": "gray", "fur": (160, 165, 175), "belly": (220, 225, 235), "eyes": (16, 185, 129), "outline": (85, 90, 100)},
    {"name": "white", "fur": (250, 250, 252), "belly": (240, 240, 245), "eyes": (59, 130, 246), "outline": (160, 160, 170)},
]

LOMITO_VARIETIES = [
    {"name": "golden", "fur": (225, 165, 85), "belly": (252, 235, 210), "ears": (185, 120, 45), "outline": (130, 85, 30)},
    {"name": "pug", "fur": (220, 195, 155), "belly": (245, 230, 210), "ears": (60, 45, 35), "snout_dark": True, "outline": (90, 65, 45)},
    {"name": "husky", "fur": (145, 155, 165), "belly": (245, 245, 250), "ears": (100, 110, 120), "blue_eyes": True, "outline": (70, 75, 85)},
    {"name": "brown", "fur": (135, 75, 35), "belly": (205, 155, 115), "ears": (105, 55, 25), "outline": (75, 40, 18)},
    {"name": "dalmatian", "fur": (248, 248, 250), "belly": (240, 240, 245), "ears": (40, 40, 45), "spots": True, "outline": (60, 60, 65)},
]

def draw_michi_face(draw, cx, cy, variety, radius=92):
    fur = variety["fur"]
    outline = variety["outline"]
    eye_col = variety["eyes"]
    ear_col = variety.get("ears", fur)
    
    # Head
    draw.ellipse([cx - radius, cy - radius * 0.9, cx + radius, cy + radius * 0.9], fill=fur, outline=outline, width=3)
    
    # Ears
    ear_l = [(cx - radius * 0.85, cy - radius * 0.3), (cx - radius * 0.75, cy - radius * 1.5), (cx - radius * 0.2, cy - radius * 0.7)]
    ear_r = [(cx + radius * 0.2, cy - radius * 0.7), (cx + radius * 0.75, cy - radius * 1.5), (cx + radius * 0.85, cy - radius * 0.3)]
    draw.polygon(ear_l, fill=ear_col, outline=outline)
    draw.polygon([(cx - radius * 0.75, cy - radius * 0.35), (cx - radius * 0.68, cy - radius * 1.3), (cx - radius * 0.3, cy - radius * 0.65)], fill=(245, 175, 165))
    draw.polygon(ear_r, fill=ear_col, outline=outline)
    draw.polygon([(cx + radius * 0.3, cy - radius * 0.65), (cx + radius * 0.68, cy - radius * 1.3), (cx + radius * 0.75, cy - radius * 0.35)], fill=(245, 175, 165))
    
    # Eyes
    ew, eh = radius * 0.28, radius * 0.35
    draw.ellipse([cx - radius * 0.48 - ew, cy - eh, cx - radius * 0.48 + ew, cy + eh], fill=eye_col)
    draw.ellipse([cx + radius * 0.48 - ew, cy - eh, cx + radius * 0.48 + ew, cy + eh], fill=eye_col)
    
    # Pupils
    pw = ew * 0.35
    draw.ellipse([cx - radius * 0.48 - pw, cy - eh * 0.8, cx - radius * 0.48 + pw, cy + eh * 0.8], fill=(15, 15, 15))
    draw.ellipse([cx + radius * 0.48 - pw, cy - eh * 0.8, cx + radius * 0.48 + pw, cy + eh * 0.8], fill=(15, 15, 15))
    
    # Highlights
    draw.ellipse([cx - radius * 0.48 - pw - 2, cy - eh * 0.5, cx - radius * 0.48 + pw - 4, cy - eh * 0.1], fill=(255, 255, 255))
    draw.ellipse([cx + radius * 0.48 - pw - 2, cy - eh * 0.5, cx + radius * 0.48 + pw - 4, cy - eh * 0.1], fill=(255, 255, 255))
    
    # Nose
    nw = radius * 0.18
    ny = cy + radius * 0.18
    draw.polygon([(cx - nw, ny), (cx + nw, ny), (cx, ny + nw * 1.2)], fill=(245, 145, 160))
    # Mouth
    draw.arc([cx - nw * 1.8, ny + nw * 0.8, cx, ny + nw * 2.2], 0, 180, fill=(80, 40, 20), width=3)
    draw.arc([cx, ny + nw * 0.8, cx + nw * 1.8, ny + nw * 2.2], 0, 180, fill=(80, 40, 20), width=3)
    # Whiskers
    w_col = (230, 230, 235) if variety["name"] == "black" else (60, 40, 25)
    for dy in [-8, 4, 16]:
        draw.line([cx - radius * 0.4, cy + dy, cx - radius * 1.45, cy + dy * 1.5], fill=w_col, width=2)
        draw.line([cx + radius * 0.4, cy + dy, cx + radius * 1.45, cy + dy * 1.5], fill=w_col, width=2)

def draw_lomito_face(draw, cx, cy, variety, radius=95):
    fur = variety["fur"]
    outline = variety["outline"]
    ear_col = variety.get("ears", fur)
    
    # Dog head
    draw.ellipse([cx - radius, cy - radius * 0.85, cx + radius, cy + radius * 0.85], fill=fur, outline=outline, width=3)
    
    # Floppy ears
    draw.ellipse([cx - radius * 1.35, cy - radius * 0.45, cx - radius * 0.65, cy + radius * 0.85], fill=ear_col, outline=outline, width=3)
    draw.ellipse([cx + radius * 0.65, cy - radius * 0.45, cx + radius * 1.35, cy + radius * 0.85], fill=ear_col, outline=outline, width=3)
    
    # Eyes
    eye_col = (30, 144, 255) if variety.get("blue_eyes") else (25, 18, 15)
    ew = radius * 0.26
    draw.ellipse([cx - radius * 0.45 - ew, cy - ew * 1.1, cx - radius * 0.45 + ew, cy + ew * 1.1], fill=eye_col)
    draw.ellipse([cx + radius * 0.45 - ew, cy - ew * 1.1, cx + radius * 0.45 + ew, cy + ew * 1.1], fill=eye_col)
    draw.ellipse([cx - radius * 0.45 - 3, cy - ew * 0.7, cx - radius * 0.45 + 5, cy - ew * 0.2], fill=(255, 255, 255))
    draw.ellipse([cx + radius * 0.45 - 3, cy - ew * 0.7, cx + radius * 0.45 + 5, cy - ew * 0.2], fill=(255, 255, 255))
    
    # Snout
    snout_col = (45, 35, 30) if variety.get("snout_dark") else (250, 230, 195)
    sw = radius * 0.55
    sy = cy + radius * 0.15
    draw.ellipse([cx - sw, sy - radius * 0.2, cx + sw, sy + radius * 0.5], fill=snout_col, outline=outline, width=2)
    
    # Nose
    nw = radius * 0.22
    draw.ellipse([cx - nw, sy - radius * 0.15, cx + nw, sy + radius * 0.12], fill=(20, 15, 15))
    # Mouth & Tongue
    my = sy + radius * 0.12
    draw.arc([cx - radius * 0.3, my, cx + radius * 0.3, my + radius * 0.35], 0, 180, fill=(70, 25, 15), width=4)
    draw.ellipse([cx - radius * 0.15, my + radius * 0.16, cx + radius * 0.15, my + radius * 0.48], fill=(245, 110, 130), outline=(170, 45, 65), width=2)

    # Spots for dalmatian
    if variety.get("spots"):
        for sx, sy_rel in [(-45, -30), (50, -25), (-10, -50), (40, 20)]:
            draw.ellipse([cx + sx - 8, cy + sy_rel - 8, cx + sx + 8, cy + sy_rel + 8], fill=(35, 35, 40))

def generate_themed_card(n, title, is_michi):
    theme_name = "michis" if is_michi else "lomitos"
    out_dir = f"public/cards/{theme_name}"
    os.makedirs(out_dir, exist_ok=True)
    pad_str = str(n).zfill(2)
    out_path = f"{out_dir}/{pad_str}.jpg"
    
    # Preserve 01, 02, and 48 if already custom illustrated
    if n in [1, 2, 48] and os.path.exists(out_path):
        return out_path

    variety = MICHI_VARIETIES[(n * 3) % len(MICHI_VARIETIES)] if is_michi else LOMITO_VARIETIES[(n * 3) % len(LOMITO_VARIETIES)]

    if is_michi:
        border_col = (190, 24, 93)     # Deep Rosa Mexicano
        accent_col = (13, 148, 136)    # Deep Teal
        ribbon_col = (190, 24, 93)
        num_col = (190, 24, 93)
    else:
        border_col = (217, 119, 6)     # Warm Honey Amber
        accent_col = (4, 120, 87)      # Forest Emerald
        ribbon_col = (180, 83, 9)
        num_col = (180, 83, 9)

    img = Image.new("RGB", (CARD_W, CARD_H), (247, 240, 222))
    draw = ImageDraw.Draw(img)
    
    # 1. Vintage Card Frame
    draw_vintage_card_frame(draw, CARD_W, CARD_H, border_col, accent_col)
    
    # 2. Card Number in top-left
    draw_card_number(draw, n, 65, 65, num_col)
    
    # 3. Card Title Banner at bottom
    draw_card_title(draw, title, CARD_W, 1120, ribbon_color=ribbon_col)
    
    # 4. Central Art Stage
    ext = "png" if n == 6 else "jpeg"
    classic_path = f"public/cards/{pad_str}.{ext}"
    
    stage_cx = CARD_W // 2
    stage_cy = 580
    stage_w = 640
    stage_h = 760
    
    bg_colors = [
        (255, 237, 213), (254, 215, 170), (224, 242, 254), (236, 253, 245),
        (254, 240, 138), (252, 231, 243), (237, 233, 254), (254, 226, 226)
    ]
    bg_col = bg_colors[n % len(bg_colors)]
    draw.ellipse([stage_cx - stage_w // 2, stage_cy - stage_h // 2, stage_cx + stage_w // 2, stage_cy + stage_h // 2], fill=bg_col, outline=accent_col, width=4)
    
    # Embed classic icon
    if os.path.exists(classic_path):
        try:
            classic_img = Image.open(classic_path).convert("RGBA")
            cw, ch = classic_img.size
            crop_box = (int(cw * 0.12), int(ch * 0.12), int(cw * 0.88), int(ch * 0.82))
            cropped_art = classic_img.crop(crop_box)
            art_w = 440
            art_h = int(art_w * (cropped_art.height / cropped_art.width))
            if art_h > 460:
                art_h = 460
                art_w = int(art_h * (cropped_art.width / cropped_art.height))
            cropped_art = cropped_art.resize((art_w, art_h), Image.Resampling.LANCZOS)
            
            mask = Image.new("L", (art_w, art_h), 0)
            d_mask = ImageDraw.Draw(mask)
            d_mask.ellipse([10, 10, art_w - 10, art_h - 10], fill=240)
            mask = mask.filter(ImageFilter.GaussianBlur(12))
            
            art_x = stage_cx - art_w // 2
            art_y = stage_cy - art_h // 2 - 80
            img.paste(cropped_art, (art_x, art_y), mask)
        except Exception:
            pass
            
    # Mascot character
    mascot_cy = stage_cy + 175
    mascot_cx = stage_cx
    
    body_col = variety["fur"]
    belly_col = variety["belly"]
    body_outline = variety["outline"]
    
    draw.ellipse([mascot_cx - 140, mascot_cy - 40, mascot_cx + 140, mascot_cy + 180], fill=body_col, outline=body_outline, width=3)
    draw.ellipse([mascot_cx - 80, mascot_cy + 10, mascot_cx + 80, mascot_cy + 170], fill=belly_col)
    
    if is_michi:
        draw.polygon([(mascot_cx - 65, mascot_cy + 15), (mascot_cx + 65, mascot_cy + 15), (mascot_cx, mascot_cy + 75)], fill=(225, 29, 72), outline=(159, 18, 57), width=2)
        draw.ellipse([mascot_cx - 12, mascot_cy + 10, mascot_cx + 12, mascot_cy + 34], fill=(255, 215, 0))
        draw_michi_face(draw, mascot_cx, mascot_cy - 75, variety=variety, radius=92)
        
        draw.ellipse([mascot_cx - 130, mascot_cy + 100, mascot_cx - 70, mascot_cy + 160], fill=(250, 240, 225), outline=body_outline, width=2)
        draw.ellipse([mascot_cx + 70, mascot_cy + 100, mascot_cx + 130, mascot_cy + 160], fill=(250, 240, 225), outline=body_outline, width=2)
    else:
        draw.polygon([(mascot_cx - 75, mascot_cy + 20), (mascot_cx + 75, mascot_cy + 20), (mascot_cx, mascot_cy + 85)], fill=(217, 119, 6), outline=(146, 64, 14), width=2)
        draw.ellipse([mascot_cx - 14, mascot_cy + 15, mascot_cx + 14, mascot_cy + 40], fill=(16, 185, 129))
        draw_lomito_face(draw, mascot_cx, mascot_cy - 75, variety=variety, radius=95)
        
        draw.ellipse([mascot_cx - 135, mascot_cy + 105, mascot_cx - 75, mascot_cy + 165], fill=(245, 225, 195), outline=body_outline, width=2)
        draw.ellipse([mascot_cx + 75, mascot_cy + 105, mascot_cx + 135, mascot_cy + 165], fill=(245, 225, 195), outline=body_outline, width=2)

    img.save(out_path, "JPEG", quality=92)
    return out_path

def main():
    print("Regenerating all cards for Michis with variety...")
    for n, title in CARD_NAMES:
        generate_themed_card(n, title, is_michi=True)
    print("Successfully generated all 54 Michis cards!")

    print("Regenerating all cards for Lomitos with variety...")
    for n, title in CARD_NAMES:
        generate_themed_card(n, title, is_michi=False)
    print("Successfully generated all 54 Lomitos cards!")

if __name__ == "__main__":
    main()
