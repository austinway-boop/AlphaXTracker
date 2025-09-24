import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { goalText, goalType, overridePassword } = req.body;

  if (!goalText || !goalType) {
    return res.status(400).json({
      success: false,
      message: 'Goal text and goal type are required'
    });
  }

  // If override password is provided, check it
  if (overridePassword) {
    if (overridePassword === 'ambitious') {
      return res.status(200).json({
        success: true,
        validated: true,
        overridden: true,
        message: 'Goal accepted with override',
        feedback: 'You have chosen to override the AI validation. Make sure your goal is truly ambitious and achievable!'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid override password'
      });
    }
  }

  try {
    // Define validation criteria based on goal type
    const timeframe = goalType === 'dailyGoal' ? '3 hours' : '8 weeks';
    const goalTypeDisplay = goalType === 'dailyGoal' ? 'daily' : 'session';

    const prompt = `You are an AI coach helping students set ambitious yet achievable goals. Please evaluate this ${goalTypeDisplay} goal:

"${goalText}"

This is a ${goalTypeDisplay} goal that should be achievable within ${timeframe}.

Please evaluate based on these criteria:
1. **Measurable**: Can progress be clearly tracked? (e.g., "complete 3 features" vs "work on app")
2. **Specific**: Is it clear what exactly needs to be done? (avoid vague terms like "work on", "improve", "learn about")  
3. **Achievable**: Can this realistically be completed in ${timeframe}?
4. **Ambitious**: Is this challenging enough? (No trivial tasks like "send 1 email" or "read 1 page")

Respond with a JSON object containing:
- "isValid": boolean (true if goal meets all criteria)
- "score": number 1-10 (overall goal quality score)
- "feedback": string (specific constructive feedback)
- "suggestions": array of strings (2-3 specific improvement suggestions if not valid)

Examples of GOOD goals:
- Daily: "Complete user authentication system with login/signup forms and password validation"
- Session: "Build and launch MVP with 3 core features and acquire first 100 users"

Examples of BAD goals:
- Daily: "Work on my app" (not specific or measurable)
- Daily: "Send 1 email" (not ambitious)
- Session: "Learn programming" (too vague)`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse the response
    let validationResult;
    try {
      validationResult = JSON.parse(message.content[0].text);
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Error processing AI validation response'
      });
    }

    return res.status(200).json({
      success: true,
      validated: validationResult.isValid,
      score: validationResult.score,
      feedback: validationResult.feedback,
      suggestions: validationResult.suggestions || [],
      goalType: goalTypeDisplay,
      timeframe: timeframe
    });

  } catch (error) {
    console.error('Error validating goal with Claude:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate goal with AI',
      error: error.message
    });
  }
}
