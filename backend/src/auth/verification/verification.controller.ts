import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('auth/verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getSettings() {
    return this.verificationService.getVerificationSettings();
  }

  @Post('send-email-otp')
  @UseGuards(JwtAuthGuard)
  async sendEmailOTP(@CurrentUser() user: any) {
    await this.verificationService.sendEmailOTP(user.email);
    return { message: 'Code OTP envoyé par email' };
  }

  @Post('send-sms-otp')
  @UseGuards(JwtAuthGuard)
  async sendSMSOTP(@Body() body: { phone: string }, @CurrentUser() user: any) {
    if (!body.phone) {
      throw new Error('Numéro de téléphone requis');
    }
    await this.verificationService.sendSMSOTP(body.phone);
    return { message: 'Code OTP envoyé par SMS' };
  }

  @Post('validate-email-otp')
  @UseGuards(JwtAuthGuard)
  async validateEmailOTP(@Body() body: { code: string }, @CurrentUser() user: any) {
    await this.verificationService.validateEmailOTP(user.email, body.code);
    return { message: 'Email vérifié avec succès' };
  }

  @Post('validate-sms-otp')
  @UseGuards(JwtAuthGuard)
  async validateSMSOTP(@Body() body: { phone: string; code: string }, @CurrentUser() user: any) {
    await this.verificationService.validateSMSOTP(body.phone, body.code);
    return { message: 'Téléphone vérifié avec succès' };
  }
}
