import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';

export function setupSwagger(app: NestExpressApplication, port: number) {
  const options = new DocumentBuilder()
    .setTitle('Chink TeeVee')
    .setDescription(`Chinking the net with synk tv chat`)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}
