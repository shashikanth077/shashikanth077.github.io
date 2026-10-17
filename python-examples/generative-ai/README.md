# generative-ai — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| What generative AI is | `01-tokens-embeddings-and-context/01_tok-0.py` |
| Tokens: the units a model reads | `01-tokens-embeddings-and-context/02_tok-1.py` |
| Embeddings: meaning as vectors | `01-tokens-embeddings-and-context/03_tok-2.py` |
| Positional information: telling a model the order | `01-tokens-embeddings-and-context/04_tok-3.py` |
| The context window and its cost | `01-tokens-embeddings-and-context/05_tok-4.py` |
| Vocabulary size and embedding parameters | `01-tokens-embeddings-and-context/06_tok-5.py` |
| Self-attention, step by step | `02-inside-the-transformer/01_arch-0.py` |
| The causal mask: no peeking at the future | `02-inside-the-transformer/02_arch-1.py` |
| Multi-head attention and shapes | `02-inside-the-transformer/03_arch-2.py` |
| The transformer block: attention, MLP, residuals | `02-inside-the-transformer/04_arch-3.py` |
| Counting parameters: 12·L·d² | `02-inside-the-transformer/05_arch-4.py` |
| The KV cache: memory while generating | `02-inside-the-transformer/06_arch-5.py` |
| Compute: FLOPs per token and mixture of experts | `02-inside-the-transformer/07_arch-6.py` |
| Pretraining: predict the next token | `03-how-large-models-are-trained/01_train-0.py` |
| Scaling laws and the compute budget | `03-how-large-models-are-trained/02_train-1.py` |
| Training data: quality beats quantity | `03-how-large-models-are-trained/03_train-2.py` |
| Optimisation: AdamW, warm-up and cosine decay | `03-how-large-models-are-trained/04_train-3.py` |
| Memory for training: bytes per parameter | `03-how-large-models-are-trained/05_train-4.py` |
| Emergent abilities and in-context learning | `03-how-large-models-are-trained/06_train-5.py` |
| Prompting, RAG or fine-tuning? | `04-adapting-models-lora-quantisation-alignment/01_adapt-0.py` |
| Supervised fine-tuning for instructions | `04-adapting-models-lora-quantisation-alignment/02_adapt-1.py` |
| LoRA: low-rank adapters | `04-adapting-models-lora-quantisation-alignment/03_adapt-2.py` |
| Quantisation: smaller numbers, smaller models | `04-adapting-models-lora-quantisation-alignment/04_adapt-3.py` |
| Distillation: a small student from a large teacher | `04-adapting-models-lora-quantisation-alignment/05_adapt-4.py` |
| Preference tuning: RLHF and DPO | `04-adapting-models-lora-quantisation-alignment/06_adapt-5.py` |
| Anatomy of a good prompt | `05-prompting-and-structured-outputs/01_prompt-0.py` |
| Zero-shot and few-shot prompting | `05-prompting-and-structured-outputs/02_prompt-1.py` |
| Chain-of-thought and reasoning | `05-prompting-and-structured-outputs/03_prompt-2.py` |
| System prompts, roles and conversation state | `05-prompting-and-structured-outputs/04_prompt-3.py` |
| Structured outputs and validation | `05-prompting-and-structured-outputs/05_prompt-4.py` |
| Temperature and sampling settings by task | `05-prompting-and-structured-outputs/06_prompt-5.py` |
| Prompt injection and untrusted text | `05-prompting-and-structured-outputs/07_prompt-6.py` |
| Testing prompts like software | `05-prompting-and-structured-outputs/08_prompt-7.py` |
| Retrieval-augmented generation: the idea | `06-retrieval-augmented-generation/01_rag-0.py` |
| Chunking: size and overlap | `06-retrieval-augmented-generation/02_rag-1.py` |
| Retrieval with embeddings and top-k | `06-retrieval-augmented-generation/03_rag-2.py` |
| Hybrid search and reranking | `06-retrieval-augmented-generation/04_rag-3.py` |
| Building the prompt: context budget and citations | `06-retrieval-augmented-generation/05_rag-4.py` |
| Evaluating RAG: retrieval and generation | `06-retrieval-augmented-generation/06_rag-5.py` |
| Freshness, updates and caching | `06-retrieval-augmented-generation/07_rag-6.py` |
| When RAG fails | `06-retrieval-augmented-generation/08_rag-7.py` |
| Diffusion models: create by removing noise | `07-image-generation-with-diffusion/01_diff-0.py` |
| The forward process in one formula | `07-image-generation-with-diffusion/02_diff-1.py` |
| Training and sampling | `07-image-generation-with-diffusion/03_diff-2.py` |
| Conditioning and classifier-free guidance | `07-image-generation-with-diffusion/04_diff-3.py` |
| Latent diffusion: work in a compressed space | `07-image-generation-with-diffusion/05_diff-4.py` |
| Controlling image generation | `07-image-generation-with-diffusion/06_diff-5.py` |
| Multimodal models | `08-multimodal-and-other-media/01_multi-0.py` |
| Text, audio and video generation | `08-multimodal-and-other-media/02_multi-1.py` |
| Vision-language tasks in practice | `08-multimodal-and-other-media/03_multi-2.py` |
| Why evaluating generative models is hard | `09-evaluating-generative-systems/01_evalu-0.py` |
| Pass@k for code and tasks with checkers | `09-evaluating-generative-systems/02_evalu-1.py` |
| LLM-as-judge and its biases | `09-evaluating-generative-systems/03_evalu-2.py` |
| Hallucination: kinds and mitigation | `09-evaluating-generative-systems/04_evalu-3.py` |
| Benchmarks, contamination and honest reporting | `09-evaluating-generative-systems/05_evalu-4.py` |
| Cost: tokens in, tokens out | `10-cost-latency-safety-and-shipping/01_ops-0.py` |
| Latency: time to first token and tokens per second | `10-cost-latency-safety-and-shipping/02_ops-1.py` |
| Throughput, batching and rate limits | `10-cost-latency-safety-and-shipping/03_ops-2.py` |
| Guardrails, moderation and safe use | `10-cost-latency-safety-and-shipping/04_ops-3.py` |
| Privacy, copyright and responsible use | `10-cost-latency-safety-and-shipping/05_ops-4.py` |
| From prototype to product | `10-cost-latency-safety-and-shipping/06_ops-5.py` |
