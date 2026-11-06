#!/usr/bin/env python3
"""
Test script to generate cards 14 (La Muerte) and 19 (La Garza)
replicating the authentic 02.jpg woodcut engraving style.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CARD_W = 848
CARD_H = 1264

def get_font(name, size):
    paths = [
        f"/System/Library/Fonts/Supplemental/{name}.ttf",
        f"/Library/Fonts/{name}.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        "/System/Library/Fonts/Times.ttc",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

def prepare_template_base(is_michi=True):
    master_path = "public/cards/michis/02.jpg" if is_michi else "public/cards/lomitos/02.jpg"
    base = Image.open(master_path).convert("RGB")
    
    # We create a clean working copy
    card = base.copy()
    draw = ImageDraw.Draw(card)
    
    # Sample parchment color from master
    parchment = (252, 243, 224) if is_michi else (247, 237, 218)
    
    # Clear the central artwork area while preserving the master border and corner rosettes
    if is_michi:
        # Central clearing box
        draw.rectangle([95, 120, 755, 980], fill=parchment)
        # Clear the number inside the rosette at top-left
        # Rosette center is around (195, 160)
        draw.ellipse([150, 115, 240, 205], fill=(50, 18, 22))
        # Clear banner text at bottom
        draw.rectangle([130, 1020, 720, 1120], fill=parchment)
    else:
        # Lomito master
        draw.rectangle([105, 120, 745, 960], fill=parchment)
        # Number box at top-left: around (100, 75, 230, 175)
        draw.rectangle([115, 80, 220, 170], fill=(195, 55, 30))
        # Clear banner text at bottom
        draw.rectangle([170, 1010, 680, 1100], fill=(245, 230, 200))
        
    return card

def draw_card_number_on_template(card, n, is_michi=True):
    draw = ImageDraw.Draw(card)
    text = str(n)
    
    if is_michi:
        font = get_font("Georgia Bold", 76 if len(text) == 1 else 62)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        cx, cy = 195, 160
        tx = cx - tw // 2
        ty = cy - th // 2 - 4
        # Draw white text with subtle shadow
        draw.text((tx + 2, ty + 2), text, font=font, fill=(20, 10, 10))
        draw.text((tx, ty), text, font=font, fill=(255, 250, 240))
    else:
        font = get_font("Times New Roman Bold", 80 if len(text) == 1 else 64)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        cx, cy = 168, 125
        tx = cx - tw // 2
        ty = cy - th // 2 - 4
        # Golden shadow
        draw.text((tx + 3, ty + 3), text, font=font, fill=(40, 15, 10))
        draw.text((tx, ty), text, font=font, fill=(255, 245, 220))

def draw_card_title_on_template(card, title, is_michi=True):
    draw = ImageDraw.Draw(card)
    full_title = f"EL MICHI {title}" if is_michi and not title.startswith("LA ") else (
        f"LA MICHI {title[3:]}" if is_michi and title.startswith("LA ") else (
            f"EL LOMITO {title}" if not is_michi and not title.startswith("LA ") else f"LA LOMITO {title[3:]}"
        )
    )
    # Special exact names
    if title == "LA GARZA":
        full_title = "LA GARZA Y EL MICHI" if is_michi else "LA GARZA Y EL LOMITO"
    elif title == "EL DIABLITO":
        full_title = "EL MICHI DIABLO" if is_michi else "EL LOMITO DIABLO"

    font_size = 54 if len(full_title) <= 15 else (44 if len(full_title) <= 20 else 38)
    font = get_font("Georgia Bold", font_size)
    
    bbox = draw.textbbox((0, 0), full_title, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    if is_michi:
        cx, cy = 424, 1065
        tx = cx - tw // 2
        ty = cy - th // 2
        # Dark woodcut brown text
        draw.text((tx + 2, ty + 2), full_title, font=font, fill=(180, 140, 100))
        draw.text((tx, ty), full_title, font=font, fill=(45, 20, 25))
    else:
        cx, cy = 424, 1050
        tx = cx - tw // 2
        ty = cy - th // 2
        # Crimson red text with black drop shadow
        draw.text((tx + 2, ty + 2), full_title, font=font, fill=(35, 15, 10))
        draw.text((tx, ty), full_title, font=font, fill=(195, 35, 25))

def test_generate_la_muerte(is_michi=True):
    card = prepare_template_base(is_michi)
    draw_card_number_on_template(card, 14, is_michi)
    draw_card_title_on_template(card, "LA MUERTE", is_michi)
    draw = ImageDraw.Draw(card)
    
    cx, cy = 424, 550
    
    # Background soft aura / halo
    draw.ellipse([cx - 240, cy - 300, cx + 240, cy + 240], fill=(255, 235, 220) if is_michi else (255, 230, 200))
    
    # Ground shadow with woodcut lines
    draw.ellipse([cx - 200, cy + 320, cx + 200, cy + 370], fill=(225, 205, 180))
    for i in range(-150, 150, 12):
        draw.line([cx + i, cy + 340, cx + i + 25, cy + 355], fill=(160, 130, 100), width=2)
        
    # The Scythe (La Guadaña)
    # Long wooden staff
    staff_pts = [(cx + 170, cy - 340), (cx + 185, cy - 340), (cx + 120, cy + 350), (cx + 105, cy + 350)]
    draw.polygon(staff_pts, fill=(110, 55, 25), outline=(40, 20, 10), width=2)
    # Scythe curved steel blade
    blade_pts = [
        (cx + 175, cy - 335), (cx + 80, cy - 400), (cx - 120, cy - 420), (cx - 230, cy - 390),
        (cx - 260, cy - 360), (cx - 180, cy - 350), (cx - 40, cy - 340), (cx + 170, cy - 330)
    ]
    draw.polygon(blade_pts, fill=(185, 215, 235), outline=(30, 50, 70), width=3)
    # Steel blade shine highlight
    draw.line([cx - 210, cy - 375, cx + 130, cy - 335], fill=(255, 255, 255), width=3)
    
    if is_michi:
        # Ginger Catrina Michi with skeleton paint and marigolds!
        fur = (225, 115, 35)
        shadow_fur = (155, 60, 20)
        
        # Black Catrina Cloak with red lining
        cloak_pts = [(cx - 150, cy + 60), (cx + 150, cy + 60), (cx + 180, cy + 330), (cx - 180, cy + 330)]
        draw.polygon(cloak_pts, fill=(35, 25, 30), outline=(20, 15, 15), width=3)
        # Red inner lining
        draw.polygon([(cx - 90, cy + 80), (cx + 90, cy + 80), (cx + 120, cy + 320), (cx - 120, cy + 320)], fill=(180, 35, 45))
        
        # Michi Body standing on hind legs
        draw.ellipse([cx - 95, cy + 20, cx + 95, cy + 260], fill=fur, outline=(50, 20, 10), width=3)
        
        # Skeletal Ribs painted on Michi chest!
        draw.ellipse([cx - 65, cy + 60, cx + 65, cy + 230], fill=(250, 245, 235), outline=(50, 20, 10), width=2)
        # Rib cage lines
        for r_y in [cy + 90, cy + 120, cy + 150, cy + 180]:
            draw.arc([cx - 50, r_y - 12, cx + 50, r_y + 12], 20, 160, fill=(40, 20, 15), width=4)
        draw.line([cx, cy + 80, cx, cy + 200], fill=(40, 20, 15), width=4) # Sternum
        
        # Legs with bone feet
        draw.ellipse([cx - 85, cy + 230, cx - 35, cy + 340], fill=fur, outline=(50, 20, 10), width=3)
        draw.ellipse([cx + 35, cy + 230, cx + 85, cy + 340], fill=fur, outline=(50, 20, 10), width=3)
        # Skeletal paws/toes
        draw.ellipse([cx - 95, cy + 325, cx - 30, cy + 355], fill=(245, 240, 230), outline=(40, 20, 10), width=2)
        draw.ellipse([cx + 30, cy + 325, cx + 95, cy + 355], fill=(245, 240, 230), outline=(40, 20, 10), width=2)
        
        # Skeletal Tail with woodcut tuft
        draw.arc([cx - 240, cy + 80, cx - 60, cy + 280], 90, 270, fill=fur, width=22)
        draw.arc([cx - 240, cy + 80, cx - 60, cy + 280], 90, 270, fill=(50, 20, 10), width=3)
        
        # Paw holding the scythe staff
        draw.ellipse([cx + 90, cy + 65, cx + 140, cy + 115], fill=(245, 240, 230), outline=(40, 20, 10), width=3)
        # Left paw raised
        draw.ellipse([cx - 130, cy + 85, cx - 80, cy + 135], fill=(245, 240, 230), outline=(40, 20, 10), width=3)
        
        # Michi Head
        hy = cy - 100
        draw.ellipse([cx - 105, hy - 95, cx + 105, hy + 95], fill=fur, outline=(50, 20, 10), width=3)
        # Ears
        ear_l = [(cx - 95, hy - 40), (cx - 85, hy - 170), (cx - 25, hy - 80)]
        ear_r = [(cx + 25, hy - 80), (cx + 85, hy - 170), (cx + 95, hy - 40)]
        draw.polygon(ear_l, fill=fur, outline=(50, 20, 10))
        draw.polygon(ear_r, fill=fur, outline=(50, 20, 10))
        draw.polygon([(cx - 85, hy - 45), (cx - 78, hy - 150), (cx - 35, hy - 75)], fill=(245, 175, 165))
        draw.polygon([(cx + 35, hy - 75), (cx + 78, hy - 150), (cx + 85, hy - 45)], fill=(245, 175, 165))
        
        # Dia de los Muertos Catrina Face Paint!
        # White skull mask
        draw.ellipse([cx - 75, hy - 65, cx + 75, hy + 75], fill=(252, 250, 245), outline=(50, 20, 10), width=2)
        # Dark skull eye sockets with floral petals
        for eye_x in [cx - 38, cx + 38]:
            # Petals around eye
            for a in range(0, 360, 45):
                rad = math.radians(a)
                px = eye_x + int(math.cos(rad) * 32)
                py = hy - 10 + int(math.sin(rad) * 32)
                draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(245, 158, 11))
            # Black eye socket
            draw.ellipse([eye_x - 22, hy - 32, eye_x + 22, hy + 12], fill=(25, 20, 25))
            # Glowing cat iris
            draw.ellipse([eye_x - 10, hy - 20, eye_x + 10, hy], fill=(16, 185, 129))
            draw.ellipse([eye_x - 3, hy - 18, eye_x + 3, hy - 2], fill=(10, 10, 10))
            draw.ellipse([eye_x - 6, hy - 16, eye_x - 1, hy - 8], fill=(255, 255, 255))
            
        # Inverted heart skull nose
        draw.polygon([(cx - 12, hy + 26), (cx + 12, hy + 26), (cx, hy + 12)], fill=(20, 15, 15))
        
        # Calavera stitched mouth
        draw.line([cx - 45, hy + 45, cx + 45, hy + 45], fill=(25, 20, 20), width=3)
        for mx in range(cx - 36, cx + 45, 12):
            draw.line([mx, hy + 35, mx, hy + 55], fill=(25, 20, 20), width=3)
            
        # Whiskers
        for dy in [-6, 6]:
            draw.line([cx - 30, hy + 30 + dy, cx - 110, hy + 25 + dy * 2], fill=(40, 20, 15), width=2)
            draw.line([cx + 30, hy + 30 + dy, cx + 110, hy + 25 + dy * 2], fill=(40, 20, 15), width=2)
            
        # Crown of Marigold Flowers (Cempasúchil)
        flower_x = [cx - 80, cx - 40, cx, cx + 40, cx + 80]
        for fx in flower_x:
            draw.ellipse([fx - 22, hy - 110, fx + 22, hy - 66], fill=(245, 135, 10), outline=(160, 70, 10), width=2)
            draw.ellipse([fx - 12, hy - 100, fx + 12, hy - 76], fill=(255, 215, 0))
            
    else:
        # Lomito La Muerte (Perrito Xoloitzcuintle / Frenchie de los Muertos)
        fur = (55, 45, 45) # Dark xolo tone
        cloak_pts = [(cx - 160, cy + 60), (cx + 160, cy + 60), (cx + 190, cy + 330), (cx - 190, cy + 330)]
        draw.polygon(cloak_pts, fill=(215, 115, 25), outline=(130, 60, 10), width=3) # Amber/Gold Mexican poncho
        
        # Dog body
        draw.ellipse([cx - 105, cy + 10, cx + 105, cy + 260], fill=fur, outline=(30, 20, 20), width=3)
        # Ribs painted on chest
        draw.ellipse([cx - 70, cy + 50, cx + 70, cy + 220], fill=(245, 240, 230), outline=(30, 20, 20), width=2)
        for r_y in [cy + 85, cy + 115, cy + 145, cy + 175]:
            draw.arc([cx - 55, r_y - 12, cx + 55, r_y + 12], 20, 160, fill=(30, 20, 20), width=4)
        draw.line([cx, cy + 70, cx, cy + 195], fill=(30, 20, 20), width=4)
        
        # Paws on scythe
        draw.ellipse([cx + 95, cy + 65, cx + 150, cy + 120], fill=(245, 240, 230), outline=(30, 20, 20), width=3)
        
        # Legs
        draw.ellipse([cx - 95, cy + 230, cx - 40, cy + 340], fill=fur, outline=(30, 20, 20), width=3)
        draw.ellipse([cx + 40, cy + 230, cx + 95, cy + 340], fill=fur, outline=(30, 20, 20), width=3)
        draw.ellipse([cx - 105, cy + 325, cx - 35, cy + 355], fill=(245, 240, 230), outline=(30, 20, 20), width=2)
        draw.ellipse([cx + 35, cy + 325, cx + 105, cy + 355], fill=(245, 240, 230), outline=(30, 20, 20), width=2)
        
        # Head
        hy = cy - 100
        draw.ellipse([cx - 110, hy - 95, cx + 110, hy + 95], fill=fur, outline=(30, 20, 20), width=3)
        # Bat / Frenchie / Xolo ears standing tall
        ear_l = [(cx - 100, hy - 40), (cx - 90, hy - 180), (cx - 20, hy - 80)]
        ear_r = [(cx + 20, hy - 80), (cx + 90, hy - 180), (cx + 100, hy - 40)]
        draw.polygon(ear_l, fill=fur, outline=(30, 20, 20))
        draw.polygon(ear_r, fill=fur, outline=(30, 20, 20))
        draw.polygon([(cx - 90, hy - 45), (cx - 82, hy - 160), (cx - 30, hy - 75)], fill=(180, 80, 90))
        draw.polygon([(cx + 30, hy - 75), (cx + 82, hy - 160), (cx + 90, hy - 45)], fill=(180, 80, 90))
        
        # Skull face paint
        draw.ellipse([cx - 85, hy - 65, cx + 85, hy + 75], fill=(250, 245, 235), outline=(30, 20, 20), width=2)
        # Eyes
        for eye_x in [cx - 42, cx + 42]:
            for a in range(0, 360, 45):
                rad = math.radians(a)
                px = eye_x + int(math.cos(rad) * 34)
                py = hy - 12 + int(math.sin(rad) * 34)
                draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(217, 119, 6))
            draw.ellipse([eye_x - 24, hy - 34, eye_x + 24, hy + 10], fill=(25, 20, 25))
            draw.ellipse([eye_x - 12, hy - 22, eye_x + 12, hy - 2], fill=(255, 200, 40))
            draw.ellipse([eye_x - 4, hy - 20, eye_x + 4, hy - 4], fill=(15, 10, 10))
            draw.ellipse([eye_x - 7, hy - 18, eye_x - 2, hy - 10], fill=(255, 255, 255))
            
        # Inverted heart nose
        draw.polygon([(cx - 16, hy + 24), (cx + 16, hy + 24), (cx, hy + 6)], fill=(20, 15, 15))
        # Happy smile with stitches and tongue!
        draw.line([cx - 50, hy + 45, cx + 50, hy + 45], fill=(25, 20, 20), width=3)
        for mx in range(cx - 42, cx + 50, 12):
            draw.line([mx, hy + 35, mx, hy + 55], fill=(25, 20, 20), width=3)
        draw.ellipse([cx - 16, hy + 42, cx + 16, hy + 78], fill=(245, 110, 130), outline=(160, 40, 60), width=2)
        
        # Marigolds
        for fx in [cx - 70, cx, cx + 70]:
            draw.ellipse([fx - 24, hy - 105, fx + 24, hy - 60], fill=(235, 120, 15), outline=(150, 60, 10), width=2)
            draw.ellipse([fx - 12, hy - 95, fx + 12, hy - 70], fill=(255, 215, 0))

    out_path = f"public/cards/{'michis' if is_michi else 'lomitos'}/14.jpg"
    card.save(out_path, "JPEG", quality=95)
    print("Generated:", out_path)
    return out_path

if __name__ == "__main__":
    test_generate_la_muerte(True)
    test_generate_la_muerte(False)
