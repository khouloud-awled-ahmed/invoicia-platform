import { Injectable, BadRequestException } from '@nestjs/common';
import { AbsenceRiskService, RiskScore } from './absence-risk.service';

export interface AiReport {
  generatedAt: Date;
  summary: string;
  attention: string;
  recommendations: string[];
  highRiskCount: number;
  riskScores: RiskScore[];
}

@Injectable()
export class AiReportService {
  constructor(private readonly riskService: AbsenceRiskService) {}

  async generateMonthlyReport(tenantId: string): Promise<AiReport> {
    const riskScores = await this.riskService.computeAllRiskScores(tenantId);
    const highRisk = riskScores.filter((s) => s.riskLevel === 'high');
    const mediumRisk = riskScores.filter((s) => s.riskLevel === 'medium');

    const dataSnapshot = {
      totalEmployees: riskScores.length,
      highRisk: highRisk.map((s) => ({
        name: s.employeeName,
        score: s.riskScore,
        recentAbsences: s.absenceCountLast90Days,
      })),
      mediumRisk: mediumRisk.map((s) => ({
        name: s.employeeName,
        score: s.riskScore,
      })),
    };

    if (!process.env.GROQ_API_KEY) {
      throw new BadRequestException('GROQ_API_KEY manquant');
    }

    const prompt = `Tu es un assistant RH. Voici les données de risque d'absentéisme pour l'entreprise ce mois-ci (JSON) :

${JSON.stringify(dataSnapshot, null, 2)}

Réponds UNIQUEMENT avec un objet JSON valide (rien avant, rien après, pas de markdown, pas de balises \`\`\`), avec exactement cette structure :
{
  "summary": "1-2 phrases résumant la situation globale, en français",
  "attention": "1 phrase sur les points de vigilance, ou une phrase rassurante s'il n'y en a pas",
  "recommendations": ["recommandation courte 1", "recommandation courte 2", "recommandation courte 3 (optionnelle)"]
}

Sois direct, professionnel, sans blabla. Chaque champ doit être court.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new BadRequestException(`Erreur API Groq (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) throw new BadRequestException('Reponse Groq vide');

    let parsed: { summary: string; attention: string; recommendations: string[] };
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        summary: raw.slice(0, 200),
        attention: '',
        recommendations: [],
      };
    }

    return {
      generatedAt: new Date(),
      summary: parsed.summary || '',
      attention: parsed.attention || '',
      recommendations: parsed.recommendations || [],
      highRiskCount: highRisk.length,
      riskScores,
    };
  }
}
