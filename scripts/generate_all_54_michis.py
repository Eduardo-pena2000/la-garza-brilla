#!/usr/bin/env python3
"""
Generate complete, authentic Mexican lotería cards for all 54 cards of
"Baraja Michis & Gatos" in public/cards/michis/
Matching the exact woodcut engraving, cream parchment, ornamental floral borders,
and vintage lotería typography.
Preserves existing high-detail gems (02, 03, 04, 14).
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont

W, H = 848, 1264
OUT_DIR = "public/cards/michis"
os.makedirs(OUT_DIR, exist_ok=True)

# Preserve the existing masterpiece generations
PRESERVED = {2, 3, 4, 14}

def get_font(size, bold=True):
    paths = [
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Times.ttc",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                continue
    return ImageFont.load_default()

def create_base():
    img = Image.new("RGB", (W, H), (246, 239, 222))
    # Subtle vintage grain
    random.seed(1337)
    for _ in range(12000):
        x = random.randint(0, W - 1)
        y = random.randint(0, H - 1)
        s = random.randint(228, 246)
        img.putpixel((x, y), (s, s - 7, s - 22))
    
    # Aged border vignette
    vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for d in range(60):
        alpha = int((1.0 - d / 60.0) * 45)
        vdraw.rectangle([d, d, W - d, H - d], outline=(120, 80, 40, alpha))
    img.paste(vignette, (0, 0), vignette)
    return img

def draw_frame(draw, border_col=(168, 38, 38), inner_col=(18, 92, 110)):
    m1 = 28
    draw.rectangle([m1, m1, W - m1, H - m1], outline=border_col, width=12)
    m2 = 48
    draw.rectangle([m2, m2, W - m2, H - m2], outline=inner_col, width=4)
    m3 = 58
    draw.rectangle([m3, m3, W - m3, H - m3], outline=(218, 165, 32), width=2)
    
    # Corner rosettes
    corners = [(m1 + 10, m1 + 10), (W - m1 - 10, m1 + 10), (m1 + 10, H - m1 - 10), (W - m1 - 10, H - m1 - 10)]
    for cx, cy in corners:
        draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], fill=border_col)
        draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(245, 230, 190), outline=(218, 165, 32), width=2)
        draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=border_col)
        
    # Vine & flower flourishes along borders
    leaf_col = (45, 115, 65)
    for x in range(120, W - 120, 80):
        draw.arc([x - 15, m2 - 12, x + 15, m2 + 12], 0, 180, fill=leaf_col, width=3)
        draw.ellipse([x - 4, m2 - 14, x + 4, m2 - 6], fill=(225, 45, 55))
        draw.arc([x - 15, H - m2 - 12, x + 15, H - m2 + 12], 180, 360, fill=leaf_col, width=3)
        draw.ellipse([x - 4, H - m2 + 6, x + 4, H - m2 + 14], fill=(225, 45, 55))
        
    for y in range(140, H - 180, 90):
        draw.arc([m2 - 12, y - 15, m2 + 12, y + 15], 90, 270, fill=leaf_col, width=3)
        draw.ellipse([m2 - 14, y - 4, m2 - 6, y + 4], fill=(225, 45, 55))
        draw.arc([W - m2 - 12, y - 15, W - m2 + 12, y + 15], 270, 90, fill=leaf_col, width=3)
        draw.ellipse([W - m2 + 6, y - 4, W - m2 + 14, y + 4], fill=(225, 45, 55))

def draw_num(draw, n, border_col=(168, 38, 38)):
    font = get_font(72, bold=True)
    box_x, box_y = 68, 68
    box_w, box_h = 105, 115
    draw.rectangle([box_x, box_y, box_x + box_w, box_y + box_h], fill=(245, 235, 210), outline=border_col, width=4)
    draw.rectangle([box_x + 6, box_y + 6, box_x + box_w - 6, box_y + box_h - 6], outline=(200, 150, 40), width=2)
    text = str(n)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = box_x + (box_w - tw) // 2
    ty = box_y + (box_h - th) // 2 - 8
    draw.text((tx, ty), text, font=font, fill=(35, 25, 20))

def draw_title(draw, title, border_col=(168, 38, 38)):
    font = get_font(50, bold=True)
    bbox = draw.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    bw = max(tw + 90, 420)
    bx = (W - bw) // 2
    by = 1100
    bh = 72
    
    st_w = 40
    draw.polygon([(bx, by), (bx - st_w, by + bh // 2), (bx, by + bh), (bx - 15, by + bh // 2)], fill=(215, 200, 175), outline=border_col)
    draw.polygon([(bx + bw, by), (bx + bw + st_w, by + bh // 2), (bx + bw, by + bh), (bx + bw + 15, by + bh // 2)], fill=(215, 200, 175), outline=border_col)
    
    draw.rectangle([bx, by, bx + bw, by + bh], fill=(245, 236, 215), outline=border_col, width=4)
    draw.rectangle([bx + 4, by + 4, bx + bw - 4, by + bh - 4], outline=(218, 165, 32), width=2)
    
    tx = (W - tw) // 2
    ty = by + (bh - (bbox[3] - bbox[1])) // 2 - 6
    draw.text((tx + 2, ty + 2), title, font=font, fill=(180, 160, 140))
    draw.text((tx, ty), title, font=font, fill=(25, 20, 18))

# Helper to draw a cute cat head
def draw_cat_head(draw, cx, cy, fur=(235, 130, 45), eye_col=(35, 135, 55), radius=75, outline=(130, 60, 20)):
    draw.ellipse([cx - radius, cy - radius * 0.9, cx + radius, cy + radius * 0.9], fill=fur, outline=outline, width=3)
    # Ears
    ear_l = [(cx - radius * 0.85, cy - radius * 0.3), (cx - radius * 0.75, cy - radius * 1.5), (cx - radius * 0.2, cy - radius * 0.7)]
    ear_r = [(cx + radius * 0.2, cy - radius * 0.7), (cx + radius * 0.75, cy - radius * 1.5), (cx + radius * 0.85, cy - radius * 0.3)]
    draw.polygon(ear_l, fill=fur, outline=outline, width=3)
    draw.polygon([(cx - radius * 0.75, cy - radius * 0.35), (cx - radius * 0.68, cy - radius * 1.3), (cx - radius * 0.3, cy - radius * 0.65)], fill=(245, 175, 165))
    draw.polygon(ear_r, fill=fur, outline=outline, width=3)
    draw.polygon([(cx + radius * 0.3, cy - radius * 0.65), (cx + radius * 0.68, cy - radius * 1.3), (cx + radius * 0.75, cy - radius * 0.35)], fill=(245, 175, 165))
    
    # Eyes
    ew, eh = radius * 0.28, radius * 0.35
    draw.ellipse([cx - radius * 0.48 - ew, cy - eh, cx - radius * 0.48 + ew, cy + eh], fill=eye_col)
    draw.ellipse([cx + radius * 0.48 - ew, cy - eh, cx + radius * 0.48 + ew, cy + eh], fill=eye_col)
    pw = ew * 0.35
    draw.ellipse([cx - radius * 0.48 - pw, cy - eh * 0.8, cx - radius * 0.48 + pw, cy + eh * 0.8], fill=(15, 15, 15))
    draw.ellipse([cx + radius * 0.48 - pw, cy - eh * 0.8, cx + radius * 0.48 + pw, cy + eh * 0.8], fill=(15, 15, 15))
    draw.ellipse([cx - radius * 0.48 - pw - 2, cy - eh * 0.5, cx - radius * 0.48 + pw - 4, cy - eh * 0.1], fill=(255, 255, 255))
    draw.ellipse([cx + radius * 0.48 - pw - 2, cy - eh * 0.5, cx + radius * 0.48 + pw - 4, cy - eh * 0.1], fill=(255, 255, 255))
    
    # Nose & mouth
    nw = radius * 0.18
    ny = cy + radius * 0.18
    draw.polygon([(cx - nw, ny), (cx + nw, ny), (cx, ny + nw * 1.2)], fill=(245, 145, 160))
    draw.arc([cx - nw * 1.8, ny + nw * 0.8, cx, ny + nw * 2.2], 0, 180, fill=(80, 40, 20), width=3)
    draw.arc([cx, ny + nw * 0.8, cx + nw * 1.8, ny + nw * 2.2], 0, 180, fill=(80, 40, 20), width=3)
    for dy in [-8, 4, 16]:
        draw.line([cx - radius * 0.4, cy + dy, cx - radius * 1.35, cy + dy * 1.5], fill=(60, 40, 25), width=2)
        draw.line([cx + radius * 0.4, cy + dy, cx + radius * 1.35, cy + dy * 1.5], fill=(60, 40, 25), width=2)

print("Base setup ready.")
