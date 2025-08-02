// netlify/functions/openai.js - Netlify Function with Environment Variable
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error: API key not configured' 
        }),
      };
    }

    // Parse request body
    const { messages, model = "gpt-4o-mini" } = JSON.parse(event.body);

    // Validate required fields
    if (!messages) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required field: messages' 
        }),
      };
    }

    console.log('Calling OpenAI API with environment variable...');

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    const responseData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error('OpenAI API Error:', responseData);
      
      return {
        statusCode: openaiResponse.status,
        headers,
        body: JSON.stringify({
          error: responseData.error?.message || 'OpenAI API error',
          status: openaiResponse.status
        }),
      };
    }

    // Return successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
