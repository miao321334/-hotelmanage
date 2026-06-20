import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttractionType } from '@prisma/client';

export class CreateNearbyAttractionDto {
  @ApiProperty({ description: '景点名称', example: '天安门广场' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '景点类型', enum: AttractionType, example: 'attraction' })
  @IsEnum(AttractionType)
  type!: AttractionType;

  @ApiProperty({ description: '距离（可选）', example: '1.5km', required: false })
  @IsOptional()
  @IsString()
  distance?: string;
}