import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getSmartAnalysis(data: FinancialData) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analise os seguintes dados financeiros e forneça insights estratégicos em português:
    
    Receitas Totais: ${data.transactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.value, 0)}
    Despesas Totais: ${data.transactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.value, 0)}
    Metas de Orçamento: ${JSON.stringify(data.budgets)}
    Transações Recentes: ${JSON.stringify(data.transactions.slice(0, 10))}
    Investimentos: ${JSON.stringify(data.investments)}
    
    Por favor, identifique:
    1. Categorias com maior gasto e se estão dentro do orçamento.
    2. Tendências de aumento ou redução.
    3. Sugestões práticas de onde economizar.
    4. Alertas de descontrole financeiro se houver.
    5. Uma breve análise emocional (ex: "você está gastando muito com lazer, talvez por estresse?").
    
    Retorne a resposta em formato JSON com a seguinte estrutura:
    {
      "topCategories": [{ "category": string, "value": number, "status": "OK" | "ALERTA" }],
      "trends": string[],
      "suggestions": string[],
      "alerts": string[],
      "emotionalInsight": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro na análise inteligente:", error);
    return {
      topCategories: [],
      trends: ["Não foi possível carregar as tendências no momento."],
      suggestions: ["Tente revisar seus gastos fixos."],
      alerts: [],
      emotionalInsight: "Mantenha a calma e continue acompanhando seus gastos."
    };
  }
}

export async function suggestCategory(name: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Dada a seguinte conta fixa: "${name}"
    Sugira a categoria mais adequada entre as seguintes opções: 
    "energy", "water", "internet", "rent", "insurance", "subscription", "phone", "health", "education", "transport", "shopping", "other".
    
    Retorne apenas o ID da categoria em formato JSON:
    { "category": "id_da_categoria" }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || '{"category": "other"}');
  } catch (error) {
    console.error("Erro ao sugerir categoria:", error);
    return { category: "other" };
  }
}
