import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CARD_W = 850
CARD_H = 1275

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
    # Cream parchment background fill
    draw.rectangle([0, 0, w, h], fill=(247, 240, 222))
    
    # Outer decorative border
    m1 = 28
    draw.rectangle([m1, m1, w - m1, h - m1], outline=border_color, width=12)
    
    m2 = 46
    draw.rectangle([m2, m2, w - m2, h - m2], outline=accent_color, width=3)
    
    # Corner flourishes
    c_rad = 30
    for cx, cy in [(m1 + 8, m1 + 8), (w - m1 - 8, m1 + 8), (m1 + 8, h - m1 - 8), (w - m1 - 8, h - m1 - 8)]:
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=border_color)

def draw_card_number(draw, n, x=65, y=65, color=(140, 30, 25)):
    font = get_font(72)
    # Background circle rosette
    draw.ellipse([x - 10, y - 5, x + 75, y + 80], fill=(240, 225, 195), outline=color, width=3)
    text = str(n)
    draw.text((x + 8, y + 2), text, font=font, fill=color)

def draw_card_title(draw, title, w, y, color=(25, 20, 18)):
    font = get_font(52)
    bbox = draw.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    tx = (w - tw) // 2
    
    # Decorative banner underline ribbon
    draw.line([tx - 40, y + 65, tx + tw + 40, y + 65], fill=(180, 50, 40), width=4)
    draw.polygon([(tx - 40, y + 65), (tx - 55, y + 55), (tx - 55, y + 75)], fill=(180, 50, 40))
    draw.polygon([(tx + tw + 40, y + 65), (tx + tw + 55, y + 55), (tx + tw + 55, y + 75)], fill=(180, 50, 40))
    
    # Draw text
    draw.text((tx, y), title, font=font, fill=color)

def create_michi_chalupa():
    # 48 La Chalupa with cute Michi
    img = Image.new("RGB", (CARD_W, CARD_H), (247, 240, 222))
    draw = ImageDraw.Draw(img)
    
    # Vintage border in Mexican deep red and teal
    draw_vintage_card_frame(draw, CARD_W, CARD_H, (168, 38, 38), (18, 115, 128))
    draw_card_number(draw, 48, 65, 65, (168, 38, 38))
    
    # River / Lake Xochimilco water background
    water_y = 700
    for y in range(water_y, 1050, 2):
        prog = (y - water_y) / 350.0
        r = int(50 + prog * 20)
        g = int(140 + prog * 40)
        b = int(170 + prog * 40)
        draw.line([70, y, CARD_W - 70, y], fill=(r, g, b))
    
    # Sky / bank with greenery
    draw.rectangle([70, 420, CARD_W - 70, water_y], fill=(232, 240, 225))
    # Green riverbanks
    draw.ellipse([30, 620, CARD_W + 40, 780], fill=(45, 125, 65))
    
    # The Wooden Chalupa (Canoe)
    canoe_pts = [
        (130, 840), (220, 940), (CARD_W - 220, 940), (CARD_W - 130, 840),
        (CARD_W - 200, 880), (200, 880)
    ]
    draw.polygon(canoe_pts, fill=(138, 75, 42), outline=(85, 40, 20))
    
    # Wood grain lines
    draw.line([160, 860, CARD_W - 160, 860], fill=(95, 48, 25), width=4)
    draw.line([210, 900, CARD_W - 210, 900], fill=(95, 48, 25), width=3)
    
    # Colorful Mexican Flowers in the Chalupa (Marigolds, Dahlias, Roses)
    flower_colors = [(245, 158, 11), (236, 72, 153), (239, 68, 68), (168, 85, 247), (255, 255, 255)]
    for i in range(16):
        fx = 220 + (i % 8) * 55 + (i // 8) * 20
        fy = 830 - (i // 8) * 35 + (i % 3) * 10
        fc = flower_colors[i % len(flower_colors)]
        draw.ellipse([fx - 18, fy - 18, fx + 18, fy + 18], fill=fc, outline=(50, 20, 10), width=2)
        draw.ellipse([fx - 7, fy - 7, fx + 7, fy + 7], fill=(255, 215, 0))

    # Center character: Adorable Ginger Michi wearing a Mexican Sombrero
    # Michi body
    cx, cy = CARD_W // 2, 670
    draw.ellipse([cx - 95, cy - 80, cx + 95, cy + 130], fill=(235, 125, 40), outline=(130, 60, 15), width=3) # Orange cat body
    draw.ellipse([cx - 65, cy - 30, cx + 65, cy + 115], fill=(252, 230, 200)) # Cream belly
    
    # Cat head
    hy = cy - 130
    draw.ellipse([cx - 90, hy - 75, cx + 90, hy + 75], fill=(235, 125, 40), outline=(130, 60, 15), width=3)
    
    # Pointy Cat Ears
    ear_l = [(cx - 80, hy - 40), (cx - 70, hy - 140), (cx - 20, hy - 70)]
    ear_r = [(cx + 20, hy - 70), (cx + 70, hy - 140), (cx + 80, hy - 40)]
    draw.polygon(ear_l, fill=(235, 125, 40), outline=(130, 60, 15))
    draw.polygon([(cx - 70, hy - 45), (cx - 65, hy - 120), (cx - 30, hy - 65)], fill=(245, 175, 165))
    draw.polygon(ear_r, fill=(235, 125, 40), outline=(130, 60, 15))
    draw.polygon([(cx + 30, hy - 65), (cx + 65, hy - 120), (cx + 70, hy - 45)], fill=(245, 175, 165))
    
    # Sombrero de paja mexicano on top of the cat
    sy = hy - 95
    draw.ellipse([cx - 150, sy - 20, cx + 150, sy + 30], fill=(238, 205, 130), outline=(130, 95, 40), width=4) # brim
    draw.rectangle([cx - 55, sy - 70, cx + 55, sy], fill=(230, 195, 115), outline=(130, 95, 40), width=3) # crown
    # Sombrero colorful sarape ribbon
    draw.rectangle([cx - 55, sy - 22, cx + 55, sy], fill=(225, 45, 65))
    draw.rectangle([cx - 55, sy - 14, cx + 55, sy - 6], fill=(50, 180, 220))

    # Cat face: eyes, nose, cheeks, whiskers
    draw.ellipse([cx - 45, hy - 15, cx - 18, hy + 18], fill=(35, 135, 55)) # green cat eyes
    draw.ellipse([cx + 18, hy - 15, cx + 45, hy + 18], fill=(35, 135, 55))
    draw.ellipse([cx - 34, hy - 10, cx - 28, hy + 12], fill=(20, 20, 20)) # pupils
    draw.ellipse([cx + 28, hy - 10, cx + 34, hy + 12], fill=(20, 20, 20))
    # Cute pink nose
    draw.polygon([(cx - 12, hy + 16), (cx + 12, hy + 16), (cx, hy + 28)], fill=(245, 145, 160))
    # Mouth
    draw.arc([cx - 24, hy + 22, cx, hy + 38], 0, 180, fill=(90, 40, 20), width=3)
    draw.arc([cx, hy + 22, cx + 24, hy + 38], 0, 180, fill=(90, 40, 20), width=3)
    # Whiskers
    for dy in [-6, 6, 18]:
        draw.line([cx - 30, hy + 25 + dy, cx - 120, hy + 20 + dy * 2], fill=(70, 50, 30), width=2)
        draw.line([cx + 30, hy + 25 + dy, cx + 120, hy + 20 + dy * 2], fill=(70, 50, 30), width=2)
        
    # Cat paws holding the wooden oar/paddle
    draw.ellipse([cx - 95, cy + 40, cx - 45, cy + 85], fill=(250, 240, 220), outline=(130, 60, 15), width=2)
    draw.ellipse([cx + 45, cy + 40, cx + 95, cy + 85], fill=(250, 240, 220), outline=(130, 60, 15), width=2)
    # Wooden paddle
    draw.line([cx - 130, cy + 180, cx + 140, cy - 40], fill=(160, 95, 45), width=10)
    # Paddle blade in the water
    draw.ellipse([cx - 170, cy + 150, cx - 100, cy + 220], fill=(140, 80, 35), outline=(90, 45, 20), width=3)

    # Title Banner at bottom
    draw_card_title(draw, "LA CHALUPA", CARD_W, 1120)
    
    os.makedirs("public/cards/michis", exist_ok=True)
    img.save("public/cards/michis/48.jpg", "JPEG", quality=95)
    print("Created public/cards/michis/48.jpg")


def create_lomito_chalupa():
    # 48 La Chalupa with cute Lomito (Perrito)
    img = Image.new("RGB", (CARD_W, CARD_H), (247, 240, 222))
    draw = ImageDraw.Draw(img)
    
    # Vintage border in Amber Gold and Forest Green
    draw_vintage_card_frame(draw, CARD_W, CARD_H, (215, 120, 25), (32, 115, 65))
    draw_card_number(draw, 48, 65, 65, (215, 120, 25))
    
    # Water background
    water_y = 700
    for y in range(water_y, 1050, 2):
        prog = (y - water_y) / 350.0
        r = int(45 + prog * 20)
        g = int(135 + prog * 35)
        b = int(160 + prog * 40)
        draw.line([70, y, CARD_W - 70, y], fill=(r, g, b))
    
    # Sky / banks
    draw.rectangle([70, 420, CARD_W - 70, water_y], fill=(245, 240, 220))
    draw.ellipse([30, 620, CARD_W + 40, 780], fill=(55, 135, 75))
    
    # The Wooden Chalupa
    canoe_pts = [
        (130, 840), (220, 940), (CARD_W - 220, 940), (CARD_W - 130, 840),
        (CARD_W - 200, 880), (200, 880)
    ]
    draw.polygon(canoe_pts, fill=(145, 82, 45), outline=(90, 45, 20))
    draw.line([160, 860, CARD_W - 160, 860], fill=(105, 55, 30), width=4)
    draw.line([210, 900, CARD_W - 210, 900], fill=(105, 55, 30), width=3)
    
    # Flowers
    flower_colors = [(245, 158, 11), (239, 68, 68), (52, 211, 153), (255, 215, 0), (255, 255, 255)]
    for i in range(16):
        fx = 220 + (i % 8) * 55 + (i // 8) * 20
        fy = 830 - (i // 8) * 35 + (i % 3) * 10
        fc = flower_colors[i % len(flower_colors)]
        draw.ellipse([fx - 18, fy - 18, fx + 18, fy + 18], fill=fc, outline=(50, 20, 10), width=2)
        draw.ellipse([fx - 7, fy - 7, fx + 7, fy + 7], fill=(215, 120, 25))

    # Center character: Cheerful Golden/Pug Lomito with bandana and straw hat
    cx, cy = CARD_W // 2, 670
    draw.ellipse([cx - 100, cy - 75, cx + 100, cy + 130], fill=(225, 165, 85), outline=(130, 85, 30), width=3) # Golden body
    draw.ellipse([cx - 70, cy - 25, cx + 70, cy + 115], fill=(252, 235, 210))
    
    # Red Mexican Bandana
    draw.polygon([(cx - 75, cy - 35), (cx + 75, cy - 35), (cx, cy + 45)], fill=(225, 35, 45), outline=(140, 20, 30), width=2)
    # Bandana white polka dots
    for bx, by in [(cx - 30, cy - 15), (cx + 30, cy - 15), (cx, cy + 10), (cx - 15, cy - 5), (cx + 15, cy - 5)]:
        draw.ellipse([bx - 5, by - 5, bx + 5, by + 5], fill=(255, 255, 255))
    
    # Dog head
    hy = cy - 130
    draw.ellipse([cx - 95, hy - 75, cx + 95, hy + 75], fill=(225, 165, 85), outline=(130, 85, 30), width=3)
    
    # Floppy Dog Ears
    draw.ellipse([cx - 125, hy - 50, cx - 65, hy + 60], fill=(185, 120, 45), outline=(115, 70, 25), width=3)
    draw.ellipse([cx + 65, hy - 50, cx + 125, hy + 60], fill=(185, 120, 45), outline=(115, 70, 25), width=3)
    
    # Straw Sombrero
    sy = hy - 95
    draw.ellipse([cx - 150, sy - 20, cx + 150, sy + 30], fill=(238, 205, 130), outline=(130, 95, 40), width=4)
    draw.rectangle([cx - 55, sy - 70, cx + 55, sy], fill=(230, 195, 115), outline=(130, 95, 40), width=3)
    draw.rectangle([cx - 55, sy - 20, cx + 55, sy], fill=(45, 135, 75)) # Green ribbon

    # Dog face: big shiny round eyes, muzzle, tongue out!
    draw.ellipse([cx - 48, hy - 20, cx - 18, hy + 18], fill=(30, 20, 15))
    draw.ellipse([cx + 18, hy - 20, cx + 48, hy + 18], fill=(30, 20, 15))
    draw.ellipse([cx - 40, hy - 15, cx - 30, hy - 5], fill=(255, 255, 255)) # highlight
    draw.ellipse([cx + 26, hy - 15, cx + 36, hy - 5], fill=(255, 255, 255))
    
    # Dog snout / muzzle
    draw.ellipse([cx - 45, hy + 5, cx + 45, hy + 52], fill=(245, 220, 185), outline=(140, 95, 40), width=2)
    # Black nose
    draw.ellipse([cx - 20, hy + 8, cx + 20, hy + 30], fill=(20, 15, 15))
    # Happy open mouth with pink tongue
    draw.arc([cx - 28, hy + 26, cx + 28, hy + 62], 0, 180, fill=(80, 30, 20), width=4)
    draw.ellipse([cx - 14, hy + 42, cx + 14, hy + 72], fill=(245, 110, 130), outline=(160, 40, 60), width=2) # Tongue!
    
    # Paws on the paddle
    draw.ellipse([cx - 95, cy + 40, cx - 45, cy + 85], fill=(240, 215, 180), outline=(130, 85, 30), width=2)
    draw.ellipse([cx + 45, cy + 40, cx + 95, cy + 85], fill=(240, 215, 180), outline=(130, 85, 30), width=2)
    # Wooden paddle
    draw.line([cx - 130, cy + 180, cx + 140, cy - 40], fill=(160, 95, 45), width=10)
    draw.ellipse([cx - 170, cy + 150, cx - 100, cy + 220], fill=(140, 80, 35), outline=(90, 45, 20), width=3)

    # Title Banner at bottom
    draw_card_title(draw, "LA CHALUPA", CARD_W, 1120)
    
    os.makedirs("public/cards/lomitos", exist_ok=True)
    img.save("public/cards/lomitos/48.jpg", "JPEG", quality=95)
    print("Created public/cards/lomitos/48.jpg")


def create_card_01_gallo():
    # Card 01 - El Gallo Michi & El Gallo Lomito
    # Michi Gallo: Cat dressed as rooster with rooster feathers and comb!
    img = Image.new("RGB", (CARD_W, CARD_H), (247, 240, 222))
    draw = ImageDraw.Draw(img)
    draw_vintage_card_frame(draw, CARD_W, CARD_H, (168, 38, 38), (215, 120, 25))
    draw_card_number(draw, 1, 65, 65, (168, 38, 38))
    
    # Fence post / wooden perch
    draw.rectangle([CARD_W // 2 - 40, 720, CARD_W // 2 + 40, 1080], fill=(140, 85, 45), outline=(80, 40, 20), width=3)
    draw.rectangle([100, 820, CARD_W - 100, 870], fill=(155, 95, 50), outline=(80, 40, 20), width=3)
    
    # Morning Sun in background
    draw.ellipse([CARD_W // 2 - 180, 220, CARD_W // 2 + 180, 580], fill=(255, 235, 160))
    for angle in range(0, 360, 30):
        rad = math.radians(angle)
        sx = CARD_W // 2 + int(math.cos(rad) * 190)
        sy = 400 + int(math.sin(rad) * 190)
        ex = CARD_W // 2 + int(math.cos(rad) * 250)
        ey = 400 + int(math.sin(rad) * 250)
        draw.line([sx, sy, ex, ey], fill=(245, 175, 40), width=4)
        
    # Michi Gallo standing proud on fence
    cx, cy = CARD_W // 2, 600
    # Rooster tail feathers on the cat!
    tail_colors = [(16, 185, 129), (6, 182, 212), (59, 130, 246), (168, 85, 247), (239, 68, 68)]
    for idx, tc in enumerate(tail_colors):
        bend = (idx - 2) * 25
        draw.arc([cx - 240 + bend, cy - 140, cx - 40 + bend, cy + 80], 90, 270, fill=tc, width=12)

    # Cat body
    draw.ellipse([cx - 75, cy - 60, cx + 75, cy + 120], fill=(235, 125, 40), outline=(130, 60, 15), width=3)
    draw.ellipse([cx - 45, cy - 20, cx + 45, cy + 100], fill=(252, 230, 200))
    
    # Cat Head
    hy = cy - 110
    draw.ellipse([cx - 70, hy - 60, cx + 70, hy + 60], fill=(235, 125, 40), outline=(130, 60, 15), width=3)
    # Cat ears
    draw.polygon([(cx - 60, hy - 30), (cx - 50, hy - 110), (cx - 15, hy - 50)], fill=(235, 125, 40), outline=(130, 60, 15))
    draw.polygon([(cx + 15, hy - 50), (cx + 50, hy - 110), (cx + 60, hy - 30)], fill=(235, 125, 40), outline=(130, 60, 15))
    
    # Big bright red rooster comb (cresta) on cat head!
    comb_pts = [
        (cx - 30, hy - 55), (cx - 40, hy - 105), (cx - 15, hy - 80),
        (cx, hy - 125), (cx + 15, hy - 80), (cx + 40, hy - 105), (cx + 30, hy - 55)
    ]
    draw.polygon(comb_pts, fill=(225, 30, 40), outline=(140, 15, 20), width=2)
    # Rooster wattle under chin
    draw.ellipse([cx - 15, hy + 45, cx + 15, hy + 85], fill=(225, 30, 40), outline=(140, 15, 20), width=2)

    # Face singing "¡Kikirikí!"
    draw.ellipse([cx - 35, hy - 15, cx - 15, hy + 10], fill=(20, 20, 20))
    draw.ellipse([cx + 15, hy - 15, cx + 35, hy + 10], fill=(20, 20, 20))
    draw.polygon([(cx - 15, hy + 12), (cx + 15, hy + 12), (cx, hy + 38)], fill=(245, 180, 20), outline=(150, 100, 10), width=2) # Beak-like cat nose
    # Whiskers
    for dy in [-4, 6]:
        draw.line([cx - 20, hy + 22 + dy, cx - 90, hy + 18 + dy * 2], fill=(70, 50, 30), width=2)
        draw.line([cx + 20, hy + 22 + dy, cx + 90, hy + 18 + dy * 2], fill=(70, 50, 30), width=2)
        
    # Cat feet on perch
    draw.ellipse([cx - 45, cy + 110, cx - 15, cy + 135], fill=(245, 175, 40), outline=(130, 60, 15), width=2)
    draw.ellipse([cx + 15, cy + 110, cx + 45, cy + 135], fill=(245, 175, 40), outline=(130, 60, 15), width=2)

    draw_card_title(draw, "EL GALLO", CARD_W, 1120)
    img.save("public/cards/michis/01.jpg", "JPEG", quality=95)
    print("Created public/cards/michis/01.jpg")

    # Lomito Gallo
    img_dog = Image.new("RGB", (CARD_W, CARD_H), (247, 240, 222))
    d_dog = ImageDraw.Draw(img_dog)
    draw_vintage_card_frame(d_dog, CARD_W, CARD_H, (215, 120, 25), (16, 185, 129))
    draw_card_number(d_dog, 1, 65, 65, (215, 120, 25))
    
    # Sun & Perch
    d_dog.ellipse([CARD_W // 2 - 180, 220, CARD_W // 2 + 180, 580], fill=(255, 235, 160))
    d_dog.rectangle([CARD_W // 2 - 40, 720, CARD_W // 2 + 40, 1080], fill=(140, 85, 45), outline=(80, 40, 20), width=3)
    d_dog.rectangle([100, 820, CARD_W - 100, 870], fill=(155, 95, 50), outline=(80, 40, 20), width=3)

    # Dog body
    d_dog.ellipse([cx - 80, cy - 50, cx + 80, cy + 120], fill=(225, 165, 85), outline=(130, 85, 30), width=3)
    d_dog.ellipse([cx - 50, cy - 10, cx + 50, cy + 105], fill=(252, 235, 210))
    # Rooster feather cape on dog back
    for idx, tc in enumerate(tail_colors):
        bend = (idx - 2) * 25
        d_dog.arc([cx - 240 + bend, cy - 140, cx - 40 + bend, cy + 80], 90, 270, fill=tc, width=12)

    # Dog Head
    d_dog.ellipse([cx - 75, hy - 60, cx + 75, hy + 60], fill=(225, 165, 85), outline=(130, 85, 30), width=3)
    # Floppy ears
    d_dog.ellipse([cx - 105, hy - 40, cx - 55, hy + 45], fill=(185, 120, 45), outline=(115, 70, 25), width=3)
    d_dog.ellipse([cx + 55, hy - 40, cx + 105, hy + 45], fill=(185, 120, 45), outline=(115, 70, 25), width=3)
    
    # Rooster comb on dog head
    d_dog.polygon(comb_pts, fill=(225, 30, 40), outline=(140, 15, 20), width=2)
    
    # Happy dog face
    d_dog.ellipse([cx - 38, hy - 18, cx - 14, hy + 12], fill=(20, 15, 15))
    d_dog.ellipse([cx + 14, hy - 18, cx + 38, hy + 12], fill=(20, 15, 15))
    d_dog.ellipse([cx - 32, hy - 14, cx - 24, hy - 6], fill=(255, 255, 255))
    d_dog.ellipse([cx + 20, hy - 14, cx + 28, hy - 6], fill=(255, 255, 255))
    d_dog.ellipse([cx - 18, hy + 15, cx + 18, hy + 35], fill=(20, 15, 15)) # nose
    d_dog.arc([cx - 25, hy + 28, cx + 25, hy + 58], 0, 180, fill=(80, 30, 20), width=4)
    d_dog.ellipse([cx - 12, hy + 42, cx + 12, hy + 68], fill=(245, 110, 130)) # tongue

    draw_card_title(d_dog, "EL GALLO", CARD_W, 1120)
    img_dog.save("public/cards/lomitos/01.jpg", "JPEG", quality=95)
    print("Created public/cards/lomitos/01.jpg")

if __name__ == "__main__":
    create_michi_chalupa()
    create_lomito_chalupa()
    create_card_01_gallo()
