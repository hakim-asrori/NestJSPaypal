import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { join } from 'path';
import { PaymentModule } from './payment/payment.module';
import { XenditModule } from './xendit/xendit.module';
import { AppGateway } from './service_modules/app.gateway';

@Module({
  imports: [
    
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DATABASE_HOST"),
        port: configService.get("DATABASE_PORT"),
        username: configService.get("DATABASE_USER"),
        password: configService.get("DATABASE_PASSWORD"),
        database: configService.get("DATABASE_NAME"),
        entities: [
          join(process.cwd(), "dist/**/*.entity.js")
        ],
        synchronize: true
      }),
      inject: [ConfigService]
    }),

    UserModule,
    PaymentModule,
    XenditModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway
  ],
})
export class AppModule { }
