import { UseInterceptors, UploadedFile, Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('酒店')
@Controller('api/hotels')
export class HotelsController {
  constructor(private hotelsService: HotelsService) { }

  @ApiOperation({
    summary: '创建酒店',
    description: '创建新酒店并返回酒店信息，状态默认为pending',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateHotelDto, description: '酒店信息' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      example: {
        id: 'uuid',
        nameZh: '易宿酒店',
        nameEn: 'Easy Stay Hotel',
        address: '北京市朝阳区',
        starRating: 4,
        openingDate: '2023-01-01T00:00:00Z',
        description: '舒适的商务酒店',
        status: 'pending',
        merchantId: 'uuid',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @Post()
  @UseGuards(AuthGuard)
  async createHotel(@Body() createHotelDto: CreateHotelDto, @Request() req) {
    return this.hotelsService.createHotel(createHotelDto, req.user.id);
  }

  @ApiOperation({
    summary: '获取商户的酒店列表',
    description: '根据当前登录用户获取其管理的酒店列表',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'array',
      example: [
        {
          id: 'uuid',
          nameZh: '易宿酒店',
          nameEn: 'Easy Stay Hotel',
          address: '北京市朝阳区',
          starRating: 4,
          status: 'approved',
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @Get('merchant')
  @UseGuards(AuthGuard)
  async getHotelsByMerchant(@Request() req) {
    return this.hotelsService.getHotelsByMerchant(req.user.id);
  }

  @ApiOperation({
    summary: '获取酒店详情',
    description: '根据酒店ID获取酒店详细信息',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '酒店ID', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        id: 'uuid',
        nameZh: '易宿酒店',
        nameEn: 'Easy Stay Hotel',
        address: '北京市朝阳区',
        starRating: 4,
        openingDate: '2023-01-01T00:00:00Z',
        description: '舒适的商务酒店',
        status: 'approved',
        merchantId: 'uuid',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '酒店不存在' })
  @Get(':id')
  @UseGuards(AuthGuard)
  async getHotelById(@Param('id') hotelId: string) {
    return this.hotelsService.getHotelById(hotelId);
  }

  @ApiOperation({
    summary: '更新酒店信息',
    description: '根据酒店ID更新酒店信息',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '酒店ID', example: 'uuid' })
  @ApiBody({ type: UpdateHotelDto, description: '酒店更新信息' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      example: {
        id: 'uuid',
        nameZh: '易宿酒店',
        nameEn: 'Easy Stay Hotel',
        address: '北京市朝阳区',
        starRating: 4,
        openingDate: '2023-01-01T00:00:00Z',
        description: '舒适的商务酒店',
        status: 'pending',
        merchantId: 'uuid',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '酒店不存在' })
  @Put(':id')
  @UseGuards(AuthGuard)
  async updateHotel(@Param('id') hotelId: string, @Body() updateHotelDto: UpdateHotelDto, @Request() req) {
    return this.hotelsService.updateHotel(hotelId, updateHotelDto, req.user.id);
  }

  @ApiOperation({
    summary: '删除酒店',
    description: '根据酒店ID删除酒店',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '酒店ID', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      example: {
        success: true,
        message: '酒店删除成功',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '酒店不存在' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteHotel(@Param('id') hotelId: string, @Request() req) {
    return this.hotelsService.deleteHotel(hotelId, req.user.id);
  }

  // 追加
  @ApiOperation({ summary: '上传酒店图片' })
  @ApiBearerAuth()
  @Post(':id/images')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/hotels',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadHotelImage(
    @Param('id') hotelId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
    @Body('isMain') isMain?: string,
  ) {
    const imageUrl = `/uploads/hotels/${file.filename}`;
    return this.hotelsService.addHotelImage(hotelId, {
      url: imageUrl,
      description,
      isMain: isMain === 'true',
    });
  }

  @ApiOperation({ summary: '更新图片信息' })
  @ApiBearerAuth()
  @Put(':hotelId/images/:imageId')
  @UseGuards(AuthGuard)
  async updateHotelImage(
    @Param('hotelId') hotelId: string,
    @Param('imageId') imageId: string,
    @Body() body: { description?: string; isMain?: boolean },
    @Request() req,
  ) {
    return this.hotelsService.updateHotelImage(hotelId, imageId, body, req.user.id);
  }

  @Delete(':hotelId/images/:imageId')
  @UseGuards(AuthGuard)
  async deleteHotelImage(
    @Param('hotelId') hotelId: string,
    @Param('imageId') imageId: string,
    @Request() req,
  ) {
    return this.hotelsService.deleteHotelImage(hotelId, imageId, req.user.id);
  }
}

@ApiTags('酒店管理（管理员）')
@Controller('api/admin/hotels')
@UseGuards(AuthGuard)
export class AdminHotelsController {
  constructor(private hotelsService: HotelsService) { }

  @ApiOperation({ summary: '获取待审核酒店列表' })
  @ApiResponse({ status: 200, description: '成功' })
  @Get('pending')
  async getPendingHotels(@Request() req) {
    return this.hotelsService.getHotelsForVerification();
  }

  @ApiOperation({ summary: '审核通过酒店' })
  @Post(':id/approve')
  async approveHotel(@Param('id') hotelId: string, @Request() req) {
    return this.hotelsService.approveHotel(hotelId);
  }

  @ApiOperation({ summary: '拒绝酒店' })
  @Post(':id/reject')
  async rejectHotel(
    @Param('id') hotelId: string,
    @Body('reason') reason: string,
    @Request() req
  ) {
    return this.hotelsService.rejectHotel(hotelId, reason);
  }

  @ApiOperation({ summary: '下线酒店' })
  @Post(':id/offline')
  async offlineHotel(@Param('id') hotelId: string, @Request() req) {
    return this.hotelsService.offlineHotel(hotelId);
  }

  @ApiOperation({ summary: '上线酒店' })
  @Post(':id/online')
  async onlineHotel(@Param('id') hotelId: string, @Request() req) {
    return this.hotelsService.onlineHotel(hotelId);
  }

  @Get()
  async getAllHotels(@Request() req, @Query() query?: any) {
    return this.hotelsService.getAllHotelsForAdmin(query);
  }

}