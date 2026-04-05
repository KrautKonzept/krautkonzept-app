import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: `Du bist der KI-Assistent von KrautKonzept, einer spezialisierten Unternehmensberatung für Cannabis Social Clubs (CSCs) in Deutschland. 
Du kennst alle KrautKonzept-Klienten: CSC Buds Bunny, KrautKollektiv, High4Life, CITASA, HW Seeds, BayrishKraut, CSC Veradurum, NEOFY, Die Grünen Seiten.
Du hilfst Mitarbeitern bei allen Fragen rund um CSC-Gründung, Compliance & Recht, Strategie & Finanzierung.
Antworte auf Deutsch, professionell und präzise.`,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data.error?.message || 'API Fehler' }, { status: 500 });
    }

    return Response.json({ content: data.content[0].text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});