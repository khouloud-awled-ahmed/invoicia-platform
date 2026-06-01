import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    // Vérifier la connexion MongoDB au démarrage
    try {
      if (this.connection.readyState === 1) {
        console.log('✅ MongoDB connection verified');
      } else {
        console.warn('⚠️ MongoDB connection state: ' + this.getConnectionState(this.connection.readyState));
      }
    } catch (error) {
      console.error('❌ Error verifying MongoDB connection:', error.message);
    }
  }

  private getConnectionState(state: number): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized',
    };
    return states[state] || 'unknown';
  }

  getHello(): string {
    return 'Invoicia API - Backend Service';
  }

  getHealth() {
    const dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'Invoicia API',
      database: {
        status: dbStatus,
        type: 'MongoDB',
      },
    };
  }
}

