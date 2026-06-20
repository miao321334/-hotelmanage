import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, Reservation, ReservationStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaClient) {}

  async getReservations(): Promise<Reservation[]> {
    // 获取所有预订列表
    return this.prisma.reservation.findMany({
      include: {
        hotel: true,
        room: true,
        guests: {
          include: {
            guest: true,
          },
        },
      },
    });
  }

  async checkIn(reservationId: string): Promise<Reservation> {
    // 检查预订是否存在
    const reservation = await this.prisma.reservation.findUnique({ where: { id: reservationId } });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // 检查预订状态
    if (reservation.status !== ReservationStatus.confirmed) {
      throw new ForbiddenException('Reservation status must be confirmed to check in');
    }

    // 更新预订状态为已入住
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.check_in },
      include: {
        hotel: true,
        room: true,
        guests: {
          include: {
            guest: true,
          },
        },
      },
    });
  }

  async checkOut(reservationId: string): Promise<Reservation> {
    // 检查预订是否存在
    const reservation = await this.prisma.reservation.findUnique({ where: { id: reservationId } });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // 检查预订状态
    if (reservation.status !== ReservationStatus.check_in) {
      throw new ForbiddenException('Reservation status must be checked in to check out');
    }

    // 更新预订状态为已退房
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.check_out },
      include: {
        hotel: true,
        room: true,
        guests: {
          include: {
            guest: true,
          },
        },
      },
    });
  }

  async cancelReservation(reservationId: string): Promise<Reservation> {
    // 检查预订是否存在
    const reservation = await this.prisma.reservation.findUnique({ where: { id: reservationId } });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // 检查预订状态
    if (reservation.status === ReservationStatus.check_out) {
      throw new ForbiddenException('Cannot cancel a checked out reservation');
    }

    // 更新预订状态为已取消
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.cancelled },
      include: {
        hotel: true,
        room: true,
        guests: {
          include: {
            guest: true,
          },
        },
      },
    });
  }
}
