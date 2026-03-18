export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, contact, goal, niche, audience, leads, budget, deadline } = req.body || {};

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) return res.status(500).json({ error: 'Bot not configured' });

  const text = [
    `📋 <b>Новый бриф!</b>`,
    ``,
    `👤 <b>Имя:</b> ${name || '—'}`,
    `📱 <b>Контакт:</b> ${contact || '—'}`,
    ``,
    `🎯 <b>Задача:</b> ${goal || '—'}`,
    `🏢 <b>Ниша:</b> ${niche || 'не указана'}`,
    `👥 <b>Аудитория:</b> ${audience || 'не указана'}`,
    `📨 <b>Куда заявки:</b> ${leads || '—'}`,
    `💰 <b>Бюджет:</b> ${budget || '—'}`,
    `⏱ <b>Дедлайн:</b> ${deadline || '—'}`,
  ].join('\n');

  const sheetsUrl = process.env.SHEETS_URL;

  try {
    const [tgRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      }),
      sheetsUrl ? fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, goal, niche, audience, leads, budget, deadline }),
      }) : Promise.resolve(null),
    ]);

    const tgData = await tgRes.json();
    if (!tgData.ok) return res.status(502).json({ error: tgData.description });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
