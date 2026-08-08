from PIL import Image

def remove_white_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # If the pixel is close to white, make it transparent
        # item is (R, G, B, A)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            # We can also do a smooth alpha blend if needed, but a simple cutoff might look jagged.
            # Let's do a better alpha extraction assuming black drawing on white background.
            # The darker the pixel, the more opaque.
            # Convert to grayscale to get intensity
            intensity = (item[0] + item[1] + item[2]) / 3
            # If it's pure white (255), alpha is 0. If pure black (0), alpha is 255.
            alpha = int(255 - intensity)
            
            # Keep original color but apply calculated alpha, or just use the color and scale alpha
            if alpha > 0:
                # To avoid black fringes, we can set the RGB to the original color, but if it was antialiased
                # against white, we might need to adjust it. We'll just set alpha based on darkness.
                new_data.append((item[0], item[1], item[2], alpha))
            else:
                new_data.append((255, 255, 255, 0))

    img.putdata(new_data)
    img.save(output_path, "PNG")

remove_white_background('src/assets/logo-header-barbie.png', 'src/assets/logo-header-barbie-transparent.png')
print("Done")
