import { buildStack } from "../author/build.js";
import { filt, img } from "../author/cv/basics.js";
import { feat, geom, segm } from "../author/cv/classic.js";
import { cls, det, sem, video, vit } from "../author/cv/deep.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/cv/practice.js";
import outputs from "./computer-vision.outputs.json";

/**
 * Computer Vision — hand-authored; every example is plain Python/NumPy, so the "Output" panels
 * come from RUNNING the code:  npm run outputs -- computer-vision
 */
const built = buildStack({
  areas: [
    ["img", "Images as data", "Images"],
    ["filt", "Filtering and edges", "Filters"],
    ["seg", "Segmentation by classical methods", "Classic segmentation"],
    ["geom", "Geometry and cameras", "Geometry"],
    ["feat", "Features and matching", "Features"],
    ["cls", "Image classification with CNNs", "Classification"],
    ["det", "Object detection", "Detection"],
    ["sem", "Semantic and instance segmentation", "Segmentation"],
    ["vit", "Vision transformers and foundation models", "Transformers"],
    ["video", "Motion, video and tracking", "Video"],
  ],
  concepts: { img, filt, seg: segm, geom, feat, cls, det, sem, vit, video },
  questions,
  drills,
  codeLab,
  glance,
  lists,
  materials,
  outputs: outputs as Record<string, string>,
});

export const content = built.content;
export const visuals = built.visuals;
