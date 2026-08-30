import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('hello');
    console.log(modelName, 'SUCCESS');
  } catch (error) {
    console.error(modelName, 'FAILED:', error.statusText || error.message);
  }
}

async function run() {
  await test('gemini-3.5-flash');
  await test('gemini-2.5-flash');
  await test('gemini-flash-latest');
  await test('gemini-3.1-pro-preview');
}
run();
