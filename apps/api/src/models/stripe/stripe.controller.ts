import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import StripeService from './stripe.service'
import { BookingsService } from '../bookings/graphql/bookings.service'
import { CreateStripeDto } from './dto/create-stripe-session.dto'
import { CreateBookingInput } from '../bookings/graphql/dtos/create-booking.input'
import { Response } from 'express'

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly bookingService: BookingsService,
  ) {}

  @Get()
  helloStripe() {
    return 'Hello Stripe'
  }

  @Post()
  async create(@Body() createStripeDto: CreateStripeDto) {
    const isStripeConfigured =
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes('your_stripe') &&
      process.env.STRIPE_SECRET_KEY.startsWith('sk_')

    if (!isStripeConfigured) {
      const newBooking = await this.bookingService.create(
        createStripeDto.bookingData,
      )
      return {
        sessionId: 'dev_mock_session',
        url:
          process.env.BOOKINGS_REDIRECT_URL || 'http://localhost:3001/bookings',
        booking: newBooking,
      }
    }

    return this.stripeService.createStripeSession(createStripeDto)
  }

  @Get('success')
  async handleStripeSuccess(
    @Query('session_id') sessionId: string,
    @Res() res: Response,
  ) {
    if (!sessionId) {
      throw new BadRequestException('Session id missing.')
    }

    const session = await this.stripeService.stripe.checkout.sessions.retrieve(
      sessionId,
    )

    const { uid, bookingData } = session.metadata

    const bookingInput: CreateBookingInput = JSON.parse(bookingData)
    const newBooking = await this.bookingService.create(bookingInput)
    res.redirect(process.env.BOOKINGS_REDIRECT_URL)
  }
}
