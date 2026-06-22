import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InternalGuard } from '@app/common';
import { CatalogService } from './catalog.service';
import { CreateEntityDto, UpdateEntityDto, UpdatePageDto } from './catalog.dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('entities')
  listEntities(@Query('all') all?: string) {
    return this.catalog.listEntities(all !== 'true');
  }

  @Get('entities/:id')
  getEntity(@Param('id') id: string) {
    return this.catalog.getEntity(id);
  }

  @Get('entities/slug/:slug')
  getEntityBySlug(@Param('slug') slug: string) {
    return this.catalog.getEntityBySlug(slug);
  }

  @UseGuards(InternalGuard)
  @Post('entities')
  createEntity(@Body() dto: CreateEntityDto) {
    return this.catalog.createEntity(dto);
  }

  @UseGuards(InternalGuard)
  @Put('entities/:id')
  updateEntity(@Param('id') id: string, @Body() dto: UpdateEntityDto) {
    return this.catalog.updateEntity(id, dto);
  }

  @UseGuards(InternalGuard)
  @Delete('entities/:id')
  deleteEntity(@Param('id') id: string) {
    return this.catalog.deleteEntity(id);
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.catalog.getPage(slug);
  }

  @UseGuards(InternalGuard)
  @Put('pages/:slug')
  updatePage(@Param('slug') slug: string, @Body() dto: UpdatePageDto) {
    return this.catalog.updatePage(slug, dto.title, dto.body);
  }
}
