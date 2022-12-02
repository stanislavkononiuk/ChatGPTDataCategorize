
const OpenAI = require('openai');
const API_KEY = 'your_openai_api_key';
const openai = new OpenAI(API_KEY);

async function generateText(prompt) {
  const maxTokens = 2048; // the maximum number of tokens to generate
  const temperature = 0.5; // the sampling temperature determines the creativity of the generated text
  const n = 1; // the number of texts to generate
  const stop = '\n'; // the token at which generation stops

  try {
    const completions = await openai.completions.create({
      engine: 'text-davinci-003',
      prompt,
      maxTokens,
      temperature,
      n,
      stop,
    });
    const { text } = completions.choices[0];
    return text.trim();
  } catch (err) {
    console.log(err);
  }
}

(async () => {
  const prompt = 'Write a funny poem about a duck';
  const generatedText = await generateText(prompt);
  console.log(generatedText);
})();