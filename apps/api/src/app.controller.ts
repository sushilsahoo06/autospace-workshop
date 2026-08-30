import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('Core & Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('health')
  @ApiOkResponse({
    description: 'System health check, uptime, and timestamp telemetry',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number', example: 120.45 },
        timestamp: { type: 'string', example: '2026-11-24T02:00:00.000Z' },
        service: { type: 'string', example: 'autospace-api' },
        version: { type: 'string', example: '0.1' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth()
  }
}

