/**
 * Integration tests for Midas API model availability
 * Run with: npm test -- api-models.test.ts
 */

import modelConfigs from '../../scripts/model-configs.json';

interface ModelConfig {
  name: string;
  deploymentName: string;
  format: 'standard' | 'openai';
  samplePayload: any;
  note?: string;
}

interface ConfigFile {
  endpoint: string;
  testQuery: {
    systemPrompt: string;
    userMessage: string;
    expectedResponse: string;
  };
  models: {
    [key: string]: ModelConfig[];
  };
}

const config = modelConfigs as ConfigFile;
const API_KEY = process.env.REACT_APP_AZURE_API_KEY || process.env.MIDAS_API_KEY || '';

// Skip tests if no API key is provided
const describeIfApiKey = API_KEY ? describe : describe.skip;

/**
 * Helper function to test a single model
 */
async function testModelEndpoint(model: ModelConfig): Promise<{
  success: boolean;
  statusCode?: number;
  error?: string;
  responseTime: number;
}> {
  const startTime = Date.now();

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(model.samplePayload),
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      statusCode: response.status,
      error: !response.ok ? (data.error?.message || data.message || 'Unknown error') : undefined,
      responseTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime,
    };
  }
}

describeIfApiKey('Midas API Model Availability', () => {
  // Increase timeout for API calls
  jest.setTimeout(30000);

  beforeAll(() => {
    if (!API_KEY) {
      console.warn('⚠️  No API key found. Set REACT_APP_AZURE_API_KEY or MIDAS_API_KEY');
    }
  });

  describe('GPT Models', () => {
    const gptModels = config.models.gpt;

    test.each(gptModels.map(m => [m.name, m]))(
      '%s should be accessible',
      async (name, model: ModelConfig) => {
        const result = await testModelEndpoint(model);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.responseTime).toBeLessThan(15000);

        if (!result.success) {
          console.error(`❌ ${name} failed:`, result.error);
        }
      }
    );
  });

  describe('Llama Models', () => {
    const llamaModels = config.models.llama;

    test.each(llamaModels.map(m => [m.name, m]))(
      '%s should be accessible',
      async (name, model: ModelConfig) => {
        const result = await testModelEndpoint(model);

        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.responseTime).toBeLessThan(15000);

        if (!result.success) {
          console.error(`❌ ${name} failed:`, result.error);
        }
      }
    );
  });

  describe('Gemini Models', () => {
    const geminiModels = config.models.gemini;

    describe('Standard Format', () => {
      const standardModels = geminiModels.filter(m => m.format === 'standard');

      test.each(standardModels.map(m => [m.name, m]))(
        '%s should be accessible',
        async (name, model: ModelConfig) => {
          const result = await testModelEndpoint(model);

          expect(result.success).toBe(true);
          expect(result.statusCode).toBe(200);
          expect(result.responseTime).toBeLessThan(15000);

          if (!result.success) {
            console.error(`❌ ${name} failed:`, result.error);
          }
        }
      );
    });

    describe('OpenAI Format', () => {
      const openAIModels = geminiModels.filter(m => m.format === 'openai');

      test.each(openAIModels.map(m => [m.name, m]))(
        '%s should be accessible',
        async (name, model: ModelConfig) => {
          const result = await testModelEndpoint(model);

          expect(result.success).toBe(true);
          expect(result.statusCode).toBe(200);
          expect(result.responseTime).toBeLessThan(15000);

          if (!result.success) {
            console.error(`❌ ${name} failed:`, result.error);
          }
        }
      );
    });
  });

  describe('Claude Models', () => {
    const claudeModels = config.models.claude;

    describe('Standard Format', () => {
      const standardModels = claudeModels.filter(m => m.format === 'standard');

      test.each(standardModels.map(m => [m.name, m]))(
        '%s should be accessible',
        async (name, model: ModelConfig) => {
          const result = await testModelEndpoint(model);

          expect(result.success).toBe(true);
          expect(result.statusCode).toBe(200);
          expect(result.responseTime).toBeLessThan(15000);

          if (!result.success) {
            console.error(`❌ ${name} failed:`, result.error);
          }
        }
      );
    });

    describe('OpenAI Format', () => {
      const openAIModels = claudeModels.filter(m => m.format === 'openai');

      test.each(openAIModels.map(m => [m.name, m]))(
        '%s should be accessible',
        async (name, model: ModelConfig) => {
          const result = await testModelEndpoint(model);

          expect(result.success).toBe(true);
          expect(result.statusCode).toBe(200);
          expect(result.responseTime).toBeLessThan(15000);

          if (!result.success) {
            console.error(`❌ ${name} failed:`, result.error);
          }
        }
      );
    });
  });

  describe('Payload Format Validation', () => {
    test('Standard format should have correct structure', () => {
      const standardModel = config.models.claude[0];
      const payload = standardModel.samplePayload;

      expect(payload).toHaveProperty('deploymentName');
      expect(payload).toHaveProperty('messages');
      expect(Array.isArray(payload.messages)).toBe(true);
      expect(payload.messages[0]).toHaveProperty('role');
      expect(payload.messages[0]).toHaveProperty('content');
      expect(Array.isArray(payload.messages[0].content)).toBe(true);
    });

    test('OpenAI format should have correct structure', () => {
      const openAIModel = config.models.claude[1];
      const payload = openAIModel.samplePayload;

      expect(payload).toHaveProperty('model');
      expect(payload).toHaveProperty('messages');
      expect(Array.isArray(payload.messages)).toBe(true);
      expect(payload.messages[0]).toHaveProperty('role');
      expect(payload.messages[0]).toHaveProperty('content');
      expect(typeof payload.messages[0].content).toBe('string');
    });

    test('All models should have required properties', () => {
      const allModels = Object.values(config.models).flat();

      allModels.forEach(model => {
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('deploymentName');
        expect(model).toHaveProperty('format');
        expect(model).toHaveProperty('samplePayload');
        expect(['standard', 'openai']).toContain(model.format);
      });
    });
  });

  describe('API Configuration', () => {
    test('Endpoint should be properly configured', () => {
      expect(config.endpoint).toBe('https://midas.ai.bosch.com/ss1/api/v2/llm/completions');
    });

    test('Test query configuration should exist', () => {
      expect(config.testQuery).toHaveProperty('systemPrompt');
      expect(config.testQuery).toHaveProperty('userMessage');
      expect(config.testQuery).toHaveProperty('expectedResponse');
    });
  });
});

// If no API key, show helpful message
if (!API_KEY) {
  describe('API Key Configuration', () => {
    test('should have API key configured', () => {
      console.warn(`
╔════════════════════════════════════════════════════════════════╗
║                    ⚠️  API KEY MISSING                         ║
╠════════════════════════════════════════════════════════════════╣
║  Tests are skipped because no API key was found.              ║
║                                                                ║
║  To run these tests, set one of the following:                ║
║  • REACT_APP_AZURE_API_KEY environment variable               ║
║  • MIDAS_API_KEY environment variable                         ║
║                                                                ║
║  Example:                                                      ║
║  REACT_APP_AZURE_API_KEY=your_key npm test                    ║
╚════════════════════════════════════════════════════════════════╝
      `);

      expect(API_KEY).toBeTruthy();
    });
  });
}
