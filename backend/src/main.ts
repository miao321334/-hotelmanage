import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions, } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

const options: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));


  const config = new DocumentBuilder()
    .setTitle('易宿酒店预订平台后端API')
    .setDescription('易宿酒店预订平台后端系统API文档，包含认证、酒店管理、标签管理、预订管理和入住人员管理等功能模块')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('认证', '用户注册、登录和获取个人信息')
    .addTag('酒店', '酒店的创建、查询、更新和删除')
    .addTag('标签', '标签的管理和酒店标签关联')
    .addTag('预订', '预订管理相关操作')
    .addTag('入住人员', '入住人员信息管理')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, documentFactory);

  // 添加全局验证管道
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
}
bootstrap();
