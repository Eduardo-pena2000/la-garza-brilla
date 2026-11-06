#!/usr/bin/env python3
"""
Advanced Engraved Card Generator for Lotería La Garza:
Replicating the authentic Mexican woodcut engraving, floral borders,
aged cream parchment, and vintage typography of the lotería card collection.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 848, 1264

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

def create_parchment_base():
    img = Image.new("RGB", (W, H), (246, 239, 222))
    draw = ImageDraw.Draw(img)
    # Subtle vintage parchment texture and paper grain
    import random
    random.seed(42)
    for _ in range(12000):
        x = random.randint(0, W - 1)
        y = random.randint(0, H - 1)
        shade = random.randint(230, 248)
        img.putpixel((x, y), (shade, shade - 8, shade - 24))
    
    # Aged vignette around borders
    vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for d in range(60):
        alpha = int((1.0 - d / 60.0) * 45)
        vdraw.rectangle([d, d, W - d, H - d], outline=(120, 80, 40, alpha))
    img.paste(vignette, (0, 0), vignette)
    return img

def draw_mexican_ornamental_frame(draw, border_col=(139, 32, 32), inner_col=(18, 92, 110)):
    # Outer frame
    m1 = 28
    draw.rectangle([m1, m1, W - m1, H - m1], outline=border_col, width=12)
    
    # Inner border
    m2 = 48
    draw.rectangle([m2, m2, W - m2, H - m2], outline=inner_col, width=4)
    
    # Thin gold pinstripe
    m3 = 58
    draw.rectangle([m3, m3, W - m3, H - m3], outline=(218, 165, 32), width=2)
    
    # Corner floral rosettes
    corners = [(m1 + 10, m1 + 10), (W - m1 - 10, m1 + 10), (m1 + 10, H - m1 - 10), (W - m1 - 10, H - m1 - 10)]
    for cx, cy in corners:
        draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], fill=border_col)
        draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(245, 230, 190), outline=(218, 165, 32), width=2)
        draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=border_col)
        
    # Vine / leaf flourishes along edges
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

def draw_card_num(draw, n):
    font = get_font(72, bold=True)
    box_x, box_y = 68, 68
    box_w, box_h = 105, 115
    # Vintage badge with aged cream fill and double border
    draw.rectangle([box_x, box_y, box_x + box_w, box_y + box_h], fill=(245, 235, 210), outline=(139, 32, 32), width=4)
    draw.rectangle([box_x + 6, box_y + 6, box_x + box_w - 6, box_y + box_h - 6], outline=(200, 150, 40), width=2)
    
    text = str(n)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = box_x + (box_w - tw) // 2
    ty = box_y + (box_h - th) // 2 - 8
    draw.text((tx, ty), text, font=font, fill=(35, 25, 20))

def draw_title_banner(draw, title, ribbon_col=(245, 236, 215), border_col=(139, 32, 32)):
    font = get_font(52, bold=True)
    bbox = draw.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    bw = max(tw + 90, 420)
    bx = (W - bw) // 2
    by = 1100
    bh = 72
    
    # Ribbon swallowtails on left and right
    st_w = 40
    # Left tail
    draw.polygon([(bx, by), (bx - st_w, by + bh // 2), (bx, by + bh), (bx - 15, by + bh // 2)], fill=(215, 200, 175), outline=border_col)
    # Right tail
    draw.polygon([(bx + bw, by), (bx + bw + st_w, by + bh // 2), (bx + bw, by + bh), (bx + bw + 15, by + bh // 2)], fill=(215, 200, 175), outline=border_col)
    
    # Main banner parchment body
    draw.rectangle([bx, by, bx + bw, by + bh], fill=ribbon_col, outline=border_col, width=4)
    draw.rectangle([bx + 4, by + 4, bx + bw - 4, by + bh - 4], outline=(218, 165, 32), width=2)
    
    # Lettering with vintage typography
    tx = (W - tw) // 2
    ty = by + (bh - (bbox[3] - bbox[1])) // 2 - 6
    # Subtle drop shadow
    draw.text((tx + 2, ty + 2), title, font=font, fill=(180, 160, 140))
    draw.text((tx, ty), title, font=font, fill=(25, 20, 18))

def add_woodcut_hatching(draw, x1, y1, x2, y2, angle=45, spacing=8, col=(40, 30, 25, 50)):
    # Woodcut cross-hatch effect
    for y in range(y1, y2, spacing):
        draw.line([x1, y, x2, y + (x2 - x1)], fill=col[:3], width=1)

def generate_lomito_diablo():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(180, 25, 25), inner_col=(140, 20, 20))
    draw_card_num(draw, 2)
    
    # Fiery smoke cloud at bottom
    cx, cy = W // 2, 640
    flame_pts = [
        (cx - 220, 960), (cx - 180, 910), (cx - 120, 950), (cx - 60, 890),
        (cx, 940), (cx + 70, 880), (cx + 130, 930), (cx + 190, 890),
        (cx + 240, 970), (cx, 1020)
    ]
    draw.polygon(flame_pts, fill=(245, 158, 11), outline=(220, 38, 38))
    for fx in range(cx - 180, cx + 180, 40):
        draw.polygon([(fx, 960), (fx + 20, 900), (fx + 40, 960)], fill=(239, 68, 68))
        draw.polygon([(fx + 10, 955), (fx + 20, 915), (fx + 30, 955)], fill=(254, 240, 138))

    # French bulldog body in red devil bodysuit
    draw.ellipse([cx - 110, cy - 60, cx + 110, cy + 240], fill=(210, 35, 35), outline=(120, 15, 15), width=4)
    # Belt with gold buckle
    draw.rectangle([cx - 110, cy + 90, cx + 110, cy + 125], fill=(25, 20, 25), outline=(10, 10, 10), width=2)
    draw.rectangle([cx - 30, cy + 85, cx + 30, cy + 130], fill=(234, 179, 8), outline=(161, 98, 7), width=3)
    draw.rectangle([cx - 14, cy + 97, cx + 14, cy + 118], fill=(25, 20, 25))
    
    # Devil tail curling out
    tail_pts = [(cx + 90, cy + 160), (cx + 180, cy + 140), (cx + 220, cy + 80), (cx + 200, cy + 30)]
    for i in range(len(tail_pts) - 1):
        draw.line([tail_pts[i], tail_pts[i+1]], fill=(185, 28, 28), width=14)
    # Arrow tip
    draw.polygon([(cx + 200, cy + 10), (cx + 230, cy + 45), (cx + 175, cy + 40)], fill=(185, 28, 28), outline=(120, 15, 15), width=2)

    # Muscular dog legs in red suit
    draw.ellipse([cx - 105, cy + 190, cx - 35, cy + 310], fill=(195, 30, 30), outline=(120, 15, 15), width=3)
    draw.ellipse([cx + 35, cy + 190, cx + 105, cy + 310], fill=(195, 30, 30), outline=(120, 15, 15), width=3)
    # Cloven hooves / black boots
    draw.ellipse([cx - 115, cy + 285, cx - 25, cy + 325], fill=(30, 25, 30), outline=(10, 10, 10), width=3)
    draw.ellipse([cx + 25, cy + 285, cx + 115, cy + 325], fill=(30, 25, 30), outline=(10, 10, 10), width=3)

    # Dog arms: left arm on hip, right arm holding pitchfork
    draw.line([cx - 90, cy + 30, cx - 160, cy + 90], fill=(195, 30, 30), width=24)
    draw.line([cx - 160, cy + 90, cx - 95, cy + 120], fill=(195, 30, 30), width=22)
    # Right arm holding pitchfork
    draw.line([cx + 80, cy + 30, cx + 150, cy + 80], fill=(195, 30, 30), width=24)
    draw.ellipse([cx + 135, cy + 65, cx + 175, cy + 105], fill=(225, 185, 155), outline=(130, 80, 50), width=3)

    # Golden Trident / Pitchfork
    px = cx + 165
    draw.line([px, cy - 230, px, cy + 290], fill=(218, 165, 32), width=10)
    draw.line([px - 2, cy - 230, px - 2, cy + 290], fill=(254, 240, 138), width=3)
    # Trident crossbar and prongs
    draw.arc([px - 50, cy - 280, px + 50, cy - 210], 0, 180, fill=(218, 165, 32), width=10)
    # Left prong
    draw.line([px - 50, cy - 295, px - 50, cy - 245], fill=(218, 165, 32), width=8)
    draw.polygon([(px - 50, cy - 315), (px - 58, cy - 290), (px - 42, cy - 290)], fill=(218, 165, 32))
    # Center prong
    draw.line([px, cy - 310, px, cy - 220], fill=(218, 165, 32), width=10)
    draw.polygon([(px, cy - 335), (px - 9, cy - 305), (px + 9, cy - 305)], fill=(218, 165, 32))
    # Right prong
    draw.line([px + 50, cy - 295, px + 50, cy - 245], fill=(218, 165, 32), width=8)
    draw.polygon([(px + 50, cy - 315), (px + 42, cy - 290), (px + 58, cy - 290)], fill=(218, 165, 32))

    # French Bulldog Head
    hy = cy - 140
    draw.ellipse([cx - 105, hy - 95, cx + 105, hy + 85], fill=(230, 205, 175), outline=(110, 75, 45), width=4)
    # Dark pug/frenchie muzzle
    draw.ellipse([cx - 65, hy - 10, cx + 65, hy + 75], fill=(45, 35, 35), outline=(20, 15, 15), width=3)
    # Wide black nose
    draw.polygon([(cx - 24, hy + 5), (cx + 24, hy + 5), (cx, hy + 24)], fill=(10, 10, 10))
    # Devilish grin with little fangs
    draw.arc([cx - 40, hy + 20, cx + 40, hy + 60], 0, 180, fill=(240, 240, 240), width=6)
    draw.polygon([(cx - 26, hy + 38), (cx - 18, hy + 38), (cx - 22, hy + 50)], fill=(255, 255, 255))
    draw.polygon([(cx + 18, hy + 38), (cx + 26, hy + 38), (cx + 22, hy + 50)], fill=(255, 255, 255))

    # Mischievous glowing eyes
    draw.ellipse([cx - 58, hy - 45, cx - 20, hy - 5], fill=(220, 38, 38))
    draw.ellipse([cx + 20, hy - 45, cx + 58, hy - 5], fill=(220, 38, 38))
    draw.ellipse([cx - 46, hy - 38, cx - 32, hy - 12], fill=(255, 215, 0))
    draw.ellipse([cx + 32, hy - 38, cx + 46, hy - 12], fill=(255, 215, 0))
    draw.ellipse([cx - 42, hy - 32, cx - 36, hy - 18], fill=(10, 10, 10))
    draw.ellipse([cx + 36, hy - 32, cx + 42, hy - 18], fill=(10, 10, 10))

    # Bat-like Frenchie Ears
    ear_l = [(cx - 95, hy - 40), (cx - 135, hy - 170), (cx - 45, hy - 95)]
    ear_r = [(cx + 45, hy - 95), (cx + 135, hy - 170), (cx + 95, hy - 40)]
    draw.polygon(ear_l, fill=(230, 205, 175), outline=(110, 75, 45), width=3)
    draw.polygon([(cx - 90, hy - 45), (cx - 125, hy - 155), (cx - 55, hy - 90)], fill=(240, 160, 160))
    draw.polygon(ear_r, fill=(230, 205, 175), outline=(110, 75, 45), width=3)
    draw.polygon([(cx + 55, hy - 90), (cx + 125, hy - 155), (cx + 90, hy - 45)], fill=(240, 160, 160))

    # Curved Red Devil Horns between ears!
    horn_l = [(cx - 35, hy - 85), (cx - 55, hy - 165), (cx - 15, hy - 95)]
    horn_r = [(cx + 15, hy - 95), (cx + 55, hy - 165), (cx + 35, hy - 85)]
    draw.polygon(horn_l, fill=(185, 28, 28), outline=(110, 15, 15), width=3)
    draw.polygon(horn_r, fill=(185, 28, 28), outline=(110, 15, 15), width=3)

    # Woodcut hatching across character
    for y in range(cy - 20, cy + 220, 12):
        draw.line([cx - 85, y, cx - 20, y], fill=(130, 20, 20), width=1)
        draw.line([cx + 20, y, cx + 85, y], fill=(130, 20, 20), width=1)

    draw_title_banner(draw, "EL LOMITO DIABLO", border_col=(180, 25, 25))
    out_path = "public/cards/lomitos/02.jpg"
    img.save(out_path, "JPEG", quality=95)
    print("Saved:", out_path)

def generate_michi_gallo():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(185, 38, 38), inner_col=(20, 100, 110))
    draw_card_num(draw, 1)

    cx, cy = W // 2, 650
    # Sunrise rays in background
    for ang in range(0, 180, 15):
        rad = math.radians(ang)
        x2 = cx + int(360 * math.cos(rad))
        y2 = 720 - int(360 * math.sin(rad))
        draw.line([cx, 720, x2, y2], fill=(255, 235, 180), width=4)

    # Wooden ranch fence post
    draw.polygon([(cx - 70, 720), (cx + 70, 720), (cx + 60, 1050), (cx - 60, 1050)], fill=(140, 85, 45), outline=(75, 40, 20), width=4)
    draw.line([cx - 50, 750, cx - 45, 1030], fill=(95, 55, 30), width=3)
    draw.line([cx + 30, 740, cx + 25, 1020], fill=(95, 55, 30), width=3)
    # Horizontal fence bar
    draw.rectangle([70, 820, W - 70, 890], fill=(155, 95, 50), outline=(80, 45, 25), width=3)

    # Large rooster tail feathers behind cat
    tail_colors = [(220, 38, 38), (37, 99, 235), (22, 163, 74), (202, 138, 4), (147, 51, 234)]
    for i, col in enumerate(tail_colors):
        arc_pts = []
        for t in range(25):
            prog = t / 24.0
            px = cx - 40 - i * 16 - int(math.sin(prog * math.pi) * 110)
            py = 700 - int(prog * 260) + i * 20
            arc_pts.append((px, py))
        for p in range(len(arc_pts) - 1):
            draw.line([arc_pts[p], arc_pts[p+1]], fill=col, width=16)

    # Orange cat body perched proudly on the post
    draw.ellipse([cx - 85, cy - 70, cx + 85, cy + 90], fill=(235, 130, 45), outline=(135, 60, 20), width=4)
    draw.ellipse([cx - 50, cy - 30, cx + 50, cy + 80], fill=(254, 235, 205))

    # Cat paws gripping the wooden fence
    draw.ellipse([cx - 55, 705, cx - 15, 735], fill=(245, 160, 70), outline=(130, 60, 20), width=2)
    draw.ellipse([cx + 15, 705, cx + 55, 735], fill=(245, 160, 70), outline=(130, 60, 20), width=2)

    # Cat head tilted up singing kikirikí
    hy = cy - 120
    draw.ellipse([cx - 75, hy - 65, cx + 75, hy + 65], fill=(235, 130, 45), outline=(135, 60, 20), width=4)
    # Cat ears
    draw.polygon([(cx - 70, hy - 30), (cx - 65, hy - 110), (cx - 20, hy - 55)], fill=(235, 130, 45), outline=(135, 60, 20), width=3)
    draw.polygon([(cx + 20, hy - 55), (cx + 65, hy - 110), (cx + 70, hy - 30)], fill=(235, 130, 45), outline=(135, 60, 20), width=3)

    # Rooster red comb on cat's head!
    comb_pts = [
        (cx - 35, hy - 60), (cx - 30, hy - 125), (cx - 10, hy - 85),
        (cx, hy - 135), (cx + 10, hy - 85), (cx + 30, hy - 125), (cx + 35, hy - 60)
    ]
    draw.polygon(comb_pts, fill=(220, 38, 38), outline=(130, 20, 20), width=3)

    # Red rooster wattle under chin
    draw.ellipse([cx - 16, hy + 45, cx + 16, hy + 90], fill=(220, 38, 38), outline=(130, 20, 20), width=2)

    # Open singing cat mouth
    draw.polygon([(cx - 15, hy + 20), (cx + 15, hy + 20), (cx, hy + 42)], fill=(120, 20, 30), outline=(60, 10, 15), width=2)
    # Happy closed eyes singing
    draw.arc([cx - 50, hy - 10, cx - 20, hy + 15], 180, 360, fill=(40, 25, 15), width=4)
    draw.arc([cx + 20, hy - 10, cx + 50, hy + 15], 180, 360, fill=(40, 25, 15), width=4)

    draw_title_banner(draw, "EL MICHI GALLO", border_col=(185, 38, 38))
    out = "public/cards/michis/01.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_lomito_gallo():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(185, 38, 38), inner_col=(180, 120, 30))
    draw_card_num(draw, 1)

    cx, cy = W // 2, 650
    # Morning sun
    draw.ellipse([cx - 160, 420, cx + 160, 740], fill=(255, 230, 160))
    # Wooden fence
    draw.polygon([(cx - 70, 720), (cx + 70, 720), (cx + 60, 1050), (cx - 60, 1050)], fill=(145, 90, 50), outline=(75, 40, 20), width=4)
    draw.rectangle([70, 820, W - 70, 890], fill=(160, 100, 55), outline=(80, 45, 25), width=3)

    # Rooster tail feathers
    tail_colors = [(239, 68, 68), (34, 197, 94), (59, 130, 246), (245, 158, 11), (236, 72, 153)]
    for i, col in enumerate(tail_colors):
        arc_pts = []
        for t in range(25):
            prog = t / 24.0
            px = cx - 40 - i * 16 - int(math.sin(prog * math.pi) * 110)
            py = 700 - int(prog * 260) + i * 20
            arc_pts.append((px, py))
        for p in range(len(arc_pts) - 1):
            draw.line([arc_pts[p], arc_pts[p+1]], fill=col, width=16)

    # Little Chihuahua / Jack Russell dog body
    draw.ellipse([cx - 85, cy - 60, cx + 85, cy + 90], fill=(225, 175, 100), outline=(130, 90, 40), width=4)
    draw.ellipse([cx - 45, cy - 20, cx + 45, cy + 80], fill=(250, 240, 220))

    # Paws on the post
    draw.ellipse([cx - 55, 705, cx - 15, 735], fill=(225, 175, 100), outline=(130, 90, 40), width=2)
    draw.ellipse([cx + 15, 705, cx + 55, 735], fill=(225, 175, 100), outline=(130, 90, 40), width=2)

    # Dog head singing
    hy = cy - 120
    draw.ellipse([cx - 75, hy - 60, cx + 75, hy + 60], fill=(225, 175, 100), outline=(130, 90, 40), width=4)
    # Dog ears
    draw.polygon([(cx - 75, hy - 30), (cx - 105, hy - 110), (cx - 40, hy - 50)], fill=(195, 135, 60), outline=(130, 90, 40), width=3)
    draw.polygon([(cx + 40, hy - 50), (cx + 105, hy - 110), (cx + 75, hy - 30)], fill=(195, 135, 60), outline=(130, 90, 40), width=3)

    # Rooster comb
    comb_pts = [
        (cx - 35, hy - 55), (cx - 28, hy - 120), (cx - 10, hy - 80),
        (cx, hy - 130), (cx + 10, hy - 80), (cx + 28, hy - 120), (cx + 35, hy - 55)
    ]
    draw.polygon(comb_pts, fill=(220, 38, 38), outline=(130, 20, 20), width=3)

    # Singing mouth and nose
    draw.polygon([(cx - 16, hy + 18), (cx + 16, hy + 18), (cx, hy + 40)], fill=(130, 25, 30), outline=(60, 10, 15), width=2)
    draw.ellipse([cx - 14, hy + 2, cx + 14, hy + 20], fill=(30, 20, 20))
    # Eyes closed in joyful morning song
    draw.arc([cx - 50, hy - 15, cx - 20, hy + 10], 180, 360, fill=(40, 25, 15), width=4)
    draw.arc([cx + 20, hy - 15, cx + 50, hy + 10], 180, 360, fill=(40, 25, 15), width=4)

    draw_title_banner(draw, "EL LOMITO GALLO", border_col=(185, 38, 38))
    out = "public/cards/lomitos/01.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_michi_valiente():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(180, 35, 35), inner_col=(30, 120, 70))
    draw_card_num(draw, 12)

    cx, cy = W // 2, 640
    # Standing cat on two legs in heroic posture
    # Leather boots
    draw.polygon([(cx - 110, 930), (cx - 40, 930), (cx - 30, 1020), (cx - 120, 1020)], fill=(120, 65, 30), outline=(60, 30, 15), width=3)
    draw.polygon([(cx + 40, 930), (cx + 110, 930), (cx + 120, 1020), (cx + 30, 1020)], fill=(120, 65, 30), outline=(60, 30, 15), width=3)
    # Trousers
    draw.rectangle([cx - 100, cy + 140, cx - 40, 940], fill=(225, 215, 195), outline=(130, 110, 90), width=3)
    draw.rectangle([cx + 40, cy + 140, cx + 100, 940], fill=(225, 215, 195), outline=(130, 110, 90), width=3)

    # Cat body
    draw.ellipse([cx - 95, cy - 50, cx + 95, cy + 180], fill=(210, 120, 45), outline=(120, 60, 20), width=4)
    # Traditional Mexican Sarape draped diagonally
    sarape_pts = [(cx - 95, cy - 60), (cx + 80, cy - 20), (cx + 40, cy + 170), (cx - 90, cy + 150)]
    draw.polygon(sarape_pts, fill=(220, 38, 38), outline=(120, 20, 20), width=3)
    # Sarape stripes: green, white, yellow
    draw.line([cx - 92, cy - 10, cx + 70, cy + 25], fill=(22, 163, 74), width=12)
    draw.line([cx - 90, cy + 30, cx + 60, cy + 65], fill=(255, 255, 255), width=10)
    draw.line([cx - 88, cy + 70, cx + 50, cy + 105], fill=(245, 158, 11), width=10)

    # Right hand holding large shiny steel machete!
    draw.line([cx + 70, cy + 30, cx + 150, cy + 80], fill=(210, 120, 45), width=24)
    # Machete blade pointing up
    mach_pts = [(cx + 145, cy + 80), (cx + 210, cy - 180), (cx + 240, cy - 160), (cx + 175, cy + 80)]
    draw.polygon(mach_pts, fill=(225, 230, 235), outline=(90, 100, 110), width=3)
    # Blade edge shine
    draw.line([cx + 212, cy - 175, cx + 148, cy + 75], fill=(255, 255, 255), width=4)
    # Wooden machete hilt
    draw.rectangle([cx + 140, cy + 75, cx + 170, cy + 130], fill=(110, 55, 25), outline=(50, 25, 10), width=2)

    # Heroic Tabby Cat Head
    hy = cy - 130
    draw.ellipse([cx - 85, hy - 75, cx + 85, hy + 75], fill=(210, 120, 45), outline=(120, 60, 20), width=4)
    # Ears
    draw.polygon([(cx - 80, hy - 40), (cx - 75, hy - 130), (cx - 20, hy - 65)], fill=(210, 120, 45), outline=(120, 60, 20), width=3)
    draw.polygon([(cx + 20, hy - 65), (cx + 75, hy - 130), (cx + 80, hy - 40)], fill=(210, 120, 45), outline=(120, 60, 20), width=3)
    # Fierce fearless eyes
    draw.ellipse([cx - 55, hy - 20, cx - 18, hy + 15], fill=(245, 158, 11), outline=(40, 20, 10), width=2)
    draw.ellipse([cx + 18, hy - 20, cx + 55, hy + 15], fill=(245, 158, 11), outline=(40, 20, 10), width=2)
    draw.ellipse([cx - 40, hy - 16, cx - 30, hy + 11], fill=(15, 15, 15))
    draw.ellipse([cx + 30, hy - 16, cx + 40, hy + 11], fill=(15, 15, 15))
    # Confident mouth and whiskers
    draw.polygon([(cx - 14, hy + 16), (cx + 14, hy + 16), (cx, hy + 28)], fill=(240, 140, 150))
    draw.arc([cx - 25, hy + 22, cx + 25, hy + 45], 0, 180, fill=(60, 30, 15), width=3)
    for dy in [-6, 6, 18]:
        draw.line([cx - 30, hy + 25 + dy, cx - 110, hy + 20 + dy * 2], fill=(60, 40, 20), width=2)
        draw.line([cx + 30, hy + 25 + dy, cx + 110, hy + 20 + dy * 2], fill=(60, 40, 20), width=2)

    draw_title_banner(draw, "EL MICHI VALIENTE", border_col=(180, 35, 35))
    out = "public/cards/michis/12.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_lomito_muerte():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(40, 40, 45), inner_col=(180, 140, 40))
    draw_card_num(draw, 14)

    cx, cy = W // 2, 640
    # Day of the Dead Catrina Dog
    # Flowing black Catrina cape
    cape_pts = [(cx - 70, cy - 80), (cx + 70, cy - 80), (cx + 160, 980), (cx - 160, 980)]
    draw.polygon(cape_pts, fill=(25, 25, 30), outline=(15, 15, 20), width=3)

    # Skeletal ribcage markings in bright white
    for ry in range(cy - 20, cy + 180, 32):
        draw.arc([cx - 75, ry, cx + 75, ry + 22], 0, 180, fill=(245, 245, 250), width=8)

    # Scythe in hand
    sx = cx - 130
    draw.line([sx, cy - 250, sx + 40, 960], fill=(120, 70, 35), width=10)
    # Scythe steel blade curved over top
    blade_pts = [(sx, cy - 250), (sx + 180, cy - 290), (sx + 240, cy - 260), (sx + 60, cy - 210)]
    draw.polygon(blade_pts, fill=(220, 225, 235), outline=(100, 105, 115), width=3)
    draw.line([sx + 5, cy - 248, sx + 235, cy - 262], fill=(255, 255, 255), width=4)

    # Day of the Dead skeletal dog skull
    hy = cy - 140
    draw.ellipse([cx - 85, hy - 75, cx + 85, hy + 75], fill=(245, 245, 250), outline=(30, 30, 35), width=4)
    # Floppy ears
    draw.ellipse([cx - 120, hy - 40, cx - 65, hy + 70], fill=(40, 40, 45), outline=(20, 20, 25), width=3)
    draw.ellipse([cx + 65, hy - 40, cx + 120, hy + 70], fill=(40, 40, 45), outline=(20, 20, 25), width=3)

    # Sugar skull eye sockets with Mexican floral petals!
    for eye_x in [cx - 40, cx + 40]:
        for pet_ang in range(0, 360, 45):
            prad = math.radians(pet_ang)
            px = eye_x + int(24 * math.cos(prad))
            py = hy - 15 + int(24 * math.sin(prad))
            draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(236, 72, 153))
        draw.ellipse([eye_x - 18, hy - 33, eye_x + 18, hy + 3], fill=(20, 20, 25))

    # Heart-shaped skeletal nose
    draw.polygon([(cx - 14, hy + 10), (cx + 14, hy + 10), (cx, hy + 28)], fill=(20, 20, 25))
    # Stitched skeleton smile
    draw.line([cx - 45, hy + 45, cx + 45, hy + 45], fill=(20, 20, 25), width=4)
    for tx in range(cx - 35, cx + 40, 14):
        draw.line([tx, hy + 36, tx, hy + 54], fill=(20, 20, 25), width=3)

    # Cempasúchil garland (Orange Mexican Marigold crown on head)
    for fx in range(cx - 80, cx + 85, 30):
        draw.ellipse([fx - 18, hy - 95, fx + 18, hy - 60], fill=(245, 158, 11), outline=(180, 90, 10), width=2)
        draw.ellipse([fx - 8, hy - 85, fx + 8, hy - 70], fill=(254, 240, 138))

    draw_title_banner(draw, "LA LOMITO MUERTE", border_col=(40, 40, 45))
    out = "public/cards/lomitos/14.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_michi_paraguas():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(20, 100, 140), inner_col=(220, 80, 40))
    draw_card_num(draw, 5)

    cx, cy = W // 2, 650
    # Gentle rain streaks
    for rx in range(100, W - 100, 45):
        for ry in range(120, 980, 90):
            draw.line([rx, ry, rx - 15, ry + 35], fill=(180, 215, 235), width=2)

    # Large Mexican Umbrella canopy (Red and Yellow alternating wedges)
    uy = cy - 140
    rad_x, rad_y = 220, 140
    draw.chord([cx - rad_x, uy - rad_y, cx + rad_x, uy + rad_y], 180, 360, fill=(239, 68, 68), outline=(160, 30, 30), width=4)
    # Yellow segments
    for off in [-120, 0, 120]:
        draw.polygon([(cx, uy - rad_y), (cx + off - 35, uy), (cx + off + 35, uy)], fill=(245, 158, 11))
    draw.chord([cx - rad_x, uy - rad_y, cx + rad_x, uy + rad_y], 180, 360, outline=(160, 30, 30), width=4)

    # Umbrella wooden shaft and curved J-handle
    draw.line([cx, uy - rad_y, cx, uy + 280], fill=(140, 85, 45), width=8)
    draw.arc([cx, uy + 250, cx + 45, uy + 295], 0, 180, fill=(140, 85, 45), width=8)

    # Kitten in yellow rain boots standing under the umbrella
    draw.ellipse([cx - 80, cy + 290, cx - 25, cy + 340], fill=(250, 204, 21), outline=(160, 120, 10), width=3)
    draw.ellipse([cx + 25, cy + 290, cx + 80, cy + 340], fill=(250, 204, 21), outline=(160, 120, 10), width=3)

    # Kitten body
    draw.ellipse([cx - 75, cy + 60, cx + 75, cy + 280], fill=(235, 140, 50), outline=(130, 70, 20), width=3)
    draw.ellipse([cx - 45, cy + 100, cx + 45, cy + 260], fill=(255, 240, 220))

    # Kitten head looking up happily
    hy = cy
    draw.ellipse([cx - 75, hy - 65, cx + 75, hy + 65], fill=(235, 140, 50), outline=(130, 70, 20), width=3)
    draw.polygon([(cx - 70, hy - 30), (cx - 65, hy - 110), (cx - 20, hy - 55)], fill=(235, 140, 50), outline=(130, 70, 20), width=3)
    draw.polygon([(cx + 20, hy - 55), (cx + 65, hy - 110), (cx + 70, hy - 30)], fill=(235, 140, 50), outline=(130, 70, 20), width=3)

    # Big cute anime cat eyes
    draw.ellipse([cx - 48, hy - 25, cx - 18, hy + 15], fill=(34, 197, 94))
    draw.ellipse([cx + 18, hy - 25, cx + 48, hy + 15], fill=(34, 197, 94))
    draw.ellipse([cx - 38, hy - 20, cx - 28, hy + 10], fill=(15, 15, 15))
    draw.ellipse([cx + 28, hy - 20, cx + 38, hy + 10], fill=(15, 15, 15))
    # Highlights
    draw.ellipse([cx - 42, hy - 18, cx - 34, hy - 8], fill=(255, 255, 255))
    draw.ellipse([cx + 24, hy - 18, cx + 32, hy - 8], fill=(255, 255, 255))
    # Nose & mouth
    draw.polygon([(cx - 10, hy + 16), (cx + 10, hy + 16), (cx, hy + 26)], fill=(245, 150, 160))
    draw.arc([cx - 20, hy + 20, cx, hy + 35], 0, 180, fill=(60, 35, 15), width=2)
    draw.arc([cx, hy + 20, cx + 20, hy + 35], 0, 180, fill=(60, 35, 15), width=2)

    draw_title_banner(draw, "EL PARAGUAS MICHI", border_col=(20, 100, 140))
    out = "public/cards/michis/05.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_lomito_paraguas():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(30, 100, 145), inner_col=(230, 120, 30))
    draw_card_num(draw, 5)

    cx, cy = W // 2, 650
    for rx in range(100, W - 100, 45):
        for ry in range(120, 980, 90):
            draw.line([rx, ry, rx - 15, ry + 35], fill=(180, 215, 235), width=2)

    uy = cy - 140
    rad_x, rad_y = 220, 140
    draw.chord([cx - rad_x, uy - rad_y, cx + rad_x, uy + rad_y], 180, 360, fill=(16, 185, 129), outline=(10, 120, 80), width=4)
    for off in [-120, 0, 120]:
        draw.polygon([(cx, uy - rad_y), (cx + off - 35, uy), (cx + off + 35, uy)], fill=(245, 158, 11))
    draw.chord([cx - rad_x, uy - rad_y, cx + rad_x, uy + rad_y], 180, 360, outline=(10, 120, 80), width=4)

    draw.line([cx, uy - rad_y, cx, uy + 280], fill=(140, 85, 45), width=8)
    draw.arc([cx, uy + 250, cx + 45, uy + 295], 0, 180, fill=(140, 85, 45), width=8)

    # Yellow boots
    draw.ellipse([cx - 80, cy + 290, cx - 25, cy + 340], fill=(250, 204, 21), outline=(160, 120, 10), width=3)
    draw.ellipse([cx + 25, cy + 290, cx + 80, cy + 340], fill=(250, 204, 21), outline=(160, 120, 10), width=3)

    # Golden Retriever puppy
    draw.ellipse([cx - 80, cy + 60, cx + 80, cy + 280], fill=(225, 175, 95), outline=(130, 90, 35), width=3)
    draw.ellipse([cx - 50, cy + 100, cx + 50, cy + 260], fill=(252, 238, 215))

    hy = cy
    draw.ellipse([cx - 80, hy - 65, cx + 80, hy + 65], fill=(225, 175, 95), outline=(130, 90, 35), width=3)
    draw.ellipse([cx - 110, hy - 35, cx - 60, hy + 65], fill=(185, 125, 55), outline=(120, 75, 30), width=3)
    draw.ellipse([cx + 60, hy - 35, cx + 110, hy + 65], fill=(185, 125, 55), outline=(120, 75, 30), width=3)

    # Puppy face
    draw.ellipse([cx - 45, hy - 20, cx - 20, hy + 12], fill=(20, 15, 15))
    draw.ellipse([cx + 20, hy - 20, cx + 45, hy + 12], fill=(20, 15, 15))
    draw.ellipse([cx - 40, hy - 16, cx - 32, hy - 8], fill=(255, 255, 255))
    draw.ellipse([cx + 25, hy - 16, cx + 33, hy - 8], fill=(255, 255, 255))
    # Snout
    draw.ellipse([cx - 35, hy + 5, cx + 35, hy + 45], fill=(245, 225, 195))
    draw.polygon([(cx - 16, hy + 10), (cx + 16, hy + 10), (cx, hy + 24)], fill=(20, 15, 15))
    # Pink tongue sticking out happy
    draw.ellipse([cx - 10, hy + 30, cx + 10, hy + 50], fill=(244, 114, 182))

    draw_title_banner(draw, "EL PARAGUAS LOMITO", border_col=(30, 100, 145))
    out = "public/cards/lomitos/05.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_michi_sirena():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(14, 116, 144), inner_col=(217, 70, 239))
    draw_card_num(draw, 6)

    cx, cy = W // 2, 630
    # Ocean waves
    for y in range(720, 1050, 4):
        prog = (y - 720) / 330.0
        r = int(14 + prog * 10)
        g = int(116 + prog * 40)
        b = int(144 + prog * 40)
        draw.line([70, y, W - 70, y], fill=(r, g, b))

    # Mermaid scaled fish tail in turquoise & gold
    tail_pts = [
        (cx - 50, cy + 40), (cx + 60, cy + 90), (cx + 140, cy + 180),
        (cx + 80, cy + 280), (cx - 40, cy + 340), (cx - 120, cy + 280),
        (cx - 20, cy + 180), (cx - 50, cy + 90)
    ]
    draw.polygon(tail_pts, fill=(20, 184, 166), outline=(13, 148, 136), width=3)
    # Mermaid tail fins (flukes) splashing above water
    fin_l = [(cx - 40, cy + 340), (cx - 120, cy + 410), (cx - 30, cy + 370)]
    fin_r = [(cx - 40, cy + 340), (cx + 40, cy + 410), (cx - 10, cy + 370)]
    draw.polygon(fin_l, fill=(45, 212, 191), outline=(13, 148, 136), width=2)
    draw.polygon(fin_r, fill=(45, 212, 191), outline=(13, 148, 136), width=2)

    # Cat upper body
    draw.ellipse([cx - 70, cy - 80, cx + 70, cy + 80], fill=(245, 235, 220), outline=(160, 130, 95), width=3)
    # Pearl necklace / seashell bra
    draw.ellipse([cx - 35, cy - 5, cx - 5, cy + 25], fill=(244, 114, 182), outline=(190, 24, 93), width=2)
    draw.ellipse([cx + 5, cy - 5, cx + 35, cy + 25], fill=(244, 114, 182), outline=(190, 24, 93), width=2)

    # Cat head
    hy = cy - 130
    draw.ellipse([cx - 75, hy - 65, cx + 75, hy + 65], fill=(245, 235, 220), outline=(160, 130, 95), width=3)
    # Ears with floral starfish
    draw.polygon([(cx - 70, hy - 30), (cx - 65, hy - 110), (cx - 20, hy - 55)], fill=(245, 235, 220), outline=(160, 130, 95), width=3)
    draw.polygon([(cx + 20, hy - 55), (cx + 65, hy - 110), (cx + 70, hy - 30)], fill=(245, 235, 220), outline=(160, 130, 95), width=3)
    draw.ellipse([cx + 45, hy - 65, cx + 75, hy - 35], fill=(239, 68, 68)) # red starfish

    # Graceful sea green cat eyes
    draw.ellipse([cx - 48, hy - 20, cx - 18, hy + 15], fill=(13, 148, 136))
    draw.ellipse([cx + 18, hy - 20, cx + 48, hy + 15], fill=(13, 148, 136))
    draw.ellipse([cx - 38, hy - 16, cx - 28, hy + 11], fill=(15, 15, 15))
    draw.ellipse([cx + 28, hy - 16, cx + 38, hy + 11], fill=(15, 15, 15))

    draw_title_banner(draw, "LA MICHI SIRENA", border_col=(14, 116, 144))
    out = "public/cards/michis/06.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_lomito_sirena():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(14, 116, 144), inner_col=(245, 158, 11))
    draw_card_num(draw, 6)

    cx, cy = W // 2, 630
    for y in range(720, 1050, 4):
        prog = (y - 720) / 330.0
        r = int(14 + prog * 10)
        g = int(116 + prog * 40)
        b = int(144 + prog * 40)
        draw.line([70, y, W - 70, y], fill=(r, g, b))

    # Scaled fish tail
    tail_pts = [
        (cx - 50, cy + 40), (cx + 60, cy + 90), (cx + 140, cy + 180),
        (cx + 80, cy + 280), (cx - 40, cy + 340), (cx - 120, cy + 280),
        (cx - 20, cy + 180), (cx - 50, cy + 90)
    ]
    draw.polygon(tail_pts, fill=(16, 185, 129), outline=(5, 150, 105), width=3)
    fin_l = [(cx - 40, cy + 340), (cx - 120, cy + 410), (cx - 30, cy + 370)]
    fin_r = [(cx - 40, cy + 340), (cx + 40, cy + 410), (cx - 10, cy + 370)]
    draw.polygon(fin_l, fill=(52, 211, 153), outline=(5, 150, 105), width=2)
    draw.polygon(fin_r, fill=(52, 211, 153), outline=(5, 150, 105), width=2)

    # Dog upper body (Golden Retriever)
    draw.ellipse([cx - 75, cy - 80, cx + 75, cy + 80], fill=(225, 175, 95), outline=(130, 90, 35), width=3)

    hy = cy - 130
    draw.ellipse([cx - 80, hy - 65, cx + 80, hy + 65], fill=(225, 175, 95), outline=(130, 90, 35), width=3)
    draw.ellipse([cx - 110, hy - 35, cx - 60, hy + 65], fill=(185, 125, 55), outline=(120, 75, 30), width=3)
    draw.ellipse([cx + 60, hy - 35, cx + 110, hy + 65], fill=(185, 125, 55), outline=(120, 75, 30), width=3)

    # Eyes & snout
    draw.ellipse([cx - 45, hy - 20, cx - 20, hy + 12], fill=(20, 15, 15))
    draw.ellipse([cx + 20, hy - 20, cx + 45, hy + 12], fill=(20, 15, 15))
    draw.ellipse([cx - 35, hy + 5, cx + 35, hy + 45], fill=(245, 225, 195))
    draw.polygon([(cx - 16, hy + 10), (cx + 16, hy + 10), (cx, hy + 24)], fill=(20, 15, 15))
    # Sea flower in ear
    draw.ellipse([cx + 65, hy - 55, cx + 95, hy - 25], fill=(236, 72, 153), outline=(190, 24, 93), width=2)

    draw_title_banner(draw, "LA SIRENA LOMITO", border_col=(14, 116, 144))
    out = "public/cards/lomitos/06.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_michi_luna():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(30, 41, 59), inner_col=(234, 179, 8))
    draw_card_num(draw, 23)

    cx, cy = W // 2, 630
    # Deep midnight indigo oval with stars
    draw.ellipse([cx - 240, cy - 250, cx + 240, cy + 250], fill=(15, 23, 42))
    # Golden stars
    for sx, sy in [(cx - 160, cy - 140), (cx + 140, cy - 180), (cx - 120, cy + 160), (cx + 160, cy + 120), (cx + 60, cy - 200)]:
        draw.polygon([(sx, sy - 14), (sx + 4, sy - 4), (sx + 14, sy), (sx + 4, sy + 4), (sx, sy + 14), (sx - 4, sy + 4), (sx - 14, sy), (sx - 4, sy - 4)], fill=(254, 240, 138))

    # Smiling classic crescent moon
    moon_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(moon_img)
    mdraw.ellipse([cx - 150, cy - 180, cx + 150, cy + 180], fill=(250, 204, 21, 255))
    mdraw.ellipse([cx - 70, cy - 200, cx + 200, cy + 160], fill=(0, 0, 0, 0))
    img.paste(moon_img, (0, 0), moon_img)

    # Peaceful white sleeping cat curled up on the crescent moon
    draw.ellipse([cx - 90, cy + 30, cx + 50, cy + 150], fill=(250, 250, 252), outline=(148, 163, 184), width=3)
    # Cat head resting on paws
    draw.ellipse([cx - 85, cy + 40, cx - 15, cy + 110], fill=(250, 250, 252), outline=(148, 163, 184), width=3)
    draw.polygon([(cx - 80, cy + 45), (cx - 75, cy + 15), (cx - 50, cy + 35)], fill=(250, 250, 252), outline=(148, 163, 184), width=2)
    draw.polygon([(cx - 45, cy + 35), (cx - 20, cy + 15), (cx - 15, cy + 45)], fill=(250, 250, 252), outline=(148, 163, 184), width=2)
    # Sleeping closed eye
    draw.arc([cx - 65, cy + 65, cx - 35, cy + 85], 0, 180, fill=(71, 85, 105), width=3)
    # Cute curled tail
    draw.arc([cx + 30, cy + 60, cx + 90, cy + 140], 270, 90, fill=(250, 250, 252), width=16)

    draw_title_banner(draw, "LA LUNA MICHI", border_col=(30, 41, 59))
    out = "public/cards/michis/23.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_lomito_luna():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(30, 41, 59), inner_col=(234, 179, 8))
    draw_card_num(draw, 23)

    cx, cy = W // 2, 630
    draw.ellipse([cx - 240, cy - 250, cx + 240, cy + 250], fill=(15, 23, 42))
    for sx, sy in [(cx - 160, cy - 140), (cx + 140, cy - 180), (cx - 120, cy + 160), (cx + 160, cy + 120), (cx + 60, cy - 200)]:
        draw.polygon([(sx, sy - 14), (sx + 4, sy - 4), (sx + 14, sy), (sx + 4, sy + 4), (sx, sy + 14), (sx - 4, sy + 4), (sx - 14, sy), (sx - 4, sy - 4)], fill=(254, 240, 138))

    moon_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(moon_img)
    mdraw.ellipse([cx - 150, cy - 180, cx + 150, cy + 180], fill=(250, 204, 21, 255))
    mdraw.ellipse([cx - 70, cy - 200, cx + 200, cy + 160], fill=(0, 0, 0, 0))
    img.paste(moon_img, (0, 0), moon_img)

    # Cute Golden Lomito sleeping on the moon
    draw.ellipse([cx - 95, cy + 30, cx + 55, cy + 150], fill=(225, 175, 95), outline=(130, 90, 35), width=3)
    draw.ellipse([cx - 90, cy + 40, cx - 20, cy + 110], fill=(225, 175, 95), outline=(130, 90, 35), width=3)
    draw.ellipse([cx - 105, cy + 50, cx - 65, cy + 115], fill=(185, 125, 55), outline=(120, 75, 30), width=3)
    draw.arc([cx - 65, cy + 65, cx - 35, cy + 85], 0, 180, fill=(40, 25, 15), width=3)
    draw.ellipse([cx - 45, cy + 80, cx - 30, cy + 95], fill=(20, 15, 15))

    draw_title_banner(draw, "LA LUNA LOMITO", border_col=(30, 41, 59))
    out = "public/cards/lomitos/23.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_michi_sol():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(217, 119, 6), inner_col=(220, 38, 38))
    draw_card_num(draw, 46)

    cx, cy = W // 2, 630
    # Aztec/Mexican sun rays (alternating triangles and wavy flames)
    for ang in range(0, 360, 20):
        rad = math.radians(ang)
        r1, r2 = 190, 290
        x1 = cx + int(r1 * math.cos(rad))
        y1 = cy + int(r1 * math.sin(rad))
        x2 = cx + int(r2 * math.cos(rad))
        y2 = cy + int(r2 * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=(245, 158, 11), width=10)
        draw.line([x1, y1, x2, y2], fill=(254, 240, 138), width=4)

    # Radiant golden sun disk
    draw.ellipse([cx - 190, cy - 190, cx + 190, cy + 190], fill=(250, 204, 21), outline=(180, 83, 9), width=5)

    # Smiling orange sun cat face in center
    draw.ellipse([cx - 130, cy - 110, cx + 130, cy + 110], fill=(245, 140, 45), outline=(160, 60, 15), width=4)
    # Ears
    draw.polygon([(cx - 120, cy - 60), (cx - 110, cy - 170), (cx - 40, cy - 90)], fill=(245, 140, 45), outline=(160, 60, 15), width=3)
    draw.polygon([(cx + 40, cy - 90), (cx + 110, cy - 170), (cx + 120, cy - 60)], fill=(245, 140, 45), outline=(160, 60, 15), width=3)

    # Radiant golden eyes
    draw.ellipse([cx - 75, cy - 40, cx - 25, cy + 15], fill=(254, 240, 138), outline=(60, 30, 10), width=3)
    draw.ellipse([cx + 25, cy - 40, cx + 75, cy + 15], fill=(254, 240, 138), outline=(60, 30, 10), width=3)
    draw.ellipse([cx - 55, cy - 35, cx - 40, cy + 10], fill=(15, 15, 15))
    draw.ellipse([cx + 40, cy - 35, cx + 55, cy + 10], fill=(15, 15, 15))

    # Cute nose and smiling cat muzzle
    draw.polygon([(cx - 16, cy + 22), (cx + 16, cy + 22), (cx, cy + 38)], fill=(244, 114, 182))
    draw.arc([cx - 35, cy + 30, cx, cy + 60], 0, 180, fill=(80, 35, 15), width=4)
    draw.arc([cx, cy + 30, cx + 35, cy + 60], 0, 180, fill=(80, 35, 15), width=4)

    draw_title_banner(draw, "EL SOL MICHI", border_col=(217, 119, 6))
    out = "public/cards/michis/46.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

def generate_lomito_sol():
    img = create_parchment_base()
    draw = ImageDraw.Draw(img)
    draw_mexican_ornamental_frame(draw, border_col=(217, 119, 6), inner_col=(220, 38, 38))
    draw_card_num(draw, 46)

    cx, cy = W // 2, 630
    for ang in range(0, 360, 20):
        rad = math.radians(ang)
        r1, r2 = 190, 290
        x1 = cx + int(r1 * math.cos(rad))
        y1 = cy + int(r1 * math.sin(rad))
        x2 = cx + int(r2 * math.cos(rad))
        y2 = cy + int(r2 * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=(245, 158, 11), width=10)
        draw.line([x1, y1, x2, y2], fill=(254, 240, 138), width=4)

    draw.ellipse([cx - 190, cy - 190, cx + 190, cy + 190], fill=(250, 204, 21), outline=(180, 83, 9), width=5)

    # Golden dog sun face
    draw.ellipse([cx - 130, cy - 110, cx + 130, cy + 110], fill=(225, 175, 95), outline=(130, 90, 35), width=4)
    draw.ellipse([cx - 170, cy - 50, cx - 100, cy + 90], fill=(185, 125, 55), outline=(120, 75, 30), width=3)
    draw.ellipse([cx + 100, cy - 50, cx + 170, cy + 90], fill=(185, 125, 55), outline=(120, 75, 30), width=3)

    # Big happy eyes
    draw.ellipse([cx - 70, cy - 35, cx - 25, cy + 10], fill=(20, 15, 15))
    draw.ellipse([cx + 25, cy - 35, cx + 70, cy + 10], fill=(20, 15, 15))
    draw.ellipse([cx - 60, cy - 30, cx - 45, cy - 15], fill=(255, 255, 255))
    draw.ellipse([cx + 35, cy - 30, cx + 50, cy - 15], fill=(255, 255, 255))

    # Snout and tongue
    draw.ellipse([cx - 50, cy + 10, cx + 50, cy + 70], fill=(248, 230, 200))
    draw.polygon([(cx - 20, cy + 15), (cx + 20, cy + 15), (cx, cy + 35)], fill=(20, 15, 15))
    draw.ellipse([cx - 15, cy + 45, cx + 15, cy + 75], fill=(244, 114, 182))

    draw_title_banner(draw, "EL SOL LOMITO", border_col=(217, 119, 6))
    out = "public/cards/lomitos/46.jpg"
    img.save(out, "JPEG", quality=95)
    print("Saved:", out)

if __name__ == "__main__":
    generate_lomito_diablo()
    generate_michi_gallo()
    generate_lomito_gallo()
    generate_michi_valiente()
    generate_lomito_muerte()
    generate_michi_paraguas()
    generate_lomito_paraguas()
    generate_michi_sirena()
    generate_lomito_sirena()
    generate_michi_luna()
    generate_lomito_luna()
    generate_michi_sol()
    generate_lomito_sol()



