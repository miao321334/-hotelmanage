import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, Hotel, HotelStatus, Prisma } from '@prisma/client';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { CreateNearbyAttractionDto } from './dto/create-nearby-attraction.dto';
@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaClient) { }

  async createHotel(createHotelDto: CreateHotelDto, merchantId: string) {
    // 创建酒店，状态默认为pending
    const { promotions, rooms, nearbyAttractions, facilities, tagIds, location, ...hotelData } = createHotelDto;
    const roomsData = rooms?.map(room => ({
      name: room.name,
      price: new Prisma.Decimal(room.price),
      capacity: room.capacity,
      quantity: room.quantity,
      description: room.description,
    })) || [];

    const promotionsData = promotions?.map(promo => ({
      name: promo.name,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: new Prisma.Decimal(promo.discountValue),
      startDate: new Date(promo.startDate),
      endDate: new Date(promo.endDate),
    })) || [];

    const openingDate = new Date(createHotelDto.openingDate);

    const nearbyAttractionsData = nearbyAttractions?.map(attr => ({
      name: attr.name,
      type: attr.type,
      distance: attr.distance,
    })) || [];

    const facilitiesData = facilities?.map(facility => ({
      name: facility.name,
      description: facility.description,
    })) || [];

    // 处理地理位置数据
    /*let locationData = undefined;
    if (location) {
      // 使用PostGIS的ST_MakePoint函数创建点
      locationData = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
    }*/

    return this.prisma.hotel.create({
      data: {
        nameZh: createHotelDto.nameZh,
        nameEn: createHotelDto.nameEn,
        address: createHotelDto.address,
        starRating: createHotelDto.starRating,
        openingDate,
        description: createHotelDto.description,
        status: HotelStatus.pending,
        merchantId,
        //location: locationData,
        promotions: promotionsData ? { create: promotionsData } : undefined,
        rooms: roomsData ? { create: roomsData } : undefined,
        nearbyAttractions: nearbyAttractionsData ? { create: nearbyAttractionsData } : undefined,
        facilities: facilitiesData ? { create: facilitiesData } : undefined,
        tags: tagIds ? {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        } : undefined,
      },
      include: {
        rooms: true,
        promotions: true,
        nearbyAttractions: true,
        facilities: true,
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async getHotelsByMerchant(merchantId: string): Promise<any[]> {
    // 获取商户的酒店列表
    const hotels = await this.prisma.hotel.findMany({
      where: { merchantId },
      include: {
        rooms: true,
        images: true,
        facilities: true,
        promotions: true,
        nearbyAttractions: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // 为每个酒店添加经纬度信息
    /*for (const hotel of hotels) {
      const locationData = await this.prisma.$queryRaw`
        SELECT ST_Y(location) as latitude, ST_X(location) as longitude
        FROM hotels
        WHERE id = ${hotel.id}
      `;

      if (locationData && locationData[0]) {
        hotel.latitude = locationData[0].latitude;
        hotel.longitude = locationData[0].longitude;
      }
    }*/

    return hotels;
  }

  async getHotelById(hotelId: string): Promise<any> {
    // 获取酒店详情
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        rooms: true,
        images: true,
        facilities: true,
        promotions: true,
        nearbyAttractions: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // 获取经纬度信息
    /*const locationData = await this.prisma.$queryRaw`
      SELECT ST_Y(location) as latitude, ST_X(location) as longitude
      FROM hotels
      WHERE id = ${hotelId}
    `;

    if (locationData && locationData[0]) {
      hotel.latitude = locationData[0].latitude;
      hotel.longitude = locationData[0].longitude;
    }*/

    return hotel;
  }

  async updateHotel(hotelId: string, updateHotelDto: UpdateHotelDto, merchantId: string) {
    // 检查酒店是否存在
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // 检查是否是酒店的商户
    if (hotel.merchantId !== merchantId) {
      throw new ForbiddenException('You are not authorized to update this hotel');
    }

    const { promotions, rooms, nearbyAttractions, facilities, tagIds, location, ...data } = updateHotelDto;

    const roomsData = rooms?.map(room => ({
      name: room.name,
      price: new Prisma.Decimal(room.price),
      capacity: room.capacity,
      quantity: room.quantity,
      description: room.description,
    }));

    const promotionsData = promotions?.map(promo => ({
      name: promo.name,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: new Prisma.Decimal(promo.discountValue),
      startDate: new Date(promo.startDate),
      endDate: new Date(promo.endDate),
    }));

    const openingDate = updateHotelDto.openingDate ? new Date(updateHotelDto.openingDate) : undefined;

    const nearbyAttractionsData = nearbyAttractions?.map(attr => ({
      name: attr.name,
      type: attr.type,
      distance: attr.distance,
    }));

    const facilitiesData = facilities?.map(facility => ({
      name: facility.name,
      description: facility.description,
    }));

    // 处理地理位置数据
    /*let locationData = undefined;
    if (location) {
      // 使用PostGIS的ST_MakePoint函数创建点
      locationData = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
    }*/

    // 更新酒店信息
    return this.prisma.$transaction(async (tx) => {
      if (promotions) {
        await tx.hotelPromotion.deleteMany({ where: { hotelId } });
      }
      if (rooms) {
        await tx.hotelRoom.deleteMany({ where: { hotelId } });
      }
      if (nearbyAttractions) await tx.hotelNearbyAttraction.deleteMany({ where: { hotelId } });
      if (facilities) await tx.hotelFacility.deleteMany({ where: { hotelId } });
      if (tagIds) await tx.hotelTagRelation.deleteMany({ where: { hotelId } });
      return tx.hotel.update({
        where: { id: hotelId },
        data: {
          nameZh: updateHotelDto.nameZh,
          nameEn: updateHotelDto.nameEn,
          address: updateHotelDto.address,
          starRating: updateHotelDto.starRating,
          openingDate,
          description: updateHotelDto.description,
          status: HotelStatus.pending,
          //location: locationData,
          promotions: promotionsData ? { create: promotionsData } : undefined,
          rooms: roomsData ? { create: roomsData } : undefined,
          nearbyAttractions: nearbyAttractionsData ? { create: nearbyAttractionsData } : undefined,
          facilities: facilitiesData ? { create: facilitiesData } : undefined,
          tags: tagIds ? {
            create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } }))
          } : undefined,
        },
        include: {
          rooms: true,
          images: true,
          facilities: true,
          promotions: true,
          nearbyAttractions: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });
  }

  async deleteHotel(hotelId: string, merchantId: string): Promise<void> {
    // 检查酒店是否存在
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // 检查是否是酒店的商户
    if (hotel.merchantId !== merchantId) {
      throw new ForbiddenException('You are not authorized to delete this hotel');
    }

    // 删除酒店
    return this.prisma.$transaction(async (tx) => {
      // 1. 删除关联的房型
      await tx.hotelRoom.deleteMany({ where: { hotelId } });
      // 2. 删除关联的促销
      await tx.hotelPromotion.deleteMany({ where: { hotelId } });
      // 3. 删除关联的图片
      await tx.hotelImage.deleteMany({ where: { hotelId } });
      // 4. 删除关联的附近景点
      await tx.hotelNearbyAttraction.deleteMany({ where: { hotelId } });
      // 5. 删除关联的设施
      await tx.hotelFacility.deleteMany({ where: { hotelId } });
      // 6. 删除关联的标签
      await tx.hotelTagRelation.deleteMany({ where: { hotelId } });
      // 7. 最后删除酒店主记录
      await tx.hotel.delete({ where: { id: hotelId } });
    });
  }

  async getHotelsForVerification(): Promise<Hotel[]> {
    // 获取待审核的酒店列表
    return this.prisma.hotel.findMany({
      where: { status: HotelStatus.pending },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async approveHotel(hotelId: string): Promise<Hotel> {
    // 检查酒店是否存在
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // 审核通过酒店
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: { status: HotelStatus.approved },
    });
  }

  async rejectHotel(hotelId: string, rejectionReason: string): Promise<Hotel> {
    // 检查酒店是否存在
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // 拒绝酒店
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        status: HotelStatus.rejected,
        rejectionReason,
      },
    });
  }

  async offlineHotel(hotelId: string): Promise<Hotel> {
    // 检查酒店是否存在
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // 下线酒店
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: { status: HotelStatus.offline },
    });
  }

  async onlineHotel(hotelId: string): Promise<Hotel> {
    // 检查酒店是否存在
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // 上线酒店
    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: { status: HotelStatus.approved },
    });
  }

  //追加
  async getAllHotelsForAdmin(query?: any): Promise<{ hotels: any[]; total: number; page: number; limit: number }> {
    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }
    if (query?.merchantId) {
      where.merchantId = query.merchantId;
    }
    // 可按名称关键词搜索
    if (query?.keyword) {
      where.OR = [
        { nameZh: { contains: query.keyword } },
        { nameEn: { contains: query.keyword } },
      ];
    }

    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const hotels = await this.prisma.hotel.findMany({
      where,
      include: {
        merchant: { select: { id: true, name: true, email: true } },
        rooms: { select: { price: true } },
        images: true,
        facilities: true,
        promotions: true,
        nearbyAttractions: true,
        tags: { include: { tag: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // 为每个酒店添加经纬度信息
    /*for (const hotel of hotels) {
      const locationData = await this.prisma.$queryRaw`
        SELECT ST_Y(location) as latitude, ST_X(location) as longitude
        FROM hotels
        WHERE id = ${hotel.id}
      `;

      if (locationData && locationData[0]) {
        hotel.latitude = locationData[0].latitude;
        hotel.longitude = locationData[0].longitude;
      }
    }*/

    const total = await this.prisma.hotel.count({ where });

    return {
      hotels,
      total,
      page,
      limit,
    };
  }

  async addHotelImage(hotelId: string, data: { url: string; description?: string; isMain?: boolean }) {
    // 如果设置为主图，先将该酒店的其他图片设为非主图
    if (data.isMain) {
      await this.prisma.hotelImage.updateMany({
        where: { hotelId, isMain: true },
        data: { isMain: false },
      });
    }

    return this.prisma.hotelImage.create({
      data: {
        hotelId,
        url: data.url,
        description: data.description,
        isMain: data.isMain || false,
      },
    });
  }

  async updateHotelImage(
    hotelId: string,
    imageId: string,
    data: { description?: string; isMain?: boolean },
    userId: string,
  ) {
    // 检查酒店权限
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (hotel.merchantId !== userId) throw new ForbiddenException('Not authorized');

    // 如果设置为 true，先将该酒店其他图片设为非主图
    if (data.isMain === true) {
      await this.prisma.hotelImage.updateMany({
        where: { hotelId, isMain: true },
        data: { isMain: false },
      });
    }

    return this.prisma.hotelImage.update({
      where: { id: imageId },
      data: {
        description: data.description,
        isMain: data.isMain,
      },
    });
  }

  async deleteHotelImage(hotelId: string, imageId: string, userId: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (hotel.merchantId !== userId) throw new ForbiddenException('Not authorized');

    // 如果要删除的是主图，可以将另一张图设为主图
    return this.prisma.hotelImage.delete({
      where: { id: imageId },
    });
  }

}