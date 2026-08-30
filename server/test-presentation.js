import { generateSlides } from './src/services/aiService.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const slides = await generateSlides({
      prompt: 'A presentation about space exploration',
      language: 'Hindi (हिन्दी)',
      slideCount: 3
    });
    console.log(JSON.stringify(slides, null, 2));
  } catch (error) {
    console.error('FAILED:', error);
  }
}
run();
