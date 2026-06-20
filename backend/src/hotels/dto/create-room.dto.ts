import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: '房型名称', example: '大床房' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '价格', example: 399.00 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ description: '可住人数', example: 2 })
  @IsNumber()
  @Min(1)
  capacity!: number;

  @ApiProperty({ description: '房间数量', example: 10 })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({ description: '房型描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}