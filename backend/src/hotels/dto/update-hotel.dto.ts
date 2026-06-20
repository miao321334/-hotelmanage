import { IsString, IsNotEmpty, IsNumber, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionDto } from './promotion.dto';
import { CreateRoomDto } from './create-room.dto';
import { CreateNearbyAttractionDto } from './create-nearby-attraction.dto';
import { CreateFacilityDto } from './create-facility.dto';
import { IsArray } from 'class-validator';

export class UpdateHotelDto {
  @ApiProperty({
    description: '酒店中文名',
    example: '易宿酒店',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  nameZh!: string;

  @ApiProperty({
    description: '酒店英文名',
    example: 'Easy Stay Hotel',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @ApiProperty({
    description: '酒店地址',
    example: '北京市朝阳区',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    description: '酒店星级',
    example: 4,
    required: true,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  starRating!: number;

  @ApiProperty({
    description: '酒店开业时间',
    example: '2023-01-01',
    required: true,
    type: Date,
  })
  @IsString()
  @IsNotEmpty()
  openingDate!: string;

  @ApiProperty({
    description: '酒店描述',
    example: '舒适的商务酒店',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [CreateRoomDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomDto)
  rooms?: CreateRoomDto[];

  @ApiProperty({ type: [PromotionDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PromotionDto)
  promotions?: PromotionDto[];

  @ApiProperty({ type: [CreateNearbyAttractionDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateNearbyAttractionDto)
  nearbyAttractions?: CreateNearbyAttractionDto[];

  @ApiProperty({ type: [CreateFacilityDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFacilityDto)
  facilities?: CreateFacilityDto[];

  @ApiProperty({ description: '标签ID数组', example: ['uuid1', 'uuid2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({ 
    description: '酒店地理位置', 
    example: { longitude: 116.404, latitude: 39.915 }, 
    required: false 
  })
  @IsOptional()
  location?: {
    longitude: number;
    latitude: number;
  };
}
