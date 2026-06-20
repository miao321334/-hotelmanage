import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagsService } from './tags.service';

@ApiTags('标签')
@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) { }

  @ApiOperation({
    summary: '获取标签列表',
    description: '获取所有标签的列表',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'array',
      example: [
        {
          id: 'uuid',
          name: '亲子酒店',
          description: '适合家庭出游',
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
    },
  })
  @Get()
  async getTags() {
    return this.tagsService.getTags();
  }
}
