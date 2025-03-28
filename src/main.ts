import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(json({ limit: '50mb' }));
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(
      `Application is running at: http://localhost:${process.env.PORT ?? 3000}`,
    );
  });
}
bootstrap();
