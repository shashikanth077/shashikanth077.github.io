# -*- coding: utf-8 -*-
# ==========================================================================
# Interpolation: resampling between pixels [computer-vision / Geometry and
# cameras]
# ==========================================================================
# WHAT IT IS
# After a transform the source position of an output pixel is rarely an
# integer, so we must estimate the intensity in between. Nearest-neighbour
# copies the closest pixel (fast, blocky). Bilinear blends the four
# surrounding pixels: with corner values 10 (top-left), 20, 30, 40 and a point
# at fractional offset (x, y) = (0.25, 0.75): value = (1−x)(1−y)10 + x(1−y)20
# + (1−x)y·30 + xy·40 = 27.5. At the centre (0.5, 0.5) it is the average, 25.
# Bicubic uses 16 neighbours for smoother results. Use nearest for label
# images (masks), bilinear or bicubic for photos.
#
# WHERE YOU USE IT
# Interpolating label maps with bilinear invents labels that do not exist:
# always use nearest for masks.
#
# RUN IT:  python 03_geom-2.py
#

def bilinear(x, y, tl=10, tr=20, bl=30, br=40):
    return (1 - x) * (1 - y) * tl + x * (1 - y) * tr + (1 - x) * y * bl + x * y * br

print(bilinear(0.25, 0.75), bilinear(0.5, 0.5), bilinear(0, 0), bilinear(1, 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 27.5 25.0 10 40
