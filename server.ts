import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client on server with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: 拍照提取卡片信息 (Multimodal OCR)
app.post('/api/ocr-card', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: '请提供银行卡照片数据' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `你是一个专业的银行卡视觉识别助手。请严格识别图中的银行卡（信用卡或储蓄卡）正面信息：
1. bankName: 发卡银行名称（如 招商银行, 中国工商银行, 中国建设银行, 中国银行, 交通银行, 中信银行, 广发银行, 平安银行, 浦发银行, 兴业银行, 中国民生银行, 汇丰银行, 其他银行 等）。
2. cardName: 卡片名称/产品名称（如 经典白金卡, 工银黑金卡, 多利卡, 一卡通, 龙卡, 薪金卡, 或直接称 白金卡/金卡）。
3. cardNumber: 卡号（16-19位纯数字，去除所有空格和破折号）。
4. cardholder: 持卡人姓名（拼音如 ZHANG SAN 或中文，若卡面无印刷持卡人请留空）。
5. expiryMonth: 有效期月份（两位数字 01-12，如 08）。
6. expiryYear: 有效期年份（两位数字如 29 代表 2029年）。
7. cardType: 'credit'（信用卡/贷记卡）或 'debit'（储蓄卡/借记卡）。
8. organization: 卡组织（'UnionPay' 银联, 'Visa', 'Mastercard', 'American Express' 运通, 'JCB', 'Other'）。
9. cardTier: 卡片级别（'standard' 普卡, 'gold' 金卡, 'platinum' 白金卡, 'diamond' 钻石卡, 'black' 黑金卡）。
请直接输出标准 JSON。如果某个字段无法识别或不存在，请填空字符串或合理猜测默认值。`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bankName: { type: Type.STRING },
            cardName: { type: Type.STRING },
            cardNumber: { type: Type.STRING },
            cardholder: { type: Type.STRING },
            expiryMonth: { type: Type.STRING },
            expiryYear: { type: Type.STRING },
            cardType: { type: Type.STRING },
            organization: { type: Type.STRING },
            cardTier: { type: Type.STRING },
          },
          required: ['bankName', 'cardNumber', 'cardType'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('OCR Card error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || '卡片图片识别失败，请检查清晰度或手动核对录入' 
    });
  }
});

// Vite dev middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CardVault server running on http://localhost:${PORT}`);
  });
}

startServer();
