import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppGateway } from './service_modules/app.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateway: AppGateway
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("send-message")
  sendMessage() {
    const message = "Hello Mohammad"

    console.log("Ada");
    
    this.appGateway.sendMessageToClients(message)
    return {
      message: "Message Sent To Clients"
    }
  }
}
