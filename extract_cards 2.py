#!/usr/bin/env python3
"""
Extract the 54 card images from the Lotería Mexicana PDF.
Each page has 2 embedded images: a landscape header and a portrait card.
We want the portrait ones (905x1434).
We also render the first page to see what it looks like.
"""
import fitz  # PyMuPDF
import os

PDF_PATH = "Baraja loteria mexicana.pdf"
OUTPUT_DIR = "public/cards"
PREVIEW_DIR = "public/cards/preview"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)

print(f"PDF has {len(doc)} pages")

# First, render page 1 to see what we're dealing with
page = doc[0]
mat = fitz.Matrix(2, 2)  # 2x zoom
pix = page.get_pixmap(matrix=mat)
pix.save(f"{PREVIEW_DIR}/page_1_full.png")
print(f"Saved full page 1 preview")

# Extract the portrait card image from each page (pages 1-54, card 1-54)
# The portrait image is the larger one at 905x1434
card_num = 0
for page_num in range(len(doc)):
    page = doc[page_num]
    images = page.get_images(full=True)
    
    for img in images:
        xref = img[0]
        base_image = doc.extract_image(xref)
        w, h = base_image['width'], base_image['height']
        
        # The card image is the portrait one (height > width)
        if h > w:
            card_num += 1
            ext = base_image['ext']
            filename = f"{card_num:02d}.{ext}"
            filepath = os.path.join(OUTPUT_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(base_image['image'])
            print(f"  Card {card_num}: page {page_num+1}, {w}x{h}, saved as {filename}")

print(f"\nTotal cards extracted: {card_num}")
doc.close()
