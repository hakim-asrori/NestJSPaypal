import { Injectable } from '@nestjs/common';
import { eventEmitterService } from '../services/event-emitter.service';
import { PaypalService } from 'src/paypal/paypal.service';


@Injectable()
export class CaptureListener {
    constructor(private readonly paypalService: PaypalService) {
        this.initialize();
    }

    initialize() {
        eventEmitterService.on('triggerCapture', async (data) => {
            // Call the capture method directly with the required data
            await this.paypalService.capture(data);
        });
    }
}