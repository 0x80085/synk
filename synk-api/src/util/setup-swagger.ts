import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';

// eslint-disable-next-line unused-imports/no-unused-vars
export function setupSwagger(app: NestExpressApplication, port: number) {
  const options = new DocumentBuilder()
    .setTitle('Synk API')
    .setDescription(`Synked videos and chatting`)
    .setVersion(process.env.npm_package_version)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);
}
