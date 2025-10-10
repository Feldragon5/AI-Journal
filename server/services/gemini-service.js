const https = require('https');

class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'generativelanguage.googleapis.com';
    this.model = 'gemini-2.0-flash-exp';
  }

  async generateQuestions(entryExcerpt, customInstructions = '') {
    const prompt = `${customInstructions ? customInstructions + '\n\n' : ''}Based on this journal entry excerpt, generate 2-3 thoughtful, empathetic questions to help the writer reflect deeper or add more detail. Focus on emotions, details, and thoughts. The questions should feel natural and conversational. Return ONLY a valid JSON array of question strings, nothing else.

Entry excerpt: "${entryExcerpt}"

Example format: ["How did that make you feel?", "What specific details stand out to you about that moment?"]`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.7,
        maxOutputTokens: 200
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

      // Fallback questions
      return [
        "How did that make you feel?",
        "What details stand out to you about that moment?"
      ];
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  async enhanceEntry(content, customInstructions = '') {
    const prompt = `${customInstructions ? customInstructions + '\n\n' : ''}Rewrite this journal entry to be more coherent, well-structured, and polished while maintaining the author's authentic voice, tone, emotional content, and all important details. Do not change the meaning or add information that wasn't there. Keep the same perspective (first person) and tense. Return ONLY the enhanced entry text, nothing else.

Original entry: "${content}"`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.5,
        maxOutputTokens: 2048
      });

      return response.trim();
    } catch (error) {
      console.error('Error enhancing entry:', error);
      throw error;
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
          try {
            const parsed = JSON.parse(responseData);

            if (parsed.error) {
              reject(new Error(parsed.error.message));
              return;
            }

            if (parsed.candidates && parsed.candidates[0]?.content?.parts?.[0]?.text) {
              resolve(parsed.candidates[0].content.parts[0].text);
            } else {
              reject(new Error('Unexpected response format from Gemini API'));
            }
          } catch (error) {
            reject(new Error('Failed to parse Gemini API response: ' + error.message));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }
}

module.exports = GeminiService;
