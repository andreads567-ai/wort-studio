/**
 * Função serverless da Vercel: todas as rotas /api/* são reescritas para cá (ver vercel.json)
 * e atendidas pelo mesmo app Express usado no servidor local.
 */
import { createApp } from '../server/app.js';

const app = createApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}
