import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class PaymentIntentDto {
  @IsString()
  appointmentId: string;

  @IsNumber()
  amount: number;
}

export class TransferPaymentDto {
  @IsString()
  appointmentId: string;

  @IsNumber()
  amount: number;

  @IsString()
  receiptUrl: string;
}

export class ConfirmManualPaymentDto {
  @IsString()
  appointmentId: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsIn(['CASH', 'TRANSFER'])
  method: 'CASH' | 'TRANSFER';

  @IsOptional()
  @IsNumber()
  amount?: number;
}
