import math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('public/roulette', exist_ok=True)

SIZE = 800
CENTER = SIZE // 2
RADIUS = 345
FONT_PATH = '/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf'
IMPACT_PATH = '/System/Library/Fonts/Supplemental/Impact.ttf'

font_sub = ImageFont.truetype(FONT_PATH, 18)
font_num = ImageFont.truetype(IMPACT_PATH, 22)
font_num_bold = ImageFont.truetype(IMPACT_PATH, 24)

# -------------------------------------------------------------
# 1. WHEEL DISC (12 Slices with Real 3D Game Assets)
# -------------------------------------------------------------
NUM_SLICES = 12
SLICE_ANGLE = 360 / NUM_SLICES # 30 degrees

# 12 Harmonic, vibrant casino arcade slice colors
SLICE_COLORS = [
    # Slice 0: +100 Monedas (Emerald Green)
    ((16, 185, 129), (4, 120, 87)),
    # Slice 1: Cofre Madera (Warm Rustic Amber)
    ((180, 83, 9), (120, 53, 15)),
    # Slice 2: +200 Monedas (Sapphire Blue)
    ((59, 130, 246), (29, 78, 216)),
    # Slice 3: Sticker Victoria (Royal Purple)
    ((168, 85, 247), (109, 40, 217)),
    # Slice 4: +350 Monedas (Vibrant Sunset Orange)
    ((249, 115, 22), (194, 65, 12)),
    # Slice 5: Frijol Mágico (Cyan Teal)
    ((6, 182, 212), (14, 116, 144)),
    # Slice 6: +500 Monedas (Golden Yellow)
    ((234, 179, 8), (161, 98, 7)),
    # Slice 7: Pack Emojis (Mexican Hot Pink)
    ((236, 72, 153), (190, 24, 93)),
    # Slice 8: +750 Monedas (Mint Green)
    ((20, 184, 166), (15, 118, 110)),
    # Slice 9: Sticker Diablito (Crimson Flame)
    ((239, 68, 68), (185, 28, 28)),
    # Slice 10: Cofre de Plata (Cobalt Steel)
    ((79, 70, 229), (55, 48, 163)),
    # Slice 11: +1200 Monedas (Imperial Gold)
    ((245, 158, 11), (180, 83, 9)),
]

SCALE = 2
SSIZE = SIZE * SCALE
SCENTER = CENTER * SCALE
SRADIUS = RADIUS * SCALE

big_disc = Image.new('RGBA', (SSIZE, SSIZE), (0, 0, 0, 0))
disc_draw = ImageDraw.Draw(big_disc)

for i in range(NUM_SLICES):
    start_deg = i * SLICE_ANGLE
    end_deg = (i + 1) * SLICE_ANGLE
    c_inner, c_outer = SLICE_COLORS[i]
    
    # Draw pie slice
    disc_draw.pieslice(
        [SCENTER - SRADIUS, SCENTER - SRADIUS, SCENTER + SRADIUS, SCENTER + SRADIUS],
        start=start_deg,
        end=end_deg,
        fill=c_inner
    )
    
    # Add subtle radial shading rim
    disc_draw.pieslice(
        [SCENTER - SRADIUS + 12, SCENTER - SRADIUS + 12, SCENTER + SRADIUS - 12, SCENTER + SRADIUS - 12],
        start=start_deg,
        end=end_deg,
        outline=(255, 255, 255, 35),
        width=4
    )

# Draw Spokes (12 Gold metallic dividers with shadow)
for i in range(NUM_SLICES):
    ang = math.radians(i * SLICE_ANGLE)
    x2 = SCENTER + math.cos(ang) * SRADIUS
    y2 = SCENTER + math.sin(ang) * SRADIUS
    
    # Outer dark line
    disc_draw.line([(SCENTER, SCENTER), (x2, y2)], fill=(30, 15, 0, 255), width=8)
    # Gold base
    disc_draw.line([(SCENTER, SCENTER), (x2, y2)], fill=(245, 158, 11, 255), width=5)
    # Highlight
    disc_draw.line([(SCENTER, SCENTER), (x2, y2)], fill=(254, 240, 138, 255), width=2)
    
    # Outer gold rivet peg
    px = SCENTER + math.cos(ang) * (SRADIUS - 16)
    py = SCENTER + math.sin(ang) * (SRADIUS - 16)
    disc_draw.ellipse([px-9, py-9, px+9, py+9], fill=(120, 53, 15, 255))
    disc_draw.ellipse([px-7, py-7, px+7, py+7], fill=(250, 204, 21, 255))
    disc_draw.ellipse([px-3, py-5, px+2, py], fill=(255, 255, 255, 220))

# Inner gold circular ring
disc_draw.ellipse([SCENTER - 120, SCENTER - 120, SCENTER + 120, SCENTER + 120], fill=(30, 15, 0, 255))
disc_draw.ellipse([SCENTER - 110, SCENTER - 110, SCENTER + 110, SCENTER + 110], fill=(245, 158, 11, 255))
disc_draw.ellipse([SCENTER - 98, SCENTER - 98, SCENTER + 98, SCENTER + 98], fill=(254, 240, 138, 255))
disc_draw.ellipse([SCENTER - 90, SCENTER - 90, SCENTER + 90, SCENTER + 90], fill=(15, 10, 25, 255))

# Outer gold ring border
disc_draw.ellipse([SCENTER - SRADIUS, SCENTER - SRADIUS, SCENTER + SRADIUS, SCENTER + SRADIUS], outline=(245, 158, 11, 255), width=12)
disc_draw.ellipse([SCENTER - SRADIUS + 4, SCENTER - SRADIUS + 4, SCENTER + SRADIUS - 4, SCENTER + SRADIUS - 4], outline=(254, 240, 138, 255), width=4)

disc = big_disc.resize((SIZE, SIZE), Image.Resampling.LANCZOS)

# -------------------------------------------------------------
# 2. COMPOSITE REAL 3D GAME ASSETS ONTO SLICES
# -------------------------------------------------------------
coin_img = Image.open('public/images/imoneda.png').convert('RGBA')
wooden_chest = Image.open('public/chests/chest_wooden_closed.png').convert('RGBA')
silver_chest = Image.open('public/chests/chest_silver_closed.png').convert('RGBA')
bean_img = Image.open('public/markers/ifrijol.png').convert('RGBA')
stk_victoria = Image.open('public/stickers/63.png').convert('RGBA')
stk_diablito = Image.open('public/stickers/71.png').convert('RGBA')
stk_corazon = Image.open('public/stickers/29.png').convert('RGBA')

def place_on_slice(base_img, item_img, slice_idx, distance_ratio=0.64, text_label=None, target_size=(62, 62)):
    item_resized = item_img.resize(target_size, Image.Resampling.LANCZOS)
    mid_deg = slice_idx * SLICE_ANGLE + SLICE_ANGLE / 2.0
    
    if text_label:
        badge_h = target_size[1] + 26
        badge_w = max(target_size[0] + 16, 76)
        composite = Image.new('RGBA', (badge_w, badge_h), (0, 0, 0, 0))
        comp_draw = ImageDraw.Draw(composite)
        
        ix = (badge_w - target_size[0]) // 2
        composite.paste(item_resized, (ix, 0), item_resized)
        
        ty = target_size[1] - 4
        tw = comp_draw.textlength(text_label, font=font_num)
        pw = max(tw + 12, 52)
        px = (badge_w - pw) // 2
        comp_draw.rounded_rectangle([px, ty, px + pw, ty + 22], radius=11, fill=(15, 23, 42, 245), outline=(250, 204, 21, 255), width=2)
        comp_draw.text((badge_w // 2, ty + 11), text_label, font=font_num, fill=(254, 240, 138), anchor="mm")
        
        item_to_rotate = composite
    else:
        item_to_rotate = item_resized
    
    mid_rad = math.radians(mid_deg)
    dist = RADIUS * distance_ratio
    cx = CENTER + math.cos(mid_rad) * dist
    cy = CENTER + math.sin(mid_rad) * dist
    
    rot_angle = -(mid_deg + 90)
    rotated = item_to_rotate.rotate(rot_angle, expand=True, resample=Image.Resampling.BICUBIC)
    
    rw, rh = rotated.size
    px = int(cx - rw / 2)
    py = int(cy - rh / 2)
    base_img.paste(rotated, (px, py), rotated)

# Place 12 items:
# 0: +100 Monedas
place_on_slice(disc, coin_img, 0, distance_ratio=0.64, text_label="+100", target_size=(56, 56))

# 1: Cofre Madera
place_on_slice(disc, wooden_chest, 1, distance_ratio=0.64, text_label="MADERA", target_size=(66, 66))

# 2: +200 Monedas
place_on_slice(disc, coin_img, 2, distance_ratio=0.64, text_label="+200", target_size=(56, 56))

# 3: Sticker Victoria
place_on_slice(disc, stk_victoria, 3, distance_ratio=0.64, text_label="STICKER", target_size=(58, 58))

# 4: +350 Monedas
place_on_slice(disc, coin_img, 4, distance_ratio=0.64, text_label="+350", target_size=(58, 58))

# 5: Frijol Mágico
place_on_slice(disc, bean_img, 5, distance_ratio=0.64, text_label="FRIJOL", target_size=(58, 58))

# 6: +500 Monedas
place_on_slice(disc, coin_img, 6, distance_ratio=0.64, text_label="+500", target_size=(60, 60))

# 7: Pack Emojis
place_on_slice(disc, stk_corazon, 7, distance_ratio=0.64, text_label="EMOJIS", target_size=(58, 58))

# 8: +750 Monedas
place_on_slice(disc, coin_img, 8, distance_ratio=0.64, text_label="+750", target_size=(62, 62))

# 9: Sticker Diablito
place_on_slice(disc, stk_diablito, 9, distance_ratio=0.64, text_label="DIABLO", target_size=(58, 58))

# 10: Cofre Plata
place_on_slice(disc, silver_chest, 10, distance_ratio=0.64, text_label="PLATA", target_size=(66, 66))

# 11: +1200 Monedas (PREMIO MAYOR)
place_on_slice(disc, coin_img, 11, distance_ratio=0.64, text_label="+1,200", target_size=(64, 64))

disc.save('public/roulette/wheel_disc.png', 'PNG')
print('Successfully generated 12-slice public/roulette/wheel_disc.png')
