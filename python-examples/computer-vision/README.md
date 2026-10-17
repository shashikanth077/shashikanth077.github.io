# computer-vision — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| What computer vision is | `01-images-as-data/01_img-0.py` |
| An image is an array of numbers | `01-images-as-data/02_img-1.py` |
| Colour spaces: RGB, grayscale and HSV | `01-images-as-data/03_img-2.py` |
| Histograms and contrast | `01-images-as-data/04_img-3.py` |
| Histogram equalization | `01-images-as-data/05_img-4.py` |
| Noise: salt-and-pepper, Gaussian, shot | `01-images-as-data/06_img-5.py` |
| Sampling and quantization | `01-images-as-data/07_img-6.py` |
| Convolution: sliding a kernel | `02-filtering-and-edges/01_filt-0.py` |
| Blurring: box and Gaussian filters | `02-filtering-and-edges/02_filt-1.py` |
| The median filter and salt-and-pepper noise | `02-filtering-and-edges/03_filt-2.py` |
| Sharpening and the Laplacian | `02-filtering-and-edges/04_filt-3.py` |
| Image gradients and the Sobel operator | `02-filtering-and-edges/05_filt-4.py` |
| Canny edge detection | `02-filtering-and-edges/06_filt-5.py` |
| Separable filters and cost | `02-filtering-and-edges/07_filt-6.py` |
| Thresholding and Otsu's method | `03-segmentation-by-classical-methods/01_seg-0.py` |
| Connected components and labelling | `03-segmentation-by-classical-methods/02_seg-1.py` |
| Morphology: erosion and dilation | `03-segmentation-by-classical-methods/03_seg-2.py` |
| Finding lines: the Hough transform | `03-segmentation-by-classical-methods/04_seg-3.py` |
| Colour segmentation with k-means | `03-segmentation-by-classical-methods/05_seg-4.py` |
| Describing a region: area, centroid and shape | `03-segmentation-by-classical-methods/06_seg-5.py` |
| Geometric transforms: translate, scale, rotate | `04-geometry-and-cameras/01_geom-0.py` |
| Homogeneous coordinates and the 3×3 matrix | `04-geometry-and-cameras/02_geom-1.py` |
| Interpolation: resampling between pixels | `04-geometry-and-cameras/03_geom-2.py` |
| The pinhole camera model | `04-geometry-and-cameras/04_geom-3.py` |
| Stereo vision and depth from disparity | `04-geometry-and-cameras/05_geom-4.py` |
| Homography: mapping one plane to another | `04-geometry-and-cameras/06_geom-5.py` |
| Corners: the Harris detector | `05-features-and-matching/01_feat-0.py` |
| Template matching and normalised cross-correlation | `05-features-and-matching/02_feat-1.py` |
| Local descriptors: SIFT, ORB and HOG | `05-features-and-matching/03_feat-2.py` |
| Matching features: nearest neighbour and the ratio test | `05-features-and-matching/04_feat-3.py` |
| RANSAC: fitting a model despite outliers | `05-features-and-matching/05_feat-4.py` |
| Putting it together: image stitching | `05-features-and-matching/06_feat-5.py` |
| Image classification: from pixels to a label | `06-image-classification-with-cnns/01_cls-0.py` |
| Receptive fields: what a neuron can see | `06-image-classification-with-cnns/02_cls-1.py` |
| Famous CNN architectures | `06-image-classification-with-cnns/03_cls-2.py` |
| Data augmentation | `06-image-classification-with-cnns/04_cls-3.py` |
| Transfer learning for images | `06-image-classification-with-cnns/05_cls-4.py` |
| Looking inside a classifier: saliency and Grad-CAM | `06-image-classification-with-cnns/06_cls-5.py` |
| Object detection: boxes and labels | `07-object-detection/01_det-0.py` |
| Intersection over union (IoU) | `07-object-detection/02_det-1.py` |
| Non-maximum suppression | `07-object-detection/03_det-2.py` |
| Anchors and grid predictions | `07-object-detection/04_det-3.py` |
| Average precision and mAP | `07-object-detection/05_det-4.py` |
| Training a detector: losses and imbalance | `07-object-detection/06_det-5.py` |
| Detection in practice: speed, size and small objects | `07-object-detection/07_det-6.py` |
| Semantic, instance and panoptic segmentation | `08-semantic-and-instance-segmentation/01_sem-0.py` |
| Encoder–decoder and U-Net | `08-semantic-and-instance-segmentation/02_sem-1.py` |
| Segmentation metrics: pixel accuracy, IoU and Dice | `08-semantic-and-instance-segmentation/03_sem-2.py` |
| Mask R-CNN: detection plus masks | `08-semantic-and-instance-segmentation/04_sem-3.py` |
| Segment anything and foundation models | `08-semantic-and-instance-segmentation/05_sem-4.py` |
| Vision Transformer: images as sequences of patches | `09-vision-transformers-and-foundation-models/01_vit-0.py` |
| Self-attention cost and the CNN comparison | `09-vision-transformers-and-foundation-models/02_vit-1.py` |
| Contrastive image–text learning (CLIP) | `09-vision-transformers-and-foundation-models/03_vit-2.py` |
| Self-supervised learning from unlabelled images | `09-vision-transformers-and-foundation-models/04_vit-3.py` |
| Optical flow: motion between frames | `10-motion-video-and-tracking/01_video-0.py` |
| Background subtraction and frame differencing | `10-motion-video-and-tracking/02_video-1.py` |
| Tracking: association and the Kalman filter | `10-motion-video-and-tracking/03_video-2.py` |
