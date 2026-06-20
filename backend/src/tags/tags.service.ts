import { Injectable } from '@nestjs/common';
import { PrismaClient, HotelTag } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaClient) { }

  async getTags(): Promise<HotelTag[]> {
    return this.prisma.hotelTag.findMany({
      include: {
        hotels: true,
      },
    });
  }
}
