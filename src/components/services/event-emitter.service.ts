import { EventEmitter } from 'events';

export class EventEmitterService extends EventEmitter {}

export const eventEmitterService = new EventEmitterService();