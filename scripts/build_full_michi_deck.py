#!/usr/bin/env python3
"""
Complete Production Generator for all 54 cards of "Baraja Michis & Gatos".
Saves to public/cards/michis/{01..54}.jpg with authentic Mexican woodcut lotería styling.
Preserves existing masterpiece cards 2, 3, 4, 14.
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont

W, H = 848, 1264
OUT_DIR = "public/cards/michis"
os.makedirs(OUT_DIR, exist_ok=True)

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
    random.seed(1337)
    for _ in range(12000):
        x = random.randint(0, W - 1)
        y = random.randint(0, H - 1)
        s = random.randint(228, 246)
        img.putpixel((x, y), (s, s - 7, s - 22))
    
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
    
    corners = [(m1 + 10, m1 + 10), (W - m1 - 10, m1 + 10), (m1 + 10, H - m1 - 10), (W - m1 - 10, H - m1 - 10)]
    for cx, cy in corners:
        draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], fill=border_col)
        draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(245, 230, 190), outline=(218, 165, 32), width=2)
        draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=border_col)
        
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
    font = get_font(48, bold=True)
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

def draw_michi_face(draw, cx, cy, fur=(235, 130, 45), eye_col=(35, 135, 55), radius=75, outline=(130, 60, 20)):
    draw.ellipse([cx - radius, cy - radius * 0.9, cx + radius, cy + radius * 0.9], fill=fur, outline=outline, width=3)
    ear_l = [(cx - radius * 0.85, cy - radius * 0.3), (cx - radius * 0.75, cy - radius * 1.5), (cx - radius * 0.2, cy - radius * 0.7)]
    ear_r = [(cx + radius * 0.2, cy - radius * 0.7), (cx + radius * 0.75, cy - radius * 1.5), (cx + radius * 0.85, cy - radius * 0.3)]
    draw.polygon(ear_l, fill=fur, outline=outline, width=3)
    draw.polygon([(cx - radius * 0.75, cy - radius * 0.35), (cx - radius * 0.68, cy - radius * 1.3), (cx - radius * 0.3, cy - radius * 0.65)], fill=(245, 175, 165))
    draw.polygon(ear_r, fill=fur, outline=outline, width=3)
    draw.polygon([(cx + radius * 0.3, cy - radius * 0.65), (cx + radius * 0.68, cy - radius * 1.3), (cx + radius * 0.75, cy - radius * 0.35)], fill=(245, 175, 165))
    
    ew, eh = radius * 0.28, radius * 0.35
    draw.ellipse([cx - radius * 0.48 - ew, cy - eh, cx - radius * 0.48 + ew, cy + eh], fill=eye_col)
    draw.ellipse([cx + radius * 0.48 - ew, cy - eh, cx + radius * 0.48 + ew, cy + eh], fill=eye_col)
    pw = ew * 0.35
    draw.ellipse([cx - radius * 0.48 - pw, cy - eh * 0.8, cx - radius * 0.48 + pw, cy + eh * 0.8], fill=(15, 15, 15))
    draw.ellipse([cx + radius * 0.48 - pw, cy - eh * 0.8, cx + radius * 0.48 + pw, cy + eh * 0.8], fill=(15, 15, 15))
    draw.ellipse([cx - radius * 0.48 - pw - 2, cy - eh * 0.5, cx - radius * 0.48 + pw - 4, cy - eh * 0.1], fill=(255, 255, 255))
    draw.ellipse([cx + radius * 0.48 - pw - 2, cy - eh * 0.5, cx + radius * 0.48 + pw - 4, cy - eh * 0.1], fill=(255, 255, 255))
    
    nw = radius * 0.18
    ny = cy + radius * 0.18
    draw.polygon([(cx - nw, ny), (cx + nw, ny), (cx, ny + nw * 1.2)], fill=(245, 145, 160))
    draw.arc([cx - nw * 1.8, ny + nw * 0.8, cx, ny + nw * 2.2], 0, 180, fill=(80, 40, 20), width=3)
    draw.arc([cx, ny + nw * 0.8, cx + nw * 1.8, ny + nw * 2.2], 0, 180, fill=(80, 40, 20), width=3)
    for dy in [-8, 4, 16]:
        draw.line([cx - radius * 0.4, cy + dy, cx - radius * 1.35, cy + dy * 1.5], fill=(60, 40, 25), width=2)
        draw.line([cx + radius * 0.4, cy + dy, cx + radius * 1.35, cy + dy * 1.5], fill=(60, 40, 25), width=2)

def draw_michi_body(draw, cx, cy, fur=(235, 130, 45), belly=(252, 235, 210), rx=90, ry=140, outline=(130, 60, 20)):
    draw.ellipse([cx - rx, cy - ry * 0.5, cx + rx, cy + ry * 0.8], fill=fur, outline=outline, width=3)
    draw.ellipse([cx - rx * 0.6, cy - ry * 0.2, cx + rx * 0.6, cy + ry * 0.7], fill=belly)

def draw_card(num, title, draw_fn, border_col=(168, 38, 38), inner_col=(18, 92, 110)):
    if num in PRESERVED:
        print(f"Skipping preserved card {num:02d}")
        return
    img = create_base()
    draw = ImageDraw.Draw(img)
    draw_frame(draw, border_col=border_col, inner_col=inner_col)
    draw_num(draw, num, border_col=border_col)
    draw_fn(draw)
    draw_title(draw, title, border_col=border_col)
    out_path = f"{OUT_DIR}/{num:02d}.jpg"
    img.save(out_path, "JPEG", quality=95)
    print(f"Generated card {num:02d}: {title}")

# Define all card illustrations
def draw_01(draw): # EL MICHI GALLO
    cx, cy = W // 2, 650
    for ang in range(0, 180, 15):
        rad = math.radians(ang)
        x2 = cx + int(360 * math.cos(rad))
        y2 = 720 - int(360 * math.sin(rad))
        draw.line([cx, 720, x2, y2], fill=(255, 235, 180), width=4)
    draw.polygon([(cx - 70, 720), (cx + 70, 720), (cx + 60, 1050), (cx - 60, 1050)], fill=(140, 85, 45), outline=(75, 40, 20), width=4)
    draw.rectangle([70, 820, W - 70, 890], fill=(155, 95, 50), outline=(80, 45, 25), width=3)
    tail_colors = [(220, 38, 38), (37, 99, 235), (22, 163, 74), (202, 138, 4), (147, 51, 234)]
    for i, col in enumerate(tail_colors):
        arc_pts = [(cx - 40 - i * 16 - int(math.sin(t/24.0 * math.pi) * 110), 700 - int((t/24.0) * 260) + i * 20) for t in range(25)]
        for p in range(len(arc_pts) - 1):
            draw.line([arc_pts[p], arc_pts[p+1]], fill=col, width=16)
    draw.ellipse([cx - 85, cy - 70, cx + 85, cy + 90], fill=(235, 130, 45), outline=(135, 60, 20), width=4)
    draw.ellipse([cx - 50, cy - 30, cx + 50, cy + 80], fill=(254, 235, 205))
    draw.ellipse([cx - 55, 705, cx - 15, 735], fill=(245, 160, 70), outline=(130, 60, 20), width=2)
    draw.ellipse([cx + 15, 705, cx + 55, 735], fill=(245, 160, 70), outline=(130, 60, 20), width=2)
    hy = cy - 120
    draw.ellipse([cx - 75, hy - 65, cx + 75, hy + 65], fill=(235, 130, 45), outline=(135, 60, 20), width=4)
    draw.polygon([(cx - 70, hy - 30), (cx - 65, hy - 110), (cx - 20, hy - 55)], fill=(235, 130, 45), outline=(135, 60, 20), width=3)
    draw.polygon([(cx + 20, hy - 55), (cx + 65, hy - 110), (cx + 70, hy - 30)], fill=(235, 130, 45), outline=(135, 60, 20), width=3)
    comb_pts = [(cx - 35, hy - 60), (cx - 30, hy - 125), (cx - 10, hy - 85), (cx, hy - 135), (cx + 10, hy - 85), (cx + 30, hy - 125), (cx + 35, hy - 60)]
    draw.polygon(comb_pts, fill=(220, 38, 38), outline=(130, 20, 20), width=3)
    draw.ellipse([cx - 16, hy + 45, cx + 16, hy + 90], fill=(220, 38, 38), outline=(130, 20, 20), width=2)
    draw.polygon([(cx - 15, hy + 20), (cx + 15, hy + 20), (cx, hy + 42)], fill=(120, 20, 30), outline=(60, 10, 15), width=2)
    draw.arc([cx - 50, hy - 10, cx - 20, hy + 15], 180, 360, fill=(40, 25, 15), width=4)
    draw.arc([cx + 20, hy - 10, cx + 50, hy + 15], 180, 360, fill=(40, 25, 15), width=4)

def draw_05(draw): # EL PARAGUAS MICHI
    cx, cy = W // 2, 600
    # Raindrops
    for rx, ry in [(cx-180, 300), (cx-90, 240), (cx+110, 260), (cx+210, 320), (cx-220, 500), (cx+220, 520), (cx-180, 800), (cx+200, 850)]:
        draw.line([rx, ry, rx - 10, ry + 35], fill=(59, 130, 246), width=3)
    # Puddle
    draw.ellipse([cx - 180, 930, cx + 180, 990], fill=(191, 219, 254), outline=(96, 165, 250), width=2)
    # Umbrella handle
    draw.line([cx, 440, cx, 800], fill=(180, 120, 40), width=10)
    draw.arc([cx - 30, 770, cx, 830], 0, 180, fill=(180, 120, 40), width=10)
    # Umbrella canopy
    draw.chord([cx - 240, 310, cx + 240, 610], 180, 360, fill=(239, 68, 68), outline=(185, 28, 28), width=4)
    # Segments
    draw.chord([cx - 160, 310, cx + 160, 610], 180, 360, fill=(245, 158, 11))
    draw.chord([cx - 80, 310, cx + 80, 610], 180, 360, fill=(34, 197, 94))
    draw.line([cx, 310, cx, 340], fill=(180, 120, 40), width=8)
    # Kitten under umbrella
    draw_michi_body(draw, cx, 760, rx=70, ry=100)
    draw_michi_face(draw, cx, 660, radius=60)
    # Yellow boots
    draw.ellipse([cx - 55, 870, cx - 15, 930], fill=(250, 204, 21), outline=(161, 98, 7), width=3)
    draw.ellipse([cx + 15, 870, cx + 55, 930], fill=(250, 204, 21), outline=(161, 98, 7), width=3)

def draw_06(draw): # LA MICHI SIRENA
    cx, cy = W // 2, 600
    # Ocean waves
    for y in [760, 840, 920]:
        for x in range(80, W - 80, 90):
            draw.arc([x, y, x + 90, y + 45], 0, 180, fill=(14, 116, 144), width=4)
    # Fish tail
    tail_pts = [(cx, 680), (cx + 80, 740), (cx + 120, 830), (cx + 60, 910), (cx + 140, 960), (cx + 40, 940), (cx + 20, 900), (cx - 20, 780), (cx, 680)]
    draw.polygon(tail_pts, fill=(20, 184, 166), outline=(13, 148, 136), width=3)
    # Scales
    for sy in range(720, 880, 25):
        draw.arc([cx - 10, sy, cx + 70, sy + 25], 0, 180, fill=(94, 234, 212), width=3)
    # Cat torso & head
    draw.ellipse([cx - 65, 530, cx + 65, 690], fill=(255, 237, 213), outline=(180, 120, 80), width=3)
    # Seashell bra
    draw.ellipse([cx - 45, 590, cx - 10, 630], fill=(244, 114, 182), outline=(190, 24, 93), width=2)
    draw.ellipse([cx + 10, 590, cx + 45, 630], fill=(244, 114, 182), outline=(190, 24, 93), width=2)
    draw_michi_face(draw, cx, 470, fur=(255, 237, 213), eye_col=(14, 165, 233), radius=65)
    # Flower in ear
    draw.ellipse([cx + 50, 410, cx + 75, 435], fill=(236, 72, 153))

def draw_07(draw): # LA ESCALERA MICHI
    cx, cy = W // 2, 600
    # Wooden ladder rungs
    lx1, lx2 = cx - 110, cx + 110
    draw.line([lx1, 250, lx1 - 30, 980], fill=(146, 64, 14), width=14)
    draw.line([lx2, 250, lx2 + 30, 980], fill=(146, 64, 14), width=14)
    for ry in range(320, 960, 85):
        draw.line([lx1 - (ry-250)//24, ry, lx2 + (ry-250)//24, ry], fill=(180, 83, 9), width=10)
    # Climbing kitten
    draw_michi_body(draw, cx, 580, rx=75, ry=110)
    draw_michi_face(draw, cx, 470, radius=65)
    # Paws holding rungs
    draw.ellipse([cx - 95, 470, cx - 55, 505], fill=(235, 130, 45), outline=(130, 60, 20), width=2)
    draw.ellipse([cx + 55, 470, cx + 95, 505], fill=(235, 130, 45), outline=(130, 60, 20), width=2)
    draw.ellipse([cx - 75, 670, cx - 40, 705], fill=(235, 130, 45), outline=(130, 60, 20), width=2)
    draw.ellipse([cx + 40, 670, cx + 75, 705], fill=(235, 130, 45), outline=(130, 60, 20), width=2)

def draw_08(draw): # LA BOTELLA MICHI
    cx, cy = W // 2, 620
    # Vintage wooden table
    draw.rectangle([70, 820, W - 70, 980], fill=(161, 98, 7), outline=(113, 63, 18), width=3)
    # Vintage Mexican glass bottle
    bx, by = cx - 70, 400
    draw.rectangle([bx, by + 120, bx + 140, 820], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    draw.polygon([(bx, by + 120), (bx + 140, by + 120), (bx + 100, by + 40), (bx + 40, by + 40)], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    draw.rectangle([bx + 40, by, bx + 100, by + 40], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    # Cork
    draw.rectangle([bx + 45, by - 25, bx + 95, by], fill=(217, 119, 6), outline=(146, 64, 14), width=3)
    # Label
    draw.rectangle([bx + 15, by + 220, bx + 125, by + 340], fill=(254, 243, 199), outline=(180, 83, 9), width=3)
    draw.ellipse([bx + 35, by + 245, bx + 105, by + 315], fill=(239, 68, 68))
    # Curious cat beside bottle batting at the cork
    draw_michi_body(draw, cx + 150, 720, rx=70, ry=90)
    draw_michi_face(draw, cx + 140, 610, radius=60)
    # Raised paw reaching towards cork
    draw.line([cx + 90, 650, bx + 115, by + 15], fill=(235, 130, 45), width=18)
    draw.ellipse([bx + 100, by, bx + 130, by + 30], fill=(235, 130, 45), outline=(130, 60, 20), width=2)

def draw_09(draw): # EL BARRIL MICHI
    cx, cy = W // 2, 650
    # Oak Barrel
    bx, by = cx, 740
    draw.ellipse([bx - 170, by - 70, bx + 170, by + 70], fill=(120, 65, 30), outline=(60, 30, 15), width=4)
    draw.polygon([(bx - 170, by), (bx + 170, by), (bx + 140, by + 260), (bx - 140, by + 260)], fill=(146, 64, 14), outline=(75, 40, 20), width=4)
    draw.ellipse([bx - 140, by + 230, bx + 140, by + 290], fill=(120, 65, 30), outline=(60, 30, 15), width=4)
    # Iron barrel bands
    draw.arc([bx - 165, by + 40, bx + 165, by + 90], 0, 180, fill=(30, 30, 35), width=12)
    draw.arc([bx - 150, by + 170, bx + 150, by + 215], 0, 180, fill=(30, 30, 35), width=12)
    # Staves vertical lines
    for sx in [-80, 0, 80]:
        draw.line([bx + sx, by + 20, bx + int(sx * 0.85), by + 250], fill=(85, 40, 20), width=3)
    # Chubby cat peeking out of barrel
    draw_michi_face(draw, cx, 520, fur=(245, 158, 11), eye_col=(22, 163, 74), radius=85)
    # Paws on barrel rim
    draw.ellipse([cx - 100, 650, cx - 40, 690], fill=(245, 158, 11), outline=(130, 60, 20), width=3)
    draw.ellipse([cx + 40, 650, cx + 100, 690], fill=(245, 158, 11), outline=(130, 60, 20), width=3)

def draw_10(draw): # EL ÁRBOL MICHI
    cx, cy = W // 2, 600
    # Trunk
    draw.polygon([(cx - 70, 520), (cx + 70, 520), (cx + 110, 980), (cx - 110, 980)], fill=(120, 65, 30), outline=(60, 30, 15), width=4)
    # Heavy branch
    draw.polygon([(cx - 50, 640), (cx + 260, 600), (cx + 270, 660), (cx - 30, 700)], fill=(120, 65, 30), outline=(60, 30, 15), width=4)
    # Foliage canopy
    for fx, fy, fr in [(cx - 140, 420, 140), (cx + 140, 420, 140), (cx, 320, 160), (cx - 70, 240, 120), (cx + 70, 240, 120)]:
        draw.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    # Sleeping cat on branch
    draw.ellipse([cx + 40, 570, cx + 220, 650], fill=(235, 130, 45), outline=(130, 60, 20), width=3)
    draw_michi_face(draw, cx + 70, 580, radius=50)
    # Hanging tail
    draw.arc([cx + 190, 610, cx + 240, 710], 270, 90, fill=(235, 130, 45), width=14)

def draw_11(draw): # EL MELÓN MICHI
    cx, cy = W // 2, 640
    # Big cantaloupe melon
    mx, my, mr = cx - 70, cy + 50, 160
    draw.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(234, 179, 8), outline=(161, 98, 7), width=4)
    # Netting pattern
    for a in range(0, 180, 25):
        draw.arc([mx - mr + 10, my - mr + 10, mx + mr - 10, my + mr - 10], a, a + 180, fill=(254, 240, 138), width=3)
    # Sliced melon wedge
    wx, wy = cx + 110, cy + 90
    draw.chord([wx - 100, wy - 90, wx + 100, wy + 90], 30, 150, fill=(249, 115, 22), outline=(194, 65, 12), width=3)
    draw.line([wx - 86, wy - 45, wx + 86, wy - 45], fill=(34, 197, 94), width=8)
    # Cat licking lips
    draw_michi_face(draw, cx + 90, 450, radius=70)
    # Little pink tongue
    draw.ellipse([cx + 90 - 12, 515, cx + 90 + 12, 535], fill=(244, 114, 182))

def draw_12(draw): # EL MICHI VALIENTE
    cx, cy = W // 2, 640
    # Boots & trousers
    draw.rectangle([cx - 90, 860, cx - 35, 960], fill=(225, 215, 195), outline=(130, 110, 90), width=3)
    draw.rectangle([cx + 35, 860, cx + 90, 960], fill=(225, 215, 195), outline=(130, 110, 90), width=3)
    draw.polygon([(cx - 100, 950), (cx - 30, 950), (cx - 25, 1010), (cx - 110, 1010)], fill=(120, 65, 30), outline=(60, 30, 15), width=3)
    draw.polygon([(cx + 30, 950), (cx + 100, 950), (cx + 110, 1010), (cx + 25, 1010)], fill=(120, 65, 30), outline=(60, 30, 15), width=3)
    # Body with sarape
    draw_michi_body(draw, cx, cy + 50, rx=90, ry=140)
    sarape = [(cx - 95, cy - 20), (cx + 80, cy + 10), (cx + 40, cy + 180), (cx - 90, cy + 160)]
    draw.polygon(sarape, fill=(220, 38, 38), outline=(120, 20, 20), width=3)
    draw.line([cx - 92, cy + 25, cx + 70, cy + 55], fill=(22, 163, 74), width=12)
    draw.line([cx - 90, cy + 65, cx + 60, cy + 95], fill=(255, 255, 255), width=10)
    draw.line([cx - 88, cy + 105, cx + 50, cy + 135], fill=(245, 158, 11), width=10)
    # Arm holding machete
    draw.line([cx + 70, cy + 50, cx + 150, cy + 100], fill=(210, 120, 45), width=24)
    mach = [(cx + 145, cy + 100), (cx + 210, cy - 160), (cx + 240, cy - 140), (cx + 175, cy + 100)]
    draw.polygon(mach, fill=(225, 230, 235), outline=(90, 100, 110), width=3)
    draw.line([cx + 212, cy - 155, cx + 148, cy + 95], fill=(255, 255, 255), width=4)
    # Heroic head
    draw_michi_face(draw, cx, cy - 110, radius=80)

def draw_13(draw): # EL GORRITO MICHI
    cx, cy = W // 2, 650
    draw_michi_body(draw, cx, cy + 70, rx=95, ry=140)
    draw_michi_face(draw, cx, cy - 80, radius=85)
    # Cone party hat
    hy = cy - 150
    hat_pts = [(cx - 65, hy), (cx, hy - 220), (cx + 65, hy)]
    draw.polygon(hat_pts, fill=(239, 68, 68), outline=(185, 28, 28), width=3)
    # Stripes
    draw.polygon([(cx - 45, hy - 60), (cx, hy - 220), (cx + 45, hy - 60)], fill=(245, 158, 11))
    draw.polygon([(cx - 25, hy - 130), (cx, hy - 220), (cx + 25, hy - 130)], fill=(34, 197, 94))
    # Pompom
    draw.ellipse([cx - 20, hy - 240, cx + 20, hy - 200], fill=(250, 204, 21), outline=(161, 98, 7), width=2)
    # Ruffle rim
    for rx in range(cx - 70, cx + 70, 20):
        draw.ellipse([rx, hy - 12, rx + 20, hy + 12], fill=(255, 255, 255), outline=(185, 28, 28), width=2)

def draw_15(draw): # LA PERA MICHI
    cx, cy = W // 2, 640
    # Big ripe pear
    px, py = cx - 70, cy + 60
    draw.ellipse([px - 140, py - 60, px + 140, py + 180], fill=(132, 204, 22), outline=(77, 124, 15), width=4)
    draw.ellipse([px - 90, py - 180, px + 90, py], fill=(163, 230, 53), outline=(77, 124, 15), width=3)
    # Stem & leaf
    draw.arc([px - 10, py - 260, px + 50, py - 170], 90, 180, fill=(120, 65, 30), width=8)
    draw.chord([px + 10, py - 240, px + 90, py - 190], 0, 180, fill=(34, 197, 94), outline=(21, 128, 61), width=2)
    # Cute kitten batting at stem
    draw_michi_face(draw, cx + 110, cy - 40, radius=65)
    draw.line([cx + 60, cy - 20, px + 25, py - 200], fill=(235, 130, 45), width=16)
    draw.ellipse([px + 10, py - 215, px + 40, py - 185], fill=(235, 130, 45), outline=(130, 60, 20), width=2)

def draw_16(draw): # LA BANDERA MICHI
    cx, cy = W // 2, 620
    # Flagpole
    fx = cx - 140
    draw.line([fx, 260, fx, 980], fill=(161, 98, 7), width=12)
    draw.ellipse([fx - 18, 240, fx + 18, 276], fill=(234, 179, 8), outline=(161, 98, 7), width=3)
    # Waving Mexican flag (Green, White, Red)
    fw, fh = 300, 200
    draw.polygon([(fx, 280), (fx + 100, 290), (fx + 100, 490), (fx, 480)], fill=(22, 163, 74))
    draw.polygon([(fx + 100, 290), (fx + 200, 285), (fx + 200, 485), (fx + 100, 490)], fill=(255, 255, 255))
    draw.polygon([(fx + 200, 285), (fx + 300, 295), (fx + 300, 495), (fx + 200, 485)], fill=(220, 38, 38))
    # Golden Mexican eagle emblem center
    draw.ellipse([fx + 135, 365, fx + 165, 405], fill=(202, 138, 4))
    # Patriotic cat standing at attention saluting
    draw_michi_body(draw, cx + 80, 740, rx=75, ry=120)
    draw_michi_face(draw, cx + 80, 610, radius=70)
    # Paw to temple in salute
    draw.line([cx + 120, 680, cx + 130, 580], fill=(235, 130, 45), width=18)
    draw.ellipse([cx + 115, 565, cx + 145, 595], fill=(235, 130, 45), outline=(130, 60, 20), width=2)

def draw_17(draw): # EL MICHI BANDOLÓN
    cx, cy = W // 2, 630
    draw_michi_body(draw, cx, cy + 60, rx=90, ry=130)
    draw_michi_face(draw, cx, cy - 90, radius=75)
    # Bandolón / Mandolin body
    gx, gy = cx + 20, cy + 80
    draw.ellipse([gx - 95, gy - 65, gx + 95, gy + 95], fill=(180, 83, 9), outline=(120, 53, 15), width=4)
    draw.ellipse([gx - 30, gy - 10, gx + 30, gy + 40], fill=(30, 20, 15))
    # Neck and headstock
    draw.line([gx - 20, gy - 40, gx - 140, gy - 160], fill=(120, 53, 15), width=20)
    draw.rectangle([gx - 170, gy - 190, gx - 130, gy - 150], fill=(90, 40, 10))
    # Strings
    for sy in [-6, 0, 6]:
        draw.line([gx - 150, gy - 170 + sy, gx + 50, gy + 40 + sy], fill=(254, 240, 138), width=2)
    # Paws plucking strings
    draw.ellipse([gx - 50, gy + 10, gx - 15, gy + 45], fill=(235, 130, 45), outline=(130, 60, 20), width=2)
    draw.ellipse([gx + 10, gy + 20, gx + 45, gy + 55], fill=(235, 130, 45), outline=(130, 60, 20), width=2)

def draw_18(draw): # EL MICHI VIOLONCELLO
    cx, cy = W // 2, 630
    # Dignified cat
    draw_michi_body(draw, cx - 40, cy + 50, rx=85, ry=130)
    draw_michi_face(draw, cx - 40, cy - 100, radius=75)
    # Large Cello
    vx, vy = cx + 50, cy + 60
    draw.ellipse([vx - 90, vy - 120, vx + 90, vy - 10], fill=(146, 64, 14), outline=(90, 35, 10), width=3)
    draw.ellipse([vx - 110, vy - 30, vx + 110, vy + 150], fill=(146, 64, 14), outline=(90, 35, 10), width=4)
    # Neck & scroll
    draw.line([vx, vy - 120, vx, vy - 260], fill=(60, 25, 10), width=18)
    # Endpin
    draw.line([vx, vy + 150, vx, vy + 240], fill=(150, 150, 160), width=6)
    # Bow
    draw.line([vx - 130, vy + 40, vx + 120, vy - 20], fill=(217, 119, 6), width=6)
    # Musical notes
    for nx, ny in [(cx + 170, cy - 140), (cx + 210, cy - 90)]:
        draw.ellipse([nx, ny, nx + 15, ny + 12], fill=(30, 25, 20))
        draw.line([nx + 13, ny + 5, nx + 13, ny - 25], fill=(30, 25, 20), width=3)

def draw_19(draw): # LA GARZA Y EL MICHI
    cx, cy = W // 2, 630
    # Water & reeds
    draw.rectangle([70, 780, W - 70, 980], fill=(147, 197, 253), outline=(96, 165, 250), width=2)
    for rx in [100, 130, 160, W - 140, W - 170]:
        draw.line([rx, 720, rx - 10, 850], fill=(22, 163, 74), width=5)
    # Elegant white heron (La Garza!)
    gx, gy = cx - 70, 620
    draw.line([gx - 15, gy + 120, gx - 15, gy + 220], fill=(202, 138, 4), width=6) # legs
    draw.line([gx + 15, gy + 120, gx + 15, gy + 220], fill=(202, 138, 4), width=6)
    draw.ellipse([gx - 60, gy + 20, gx + 60, gy + 140], fill=(255, 255, 255), outline=(160, 175, 190), width=3) # body
    # S-curved neck
    draw.arc([gx - 30, gy - 90, gx + 30, gy + 40], 90, 270, fill=(255, 255, 255), width=20)
    draw.ellipse([gx - 10, gy - 120, gx + 25, gy - 80], fill=(255, 255, 255), outline=(160, 175, 190), width=2) # head
    draw.polygon([(gx + 20, gy - 105), (gx + 110, gy - 98), (gx + 20, gy - 92)], fill=(245, 158, 11)) # golden beak
    # Michi sitting beside lake shore
    draw_michi_body(draw, cx + 130, 740, rx=70, ry=90)
    draw_michi_face(draw, cx + 130, 640, radius=60)

def draw_20(draw): # EL PÁJARO MICHI
    cx, cy = W // 2, 620
    # Branch
    draw.line([70, 480, W - 70, 560], fill=(120, 65, 30), width=16)
    # Tropical songbird (turquoise and yellow)
    bx, by = cx - 50, 460
    draw.ellipse([bx - 45, by - 35, bx + 45, by + 35], fill=(14, 165, 233), outline=(2, 132, 199), width=3)
    draw.ellipse([bx - 15, by - 10, bx + 35, by + 30], fill=(250, 204, 21))
    draw.polygon([(bx - 30, by + 20), (bx - 90, by + 70), (bx - 40, by + 40)], fill=(14, 165, 233)) # tail
    draw.ellipse([bx + 30, by - 45, bx + 70, by - 10], fill=(14, 165, 233)) # head
    draw.polygon([(bx + 65, by - 32), (bx + 95, by - 26), (bx + 65, by - 20)], fill=(245, 158, 11)) # beak
    # Curious cat gazing up with wonder
    draw_michi_body(draw, cx + 80, 780, rx=85, ry=110)
    draw_michi_face(draw, cx + 80, 670, radius=75)

def draw_21(draw): # LA PATITA MICHI
    cx, cy = W // 2, 600
    # Celestial golden halo rays
    for ang in range(0, 360, 20):
        rad = math.radians(ang)
        x2 = cx + int(240 * math.cos(rad))
        y2 = cy + int(240 * math.sin(rad))
        draw.line([cx, cy, x2, y2], fill=(254, 240, 138), width=3)
    # Folk aura circle
    draw.ellipse([cx - 200, cy - 200, cx + 200, cy + 200], outline=(234, 179, 8), width=4)
    # Giant cat paw reaching forward
    # Arm coming from bottom
    draw.polygon([(cx - 70, 940), (cx + 70, 940), (cx + 60, cy + 70), (cx - 60, cy + 70)], fill=(255, 237, 213), outline=(180, 120, 80), width=4)
    # Main palm pad (soft pink)
    draw.ellipse([cx - 95, cy - 50, cx + 95, cy + 100], fill=(255, 237, 213), outline=(180, 120, 80), width=4)
    draw.ellipse([cx - 60, cy + 5, cx + 60, cy + 85], fill=(244, 114, 182), outline=(190, 24, 93), width=3) # central bean
    # 4 Toe beans!
    toe_pos = [(-75, -55), (-25, -95), (25, -95), (75, -55)]
    for tx, ty in toe_pos:
        draw.ellipse([cx + tx - 28, cy + ty - 32, cx + tx + 28, cy + ty + 32], fill=(255, 237, 213), outline=(180, 120, 80), width=3)
        draw.ellipse([cx + tx - 20, cy + ty - 22, cx + tx + 20, cy + ty + 22], fill=(244, 114, 182), outline=(190, 24, 93), width=2)

def draw_22(draw): # LA BOTA MICHI
    cx, cy = W // 2, 640
    # Tooled leather cowboy boot
    bx, by = cx - 40, cy + 20
    draw.polygon([(bx - 70, by - 120), (bx + 70, by - 120), (bx + 60, by + 160), (bx + 190, by + 210), (bx + 190, by + 250), (bx - 75, by + 250), (bx - 75, by + 160)], fill=(146, 64, 14), outline=(85, 40, 20), width=4)
    # Heel & spur
    draw.rectangle([bx - 75, by + 250, bx - 20, by + 280], fill=(60, 30, 15), outline=(40, 20, 10), width=3)
    draw.ellipse([bx - 110, by + 200, bx - 70, by + 240], fill=(202, 138, 4), outline=(161, 98, 7), width=3)
    # Tiny kitten peeking out from the boot rim
    draw_michi_face(draw, bx, by - 170, radius=65)
    # Paws on the boot rim
    draw.ellipse([bx - 60, by - 130, bx - 20, by - 100], fill=(235, 130, 45), outline=(130, 60, 20), width=2)
    draw.ellipse([bx + 20, by - 130, bx + 60, by - 100], fill=(235, 130, 45), outline=(130, 60, 20), width=2)

def draw_23(draw): # LA LUNA MICHI
    cx, cy = W // 2, 600
    # Indigo night sky circle
    draw.ellipse([cx - 240, cy - 240, cx + 240, cy + 240], fill=(30, 41, 59), outline=(15, 23, 42), width=4)
    # Stars
    for sx, sy in [(cx-160, cy-140), (cx+180, cy-120), (cx-130, cy+150), (cx+150, cy+140), (cx-190, cy), (cx+170, cy+20)]:
        draw.ellipse([sx-4, sy-4, sx+4, sy+4], fill=(254, 240, 138))
    # Crescent moon
    draw.ellipse([cx - 180, cy - 180, cx + 180, cy + 180], fill=(254, 240, 138))
    draw.ellipse([cx - 100, cy - 180, cx + 200, cy + 180], fill=(30, 41, 59))
    # Sleeping white cat curled on the moon curve
    draw.ellipse([cx - 100, cy + 20, cx + 40, cy + 140], fill=(255, 255, 255), outline=(160, 175, 190), width=3)
    draw_michi_face(draw, cx - 70, cy + 40, fur=(255, 255, 255), eye_col=(14, 165, 233), radius=45, outline=(160, 175, 190))

def draw_24(draw): # EL COTORRO MICHI
    cx, cy = W // 2, 620
    # Wooden perch
    draw.line([cx - 200, cy + 80, cx + 200, cy + 80], fill=(146, 64, 14), width=16)
    # Mexican Parrot (Cotorro)
    px, py = cx - 80, cy - 20
    draw.polygon([(px - 30, py + 80), (px - 10, py + 260), (px + 10, py + 80)], fill=(34, 197, 94)) # long tail
    draw.ellipse([px - 50, py - 40, px + 50, py + 100], fill=(34, 197, 94), outline=(21, 128, 61), width=3) # body
    draw.ellipse([px - 40, py - 95, px + 40, py - 30], fill=(239, 68, 68)) # red head
    draw.polygon([(px + 15, py - 70), (px + 70, py - 50), (px + 20, py - 35)], fill=(234, 179, 8)) # hooked beak
    # Michi sitting beside the parrot chatting
    draw_michi_body(draw, cx + 90, cy - 10, rx=75, ry=100)
    draw_michi_face(draw, cx + 80, cy - 110, radius=65)

def draw_25(draw): # EL MICHI BORRACHO
    cx, cy = W // 2, 630
    # Clay cantarito mug tipped
    mx, my = cx + 80, cy + 100
    draw.polygon([(mx - 50, my - 60), (mx + 50, my - 60), (mx + 35, my + 80), (mx - 35, my + 80)], fill=(217, 119, 6), outline=(146, 64, 14), width=3)
    # Lime wedge
    draw.chord([mx - 20, my - 85, mx + 40, my - 35], 0, 180, fill=(132, 204, 22))
    # Tipsy cat leaning clumsily
    draw_michi_body(draw, cx - 60, cy + 60, rx=90, ry=130)
    draw_michi_face(draw, cx - 60, cy - 80, radius=80)
    # Confetti & bubbles
    for cx_c, cy_c, col in [(cx-140, cy-120, (239,68,68)), (cx+120, cy-140, (59,130,246)), (cx, cy-180, (234,179,8))]:
        draw.ellipse([cx_c-8, cy_c-8, cx_c+8, cy_c+8], fill=col)

def draw_26(draw): # EL NEGRITO MICHI
    cx, cy = W // 2, 630
    # Sleek black Bombay cat with red bow tie
    draw_michi_body(draw, cx, cy + 60, fur=(30, 30, 35), belly=(45, 45, 50), rx=90, ry=140, outline=(15, 15, 20))
    # Red silk bowtie
    bx, by = cx, cy - 25
    draw.polygon([(bx, by), (bx - 55, by - 30), (bx - 55, by + 30)], fill=(220, 38, 38), outline=(153, 27, 27), width=2)
    draw.polygon([(bx, by), (bx + 55, by - 30), (bx + 55, by + 30)], fill=(220, 38, 38), outline=(153, 27, 27), width=2)
    draw.ellipse([bx - 14, by - 14, bx + 14, by + 14], fill=(185, 28, 28))
    # Head with radiant golden eyes
    draw_michi_face(draw, cx, cy - 100, fur=(30, 30, 35), eye_col=(234, 179, 8), radius=80, outline=(15, 15, 20))

def draw_27(draw): # EL CORAZÓN MICHI
    cx, cy = W // 2, 620
    # Flaming Sacred Heart
    hx, hy = cx, cy - 20
    # Golden flames
    for fx, fy in [(hx-40, hy-130), (hx, hy-160), (hx+40, hy-130)]:
        draw.polygon([(fx-20, hy-80), (fx, fy), (fx+20, hy-80)], fill=(245, 158, 11), outline=(220, 38, 38))
    # Big glowing red heart
    draw.ellipse([hx - 110, hy - 100, hx, hy + 10], fill=(220, 38, 38), outline=(153, 27, 27), width=4)
    draw.ellipse([hx, hy - 100, hx + 110, hy + 10], fill=(220, 38, 38), outline=(153, 27, 27), width=4)
    draw.polygon([(hx - 108, hy - 40), (hx + 108, hy - 40), (hx, hy + 130)], fill=(220, 38, 38), outline=(153, 27, 27), width=4)
    # Sweet cat hugging the heart from behind
    draw_michi_face(draw, cx, hy - 140, radius=65)
    # Paws wrapping around heart
    draw.ellipse([hx - 120, hy + 10, hx - 70, hy + 55], fill=(235, 130, 45), outline=(130, 60, 20), width=3)
    draw.ellipse([hx + 70, hy + 10, hx + 120, hy + 55], fill=(235, 130, 45), outline=(130, 60, 20), width=3)

def draw_28(draw): # LA SANDÍA MICHI
    cx, cy = W // 2, 650
    # Giant watermelon slice
    wx, wy = cx, cy + 40
    draw.chord([wx - 220, wy - 180, wx + 220, wy + 180], 0, 180, fill=(239, 68, 68), outline=(185, 28, 28), width=4)
    # Green rind
    draw.arc([wx - 220, wy - 180, wx + 220, wy + 180], 0, 180, fill=(34, 197, 94), width=18)
    draw.arc([wx - 220, wy - 180, wx + 220, wy + 180], 0, 180, fill=(240, 253, 244), width=6)
    # Black watermelon seeds
    for sx, sy in [(wx-120, wy+50), (wx-50, wy+90), (wx+40, wy+70), (wx+110, wy+40), (wx, wy+120)]:
        draw.ellipse([sx-5, sy-8, sx+5, sy+8], fill=(25, 20, 18))
    # Kitten peeking over top taking a bite
    draw_michi_face(draw, cx, wy - 130, radius=70)

def draw_29(draw): # EL TAMBOR MICHI
    cx, cy = W // 2, 640
    # Red and gold marching drum
    dx, dy = cx, cy + 80
    draw.ellipse([dx - 140, dy - 50, dx + 140, dy + 50], fill=(254, 243, 199), outline=(180, 83, 9), width=3)
    draw.polygon([(dx - 140, dy), (dx + 140, dy), (dx + 130, dy + 180), (dx - 130, dy + 180)], fill=(220, 38, 38), outline=(153, 27, 27), width=4)
    draw.ellipse([dx - 130, dy + 150, dx + 130, dy + 210], fill=(254, 243, 199), outline=(180, 83, 9), width=3)
    # Gold zigzag ropes
    for zx in range(dx - 120, dx + 120, 48):
        draw.line([zx, dy + 20, zx + 24, dy + 160], fill=(234, 179, 8), width=4)
        draw.line([zx + 24, dy + 160, zx + 48, dy + 20], fill=(234, 179, 8), width=4)
    # Drumsticks
    draw.line([dx - 80, dy - 110, dx - 20, dy - 20], fill=(161, 98, 7), width=6)
    draw.line([dx + 80, dy - 110, dx + 20, dy - 20], fill=(161, 98, 7), width=6)
    # Cat drummer
    draw_michi_face(draw, cx, cy - 100, radius=75)

def draw_30(draw): # EL CAMARÓN MICHI
    cx, cy = W // 2, 630
    # Talavera Mexican plate
    draw.ellipse([cx - 210, cy - 30, cx + 210, cy + 220], fill=(255, 255, 255), outline=(30, 64, 175), width=6)
    draw.ellipse([cx - 180, cy, cx + 180, cy + 190], outline=(59, 130, 246), width=3)
    # Large cooked shrimp (bright pink-orange)
    sx, sy = cx - 20, cy + 90
    draw.arc([sx - 110, sy - 90, sx + 110, sy + 70], 40, 260, fill=(249, 115, 22), width=36)
    draw.polygon([(sx + 50, sy - 80), (sx + 110, sy - 110), (sx + 80, sy - 50)], fill=(239, 68, 68)) # shrimp tail
    # Antennae
    draw.arc([sx - 90, sy + 40, sx - 20, sy + 130], 90, 270, fill=(249, 115, 22), width=4)
    # Curious cat sniffing shrimp with excitement
    draw_michi_face(draw, cx, cy - 130, radius=75)

def draw_31(draw): # LAS JARAS MICHI
    cx, cy = W // 2, 620
    # Three crossed arrows
    for ang in [-30, 0, 30]:
        rad = math.radians(ang + 90)
        x1 = cx - int(240 * math.cos(rad))
        y1 = cy - int(240 * math.sin(rad))
        x2 = cx + int(240 * math.cos(rad))
        y2 = cy + int(240 * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=(161, 98, 7), width=8)
        # Arrowhead
        draw.polygon([(x1, y1), (x1 + 18, y1 + 30), (x1 - 18, y1 + 30)], fill=(156, 163, 175))
    # Michi archer with quiver
    draw_michi_body(draw, cx, cy + 70, rx=85, ry=120)
    draw_michi_face(draw, cx, cy - 90, radius=75)

def draw_32(draw): # EL MÚSICO MICHI
    cx, cy = W // 2, 620
    # Mariachi cat in black charro suit with silver buttons
    draw_michi_body(draw, cx, cy + 60, fur=(30, 30, 35), belly=(40, 40, 45), rx=90, ry=130, outline=(15, 15, 20))
    for sy in range(cy + 30, cy + 160, 25):
        draw.ellipse([cx - 50, sy, cx - 40, sy + 10], fill=(225, 230, 235))
        draw.ellipse([cx + 40, sy, cx + 50, sy + 10], fill=(225, 230, 235))
    # Vihuela guitar
    gx, gy = cx + 20, cy + 70
    draw.ellipse([gx - 80, gy - 50, gx + 80, gy + 80], fill=(217, 119, 6), outline=(146, 64, 14), width=3)
    draw.ellipse([gx - 25, gy - 5, gx + 25, gy + 35], fill=(30, 20, 15))
    # Head with wide Mexican Sombrero!
    hy = cy - 80
    draw_michi_face(draw, cx, hy, radius=70)
    # Sombrero
    draw.ellipse([cx - 190, hy - 140, cx + 190, hy - 70], fill=(25, 25, 30), outline=(218, 165, 32), width=5)
    draw.polygon([(cx - 75, hy - 105), (cx + 75, hy - 105), (cx + 50, hy - 200), (cx - 50, hy - 200)], fill=(25, 25, 30), outline=(218, 165, 32), width=4)

def draw_33(draw): # LA ARAÑA MICHI
    cx, cy = W // 2, 620
    # Spider web in upper corner
    wx, wy = W - 120, 120
    for r in range(40, 260, 45):
        draw.arc([wx - r, wy - r, wx + r, wy + r], 90, 180, fill=(156, 163, 175), width=2)
    # Thread dangling down
    draw.line([cx - 40, 260, cx - 40, 520], fill=(156, 163, 175), width=3)
    # Friendly little spider
    draw.ellipse([cx - 60, 510, cx - 20, 550], fill=(30, 30, 35))
    # Cat reaching up on hind legs with claws
    draw_michi_body(draw, cx + 40, 780, rx=80, ry=130)
    draw_michi_face(draw, cx + 40, 660, radius=70)
    draw.line([cx + 20, 660, cx - 30, 550], fill=(235, 130, 45), width=18)

def draw_34(draw): # EL MICHI SOLDADO
    cx, cy = W // 2, 620
    # Red toy soldier uniform with gold epaulettes
    draw_michi_body(draw, cx, cy + 70, fur=(220, 38, 38), belly=(185, 28, 28), rx=85, ry=130, outline=(153, 27, 27))
    # Gold epaulettes
    draw.rectangle([cx - 95, cy + 20, cx - 55, cy + 45], fill=(234, 179, 8))
    draw.rectangle([cx + 55, cy + 20, cx + 95, cy + 45], fill=(234, 179, 8))
    # Head & Tall Shako hat
    hy = cy - 80
    draw_michi_face(draw, cx, hy, radius=70)
    # Blue Shako military hat
    draw.polygon([(cx - 65, hy - 60), (cx + 65, hy - 60), (cx + 55, hy - 220), (cx - 55, hy - 220)], fill=(30, 58, 138), outline=(218, 165, 32), width=3)
    draw.ellipse([cx - 20, hy - 160, cx + 20, hy - 120], fill=(234, 179, 8)) # gold badge
    # Saber in hand
    draw.line([cx + 80, cy + 60, cx + 130, cy - 80], fill=(209, 213, 219), width=6)

def draw_35(draw): # LA ESTRELLA MICHI
    cx, cy = W // 2, 600
    # Radiant 8-pointed golden star
    sx, sy = cx, cy - 140
    for a in range(0, 360, 45):
        rad = math.radians(a)
        draw.line([sx, sy, sx + int(140 * math.cos(rad)), sy + int(140 * math.sin(rad))], fill=(254, 240, 138), width=6)
    draw.ellipse([sx - 40, sy - 40, sx + 40, sy + 40], fill=(234, 179, 8))
    # Fluffy cloud
    for cdx, cdy, cr in [(-90, 120, 70), (0, 100, 90), (90, 120, 70)]:
        draw.ellipse([cx + cdx - cr, cy + cdy - cr, cx + cdx + cr, cy + cdy + cr], fill=(241, 245, 249), outline=(203, 213, 225), width=3)
    # Dreamy cat on cloud reaching for star
    draw_michi_face(draw, cx, cy + 50, radius=75)

def draw_36(draw): # EL CAZO MICHI
    cx, cy = W // 2, 650
    # Hammered copper cazo
    kx, ky = cx, cy + 90
    draw.ellipse([kx - 180, ky - 60, kx + 180, ky + 60], fill=(217, 119, 6), outline=(146, 64, 14), width=4)
    draw.polygon([(kx - 180, ky), (kx + 180, ky), (kx + 140, ky + 190), (kx - 140, ky + 190)], fill=(194, 65, 12), outline=(124, 45, 18), width=4)
    draw.ellipse([kx - 140, ky + 160, kx + 140, ky + 220], fill=(180, 50, 15))
    # Handles
    draw.arc([kx - 220, ky - 30, kx - 160, ky + 40], 90, 270, fill=(120, 53, 15), width=8)
    draw.arc([kx + 160, ky - 30, kx + 220, ky + 40], 270, 90, fill=(120, 53, 15), width=8)
    # Kitten peeking out of cazo
    draw_michi_face(draw, cx, cy - 20, radius=75)

def draw_37(draw): # EL MICHI MUNDO
    cx, cy = W // 2, 630
    # Planet Earth globe
    gx, gy = cx, cy + 70
    draw.ellipse([gx - 170, gy - 170, gx + 170, gy + 170], fill=(59, 130, 246), outline=(29, 78, 216), width=4)
    # Continents
    draw.ellipse([gx - 120, gy - 100, gx - 20, gy], fill=(34, 197, 94))
    draw.ellipse([gx - 70, gy + 20, gx + 10, gy + 120], fill=(34, 197, 94))
    draw.ellipse([gx + 20, gy - 110, gx + 120, gy + 30], fill=(34, 197, 94))
    # Brass stand
    draw.arc([gx - 190, gy - 190, gx + 190, gy + 190], 30, 150, fill=(234, 179, 8), width=10)
    draw.line([gx, gy + 190, gx, gy + 260], fill=(234, 179, 8), width=14)
    # Proud cat sitting triumphantly on top of globe
    draw_michi_face(draw, cx, cy - 160, radius=75)

def draw_38(draw): # EL APACHE MICHI
    cx, cy = W // 2, 620
    draw_michi_body(draw, cx, cy + 70, rx=90, ry=130)
    # Head with grand eagle feather war bonnet
    hy = cy - 70
    draw_michi_face(draw, cx, hy, radius=75)
    # Feather headdress
    for a in range(120, 240, 14):
        rad = math.radians(a)
        fx1 = cx + int(85 * math.cos(rad))
        fy1 = hy - 40 + int(85 * math.sin(rad))
        fx2 = cx + int(180 * math.cos(rad))
        fy2 = hy - 40 + int(180 * math.sin(rad))
        draw.line([fx1, fy1, fx2, fy2], fill=(255, 255, 255), width=14)
        draw.line([fx2 - int(25*math.cos(rad)), fy2 - int(25*math.sin(rad)), fx2, fy2], fill=(220, 38, 38), width=14)
    # Turquoise headband
    draw.arc([cx - 80, hy - 95, cx + 80, hy - 40], 180, 360, fill=(20, 184, 166), width=12)

def draw_39(draw): # EL NOPAL MICHI
    cx, cy = W // 2, 640
    # Nopal cactus paddles
    draw.ellipse([cx - 60, cy + 60, cx + 60, cy + 220], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    draw.ellipse([cx - 150, cy - 40, cx - 30, cy + 90], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    draw.ellipse([cx + 30, cy - 40, cx + 150, cy + 90], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    draw.ellipse([cx - 50, cy - 130, cx + 50, cy], fill=(34, 197, 94), outline=(21, 128, 61), width=4)
    # Magenta prickly pears (tunas)
    for tx, ty in [(cx-140, cy-50), (cx+140, cy-50), (cx, cy-140)]:
        draw.ellipse([tx - 18, ty - 22, tx + 18, ty + 22], fill=(219, 39, 119))
    # Cat sitting at base in straw sombrero
    draw_michi_face(draw, cx, cy + 120, radius=60)
    # Straw hat
    draw.ellipse([cx - 90, cy + 45, cx + 90, cy + 85], fill=(253, 230, 138), outline=(217, 119, 6), width=3)

def draw_40(draw): # EL ALACRÁN MICHI
    cx, cy = W // 2, 630
    # Desert scorpion
    sx, sy = cx - 40, cy + 100
    draw.ellipse([sx - 50, sy - 25, sx + 50, sy + 25], fill=(217, 119, 6), outline=(146, 64, 14), width=3)
    # Claws
    draw.line([sx - 40, sy - 15, sx - 90, sy - 50], fill=(217, 119, 6), width=10)
    draw.line([sx + 40, sy - 15, sx + 90, sy - 50], fill=(217, 119, 6), width=10)
    # Curved stinging tail
    draw.arc([sx - 20, sy - 130, sx + 120, sy], 120, 340, fill=(180, 83, 9), width=12)
    draw.polygon([(sx + 10, sy - 120), (sx + 35, sy - 145), (sx + 35, sy - 110)], fill=(220, 38, 38))
    # Watchful cat crouched low
    draw_michi_face(draw, cx + 80, cy - 70, radius=70)

def draw_41(draw): # LA ROSA MICHI
    cx, cy = W // 2, 630
    # Romantic cat face
    draw_michi_face(draw, cx, cy - 40, radius=85)
    # Red velvet rose held in teeth
    rx, ry = cx, cy + 30
    # Stem
    draw.line([rx - 160, ry + 40, rx + 160, ry - 30], fill=(34, 197, 94), width=8)
    draw.ellipse([rx - 90, ry + 15, rx - 50, ry + 40], fill=(22, 163, 74)) # leaf
    # Blooming red rose
    draw.ellipse([rx + 80, ry - 75, rx + 175, ry + 15], fill=(220, 38, 38), outline=(153, 27, 27), width=3)
    draw.arc([rx + 105, ry - 60, rx + 150, ry - 15], 0, 360, fill=(185, 28, 28), width=4)

def draw_42(draw): # LA CALAVERA MICHI
    cx, cy = W // 2, 620
    # Sugar skull cat
    draw.ellipse([cx - 100, cy - 100, cx + 100, cy + 100], fill=(255, 255, 255), outline=(30, 30, 35), width=4)
    # Cat skull ears
    draw.polygon([(cx - 85, cy - 60), (cx - 75, cy - 160), (cx - 20, cy - 90)], fill=(255, 255, 255), outline=(30, 30, 35), width=4)
    draw.polygon([(cx + 20, cy - 90), (cx + 75, cy - 160), (cx + 85, cy - 60)], fill=(255, 255, 255), outline=(30, 30, 35), width=4)
    # Ornate Day of the Dead flower eye sockets
    for ex in [cx - 45, cx + 45]:
        draw.ellipse([ex - 30, cy - 40, ex + 30, cy + 20], fill=(30, 30, 35))
        for fa in range(0, 360, 45):
            frad = math.radians(fa)
            draw.ellipse([ex + int(36*math.cos(frad))-6, cy - 10 + int(36*math.sin(frad))-6, ex + int(36*math.cos(frad))+6, cy - 10 + int(36*math.sin(frad))+6], fill=(236, 72, 153))
    # Heart nose
    draw.polygon([(cx - 14, cy + 25), (cx + 14, cy + 25), (cx, cy + 45)], fill=(30, 30, 35))
    # Stitched skull teeth
    draw.line([cx - 50, cy + 65, cx + 50, cy + 65], fill=(30, 30, 35), width=3)
    for tx in range(cx - 40, cx + 45, 16):
        draw.line([tx, cy + 55, tx, cy + 75], fill=(30, 30, 35), width=3)

def draw_43(draw): # LA CAMPANA MICHI
    cx, cy = W // 2, 620
    # Wooden belfry beam
    draw.rectangle([70, 240, W - 70, 290], fill=(120, 65, 30), outline=(60, 30, 15), width=4)
    # Bronze church bell
    bx, by = cx, cy - 40
    draw.polygon([(bx - 50, by - 120), (bx + 50, by - 120), (bx + 160, by + 120), (bx - 160, by + 120)], fill=(217, 119, 6), outline=(146, 64, 14), width=4)
    draw.ellipse([bx - 160, by + 85, bx + 160, by + 155], fill=(234, 179, 8), outline=(146, 64, 14), width=4)
    # Clapper
    draw.ellipse([bx - 20, by + 130, bx + 20, by + 180], fill=(120, 65, 30))
    # Bell rope with swinging playful cat
    draw.line([bx, by + 150, bx + 40, 880], fill=(217, 119, 6), width=6)
    draw_michi_face(draw, bx + 40, 720, radius=65)

def draw_44(draw): # EL CANTARITO MICHI
    cx, cy = W // 2, 640
    # Clay cantarito mug
    mx, my = cx - 30, cy + 40
    draw.polygon([(mx - 110, my - 130), (mx + 110, my - 130), (mx + 85, my + 150), (mx - 85, my + 150)], fill=(194, 65, 12), outline=(124, 45, 18), width=4)
    draw.ellipse([mx - 110, my - 150, mx + 110, my - 110], fill=(249, 115, 22), outline=(124, 45, 18), width=3)
    # Chili-salt rim
    draw.ellipse([mx - 108, my - 150, mx + 108, my - 110], outline=(220, 38, 38), width=6)
    # Grapefruit slice
    draw.chord([mx + 30, my - 210, mx + 130, my - 110], 0, 180, fill=(244, 63, 94), outline=(225, 29, 72), width=3)
    # Cat sipping curious
    draw_michi_face(draw, cx + 110, cy - 100, radius=65)

def draw_45(draw): # EL VENADO MICHI
    cx, cy = W // 2, 630
    # Graceful forest deer leaping
    dx, dy = cx - 50, cy
    draw.ellipse([dx - 110, dy - 60, dx + 110, dy + 60], fill=(180, 83, 9), outline=(120, 53, 15), width=3) # body
    draw.ellipse([dx + 80, dy - 110, dx + 140, dy - 40], fill=(180, 83, 9)) # head
    # Antlers
    draw.line([dx + 110, dy - 100, dx + 150, dy - 200], fill=(120, 53, 15), width=6)
    draw.line([dx + 130, dy - 160, dx + 175, dy - 180], fill=(120, 53, 15), width=5)
    # Running agile cat beside deer
    draw_michi_body(draw, cx + 110, cy + 90, rx=70, ry=80)
    draw_michi_face(draw, cx + 140, cy + 30, radius=55)

def draw_46(draw): # EL SOL MICHI
    cx, cy = W // 2, 620
    # Fiery radiating rays
    for a in range(0, 360, 15):
        rad = math.radians(a)
        x2 = cx + int(240 * math.cos(rad))
        y2 = cy + int(240 * math.sin(rad))
        draw.line([cx, cy, x2, y2], fill=(245, 158, 11), width=6)
    # Sun disk
    draw.ellipse([cx - 160, cy - 160, cx + 160, cy + 160], fill=(250, 204, 21), outline=(217, 119, 6), width=5)
    # Sun face with cat features
    draw_michi_face(draw, cx, cy, fur=(250, 204, 21), eye_col=(217, 119, 6), radius=85, outline=(180, 83, 9))

def draw_47(draw): # LA CORONA MICHI
    cx, cy = W // 2, 640
    # Royal cat
    draw_michi_body(draw, cx, cy + 70, fur=(255, 237, 213), rx=90, ry=140)
    # Velvet ermine collar
    draw.arc([cx - 100, cy - 10, cx + 100, cy + 70], 0, 180, fill=(220, 38, 38), width=24)
    # Royal Cat Head
    hy = cy - 70
    draw_michi_face(draw, cx, hy, radius=75)
    # Golden Crown studded with rubies and sapphires
    cy_hat = hy - 130
    draw.polygon([(cx - 95, cy_hat + 35), (cx + 95, cy_hat + 35), (cx + 85, cy_hat - 70), (cx + 40, cy_hat - 30), (cx, cy_hat - 85), (cx - 40, cy_hat - 30), (cx - 85, cy_hat - 70)], fill=(234, 179, 8), outline=(161, 98, 7), width=4)
    for gx in [-70, -35, 0, 35, 70]:
        draw.ellipse([cx + gx - 6, cy_hat + 15, cx + gx + 6, cy_hat + 27], fill=(220, 38, 38))

def draw_48(draw): # LA CHALUPA MICHI
    cx, cy = W // 2, 630
    # Water
    draw.rectangle([70, 750, W - 70, 980], fill=(56, 189, 248), outline=(14, 116, 144), width=3)
    # Wooden Canoe / Chalupa
    draw.polygon([(cx - 240, 780), (cx + 240, 780), (cx + 170, 880), (cx - 170, 880)], fill=(146, 64, 14), outline=(85, 40, 20), width=4)
    # Flowers in chalupa
    f_cols = [(244, 63, 94), (250, 204, 21), (168, 85, 247), (255, 255, 255)]
    for i in range(12):
        fx = cx - 140 + i * 25
        draw.ellipse([fx - 14, 760, fx + 14, 790], fill=f_cols[i % len(f_cols)])
    # Cat paddling
    draw_michi_face(draw, cx - 20, 640, radius=65)
    # Sombrero
    draw.ellipse([cx - 110, 560, cx + 70, 600], fill=(253, 230, 138), outline=(217, 119, 6), width=3)
    # Paddle
    draw.line([cx + 50, 650, cx + 110, 890], fill=(120, 65, 30), width=8)

def draw_49(draw): # EL PINO MICHI
    cx, cy = W // 2, 620
    # Mountain pine tree
    px, py = cx, cy - 30
    draw.rectangle([px - 25, py + 120, px + 25, py + 260], fill=(120, 65, 30), outline=(60, 30, 15), width=4)
    # 3 green tiered pine triangles
    draw.polygon([(px - 90, py - 90), (px + 90, py - 90), (px, py - 240)], fill=(22, 101, 52), outline=(20, 83, 45), width=3)
    draw.polygon([(px - 140, py + 30), (px + 140, py + 30), (px, py - 120)], fill=(22, 101, 52), outline=(20, 83, 45), width=3)
    draw.polygon([(px - 190, py + 160), (px + 190, py + 160), (px, py)], fill=(22, 101, 52), outline=(20, 83, 45), width=3)
    # Cat playing with pinecone at base
    draw_michi_face(draw, cx + 110, cy + 190, radius=60)
    draw.ellipse([cx + 30, cy + 220, cx + 60, cy + 260], fill=(120, 65, 30))

def draw_50(draw): # EL PESCADO MICHI
    cx, cy = W // 2, 630
    # Water ripples
    draw.rectangle([70, 780, W - 70, 980], fill=(96, 165, 250), outline=(37, 99, 235), width=3)
    # Leaping golden fish
    fx, fy = cx - 50, cy + 40
    draw.ellipse([fx - 80, fy - 45, fx + 80, fy + 45], fill=(245, 158, 11), outline=(180, 83, 9), width=3)
    draw.polygon([(fx - 70, fy), (fx - 130, fy - 40), (fx - 130, fy + 40)], fill=(245, 158, 11), outline=(180, 83, 9), width=2)
    # Water splashes
    for sp in [-40, 0, 40]:
        draw.arc([fx + sp - 20, fy + 50, fx + sp + 20, fy + 90], 180, 360, fill=(255, 255, 255), width=3)
    # Michi with paws outstretched
    draw_michi_face(draw, cx + 100, cy - 60, radius=70)

def draw_51(draw): # LA PALMA MICHI
    cx, cy = W // 2, 620
    # Tropical curved palm trunk
    draw.arc([cx - 240, 240, cx + 120, 1050], 180, 270, fill=(161, 98, 7), width=26)
    # Palm fronds
    tx, ty = cx - 60, 420
    for a in range(-60, 180, 40):
        rad = math.radians(a)
        draw.line([tx, ty, tx + int(180 * math.cos(rad)), ty - int(120 * math.sin(rad))], fill=(22, 163, 74), width=10)
    # Coconuts
    for cdx, cdy in [(-20, 20), (10, 25), (-5, 45)]:
        draw.ellipse([tx + cdx, ty + cdy, tx + cdx + 25, ty + cdy + 25], fill=(120, 65, 30))
    # Hammock strung below with relaxed cat
    draw.arc([cx - 180, 640, cx + 180, 840], 0, 180, fill=(245, 158, 11), width=10)
    draw_michi_face(draw, cx, 710, radius=60)

def draw_52(draw): # LA MACETA MICHI
    cx, cy = W // 2, 640
    # Hand-painted terracotta flowerpot
    px, py = cx, cy + 90
    draw.polygon([(px - 140, py - 80), (px + 140, py - 80), (px + 105, py + 140), (px - 105, py + 140)], fill=(217, 119, 6), outline=(146, 64, 14), width=4)
    draw.rectangle([px - 150, py - 110, px + 150, py - 80], fill=(234, 88, 12), outline=(146, 64, 14), width=3)
    # Blooming geraniums
    for gx in [-80, -30, 20, 70]:
        draw.ellipse([px + gx - 20, py - 150, px + gx + 20, py - 110], fill=(239, 68, 68))
    # Kitten curled up inside base
    draw_michi_face(draw, cx, cy - 20, radius=65)

def draw_53(draw): # EL ARPA MICHI
    cx, cy = W // 2, 630
    # Veracruz wooden harp
    hx, hy = cx + 20, cy + 40
    draw.line([hx - 90, hy - 220, hx - 90, hy + 180], fill=(146, 64, 14), width=16) # pillar
    draw.line([hx - 90, hy + 180, hx + 110, hy + 180], fill=(146, 64, 14), width=16) # base
    draw.arc([hx - 90, hy - 240, hx + 130, hy - 40], 180, 360, fill=(180, 83, 9), width=16) # harmonic curve
    # Strings
    for sx in range(hx - 70, hx + 90, 20):
        draw.line([sx, hy - 140 + (sx - hx)//2, sx, hy + 180], fill=(234, 179, 8), width=2)
    # Cat musician plucking harp
    draw_michi_face(draw, cx - 80, cy - 30, radius=65)
    draw.ellipse([hx - 40, cy + 20, hx - 10, cy + 50], fill=(235, 130, 45), outline=(130, 60, 20), width=2)

def draw_54(draw): # LA RANA MICHI
    cx, cy = W // 2, 640
    # Pond water
    draw.rectangle([70, 760, W - 70, 980], fill=(125, 211, 252), outline=(14, 116, 144), width=3)
    # Water lily pad
    lx, ly = cx - 60, cy + 120
    draw.ellipse([lx - 120, ly - 40, lx + 120, ly + 40], fill=(34, 197, 94), outline=(21, 128, 61), width=3)
    # Cheerful tree frog
    fx, fy = lx, ly - 30
    draw.ellipse([fx - 45, fy - 30, fx + 45, fy + 30], fill=(74, 222, 128), outline=(22, 101, 52), width=3)
    draw.ellipse([fx - 30, fy - 40, fx - 10, fy - 15], fill=(250, 204, 21), outline=(22, 101, 52), width=2)
    draw.ellipse([fx + 10, fy - 40, fx + 30, fy - 15], fill=(250, 204, 21), outline=(22, 101, 52), width=2)
    # Curious cat leaning in nose-to-nose
    draw_michi_face(draw, cx + 80, cy + 40, radius=65)

CARDS_MAP = {
    1: ("EL MICHI GALLO", draw_01),
    5: ("EL PARAGUAS MICHI", draw_05),
    6: ("LA MICHI SIRENA", draw_06),
    7: ("LA ESCALERA MICHI", draw_07),
    8: ("LA BOTELLA MICHI", draw_08),
    9: ("EL BARRIL MICHI", draw_09),
    10: ("EL ÁRBOL MICHI", draw_10),
    11: ("EL MELÓN MICHI", draw_11),
    12: ("EL MICHI VALIENTE", draw_12),
    13: ("EL GORRITO MICHI", draw_13),
    15: ("LA PERA MICHI", draw_15),
    16: ("LA BANDERA MICHI", draw_16),
    17: ("EL MICHI BANDOLÓN", draw_17),
    18: ("EL MICHI VIOLONCELLO", draw_18),
    19: ("LA GARZA Y EL MICHI", draw_19),
    20: ("EL PÁJARO MICHI", draw_20),
    21: ("LA PATITA MICHI", draw_21),
    22: ("LA BOTA MICHI", draw_22),
    23: ("LA LUNA MICHI", draw_23),
    24: ("EL COTORRO MICHI", draw_24),
    25: ("EL MICHI BORRACHO", draw_25),
    26: ("EL NEGRITO MICHI", draw_26),
    27: ("EL CORAZÓN MICHI", draw_27),
    28: ("LA SANDÍA MICHI", draw_28),
    29: ("EL TAMBOR MICHI", draw_29),
    30: ("EL CAMARÓN MICHI", draw_30),
    31: ("LAS JARAS MICHI", draw_31),
    32: ("EL MÚSICO MICHI", draw_32),
    33: ("LA ARAÑA MICHI", draw_33),
    34: ("EL MICHI SOLDADO", draw_34),
    35: ("LA ESTRELLA MICHI", draw_35),
    36: ("EL CAZO MICHI", draw_36),
    37: ("EL MICHI MUNDO", draw_37),
    38: ("EL APACHE MICHI", draw_38),
    39: ("EL NOPAL MICHI", draw_39),
    40: ("EL ALACRÁN MICHI", draw_40),
    41: ("LA ROSA MICHI", draw_41),
    42: ("LA CALAVERA MICHI", draw_42),
    43: ("LA CAMPANA MICHI", draw_43),
    44: ("EL CANTARITO MICHI", draw_44),
    45: ("EL VENADO MICHI", draw_45),
    46: ("EL SOL MICHI", draw_46),
    47: ("LA CORONA MICHI", draw_47),
    48: ("LA CHALUPA MICHI", draw_48),
    49: ("EL PINO MICHI", draw_49),
    50: ("EL PESCADO MICHI", draw_50),
    51: ("LA PALMA MICHI", draw_51),
    52: ("LA MACETA MICHI", draw_52),
    53: ("EL ARPA MICHI", draw_53),
    54: ("LA RANA MICHI", draw_54),
}

if __name__ == "__main__":
    print(f"Starting generation of Michi cards into {OUT_DIR}...")
    for n, (title, draw_fn) in CARDS_MAP.items():
        draw_card(n, title, draw_fn)
    print("All Michi cards processing complete!")
