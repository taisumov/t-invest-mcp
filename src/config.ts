import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  TINKOFF_TOKEN: z.string().min(1, 'TINKOFF_TOKEN не задан — добавь его в .env'),
  PORT: z.coerce.number().int().positive().default(3000),
});

const parsed = ConfigSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Ошибка конфигурации:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof ConfigSchema>;
