import math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

os.makedirs('public/roulette', exist_ok=True)

SIZE = 800
CENTER = SIZE // 2
RADIUS = 345
FONT_PATH = '/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf'
IMPACT_PATH = '/System/Library/Fonts/Supplemental/Impact.ttf'

font_sub = ImageFont.truetype(FONT_PATH, 22)
font_num = ImageFont.truetype(IMPACT_PATH, 28)

# -------------------------------------------------------------
# 1. WHEEL DISC (8 Slices with Real 3D Game Assets)
# -------------------------------------------------------------
wheel = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))

# Colors for each slice (Vibrant arcade palettes)
SLICE_COLORS = [
    # Slice 0: 150 Monedas (Emerald Green)
    ((16, 185, 129), (4, 120, 87)),
    # Slice 1: Cofre de Plata (Cobalt / Sapphire Blue)
    ((59, 130, 246), (29, 78, 216)),
    # Slice 2: 300 Monedas (Royal Purple)
    ((168, 85, 247), (109, 40, 217)),
    # Slice 3: Sticker Fuego (Crimson / Flame Red)
    ((239, 68, 68), (185, 28, 28)),
    # Slice 4: 500 Monedas (Deep Amber Gold)
    ((245, 158, 11), (180, 83, 9)),
    # Slice 5: Frijol de Oro (Cyan Teal)
    ((6, 182, 212), (14, 116, 144)),
    # Slice 6: Cofre Mágico (Amethyst Violet)
    ((139, 92, 246), (91, 33, 182)),
    # Slice 7: Carta La Dama (Ruby Rose)
    ((244, 63, 94), (190, 18, 60)),
]

# Draw circular slices with antialiasing at 2x
SCALE = 2
SSIZE = SIZE * SCALE
SCENTER = CENTER * SCALE
SRADIUS = RADIUS * SCALE

big_disc = Image.new('RGBA', (SSIZE, SSIZE), (0, 0, 0, 0))
disc_draw = ImageDraw.Draw(big_disc)

for i in range(8):
    start_deg = i * 45
    end_deg = (i + 1) * 45
    c_inner, c_outer = SLICE_COLORS[i]
    
    # Draw pie slice
    disc_draw.pieslice(
        [SCENTER - SRADIUS, SCENTER - SRADIUS, SCENTER + SRADIUS, SCENTER + SRADIUS],
        start=start_deg,
        end=end_deg,
        fill=c_inner
    )
    
    # Add radial shading rim
    disc_draw.pieslice(
        [SCENTER - SRADIUS + 10, SCENTER - SRADIUS + 10, SCENTER + SRADIUS - 10, SCENTER + SRADIUS - 10],
        start=start_deg,
        end=end_deg,
        outline=(255, 255, 255, 30),
        width=4
    )

# Draw Spokes (Gold metallic dividers)
for i in range(8):
    ang = math.radians(i * 45)
    x2 = SCENTER + math.cos(ang) * SRADIUS
    y2 = SCENTER + math.sin(ang) * SRADIUS
    
    # Outer dark line
    disc_draw.line([(SCENTER, SCENTER), (x2, y2)], fill=(40, 20, 0, 255), width=10)
    # Gold base
    disc_draw.line([(SCENTER, SCENTER), (x2, y2)], fill=(245, 158, 11, 255), width=6)
    # Highlight
    disc_draw.line([(SCENTER, SCENTER), (x2, y2)], fill=(254, 240, 138, 255), width=2)
    
    # Outer gold rivet peg
    px = SCENTER + math.cos(ang) * (SRADIUS - 16)
    py = SCENTER + math.sin(ang) * (SRADIUS - 16)
    disc_draw.ellipse([px-10, py-10, px+10, py+10], fill=(120, 53, 15, 255))
    disc_draw.ellipse([px-8, py-8, px+8, py+8], fill=(250, 204, 21, 255))
    disc_draw.ellipse([px-4, py-6, px+2, py], fill=(255, 255, 255, 200))

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
silver_chest = Image.open('public/chests/chest_silver_closed.png').convert('RGBA')
magical_chest = Image.open('public/chests/chest_magical_closed.png').convert('RGBA')
bean_img = Image.open('public/markers/ifrijol.png').convert('RGBA')
sticker_img = Image.open('public/stickers/63.png').convert('RGBA')
card_img = Image.open('public/cards/03.jpeg').convert('RGBA')

# Prepare Card as a 3D mini card with gold frame
card_w, card_h = 75, 115
mini_card = card_img.resize((card_w, card_h), Image.Resampling.LANCZOS)
card_framed = Image.new('RGBA', (card_w + 12, card_h + 12), (0, 0, 0, 0))
card_draw = ImageDraw.Draw(card_framed)
card_draw.rounded_rectangle([0, 0, card_w + 11, card_h + 11], radius=8, fill=(180, 83, 9, 255))
card_draw.rounded_rectangle([2, 2, card_w + 9, card_h + 9], radius=6, fill=(250, 204, 21, 255))
card_framed.paste(mini_card, (6, 6))

# Helper to place an item on slice i
# Slice i center angle = i * 45 + 22.5
def place_on_slice(base_img, item_img, slice_idx, distance_ratio=0.62, text_label=None, target_size=(90, 90)):
    item_resized = item_img.resize(target_size, Image.Resampling.LANCZOS)
    
    # Calculate slice angle
    mid_deg = slice_idx * 45 + 22.5
    
    # If text label, create a composite badge
    if text_label:
        badge_h = target_size[1] + 32
        badge_w = max(target_size[0] + 20, 100)
        composite = Image.new('RGBA', (badge_w, badge_h), (0, 0, 0, 0))
        comp_draw = ImageDraw.Draw(composite)
        
        # Paste item in top portion
        ix = (badge_w - target_size[0]) // 2
        composite.paste(item_resized, (ix, 0), item_resized)
        
        # Draw pill badge with text
        ty = target_size[1] - 4
        tw = comp_draw.textlength(text_label, font=font_num)
        pw = max(tw + 18, 64)
        px = (badge_w - pw) // 2
        comp_draw.rounded_rectangle([px, ty, px + pw, ty + 28], radius=14, fill=(15, 23, 42, 240), outline=(250, 204, 21, 255), width=2)
        comp_draw.text((badge_w // 2, ty + 14), text_label, font=font_num, fill=(254, 240, 138), anchor="mm")
        
        item_to_rotate = composite
    else:
        item_to_rotate = item_resized
    
    # Rotate item so its top faces inward/outward radially
    # Angle in radians
    mid_rad = math.radians(mid_deg)
    dist = RADIUS * distance_ratio
    cx = CENTER + math.cos(mid_rad) * dist
    cy = CENTER + math.sin(mid_rad) * dist
    
    # Rotate item to align with ray: rotate angle = -(mid_deg + 90)
    rot_angle = -(mid_deg + 90)
    rotated = item_to_rotate.rotate(rot_angle, expand=True, resample=Image.Resampling.BICUBIC)
    
    rw, rh = rotated.size
    px = int(cx - rw / 2)
    py = int(cy - rh / 2)
    base_img.paste(rotated, (px, py), rotated)

# Place real items:
# Slice 0: 150 Monedas
place_on_slice(disc, coin_img, 0, distance_ratio=0.62, text_label="+150", target_size=(72, 72))

# Slice 1: Cofre de Plata
place_on_slice(disc, silver_chest, 1, distance_ratio=0.63, text_label="PLATA", target_size=(92, 92))

# Slice 2: 300 Monedas
place_on_slice(disc, coin_img, 2, distance_ratio=0.62, text_label="+300", target_size=(74, 74))

# Slice 3: Sticker Fuego Especial
place_on_slice(disc, sticker_img, 3, distance_ratio=0.64, text_label="STICKER", target_size=(82, 82))

# Slice 4: 500 Monedas
place_on_slice(disc, coin_img, 4, distance_ratio=0.62, text_label="+500", target_size=(78, 78))

# Slice 5: Frijol Mágico
place_on_slice(disc, bean_img, 5, distance_ratio=0.64, text_label="FRIJOL", target_size=(82, 82))

# Slice 6: Cofre Mágico
place_on_slice(disc, magical_chest, 6, distance_ratio=0.63, text_label="MÁGICO", target_size=(96, 96))

# Slice 7: Carta La Dama
place_on_slice(disc, card_framed, 7, distance_ratio=0.64, text_label="CARTA", target_size=(68, 104))

disc.save('public/roulette/wheel_disc.png', 'PNG')
print('Created public/roulette/wheel_disc.png')

# -------------------------------------------------------------
# 3. OUTER GOLDEN BEZEL WITH GLOWING BULBS & STUDS
# -------------------------------------------------------------
bezel = Image.new('RGBA', (SSIZE, SSIZE), (0, 0, 0, 0))
bdraw = ImageDraw.Draw(bezel)

OUTER_R = SRADIUS + 40
INNER_R = SRADIUS - 6

# Outer drop shadow
for s in range(12, 0, -2):
    bdraw.ellipse([SCENTER - OUTER_R - s, SCENTER - OUTER_R - s, SCENTER + OUTER_R + s, SCENTER + OUTER_R + s], outline=(0, 0, 0, 20), width=4)

# 3D Golden Rim Base
bdraw.ellipse([SCENTER - OUTER_R, SCENTER - OUTER_R, SCENTER + OUTER_R, SCENTER + OUTER_R], fill=(60, 30, 0, 255))
bdraw.ellipse([SCENTER - OUTER_R + 6, SCENTER - OUTER_R + 6, SCENTER + OUTER_R - 6, SCENTER + OUTER_R - 6], fill=(180, 83, 9, 255))
bdraw.ellipse([SCENTER - OUTER_R + 12, SCENTER - OUTER_R + 12, SCENTER + OUTER_R - 12, SCENTER + OUTER_R - 12], fill=(245, 158, 11, 255))
bdraw.ellipse([SCENTER - OUTER_R + 18, SCENTER - OUTER_R + 18, SCENTER + OUTER_R - 18, SCENTER + OUTER_R - 18], fill=(254, 240, 138, 255))
bdraw.ellipse([SCENTER - OUTER_R + 24, SCENTER - OUTER_R + 24, SCENTER + OUTER_R - 24, SCENTER + OUTER_R - 24], fill=(217, 119, 6, 255))

# Punch out center to make bezel a hollow ring
bdraw.ellipse([SCENTER - INNER_R, SCENTER - INNER_R, SCENTER + INNER_R, SCENTER + INNER_R], fill=(0, 0, 0, 0))

# Inner metallic bevel
bdraw.ellipse([SCENTER - INNER_R - 6, SCENTER - INNER_R - 6, SCENTER + INNER_R + 6, SCENTER + INNER_R + 6], outline=(70, 35, 5, 255), width=6)
bdraw.ellipse([SCENTER - INNER_R - 2, SCENTER - INNER_R - 2, SCENTER + INNER_R + 2, SCENTER + INNER_R + 2], outline=(254, 240, 138, 255), width=3)

# 16 Casino Glowing Studs / Gems around the bezel ring
mid_bezel_r = (OUTER_R + INNER_R) // 2
for k in range(16):
    bang = math.radians(k * (360 / 16))
    bx = SCENTER + math.cos(bang) * mid_bezel_r
    by = SCENTER + math.sin(bang) * mid_bezel_r
    
    # Outer dark rim
    bdraw.ellipse([bx - 14, by - 14, bx + 14, by + 14], fill=(40, 15, 0, 255))
    # Golden base
    bdraw.ellipse([bx - 12, by - 12, bx + 12, by + 12], fill=(245, 158, 11, 255))
    # Glowing bulb/gem (Alternating ruby and diamond/gold)
    if k % 2 == 0:
        bdraw.ellipse([bx - 9, by - 9, bx + 9, by + 9], fill=(254, 240, 138, 255))
        bdraw.ellipse([bx - 5, by - 7, bx + 1, by - 1], fill=(255, 255, 255, 255))
    else:
        bdraw.ellipse([bx - 9, by - 9, bx + 9, by + 9], fill=(239, 68, 68, 255))
        bdraw.ellipse([bx - 5, by - 7, bx + 1, by - 1], fill=(255, 255, 255, 230))

final_bezel = bezel.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
final_bezel.save('public/roulette/wheel_bezel.png', 'PNG')
print('Created public/roulette/wheel_bezel.png')

# -------------------------------------------------------------
# 4. 3D GOLDEN CENTER HUB WITH RUBY GEM
# -------------------------------------------------------------
HUB_SIZE = 260
hub = Image.new('RGBA', (HUB_SIZE, HUB_SIZE), (0, 0, 0, 0))
hdraw = ImageDraw.Draw(hub)
hc = HUB_SIZE // 2
hr = 110

# Drop shadow
hdraw.ellipse([hc - hr, hc - hr + 8, hc + hr, hc + hr + 8], fill=(0, 0, 0, 140))
# Gold ring steps
hdraw.ellipse([hc - hr, hc - hr, hc + hr, hc + hr], fill=(60, 25, 0, 255))
hdraw.ellipse([hc - hr + 6, hc - hr + 6, hc + hr - 6, hc + hr - 6], fill=(180, 83, 9, 255))
hdraw.ellipse([hc - hr + 12, hc - hr + 12, hc + hr - 12, hc + hr - 12], fill=(245, 158, 11, 255))
hdraw.ellipse([hc - hr + 18, hc - hr + 18, hc + hr - 18, hc + hr - 18], fill=(254, 240, 138, 255))
hdraw.ellipse([hc - hr + 26, hc - hr + 26, hc + hr - 26, hc + hr - 26], fill=(120, 53, 15, 255))

# Center Ruby Gem
gem_r = 54
hdraw.ellipse([hc - gem_r, hc - gem_r, hc + gem_r, hc + gem_r], fill=(127, 29, 29, 255))
hdraw.ellipse([hc - gem_r + 4, hc - gem_r + 4, hc + gem_r - 4, hc + gem_r - 4], fill=(220, 38, 38, 255))
hdraw.ellipse([hc - gem_r + 10, hc - gem_r + 10, hc + gem_r - 10, hc + gem_r - 10], fill=(248, 113, 113, 255))

# Golden star sparkle in center of gem
star_pts = [
    (hc, hc - 28), (hc + 8, hc - 8), (hc + 28, hc), (hc + 8, hc + 8),
    (hc, hc + 28), (hc - 8, hc + 8), (hc - 28, hc), (hc - 8, hc - 8)
]
hdraw.polygon(star_pts, fill=(255, 255, 255, 240))
hdraw.ellipse([hc - 6, hc - 6, hc + 6, hc + 6], fill=(254, 240, 138, 255))

hub.save('public/roulette/wheel_center.png', 'PNG')
print('Created public/roulette/wheel_center.png')

# -------------------------------------------------------------
# 5. 3D GOLDEN NEEDLE / TICKER POINTER
# -------------------------------------------------------------
NW, NH = 140, 180
needle = Image.new('RGBA', (NW, NH), (0, 0, 0, 0))
ndraw = ImageDraw.Draw(needle)

ncx = NW // 2
# Needle shape: round hinge at top, sharp golden wedge pointing DOWN
# Drop shadow
ndraw.polygon([(ncx, NH - 10), (ncx - 36, 40), (ncx + 36, 40)], fill=(0, 0, 0, 130))
ndraw.ellipse([ncx - 42, 4, ncx + 42, 88], fill=(0, 0, 0, 130))

# Outer gold wedge
ndraw.polygon([(ncx, NH - 16), (ncx - 34, 40), (ncx + 34, 40)], fill=(120, 53, 15, 255))
ndraw.polygon([(ncx, NH - 22), (ncx - 30, 42), (ncx + 30, 42)], fill=(245, 158, 11, 255))
ndraw.polygon([(ncx, NH - 28), (ncx - 14, 44), (ncx + 14, 44)], fill=(254, 240, 138, 255))

# Top circular hinge
ndraw.ellipse([ncx - 38, 2, ncx + 38, 78], fill=(70, 30, 0, 255))
ndraw.ellipse([ncx - 34, 6, ncx + 34, 74], fill=(245, 158, 11, 255))
ndraw.ellipse([ncx - 26, 14, ncx + 26, 66], fill=(254, 240, 138, 255))

# Center mounting screw / ruby indicator
ndraw.ellipse([ncx - 18, 22, ncx + 18, 58], fill=(185, 28, 28, 255))
ndraw.ellipse([ncx - 14, 26, ncx + 14, 54], fill=(239, 68, 68, 255))
ndraw.ellipse([ncx - 8, 28, ncx + 2, 38], fill=(255, 255, 255, 240))

needle.save('public/roulette/wheel_needle.png', 'PNG')
print('Created public/roulette/wheel_needle.png')
