const https = require('https');
const fs = require('fs');
const path = require('path');

class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'generativelanguage.googleapis.com';
    this.model = 'gemini-2.0-flash-exp';

    // Load prompts configuration
    this.loadPrompts();
  }

  loadPrompts() {
    try {
      const promptsPath = path.join(__dirname, '../data/prompts.json');
      const promptsData = fs.readFileSync(promptsPath, 'utf8');
      this.prompts = JSON.parse(promptsData);
    } catch (error) {
      console.error('Error loading prompts configuration:', error);
      this.prompts = this.getDefaultPrompts();
    }

    // Load custom instructions initially
    this.loadCustomInstructions();
  }

  loadCustomInstructions() {
    try {
      const customInstructionsPath = path.join(__dirname, '../data/custom-instructions.json');
      const customInstructionsData = fs.readFileSync(customInstructionsPath, 'utf8');
      const customInstructionsConfig = JSON.parse(customInstructionsData);
      this.customInstructions = customInstructionsConfig.customInstructions || '';
      this.customInstructionsPrefix = customInstructionsConfig.customInstructionsPrefix || '';
    } catch (error) {
      console.warn('Custom instructions file not found, using defaults');
      this.customInstructions = '';
      this.customInstructionsPrefix = '';
    }
  }

  getDefaultPrompts() {
    // Fallback prompts in case config file is missing
    return {
      questionGeneration: {
        fallbackQuestions: [
          "How did that make you feel?",
          "What details stand out to you about that moment?"
        ]
      }
    };
  }

  async generateQuestions(entryExcerpt) {
    // Reload custom instructions to get latest changes
    this.loadCustomInstructions();

    const config = this.prompts.questionGeneration;
    const prompt = config.template
      .replace('{customInstructions}', this.customInstructions ? this.customInstructionsPrefix + this.customInstructions + '\n\n' : '')
      .replace('{entryExcerpt}', entryExcerpt);

    try {
      const response = await this.makeRequestWithRetry(prompt, {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens
      });

      // Try to parse the response as JSON
      const text = response.trim();
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      try {
        const questions = JSON.parse(cleanText);
        if (Array.isArray(questions)) {
          return questions.slice(0, 3); // Max 3 questions
        }
      } catch (parseError) {
        // If JSON parsing fails, try to extract questions manually
        const lines = text.split('\n').filter(line => line.trim());
        const questions = lines
          .filter(line => line.includes('?'))
          .map(line => line.replace(/^[-*\d.)\]}\s]+/, '').trim())
          .slice(0, 3);

        if (questions.length > 0) {
          return questions;
        }
      }

      // Fallback questions from config
      return this.prompts.questionGeneration.fallbackQuestions || [
        "How did that make you feel?",
        "What details stand out to you about that moment?"
      ];
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  async insertAnswer(originalEntry, question, answer) {
    // Reload custom instructions to get latest changes
    this.loadCustomInstructions();

    const config = this.prompts.questionInsertion;
    const prompt = config.template
      .replace('{customInstructions}', this.customInstructions ? this.customInstructionsPrefix + this.customInstructions + '\n\n' : '')
      .replace('{originalEntry}', originalEntry)
      .replace('{question}', question)
      .replace('{answer}', answer);

    try {
      const response = await this.makeRequestWithRetry(prompt, {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens
      });

      return response.trim();
    } catch (error) {
      console.error('Error inserting answer:', error);
      throw error;
    }
  }

  async enhanceEntry(content, writingStyle = 'natural') {
    // Reload custom instructions to get latest changes
    this.loadCustomInstructions();

    const config = this.prompts.entryEnhancement;
    const styleText = config.writingStyles[writingStyle] || '';
    const prompt = config.template
      .replace('{customInstructions}', this.customInstructions ? this.customInstructionsPrefix + this.customInstructions + '\n\n' : '')
      .replace('{writingStyle}', styleText)
      .replace('{content}', content);

    try {
      const response = await this.makeRequestWithRetry(prompt, {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens
      });

      return response.trim();
    } catch (error) {
      console.error('Error enhancing entry:', error);
      throw error;
    }
  }

  async makeRequestWithRetry(prompt, config = {}, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.makeRequest(prompt, config);
      } catch (error) {
        const isLastAttempt = attempt === retries;

        // Don't retry on certain errors
        const shouldNotRetry =
          error.message.includes('API key') ||
          error.message.includes('quota') ||
          error.message.includes('HTTP 400') ||
          error.message.includes('HTTP 403');

        if (isLastAttempt || shouldNotRetry) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        console.log(`Retry attempt ${attempt + 1} after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  makeRequest(prompt, config = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxOutputTokens || 1024,
          topP: 0.95,
          topK: 40
        }
      });

      const options = {
        hostname: this.baseUrl,
        path: `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          // Check HTTP status code first
          if (res.statusCode !== 200) {
            console.error(`Gemini API returned status ${res.statusCode}`);
            console.error('Response:', responseData.substring(0, 500));
            reject(new Error(`Gemini API error: HTTP ${res.statusCode}`));
            return;
          }

          // Check if response looks like HTML (error page)
          if (responseData.trim().startsWith('<!DOCTYPE') || responseData.trim().startsWith('<html')) {
            console.error('Gemini API returned HTML instead of JSON');
            console.error('Response:', responseData.substring(0, 500));
            reject(new Error('Gemini API returned an error page. Please check your API key and quota.'));
            return;
          }

          // Check if response is empty
          if (!responseData || responseData.trim().length === 0) {
            console.error('Gemini API returned empty response');
            reject(new Error('Gemini API returned empty response'));
            return;
          }

          try {
            const parsed = JSON.parse(responseData);

            if (parsed.error) {
              console.error('Gemini API error:', parsed.error);
              reject(new Error(parsed.error.message || 'Unknown Gemini API error'));
              return;
            }

            if (parsed.candidates && parsed.candidates[0]?.content?.parts?.[0]?.text) {
              resolve(parsed.candidates[0].content.parts[0].text);
            } else {
              console.error('Unexpected response format:', JSON.stringify(parsed).substring(0, 200));
              reject(new Error('Unexpected response format from Gemini API'));
            }
          } catch (error) {
            console.error('Failed to parse Gemini response as JSON');
            console.error('Response starts with:', responseData.substring(0, 200));
            console.error('Parse error:', error.message);
            reject(new Error(`Failed to parse Gemini API response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Network error calling Gemini API:', error.message);
        reject(new Error(`Network error: ${error.message}`));
      });

      // Add timeout to prevent hanging requests (30 seconds)
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Gemini API request timeout after 30 seconds'));
      });

      req.write(data);
      req.end();
    });
  }
}

module.exports = GeminiService;
