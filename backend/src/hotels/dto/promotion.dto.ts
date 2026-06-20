import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';


export class PromotionDto {
  @ApiProperty({ description: '促销名称' })
  @IsString()
  name!: string;

  @ApiProperty({ description: '促销描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '折扣类型', enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ description: '折扣值' })
  @IsNumber()
  discountValue!: number;

  @ApiProperty({ description: '开始日期' })
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty({ description: '结束日期' })
  @IsDate()
  @Type(() => Date)
  endDate!: Date;
}