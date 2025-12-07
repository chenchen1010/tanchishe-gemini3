import { GoogleGenAI } from "@google/genai";

// 初始化 Gemini 客户端
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 根据游戏分数和关卡生成有趣的评论
 */
export const generateGameCommentary = async (score: number, level: number): Promise<string> => {
  try {
    const prompt = `
      玩家刚刚结束了一局贪吃蛇游戏。
      得分: ${score}。
      最终关卡: Level ${level}。
      
      请根据得分和关卡进度给出一段简短、幽默、毒舌的评价（中文）。
      - 如果死在第1关（Level 1），必须狠狠嘲讽（例如：“第1关都过不去？建议重修幼儿园”）。
      - 如果分数还可以但关卡不高，调侃一下被障碍物撞死的可能性。
      - 如果关卡很高（>3），表示赞赏，但也可以说是运气好。
      
      风格要像个恨铁不成钢的游戏解说。限制在50个字以内。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // 不需要深度思考，快速响应
      }
    });

    return response.text || "AI 正在思考如何吐槽你的操作...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 掉线了，就像你的贪吃蛇一样...";
  }
};