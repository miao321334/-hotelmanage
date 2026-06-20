import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacilityDto {
  @ApiProperty({ description: '设施名称', example: '免费WiFi' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '设施描述（可选）', example: '全区域覆盖', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}