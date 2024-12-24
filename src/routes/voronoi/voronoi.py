from PIL import Image, ImageDraw
import random
import colorsys


def generate_voronoi(width, height, points):
    image = Image.new("RGB", (width, height))
    pixels = image.load()

    for x in range(width):
        for y in range(height):
            min_dist = float("inf")
            for point in points:
                px, py = point["coords"]
                dist = (px - x) ** 2 + (py - y) ** 2
                if dist < min_dist:
                    min_dist = dist
                    closest_color = point["color"]
            pixels[x, y] = closest_color

    draw = ImageDraw.Draw(image)
    for point in points:
        px, py = point["coords"]
        draw.ellipse((px - 2, py - 2, px + 2, py + 2), fill=(0, 0, 0))

    return image


def generate_points(num_points, width, height):
    return [
        {
            "coords": (random.randint(0, width - 1),
                       random.randint(0, height - 1)),
            "color": tuple(
                int(c * 255)
                for c in colorsys.hsv_to_rgb(i / num_points, 0.6, 0.8)
            ),
        }
        for i in range(num_points)
    ]


width = 500
height = 500
num_points = 20

points = generate_points(num_points, width, height)
voronoi_image = generate_voronoi(width, height, points)

voronoi_image.save("voronoi_diagram.png")
