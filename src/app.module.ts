import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PaymentModule } from './payment/payment.module';
import { XenditModule } from './xendit/xendit.module';
import { AppGateway } from './service_modules/app.gateway';
import { VirtualAccountModule } from './virtualaccount/virtualaccount.module';
import { EwalletModule } from './ewallet/ewallet.module';
import { BankModule } from './bank/bank.module';
import { PaypalModule } from './paypal/paypal.module';
import { CaptureListener } from './components/listener/capture.listener';

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

    PaymentModule,
    XenditModule,
    VirtualAccountModule,
    EwalletModule,
    BankModule,
    PaypalModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway
  ],
})
export class AppModule { }
