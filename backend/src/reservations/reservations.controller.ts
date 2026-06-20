import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('预订')
@Controller('api/reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @ApiOperation({
    summary: '获取预订列表',
    description: '获取所有预订的列表',
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
          hotelId: 'uuid',
          roomId: 'uuid',
          checkInDate: '2023-01-01T00:00:00Z',
          checkOutDate: '2023-01-02T00:00:00Z',
          guestName: '张三',
          status: 'confirmed',
          totalPrice: 500,
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @Get()
  @UseGuards(AuthGuard)
  async getReservations() {
    return this.reservationsService.getReservations();
  }

  @ApiOperation({
    summary: '办理入住',
    description: '将预订状态更新为已入住',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '预订ID', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: '办理入住成功',
    schema: {
      example: {
        id: 'uuid',
        status: 'check_in',
        message: '办理入住成功',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '预订不存在' })
  @ApiResponse({ status: 400, description: '预订状态不正确' })
  @Put(':id/check-in')
  @UseGuards(AuthGuard)
  async checkIn(@Param('id') reservationId: string) {
    return this.reservationsService.checkIn(reservationId);
  }

  @ApiOperation({
    summary: '办理退房',
    description: '将预订状态更新为已退房',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '预订ID', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: '办理退房成功',
    schema: {
      example: {
        id: 'uuid',
        status: 'check_out',
        message: '办理退房成功',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '预订不存在' })
  @ApiResponse({ status: 400, description: '预订状态不正确' })
  @Put(':id/check-out')
  @UseGuards(AuthGuard)
  async checkOut(@Param('id') reservationId: string) {
    return this.reservationsService.checkOut(reservationId);
  }

  @ApiOperation({
    summary: '取消预订',
    description: '将预订状态更新为已取消',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '预订ID', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: '取消预订成功',
    schema: {
      example: {
        id: 'uuid',
        status: 'cancelled',
        message: '取消预订成功',
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '预订不存在' })
  @ApiResponse({ status: 400, description: '预订状态不正确' })
  @Put(':id/cancel')
  @UseGuards(AuthGuard)
  async cancelReservation(@Param('id') reservationId: string) {
    return this.reservationsService.cancelReservation(reservationId);
  }
}
