import { buildStack } from "../author/build.js";
import { cnn } from "../author/nn/cnn.js";
import { data, fit } from "../author/nn/generalise.js";
import { gen } from "../author/nn/gen.js";
import { act, loss, start } from "../author/nn/foundations.js";
import { metrics, mnist } from "../author/nn/eval.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/nn/practice.js";
import { rnn, text } from "../author/nn/seq.js";
import { learn, opt } from "../author/nn/training.js";
import outputs from "./neural-networks.outputs.json";

/**
 * Neural Networks — written by hand from twelve lecture guides. Every example is plain NumPy,
 * so the "Output" panels come from RUNNING the code:
 *
 *     npm run outputs -- neural-networks
 *
 * Re-run it after editing any example, then `npm test`.
 */
const built = buildStack({
  areas: [
    ["start", "Why neural networks", "Start"],
    ["act", "Activation functions", "Activations"],
    ["loss", "Loss functions", "Loss"],
    ["learn", "Gradient descent and backpropagation", "Learning"],
    ["opt", "Optimisers", "Optimisers"],
    ["fit", "Overfitting and regularization", "Regularize"],
    ["data", "Text as numbers", "Text data"],
    ["metrics", "Measuring performance", "Metrics"],
    ["mnist", "MNIST and the full workflow", "MNIST"],
    ["cnn", "Convolutional networks", "CNN"],
    ["rnn", "Recurrent networks", "RNN"],
    ["text", "Translation and attention", "Attention"],
    ["gen", "Autoencoders, VAEs and GANs", "Generative"],
  ],
  concepts: { start, act, loss, learn, opt, fit, data, metrics, mnist, cnn, rnn, text, gen },
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
