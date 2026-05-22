import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          error: 'VALIDATION_ERROR',
          message: errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join(' '),
        }),
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
