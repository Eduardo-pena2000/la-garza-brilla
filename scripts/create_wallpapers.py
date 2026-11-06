import math
import random
from PIL import Image, ImageDraw, ImageFilter

WIDTH = 1080
HEIGHT = 1920

def create_michis_wallpaper():
    img = Image.new("RGBA", (WIDTH, HEIGHT), (20, 8, 30, 255))
    draw = ImageDraw.Draw(img)

    # Base radial gradient (deep indigo / magenta felt)
    center_x, center_y = WIDTH // 2, HEIGHT // 2
    max_radius = math.hypot(center_x, center_y)

    for y in range(0, HEIGHT, 4):
        for x in range(0, WIDTH, 4):
            dist = math.hypot(x - center_x, y - center_y) / max_radius
            r = int(35 + (1 - dist) * 25 + math.sin(x * 0.01) * 5)
            g = int(10 + (1 - dist) * 15)
            b = int(45 + (1 - dist) * 35 + math.cos(y * 0.01) * 5)
            draw.rectangle([x, y, x + 4, y + 4], fill=(r, g, b, 255))

    # Add felt noise texture
    noise = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(noise)
    random.seed(42)
    for _ in range(40000):
        nx = random.randint(0, WIDTH - 1)
        ny = random.randint(0, HEIGHT - 1)
        alpha = random.randint(4, 18)
        color = (255, 105, 180, alpha) if random.random() > 0.5 else (255, 215, 0, alpha)
        n_draw.point((nx, ny), fill=color)

    img = Image.alpha_composite(img, noise)
    draw = ImageDraw.Draw(img)

    # Function to draw a glowing paw print
    def draw_paw(cx, cy, size, angle_deg, color, alpha=220):
        paw_layer = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
        p_draw = ImageDraw.Draw(paw_layer)
        pcx, pcy = size, size
        c_fill = (*color, alpha)

        # Main pad (egg/rounded heart)
        p_draw.ellipse([pcx - size * 0.35, pcy - size * 0.1, pcx + size * 0.35, pcy + size * 0.45], fill=c_fill)
        # 4 toes
        toes = [
            (-size * 0.3, -size * 0.25, size * 0.14),
            (-size * 0.1, -size * 0.42, size * 0.15),
            (size * 0.1, -size * 0.42, size * 0.15),
            (size * 0.3, -size * 0.25, size * 0.14),
        ]
        for tx, ty, tr in toes:
            p_draw.ellipse([pcx + tx - tr, pcy + ty - tr, pcx + tx + tr, pcy + ty + tr], fill=c_fill)

        rotated = paw_layer.rotate(angle_deg, resample=Image.BICUBIC)
        img.paste(rotated, (int(cx - size), int(cy - size)), rotated)

    # Draw border decorative arches and paws
    gold = (245, 158, 11)
    pink = (236, 72, 153)
    cyan = (6, 182, 212)

    # Perimeter decorative border
    margin = 40
    draw.rectangle([margin, margin, WIDTH - margin, HEIGHT - margin], outline=(236, 72, 153, 90), width=3)
    draw.rectangle([margin + 12, margin + 12, WIDTH - margin - 12, HEIGHT - margin - 12], outline=(245, 158, 11, 70), width=2)

    # Corner flourishes and paws
    corners = [(110, 110), (WIDTH - 110, 110), (110, HEIGHT - 110), (WIDTH - 110, HEIGHT - 110)]
    for idx, (cx, cy) in enumerate(corners):
        draw_paw(cx, cy, 60, idx * 90 + 45, gold, 230)
        draw_paw(cx, cy, 40, idx * 90 + 45, pink, 255)

    # Top & bottom border paws
    for i in range(7):
        px = 180 + i * (WIDTH - 360) / 6
        draw_paw(px, 70, 32, 180 + (i % 2) * 20 - 10, pink, 180)
        draw_paw(px, HEIGHT - 70, 32, (i % 2) * 20 - 10, gold, 180)

    # Left & right border paws
    for i in range(12):
        py = 220 + i * (HEIGHT - 440) / 11
        draw_paw(70, py, 30, 90 + (i % 2) * 20 - 10, gold, 160)
        draw_paw(WIDTH - 70, py, 30, -90 + (i % 2) * 20 - 10, pink, 160)

    # Dark center vignette to keep playing cards ultra-clear
    vignette = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    v_draw = ImageDraw.Draw(vignette)
    for i in range(60):
        alpha = int((1 - (i / 60.0)) * 140)
        v_draw.rectangle([i * 2, i * 2, WIDTH - i * 2, HEIGHT - i * 2], outline=(0, 0, 0, alpha), width=3)

    img = Image.alpha_composite(img, vignette)
    img.convert("RGB").save("public/wallpapers/wp_michis.jpg", "JPEG", quality=92)
    print("Saved public/wallpapers/wp_michis.jpg")


def create_lomitos_wallpaper():
    img = Image.new("RGBA", (WIDTH, HEIGHT), (12, 28, 18, 255))
    draw = ImageDraw.Draw(img)

    # Base radial gradient (forest emerald / dark gold felt)
    center_x, center_y = WIDTH // 2, HEIGHT // 2
    max_radius = math.hypot(center_x, center_y)

    for y in range(0, HEIGHT, 4):
        for x in range(0, WIDTH, 4):
            dist = math.hypot(x - center_x, y - center_y) / max_radius
            r = int(15 + (1 - dist) * 35 + math.sin(x * 0.01) * 4)
            g = int(32 + (1 - dist) * 40 + math.cos(y * 0.01) * 6)
            b = int(18 + (1 - dist) * 20)
            draw.rectangle([x, y, x + 4, y + 4], fill=(r, g, b, 255))

    # Noise texture
    noise = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(noise)
    random.seed(99)
    for _ in range(40000):
        nx = random.randint(0, WIDTH - 1)
        ny = random.randint(0, HEIGHT - 1)
        alpha = random.randint(4, 18)
        color = (245, 158, 11, alpha) if random.random() > 0.5 else (16, 185, 129, alpha)
        n_draw.point((nx, ny), fill=color)

    img = Image.alpha_composite(img, noise)
    draw = ImageDraw.Draw(img)

    def draw_dog_paw(cx, cy, size, angle_deg, color, alpha=220):
        paw_layer = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
        p_draw = ImageDraw.Draw(paw_layer)
        pcx, pcy = size, size
        c_fill = (*color, alpha)

        # Big heart pad
        p_draw.polygon([
            (pcx, pcy + size * 0.45),
            (pcx - size * 0.38, pcy + size * 0.15),
            (pcx - size * 0.35, pcy - size * 0.1),
            (pcx, pcy + size * 0.1),
            (pcx + size * 0.35, pcy - size * 0.1),
            (pcx + size * 0.38, pcy + size * 0.15)
        ], fill=c_fill)
        # 4 round dog toes
        toes = [
            (-size * 0.35, -size * 0.22, size * 0.16),
            (-size * 0.13, -size * 0.44, size * 0.17),
            (size * 0.13, -size * 0.44, size * 0.17),
            (size * 0.35, -size * 0.22, size * 0.16),
        ]
        for tx, ty, tr in toes:
            p_draw.ellipse([pcx + tx - tr, pcy + ty - tr, pcx + tx + tr, pcy + ty + tr], fill=c_fill)

        rotated = paw_layer.rotate(angle_deg, resample=Image.BICUBIC)
        img.paste(rotated, (int(cx - size), int(cy - size)), rotated)

    gold = (245, 158, 11)
    amber = (249, 115, 22)
    emerald = (52, 211, 153)

    margin = 40
    draw.rectangle([margin, margin, WIDTH - margin, HEIGHT - margin], outline=(245, 158, 11, 90), width=3)
    draw.rectangle([margin + 12, margin + 12, WIDTH - margin - 12, HEIGHT - margin - 12], outline=(52, 211, 153, 70), width=2)

    corners = [(110, 110), (WIDTH - 110, 110), (110, HEIGHT - 110), (WIDTH - 110, HEIGHT - 110)]
    for idx, (cx, cy) in enumerate(corners):
        draw_dog_paw(cx, cy, 65, idx * 90 + 45, gold, 240)
        draw_dog_paw(cx, cy, 42, idx * 90 + 45, amber, 255)

    for i in range(7):
        px = 180 + i * (WIDTH - 360) / 6
        draw_dog_paw(px, 70, 34, 180 + (i % 2) * 20 - 10, amber, 190)
        draw_dog_paw(px, HEIGHT - 70, 34, (i % 2) * 20 - 10, gold, 190)

    for i in range(12):
        py = 220 + i * (HEIGHT - 440) / 11
        draw_dog_paw(70, py, 32, 90 + (i % 2) * 20 - 10, gold, 170)
        draw_dog_paw(WIDTH - 70, py, 32, -90 + (i % 2) * 20 - 10, amber, 170)

    vignette = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    v_draw = ImageDraw.Draw(vignette)
    for i in range(60):
        alpha = int((1 - (i / 60.0)) * 140)
        v_draw.rectangle([i * 2, i * 2, WIDTH - i * 2, HEIGHT - i * 2], outline=(0, 0, 0, alpha), width=3)

    img = Image.alpha_composite(img, vignette)
    img.convert("RGB").save("public/wallpapers/wp_lomitos.jpg", "JPEG", quality=92)
    print("Saved public/wallpapers/wp_lomitos.jpg")

if __name__ == "__main__":
    create_michis_wallpaper()
    create_lomitos_wallpaper()
